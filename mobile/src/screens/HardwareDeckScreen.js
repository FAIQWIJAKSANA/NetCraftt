import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS } from '../constants/theme';
import { API } from '../services/api';
import { useApp } from '../context/AppContext';

// Pemetaan aset gambar lokal dari folder assets/hardware
const LOCAL_HARDWARE_IMAGES = {
  'router': require('../../assets/hardware/router.png'),
  'switch': require('../../assets/hardware/switch.png'),
  'access-point': require('../../assets/hardware/access.avif'),
  'modem': require('../../assets/hardware/modem.jpg'),
  'nic': require('../../assets/hardware/nic.jpg'),
  'utp-cable': require('../../assets/hardware/media.jpg'),
};

// Titik Hotspot Presisi dengan Opsi Penyesuaian Mobile vs Desktop (Revisi B.1 & B.2)
const DEVICE_HOTSPOTS_CONFIG = {
  'router': [
    {
      id: 1,
      title: 'Deretan Port LAN & WAN',
      description: 'Port colokan kabel di bagian depan router. Port utama untuk jalur kabel dari modem ISP dan port lokal ke switch/PC.',
      mobile: { x: 33, y: 72 },
      desktop: { x: 35, y: 72 },
    },
    {
      id: 2,
      title: 'Lampu LED & Gelombang Wi-Fi',
      description: 'Lampu garis biru dan ikon indikator aktivitas. Menyala berdenyut saat sedang ada pengiriman data nirkabel.',
      mobile: { x: 48, y: 54 },
      desktop: { x: 49, y: 54 },
    },
    {
      id: 3,
      title: 'Antena Wi-Fi 2.4 GHz',
      description: 'Antena pemancar gelombang radio nirkabel dengan jangkauan luas untuk menembus sekat ruangan.',
      mobile: { x: 23, y: 22 },
      desktop: { x: 25, y: 22 },
    },
    {
      id: 4,
      title: 'Antena Wi-Fi 5 GHz',
      description: 'Antena pemancar frekuensi tinggi untuk kecepatan internet maksimal pada jarak dekat.',
      mobile: { x: 80, y: 22 },
      desktop: { x: 76, y: 22 },
    },
  ],
  'switch': [
    {
      id: 1,
      title: '24 Port RJ-45 Gigabit',
      description: 'Deretan 24 lubang port RJ-45 untuk membagi kabel LAN ke seluruh komputer di laboratorium/ruang kerja.',
      mobile: { x: 60, y: 74 },
      desktop: { x: 62, y: 73 },
    },
    {
      id: 2,
      title: 'Grid Lampu LED Port (1-24)',
      description: 'Lampu indikator untuk tiap nomor port. Berkedip hijau saat kabel dicolokkan dan ada lalu lintas data.',
      mobile: { x: 18, y: 74 },
      desktop: { x: 20, y: 73 },
    },
    {
      id: 3,
      title: 'LED Power Listrik',
      description: 'Lampu hijau penanda saklar daya hidup dan switch menerima aliran arus listrik.',
      mobile: { x: 10, y: 80 },
      desktop: { x: 10, y: 80 },
    },
    {
      id: 4,
      title: 'Casing Rackmount Logam',
      description: 'Bodi besi kokoh standar rak server untuk membuang panas perangkat tanpa kipas bising.',
      mobile: { x: 50, y: 35 },
      desktop: { x: 50, y: 35 },
    },
  ],
  'access-point': [
    {
      id: 1,
      title: 'Cincin Lampu LED Status',
      description: 'Lampu indikator cincin di tengah kubah. Menyala biru saat siap melayani koneksi Wi-Fi dari smartphone dan laptop.',
      mobile: { x: 50, y: 44 },
      desktop: { x: 50, y: 44 },
    },
    {
      id: 2,
      title: 'Dudukan Plafon & Port PoE',
      description: 'Bagian belakang untuk dikunci ke langit-langit ruangan dan lubang colokan kabel LAN PoE (listrik + data).',
      mobile: { x: 50, y: 75 },
      desktop: { x: 50, y: 75 },
    },
  ],
  'modem': [
    {
      id: 1,
      title: 'Port Kabel LAN / WAN Out',
      description: 'Lubang colokan kabel LAN biru untuk meneruskan internet dari modem ke router utama.',
      mobile: { x: 32, y: 69 },
      desktop: { x: 34, y: 69 },
    },
    {
      id: 2,
      title: 'Antena Pemancar Sinyal',
      description: 'Antena bawaan modem untuk jangkauan darurat di sekitar meja kasir/admin.',
      mobile: { x: 37, y: 24 },
      desktop: { x: 37, y: 24 },
    },
    {
      id: 3,
      title: 'Ventilasi Pendingin Bodi',
      description: 'Kisi-kisi lubang udara di bagian atas agar komponen optik tidak cepat panas saat menyala 24 jam.',
      mobile: { x: 52, y: 48 },
      desktop: { x: 52, y: 48 },
    },
  ],
  'nic': [
    {
      id: 1,
      title: 'Port RJ-45 Bracket Belakang',
      description: 'Lubang colokan kabel internet di bagian pelat besi yang menghadap ke luar casing CPU komputer.',
      mobile: { x: 42, y: 60 },
      desktop: { x: 42, y: 60 },
    },
    {
      id: 2,
      title: 'Kaki Kuningan Slot PCIe',
      description: 'Kaki-kaki pin emas yang ditancapkan ke slot PCI-Express pada motherboard komputer.',
      mobile: { x: 74, y: 55 },
      desktop: { x: 74, y: 55 },
    },
    {
      id: 3,
      title: 'Chipset Controller & Transformer',
      description: 'Otak sirkuit yang mengubah kode biner komputer menjadi denyut listrik kabel LAN.',
      mobile: { x: 58, y: 46 },
      desktop: { x: 58, y: 46 },
    },
  ],
  'utp-cable': [
    {
      id: 1,
      title: 'Konektor RJ-45 Plastik Bening',
      description: 'Kepala konektor 8 pin tembaga yang mengunci kabel saat dicolokkan ke port perangkat jaringan.',
      mobile: { x: 28, y: 52 },
      desktop: { x: 30, y: 52 },
    },
    {
      id: 2,
      title: '8 Helai Kawat Tembaga Berpilin',
      description: 'Kawat berpasangan (Twisted Pair) dengan urutan warna standar T568B untuk meredam gangguan sinyal magnetik.',
      mobile: { x: 68, y: 52 },
      desktop: { x: 68, y: 52 },
    },
  ],
};

