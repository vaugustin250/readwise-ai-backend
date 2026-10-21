# ReadWise AI — Full Technical Audit & Architecture Review

**Audit Date:** 2026-10-21  
**Auditor:** Senior Software Architect, ML Engineer, Database Engineer, AI Research Reviewer  
**Repository:** `https://github.com/vaugustin250/readwise-ai-backend.git`  
**Target Architecture:** Smartphone-based Multimodal Dyslexia Screening System  
**Audit Status:** COMPLETE — AWAITING USER APPROVAL PRIOR TO REMEDIATION  

---

## 1. Executive Summary

ReadWise AI is conceptualized as a smartphone-based multimodal screening and educational support system designed to assess pediatric dyslexia risk by combining eye-tracking biomechanics, oral reading speech fluency, and cognitive evaluations.

This comprehensive technical audit evaluated the entire codebase, including Flutter mobile applications, FastAPI backend services, database schemas, deep learning training notebooks, dataset structures, and scientific conference manuscripts.

### Key Audit Findings

1. **Acoustic and Cognitive Multimodal Features are Synthetically Injected:** The benchmark dataset used for validation (**ETDD70**) is exclusively an ocular eye-tracking dataset (70 subjects, 210 trials). The oral reading speech fluency metrics (`speech_hesitation_rate`, `speech_phoneme_stability`) and cognitive assessment scores (`cognitive_working_memory`, `phonological_awareness_score`) used in training the master multimodal classifier and presented in the conference paper were generated via synthetic Gaussian distributions (`np.random.normal`) separated by the ground-truth target label. As a result, the near-perfect metrics reported in Table 1 of the paper (ROC-AUC **0.985 ± 0.013** for XGBoost, and **1.000 ± 0.000** for Random Forest / Logistic Regression) are artifacts of synthetic feature separation and do not reflect real pediatric patient data.
2. **Real Empirical ETDD70 Benchmark:** When evaluated strictly on the verified subject-level eye-tracking data under 5-Fold GroupKFold cross-validation, Logistic Regression achieves **0.854 ± 0.061** ROC-AUC, Random Forest achieves **0.845 ± 0.044**, and XGBoost achieves **0.828 ± 0.065**.
3. **Deep Gaze Latent Embeddings Are Bypassed in Production:** In the live cloud backend (`backend_api/app/api/v1/endpoints/assessments.py`), the 8 latent gaze embeddings (`gaze_emb_0` through `gaze_emb_7`) expected from the 1D-CNN + BiLSTM neural network (`best_cnn_lstm_gaze_model.pt`) are hardcoded to the constant `0.5` during inference. The trained PyTorch model is never invoked in the API.
4. **Authentication and Authorization are Mocked:** Production API authentication is simulated via a hardcoded token check (`token == "mock-valid-token"`). There is no JWT verification, no password hashing, no user registration endpoint, and no child-to-guardian access boundary enforcement, creating an Insecure Direct Object Reference (IDOR) vulnerability on assessment records and PDF reports.
5. **Mobile Sensor Disparity Across Platforms:** Camera and microphone acquisition are implemented for Flutter Web (`sensor_manager_web.dart`), but native mobile platforms (Android/iOS) fall back to `IOSensorManager`, which does not initialize device cameras or microphones, rendering native builds non-functional for sensor capture.
6. **Simulated Progress and Report Features:** The progress tracking screen displays a hardcoded 4-week recovery simulation rather than database-stored longitudinal data. Similarly, the downloadable clinical PDF report endpoint synthesizes metrics from query parameters using ternary operators rather than querying stored assessment records.
7. **Test Failures in AI Engine:** While the backend and mobile test suites pass their existing tests, 4 of 7 unit tests in `ai_engine` fail due to schema mismatches between test assertions and recent engine refactors.

---

## 2. Repository and Architecture Inventory

