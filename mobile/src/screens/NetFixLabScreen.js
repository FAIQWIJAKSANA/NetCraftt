import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { API } from '../services/api';
import { useApp } from '../context/AppContext';

export default function NetFixLabScreen({ navigation }) {
  const { currentUser, completedLevels, unlockedLevels = [1] } = useApp();
  const [levels, setLevels] = useState([]);

  // Muat ulang daftar level setiap kali layar ini difokuskan
  useFocusEffect(
    useCallback(() => {
      loadLevels();
    }, [currentUser, completedLevels, unlockedLevels])
  );

  const loadLevels = async () => {
    const list = await API.getPuzzles(currentUser?.id);
    setLevels(list);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>SIMULASI INTERAKTIF (BRAIN OUT STYLE)</Text>
          <Text style={styles.title}>NetFix Lab</Text>
          <Text style={styles.subtitle}>Selesaikan masalah fisik hardware jaringan!</Text>
        </View>
        <View style={styles.toolBadge}>
          <Ionicons name="construct" size={20} color={COLORS.secondary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Instruction Card */}
        <View style={styles.infoBanner}>
          <Ionicons name="finger-print-outline" size={22} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Di lab ini kamu tidak memilih A/B/C/D. Sentuh objek gambar, seret benda ke target, dan pecahkan teka-teki troubleshooting secara fisik!
          </Text>
        </View>

        {/* Level Roadmap Grid */}
        <View style={styles.roadmap}>
          {levels.map((lvl, index) => {
            // Level benar-benar selesai jika ada di completedLevels atau server
            const isCompleted =
              lvl.isCompleted || completedLevels.includes(lvl.levelNumber);

            // Level terbuka jika level 1, atau ada di unlockedLevels, atau level sebelumnya sudah tuntas
            const isUnlocked =
              lvl.levelNumber === 1 ||
              unlockedLevels.includes(lvl.levelNumber) ||
              completedLevels.includes(lvl.levelNumber - 1) ||
              levels[index - 1]?.isCompleted;

            // Bintang HANYA muncul jika level benar-benar sudah diselesaikan!
            const stars = isCompleted ? (lvl.starsEarned || 3) : 0;

            return (
              <TouchableOpacity
                key={lvl.id || index}
                style={[
                  styles.levelCard,
                  isUnlocked ? styles.levelCardUnlocked : styles.levelCardLocked,
                ]}
                activeOpacity={isUnlocked ? 0.8 : 1}
                onPress={() => {
                  if (isUnlocked) {
                    navigation.navigate('PuzzleGame', {
                      levelData: lvl,
                      allLevels: levels,
                    });
                  }
                }}
              >
                {/* Level Number & Status */}
                <View style={styles.levelTop}>
                  <View
                    style={[
                      styles.numberCircle,
                      isUnlocked && {
                        borderColor: COLORS.primary,
                        backgroundColor: 'rgba(0, 240, 255, 0.15)',
                      },
                    ]}
                  >
                    <Text style={[styles.numberText, isUnlocked && { color: COLORS.primary }]}>
                      {lvl.levelNumber}
                    </Text>
                  </View>

                  <View style={styles.cogBadge}>
                    <Text style={styles.cogText}>{lvl.cognitiveLevel}</Text>
                  </View>
                </View>

                {/* Level Details */}
                <Text style={[styles.levelTitle, !isUnlocked && { color: COLORS.textMuted }]}>
                  {lvl.title}
                </Text>
                <Text
                  style={[styles.levelStory, !isUnlocked && { color: COLORS.textMuted }]}
                  numberOfLines={2}
                >
                  {lvl.scenarioStory}
                </Text>

                {/* Stars / Lock State */}
                <View style={styles.levelBottom}>
                  {isUnlocked ? (
                    <View style={styles.starsRow}>
                      {[1, 2, 3].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= stars ? 'star' : 'star-outline'}
                          size={16}
                          color={s <= stars ? '#F59E0B' : COLORS.textMuted}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.lockRow}>
                      <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
                      <Text style={styles.lockText}>Terkunci (Selesaikan Level {lvl.levelNumber - 1})</Text>
                    </View>
                  )}

                  {isUnlocked && (
                    <Text style={styles.playText}>
                      {isCompleted ? 'Main Ulang ↺' : 'Mulai Main →'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  toolBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  scroll: {
    padding: 18,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  roadmap: {
    gap: 14,
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  levelCardUnlocked: {
    borderColor: COLORS.surfaceBorder,
  },
  levelCardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.5,
  },
  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  cogBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cogText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  levelStory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  levelBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  playText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
