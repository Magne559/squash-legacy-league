
import { useState, useEffect } from 'react';
import { Player, Season, Match } from '@/types/squash';
import { generateInitialPlayers, generatePlayer } from '@/utils/playerGenerator';
import { simulateMatch, developPlayer } from '@/utils/matchSimulation';

export const useSquashLeague = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [retiredPlayers, setRetiredPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Initialize league
    const initialPlayers = generateInitialPlayers();
    setPlayers(initialPlayers);
    startNewSeason(initialPlayers, 1);
  }, []);

  const startNewSeason = (currentPlayers: Player[], seasonNumber: number) => {
    // Generate matches for both divisions
    const matches: Match[] = [];
    
    const div1Players = currentPlayers.filter(p => p.division === 1);
    const div2Players = currentPlayers.filter(p => p.division === 2);
    
    // Generate league matches for each division
    const generateDivisionMatches = (divPlayers: Player[], division: 1 | 2) => {
      const divMatches: Match[] = [];
      for (let i = 0; i < divPlayers.length; i++) {
        for (let j = i + 1; j < divPlayers.length; j++) {
          divMatches.push({
            id: crypto.randomUUID(),
            player1: divPlayers[i],
            player2: divPlayers[j],
            division,
            matchType: 'league',
            completed: false,
            sets: [],
            season: seasonNumber
          });
        }
      }
      return divMatches;
    };
    
    const div1Matches = generateDivisionMatches(div1Players, 1);
    const div2Matches = generateDivisionMatches(div2Players, 2);
    
    // Interleave matches: Div2, Div1, Cup (when applicable)
    const maxMatches = Math.max(div1Matches.length, div2Matches.length);
    for (let i = 0; i < maxMatches; i++) {
      if (i < div2Matches.length) matches.push(div2Matches[i]);
      if (i < div1Matches.length) matches.push(div1Matches[i]);
    }
    
    const newSeason: Season = {
      number: seasonNumber,
      matches,
      currentMatchIndex: 0,
      cupParticipants: [],
      completed: false
    };
    
    setCurrentSeason(newSeason);
  };

  const simulateNextMatch = () => {
    if (!currentSeason || currentSeason.completed) return;
    
    if (currentSeason.currentMatchIndex >= currentSeason.matches.length) {
      // All league matches done, start cup
      startCupTournament();
      return;
    }
    
    const match = currentSeason.matches[currentSeason.currentMatchIndex];
    const result = simulateMatch(match.player1, match.player2, match.matchType, currentSeason.number);
    
    const updatedMatches = [...currentSeason.matches];
    updatedMatches[currentSeason.currentMatchIndex] = result;
    
    setCurrentSeason({
      ...currentSeason,
      matches: updatedMatches,
      currentMatchIndex: currentSeason.currentMatchIndex + 1
    });
  };

  const startCupTournament = () => {
    if (!currentSeason) return;
    
    // Get Division 1 standings
    const div1Players = players.filter(p => p.division === 1);
    const standings = div1Players.sort((a, b) => {
      const aWins = currentSeason.matches.filter(m => m.completed && m.winner?.id === a.id && m.division === 1).length;
      const bWins = currentSeason.matches.filter(m => m.completed && m.winner?.id === b.id && m.division === 1).length;
      return bWins - aWins;
    });
    
    const top4 = standings.slice(0, 4);
    
    // Generate cup matches
    const cupMatches: Match[] = [
      {
        id: crypto.randomUUID(),
        player1: top4[0],
        player2: top4[3],
        division: 1,
        matchType: 'cup-semi',
        completed: false,
        sets: [],
        season: currentSeason.number
      },
      {
        id: crypto.randomUUID(),
        player1: top4[1],
        player2: top4[2],
        division: 1,
        matchType: 'cup-semi',
        completed: false,
        sets: [],
        season: currentSeason.number
      }
    ];
    
    setCurrentSeason({
      ...currentSeason,
      matches: [...currentSeason.matches, ...cupMatches],
      cupParticipants: top4
    });
  };

  const simulateCupMatch = () => {
    if (!currentSeason) return;
    
    const cupMatches = currentSeason.matches.filter(m => m.matchType.includes('cup'));
    const nextCupMatch = cupMatches.find(m => !m.completed);
    
    if (!nextCupMatch) return;
    
    const result = simulateMatch(nextCupMatch.player1, nextCupMatch.player2, nextCupMatch.matchType, currentSeason.number);
    
    const updatedMatches = currentSeason.matches.map(m => 
      m.id === nextCupMatch.id ? result : m
    );
    
    setCurrentSeason({
      ...currentSeason,
      matches: updatedMatches
    });
    
    // Check if we need to generate final/3rd place matches
    const semiResults = updatedMatches.filter(m => m.matchType === 'cup-semi' && m.completed);
    if (semiResults.length === 2) {
      const winners = semiResults.map(m => m.winner!);
      const losers = semiResults.map(m => m.winner!.id === m.player1.id ? m.player2 : m.player1);
      
      const finalMatches: Match[] = [
        {
          id: crypto.randomUUID(),
          player1: winners[0],
          player2: winners[1],
          division: 1,
          matchType: 'cup-final',
          completed: false,
          sets: [],
          season: currentSeason.number
        },
        {
          id: crypto.randomUUID(),
          player1: losers[0],
          player2: losers[1],
          division: 1,
          matchType: 'cup-3rd',
          completed: false,
          sets: [],
          season: currentSeason.number
        }
      ];
      
      setCurrentSeason({
        ...currentSeason,
        matches: [...updatedMatches, ...finalMatches]
      });
    }
  };

  const endSeason = () => {
    if (!currentSeason) return;
    
    // Calculate final standings and handle promotions/relegations
    const div1Players = players.filter(p => p.division === 1);
    const div2Players = players.filter(p => p.division === 2);
    
    // Sort by wins in league matches
    const div1Standings = div1Players.sort((a, b) => {
      const aWins = currentSeason.matches.filter(m => 
        m.completed && m.winner?.id === a.id && m.division === 1 && m.matchType === 'league'
      ).length;
      const bWins = currentSeason.matches.filter(m => 
        m.completed && m.winner?.id === b.id && m.division === 1 && m.matchType === 'league'
      ).length;
      return bWins - aWins;
    });
    
    const div2Standings = div2Players.sort((a, b) => {
      const aWins = currentSeason.matches.filter(m => 
        m.completed && m.winner?.id === a.id && m.division === 2 && m.matchType === 'league'
      ).length;
      const bWins = currentSeason.matches.filter(m => 
        m.completed && m.winner?.id === b.id && m.division === 2 && m.matchType === 'league'
      ).length;
      return bWins - aWins;
    });
    
    // Handle promotion/relegation
    const relegated = div1Standings[4]; // Last in Div 1
    const promoted = div2Standings[0]; // First in Div 2
    
    relegated.division = 2;
    promoted.division = 1;
    
    // Update player careers and development
    const updatedPlayers = players.map(player => {
      player.seasonsPlayed++;
      developPlayer(player);
      
      // Add season record
      const position = player.division === 1 
        ? div1Standings.indexOf(player) + 1
        : div2Standings.indexOf(player) + 6; // Div 2 positions are 6-10
      
      player.seasonHistory.push({
        season: currentSeason.number,
        division: player.division,
        position,
        endRating: player.rating
      });
      
      // Check for retirement
      if (player.seasonsPlayed >= player.careerLength) {
        player.isRetired = true;
      }
      
      return player;
    });
    
    // Handle retirements and new players
    const activeUpdatedPlayers = updatedPlayers.filter(p => !p.isRetired);
    const newRetired = updatedPlayers.filter(p => p.isRetired && !retiredPlayers.some(rp => rp.id === p.id));
    
    setRetiredPlayers(prev => [...prev, ...newRetired]);
    
    // Generate new players for retirees
    const newPlayers: Player[] = [];
    for (let i = 0; i < newRetired.length; i++) {
      newPlayers.push(generatePlayer(2)); // New players start in Div 2
    }
    
    const finalPlayers = [...activeUpdatedPlayers, ...newPlayers];
    setPlayers(finalPlayers);
    
    // Mark season as completed
    setCurrentSeason({
      ...currentSeason,
      completed: true
    });
    
    setSeasons(prev => [...prev, { ...currentSeason, completed: true }]);
    
    // Start new season
    setTimeout(() => {
      startNewSeason(finalPlayers, currentSeason.number + 1);
    }, 1000);
  };

  return {
    players,
    currentSeason,
    seasons,
    retiredPlayers,
    simulateNextMatch,
    simulateCupMatch,
    endSeason
  };
};
