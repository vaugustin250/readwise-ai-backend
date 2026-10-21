class AssessmentResult {
  final int childId;
  final double riskProbability;
  final String screeningLevel;
  final double confidenceScore;
  final Map<String, double> featureContributionsShap;
  final Map<String, dynamic> personalizedLearningPlan;
  final String disclaimer;

  AssessmentResult({
    required this.childId,
    required this.riskProbability,
    required this.screeningLevel,
    required this.confidenceScore,
    required this.featureContributionsShap,
    required this.personalizedLearningPlan,
    required this.disclaimer,
  });

  factory AssessmentResult.fromJson(Map<String, dynamic> json) {
    final shapRaw = json['feature_contributions_shap'] as Map<String, dynamic>? ?? {};
    final shapMap = <String, double>{};
    shapRaw.forEach((k, v) {
      if (v is num) {
        shapMap[k] = v.toDouble();
      }
    });

    return AssessmentResult(
      childId: json['child_id'] as int? ?? 1,
      riskProbability: (json['risk_probability'] as num?)?.toDouble() ?? 0.0,
      screeningLevel: json['screening_level'] as String? ?? 'Screening Complete',
      confidenceScore: (json['confidence_score'] as num?)?.toDouble() ?? 0.0,
      featureContributionsShap: shapMap,
      personalizedLearningPlan: json['personalized_learning_plan'] as Map<String, dynamic>? ?? {},
      disclaimer: json['disclaimer'] as String? ??
          'EDUCATIONAL SCREENING ESTIMATE ONLY. Not a formal clinical medical diagnosis.',
    );
  }

  Map<String, dynamic> toJson() => {
    'child_id': childId,
    'risk_probability': riskProbability,
    'screening_level': screeningLevel,
    'confidence_score': confidenceScore,
    'feature_contributions_shap': featureContributionsShap,
    'personalized_learning_plan': personalizedLearningPlan,
    'disclaimer': disclaimer,
  };

  /// Returns sorted list of features by absolute SHAP impact
  List<MapEntry<String, double>> getSortedContributions() {
    final list = featureContributionsShap.entries.toList();
    list.sort((a, b) => b.value.abs().compareTo(a.value.abs()));
    return list;
  }
}
