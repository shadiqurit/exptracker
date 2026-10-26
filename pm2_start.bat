@echo off
title Expense Tracker - PM2 Start
echo ==============================================================================
echo Starting Expense Tracker Backend via PM2 (Port 3006)...
echo ==============================================================================

cd /d "%~dp0"
call pm2 start ecosystem.config.cjs
call pm2 save
call pm2 list

echo.
echo API running at: http://localhost:3006/api/v1
echo Health check:   http://localhost:3006/health
echo.
pause
