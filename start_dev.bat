@echo off
title Jatayu Local Runner
echo ========================================================
echo Starting Jatayu (FastAPI Backend + React Frontend)
echo ========================================================
echo.
cd /d %~dp0
pnpm dev
