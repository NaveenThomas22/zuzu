import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../api/auth';
import { getErrorMessage } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('pocket_pal_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user on mount if token exists
  const fetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem('pocket_pal_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getCurrentUser();
      setUser(response.data);
      setError(null);
    } catch (err) {
      // Token is invalid or expired
      localStorage.removeItem('pocket_pal_token');
      setUser(null);
      setToken(null);
      setError(null); // Don't show error on invalid stored token
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await loginUser({ email, password });
      const { access_token } = response.data;
      localStorage.setItem('pocket_pal_token', access_token);
      setToken(access_token);

      // Fetch user profile with the new token
      const userResponse = await getCurrentUser();
      setUser(userResponse.data);
      return userResponse.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      setError(null);
      setLoading(true);
      const response = await registerUser(data);
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pocket_pal_token');
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout,
      fetchUser,
      clearError,
    }),
    [user, token, loading, error, login, register, logout, fetchUser, clearError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
