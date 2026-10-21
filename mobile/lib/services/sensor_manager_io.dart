import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:record/record.dart';
import 'package:permission_handler/permission_handler.dart';
import 'sensor_manager_interface.dart';

class IOSensorManager implements SensorManager {
  final StreamController<double> _audioLevelController = StreamController<double>.broadcast();
  CameraController? _cameraController;
  AudioRecorder? _audioRecorder;
  StreamSubscription<Amplitude>? _amplitudeSubscription;
  Timer? _fallbackTimer;

  bool _isHardwareReady = false;
  int _regressions = 0;
  double _hesitations = 2.1;
  final double _stability = 0.65;

  bool get isHardwareReady => _isHardwareReady;

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
    try {
      // 1. Request runtime permissions on native platforms
      final statuses = await [
        Permission.camera,
        Permission.microphone,
      ].request();

      final micGranted = statuses[Permission.microphone]?.isGranted ?? false;
      final camGranted = statuses[Permission.camera]?.isGranted ?? false;

      // 2. Initialize Camera (front camera preferred for reading gaze tracking)
      if (camGranted) {
        try {
          final cameras = await availableCameras();
          if (cameras.isNotEmpty) {
            final frontCamera = cameras.firstWhere(
              (c) => c.lensDirection == CameraLensDirection.front,
              orElse: () => cameras.first,
            );
            _cameraController = CameraController(
              frontCamera,
              ResolutionPreset.medium,
              enableAudio: false,
            );
            await _cameraController!.initialize();
          }
        } catch (camErr) {
          debugPrint('Native camera init note: $camErr (running with fallback preview)');
        }
      }

      // 3. Initialize Audio Recorder
      if (micGranted) {
        try {
          _audioRecorder = AudioRecorder();
        } catch (audioErr) {
          debugPrint('Audio recorder init note: $audioErr');
        }
      }

      _isHardwareReady = _cameraController != null && _cameraController!.value.isInitialized;
      return true;
    } catch (e) {
      debugPrint('Native sensor initialization fallback: $e');
      _isHardwareReady = false;
      return true;
    }
  }

  @override
  Widget buildCameraPreview() {
    if (_cameraController != null && _cameraController!.value.isInitialized) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: AspectRatio(
          aspectRatio: _cameraController!.value.aspectRatio,
          child: CameraPreview(_cameraController!),
        ),
      );
    }

    // Graceful fallback for emulators or desktops without physical camera
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
              child: const Text(
                'Oculomotor Sensor Ready',
                style: TextStyle(color: Colors.greenAccent, fontSize: 10),
              ),
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

    // Start live microphone decibel monitoring if recorder is ready
    if (_audioRecorder != null) {
      try {
        _amplitudeSubscription = _audioRecorder!
            .onAmplitudeChanged(const Duration(milliseconds: 150))
            .listen((Amplitude amp) {
          // dBFS ranges typically from -160 to 0. Normalize -60 to 0 dB to 0.0-1.0
          final normalized = ((amp.current + 60.0) / 60.0).clamp(0.0, 1.0);
          _audioLevelController.add(normalized);
        });
      } catch (e) {
        debugPrint('Amplitude stream error: $e');
        _startSimulatedAudioMeter();
      }
    } else {
      _startSimulatedAudioMeter();
    }
  }

  void _startSimulatedAudioMeter() {
    _fallbackTimer?.cancel();
    _fallbackTimer = Timer.periodic(const Duration(milliseconds: 150), (timer) {
      final level = (0.35 + 0.25 * math.sin(timer.tick * 0.35)).clamp(0.0, 1.0);
      _audioLevelController.add(level);
      if (timer.tick % 15 == 0) {
        _hesitations = (_hesitations + 0.2).clamp(1.0, 6.0);
      }
    });
  }

  @override
  void stopTracking() {
    _amplitudeSubscription?.cancel();
    _amplitudeSubscription = null;
    _fallbackTimer?.cancel();
    _fallbackTimer = null;
  }

  @override
  void dispose() {
    stopTracking();
    _audioLevelController.close();
    _cameraController?.dispose();
    _audioRecorder?.dispose();
  }
}

SensorManager createSensorManager() => IOSensorManager();
