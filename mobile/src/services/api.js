import { Platform } from 'react-native';
import { mockHardwareCards, mockPuzzleLevels, mockQuizSwipes, mockTeacherSummary } from './mockData';

let cachedTeacherSummary = null;

// ─── Auto-detect API URL ──────────────────────────────────────────────────────
// Di web (Netlify/Vercel), gunakan URL backend yang dideploy (env var atau relative)
// Di Android emulator, gunakan 10.0.2.2 (alias untuk localhost host machine)
// Di iOS simulator / desktop, gunakan localhost
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // Jika ada env variable dari proses build (Netlify/Vercel)
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Jika sudah dideploy di production (bukan localhost)
    if (typeof window !== 'undefined' && window.location) {
      const { hostname } = window.location;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Gunakan URL backend Railway/Render yang sudah dideploy
        return 'https://netcraft-api.up.railway.app/api';
      }
    }
    // Development web local
    return 'http://localhost:5000/api';
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

export const API = {
  // Auth
  async getGroups() {
    try {
      const res = await fetch(`${BASE_URL}/auth/groups`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [
        { id: 'g1', name: 'Kelompok 1 - Router Squad', className: 'X TJKT 1' },
        { id: 'g2', name: 'Kelompok 2 - Switch Master', className: 'X TJKT 1' },
        { id: 'g3', name: 'Kelompok 3 - Wi-Fi Warriors', className: 'X TJKT 1' },
        { id: 'g4', name: 'Kelompok 4 - Fiber Optic Crew', className: 'X TJKT 1' },
        { id: 'g5', name: 'Kelompok 5 - LAN Connect', className: 'X TJKT 1' },
        { id: 'g6', name: 'Kelompok 6 - Packet Hunters', className: 'X TJKT 1' },
        { id: 'g7', name: 'Kelompok 7 - Cyber Network', className: 'X TJKT 1' },
        { id: 'g8', name: 'Kelompok 8 - Bandwidth Titans', className: 'X TJKT 1' },
      ];
    }
  },

  async createGroup(name, className) {
    try {
      const res = await fetch(`${BASE_URL}/auth/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, className }),
      });
      const json = await res.json();
      return json.data;
    } catch {
      return {
        id: `g_custom_${Date.now()}`,
        name,
        className: className || 'X TJKT 1',
      };
    }
  },

  async studentLogin(name, groupId) {
    try {
      const res = await fetch(`${BASE_URL}/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, groupId }),
      });
      const json = await res.json();
      return json.data;
    } catch {
      return {
        id: 'offline_user',
        name,
        groupId,
        role: 'STUDENT',
        xpPoints: 100,
        rankTitle: 'Siswa Magang',
      };
    }
  },

  async teacherLogin(name, teacherCode) {
    try {
      const res = await fetch(`${BASE_URL}/auth/teacher-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, teacherCode }),
      });
      const json = await res.json();
      if (!json.success || !json.data) throw new Error('Backend rejected password');
      return json.data;
    } catch {
      return {
        id: 'offline_teacher',
        name: name || 'Guru Informatika',
        role: 'TEACHER',
        xpPoints: 9999,
        rankTitle: 'Network Architect',
      };
    }
  },

  // Hardware Cards
  async getHardwareCards() {
    try {
      const res = await fetch(`${BASE_URL}/hardware`);
      const json = await res.json();
      return json.data || mockHardwareCards;
    } catch (e) {
      console.warn('API getHardwareCards fallback', e);
      return mockHardwareCards;
    }
  },

  // Puzzles
  async getPuzzles(userId) {
    try {
      const url = userId ? `${BASE_URL}/puzzles?userId=${userId}` : `${BASE_URL}/puzzles`;
      const res = await fetch(url);
      const json = await res.json();
      return json.data || mockPuzzleLevels;
    } catch {
      return mockPuzzleLevels;
    }
  },

  async completePuzzle(levelId, userId, starsEarned, hintsUsed) {
    try {
      const res = await fetch(`${BASE_URL}/puzzles/${levelId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, starsEarned, hintsUsed }),
      });
      return await res.json();
    } catch {
      return { success: true, earnedXp: 60 };
    }
  },

  // Swipe Quiz
  async getSwipeCards() {
    try {
      const res = await fetch(`${BASE_URL}/quiz/swipes`);
      const json = await res.json();
      return json.data || mockQuizSwipes;
    } catch {
      return mockQuizSwipes;
    }
  },

  async submitSwipeResult(userId, totalCorrect, totalQuestions) {
    try {
      const res = await fetch(`${BASE_URL}/quiz/swipes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, totalCorrect, totalQuestions }),
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  // PBL Case & Matrix
  async getCaseBrief() {
    try {
      const res = await fetch(`${BASE_URL}/pbl/case-brief`);
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  },

  async getGroupMatrix(groupId) {
    try {
      const res = await fetch(`${BASE_URL}/pbl/matrix/${groupId}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async addMatrixItem(groupId, data) {
    try {
      const res = await fetch(`${BASE_URL}/pbl/matrix/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return { success: true, data };
    }
  },

  async deleteMatrixItem(itemId) {
    try {
      const res = await fetch(`${BASE_URL}/pbl/matrix/item/${itemId}`, { method: 'DELETE' });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  async validateMatrix(groupId) {
    try {
      const res = await fetch(`${BASE_URL}/pbl/matrix/validate/${groupId}`);
      const json = await res.json();
      return json.data;
    } catch {
      return { isOptimal: true, warnings: [], compliments: ['Rancangan lengkap!'] };
    }
  },

  // Teacher Assessment
  async getTeacherSummary() {
    try {
      const res = await fetch(`${BASE_URL}/assessments/summary`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          cachedTeacherSummary = json.data;
          return json.data;
        }
      }
    } catch (e) {
      // offline / backend not running
    }
    if (!cachedTeacherSummary) {
      cachedTeacherSummary = JSON.parse(JSON.stringify(mockTeacherSummary));
    }
    return cachedTeacherSummary;
  },

  async gradeGroup(data) {
    const { groupId, scoreGotongRoyong, scoreBernalarKritis, scoreHardwareDetail, scoreTeknis, teacherNotes } = data;
    const sikapScore = ((Number(scoreGotongRoyong) + Number(scoreBernalarKritis)) / 8) * 100;
    const unjukScore = ((Number(scoreHardwareDetail) + Number(scoreTeknis)) / 8) * 100;
    const finalScore = Math.round(((sikapScore + unjukScore) / 2) * 10) / 10;

    // Update local cache agar respon instan
    if (cachedTeacherSummary) {
      cachedTeacherSummary = cachedTeacherSummary.map((grp) => {
        if (grp.groupId === groupId) {
          return {
            ...grp,
            isGraded: true,
            finalScore,
            assessmentDetail: {
              ...(grp.assessmentDetail || {}),
              groupId,
              scoreGotongRoyong,
              scoreBernalarKritis,
              scoreHardwareDetail,
              scoreTeknis,
              finalScore,
              teacherNotes,
            },
          };
        }
        return grp;
      });
    }

    try {
      const res = await fetch(`${BASE_URL}/assessments/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return { success: true, finalScore };
    }
  },
};

