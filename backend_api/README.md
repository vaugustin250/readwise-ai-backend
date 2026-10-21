# ReadWise AI Backend API

## Setup
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `venv\\Scripts\\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and adjust settings.

## Running the Server
```bash
uvicorn app.main:app --reload
```

## Running Tests
```bash
pytest
```

## Connecting Flutter to Backend
In your Flutter app (`lib/repositories/api_client.dart`), configure your base URL. 
For local Android emulator, use `http://10.0.2.2:8000/api/v1`.
For Chrome web or iOS simulator, use `http://localhost:8000/api/v1`.
