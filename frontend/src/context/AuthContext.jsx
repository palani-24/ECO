import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Signup
  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', userData);
      if (res.data.success) {
        const { token, ...createdUser } = res.data.data;
        localStorage.setItem('token', token);
        setUser(createdUser);
        return { success: true, user: createdUser };
      }
      return { success: false, message: 'Signup failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const endpoint = user.role === 'user' ? '/user/profile' : '/auth/profile'; // adjust for driver/admin update profile endpoints
      const res = await api.put(endpoint, profileData);
      if (res.data.success) {
        setUser(res.data.data);
        return { success: true };
      }
      return { success: false, message: 'Update failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      return { success: false, message: msg };
    }
  };

  // Manage User Addresses (customers only)
  const addAddress = async (address) => {
    try {
      const res = await api.post('/user/addresses', { action: 'add', ...address });
      if (res.data.success) {
        setUser(prev => prev ? { ...prev, addresses: res.data.data } : null);
        return { success: true };
      }
      return { success: false, message: 'Failed to add address' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add address' };
    }
  };

  const removeAddress = async (addressId) => {
    try {
      const res = await api.post('/user/addresses', { action: 'remove', addressId });
      if (res.data.success) {
        setUser(prev => prev ? { ...prev, addresses: res.data.data } : null);
        return { success: true };
      }
      return { success: false, message: 'Failed to remove address' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to remove address' };
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const res = await api.post('/user/addresses', { action: 'set_default', addressId });
      if (res.data.success) {
        setUser(prev => prev ? { ...prev, addresses: res.data.data } : null);
        return { success: true };
      }
      return { success: false, message: 'Failed to set default address' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to set default' };
    }
  };

  const updateUserPoints = (newPoints) => {
    setUser(prev => prev ? { ...prev, points: newPoints } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      updateProfile, 
      updateUserPoints,
      addAddress, 
      removeAddress, 
      setDefaultAddress 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
