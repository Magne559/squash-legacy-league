
import { Player, Match, Season } from "@/types/squash";

export const generateDoubleRoundRobinSchedule = (players: Player[], division: 1 | 2, season: number): Match[] => {
  const matches: Match[] = [];
  const playerList = [...players];
  
  // First round - each player plays each other once
  for (let i = 0; i < playerList.length; i++) {
    for (let j = i + 1; j < playerList.length; j++) {
      matches.push({
        id: crypto.randomUUID(),
        player1: playerList[i],
        player2: playerList[j],
        division,
        matchType: 'league',
        completed: false,
        sets: [],
        setScores: [],
        season,
        round: 0 // Will be assigned during scheduling
      });
    }
  }
  
  // Second round - reverse fixtures
  for (let i = 0; i < playerList.length; i++) {
    for (let j = i + 1; j < playerList.length; j++) {
      matches.push({
        id: crypto.randomUUID(),
        player1: playerList[j], // Reversed
        player2: playerList[i],
        division,
        matchType: 'league',
        completed: false,
        sets: [],
        setScores: [],
        season,
        round: 0 // Will be assigned during scheduling
      });
    }
  }
  
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
    // Final
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
      round: 2
    },
    // 3rd place match
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
    }
  ];
};

export const scheduleMatchesByRounds = (
  div1Matches: Match[],
  div2Matches: Match[],
  cupMatches: Match[]
): Match[] => {
  const allMatches: Match[] = [];
  const maxLeagueMatches = Math.max(div1Matches.length, div2Matches.length);
  
  // Distribute league matches across rounds
  const matchesPerRound = 2; // 2 matches per division per round
  const totalRounds = Math.ceil(maxLeagueMatches / matchesPerRound);
  
  let div1Index = 0;
  let div2Index = 0;
  
  for (let round = 1; round <= totalRounds; round++) {
    // Add Div 2 matches for this round
    for (let i = 0; i < matchesPerRound && div2Index < div2Matches.length; i++) {
      div2Matches[div2Index].round = round;
      allMatches.push(div2Matches[div2Index]);
      div2Index++;
    }
    
    // Add Div 1 matches for this round
    for (let i = 0; i < matchesPerRound && div1Index < div1Matches.length; i++) {
      div1Matches[div1Index].round = round;
      allMatches.push(div1Matches[div1Index]);
      div1Index++;
    }
    
    // Add cup matches for early rounds
    if (round <= 2) {
      const cupMatchesForRound = cupMatches.filter(m => m.round === round);
      allMatches.push(...cupMatchesForRound);
    }
  }
  
  return allMatches;
};
