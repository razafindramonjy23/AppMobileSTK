// ============================================================
// ÉCRAN : STATISTIQUES
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useAppStore } from '../../store/useAppStore';
import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS, PUPITRE_CONFIG, ThemeColors } from '../../theme';
import { useThemeColors } from '../../theme/ThemeContext';
import { CarteStat, Carte, EtatVide, BarreTaux } from '../../components/common';
import * as DB from '../../database/database';
import { exporterExcel } from '../../utils/export';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - SPACING.md * 2;

function createStatsStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    scroll: { paddingBottom: SPACING.xxl },
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
    btnExport: {
      backgroundColor: C.secondary,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: BORDER_RADIUS.md,
      ...SHADOWS.sm,
    },
    btnExportTxt: { color: C.white, fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.sm },
    statsGrid: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
    section: { marginHorizontal: SPACING.md, marginBottom: SPACING.md },
    sectionTitre: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: C.text, marginBottom: SPACING.md },
    chart: { borderRadius: BORDER_RADIUS.md, marginHorizontal: -8 },
    legendePupitre: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginTop: SPACING.sm },
    legendeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendeDot: { width: 10, height: 10, borderRadius: 5 },
    legendeLabel: { fontSize: FONT_SIZE.sm, color: C.textSecondary },
    legendeVal: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
    rowClassement: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: C.borderLight,
    },
    rang: { width: 28, fontSize: FONT_SIZE.md, textAlign: 'center' },
    nomClassement: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: C.text },
    barreClassement: { width: 80 },
    tauxClassement: { width: 36, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, textAlign: 'right' },
  });
}

