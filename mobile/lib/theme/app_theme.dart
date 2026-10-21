import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF6C63FF); // Soft Purple
  static const Color secondary = Color(0xFF3F3D56); // Dark Gray
  static const Color background = Color(0xFFF4F6FA); // Light Blue-ish Gray
  static const Color accent = Color(0xFFFF6584); // Soft Pink/Red
  static const Color success = Color(0xFF4CAF50); // Green
  static const Color warning = Color(0xFFFFC107); // Yellow

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: primary,
      scaffoldBackgroundColor: background,
      fontFamily: 'Nunito', // A child-friendly, professional font
      colorScheme: ColorScheme.light(
        primary: primary,
        secondary: secondary,
        error: accent,
        surface: background,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: secondary),
        titleTextStyle: TextStyle(
          color: secondary,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: secondary),
        bodyLarge: TextStyle(fontSize: 18, color: secondary),
        bodyMedium: TextStyle(fontSize: 16, color: Colors.black87),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      cardTheme: CardThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        elevation: 4,
        shadowColor: Colors.black12,
      ),
    );
  }
}
