import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/assessment_result.dart';
import 'package:mobile/repositories/assessment_service.dart';

void main() {
  group('Assessment Model & Service Tests', () {
    test('AssessmentResult correctly parses JSON from backend API', () {
      final sampleJson = {
        'child_id': 1009,
        'risk_probability': 0.785,
        'screening_level': 'High Dyslexia Risk Indicator',
        'confidence_score': 0.892,
        'feature_contributions_shap': {
          'n_regress_trial': 0.21,
          'speech_hesitation_rate': 0.18,
          'cognitive_working_memory': -0.06,
        },
        'personalized_learning_plan': {
          'primary_focus': 'Regressive Saccade Guidance',
          'recommended_activities': ['Bimodal Line Tracker', 'Phoneme Segmenter'],
          'weekly_schedule': '15 mins/day',
        },
        'disclaimer': 'EDUCATIONAL SCREENING ESTIMATE ONLY.',
      };

      final result = AssessmentResult.fromJson(sampleJson);

      expect(result.childId, 1009);
      expect(result.riskProbability, closeTo(0.785, 0.001));
      expect(result.screeningLevel, 'High Dyslexia Risk Indicator');
      expect(result.confidenceScore, closeTo(0.892, 0.001));
      expect(result.featureContributionsShap['n_regress_trial'], 0.21);
      expect(result.featureContributionsShap['cognitive_working_memory'], -0.06);

      final sorted = result.getSortedContributions();
      expect(sorted.first.key, 'n_regress_trial');
      expect(sorted[1].key, 'speech_hesitation_rate');
    });

    test('AssessmentService generates correct downloadable report URL', () {
      final service = AssessmentService();
      final url = service.getReportUrl(
        childId: 1009,
        name: 'Arun',
        age: 9,
        grade: 'Grade 4',
        riskProb: 0.785,
      );

      expect(url, contains('/api/v1/assessments/report/1009'));
      expect(url, contains('name=Arun'));
      expect(url, contains('age=9'));
      expect(url, contains('grade=Grade%204'));
      expect(url, contains('risk_prob=0.785'));
    });
  });
}
