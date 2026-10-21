import unittest
from speech_analyzer import SpeechAnalyzer
from camera_analyzer import CameraAnalyzer

class TestExtractors(unittest.TestCase):
    
    def setUp(self):
        self.speech_analyzer = SpeechAnalyzer()
        self.camera_analyzer = CameraAnalyzer()
        
    def test_speech_accuracy_calculation(self):
        expected = "The dog jumped over the fence"
        actual = "The dog jumped over the fence"
        score = self.speech_analyzer.compare_texts(expected, actual)
        self.assertEqual(score, 1.0)
        
        actual_with_errors = "The dog jumped over the fens"
        score_errors = self.speech_analyzer.compare_texts(expected, actual_with_errors)
        self.assertLess(score_errors, 1.0)
        self.assertGreater(score_errors, 0.8)

    def test_speech_mock_pipeline(self):
        expected = "The little boy walked through the forest"
        result = self.speech_analyzer.analyze_audio("dummy_path.wav", expected)
        
        self.assertEqual(result["status"], "success")
        self.assertIn("accuracy", result)
        self.assertTrue(result["accuracy"] > 0)
        
    def test_camera_quality_check(self):
        # Passing a None or mock frame
        is_good = self.camera_analyzer.check_camera_quality(None)
        self.assertTrue(is_good)
        
    def test_camera_gaze_extraction(self):
        result = self.camera_analyzer.extract_gaze_features("dummy_video.mp4")
        
        self.assertEqual(result["status"], "success")
        self.assertIn("regressions_detected", result)
        self.assertIsNotNone(result["regressions_detected"])
        self.assertIn("not clinically validated", result["disclaimer"])

if __name__ == '__main__':
    unittest.main()
