// Authentication utility functions

export const setAuthToken = (token: string, expiryHours: number = 24) => {
  localStorage.setItem('token', token);
  const expiryTime = new Date().getTime() + (expiryHours * 60 * 60 * 1000);
  localStorage.setItem('tokenExpiry', expiryTime.toString());
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  if (!token || !tokenExpiry) {
    return null;
  }
  
  const now = new Date().getTime();
  const expiryTime = parseInt(tokenExpiry);
  
  // Check if token is expired
  if (now >= expiryTime) {
    clearAuth();
    return null;
  }
  
  return token;
};

export const isTokenValid = (): boolean => {
  return getAuthToken() !== null;
};

export const clearAuth = () => {
  localStorage.clear();
};

export const setUserData = (username: string, name: string) => {
  localStorage.setItem('username', username);
  localStorage.setItem('name', name);
};

export const getUserData = () => {
  return {
    username: localStorage.getItem('username'),
    name: localStorage.getItem('name'),
  };
};

// Cache management utility functions
export const markAdminsListAsChanged = () => {
  sessionStorage.setItem('adminsListChanged', 'true');
};

export const clearAdminsListCache = () => {
  sessionStorage.removeItem('adminsList');
  sessionStorage.removeItem('adminsListTimestamp');
  sessionStorage.setItem('adminsListChanged', 'true');
};
