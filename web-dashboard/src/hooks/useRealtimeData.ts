import { useState } from 'react';

export const useRealtimeData = (path: string) => {
  const [data] = useState(null);
  return data;
};
