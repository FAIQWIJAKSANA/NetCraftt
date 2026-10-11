import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function StudentHomeScreen({ navigation }) {
  const { currentUser, currentGroup, xpPoints, rankTitle, logout } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top User Bar */}
        <View style={styles.userBar}>
          <View>
            <Text style={styles.welcomeText}>Halo, Teknisi Muda 👋</Text>
            <Text style={styles.userName}>{currentUser?.name || 'Siswa Kelas X'}</Text>
            <Text style={styles.groupBadge}>
              {currentGroup?.name || 'Kelompok 1'} • {currentGroup?.className || 'X TJKT 1'}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); navigation.replace('RoleSelect'); }}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Gamification Rank Card */}
        <View style={styles.rankCard}>
          <View style={styles.rankLeft}>
            <View style={styles.medalCircle}>
              <Ionicons name="trophy" size={26} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.rankSub}>GELAR SAAT INI</Text>
              <Text style={styles.rankTitle}>{rankTitle}</Text>
            </View>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={16} color="#F59E0B" />
            <Text style={styles.xpText}>{xpPoints} XP</Text>
          </View>
        </View>

        {/* Active PBL Mission Banner */}
        <TouchableOpacity
          style={styles.missionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('MatriksPBL')}
        >
          <View style={styles.missionHeader}>
            <View style={styles.missionTag}>
              <Text style={styles.missionTagText}>MISI PBL UTAMA (RPP)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </View>

          <Text style={styles.missionTitle}>Kasus Nyata: Kafe Belajar & Ruang Praktik</Text>
          <Text style={styles.missionDesc}>
            15 komputer di lantai 1 butuh kabel LAN ujian, 20 pengunjung di lantai 2 butuh Wi-Fi. Selesaikan masalah router ISP yang sering 'No Internet'!
          </Text>

          <View style={styles.missionFooter}>
            <View style={styles.missionStat}>
              <Ionicons name="people-outline" size={14} color={COLORS.secondary} />
              <Text style={styles.missionStatText}>Tugas Kolaborasi Tim</Text>
            </View>
            <Text style={styles.openTaskText}>Buka Studi Kasus →</Text>
          </View>
        </TouchableOpacity>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Modul Pembelajaran & Game</Text>

        {/* 4 Core Features Grid */}
        <View style={styles.grid}>
          {/* 1. Hardware Deck */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('HardwareDeck')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(0, 240, 255, 0.12)' }]}>
              <Ionicons name="albums-outline" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>Hardware Deck</Text>
            <Text style={styles.menuSubtitle}>6 Kartu anatomi port & audio pelafalan</Text>
          </TouchableOpacity>

          {/* 2. Tinder Quiz */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('TinderQuiz')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Ionicons name="flame-outline" size={26} color={COLORS.warning} />
            </View>
            <Text style={styles.menuTitle}>Tinder Swipe</Text>
            <Text style={styles.menuSubtitle}>Uji cepat Benar / Salah dengan gestur geser</Text>
          </TouchableOpacity>

          {/* 3. NetFix Lab */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NetFixLab')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="game-controller-outline" size={26} color={COLORS.secondary} />
            </View>
            <Text style={styles.menuTitle}>NetFix Lab</Text>
            <Text style={styles.menuSubtitle}>Game troubleshooting colok kabel ala Brain Out</Text>
          </TouchableOpacity>

          {/* 4. Matriks PBL */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MatriksPBL')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
              <Ionicons name="document-text-outline" size={26} color={COLORS.purple} />
            </View>
            <Text style={styles.menuTitle}>Matriks PBL</Text>
            <Text style={styles.menuSubtitle}>Analisis kasus & solusi troubleshooting kelompok</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
          <Text style={styles.tipText}>
            <Text style={{ fontWeight: '700', color: COLORS.text }}>Tips Teknisi: </Text>
            Selalu tancapkan kabel dari modem ISP ke port WAN (warna biru), bukan LAN!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  userBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  groupBadge: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  rankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 20,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medalCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  rankSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  missionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    marginBottom: 26,
    position: 'relative',
    overflow: 'hidden',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  missionTag: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  missionTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  missionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  missionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
  },
  missionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  missionStatText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  openTaskText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  menuCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  menuIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});
