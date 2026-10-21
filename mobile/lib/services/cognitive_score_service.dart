class CognitiveScoreService {
  static final CognitiveScoreService _instance = CognitiveScoreService._internal();
  factory CognitiveScoreService() => _instance;
  CognitiveScoreService._internal();

  final Map<String, double> _workingMemoryCache = {};
  final Map<String, double> _phonologicalCache = {};

  void recordScores(String childId, {required double workingMemory, required double phonologicalAwareness}) {
    _workingMemoryCache[childId] = workingMemory;
    _phonologicalCache[childId] = phonologicalAwareness;
  }

  double getWorkingMemory(String childId) {
    return _workingMemoryCache[childId] ?? 80.0;
  }

  double getPhonologicalAwareness(String childId) {
    return _phonologicalCache[childId] ?? 82.0;
  }
}
