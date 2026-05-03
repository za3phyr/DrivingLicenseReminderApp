import React, { createContext, useContext, useState, useEffect } from 'react';
import { Colors } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load saved theme on app start
    AsyncStorage.getItem('darkMode').then((value) => {
      if (value === 'true') setIsDark(true);
    });
  }, []);

  const theme = isDark ? Colors.dark : Colors.light;

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem('darkMode', String(newValue));
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}