# ReadWise AI - Architecture & Design

## 1. System Architecture

The ReadWise AI platform is composed of 5 distinct modular layers:

1.  **Mobile Client (Flutter):**
    - Handles UI/UX, camera access, microphone access, and on-device logic for interactive cognitive games.
2.  **Backend Services (FastAPI):**
    - RESTful APIs to handle requests from the mobile app. Manages data persistence, orchestration of AI tasks, and reporting.
3.  **AI Engine (Python):**
    - **Vision Component:** OpenCV & MediaPipe for facial landmarks and gaze tracking during reading.
    - **Audio Component:** Whisper model for transcribing child's speech and analyzing phonetic accuracy.
    - **ML Fusion Component:** XGBoost to combine visual, audio, cognitive, and questionnaire features into a single risk score.
    - **Explainability Component:** SHAP to provide feature importance (e.g., "slow reading speed contributed +12% to risk").
4.  **Data Layer (PostgreSQL):**
    - Relational database storing user accounts, child profiles, raw assessment data, prediction results, and longitudinal progress.
5.  **Cloud/Integration Layer (Firebase):**
    - Firebase Auth for secure login and Firebase Storage for temporary processing of large media files.

## 2. Data Flow

1. **Data Collection:** Child performs tasks on the Flutter app (reading out loud, answering cognitive games).
2. **Feature Extraction:**
   - Audio is sent to the backend/AI engine -> Whisper extracts speech features.
   - Video/Frame data (or pre-extracted gaze vectors from device) -> MediaPipe extracts eye regressions and fixations.
   - Cognitive games -> Backend calculates scores.
3. **Fusion & Inference:** Features are concatenated into a unified vector. XGBoost model predicts Dyslexia Risk Score.
4. **Explanation:** SHAP analyzes the prediction and generates contributing factors.
5. **Personalization:** Based on the lowest scoring features (e.g., phonics, regressions), a personalized learning plan is generated.
6. **Feedback Loop:** Data is saved to PostgreSQL, and the Flutter app presents the XAI breakdown and learning plan to the parent.

## 3. API Contracts (Draft)

### Mobile to Backend API
*   `POST /api/v1/profiles` - Create a new child profile.
*   `GET /api/v1/profiles/{id}` - Fetch profile details.
*   `POST /api/v1/assessments/start` - Initialize a new assessment session.
*   `POST /api/v1/assessments/{id}/speech` - Upload audio chunk/file for Whisper processing.
*   `POST /api/v1/assessments/{id}/vision` - Upload gaze features or video frames for MediaPipe processing.
*   `POST /api/v1/assessments/{id}/cognitive` - Submit cognitive game scores.
*   `POST /api/v1/assessments/{id}/questionnaire` - Submit parent questionnaire.
*   `GET /api/v1/assessments/{id}/results` - Retrieve the calculated Risk Score, SHAP explanations, and the generated Personalized Plan.
*   `GET /api/v1/profiles/{id}/progress` - Fetch longitudinal progress data for charts.

## 4. PostgreSQL Schema Design

*   **Users:** `user_id`, `email`, `password_hash`, `role` (Parent/Teacher), `created_at`
*   **ChildProfiles:** `profile_id`, `user_id` (FK), `name`, `age`, `grade`, `language`, `created_at`
*   **Assessments:** `assessment_id`, `profile_id` (FK), `date`, `status`
*   **ReadingResults:** `id`, `assessment_id` (FK), `speed_wpm`, `hesitations`, `omissions`, `word_errors`
*   **SpeechResults:** `id`, `assessment_id` (FK), `pronunciation_accuracy`, `substitutions`, `pauses`
*   **EyeTrackingResults:** `id`, `assessment_id` (FK), `total_fixations`, `avg_fixation_duration`, `regressions`, `gaze_stability`
*   **CognitiveResults:** `id`, `assessment_id` (FK), `letter_recognition_score`, `memory_score`, `phonological_score`
*   **RiskPredictions:** `id`, `assessment_id` (FK), `risk_score`, `confidence`, `category`
*   **Explanations:** `id`, `prediction_id` (FK), `feature_name`, `contribution_value` (SHAP value)
*   **LearningPlans:** `plan_id`, `profile_id` (FK), `created_at`, `active`
*   **Activities:** `activity_id`, `plan_id` (FK), `type` (phonics, reading), `duration_mins`, `status` (pending, completed)
*   **ProgressRecords:** `id`, `profile_id` (FK), `metric_type`, `value`, `recorded_date`

