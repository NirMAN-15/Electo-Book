import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'info' | 'warning' | 'critical';
  message: string;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  let config = {
    icon: Info,
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    color: 'var(--info)'
  };

  if (type === 'warning') {
    config = {
      icon: AlertTriangle,
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      color: 'var(--warning)'
    };
  } else if (type === 'critical') {
    config = {
      icon: AlertCircle,
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      color: 'var(--danger)'
    };
  }

  const Icon = config.icon;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: 'var(--space-3) var(--space-4)',
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 'var(--radius-md)',
      marginBottom: 'var(--space-4)'
    }}>
      <Icon size={20} color={config.color} style={{ flexShrink: 0, marginTop: '2px', marginRight: 'var(--space-3)' }} />
      <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
        {message}
      </div>
      <button 
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '2px',
          marginLeft: 'var(--space-2)'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
