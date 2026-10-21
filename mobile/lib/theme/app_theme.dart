import 'package:flutter/material.dart';
import '../models/reading_buddy.dart';

class AppTheme {
  // Non-generic, Child-friendly & Dyslexia-conscious Color System
  // Replaces stereotypical generic AI purple/cyan gradients with warm, high-contrast, tactile toy tones.
  static const Color creamBackground = Color(0xFFFFFDF5); // Warm glare-free canvas (dyslexia friendly)
  static const Color cardSurface = Colors.white;
  static const Color deepInk = Color(0xFF1E1B4B); // Deep Indigo Espresso (high contrast, zero vibration)
  static const Color slateText = Color(0xFF475569);
  static const Color solarGold = Color(0xFFF59E0B); // Cheerful tactile amber
  static const Color terracotta = Color(0xFFEA580C); // Warm adventure accent
  static const Color sproutMint = Color(0xFF10B981); // Calming success green
  static const Color alertCoral = Color(0xFFF43F5E); // Gentle, friendly warning

  // Default Primary and Secondary (Doraemon Azure & Golden Bell)
  static const Color primary = Color(0xFF0284C7);
  static const Color secondary = Color(0xFFF59E0B);
  static const Color shadowEdge = Color(0xFF0369A1);

  static ThemeData get lightTheme => themeFor(ReadingBuddy.defaultBuddy);

  static ThemeData themeFor(ReadingBuddy buddy) {
    return ThemeData(
      useMaterial3: true,
      primaryColor: buddy.themePrimary,
      scaffoldBackgroundColor: creamBackground,
      colorScheme: ColorScheme.light(
        primary: buddy.themePrimary,
        secondary: buddy.themeSecondary,
        surface: cardSurface,
        surfaceContainerHighest: buddy.themeSurface,
        error: alertCoral,
        onPrimary: Colors.white,
        onSecondary: deepInk,
        onSurface: deepInk,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: creamBackground,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: deepInk),
        titleTextStyle: const TextStyle(
          color: deepInk,
          fontSize: 22,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.3,
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          color: deepInk,
          letterSpacing: 0.5,
          height: 1.25,
        ),
        displayMedium: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w800,
          color: deepInk,
          letterSpacing: 0.4,
          height: 1.3,
        ),
        bodyLarge: TextStyle(
          fontSize: 18,
          color: deepInk,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.4,
          height: 1.5,
        ),
        bodyMedium: TextStyle(
          fontSize: 16,
          color: slateText,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.3,
          height: 1.5,
        ),
      ),
      cardTheme: CardThemeData(
        color: cardSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
          side: BorderSide(color: buddy.themePrimary.withValues(alpha: 0.15), width: 2),
        ),
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: buddy.themePrimary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          textStyle: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
          elevation: 0,
        ),
      ),
    );
  }
}