## 5. Technical Risks & Mitigations

1.  **Smartphone Gaze-Estimation Accuracy:**
    *   *Risk:* Front-facing cameras lack infrared depth, making precise line-by-line tracking difficult.
    *   *Mitigation:* Focus on macro-patterns (e.g., significant backward gaze jumps / regressions) rather than exact word-level coordinate precision. Frame this as an investigatory limitation in the research report.
2.  **Child Speech Recognition:**
    *   *Risk:* Standard ASR models (like Whisper) often struggle with child acoustics and non-standard articulation.
    *   *Mitigation:* Use models fine-tuned on child speech if available, or rely heavily on differential metrics (changes in fluency over time) rather than absolute accuracy.
3.  **Model Training Data:**
    *   *Risk:* Lack of a large, balanced, clinically-labeled dataset linking multimodal smartphone data to dyslexia.
    *   *Mitigation:* For the MVP, construct a carefully reasoned, literature-backed heuristic or a synthetically bootstrapped dataset strictly for *demonstrating the architectural pipeline*. Explicitly document that the model is unvalidated clinically until real-world data collection occurs.
4.  **Privacy & Explainability:**
    *   *Risk:* Transmitting video/audio of minors; parents misinterpreting AI scores.
    *   *Mitigation:* Perform as much feature extraction on-device as possible. If video must be sent, delete it immediately after processing. Use SHAP to clearly display risk factors, coupled with mandatory medical disclaimers.

## 6. Minimum Viable Product (MVP) Proposal

The MVP should focus on demonstrating the end-to-end pipeline with a limited scope:
1.  **Profile Management:** Parent can create a profile for a child.
2.  **Abbreviated Assessment:**
    *   One reading passage (collects audio for Whisper).
    *   Simulated or simplified MediaPipe gaze tracking (measuring head movement or basic eye direction shifts).
    *   One cognitive game (e.g., b/d letter recognition).
3.  **AI Engine & Fusion:** An XGBoost model that ingests these inputs, generates a mock risk score, and runs SHAP to explain the weights.
4.  **Results Dashboard:** Flutter UI displaying the risk category, SHAP explanation ("Why?"), and a hardcoded sample of a personalized 3-day learning plan.

## 7. Architecture Decision Record (ADR): Self-Contained 17-Feature Two-Stage Hybrid Web/Mobile Inference

### Context
Relying exclusively on an external cloud API for real-time screening introduced latency, network timeout failures, and privacy concerns when handling children's live webcam and microphone streams. Furthermore, single-modality heuristics failed to capture cross-modality compensation (e.g., children who compensate visually with normal fixation counts but exhibit severe phonological decoding deficits and acoustic hesitations).

### Decision
1.  **Zero-Cloud On-Device Sensor & Inference Pipeline (`src/services/sensorManager.ts` & `src/services/multimodalEngine.ts`):**
    *   All webcam optical iris/pupil tracking (30Hz luminance centroid + 3-point screen calibration) and Web Speech API forced word alignment + Web Audio pause detection execute 100% locally in the client browser. No video frames or voice recordings ever leave the device.
2.  **Two-Stage 17-Feature Hybrid Screening Architecture:**
    *   **Stage 1 (Temporal Ocular Encoder):** Computes 8 deep spatial-temporal gaze embeddings (`gaze_emb_0`..`gaze_emb_7`) from the raw fixation/saccade sequence (encoding rhythmicity, backward refixation density, line-return sweep accuracy, and tail skew).
    *   **Stage 2 (Calibrated Gradient Boosted Decision Ensemble):** Fuses the 9 primary physiological biomarkers (`n_regress_trial`, `mean_fix_dur_trial`, `sum_fix_dur_trial`, `n_fix_trial`, `n_sacc_trial`, `mean_sacc_ampl_trial`, `ratio_progress_regress`, `hesitation_rate`, `phonological_score`) with the 8 deep gaze embeddings (`gaze_emb_0`..`gaze_emb_7`) and working memory capacity, calibrated against the empirical ETDD70 dataset (70 subjects, 210 trials).
3.  **Dual Glass-Box Explainability (Tree SHAP + Case LIME + Counterfactual Simulator):**
    *   Every screening prediction computes exact additive **Tree SHAP** log-odds contributions across all 17 features, **Local LIME** interpretable threshold rules, and an interactive **What-If Counterfactual Simulator** so clinicians and parents can verify why a screening estimate was produced and which targeted 5-day remediation drills will yield the highest risk reduction.
