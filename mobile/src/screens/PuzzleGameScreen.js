import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Animated,
  Image,
  PanResponder,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { API } from '../services/api';
import { useApp } from '../context/AppContext';

// Aset Ilustrasi Gambar Resolusi Tinggi untuk Tiap Level Game NetFix Lab
const PUZZLE_LEVEL_IMAGES = {
  1: require('../../assets/puzzles/lvl1_router.jpg'),
  2: require('../../assets/puzzles/lvl2_switch.jpg'),
  3: require('../../assets/puzzles/lvl3_building.jpg'),
  4: require('../../assets/puzzles/lvl4_pc.jpg'),
  5: require('../../assets/puzzles/lvl5_loop.jpg'),
  6: require('../../assets/puzzles/lvl6_ap.jpg'),
};

// Data Petunjuk Bertingkat 3x per Level (Revisi 5)
const PROGRESSIVE_HINTS = {
  1: [
    'Gejala Awal: Lampu indikator internet pada router padam. Amati dua jenis warna port colokan di belakangnya.',
    'Analisis: Port kuning berlabel LAN hanya untuk komputer lokal. Jalur internet dari modem ISP membutuhkan port gateway khusus.',
    'Solusi Gerak: Seret kepala kabel kuning RJ-45 tepat ke lubang port BIRU bertuliskan WAN!',
  ],
  2: [
    'Gejala Awal: 16 port switch mati total tanpa lampu. Perangkat tidak menerima pasokan arus daya listrik.',
    'Analisis: Di atas meja ada steker adaptor hitam yang belum terhubung ke sumber listrik gedung.',
    'Solusi Gerak: Seret steker adaptor ke stopkontak putih di dinding kiri, lalu sentuh saklar I/O ke posisi ON!',
  ],
  3: [
    'Gejala Awal: Siswa di lantai 2 kafe belajar mengeluh sinyal Wi-Fi lemah (1 bar) karena AP terhalang meja besi lantai 1.',
    'Analisis: Gelombang radio Wi-Fi 2.4/5 GHz paling optimal menyebar merata jika ditempatkan di titik tertinggi tanpa halangan.',
    'Solusi Gerak: Seret kubah Access Point putih dari bawah ke dudukan plafon di Lantai 2!',
  ],
  4: [
    'Gejala Awal: Komputer server baru tidak bisa konek LAN karena motherboard belum memiliki port RJ-45 fisik.',
    'Analisis: Di meja ada kartu ekspansi Gigabit LAN (NIC) dengan kaki pin kuningan PCI-Express.',
    'Solusi Gerak: Seret kartu LAN (NIC) ke slot PCIe motherboard, lalu seret kabel LAN ke port bracket-nya!',
  ],
  5: [
    'Gejala Awal: Semua lampu port berkedip liar sangat cepat (Broadcast Storm) akibat paket data berputar tak terhingga.',
    'Analisis: Ada kabel yang ujungnya dicolok dari port 1 kembali ke port 4 di switch yang sama (*looping* fatal).',
    'Solusi Gerak: Seret tang pemotong teknisi ke kabel looping biru untuk memutus lingkaran badai broadcast!',
  ],
  6: [
    'Gejala Awal: Ruang aula rapat dihadiri 50 peserta yang membutuhkan koneksi nirkabel stabil tanpa kabel menjuntai.',
    'Analisis: Kabel 1 meter atau router rumahan murah akan *hang* jika dipaksa menampung 50 laptop secara bersamaan.',
    'Solusi Gerak: Seret perangkat Enterprise Ceiling Access Point (360°) ke plafon ruang rapat!',
  ],
};

