import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [userRole, setUserRole] = useState('STUDENT'); // 'STUDENT' | 'TEACHER'
  
  const [xpPoints, setXpPoints] = useState(100);
  const [rankTitle, setRankTitle] = useState('Siswa Magang');
  const [completedLevels, setCompletedLevels] = useState([]);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [badges, setBadges] = useState(['Junior Troubleshooter']);

  // Auto-save progress ke LocalStorage ketika ada perubahan state
  useEffect(() => {
    if (userRole === 'STUDENT' && currentUser && Platform.OS === 'web') {
      try {
        const data = {
          xpPoints,
          rankTitle,
          completedLevels,
          unlockedLevels,
          badges,
        };
        localStorage.setItem(`progress_${currentUser.name}`, JSON.stringify(data));
      } catch(e) {}
    }
  }, [xpPoints, rankTitle, completedLevels, unlockedLevels, badges, currentUser, userRole]);

  const loginStudent = (user, group) => {
    setCurrentUser(user);
    setCurrentGroup(group);
    setUserRole('STUDENT');
    
    // Nilai Default
    let loadedXp = 100;
    let loadedRank = 'Siswa Magang';
    let loadedCompleted = [];
    let loadedUnlocked = [1];
    let loadedBadges = ['Junior Troubleshooter'];

    // Coba load progress dari LocalStorage (Berdasarkan nama siswa)
    if (Platform.OS === 'web') {
      try {
        const saved = localStorage.getItem(`progress_${user.name}`);
        if (saved) {
          const data = JSON.parse(saved);
          loadedXp = data.xpPoints ?? 100;
          loadedRank = data.rankTitle ?? 'Siswa Magang';
          loadedCompleted = data.completedLevels ?? [];
          loadedUnlocked = data.unlockedLevels ?? [1];
          loadedBadges = data.badges ?? ['Junior Troubleshooter'];
        }
      } catch(e) {}
    }

    setXpPoints(loadedXp);
    setRankTitle(loadedRank);
    setCompletedLevels(loadedCompleted);
    setUnlockedLevels(loadedUnlocked);
    setBadges(loadedBadges);
  };

  const loginTeacher = (teacher) => {
    setCurrentUser(teacher);
    setUserRole('TEACHER');
    setRankTitle('Network Architect');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentGroup(null);
    setUserRole('STUDENT');
  };

  const addXp = (amount, badgeTitle) => {
    setXpPoints((prev) => {
      const nextXp = prev + amount;
      if (nextXp >= 300) setRankTitle('Arsitek Jaringan Cilik');
      else if (nextXp >= 150) setRankTitle('Teknisi Kabel');
      return nextXp;
    });

    if (badgeTitle && !badges.includes(badgeTitle)) {
      setBadges((prev) => [...prev, badgeTitle]);
    }
  };

  const markLevelCompleted = (levelNum) => {
    setCompletedLevels((prev) => {
      if (!prev.includes(levelNum)) {
        return [...prev, levelNum];
      }
      return prev;
    });

    // Buka level berikutnya
    setUnlockedLevels((prev) => {
      const nextLvl = levelNum + 1;
      if (!prev.includes(nextLvl)) {
        return [...prev, nextLvl];
      }
      return prev;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentGroup,
        userRole,
        xpPoints,
        rankTitle,
        badges,
        completedLevels,
        unlockedLevels,
        loginStudent,
        loginTeacher,
        logout,
        addXp,
        markLevelCompleted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
