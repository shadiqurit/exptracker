@echo off
title Expense Tracker - PM2 Restart
echo ==============================================================================
echo Restarting Expense Tracker Backend via PM2...
echo ==============================================================================

cd /d "%~dp0"
call pm2 restart expense-tracker-api
call pm2 list

echo.
echo Expense Tracker API restarted.
echo API Health: http://localhost:3006/health
echo.
pause
