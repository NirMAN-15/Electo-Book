/**
 * Prediction Service
 * 
 * Handles AI prediction operations, including calling the Gemini API
 * (via Firebase Cloud Function or direct), and caching predictions in RTDB.
 * 
 * Predictions: /predictions/{meterId}/
 */

import { ref, get, set } from 'firebase/database';
import { db, isFirebaseConfigured } from '../firebase/config';
import { MeterState, MeterSettings, AlarmLog } from '../types';

export interface PredictionResult {
  summary: string;
  recommendations: string[];
  estimatedMonthlyCost: number;
  estimatedMonthlyUnits: number;
  savingsPotential: number;
  riskLevel: 'low' | 'medium' | 'high';
  generatedAt: number;
}

/**
 * Get an AI prediction based on current meter state.
 * Attempts to call a Firebase Cloud Function endpoint first, then falls back
 * to a local estimation if that is not available.
 */
export async function getAIPrediction(
  meterState: MeterState,
  settings: MeterSettings,
  alarms: AlarmLog[]
): Promise<PredictionResult> {
  // Try cloud function first (if configured)
  if (isFirebaseConfigured()) {
    try {
      // Attempt to call the Cloud Function endpoint
      const functionUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
      if (functionUrl) {
        const response = await fetch(`${functionUrl}/getEnergyPrediction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meterState, settings, alarmsCount: alarms.length }),
        });

        if (response.ok) {
          const data = await response.json();
          return data as PredictionResult;
        }
      }
    } catch (error) {
      console.warn('[PredictionService] Cloud function call failed, using local estimation:', error);
    }
  }

  // Fallback: local computation-based prediction
  return generateLocalPrediction(meterState, settings, alarms);
}

/**
 * Generate a local prediction without any external API call.
 * Uses mathematical extrapolation from current readings.
 */
function generateLocalPrediction(
  meterState: MeterState,
  settings: MeterSettings,
  alarms: AlarmLog[]
): PredictionResult {
  const dailyCost = meterState.accumulatedCostToday > 0 ? meterState.accumulatedCostToday : 384.2;
  const dailyUnits = meterState.totalUnitsToday > 0 ? meterState.totalUnitsToday : 69.9;

  const monthlyCost = dailyCost * 30;
  const monthlyUnits = dailyUnits * 30;
  const savingsTarget = settings.targetBudget || 5000;
  const savingsPotential = Math.max(0, ((monthlyCost - savingsTarget * 0.8) / monthlyCost) * 100);

  const activeAlarms = alarms.filter((a) => a.isActive).length;
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (activeAlarms >= 3 || meterState.status === 'critical') {
    riskLevel = 'high';
  } else if (activeAlarms >= 1 || meterState.status === 'warning') {
    riskLevel = 'medium';
  }

  const recommendations: string[] = [];
  if (meterState.powerFactor < 0.9) {
    recommendations.push('Consider power factor correction equipment to reduce reactive power losses.');
  }
  if (monthlyCost > savingsTarget) {
    recommendations.push(`Your projected monthly cost (₹${monthlyCost.toFixed(0)}) exceeds your budget of ₹${savingsTarget}. Consider reducing peak-hour usage.`);
  }
  if (meterState.currentPower > 3.0) {
    recommendations.push('High real-time power draw detected. Check for unnecessary appliances running simultaneously.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Your energy usage patterns look healthy. Keep monitoring for seasonal changes.');
  }

  return {
    summary: `Based on current consumption of ${dailyUnits.toFixed(1)} kWh/day at ₹${settings.tariffRate}/kWh, your projected monthly cost is ₹${monthlyCost.toFixed(0)}.`,
    recommendations,
    estimatedMonthlyCost: monthlyCost,
    estimatedMonthlyUnits: monthlyUnits,
    savingsPotential: parseFloat(savingsPotential.toFixed(1)),
    riskLevel,
    generatedAt: Date.now(),
  };
}

/**
 * Get the last cached prediction from /predictions/{meterId}/latest.
 */
export async function getLastPrediction(meterId: string): Promise<PredictionResult | null> {
  if (!db) return null;
  try {
    const snapshot = await get(ref(db, `predictions/${meterId}/latest`));
    return snapshot.exists() ? (snapshot.val() as PredictionResult) : null;
  } catch (error) {
    console.error('[PredictionService] Failed to get last prediction:', error);
    return null;
  }
}

/**
 * Cache a prediction result at /predictions/{meterId}/latest.
 */
export async function savePrediction(
  meterId: string,
  prediction: PredictionResult
): Promise<void> {
  if (!db) return;
  try {
    await set(ref(db, `predictions/${meterId}/latest`), prediction);
  } catch (error) {
    console.error('[PredictionService] Failed to save prediction:', error);
  }
}
