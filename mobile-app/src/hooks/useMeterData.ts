/**
 * useMeterData Hook
 * 
 * Custom React hook that subscribes to live meter data, readings, alarms, 
 * and thresholds from Firebase RTDB.
 * Falls back to local state when Firebase is not configured.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeLiveMeter,
  subscribeThresholds,
  subscribeHourlyReadings,
  subscribeDailyReadings,
  updateLiveMeter,
  updateThresholds as updateThresholdsService,
  updateMeterSettings,
  isMeterServiceAvailable,
} from '../services/meterService';
import { subscribeAlarms, pushAlarm, clearAlarms as clearAlarmsService } from '../services/alarmService';
import {
  MeterState,
  MeterSettings,
  AlarmThresholds,
  AlarmLog,
  HourlyReading,
  DailyReading,
} from '../types';

interface UseMeterDataReturn {
  /** Current live meter state */
  liveState: MeterState;
  /** Hourly reading history for graphs */
  hourlyData: HourlyReading[];
  /** Daily reading history for graphs */
  dailyData: DailyReading[];
  /** Alarm logs */
  alarms: AlarmLog[];
  /** Current alarm thresholds */
  thresholds: AlarmThresholds;
  /** Whether data is still loading */
  loading: boolean;
  /** Whether connected to Firebase RTDB */
  isConnected: boolean;
  /** Update live state (for simulation) */
  setLiveState: React.Dispatch<React.SetStateAction<MeterState>>;
  /** Update thresholds */
  setThresholds: (thresholds: AlarmThresholds) => void;
  /** Update hourly data */
  setHourlyData: React.Dispatch<React.SetStateAction<HourlyReading[]>>;
  /** Update daily data */
  setDailyData: React.Dispatch<React.SetStateAction<DailyReading[]>>;
  /** Set alarms */
  setAlarms: React.Dispatch<React.SetStateAction<AlarmLog[]>>;
  /** Push live state to Firebase */
  syncLiveState: (meterId: string, state: MeterState) => Promise<void>;
  /** Push a new alarm to Firebase */
  syncAlarm: (meterId: string, alarm: AlarmLog) => Promise<void>;
  /** Clear all alarms in Firebase */
  syncClearAlarms: (meterId: string) => Promise<void>;
  /** Sync settings to Firebase */
  syncSettings: (meterId: string, settings: MeterSettings) => Promise<void>;
  /** Sync thresholds to Firebase */
  syncThresholds: (meterId: string, thresholds: AlarmThresholds) => Promise<void>;
}

// localStorage keys for fallback persistence
const STORAGE_PREFIX = 'electro_book_';

// Default values
const DEFAULT_LIVE_STATE: MeterState = {
  current: 12.7,
  voltage: 238.5,
  powerFactor: 0.86,
  currentPower: 2.6,
  totalUnitsToday: 42.4,
  accumulatedCostToday: 42.4 * 4.5,
  monthlyEstimatedUnits: 42.4 * 30,
  monthlyEstimatedCost: 42.4 * 30 * 4.5,
  status: 'normal',
};

const DEFAULT_THRESHOLDS: AlarmThresholds = {
  lowVoltage: 215,
  highVoltage: 245,
  maxCurrent: 15.0,
  minPowerFactor: 0.85,
  maxDailyCost: 500,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignore parse errors
  }
  return fallback;
}

function generateMockHourlyData(): HourlyReading[] {
  const mockHours: HourlyReading[] = [];
  const baseHour = new Date().getHours();
  for (let i = 11; i >= 0; i--) {
    const hr = (baseHour - i + 24) % 24;
    const formattedTime = `${hr.toString().padStart(2, '0')}:00`;
    const powerBase = hr >= 18 && hr <= 22 ? 4.8 : hr >= 8 && hr <= 17 ? 2.5 : 1.1;
    const variance = Math.sin(i * 0.5) * 0.4;
    const finalPower = Math.max(powerBase + variance, 0.4);
    mockHours.push({
      time: formattedTime,
      power: parseFloat(finalPower.toFixed(2)),
      voltage: parseFloat((235 + Math.cos(i) * 3).toFixed(1)),
      current: parseFloat(((finalPower * 1000) / (235 * 0.86)).toFixed(1)),
      cost: parseFloat((finalPower * 1 * 4.5).toFixed(2)),
    });
  }
  return mockHours;
}

function generateMockDailyData(): DailyReading[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => {
    const dailyUnits = Math.round(35 + Math.random() * 20);
    return { day, units: dailyUnits, cost: Math.round(dailyUnits * 4.5) };
  });
}

