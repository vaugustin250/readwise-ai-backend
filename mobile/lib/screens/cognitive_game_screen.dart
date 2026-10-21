import 'package:flutter/material.dart';

class CognitiveGameScreen extends StatelessWidget {
  const CognitiveGameScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cognitive Games')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Which letter is shown?',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            Text(
              'b',
              style: TextStyle(fontSize: 120, fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor),
            ),
            const SizedBox(height: 60),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildOption(context, 'd'),
                _buildOption(context, 'p'),
                _buildOption(context, 'b', isCorrect: true),
                _buildOption(context, 'q'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOption(BuildContext context, String letter, {bool isCorrect = false}) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(isCorrect ? 'Correct!' : 'Try again!'),
          backgroundColor: isCorrect ? Colors.green : Colors.red,
          duration: const Duration(seconds: 1),
        ));
        if (isCorrect) {
           Future.delayed(const Duration(seconds: 1), () {
             if (context.mounted) Navigator.pop(context); // Go back after success
           });
        }
      },
      child: Container(
        width: 70,
        height: 70,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).primaryColor, width: 2),
        ),
        alignment: Alignment.center,
        child: Text(
          letter,
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor),
        ),
      ),
    );
  }
}
