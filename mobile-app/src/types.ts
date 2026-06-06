export interface MeterState {
  current: number; // A
  voltage: number; // V
  powerFactor: number; // 0.0 to 1.0
  currentPower: number; // kW
  totalUnitsToday: number; // kWh
  accumulatedCostToday: number; // INR (₹)
  monthlyEstimatedUnits: number; // kWh
  monthlyEstimatedCost: number; // INR (₹)
  status: 'normal' | 'warning' | 'critical';
}

export interface AlarmThresholds {
  lowVoltage: number;
  highVoltage: number;
  maxCurrent: number;
  minPowerFactor: number;
  maxDailyCost: number;
}

export interface AlarmLog {
  id: string;
  timestamp: string;
  type: 'voltage' | 'current' | 'pf' | 'cost';
  value: number;
  message: string;
  isActive: boolean;
}

export type Language = 'en' | 'si' | 'ta';

export interface MeterSettings {
  utilityName: string;
  phase: 'Single Phase' | 'Three Phase';
  tariffRate: number; // INR per kWh; or LKR for SL
  targetBudget: number; // Desired monthly spending INR/LKR
  notificationSound: boolean;
  language: Language;
}

export interface HourlyReading {
  time: string;
  power: number; // kW
  voltage: number; // V
  current: number; // A
  cost: number; // ₹
}

export interface DailyReading {
  day: string;
  units: number; // kWh
  cost: number; // ₹
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: 'consumer' | 'admin';
  meterId: string;
  createdAt: number;
  language: Language;
}

export interface Bill {
  id: string;
  month: string;
  totalUnits: number;
  totalCost: number;
  tariffRate: number;
  status: 'unpaid' | 'paid' | 'overdue';
  generatedAt: number;
  dueDate: number;
  pdfUrl: string;
  paidAt: number | null;
  paymentRef: string | null;
}

export interface Payment {
  id: string;
  meterId: string;
  userId: string;
  billId: string;
  amount: number;
  method: 'card' | 'bank' | 'qr';
  status: 'success' | 'failed' | 'pending';
  transactionRef: string;
  paidAt: number;
}
