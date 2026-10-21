class ChildProfile {
  final String id;
  final String name;
  final int age;
  final String grade;
  final String language;

  ChildProfile({
    required this.id,
    required this.name,
    required this.age,
    required this.grade,
    required this.language,
  });
}

// Mock data for Phase 1
final List<ChildProfile> mockChildren = [
  ChildProfile(id: '1', name: 'Arun', age: 9, grade: 'Grade 4', language: 'English'),
];
