@echo off
title Expense Tracker - PM2 Stop
echo ==============================================================================
echo Stopping Expense Tracker Backend via PM2...
echo ==============================================================================

call pm2 stop expense-tracker-api
call pm2 list

echo.
echo Expense Tracker API stopped.
echo.
pause
