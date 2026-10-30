import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('fitforge_token');
    const storedUser  = localStorage.getItem('fitforge_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('fitforge_token');
        localStorage.removeItem('fitforge_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (tokenVal, userData) => {
    localStorage.setItem('fitforge_token', tokenVal);
    localStorage.setItem('fitforge_user',  JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('fitforge_token');
    localStorage.removeItem('fitforge_user');
    setToken(null);
    setUser(null);
  };

  const markProfileComplete = () => {
    const updatedUser = { ...user, profileComplete: true };
    localStorage.setItem('fitforge_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, markProfileComplete, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
