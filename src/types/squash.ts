
export interface Player {
  id: string;
  name: string;
  age: number;
  rating: number;
  developmentRate: number;
  careerLength: number;
  seasonsPlayed: number;
  nationality: string;
  division: 1 | 2;
  
  // Career stats
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  setsWon: number;
  setsLost: number;
  pointsScored: number;
  championshipsWon: number;
  podiums: number;
  cupsWon: number;
  cupPodiums: number;
  careerHighRating: number;
  
  // Season history
  seasonHistory: SeasonRecord[];
  
  // Head to head
  headToHead: Record<string, { wins: number; losses: number }>;
  
  // Status
  isRetired: boolean;
  isDeclined: boolean;
  injuryMatches?: number;
}

export interface SeasonRecord {
  season: number;
  division: 1 | 2;
  position: number;
  cupResult?: 'Champion' | '2nd' | '3rd' | 'Semifinalist';
  endRating: number;
}

export interface Match {
  id: string;
  player1: Player;
  player2: Player;
  division: 1 | 2;
  matchType: 'league' | 'cup-semi' | 'cup-final' | 'cup-3rd';
  winner?: Player;
  sets: number[];
  completed: boolean;
  season: number;
}

export interface Season {
  number: number;
  matches: Match[];
  currentMatchIndex: number;
  cupParticipants: Player[];
  completed: boolean;
}

export interface Country {
  name: string;
  flag: string;
  description: string;
}
