
import { Player } from "@/types/squash";
import { getRandomCountry } from "./countries";

const FIRST_NAMES = [
  "Alex", "Jamie", "Taylor", "Jordan", "Casey", "Riley", "Morgan", "Avery",
  "Blake", "Cameron", "Drew", "Emery", "Finley", "Harper", "Hayden", "Kennedy",
  "Logan", "Peyton", "Quinn", "Reese", "River", "Sage", "Skylar", "Phoenix",
  "Rowan", "Elliott", "Dakota", "Marlowe", "Indigo", "Kai", "Nova", "Atlas"
];

const LAST_NAMES = [
  "Anderson", "Thompson", "Martinez", "Wilson", "Garcia", "Johnson", "Brown",
  "Davis", "Miller", "Rodriguez", "Lee", "Clark", "Lewis", "Walker", "Hall",
  "Allen", "Young", "King", "Wright", "Lopez", "Scott", "Green", "Adams",
  "Baker", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner",
  "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart"
];

export const generatePlayer = (division: 1 | 2 = 2): Player => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const country = getRandomCountry();
  const rating = Math.floor(Math.random() * 31) + 20; // 20-50
  
  return {
    id: crypto.randomUUID(),
    name: `${firstName} ${lastName}`,
    age: Math.floor(Math.random() * 6) + 18, // 18-23
    rating,
    developmentRate: Math.random() * 0.8 + 0.2, // 0.2-1.0
    careerLength: Math.floor(Math.random() * 3) + 8, // 8-10
    seasonsPlayed: 0,
    nationality: country.name,
    division,
    
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    setsWon: 0,
    setsLost: 0,
    pointsScored: 0,
    championshipsWon: 0,
    podiums: 0,
    cupsWon: 0,
    cupPodiums: 0,
    careerHighRating: rating,
    
    seasonHistory: [],
    headToHead: {},
    
    isRetired: false,
    isDeclined: false
  };
};

export const generateInitialPlayers = (): Player[] => {
  const players: Player[] = [];
  
  // Generate 5 players for Division 1 (slightly higher ratings)
  for (let i = 0; i < 5; i++) {
    const player = generatePlayer(1);
    player.rating = Math.floor(Math.random() * 31) + 45; // 45-75 for Div 1
    player.careerHighRating = player.rating;
    players.push(player);
  }
  
  // Generate 5 players for Division 2
  for (let i = 0; i < 5; i++) {
    players.push(generatePlayer(2));
  }
  
  return players;
};
