// ============================================================
// APP.TSX - Point d'entrée de l'application
// ============================================================
// Ce fichier est le premier exécuté. Il :
// 1. Initialise la base de données SQLite
// 2. Charge les paramètres sauvegardés
// 3. Affiche le splash screen pendant le chargement
// 4. Lance la navigation principale

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDatabase } from './src/database/database';
import { useAppStore } from './src/store/useAppStore';
import AppNavigation from './src/navigation/AppNavigation';
import { COULEURS, FONT_SIZE, FONT_WEIGHT } from './src/theme';
import { ThemeProvider } from './src/theme/ThemeContext';

// Empêcher le splash screen de disparaître automatiquement
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const { chargerMembres, chargerSessions, chargerParametres, parametres } = useAppStore();

  useEffect(() => {
    async function preparer() {
      try {
        // 1. Initialiser la base de données (créer les tables)
        initDatabase();

        // 2. Charger les données initiales
        chargerMembres();
        chargerSessions();
        chargerParametres();

        // 3. Simuler un léger délai pour voir le splash screen
        await new Promise((res) => setTimeout(res, 1500));
      } catch (e) {
        console.error('Erreur initialisation:', e);
      } finally {
        setAppReady(true);
      }
    }

    preparer();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashEmoji}>🎵</Text>
        <Text style={styles.splashTitre}>Choral App</Text>
        <Text style={styles.splashSousTitre}>Gestion de présences</Text>
        <View style={styles.chargement}>
          <View style={styles.chargementBarre} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <ThemeProvider>
        <StatusBar style={parametres.modeSombre ? 'light' : 'dark'} />
        <AppNavigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COULEURS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splashEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  splashTitre: {
    fontSize: 36,
    fontWeight: FONT_WEIGHT.black,
    color: COULEURS.white,
    letterSpacing: 1,
  },
  splashSousTitre: {
    fontSize: FONT_SIZE.lg,
    color: COULEURS.white + 'BB',
    fontWeight: FONT_WEIGHT.medium,
  },
  chargement: {
    width: 120,
    height: 4,
    backgroundColor: COULEURS.white + '30',
    borderRadius: 99,
    marginTop: 32,
    overflow: 'hidden',
  },
  chargementBarre: {
    width: '70%',
    height: '100%',
    backgroundColor: COULEURS.white,
    borderRadius: 99,
  },
});
