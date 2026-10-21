import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/main.dart';
import 'package:mobile/screens/onboarding_screen.dart';

void main() {
  testWidgets('App launches and displays OnboardingScreen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ReadWiseApp());

    // Verify that the OnboardingScreen is present.
    expect(find.byType(OnboardingScreen), findsOneWidget);
    
    // Verify that 'Welcome to ReadWise AI' text is found.
    expect(find.text('Welcome to ReadWise AI'), findsOneWidget);
  });
}
