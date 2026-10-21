import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_typical_reader_screening():
    """Tests that a typical reader profile returns low risk and general reading guidance."""
    payload = {
        "child_id": 101,
        "task_type": "T4_Meaningful_Text",
        "dwell_time_trial": 65000.0,
        "n_regress_trial": 12.0,
        "mean_fix_dur_trial": 410.0,
        "ratio_progress_regress_trial": 8.0,
        "mean_sacc_ampl_trial": 98.0,
        "speech_hesitation_rate": 1.2,
        "speech_phoneme_stability": 0.85,
        "cognitive_working_memory": 88.0,
        "phonological_awareness_score": 90.0
    }
    response = client.post("/api/v1/assessments/screen", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["child_id"] == 101
    assert data["risk_probability"] < 0.40
    assert "Low Risk" in data["screening_level"]
    assert "EDUCATIONAL SCREENING ESTIMATE ONLY" in data["disclaimer"]
    assert "activities" in data["personalized_learning_plan"]

def test_at_risk_reader_screening_and_intervention():
    """Tests that an at-risk profile flags high risk and prescribes targeted phonics/visual exercises."""
    payload = {
        "child_id": 202,
        "task_type": "T4_Meaningful_Text",
        "dwell_time_trial": 145000.0,
        "n_regress_trial": 38.0,
        "mean_fix_dur_trial": 560.0,
        "ratio_progress_regress_trial": 3.2,
        "mean_sacc_ampl_trial": 65.0,
        "speech_hesitation_rate": 5.8,
        "speech_phoneme_stability": -0.65,
        "cognitive_working_memory": 52.0,
        "phonological_awareness_score": 48.0
    }
    response = client.post("/api/v1/assessments/screen", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["child_id"] == 202
    assert data["risk_probability"] >= 0.70
    assert "High Dyslexia Risk" in data["screening_level"]
    
    # Verify SHAP explanations exist
    shap_vals = data["feature_contributions_shap"]
    assert len(shap_vals) > 0
    
    # Verify intervention plan targets specific areas
    plan = data["personalized_learning_plan"]
    assert plan["recommended_daily_minutes"] >= 20
    activities = plan["activities"]
    activity_titles = [act["title"] for act in activities]
    assert any("Phonics" in t for t in activity_titles)
    assert any("Visual Tracking" in t for t in activity_titles)

def test_assessment_database_persistence():
    """Tests that assessment executions are persisted into database tables."""
    from app.core.database import SessionLocal
    from app.models.all_models import Assessment, Metrics

    payload = {
        "child_id": 999,
        "task_type": "T4_Meaningful_Text",
        "dwell_time_trial": 80000.0,
        "n_regress_trial": 15.0,
        "mean_fix_dur_trial": 420.0,
        "ratio_progress_regress_trial": 7.0,
        "mean_sacc_ampl_trial": 90.0,
        "speech_hesitation_rate": 1.5,
        "speech_phoneme_stability": 0.7,
        "cognitive_working_memory": 85.0,
        "phonological_awareness_score": 85.0
    }
    response = client.post("/api/v1/assessments/screen", json=payload)
    assert response.status_code == 200

    db = SessionLocal()
    try:
        latest_assessment = db.query(Assessment).filter(Assessment.profile_id == 999).order_by(Assessment.id.desc()).first()
        assert latest_assessment is not None
        assert latest_assessment.status == "completed"
        
        metrics = db.query(Metrics).filter(Metrics.assessment_id == latest_assessment.id).first()
        assert metrics is not None
        assert metrics.risk_score is not None
        assert metrics.confidence_score is not None
        assert metrics.shap_json is not None
        assert metrics.learning_plan_json is not None
    finally:
        db.close()