export default function HardwareDeckScreen({ navigation }) {
  const { addXp } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopScreen = windowWidth >= 768;

  const [cards, setCards] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false); // Status ON/OFF Suara (Revisi B.3)
  const [viewMode, setViewMode] = useState(isDesktopScreen ? 'desktop' : 'mobile'); // Opsi Penyesuaian Mobile / Desktop (Revisi B.2)

  useEffect(() => {
    loadCards();
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = async () => {
    try {
      await Speech.stop();
    } catch (e) {}
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeaking(false);
  };

  const loadCards = async () => {
    const data = await API.getHardwareCards();
    setCards(data);
  };

  const currentCard = cards[selectedIndex] || null;

  // Fitur Suara dengan Toggle ON / OFF (Revisi B.3)
  const handleToggleAudio = async (term, name) => {
    if (isSpeaking) {
      await stopAudio();
    } else {
      setIsSpeaking(true);
      const textToSpeak = `${name}. Istilah pelafalan teknis dibaca: ${term}.`;

      try {
        Speech.speak(textToSpeak, {
          language: 'id-ID',
          pitch: 1.0,
          rate: 0.85,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
        });
      } catch (e) {
        setIsSpeaking(false);
      }

      addXp(5, 'Pendengar Cermat');
    }
  };

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={{ color: COLORS.textSecondary }}>Memuat Kartu Perangkat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Ambil gambar & hotspot presisi terkonfigurasi
  const cardImageSource =
    LOCAL_HARDWARE_IMAGES[currentCard.slug] || { uri: currentCard.imageUrl };

  const hotspotList = DEVICE_HOTSPOTS_CONFIG[currentCard.slug] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Device Switcher Carousel */}
      <View style={styles.switcherContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherScroll}>
          {cards.map((c, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <TouchableOpacity
                key={c.id || idx}
                style={[styles.switcherTab, isSelected && styles.switcherTabActive]}
                onPress={() => {
                  stopAudio();
                  setSelectedIndex(idx);
                }}
              >
                <Text style={[styles.switcherText, isSelected && styles.switcherTextActive]}>
                  {c.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contentWrapper}>
          {/* Opsi Penyesuaian Mobile vs Desktop (Revisi B.2: Titik denyut & bingkai menyesuaikan) */}
          <View style={styles.modeControlBar}>
            <View style={styles.modeInfo}>
              <Ionicons
                name={viewMode === 'desktop' ? 'laptop-outline' : 'phone-portrait-outline'}
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.modeInfoText}>
                Mode Denyut: <Text style={{ color: COLORS.primary, fontWeight: '800' }}>{viewMode === 'desktop' ? 'Layar Desktop' : 'Layar Mobile'}</Text>
              </Text>
            </View>

            <View style={styles.modeToggleGroup}>
              <TouchableOpacity
                style={[styles.modeBtn, viewMode === 'mobile' && styles.modeBtnActive]}
                onPress={() => setViewMode('mobile')}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={13}
                  color={viewMode === 'mobile' ? '#FFFFFF' : COLORS.textSecondary}
                />
                <Text style={[styles.modeBtnText, viewMode === 'mobile' && styles.modeBtnTextActive]}>
                  Mobile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, viewMode === 'desktop' && styles.modeBtnActive]}
                onPress={() => setViewMode('desktop')}
              >
                <Ionicons
                  name="desktop-outline"
                  size={13}
                  color={viewMode === 'desktop' ? '#FFFFFF' : COLORS.textSecondary}
                />
                <Text style={[styles.modeBtnText, viewMode === 'desktop' && styles.modeBtnTextActive]}>
                  Desktop
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card Main View */}
          <View style={styles.deckCard}>
            {/* Header Info */}
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.categoryBadge}>{currentCard.category.toUpperCase()}</Text>
                <Text style={styles.cardName}>{currentCard.name}</Text>
                <Text style={styles.osiBadge}>🌐 {currentCard.osiLayer}</Text>
              </View>

              {/* Audio Toggle ON / OFF Button (Revisi B.3) */}
              <TouchableOpacity
                style={[styles.audioBtn, isSpeaking && styles.audioBtnActive]}
                activeOpacity={0.8}
                onPress={() => handleToggleAudio(currentCard.audioTerm, currentCard.name)}
              >
                <Ionicons
                  name={isSpeaking ? 'stop-circle' : 'volume-high'}
                  size={24}
                  color={isSpeaking ? '#EF4444' : COLORS.primary}
                />
                <Text style={[styles.audioBtnLabel, isSpeaking && { color: '#EF4444' }]}>
                  {isSpeaking ? 'STOP SUARA' : 'PUTAR SUARA'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stage Container: Terisolasi ketat agar titik berdenyut selalu presisi (Revisi B.1 & B.2) */}
            <View style={styles.stageOuterContainer}>
              <View
                style={[
                  styles.innerStage,
                  viewMode === 'desktop' ? styles.innerStageDesktop : styles.innerStageMobile,
                ]}
              >
                <Image
                  source={cardImageSource}
                  style={styles.cardImage}
                  resizeMode="contain"
                />

                {/* Hotspot Pins Overlay Presisi Sesuai Gambar & Mode */}
                {hotspotList.map((spot) => {
                  const coord = viewMode === 'desktop' ? spot.desktop : spot.mobile;
                  return (
                    <TouchableOpacity
                      key={spot.id}
                      style={[
                        styles.hotspotPin,
                        { left: `${coord.x}%`, top: `${coord.y}%` },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setActiveHotspot(spot)}
                    >
                      <View style={styles.hotspotPulse} />
                      <Ionicons
                        name="radio-button-on"
                        size={viewMode === 'desktop' ? 22 : 18}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.hotspotHint}>
                  <Ionicons name="finger-print" size={13} color={COLORS.primary} />
                  <Text style={styles.hotspotHintText}>
                    {viewMode === 'desktop'
                      ? 'Titik denyut dikalibrasi presisi untuk tampilan Desktop'
                      : 'Titik denyut dikalibrasi presisi untuk tampilan HP/Mobile'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Daftar Komponen yang Bisa Di-tap Secara Cepat */}
            <View style={styles.quickHotspotsRow}>
              {hotspotList.map((spot) => (
                <TouchableOpacity
                  key={spot.id}
                  style={styles.quickSpotChip}
                  onPress={() => setActiveHotspot(spot)}
                >
                  <Ionicons name="location-outline" size={12} color={COLORS.primary} />
                  <Text style={styles.quickSpotText}>{spot.title.split(' ')[0]} {spot.title.split(' ')[1] || ''}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Analogi Box (Mendalam & Ramah Kelas 10) */}
            <View style={styles.analogyBox}>
              <View style={styles.analogyHeader}>
                <Ionicons name="sparkles" size={18} color={COLORS.secondary} />
                <Text style={styles.analogyTitle}>Analogi Dunia Nyata (Konsep Sederhana)</Text>
              </View>
              <Text style={styles.analogyText}>{currentCard.analogy}</Text>
            </View>

            {/* Key Specs & Cara Kerja Fisik */}
            <View style={styles.specBox}>
              <View style={styles.specHeader}>
                <Ionicons name="hardware-chip-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionLabel}>Spesifikasi Port & Cara Kerja Fisik</Text>
              </View>
              <Text style={styles.specText}>{currentCard.keySpecs}</Text>
            </View>

            {/* Do's & Don'ts */}
            <View style={styles.ruleBox}>
              <View style={styles.ruleHeader}>
                <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
                <Text style={styles.ruleTitle}>Aturan Teknisi Lapangan (PENTING!)</Text>
              </View>
              <Text style={styles.ruleText}>{currentCard.dosAndDonts}</Text>
            </View>
          </View>

          {/* Action Button to Quick Swipe */}
          <TouchableOpacity
            style={styles.testBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('TinderQuiz')}
          >
            <Text style={styles.testBtnText}>Uji Pemahaman: Tinder Swipe →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Hotspot Detail Modal */}
      <Modal visible={!!activeHotspot} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="hardware-chip-outline" size={24} color={COLORS.primary} />
              <Text style={styles.modalTitle}>{activeHotspot?.title}</Text>
            </View>
            <Text style={styles.modalDesc}>{activeHotspot?.description}</Text>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveHotspot(null)}>
              <Text style={styles.modalCloseText}>Tutup Penjelasan</Text>
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
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switcherContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  switcherScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  switcherTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  switcherTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  switcherTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 760, // Menjaga tata letak proporsional dan tidak meregang liar di desktop
  },
  modeControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 12,
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeInfoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  deckCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  osiBadge: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  audioBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    gap: 2,
  },
  audioBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  audioBtnLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  stageOuterContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05070B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    padding: 10,
    marginBottom: 14,
    overflow: 'hidden',
  },
  innerStage: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#030508',
  },
  innerStageMobile: {
    width: '100%',
    maxWidth: 360,
    height: 250,
  },
  innerStageDesktop: {
    width: '100%',
    maxWidth: 620,
    height: 330,
  },
  cardImage: {
    width: '94%',
    height: '88%',
  },
  hotspotPin: {
    position: 'absolute',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.92)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primary,
    zIndex: 10,
  },
  hotspotPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.4)',
  },
  hotspotHint: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  hotspotHintText: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '600',
  },
  quickHotspotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  quickSpotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  quickSpotText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  analogyBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 14,
  },
  analogyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  analogyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  analogyText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  specBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  specHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  specText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  ruleBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.warning,
  },
  ruleText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  testBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  testBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
