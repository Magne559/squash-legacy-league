import { Player, Match, Season } from "@/types/squash";

export const generateDoubleRoundRobinSchedule = (players: Player[], division: 1 | 2, season: number): Match[] => {
  const matches: Match[] = [];
  const playerList = [...players];
  
  if (playerList.length !== 5) {
    console.warn(`Expected 5 players for division ${division}, got ${playerList.length}`);
    return matches;
  }
  
  // Fixed standard 20-round schedule for 5 players playing each other twice
  const schedule = [
    // First round robin (rounds 1-10)
    { round: 1, players: [0, 1] }, // Player 1 vs Player 2
    { round: 2, players: [2, 3] }, // Player 3 vs Player 4
    { round: 3, players: [4, 0] }, // Player 5 vs Player 1
    { round: 4, players: [1, 2] }, // Player 2 vs Player 3
    { round: 5, players: [3, 4] }, // Player 4 vs Player 5
    { round: 6, players: [0, 2] }, // Player 1 vs Player 3
    { round: 7, players: [1, 3] }, // Player 2 vs Player 4
    { round: 8, players: [4, 1] }, // Player 5 vs Player 2
    { round: 9, players: [0, 3] }, // Player 1 vs Player 4
    { round: 10, players: [2, 4] }, // Player 3 vs Player 5
    
    // Second round robin (rounds 11-20)
    { round: 11, players: [1, 0] }, // Player 2 vs Player 1
    { round: 12, players: [3, 2] }, // Player 4 vs Player 3
    { round: 13, players: [0, 4] }, // Player 1 vs Player 5
    { round: 14, players: [2, 1] }, // Player 3 vs Player 2
    { round: 15, players: [4, 3] }, // Player 5 vs Player 4
    { round: 16, players: [2, 0] }, // Player 3 vs Player 1
    { round: 17, players: [3, 1] }, // Player 4 vs Player 2
    { round: 18, players: [1, 4] }, // Player 2 vs Player 5
    { round: 19, players: [3, 0] }, // Player 4 vs Player 1
    { round: 20, players: [4, 2] }, // Player 5 vs Player 3
  ];
  
  schedule.forEach(({ round, players: [p1Index, p2Index] }) => {
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
