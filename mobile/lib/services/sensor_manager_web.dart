import 'dart:async';
import 'dart:js_interop';
import 'dart:math' as math;
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:web/web.dart' as web;
import 'dart:ui_web' as ui_web;
import 'sensor_manager_interface.dart';

class WebSensorManager implements SensorManager {
  static int _viewIdCounter = 0;
  late final String _viewType;
  web.HTMLVideoElement? _videoElement;
  web.MediaStream? _mediaStream;
  web.AudioContext? _audioContext;
  web.AnalyserNode? _analyser;
  Uint8List? _freqBuffer;

  final StreamController<double> _audioLevelController = StreamController<double>.broadcast();
  Timer? _analysisTimer;

  int _regressionCount = 0;
  double _hesitationRate = 0.0;
  double _phonemeStability = 0.72;
  DateTime? _trackingStartTime;

  int _silentTicks = 0;
  int _hesitationEvents = 0;
  bool _wasSpeaking = false;

  WebSensorManager() {
    _viewType = 'webcam-view-${_viewIdCounter++}';
  }

  @override
  Stream<double> get audioLevelStream => _audioLevelController.stream;

  @override
  int get regressionCount => _regressionCount;

  @override
  double get hesitationRate => _hesitationRate;

  @override
  double get phonemeStability => _phonemeStability;

  @override
  Future<bool> initializeSensors() async {
    try {
      final nav = web.window.navigator;
      final mediaDevices = nav.mediaDevices;

      // Real camera and microphone constraints
      final constraints = web.MediaStreamConstraints(
        video: true.toJS,
        audio: true.toJS,
      );

      final promise = mediaDevices.getUserMedia(constraints);
      final streamObj = await promise.toDart;
      _mediaStream = streamObj as web.MediaStream?;

      if (_mediaStream == null) {
        return false;
      }

      // Create live HTML Video Element
      _videoElement = web.document.createElement('video') as web.HTMLVideoElement
        ..srcObject = _mediaStream
        ..autoplay = true
        ..muted = true;

      _videoElement!.setAttribute('playsinline', 'true');
      _videoElement!.setAttribute('autoplay', 'true');
      _videoElement!.setAttribute('muted', 'true');
      _videoElement!.style.width = '100%';
      _videoElement!.style.height = '100%';
      _videoElement!.style.objectFit = 'cover';

      // Explicitly trigger play to prevent browser freeze
      _videoElement!.play();

      // Register view factory for Flutter Web HtmlElementView
      ui_web.platformViewRegistry.registerViewFactory(
        _viewType,
        (int viewId) => _videoElement!,
      );

      // Connect real Web Audio API Analyser for real microphone capture
      try {
        _audioContext = web.AudioContext();
        final source = _audioContext!.createMediaStreamSource(_mediaStream!);
        _analyser = _audioContext!.createAnalyser();
        _analyser!.fftSize = 64;
        source.connect(_analyser!);
        _freqBuffer = Uint8List(_analyser!.frequencyBinCount);
      } catch (audioErr) {
        debugPrint('Web AudioContext initialization notice: $audioErr');
      }

      return true;
    } catch (e) {
      debugPrint('Web camera/mic access error: $e');
      return false;
    }
  }

  @override
  Widget buildCameraPreview() {
    if (_mediaStream == null) {
      return Container(
        color: Colors.black87,
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.videocam_off, color: Colors.white54, size: 28),
              SizedBox(height: 4),
              Text(
                'Camera Inactive',
                style: TextStyle(color: Colors.white54, fontSize: 10),
              ),
            ],
          ),
        ),
      );
    }
    return HtmlElementView(viewType: _viewType);
  }

  @override
  void startTracking() {
    _trackingStartTime = DateTime.now();
    _regressionCount = 0;
    _hesitationRate = 0.0;
    _hesitationEvents = 0;
    _silentTicks = 0;
    _wasSpeaking = false;

    // Resume audio context if suspended by browser autoplay policy
    if (_audioContext != null && _audioContext!.state == 'suspended') {
      _audioContext!.resume();
    }

    _analysisTimer?.cancel();
    _analysisTimer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      double realLevel = 0.0;

      // Sample real microphone audio data
      if (_analyser != null && _freqBuffer != null) {
        _analyser!.getByteFrequencyData(_freqBuffer!.toJS);
        double sum = 0.0;
        for (int i = 0; i < _freqBuffer!.length; i++) {
          sum += _freqBuffer![i];
        }
        final double avg = sum / _freqBuffer!.length;
        // Normalize: Ambient noise is typically 0-8, speech reaches 25-100+
        realLevel = ((avg - 6.0) / 45.0).clamp(0.0, 1.0);
      }

      _audioLevelController.add(realLevel);

      // Real acoustic hesitation tracking
      if (realLevel > 0.12) {
        _wasSpeaking = true;
        _silentTicks = 0;
      } else {
        _silentTicks++;
        // If silent for 1.4s (14 consecutive 100ms ticks) after actively reading
        if (_wasSpeaking && _silentTicks == 14) {
          _hesitationEvents++;
          _wasSpeaking = false;
        }
      }

      final elapsedSec = DateTime.now().difference(_trackingStartTime!).inSeconds;
      if (elapsedSec > 0) {
        final double elapsedMinutes = math.max(0.2, elapsedSec / 60.0);
        _hesitationRate = double.parse((_hesitationEvents / elapsedMinutes).toStringAsFixed(1));
      }

      // Phoneme stability is computed inversely to hesitation pauses
      _phonemeStability = (0.78 - (_hesitationEvents * 0.04)).clamp(0.40, 0.92);
    });
  }

  @override
  void recordUserRegression() {
    _regressionCount++;
  }

  @override
  void stopTracking() {
    _analysisTimer?.cancel();
  }

  @override
  void dispose() {
    _analysisTimer?.cancel();
    _audioLevelController.close();
    _audioContext?.close();
    if (_mediaStream != null) {
      final tracks = _mediaStream!.getTracks().toDart;
      for (final t in tracks) {
        t.stop();
      }
    }
  }
}

SensorManager createSensorManager() => WebSensorManager();
