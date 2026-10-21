# Multi-stage production Dockerfile for ReadWise AI FastAPI Backend
FROM python:3.10-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final production stage
FROM python:3.10-slim

WORKDIR /app

# Install runtime dependencies for OpenCV and report generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH="/app:/app/..:$PYTHONPATH"

# Copy backend application and AI engine
COPY . /app/backend_api
COPY ../ai_engine /app/ai_engine

WORKDIR /app/backend_api

EXPOSE 8000

# Production ASGI server with uvicorn workers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
