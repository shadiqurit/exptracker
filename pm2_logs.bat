@echo off
title Expense Tracker - PM2 Live Logs
echo ==============================================================================
echo Streaming PM2 Live Logs for Expense Tracker Backend...
echo (Press Ctrl + C to exit logs)
echo ==============================================================================

call pm2 logs expense-tracker-api --lines 50
pause
