import * as admin from "firebase-admin";
import PDFDocument from "pdfkit";

export async function generatePDF(meterId: string, billId: string, billRecord: any, meterInfo: any) {
  return new Promise<void>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      
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

    } catch (error) {
      console.error('PDF Generation Error', error);
      reject(error);
    }
  });
}
