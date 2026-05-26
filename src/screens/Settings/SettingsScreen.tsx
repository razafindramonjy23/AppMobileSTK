// ============================================================
// ÉCRAN : PARAMÈTRES
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../store/useAppStore';
import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ThemeColors } from '../../theme';
import { useThemeColors } from '../../theme/ThemeContext';
import { Bouton, Carte } from '../../components/common';
import { exporterExcel } from '../../utils/export';

function LigneSetting({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  const C = useThemeColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: C.borderLight,
      }}
    >
      <View style={{ flex: 1, marginRight: SPACING.sm }}>
        <Text style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: C.text }}>{label}</Text>
        {description && (
          <Text style={{ fontSize: FONT_SIZE.xs, color: C.textSecondary, marginTop: 2 }}>{description}</Text>
        )}
      </View>
      {children}
    </View>
  );
}

function createSettingsStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    scroll: { paddingBottom: SPACING.xxl },
    titre: {
      fontSize: FONT_SIZE.xxl,
      fontWeight: FONT_WEIGHT.black,
      color: C.text,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      marginBottom: SPACING.md,
    },
    section: { marginHorizontal: SPACING.md, marginBottom: SPACING.md },
    sectionTitre: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: C.text, marginBottom: SPACING.md },
    logoSection: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
    logoCont: { position: 'relative' },
    logoImg: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: C.primary },
    logoPlaceholder: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: C.primary + '15',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: C.primary,
      borderStyle: 'dashed',
    },
    logoPlaceholderTxt: { fontSize: 28 },
    logoBadge: {
      position: 'absolute', bottom: 0, right: 0,
      backgroundColor: C.primary,
      width: 24, height: 24, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    logoBadgeTxt: { fontSize: 12 },
    logoInfo: { flex: 1 },
    logoTitre: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: C.text },
    logoDesc: { fontSize: FONT_SIZE.xs, color: C.textSecondary, marginTop: 4 },
    logoSuppr: { fontSize: FONT_SIZE.sm, color: C.error, marginTop: 6 },
    champNom: { marginBottom: SPACING.md },
    champLabel: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: C.text, marginBottom: 6 },
    input: {
      backgroundColor: C.surface,
      borderWidth: 1.5,
      borderColor: C.border,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: 12,
      fontSize: FONT_SIZE.md,
      color: C.text,
    },
    exportDesc: { fontSize: FONT_SIZE.sm, color: C.textSecondary, lineHeight: 20 },
    aboutRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: C.borderLight,
    },
    aboutLabel: { fontSize: FONT_SIZE.sm, color: C.textSecondary },
    aboutVal: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: C.text },
    credits: {
      textAlign: 'center',
      fontSize: FONT_SIZE.xs,
      color: C.textLight,
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.md,
    },
  });
}

export default function SettingsScreen() {
  const { parametres, chargerParametres, mettreAJourParametres } = useAppStore();
  const C = useThemeColors();
  const styles = useMemo(() => createSettingsStyles(C), [C]);
  const [nomChoral, setNomChoral] = useState('');
  const [modeSombre, setModeSombre] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    chargerParametres();
  }, []);

  useEffect(() => {
    setNomChoral(parametres.nomChoral);
    setModeSombre(parametres.modeSombre);
  }, [parametres]);

  async function choisirLogo() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à votre galerie.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      mettreAJourParametres({ logo: result.assets[0].uri });
    }
  }

  function sauvegarder() {
    mettreAJourParametres({ nomChoral, modeSombre });
    setModified(false);
    Alert.alert('✓ Sauvegardé', 'Les paramètres ont été mis à jour.');
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      await exporterExcel();
    } catch {
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={parametres.modeSombre ? 'light-content' : 'dark-content'}
        backgroundColor={C.background}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.titre}>Paramètres</Text>

        {/* Section : Personnalisation */}
        <Carte style={styles.section}>
          <Text style={styles.sectionTitre}>🎨 Personnalisation</Text>

          {/* Logo */}
          <View style={styles.logoSection}>
            <TouchableOpacity style={styles.logoCont} onPress={choisirLogo} activeOpacity={0.85}>
              {parametres.logo ? (
                <Image source={{ uri: parametres.logo }} style={styles.logoImg} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderTxt}>🎵</Text>
                </View>
              )}
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeTxt}>📷</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.logoInfo}>
              <Text style={styles.logoTitre}>Logo du choral</Text>
              <Text style={styles.logoDesc}>Appuyez pour choisir une image depuis votre galerie</Text>
              {parametres.logo && (
                <TouchableOpacity onPress={() => mettreAJourParametres({ logo: undefined })}>
                  <Text style={styles.logoSuppr}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Nom du choral */}
          <View style={styles.champNom}>
            <Text style={styles.champLabel}>Nom du choral</Text>
            <TextInput
              style={styles.input}
              value={nomChoral}
              onChangeText={(v) => { setNomChoral(v); setModified(true); }}
              placeholder="ex: Choral de la Cathédrale"
              placeholderTextColor={C.textLight}
            />
          </View>

          {/* Mode sombre */}
          <LigneSetting
            label="Mode sombre"
            description="Thème sombre pour l'interface"
          >
            <Switch
              value={modeSombre}
              onValueChange={(v) => { setModeSombre(v); setModified(true); }}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor={C.white}
            />
          </LigneSetting>

          {modified && (
            <Bouton
              label="💾 Sauvegarder les modifications"
              onPress={sauvegarder}
              style={{ marginTop: SPACING.md }}
            />
          )}
        </Carte>

        {/* Section : Export */}
        <Carte style={styles.section}>
          <Text style={styles.sectionTitre}>📤 Export des données</Text>
          <Text style={styles.exportDesc}>
            Exportez toutes les données (membres, présences, statistiques) dans un fichier Excel (.xlsx).
          </Text>
          <Bouton
            label={exportLoading ? 'Génération...' : '📊 Exporter en Excel'}
            variante="secondary"
            onPress={handleExport}
            loading={exportLoading}
            style={{ marginTop: SPACING.md }}
          />
        </Carte>

        {/* Section : À propos */}
        <Carte style={styles.section}>
          <Text style={styles.sectionTitre}>ℹ️ À propos</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Application</Text>
            <Text style={styles.aboutVal}>Gestion Choral</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutVal}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Développé avec</Text>
            <Text style={styles.aboutVal}>React Native + Expo</Text>
          </View>
          <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.aboutLabel}>Base de données</Text>
            <Text style={styles.aboutVal}>SQLite (local)</Text>
          </View>
        </Carte>

        {/* Crédits */}
        <Text style={styles.credits}>
          Toutes vos données sont stockées localement sur votre appareil 🔒
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}
