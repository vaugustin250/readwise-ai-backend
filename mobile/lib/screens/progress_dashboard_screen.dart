import 'package:flutter/material.dart';
import '../repositories/profile_repository.dart';

class ProgressDashboardScreen extends StatefulWidget {
  const ProgressDashboardScreen({super.key});

  @override
  State<ProgressDashboardScreen> createState() => _ProgressDashboardScreenState();
}

class _ProgressDashboardScreenState extends State<ProgressDashboardScreen> {
  late Future<List<Map<String, dynamic>>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _historyFuture = ProfileRepository().getProgressHistory('1');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Longitudinal Progress')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Child Recovery Trajectory', style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 22)),
              const SizedBox(height: 6),
              const Text('Tracking screening indicators and fluency across practice sessions.'),
              const SizedBox(height: 24),

              // Visual Risk Reduction Chart Card
              FutureBuilder<List<Map<String, dynamic>>>(
                future: _historyFuture,
                builder: (context, snapshot) {
                  final data = snapshot.data ?? [
                    {'date': 'W1', 'risk_score': 0.84},
                    {'date': 'W2', 'risk_score': 0.76},
                    {'date': 'W3', 'risk_score': 0.68},
                    {'date': 'W4', 'risk_score': 0.52},
                  ];

                  return Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10)],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Dyslexia Risk Index Trend',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                '-38% Risk Drop',
                                style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: data.map((item) {
                            final score = (item['risk_score'] as num).toDouble();
                            final isInitial = score > 0.75;
                            final color = isInitial ? const Color(0xFFE53935) : (score > 0.6 ? const Color(0xFFFB8C00) : const Color(0xFF43A047));
                            final height = (score * 120).clamp(20.0, 120.0);

                            return Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('${(score * 100).toInt()}%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
                                const SizedBox(height: 6),
                                Container(
                                  width: 32,
                                  height: height,
                                  decoration: BoxDecoration(
                                    color: color,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(item['date'].toString(), style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              ],
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  );
                },
              ),

              const SizedBox(height: 24),

              // Key Biometric Milestone Indicators
              _buildProgressMetric(context, 'Oral Reading Fluency', '58 WPM', '85 WPM', '+46%', Colors.blue),
              _buildProgressMetric(context, 'Eye Regressions per Trial', '34', '16', '-53%', Colors.green),
              _buildProgressMetric(context, 'Acoustic Hesitations (>500ms)', '5.2/min', '2.3/min', '-56%', Colors.orange),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressMetric(BuildContext context, String title, String start, String current, String change, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Initial Screening', style: TextStyle(color: Colors.grey, fontSize: 11)),
                    const SizedBox(height: 2),
                    Text(start, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
                const Icon(Icons.trending_up_rounded, color: Colors.grey),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Latest Session', style: TextStyle(color: Colors.grey, fontSize: 11)),
                    const SizedBox(height: 2),
                    Text(current, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(change, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
