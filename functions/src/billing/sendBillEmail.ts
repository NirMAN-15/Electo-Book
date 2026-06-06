import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

export const sendBillEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { meterId, billId } = data;
  if (!meterId || !billId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing meterId or billId");
  }

  const db = admin.database();
  
  try {
    const billSnap = await db.ref(`/bills/${meterId}/${billId}`).once('value');
    const bill = billSnap.val();
    if (!bill) {
      throw new functions.https.HttpsError("not-found", "Bill not found");
    }

    const userProfileSnap = await db.ref(`/users/${context.auth.uid}/profile`).once('value');
    const userProfile = userProfileSnap.val();
    if (!userProfile || !userProfile.email) {
      throw new functions.https.HttpsError("failed-precondition", "User email not found");
    }

    // Configure transport using env vars (fallback to mock for compilation)
    const emailUser = functions.config().email?.user || process.env.EMAIL_USER || "test@example.com";
    const emailPass = functions.config().email?.pass || process.env.EMAIL_PASS || "password";

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
    functions.logger.error("Error sending email:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to send email");
  }
});
