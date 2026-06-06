/**
 * Billing Service
 * 
 * Handles bill retrieval and payment recording in Firebase RTDB.
 * Bills: /bills/{meterId}/
 * Payments: /payments/
 */

import {
  ref,
  get,
  push,
  set,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database';
import { db, isFirebaseConfigured } from '../firebase/config';
import { Bill, Payment } from '../types';

/**
 * Get all bills for a meter from /bills/{meterId}.
 */
export async function getBills(meterId: string): Promise<Bill[]> {
  if (!db) return [];
  try {
    const snapshot = await get(ref(db, `bills/${meterId}`));
    if (!snapshot.exists()) return [];

    const bills: Bill[] = [];
    snapshot.forEach((child) => {
      bills.push({ ...child.val(), id: child.key } as Bill);
    });
    // Sort by generatedAt descending (newest first)
    return bills.sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0));
  } catch (error) {
    console.error('[BillingService] Failed to get bills:', error);
    return [];
  }
}

/**
 * Get the most recent bill for a meter.
 */
export async function getLatestBill(meterId: string): Promise<Bill | null> {
  if (!db) return null;
  try {
    const billsRef = query(
      ref(db, `bills/${meterId}`),
      orderByChild('generatedAt'),
      limitToLast(1)
    );
    const snapshot = await get(billsRef);
    if (!snapshot.exists()) return null;

    let latestBill: Bill | null = null;
    snapshot.forEach((child) => {
      latestBill = { ...child.val(), id: child.key } as Bill;
    });
    return latestBill;
  } catch (error) {
    console.error('[BillingService] Failed to get latest bill:', error);
    return null;
  }
}

/**
 * Record a payment at /payments/{paymentId} and update the corresponding bill status.
 */
export async function recordPayment(paymentData: Omit<Payment, 'id'>): Promise<string | null> {
  if (!db) return null;
  try {
    // Push payment record
    const paymentsRef = ref(db, 'payments');
    const newRef = await push(paymentsRef, {
      ...paymentData,
      paidAt: Date.now(),
    });

    // Update the bill status to 'paid' if billId is provided
    if (paymentData.billId && paymentData.meterId) {
      await set(ref(db, `bills/${paymentData.meterId}/${paymentData.billId}/status`), 'paid');
      await set(ref(db, `bills/${paymentData.meterId}/${paymentData.billId}/paidAt`), Date.now());
      await set(
        ref(db, `bills/${paymentData.meterId}/${paymentData.billId}/paymentRef`),
        newRef.key
      );
    }

    return newRef.key;
  } catch (error) {
    console.error('[BillingService] Failed to record payment:', error);
    return null;
  }
}

/**
 * Generate a simulated bill and write it to /bills/{meterId}.
 */
export async function generateBill(
  meterId: string,
  billData: Omit<Bill, 'id'>
): Promise<string | null> {
  if (!db) return null;
  try {
    const billsRef = ref(db, `bills/${meterId}`);
    const newRef = await push(billsRef, billData);
    return newRef.key;
  } catch (error) {
    console.error('[BillingService] Failed to generate bill:', error);
    return null;
  }
}

/**
 * Check if the billing service is available.
 */
export function isBillingServiceAvailable(): boolean {
  return isFirebaseConfigured() && db !== null;
}
