/**
 * Alarm Service
 * 
 * Handles alarm-related operations in Firebase RTDB.
 * Alarms are stored at /alarms/{meterId}/.
 */

import {
  ref,
  onValue,
  push,
  set,
  remove,
  update,
  query,
  orderByKey,
  limitToLast,
  Unsubscribe,
} from 'firebase/database';
import { db, isFirebaseConfigured } from '../firebase/config';
import { AlarmLog } from '../types';

/**
 * Subscribe to alarms for a specific meter.
 * Returns an unsubscribe function.
 */
export function subscribeAlarms(
  meterId: string,
  callback: (alarms: AlarmLog[]) => void
): Unsubscribe {
  if (!db || !isFirebaseConfigured()) {
    return () => {};
  }
  const alarmsRef = query(
    ref(db, `alarms/${meterId}`),
    orderByKey(),
    limitToLast(50)
  );
  return onValue(
    alarmsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const alarms: AlarmLog[] = [];
      snapshot.forEach((child) => {
        alarms.push({ ...child.val(), id: child.key } as AlarmLog);
      });
      // Return in reverse chronological order (newest first)
      callback(alarms.reverse());
    },
    (error) => {
      console.error('[AlarmService] Subscription error:', error);
      callback([]);
    }
  );
}

/**
 * Push a new alarm to /alarms/{meterId}.
 */
export async function pushAlarm(meterId: string, alarm: AlarmLog): Promise<string | null> {
  if (!db) return null;
  try {
    const alarmsRef = ref(db, `alarms/${meterId}`);
    const newRef = await push(alarmsRef, {
      ...alarm,
      createdAt: Date.now(),
    });
    return newRef.key;
  } catch (error) {
    console.error('[AlarmService] Failed to push alarm:', error);
    return null;
  }
}

/**
 * Clear all alarms for a specific meter.
 */
export async function clearAlarms(meterId: string): Promise<void> {
  if (!db) return;
  try {
    await remove(ref(db, `alarms/${meterId}`));
  } catch (error) {
    console.error('[AlarmService] Failed to clear alarms:', error);
    throw new Error('Failed to clear alarms.');
  }
}

/**
 * Acknowledge a specific alarm.
 */
export async function acknowledgeAlarm(
  meterId: string,
  alarmId: string
): Promise<void> {
  if (!db) return;
  try {
    await update(ref(db, `alarms/${meterId}/${alarmId}`), {
      isActive: false,
      acknowledgedAt: Date.now(),
    });
  } catch (error) {
    console.error('[AlarmService] Failed to acknowledge alarm:', error);
    throw new Error('Failed to acknowledge alarm.');
  }
}

/**
 * Check if the alarm service is available.
 */
export function isAlarmServiceAvailable(): boolean {
  return isFirebaseConfigured() && db !== null;
}