export function useMeterData(meterId: string | null): UseMeterDataReturn {
  const [liveState, setLiveState] = useState<MeterState>(() =>
    loadFromStorage('liveState', DEFAULT_LIVE_STATE)
  );
  const [hourlyData, setHourlyData] = useState<HourlyReading[]>(() => generateMockHourlyData());
  const [dailyData, setDailyData] = useState<DailyReading[]>(() =>
    loadFromStorage('dailyData', generateMockDailyData())
  );
  const [alarms, setAlarms] = useState<AlarmLog[]>(() => loadFromStorage('alarms', []));
  const [thresholds, setThresholdsState] = useState<AlarmThresholds>(() =>
    loadFromStorage('thresholds', DEFAULT_THRESHOLDS)
  );
  const [loading, setLoading] = useState<boolean>(true);

  const isConnected = isMeterServiceAvailable() && meterId !== null;

  // Firebase real-time subscriptions
  useEffect(() => {
    if (!isConnected || !meterId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribers: (() => void)[] = [];

    // Subscribe to live meter data
    unsubscribers.push(
      subscribeLiveMeter(meterId, (data) => {
        if (data) {
          setLiveState(data);
        }
        setLoading(false);
      })
    );

    // Subscribe to thresholds
    unsubscribers.push(
      subscribeThresholds(meterId, (data) => {
        if (data) {
          setThresholdsState(data);
        }
      })
    );

    // Subscribe to hourly readings
    unsubscribers.push(
      subscribeHourlyReadings(meterId, (data) => {
        if (data.length > 0) {
          setHourlyData(data);
        }
      })
    );

    // Subscribe to daily readings
    unsubscribers.push(
      subscribeDailyReadings(meterId, (data) => {
        if (data.length > 0) {
          setDailyData(data);
        }
      })
    );

    // Subscribe to alarms
    unsubscribers.push(
      subscribeAlarms(meterId, (data) => {
        setAlarms(data);
      })
    );

    // Set a safety timeout for loading
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      clearTimeout(timeout);
    };
  }, [isConnected, meterId]);

  // localStorage persistence for fallback mode
  useEffect(() => {
    if (!isConnected) {
      localStorage.setItem(STORAGE_PREFIX + 'liveState', JSON.stringify(liveState));
    }
  }, [liveState, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      localStorage.setItem(STORAGE_PREFIX + 'thresholds', JSON.stringify(thresholds));
    }
  }, [thresholds, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      localStorage.setItem(STORAGE_PREFIX + 'alarms', JSON.stringify(alarms));
    }
  }, [alarms, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      localStorage.setItem(STORAGE_PREFIX + 'dailyData', JSON.stringify(dailyData));
    }
  }, [dailyData, isConnected]);

  // Wrapper to update thresholds both locally and in Firebase
  const setThresholds = useCallback(
    (newThresholds: AlarmThresholds) => {
      setThresholdsState(newThresholds);
      if (isConnected && meterId) {
        updateThresholdsService(meterId, newThresholds).catch(console.error);
      }
    },
    [isConnected, meterId]
  );

  // Sync helpers for Firebase writes
  const syncLiveState = useCallback(
    async (mId: string, state: MeterState) => {
      if (isConnected) {
        await updateLiveMeter(mId, state);
      }
    },
    [isConnected]
  );

  const syncAlarm = useCallback(
    async (mId: string, alarm: AlarmLog) => {
      if (isConnected) {
        await pushAlarm(mId, alarm);
      }
    },
    [isConnected]
  );

  const syncClearAlarms = useCallback(
    async (mId: string) => {
      if (isConnected) {
        await clearAlarmsService(mId);
      }
    },
    [isConnected]
  );

  const syncSettings = useCallback(
    async (mId: string, settings: MeterSettings) => {
      if (isConnected) {
        await updateMeterSettings(mId, settings);
      }
    },
    [isConnected]
  );

  const syncThresholds = useCallback(
    async (mId: string, thresh: AlarmThresholds) => {
      if (isConnected) {
        await updateThresholdsService(mId, thresh);
      }
    },
    [isConnected]
  );

  return {
    liveState,
    hourlyData,
    dailyData,
    alarms,
    thresholds,
    loading,
    isConnected,
    setLiveState,
    setThresholds,
    setHourlyData,
    setDailyData,
    setAlarms,
    syncLiveState,
    syncAlarm,
    syncClearAlarms,
    syncSettings,
    syncThresholds,
  };
}
