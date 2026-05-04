// ============================================================
// THÈME DE L'APPLICATION - Couleurs, polices, espacements
// ============================================================

export const COULEURS = {
  // Primaires
  primary: '#6C3FC5',       // Violet royal
  primaryLight: '#8B5CF6',
  primaryDark: '#4C1D95',

  // Secondaires
  secondary: '#F59E0B',     // Or chaud
  secondaryLight: '#FCD34D',

  // Pupitres (couleurs par voix)
  soprano: '#EC4899',       // Rose
  alto: '#F97316',          // Orange
  tenor: '#3B82F6',         // Bleu
  basse: '#10B981',         // Vert

  // Neutres
  background: '#F8F7FF',
  card: '#FFFFFF',
  surface: '#F3F0FF',

  // Textes
  text: '#1E1B4B',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',

  // États
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Sombres
  dark: {
    background: '#0F0D1E',
    card: '#1A1730',
    surface: '#251F45',
    text: '#F5F3FF',
    textSecondary: '#A78BFA',
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#6C3FC5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#6C3FC5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6C3FC5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const PUPITRE_CONFIG = {
  soprano: { couleur: COULEURS.soprano, icone: 'music-note', label: 'Soprano' },
  alto: { couleur: COULEURS.alto, icone: 'music-note-half', label: 'Alto' },
  tenor: { couleur: COULEURS.tenor, icone: 'music-note-eighth', label: 'Ténor' },
  basse: { couleur: COULEURS.basse, icone: 'music-note-whole', label: 'Basse' },
};

