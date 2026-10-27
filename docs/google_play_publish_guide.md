# Google Play Store Publishing Guide for ExpTracker

This guide provides everything required to publish **ExpTracker** (`bd.shadiqur.exptracker`) on the **Google Play Store**, including **Privacy Policy**, **Versioning & Release Bundle setup**, and **Store Listing & Feature Declarations**.

---

## 1. Privacy Policy & Account Deletion (Google Mandatory Policy)

Google Play requires a public Privacy Policy URL and an Account Deletion path before any app can be published.

### Live URLs for Google Play Console:
- **Privacy Policy URL:** `https://exp.shadiqur.bd/privacy.html`
- **Account & Data Deletion URL:** `https://exp.shadiqur.bd/delete-account.html`

*(Both files are located in `frontend/public/privacy.html` and `frontend/public/delete-account.html`, built automatically into your web server root).*

### Key Declarations for Google Play Reviewers:
1. **Data Types Collected**:
   - **Personal Info**: Name, Email address (used exclusively for user authentication and account management).
   - **Financial Info**: User-entered income, expenses, account balances, transfers, and budgets (used solely for app functionality; never shared with third parties or credit agencies).
2. **Data Security**:
   - All data is encrypted in transit using **HTTPS (TLS 1.3)**.
   - Passwords hashed using **Argon2id**.
   - No bank account credentials, credit card details, or PINs are ever collected.
3. **Data Sharing**:
   - Zero third-party data sharing or ad network tracking.
   - Google Sign-In is only used for authentication.

---

## 2. Versioning & App Bundle Configuration

Google Play **does not accept `.apk` files** for new apps. You must upload an **Android App Bundle (`.aab`)**.

