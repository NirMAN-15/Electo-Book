import { onValueWritten } from "firebase-functions/v2/database";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";

export const processAlarmTrigger = onValueWritten(
  { ref: "/meters/{meterId}/live", region: "asia-south1" },
  async (event) => {
    const afterData = event.data.after.val();
    if (!afterData) return null;

    const meterId = event.params.meterId;
    const db = admin.database();

    try {
      const thresholdsSnap = await db.ref(`/meters/${meterId}/thresholds`).once('value');
      const thresholds = thresholdsSnap.val();
      if (!thresholds) return null;

      const alarms: any[] = [];
      const timestamp = admin.database.ServerValue.TIMESTAMP;

      // Check breaches
      if (afterData.voltage < thresholds.lowVoltage) {
        alarms.push({ type: 'voltage', value: afterData.voltage, message: 'Under-voltage detected', isActive: true, timestamp, acknowledged: false });
      }
      if (afterData.voltage > thresholds.highVoltage) {
        alarms.push({ type: 'voltage', value: afterData.voltage, message: 'Over-voltage detected', isActive: true, timestamp, acknowledged: false });
      }
      if (afterData.current > thresholds.maxCurrent) {
        alarms.push({ type: 'current', value: afterData.current, message: 'Over-current detected', isActive: true, timestamp, acknowledged: false });
      }
      if (afterData.powerFactor < thresholds.minPowerFactor) {
        alarms.push({ type: 'pf', value: afterData.powerFactor, message: 'Low power factor detected', isActive: true, timestamp, acknowledged: false });
      }
      if (afterData.accumulatedCostToday > thresholds.maxDailyCost) {
        alarms.push({ type: 'cost', value: afterData.accumulatedCostToday, message: 'Daily cost limit exceeded', isActive: true, timestamp, acknowledged: false });
      }

      if (alarms.length > 0) {
        const alarmPromises = alarms.map(async (alarm) => {
          const newAlarmRef = db.ref(`/alarms/${meterId}`).push();
          await newAlarmRef.set(alarm);
          
          // Increment system active alarms
          const statsRef = db.ref('/admin/systemStats/activeAlarms');
          await statsRef.transaction((currentValue) => (currentValue || 0) + 1);
        });
        
        await Promise.all(alarmPromises);
      }

      return null;
    } catch (error) {
      logger.error("Error processing alarms", error);
      return null;
    }
  }
);
