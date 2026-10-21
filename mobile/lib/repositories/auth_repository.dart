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

  String? lastErrorMessage;

  /// Logs in an existing parent/guardian account
  Future<bool> login(String email, String password) async {
    lastErrorMessage = null;
    final url = Uri.parse('$baseUrl/api/v1/auth/login');
    try {
      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email.trim(), 'password': password}),
          )
          .timeout(const Duration(seconds: 40));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _authToken = data['access_token'];
        _userEmail = data['user']?['email'] ?? email;
        _userId = data['user']?['id'];
        debugPrint('Auth login success: user $_userEmail (id: $_userId)');
        return true;
      } else {
        try {
          final errData = jsonDecode(response.body);
          lastErrorMessage = errData['detail'] ?? 'Invalid email or password.';
        } catch (_) {
          lastErrorMessage = 'Login failed (Status: ${response.statusCode}).';
        }
        debugPrint('Login failed: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      debugPrint('Login network error: $e.');
      lastErrorMessage = 'Server connection timeout or waking up. Please retry in a few seconds.';
      return false;
    }
  }

  /// Registers a new parent/guardian account
  Future<bool> register(String email, String password) async {
    lastErrorMessage = null;
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
          .timeout(const Duration(seconds: 40));

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _authToken = data['access_token'];
        _userEmail = data['user']?['email'] ?? email;
        _userId = data['user']?['id'];
        debugPrint('Auth registration success: user $_userEmail (id: $_userId)');
        return true;
      } else {
        try {
          final errData = jsonDecode(response.body);
          lastErrorMessage = errData['detail'] ?? 'Registration could not be completed.';
        } catch (_) {
          lastErrorMessage = 'Registration failed (Status: ${response.statusCode}).';
        }
        debugPrint('Registration failed: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      debugPrint('Registration network error: $e.');
      lastErrorMessage = 'Server connection timeout or waking up. Please retry in a few seconds.';
      return false;
    }
  }

  void logout() {
    _authToken = null;
    _userEmail = null;
    _userId = null;
  }
}
