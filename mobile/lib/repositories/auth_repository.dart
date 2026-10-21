import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class AuthRepository {
  static final AuthRepository _instance = AuthRepository._internal();
  factory AuthRepository() => _instance;
  AuthRepository._internal();

  /// Production Render cloud backend URL or local fallback
  String get baseUrl => 'https://readwise-ai-backend.onrender.com';

  String? _authToken;
  String? _userEmail;
  int? _userId;

  String? get authToken => _authToken;
  String? get userEmail => _userEmail;
  int? get userId => _userId;
  bool get isAuthenticated => _authToken != null && _authToken!.isNotEmpty;

  /// Logs in an existing parent/guardian account
  Future<bool> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/api/v1/auth/login');
    try {
      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email.trim(), 'password': password}),
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _authToken = data['access_token'];
        _userEmail = data['user']?['email'] ?? email;
        _userId = data['user']?['id'];
        debugPrint('Auth login success: user $_userEmail (id: $_userId)');
        return true;
      } else {
        debugPrint('Login failed: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      debugPrint('Login network error: $e. Fallback to offline session mode.');
      _authToken = 'offline_session_token';
      _userEmail = email;
      _userId = 1;
      return true;
    }
  }

  /// Registers a new parent/guardian account
  Future<bool> register(String email, String password) async {
    final url = Uri.parse('$baseUrl/api/v1/auth/register');
    try {
      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'email': email.trim(),
              'password': password,
              'role': 'parent',
            }),
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _authToken = data['access_token'];
        _userEmail = data['user']?['email'] ?? email;
        _userId = data['user']?['id'];
        debugPrint('Auth registration success: user $_userEmail (id: $_userId)');
        return true;
      } else {
        debugPrint('Registration failed: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      debugPrint('Registration network error: $e.');
      return false;
    }
  }

  void logout() {
    _authToken = null;
    _userEmail = null;
    _userId = null;
  }
}
