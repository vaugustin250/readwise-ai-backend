# ReadWise AI — Remediation Roadmap & Engineering Plan

**Document Version:** 1.0  
**Status:** PROPOSED (Pending User Approval)  
**Target Architecture:** Production-Grade Pediatric Screening System  

---

## 1. Overview and Objectives

This remediation plan addresses the verified defects, architectural gaps, and scientific inconsistencies identified during the ReadWise AI technical audit. The objective is to transition ReadWise AI from a prototype with simulated multimodal branches to a secure, scientifically defensible, production-ready educational screening system.

---

## 2. Phased Implementation Roadmap

```
+-----------------------------------------------------------------------------------+
| Phase 1: Security, Authentication & Persistent Database Storage                  |
| - Real JWT tokens, bcrypt password hashing, child-guardian access controls        |
| - PostgreSQL database with Alembic migrations; purge ephemeral SQLite dependency  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| Phase 2: Scientific Integrity & ML Inference Realignment                         |
| - Distinguish real ETDD70 gaze metrics from synthetic multimodal branches         |
| - Connect or formally decouple 1D-CNN+BiLSTM embeddings from XGBoost screener    |
| - Revise conference paper claims to reflect verified empirical metrics            |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| Phase 3: Native Mobile Sensor Parity (Android / iOS)                              |
| - Integrate camera and record plugins with runtime permission handling            |
| - Achieve functional parity between Flutter Web and native smartphone builds     |
| - Fix navigation argument passing in AssessmentSelectionScreen                   |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| Phase 4: Dynamic Cognitive Games & Real Longitudinal Tracking                      |
| - Compute real latency, accuracy, and working memory metrics from cognitive tasks |
| - Query real historical assessment trials from the database for progress charts   |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| Phase 5: PDF Dynamic Data Binding & Test Suite Remediation                        |
| - Bind PDF generator to database records rather than mock query parameters        |
| - Fix failing unit tests in ai_engine (speech analyzer and recommendation tests)  |
| - Add comprehensive mobile widget and integration tests                           |
+-----------------------------------------------------------------------------------+
```

---

## 3. Detailed Work Breakdown by Phase

### Phase 1: Security, Authentication & Persistent Database Storage
- **Task 1.1: Production Authentication Service**
  - Implement real user registration and login (`POST /api/v1/auth/register`, `POST /api/v1/auth/login`).
  - Use `passlib[bcrypt]` for secure password hashing and `python-jose` for signed JWT access tokens with expiration.
  - Replace the mock authentication check (`token == "mock-valid-token"`) in `backend_api/app/core/security.py`.
- **Task 1.2: Child-to-Guardian Authorization & IDOR Elimination**
  - Guard `/api/v1/assessments/screen` and `/api/v1/assessments/report/{child_id}` with `get_current_user`.
  - Validate that the requesting user is the registered guardian (`owner_id`) of `child_id`.
  - Reject unauthorized cross-child access attempts with HTTP 403 Forbidden.
- **Task 1.3: Version-Controlled Database Migrations (Alembic)**
  - Initialize Alembic (`alembic init alembic`) in `backend_api`.
  - Generate baseline version-controlled migration script matching `all_models.py`.
  - Remove runtime `Base.metadata.create_all(bind=engine)` from production startup.
- **Task 1.4: Persistent PostgreSQL Configuration**
  - Provision a persistent managed PostgreSQL instance (e.g., Supabase / Neon / Render PostgreSQL).
  - Update `.env` and `render.yaml` with the persistent connection string, eliminating data loss on container restarts.

*Acceptance Criteria:*
1. No mock tokens accepted by any API endpoint.
2. Cross-child data retrieval returns HTTP 403.
3. Database schema managed strictly via `alembic upgrade head`.
4. Stored records persist across container restarts.

---

### Phase 2: Scientific Integrity & ML Inference Realignment
- **Task 2.1: Resolve Embedding Branch Disconnect**
  - Address `gaze_emb_0` through `gaze_emb_7` hardcoded to `0.5` in `backend_api/app/api/v1/endpoints/assessments.py`:
    - *Option A:* Build a live inference wrapper for `best_cnn_lstm_gaze_model.pt` that takes raw coordinate arrays and outputs 32-dim/8-dim embeddings.
    - *Option B:* Retrain the master XGBoost screener strictly on verified tabular biomechanical and acoustic metrics without requiring uncomputed neural embeddings.
- **Task 2.2: Paper Manuscript Correction & Truth in Advertising**
  - Update Table 1 and Section V in `docs/conference_paper_manuscript.md` and `docs/section_v_results_and_discussion.md`.
  - Document the verified empirical benchmark on ETDD70 (ROC-AUC ~0.83–0.85, Accuracy ~73–79%).
  - Clearly identify speech and cognitive multimodal fusion experiments as simulated pedagogical extensions, distinguishing them from verified patient-level datasets.
