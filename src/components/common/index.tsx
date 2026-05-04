// ============================================================
// COMPOSANTS UI RÉUTILISABLES
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COULEURS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../theme';
import { Pupitre } from '../../types';
import { PUPITRE_CONFIG } from '../../theme';

// ─── BOUTON ─────────────────────────────────────────────────

interface BoutonProps {
  label: string;
  onPress: () => void;
  variante?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  taille?: 'sm' | 'md' | 'lg';
  icone?: React.ReactNode;
  loading?: boolean;
  desactive?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Bouton({
  label,
  onPress,
  variante = 'primary',
  taille = 'md',
  icone,
  loading,
  desactive,
  style,
}: BoutonProps) {
  const stylesVariante = {
    primary: { bg: COULEURS.primary, text: COULEURS.white, border: COULEURS.primary },
    secondary: { bg: COULEURS.secondary, text: COULEURS.white, border: COULEURS.secondary },
    outline: { bg: 'transparent', text: COULEURS.primary, border: COULEURS.primary },
    danger: { bg: COULEURS.error, text: COULEURS.white, border: COULEURS.error },
    ghost: { bg: 'transparent', text: COULEURS.primary, border: 'transparent' },
  }[variante];

  const tailleConfig = {
    sm: { paddingH: 12, paddingV: 6, fontSize: FONT_SIZE.sm },
    md: { paddingH: 20, paddingV: 12, fontSize: FONT_SIZE.md },
    lg: { paddingH: 24, paddingV: 16, fontSize: FONT_SIZE.lg },
  }[taille];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={desactive || loading}
      activeOpacity={0.8}
      style={[
        stylesBtn.base,
        {
          backgroundColor: stylesVariante.bg,
          borderColor: stylesVariante.border,
          paddingHorizontal: tailleConfig.paddingH,
          paddingVertical: tailleConfig.paddingV,
          opacity: desactive ? 0.5 : 1,
        },
        variante === 'primary' && SHADOWS.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={stylesVariante.text} />
      ) : (
        <View style={stylesBtn.contenu}>
          {icone && <View style={stylesBtn.icone}>{icone}</View>}
          <Text style={[stylesBtn.texte, { color: stylesVariante.text, fontSize: tailleConfig.fontSize }]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const stylesBtn = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenu: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icone: {},
  texte: { fontWeight: FONT_WEIGHT.semibold },
});

// ─── BADGE PUPITRE ──────────────────────────────────────────

interface BadgePupitreProps {
  pupitre: Pupitre;
  style?: ViewStyle;
}

export function BadgePupitre({ pupitre, style }: BadgePupitreProps) {
  const config = PUPITRE_CONFIG[pupitre];
  return (
    <View style={[stylesBadge.base, { backgroundColor: config.couleur + '22' }, style]}>
      <View style={[stylesBadge.dot, { backgroundColor: config.couleur }]} />
      <Text style={[stylesBadge.texte, { color: config.couleur }]}>{config.label}</Text>
    </View>
  );
}

const stylesBadge = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  texte: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, textTransform: 'capitalize' },
});

// ─── CARTE ──────────────────────────────────────────────────

interface CarteProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
}

