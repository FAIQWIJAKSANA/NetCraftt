import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { API } from '../services/api';
import { useApp } from '../context/AppContext';

export default function RoleSelectScreen({ navigation }) {
  const { loginStudent, loginTeacher } = useApp();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > 700;
  const [roleTab, setRoleTab] = useState('STUDENT'); // 'STUDENT' | 'TEACHER'

  // Form State
  const [studentName, setStudentName] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Modal Tambah Kelompok Baru
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupClass, setNewGroupClass] = useState('X TJKT 1');

  const [teacherName, setTeacherName] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const list = await API.getGroups();
    setGroups(list);
    if (list.length > 0) setSelectedGroup(list[0]);
  };

  const handleCreateNewGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Perhatian', 'Nama kelompok tidak boleh kosong!');
      return;
    }

    const created = await API.createGroup(newGroupName.trim(), newGroupClass.trim());
    if (created) {
      const updatedList = await API.getGroups();
      setGroups(updatedList);
      setSelectedGroup(created);
      setShowAddGroupModal(false);
      setNewGroupName('');
      Alert.alert('Berhasil', `Kelompok "${created.name}" berhasil ditambahkan dan dipilih!`);
    }
  };

  const handleStudentLogin = async () => {
    if (!studentName.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan nama lengkap atau panggilan Anda!');
      return;
    }
    if (!selectedGroup) {
      Alert.alert('Perhatian', 'Silakan pilih kelompok belajar Anda!');
      return;
    }

    setLoading(true);
    const user = await API.studentLogin(studentName.trim(), selectedGroup.id);
    loginStudent(user, selectedGroup);
    setLoading(false);
    navigation.replace('StudentTabs');
  };

  const handleTeacherLogin = async () => {
    if (teacherCode.trim().toLowerCase() !== 'kemakom') {
      Alert.alert('Akses Ditolak', 'Kode akses pengajar salah!');
      return;
    }

    setLoading(true);
    const teacher = await API.teacherLogin(teacherName.trim() || 'Pak/Bu Guru Informatika', teacherCode.trim());
    setLoading(false);

    if (teacher) {
      loginTeacher(teacher);
      navigation.replace('TeacherDashboard');
    } else {
      Alert.alert('Gagal Masuk', 'Kesalahan server saat memverifikasi pengajar.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        <View style={isWide ? styles.contentWide : null}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>AUTENTIKASI KELAS X</Text>
          <Text style={styles.title}>Selamat Datang!</Text>
          <Text style={styles.subtitle}>Pilih peran Anda untuk memulai pembelajaran</Text>
        </View>

        {/* Role Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, roleTab === 'STUDENT' && styles.toggleBtnActive]}
            onPress={() => setRoleTab('STUDENT')}
          >
            <Ionicons
              name="school-outline"
              size={18}
              color={roleTab === 'STUDENT' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.toggleText, roleTab === 'STUDENT' && styles.toggleTextActive]}>
              Siswa Kelas X
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, roleTab === 'TEACHER' && styles.toggleBtnActive]}
            onPress={() => setRoleTab('TEACHER')}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={roleTab === 'TEACHER' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.toggleText, roleTab === 'TEACHER' && styles.toggleTextActive]}>
              Guru Pengajar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Student Form */}
        {roleTab === 'STUDENT' ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="sparkles" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Profil Siswa Baru</Text>
            </View>

            <Text style={styles.label}>Nama Panggilan / Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Faiq Wijaksana"
              placeholderTextColor={COLORS.textMuted}
              value={studentName}
              onChangeText={setStudentName}
            />

            <View style={styles.groupLabelRow}>
              <Text style={styles.label}>Pilih Kelompok Belajar ({groups.length} Tersedia)</Text>
              <TouchableOpacity
                style={styles.addGroupBtn}
                onPress={() => setShowAddGroupModal(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.addGroupBtnText}>+ Tambah Manual</Text>
              </TouchableOpacity>
            </View>

            {/* Grid 8 Kelompok */}
            <View style={styles.groupGrid}>
              {groups.map((grp) => {
                const isSelected = selectedGroup?.id === grp.id;
                return (
                  <TouchableOpacity
                    key={grp.id}
                    style={[styles.groupCard, isSelected && styles.groupCardSelected]}
                    onPress={() => setSelectedGroup(grp)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? COLORS.primary : COLORS.textMuted}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.groupName, isSelected && styles.groupNameSelected]}>
                        {grp.name}
                      </Text>
                      <Text style={styles.groupClass}>{grp.className}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.8}
              onPress={handleStudentLogin}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Menyiapkan Lab...' : 'Masuk ke Ruang Lab'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Teacher Form */
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
              <Text style={styles.cardTitle}>Akses Pengajar / Guru</Text>
            </View>

            <Text style={styles.label}>Nama Pengajar</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Pak Guru Informatika"
              placeholderTextColor={COLORS.textMuted}
              value={teacherName}
              onChangeText={setTeacherName}
            />

            <Text style={styles.label}>Kode Verifikasi Pengajar</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan kode rahasia pengajar"
              placeholderTextColor={COLORS.textMuted}
              value={teacherCode}
              onChangeText={setTeacherCode}
              secureTextEntry
            />
            <Text style={styles.helperText}>*Kode ini bersifat rahasia dan khusus untuk guru</Text>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: COLORS.secondary }]}
              activeOpacity={0.8}
              onPress={handleTeacherLogin}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Memeriksa...' : 'Buka Dashboard Penilaian'}
              </Text>
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
        </View>
      </ScrollView>

      {/* Modal Tambah Kelompok Manual */}
      <Modal visible={showAddGroupModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="people-outline" size={24} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Tambah Kelompok Baru</Text>
            </View>

            <Text style={styles.label}>Nama Kelompok</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Kelompok 9 - LAN Expert"
              placeholderTextColor={COLORS.textMuted}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />

            <Text style={styles.label}>Nama Kelas</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: X TJKT 1"
              placeholderTextColor={COLORS.textMuted}
              value={newGroupClass}
              onChangeText={setNewGroupClass}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddGroupModal(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleCreateNewGroup}
              >
                <Text style={styles.modalSaveText}>Simpan Kelompok</Text>
              </TouchableOpacity>
            </View>
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
  scroll: {
    padding: 24,
  },
  scrollWide: {
    alignItems: 'center',
  },
  contentWide: {
    width: '100%',
    maxWidth: 560,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  badge: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  groupLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addGroupBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 16,
  },
  groupGrid: {
    gap: 10,
    marginBottom: 20,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  groupCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  groupName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  groupNameSelected: {
    color: COLORS.text,
  },
  groupClass: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
