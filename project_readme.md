# Electro-Book: Smart Energy Monitoring Platform

Electro-Book is a modern, full-stack smart energy monitoring and billing platform. It allows consumers to view their real-time electricity usage, pay bills, receive alerts, and predict future energy consumption based on live data coming from ESP32 hardware sensors. 

## 🏗️ Project Architecture (Monorepo)

This project is structured as a monorepo containing multiple interfaces connected to a single serverless backend:

- **/web-dashboard** - The administrative and consumer web portal built with React and Vite.
- **/mobile-app** - The cross-platform mobile application built with React, Vite, and Capacitor (for Android APK generation).
- **Backend Infrastructure** - Fully powered by **Firebase** (Realtime Database & Authentication). 

## 🚀 Key Features

1. **Real-time Monitoring**: Connects to ESP32 hardware to stream live Voltage, Current, and Power Factor data.
2. **Automated Billing & PDF Invoices**: Generates monthly cost estimations and provides automated, downloadable PDF invoices using `jsPDF`.
3. **Usage Predictions**: Uses historical hourly/daily consumption to forecast monthly energy costs.
4. **Custom Alerts**: Define threshold alerts for voltage spikes or abnormal current draws.
5. **Role-Based Access**: Distinct interfaces for standard consumers and system administrators.

## 🛠️ Tech Stack
* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React (Icons), Recharts (Data Visualization).
* **Mobile**: Capacitor (Generates native Android APK from the web build).
* **Backend**: Firebase Authentication (Email/Password), Firebase Realtime Database.

---

## 🌐 1. Deploying the Web Dashboard (Vercel)

The `web-dashboard` is optimized for zero-config deployment on Vercel.

1. Push this entire repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and create a new project.
3. Import your GitHub repository.
4. Important: Set the **Root Directory** to `web-dashboard` in the Vercel project settings.
5. Add your `VITE_FIREBASE_*` environment variables in the Vercel settings.
6. Click **Deploy**. Vercel will automatically build the web portal.

---

## 📱 2. Building the Mobile APK (GitHub Actions)

This repository includes a completely automated CI/CD pipeline via GitHub Actions to build your Android APK without needing local Java or Android Studio.

1. Push this repository to GitHub.
2. GitHub Actions will automatically detect the `.github/workflows/build-android.yml` file.
3. Navigate to the **Actions** tab on your GitHub repository page.
4. Click on the running "Build Android APK" workflow.
5. Once completed, scroll to the bottom of the summary page to download the `Electro-Book-App` artifact containing your compiled `.apk` file.

---

## 🔌 3. Connecting the Hardware (ESP32)

To feed real data into your Electro-Book database, flash an ESP32 microcontroller with the Arduino IDE using the **Firebase ESP32 Client** by Mobizt.

Here is the base C++ code to integrate the ESP32:

```cpp
#include <WiFi.h>
#include <FirebaseESP32.h>

#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

#define FIREBASE_HOST "electro-book-v01-default-rtdb.asia-southeast1.firebasedatabase.app"
#define API_KEY "YOUR_FIREBASE_API_KEY"

#define USER_EMAIL "admin@electrobook.com"
#define USER_PASSWORD "AdminPassword123!"

FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

// Get this from Firebase Authentication dashboard
String uid = "YOUR_USER_ID"; 

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(300); }
  
  config.api_key = API_KEY;
  config.database_url = FIREBASE_HOST;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  float voltage = 230.0 + random(-5, 5);
  float current = 13.5;
  float powerFactor = 0.95;

  String basePath = "/meters/" + uid;
  Firebase.setString(firebaseData, basePath + "/status", "connected");
  Firebase.setFloat(firebaseData, basePath + "/live/voltage", voltage);
  Firebase.setFloat(firebaseData, basePath + "/live/current", current);
  Firebase.setFloat(firebaseData, basePath + "/live/powerFactor", powerFactor);
  
  delay(5000); 
}
```

## 🔒 Environment Variables

Both the `/web-dashboard` and `/mobile-app` directories require a `.env` file containing your Firebase credentials to function locally:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
