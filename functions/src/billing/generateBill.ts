import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generatePDF } from "./generatePDF";

export const generateMonthlyBills = functions.pubsub.schedule("0 0 1 * *")
  .timeZone("Asia/Colombo")
  .onRun(async (context) => {
    const db = admin.database();
    
    try {
      const metersSnapshot = await db.ref('/meters').once('value');
      const meters = metersSnapshot.val();
      
      if (!meters) {
        functions.logger.info('No meters found to bill.');
        return null;
      }

      const now = new Date();
      // Calculate previous month string (e.g., "2024-05")
      now.setMonth(now.getMonth() - 1);
      const lastMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const promises = Object.keys(meters).map(async (meterId) => {
        const meterInfo = meters[meterId]?.info;
        if (!meterInfo || meterInfo.status !== 'online') return;

        const monthlyDataRef = db.ref(`/meters/${meterId}/readings/monthly/${lastMonthStr}`);
        const monthlyDataSnap = await monthlyDataRef.once('value');
        const monthlyData = monthlyDataSnap.val();

        if (!monthlyData) return;

        const totalUnits = monthlyData.units || 0;
        
        // SLEB Tariff calculation
        let totalCost = 0;
        let fixedCharge = 0;
        if (totalUnits <= 30) {
          totalCost = totalUnits * 8.00;
          fixedCharge = 150.00;
        } else if (totalUnits <= 60) {
          totalCost = (30 * 8.00) + ((totalUnits - 30) * 20.00);
          fixedCharge = 300.00;
        } else if (totalUnits <= 90) {
          totalCost = (30 * 8.00) + (30 * 20.00) + ((totalUnits - 60) * 30.00);
          fixedCharge = 400.00;
        } else if (totalUnits <= 120) {
          totalCost = (30 * 8.00) + (30 * 20.00) + (30 * 30.00) + ((totalUnits - 90) * 50.00);
          fixedCharge = 1000.00;
        } else if (totalUnits <= 180) {
          totalCost = (30 * 8.00) + (30 * 20.00) + (30 * 30.00) + (30 * 50.00) + ((totalUnits - 120) * 60.00);
          fixedCharge = 1500.00;
        } else {
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
        await generatePDF(meterId, billId, billRecord, meterInfo);
        
        functions.logger.info(`Generated bill ${billId} for meter ${meterId}`);
      });

      await Promise.all(promises);
      functions.logger.info('Monthly billing completed successfully.');
      return null;

    } catch (error) {
      functions.logger.error('Error generating monthly bills', error);
      return null;
    }
  });
