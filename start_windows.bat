@echo off
title Expense Tracker - Local Runner
echo ===================================================
echo Starting Expense Tracker on port 3006...
echo ===================================================

cd /d "%~dp0backend"
start "Expense Tracker Backend API (Port 3006)" npm start

echo Backend process launched.
echo Access API at: http://localhost:3006/api/v1
echo Access Swagger at: http://localhost:3006/api/docs
echo Access Health at: http://localhost:3006/health
pause
