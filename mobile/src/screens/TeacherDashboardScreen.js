import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { API } from '../services/api';
import { useApp } from '../context/AppContext';

export default function TeacherDashboardScreen({ navigation }) {
  const { currentUser, logout } = useApp();
  const { width } = useWindowDimensions();
  const isWide = width > 700; // Layout 2 kolom untuk tablet/web
  const [groupsSummary, setGroupsSummary] = useState([]);
  const [selectedGroupToGrade, setSelectedGroupToGrade] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rubric Scores (1 - 4)
  const [gotongRoyong, setGotongRoyong] = useState(4);
  const [bernalarKritis, setBernalarKritis] = useState(3);
  const [hardwareDetail, setHardwareDetail] = useState(4);
  const [teknisDetail, setTeknisDetail] = useState(3);
  const [teacherNotes, setTeacherNotes] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const list = await API.getTeacherSummary();
      setGroupsSummary(list && list.length > 0 ? list : []);
    } catch (e) {
      console.warn('Gagal load summary:', e);
    } finally {
      setLoading(false);
    }
  };


  const openGradingModal = (grp) => {
    setSelectedGroupToGrade(grp);
    if (grp.assessmentDetail) {
      setGotongRoyong(grp.assessmentDetail.scoreGotongRoyong || 3);
      setBernalarKritis(grp.assessmentDetail.scoreBernalarKritis || 3);
      setHardwareDetail(grp.assessmentDetail.scoreHardwareDetail || 3);
      setTeknisDetail(grp.assessmentDetail.scoreTeknis || 3);
      setTeacherNotes(grp.assessmentDetail.teacherNotes || '');
    } else {
      setGotongRoyong(4);
      setBernalarKritis(3);
      setHardwareDetail(4);
      setTeknisDetail(3);
      setTeacherNotes('');
    }
  };

  // Rumus RPP: (Total Skor Sikap / 8) * 100
  const totalSikap = gotongRoyong + bernalarKritis;
  const calculatedGrade = Math.round(((totalSikap / 8) * 100) * 10) / 10;

  const handleSaveGrade = async () => {
    if (!selectedGroupToGrade) return;

    await API.gradeGroup({
      groupId: selectedGroupToGrade.groupId,
      scoreGotongRoyong: gotongRoyong,
      scoreBernalarKritis: bernalarKritis,
      scoreHardwareDetail: hardwareDetail,
      scoreTeknis: teknisDetail,
      teacherNotes,
    });

    Alert.alert('Sukses', `Nilai akhir ${calculatedGrade} berhasil disimpan ke rapor kelompok!`);
    setSelectedGroupToGrade(null);
    loadSummary();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerWrapper}>
        <View style={[styles.header, isWide && styles.headerWide]}>
          <View>
            <Text style={styles.badge}>PORTAL PENGAMPU INFORMATIKA</Text>
            <Text style={styles.title}>Dashboard Guru</Text>
            <Text style={styles.teacherName}>Pengajar: {currentUser?.name || 'Guru Informatika'}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity style={styles.refreshBtn} onPress={loadSummary} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                logout();
                navigation.replace('RoleSelect');
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        <View style={isWide ? styles.contentWide : null}>
          {/* Class Insight Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Statistik Kelas X - Problem-Based Learning</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{groupsSummary.length}</Text>
                <Text style={styles.statLabel}>Kelompok PBL</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>
                  {groupsSummary.filter((g) => g.isGraded).length} / {groupsSummary.length}
                </Text>
                <Text style={styles.statLabel}>Tuntas Dinilai</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: COLORS.secondary }]}>100%</Text>
                <Text style={styles.statLabel}>Keaktifan</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Daftar Kelompok & Lembar Penilaian</Text>

          {/* Groups List */}
          {loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="sync" size={32} color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.loadingText}>Memuat rekapitulasi data kelompok...</Text>
            </View>
          ) : groupsSummary.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Belum Ada Data Kelompok</Text>
              <Text style={styles.emptySubtitle}>Tekan tombol di bawah untuk memuat data kelas X TJKT.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadSummary}>
                <Text style={styles.retryBtnText}>Muat Ulang Data</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {groupsSummary.map((grp) => (
                <View key={grp.groupId} style={styles.groupCard}>
                  <View style={styles.groupHeader}>
                    <View>
                      <Text style={styles.groupName}>{grp.groupName}</Text>
                      <Text style={styles.groupClass}>{grp.className} • {grp.totalMembers} Anggota</Text>
                    </View>


                {grp.finalScore ? (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{grp.finalScore}</Text>
                  </View>
                ) : (
                  <View style={[styles.scoreBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Text style={[styles.scoreBadgeText, { color: COLORS.warning }]}>Belum Dinilai</Text>
                  </View>
                )}
              </View>

              {/* Members */}
              <View style={styles.memberBox}>
                <Text style={styles.memberLabel}>Siswa Terdaftar:</Text>
                <Text style={styles.memberNames}>
                  {grp.members?.map((m) => `${m.name} (${m.rankTitle})`).join(', ') || 'Belum ada siswa login'}
                </Text>
              </View>

              {/* Submission Status */}
              <View style={styles.subStatusRow}>
                <Ionicons
                  name={grp.matrixSubmittedCount > 0 ? 'checkmark-circle' : 'time-outline'}
                  size={16}
                  color={grp.matrixSubmittedCount > 0 ? COLORS.secondary : COLORS.warning}
                />
                <Text style={styles.subStatusText}>
                  {grp.matrixSubmittedCount > 0
                    ? `${grp.matrixSubmittedCount} Rekomendasi Hardware Siap Dipresentasikan`
                    : 'Belum submit matriks kasus PBL'}
                </Text>
              </View>

              {/* Action Grade Button */}
              <TouchableOpacity
                style={styles.gradeBtn}
                onPress={() => openGradingModal(grp)}
              >
                <Ionicons name="clipboard-outline" size={16} color="#FFFFFF" />
                <Text style={styles.gradeBtnText}>
                  {grp.isGraded ? 'Edit Nilai Rubrik RPP' : 'Buka Rubrik Penilaian Presentasi'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        )}
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: RUBRIK PENILAIAN DIGITAL SESUAI RPP               */}
      {/* ======================================================== */}
      <Modal visible={!!selectedGroupToGrade} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.rubricHeader}>
              <Text style={styles.rubricBadge}>INSTRUMEN PENILAIAN RESMI RPP</Text>
              <Text style={styles.rubricTitle}>Penilaian: {selectedGroupToGrade?.groupName}</Text>
            </View>

            {/* 1. Gotong Royong */}
            <Text style={styles.criteriaTitle}>1. Sikap: Bergotong Royong (Kolaborasi Tim)</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.scorePill, gotongRoyong === s && styles.scorePillActive]}
                  onPress={() => setGotongRoyong(s)}
                >
                  <Text style={[styles.scorePillText, gotongRoyong === s && styles.scorePillTextActive]}>
                    Skor {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 2. Bernalar Kritis */}
            <Text style={styles.criteriaTitle}>2. Sikap: Bernalar Kritis (Analisis Masalah)</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.scorePill, bernalarKritis === s && styles.scorePillActive]}
                  onPress={() => setBernalarKritis(s)}
                >
                  <Text style={[styles.scorePillText, bernalarKritis === s && styles.scorePillTextActive]}>
                    Skor {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. Keteperincian Solusi Hardware */}
            <Text style={styles.criteriaTitle}>3. Unjuk Kerja: Keteperincian Solusi Hardware</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.scorePill, hardwareDetail === s && styles.scorePillActive]}
                  onPress={() => setHardwareDetail(s)}
                >
                  <Text style={[styles.scorePillText, hardwareDetail === s && styles.scorePillTextActive]}>
                    Skor {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rumus Otomatis RPP Card */}
            <View style={styles.rppFormulaBox}>
              <Text style={styles.rppFormulaLabel}>Kalkulasi Rumus RPP:</Text>
              <Text style={styles.rppFormulaText}>
                Nilai Akhir = (Total Skor {totalSikap} / 8) × 100
              </Text>
              <Text style={styles.rppGradeNumber}>{calculatedGrade}</Text>
            </View>

            {/* Catatan Guru */}
            <Text style={styles.criteriaTitle}>Catatan Ulasan Pengajar:</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Berikan masukan teknis untuk kelompok ini..."
              placeholderTextColor={COLORS.textMuted}
              value={teacherNotes}
              onChangeText={setTeacherNotes}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSelectedGroupToGrade(null)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveGradeBtn}
                onPress={handleSaveGrade}
              >
                <Text style={styles.saveGradeBtnText}>Simpan Nilai RPP</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  headerWrapper: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    width: '100%',
  },
  headerWide: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  scrollWide: {
    alignItems: 'center',
  },
  contentWide: {
    width: '100%',
    maxWidth: 900,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  teacherName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  refreshBtn: {
    padding: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },

  scroll: {
    padding: 18,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  groupCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  groupClass: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  memberBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: 10,
    borderRadius: 10,
  },
  memberLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  memberNames: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
  },
  subStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subStatusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  gradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  gradeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  rubricHeader: {
    marginBottom: 16,
  },
  rubricBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  rubricTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 2,
  },
  criteriaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 6,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scorePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  scorePillActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  scorePillTextActive: {
    color: '#FFFFFF',
  },
  rppFormulaBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  rppFormulaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  rppFormulaText: {
    fontSize: 12,
    color: COLORS.text,
    marginVertical: 4,
  },
  rppGradeNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  notesInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveGradeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  saveGradeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
