import 'package:flutter/material.dart';

class LearningActivityScreen extends StatelessWidget {
  const LearningActivityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Personalized Plan')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Today\'s Activities', style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 24)),
              const SizedBox(height: 8),
              const Text('Generated based on your recent screening.'),
              const SizedBox(height: 24),
              Expanded(
                child: ListView(
                  children: [
                    _buildTaskCard(context, 'b/d Recognition', '10 mins', Icons.font_download_outlined, true),
                    _buildTaskCard(context, 'Phonics Practice', '10 mins', Icons.record_voice_over, false),
                    _buildTaskCard(context, 'Sight Word Reading', '10 mins', Icons.menu_book, false),
                    _buildTaskCard(context, 'Pronunciation', '5 mins', Icons.mic, false),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTaskCard(BuildContext context, String title, String duration, IconData icon, bool isCompleted) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isCompleted ? Colors.green.withValues(alpha: 0.2) : Theme.of(context).primaryColor.withValues(alpha: 0.1),
          child: Icon(
            isCompleted ? Icons.check : icon,
            color: isCompleted ? Colors.green : Theme.of(context).primaryColor,
          ),
        ),
        title: Text(title, style: TextStyle(decoration: isCompleted ? TextDecoration.lineThrough : null)),
        subtitle: Text(duration),
        trailing: isCompleted ? null : ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          ),
          child: const Text('Start', style: TextStyle(fontSize: 14)),
        ),
      ),
    );
  }
}