export function Carte({ children, style, onPress, elevation = 'sm' }: CarteProps) {
  const ombre = elevation === 'none' ? {} : SHADOWS[elevation];
  const contenu = (
    <View style={[stylesCarte.base, ombre, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {contenu}
      </TouchableOpacity>
    );
  }
  return contenu;
}

const stylesCarte = StyleSheet.create({
  base: {
    backgroundColor: COULEURS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
});

// ─── CARTE STATISTIQUE ──────────────────────────────────────

interface CarteStatProps {
  label: string;
  valeur: string | number;
  sousTitre?: string;
  couleur?: string;
  icone?: React.ReactNode;
  style?: ViewStyle;
}

export function CarteStat({ label, valeur, sousTitre, couleur = COULEURS.primary, icone, style }: CarteStatProps) {
  return (
    <Carte style={[stylesStat.base, style]}>
      <View style={[stylesStat.iconeCont, { backgroundColor: couleur + '15' }]}>
        {icone ?? <View style={[stylesStat.dot, { backgroundColor: couleur }]} />}
      </View>
      <Text style={[stylesStat.valeur, { color: couleur }]}>{valeur}</Text>
      <Text style={stylesStat.label}>{label}</Text>
      {sousTitre && <Text style={stylesStat.sousTitre}>{sousTitre}</Text>}
    </Carte>
  );
}

const stylesStat = StyleSheet.create({
  base: { alignItems: 'center', flex: 1, minWidth: 130 },
  iconeCont: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  dot: { width: 20, height: 20, borderRadius: 10 },
  valeur: { fontSize: FONT_SIZE.xxxl, fontWeight: FONT_WEIGHT.black, lineHeight: 36 },
  label: { fontSize: FONT_SIZE.sm, color: COULEURS.textSecondary, fontWeight: FONT_WEIGHT.medium, textAlign: 'center', marginTop: 2 },
  sousTitre: { fontSize: FONT_SIZE.xs, color: COULEURS.textLight, marginTop: 2 },
});

// ─── AVATAR MEMBRE ──────────────────────────────────────────

interface AvatarMembreProps {
  prenom: string;
  nom: string;
  pupitre: Pupitre;
  taille?: number;
}

export function AvatarMembre({ prenom, nom, pupitre, taille = 44 }: AvatarMembreProps) {
  const couleur = PUPITRE_CONFIG[pupitre].couleur;
  const initiales = `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase();

  return (
    <View style={[
      stylesAvatar.base,
      { width: taille, height: taille, borderRadius: taille / 2, backgroundColor: couleur + '22', borderColor: couleur }
    ]}>
      <Text style={[stylesAvatar.texte, { color: couleur, fontSize: taille * 0.38 }]}>{initiales}</Text>
    </View>
  );
}

const stylesAvatar = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  texte: { fontWeight: FONT_WEIGHT.bold },
});

// ─── TOGGLE PRÉSENCE ────────────────────────────────────────

interface TogglePresenceProps {
  present: boolean;
  onToggle: () => void;
}

export function TogglePresence({ present, onToggle }: TogglePresenceProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[
        stylesToggle.base,
        present ? stylesToggle.present : stylesToggle.absent,
      ]}
    >
      <Text style={[stylesToggle.texte, { color: present ? COULEURS.success : COULEURS.textLight }]}>
        {present ? '✓' : '✗'}
      </Text>
    </TouchableOpacity>
  );
}

const stylesToggle = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  present: {
    backgroundColor: COULEURS.success + '15',
    borderColor: COULEURS.success,
  },
  absent: {
    backgroundColor: COULEURS.error + '10',
    borderColor: COULEURS.border,
  },
  texte: {
    fontSize: 18,
    fontWeight: FONT_WEIGHT.bold,
  },
});

// ─── BARRE TAUX PRÉSENCE ────────────────────────────────────

interface BarreTauxProps {
  taux: number;
  hauteur?: number;
}

export function BarreTaux({ taux, hauteur = 8 }: BarreTauxProps) {
  const couleur = taux >= 80 ? COULEURS.success : taux >= 60 ? COULEURS.warning : COULEURS.error;
  return (
    <View style={[stylesBarreTaux.fond, { height: hauteur }]}>
      <View style={[stylesBarreTaux.remplissage, { width: `${taux}%`, backgroundColor: couleur }]} />
    </View>
  );
}

const stylesBarreTaux = StyleSheet.create({
  fond: { backgroundColor: COULEURS.border, borderRadius: 99, overflow: 'hidden', flex: 1 },
  remplissage: { height: '100%', borderRadius: 99 },
});

// ─── SEPARATEUR ─────────────────────────────────────────────

export function Separateur({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: COULEURS.borderLight }, style]} />;
}

// ─── ÉTAT VIDE ──────────────────────────────────────────────

interface EtatVideProps {
  message: string;
  sousTitre?: string;
  icone?: string;
  action?: { label: string; onPress: () => void };
}

export function EtatVide({ message, sousTitre, icone = '🎵', action }: EtatVideProps) {
  return (
    <View style={stylesVide.base}>
      <Text style={stylesVide.icone}>{icone}</Text>
      <Text style={stylesVide.message}>{message}</Text>
      {sousTitre && <Text style={stylesVide.sousTitre}>{sousTitre}</Text>}
      {action && (
        <Bouton
          label={action.label}
          onPress={action.onPress}
          style={stylesVide.bouton}
        />
      )}
    </View>
  );
}

const stylesVide = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: SPACING.xl },
  icone: { fontSize: 56, marginBottom: SPACING.md },
  message: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold, color: COULEURS.text, textAlign: 'center' },
  sousTitre: { fontSize: FONT_SIZE.md, color: COULEURS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  bouton: { marginTop: SPACING.lg },
});