export default function PuzzleGameScreen({ route, navigation }) {
  const { levelData, allLevels = [] } = route.params;
  const { currentUser, addXp, markLevelCompleted } = useApp();

  const [currentLevelData, setCurrentLevelData] = useState(levelData);
  const [levelNum, setLevelNum] = useState(Number(levelData.levelNumber) || 1);
  const [hintsLeft, setHintsLeft] = useState(3); // 3x Petunjuk Bertingkat (Revisi 5)
  const [usedHintsCount, setUsedHintsCount] = useState(0);
  const [hintModal, setHintModal] = useState(null);
  const [wrongModal, setWrongModal] = useState(null); // Peringatan Saat Salah Gerak (Revisi 4)
  const [victoryModal, setVictoryModal] = useState(false);
  const [failureModal, setFailureModal] = useState(false); // Modal Gagal/Menyerah

  // Posisi Animasi Drag-and-Drop (Revisi 2 & 3)
  const dragPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isHoldingItem, setIsHoldingItem] = useState(false);

  // State Simulasi Kasus
  const [lvl1Done, setLvl1Done] = useState(false);
  const [lvl2Plugged, setLvl2Plugged] = useState(false);
  const [lvl2Switch, setLvl2Switch] = useState('OFF');
  const [lvl3Floor2Placed, setLvl3Floor2Placed] = useState(false);
  const [lvl4NicInserted, setLvl4NicInserted] = useState(false);
  const [lvl4CablePlugged, setLvl4CablePlugged] = useState(false);
  const [lvl5CutDone, setLvl5CutDone] = useState(false);
  const [lvl6Done, setLvl6Done] = useState(false);

  // FIX BUGS: Hindari Closure Trap pada PanResponder
  const stateRef = useRef({ levelNum, lvl4NicInserted, currentLevelData, hintsLeft });
  stateRef.current = { levelNum, lvl4NicInserted, currentLevelData, hintsLeft };

  // Audio Efek Nyata
  const playSnapSound = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.setValueAtTime(1450, now + 0.05);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {}
  };

  const playBuzzerSound = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(130, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    } catch (e) {}
  };

  const playVictorySound = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.2, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.25);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.25);
        });
      }
    } catch (e) {}
  };

  // Reset Posisi Drag
  const resetDragPosition = () => {
    Animated.spring(dragPan, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();
    setIsHoldingItem(false);
  };

  // Simulasi Video Tutorial Otomatis
  const playSimulationVideo = () => {
    setHintModal(null);
    alert('Simulasi dimulai: Perhatikan arah gerakan benda di layar!');
    
    let tx = 0;
    let ty = -150; // Gerakan default ke atas
    if (levelNum === 2) { tx = -120; ty = -40; } // Ke kiri
    if (levelNum === 4 && !lvl4NicInserted) { tx = -60; ty = -120; }
    if (levelNum === 4 && lvl4NicInserted) { tx = 30; ty = -100; }
    if (levelNum === 5) { tx = -40; ty = -140; }

    Animated.sequence([
      Animated.timing(dragPan, {
        toValue: { x: tx, y: ty },
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.delay(1000),
      Animated.spring(dragPan, {
        toValue: { x: 0, y: 0 },
        friction: 6,
        tension: 40,
        useNativeDriver: false,
      })
    ]).start();
  };

  // Peringatan Salah Gerak (Revisi 4)
  const triggerWrongMove = (title, reason) => {
    playBuzzerSound();
    resetDragPosition();
    setWrongModal({ title, reason });
  };

  // Trigger Keberhasilan
  const triggerSuccessSolve = (customMsg) => {
    const { levelNum, currentLevelData, hintsLeft } = stateRef.current;
    playSnapSound();
    playVictorySound();
    resetDragPosition();

    setTimeout(() => {
      setVictoryModal(true);
      addXp(60, `Pemberes Kasus Level ${levelNum}`);
      // PENTING: Hanya tandai level saat ini sebagai selesai! (Revisi 6)
      markLevelCompleted(Number(levelNum));

      if (currentUser?.id) {
        API.completePuzzle(currentLevelData.id, currentUser.id, 3, 3 - hintsLeft);
      }
    }, 400);
  };

  // Trigger Gagal (Bintang 1)
  const triggerFailSolve = () => {
    const { levelNum, currentLevelData } = stateRef.current;
    playBuzzerSound();
    resetDragPosition();
    setWrongModal(null);
    
    setTimeout(() => {
      setFailureModal(true);
      addXp(10, `Partisipasi Kasus Level ${levelNum}`);
      // PENTING: Tandai selesai namun dengan skor rendah
      markLevelCompleted(Number(levelNum));

      if (currentUser?.id) {
        API.completePuzzle(currentLevelData.id, currentUser.id, 1, 3);
      }
    }, 400);
  };

  // Konfigurasi PanResponder Drag-and-Drop (Revisi 2 & 3)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsHoldingItem(true);
        dragPan.setOffset({ x: 0, y: 0 });
        dragPan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: dragPan.x, dy: dragPan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gesture) => {
        setIsHoldingItem(false);
        handleDropAction(gesture.dx, gesture.dy);
      },
    })
  ).current;

  // Evaluasi Logika Seret / Drop Berdasarkan Level Kasus
  // REVISI: Area toleransi (hitbox) diperbesar secara ekstrim agar sangat mudah menempel!
  const handleDropAction = (dx, dy) => {
    const { levelNum, lvl4NicInserted } = stateRef.current;
    
    // LEVEL 1: Seret Kabel UTP Kuning ke Port WAN (Atas)
    if (levelNum === 1) {
      if (dy < -20) {
        setLvl1Done(true);
        triggerSuccessSolve('Kabel UTP terkunci di port WAN! Jalur internet ISP aktif.');
      } else {
        triggerWrongMove(
          'Kabel Belum Menancap!',
          'Seret kepala kabel UTP ke atas menuju port WAN warna biru!'
        );
      }
    }

    // LEVEL 2: Seret Steker Adaptor ke Kiri
    else if (levelNum === 2) {
      if (dx < -20 || dy < -10) {
        playSnapSound();
        setLvl2Plugged(true);
        resetDragPosition();
        alert('⚡ Steker menancap ke stopkontak! Sekarang sentuh saklar I/O pada switch untuk menyalakannya.');
      } else {
        triggerWrongMove(
          'Steker Belum Tercolok!',
          'Seret steker adaptor ke arah KIRI menuju stopkontak!'
        );
      }
    }

    // LEVEL 3: Seret AP ke Atas
    else if (levelNum === 3) {
      if (dy < -20) {
        setLvl3Floor2Placed(true);
        triggerSuccessSolve('Access Point terpasang di plafon lantai 2! Sinyal menyebar 360° merata.');
      } else {
        triggerWrongMove(
          'Masih di Bawah!',
          'Seret AP ke atas menuju plafon Lantai 2 agar tidak terhalang meja!'
        );
      }
    }

    // LEVEL 4: Seret Kartu NIC (kiri/atas) lalu Kabel (kiri/atas)
    else if (levelNum === 4) {
      if (!lvl4NicInserted) {
        if (dx < -20 || dy < -20) {
          playSnapSound();
          setLvl4NicInserted(true);
          resetDragPosition();
          alert('🟢 Kartu NIC terkunci di slot PCIe! Sekarang seret kabel LAN ke port bracket NIC.');
        } else {
          triggerWrongMove(
            'Belum Masuk Slot!',
            'Seret kartu jaringan NIC ke atas/kiri menuju slot PCIe hijau!'
          );
        }
      } else {
        if (dx > -20 && dy < -10) {
          setLvl4CablePlugged(true);
          triggerSuccessSolve('Kabel LAN tercolok ke port NIC! Komputer berhasil terhubung ke jaringan.');
        } else {
          triggerWrongMove(
            'Kabel Belum Menancap!',
            'Seret kabel LAN ke port RJ-45 pada kartu NIC yang baru dipasang!'
          );
        }
      }
    }

    // LEVEL 5: Seret Tang (atas/kiri)
    else if (levelNum === 5) {
      if (dy < -10 || dx < -10) {
        setLvl5CutDone(true);
        triggerSuccessSolve('Kabel looping diputus! Badai broadcast reda dan switch kembali normal.');
      } else {
        triggerWrongMove(
          'Belum Terpotong!',
          'Seret tang pemotong tepat ke arah kabel biru yang melingkar!'
        );
      }
    }

    // LEVEL 6: Seret AP Enterprise ke Atas
    else if (levelNum === 6) {
      if (dy < -20) {
        setLvl6Done(true);
        triggerSuccessSolve('Access Point Enterprise terpasang di plafon! Ruang rapat 50 orang terlayani.');
      } else {
        triggerWrongMove(
          'Belum Terpasang!',
          'Seret Access Point Enterprise ke arah plafon atas!'
        );
      }
    }
  };

  // Tombol Buka Petunjuk Bertingkat (Revisi 5)
  const handleOpenHint = () => {
    if (hintsLeft <= 0) {
      alert('💡 Kamu sudah menggunakan seluruh 3 kesempatan petunjuk untuk level ini.');
      return;
    }

    const hints = PROGRESSIVE_HINTS[levelNum] || PROGRESSIVE_HINTS[1];
    const hintText = hints[usedHintsCount] || hints[hints.length - 1];

    setHintsLeft((prev) => prev - 1);
    setUsedHintsCount((prev) => prev + 1);
    setHintModal({
      step: usedHintsCount + 1,
      text: hintText,
    });
  };

  // Navigasi ke Level Berikutnya
  const handleGoNextLevel = () => {
    setVictoryModal(false);
    setFailureModal(false);
    const nextLevelNum = Number(levelNum) + 1;
    const nextData = allLevels.find((l) => Number(l.levelNumber) === nextLevelNum);

    if (nextData) {
      setLevelNum(nextLevelNum);
      setCurrentLevelData(nextData);
      setHintsLeft(3); // Reset ke 3 petunjuk per level
      setUsedHintsCount(0);
      // Reset status teka-teki
      setLvl1Done(false);
      setLvl2Plugged(false);
      setLvl2Switch('OFF');
      setLvl3Floor2Placed(false);
      setLvl4NicInserted(false);
      setLvl4CablePlugged(false);
      setLvl5CutDone(false);
      setLvl6Done(false);
      resetDragPosition();
    } else {
      navigation.goBack();
    }
  };

  const currentIllustration = PUZZLE_LEVEL_IMAGES[levelNum] || PUZZLE_LEVEL_IMAGES[1];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>TEKA-TEKI LEVEL {levelNum} / 6</Text>
        </View>

        {/* Tombol Hint 3x (Revisi 5) */}
        <TouchableOpacity style={styles.hintBtn} activeOpacity={0.8} onPress={handleOpenHint}>
          <Ionicons name="bulb" size={17} color={hintsLeft > 0 ? '#F59E0B' : COLORS.textMuted} />
          <Text style={[styles.hintBtnText, hintsLeft === 0 && { color: COLORS.textMuted }]}>
            Hint ({hintsLeft})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contentWrapper}>
          {/* Instruksi Teka-teki & Studi Kasus */}
          <View style={styles.riddleCard}>
            <View style={styles.riddleBadgeRow}>
              <View style={styles.riddleTypeTag}>
                <Ionicons name="help-buoy-outline" size={12} color={COLORS.primary} />
                <Text style={styles.riddleTypeTagText}>STUDI KASUS PROBLEM SOLVING</Text>
              </View>
              <Text style={styles.dragHintNotice}>🖐️ Teka-Teki Fisik: Seret Objek di Layar</Text>
            </View>

            <Text style={styles.riddleTitle}>{currentLevelData.title}</Text>
            <Text style={styles.riddleStory}>{currentLevelData.scenarioStory || currentLevelData.description}</Text>
          </View>

          {/* KANVAS PERMAINAN INTERAKTIF: BENDA BISA DISERET (Revisi 1, 2, 3) */}
          <View style={styles.canvasFrame}>
            <Image source={currentIllustration} style={styles.canvasImage} resizeMode="cover" />

            {/* AREA TARGET (DROP ZONE) BERCAHAYA */}
            {/* REVISI: Hapus onPress agar pemain WAJIB menyeret benda, tidak bisa diselesaikan hanya dengan tap */}
            {levelNum === 1 && (
              <View
                style={[
                  styles.targetDropZone,
                  { left: '38%', top: '60%', width: '12%', height: '18%' },
                  lvl1Done && styles.targetSolved,
                ]}
              >
                <Text style={styles.targetLabel}>{lvl1Done ? 'WAN ✅' : '🎯 TARGET WAN'}</Text>
              </View>
            )}

            {levelNum === 2 && (
              <View
                style={[
                  styles.targetDropZone,
                  { left: '10%', top: '22%', width: '16%', height: '30%' },
                  lvl2Plugged && styles.targetSolved,
                ]}
              >
                <Text style={styles.targetLabel}>{lvl2Plugged ? '220V ON ⚡' : '🎯 STOPKONTAK'}</Text>
              </View>
            )}

            {levelNum === 3 && (
              <View
                style={[
                  styles.targetDropZone,
                  { left: '42%', top: '14%', width: '24%', height: '22%' },
                  lvl3Floor2Placed && styles.targetSolved,
                ]}
              >
                <Text style={styles.targetLabel}>{lvl3Floor2Placed ? 'AP AKTIF ✅' : '🎯 PLAFON LT. 2'}</Text>
              </View>
            )}

            {levelNum === 4 && (
              <View
                style={[
                  styles.targetDropZone,
                  { left: '30%', top: '50%', width: '22%', height: '16%' },
                  lvl4NicInserted && styles.targetSolved,
                ]}
              >
                <Text style={styles.targetLabel}>{lvl4NicInserted ? 'PCIe NIC ✅' : '🎯 SLOT PCIe'}</Text>
              </View>
            )}

            {levelNum === 5 && (
              <View
                style={[
                  styles.targetDropZone,
                  { left: '44%', top: '62%', width: '28%', height: '26%' },
                  lvl5CutDone && styles.targetSolved,
                ]}
              >
                <Text style={styles.targetLabel}>{lvl5CutDone ? 'LOOP PUTUS ✅' : '🎯 KABEL LOOPING'}</Text>
              </View>
            )}

            {levelNum === 6 && (
              <View
                style={[
                  styles.targetDropZone,
                  { left: '40%', top: '8%', width: '24%', height: '24%' },
                  lvl6Done && styles.targetSolved,
                ]}
              >
                <Text style={styles.targetLabel}>{lvl6Done ? 'AP ENTERPRISE ✅' : '🎯 PLAFON RUANG RAPAT'}</Text>
              </View>
            )}

            {/* BENDA FISIK YANG BISA DISERET (DRAGGABLE OBJECT) (Revisi 2, 3, 7) */}
            {/* REVISI: Menggunakan Icon berukuran raksasa tanpa teks untuk merepresentasikan benda fisik sungguhan */}
            <View style={styles.dragSpawnContainer}>
              {/* Level 1: Kepala Kabel UTP */}
              {levelNum === 1 && !lvl1Done && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.draggableItemPhysical,
                    { transform: [{ translateX: dragPan.x }, { translateY: dragPan.y }] },
                    isHoldingItem && styles.draggingGlow,
                  ]}
                >
                  <Ionicons name="git-commit" size={70} color="#F59E0B" />
                </Animated.View>
              )}

              {/* Level 2: Steker Adaptor Listrik */}
              {levelNum === 2 && !lvl2Plugged && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.draggableItemPhysical,
                    { transform: [{ translateX: dragPan.x }, { translateY: dragPan.y }] },
                    isHoldingItem && styles.draggingGlow,
                  ]}
                >
                  <Ionicons name="flash" size={70} color="#10B981" />
                </Animated.View>
              )}

              {/* Level 3: Kubah Access Point */}
              {levelNum === 3 && !lvl3Floor2Placed && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.draggableItemPhysical,
                    { transform: [{ translateX: dragPan.x }, { translateY: dragPan.y }] },
                    isHoldingItem && styles.draggingGlow,
                  ]}
                >
                  <Ionicons name="wifi" size={70} color="#00F0FF" />
                </Animated.View>
              )}

              {/* Level 4: Kartu Jaringan NIC */}
              {levelNum === 4 && (!lvl4NicInserted || !lvl4CablePlugged) && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.draggableItemPhysical,
                    { transform: [{ translateX: dragPan.x }, { translateY: dragPan.y }] },
                    isHoldingItem && styles.draggingGlow,
                  ]}
                >
                  <Ionicons name={!lvl4NicInserted ? "hardware-chip" : "git-commit"} size={70} color="#10B981" />
                </Animated.View>
              )}

              {/* Level 5: Tang Pemotong */}
              {levelNum === 5 && !lvl5CutDone && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.draggableItemPhysical,
                    { transform: [{ translateX: dragPan.x }, { translateY: dragPan.y }] },
                    isHoldingItem && styles.draggingGlow,
                  ]}
                >
                  <Ionicons name="cut" size={70} color="#EF4444" />
                </Animated.View>
              )}

              {/* Level 6: AP Enterprise Plafon */}
              {levelNum === 6 && !lvl6Done && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.draggableItemPhysical,
                    { transform: [{ translateX: dragPan.x }, { translateY: dragPan.y }] },
                    isHoldingItem && styles.draggingGlow,
                  ]}
                >
                  <Ionicons name="radio" size={70} color="#10B981" />
                </Animated.View>
              )}
            </View>

            {/* Hint Panduan Gerak di Bawah Kanvas */}
            <View style={styles.canvasBottomTip}>
              <Ionicons name="hand-left-outline" size={13} color={COLORS.primary} />
              <Text style={styles.canvasBottomTipText}>
                Sentuh dan seret benda besar di atas menuju target bercahaya di dalam gambar!
              </Text>
            </View>
          </View>

          {/* AKSI INTERAKSI TAMBAHAN (MISAL SAKLAR LEVEL 2) */}
          {levelNum === 2 && (
            <View style={styles.extraControlBox}>
              <Text style={styles.extraControlTitle}>Kendali Daya Switch:</Text>
              <TouchableOpacity
                style={[styles.switchToggleBtn, lvl2Switch === 'ON' && styles.switchToggleBtnActive]}
                activeOpacity={0.8}
                onPress={() => {
                  playSnapSound();
                  const next = lvl2Switch === 'OFF' ? 'ON' : 'OFF';
                  setLvl2Switch(next);
                  if (lvl2Plugged && next === 'ON') {
                    triggerSuccessSolve('Switch menyala normal! Aliran listrik dan saklar daya aktif.');
                  } else if (!lvl2Plugged && next === 'ON') {
                    triggerWrongMove(
                      'Listrik Belum Mengalir!',
                      'Saklar switch sudah di-ON-kan, namun steker adaptornya belum kamu colokkan ke stopkontak listrik!'
                    );
                  }
                }}
              >
                <Ionicons name="power" size={22} color={lvl2Switch === 'ON' ? '#FFFFFF' : COLORS.primary} />
                <Text style={[styles.switchToggleText, lvl2Switch === 'ON' && { color: '#FFFFFF' }]}>
                  Tekan Saklar Daya: {lvl2Switch}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status Penuntasan Kasus */}
          <View style={styles.statusBox}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.statusBoxText}>
              Pikirkan secara logika: Mengapa alat ini tidak bekerja? Hubungkan benda penyebabnya secara fisik untuk memecahkan teka-teki!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* MODAL PERINGATAN SAAT SALAH MENYERET / MENANCAPKAN (Revisi 4) */}
      <Modal visible={!!wrongModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.wrongCard}>
            <Ionicons name="alert-circle" size={60} color={COLORS.danger} />
            <Text style={styles.wrongTitle}>{wrongModal?.title || 'Salah Penempatan!'}</Text>
            <Text style={styles.wrongReason}>{wrongModal?.reason}</Text>

            <TouchableOpacity style={styles.wrongTryBtn} onPress={() => setWrongModal(null)}>
              <Text style={styles.wrongTryBtnText}>Coba Lagi ↺</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20 }} onPress={triggerFailSolve}>
              <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }}>
                Susah? Nyerah & Lanjut (Bintang 1)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL PETUNJUK BERTINGKAT 3X (Revisi 5) */}
      <Modal visible={!!hintModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.hintCard}>
            <View style={styles.hintHeader}>
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <Text style={styles.hintModalTitle}>Petunjuk Tahap {hintModal?.step} dari 3</Text>
            </View>

            {/* Video Placeholder (Play Simulation) */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={playSimulationVideo}
              style={{ width: '100%', height: 160, backgroundColor: '#0F172A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' }}
            >
              <Ionicons name="play-circle" size={54} color={COLORS.primary} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 8, fontWeight: '600' }}>Putar Visualisasi Cara Menyelesaikan</Text>
            </TouchableOpacity>

            <Text style={styles.hintModalDesc}>{hintModal?.text}</Text>

            <TouchableOpacity style={styles.hintCloseBtn} onPress={() => setHintModal(null)}>
              <Text style={styles.hintCloseBtnText}>Paham, Saya Coba Lagi!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL GAGAL / MENYERAH */}
      <Modal visible={failureModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.victoryCard, { borderColor: COLORS.danger }]}>
            <Ionicons name="close-circle" size={68} color={COLORS.danger} />
            <Text style={styles.victoryTitle}>Kamu Menyerah!</Text>
            <Text style={[styles.victorySubtitle, { color: COLORS.danger }]}>Tidak Lulus Level Ini</Text>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                Jangan khawatir, kamu bisa mempelajari materinya lagi nanti atau mengulangi level ini untuk mendapatkan 3 Bintang!
                {"\n\n"}Jawaban: {currentLevelData.explanation}
              </Text>
            </View>

            <View style={[styles.rewardBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="flash" size={20} color={COLORS.danger} />
              <Text style={[styles.rewardText, { color: COLORS.danger }]}>+10 XP • 1 Bintang Diperoleh ⭐</Text>
            </View>

            <TouchableOpacity style={[styles.nextLevelBtn, { backgroundColor: COLORS.danger }]} onPress={handleGoNextLevel}>
              <Text style={[styles.nextLevelText, { color: '#FFF' }]}>
                {levelNum < 6 ? 'Lanjut ke Level Berikutnya ➔' : 'Semua Level Selesai! Kembali ke Lab'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL KEMENANGAN & ANALISIS TEKNIS */}
      <Modal visible={victoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <Ionicons name="checkmark-circle" size={68} color={COLORS.secondary} />
            <Text style={styles.victoryTitle}>Teka-Teki Terpecahkan! 🎉</Text>
            <Text style={styles.victorySubtitle}>Konsep Troubleshooting RPP Fase E:</Text>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>{currentLevelData.explanation}</Text>
            </View>

            <View style={styles.rewardBox}>
              <Ionicons name="flash" size={20} color="#F59E0B" />
              <Text style={styles.rewardText}>+60 XP • 3 Bintang Diperoleh ⭐⭐⭐</Text>
            </View>

            <TouchableOpacity style={styles.nextLevelBtn} onPress={handleGoNextLevel}>
              <Text style={styles.nextLevelText}>
                {levelNum < 6 ? 'Buka Teka-Teki Level Berikutnya ➔' : 'Semua Level Tuntas! Kembali ke Lab 🎉'}
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
  levelBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  hintBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 720,
  },
  riddleCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
  },
  riddleBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riddleTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riddleTypeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  dragHintNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.warning,
  },
  riddleTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 6,
  },
  riddleStory: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  canvasFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#05070B',
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    position: 'relative',
    marginBottom: 16,
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  targetDropZone: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    zIndex: 10,
  },
  targetSolved: {
    borderColor: COLORS.secondary,
    borderStyle: 'solid',
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
  },
  targetLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  dragSpawnContainer: {
    position: 'absolute',
    bottom: 34,
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  draggableItemPhysical: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.95)',
    padding: 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  draggingGlow: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  draggablePieceText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  canvasBottomTip: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  canvasBottomTipText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  extraControlBox: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
  },
  extraControlTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  switchToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
  },
  switchToggleBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  switchToggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    gap: 8,
  },
  statusBoxText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.88)',
    justifyContent: 'center',
    padding: 24,
  },
  wrongCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.danger,
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  wrongTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.danger,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  wrongReason: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  wrongTryBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  wrongTryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hintCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: '#F59E0B',
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  hintModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F59E0B',
  },
  hintModalDesc: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 20,
  },
  hintCloseBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  hintCloseBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  victoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  victoryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  victorySubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  explanationBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  explanationText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  nextLevelBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  nextLevelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
