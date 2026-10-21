# ReadWise AI — 100% Free Deployment & App Build Guide

This comprehensive guide explains how to deploy the FastAPI AI backend to the cloud for free, compile the Flutter mobile app for free, and run the complete system on physical smartphones without paying for servers or app store developer accounts.

---

## 1. Zero-Cost Architecture Overview

```
 [ Android Phone (APK) / Web App (Free) ]
                    │
                    │ HTTPS (Free)
                    ▼
 [ Hugging Face Spaces / Render.com (Free 16GB RAM Container) ]
                    │
                    ▼
 [ FastAPI + XGBoost Screener + SHAP + ReportLab PDF Generator ]
```

---

## 2. Deploying the Backend for Free (Cloud)

### Recommended: Hugging Face Spaces (Best for ML Models)
Hugging Face Spaces provides **Free 2 vCPU + 16 GB RAM**, which is ideal for hosting XGBoost, SHAP, and speech models without memory limits.

#### Steps:
1. Go to [huggingface.co/new-space](https://huggingface.co/new-space) (sign up for a free account if you haven't).
2. Set:
   - **Space Name:** `readwise-ai-api`
   - **License:** MIT or Apache 2.0
   - **Space SDK:** Choose **Docker** -> **Blank**.
   - **Hardware:** Free (2 vCPU, 16 GB RAM).
3. Clone your new Hugging Face Space or upload your files:
   ```bash
   git clone https://huggingface.co/spaces/<your-username>/readwise-ai-api
   ```
4. Copy the backend files from `d:\dyslexia` into the space repository:
   - `backend_api/`
   - `ai_engine/`
   - `Dockerfile` (configured to run `uvicorn app.main:app --host 0.0.0.0 --port 7860`)
5. Git push to Hugging Face:
   ```bash
   git add .
   git commit -m "Deploy ReadWise AI backend"
   git push
   ```
6. Hugging Face builds your Docker container automatically. Your free public endpoint will be live at:
   `https://<your-username>-readwise-ai-api.hf.space`

---

## 3. Alternative Free Backend Hosting: Render.com

1. Create a free account at [render.com](https://render.com).
2. Push your project to a GitHub repository:
   ```bash
   cd d:\dyslexia
   git init
   git add backend_api/ ai_engine/
   git commit -m "Initial commit for ReadWise AI backend"
   git remote add origin https://github.com/<your-username>/readwise-ai.git
   git push -u origin main
   ```
3. In Render Dashboard, click **New +** -> **Web Service**.
4. Select your GitHub repository.
5. Set:
   - **Environment:** Python 3
   - **Build Command:** `pip install -r backend_api/requirements.txt`
   - **Start Command:** `cd backend_api && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free.
6. Click **Create Web Service**. Your free HTTPS API URL will be:
   `https://readwise-ai.onrender.com`

---

## 4. Building the Mobile App for Free

You do **not** need a paid Google Play Developer account ($25) or Apple Developer account ($99) to build and install the app on physical devices.

### A. Build the Android APK (Install on any Android smartphone)

1. Open PowerShell in `d:\dyslexia\mobile`.
2. Accept Android SDK licenses (one-time setup):
   ```powershell
   flutter doctor --android-licenses
   ```
   *(Press `y` to accept each license).*
3. Compile the production release APK:
   ```powershell
   flutter build apk --release
   ```
4. Find your generated APK at:
   `d:\dyslexia\mobile\build\app\outputs\flutter-apk\app-release.apk`
5. **How to install on your phone**:
   - Send `app-release.apk` to your phone via WhatsApp, Google Drive, Telegram, or USB cable.
   - Tap the APK on your phone and tap **Install** (enable "Install from unknown sources" if prompted).
   - The app is now installed as a standalone native app on your phone!

---

### B. Build as a Progressive Web App (PWA) for Free

You can also run the app directly in any phone or desktop browser with zero installation:
1. In `d:\dyslexia\mobile`, run:
   ```powershell
   flutter build web --release
   ```
2. The compiled web app is generated in `d:\dyslexia\mobile\build\web`.
3. You can host this folder 100% free on:
   - **GitHub Pages** (free unlimited hosting)
   - **Vercel** / **Netlify** / **Firebase Hosting** (free tier with instant CDN)

---

## 5. Connecting the App to Your Cloud Backend

Once your backend is deployed (e.g. to Hugging Face or Render), update the API URL in the mobile app:

In [mobile/lib/repositories/assessment_service.dart](file:///d:/dyslexia/mobile/lib/repositories/assessment_service.dart) and [mobile/lib/repositories/profile_repository.dart](file:///d:/dyslexia/mobile/lib/repositories/profile_repository.dart):

```dart
String get baseUrl {
  // Replace with your free public cloud URL:
  return 'https://<your-username>-readwise-ai-api.hf.space';
}
```

Then rebuild the APK (`flutter build apk --release`), and your phone will communicate with your live AI backend from anywhere in the world over mobile data or Wi-Fi!

---

## 6. Testing Free Locally on Your Computer Right Now

If you want to test everything on your computer before deploying to the cloud:

1. **Terminal 1: Start FastAPI Backend**:
   ```powershell
   cd d:\dyslexia\backend_api
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
2. **Terminal 2: Launch Flutter App in Chrome or Windows**:
   ```powershell
   cd d:\dyslexia\mobile
   flutter run -d chrome
   ```
   *or for Windows desktop:*
   ```powershell
   flutter run -d windows
   ```
