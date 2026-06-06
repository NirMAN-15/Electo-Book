import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle } from 'lucide-react';

export const PaymentPortal: React.FC = () => {
  const [method, setMethod] = useState<'card' | 'bank'>('card');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="card text-center max-w-md w-full p-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-success/10 text-success rounded-full mb-6 animate-pulse-ring">
            <CheckCircle size={32} color="var(--success)" />
          </div>
          <h2 className="mb-2">Payment Successful!</h2>
          <p className="text-secondary mb-6">Your payment of Rs. 15,400 has been processed successfully. A receipt has been sent to your email.</p>
          <button className="btn btn-primary w-full justify-center" onClick={() => window.location.href='/consumer/bills'}>
            Return to Bills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="mb-6">Secure Payment</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="flex gap-4 mb-6 border-b border-color-light pb-4">
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors ${method === 'card' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-tertiary text-secondary hover:bg-border'}`}
              style={{ 
                backgroundColor: method === 'card' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                color: method === 'card' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: method === 'card' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
              }}
              onClick={() => setMethod('card')}
            >
              <CreditCard size={20} /> Credit/Debit Card
            </button>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors ${method === 'bank' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-tertiary text-secondary hover:bg-border'}`}
              style={{ 
                backgroundColor: method === 'bank' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                color: method === 'bank' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: method === 'bank' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
              }}
              onClick={() => setMethod('bank')}
            >
              <Smartphone size={20} /> Bank Transfer
            </button>
          </div>

          <form onSubmit={handlePay}>
            {method === 'card' ? (
              <div className="grid gap-4">
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input type="text" className="form-input" placeholder="0000 0000 0000 0000" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Name on Card</label>
                  <input type="text" className="form-input" placeholder="John Doe" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="text" className="form-input" placeholder="MM/YY" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input type="text" className="form-input" placeholder="123" required />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4 text-secondary">Scan the QR code below using your banking app</p>
                <div className="w-48 h-48 bg-white mx-auto flex items-center justify-center border-4 border-white rounded-lg shadow-md mb-4">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LANKAQR-MOCK-DATA" alt="LankaQR" className="w-full h-full object-contain" />
                </div>
                <p className="font-mono text-lg font-bold">LANKA QR</p>
              </div>
            )}
            
            <button type="submit" className="btn btn-primary w-full justify-center mt-6 py-3 text-lg">
              Pay Rs. 15,400
            </button>
          </form>
        </div>

        <div className="col-span-1">
          <div className="card">
            <h3 className="card-title mb-4">Payment Summary</h3>
            <div className="flex justify-between mb-2 text-secondary">
              <span>Invoice</span>
              <span>INV-2026-10</span>
            </div>
            <div className="flex justify-between mb-2 text-secondary">
              <span>Units</span>
              <span>350 kWh</span>
            </div>
            <div className="flex justify-between mb-4 text-secondary pb-4 border-b border-color-light">
              <span>Late Fees</span>
              <span>Rs. 0.00</span>
            </div>
            <div className="flex justify-between font-bold text-xl">
              <span>Total Due</span>
              <span className="text-accent-primary">Rs. 15,400</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
