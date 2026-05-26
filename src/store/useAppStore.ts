// ============================================================
// STORE GLOBAL - Zustand
// ============================================================
// Zustand est une bibliothèque légère de gestion d'état.
// Ce fichier centralise toutes les données de l'app.

import { create } from 'zustand';
import { Membre, Presence, Session, ParametresApp, Pupitre } from '../types';
import * as DB from '../database/database';

// ─── TYPE DU STORE ──────────────────────────────────────────

interface AppState {
  // Données
  membres: Membre[];
  sessions: Session[];
  presencesSession: Presence[];
  dateSelectionnee: string;
  parametres: ParametresApp;

  // Actions membres
  chargerMembres: () => void;
  ajouterMembre: (membre: Omit<Membre, 'id'>) => void;
  modifierMembre: (id: number, membre: Partial<Membre>) => void;
  supprimerMembre: (id: number) => void;

  // Actions sessions
  chargerSessions: () => void;
  selectionnerDate: (date: string) => void;
  ajouterSession: (date: string, titre?: string) => void;
  /** Montant d'offrande lié à la session (date YYYY-MM-DD). */
  setOffrandeSession: (date: string, offrande: number) => void;
  supprimerSession: (date: string) => void;

  // Actions présences
  chargerPresencesSession: (date: string) => void;
  marquerPresence: (membreId: number, date: string, present: boolean) => void;

  // Actions paramètres
  chargerParametres: () => void;
  mettreAJourParametres: (params: Partial<ParametresApp>) => void;
}

// ─── DATE D'AUJOURD'HUI EN FORMAT YYYY-MM-DD ────────────────
const aujourdHui = new Date().toISOString().split('T')[0];

// ─── CRÉATION DU STORE ──────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  membres: [],
  sessions: [],
  presencesSession: [],
  dateSelectionnee: aujourdHui,
  parametres: {
    nomChoral: 'Mon Choral',
    modeSombre: false,
    couleurPrimaire: '#6C3FC5',
  },

  // ── Membres ──────────────────────────────────────────────

  chargerMembres: () => {
    const membres = DB.getMembres();
    set({ membres });
  },

  ajouterMembre: (membre) => {
    DB.ajouterMembre(membre);
    get().chargerMembres();
  },

  modifierMembre: (id, membre) => {
    DB.modifierMembre(id, membre);
    get().chargerMembres();
  },

  supprimerMembre: (id) => {
    DB.supprimerMembre(id);
    get().chargerMembres();
  },

  // ── Sessions ─────────────────────────────────────────────

  chargerSessions: () => {
    const sessions = DB.getSessions();
    set({ sessions });
  },

  selectionnerDate: (date) => {
    set({ dateSelectionnee: date });
    get().chargerPresencesSession(date);
  },

  ajouterSession: (date, titre) => {
    DB.initialiserPresencesSession(date);
    get().chargerSessions();
    get().chargerPresencesSession(date);
  },

  setOffrandeSession: (date, offrande) => {
    DB.setOffrandeSession(date, offrande);
    get().chargerSessions();
  },

  supprimerSession: (date) => {
    DB.supprimerSession(date);
    get().chargerSessions();
  },

  // ── Présences ────────────────────────────────────────────

  chargerPresencesSession: (date) => {
    const presencesSession = DB.getPresencesParDate(date);
    set({ presencesSession });
  },

  marquerPresence: (membreId, date, present) => {
    DB.marquerPresence(membreId, date, present);
    get().chargerPresencesSession(date);
  },

  // ── Paramètres ───────────────────────────────────────────

  chargerParametres: () => {
    const params = DB.getTousParametres();
    set({
      parametres: {
        nomChoral: params.nomChoral ?? 'Mon Choral',
        logo: params.logo,
        modeSombre: params.modeSombre === 'true',
        couleurPrimaire: params.couleurPrimaire ?? '#6C3FC5',
      },
    });
  },

  mettreAJourParametres: (params) => {
    const { parametres } = get();
    const nouveaux = { ...parametres, ...params };
    // Sauvegarder chaque paramètre en base
    Object.entries(params).forEach(([cle, valeur]) => {
      DB.setParametre(cle, String(valeur));
    });
    set({ parametres: nouveaux });
  },
}));

