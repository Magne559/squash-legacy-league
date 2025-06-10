
import { Player, Match, Season } from "@/types/squash";

export const generateDoubleRoundRobinSchedule = (players: Player[], division: 1 | 2, season: number): Match[] => {
  const matches: Match[] = [];
  const playerList = [...players];
  
  if (playerList.length !== 5) {
    console.warn(`Expected 5 players for division ${division}, got ${playerList.length}`);
    return matches;
  }
  
  // Standard 10-match double round-robin schedule for 5 players
  const schedule = [
    // First round robin
    [0, 1], // Round 1: Player 1 vs Player 2
    [2, 3], // Round 2: Player 3 vs Player 4
    [4, 0], // Round 3: Player 5 vs Player 1
    [1, 2], // Round 4: Player 2 vs Player 3
    [3, 4], // Round 5: Player 4 vs Player 5
    [0, 2], // Round 6: Player 1 vs Player 3
    [1, 3], // Round 7: Player 2 vs Player 4
    [4, 1], // Round 8: Player 5 vs Player 2
    [0, 3], // Round 9: Player 1 vs Player 4
    [2, 4], // Round 10: Player 3 vs Player 5
    
    // Second round robin (reverse fixtures)
    [1, 0], // Round 11: Player 2 vs Player 1
    [3, 2], // Round 12: Player 4 vs Player 3
    [0, 4], // Round 13: Player 1 vs Player 5
    [2, 1], // Round 14: Player 3 vs Player 2
    [4, 3], // Round 15: Player 5 vs Player 4
    [2, 0], // Round 16: Player 3 vs Player 1
    [3, 1], // Round 17: Player 4 vs Player 2
    [1, 4], // Round 18: Player 2 vs Player 5
    [3, 0], // Round 19: Player 4 vs Player 1
    [4, 2], // Round 20: Player 5 vs Player 3
  ];
  
  schedule.forEach(([p1Index, p2Index], matchIndex) => {
    const round = Math.floor(matchIndex / 2) + 1; // 2 matches per round
    
    matches.push({
      id: crypto.randomUUID(),
      player1: playerList[p1Index],
      player2: playerList[p2Index],
      division,
      matchType: 'league',
      completed: false,
      sets: [],
      setScores: [],
      season,
      round
    });
  });
  
  return matches;
};

export const generateCupMatches = (topFour: Player[], season: number): Match[] => {
  if (topFour.length !== 4) return [];
  
  // Sort by previous season position (assumed to be stored)
  const [first, second, third, fourth] = topFour;
  
  return [
    // Semifinals
    {
      id: crypto.randomUUID(),
      player1: first,
      player2: fourth,
      division: 1,
      matchType: 'cup-semi',
      completed: false,
      sets: [],
      setScores: [],
      season,
      round: 1
    },
    {
      id: crypto.randomUUID(),
      player1: second,
      player2: third,
      division: 1,
      matchType: 'cup-semi',
      completed: false,
      sets: [],
      setScores: [],
      season,
      round: 1
    }
  ];
};

export const generateFinalMatches = (semiWinners: Player[], semiLosers: Player[], season: number): Match[] => {
  return [
    // 3rd place match first
    {
      id: crypto.randomUUID(),
      player1: semiLosers[0],
      player2: semiLosers[1],
      division: 1,
      matchType: 'cup-3rd',
      completed: false,
      sets: [],
      setScores: [],
      season,
      round: 2
    },
    // Final last
    {
      id: crypto.randomUUID(),
      player1: semiWinners[0],
      player2: semiWinners[1],
      division: 1,
      matchType: 'cup-final',
      completed: false,
      sets: [],
      setScores: [],
      season,
      round: 3
    }
  ];
};

export const scheduleMatchesByRounds = (
  div1Matches: Match[],
  div2Matches: Match[],
  cupMatches: Match[]
): Match[] => {
  const allMatches: Match[] = [];
  
  // Group league matches by round
  const maxRound = Math.max(
    ...div1Matches.map(m => m.round),
    ...div2Matches.map(m => m.round)
  );
  
  // Add league matches round by round
  for (let round = 1; round <= maxRound; round++) {
    // Add Division 2 matches first (they get priority in each round)
    const div2RoundMatches = div2Matches.filter(m => m.round === round);
    allMatches.push(...div2RoundMatches);
    
    // Then add Division 1 matches
    const div1RoundMatches = div1Matches.filter(m => m.round === round);
    allMatches.push(...div1RoundMatches);
  }
  
  // Add cup matches AFTER all league matches
  const cupStartRound = maxRound + 1;
  cupMatches.forEach(match => {
    if (match.matchType === 'cup-semi') {
      match.round = cupStartRound;
    } else if (match.matchType === 'cup-3rd') {
      match.round = cupStartRound + 1;
    } else if (match.matchType === 'cup-final') {
      match.round = cupStartRound + 2;
    }
    allMatches.push(match);
  });
  
  return allMatches;
};
