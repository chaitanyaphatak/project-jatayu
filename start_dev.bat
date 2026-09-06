@echo off
title WeatherGPT Local Runner
echo ========================================================
echo Starting WeatherGPT (FastAPI Backend + React Frontend)
echo ========================================================

REM Start FastAPI Backend
start cmd /k "echo Starting Backend on http://localhost:8000... && cd /d %~dp0backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM Start React Frontend
start cmd /k "echo Starting Frontend on http://localhost:5173... && cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting:
echo  - Backend API: http://localhost:8000 (Swagger docs at /docs)
echo  - Frontend Web: http://localhost:5173
echo ========================================================
