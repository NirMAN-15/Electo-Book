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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
const admin = __importStar(require("firebase-admin"));
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generatePDF(meterId, billId, billRecord, meterInfo) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ margin: 50 });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', async () => {
                const pdfBuffer = Buffer.concat(buffers);
                const bucket = admin.storage().bucket();
                const file = bucket.file(`bills/${meterId}/${billId}.pdf`);
                await file.save(pdfBuffer, {
                    metadata: { contentType: 'application/pdf' },
                    public: true // Make readable
                });
                // Get public URL (or signed URL depending on bucket settings, using a simple public URL here for brevity)
                const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
                await admin.database().ref(`/bills/${meterId}/${billId}`).update({ pdfUrl });
                resolve();
            });
            // --- Build PDF Content ---
            // Header
            doc.fontSize(20).text('Sri Lanka Electricity Board', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).text('Electricity Bill Invoice', { align: 'center' });
            doc.moveDown(2);
            // Details
            doc.fontSize(12);
            doc.text(`Meter ID: ${meterId}`);
            doc.text(`Phase: ${meterInfo.phase || 'N/A'}`);
            doc.text(`Location: ${meterInfo.location || 'N/A'}`);
            doc.text(`Billing Month: ${billRecord.month}`);
            doc.text(`Generated Date: ${new Date(billRecord.generatedAt).toLocaleDateString()}`);
            doc.text(`Due Date: ${new Date(billRecord.dueDate).toLocaleDateString()}`);
            doc.moveDown();
            // Usage Table (simple text format for PDFKit without external tables plugin)
            doc.text('----------------------------------------------------');
            doc.text(`Total Units Consumed: ${billRecord.totalUnits.toFixed(2)} kWh`);
            doc.text('----------------------------------------------------');
            doc.moveDown();
            doc.fontSize(16).text(`Total Amount Due: Rs. ${billRecord.totalCost.toFixed(2)}`, { align: 'right' });
            doc.moveDown(2);
            doc.fontSize(10).text('Please pay your bill before the due date to avoid disconnection.', { align: 'center' });
            doc.text('Scan QR code on our app or pay via bank transfer.', { align: 'center' });
            doc.end();
        }
        catch (error) {
            console.error('PDF Generation Error', error);
            reject(error);
        }
    });
}
//# sourceMappingURL=generatePDF.js.map