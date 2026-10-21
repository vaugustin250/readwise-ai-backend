import 'package:flutter/foundation.dart';
import '../models/reading_buddy.dart';

class BuddyService extends ChangeNotifier {
  static final BuddyService _instance = BuddyService._internal();
  factory BuddyService() => _instance;
  BuddyService._internal();

  ReadingBuddy _currentBuddy = ReadingBuddy.defaultBuddy;

  ReadingBuddy get currentBuddy => _currentBuddy;

  void selectBuddy(ReadingBuddy buddy) {
    if (_currentBuddy.id != buddy.id) {
      _currentBuddy = buddy;
      notifyListeners();
    }
  }

  void selectBuddyById(String id) {
    selectBuddy(ReadingBuddy.getById(id));
  }
}
