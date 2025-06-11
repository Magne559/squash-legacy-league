import { Player, Match, HeadToHeadRecord } from "@/types/squash";

// Logistic function for win probability based on rating difference
const calculateWinProbability = (ratingA: number, ratingB: number): number => {
  const skillDiff = ratingA - ratingB;
  return 1 / (1 + Math.pow(10, -skillDiff / 400)); // Adjusted divisor for more realistic probabilities
};

// Generate realistic set scores based on skill difference
const generateSetScore = (winnerSkill: number, loserSkill: number): { winner: number, loser: number } => {
  const skillGap = Math.abs(winnerSkill - loserSkill);
  const baseWinnerScore = 11;
  
  // More varied scoring based on skill difference
  let loserScore: number;
  const randomFactor = Math.random();
  
  if (skillGap < 5) {
    // Very close match - can be tight
    loserScore = Math.floor(randomFactor * 4) + 7; // 7-10 (very close)
    if (randomFactor > 0.85) loserScore = 11; // Occasional deuce games
  } else if (skillGap < 15) {
    // Close match
    loserScore = Math.floor(randomFactor * 5) + 6; // 6-10 (close match)
    if (randomFactor > 0.9) loserScore = 11; // Rare deuce games
  } else if (skillGap < 30) {
    // Moderate gap
    loserScore = Math.floor(randomFactor * 6) + 4; // 4-9 (moderate gap)
  } else {
    // Large gap
    loserScore = Math.floor(randomFactor * 8) + 1; // 1-8 (large gap)
  }
  
  // Handle deuce games (11-11, then someone wins by 2)
  if (loserScore >= 11) {
    const deuceProbability = calculateWinProbability(winnerSkill, loserSkill);
    if (Math.random() < deuceProbability) {
      return { winner: Math.floor(Math.random() * 3) + 12, loser: Math.floor(Math.random() * 3) + 10 }; // 12-15 vs 10-13
    } else {
      return { winner: Math.floor(Math.random() * 3) + 10, loser: Math.floor(Math.random() * 3) + 12 }; // Upset win
    }
  }
  
  return { winner: baseWinnerScore, loser: Math.min(loserScore, 10) };
};

export const simulateMatch = (player1: Player, player2: Player, matchType: string = 'league', season: number, round: number): Match => {
  // Create deep copies to avoid mutation issues
  const player1Copy = JSON.parse(JSON.stringify(player1));
  const player2Copy = JSON.parse(JSON.stringify(player2));
  
  // Add small random fluctuation to simulate form
  const fluctuation1 = (Math.random() - 0.5) * 8; // ±4 points
  const fluctuation2 = (Math.random() - 0.5) * 8;
  
  const adjustedRating1 = Math.max(1, player1Copy.rating + fluctuation1);
  const adjustedRating2 = Math.max(1, player2Copy.rating + fluctuation2);
  
  const sets: number[] = [];
  const setScores: Array<{player1: number, player2: number}> = [];
  let player1Sets = 0;
  let player2Sets = 0;
  
  // Simulate best of 3 or best of 5 sets (randomly choose format)
  const maxSets = Math.random() > 0.7 ? 3 : 2; // 30% chance of best of 5, 70% best of 3
  const setsToWin = maxSets;
  
  // Simulate sets
  while (player1Sets < setsToWin && player2Sets < setsToWin) {
    const winProbability = calculateWinProbability(adjustedRating1, adjustedRating2);
    const setWinner = Math.random() < winProbability ? 1 : 2;
    
    if (setWinner === 1) {
      player1Sets++;
      sets.push(1);
      const scores = generateSetScore(adjustedRating1, adjustedRating2);
      setScores.push({ player1: scores.winner, player2: scores.loser });
    } else {
      player2Sets++;
      sets.push(2);
      const scores = generateSetScore(adjustedRating2, adjustedRating1);
      setScores.push({ player1: scores.loser, player2: scores.winner });
    }
  }
  
  const winner = player1Sets > player2Sets ? player1Copy : player2Copy;
  const loser = winner.id === player1Copy.id ? player2Copy : player1Copy;
  const winnerSets = winner.id === player1Copy.id ? player1Sets : player2Sets;
  const loserSets = winner.id === player1Copy.id ? player2Sets : player1Sets;
  
  // Calculate total points from set scores
  const player1Points = setScores.reduce((sum, set) => sum + set.player1, 0);
  const player2Points = setScores.reduce((sum, set) => sum + set.player2, 0);
  
  // Update match stats
  updatePlayerStats(player1Copy, player2Copy, winner, winnerSets, loserSets, player1Points, player2Points);
  
  return {
    id: crypto.randomUUID(),
    player1: player1Copy,
    player2: player2Copy,
    division: player1.division,
    matchType: matchType as any,
    winner,
    sets,
    setScores,
    completed: true,
    season,
    round
  };
};

