// ============================================================
// TYPES GLOBAUX DE L'APPLICATION
// ============================================================

export type Pupitre = 'soprano' | 'alto' | 'tenor' | 'basse';

export interface Membre {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  pupitre: Pupitre;
  photo?: string;
  dateAjout: string; // ISO date string
}

export interface Presence {
  id: number;
  membreId: number;
  date: string; // ISO date string YYYY-MM-DD
  present: boolean;
  note?: string;
}

export interface Session {
  id: number;
  date: string; // YYYY-MM-DD
  titre?: string;
  note?: string;
}

export interface MembreAvecPresence extends Membre {
  totalPresences: number;
  totalSessions: number;
  tauxPresence: number;
}

export interface StatistiquesGlobales {
  totalMembres: number;
  totalSessions: number;
  totalPresences: number;
  tauxMoyenPresence: number;
  membresPupitre: {
    soprano: number;
    alto: number;
    tenor: number;
    basse: number;
  };
}

export interface ParametresApp {
  nomChoral: string;
  logo?: string;
  modeSombre: boolean;
  couleurPrimaire: string;
}

