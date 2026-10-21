import { ReadingBuddy } from '../types';

export const ALL_BUDDIES: ReadingBuddy[] = [
  {
    id: 'doraemon',
    name: 'Doraemon',
    series: 'Future Gadget Cat',
    tagline: 'Take-copter ready! Let’s read!',
    badge: 'Gadget Guide',
    emoji: '🐱🔔',
    superpower: 'Uses the Memory Bread & Word Flashlight to guide reading forward!',
    themePrimary: '#0284C7', // Celestial Azure
    themeSecondary: '#FBBF24', // Golden Bell Yellow
    themeShadow: '#0369A1', // Deep Ocean Shadow
    themeSurface: '#E0F2FE', // Sky Breeze
    textColor: '#0C4A6E',
    cheerQuote: 'Boku Doraemon! Every word you read makes our Take-copter fly higher!',
  },
  {
    id: 'ben10',
    name: 'Ben 10',
    series: 'Omnitrix Hero',
    tagline: 'It’s Hero Time! Power up!',
    badge: 'Speed Blaster',
    emoji: '⌚⚡',
    superpower: 'Omnitrix speed boost powers up fast reading and working memory!',
    themePrimary: '#059669', // Bio-Neon Emerald
    themeSecondary: '#A3E635', // Electric Lime
    themeShadow: '#064E3B', // Dark Galvan Forest
    themeSurface: '#D1FAE5', // Omnitrix Glow
    textColor: '#064E3B',
    cheerQuote: 'Hero Time activated! We will smash those tricky letters into dust!',
  },
  {
    id: 'ninja_hattori',
    name: 'Ninja Hattori',
    series: 'Iga Ninja Clan',
    tagline: 'Ding Ding! Ninja precision!',
    badge: 'Shadow Slicer',
    emoji: '🥷⭐',
    superpower: 'Throws ninja shurikens to slice apart mirror letters b and d!',
    themePrimary: '#312E81', // Midnight Ninja Indigo
    themeSecondary: '#F59E0B', // Golden Shuriken
    themeShadow: '#1E1B4B', // Deep Shadow Ink
    themeSurface: '#EEF2FF', // Ninja Mist
    textColor: '#1E1B4B',
    cheerQuote: 'Ding Ding! Focus your ninja gaze! Read forward with great balance!',
  },
  {
    id: 'shinchan',
    name: 'Shinchan',
    series: 'Action Kamen Fan',
    tagline: 'Buri Buri! High energy reader!',
    badge: 'Rhyme Master',
    emoji: '🎒🐶',
    superpower: 'Action Kamen punch beats long pauses and hesitations!',
    themePrimary: '#F43F5E', // Action Kamen Scarlet
    themeSecondary: '#F59E0B', // Kasukabe Gold
    themeShadow: '#9F1239', // Crimson Depth
    themeSurface: '#FFE4E6', // Cheerful Rose
    textColor: '#881337',
    cheerQuote: 'Wahaha! Action Kamen says your reading sounds super cool today!',
  },
  {
    id: 'dora_explorer',
    name: 'Dora Explorer',
    series: 'Adventure Map',
    tagline: 'Vámonos! Let’s explore words!',
    badge: 'Trailblazer',
    emoji: '🎒🗺️',
    superpower: 'Backpack provides helpful phonics clues when words get tricky!',
    themePrimary: '#EA580C', // Aztec Terracotta
    themeSecondary: '#0D9488', // Rainforest Teal
    themeShadow: '#9A3412', // Deep Earth
    themeSurface: '#FFEDD5', // Sunny Trail
    textColor: '#7C2D12',
    cheerQuote: 'We did it! Jump in boots, you are becoming a great reader!',
  },
  {
    id: 'bheem',
    name: 'Chhota Bheem',
    series: 'Dholakpur Champ',
    tagline: 'Laddu power reading strength!',
    badge: 'Mighty Champ',
    emoji: '🦁🍯',
    superpower: 'Mighty strength helps overcome tricky multisyllabic words with ease!',
    themePrimary: '#D97706', // Maharaja Saffron
    themeSecondary: '#F59E0B', // Golden Laddu
    themeShadow: '#92400E', // Bronze Clay
    themeSurface: '#FEF3C7', // Warm Honey
    textColor: '#78350F',
    cheerQuote: 'One warm laddu for every passage read! Keep reading strong!',
  },
];

export const DEFAULT_BUDDY = ALL_BUDDIES[0];

export function getBuddyById(id: string): ReadingBuddy {
  return ALL_BUDDIES.find((b) => b.id === id) || DEFAULT_BUDDY;
}
