import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/parent_dashboard_screen.dart';
import 'screens/add_child_screen.dart';
import 'screens/assessment_selection_screen.dart';
import 'screens/reading_assessment_screen.dart';
import 'screens/cognitive_game_screen.dart';
import 'screens/results_screen.dart';
import 'screens/learning_activity_screen.dart';
import 'screens/progress_dashboard_screen.dart';
import 'services/keep_alive_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Start background keep-alive to keep free Render instance active
  KeepAliveService().start();
  runApp(const ReadWiseApp());
}

class ReadWiseApp extends StatelessWidget {
  const ReadWiseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReadWise AI',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const OnboardingScreen(),
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const ParentDashboardScreen(),
        '/add_child': (context) => const AddChildScreen(),
        '/assessment_selection': (context) => const AssessmentSelectionScreen(),
        '/reading_assessment': (context) => const ReadingAssessmentScreen(),
        '/cognitive_game': (context) => const CognitiveGameScreen(),
        '/results': (context) => const ResultsScreen(),
        '/learning_activity': (context) => const LearningActivityScreen(),
        '/progress': (context) => const ProgressDashboardScreen(),
      },
    );
  }
}
