import logging

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """
    Personalized Reading Intervention Engine (Section IV, Box 10 in paper architecture).
    
    Translates observed multimodal biomarkers and SHAP feature attributions into targeted,
    evidence-based educational exercises (phonics, sight words, visual tracking, working memory).
    """

    def __init__(self):
        self.activity_library = {
            "phonics_blending": {
                "title": "Phonics Sound-Blending Quest",
                "description": "Interactive grapheme-to-phoneme decoding exercises targeting difficult vowel/consonant blends.",
                "domain": "Phonological Awareness",
                "difficulty": "Adaptive"
            },
            "rapid_sight_words": {
                "title": "Rapid Sight-Word Recognition",
                "description": "Timed flash-card recognition of high-frequency words to overcome oral reading hesitation.",
                "domain": "Reading Fluency",
                "difficulty": "Adaptive"
            },
            "visual_tracking": {
                "title": "Visual Tracking & Anti-Regression Maze",
                "description": "Gaze-guided line-following games designed to reduce involuntary backward reading regressions.",
                "domain": "Oculomotor Reading Flow",
                "difficulty": "Beginner to Intermediate"
            },
            "working_memory_game": {
                "title": "Auditory & Visual Memory Sequencing",
                "description": "Multi-step letter and syllable recall challenges to bolster phonological working memory.",
                "domain": "Cognitive Working Memory",
                "difficulty": "Gamified"
            },
            "guided_paired_reading": {
                "title": "AI-Assisted Guided Oral Reading",
                "description": "Interactive read-aloud story with real-time pronunciation support and dyslexia-friendly font spacing.",
                "domain": "Contextual Reading",
                "difficulty": "Grade-Appropriate"
            }
        }

    def generate_plan(self, risk_score: float, shap_explanation: dict = None, metrics: dict = None) -> dict:
        """
        Generates an individualized educational intervention plan based on screening results.
        
        Args:
            risk_score: Estimated dyslexia risk probability (0.0 to 1.0)
            shap_explanation: Dictionary of SHAP feature contributions
            metrics: Raw multimodal features (hesitation, regressions, phonological scores)
            
        Returns:
            Dictionary containing recommended activities, priority focus areas, and daily schedule.
        """
        shap_explanation = shap_explanation or {}
        metrics = metrics or {}
        activities = []
        focus_areas = []

        # Categorize risk level
        if risk_score >= 0.70:
            risk_category = "High Risk Indicator"
            recommended_daily_minutes = 25
        elif risk_score >= 0.40:
            risk_category = "Moderate Risk Indicator"
            recommended_daily_minutes = 15
        else:
            risk_category = "Low Risk / Typical Progress"
            recommended_daily_minutes = 10

        # Rule 1: Speech Hesitation or Decoding Slowness
        if shap_explanation.get("speech_hesitation_rate", 0) > 0.05 or metrics.get("speech_hesitation_rate", 0) > 3.0:
            activities.append({**self.activity_library["rapid_sight_words"], "duration_min": 10, "priority": "High"})
            focus_areas.append("Oral Reading Fluency & Hesitation Reduction")

        # Rule 2: High Eye-Gaze Regressions (Visual Backtracking)
        if shap_explanation.get("n_regress_trial", 0) > 0.05 or metrics.get("n_regress_trial", 0) > 22:
            activities.append({**self.activity_library["visual_tracking"], "duration_min": 8, "priority": "High"})
            focus_areas.append("Oculomotor Tracking & Saccade Stabilization")

        # Rule 3: Phonological Decoding Weakness
        if shap_explanation.get("phonological_awareness_score", 0) > 0.05 or metrics.get("phonological_awareness_score", 100) < 65:
            activities.append({**self.activity_library["phonics_blending"], "duration_min": 12, "priority": "Critical"})
            focus_areas.append("Phonics Sound-Letter Association")

        # Rule 4: Working Memory Support
        if shap_explanation.get("cognitive_working_memory", 0) > 0.05 or metrics.get("cognitive_working_memory", 100) < 65:
            activities.append({**self.activity_library["working_memory_game"], "duration_min": 10, "priority": "Medium"})
            focus_areas.append("Auditory Working Memory Retention")

        # Baseline Guided Reading for all children
        activities.append({**self.activity_library["guided_paired_reading"], "duration_min": 10, "priority": "Daily Routine"})
        if not focus_areas:
            focus_areas.append("General Reading Confidence & Guided Stories")

        return {
            "risk_score": round(risk_score, 3),
            "risk_category": risk_category,
            "recommended_daily_minutes": recommended_daily_minutes,
            "primary_focus_areas": list(set(focus_areas)),
            "activities": activities
        }
