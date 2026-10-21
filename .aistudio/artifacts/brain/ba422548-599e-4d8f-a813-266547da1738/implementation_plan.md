# ReadWise AI — True Tri-Modal Dyslexia Screening & Explainable AI Upgrade

This plan transforms ReadWise AI from a static fallback prototype into a genuine, high-accuracy, self-contained **Tri-Modal Dyslexia Risk Screening & Pedagogical Support Platform**. It resolves the root causes of inaccurate predictions by replacing passive video/volume placeholders with real-time webcam ocular gaze tracking, live speech-to-text word alignment, and an in-browser calibrated 17-feature two-stage inference engine with exact **Tree SHAP** and **LIME** local case explanations.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Root Cause Diagnosis of Previous Wrong Predictions**
> 1. **Unconnected Camera & Audio Signals**: Previously, the camera preview only rendered a `<video>` element without tracking eye movements; `n_regress_trial` stayed at `0` unless the user manually clicked backward on words. Similarly, the microphone only measured raw decibel volume rather than matching spoken words against the passage.
> 2. **Ephemeral Backend & Static Embeddings**: When the external Render SQLite container slept or rejected a child ID (`403/404`), the app fell back to a 3-variable formula that produced nearly identical scores every run. Furthermore, the 8 deep gaze embeddings (`gaze_emb_0`–`gaze_emb_7`) were hardcoded to `0.5`.

- **Confirmed Decision 1 — Live Multimodal Sensor Pipeline**: Upgrade the reading assessment to run **real-time webcam pupil/gaze coordinate tracking** (with head-pose compensation and interactive calibration) paired with **live Web Speech API word-level forced alignment** and **Web Audio API acoustic pause/prosody extraction**.
- **Confirmed Decision 2 — Self-Contained 17-Feature Hybrid Inference Engine**: Execute the complete two-stage screening pipeline locally in the browser with zero external LLM API calls (preserving 100% COPPA/GDPR-Kids privacy) and zero dependence on ephemeral external servers:
  - **Stage 1**: Temporal 1D-CNN + Bi-LSTM sequence encoder over continuous $(X, Y, t)$ gaze trajectories to compute genuine 8-dimensional gaze embeddings.
  - **Stage 2**: Calibrated 17-feature Gradient Boosted Decision Tree ensemble aligned with the empirical **ETDD70** clinical distributions (70 subjects, 210 trials) + acoustic + cognitive working memory norms.
- **Confirmed Decision 3 — Novel Clinical & Research Visualizations**:
  - **Live Gaze Heatmap & Saccade Trajectory Plot**: Visualizes progressive fixations (green/azure circles scaled by dwell duration) and regressive backward jumps (crimson/amber vectors) directly over the reading passage.
  - **Word-Level Pronunciation & WPM Fluency Tracker**: Auto-advances and color-codes each word in *"The Brave Little Squirrel"* as the child reads aloud, logging exact words-per-minute (WPM), substitutions, omissions, and $>500\text{ms}$ hesitation pauses.
  - **Dual Explainable AI (Tree SHAP + Interactive LIME)**: Side-by-side global game-theoretic Shapley attributions ($\phi_i$) and local LIME linear perturbation rules showing parents and clinicians the exact threshold boundaries for their child's case.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a 3-minute, non-stigmatizing dyslexia risk screening quest on commodity hardware. As a child reads a grade-leveled story and plays 4 timed cognitive micro-drills with their chosen cartoon buddy, the platform captures 17 synchronized ocular, acoustic, and cognitive biomarkers, computes a calibrated screening risk probability, and generates an explainable clinical report and adaptive daily remediation plan.
- **Target Audience / Persona**:
  - **Children (Ages 6–12)**: Experience an encouraging, zero-anxiety adventure quest (*Kid Champion Mode*) with beloved cartoon heroes (**Doraemon, Ben 10, Ninja Hattori, Shinchan, Dora Explorer, Chhota Bheem**).
  - **Parents, Educators & Pediatric Specialists**: Access a rigorous clinical dashboard (*Parent & Specialist Mode*) featuring ETDD70 percentile benchmarks, gaze saccade plots, word-level error logs, Tree SHAP + LIME attributions, and a downloadable clinical PDF report.
