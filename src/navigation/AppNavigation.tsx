// ============================================================
// NAVIGATION - Bottom Tab + Stack
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../theme';
import { useThemeColors } from '../theme/ThemeContext';

// Écrans
import MembresList from '../screens/Members/MembresList';
import MembreForm from '../screens/Members/MembreForm';
import PresenceScreen from '../screens/Presence/PresenceScreen';
import StatsScreen from '../screens/Stats/StatsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const MembresStack = createStackNavigator();

// Stack pour l'onglet Membres (liste + formulaire + détail)
function MembresNavigator() {
  return (
    <MembresStack.Navigator screenOptions={{ headerShown: false }}>
      <MembresStack.Screen name="MembresList" component={MembresList} />
      <MembresStack.Screen name="MembreForm" component={MembreForm} />
    </MembresStack.Navigator>
  );
}

// Icônes d'onglet personnalisées
function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  const C = useThemeColors();
  return (
    <View
      style={[
        styles.tabIconCont,
        focused && [styles.tabIconContActive, { borderTopColor: C.primary }],
      ]}
    >
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? C.primary : C.textLight }]}>
        {label}
      </Text>
    </View>
  );
}

// Navigation principale
const TAB_BAR_BASE = 56;
const TAB_PADDING_EXTRA = 8;

export default function AppNavigation() {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const padBottom = TAB_PADDING_EXTRA + insets.bottom;
  const tabHeight = TAB_BAR_BASE + padBottom;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: C.card,
              paddingBottom: padBottom,
              height: tabHeight,
            },
          ],
        }}
      >
        <Tab.Screen
          name="Membres"
          component={MembresNavigator}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="👥" label="Membres" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Présences"
          component={PresenceScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📋" label="Présences" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Statistiques"
          component={StatsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📊" label="Stats" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Paramètres"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="⚙️" label="Réglages" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    paddingTop: 6,
    ...SHADOWS.md,
  },
  tabIconCont: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 2,
    minWidth: 70,
  },
  tabIconContActive: {
    borderTopWidth: 2,
    marginTop: -1,
  },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: FONT_WEIGHT.medium },
});
