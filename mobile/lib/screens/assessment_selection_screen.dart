import 'package:flutter/material.dart';
import '../models/child_profile.dart';

class AssessmentSelectionScreen extends StatelessWidget {
  const AssessmentSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ChildProfile child = ModalRoute.of(context)!.settings.arguments as ChildProfile;

    return Scaffold(
      appBar: AppBar(title: Text('${child.name}\'s Hub')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Available Activities', style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 22)),
              const SizedBox(height: 24),
              _buildActivityCard(
                context,
                child: child,
                title: 'Start Screening',
                subtitle: 'Reading and speech assessment',
                icon: Icons.mic_rounded,
                color: Theme.of(context).primaryColor,
                route: '/reading_assessment',
              ),
              const SizedBox(height: 16),
              _buildActivityCard(
                context,
                child: child,
                title: 'Cognitive Games',
                subtitle: 'Fun memory & letter games',
                icon: Icons.games_rounded,
                color: Theme.of(context).colorScheme.error,
                route: '/cognitive_game',
              ),
              const SizedBox(height: 16),
              _buildActivityCard(
                context,
                child: child,
                title: 'Learning Plan',
                subtitle: 'Personalized activities',
                icon: Icons.menu_book_rounded,
                color: Colors.green,
                route: '/learning_activity',
              ),
              const SizedBox(height: 16),
              _buildActivityCard(
                context,
                child: child,
                title: 'Progress History',
                subtitle: 'Track assessment trajectory and reading speed',
                icon: Icons.analytics_rounded,
                color: Colors.orange,
                route: '/progress',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActivityCard(
    BuildContext context, {
    required ChildProfile child,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.pushNamed(context, route, arguments: child);
        },
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios_rounded, color: Colors.grey, size: 16),
            ],
          ),
        ),
      ),
    );
  }
}
