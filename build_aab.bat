@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo        ExpTracker - Android App Bundle (.aab) Google Play Build Script
echo ==============================================================================

:: Detect Java 21+ / Android Studio JBR
if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    set "PATH=C:\Program Files\Android\Android Studio\jbr\bin;!PATH!"
    echo [*] Using Android Studio JBR (Java 21+)
) else if defined JAVA_HOME (
    echo [*] Using system JAVA_HOME: %JAVA_HOME%
)

:: Step 1: Build Production Frontend
echo [*] Step 1/3: Building Vue 3 Production Web Assets...
cd /d "%~dp0frontend"
set "VITE_API_URL=https://exp.shadiqur.bd/api/v1"
set "VITE_GOOGLE_CLIENT_ID=548972657787-pj0drteg4g3q714qncja69n1coqvdln5.apps.googleusercontent.com"
set "VITE_GOOGLE_ANDROID_CLIENT_ID=548972657787-25abhshlh7p0ic78pcpadrp2p9ntl6ca.apps.googleusercontent.com"
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

:: Step 3: Build Android App Bundle (.aab)
echo [*] Step 3/3: Compiling Android App Bundle (.aab) with Gradle...
cd /d "%~dp0frontend\android"
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo [!] Gradle bundle build failed!
    echo [*] Note: If release signing is needed, configure your keystore in build.gradle
    echo     or use Android Studio: Build - Generate Signed Bundle.
    pause
    exit /b %errorlevel%
)

echo ==============================================================================
echo [SUCCESS] Android App Bundle (.aab) built successfully!
echo ==============================================================================
echo.
echo Output Bundle Location:
echo   %~dp0frontend\android\app\build\outputs\bundle\release\app-release.aab
echo.
echo Upload this .aab file directly to Google Play Console.
echo ==============================================================================
pause
