import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ theme, toggleTheme }) => {
  // In a real app, get this from auth context
  // For now, mock it based on URL path or local storage
  const userRole = localStorage.getItem('role') as 'admin' | 'consumer' || 'consumer';

  return (
    <div className="app-container">
      <Sidebar role={userRole} />
      <div className="main-content">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="page-container animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
