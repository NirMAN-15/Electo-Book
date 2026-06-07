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
exports.sendBillEmail = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
const v2_1 = require("firebase-functions/v2");
exports.sendBillEmail = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    const context = request.auth;
    const data = request.data;
    if (!context) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { meterId, billId } = data;
    if (!meterId || !billId) {
        throw new https_1.HttpsError("invalid-argument", "Missing meterId or billId");
    }
    const db = admin.database();
    try {
        const billSnap = await db.ref(`/bills/${meterId}/${billId}`).once('value');
        const bill = billSnap.val();
        if (!bill) {
            throw new https_1.HttpsError("not-found", "Bill not found");
        }
        const userProfileSnap = await db.ref(`/users/${context.uid}/profile`).once('value');
        const userProfile = userProfileSnap.val();
        if (!userProfile || !userProfile.email) {
            throw new https_1.HttpsError("failed-precondition", "User email not found");
        }
        // Configure transport using env vars (fallback to mock for compilation)
        const emailUser = process.env.EMAIL_USER || "test@example.com";
        const emailPass = process.env.EMAIL_PASS || "password";
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });
        const mailOptions = {
            from: `"Electro Book Billing" <${emailUser}>`,
            to: userProfile.email,
            subject: `Electro Book - Your Electricity Bill for ${bill.month}`,
            html: `
        <h2>Your Electricity Bill</h2>
        <p>Dear ${userProfile.name},</p>
        <p>Your bill for ${bill.month} has been generated.</p>
        <p><strong>Total Units:</strong> ${bill.totalUnits.toFixed(2)} kWh</p>
        <p><strong>Total Amount Due:</strong> Rs. ${bill.totalCost.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${new Date(bill.dueDate).toLocaleDateString()}</p>
        <p><a href="${bill.pdfUrl}">Click here to download your PDF invoice</a></p>
        <p>Thank you for using Electro Book.</p>
      `
        };
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Email sent successfully" };
    }
    catch (error) {
        v2_1.logger.error("Error sending email:", error);
        throw new https_1.HttpsError("internal", error.message || "Failed to send email");
    }
});
//# sourceMappingURL=sendBillEmail.js.map