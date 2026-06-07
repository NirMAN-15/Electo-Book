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
exports.updateSystemStats = void 0;
const database_1 = require("firebase-functions/v2/database");
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
// Update stats when new meter is added
exports.updateSystemStats = (0, database_1.onValueCreated)({ ref: "/meters/{meterId}", region: "asia-south1" }, async (event) => {
    const db = admin.database();
    try {
        const statsRef = db.ref('/admin/systemStats/totalMeters');
        await statsRef.transaction((currentValue) => {
            return (currentValue || 0) + 1;
        });
        await db.ref('/admin/systemStats/lastUpdated').set(admin.database.ServerValue.TIMESTAMP);
    }
    catch (error) {
        v2_1.logger.error("Error updating system stats", error);
    }
});
//# sourceMappingURL=updateSystemStats.js.map