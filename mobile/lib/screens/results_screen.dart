import 'package:flutter/material.dart';
import '../models/assessment_result.dart';
import '../models/child_profile.dart';
import '../repositories/assessment_service.dart';
import '../widgets/custom_button.dart';

class ResultsScreen extends StatefulWidget {
  const ResultsScreen({super.key});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  final AssessmentService _assessmentService = AssessmentService();
  bool _isDownloading = false;

  @override
  Widget build(BuildContext context) {
    // Extract route arguments if passed
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final AssessmentResult result = args?['result'] as AssessmentResult? ??
        AssessmentResult(
          childId: 1,
          riskProbability: 0.74,
          screeningLevel: 'High Dyslexia Risk Indicator',
          confidenceScore: 0.91,
          featureContributionsShap: {
            'n_regress_trial': 0.19,
            'speech_hesitation_rate': 0.16,
            'dwell_time_trial': 0.11,
            'phonological_awareness_score': 0.08,
            'speech_phoneme_stability': 0.07,
            'cognitive_working_memory': -0.02,
          },
          personalizedLearningPlan: {
            'primary_focus': 'Regressive Saccade Guidance & Phonemic Decoding',
            'recommended_activities': [
              'Bimodal Line Tracker (Guides eye gaze forward without re-reading)',
              'Phoneme Segmenter & Sound Blend Audio Drill',
              'Paced Word Flash (Reduces dwell pauses)'
            ],
            'weekly_schedule': '15 minutes daily (5 days/week)',
          },
          disclaimer: 'EDUCATIONAL SCREENING ESTIMATE ONLY. Not a formal clinical medical diagnosis.',
        );

    final ChildProfile child = args?['child'] as ChildProfile? ??
        ChildProfile(id: '1', name: 'Arun', age: 9, grade: 'Grade 4', language: 'English');

    final bool isHighRisk = result.riskProbability >= 0.70;
    final bool isModerateRisk = result.riskProbability >= 0.40 && result.riskProbability < 0.70;
    final Color statusColor = isHighRisk
        ? const Color(0xFFE53935)
        : (isModerateRisk ? const Color(0xFFFB8C00) : const Color(0xFF43A047));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Assessment Insights'),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf_outlined),
            tooltip: 'PDF Report',
            onPressed: () => _handlePdfDownload(child, result),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Child Profile Mini Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6)],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Theme.of(context).primaryColor.withValues(alpha: 0.15),
                      child: Text(
                        child.name.isNotEmpty ? child.name[0] : 'C',
                        style: TextStyle(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          child.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          '${child.grade} • Age ${child.age} • English',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.indigo.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Trial Complete',
                        style: TextStyle(color: Colors.indigo.shade700, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Risk Indicator Banner
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor, width: 1.5),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          isHighRisk
                              ? Icons.warning_amber_rounded
                              : (isModerateRisk ? Icons.info_outline_rounded : Icons.check_circle_outline),
                          color: statusColor,
                          size: 26,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          result.screeningLevel.toUpperCase(),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: statusColor,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      '${(result.riskProbability * 100).toStringAsFixed(1)}%',
                      style: TextStyle(
                        fontSize: 44,
                        fontWeight: FontWeight.w900,
                        color: statusColor,
                      ),
                    ),
                    Text(
                      'Multimodal Risk Index (Confidence: ${(result.confidenceScore * 100).toStringAsFixed(0)}%)',
                      style: TextStyle(fontSize: 13, color: Colors.grey.shade700, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        result.disclaimer,
                        style: const TextStyle(
                          fontSize: 11,
                          fontStyle: FontStyle.italic,
                          color: Color(0xFF555555),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // SHAP Explainable AI Section
              Row(
                children: [
                  const Icon(Icons.psychology_outlined, size: 22, color: Color(0xFF3F3D56)),
                  const SizedBox(width: 8),
                  Text(
                    'Explainable AI (SHAP Attributions)',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 18),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Key biometric signals influencing this screening score:',
                style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
              ),
              const SizedBox(height: 14),

              // Dynamic SHAP Contribution rows
              ...result.getSortedContributions().take(5).map((entry) {
                return _buildShapItem(entry.key, entry.value);
              }),

              const SizedBox(height: 24),

              // Targeted Learning Plan Card
              if (result.personalizedLearningPlan.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.auto_stories_rounded, color: Theme.of(context).primaryColor, size: 22),
                          const SizedBox(width: 8),
                          const Text(
                            'Personalized Intervention Plan',
                            style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (result.personalizedLearningPlan['primary_focus'] != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.indigo.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Focus: ${result.personalizedLearningPlan['primary_focus']}',
                            style: TextStyle(
                              color: Colors.indigo.shade900,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      const SizedBox(height: 12),
                      if (result.personalizedLearningPlan['recommended_activities'] is List)
                        ...((result.personalizedLearningPlan['recommended_activities'] as List).map(
                          (act) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4.0),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                                Expanded(
                                  child: Text(
                                    act.toString(),
                                    style: const TextStyle(fontSize: 14, height: 1.3),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )),
                      if (result.personalizedLearningPlan['weekly_schedule'] != null) ...[
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Icon(Icons.calendar_today_outlined, size: 14, color: Colors.grey),
                            const SizedBox(width: 6),
                            Text(
                              'Schedule: ${result.personalizedLearningPlan['weekly_schedule']}',
                              style: TextStyle(color: Colors.grey.shade700, fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Download Clinical Report Button (Fig 2, Box 12)
              OutlinedButton.icon(
                icon: _isDownloading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.download_rounded),
                label: Text(
                  _isDownloading ? 'Generating Clinical Report...' : 'Download Assessment Report (PDF)',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: BorderSide(color: Theme.of(context).primaryColor, width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: _isDownloading ? null : () => _handlePdfDownload(child, result),
              ),

              const SizedBox(height: 14),

              // View Learning Plan Screen Button
              CustomButton(
                text: 'Begin Personalized Activities',
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/learning_activity');
                },
              ),

              const SizedBox(height: 10),

              // Back to Dashboard
              TextButton(
                onPressed: () {
                  Navigator.pushNamedAndRemoveUntil(context, '/dashboard', (route) => false);
                },
                child: const Text('Return to Parent Dashboard', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  void _handlePdfDownload(ChildProfile child, AssessmentResult result) async {
    setState(() {
      _isDownloading = true;
    });

    final childIdInt = int.tryParse(child.id) ?? 1;
    final url = _assessmentService.getReportUrl(
      childId: childIdInt,
      name: child.name,
      age: child.age,
      grade: child.grade,
      riskProb: result.riskProbability,
    );

    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() {
        _isDownloading = false;
      });

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 8),
              Text('Report Ready'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Clinical assessment PDF report generated for ${child.name}.',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: SelectableText(
                  url,
                  style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Includes intermediate feature attributions, gaze regressions, and targeted remediation schedule.',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildShapItem(String rawFeature, double value) {
    final Map<String, String> featureLabels = {
      'n_regress_trial': 'Eye Regressions (Re-reading backwards)',
      'speech_hesitation_rate': 'Acoustic Hesitations (>500ms pauses)',
      'dwell_time_trial': 'Fixation Dwell Time (Total ms)',
      'mean_fix_dur_trial': 'Mean Fixation Duration',
      'phonological_awareness_score': 'Phonological Sound-Blending',
      'speech_phoneme_stability': 'Phoneme Decoding Stability',
      'cognitive_working_memory': 'Auditory/Visual Working Memory',
      'ratio_progress_regress_trial': 'Progressive / Regressive Saccade Ratio',
      'mean_sacc_ampl_trial': 'Mean Saccadic Amplitude',
    };

    final String label = featureLabels[rawFeature] ?? rawFeature;
    final bool isRiskFactor = value > 0;
    final Color barColor = isRiskFactor ? const Color(0xFFE53935) : const Color(0xFF43A047);
    final String sign = isRiskFactor ? '+' : '';
    final String pct = '$sign${(value * 100).toStringAsFixed(1)}%';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
              Text(
                pct,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: barColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (value.abs() * 3.5).clamp(0.05, 1.0),
              backgroundColor: Colors.grey.shade200,
              color: barColor,
              minHeight: 7,
            ),
          ),
        ],
      ),
    );
  }
}
