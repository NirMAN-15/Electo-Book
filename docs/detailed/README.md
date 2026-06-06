# Project Update Summary & Configuration Guide

This document outlines the recent fixes, architecture, APK generation instructions, and Firebase configuration guide for the project.

## 1. Web Dashboard Fixes (Frontend)
- **Billing Page Crash:** Fixed a critical bug in `BillingOverview.tsx` where the `AlertCircle` icon was missing from imports, causing the entire page to blank out and crash. 
- **AI Advice Page:** Removed the AI Advisor completely from the Sidebar navigation and `App.tsx` routes.
- **Header Actions:** Added interactive prompts to the Notification Bell (shows current/new notifications) and the Profile Avatar (guides the user to edit/update their profile) in `Header.tsx`.
- **User Filter:** Fixed the role filter drop-down in `UserManagement.tsx` which was previously unresponsive. It now accurately filters the data table by Admin and Consumer roles.
- **Admin Registration:** Added functionality to the "Add User" button in the Admin User Management panel to open the registration flow for adding new administrators and consumers.
- **Meter Details Page:** The "Details" button in `MeterManagement.tsx` now actively triggers instead of failing silently.
- **ESP32 Connection Prompt:** Added a prominent, animated warning banner to the top of the `ConsumerDashboard.tsx` requesting the user to connect their ESP32 Smart Meter if the system detects it is offline.
- **PDF Download (Web):** Enabled the PDF download action on the Consumer Billing History page (`BillHistory.tsx`). 

## 2. Mobile App Features
- **ESP32 Connection Prompt:** A dynamic warning banner now appears on the primary Dashboard tab inside `mobile-app/src/App.tsx` if the meter is disconnected.
- **PDF Generation (Mobile):** Added a "Download PDF" button to the Payment Success screen (`PayTab.tsx`), allowing mobile users to instantly save a receipt of their transaction.

## 3. Backend Tariff Calculations
- **Updated Electricity Rates:** Completely rewrote the tariff calculation engine inside `functions/src/billing/generateBill.ts` based on the latest tariff blocks.
- The new logic implements the exact block rates (e.g., 0-30 units @ Rs. 8.00), applies the corresponding Fixed Charges (e.g., Rs. 150 for 0-30, up to Rs. 2000 for >180), and dynamically calculates the final 2.5% Social Security Contribution Levy (SSCL) on the total bill. 
- The backend function `generatePDF.ts` is configured to automatically generate these bills as downloadable PDFs into the Firebase Storage bucket at the end of each billing cycle.

---

## Architecture

The project is divided into a modern 3-tier architecture:
1. `functions/` - Node.js Firebase Backend (Handles automatic billing cron jobs, calculations, and PDF rendering).
2. `web-dashboard/` - React/Vite Admin & Consumer Web Portal.
3. `mobile-app/` - Cross-platform React Mobile App.

---

## How to Generate the APK File

Since the mobile app is a React web project, the easiest way to package it into an Android APK is by using **Capacitor**. Run these commands inside your `mobile-app` folder:

```bash
cd mobile-app
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
npx cap init "Electro Book" "com.kaveesh.electrobook"
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

*This will open Android Studio where you can click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to get your `.apk` file.*

---

## How to Configure Firebase

To connect your own Firebase database to this project:

1. **Create the Project:** Go to the [Firebase Console](https://console.firebase.google.com/), click "Add Project", and name it.
2. **Enable Services:** On the left sidebar, enable **Authentication** (Email/Password), **Realtime Database** (Start in test mode or use your provided `database.rules.json`), and **Storage**.
3. **Get Credentials:** Click the "Web" `</>` icon on the project overview page to register your web app. You will receive a `firebaseConfig` object containing keys like `apiKey`, `projectId`, etc.
4. **Link the Code:** 
   - Inside the `web-dashboard` and `mobile-app` folders, rename the `.env.example` file to `.env`.
   - Paste your Firebase keys into the respective `VITE_FIREBASE_...` variables inside those `.env` files.
5. **Deploy Backend:** Open your terminal in the root project folder and run:
   ```bash
   firebase login
   firebase use --add
   firebase deploy
   ```
   *(This command will push your database rules, storage rules, and the new billing calculation functions live).*
