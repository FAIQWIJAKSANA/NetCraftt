import React from 'react';
import { View, Platform } from 'react-native';
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

function StudentTabNavigator() {
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

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
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
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