### 2.1 File and Directory Structure
```
d:\dyslexia
├── ai_engine/
│   ├── data/etdd70/                 # Real ETDD70 benchmark dataset (processed & raw)
│   ├── extractors/
│   │   ├── camera_analyzer.py       # Camera analyzer prototype (mocked return)
│   │   ├── speech_analyzer.py       # Whisper speech analyzer (not used in API)
│   │   └── test_extractors.py       # Unit tests for extractors (1 failing test)
│   ├── fusion/
│   │   ├── recommendation_engine.py # Educational learning plan generator
│   │   └── test_recommendation.py   # Recommendation tests (3 failing tests)
│   ├── models/
│   │   ├── saved_models/            # Trained .joblib models
│   │   └── train_pipeline.py        # ETDD70 GroupKFold cross-validation pipeline
│   └── reports/
│       └── pdf_generator.py         # ReportLab PDF clinical assessment generator
├── backend_api/
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   │   ├── assessments.py       # /screen and /report endpoints
│   │   │   └── profiles.py          # Child profiles CRUD
│   │   ├── core/                    # Config, database, mock security
│   │   ├── models/all_models.py     # SQLAlchemy models (User, Profile, Assessment, Metrics)
│   │   └── schemas/all_schemas.py   # Pydantic validation schemas
│   └── tests/                       # Pytest test suite (6 passing tests)
├── mobile/
│   ├── lib/
│   │   ├── models/                  # ChildProfile, AssessmentResult
│   │   ├── repositories/            # AssessmentService, ProfileRepository
│   │   ├── screens/                 # 10 Flutter UI screens
│   │   ├── services/                # SensorManager (web vs io conditional export)
│   │   └── widgets/                 # Custom buttons, Parental consent dialog
│   └── test/                        # Flutter tests (3 passing tests)
├── notebooks/
│   ├── 01_cnn_lstm_gaze_training.ipynb
│   ├── 02_speech_intelligence_wav2vec_training.ipynb
│   └── 03_multimodal_fusion_xgboost_xai.ipynb
├── docs/                            # Manuscript, implementation plans, guides
└── best_cnn_lstm_gaze_model.pt      # PyTorch checkpoint (734 KB)
```

### 2.2 Feature-to-Code Traceability Matrix

| Requirement / Architecture Component | Implementation File | Status | Evidence / Notes |
| :--- | :--- | :---: | :--- |
| **Gaze Sequence Encoding (1D-CNN+BiLSTM)** | `notebooks/01_cnn_lstm_gaze_training.ipynb`<br>`best_cnn_lstm_gaze_model.pt` | `PARTIALLY IMPLEMENTED` | PyTorch checkpoint exists; not called in backend inference pipeline. |
| **Speech Fluency & Hesitation Extraction** | `ai_engine/extractors/speech_analyzer.py`<br>`mobile/lib/services/sensor_manager_web.dart` | `PARTIALLY IMPLEMENTED` | Implemented in Web Audio API on Flutter Web and Whisper prototype; not connected in backend API. |
| **Multimodal Intermediate XGBoost Fusion** | `multimodal_xgboost_screener.joblib`<br>`backend_api/.../assessments.py` | `PARTIALLY IMPLEMENTED` | Deployed and running; 8 gaze embedding inputs are hardcoded to `0.5`. |
| **Native Tree SHAP Explanations** | `backend_api/.../assessments.py:114` | `VERIFIED WORKING` | Computed via native XGBoost C++ API (`pred_contribs=True`). |
| **Targeted Remediation Engine** | `ai_engine/fusion/recommendation_engine.py` | `VERIFIED WORKING` | Dynamically maps risk score and SHAP attributions to multi-week study plans. |
| **Automated PDF Clinical Report** | `ai_engine/reports/pdf_generator.py`<br>`backend_api/.../assessments.py:189` | `PARTIALLY IMPLEMENTED` | PDF generates successfully; receives mock ternary data rather than database records. |
| **Parental Consent Gate** | `mobile/lib/widgets/parental_consent_dialog.dart` | `VERIFIED WORKING` | Blocks sensor acquisition until consent is confirmed. |
| **Child Profile Management** | `backend_api/.../profiles.py`<br>`mobile/.../profile_repository.dart` | `VERIFIED WORKING` | Profiles are created and listed against database. |
| **Authentication & Session Tokens** | `backend_api/app/core/security.py` | `VERIFIED DEFECT` | Checks static token string `"mock-valid-token"`; no JWT or bcrypt. |
| **Native Mobile Camera & Audio** | `mobile/lib/services/sensor_manager_io.dart` | `VERIFIED DEFECT` | Android/iOS falls back to placeholder icon and sine-wave simulator. |
| **Longitudinal Recovery Dashboard** | `mobile/lib/screens/progress_dashboard_screen.dart` | `VERIFIED DEFECT` | Hardcoded 4-week simulation; does not query historical assessment database. |
| **Database Migrations** | `backend_api/app/main.py` | `VERIFIED DEFECT` | Uses `create_all`; Alembic migration directory is completely missing. |

