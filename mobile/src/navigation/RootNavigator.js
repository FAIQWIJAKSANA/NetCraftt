import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import HardwareDeckScreen from '../screens/HardwareDeckScreen';
import TinderQuizScreen from '../screens/TinderQuizScreen';
import NetFixLabScreen from '../screens/NetFixLabScreen';
import PuzzleGameScreen from '../screens/PuzzleGameScreen';
import PblCaseScreen from '../screens/PblCaseScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Student Tab Navigator ──────────────────────────────────────────────────────
function StudentTabNavigator() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > 768;

  if (isWide) {
    // ── Web Sidebar Layout ──────────────────────────────────────────────────────
    return (
      <Tab.Navigator
        tabBar={(props) => <WebSidebar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name="Beranda"
          component={StudentHomeScreen}
          options={{ tabBarLabel: 'Beranda', tabBarIcon: 'home-outline', tabBarIconActive: 'home' }}
        />
        <Tab.Screen
          name="HardwareDeck"
          component={HardwareDeckScreen}
          options={{ tabBarLabel: 'Hardware Deck', tabBarIcon: 'albums-outline', tabBarIconActive: 'albums' }}
        />
        <Tab.Screen
          name="TinderQuiz"
          component={TinderQuizScreen}
          options={{ tabBarLabel: 'Swipe Kuis', tabBarIcon: 'flame-outline', tabBarIconActive: 'flame' }}
        />
        <Tab.Screen
          name="NetFixLab"
          component={NetFixLabScreen}
          options={{ tabBarLabel: 'NetFix Lab', tabBarIcon: 'game-controller-outline', tabBarIconActive: 'game-controller' }}
        />
        <Tab.Screen
          name="MatriksPBL"
          component={PblCaseScreen}
          options={{ tabBarLabel: 'Matriks PBL', tabBarIcon: 'calculator-outline', tabBarIconActive: 'calculator' }}
        />
      </Tab.Navigator>
    );
  }

  // ── Mobile Bottom Tab Layout ────────────────────────────────────────────────
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceBorder,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Beranda') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'HardwareDeck') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'TinderQuiz') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'NetFixLab') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'MatriksPBL') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Beranda" component={StudentHomeScreen} options={{ tabBarLabel: 'Beranda' }} />
      <Tab.Screen name="HardwareDeck" component={HardwareDeckScreen} options={{ tabBarLabel: 'Hardware' }} />
      <Tab.Screen name="TinderQuiz" component={TinderQuizScreen} options={{ tabBarLabel: 'Swipe Kuis' }} />
      <Tab.Screen name="NetFixLab" component={NetFixLabScreen} options={{ tabBarLabel: 'NetFix Lab' }} />
      <Tab.Screen name="MatriksPBL" component={PblCaseScreen} options={{ tabBarLabel: 'Matriks PBL' }} />
    </Tab.Navigator>
  );
}

// ─── Web Sidebar Component ──────────────────────────────────────────────────────
function WebSidebar({ state, descriptors, navigation }) {
  const navItems = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel || route.name;
    const iconName = state.index === index ? options.tabBarIconActive : options.tabBarIcon;
    const isFocused = state.index === index;

    return (
      <TouchableOpacity
        key={route.key}
        style={[sidebarStyles.navItem, isFocused && sidebarStyles.navItemActive]}
        onPress={() => navigation.navigate(route.name)}
        activeOpacity={0.75}
      >
        <Ionicons name={iconName || 'ellipse-outline'} size={20} color={isFocused ? COLORS.primary : COLORS.textMuted} />
        <Text style={[sidebarStyles.navLabel, isFocused && sidebarStyles.navLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={sidebarStyles.sidebarContainer}>
      {/* Sidebar */}
      <View style={sidebarStyles.sidebar}>
        {/* Logo */}
        <View style={sidebarStyles.sidebarLogo}>
          <View style={sidebarStyles.logoIcon}>
            <Ionicons name="hardware-chip" size={22} color={COLORS.primary} />
          </View>
          <View>
            <Text style={sidebarStyles.logoTitle}>NetCraft</Text>
            <Text style={sidebarStyles.logoSub}>Hardware Lab</Text>
          </View>
        </View>

        {/* Nav Items */}
        <View style={sidebarStyles.navList}>
          {navItems}
        </View>

        {/* Footer Label */}
        <View style={sidebarStyles.sidebarFooter}>
          <Text style={sidebarStyles.footerText}>SMK Fase E • Informatika</Text>
          <Text style={sidebarStyles.footerSub}>Media Pembelajaran PBL</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={sidebarStyles.mainContent}>
        {state.routes.map((route, index) => {
          const { render } = descriptors[route.key];
          const isFocused = state.index === index;
          return (
            <View
              key={route.key}
              style={[sidebarStyles.screenView, { display: isFocused ? 'flex' : 'none' }]}
            >
              {render()}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Root Navigator ─────────────────────────────────────────────────────────────
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: Platform.OS === 'web' ? 'none' : 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
        <Stack.Screen
          name="PuzzleGame"
          component={PuzzleGameScreen}
          options={{
            animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Sidebar Styles ─────────────────────────────────────────────────────────────
const sidebarStyles = StyleSheet.create({
  sidebarContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  sidebar: {
    width: 220,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.surfaceBorder,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  sidebarLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  logoSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  navList: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sidebarFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  footerSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
    overflow: 'hidden',
  },
  screenView: {
    flex: 1,
  },
});
