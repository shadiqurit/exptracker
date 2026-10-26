@echo off
title Expense Tracker - Export MySQL Database
echo ===================================================
echo Exporting MySQL Database: expense_tracker
echo ===================================================

set MYSQLDUMP="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
if not exist %MYSQLDUMP% (
    set MYSQLDUMP=mysqldump
)

set DB_USER=root
set /p DB_USER="Enter MySQL Username [default: root]: "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="Enter MySQL Password [default: Dhaka_5229##]: "
if "%DB_PASS%"=="" set DB_PASS=Dhaka_5229##

echo Exporting to "%~dp0expense_tracker_dump.sql"...
%MYSQLDUMP% -u %DB_USER% -p"%DB_PASS%" --databases expense_tracker --add-drop-table --single-transaction --routines --triggers --result-file="%~dp0expense_tracker_dump.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo [SUCCESS] Database exported successfully to:
    echo %~dp0expense_tracker_dump.sql
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo [ERROR] Export failed. Please check MySQL credentials or path.
    echo ===================================================
)
pause
