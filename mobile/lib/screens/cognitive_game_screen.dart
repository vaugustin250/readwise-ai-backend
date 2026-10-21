import 'package:flutter/material.dart';
import '../models/child_profile.dart';
import '../services/cognitive_score_service.dart';
import '../services/buddy_service.dart';
import '../widgets/clay_3d_button.dart';
import '../widgets/buddy_mascot_bubble.dart';

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
      'type': 'visual',
      'hint': 'Watch the belly direction! "b" stands tall and faces right!',
    },
    {
      'title': 'Rhyme & Phonological Match',
      'instruction': 'Which word rhymes with:',
      'prompt': 'CAT',
      'options': ['BAT', 'DOG', 'PEN', 'CUP'],
      'correct': 'BAT',
      'type': 'phonological',
      'hint': 'Listen for the ending "-AT" sound! CAT... ?',
    },
    {
      'title': 'Letter Orientation',
      'instruction': 'Find the correctly oriented letter:',
      'prompt': 'p',
      'options': ['q', 'b', 'd', 'p'],
      'correct': 'p',
      'type': 'visual',
      'hint': 'The tail hangs down on the left, loop on the top right!',
    },
    {
      'title': 'Phoneme Blending',
      'instruction': 'Blend the sounds together:',
      'prompt': '/s/ + /u/ + /n/',
      'options': ['SUN', 'RUN', 'FUN', 'SONG'],
      'correct': 'SUN',
      'type': 'phonological',
      'hint': 'Slide the sounds smoothly together: sss-uuu-nnn!',
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
          isCorrect ? '⭐ Awesome hit! (${latency}ms)' : 'Keep going! Every practice powers your brain!',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: isCorrect ? const Color(0xFF059669) : const Color(0xFFEA580C),
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
    final activeBuddy = BuddyService().currentBuddy;

    if (_gameCompleted) {
      final childId = child?.id ?? '1';
      final wm = CognitiveScoreService().getWorkingMemory(childId);
      final ph = CognitiveScoreService().getPhonologicalAwareness(childId);

      return Scaffold(
        backgroundColor: const Color(0xFFFFFDF5),
        appBar: AppBar(title: const Text('Quest Completed! 🏆')),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 3D Celebratory Badge with chosen Hero
                Center(
                  child: Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      color: activeBuddy.themeSurface,
                      shape: BoxShape.circle,
                      border: Border.all(color: activeBuddy.themePrimary, width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: activeBuddy.themeShadow.withValues(alpha: 0.35),
                          offset: const Offset(0, 8),
                          blurRadius: 16,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        activeBuddy.emoji,
                        style: const TextStyle(fontSize: 48),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Super Reader Level Up!',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  '${child?.name ?? "Hero"} scored $_correctAnswers/${_rounds.length} challenges with ${activeBuddy.name}!',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey.shade700,
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),

                // 3D Tactile Metric Tiles
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: activeBuddy.themePrimary.withValues(alpha: 0.25), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: activeBuddy.themeShadow.withValues(alpha: 0.12),
                        offset: const Offset(0, 6),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          Text(
                            'Working Memory',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: activeBuddy.textColor,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '$wm',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              color: activeBuddy.themePrimary,
                            ),
                          ),
                          Text(
                            'pts',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Container(width: 2, height: 50, color: const Color(0xFFE2E8F0)),
                      Column(
                        children: [
                          Text(
                            'Phonology Power',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: activeBuddy.textColor,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '$ph',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              color: activeBuddy.themeSecondary,
                            ),
                          ),
                          Text(
                            'pts',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 36),

                Clay3DButton(
                  text: 'Return to Adventure Hub 🚀',
                  isExpanded: true,
                  color: activeBuddy.themePrimary,
                  shadowColor: activeBuddy.themeShadow,
                  depth: 6.0,
                  fontSize: 17.0,
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final roundData = _rounds[_currentRound];

    return Scaffold(
      backgroundColor: const Color(0xFFFFFDF5),
      appBar: AppBar(
        title: Text('Arcade Drill (${_currentRound + 1}/${_rounds.length})'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: activeBuddy.themeSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: activeBuddy.themePrimary, width: 1.5),
                ),
                child: Text(
                  '⭐ $_correctAnswers Points',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                    color: activeBuddy.textColor,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Mascot Hint Bubble
              BuddyMascotBubble(
                message: '${activeBuddy.name}: "${roundData['hint']}"',
                onBuddyTap: () async {
                  await Navigator.pushNamed(context, '/buddy_select');
                  if (mounted) setState(() {});
                },
              ),
              const SizedBox(height: 16),

              Text(
                roundData['title'].toUpperCase(),
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.0,
                  color: activeBuddy.themePrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                roundData['instruction'],
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1E1B4B),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),

              // 3D Giant Prompt Crucible Card
              Container(
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(26),
                  border: Border.all(color: activeBuddy.themePrimary.withValues(alpha: 0.35), width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: activeBuddy.themeShadow.withValues(alpha: 0.18),
                      offset: const Offset(0, 8),
                      blurRadius: 16,
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    roundData['prompt'],
                    style: TextStyle(
                      fontSize: 56,
                      fontWeight: FontWeight.w900,
                      color: activeBuddy.themePrimary,
                      letterSpacing: 3.0,
                    ),
                  ),
                ),
              ),

              const Spacer(),

              // 3D Tactile Push-Down Answer Blocks
              Wrap(
                spacing: 16,
                runSpacing: 18,
                alignment: WrapAlignment.center,
                children: (roundData['options'] as List<String>).map((opt) {
                  return SizedBox(
                    width: 140,
                    height: 72,
                    child: Clay3DButton(
                      text: opt,
                      fontSize: 26,
                      color: Colors.white,
                      shadowColor: activeBuddy.themeShadow.withValues(alpha: 0.7),
                      textColor: activeBuddy.textColor,
                      depth: 5.5,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      onPressed: () => _handleOptionSelected(opt, child),
                    ),
                  );
                }).toList(),
              ),

              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
