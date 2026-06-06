export const useAuth = () => {
  const role = localStorage.getItem('role');
  return { user: { role }, loading: false };
};
