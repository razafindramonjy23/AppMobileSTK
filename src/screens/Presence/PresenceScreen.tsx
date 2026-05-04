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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAppStore } from '../../store/useAppStore';
import { Membre } from '../../types';
import {
  COULEURS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS
} from '../../theme';
import {
  AvatarMembre, BadgePupitre, Carte, TogglePresence, EtatVide
} from '../../components/common';

export default function PresenceScreen() {
  const {
    membres, presencesSession, dateSelectionnee,
    chargerMembres, selectionnerDate, marquerPresence, ajouterSession,
  } = useAppStore();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateSelectionneeObj = useMemo(() => {
    // Important: éviter `new Date("YYYY-MM-DD")` qui n'est pas interprété
    // de façon identique entre plateformes (décalages de jour possibles).
    const d = parse(dateSelectionnee, 'yyyy-MM-dd', new Date());
    d.setHours(12, 0, 0, 0);
    return d;
  }, [dateSelectionnee]);

  useEffect(() => {
    chargerMembres();
    selectionnerDate(dateSelectionnee);
  }, []);

  // Calculer les statistiques du jour
  const statsJour = useMemo(() => {
    const total = membres.length;
    const presents = presencesSession.filter((p) => p.present).length;
    const absents = total - presents;
    const taux = total > 0 ? Math.round((presents / total) * 100) : 0;
    return { total, presents, absents, taux };
  }, [membres, presencesSession]);

  function changerDate(date: Date) {
    setShowDatePicker(false);
    const dateStr = format(date, 'yyyy-MM-dd');
    selectionnerDate(dateStr);
    // Créer la session si elle n'existe pas
    ajouterSession(dateStr);
  }

  function toggleTous(present: boolean) {
    Alert.alert(
      present ? 'Marquer tous présents ?' : 'Marquer tous absents ?',
      `Cela va mettre à jour la présence de tous les membres.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            membres.forEach((m) => marquerPresence(m.id, dateSelectionnee, present));
          },
        },
      ]
    );
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
            <Text style={[styles.statusTxt, { color: present ? COULEURS.success : COULEURS.textLight }]}>
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
      <StatusBar barStyle="dark-content" backgroundColor={COULEURS.background} />

      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.titre}>Présences</Text>
        <TouchableOpacity
          style={styles.btnDate}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnDateTxt}>📅 Changer la date</Text>
        </TouchableOpacity>
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

      {/* Statistiques du jour */}
      <View style={styles.statsJour}>
        <View style={[styles.statItem, { backgroundColor: COULEURS.success + '15' }]}>
          <Text style={[styles.statVal, { color: COULEURS.success }]}>{statsJour.presents}</Text>
          <Text style={[styles.statLbl, { color: COULEURS.success }]}>Présents</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: COULEURS.error + '12' }]}>
          <Text style={[styles.statVal, { color: COULEURS.error }]}>{statsJour.absents}</Text>
          <Text style={[styles.statLbl, { color: COULEURS.error }]}>Absents</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: COULEURS.primary + '12' }]}>
          <Text style={[styles.statVal, { color: COULEURS.primary }]}>{statsJour.taux}%</Text>
          <Text style={[styles.statLbl, { color: COULEURS.primary }]}>Taux</Text>
        </View>
      </View>

      {/* Boutons rapides */}
      {membres.length > 0 && (
        <View style={styles.actionsRapides}>
          <TouchableOpacity
            style={[styles.btnRapide, { backgroundColor: COULEURS.success + '15', borderColor: COULEURS.success }]}
            onPress={() => toggleTous(true)}
          >
            <Text style={[styles.btnRapideTxt, { color: COULEURS.success }]}>✓ Tous présents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnRapide, { backgroundColor: COULEURS.error + '10', borderColor: COULEURS.border }]}
            onPress={() => toggleTous(false)}
          >
            <Text style={[styles.btnRapideTxt, { color: COULEURS.textSecondary }]}>✗ Tous absents</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des membres */}
      <FlatList
        data={membres}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMembre}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EtatVide
            message="Aucun membre"
            sousTitre="Ajoutez des membres dans l'onglet Membres"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COULEURS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  titre: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black, color: COULEURS.text },
  btnDate: {
    backgroundColor: COULEURS.primary + '15',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  btnDateTxt: { fontSize: FONT_SIZE.sm, color: COULEURS.primary, fontWeight: FONT_WEIGHT.semibold },

  dateCarte: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COULEURS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  dateLabel: { fontSize: FONT_SIZE.sm, color: COULEURS.white + 'AA', fontWeight: FONT_WEIGHT.medium },
  dateValeur: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COULEURS.white,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  dateSousTitre: { fontSize: FONT_SIZE.xs, color: COULEURS.white + '88', marginTop: 4 },

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

  liste: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl, gap: 10 },

  carteMembre: { padding: SPACING.md },
  carteMPresent: { borderLeftWidth: 4, borderLeftColor: COULEURS.success },
  carteMAbsent: { borderLeftWidth: 4, borderLeftColor: COULEURS.border },
  rangeeMembre: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  infoMembre: { flex: 1, gap: 4 },
  nomMembre: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COULEURS.text },
  statusCont: { alignItems: 'center', gap: 4 },
  statusTxt: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold },
});
