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
exports.aggregateDailyReadings = exports.aggregateHourlyReadings = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
exports.aggregateHourlyReadings = (0, scheduler_1.onSchedule)({
    schedule: "0 * * * *",
    timeZone: "Asia/Colombo",
    region: "asia-south1",
}, async () => {
    const db = admin.database();
    try {
        const metersSnap = await db.ref('/meters').once('value');
        const meters = metersSnap.val();
        if (!meters)
            return;
        const now = Date.now();
        const cutoffTime = now - (72 * 60 * 60 * 1000); // Keep last 72 hours
        const promises = Object.keys(meters).map(async (meterId) => {
            const live = meters[meterId]?.live;
            if (!live)
                return;
            // Write snapshot
            const timestamp = new Date().toISOString();
            const reading = {
                voltage: live.voltage || 0,
                current: live.current || 0,
                power: live.currentPower || 0,
                powerFactor: live.powerFactor || 0,
                cost: live.accumulatedCostToday || 0,
                timestamp: now
            };
            await db.ref(`/meters/${meterId}/readings/hourly/${timestamp.replace(/[\.\#\$\/\[\]]/g, '_')}`).set(reading);
            // Cleanup old entries
            const hourlyRef = db.ref(`/meters/${meterId}/readings/hourly`);
            const oldSnap = await hourlyRef.orderByChild('timestamp').endAt(cutoffTime).once('value');
            const oldEntries = oldSnap.val();
            if (oldEntries) {
                const deletes = Object.keys(oldEntries).map(key => hourlyRef.child(key).remove());
                await Promise.all(deletes);
            }
        });
        await Promise.all(promises);
        v2_1.logger.info("Hourly aggregation complete");
        return;
    }
    catch (error) {
        v2_1.logger.error("Error aggregating hourly readings", error);
        return;
    }
});
exports.aggregateDailyReadings = (0, scheduler_1.onSchedule)({
    schedule: "0 0 * * *",
    timeZone: "Asia/Colombo",
    region: "asia-south1",
}, async () => {
    const db = admin.database();
    try {
        const metersSnap = await db.ref('/meters').once('value');
        const meters = metersSnap.val();
        if (!meters)
            return;
        const promises = Object.keys(meters).map(async (meterId) => {
            const live = meters[meterId]?.live;
            if (!live)
                return;
            // Today's date string (yesterday technically, since it runs at midnight)
            const date = new Date();
            date.setDate(date.getDate() - 1);
            const dateStr = date.toISOString().split('T')[0];
            const dailyReading = {
                units: live.totalUnitsToday || 0,
                cost: live.accumulatedCostToday || 0,
                peakPower: live.currentPower || 0, // Simplified peak calculation
                avgVoltage: live.voltage || 0
            };
            await db.ref(`/meters/${meterId}/readings/daily/${dateStr}`).set(dailyReading);
            // Reset live accumulators
            await db.ref(`/meters/${meterId}/live`).update({
                totalUnitsToday: 0,
                accumulatedCostToday: 0
            });
            // If it's the last day of the month, update monthly
            // (Handled partially by billing, but this keeps simple tracking)
            const monthStr = dateStr.substring(0, 7);
            const monthlyRef = db.ref(`/meters/${meterId}/readings/monthly/${monthStr}`);
            await monthlyRef.transaction((current) => {
                if (!current) {
                    return { units: dailyReading.units, cost: dailyReading.cost, daysRecorded: 1 };
                }
                return {
                    units: current.units + dailyReading.units,
                    cost: current.cost + dailyReading.cost,
                    daysRecorded: current.daysRecorded + 1
                };
            });
        });
        await Promise.all(promises);
        v2_1.logger.info("Daily aggregation and reset complete");
        return;
    }
    catch (error) {
        v2_1.logger.error("Error aggregating daily readings", error);
        return;
    }
});
//# sourceMappingURL=aggregateReadings.js.map