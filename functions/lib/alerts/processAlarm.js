"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAlarmTrigger = void 0;
const database_1 = require("firebase-functions/v2/database");
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
exports.processAlarmTrigger = (0, database_1.onValueWritten)({ ref: "/meters/{meterId}/live", region: "asia-south1" }, async (event) => {
    const afterData = event.data.after.val();
    if (!afterData)
        return null;
    const meterId = event.params.meterId;
    const db = admin.database();
    try {
        const thresholdsSnap = await db.ref(`/meters/${meterId}/thresholds`).once('value');
        const thresholds = thresholdsSnap.val();
        if (!thresholds)
            return null;
        const alarms = [];
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
    }
    catch (error) {
        v2_1.logger.error("Error processing alarms", error);
        return null;
    }
});
//# sourceMappingURL=processAlarm.js.map