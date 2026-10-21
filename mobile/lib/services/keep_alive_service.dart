import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../repositories/assessment_service.dart';

class KeepAliveService {
  static final KeepAliveService _instance = KeepAliveService._internal();
  factory KeepAliveService() => _instance;
  KeepAliveService._internal();

  Timer? _keepAliveTimer;
  bool _isWarmedUp = false;

  bool get isWarmedUp => _isWarmedUp;

  /// Starts the keep-alive service.
  /// Sends an immediate warmup ping on app startup, then periodically pings
  /// every 10 minutes to prevent free cloud instances (e.g. Render) from spinning down.
  void start() {
    // Immediate warmup ping
    pingBackend();

    // Periodic ping every 10 minutes (Render sleeps after 15 mins of inactivity)
    _keepAliveTimer?.cancel();
    _keepAliveTimer = Timer.periodic(const Duration(minutes: 10), (_) {
      pingBackend();
    });
  }

  /// Sends a lightweight health ping to the backend root endpoint
  Future<void> pingBackend() async {
    final baseUrl = AssessmentService().baseUrl;
    final url = Uri.parse('$baseUrl/');

    try {
      debugPrint('KeepAliveService: Sending warmup ping to $url...');
      final response = await http.get(url).timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        _isWarmedUp = true;
        debugPrint('KeepAliveService: Backend is awake and responsive (200 OK)');
      }
    } catch (e) {
      debugPrint('KeepAliveService: Ping failed or server is still waking up ($e)');
    }
  }

  void dispose() {
    _keepAliveTimer?.cancel();
  }
}
