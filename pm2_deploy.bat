@echo off
title Expense Tracker - PM2 Full Deploy
echo ==============================================================================
echo           EXPENSE TRACKER - AUTOMATED PM2 PRODUCTION DEPLOYMENT
echo ==============================================================================
echo.

cd /d "%~dp0"

:: 1. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js 20+ first.
    pause
    exit /b 1
)

:: 2. Check PM2
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] PM2 not found globally. Installing PM2 globally via npm...
    call npm install -g pm2
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install PM2. Please run: npm install -g pm2
        pause
        exit /b 1
    )
)

:: 3. Stop existing PM2 process to release Windows DLL/file locks
echo [1/5] Stopping any running PM2 instance to release file locks...
call pm2 stop expense-tracker-api >nul 2>nul
call pm2 delete expense-tracker-api >nul 2>nul

:: 4. Generate Prisma Client
echo [2/5] Generating Prisma client...
cd /d "%~dp0backend"
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prisma client generation failed. Check errors above.
    pause
    exit /b 1
)

:: 5. Build Backend
echo [3/5] Compiling Backend TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend build failed.
    pause
    exit /b 1
)

:: 6. Build Frontend
echo [4/5] Compiling Frontend Single Page Application...
cd /d "%~dp0frontend"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
)

:: 7. Start PM2 via ecosystem.config.cjs
echo [5/5] Launching Backend with PM2 on port 3006...
cd /d "%~dp0"
call pm2 start ecosystem.config.cjs
call pm2 save

echo.
echo ==============================================================================
echo [SUCCESS] Expense Tracker deployed successfully via PM2!
echo ==============================================================================
call pm2 list
echo.
echo ------------------------------------------------------------------------------
echo - Backend API:      http://localhost:3006/api/v1
echo - Backend Health:   http://localhost:3006/health
echo - Swagger Docs:     http://localhost:3006/api/docs
echo - Production Site:  https://exp.shadiqur.bd
echo ------------------------------------------------------------------------------
echo.
echo Management Commands:
echo   - To view live logs:   pm2_logs.bat      (or: pm2 logs expense-tracker-api)
echo   - To stop API:         pm2_stop.bat      (or: pm2 stop expense-tracker-api)
echo   - To restart API:      pm2_restart.bat   (or: pm2 restart expense-tracker-api)
echo.
pause
