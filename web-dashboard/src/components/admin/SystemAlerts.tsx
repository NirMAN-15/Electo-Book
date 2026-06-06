import React from 'react';
import { AlertBanner } from '../shared/AlertBanner';
import { DataTable, Column } from '../shared/DataTable';
import { Alert } from '@/types';

const mockAlerts: Alert[] = [
  { id: 'A1', meterId: 'M-1005', type: 'voltage', severity: 'critical', value: 190, message: 'Under-voltage detected (190V). Risk of equipment damage.', timestamp: Date.now() - 3600000, acknowledged: false },
  { id: 'A2', meterId: 'M-1004', type: 'power_factor', severity: 'warning', value: 0.88, message: 'Low power factor (0.88). Suggest capacitor bank check.', timestamp: Date.now() - 7200000, acknowledged: false },
  { id: 'A3', meterId: 'M-1003', type: 'system', severity: 'critical', value: 0, message: 'Meter went offline unexpectedly.', timestamp: Date.now() - 86400000, acknowledged: true },
];

export const SystemAlerts: React.FC = () => {
  const activeAlerts = mockAlerts.filter(a => !a.acknowledged);

  const columns: Column<Alert>[] = [
    { key: 'timestamp', header: 'Time', render: (row) => new Date(row.timestamp).toLocaleString() },
    { key: 'meterId', header: 'Meter ID' },
    { key: 'type', header: 'Type', render: (row) => <span style={{ textTransform: 'capitalize' }}>{row.type.replace('_', ' ')}</span> },
    { key: 'severity', header: 'Severity', render: (row) => (
      <span className={`badge ${row.severity === 'critical' ? 'badge-danger' : row.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>
        {row.severity}
      </span>
    )},
    { key: 'message', header: 'Message' },
    { key: 'actions', header: 'Action', render: (row) => (
      !row.acknowledged ? <button className="btn btn-secondary text-sm" style={{ padding: '4px 8px' }}>Acknowledge</button> : <span className="text-tertiary">Acknowledged</span>
    )}
  ];

  return (
    <div>
      <h1 className="mb-6">System Alerts</h1>

      {activeAlerts.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 text-secondary">Active Critical/Warning Events</h3>
          {activeAlerts.map(alert => (
             <AlertBanner key={alert.id} type={alert.severity as any} message={`[${alert.meterId}] ${alert.message}`} />
          ))}
        </div>
      )}

      <div className="card">
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 className="card-title">Alert History</h3>
          <select className="form-input" style={{ width: '200px' }}>
            <option>All Types</option>
            <option>Voltage</option>
            <option>Current</option>
            <option>Power Factor</option>
          </select>
        </div>
        <DataTable data={mockAlerts} columns={columns} />
      </div>
    </div>
  );
};
