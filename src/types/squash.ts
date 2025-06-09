
export interface Player {
  id: string;
  name: string;
  age: number;
  rating: number;
  developmentRate: number; // 1-5 scale
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
  pointsConceded: number;
  championshipsWon: number;
  podiums: number;
  cupsWon: number;
  cupsPlayed: number; // Changed from cupPodiums to cupsPlayed
  careerHighRating: number;
  
  // Season history
  seasonHistory: SeasonRecord[];
  
  // Head to head - comprehensive tracking
  headToHead: Record<string, HeadToHeadRecord>;
  
  // Status
  isRetired: boolean;
  isDeclined: boolean;
  peakAge: number; // Age when player peaks
}

export interface HeadToHeadRecord {
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsScored: number;
  pointsConceded: number;
  opponentName: string;
  opponentNationality: string;
}

export interface SeasonRecord {
  season: number;
  division: 1 | 2;
  position: number; // 1-5 for Div 1, 6-10 for Div 2
  cupResult?: 'Champion' | 'Runner-Up' | '3rd Place' | 'Semifinalist' | 'Did Not Qualify';
  endRating: number;
  leaguePoints: number;
}

export interface Match {
  id: string;
  player1: Player;
  player2: Player;
  division: 1 | 2;
  matchType: 'league' | 'cup-semi' | 'cup-final' | 'cup-3rd';
  winner?: Player;
  sets: number[]; // Array showing who won each set (1 or 2)
  setScores: Array<{player1: number, player2: number}>; // Detailed set scores
  completed: boolean;
  season: number;
  round: number;
}

export interface Season {
  number: number;
  matches: Match[];
  currentMatchIndex: number;
  currentRound: number;
  maxRounds: number;
  cupParticipants: Player[];
  completed: boolean;
  leaguePoints: Record<string, number>; // playerId -> points
  leaguePhaseComplete?: boolean; // Track when league phase is done
}

export interface Country {
  name: string;
  flag: string;
  description: string;
  flagSvg: string; // SVG for rectangular flag
}

export interface SeasonArchive {
  season: number;
  division1FinalStandings: Player[];
  division2FinalStandings: Player[];
  cupResults: {
    winner?: Player;
    runnerUp?: Player;
    thirdPlace?: Player;
    fourthPlace?: Player;
  };
}
