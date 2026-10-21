import 'package:flutter/material.dart';

class ReadingBuddy {
  final String id;
  final String name;
  final String series;
  final String tagline;
  final String badge;
  final String emoji;
  final String superpower;
  final Color themePrimary;
  final Color themeSecondary;
  final Color themeShadow;
  final Color themeSurface;
  final Color textColor;
  final String cheerQuote;

  const ReadingBuddy({
    required this.id,
    required this.name,
    required this.series,
    required this.tagline,
    required this.badge,
    required this.emoji,
    required this.superpower,
    required this.themePrimary,
    required this.themeSecondary,
    required this.themeShadow,
    required this.themeSurface,
    required this.textColor,
    required this.cheerQuote,
  });

  static const List<ReadingBuddy> allBuddies = [
    ReadingBuddy(
      id: 'doraemon',
      name: 'Doraemon',
      series: 'Future Gadget Cat',
      tagline: 'Take-copter ready! Let’s read!',
      badge: 'Gadget Guide',
      emoji: '🐱🔔',
      superpower: 'Uses the Memory Bread & Word Flashlight to guide reading forward!',
      themePrimary: Color(0xFF0284C7), // Celestial Azure
      themeSecondary: Color(0xFFFBBF24), // Golden Bell Yellow
      themeShadow: Color(0xFF0369A1), // Deep Ocean Shadow
      themeSurface: Color(0xFFE0F2FE), // Sky Breeze
      textColor: Color(0xFF0C4A6E),
      cheerQuote: 'Boku Doraemon! Every word you read makes our Take-copter fly higher!',
    ),
    ReadingBuddy(
      id: 'ben10',
      name: 'Ben 10',
      series: 'Omnitrix Hero',
      tagline: 'It’s Hero Time! Power up!',
      badge: 'Speed Blaster',
      emoji: '⌚⚡',
      superpower: 'Omnitrix speed boost powers up fast reading and working memory!',
      themePrimary: Color(0xFF059669), // Bio-Neon Emerald
      themeSecondary: Color(0xFFA3E635), // Electric Lime
      themeShadow: Color(0xFF064E3B), // Dark Galvan Forest
      themeSurface: Color(0xFFD1FAE5), // Omnitrix Glow
      textColor: Color(0xFF064E3B),
      cheerQuote: 'Hero Time activated! We will smash those tricky letters into dust!',
    ),
    ReadingBuddy(
      id: 'ninja_hattori',
      name: 'Ninja Hattori',
      series: 'Iga Ninja Clan',
      tagline: 'Ding Ding! Ninja precision!',
      badge: 'Shadow Slicer',
      emoji: '🥷⭐',
      superpower: 'Throws ninja shurikens to slice apart mirror letters b and d!',
      themePrimary: Color(0xFF312E81), // Midnight Ninja Indigo
      themeSecondary: Color(0xFFF59E0B), // Golden Shuriken
      themeShadow: Color(0xFF1E1B4B), // Deep Shadow Ink
      themeSurface: Color(0xFFEEF2FF), // Ninja Mist
      textColor: Color(0xFF1E1B4B),
      cheerQuote: 'Ding Ding! Focus your ninja gaze! Read forward with great balance!',
    ),
    ReadingBuddy(
      id: 'shinchan',
      name: 'Shinchan',
      series: 'Action Kamen Fan',
      tagline: 'Buri Buri! High energy reader!',
      badge: 'Rhyme Master',
      emoji: '🎒🐶',
      superpower: 'Action Kamen punch beats long pauses and hesitations!',
      themePrimary: Color(0xFFF43F5E), // Action Kamen Scarlet
      themeSecondary: Color(0xFFF59E0B), // Kasukabe Gold
      themeShadow: Color(0xFF9F1239), // Crimson Depth
      themeSurface: Color(0xFFFFE4E6), // Cheerful Rose
      textColor: Color(0xFF881337),
      cheerQuote: 'Wahaha! Action Kamen says your reading sounds super cool today!',
    ),
    ReadingBuddy(
      id: 'dora_explorer',
      name: 'Dora Explorer',
      series: 'Adventure Map',
      tagline: 'Vámonos! Let’s explore words!',
      badge: 'Trailblazer',
      emoji: '🎒🗺️',
      superpower: 'Backpack provides helpful phonics clues when words get tricky!',
      themePrimary: Color(0xFFEA580C), // Aztec Terracotta
      themeSecondary: Color(0xFF0D9488), // Rainforest Teal
      themeShadow: Color(0xFF9A3412), // Deep Earth
      themeSurface: Color(0xFFFFEDD5), // Sunny Trail
      textColor: Color(0xFF7C2D12),
      cheerQuote: 'We did it! Jump in boots, you are becoming a great reader!',
    ),
    ReadingBuddy(
      id: 'bheem',
      name: 'Chhota Bheem',
      series: 'Dholakpur Champ',
      tagline: 'Laddu power reading strength!',
      badge: 'Mighty Champ',
      emoji: '🦁🍯',
      superpower: 'Mighty strength helps overcome tricky multisyllabic words with ease!',
      themePrimary: Color(0xFFD97706), // Maharaja Saffron
      themeSecondary: Color(0xFFF59E0B), // Golden Laddu
      themeShadow: Color(0xFF92400E), // Bronze Clay
      themeSurface: Color(0xFFFEF3C7), // Warm Honey
      textColor: Color(0xFF78350F),
      cheerQuote: 'One warm laddu for every passage read! Keep reading strong!',
    ),
  ];

  static ReadingBuddy get defaultBuddy => allBuddies.first;

  static ReadingBuddy getById(String id) {
    return allBuddies.firstWhere((b) => b.id == id, orElse: () => defaultBuddy);
  }
}
