@echo off
title Expense Tracker - Local Runner
echo ===================================================
echo Starting Expense Tracker (Backend 3006 + Frontend 5173)...
echo ===================================================

cd /d "%~dp0backend"
start "Expense Tracker Backend API (Port 3006)" cmd /k "node dist/app.js"

cd /d "%~dp0frontend"
start "Expense Tracker Frontend (Port 5173)" cmd /k "npm.cmd run dev"

echo.
echo ---------------------------------------------------
echo Backend API:      http://localhost:3006/api/v1
echo Backend Swagger:  http://localhost:3006/api/docs
echo Backend Health:   http://localhost:3006/health
echo Frontend Web UI:  http://localhost:5173
echo Domain (Nginx):   http://exp.shadiqur.bd
echo ---------------------------------------------------
echo.
pause
