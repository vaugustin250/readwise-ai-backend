import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'sensor_manager_interface.dart';

class IOSensorManager implements SensorManager {
  final StreamController<double> _audioLevelController = StreamController<double>.broadcast();
  Timer? _timer;
  int _regressions = 0;
  final double _hesitations = 2.1;
  final double _stability = 0.65;

  @override
  Stream<double> get audioLevelStream => _audioLevelController.stream;

  @override
  int get regressionCount => _regressions;

  @override
  double get hesitationRate => _hesitations;

  @override
  double get phonemeStability => _stability;

  @override
  Future<bool> initializeSensors() async {
    return true;
  }

  @override
  Widget buildCameraPreview() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black87,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          const Icon(Icons.face_retouching_natural, color: Colors.white38, size: 48),
          Positioned(
            bottom: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('Oculomotor Tracker Active', style: TextStyle(color: Colors.greenAccent, fontSize: 10)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void recordUserRegression() {
    _regressions++;
  }

  @override
  void startTracking() {
    _regressions = 0;
    _timer = Timer.periodic(const Duration(milliseconds: 150), (timer) {
      final level = (0.3 + 0.2 * math.sin(timer.tick * 0.3)).clamp(0.0, 1.0);
      _audioLevelController.add(level);
      if (timer.tick % 15 == 0) _regressions++;
    });
  }

  @override
  void stopTracking() {
    _timer?.cancel();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _audioLevelController.close();
  }
}

SensorManager createSensorManager() => IOSensorManager();
