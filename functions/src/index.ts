import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin App
admin.initializeApp();

// Export Auth functions
export { onUserCreate } from "./auth/onUserCreate";

// Export Billing functions
export { generateMonthlyBills } from "./billing/generateBill";
export { sendBillEmail } from "./billing/sendBillEmail";

// Export Alerts functions
export { processAlarmTrigger } from "./alerts/processAlarm";

// Export Predictions functions
export { getAIPrediction } from "./predictions/getAIAdvice";

// Export Meter functions
export { aggregateHourlyReadings, aggregateDailyReadings } from "./meter/aggregateReadings";

// Export Admin functions
export { updateSystemStats } from "./admin/updateSystemStats";
