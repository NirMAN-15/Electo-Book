import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { logger } from "firebase-functions/v2";
import type { CallableRequest } from "firebase-functions/v2/https";

interface SendBillEmailRequest {
  meterId: string;
  billId: string;
}

export const sendBillEmail = onCall(
  { region: "asia-south1" },
  async (request: CallableRequest<SendBillEmailRequest>) => {
    const context = request.auth;
    const data = request.data;

    if (!context) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { meterId, billId } = data;

    if (!meterId || !billId) {
      throw new HttpsError("invalid-argument", "Missing meterId or billId");
    }

    const db = admin.database();
    
    try {
      const billSnap = await db.ref(`/bills/${meterId}/${billId}`).once('value');
      const bill = billSnap.val();
      if (!bill) {
        throw new HttpsError("not-found", "Bill not found");
      }

      const userProfileSnap = await db.ref(`/users/${context.uid}/profile`).once('value');
      const userProfile = userProfileSnap.val();
      if (!userProfile || !userProfile.email) {
        throw new HttpsError("failed-precondition", "User email not found");
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

  } catch (error: any) {
    logger.error("Error sending email:", error);
    throw new HttpsError("internal", error.message || "Failed to send email");
  }
});
