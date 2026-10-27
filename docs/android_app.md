# ExpTracker Android Application (Capacitor)

ExpTracker has been configured as a native Android application using **Capacitor 8** alongside the Vue 3 / Vite frontend.

---

## 1. Project Structure

- **Capacitor Configuration**: [`frontend/capacitor.config.ts`](file:///d:/Projects/exptracker/frontend/capacitor.config.ts)
- **Native Android Project**: [`frontend/android/`](file:///d:/Projects/exptracker/frontend/android/)
  - `app/src/main/AndroidManifest.xml` (Permissions, orientation, cleartext traffic)
  - `app/src/main/res/mipmap-*` (ExpTracker emerald app launcher icons)
  - `app/src/main/assets/public/` (Compiled production web bundle)
- **Quick Automation Scripts**:
  - `build_android.bat` — Builds frontend and syncs all assets to the Android native folder.
  - `open_android.bat` — Opens the native project in Android Studio.

---

## 2. Installed Native Plugins

| Plugin | Purpose |
|---|---|
| `@capacitor/core` & `@capacitor/android` | Core native bridge runtime & Android platform support |
| `@capacitor/app` | Native Android hardware back-button handling & app lifecycle events |
| `@capacitor/status-bar` | Native status bar styling (matching light emerald & dark theme) |
| `@capacitor/splash-screen` | Native splash screen with auto-hide upon Vue hydration |

---

## 3. How to Build & Run

### Quick Command Line (Windows)
1. Run `build_android.bat` to compile the frontend and sync assets to Android:
   ```cmd
   build_android.bat
   ```
2. Open the project in Android Studio:
   ```cmd
   open_android.bat
   ```

### Using npm Scripts
Inside `frontend/`:
```bash
# Build web app and sync into Android native project
npm run cap:build

# Sync web assets and plugins only
npm run cap:sync

# Open in Android Studio
npm run cap:open
```

---

## 4. Building APKs

### In Android Studio
1. Open the project via `open_android.bat` or open `frontend/android` in Android Studio.
2. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. The APK will be generated at:
   `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Using Command Line (Gradle)
```cmd
cd frontend\android
.\gradlew assembleDebug
```

---

## 5. Live Reload for Rapid Mobile Development

To test changes on your physical Android phone or emulator in real time:
1. Ensure your computer and phone are connected to the same Wi-Fi.
2. Start Vite with host enabled:
   ```bash
   cd frontend
   npm run dev -- --host
   ```
3. In `frontend/capacitor.config.ts`, temporarily add your local IP under `server`:
   ```ts
   server: {
     url: 'http://192.168.1.xxx:5173',
     cleartext: true
   }
   ```
4. Run:
   ```bash
   npx cap run android -l --external
   ```

---

## 6. Backend API Configuration

In `frontend/src/api/client.ts`, the API base URL defaults to `/api/v1` (relative) or `import.meta.env.VITE_API_URL`.
When building an APK to connect to your live production server, set:
```env
VITE_API_URL=https://exp.shadiqur.bd/api/v1
```
Or for local testing on the Android Emulator, use `http://10.0.2.2:3006/api/v1`.
