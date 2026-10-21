import '../models/child_profile.dart';

class MockRepository {
  static final MockRepository _instance = MockRepository._internal();
  factory MockRepository() => _instance;
  MockRepository._internal();

  final List<ChildProfile> _children = [
    ChildProfile(id: '1', name: 'Arun', age: 9, grade: 'Grade 4', language: 'English'),
  ];

  Future<List<ChildProfile>> getChildren() async {
    await Future.delayed(const Duration(milliseconds: 500)); // Simulate network
    return _children;
  }

  Future<void> addChild(ChildProfile child) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _children.add(child);
  }
}
