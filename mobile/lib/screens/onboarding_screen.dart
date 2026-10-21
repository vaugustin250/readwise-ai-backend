import 'package:flutter/material.dart';
import '../widgets/custom_button.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Placeholder for an illustration
              Container(
                height: 200,
                width: 200,
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.auto_stories_rounded,
                  size: 100,
                  color: Theme.of(context).primaryColor,
                ),
              ),
              const SizedBox(height: 40),
              Text(
                'Welcome to ReadWise AI',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 28),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'Early screening and personalized reading support for children, powered by explainable AI.',
                style: Theme.of(context).textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              CustomButton(
                text: 'Get Started',
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/login');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
