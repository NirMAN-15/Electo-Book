# Electro-Book: Full Project Explanation
# Electro-Book: සම්පූර්ණ ව්‍යාපෘති විස්තරය

This document provides a comprehensive explanation of the Electro-Book project's architecture, its main files, and exactly how the data analysis and calculations are performed.
මෙම ලේඛනය මගින් Electro-Book ව්‍යාපෘතියේ ව්‍යුහය, ප්‍රධාන ගොනු, සහ දත්ත විශ්ලේෂණය මෙන්ම ගණනය කිරීම් සිදුකරන ආකාරය පිළිබඳ සම්පූර්ණ විස්තරයක් සපයයි.

---

## 1. Project Overview / ව්‍යාපෘති දළ විශ්ලේෂණය

**[English]**
Electro-Book is a smart energy monitoring platform. It consists of two main user interfaces:
1. **Web Dashboard**: Used by both Consumers (to view usage) and Administrators (to manage all meters and users).
2. **Mobile App**: Designed specifically for consumers to track their live usage, predict bills, and pay their monthly electricity invoices via an Android device.
Both interfaces are powered entirely by **Firebase** (Realtime Database & Authentication) and read sensor data pushed by physical **ESP32** IoT devices.

**[සිංහල]**
Electro-Book යනු ස්මාර්ට් බලශක්ති නිරීක්ෂණ පද්ධතියකි (Smart Energy Monitoring Platform). මෙහි ප්‍රධාන අතුරු මුහුණත් (User Interfaces) දෙකක් ඇත:
1. **Web Dashboard (වෙබ් පද්ධතිය)**: පාරිභෝගිකයින්ට තම විදුලි භාවිතය බැලීමටත්, පරිපාලකයින්ට (Admins) සමස්ත පද්ධතියම පාලනය කිරීමටත් මෙය භාවිතා වේ.
2. **Mobile App (ජංගම යෙදුම)**: පාරිභෝගිකයින් සඳහා පමණක් නිර්මාණය කර ඇති මෙය හරහා ඔවුන්ට තම සජීවී විදුලි භාවිතය බැලීමට, බිල්පත් ගෙවීමට සහ ඉදිරි මාසයේ බිල කල්තියා අනුමාන (Predict) කිරීමට හැක.
මෙම පද්ධති දෙකම **Firebase** දත්ත සමුදාය (Database) මගින් බලගන්වා ඇති අතර, භෞතික **ESP32** උපකරණ හරහා සැබෑ කාලීන (Live) දත්ත ලබා ගනී.

---

## 2. Main Files Structure / ප්‍රධාන ගොනු ව්‍යුහය

The project is structured as a "Monorepo" containing multiple folders.
මෙම ව්‍යාපෘතිය ප්‍රධාන කොටස් (Folders) කිහිපයකින් සමන්විත වේ.

### 🔹 `/web-dashboard/` & `/mobile-app/`
Both folders share a similar internal structure built using React and TypeScript.
මෙම Folders දෙකම React සහ TypeScript භාවිතා කරමින් එකම ආකාරයේ ව්‍යුහයකට ගොඩනගා ඇත.

* `src/components/` - Contains all the visible UI elements (e.g., `BillHistory.tsx` for PDF generation, `ConsumerDashboard.tsx` for live charts). / මෙහි පරිශීලකයාට පෙනෙන සියලුම අතුරු මුහුණත් අඩංගු වේ.
* `src/firebase/config.ts` - The vital file that securely connects the frontend interfaces directly to the Firebase database using API keys. / පද්ධතිය Firebase දත්ත සමුදාය (Database) සමග සම්බන්ධ කරන ප්‍රධාන ගොනුවයි.
* `src/hooks/useMeterData.ts` - A React Hook that acts as a bridge, listening to the Realtime Database and updating the screen instantly without refreshing. / පද්ධතිය Refresh නොකර සජීවී දත්ත (Live Data) තිරය මත පෙන්වීමට උදවු කරන ප්‍රධාන ගොනුවයි.
* `src/services/` - The most important directory! It contains the "Brain" of the project where all the math and logic live. / ව්‍යාපෘතියේ "මොළය" බඳු වූ සියලුම ගණනය කිරීම් සහ තර්කන (Logic) ඇතුළත් වන ස්ථානයයි.

---

## 3. How Analytics & Calculations Work / ගණනය කිරීම් සහ විශ්ලේෂණය ක්‍රියා කරන ආකාරය

