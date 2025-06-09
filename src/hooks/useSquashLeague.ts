import { useState, useEffect } from 'react';
import { Player, Season, Match, SeasonArchive } from '@/types/squash';
import { generateInitialPlayers, generatePlayer } from '@/utils/playerGenerator';
import { simulateMatch, developPlayer } from '@/utils/matchSimulation';
import { generateDoubleRoundRobinSchedule, generateCupMatches, generateFinalMatches, scheduleMatchesByRounds } from '@/utils/matchScheduler';

interface GameState {
  players: Player[];
  currentSeason: Season | null;
  seasons: Season[];
  seasonArchive: SeasonArchive[];
  retiredPlayers: Player[];
}

const SAVE_KEY = 'squashLeagueSave';

export const useSquashLeague = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonArchive, setSeasonArchive] = useState<SeasonArchive[]>([]);
  const [retiredPlayers, setRetiredPlayers] = useState<Player[]>([]);

  // Save game state to localStorage
  const saveGameState = (state: Partial<GameState>) => {
    try {
      const currentState: GameState = {
        players: state.players || players,
        currentSeason: state.currentSeason !== undefined ? state.currentSeason : currentSeason,
        seasons: state.seasons || seasons,
        seasonArchive: state.seasonArchive || seasonArchive,
        retiredPlayers: state.retiredPlayers || retiredPlayers
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(currentState));
      console.log('Game state saved to localStorage');
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  };

  // Load game state from localStorage
  const loadGameState = (): GameState | null => {
    try {
      const savedState = localStorage.getItem(SAVE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState) as GameState;
        console.log('Game state loaded from localStorage');
        return parsedState;
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    return null;
  };

  // Reset the entire league
  const resetLeague = () => {
    try {
      localStorage.removeItem(SAVE_KEY);
      console.log('Game state cleared from localStorage');
      
      // Reset all state to initial values
      const initialPlayers = generateInitialPlayers();
      setPlayers(initialPlayers);
      setSeasons([]);
      setSeasonArchive([]);
      setRetiredPlayers([]);
      
      // Start fresh season
      startNewSeason(initialPlayers, 1);
    } catch (error) {
      console.error('Failed to reset league:', error);
    }
  };

  useEffect(() => {
    // Try to load saved game state on app start
    const savedState = loadGameState();
    if (savedState) {
      setPlayers(savedState.players);
      setCurrentSeason(savedState.currentSeason);
      setSeasons(savedState.seasons);
      setSeasonArchive(savedState.seasonArchive);
      setRetiredPlayers(savedState.retiredPlayers);
    } else {
      // Initialize new league if no save exists
      const initialPlayers = generateInitialPlayers();
      setPlayers(initialPlayers);
      startNewSeason(initialPlayers, 1);
    }
  }, []);

  const startNewSeason = (currentPlayers: Player[], seasonNumber: number) => {
    // Initialize league
    const div1Players = currentPlayers.filter(p => p.division === 1);
    const div2Players = currentPlayers.filter(p => p.division === 2);
    
    // Generate league matches (double round-robin)
    const div1Matches = generateDoubleRoundRobinSchedule(div1Players, 1, seasonNumber);
    const div2Matches = generateDoubleRoundRobinSchedule(div2Players, 2, seasonNumber);
    
    // Generate cup matches (top 4 from previous season's Div 1)
    let cupMatches: Match[] = [];
    if (seasonNumber > 1 && seasonArchive.length > 0) {
      const lastSeason = seasonArchive[seasonArchive.length - 1];
      const topFour = lastSeason.division1FinalStandings.slice(0, 4);
      cupMatches = generateCupMatches(topFour, seasonNumber);
    } else if (seasonNumber === 1) {
      // For first season, use current top 4 by rating
      const topFour = div1Players.sort((a, b) => b.rating - a.rating).slice(0, 4);
      cupMatches = generateCupMatches(topFour, seasonNumber);
    }
    
    // Schedule all matches by rounds
    const allMatches = scheduleMatchesByRounds(div1Matches, div2Matches, cupMatches);
    
    const newSeason: Season = {
      number: seasonNumber,
      matches: allMatches,
      currentMatchIndex: 0,
      currentRound: 1,
      maxRounds: Math.max(...allMatches.map(m => m.round)),
      cupParticipants: cupMatches.length > 0 ? [
        ...new Set(cupMatches.map(m => [m.player1, m.player2]).flat())
      ] : [],
      completed: false,
      leaguePoints: {}
    };
    
    // Initialize league points
    currentPlayers.forEach(player => {
      newSeason.leaguePoints[player.id] = 0;
    });
    
    setCurrentSeason(newSeason);
    setSeasons(prev => {
      const newSeasons = [...prev, newSeason];
      // Save state after season creation
      saveGameState({ 
        players: currentPlayers, 
        currentSeason: newSeason, 
        seasons: newSeasons 
      });
      return newSeasons;
    });
  };

  const simulateNextMatch = () => {
    if (!currentSeason || currentSeason.completed) return;
    
    if (currentSeason.currentMatchIndex >= currentSeason.matches.length) {
      endSeason();
      return;
    }
    
    const match = currentSeason.matches[currentSeason.currentMatchIndex];
    const result = simulateMatch(
      match.player1, 
      match.player2, 
      match.matchType, 
      currentSeason.number, 
      match.round
    );
    
    // Update league points for league matches
    if (result.matchType === 'league' && result.winner) {
      setCurrentSeason(prev => {
        if (!prev) return prev;
        const newLeaguePoints = { ...prev.leaguePoints };
        newLeaguePoints[result.winner!.id] = (newLeaguePoints[result.winner!.id] || 0) + 1;
        return { ...prev, leaguePoints: newLeaguePoints };
      });
    }
    
    const updatedMatches = [...currentSeason.matches];
    updatedMatches[currentSeason.currentMatchIndex] = result;
    
    // Check if we need to generate cup finals
    if (result.matchType === 'cup-semi') {
      const semiResults = updatedMatches.filter(m => m.matchType === 'cup-semi' && m.completed);
      if (semiResults.length === 2) {
        const winners = semiResults.map(m => m.winner!);
        const losers = semiResults.map(m => m.winner!.id === m.player1.id ? m.player2 : m.player1);
        
        const finalMatches = generateFinalMatches(winners, losers, currentSeason.number);
        updatedMatches.push(...finalMatches);
      }
    }
    
    const nextRound = result.round > currentSeason.currentRound ? result.round : currentSeason.currentRound;
    
    const updatedSeason = {
      ...currentSeason,
      matches: updatedMatches,
      currentMatchIndex: currentSeason.currentMatchIndex + 1,
      currentRound: nextRound
    };
    
    setCurrentSeason(updatedSeason);
    
    // Save state after match simulation
    saveGameState({ currentSeason: updatedSeason });
  };

  // Add simulateCupMatch function (same as simulateNextMatch for now)
  const simulateCupMatch = () => {
    simulateNextMatch();
  };

  const endSeason = () => {
    if (!currentSeason) return;
    
    // Calculate final standings
    const div1Players = players.filter(p => p.division === 1);
    const div2Players = players.filter(p => p.division === 2);
    
    const div1Standings = div1Players.sort((a, b) => {
      const aPoints = currentSeason.leaguePoints[a.id] || 0;
      const bPoints = currentSeason.leaguePoints[b.id] || 0;
      if (aPoints !== bPoints) return bPoints - aPoints;
      
      // Tiebreaker: head to head
      const headToHead = a.headToHead[b.id];
      if (headToHead) {
        return headToHead.wins - headToHead.losses;
      }
      
      return b.rating - a.rating;
    });
    
    const div2Standings = div2Players.sort((a, b) => {
      const aPoints = currentSeason.leaguePoints[a.id] || 0;
      const bPoints = currentSeason.leaguePoints[b.id] || 0;
      if (aPoints !== bPoints) return bPoints - aPoints;
      return b.rating - a.rating;
    });
    
    // Handle promotion/relegation
    if (div1Standings.length > 0 && div2Standings.length > 0) {
      const relegated = div1Standings[4]; // Last in Div 1
      const promoted = div2Standings[0]; // First in Div 2
      
      relegated.division = 2;
      promoted.division = 1;
    }
    
    // Update player careers and development
    const updatedPlayers = players.map(player => {
      player.seasonsPlayed++;
      player.age++;
      developPlayer(player);
      
      // Add season record
      const isDiv1 = div1Standings.includes(player);
      const position = isDiv1 
        ? div1Standings.indexOf(player) + 1
        : div2Standings.indexOf(player) + 6; // Div 2 positions are 6-10
      
      // Determine cup result
      let cupResult: 'Champion' | 'Runner-Up' | '3rd Place' | 'Semifinalist' | 'None' = 'None';
      const cupFinal = currentSeason.matches.find(m => m.matchType === 'cup-final' && m.completed);
      const cup3rd = currentSeason.matches.find(m => m.matchType === 'cup-3rd' && m.completed);
      const cupSemis = currentSeason.matches.filter(m => m.matchType === 'cup-semi' && m.completed);
      
      if (cupFinal?.winner?.id === player.id) {
        cupResult = 'Champion';
        player.cupsWon++;
        player.cupPodiums++;
      } else if (cupFinal && (cupFinal.player1.id === player.id || cupFinal.player2.id === player.id)) {
        cupResult = 'Runner-Up';
        player.cupPodiums++;
      } else if (cup3rd?.winner?.id === player.id) {
        cupResult = '3rd Place';
        player.cupPodiums++;
      } else if (cupSemis.some(m => m.player1.id === player.id || m.player2.id === player.id)) {
        cupResult = 'Semifinalist';
      }
      
      player.seasonHistory.push({
        season: currentSeason.number,
        division: player.division,
        position,
        cupResult,
        endRating: player.rating,
        leaguePoints: currentSeason.leaguePoints[player.id] || 0
      });
      
      // Update championships and podiums
      if (position === 1) {
        player.championshipsWon++;
        player.podiums++;
      } else if (position <= 3) {
        player.podiums++;
      }
      
      // Check for retirement
      if (player.seasonsPlayed >= player.careerLength || player.rating < 15) {
        player.isRetired = true;
      }
      
      return player;
    });
    
    // Create season archive
    const cupResults = {
      winner: currentSeason.matches.find(m => m.matchType === 'cup-final' && m.completed)?.winner,
      runnerUp: (() => {
        const final = currentSeason.matches.find(m => m.matchType === 'cup-final' && m.completed);
        return final ? (final.winner?.id === final.player1.id ? final.player2 : final.player1) : undefined;
      })(),
      thirdPlace: currentSeason.matches.find(m => m.matchType === 'cup-3rd' && m.completed)?.winner,
      fourthPlace: (() => {
        const thirdMatch = currentSeason.matches.find(m => m.matchType === 'cup-3rd' && m.completed);
        return thirdMatch ? (thirdMatch.winner?.id === thirdMatch.player1.id ? thirdMatch.player2 : thirdMatch.player1) : undefined;
      })()
    };
    
    const archive: SeasonArchive = {
      season: currentSeason.number,
      division1FinalStandings: [...div1Standings],
      division2FinalStandings: [...div2Standings],
      cupResults
    };
    
    const newSeasonArchive = [...seasonArchive, archive];
    setSeasonArchive(newSeasonArchive);
    
    // Handle retirements and new players
    const activeUpdatedPlayers = updatedPlayers.filter(p => !p.isRetired);
    const newRetired = updatedPlayers.filter(p => p.isRetired && !retiredPlayers.some(rp => rp.id === p.id));
    
    const updatedRetiredPlayers = [...retiredPlayers, ...newRetired];
    setRetiredPlayers(updatedRetiredPlayers);
    
    // Generate new players for retirees
    const newPlayers: Player[] = [];
    for (let i = 0; i < newRetired.length; i++) {
      newPlayers.push(generatePlayer(2)); // New players start in Div 2
    }
    
    const finalPlayers = [...activeUpdatedPlayers, ...newPlayers];
    setPlayers(finalPlayers);
    
    // Mark season as completed
    const completedSeason = {
      ...currentSeason,
      completed: true
    };
    setCurrentSeason(completedSeason);
    
    // Save state after season end
    saveGameState({
      players: finalPlayers,
      currentSeason: completedSeason,
      seasonArchive: newSeasonArchive,
      retiredPlayers: updatedRetiredPlayers
    });
    
    // Start new season
    setTimeout(() => {
      startNewSeason(finalPlayers, currentSeason.number + 1);
    }, 1000);
  };

  return {
    players,
    currentSeason,
    seasons,
    seasonArchive,
    retiredPlayers,
    simulateNextMatch,
    simulateCupMatch,
    endSeason,
    resetLeague
  };
};
