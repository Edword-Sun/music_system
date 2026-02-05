import { createContext, useContext, useEffect, useState } from 'react';
import { guestLogin } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } else {
        // 如果没有存储的用户信息，尝试游客登录
        const res = await guestLogin();
        if (res.body) {
          const { token, ...userData } = res.body;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginAction = (authData) => {
    const { token, ...userData } = authData;
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutAction = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    // 登出后自动切换回游客身份
    await initAuth();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login: loginAction, logout: logoutAction, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}