The mathematical calculations and data processing happen purely inside the **`src/services/`** folder. Here is how the files work together:
සියලුම ගණිතමය ක්‍රියාකාරකම් සිදුවන්නේ **`src/services/`** folder එක තුළය. එම ගොනු ක්‍රියාත්මක වන ආකාරය පහත දැක්වේ:

### ⚡ A. Real-time Meter Calculations (`meterService.ts`)
**[English]**
This file connects to Firebase and reads the raw live data pushed by the ESP32 (`voltage`, `current`, `powerFactor`). 
It calculates **Real Power (Watts)** using the physics formula: `Power = Voltage × Current × PowerFactor`. 
It then accumulates these Watts over time to calculate **Energy Consumed (kWh)**.

**[සිංහල]**
මෙම ගොනුව Firebase හා සම්බන්ධ වී ESP32 මගින් එවනු ලබන මූලික දත්ත (වෝල්ටීයතාවය, ධාරාව, බල සාධකය) ලබා ගනී. 
එම දත්ත භාවිතයෙන් `Power = Voltage × Current × PowerFactor` යන භෞතික විද්‍යාත්මක සූත්‍රය මගින් **තථ්‍ය බලය (Real Power)** ගණනය කරයි. ඉන්පසුව එම බලය කාලයත් සමග එකතු කර පරිභෝජනය කළ විදුලි ඒකක (kWh) ගණනය කරනු ලබයි.

### 💰 B. Billing Calculations (`billingService.ts`)
**[English]**
This file handles the money. Once `meterService` determines how many kWh (Units) a user has consumed, `billingService.ts` applies the local electricity tariff structure (e.g., Ceylon Electricity Board pricing tiers). 
If a user uses under 60 units, they are charged a lower rate. If they exceed 60 units, the price per unit increases drastically. This file calculates the final total `Amount Due`.

**[සිංහල]**
මෙම ගොනුව මගින් බිල්පත (මුදල) ගණනය කරයි. පාරිභෝගිකයා කොපමණ ඒකක ප්‍රමාණයක් (kWh) භාවිතා කර ඇත්දැයි සොයාගත් පසු, ලංකා විදුලිබල මණ්ඩලයේ (CEB) ගාස්තු ක්‍රමයට අනුව මෙම ගොනුව මගින් බිල ගණනය කෙරේ. 
උදාහරණයක් ලෙස ඒකක 60 ට අඩුවෙන් භාවිතා කළහොත් අඩු මිලකුත්, ඊට වැඩි වුවහොත් වැඩි මිලකුත් ලෙස Block-based ක්‍රමයට ගණනය කර අවසාන බිල් මුදල සකසයි.

### 🔮 C. AI & Predictions (`predictionService.ts`)
**[English]**
This file is responsible for the forecasting charts. It reads the user's historical `hourlyData` and `dailyData`. 
By analyzing the average usage trends from the past few days, it mathematically projects what the total consumption will be by the 30th day of the month. It warns the user if their current trajectory will push them into a higher, more expensive tariff block.

**[සිංහල]**
මෙය අනාගත බිල්පත අනුමාන කරන (Forecasting) ගොනුවයි. පාරිභෝගිකයාගේ පැය සහ දෛනික භාවිත ඉතිහාසය (Historical Data) අධ්‍යයනය කිරීම මෙහිදී සිදුවේ. 
පසුගිය දින කිහිපයේ සාමාන්‍ය භාවිතය විශ්ලේෂණය කිරීමෙන්, මාසය අවසානය වන විට කොපමණ ඒකක ප්‍රමාණයක් දහනය වේදැයි ගණිතමය වශයෙන් මෙය අනුමාන කරයි. පාරිභෝගිකයාගේ භාවිතය අනුව ඉදිරියේදී විශාල බිලක් පැමිණීමට ඉඩ ඇත්නම් මෙය කලින්ම අනතුරු අඟවයි.

### 🔔 D. Alarms & Limits (`alarmService.ts`)
**[English]**
This continuously compares the live data from `meterService` against the thresholds set by the user. If the Live Voltage > Max Safe Voltage (e.g., 250V), this service instantly triggers a warning notification.

**[සිංහල]**
සජීවී දත්ත සහ පාරිභෝගිකයා ලබා දී ඇති සීමාවන් (Thresholds) නිරන්තරයෙන් සංසන්දනය කිරීම මෙහිදී සිදුවේ. උදාහරණයක් ලෙස සජීවී වෝල්ටීයතාවය උපරිම සීමාවට (උදා: 250V) වඩා වැඩි වුවහොත්, මෙය වහාම පද්ධතිය තුළ අනතුරු ඇඟවීමක් (Alarm) නිකුත් කරයි.
