@echo off
title WeatherGPT Local Runner
echo ========================================================
echo Starting WeatherGPT (FastAPI Backend + React Frontend)
echo ========================================================

REM Start FastAPI Backend
start cmd /k "echo Starting Backend on http://localhost:8000... && cd backend && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Start React Frontend
start cmd /k "echo Starting Frontend on http://localhost:5173... && cd frontend && pnpm run dev"

echo.
echo Both servers are starting:
echo  - Backend API: http://localhost:8000 (Swagger docs at /docs)
echo  - Frontend Web: http://localhost:5173
echo ========================================================