### How Versioning Works in Android:
Open [`frontend/android/app/build.gradle`](file:///d:/Projects/exptracker/frontend/android/app/build.gradle):

```groovy
defaultConfig {
    applicationId "bd.shadiqur.exptracker"
    minSdkVersion rootProject.ext.minSdkVersion      // Min Android 7.0 (API 24)
    targetSdkVersion rootProject.ext.targetSdkVersion// Android 14/15 (API 34+)
    versionCode 1                                    // MUST increment for EVERY Google Play release
    versionName "1.0.0"                              // User-facing version displayed in the Play Store
    ...
}
```

- **`versionCode`** *(Integer, e.g., 1, 2, 3)*:
  - Internal version number used by Google Play.
  - **Every single time you upload an update to Google Play Console, `versionCode` must be increased by at least 1.** Google Play will reject the bundle if the `versionCode` is already used.
- **`versionName`** *(String, e.g., "1.0.0", "1.0.1", "1.1.0")*:
  - The public version displayed to users in the Play Store.

---

### Generating a Release Keystore (Signing Key)

Before building for release, you need a digital keystore. Run this once in PowerShell:

```powershell
keytool -genkeypair -v -keystore exptracker-release.jks -alias exptracker -keyalg RSA -keysize 2048 -validity 10000
```
> [!IMPORTANT]
> Save `exptracker-release.jks` and your passwords safely! Never commit your `.jks` file to public GitHub. If you lose this key, you cannot update your app unless Google Play App Signing is managing your upload key.

---

### Building the Release Android App Bundle (`.aab`)

#### Option A: Using Android Studio (Recommended for beginners)
1. Open the Android project: run `open_android.bat` or open `frontend/android` in Android Studio.
2. In Android Studio top menu: **Build &rarr; Generate Signed Bundle / APK...**
3. Select **Android App Bundle** &rarr; Next.
4. Select your keystore file (`exptracker-release.jks`), enter your password and alias.
5. Select destination folder and choose **release** build variant.
6. Click **Create**. The output file will be named `app-release.aab`.

#### Option B: Automated Command Line Build
Run:
```cmd
cd frontend
npm run build
npx cap sync android
cd android
gradlew bundleRelease
```
The generated `.aab` file will be at:
`frontend/android/app/build/outputs/bundle/release/app-release.aab`

---

## 3. Store Listing & Graphic Assets Needed

Google Play requires specific text and visual assets for your store listing:

### Text Information:
| Field | Limit | Suggested Value |
|---|---|---|
| **App Name** | 30 chars | `ExpTracker - Expense Manager` |
| **Short Description** | 80 chars | `Track daily expenses, manage multi-account balances, and control your budgets.` |
| **Full Description** | 4,000 chars | *(See pre-written description below)* |
| **Category** | - | `Finance` |
| **Tags** | 5 tags | `Personal finance`, `Expense tracker`, `Budgeting`, `Money manager`, `Accounting` |

### Pre-Written Full Description (Ready to Copy-Paste):
```text
ExpTracker is a modern, high-precision personal finance and expense management system designed to bring total clarity and control to your daily money flow.

Whether you manage cash in hand, bank accounts, or mobile wallets (such as bKash, Nagad), ExpTracker organizes your financial life with double-entry ledger precision.

KEY FEATURES:

• MULTI-ACCOUNT MANAGEMENT
Track Cash, Savings, Checking Accounts, and Mobile Wallets in one unified dashboard. Monitor real-time balances and reconcile transactions effortlessly.

• DOUBLE-ENTRY ATOMIC TRANSFERS
Move money between your accounts (e.g., Bank to Cash or Mobile Wallet) with ACID transaction safety. Account balances update instantly without distorting your income or expense metrics.

• BUDGET PLANNING & ALERTS
Set monthly spending limits for overall expenses or specific categories. Real-time visual progress bars warn you at 80% and 100% threshold consumption.

• DETAILED AUDIT REPORTS & STATEMENTS
Generate comprehensive daily, monthly, and annual financial statements. Reconcile category breakdowns and export reports in PDF, Excel (.xlsx), and CSV formats.

• INTERACTIVE ANALYTICS & CHARTS
Visual charts break down income versus expense ratios, spending velocity, and category distribution so you always know where your money goes.

• BANK-GRADE SECURITY & PRIVACY
Your financial data belongs strictly to you. With user-level data isolation, encrypted HTTPS transmission, and secure Argon2id authentication, your information remains private and secure.

Take control of your finances today with ExpTracker!
```

---

### Mandatory Graphic Assets:

| Asset | Dimensions | Requirements |
|---|---|---|
| **App Icon** | `512 x 512 px` | 32-bit PNG, max 1MB. (Available at `frontend/public/icon-512.png`) |
| **Feature Graphic** | `1024 x 500 px` | 24-bit PNG or JPEG (no transparency). Highlights app name and theme. |
| **Phone Screenshots** | Min 2, Max 8 | Aspect ratio 16:9 or 9:16 (e.g. `1080 x 2400 px`). Capture: Dashboard, Transactions, Budgets, Reports. |
| **7-inch / 10-inch Tablet Screenshots** | Optional | Recommended if targeting tablet users. |

---

## 4. Google Play Policy Questionnaire Cheat-Sheet

When completing the **App Content** section in Google Play Console:

1. **Privacy Policy**:
   - Link: `https://exp.shadiqur.bd/privacy.html`
2. **App Access (Reviewer Login)**:
   - Since ExpTracker requires a login, Google reviewers need test credentials.
   - Choose: *"All or some functionality is restricted"*.
   - Provide:
     - **Username/Email**: `usera@example.com`
     - **Password**: `UserA123!@#`
     - Notes: "Test demo account pre-populated with sample financial entries."
3. **Ads**:
   - Choose: *"No, my app does not contain ads"*.
4. **Content Rating (IARC)**:
   - Category: `Utility, Productivity, Communication, or Other`.
   - Violence, profanity, adult content, illegal substances: **No**.
   - Does the app share user location? **No**.
   - Result: Everyone (PEGI 3 / USK 0).
5. **Target Audience**:
   - Target age: **18 and over** (avoids strict Google Designed for Families compliance).
6. **Financial Features Declaration**:
   - Google Play asks if the app provides financial features.
   - Choose: **"Personal financial management (PFM)"** / **"Budgeting and expense tracking"**.
   - Does it provide loans, banking services, or cryptocurrency trading? **No**.
7. **Data Safety Form**:
   - **Does your app collect or share data?**: Yes.
   - **Is all user data encrypted in transit?**: Yes (HTTPS).
   - **Do you provide a way for users to request data deletion?**: Yes (Link: `https://exp.shadiqur.bd/delete-account.html`).
   - **Data types collected**:
     - *Personal info*: Name, Email address (Account management).
     - *Financial info*: Other financial info (Income/expense user logs).
   - **Is this data shared with third parties?**: No.
8. **Account Deletion Web Link**:
   - Web Link: `https://exp.shadiqur.bd/delete-account.html`

---

## 5. Google Play Closed Testing Requirement (New Personal Accounts)

If your Google Play Developer Account was created after **November 13, 2023** (as an individual developer):
- Google requires you to run a **Closed Test** with at least **20 testers** who opt-in.
- Testers must remain opted in for at least **14 consecutive days**.
- Once 14 days have passed, you can apply for **Production Access** directly inside the Google Play Console dashboard.
