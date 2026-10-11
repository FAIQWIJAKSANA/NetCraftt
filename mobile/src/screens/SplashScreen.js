import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Icon Container */}
        <View style={styles.iconCircle}>
          <Ionicons name="hardware-chip-outline" size={72} color={COLORS.primary} />
        </View>

        {/* Title & Branding */}
        <Text style={styles.badge}>SMK FASE E • INFORMATIKA</Text>
        <Text style={styles.title}>NetCraft</Text>
        <Text style={styles.subtitle}>Hardware Lab & Troubleshoot</Text>

        <Text style={styles.description}>
          Media pembelajaran interaktif perangkat keras jaringan berbasis Problem-Based Learning (PBL).
          Kenali perangkat, pecahkan masalah koneksi, dan rancang solusi jaringan nyata!
        </Text>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.replace('RoleSelect')}
        >
          <Text style={styles.buttonText}>Mulai Eksplorasi</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 30,
    gap: 10,
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
