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
