// Achievement/Badge system for the reading passport
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: PassportStats) => boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface PassportStats {
  totalBooks: number;
  totalCountries: number;
  continentsVisited: string[];
  countriesPerContinent: Record<string, number>;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Book milestones
  {
    id: 'first-stamp',
    name: 'First Stamp',
    description: 'Read your first book from another country',
    icon: '📖',
    requirement: (stats) => stats.totalBooks >= 1,
    tier: 'bronze',
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Read 5 books from different countries',
    icon: '🐛',
    requirement: (stats) => stats.totalBooks >= 5,
    tier: 'bronze',
  },
  {
    id: 'avid-reader',
    name: 'Avid Reader',
    description: 'Read 10 books from around the world',
    icon: '📚',
    requirement: (stats) => stats.totalBooks >= 10,
    tier: 'silver',
  },
  {
    id: 'literary-explorer',
    name: 'Literary Explorer',
    description: 'Read 25 books from different cultures',
    icon: '🔭',
    requirement: (stats) => stats.totalBooks >= 25,
    tier: 'gold',
  },
  {
    id: 'world-reader',
    name: 'World Reader',
    description: 'Read 50 books from around the globe',
    icon: '🌟',
    requirement: (stats) => stats.totalBooks >= 50,
    tier: 'platinum',
  },

  // Country milestones
  {
    id: 'wanderer',
    name: 'Wanderer',
    description: 'Read books from 5 different countries',
    icon: '🧭',
    requirement: (stats) => stats.totalCountries >= 5,
    tier: 'bronze',
  },
  {
    id: 'globetrotter',
    name: 'Globetrotter',
    description: 'Read books from 10 different countries',
    icon: '✈️',
    requirement: (stats) => stats.totalCountries >= 10,
    tier: 'silver',
  },
  {
    id: 'world-traveler',
    name: 'World Traveler',
    description: 'Read books from 25 different countries',
    icon: '🌍',
    requirement: (stats) => stats.totalCountries >= 25,
    tier: 'gold',
  },
  {
    id: 'citizen-of-world',
    name: 'Citizen of the World',
    description: 'Read books from 50 different countries',
    icon: '👑',
    requirement: (stats) => stats.totalCountries >= 50,
    tier: 'platinum',
  },

  // Continent achievements
  {
    id: 'continental-curious',
    name: 'Continental Curious',
    description: 'Read books from 2 different continents',
    icon: '🗺️',
    requirement: (stats) => stats.continentsVisited.length >= 2,
    tier: 'bronze',
  },
  {
    id: 'continental-explorer',
    name: 'Continental Explorer',
    description: 'Read books from 4 different continents',
    icon: '🧳',
    requirement: (stats) => stats.continentsVisited.length >= 4,
    tier: 'silver',
  },
  {
    id: 'continental-master',
    name: 'Continental Master',
    description: 'Read books from all 6 inhabited continents',
    icon: '🏆',
    requirement: (stats) => stats.continentsVisited.length >= 6,
    tier: 'gold',
  },

  // Special achievements
  {
    id: 'african-safari',
    name: 'African Safari',
    description: 'Read books from 5 African countries',
    icon: '🦁',
    requirement: (stats) => (stats.countriesPerContinent['Africa'] || 0) >= 5,
    tier: 'silver',
  },
  {
    id: 'asian-odyssey',
    name: 'Asian Odyssey',
    description: 'Read books from 5 Asian countries',
    icon: '🐉',
    requirement: (stats) => (stats.countriesPerContinent['Asia'] || 0) >= 5,
    tier: 'silver',
  },
  {
    id: 'european-tour',
    name: 'European Tour',
    description: 'Read books from 5 European countries',
    icon: '🏛️',
    requirement: (stats) => (stats.countriesPerContinent['Europe'] || 0) >= 5,
    tier: 'silver',
  },
  {
    id: 'americas-adventure',
    name: 'Americas Adventure',
    description: 'Read books from 5 countries in the Americas',
    icon: '🌎',
    requirement: (stats) => 
      ((stats.countriesPerContinent['North America'] || 0) + 
       (stats.countriesPerContinent['South America'] || 0)) >= 5,
    tier: 'silver',
  },
  {
    id: 'pacific-voyager',
    name: 'Pacific Voyager',
    description: 'Read books from 3 Oceanian countries',
    icon: '🏄',
    requirement: (stats) => (stats.countriesPerContinent['Oceania'] || 0) >= 3,
    tier: 'silver',
  },
];

export function getUnlockedAchievements(stats: PassportStats): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.requirement(stats));
}

export function getNextAchievements(stats: PassportStats): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => !achievement.requirement(stats)).slice(0, 3);
}

export const TIER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  bronze: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-700' },
  silver: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-600' },
  gold: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700' },
  platinum: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700' },
};
