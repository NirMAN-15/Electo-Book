import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import { Layout } from '@/components/layout/Layout';

// Auth
import { LoginPage } from '@/components/auth/LoginPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Admin Pages
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { MeterManagement } from '@/components/admin/MeterManagement';
import { BillingOverview } from '@/components/admin/BillingOverview';
import { SystemAlerts } from '@/components/admin/SystemAlerts';

// Consumer Pages
import { ConsumerDashboard } from '@/components/consumer/ConsumerDashboard';
import { UsageGraphs } from '@/components/consumer/UsageGraphs';
import { BillHistory } from '@/components/consumer/BillHistory';
import { PaymentPortal } from '@/components/consumer/PaymentPortal';
function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']}><Layout theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/meters" element={<MeterManagement />} />
          <Route path="/admin/billing" element={<BillingOverview />} />
          <Route path="/admin/alerts" element={<SystemAlerts />} />
        </Route>

        {/* Protected Consumer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['consumer']}><Layout theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>}>
          <Route path="/consumer" element={<Navigate to="/consumer/dashboard" replace />} />
          <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
          <Route path="/consumer/usage" element={<UsageGraphs />} />
          <Route path="/consumer/bills" element={<BillHistory />} />
          <Route path="/consumer/payment" element={<PaymentPortal />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
