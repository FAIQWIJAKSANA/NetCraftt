import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import { Platform } from 'react-native';

// Solusi ampuh untuk masalah ikon hilang di Netlify (Web)
if (Platform.OS === 'web') {
  const iconFontStyles = `@font-face {
    src: url('https://unpkg.com/react-native-vector-icons@10.0.0/Fonts/Ionicons.ttf');
    font-family: Ionicons;
  }`;
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(iconFontStyles));
  document.head.appendChild(style);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
