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
    console.log(`Starting season ${seasonNumber} with ${currentPlayers.length} players`);
    
    // Ensure we have exactly 10 players (5 per division)
    if (currentPlayers.length !== 10) {
      console.error(`Expected 10 players, got ${currentPlayers.length}`);
      return;
    }
    
    // Reset all player season stats
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
    
    // FIXED: Proper promotion/demotion based on previous season standings
    let divisionAssignments: Player[];
    
    if (seasonArchive.length > 0) {
      // Get previous season standings for promotion/demotion
      const lastSeason = seasonArchive[seasonArchive.length - 1];
      const lastDiv1 = lastSeason.division1FinalStandings;
      const lastDiv2 = lastSeason.division2FinalStandings;
      
      console.log('Previous season final standings:');
      console.log('Div 1:', lastDiv1.map((p, i) => `${i+1}. ${p.name}`));
      console.log('Div 2:', lastDiv2.map((p, i) => `${i+6}. ${p.name}`));
      
      // Find current active players based on name+nationality (handles retirements)
      const activePlayerMap = new Map(currentPlayers.map(p => [p.name + p.nationality, p]));
      
      // Assign divisions based on previous season with promotion/demotion
      const newDiv1: Player[] = [];
      const newDiv2: Player[] = [];
      
      // Top 4 from Div 1 stay in Div 1
      for (let i = 0; i < 4 && i < lastDiv1.length; i++) {
        const lastSeasonPlayer = lastDiv1[i];
        const currentPlayer = activePlayerMap.get(lastSeasonPlayer.name + lastSeasonPlayer.nationality);
        if (currentPlayer) {
          currentPlayer.division = 1;
          newDiv1.push(currentPlayer);
          console.log(`${currentPlayer.name} stays in Div 1 (finished ${i+1})`);
        }
      }
      
      // Winner of Div 2 gets promoted to Div 1
      if (lastDiv2.length > 0) {
        const promotedPlayerData = lastDiv2[0];
        const promotedPlayer = activePlayerMap.get(promotedPlayerData.name + promotedPlayerData.nationality);
        if (promotedPlayer) {
          promotedPlayer.division = 1;
          newDiv1.push(promotedPlayer);
          console.log(`${promotedPlayer.name} promoted from Div 2 to Div 1 (won Div 2)`);
        }
      }
      
      // Bottom 4 from Div 2 stay in Div 2 (positions 2-5 in Div 2)
      for (let i = 1; i < lastDiv2.length; i++) {
        const lastSeasonPlayer = lastDiv2[i];
        const currentPlayer = activePlayerMap.get(lastSeasonPlayer.name + lastSeasonPlayer.nationality);
        if (currentPlayer) {
          currentPlayer.division = 2;
          newDiv2.push(currentPlayer);
          console.log(`${currentPlayer.name} stays in Div 2 (finished ${i+6})`);
        }
      }
      
      // Last place from Div 1 relegated to Div 2
      if (lastDiv1.length >= 5) {
        const relegatedPlayerData = lastDiv1[4]; // 5th place in Div 1
        const relegatedPlayer = activePlayerMap.get(relegatedPlayerData.name + relegatedPlayerData.nationality);
        if (relegatedPlayer) {
          relegatedPlayer.division = 2;
          newDiv2.push(relegatedPlayer);
          console.log(`${relegatedPlayer.name} relegated from Div 1 to Div 2 (finished 5th)`);
        }
      }
      
      // Fill remaining spots with any new players (should all be Div 2)
      const assignedPlayers = [...newDiv1, ...newDiv2];
      const unassignedPlayers = currentPlayers.filter(p => !assignedPlayers.includes(p));
      
      for (const player of unassignedPlayers) {
        if (newDiv1.length < 5) {
          player.division = 1;
          newDiv1.push(player);
          console.log(`${player.name} (new) assigned to Div 1`);
        } else {
          player.division = 2;
          newDiv2.push(player);
          console.log(`${player.name} (new) assigned to Div 2`);
        }
      }
      
      console.log('New season division assignments:');
      console.log('Div 1:', newDiv1.map(p => p.name));
      console.log('Div 2:', newDiv2.map(p => p.name));
      
      divisionAssignments = [...newDiv1, ...newDiv2];
    } else {
      // First season - assign by rating
      const sortedPlayers = [...currentPlayers].sort((a, b) => b.rating - a.rating);
      sortedPlayers.forEach((player, index) => {
        player.division = index < 5 ? 1 : 2;
      });
      divisionAssignments = sortedPlayers;
      console.log('First season - assigned by rating');
    }
    
    const div1Players = divisionAssignments.filter(p => p.division === 1);
    const div2Players = divisionAssignments.filter(p => p.division === 2);
    
    // Generate league matches (double round-robin)
    const div1Matches = generateDoubleRoundRobinSchedule(div1Players, 1, seasonNumber);
    const div2Matches = generateDoubleRoundRobinSchedule(div2Players, 2, seasonNumber);
    
    // FIXED: Generate cup matches with better participant selection
    let cupMatches: Match[] = [];
    let cupParticipants: Player[] = [];
    
    if (seasonArchive.length > 0) {
      // Get the top 4 from previous season's Division 1 final standings
      const lastSeason = seasonArchive[seasonArchive.length - 1];
      const lastDiv1Standings = lastSeason.division1FinalStandings;
      
      console.log('Last season Div 1 final standings for cup:', lastDiv1Standings.map((p, i) => `${i+1}. ${p.name}`));
      
      // Find these players in current active players (handle retirements properly)
      const activePlayerMap = new Map(divisionAssignments.map(p => [p.name + p.nationality, p]));
      const availableCupParticipants: Player[] = [];
      
      // Try to get top 4 from last season
      for (let i = 0; i < Math.min(4, lastDiv1Standings.length); i++) {
        const lastSeasonPlayer = lastDiv1Standings[i];
        const currentPlayer = activePlayerMap.get(lastSeasonPlayer.name + lastSeasonPlayer.nationality);
        if (currentPlayer) {
          availableCupParticipants.push(currentPlayer);
          console.log(`${currentPlayer.name} qualified for cup (finished ${i+1} last season)`);
        } else {
          console.log(`${lastSeasonPlayer.name} not available for cup (retired)`);
        }
      }
      
      // If we have less than 4 due to retirements, fill with current Div 1 top rated players
      if (availableCupParticipants.length < 4) {
        const additionalPlayers = div1Players
          .filter(p => !availableCupParticipants.includes(p))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4 - availableCupParticipants.length);
        
        for (const player of additionalPlayers) {
          availableCupParticipants.push(player);
          console.log(`${player.name} added to cup (replacement, rating: ${player.rating})`);
        }
      }
      
      cupParticipants = availableCupParticipants.slice(0, 4);
      console.log('Final cup participants:', cupParticipants.map(p => p.name));
      
      if (cupParticipants.length === 4) {
        cupMatches = generateCupMatches(cupParticipants, seasonNumber);
      }
    } else {
      // First season - use current top 4 by rating from Div 1
      cupParticipants = div1Players.slice(0, 4);
      cupMatches = generateCupMatches(cupParticipants, seasonNumber);
      console.log('First season cup participants (top 4 by rating):', cupParticipants.map(p => p.name));
    }
    
    // Schedule all matches with league first, then cup
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
    
    // Initialize league points
    divisionAssignments.forEach(player => {
      newSeason.leaguePoints[player.id] = 0;
    });
    
    setCurrentSeason(newSeason);
    setSeasons(prev => {
      const newSeasons = [...prev, newSeason];
      // Save state after season creation
      saveGameState({ 
        players: divisionAssignments, 
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
    
    // Find the actual player objects from current state by matching names and nationality
    // This handles cases where player object references become stale after retirements
    const actualPlayer1 = players.find(p => 
      p.name === match.player1.name && p.nationality === match.player1.nationality
    );
    const actualPlayer2 = players.find(p => 
      p.name === match.player2.name && p.nationality === match.player2.nationality
    );
    
    if (!actualPlayer1 || !actualPlayer2) {
      console.error('Could not find players for match:', {
        match_player1: match.player1.name,
        match_player2: match.player2.name,
        available_players: players.map(p => p.name)
      });
      return;
    }
    
    const result = simulateMatch(
      actualPlayer1, 
      actualPlayer2, 
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
    
    // Check if league phase is complete
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
    
    // Update players state with the modified players
    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (player.id === actualPlayer1.id) return actualPlayer1;
        if (player.id === actualPlayer2.id) return actualPlayer2;
        return player;
      });
    });
    
    // Save state after match simulation
    saveGameState({ 
      players: players.map(player => {
        if (player.id === actualPlayer1.id) return actualPlayer1;
        if (player.id === actualPlayer2.id) return actualPlayer2;
        return player;
      }), 
      currentSeason: updatedSeason 
    });
  };

  // Add simulateCupMatch function (same as simulateNextMatch for now)
  const simulateCupMatch = () => {
    simulateNextMatch();
  };

  const endSeason = () => {
    if (!currentSeason) return;
    
    // FIXED: Calculate final standings using PROPER ranking logic (same as StandingsView)
    const div1Players = players.filter(p => p.division === 1);
    const div2Players = players.filter(p => p.division === 2);
    
    const getStandings = (divisionPlayers: Player[]) => {
      return divisionPlayers.sort((a, b) => {
        // PRIMARY: Games won (most important)
        if (a.gamesWon !== b.gamesWon) {
          console.log(`Final standings: ${a.name} (${a.gamesWon}W) vs ${b.name} (${b.gamesWon}W) - sorted by wins`);
          return b.gamesWon - a.gamesWon;
        }
        
        // Tie-breaker 1: Win percentage
        const aWinPct = a.gamesPlayed > 0 ? a.gamesWon / a.gamesPlayed : 0;
        const bWinPct = b.gamesPlayed > 0 ? b.gamesWon / b.gamesPlayed : 0;
        if (Math.abs(aWinPct - bWinPct) > 0.001) return bWinPct - aWinPct;
        
        // Tie-breaker 2: Set difference
        const aSetDiff = a.setsWon - a.setsLost;
        const bSetDiff = b.setsWon - b.setsLost;
        if (aSetDiff !== bSetDiff) return bSetDiff - aSetDiff;
        
        // Tie-breaker 3: Points difference
        const aPointDiff = a.pointsScored - a.pointsConceded;
        const bPointDiff = b.pointsScored - b.pointsConceded;
        if (aPointDiff !== bPointDiff) return bPointDiff - aPointDiff;
        
        // Tie-breaker 4: Head to head
        const headToHead = a.headToHead[b.id];
        if (headToHead) {
          const h2hDiff = headToHead.wins - headToHead.losses;
          if (h2hDiff !== 0) return h2hDiff > 0 ? -1 : 1;
        }
        
        return b.rating - a.rating;
      });
    };
    
    const div1Standings = getStandings(div1Players);
    const div2Standings = getStandings(div2Players);
    
    console.log('FINAL SEASON STANDINGS:');
    console.log('Div 1:', div1Standings.map((p, i) => `${i+1}. ${p.name} (${p.gamesWon}W-${p.gamesLost}L)`));
    console.log('Div 2:', div2Standings.map((p, i) => `${i+6}. ${p.name} (${p.gamesWon}W-${p.gamesLost}L)`));
    
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
      
      // Determine cup result and increment cupsPlayed if participated
      let cupResult: 'Champion' | 'Runner-Up' | '3rd Place' | 'Semifinalist' | 'Did Not Qualify' = 'Did Not Qualify';
      
      if (currentSeason.cupParticipants.some(p => p.id === player.id)) {
        // Increment cupsPlayed since they participated in this season's cup
        player.cupsPlayed++;
        
        const cupFinal = currentSeason.matches.find(m => m.matchType === 'cup-final' && m.completed);
        const cup3rd = currentSeason.matches.find(m => m.matchType === 'cup-3rd' && m.completed);
        const cupSemis = currentSeason.matches.filter(m => m.matchType === 'cup-semi' && m.completed);
        
        if (cupFinal?.winner?.id === player.id) {
          cupResult = 'Champion';
          player.cupsWon++;
        } else if (cupFinal && (cupFinal.player1.id === player.id || cupFinal.player2.id === player.id)) {
          cupResult = 'Runner-Up';
        } else if (cup3rd?.winner?.id === player.id) {
          cupResult = '3rd Place';
        } else if (cupSemis.some(m => m.player1.id === player.id || m.player2.id === player.id)) {
          cupResult = 'Semifinalist';
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
      
      // Update championships and podiums
      if (position === 1) {
        player.championshipsWon++;
        player.podiums++;
      } else if (position <= 3) {
        player.podiums++;
      }
      
      // FIXED: Check for retirement with proper career length validation
      console.log(`${player.name}: ${player.seasonsPlayed} seasons played, career length: ${player.careerLength}`);
      if (player.seasonsPlayed >= player.careerLength) {
        player.isRetired = true;
        console.log(`${player.name} retiring after ${player.seasonsPlayed} seasons (career length: ${player.careerLength})`);
      }
      
      return player;
    });
    
    // Create season archive with proper standings
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
    
    // Generate new players for retirees (all start in Division 2)
    const newPlayers: Player[] = [];
    for (let i = 0; i < newRetired.length; i++) {
      newPlayers.push(generatePlayer(2));
    }
    
    // Combine active players and new players
    let finalPlayers = [...activeUpdatedPlayers, ...newPlayers];
    
    // Ensure we have exactly 10 players
    while (finalPlayers.length < 10) {
      finalPlayers.push(generatePlayer(2));
    }
    if (finalPlayers.length > 10) {
      finalPlayers = finalPlayers.slice(0, 10);
    }
    
    console.log(`Season ${currentSeason.number} ended:`, {
      retired: newRetired.map(p => p.name),
      newPlayers: newPlayers.map(p => p.name),
      totalPlayers: finalPlayers.length
    });
    
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
    
    // Show retirement popup if there are retirements
    if (newRetired.length > 0) {
      setPendingRetirements(newRetired);
      setPendingNewPlayers(newPlayers);
      setNextSeasonNumber(currentSeason.number + 1);
      setShowRetirementPopup(true);
      setPlayers(finalPlayers); // Update players state
    } else {
      // No retirements, start next season immediately
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
    simulateCupMatch,
    endSeason,
    resetLeague,
    showRetirementPopup,
    pendingRetirements,
    pendingNewPlayers,
    onStartNextSeason: handleStartNextSeason
  };
};
