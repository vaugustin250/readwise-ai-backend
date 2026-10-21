import unittest
from recommendation_engine import RecommendationEngine

class TestRecommendationEngine(unittest.TestCase):
    
    def setUp(self):
        self.engine = RecommendationEngine()
        
    def test_low_risk_general_plan(self):
        plan = self.engine.generate_plan(risk_score=0.1, shap_explanation={})
        self.assertEqual(len(plan), 1)
        self.assertEqual(plan[0]["activity"], "General Reading Encouragement")
        
    def test_high_hesitation_fluency_plan(self):
        shap_data = {
            "reading_hesitations": 0.8,
            "gaze_regressions": -0.2
        }
        plan = self.engine.generate_plan(risk_score=0.7, shap_explanation=shap_data)
        activities = [item["activity"] for item in plan]
        self.assertIn("Guided Sight Word Reading", activities)
        self.assertNotIn("Visual Tracking Games", activities)
        
    def test_high_regression_vision_plan(self):
        shap_data = {
            "reading_hesitations": -0.1,
            "gaze_regressions": 0.9
        }
        plan = self.engine.generate_plan(risk_score=0.8, shap_explanation=shap_data)
        activities = [item["activity"] for item in plan]
        self.assertIn("Visual Tracking Games", activities)
        self.assertNotIn("Guided Sight Word Reading", activities)

if __name__ == '__main__':
    unittest.main()
