// ============================================================
// THÈME RÉACTIF — lit modeSombre (Zustand) et fournit les couleurs
// ============================================================

import React, { createContext, useContext, useMemo } from 'react';
import { COULEURS, getThemeColors } from './index';
import { useAppStore } from '../store/useAppStore';

const ThemeContext = createContext(COULEURS);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const modeSombre = useAppStore((s) => s.parametres.modeSombre);
  const colors = useMemo(() => getThemeColors(modeSombre), [modeSombre]);
  return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>;
}

export function useThemeColors() {
  return useContext(ThemeContext);
}
