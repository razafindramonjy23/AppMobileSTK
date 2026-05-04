// ============================================================
// ÉCRAN : FORMULAIRE MEMBRE (Ajout / Modification)
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Pupitre } from '../../types';
import { COULEURS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS, PUPITRE_CONFIG } from '../../theme';
import { Bouton } from '../../components/common';
import * as DB from '../../database/database';

const PUPITRES: Pupitre[] = ['soprano', 'alto', 'tenor', 'basse'];

interface ChampProps {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'default' | 'phone-pad' | 'email-address';
  obligatoire?: boolean;
  erreur?: string;
}

function Champ({ label, valeur, onChange, placeholder, type = 'default', obligatoire, erreur }: ChampProps) {
  return (
    <View style={stylesChamp.container}>
      <Text style={stylesChamp.label}>
        {label} {obligatoire && <Text style={stylesChamp.obligatoire}>*</Text>}
      </Text>
      <TextInput
        style={[stylesChamp.input, erreur ? stylesChamp.inputErreur : null]}
        value={valeur}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COULEURS.textLight}
        keyboardType={type}
        autoCapitalize={type === 'default' ? 'words' : 'none'}
      />
      {erreur ? <Text style={stylesChamp.erreur}>{erreur}</Text> : null}
    </View>
  );
}

const stylesChamp = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COULEURS.text, marginBottom: 6 },
  obligatoire: { color: COULEURS.error },
  input: {
    backgroundColor: COULEURS.card,
    borderWidth: 1.5,
    borderColor: COULEURS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: FONT_SIZE.md,
    color: COULEURS.text,
  },
  inputErreur: { borderColor: COULEURS.error },
  erreur: { color: COULEURS.error, fontSize: FONT_SIZE.xs, marginTop: 4 },
});

export default function MembreForm() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { ajouterMembre, modifierMembre } = useAppStore();

  const membreId: number | undefined = route.params?.membreId;
  const isModif = Boolean(membreId);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [pupitre, setPupitre] = useState<Pupitre>('soprano');
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Charger le membre si modification
  useEffect(() => {
    if (membreId) {
      const m = DB.getMembreById(membreId);
      if (m) {
        setPrenom(m.prenom);
        setNom(m.nom);
        setTelephone(m.telephone);
        setPupitre(m.pupitre);
      }
    }
  }, [membreId]);

  function valider(): boolean {
    const nouvellesErreurs: Record<string, string> = {};
    if (!prenom.trim()) nouvellesErreurs.prenom = 'Le prénom est obligatoire';
    if (!nom.trim()) nouvellesErreurs.nom = 'Le nom est obligatoire';
    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  }

  async function sauvegarder() {
    if (!valider()) return;
    setLoading(true);

    try {
      const data = {
        prenom: prenom.trim(),
        nom: nom.trim(),
        telephone: telephone.trim(),
        pupitre,
        dateAjout: new Date().toISOString(),
      };

      if (isModif && membreId) {
        modifierMembre(membreId, data);
      } else {
        ajouterMembre(data);
      }

      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le membre.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
       <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* En-tête */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnRetour}>
              <Text style={styles.btnRetourTxt}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.titre}>{isModif ? 'Modifier le membre' : 'Nouveau membre'}</Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <Champ
              label="Prénom"
              valeur={prenom}
              onChange={setPrenom}
              placeholder="ex: Marie"
              obligatoire
              erreur={erreurs.prenom}
            />
            <Champ
              label="Nom"
              valeur={nom}
              onChange={setNom}
              placeholder="ex: Dupont"
              obligatoire
              erreur={erreurs.nom}
            />
            <Champ
              label="Téléphone"
              valeur={telephone}
              onChange={setTelephone}
              placeholder="ex: +261 34 00 000 00"
              type="phone-pad"
            />

            {/* Sélection Pupitre */}
            <View style={styles.pupitreSection}>
              <Text style={styles.pupitreLabel}>Pupitre <Text style={{ color: COULEURS.error }}>*</Text></Text>
              <View style={styles.pupitreGrid}>
                {PUPITRES.map((p) => {
                  const config = PUPITRE_CONFIG[p];
                  const actif = pupitre === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.pupitreBtn,
                        actif && { backgroundColor: config.couleur, borderColor: config.couleur },
                        !actif && { borderColor: config.couleur + '60' },
                      ]}
                      onPress={() => setPupitre(p)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pupitreEmoji}>
                        {p === 'soprano' ? '🎶' : p === 'alto' ? '🎵' : p === 'tenor' ? '🎼' : '🎸'}
                      </Text>
                      <Text style={[
                        styles.pupitreBtnTxt,
                        { color: actif ? COULEURS.white : config.couleur },
                      ]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Boutons */}
          <View style={styles.boutons}>
            <Bouton
              label="Annuler"
              variante="outline"
              onPress={() => navigation.goBack()}
              style={{ flex: 1 }}
            />
            <Bouton
              label={isModif ? '✓ Sauvegarder' : '+ Ajouter'}
              onPress={sauvegarder}
              loading={loading}
              style={{ flex: 2 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COULEURS.background },
  scroll: { paddingBottom: SPACING.xxl },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  btnRetour: { marginBottom: SPACING.sm },
  btnRetourTxt: { fontSize: FONT_SIZE.md, color: COULEURS.primary, fontWeight: FONT_WEIGHT.medium },
  titre: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black, color: COULEURS.text },

  form: { paddingHorizontal: SPACING.md },

  pupitreSection: { marginBottom: SPACING.md },
  pupitreLabel: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COULEURS.text, marginBottom: 10 },
  pupitreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pupitreBtn: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    backgroundColor: COULEURS.card,
    ...SHADOWS.sm,
  },
  pupitreEmoji: { fontSize: 20 },
  pupitreBtnTxt: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },

  boutons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
});