- **Task 2.3: Safe Handling of Missing Modalities**
  - Implement imputation or modular sub-models in `RecommendationEngine` and `assessments.py` when audio or video is unavailable.

*Acceptance Criteria:*
1. Zero hardcoded embedding constants (`0.5`) in the inference path.
2. Scientific documentation matches independently reproducible cross-validation code.
3. Model handles missing sensory inputs gracefully with confidence score adjustments.

---

### Phase 3: Native Mobile Sensor Parity (Android / iOS)
- **Task 3.1: Native Camera and Microphone Plugins**
  - Add `camera: ^0.11.0+2`, `record: ^5.2.0`, and `permission_handler: ^11.3.1` to `mobile/pubspec.yaml`.
  - Implement real hardware access in `mobile/lib/services/sensor_manager_io.dart`.
  - Replace the static placeholder icon and sine-wave audio simulator on Android/iOS with real camera preview and microphone decibel tracking.
- **Task 3.2: Fix Assessment Selection Navigation Arguments**
  - Update `mobile/lib/screens/assessment_selection_screen.dart` line 70:
    ```dart
    Navigator.pushNamed(context, route, arguments: child);
    ```
  - Ensure the selected child profile is forwarded to `ReadingAssessmentScreen` and `ResultsScreen`.
- **Task 3.3: Native Android Permissions and Lifecycles**
  - Verify camera and microphone runtime permission prompts on physical Android devices.
  - Handle camera controller pause/resume on Android app lifecycle state changes.

*Acceptance Criteria:*
1. Physical Android devices display live front-facing camera preview and reactive audio metering.
2. Selected child profile propagates correctly throughout assessment screens.

---

### Phase 4: Dynamic Cognitive Games & Real Longitudinal Tracking
- **Task 4.1: Multi-Trial Cognitive Assessment Engine**
  - Refactor `CognitiveGameScreen` into a structured, timed 10-trial test evaluating:
    - Letter discrimination latency (ms)
    - Phonological sound-symbol matching accuracy (%)
    - Working memory sequence recall span
  - Pass the calculated cognitive and phonological scores to `AssessmentService`.
- **Task 4.2: Real Database-Backed Longitudinal History**
  - Add backend endpoint `GET /api/v1/assessments/history/{child_id}` querying `Assessment` and `Metrics` tables.
  - Update `ProfileRepository.getProgressHistory` to fetch and parse actual historical records.
  - Replace the hardcoded 4-week recovery simulation in `ProgressDashboardScreen` with dynamic chronological data.

*Acceptance Criteria:*
1. Cognitive game scores reflect real child reaction time and accuracy.
2. Longitudinal dashboard reflects actual completed assessment records.

---

### Phase 5: PDF Dynamic Data Binding & Test Suite Remediation
- **Task 5.1: Bind PDF Generator to Stored Database Records**
  - Refactor `GET /api/v1/assessments/report/{child_id}` in `assessments.py`.
  - Query the child's latest `Assessment` and `Metrics` from the database.
  - Pass stored risk scores, SHAP explanations, and actual measured regressions to `DyslexiaReportGenerator`, eliminating synthetic ternary defaults.
- **Task 5.2: Fix Failing AI Engine Unit Tests**
  - Update `test_speech_mock_pipeline` in `test_extractors.py` to match the expected status string.
  - Update `test_recommendation.py` to iterate over `plan["activities"]` rather than the top-level dictionary.
  - Verify all 7 tests in `ai_engine` pass.
- **Task 5.3: Expand Flutter Mobile Test Suite**
  - Add widget tests for `ReadingAssessmentScreen`, `ParentDashboardScreen`, and `LoginScreen`.
  - Test offline network fallbacks and validation error states.

*Acceptance Criteria:*
1. Downloaded PDF reflects exact database metrics of the specific assessment trial.
2. `pytest ai_engine` executes with 100% passing tests (0 failures).
3. Mobile test suite covers all primary user journeys.

---

## 4. Implementation Schedule and Effort Estimates

| Phase | Description | Estimated Effort | Risk Level | Prerequisites |
| :---: | :--- | :---: | :---: | :--- |
| **Phase 1** | Security, Auth, Persistent DB & Migrations | 3–4 Days | High | Cloud PostgreSQL instance |
| **Phase 2** | Scientific Integrity & ML Pipeline Realignment | 3–4 Days | Medium | Access to model training scripts |
| **Phase 3** | Native Mobile Hardware Sensor Parity | 4–5 Days | Medium | Android physical test device |
| **Phase 4** | Cognitive Games & Longitudinal Database Integration | 3–4 Days | Low | Phase 1 (Persistent DB) |
| **Phase 5** | PDF Dynamic Binding & Test Suite Repair | 2–3 Days | Low | Phase 1 & Phase 4 |
| **Total** | Complete System Remediation | **15–20 Days** | — | — |
