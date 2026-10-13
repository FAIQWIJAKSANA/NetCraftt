import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import { Platform } from 'react-native';
import { IONICONS_FONT_BASE64 } from './src/constants/ioniconsFont';

// Solusi permanen & anti-blokir: Load font Ionicons langsung via Base64 Data URI
// Mendukung 'Ionicons' dan 'ionicons' (nama font internal @expo/vector-icons)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const existing = document.getElementById('expo-generated-fonts');
  if (existing) {
    existing.remove();
  }
  const iconFontStyles = `
    @font-face {
      font-family: 'Ionicons';
      src: url('data:font/truetype;charset=utf-8;base64,${IONICONS_FONT_BASE64}') format('truetype');
      font-display: swap;
    }
    @font-face {
      font-family: 'ionicons';
      src: url('data:font/truetype;charset=utf-8;base64,${IONICONS_FONT_BASE64}') format('truetype');
      font-display: swap;
    }
  `;
  const style = document.createElement('style');
  style.id = 'expo-generated-fonts';
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
