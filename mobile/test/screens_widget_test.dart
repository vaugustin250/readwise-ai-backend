import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/child_profile.dart';
import 'package:mobile/repositories/assessment_service.dart';
import 'package:mobile/screens/login_screen.dart';
import 'package:mobile/screens/parent_dashboard_screen.dart';
import 'package:mobile/screens/reading_assessment_screen.dart';
import 'package:mobile/widgets/custom_button.dart';

void main() {
  group('Screen Widget & Resilience Tests', () {
    testWidgets('LoginScreen renders inputs and handles validation', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LoginScreen(),
        ),
      );

      // Verify header and input fields
      expect(find.text('Parent Login'), findsOneWidget);
      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.text('Sign In'), findsWidgets);
      expect(find.text('Create Account'), findsOneWidget);

      // Clear the text fields to trigger validation
      await tester.enterText(find.byType(TextFormField).first, '');
      await tester.enterText(find.byType(TextFormField).last, '');
      await tester.tap(find.widgetWithText(CustomButton, 'Login'));
      await tester.pump();

      // Check validation error messages
      expect(find.text('Enter a valid email'), findsOneWidget);
      expect(find.text('Password must be at least 6 characters'), findsOneWidget);
    });

    testWidgets('ParentDashboardScreen renders navigation and child list', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ParentDashboardScreen(),
        ),
      );

      expect(find.text('Dashboard'), findsOneWidget);
      expect(find.text('Child Profiles'), findsOneWidget);
      expect(find.byIcon(Icons.show_chart), findsOneWidget);
      expect(find.byIcon(Icons.logout), findsOneWidget);

      // Let futures resolve
      await tester.pumpAndSettle();

      // Either children profiles or empty state should be rendered
      expect(find.byType(ListView), findsOneWidget);
    });

    testWidgets('ReadingAssessmentScreen renders reading passage and assessment structure', (WidgetTester tester) async {
      final testChild = ChildProfile(
        id: '1001',
        name: 'Tara',
        age: 8,
        grade: 'Grade 3',
        language: 'English',
      );

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) {
            return MaterialPageRoute(
              settings: RouteSettings(name: '/reading_assessment', arguments: {'child': testChild}),
              builder: (ctx) => const ReadingAssessmentScreen(),
            );
          },
          initialRoute: '/reading_assessment',
        ),
      );

      await tester.pump();

      // Check that passage words are rendered
      expect(find.text('Pip'), findsOneWidget);
      expect(find.text('squirrel'), findsOneWidget);
      expect(find.text('acorns'), findsOneWidget);

      // Check that start button exists
      expect(find.textContaining('Start Reading Session'), findsOneWidget);
    });

    test('AssessmentService handles offline fallback when backend unreachable', () async {
      final service = AssessmentService();
      // Provide an invalid port or offline scenario to trigger fallback
      final result = await service.submitAssessment(
        childId: 9999,
        dwellTimeTrial: 68000.0,
        nRegressTrial: 14.0,
        speechHesitationRate: 2.4,
        cognitiveWorkingMemory: 82.0,
        phonologicalAwarenessScore: 78.0,
      );

      // Verify that offline fallback produced a valid, clinically safe result
      expect(result.childId, 9999);
      expect(result.riskProbability, greaterThan(0.0));
      expect(result.riskProbability, lessThan(1.0));
      expect(result.screeningLevel.isNotEmpty, true);
      expect(result.confidenceScore, greaterThan(0.5));
      expect(result.featureContributionsShap.isNotEmpty, true);
      expect(result.featureContributionsShap.containsKey('n_regress_trial'), true);
      expect(result.personalizedLearningPlan.isNotEmpty, true);
      expect(result.disclaimer, contains('EDUCATIONAL SCREENING ESTIMATE ONLY'));
    });
  });
}