- **Key Value**: Eliminates the "Wait to Fail" dilemma and the \$2,000+ clinical hardware barrier while providing mathematically transparent, glass-box predictions rather than opaque black-box percentages.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **3-Point Quick Gaze Calibration & Consent**: After guardian consent, the child taps 3 glowing buddy targets on screen (2 seconds) to calibrate webcam iris/head-vector coordinates to the reading passage bounding box.
  2. **Tri-Modal Oral Reading Quest**:
     - As the child reads aloud, live **Speech-to-Text Forced Alignment** highlights and advances words automatically while recording word-level pronunciation accuracy, substitutions, and $>500\text{ms}$ acoustic hesitation pauses.
     - Simultaneously, the **Webcam Ocular Tracker** samples $(X, Y, t)$ gaze coordinates at 30Hz, detecting fixation dwell times, saccadic amplitudes, and backward regressive saccades across text lines.
     - Includes an interactive **Clinical Benchmark Simulator Drawer** so researchers and educators can also test verified ETDD70 clinical profiles (*Typical Reader*, *Compensated Visual / Phonological Deficit*, *High Ocular Regression Dyslexic Profile*) and observe real-time model sensitivity.
  3. **Timed 4-Round Cognitive & Phonological Battery**:
     - Measures millisecond reaction latency and accuracy across *Visual Mirror Discrimination ($b/d$)*, *Rhyme & Phonological Matching*, *Orthographic Orientation ($p/q$)*, and *Phoneme Sound Blending ($/s/+/u/+/n/$)*, feeding empirical working memory and phonological awareness scores directly into the 17-feature vector.
  4. **Dual-View Results & XAI Explorer**:
     - **Kid Champion View**: Celebratory mascot animation, star rating, EXP rewards, and unlocked superpower cards.
     - **Parent & Specialist Clinical View**:
       - **Tri-Modal Risk Summary & ETDD70 Norm Comparison**: Calibrated risk probability, confidence score (adjusted for sensor quality), and modality sub-scores (Ocular, Acoustic, Cognitive).
       - **Interactive Gaze Saccade & Heatmap Canvas**: Toggle between thermal fixation density and progressive/regressive saccade vectors overlaid on the passage words.
       - **Word-Level Oral Fluency Breakdown**: Displays WPM cadence, accuracy %, and color-coded word chips (*Fluent*, *Hesitated $>500\text{ms}$*, *Regressed / Re-read*, *Mispronounced*).
       - **Dual XAI Tabs (Tree SHAP + Case LIME)**: Exact additive Shapley bars ($\text{Base Value} + \sum \phi_i = \text{Risk}$) alongside LIME local feature threshold rules (e.g., `n_regress_trial > 14.0 ➔ +0.18 risk weight`) and an interactive *"What-If Counterfactual Sensitivity"* slider to inspect how improving specific biomarkers lowers risk.
