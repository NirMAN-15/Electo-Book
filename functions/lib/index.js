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
exports.updateSystemStats = exports.aggregateDailyReadings = exports.aggregateHourlyReadings = exports.getAIAdvice = exports.processAlarmTrigger = exports.sendBillEmail = exports.generateMonthlyBills = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin App
admin.initializeApp();
// Export Auth functions - Note: Auth triggers not yet supported in firebase-functions v2
// export { onUserCreate } from "./auth/onUserCreate";
// Export Billing functions
var generateBill_1 = require("./billing/generateBill");
Object.defineProperty(exports, "generateMonthlyBills", { enumerable: true, get: function () { return generateBill_1.generateMonthlyBills; } });
var sendBillEmail_1 = require("./billing/sendBillEmail");
Object.defineProperty(exports, "sendBillEmail", { enumerable: true, get: function () { return sendBillEmail_1.sendBillEmail; } });
// Export Alerts functions
var processAlarm_1 = require("./alerts/processAlarm");
Object.defineProperty(exports, "processAlarmTrigger", { enumerable: true, get: function () { return processAlarm_1.processAlarmTrigger; } });
// Export Predictions functions
var getAIAdvice_1 = require("./predictions/getAIAdvice");
Object.defineProperty(exports, "getAIAdvice", { enumerable: true, get: function () { return getAIAdvice_1.getAIAdvice; } });
// Export Meter functions
var aggregateReadings_1 = require("./meter/aggregateReadings");
Object.defineProperty(exports, "aggregateHourlyReadings", { enumerable: true, get: function () { return aggregateReadings_1.aggregateHourlyReadings; } });
Object.defineProperty(exports, "aggregateDailyReadings", { enumerable: true, get: function () { return aggregateReadings_1.aggregateDailyReadings; } });
// Export Admin functions
var updateSystemStats_1 = require("./admin/updateSystemStats");
Object.defineProperty(exports, "updateSystemStats", { enumerable: true, get: function () { return updateSystemStats_1.updateSystemStats; } });
//# sourceMappingURL=index.js.map