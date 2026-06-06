// Mock hooks
import { useState, useEffect } from 'react';

export const useAuth = () => {
  return { user: null, loading: false };
};

export const useRealtimeData = (path: string) => {
  const [data, setData] = useState(null);
  return data;
};

export const useTheme = () => {
  const [theme, setTheme] = useState('dark');
  return { theme, setTheme };
};