- **Visual Identity & Theme**:
  - **Aesthetic Direction**: Scotopic-sensitive pediatric warmth paired with high-precision clinical telemetry.
  - **Color Palette & Mood**:
    - Dominant Canvas (60%): Warm Scotopic Biscuit (`#FFFDF5`) to eliminate optical glare and visual crowding for dyslexic readers.
    - Structural Surfaces (30%): Crisp Alabaster White (`#FFFFFF`) with Deep Indigo Espresso (`#1E1B4B`) typography and Slate (`#475569`) secondary prose.
    - Semantic & Buddy Accents (10%): Dynamic Buddy primary/secondary palettes (Doraemon Azure `#0284C7`, Ben 10 Emerald `#059669`, Hattori Indigo `#312E81`, etc.), paired with dual-coded clinical states: Emerald (`#059669` + `✓ Typical Range`), Amber (`#D97706` + `▲ Moderate Indicator`), and Crimson (`#E11D48` + `⚠ Elevated Risk Indicator`).
  - **Typography & Hierarchy**:
    - Display & Reading Passage: `Lexend` (specifically engineered to reduce cognitive load and improve reading fluency in dyslexic readers) with generous letter tracking (`0.04em`) and line height (`1.8`) on the reading canvas.
    - Biometric Data & SHAP/LIME Telemetry: `tabular-nums` monospace alignment for all percentages, millisecond latencies, and Shapley values.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: True 17-Feature Two-Stage Hybrid Inference in Browser vs. External Cloud API Dependency**
  - *Chosen Approach*: Embed the complete calibrated two-stage inference engine (1D-CNN+BiLSTM temporal gaze sequence encoder + 17-feature ETDD70-calibrated Gradient Boosted Decision Tree ensemble + exact Tree SHAP & LIME calculators) directly in the TypeScript client, with optional background sync to the cloud backend.
  - *Why*: Eliminates network timeouts, cold-start failures, and static fallback bugs; guarantees sub-50ms deterministic inference; and strictly complies with COPPA/GDPR-Kids by never transmitting child audio or facial video outside the device.
  - *Alternatives Considered*: Relying solely on the external Render FastAPI server, which sleeps on the free tier and had hardcoded `0.5` gaze embeddings.
- **Decision 2: Dual Webcam Iris Tracking + Live Web Speech Forced Alignment**
  - *Chosen Approach*: Combine real-time canvas pixel-luminance/iris-centroid tracking and head-vector stabilization with the browser's native `SpeechRecognition` (`webkitSpeechRecognition`) + `AudioContext` frequency analyzer, supplemented by touch/cursor word tracking.
  - *Why*: Captures genuine ocular regressions, fixation dwell times, WPM reading speed, and phonemic hesitations automatically as the child speaks and looks at the screen, while remaining resilient across all desktop and mobile browsers.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         ReadWise AI Client Application                           │
├───────────────────────────┬──────────────────────────┬───────────────────────────┤
│   1. Ocular Gaze Sensor   │  2. Acoustic & ASR Engine│  3. Cognitive Micro-Drills│
│  • 3-Point Calibration    │  • Web Speech API Word   │  • 4 Timed Arcade Rounds  │
│  • 30Hz Iris/Pupil Vector │    Forced Alignment      │  • Millisecond Latency    │
│  • Fixation & Regression  │  • Web Audio >500ms      │  • Working Memory &       │
│    Saccade Detector       │    Pause & Prosody Meter │    Phonology Scoring      │
└─────────────┬─────────────┴────────────┬─────────────┴─────────────┬─────────────┘
              │                          │                           │
              ▼                          ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                Stage 1 & 2 Multimodal Feature Fusion Pipeline                    │
│  • Stage 1: 1D-CNN + Bi-LSTM Temporal Encoder (256-pt (X,Y) ➔ 8 Gaze Embeddings) │
│  • Stage 2: 9 Clinical Biometrics (ETDD70 Ocular + Acoustic + Cognitive)         │
│  • Combined 17-Feature Vector + Robust Z-Score Scaling against ETDD70 Norms      │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│            Calibrated Gradient Boosted Ensemble & Dual XAI Engine                │
│  • Sigmoid-Calibrated Probability P(Dyslexia Risk) + Modality Confidence Score   │
│  • Exact Tree SHAP Explainer: Base Value + ∑ φ_i(x) = Predicted Risk             │
│  • Local LIME Perturbation Engine: 150 Local Samples ➔ Ridge Linear Weights      │
└───────────────────┬──────────────────────────────────────────┬───────────────────┘
                    │                                          │
                    ▼                                          ▼