---

## 3. Implemented Versus Incomplete Features

### Implemented & Verified
- **Flutter Web Multimodal Sensor Acquisition:** Live front-facing camera preview (`package:web`, `HTMLVideoElement`) and real-time Web Audio API decibel metering (`AudioContext`, `AnalyserNode`).
- **Interactive Reading Passage with Regression Tracking:** Word-level tokenization; backward taps trigger real regression increments (`n_regress_trial`) and dwell time measurement.
- **Render Cloud Backend Inference:** FastAPI backend successfully hosted on Render (`https://readwise-ai-backend.onrender.com`), serving live predictions with 17 features.
- **Native XGBoost Tree SHAP Attribution:** Fast, crash-free computation of Shapley feature attributions returning negative/positive risk weights for all inputs.
- **Parental Consent & Regulatory Framing:** Prominent disclaimers frame outputs strictly as educational screening estimates, adhering to SaMD / FDA pre-diagnostic boundaries.

### Incomplete or Defective
- **Native Mobile Camera/Audio Capture:** Native smartphone users receive simulated data; no native camera or recording plugins exist in `pubspec.yaml`.
- **Deep Neural Gaze Feature Ingestion:** The 1D-CNN+BiLSTM model weights are never loaded by the API; embeddings are defaulted to constant `0.5`.
- **Real Speech Intelligence in Backend:** Speech features submitted to backend rely on frontend timing rather than Whisper transcription or phoneme stability analysis.
- **Cognitive Games Scoring:** `CognitiveGameScreen` is a 1-letter visual demo ('b' vs 'd','p','q') that computes no score, working memory metric, or latency.
- **User Authentication & Authorization:** Registration and token validation are entirely non-functional; child records are unprotected against IDOR attacks.
- **Persistent Production Database:** Render deployment defaults to local SQLite (`test.db`), which is wiped whenever the container restarts.
- **Longitudinal Tracking:** Progress charts do not query stored database records.

---

## 4. Test Execution Results and Evidence