const updatePlayerStats = (
  player1: Player, 
  player2: Player, 
  winner: Player, 
  winnerSets: number, 
  loserSets: number,
  player1Points: number,
  player2Points: number
): void => {
  // Update games played/won/lost
  player1.gamesPlayed++;
  player2.gamesPlayed++;
  
  if (winner === player1) {
    player1.gamesWon++;
    player2.gamesLost++;
  } else {
    player1.gamesLost++;
    player2.gamesWon++;
  }
  
  // Update sets won/lost
  player1.setsWon += winner === player1 ? winnerSets : loserSets;
  player1.setsLost += winner === player1 ? loserSets : winnerSets;
  player2.setsWon += winner === player2 ? winnerSets : loserSets;
  player2.setsLost += winner === player2 ? loserSets : winnerSets;
  
  // Update points scored/conceded
  player1.pointsScored += player1Points;
  player1.pointsConceded += player2Points;
  player2.pointsScored += player2Points;
  player2.pointsConceded += player1Points;
  
  // Update head-to-head records
  updateHeadToHead(player1, player2, winner, winnerSets, loserSets, player1Points, player2Points);
};

const updateHeadToHead = (
  player1: Player,
  player2: Player, 
  winner: Player,
  winnerSets: number,
  loserSets: number,
  player1Points: number,
  player2Points: number
): void => {
  // Initialize head-to-head records if they don't exist
  if (!player1.headToHead[player2.id]) {
    player1.headToHead[player2.id] = {
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      pointsScored: 0,
      pointsConceded: 0,
      opponentName: player2.name,
      opponentNationality: player2.nationality
    };
  }
  
  if (!player2.headToHead[player1.id]) {
    player2.headToHead[player1.id] = {
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      pointsScored: 0,
      pointsConceded: 0,
      opponentName: player1.name,
      opponentNationality: player1.nationality
    };
  }
  
  // Update head-to-head stats
  const h2h1 = player1.headToHead[player2.id];
  const h2h2 = player2.headToHead[player1.id];
  
  if (winner === player1) {
    h2h1.wins++;
    h2h2.losses++;
    h2h1.setsWon += winnerSets;
    h2h1.setsLost += loserSets;
    h2h2.setsWon += loserSets;
    h2h2.setsLost += winnerSets;
  } else {
    h2h1.losses++;
    h2h2.wins++;
    h2h1.setsWon += loserSets;
    h2h1.setsLost += winnerSets;
    h2h2.setsWon += winnerSets;
    h2h2.setsLost += loserSets;
  }
  
  h2h1.pointsScored += player1Points;
  h2h1.pointsConceded += player2Points;
  h2h2.pointsScored += player2Points;
  h2h2.pointsConceded += player1Points;
};

export const developPlayer = (player: Player): void => {
  if (player.isRetired) return;
  
  // Check for decline after peak age
  if (player.age >= player.peakAge && player.seasonsPlayed >= 7) {
    const declineChance = 0.3 + ((player.seasonsPlayed - 7) * 0.2);
    if (Math.random() < declineChance) {
      player.isDeclined = true;
      const decline = Math.random() * 1.5 + 1; // 1-2.5 points lost
      player.rating = Math.max(player.rating - decline, 15);
      return;
    }
  }
  
  // Normal development based on age and development rate
  let growthFactor: number;
  
  if (player.age < player.peakAge) {
    // Improving phase
    growthFactor = 1.0 + (player.developmentRate / 10);
  } else {
    // Post-peak phase - slower improvement or slight decline
    growthFactor = 0.5 + (player.developmentRate / 20);
  }
  
  const baseGrowth = Math.random() * 2.5 + 1; // 1-3.5 base
  const growth = baseGrowth * growthFactor;
  
  // Diminishing returns as rating increases
  const diminishingFactor = Math.max(0.1, 1 - (player.rating - 50) / 100);
  const finalGrowth = growth * diminishingFactor;
  
  player.rating = Math.min(player.rating + finalGrowth, 100);
  player.careerHighRating = Math.max(player.careerHighRating, player.rating);
};
