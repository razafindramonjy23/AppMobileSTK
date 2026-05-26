// ============================================================
// ÉCRAN : GESTION DES PRÉSENCES
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAppStore } from '../../store/useAppStore';
import {
  AvatarMembre, BadgePupitre, Carte, TogglePresence, EtatVide
} from '../../components/common';
import { Membre, Pupitre } from '../../types';
import {
  SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS, PUPITRE_CONFIG, ThemeColors,
} from '../../theme';
import { useThemeColors } from '../../theme/ThemeContext';
import { exporterExcelPourDate } from '../../utils/export';

const PUPITRES: (Pupitre | 'tous')[] = ['tous', 'soprano', 'alto', 'tenor', 'basse'];

function createPresenceStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.sm,
      gap: SPACING.sm,
    },
    titre: { flex: 1, fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black, color: C.text },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
    btnHeader: {
      backgroundColor: C.primary + '15',
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    btnHeaderDisabled: { opacity: 0.55 },
    btnHeaderTxt: { fontSize: FONT_SIZE.sm, color: C.primary, fontWeight: FONT_WEIGHT.semibold },
    btnHeaderTxtSecondary: {
      fontSize: FONT_SIZE.sm,
      color: C.secondary,
      fontWeight: FONT_WEIGHT.semibold,
    },
    dateCarte: {
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      backgroundColor: C.primary,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      ...SHADOWS.md,
    },
    dateLabel: { fontSize: FONT_SIZE.sm, color: C.white + 'AA', fontWeight: FONT_WEIGHT.medium },
    dateValeur: {
      fontSize: FONT_SIZE.xl,
      fontWeight: FONT_WEIGHT.black,
      color: C.white,
      textTransform: 'capitalize',
      marginTop: 2,
    },
    dateSousTitre: { fontSize: FONT_SIZE.xs, color: C.white + '88', marginTop: 4 },
    statsJour: {
      flexDirection: 'row',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: 10,
    },
    statVal: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black },
    statLbl: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, marginTop: 2 },
    actionsRapides: {
      flexDirection: 'row',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
    },
    btnRapide: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: 1.5,
      alignItems: 'center',
    },
    btnRapideTxt: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold },
    listeFlat: { flex: 1 },
    liste: {
      flexGrow: 1,
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.xl,
      gap: 10,
    },
    carteMembre: { padding: SPACING.md },
    carteMPresent: { borderLeftWidth: 4, borderLeftColor: C.success },
    carteMAbsent: { borderLeftWidth: 4, borderLeftColor: C.border },
    rangeeMembre: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    infoMembre: { flex: 1, gap: 4 },
    nomMembre: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: C.text },
    statusCont: { alignItems: 'center', gap: 4 },
    statusTxt: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold },
    filtres: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.md,
      gap: 8,
      marginBottom: SPACING.sm,
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: BORDER_RADIUS.full,
      borderWidth: 1.5,
      borderColor: C.border,
      backgroundColor: C.card,
    },
    chipTxt: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: C.textSecondary },
    offrandeBloc: {
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: C.card,
      borderWidth: 1.5,
      borderColor: C.border,
      ...SHADOWS.sm,
    },
    offrandeLabel: {
      fontSize: FONT_SIZE.sm,
      fontWeight: FONT_WEIGHT.semibold,
      color: C.textSecondary,
      marginBottom: 6,
    },
    offrandeRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: SPACING.sm,
    },
    offrandeInput: {
      flex: 1,
      minWidth: 0,
      fontSize: FONT_SIZE.xl,
      fontWeight: FONT_WEIGHT.bold,
      color: C.text,
      paddingVertical: SPACING.sm,
      borderBottomWidth: 2,
      borderBottomColor: C.primary,
    },
    btnOffrande: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 10,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: C.primary,
      justifyContent: 'center',
    },
    btnOffrandeTxt: {
      fontSize: FONT_SIZE.sm,
      fontWeight: FONT_WEIGHT.bold,
      color: C.white,
    },
  });
}