Detailed execution outputs are cataloged in [`audit/TEST_RESULTS.md`](file:///d:/dyslexia/audit/TEST_RESULTS.md).

### 4.1 Backend Test Suite (`pytest backend_api/tests`)
- **Result:** 6 passed, 0 failed in 4.88s.
- **Coverage:** Basic root endpoint, unauthorized profile creation, mock-token authorized profile creation, typical reader screening, at-risk reader screening, and SQLite persistence.

### 4.2 AI Engine Test Suite (`pytest ai_engine`)
- **Result:** 3 passed, 4 failed in 1.08s (`VERIFIED DEFECT`).
- **Failures:**
  1. `test_speech_mock_pipeline`: String mismatch (`'simulated' != 'success'`).
  2. `test_high_hesitation_fluency_plan`: `TypeError: string indices must be integers` (dict structure mismatch).
  3. `test_high_regression_vision_plan`: `TypeError: string indices must be integers`.
  4. `test_low_risk_general_plan`: `AssertionError: 5 != 1`.

### 4.3 Mobile Test Suite (`flutter test`)
- **Result:** 3 passed, 0 failed in 8.5s.
- **Coverage:** Model deserialization, report URL formatting, onboarding widget launch. Comprehensive UI interaction tests are missing.

### 4.4 Static Analysis (`flutter analyze`)
- **Result:** 0 issues found (clean analysis).

---

## 5. AI Model and Dataset Audit

### 5.1 Dataset Authenticity: ETDD70
The benchmark dataset in `ai_engine/data/etdd70/processed/etdd70_trials.csv` contains 210 trials from 70 participants (35 dyslexic, 35 non-dyslexic). The dataset contains 11 verified eye-tracking metrics:
- `n_fix_trial`, `sum_fix_dur_trial`, `dwell_time_trial`, `mean_fix_dur_trial`, `n_sacc_trial`, `sum_sacc_dur_trial`, `mean_sacc_dur_trial`, `mean_sacc_ampl_trial`, `ratio_progress_regress_trial`, `n_regress_trial`, `n_progress_trial`.

### 5.2 Synthetic Feature Contamination in Training Notebooks
In `notebooks/03_multimodal_fusion_xgboost_xai.ipynb` (Cell 2), the following synthetic data injection was identified:
```python
# 2.3 Add Speech Fluency & Cognitive Game Features (Paper Multimodal Branch)
np.random.seed(42)
trials_df['speech_hesitation_rate'] = np.where(trials_df['target'] == 1, np.random.normal(4.8, 0.9, len(trials_df)), np.random.normal(1.9, 0.5, len(trials_df)))
trials_df['speech_phoneme_stability'] = np.where(trials_df['target'] == 1, np.random.normal(-0.7, 0.3, len(trials_df)), np.random.normal(0.8, 0.2, len(trials_df)))
trials_df['cognitive_working_memory'] = np.where(trials_df['target'] == 1, np.random.normal(58, 8, len(trials_df)), np.random.normal(82, 7, len(trials_df)))
trials_df['phonological_awareness_score'] = np.where(trials_df['target'] == 1, np.random.normal(52, 9, len(trials_df)), np.random.normal(85, 6, len(trials_df)))
```
Similarly, in `notebooks/02_speech_intelligence_wav2vec_training.ipynb` (Cell 3), all acoustic sequences were generated via `np.random.normal` and `np.random.binomial` based on `is_dyslexic = 1 if sid > 35 else 0`.

### 5.3 Model Artifact Audit
- **`best_cnn_lstm_gaze_model.pt` (734 KB):** PyTorch state dict containing valid trained weights for a 1D-CNN + 2-layer Bi-LSTM with an embedding head and classifier. This artifact is verified present on disk but disconnected from production inference.
- **`multimodal_xgboost_screener.joblib` (87 KB):** Scikit-learn XGBClassifier trained on 17 features. Deployed and functioning on Render, but reliant on 8 dummy constant inputs (`gaze_emb_i = 0.5`).
- **`etdd70_rf_screener.joblib` (379 KB):** Pure Random Forest model trained on the 11 authentic ETDD70 gaze features.

---

## 6. Multimodal Integration Audit

| Modality | Intended Signal | Actual Implementation | Real Features Extracted | Final Fusion Status |
| :--- | :--- | :--- | :---: | :--- |
| **1. Camera / Gaze** | Front camera gaze tracking & regressions | Web: `<video>` preview + tap tracking.<br>Native: Static icon. | `dwell_time_trial`, `n_regress_trial` | Real tabular metrics reach XGBoost; deep neural embeddings are bypassed (`0.5`). |
| **2. Speech Fluency** | Oral reading pauses and phoneme stability | Web: Web Audio API decibel VU meter.<br>Native: Sine-wave timer simulation. | Measured pause rate (Web only) | Measured hesitation rate reaches XGBoost. |
| **3. Reading Metrics** | Words per minute, progress/regress ratio | Screen timer and token tracker | `dwell_time_trial` | Reaches XGBoost. |
| **4. Cognitive Tasks** | Working memory & phonological awareness | Letter reversal screen ('b' vs 'd') | None (No scores computed) | Hardcoded client defaults (`82.0`, `78.0`) sent to API. |
| **5. Parent Questionnaire**| Family history and behavioral indicators | Form fields in Add Child screen | None (Not stored or passed) | Modality not present in model schema. |

---

## 7. Database and Backend Audit

1. **Schema Design:** `User`, `ChildProfile`, `Assessment`, and `Metrics` tables in `all_models.py` have sound relational foreign keys.
2. **Missing Migrations:** No version control exists for the schema. `Base.metadata.create_all` is executed on application startup.
3. **Database URL & Ephemeral Persistence:** On Render, `DATABASE_URL` defaults to SQLite (`sqlite:///./test.db`). Render instances run on ephemeral containers with read-write disk layers that are destroyed on redeployment or sleep cycles, resulting in total data loss.
4. **Duplicate Submissions:** No idempotency keys or transaction locks prevent duplicate assessment submissions from being inserted repeatedly.
5. **Report Generation Data Flow:** `GET /api/v1/assessments/report/{child_id}` does not query the `Metrics` table; it constructs synthetic metrics via ternary expressions based on query parameters.

---

## 8. Security and Privacy Findings

1. **Hardcoded Mock Authentication (`VERIFIED DEFECT` - High Severity):**
   `backend_api/app/core/security.py` authenticates any caller sending `'Authorization: Bearer mock-valid-token'`. Any other token returns HTTP 401. No cryptographic signature or expiry is validated.
2. **Insecure Direct Object Reference (IDOR) (`VERIFIED DEFECT` - High Severity):**
   Neither `/api/v1/assessments/screen` nor `/api/v1/assessments/report/{child_id}` validates user identity or ownership. An unauthenticated attacker can submit assessments or download clinical PDF reports for any child ID.
3. **Child Privacy & COPPA Compliance (`PARTIALLY IMPLEMENTED` - Medium Severity):**
   A parental consent gate is enforced before sensor activation in the UI. However, backend records lack audit logs verifying when and by whom consent was granted.
4. **Default Secret Key in Repository (`VERIFIED DEFECT` - Medium Severity):**
   `SECRET_KEY="super-secret-key-change-in-production"` is committed in `.env` and defaults to `"secret"` in `config.py`.

---

## 9. Research Validity and Reproducibility Assessment

| Manuscript Claim | Paper Value | Verified Empirical Value | Reproducibility Finding |
| :--- | :---: | :---: | :--- |
| **XGBoost ROC-AUC** | 0.985 ± 0.013 | **0.828 ± 0.065** | Inflated by synthetic Gaussian features in Notebook 3. |
| **Random Forest ROC-AUC** | 1.000 ± 0.000 | **0.845 ± 0.044** | Perfect 1.000 score caused by artificial class separation. |
| **Logistic Regression ROC-AUC**| 1.000 ± 0.000 | **0.854 ± 0.061** | Perfect 1.000 score caused by artificial class separation. |
| **Dataset Size** | 70 subjects, 210 trials | 70 subjects, 210 trials | Real ETDD70 ocular dataset verified present on disk. |
| **Audio Dataset** | Wav2Vec2 on pediatric reading | 0 real audio files | Notebook 2 generated synthetic numpy arrays. |

**Scientific Assessment:** The research claims in the conference manuscript regarding near-perfect multimodal accuracy (98.5%–100%) are scientifically invalid because the non-ocular features were artificially generated with pre-separated means based directly on the label. However, the unimodal eye-tracking performance on ETDD70 (ROC-AUC ~0.83–0.85) is genuine, reproducible, and aligns with established academic literature on ocular dyslexia screening.

---

## 10. Prioritized Defect Register

| Defect ID | Severity | Status | Subsystem | Description & Evidence | Remediation Action |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **DEF-001** | CRITICAL | `VERIFIED DEFECT` | Backend Auth | Mock authentication accepting `"mock-valid-token"`. | Implement real JWT with bcrypt password hashing. |
| **DEF-002** | CRITICAL | `VERIFIED DEFECT` | Backend Auth | IDOR on `/screen` and `/report/{child_id}`. | Enforce guardian ownership checks on all endpoints. |
| **DEF-003** | CRITICAL | `VERIFIED DEFECT` | Database | Ephemeral SQLite storage on Render causing data loss. | Configure persistent managed PostgreSQL instance. |
| **DEF-004** | HIGH | `VERIFIED DEFECT` | Mobile Sensors| Native Android/iOS falls back to dummy sine-wave simulator. | Integrate `camera` and `record` native plugins. |
| **DEF-005** | HIGH | `VERIFIED DEFECT` | AI Engine | 8 neural gaze embeddings hardcoded to `0.5` in API. | Integrate CNN-LSTM inference or retrain without embeddings. |
| **DEF-006** | HIGH | `VERIFIED DEFECT` | Mobile UI | `AssessmentSelectionScreen` omits child navigation arguments. | Pass `arguments: child` in `Navigator.pushNamed`. |
| **DEF-007** | MEDIUM | `VERIFIED DEFECT` | AI Engine Tests| 4 unit tests failing in `ai_engine`. | Update test assertions to match refactored dictionary schemas. |
| **DEF-008** | MEDIUM | `VERIFIED DEFECT` | Backend Reports| PDF report generator uses mock ternary metrics. | Query stored database assessment records for report fields. |
| **DEF-009** | MEDIUM | `VERIFIED DEFECT` | Mobile UI | Longitudinal progress screen displays hardcoded 4-week data. | Add historical trials endpoint and dynamic chart binding. |
| **DEF-010** | MEDIUM | `VERIFIED DEFECT` | Mobile UI | Cognitive game screen computes no metrics or scores. | Implement multi-trial timed letter/memory test. |
| **DEF-011** | LOW | `VERIFIED DEFECT` | Database | Missing version-controlled database migrations (Alembic). | Initialize Alembic and create baseline migration. |

---

## 11. Production-Readiness Assessment by Subsystem

| Subsystem | Readiness Score | Production Status | Critical Blocker |
| :--- | :---: | :---: | :--- |
| **FastAPI Backend Core** | 65% | `PARTIALLY IMPLEMENTED` | Mock authentication and IDOR vulnerabilities. |
| **PostgreSQL Database** | 40% | `NOT PRODUCTION READY` | Running on ephemeral SQLite with no migrations. |
| **Flutter Mobile (Web)** | 80% | `VERIFIED WORKING` | Functioning camera HUD, Web Audio API VU meter, and regression tracking. |
| **Flutter Mobile (Native)** | 35% | `NOT PRODUCTION READY` | Hardware sensors missing; falls back to static simulation. |
| **Multimodal ML Inference** | 60% | `PARTIALLY IMPLEMENTED` | Gaze embeddings bypassed with constant `0.5`. |
| **Explainable AI (SHAP)** | 95% | `VERIFIED WORKING` | Native C++ Tree SHAP fully operational. |
| **Personalized Remediation**| 90% | `VERIFIED WORKING` | Recommendation engine produces adaptive multi-week plans. |
| **Clinical PDF Reporting** | 70% | `PARTIALLY IMPLEMENTED` | PDF engine operational; data source must be bound to database. |
| **Scientific Manuscript** | 40% | `REQUIRES REVISION` | Paper claims inflated metrics derived from synthetic features. |

---

## 12. Recommended Remediation Roadmap

The complete phased technical execution plan, dependency graph, and verification criteria are detailed in [`audit/REMEDIATION_PLAN.md`](file:///d:/dyslexia/audit/REMEDIATION_PLAN.md).

### Summary of Phases:
- **Phase 1:** Security, Authentication, Child-Guardian Access Controls & Persistent PostgreSQL (Days 1–4).
- **Phase 2:** Scientific Integrity & Model Inference Alignment (Days 5–8).
- **Phase 3:** Native Mobile Hardware Sensor Parity on Android/iOS (Days 9–13).
- **Phase 4:** Dynamic Cognitive Games & Real Longitudinal History Integration (Days 14–17).
- **Phase 5:** PDF Dynamic Data Binding & Test Suite Remediation (Days 18–20).

---

## 13. Audit Conclusion & Next Steps

In accordance with Critical Rule 3 (*"Do not modify application code during this audit"*) and the directive to present findings and ask for approval before implementing fixes, no code changes were executed during this audit.

**Immediate Action Required:**
Please review the findings above, particularly regarding the authentication refactor, persistent PostgreSQL configuration, native sensor integration, and conference paper metric alignment. Once approved, remediation can proceed according to the roadmap in `audit/REMEDIATION_PLAN.md`.
