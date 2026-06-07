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
exports.generateMonthlyBills = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
const generatePDF_1 = require("./generatePDF");
exports.generateMonthlyBills = (0, scheduler_1.onSchedule)({
    schedule: "0 0 1 * *",
    timeZone: "Asia/Colombo",
    region: "asia-south1",
}, async () => {
    const db = admin.database();
    try {
        const metersSnapshot = await db.ref('/meters').once('value');
        const meters = metersSnapshot.val();
        if (!meters) {
            v2_1.logger.info('No meters found to bill.');
            return;
        }
        const now = new Date();
        // Calculate previous month string (e.g., "2024-05")
        now.setMonth(now.getMonth() - 1);
        const lastMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const promises = Object.keys(meters).map(async (meterId) => {
            const meterInfo = meters[meterId]?.info;
            if (!meterInfo || meterInfo.status !== 'online')
                return;
            const monthlyDataRef = db.ref(`/meters/${meterId}/readings/monthly/${lastMonthStr}`);
            const monthlyDataSnap = await monthlyDataRef.once('value');
            const monthlyData = monthlyDataSnap.val();
            if (!monthlyData)
                return;
            const totalUnits = monthlyData.units || 0;
            // SLEB Tariff calculation
            let totalCost = 0;
            let fixedCharge = 0;
            if (totalUnits <= 30) {
                totalCost = totalUnits * 8.00;
                fixedCharge = 150.00;
            }
            else if (totalUnits <= 60) {
                totalCost = (30 * 8.00) + ((totalUnits - 30) * 20.00);
                fixedCharge = 300.00;
            }
            else if (totalUnits <= 90) {
                totalCost = (30 * 8.00) + (30 * 20.00) + ((totalUnits - 60) * 30.00);
                fixedCharge = 400.00;
            }
            else if (totalUnits <= 120) {
                totalCost = (30 * 8.00) + (30 * 20.00) + (30 * 30.00) + ((totalUnits - 90) * 50.00);
                fixedCharge = 1000.00;
            }
            else if (totalUnits <= 180) {
                totalCost = (30 * 8.00) + (30 * 20.00) + (30 * 30.00) + (30 * 50.00) + ((totalUnits - 120) * 60.00);
                fixedCharge = 1500.00;
            }
            else {
                totalCost = (30 * 8.00) + (30 * 20.00) + (30 * 30.00) + (30 * 50.00) + (60 * 60.00) + ((totalUnits - 180) * 75.00);
                fixedCharge = 2000.00;
            }
            const costBeforeSSCL = totalCost + fixedCharge;
            totalCost = costBeforeSSCL * 1.025; // Apply 2.5% SSCL
            const billId = `bill_${lastMonthStr}_${meterId}`;
            const dueDateTimestamp = Date.now() + (15 * 24 * 60 * 60 * 1000); // 15 days from now
            const billRecord = {
                month: lastMonthStr,
                totalUnits,
                totalCost,
                tariffRate: meterInfo.tariffRate || 0,
                status: 'unpaid',
                generatedAt: admin.database.ServerValue.TIMESTAMP,
                dueDate: dueDateTimestamp,
                pdfUrl: '', // Generated asynchronously below
                paidAt: null,
                paymentRef: null
            };
            await db.ref(`/bills/${meterId}/${billId}`).set(billRecord);
            // Generate PDF async
            await (0, generatePDF_1.generatePDF)(meterId, billId, billRecord, meterInfo);
            v2_1.logger.info(`Generated bill ${billId} for meter ${meterId}`);
        });
        await Promise.all(promises);
        v2_1.logger.info('Monthly billing completed successfully.');
        return;
    }
    catch (error) {
        v2_1.logger.error('Error generating monthly bills', error);
        return;
    }
});
//# sourceMappingURL=generateBill.js.map