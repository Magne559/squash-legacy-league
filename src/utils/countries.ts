
import { Country } from "@/types/squash";

export const COUNTRIES: Country[] = [
  {
    name: "Solvia",
    flag: "🟢",
    description: "Small European squash nation, very technical players"
  },
  {
    name: "Jandora",
    flag: "🟡",
    description: "Desert kingdom with rich squash funding"
  },
  {
    name: "Tarkeen Republic",
    flag: "🔴",
    description: "Former eastern bloc, gritty power-based style"
  },
  {
    name: "Velkor",
    flag: "⚫",
    description: "Cold, mountainous island known for disciplined players"
  },
  {
    name: "Lunvaria",
    flag: "🟠",
    description: "South American-inspired flair country"
  },
  {
    name: "Noraka",
    flag: "🔵",
    description: "East Asian precision-focused squash culture"
  },
  {
    name: "Ravalon",
    flag: "🟣",
    description: "Tropical archipelago with few stars but unpredictable talent"
  },
  {
    name: "Zhunai",
    flag: "🟤",
    description: "Central Asian dark-horse nation with 1-2 legends"
  },
  {
    name: "Koryndor",
    flag: "⚪",
    description: "Tech-heavy metropolitan superstate"
  },
  {
    name: "Quenada",
    flag: "🟨",
    description: "Cricket/squash hybrid culture"
  },
  {
    name: "Ersan",
    flag: "🟦",
    description: "Baltic underdog with loyal fans and hard court dominance"
  }
];

export const getRandomCountry = (): Country => {
  return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
};
