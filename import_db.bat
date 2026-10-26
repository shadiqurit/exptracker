@echo off
echo ===================================================
echo Importing expense_tracker_dump.sql into MySQL...
echo ===================================================

set DB_USER=root
set /p DB_USER="Enter MySQL Username [default: root]: "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="Enter MySQL Password: "

if "%DB_PASS%"=="" (
    mysql -u %DB_USER% < "%~dp0expense_tracker_dump.sql"
) else (
    mysql -u %DB_USER% -p%DB_PASS% < "%~dp0expense_tracker_dump.sql"
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo [SUCCESS] Database imported successfully!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo [ERROR] Import failed. Please check your credentials or MySQL path.
    echo ===================================================
)
pause
