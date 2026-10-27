@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo              ExpTracker - Android APK One-Click Build Script
echo ==============================================================================

:: Detect Java 21+ / Android Studio JBR
if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    set "PATH=C:\Program Files\Android\Android Studio\jbr\bin;!PATH!"
    echo [*] Using Android Studio JBR (Java 21+)
) else if defined JAVA_HOME (
    echo [*] Using system JAVA_HOME: %JAVA_HOME%
)

:: Step 1: Build Frontend
echo [*] Step 1/3: Building Vue 3 Frontend (Server: https://exp.shadiqur.bd/api/v1)...
cd /d "%~dp0frontend"
set "VITE_API_URL=https://exp.shadiqur.bd/api/v1"
set "VITE_GOOGLE_CLIENT_ID=548972657787-pj0drteg4g3q714qncja69n1coqvdln5.apps.googleusercontent.com"
call npm run build
if %errorlevel% neq 0 (
    echo [!] Frontend build failed!
    pause
    exit /b %errorlevel%
)

:: Step 2: Sync Capacitor Android
echo [*] Step 2/3: Syncing web assets into native Android project...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [!] Capacitor sync failed!
    pause
    exit /b %errorlevel%
)

:: Step 3: Build Debug APK via Gradle
echo [*] Step 3/3: Compiling Native Android APK with Gradle...
cd /d "%~dp0frontend\android"
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [!] Gradle APK build failed!
    pause
    exit /b %errorlevel%
)

echo ==============================================================================
echo [SUCCESS] Android APK built successfully!
echo ==============================================================================
echo.
echo Output APK Location:
echo   %~dp0frontend\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can install this APK directly on your phone via:
echo   - USB cable / adb install
echo   - Sending the APK file to your phone (WhatsApp, Telegram, Google Drive)
echo ==============================================================================
pause
