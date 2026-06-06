import React from 'react';
import { Meter } from '@/types';
import { Activity, WifiOff, AlertTriangle } from 'lucide-react';

const mockMeters: Meter[] = [
  { id: 'M-1001', userId: '1', location: 'Colombo 03', status: 'online', lastReading: { voltage: 230, current: 5.2, power: 1.19, powerFactor: 0.95, timestamp: Date.now() } },
  { id: 'M-1002', userId: '2', location: 'Kandy', status: 'online', lastReading: { voltage: 228, current: 12.4, power: 2.82, powerFactor: 0.92, timestamp: Date.now() } },
  { id: 'M-1003', userId: '4', location: 'Galle', status: 'offline' },
  { id: 'M-1004', userId: '5', location: 'Negombo', status: 'warning', lastReading: { voltage: 245, current: 8.1, power: 1.98, powerFactor: 0.88, timestamp: Date.now() } },
  { id: 'M-1005', userId: '6', location: 'Jaffna', status: 'critical', lastReading: { voltage: 190, current: 15.0, power: 2.85, powerFactor: 0.80, timestamp: Date.now() } },
];

export const MeterManagement: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1>Meter Fleet</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <span className="badge badge-success">3 Online</span>
          <span className="badge badge-warning">1 Warning</span>
          <span className="badge badge-danger">1 Critical</span>
          <span className="badge badge-neutral">1 Offline</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {mockMeters.map(meter => (
          <div key={meter.id} className="card" style={{ borderTop: `4px solid ${
            meter.status === 'online' ? 'var(--success)' : 
            meter.status === 'warning' ? 'var(--warning)' : 
            meter.status === 'critical' ? 'var(--danger)' : 'var(--text-tertiary)'
          }` }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {meter.id}
                  <div className={`status-dot ${meter.status}`} />
                </h3>
                <p className="text-sm text-secondary">{meter.location}</p>
              </div>
              <div style={{ 
                padding: '8px', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-md)',
                color: meter.status === 'offline' ? 'var(--text-tertiary)' : 'var(--accent-primary)'
              }}>
                {meter.status === 'offline' ? <WifiOff size={20} /> : meter.status === 'warning' || meter.status === 'critical' ? <AlertTriangle size={20} /> : <Activity size={20} />}
              </div>
            </div>

            {meter.lastReading ? (
              <div className="grid grid-cols-2 gap-4 mt-4 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <p className="text-xs text-secondary">Voltage</p>
                  <p style={{ fontWeight: 600, color: meter.lastReading.voltage > 240 || meter.lastReading.voltage < 210 ? 'var(--danger)' : 'inherit' }}>{meter.lastReading.voltage} V</p>
                </div>
                <div>
                  <p className="text-xs text-secondary">Current</p>
                  <p style={{ fontWeight: 600 }}>{meter.lastReading.current} A</p>
                </div>
                <div>
                  <p className="text-xs text-secondary">Power</p>
                  <p style={{ fontWeight: 600 }}>{meter.lastReading.power} kW</p>
                </div>
                <div>
                  <p className="text-xs text-secondary">PF</p>
                  <p style={{ fontWeight: 600 }}>{meter.lastReading.powerFactor}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 text-center text-secondary" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                Meter Offline. No recent data.
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
               <span className="text-xs text-tertiary">User ID: {meter.userId}</span>
               <button className="btn btn-ghost text-sm" onClick={() => alert(`Detailed dashboard for meter ${meter.id} will be loaded here.`)}>Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
