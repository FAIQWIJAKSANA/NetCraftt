import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS } from '../constants/theme';
import { API } from '../services/api';
import { useApp } from '../context/AppContext';

export default function TinderQuizScreen({ navigation }) {
  const { currentUser, addXp } = useApp();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0); // Combo Streak Interaktif
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [swipeState, setSwipeState] = useState(null); // 'left' | 'right' | null

  // Animated values for tactile card swipe
  const cardTilt = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSwipeCards();
  }, []);

  // Keyboard controls listener for Desktop web interaction
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleKeyDown = (e) => {
        if (feedbackModal) {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
            e.preventDefault();
            handleNextQuestion();
          }
          return;
        }

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          triggerSwipe(false);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          triggerSwipe(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [feedbackModal, currentIndex, cards]);

  const loadSwipeCards = async () => {
    const list = await API.getSwipeCards();
    setCards(list);
  };

  const playSynthesizedChime = (isCorrect) => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (isCorrect) {
          // Dual pleasant chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.setValueAtTime(880, now + 0.1); // A5
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else {
          // Low soft boop
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.setValueAtTime(190, now + 0.1);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        }
        return;
      }
    } catch (e) {}

    // Fallback suara
    try {
      Speech.speak(isCorrect ? 'Benar!' : 'Salah!', { language: 'id-ID', rate: 1.15 });
    } catch (e) {}
  };

  const currentCard = cards[currentIndex] || null;

  const triggerSwipe = (userAnswer) => {
    if (!currentCard || swipeState) return;

    const isUserCorrect = userAnswer === currentCard.isCorrect;
    setSwipeState(userAnswer ? 'right' : 'left');

    // Animasi geser & miring kartu
    Animated.parallel([
      Animated.timing(cardTilt, {
        toValue: userAnswer ? 1 : -1,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(cardScale, {
        toValue: 0.96,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Audio Chime
      playSynthesizedChime(isUserCorrect);

      if (isUserCorrect) {
        setCorrectCount((prev) => prev + 1);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }

      setFeedbackModal({
        isUserCorrect,
        userAnswer,
        explanation: currentCard.explanation,
      });

      // Reset posisi kartu
      cardTilt.setValue(0);
      cardScale.setValue(1);
      setSwipeState(null);
    });
  };

  const handleNextQuestion = () => {
    setFeedbackModal(null);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    const earnedXp = correctCount * 10;
    addXp(earnedXp, 'Pengambil Keputusan Cepat');
    if (currentUser?.id) {
      API.submitSwipeResult(currentUser.id, correctCount, cards.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setStreak(0);
    setIsFinished(false);
    setFeedbackModal(null);
  };

  if (isFinished) {
    const scorePct = Math.round((correctCount / (cards.length || 1)) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultBox}>
          <Ionicons
            name={scorePct >= 70 ? 'trophy' : 'ribbon-outline'}
            size={70}
            color={scorePct >= 70 ? COLORS.primary : COLORS.warning}
          />
          <Text style={styles.resultTitle}>
            {scorePct >= 70 ? 'Luar Biasa, Teknisi Handal! 🎉' : 'Bagus! Terus Asah Pemahamanmu 💡'}
          </Text>
          <Text style={styles.resultScore}>{scorePct}% Akurasi</Text>
          <Text style={styles.resultDesc}>
            Kamu menjawab benar {correctCount} dari {cards.length} pernyataan teknis jaringan.
          </Text>

          <View style={styles.rewardXpBox}>
            <Ionicons name="flash" size={20} color="#F59E0B" />
            <Text style={styles.rewardXpText}>+{correctCount * 10} XP Ditambahkan ke Profil</Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('NetFixLab')}
          >
            <Text style={styles.actionBtnText}>Lanjut ke Game NetFix Lab →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleRestart}>
            <Text style={styles.secondaryBtnText}>Ulangi Kuis Swipe</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={{ color: COLORS.textSecondary }}>Memuat Kuis Swipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Interpolasi animasi rotasi & pergeseran kartu
  const rotateDeg = cardTilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const translateX = cardTilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-60, 0, 60],
  });

  const progressPercent = Math.round(((currentIndex + 1) / (cards.length || 1)) * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>

        {/* Streak Indicator Interaktif */}
        {streak > 1 ? (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={styles.streakText}>{streak}x Combo Streak!</Text>
          </View>
        ) : (
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              Soal {currentIndex + 1} / {cards.length}
            </Text>
          </View>
        )}

        <View style={styles.scoreCounter}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
          <Text style={styles.scoreCounterText}>{correctCount}</Text>
        </View>
      </View>

      {/* Progress Bar Indicator */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Keyboard Hint for Desktop */}
      {Platform.OS === 'web' && (
        <View style={styles.keyboardHintsRow}>
          <View style={styles.keyTag}>
            <Text style={styles.keyTagText}>← Panah Kiri = SALAH</Text>
          </View>
          <View style={styles.keyTag}>
            <Text style={styles.keyTagText}>Panah Kanan → = BENAR</Text>
          </View>
        </View>
      )}

      {/* Main Tinder Card Deck Area dengan 3D Stack Effect */}
      <View style={styles.cardArea}>
        {/* Layer Stack 2 (Paling Bawah) */}
        {currentIndex + 2 < cards.length && (
          <View style={[styles.stackedCard, styles.stackLayer2]} />
        )}

        {/* Layer Stack 1 (Tengah) */}
        {currentIndex + 1 < cards.length && (
          <View style={[styles.stackedCard, styles.stackLayer1]} />
        )}

        {/* Active Animated Card */}
        <Animated.View
          style={[
            styles.swipeCard,
            {
              transform: [{ translateX }, { rotate: rotateDeg }, { scale: cardScale }],
            },
          ]}
        >
          {/* Visual Stamp saat di-swipe */}
          {swipeState === 'right' && (
            <View style={[styles.stampBadge, styles.stampRight]}>
              <Text style={styles.stampRightText}>BENAR</Text>
            </View>
          )}

          {swipeState === 'left' && (
            <View style={[styles.stampBadge, styles.stampLeft]}>
              <Text style={styles.stampLeftText}>SALAH</Text>
            </View>
          )}

          <View style={styles.categoryTag}>
            <Ionicons name="hardware-chip-outline" size={14} color={COLORS.primary} />
            <Text style={styles.categoryText}>{currentCard.category.toUpperCase()}</Text>
          </View>

          <Text style={styles.statementText}>"{currentCard.statement}"</Text>

          <View style={styles.hintContainer}>
            <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
            <Text style={styles.swipeHint}>
              Tentukan: Apakah pernyataan di atas BENAR atau SALAH?
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Action Swipe Buttons Interaktif */}
      <View style={styles.buttonRow}>
        {/* Tombol SALAH (Kiri) */}
        <TouchableOpacity
          style={[styles.swipeBtn, styles.btnFalse]}
          activeOpacity={0.7}
          onPress={() => triggerSwipe(false)}
        >
          <Ionicons name="close-circle" size={32} color="#EF4444" />
          <Text style={styles.btnTextFalse}>SALAH (←)</Text>
        </TouchableOpacity>

        {/* Tombol BENAR (Kanan) */}
        <TouchableOpacity
          style={[styles.swipeBtn, styles.btnTrue]}
          activeOpacity={0.7}
          onPress={() => triggerSwipe(true)}
        >
          <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          <Text style={styles.btnTextTrue}>BENAR (→)</Text>
        </TouchableOpacity>
      </View>

      {/* Instant Feedback Modal */}
      <Modal visible={!!feedbackModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.feedbackCard,
              {
                borderColor: feedbackModal?.isUserCorrect ? COLORS.secondary : COLORS.danger,
              },
            ]}
          >
            <Ionicons
              name={feedbackModal?.isUserCorrect ? 'checkmark-circle' : 'alert-circle'}
              size={58}
              color={feedbackModal?.isUserCorrect ? COLORS.secondary : COLORS.danger}
            />

            <Text
              style={[
                styles.feedbackTitle,
                { color: feedbackModal?.isUserCorrect ? COLORS.secondary : COLORS.danger },
              ]}
            >
              {feedbackModal?.isUserCorrect ? 'Tepat Sekali! 🎉' : 'Kurang Tepat! 💡'}
            </Text>

            <Text style={styles.feedbackExplanation}>{feedbackModal?.explanation}</Text>

            <TouchableOpacity style={styles.feedbackNextBtn} onPress={handleNextQuestion}>
              <Text style={styles.feedbackNextText}>
                {currentIndex + 1 < cards.length ? 'Pertanyaan Berikutnya (Enter) →' : 'Lihat Hasil Akhir 🎉'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    gap: 6,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  scoreCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreCounterText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  keyboardHintsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
  },
  keyTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  keyTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  stackedCard: {
    position: 'absolute',
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    minHeight: 330,
  },
  stackLayer1: {
    transform: [{ scale: 0.95 }, { translateY: 14 }],
    opacity: 0.65,
    zIndex: 1,
  },
  stackLayer2: {
    transform: [{ scale: 0.9 }, { translateY: 26 }],
    opacity: 0.35,
    zIndex: 0,
  },
  swipeCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 26,
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 10,
    position: 'relative',
  },
  stampBadge: {
    position: 'absolute',
    top: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 3,
    zIndex: 20,
  },
  stampRight: {
    right: 20,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    transform: [{ rotate: '15deg' }],
  },
  stampRightText: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  stampLeft: {
    left: 20,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    transform: [{ rotate: '-15deg' }],
  },
  stampLeftText: {
    color: '#EF4444',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 24,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  statementText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swipeHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 36,
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
  },
  swipeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    borderWidth: 2,
  },
  btnFalse: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  btnTextFalse: {
    fontSize: 15,
    fontWeight: '900',
    color: '#EF4444',
  },
  btnTrue: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  btnTextTrue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  feedbackCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 10,
  },
  feedbackExplanation: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  feedbackNextBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  feedbackNextText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 26,
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  resultDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  rewardXpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 8,
    marginBottom: 28,
  },
  rewardXpText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F59E0B',
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
});