export default function StatsScreen() {
  const { membres, chargerMembres, sessions, chargerSessions } = useAppStore();
  const C = useThemeColors();
  const modeSombre = useAppStore((s) => s.parametres.modeSombre);
  const styles = useMemo(() => createStatsStyles(C), [C]);
  const [exportLoading, setExportLoading] = useState(false);
  const [annee] = useState(new Date().getFullYear());

  useEffect(() => {
    chargerMembres();
    chargerSessions();
  }, []);

  const statsGlobales = useMemo(() => DB.getStatsGlobales(), [membres, sessions]);

  const donneesPupitre = useMemo(() => [
    {
      name: 'Soprano',
      population: statsGlobales.membresPupitre.soprano,
      color: C.soprano,
      legendFontColor: C.text,
      legendFontSize: 12,
    },
    {
      name: 'Alto',
      population: statsGlobales.membresPupitre.alto,
      color: C.alto,
      legendFontColor: C.text,
      legendFontSize: 12,
    },
    {
      name: 'Ténor',
      population: statsGlobales.membresPupitre.tenor,
      color: C.tenor,
      legendFontColor: C.text,
      legendFontSize: 12,
    },
    {
      name: 'Basse',
      population: statsGlobales.membresPupitre.basse,
      color: C.basse,
      legendFontColor: C.text,
      legendFontSize: 12,
    },
  ].filter((d) => d.population > 0), [statsGlobales, C]);

  const donneesParMois = useMemo(() => {
    const donnees = DB.getPresencesParMois(annee);
    const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return {
      labels: donnees.map((d) => MOIS[parseInt(d.mois) - 1]),
      datasets: [{ data: donnees.map((d) => d.presences > 0 ? Math.round((d.presences / (d.total || 1)) * 100) : 0) }],
    };
  }, [annee]);

  const membresByTaux = useMemo(() => {
    return membres
      .map((m) => ({ ...m, ...DB.getStatsMembre(m.id) }))
      .sort((a, b) => b.tauxPresence - a.tauxPresence);
  }, [membres]);

  async function handleExport() {
    setExportLoading(true);
    try {
      await exporterExcel();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    } finally {
      setExportLoading(false);
    }
  }

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: C.card,
      backgroundGradientTo: C.card,
      color: (opacity = 1) => `rgba(108, 63, 197, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.7,
      labelColor: () => C.textSecondary,
      style: { borderRadius: 16 },
    }),
    [C]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={modeSombre ? 'light-content' : 'dark-content'}
        backgroundColor={C.background}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.titre}>Statistiques</Text>
            <Text style={styles.sousTitre}>Vue d'ensemble du choral</Text>
          </View>
          <TouchableOpacity
            style={[styles.btnExport, exportLoading && { opacity: 0.6 }]}
            onPress={handleExport}
            disabled={exportLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.btnExportTxt}>{exportLoading ? '⏳' : '📊'} Export</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques globales */}
        <View style={styles.statsGrid}>
          <CarteStat
            label="Membres"
            valeur={statsGlobales.totalMembres}
            couleur={C.primary}
            icone={<Text style={{ fontSize: 20 }}>👥</Text>}
          />
          <CarteStat
            label="Sessions"
            valeur={statsGlobales.totalSessions}
            couleur={C.secondary}
            icone={<Text style={{ fontSize: 20 }}>📅</Text>}
          />
        </View>
        <View style={styles.statsGrid}>
          <CarteStat
            label="Présences"
            valeur={statsGlobales.totalPresences}
            couleur={C.success}
            icone={<Text style={{ fontSize: 20 }}>✅</Text>}
          />
          <CarteStat
            label="Taux moyen"
            valeur={`${statsGlobales.tauxMoyenPresence}%`}
            couleur={C.tenor}
            icone={<Text style={{ fontSize: 20 }}>📈</Text>}
          />
        </View>

        {/* Répartition par pupitre */}
        {donneesPupitre.length > 0 && (
          <Carte style={styles.section}>
            <Text style={styles.sectionTitre}>Répartition par pupitre</Text>
            <PieChart
              data={donneesPupitre}
              width={CHART_WIDTH - SPACING.md * 2}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            {/* Légende détaillée */}
            <View style={styles.legendePupitre}>
              {(['soprano', 'alto', 'tenor', 'basse'] as const).map((p) => {
                const count = statsGlobales.membresPupitre[p];
                const config = PUPITRE_CONFIG[p];
                if (count === 0) return null;
                return (
                  <View key={p} style={styles.legendeItem}>
                    <View style={[styles.legendeDot, { backgroundColor: config.couleur }]} />
                    <Text style={styles.legendeLabel}>{config.label}</Text>
                    <Text style={[styles.legendeVal, { color: config.couleur }]}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </Carte>
        )}

        {/* Taux par mois */}
        {donneesParMois.labels.length > 0 && (
          <Carte style={styles.section}>
            <Text style={styles.sectionTitre}>Taux de présence par mois ({annee})</Text>
            <BarChart
              data={donneesParMois}
              width={CHART_WIDTH - SPACING.md * 2}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix="%"
            />
          </Carte>
        )}

        {/* Classement membres */}
        {membresByTaux.length > 0 && (
          <Carte style={styles.section}>
            <Text style={styles.sectionTitre}>🏆 Classement présences</Text>
            {membresByTaux.slice(0, 10).map((m, idx) => (
              <View key={m.id} style={styles.rowClassement}>
                <Text style={styles.rang}>{idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `${idx + 1}.`}</Text>
                <Text style={styles.nomClassement} numberOfLines={1}>
                  {m.prenom} {m.nom}
                </Text>
                <View style={styles.barreClassement}>
                  <BarreTaux taux={m.tauxPresence} hauteur={6} />
                </View>
                <Text style={[styles.tauxClassement, { color: m.tauxPresence >= 80 ? C.success : m.tauxPresence >= 60 ? C.warning : C.error }]}>
                  {m.tauxPresence}%
                </Text>
              </View>
            ))}
          </Carte>
        )}

        {statsGlobales.totalMembres === 0 && (
          <EtatVide
            message="Pas encore de données"
            sousTitre="Ajoutez des membres et enregistrez des présences pour voir les statistiques"
            icone="📊"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
