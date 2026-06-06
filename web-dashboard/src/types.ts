export type UserRole = 'admin' | 'consumer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  meterId?: string;
  status: 'active' | 'inactive';
}

export interface Meter {
  id: string;
  userId: string;
  location: string;
  status: 'online' | 'offline' | 'warning' | 'critical';
  lastReading?: {
    voltage: number;
    current: number;
    power: number;
    powerFactor: number;
    timestamp: number;
  };
}

export interface Bill {
  id: string;
  userId: string;
  meterId: string;
  month: string;
  units: number;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  pdfUrl?: string;
}

export interface Alert {
  id: string;
  meterId: string;
  type: 'voltage' | 'current' | 'power_factor' | 'cost' | 'system';
  severity: 'info' | 'warning' | 'critical';
  value: number;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}
