import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function triggered while log in and store user data
  const login = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData)); // Store user data
      setUser(userData);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  // Function triggered when log out and remove user data
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Remove stored user data
      setUser(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  // Checks if user is already logged in when app starts
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Check User Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
