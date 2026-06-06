import React from 'react';
import { StatCard } from '../shared/StatCard';
import { DataTable, Column } from '../shared/DataTable';
import { DollarSign, Clock, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { Bill } from '@/types';

const mockBills: Bill[] = [
  { id: 'INV-001', userId: '1', meterId: 'M-1001', month: 'Oct 2026', units: 350, amount: 15400, status: 'paid', dueDate: '2026-11-15' },
  { id: 'INV-002', userId: '2', meterId: 'M-1002', month: 'Oct 2026', units: 420, amount: 21000, status: 'unpaid', dueDate: '2026-11-15' },
  { id: 'INV-003', userId: '4', meterId: 'M-1003', month: 'Sep 2026', units: 280, amount: 9800, status: 'overdue', dueDate: '2026-10-15' },
  { id: 'INV-004', userId: '5', meterId: 'M-1004', month: 'Oct 2026', units: 510, amount: 28500, status: 'unpaid', dueDate: '2026-11-15' },
];

export const BillingOverview: React.FC = () => {
  const columns: Column<Bill>[] = [
    { key: 'id', header: 'Invoice ID' },
    { key: 'meterId', header: 'Meter ID' },
    { key: 'month', header: 'Billing Month' },
    { key: 'units', header: 'Units (kWh)', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, render: (row) => `Rs. ${row.amount.toLocaleString()}` },
    { key: 'status', header: 'Status', render: (row) => (
      <span className={`badge ${row.status === 'paid' ? 'badge-success' : row.status === 'unpaid' ? 'badge-warning' : 'badge-danger'}`}>
        {row.status}
      </span>
    )},
    { key: 'actions', header: 'Action', render: () => (
      <button className="btn btn-ghost" style={{ padding: '4px' }} title="Download PDF"><FileText size={18} /></button>
    )}
  ];

  return (
    <div>
      <h1 className="mb-6">Billing & Revenue</h1>
      
      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Billed (Oct)" value="Rs. 845K" icon={DollarSign} />
        <StatCard title="Collected" value="Rs. 520K" icon={CheckCircle} color="success" />
        <StatCard title="Pending" value="Rs. 215K" icon={Clock} color="warning" />
        <StatCard title="Overdue" value="Rs. 110K" icon={AlertCircle} color="danger" />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 className="card-title">Recent Invoices</h3>
          <button className="btn btn-secondary">Generate Bills</button>
        </div>
        <DataTable data={mockBills} columns={columns} />
      </div>
    </div>
  );
};
