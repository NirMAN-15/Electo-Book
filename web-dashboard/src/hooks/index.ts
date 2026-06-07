// Mock hooks
import { useState } from 'react';

export const useAuth = () => {
  return { user: null, loading: false };
};

export const useRealtimeData = (path: string) => {
  void path;
  const [data] = useState(null);
  return data;
};

export const useTheme = () => {
  const [theme, setTheme] = useState('dark');
  return { theme, setTheme };
};
