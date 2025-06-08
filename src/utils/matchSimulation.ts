
import { Player, Match } from "@/types/squash";

export const simulateMatch = (player1: Player, player2: Player, matchType: string = 'league', season: number): Match => {
  // Calculate win probability for player1
  const totalRating = player1.rating + player2.rating;
  const player1WinChance = player1.rating / totalRating;
  
  const sets: number[] = [];
  let player1Sets = 0;
  let player2Sets = 0;
  
  // Simulate best of 3 sets
  while (player1Sets < 2 && player2Sets < 2) {
    const setWinner = Math.random() < player1WinChance ? 1 : 2;
    if (setWinner === 1) {
      player1Sets++;
      sets.push(1);
    } else {
      player2Sets++;
      sets.push(2);
    }
  }
  
  const winner = player1Sets === 2 ? player1 : player2;
  const loser = winner === player1 ? player2 : player1;
  
  // Update stats
  winner.gamesWon++;
  winner.gamesPlayed++;
  loser.gamesLost++;
  loser.gamesPlayed++;
  
  winner.setsWon += winner === player1 ? player1Sets : player2Sets;
  winner.setsLost += winner === player1 ? player2Sets : player1Sets;
  loser.setsWon += loser === player1 ? player1Sets : player2Sets;
  loser.setsLost += loser === player1 ? player2Sets : player1Sets;
  
  winner.pointsScored += winner === player1 ? player1Sets : player2Sets;
  loser.pointsScored += loser === player1 ? player1Sets : player2Sets;
  
  // Update head-to-head
  if (!winner.headToHead[loser.id]) {
    winner.headToHead[loser.id] = { wins: 0, losses: 0 };
  }
  if (!loser.headToHead[winner.id]) {
    loser.headToHead[winner.id] = { wins: 0, losses: 0 };
  }
  
  winner.headToHead[loser.id].wins++;
  loser.headToHead[winner.id].losses++;
  
  return {
    id: crypto.randomUUID(),
    player1,
    player2,
    division: player1.division,
    matchType: matchType as any,
    winner,
    sets,
    completed: true,
    season
  };
};

export const developPlayer = (player: Player): void => {
  if (player.isRetired) return;
  
  // Check for decline (after year 7)
  if (player.seasonsPlayed >= 7) {
    const declineChance = 0.3 + ((player.seasonsPlayed - 7) * 0.2);
    if (Math.random() < declineChance) {
      player.isDeclined = true;
      const decline = Math.random() * 1.5 + 1; // 1-2.5 points lost
      player.rating = Math.max(player.rating - decline, 20);
      return;
    }
  }
  
  // Normal development
  const baseGrowth = Math.random() * 1.5 + 1; // 1-2.5 base
  const growth = baseGrowth * player.developmentRate;
  
  // Diminishing returns as rating increases
  const diminishingFactor = Math.max(0.1, 1 - (player.rating - 50) / 100);
  const finalGrowth = growth * diminishingFactor;
  
  player.rating = Math.min(player.rating + finalGrowth, 100);
  player.careerHighRating = Math.max(player.careerHighRating, player.rating);
};
