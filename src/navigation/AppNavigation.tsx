// ============================================================
// NAVIGATION - Bottom Tab + Stack
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { COULEURS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../theme';

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
  couleur,
}: {
  emoji: string;
  label: string;
  focused: boolean;
  couleur?: string;
}) {
  return (
    <View style={[styles.tabIconCont, focused && styles.tabIconContActive]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? COULEURS.primary : COULEURS.textLight }]}>
        {label}
      </Text>
    </View>
  );
}

// Navigation principale
export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
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
    backgroundColor: COULEURS.card,
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 8,
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
    borderTopColor: COULEURS.primary,
    marginTop: -1,
  },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: FONT_WEIGHT.medium },
});
