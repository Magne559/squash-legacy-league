
import { Country } from "@/types/squash";

export const COUNTRIES: Country[] = [
  {
    name: "Norvalla",
    flag: "🔵",
    description: "Northern maritime nation known for technical precision",
    flagSvg: "linear-gradient(to bottom, #1e3a8a 0%, #1e3a8a 50%, #e5e7eb 50%, #e5e7eb 100%)"
  },
  {
    name: "Baltovia", 
    flag: "🔴",
    description: "Eastern European republic with powerful baseline players",
    flagSvg: "linear-gradient(45deg, #dc2626 0%, #dc2626 100%)"
  },
  {
    name: "Jamora",
    flag: "🟢",
    description: "Tropical island federation with agile, creative players",
    flagSvg: "linear-gradient(to bottom, #16a34a 0%, #16a34a 100%)"
  },
  {
    name: "Estora",
    flag: "🟣", 
    description: "Mountain kingdom producing disciplined, strategic players",
    flagSvg: "linear-gradient(to bottom, #7c3aed 0%, #ffffff 33%, #7c3aed 66%, #7c3aed 100%)"
  },
  {
    name: "Luxoria",
    flag: "🟡",
    description: "Wealthy city-state with well-funded training programs",
    flagSvg: "linear-gradient(to bottom, #000000 0%, #fbbf24 20%, #fbbf24 80%, #000000 100%)"
  },
  {
    name: "Kavalin",
    flag: "🟠",
    description: "Desert nation known for endurance and mental toughness",
    flagSvg: "linear-gradient(to bottom, #0891b2 0%, #0891b2 100%)"
  },
  {
    name: "Tursenia", 
    flag: "⚪",
    description: "Island archipelago with unpredictable playing styles",
    flagSvg: "linear-gradient(to right, #3b82f6 0%, #3b82f6 50%, #ffffff 50%, #ffffff 100%)"
  },
  {
    name: "Virelia",
    flag: "🟤",
    description: "Central plains confederation with gritty, determined players",
    flagSvg: "linear-gradient(to bottom, #7f1d1d 0%, #7f1d1d 100%)"
  },
  {
    name: "Udran",
    flag: "⚫",
    description: "Mountainous republic producing defensive specialists",
    flagSvg: "linear-gradient(to bottom, #166534 0%, #e5e7eb 20%, #e5e7eb 80%, #dc2626 100%)"
  },
  {
    name: "Mequaria",
    flag: "🟨",
    description: "Southern peninsula known for explosive shot-making",
    flagSvg: "linear-gradient(to bottom, #eab308 0%, #eab308 100%)"
  },
  {
    name: "Darnoth",
    flag: "⚫",
    description: "Northern tundra state with ice-cold mental composure",
    flagSvg: "linear-gradient(to bottom, #374151 0%, #06b6d4 50%, #374151 100%)"
  }
];

export const getRandomCountry = (): Country => {
  return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
};