export default function PresenceScreen() {
  const {
    membres, presencesSession, dateSelectionnee, sessions,
    chargerMembres, chargerSessions, selectionnerDate, marquerPresence, ajouterSession,
    setOffrandeSession,
  } = useAppStore();

  const C = useThemeColors();
  const modeSombre = useAppStore((s) => s.parametres.modeSombre);
  const styles = useMemo(() => createPresenceStyles(C), [C]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filtrePupitre, setFiltrePupitre] = useState<Pupitre | 'tous'>('tous');
  const [texteOffrande, setTexteOffrande] = useState('');

  const dateSelectionneeObj = useMemo(() => {
    // Important: éviter `new Date("YYYY-MM-DD")` qui n'est pas interprété
    // de façon identique entre plateformes (décalages de jour possibles).
    const d = parse(dateSelectionnee, 'yyyy-MM-dd', new Date());
    d.setHours(12, 0, 0, 0);
    return d;
  }, [dateSelectionnee]);

  const sessionDuJour = useMemo(
    () => sessions.find((s) => s.date === dateSelectionnee),
    [sessions, dateSelectionnee]
  );

  useEffect(() => {
    chargerMembres();
    chargerSessions();
    selectionnerDate(dateSelectionnee);
  }, []);

  useEffect(() => {
    const m = sessionDuJour?.offrande;
    if (m != null && m !== 0) setTexteOffrande(String(m));
    else setTexteOffrande('');
  }, [dateSelectionnee, sessionDuJour?.offrande]);

  function enregistrerOffrande() {
    const normalise = texteOffrande.replace(/\s/g, '').replace(',', '.');
    if (normalise === '') {
      setOffrandeSession(dateSelectionnee, 0);
      return;
    }
    const n = Number(normalise);
    if (Number.isNaN(n) || n < 0) {
      Alert.alert('Montant invalide', 'Indiquez un nombre positif ou vide pour 0.');
      return;
    }
    setOffrandeSession(dateSelectionnee, n);
  }

  function changerDate(date: Date) {
    setShowDatePicker(false);
    const dateStr = format(date, 'yyyy-MM-dd');
    selectionnerDate(dateStr);
    // Créer la session si elle n'existe pas
    ajouterSession(dateStr);
  }

  async function exporterJour() {
    setExportLoading(true);
    try {
      await exporterExcelPourDate(dateSelectionnee);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'exporter cette date.');
    } finally {
      setExportLoading(false);
    }
  }

  const membresFiltres = useMemo(() => {
    if (filtrePupitre === 'tous') return membres;
    return membres.filter((m) => m.pupitre === filtrePupitre);
  }, [membres, filtrePupitre]);
  
  const statsJour = useMemo(() => {
    const total = membresFiltres.length;
    const presents = membresFiltres.filter((m) =>
      presencesSession.some((p) => p.membreId === m.id && p.present)
    ).length;
    const absents = total - presents;
    const taux = total > 0 ? Math.round((presents / total) * 100) : 0;
    return { total, presents, absents, taux };
  }, [membresFiltres, presencesSession]);

  function toggleTous(present: boolean) {
    const cible = filtresVersLibelle();
    Alert.alert(
      present ? 'Marquer présents ?' : 'Marquer absents ?',
      present
        ? `Marquer comme présents : ${membresFiltres.length} choriste(s) (${cible}).`
        : `Marquer comme absents : ${membresFiltres.length} choriste(s) (${cible}).`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            membresFiltres.forEach((m) =>
              marquerPresence(m.id, dateSelectionnee, present)
            );
          },
        },
      ]
    );
  }
  
  function filtresVersLibelle() {
    if (filtrePupitre === 'tous') return 'tous pupitres';
    return PUPITRE_CONFIG[filtrePupitre].label;
  }

  function estPresent(membreId: number): boolean {
    const p = presencesSession.find((p) => p.membreId === membreId);
    return p?.present ?? false;
  }

  function togglePresence(membreId: number) {
    const actuel = estPresent(membreId);
    marquerPresence(membreId, dateSelectionnee, !actuel);
  }

  const dateAffichee = useMemo(() => {
    try {
      return format(dateSelectionneeObj, 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return dateSelectionnee;
    }
  }, [dateSelectionnee, dateSelectionneeObj]);

  const renderMembre = ({ item }: { item: Membre }) => {
    const present = estPresent(item.id);
    return (
      <Carte style={StyleSheet.flatten([styles.carteMembre, present ? styles.carteMPresent : styles.carteMAbsent])}>
        <View style={styles.rangeeMembre}>
          <AvatarMembre prenom={item.prenom} nom={item.nom} pupitre={item.pupitre} taille={44} />
          <View style={styles.infoMembre}>
            <Text style={styles.nomMembre}>{item.prenom} {item.nom}</Text>
            <BadgePupitre pupitre={item.pupitre} />
          </View>
          <View style={styles.statusCont}>
            <Text style={[styles.statusTxt, { color: present ? C.success : C.textLight }]}>
              {present ? 'Présent·e' : 'Absent·e'}
            </Text>
            <TogglePresence present={present} onToggle={() => togglePresence(item.id)} />
          </View>
        </View>
      </Carte>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={modeSombre ? 'light-content' : 'dark-content'}
        backgroundColor={C.background}
      />

      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.titre}>Présences</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.btnHeader, exportLoading && styles.btnHeaderDisabled]}
            onPress={exporterJour}
            disabled={exportLoading || membres.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.btnHeaderTxtSecondary}>
              {exportLoading ? '⏳' : '📤'} Export
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnHeader}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnHeaderTxt}>📅 Date</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date sélectionnée */}
      <TouchableOpacity
        style={styles.dateCarte}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.dateLabel}>Session du</Text>
        <Text style={styles.dateValeur}>{dateAffichee}</Text>
        <Text style={styles.dateSousTitre}>Appuyez pour changer ›</Text>
      </TouchableOpacity>

      <View style={styles.offrandeBloc}>
        <Text style={styles.offrandeLabel}>Offrande du jour (Ar)</Text>
        <View style={styles.offrandeRow}>
          <TextInput
            style={styles.offrandeInput}
            value={texteOffrande}
            onChangeText={setTexteOffrande}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={C.textLight}
            returnKeyType="done"
            onSubmitEditing={() => {
              Keyboard.dismiss();
              enregistrerOffrande();
            }}
            onEndEditing={enregistrerOffrande}
            blurOnSubmit
          />
          <TouchableOpacity
            style={styles.btnOffrande}
            onPress={() => {
              Keyboard.dismiss();
              enregistrerOffrande();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.btnOffrandeTxt}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtre pupitre (stats et liste ci-dessous = même sous-ensemble) */}
      <View style={styles.filtres}>
        {PUPITRES.map((p) => {
          const actif = filtrePupitre === p;
          const couleur = p === 'tous' ? C.primary : PUPITRE_CONFIG[p].couleur;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.chip, actif && { backgroundColor: couleur, borderColor: couleur }]}
              onPress={() => setFiltrePupitre(p)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTxt, actif && { color: C.white }]}>
                {p === 'tous' ? 'Tous' : PUPITRE_CONFIG[p].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Statistiques du jour (pupitre sélectionné ou tous) */}
      <View style={styles.statsJour}>
        <View style={[styles.statItem, { backgroundColor: C.success + '15' }]}>
          <Text style={[styles.statVal, { color: C.success }]}>{statsJour.presents}</Text>
          <Text style={[styles.statLbl, { color: C.success }]}>Présents</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: C.error + '12' }]}>
          <Text style={[styles.statVal, { color: C.error }]}>{statsJour.absents}</Text>
          <Text style={[styles.statLbl, { color: C.error }]}>Absents</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: C.primary + '12' }]}>
          <Text style={[styles.statVal, { color: C.primary }]}>{statsJour.taux}%</Text>
          <Text style={[styles.statLbl, { color: C.primary }]}>Taux</Text>
        </View>
      </View>

      {/* Boutons rapides (uniquement sur le groupe filtré) */}
      {membresFiltres.length > 0 && (
        <View style={styles.actionsRapides}>
          <TouchableOpacity
            style={[styles.btnRapide, { backgroundColor: C.success + '15', borderColor: C.success }]}
            onPress={() => toggleTous(true)}
          >
            <Text style={[styles.btnRapideTxt, { color: C.success }]}>✓ Tous présents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnRapide, { backgroundColor: C.error + '10', borderColor: C.border }]}
            onPress={() => toggleTous(false)}
          >
            <Text style={[styles.btnRapideTxt, { color: C.textSecondary }]}>✗ Tous absents</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des membres */}
      <FlatList
        style={styles.listeFlat}
        data={membresFiltres}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMembre}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EtatVide
            message={
              membres.length === 0
                ? 'Aucun membre'
                : 'Aucun membre dans ce pupitre'
            }
            sousTitre={
              membres.length === 0
                ? 'Ajoutez des choristes dans l’onglet Membres'
                : 'Choisissez un autre pupitre ou affichez « Tous »'
            }
            icone="🎵"
          />
        }
      />

      {/* Sélecteur de date */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={dateSelectionneeObj}
        onConfirm={changerDate}
        onCancel={() => setShowDatePicker(false)}
        locale="fr_FR"
        confirmTextIOS="Confirmer"
        cancelTextIOS="Annuler"
      />
    </SafeAreaView>
  );
}
