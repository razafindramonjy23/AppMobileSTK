// ============================================================
// ÉCRAN : LISTE DES MEMBRES
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Membre, Pupitre } from '../../types';
import {
  SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS, PUPITRE_CONFIG, ThemeColors,
} from '../../theme';
import { useThemeColors } from '../../theme/ThemeContext';
import { AvatarMembre, BadgePupitre, Carte, EtatVide, BarreTaux } from '../../components/common';
import * as DB from '../../database/database';

const PUPITRES: (Pupitre | 'tous')[] = ['tous', 'soprano', 'alto', 'tenor', 'basse'];

function createMembresListStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.sm,
    },
    titre: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black, color: C.text },
    sousTitre: { fontSize: FONT_SIZE.sm, color: C.textSecondary, marginTop: 2 },
    btnAjouter: {
      backgroundColor: C.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: 10,
      borderRadius: BORDER_RADIUS.md,
      ...SHADOWS.sm,
    },
    btnAjouterTxt: { color: C.white, fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.md },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.card,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      ...SHADOWS.sm,
    },
    searchIcone: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: FONT_SIZE.md, color: C.text },
    clearBtn: { fontSize: 16, color: C.textLight, padding: 4 },
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
    liste: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl, gap: SPACING.sm },
    carteM: { padding: SPACING.md },
    rangeeM: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
    infoM: { flex: 1, gap: 4 },
    nomM: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: C.text },
    telM: { fontSize: FONT_SIZE.xs, color: C.textSecondary, marginTop: 2 },
    statsM: { alignItems: 'flex-end', gap: 4, width: 70 },
    tauxM: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: C.primary },
    presM: { fontSize: FONT_SIZE.xs, color: C.textSecondary },
    actionsM: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.sm,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: C.borderLight,
    },
    btnAction: {
      flex: 1,
      paddingVertical: 6,
      alignItems: 'center',
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: C.surface,
    },
    btnDanger: { backgroundColor: C.error + '10' },
    btnActionTxt: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: C.primary },
  });
}

export default function MembresList() {
  const navigation = useNavigation<any>();
  const { membres, chargerMembres, supprimerMembre } = useAppStore();
  const C = useThemeColors();
  const modeSombre = useAppStore((s) => s.parametres.modeSombre);
  const styles = useMemo(() => createMembresListStyles(C), [C]);
  const [recherche, setRecherche] = useState('');
  const [filtreActif, setFiltreActif] = useState<Pupitre | 'tous'>('tous');

  useEffect(() => {
    chargerMembres();
  }, []);

  const membresFiltres = useMemo(() => {
    let liste = membres;
    if (filtreActif !== 'tous') {
      liste = liste.filter((m) => m.pupitre === filtreActif);
    }
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      liste = liste.filter(
        (m) =>
          m.nom.toLowerCase().includes(q) ||
          m.prenom.toLowerCase().includes(q) ||
          m.telephone.includes(q)
      );
    }
    return liste;
  }, [membres, filtreActif, recherche]);

  const confirmerSuppression = useCallback((membre: Membre) => {
    Alert.alert(
      'Supprimer ce membre ?',
      `${membre.prenom} ${membre.nom} sera définitivement supprimé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => supprimerMembre(membre.id),
        },
      ]
    );
  }, [supprimerMembre]);

  const renderMembre = useCallback(({ item }: { item: Membre }) => {
    const stats = DB.getStatsMembre(item.id);
    return (
      <Carte
        style={styles.carteM}
        onPress={() => navigation.navigate('MembreForm', { membreId: item.id })}
      >
        <View style={styles.rangeeM}>
          <AvatarMembre prenom={item.prenom} nom={item.nom} pupitre={item.pupitre} taille={50} />

          <View style={styles.infoM}>
            <Text style={styles.nomM}>{item.prenom} {item.nom}</Text>
            <BadgePupitre pupitre={item.pupitre} />
            {item.telephone ? (
              <Text style={styles.telM}>📞 {item.telephone}</Text>
            ) : null}
          </View>

          <View style={styles.statsM}>
            <Text style={styles.tauxM}>{stats.tauxPresence}%</Text>
            <BarreTaux taux={stats.tauxPresence} />
            <Text style={styles.presM}>{stats.totalPresences}/{stats.totalSessions}</Text>
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsM}>
          <TouchableOpacity
            style={styles.btnAction}
            onPress={() => navigation.navigate('MembreForm', { membreId: item.id })}
          >
            <Text style={styles.btnActionTxt}>✏️ Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnAction, styles.btnDanger]}
            onPress={() => confirmerSuppression(item)}
          >
            <Text style={[styles.btnActionTxt, { color: C.error }]}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      </Carte>
    );
  }, [navigation, confirmerSuppression, styles, C]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={modeSombre ? 'light-content' : 'dark-content'}
        backgroundColor={C.background}
      />

      {/* En-tête */}
      <View style={styles.header}>
        <View>
          <Text style={styles.titre}>Membres</Text>
          <Text style={styles.sousTitre}>{membres.length} choriste{membres.length > 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.btnAjouter}
          onPress={() => navigation.navigate('MembreForm', {})}
          activeOpacity={0.8}
        >
          <Text style={styles.btnAjouterTxt}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcone}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un membre..."
          placeholderTextColor={C.textLight}
          value={recherche}
          onChangeText={setRecherche}
        />
        {recherche.length > 0 && (
          <TouchableOpacity onPress={() => setRecherche('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres par pupitre */}
      <View style={styles.filtres}>
        {PUPITRES.map((p) => {
          const actif = filtreActif === p;
          const couleur = p === 'tous' ? C.primary : PUPITRE_CONFIG[p].couleur;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.chip, actif && { backgroundColor: couleur, borderColor: couleur }]}
              onPress={() => setFiltreActif(p)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTxt, actif && { color: C.white }]}>
                {p === 'tous' ? 'Tous' : PUPITRE_CONFIG[p].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Liste */}
      <FlatList
        data={membresFiltres}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMembre}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EtatVide
            message={recherche ? 'Aucun résultat' : 'Aucun membre'}
            sousTitre={recherche ? 'Essayez un autre terme' : 'Commencez par ajouter un choriste'}
            icone="🎶"
            action={!recherche ? { label: '+ Ajouter un membre', onPress: () => navigation.navigate('MembreForm', {}) } : undefined}
          />
        }
      />
    </SafeAreaView>
  );
}
