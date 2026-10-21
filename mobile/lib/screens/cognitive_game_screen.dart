import 'package:flutter/material.dart';
import '../models/child_profile.dart';
import '../services/cognitive_score_service.dart';
import '../widgets/custom_button.dart';

class CognitiveGameScreen extends StatefulWidget {
  const CognitiveGameScreen({super.key});

  @override
  State<CognitiveGameScreen> createState() => _CognitiveGameScreenState();
}

class _CognitiveGameScreenState extends State<CognitiveGameScreen> {
  int _currentRound = 0;
  final Stopwatch _roundStopwatch = Stopwatch();
  final List<int> _latenciesMs = [];
  int _correctAnswers = 0;
  bool _gameCompleted = false;

  final List<Map<String, dynamic>> _rounds = [
    {
      'title': 'Letter Discrimination',
      'instruction': 'Tap the letter that matches the prompt:',
      'prompt': 'b',
      'options': ['d', 'p', 'b', 'q'],
      'correct': 'b',
      'type': 'visual'
    },
    {
      'title': 'Rhyme & Phonological Match',
      'instruction': 'Which word rhymes with:',
      'prompt': 'CAT',
      'options': ['BAT', 'DOG', 'PEN', 'CUP'],
      'correct': 'BAT',
      'type': 'phonological'
    },
    {
      'title': 'Letter Orientation',
      'instruction': 'Find the correctly oriented letter:',
      'prompt': 'p',
      'options': ['q', 'b', 'd', 'p'],
      'correct': 'p',
      'type': 'visual'
    },
    {
      'title': 'Phoneme Blending',
      'instruction': 'Blend the sounds together: /s/ /u/ /n/',
      'prompt': '/s/ + /u/ + /n/',
      'options': ['SUN', 'RUN', 'FUN', 'SONG'],
      'correct': 'SUN',
      'type': 'phonological'
    },
  ];

  @override
  void initState() {
    super.initState();
    _roundStopwatch.start();
  }

  void _handleOptionSelected(String selectedOption, ChildProfile? child) {
    _roundStopwatch.stop();
    final latency = _roundStopwatch.elapsedMilliseconds;
    _latenciesMs.add(latency);

    final isCorrect = selectedOption == _rounds[_currentRound]['correct'];
    if (isCorrect) _correctAnswers++;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isCorrect ? 'Correct! (${latency}ms)' : 'Keep going! Try the next one.',
        ),
        backgroundColor: isCorrect ? Colors.green : Colors.orange,
        duration: const Duration(milliseconds: 700),
      ),
    );

    if (_currentRound + 1 < _rounds.length) {
      setState(() {
        _currentRound++;
      });
      _roundStopwatch.reset();
      _roundStopwatch.start();
    } else {
      _finishGame(child);
    }
  }

  void _finishGame(ChildProfile? child) {
    // Calculate empirical working memory & phonological awareness metrics
    final totalRounds = _rounds.length;
    final accuracy = _correctAnswers / totalRounds;
    final avgLatency = _latenciesMs.isNotEmpty
        ? _latenciesMs.reduce((a, b) => a + b) / _latenciesMs.length
        : 2000.0;

    // Latency factor: faster response with high accuracy increases working memory score
    final speedBonus = ((3500.0 - avgLatency) / 3500.0 * 20.0).clamp(-15.0, 15.0);
    final workingMemoryScore = (accuracy * 80.0 + speedBonus + 10.0).clamp(35.0, 98.0);
    final phonologicalScore = (accuracy * 85.0 + 10.0).clamp(30.0, 96.0);

    final childId = child?.id ?? '1';
    CognitiveScoreService().recordScores(
      childId,
      workingMemory: double.parse(workingMemoryScore.toStringAsFixed(1)),
      phonologicalAwareness: double.parse(phonologicalScore.toStringAsFixed(1)),
    );

    setState(() {
      _gameCompleted = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final ChildProfile? child = ModalRoute.of(context)?.settings.arguments as ChildProfile?;

    if (_gameCompleted) {
      final childId = child?.id ?? '1';
      final wm = CognitiveScoreService().getWorkingMemory(childId);
      final ph = CognitiveScoreService().getPhonologicalAwareness(childId);

      return Scaffold(
        appBar: AppBar(title: const Text('Game Completed')),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.stars_rounded, size: 80, color: Colors.amber),
                const SizedBox(height: 16),
                Text(
                  'Great Effort, ${child?.name ?? "Friend"}!',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 24),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  'Completed $_correctAnswers/${_rounds.length} challenges. Your metrics have been calibrated for your next reading assessment.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[700]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.indigo.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.indigo.shade200),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('Working Memory', style: TextStyle(fontSize: 12, color: Colors.indigo)),
                          const SizedBox(height: 6),
                          Text('$wm / 100', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.indigo)),
                        ],
                      ),
                      Container(width: 1, height: 40, color: Colors.indigo.shade200),
                      Column(
                        children: [
                          const Text('Phonological Score', style: TextStyle(fontSize: 12, color: Colors.indigo)),
                          const SizedBox(height: 6),
                          Text('$ph / 100', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.indigo)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                CustomButton(
                  text: 'Return to Activity Hub',
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
          ),
        ),
      );
    }

    final roundData = _rounds[_currentRound];

    return Scaffold(
      appBar: AppBar(
        title: Text('Cognitive Game (${_currentRound + 1}/${_rounds.length})'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                roundData['title'],
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                roundData['instruction'],
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.indigo.shade50,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Center(
                  child: Text(
                    roundData['prompt'],
                    style: TextStyle(
                      fontSize: 64,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 48),
              Wrap(
                spacing: 16,
                runSpacing: 16,
                alignment: WrapAlignment.center,
                children: (roundData['options'] as List<String>).map((opt) {
                  return SizedBox(
                    width: 130,
                    height: 70,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        backgroundColor: Colors.white,
                        foregroundColor: Theme.of(context).primaryColor,
                        side: BorderSide(color: Theme.of(context).primaryColor, width: 2),
                        elevation: 2,
                      ),
                      onPressed: () => _handleOptionSelected(opt, child),
                      child: Text(
                        opt,
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
