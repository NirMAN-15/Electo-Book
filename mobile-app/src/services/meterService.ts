/**
 * Meter Service
 * 
 * Handles all meter-related RTDB operations including live data subscriptions,
 * reading history, thresholds, and meter settings.
 */

import {
  ref,
  onValue,
  get,
  set,
  push,
  update,
  query,
  orderByKey,
  limitToLast,
  Unsubscribe,
} from 'firebase/database';
import { db, isFirebaseConfigured } from '../firebase/config';
import {
  MeterState,
  MeterSettings,
  AlarmThresholds,
  HourlyReading,
  DailyReading,
} from '../types';

/**
 * Subscribe to live meter data at /meters/{meterId}/live.
 * Returns an unsubscribe function.
 */
export function subscribeLiveMeter(
  meterId: string,
  callback: (data: MeterState | null) => void
): Unsubscribe {
  if (!db || !isFirebaseConfigured()) {
    console.warn('[MeterService] Firebase not available for live subscription');
    return () => {};
  }
  const meterRef = ref(db, `meters/${meterId}/live`);
  return onValue(
    meterRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as MeterState);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('[MeterService] Live meter subscription error:', error);
      callback(null);
    }
  );
}

/**
 * Read meter info (settings/config) from /meters/{meterId}/info.
 */
export async function getMeterInfo(meterId: string): Promise<MeterSettings | null> {
  if (!db) return null;
  try {
    const snapshot = await get(ref(db, `meters/${meterId}/info`));
    return snapshot.exists() ? (snapshot.val() as MeterSettings) : null;
  } catch (error) {
    console.error('[MeterService] Failed to get meter info:', error);
    return null;
  }
}

/**
 * Update the meter info/settings at /meters/{meterId}/info.
 */
export async function updateMeterSettings(
  meterId: string,
  settings: MeterSettings
): Promise<void> {
  if (!db) return;
  try {
    await set(ref(db, `meters/${meterId}/info`), settings);
  } catch (error) {
    console.error('[MeterService] Failed to update meter settings:', error);
    throw new Error('Failed to update meter settings.');
  }
}

/**
 * Read alarm thresholds from /meters/{meterId}/thresholds.
 */
export async function getThresholds(meterId: string): Promise<AlarmThresholds | null> {
  if (!db) return null;
  try {
    const snapshot = await get(ref(db, `meters/${meterId}/thresholds`));
    return snapshot.exists() ? (snapshot.val() as AlarmThresholds) : null;
  } catch (error) {
    console.error('[MeterService] Failed to get thresholds:', error);
    return null;
  }
}

/**
 * Write/update alarm thresholds at /meters/{meterId}/thresholds.
 */
export async function updateThresholds(
  meterId: string,
  thresholds: AlarmThresholds
): Promise<void> {
  if (!db) return;
  try {
    await set(ref(db, `meters/${meterId}/thresholds`), thresholds);
  } catch (error) {
    console.error('[MeterService] Failed to update thresholds:', error);
    throw new Error('Failed to update thresholds.');
  }
}

/**
 * Subscribe to thresholds for real-time updates.
 */
export function subscribeThresholds(
  meterId: string,
  callback: (data: AlarmThresholds | null) => void
): Unsubscribe {
  if (!db || !isFirebaseConfigured()) {
    return () => {};
  }
  const threshRef = ref(db, `meters/${meterId}/thresholds`);
  return onValue(
    threshRef,
    (snapshot) => {
      callback(snapshot.exists() ? (snapshot.val() as AlarmThresholds) : null);
    },
    (error) => {
      console.error('[MeterService] Thresholds subscription error:', error);
      callback(null);
    }
  );
}

/**
 * Push a new hourly reading to /meters/{meterId}/readings/hourly.
 */
export async function writeReading(
  meterId: string,
  reading: HourlyReading
): Promise<void> {
  if (!db) return;
  try {
    const readingsRef = ref(db, `meters/${meterId}/readings/hourly`);
    await push(readingsRef, {
      ...reading,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[MeterService] Failed to write reading:', error);
  }
}

/**
 * Get hourly readings (last 24 entries) from /meters/{meterId}/readings/hourly.
 */
export async function getHourlyReadings(meterId: string): Promise<HourlyReading[]> {
  if (!db) return [];
  try {
    const readingsRef = query(
      ref(db, `meters/${meterId}/readings/hourly`),
      orderByKey(),
      limitToLast(24)
    );
    const snapshot = await get(readingsRef);
    if (!snapshot.exists()) return [];

    const readings: HourlyReading[] = [];
    snapshot.forEach((child) => {
      readings.push(child.val() as HourlyReading);
    });
    return readings;
  } catch (error) {
    console.error('[MeterService] Failed to get hourly readings:', error);
    return [];
  }
}

/**
 * Get daily readings (last 7 entries) from /meters/{meterId}/readings/daily.
 */
export async function getDailyReadings(meterId: string): Promise<DailyReading[]> {
  if (!db) return [];
  try {
    const readingsRef = query(
      ref(db, `meters/${meterId}/readings/daily`),
      orderByKey(),
      limitToLast(7)
    );
    const snapshot = await get(readingsRef);
    if (!snapshot.exists()) return [];

    const readings: DailyReading[] = [];
    snapshot.forEach((child) => {
      readings.push(child.val() as DailyReading);
    });
    return readings;
  } catch (error) {
    console.error('[MeterService] Failed to get daily readings:', error);
    return [];
  }
}

/**
 * Subscribe to hourly readings for real-time graph updates.
 */
export function subscribeHourlyReadings(
  meterId: string,
  callback: (data: HourlyReading[]) => void
): Unsubscribe {
  if (!db || !isFirebaseConfigured()) {
    return () => {};
  }
  const readingsRef = query(
    ref(db, `meters/${meterId}/readings/hourly`),
    orderByKey(),
    limitToLast(24)
  );
  return onValue(
    readingsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const readings: HourlyReading[] = [];
      snapshot.forEach((child) => {
        readings.push(child.val() as HourlyReading);
      });
      callback(readings);
    },
    (error) => {
      console.error('[MeterService] Hourly readings subscription error:', error);
      callback([]);
    }
  );
}

/**
 * Subscribe to daily readings for real-time graph updates.
 */
export function subscribeDailyReadings(
  meterId: string,
  callback: (data: DailyReading[]) => void
): Unsubscribe {
  if (!db || !isFirebaseConfigured()) {
    return () => {};
  }
  const readingsRef = query(
    ref(db, `meters/${meterId}/readings/daily`),
    orderByKey(),
    limitToLast(7)
  );
  return onValue(
    readingsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const readings: DailyReading[] = [];
      snapshot.forEach((child) => {
        readings.push(child.val() as DailyReading);
      });
      callback(readings);
    },
    (error) => {
      console.error('[MeterService] Daily readings subscription error:', error);
      callback([]);
    }
  );
}

/**
 * Update the live meter data at /meters/{meterId}/live.
 * Used by the simulation loop to push simulated data to Firebase.
 */
export async function updateLiveMeter(
  meterId: string,
  data: MeterState
): Promise<void> {
  if (!db) return;
  try {
    await update(ref(db, `meters/${meterId}/live`), {
      ...data,
      lastUpdated: Date.now(),
    });
  } catch (error) {
    console.error('[MeterService] Failed to update live meter:', error);
  }
}

/**
 * Check if the meter service is available (Firebase configured and connected).
 */
export function isMeterServiceAvailable(): boolean {
  return isFirebaseConfigured() && db !== null;
}
