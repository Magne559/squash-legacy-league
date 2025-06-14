
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
  const [showRetirementPopup, setShowRetirementPopup] = useState(false);
  const [pendingRetirements, setPendingRetirements] = useState<Player[]>([]);
  const [pendingNewPlayers, setPendingNewPlayers] = useState<Player[]>([]);
  const [nextSeasonNumber, setNextSeasonNumber] = useState(1);

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
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  };

  const loadGameState = (): GameState | null => {
    try {
      const savedState = localStorage.getItem(SAVE_KEY);
      if (savedState) {
        return JSON.parse(savedState) as GameState;
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    return null;
  };

  const resetLeague = () => {
    try {
      localStorage.removeItem(SAVE_KEY);
      const initialPlayers = generateInitialPlayers();
      setPlayers(initialPlayers);
      setSeasons([]);
      setSeasonArchive([]);
      setRetiredPlayers([]);
      startNewSeason(initialPlayers, 1);
    } catch (error) {
      console.error('Failed to reset league:', error);
    }
  };

  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      setPlayers(savedState.players);
      setCurrentSeason(savedState.currentSeason);
      setSeasons(savedState.seasons);
      setSeasonArchive(savedState.seasonArchive);
      setRetiredPlayers(savedState.retiredPlayers);
    } else {
      const initialPlayers = generateInitialPlayers();
      setPlayers(initialPlayers);
      startNewSeason(initialPlayers, 1);
    }
  }, []);

  const startNewSeason = (currentPlayers: Player[], seasonNumber: number) => {
    console.log(`Starting season ${seasonNumber}`);
    
    if (currentPlayers.length !== 10) {
      console.error(`Expected 10 players, got ${currentPlayers.length}`);
      return;
    }
    
    // Reset season stats only
    currentPlayers.forEach(player => {
      player.gamesWon = 0;
      player.gamesLost = 0;
      player.gamesPlayed = 0;
      player.setsWon = 0;
      player.setsLost = 0;
      player.pointsScored = 0;
      player.pointsConceded = 0;
      player.headToHead = {};
    });
    
    // Division assignment
    if (seasonNumber === 1) {
      // First season - by rating
      const sortedPlayers = [...currentPlayers].sort((a, b) => b.rating - a.rating);
      sortedPlayers.forEach((player, index) => {
        player.division = index < 5 ? 1 : 2;
      });
      console.log('Season 1 - assigned by rating');
    } else {
      // Subsequent seasons - promotion/relegation
      const lastArchive = seasonArchive[seasonArchive.length - 1];
      if (!lastArchive) {
        console.error('No season archive found for promotion/relegation');
        return;
      }

      const lastDiv1 = lastArchive.division1FinalStandings;
      const lastDiv2 = lastArchive.division2FinalStandings;
      
      console.log(`Season ${seasonNumber} promotion/relegation based on:`);
      console.log('Last Div 1:', lastDiv1.map((p, i) => `${i+1}. ${p.name}`));
      console.log('Last Div 2:', lastDiv2.map((p, i) => `${i+1}. ${p.name}`));
      
      // Create active player lookup
      const activePlayerMap = new Map(currentPlayers.map(p => [p.name + p.nationality, p]));
      
      // Clear all divisions first
      currentPlayers.forEach(p => p.division = 2);
      
      // Top 4 from Div 1 stay in Div 1
      for (let i = 0; i < Math.min(4, lastDiv1.length); i++) {
        const lastPlayer = lastDiv1[i];
        const currentPlayer = activePlayerMap.get(lastPlayer.name + lastPlayer.nationality);
        if (currentPlayer) {
          currentPlayer.division = 1;
          console.log(`${currentPlayer.name} stays in Div 1 (pos ${i+1})`);
        }
      }
      
      // Div 2 winner promoted to Div 1
      if (lastDiv2.length > 0) {
        const promotedData = lastDiv2[0];
        const promotedPlayer = activePlayerMap.get(promotedData.name + promotedData.nationality);
        if (promotedPlayer) {
          promotedPlayer.division = 1;
          console.log(`${promotedPlayer.name} PROMOTED to Div 1`);
        }
      }
      
      // Last place in Div 1 relegated to Div 2
      if (lastDiv1.length >= 5) {
        const relegatedData = lastDiv1[4];
        const relegatedPlayer = activePlayerMap.get(relegatedData.name + relegatedData.nationality);
        if (relegatedPlayer) {
          relegatedPlayer.division = 2;
          console.log(`${relegatedPlayer.name} RELEGATED to Div 2`);
        }
      }
      
      // Fill any gaps with highest rated unassigned players
      const div1Count = currentPlayers.filter(p => p.division === 1).length;
      if (div1Count < 5) {
        const unassigned = currentPlayers
          .filter(p => p.division === 2)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5 - div1Count);
        
        unassigned.forEach(p => {
          p.division = 1;
          console.log(`${p.name} filled Div 1 spot (rating: ${p.rating})`);
        });
      }
    }
    
    const div1Players = currentPlayers.filter(p => p.division === 1);
    const div2Players = currentPlayers.filter(p => p.division === 2);
    
    console.log('Final divisions:');
    console.log('Div 1:', div1Players.map(p => p.name));
    console.log('Div 2:', div2Players.map(p => p.name));
    
    // Generate matches
    const div1Matches = generateDoubleRoundRobinSchedule(div1Players, 1, seasonNumber);
    const div2Matches = generateDoubleRoundRobinSchedule(div2Players, 2, seasonNumber);
    
    // Cup matches - top 4 from last season's Div 1
    let cupMatches: Match[] = [];
    let cupParticipants: Player[] = [];
    
    if (seasonNumber > 1 && seasonArchive.length > 0) {
      const lastArchive = seasonArchive[seasonArchive.length - 1];
      const lastDiv1 = lastArchive.division1FinalStandings;
      
      const activePlayerMap = new Map(currentPlayers.map(p => [p.name + p.nationality, p]));
      const availableCupParticipants: Player[] = [];
      
      // Get top 4 from last season that are still active
      for (let i = 0; i < Math.min(4, lastDiv1.length); i++) {
        const lastPlayer = lastDiv1[i];
        const currentPlayer = activePlayerMap.get(lastPlayer.name + lastPlayer.nationality);
        if (currentPlayer) {
          availableCupParticipants.push(currentPlayer);
        }
      }
      
      // Fill gaps with current top Div 1 players
      if (availableCupParticipants.length < 4) {
        const additionalPlayers = div1Players
          .filter(p => !availableCupParticipants.includes(p))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4 - availableCupParticipants.length);
        
        availableCupParticipants.push(...additionalPlayers);
      }
      
      cupParticipants = availableCupParticipants.slice(0, 4);
      if (cupParticipants.length === 4) {
        cupMatches = generateCupMatches(cupParticipants, seasonNumber);
      }
    } else {
      cupParticipants = div1Players.slice(0, 4);
      cupMatches = generateCupMatches(cupParticipants, seasonNumber);
    }
    
    const allMatches = scheduleMatchesByRounds(div1Matches, div2Matches, cupMatches);
    
    const newSeason: Season = {
      number: seasonNumber,
      matches: allMatches,
      currentMatchIndex: 0,
      currentRound: 1,
      maxRounds: Math.max(...allMatches.map(m => m.round)),
      cupParticipants,
      completed: false,
      leaguePoints: {},
      leaguePhaseComplete: false
    };
    
    currentPlayers.forEach(player => {
      newSeason.leaguePoints[player.id] = 0;
    });
    
    setCurrentSeason(newSeason);
    setSeasons(prev => {
      const newSeasons = [...prev, newSeason];
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
    
    const actualPlayer1 = players.find(p => 
      p.name === match.player1.name && p.nationality === match.player1.nationality
    );
    const actualPlayer2 = players.find(p => 
      p.name === match.player2.name && p.nationality === match.player2.nationality
    );
    
    if (!actualPlayer1 || !actualPlayer2) {
      console.error('Could not find players for match');
      return;
    }
    
    const result = simulateMatch(
      actualPlayer1, 
      actualPlayer2, 
      match.matchType, 
      currentSeason.number, 
      match.round
    );
    
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
    
    if (result.matchType === 'cup-semi') {
      const semiResults = updatedMatches.filter(m => m.matchType === 'cup-semi' && m.completed);
      if (semiResults.length === 2) {
        const winners = semiResults.map(m => m.winner!);
        const losers = semiResults.map(m => m.winner!.id === m.player1.id ? m.player2 : m.player1);
        
        const finalMatches = generateFinalMatches(winners, losers, currentSeason.number);
        updatedMatches.push(...finalMatches);
      }
    }
    
    const leagueMatches = updatedMatches.filter(m => m.matchType === 'league');
    const leaguePhaseComplete = leagueMatches.every(m => m.completed);
    
    const nextRound = result.round > currentSeason.currentRound ? result.round : currentSeason.currentRound;
    
    const updatedSeason = {
      ...currentSeason,
      matches: updatedMatches,
      currentMatchIndex: currentSeason.currentMatchIndex + 1,
      currentRound: nextRound,
      leaguePhaseComplete
    };
    
    setCurrentSeason(updatedSeason);
    
    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (player.id === actualPlayer1.id) return actualPlayer1;
        if (player.id === actualPlayer2.id) return actualPlayer2;
        return player;
      });
    });
    
    saveGameState({ 
      players: players.map(player => {
        if (player.id === actualPlayer1.id) return actualPlayer1;
        if (player.id === actualPlayer2.id) return actualPlayer2;
        return player;
      }), 
      currentSeason: updatedSeason 
    });
  };

  const endSeason = () => {
    if (!currentSeason) return;
    
    const div1Players = players.filter(p => p.division === 1);
    const div2Players = players.filter(p => p.division === 2);
    
    // Proper standings calculation
    const getStandings = (divisionPlayers: Player[]) => {
      return divisionPlayers.sort((a, b) => {
        // Primary: Win percentage
        const aWinPct = a.gamesPlayed > 0 ? a.gamesWon / a.gamesPlayed : 0;
        const bWinPct = b.gamesPlayed > 0 ? b.gamesWon / b.gamesPlayed : 0;
        if (Math.abs(aWinPct - bWinPct) > 0.001) {
          return bWinPct - aWinPct;
        }
        
        // Secondary: Sets won
        if (a.setsWon !== b.setsWon) {
          return b.setsWon - a.setsWon;
        }
        
        // Tertiary: Set difference
        const aSetDiff = a.setsWon - a.setsLost;
        const bSetDiff = b.setsWon - b.setsLost;
        if (aSetDiff !== bSetDiff) {
          return bSetDiff - aSetDiff;
        }
        
        // Final: Rating
        return b.rating - a.rating;
      });
    };
    
    const div1Standings = getStandings(div1Players);
    const div2Standings = getStandings(div2Players);
    
    console.log('Final standings:');
    console.log('Div 1:', div1Standings.map((p, i) => `${i+1}. ${p.name} (${(p.gamesPlayed > 0 ? (p.gamesWon / p.gamesPlayed * 100).toFixed(1) : '0.0')}%)`));
    console.log('Div 2:', div2Standings.map((p, i) => `${i+1}. ${p.name} (${(p.gamesPlayed > 0 ? (p.gamesWon / p.gamesPlayed * 100).toFixed(1) : '0.0')}%)`));
    
    // Update player careers
    const updatedPlayers = players.map(player => {
      player.seasonsPlayed++;
      player.age++;
      developPlayer(player);
      
      const isDiv1 = div1Standings.includes(player);
      const position = isDiv1 
        ? div1Standings.indexOf(player) + 1
        : div2Standings.indexOf(player) + 6;
      
      // Simplified cup results - only Champion, Runner-Up, 3rd Place
      let cupResult: 'Champion' | 'Runner-Up' | '3rd Place' | 'Did Not Qualify' = 'Did Not Qualify';
      
      if (currentSeason.cupParticipants.some(p => p.id === player.id)) {
        player.cupsPlayed++;
        
        const cupFinal = currentSeason.matches.find(m => m.matchType === 'cup-final' && m.completed);
        const cup3rd = currentSeason.matches.find(m => m.matchType === 'cup-3rd' && m.completed);
        
        if (cupFinal?.winner?.id === player.id) {
          cupResult = 'Champion';
          player.cupsWon++;
        } else if (cupFinal && (cupFinal.player1.id === player.id || cupFinal.player2.id === player.id)) {
          cupResult = 'Runner-Up';
        } else if (cup3rd?.winner?.id === player.id) {
          cupResult = '3rd Place';
        }
      }
      
      player.seasonHistory.push({
        season: currentSeason.number,
        division: player.division,
        position,
        cupResult,
        endRating: player.rating,
        leaguePoints: currentSeason.leaguePoints[player.id] || 0
      });
      
      // Update achievements - only count once per season
      if (position === 1) {
        player.championshipsWon++;
        player.podiums++;
      } else if (position <= 3) {
        player.podiums++;
      }
      
      // Retirement check
      if (player.seasonsPlayed >= player.careerLength) {
        player.isRetired = true;
        console.log(`${player.name} retiring after ${player.seasonsPlayed} seasons`);
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
    
    // Handle retirements
    const activeUpdatedPlayers = updatedPlayers.filter(p => !p.isRetired);
    const newRetired = updatedPlayers.filter(p => p.isRetired && !retiredPlayers.some(rp => rp.id === p.id));
    
    const updatedRetiredPlayers = [...retiredPlayers, ...newRetired];
    setRetiredPlayers(updatedRetiredPlayers);
    
    // Generate new players
    const newPlayers: Player[] = [];
    for (let i = 0; i < newRetired.length; i++) {
      newPlayers.push(generatePlayer(2));
    }
    
    let finalPlayers = [...activeUpdatedPlayers, ...newPlayers];
    
    while (finalPlayers.length < 10) {
      finalPlayers.push(generatePlayer(2));
    }
    if (finalPlayers.length > 10) {
      finalPlayers = finalPlayers.slice(0, 10);
    }
    
    const completedSeason = {
      ...currentSeason,
      completed: true
    };
    setCurrentSeason(completedSeason);
    
    saveGameState({
      players: finalPlayers,
      currentSeason: completedSeason,
      seasonArchive: newSeasonArchive,
      retiredPlayers: updatedRetiredPlayers
    });
    
    if (newRetired.length > 0) {
      setPendingRetirements(newRetired);
      setPendingNewPlayers(newPlayers);
      setNextSeasonNumber(currentSeason.number + 1);
      setShowRetirementPopup(true);
      setPlayers(finalPlayers);
    } else {
      setPlayers(finalPlayers);
      setTimeout(() => {
        startNewSeason(finalPlayers, currentSeason.number + 1);
      }, 1000);
    }
  };

  const handleStartNextSeason = () => {
    setShowRetirementPopup(false);
    setTimeout(() => {
      startNewSeason(players, nextSeasonNumber);
    }, 500);
  };

  return {
    players,
    currentSeason,
    seasons,
    seasonArchive,
    retiredPlayers,
    simulateNextMatch,
    endSeason,
    resetLeague,
    showRetirementPopup,
    pendingRetirements,
    pendingNewPlayers,
    onStartNextSeason: handleStartNextSeason
  };
};
