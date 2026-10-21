import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/assessment_result.dart';
import '../models/child_profile.dart';
import '../repositories/assessment_service.dart';
import '../services/buddy_service.dart';
import '../widgets/clay_3d_button.dart';

class ResultsScreen extends StatefulWidget {
  const ResultsScreen({super.key});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  final AssessmentService _assessmentService = AssessmentService();
  bool _isDownloading = false;
  bool _showParentClinicalView = false; // Child Champion Mode by default

  @override
  Widget build(BuildContext context) {
    final activeBuddy = BuddyService().currentBuddy;

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
        ? const Color(0xFFE11D48) // Crimson Rose
        : (isModerateRisk ? const Color(0xFFD97706) : const Color(0xFF059669));

    return Scaffold(
      backgroundColor: const Color(0xFFFFFDF5),
      appBar: AppBar(
        title: Text(_showParentClinicalView ? 'Clinical Report' : 'Adventure Rewards 🏆'),
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
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Dual-Mode Toggle: Child Champion vs. Parent/Specialist Insights
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: activeBuddy.themeSurface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: activeBuddy.themePrimary.withValues(alpha: 0.3), width: 1.5),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _showParentClinicalView = false),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: !_showParentClinicalView ? activeBuddy.themePrimary : Colors.transparent,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: !_showParentClinicalView
                                ? [
                                    BoxShadow(
                                      color: activeBuddy.themeShadow.withValues(alpha: 0.3),
                                      offset: const Offset(0, 3),
                                      blurRadius: 4,
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(activeBuddy.emoji, style: const TextStyle(fontSize: 16)),
                              const SizedBox(width: 6),
                              Text(
                                'Kid Champion',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: !_showParentClinicalView ? Colors.white : activeBuddy.textColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _showParentClinicalView = true),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _showParentClinicalView ? const Color(0xFF1E1B4B) : Colors.transparent,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: _showParentClinicalView
                                ? const [
                                    BoxShadow(
                                      color: Colors.black26,
                                      offset: Offset(0, 3),
                                      blurRadius: 4,
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.psychology_outlined, size: 16, color: Colors.white70),
                              const SizedBox(width: 6),
                              Text(
                                'Parent & Specialist',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: _showParentClinicalView ? Colors.white : activeBuddy.textColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              if (!_showParentClinicalView) ...[
                // ==========================================
                // CHILD CHAMPION VIEW (Zero Anxiety, High Fun)
                // ==========================================
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(26),
                    border: Border.all(color: activeBuddy.themePrimary, width: 2.5),
                    boxShadow: [
                      BoxShadow(
                        color: activeBuddy.themeShadow.withValues(alpha: 0.18),
                        offset: const Offset(0, 8),
                        blurRadius: 18,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Chosen Buddy in Champion Pose
                      Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          color: activeBuddy.themeSurface,
                          shape: BoxShape.circle,
                          border: Border.all(color: activeBuddy.themeSecondary, width: 3),
                        ),
                        child: Center(
                          child: Text(
                            activeBuddy.emoji,
                            style: const TextStyle(fontSize: 42),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Quest Completed, ${child.name}!',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E1B4B),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        activeBuddy.cheerQuote,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: activeBuddy.textColor,
                          fontStyle: FontStyle.italic,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),

                      // 3D Star Rating
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.star_rounded, size: 44, color: Color(0xFFF59E0B)),
                          Icon(Icons.star_rounded, size: 54, color: Color(0xFFF59E0B)),
                          Icon(Icons.star_rounded, size: 44, color: Color(0xFFF59E0B)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Earned +150 Reader EXP',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: activeBuddy.themePrimary,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Unlocked Badges
                const Text(
                  'Superpowers Unlocked Today ⚡',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1E1B4B)),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _buildBadgeCard(
                        emoji: '👀',
                        title: 'Eye Tracker',
                        desc: 'Targeted words forward',
                        color: activeBuddy.themePrimary,
                        surface: activeBuddy.themeSurface,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildBadgeCard(
                        emoji: '🎤',
                        title: 'Voice Hero',
                        desc: 'Acoustic mic active',
                        color: const Color(0xFF059669),
                        surface: const Color(0xFFD1FAE5),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildBadgeCard(
                        emoji: '🧠',
                        title: 'Memory Star',
                        desc: 'Cognitive drills synced',
                        color: const Color(0xFFD97706),
                        surface: const Color(0xFFFEF3C7),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                Clay3DButton(
                  text: 'Play Reading Practice Activities 🎮',
                  isExpanded: true,
                  color: activeBuddy.themeSecondary,
                  shadowColor: activeBuddy.themeShadow,
                  textColor: const Color(0xFF1E1B4B),
                  depth: 6.0,
                  fontSize: 16.0,
                  onPressed: () {
                    Navigator.pushReplacementNamed(context, '/learning_activity');
                  },
                ),
              ] else ...[
                // ==========================================
                // PARENT & SPECIALIST CLINICAL VIEW
                // ==========================================
                // Child Profile Mini Card
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6)],
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: activeBuddy.themePrimary.withValues(alpha: 0.15),
                        child: Text(
                          child.name.isNotEmpty ? child.name[0] : 'C',
                          style: TextStyle(
                            color: activeBuddy.themePrimary,
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
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
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
                          color: const Color(0xFFEEF2FF),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'Verified Trial',
                          style: TextStyle(color: Color(0xFF312E81), fontSize: 12, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Risk Indicator Banner
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: statusColor, width: 2.0),
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
                            size: 24,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            result.screeningLevel.toUpperCase(),
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: statusColor,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '${(result.riskProbability * 100).toStringAsFixed(1)}%',
                        style: TextStyle(
                          fontSize: 44,
                          fontWeight: FontWeight.w900,
                          color: statusColor,
                        ),
                      ),
                      Text(
                        'Multimodal Screener Index (Model Confidence: ${(result.confidenceScore * 100).toStringAsFixed(0)}%)',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade700, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Text(
                          result.disclaimer,
                          style: const TextStyle(
                            fontSize: 11,
                            fontStyle: FontStyle.italic,
                            color: Color(0xFF475569),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // SHAP Explainable AI Section
                Row(
                  children: const [
                    Icon(Icons.psychology_outlined, size: 22, color: Color(0xFF1E1B4B)),
                    SizedBox(width: 8),
                    Text(
                      'Explainable AI (SHAP Biometrics)',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF1E1B4B)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Empirical sensor attributions computed by XGBoost TreeExplainer:',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 12),

                ...result.getSortedContributions().take(5).map((entry) {
                  return _buildShapItem(entry.key, entry.value);
                }),

                const SizedBox(height: 20),

                // Targeted Remediation Plan
                if (result.personalizedLearningPlan.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6)],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.auto_stories_rounded, color: activeBuddy.themePrimary, size: 22),
                            const SizedBox(width: 8),
                            const Text(
                              'Targeted Remediation Plan',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        if (result.personalizedLearningPlan['primary_focus'] != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: activeBuddy.themeSurface,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'Focus: ${result.personalizedLearningPlan['primary_focus']}',
                              style: TextStyle(
                                color: activeBuddy.textColor,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        const SizedBox(height: 10),
                        if (result.personalizedLearningPlan['recommended_activities'] is List)
                          ...((result.personalizedLearningPlan['recommended_activities'] as List).map(
                            (act) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 3.0),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                                  Expanded(
                                    child: Text(act.toString(), style: const TextStyle(fontSize: 13, height: 1.3)),
                                  ),
                                ],
                              ),
                            ),
                          )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                ],

                Clay3DButton(
                  text: _isDownloading ? 'Generating Report...' : 'Download Clinical PDF Report 📄',
                  isExpanded: true,
                  color: const Color(0xFF1E1B4B),
                  shadowColor: Colors.black,
                  textColor: Colors.white,
                  depth: 5.0,
                  fontSize: 15.0,
                  onPressed: _isDownloading ? () {} : () => _handlePdfDownload(child, result),
                ),
              ],

              const SizedBox(height: 16),

              // Back to Dashboard
              Center(
                child: TextButton.icon(
                  onPressed: () {
                    Navigator.pushNamedAndRemoveUntil(context, '/dashboard', (route) => false);
                  },
                  icon: const Icon(Icons.home_outlined, size: 18),
                  label: const Text('Return to Parent Dashboard', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadgeCard({
    required String emoji,
    required String title,
    required String desc,
    required Color color,
    required Color surface,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.4), width: 1.5),
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 26)),
          const SizedBox(height: 6),
          Text(
            title,
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: color),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            desc,
            style: const TextStyle(fontSize: 9.5, color: Color(0xFF475569)),
            textAlign: TextAlign.center,
          ),
        ],
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Color(0xFF059669)),
              SizedBox(width: 8),
              Text('Clinical PDF Ready'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Clinical assessment PDF report generated for ${child.name}.', style: const TextStyle(fontSize: 14)),
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
            ],
          ),
          actions: [
            ElevatedButton.icon(
              onPressed: () async {
                final uri = Uri.parse(url);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
              icon: const Icon(Icons.download, size: 16),
              label: const Text('Open / Save PDF'),
            ),
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
      'n_regress_trial': 'Ocular Regressions (Re-reading backwards)',
      'speech_hesitation_rate': 'Acoustic Hesitations (>500ms pauses)',
      'dwell_time_trial': 'Fixation Dwell Time (Total ms)',
      'mean_fix_dur_trial': 'Mean Fixation Duration',
      'phonological_awareness_score': 'Phonological Sound-Blending',
      'speech_phoneme_stability': 'Phoneme Decoding Stability',
      'cognitive_working_memory': 'Auditory/Visual Working Memory',
    };

    final String label = featureLabels[rawFeature] ?? rawFeature;
    final bool isRiskFactor = value > 0;
    final Color barColor = isRiskFactor ? const Color(0xFFE11D48) : const Color(0xFF059669);
    final String sign = isRiskFactor ? '+' : '';
    final String pct = '$sign${(value * 100).toStringAsFixed(1)}%';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF1E1B4B)),
                ),
              ),
              Text(
                pct,
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 12.5,
                  color: barColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (value.abs() * 3.5).clamp(0.05, 1.0),
              backgroundColor: const Color(0xFFF1F5F9),
              color: barColor,
              minHeight: 7,
            ),
          ),
        ],
      ),
    );
  }
}
