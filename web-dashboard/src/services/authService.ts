// Mock auth service
export const authService = {
  login: async () => ({ user: { id: '1', role: 'consumer' } }),
  logout: async () => {},
};