┌────────────────────────────────────────┐ ┌───────────────────────────────────────┐
│        Kid Champion Experience         │ │   Parent & Specialist Clinical View   │
│  • Zero-Anxiety Buddy Celebration      │ │  • Gaze Heatmap & Saccade Vector Plot │
│  • Star Rating & +150 EXP Progression  │ │  • Word-by-Word Fluency & Error Map   │
│  • Adaptive Daily Practice Activities  │ │  • Tree SHAP + LIME + What-If Sliders │
│                                        │ │  • Multi-Page Clinical PDF Generator  │
└────────────────────────────────────────┘ └───────────────────────────────────────┘
```

### Data Model & 17-Feature Biometric Vector

The inference engine operates on the exact 17 features defined in the research architecture:
1. **Ocular Biomechanics (ETDD70 Calibrated — 5 Features)**:
   - `dwell_time_trial` (Total fixation dwell time in ms; typical mean $\approx 32,000\text{ms}$, dyslexic mean $\approx 78,000\text{ms}$)
   - `n_regress_trial` (Count of backward regressive saccades; typical $\approx 6\text{--}11$, dyslexic $\approx 18\text{--}36$)
   - `mean_fix_dur_trial` (Average single fixation duration in ms; typical $\approx 240\text{ms}$, dyslexic $\approx 420\text{ms}$)
   - `ratio_progress_regress_trial` (Forward-to-backward saccade ratio; typical $\approx 7.8$, dyslexic $\approx 3.1$)
   - `mean_sacc_ampl_trial` (Mean horizontal saccadic jump amplitude in px)
2. **Stage 1 Deep Temporal Gaze Embeddings (8 Features)**:
   - `gaze_emb_0` through `gaze_emb_7` computed dynamically from the 256-step resampled $(X, Y, \Delta t)$ gaze sequence via the 1D-CNN + Bi-LSTM temporal filter bank (capturing rhythmic line-sweep regularity vs. erratic backtracking).
3. **Acoustic & Oral Reading Fluency (2 Features + WPM & Error Telemetry)**:
   - `speech_hesitation_rate` (Pauses $>500\text{ms}$ per minute during oral passage reading)
   - `speech_phoneme_stability` (Acoustic envelope & forced-alignment word decoding stability score $\in [-1, 1]$)
   - Extended telemetry: `reading_speed_wpm`, `word_accuracy_pct`, per-word status array (`fluent` | `hesitated` | `regressed` | `mispronounced`).
4. **Cognitive & Phonological Game Battery (2 Features)**:
   - `cognitive_working_memory` (Latency-adjusted visual/auditory working memory score $\in [0, 100]$)
   - `phonological_awareness_score` (Rhyme & phoneme blending accuracy score $\in [0, 100]$)

### Interactive Component & State Mapping

- **Calibration & Live Sensor HUD (`ReadingAssessmentScreen`)**:
  - 3-point interactive calibration overlay maps pupil/face movement deltas to passage word coordinates.
  - Real-time speech recognizer matches spoken words to `PASSAGE_WORDS` using phonetic Levenshtein distance, advancing the active word highlight automatically while allowing manual tap overrides.
  - Includes a **"Load Clinical Benchmark Case"** selector (*Live Child Capture*, *ETDD70 Typical Reader #104*, *ETDD70 High-Risk Dyslexic #109*, *Phonological Hesitation Profile*) so users can immediately verify model accuracy across distinct clinical phenotypes.
- **Clinical Visualizations & Dual XAI (`ResultsScreen`)**:
  - **Gaze Heatmap & Saccade Plotter**: SVG/Canvas overlay rendering fixation circles and directional saccade arcs directly over the passage words.
  - **SHAP + LIME + Counterfactual Explorer**: Interactive tabs switching between Global/Local Tree SHAP waterfall bars, LIME local linear threshold rules, and interactive counterfactual sliders allowing clinicians to test how changes in any of the 17 features affect the predicted risk in real time.
  - **Enhanced Clinical PDF Report**: Generates a comprehensive report containing the 17 measured biometrics vs. ETDD70 clinical reference ranges, SHAP & LIME attributions, word-level reading telemetry, and the tailored 5-day intervention plan.
