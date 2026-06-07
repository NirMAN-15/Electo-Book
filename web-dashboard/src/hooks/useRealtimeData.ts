import { useState } from 'react';

export const useRealtimeData = (path: string) => {
  void path;
  const [data] = useState(null);
  return data;
};
