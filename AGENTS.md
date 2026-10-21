# ReadWise AI — Project Rules

## Project purpose
Build a smartphone-based, multimodal dyslexia-risk screening and personalized reading-support application.

## Architecture
- Flutter/Dart for the mobile client.
- FastAPI/Python for backend APIs.
- PostgreSQL for structured data.
- Keep AI inference, preprocessing, feature extraction and explainability in separate modules.
- Use version-controlled database migrations.

## Development rules
1. Inspect existing code before changing it.
2. Work on one milestone at a time.
3. Do not rewrite working modules without justification.
4. Run relevant tests after changes and report actual results.
5. Never invent successful test results.
6. Document API contracts and environment variables.
7. Never commit secrets, API keys, credentials or child assessment data.
8. Maintain `.env.example` without real credentials.
9. Update `docs/implementation_plan.md` after each completed milestone.
10. Record important architecture decisions in `docs/architecture.md`.

## AI research rules
- Treat model outputs as screening estimates, not diagnoses.
- Never claim clinical validity without appropriate evidence.
- Clearly distinguish demo data from real assessment data.
- Prevent data leakage between training and test sets.
- Evaluate class imbalance and calibration where appropriate.
- Use SHAP explanations only for a compatible trained model.
- Do not assume smartphone gaze estimates are equivalent to clinical eye tracking.
- Do not infer dyslexia from letter reversals or individual behavioral signals alone.

## Privacy
- Obtain appropriate parent/guardian consent before collecting children's data.
- Minimize camera and microphone data retention.
- Use secure access controls and protect sensitive records.
- Do not upload child recordings to external services without explicit authorization and an appropriate privacy review.
