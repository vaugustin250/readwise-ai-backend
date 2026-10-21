# ReadWise AI

ReadWise AI is a smartphone and web-based, multimodal dyslexia-risk screening and personalized reading-support application. Powered by explainable AI (XGBoost Tree SHAP), it evaluates real-time ocular fixations/regressions and acoustic speech hesitation telemetry alongside gamified cognitive working memory and phonological awareness drills.

## Features

- **Reading Companion Buddies**: Choose from 6 hero guides (Doraemon, Ben 10, Ninja Hattori, Shinchan, Dora Explorer, Chhota Bheem), each with customized color schemes, superpowers, and encouraging quotes.
- **Dyslexia-Conscious Design**: Built with warm glare-free canvas (`#FFFDF5`), high-contrast indigo espresso text (`#1E1B4B`), and tactile clay 3D buttons.
- **Live Gaze & Speech Telemetry HUD**: Camera reticle target tracking and microphone audio VU meter measuring acoustic speech hesitations in real-time.
- **Interactive Reading Passage**: Word-by-word tracking of "The Brave Little Squirrel" with automatic backward ocular regression detection.
- **Arcade Brain Games**: 4 cognitive challenges assessing letter discrimination (b vs d), rhyme matching, letter orientation, and phoneme sound-blending.
- **Dual-Mode Results**:
  - *Kid Champion Mode*: Celebratory animations, star rating, EXP points, and superpower badges.
  - *Parent & Specialist Mode*: Dyslexia risk probability %, model confidence, Tree SHAP biometric contribution bars, targeted remediation plan, and downloadable Clinical PDF report.
- **Longitudinal Progress Trajectory**: Tracks multi-session risk reduction trends, regression frequency, and reading speed (WPM).

## Running the App

```bash
npm install
npm run dev
```

The application runs on Vite at port 3000.
