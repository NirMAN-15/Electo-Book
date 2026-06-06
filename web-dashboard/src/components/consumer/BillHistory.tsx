import React from 'react';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockBills = [
  { id: 'INV-2026-10', month: 'October 2026', amount: 15400, units: 350, status: 'unpaid', dueDate: '2026-11-15' },
  { id: 'INV-2026-09', month: 'September 2026', amount: 14200, units: 320, status: 'paid', dueDate: '2026-10-15' },
  { id: 'INV-2026-08', month: 'August 2026', amount: 16800, units: 385, status: 'paid', dueDate: '2026-09-15' },
];

export const BillHistory: React.FC = () => {
  const navigate = useNavigate();
  const unpaidBill = mockBills.find(b => b.status === 'unpaid');

  return (
    <div>
      <h1 className="mb-6">Billing History</h1>

      {unpaidBill && (
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-danger mb-2">
                <AlertCircle size={20} />
                <span className="font-semibold">Payment Due</span>
              </div>
              <h2 style={{ fontSize: '2rem' }}>Rs. {unpaidBill.amount.toLocaleString()}</h2>
              <p className="text-secondary mt-1">Due by {new Date(unpaidBill.dueDate).toLocaleDateString()}</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/consumer/payment')} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
              Pay Now
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {mockBills.map(bill => (
          <div key={bill.id} className="card flex justify-between items-center" style={{ padding: 'var(--space-4) var(--space-6)' }}>
            <div className="flex items-center gap-4">
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{bill.month}</h3>
                <p className="text-sm text-secondary">{bill.units} kWh consumed</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="font-bold text-lg">Rs. {bill.amount.toLocaleString()}</p>
                <span className={`badge ${bill.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                  {bill.status}
                </span>
              </div>
              <button className="btn btn-ghost" title="Download PDF" onClick={() => alert('PDF generation started... Download will begin shortly.')}>
                <Download size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
