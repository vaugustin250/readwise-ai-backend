import 'package:flutter/material.dart';

abstract class SensorManager {
  Future<bool> initializeSensors();
  Widget buildCameraPreview();
  Stream<double> get audioLevelStream;
  int get regressionCount;
  double get hesitationRate;
  double get phonemeStability;
  void recordUserRegression();
  void startTracking();
  void stopTracking();
  void dispose();
}
