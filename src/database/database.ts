// ============================================================
// BASE DE DONNÉES - Expo SQLite
// ============================================================
// Ce fichier gère toutes les interactions avec la base SQLite.
// Il crée les tables si elles n'existent pas et expose des
// fonctions pour chaque opération (CRUD).

import * as SQLite from 'expo-sqlite';
import { Membre, Presence, Session, Pupitre } from '../types';

// Ouvrir (ou créer) la base de données
const db = SQLite.openDatabaseSync('choral.db');

// ─── INITIALISATION ─────────────────────────────────────────

export function initDatabase(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS membres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      telephone TEXT DEFAULT '',
      pupitre TEXT NOT NULL CHECK(pupitre IN ('soprano','alto','tenor','basse')),
      photo TEXT,
      dateAjout TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      titre TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS presences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      membreId INTEGER NOT NULL,
      date TEXT NOT NULL,
      present INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      FOREIGN KEY (membreId) REFERENCES membres(id) ON DELETE CASCADE,
      UNIQUE(membreId, date)
    );

    CREATE TABLE IF NOT EXISTS parametres (
      cle TEXT PRIMARY KEY,
      valeur TEXT NOT NULL
    );

    INSERT OR IGNORE INTO parametres (cle, valeur) VALUES
      ('nomChoral', 'Mon Choral'),
      ('modeSombre', 'false'),
      ('couleurPrimaire', '#6C3FC5');
  `);
  runMigrations();
}

/** Ajoute les colonnes manquantes sur les bases déjà installées. */
function runMigrations(): void {
  const cols = db.getAllSync<{ name: string }>('PRAGMA table_info(sessions)', []);
  const noms = cols.map((c) => c.name);
  if (!noms.includes('offrande')) {
    db.execSync('ALTER TABLE sessions ADD COLUMN offrande REAL NOT NULL DEFAULT 0');
  }
}

// ─── MEMBRES ────────────────────────────────────────────────

export function getMembres(): Membre[] {
  return db.getAllSync<Membre>(
    'SELECT * FROM membres ORDER BY pupitre, nom, prenom'
  );
}

export function getMembreById(id: number): Membre | null {
  return db.getFirstSync<Membre>('SELECT * FROM membres WHERE id = ?', [id]);
}

export function ajouterMembre(membre: Omit<Membre, 'id'>): number {
  const result = db.runSync(
    `INSERT INTO membres (nom, prenom, telephone, pupitre, photo, dateAjout)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      membre.nom,
      membre.prenom,
      membre.telephone,
      membre.pupitre,
      membre.photo ?? null,
      membre.dateAjout,
    ]
  );
  return result.lastInsertRowId;
}

export function modifierMembre(id: number, membre: Partial<Membre>): void {
  const fields = Object.keys(membre)
    .filter((k) => k !== 'id')
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.keys(membre)
    .filter((k) => k !== 'id')
    .map((k) => (membre as any)[k]);

  db.runSync(`UPDATE membres SET ${fields} WHERE id = ?`, [...values, id]);
}

export function supprimerMembre(id: number): void {
  db.runSync('DELETE FROM membres WHERE id = ?', [id]);
}

export function rechercherMembres(query: string): Membre[] {
  const q = `%${query}%`;
  return db.getAllSync<Membre>(
    `SELECT * FROM membres
     WHERE nom LIKE ? OR prenom LIKE ? OR telephone LIKE ?
     ORDER BY nom, prenom`,
    [q, q, q]
  );
}

export function getMembresParPupitre(pupitre: Pupitre): Membre[] {
  return db.getAllSync<Membre>(
    'SELECT * FROM membres WHERE pupitre = ? ORDER BY nom, prenom',
    [pupitre]
  );
}

// ─── SESSIONS ───────────────────────────────────────────────

export function getSessions(): Session[] {
  return db.getAllSync<Session>('SELECT * FROM sessions ORDER BY date DESC');
}

export function getSessionParDate(date: string): Session | null {
  return db.getFirstSync<Session>('SELECT * FROM sessions WHERE date = ?', [date]);
}

export function ajouterSession(date: string, titre?: string, note?: string): number {
  const result = db.runSync(
    'INSERT OR IGNORE INTO sessions (date, titre, note) VALUES (?, ?, ?)',
    [date, titre ?? null, note ?? null]
  );
  return result.lastInsertRowId;
}

export function supprimerSession(date: string): void {
  db.runSync('DELETE FROM sessions WHERE date = ?', [date]);
  db.runSync('DELETE FROM presences WHERE date = ?', [date]);
}

// ─── PRÉSENCES ──────────────────────────────────────────────

export function getPresencesParDate(date: string): Presence[] {
  return db.getAllSync<Presence>(
    'SELECT * FROM presences WHERE date = ?',
    [date]
  );
}

export function getPresencesParMembre(membreId: number): Presence[] {
  return db.getAllSync<Presence>(
    'SELECT * FROM presences WHERE membreId = ? ORDER BY date DESC',
    [membreId]
  );
}

export function marquerPresence(
  membreId: number,
  date: string,
  present: boolean
): void {
  db.runSync(
    `INSERT INTO presences (membreId, date, present)
     VALUES (?, ?, ?)
     ON CONFLICT(membreId, date) DO UPDATE SET present = excluded.present`,
    [membreId, date, present ? 1 : 0]
  );
}

export function initialiserPresencesSession(date: string): void {
  // Ajouter la session si elle n'existe pas
  ajouterSession(date);
  // Créer une entrée "absent" pour chaque membre qui n'a pas encore de présence ce jour
  db.execSync(`
    INSERT OR IGNORE INTO presences (membreId, date, present)
    SELECT id, '${date}', 0 FROM membres
  `);
}

/** Enregistre le montant d'offrande pour la session du jour (crée la session si besoin). */
export function setOffrandeSession(date: string, offrande: number): void {
  if (!getSessionParDate(date)) {
    ajouterSession(date);
  }
  db.runSync('UPDATE sessions SET offrande = ? WHERE date = ?', [offrande, date]);
}

// ─── STATISTIQUES ───────────────────────────────────────────

export function getStatsMembre(membreId: number): {
  totalPresences: number;
  totalSessions: number;
  tauxPresence: number;
} {
  const total = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sessions',
    []
  );
  const presences = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM presences WHERE membreId = ? AND present = 1',
    [membreId]
  );

  const totalSessions = total?.count ?? 0;
  const totalPresences = presences?.count ?? 0;
  const tauxPresence = totalSessions > 0
    ? Math.round((totalPresences / totalSessions) * 100)
    : 0;

  return { totalPresences, totalSessions, tauxPresence };
}

export function getStatsGlobales() {
  const totalMembres = (db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM membres', []
  ))?.count ?? 0;

  const totalSessions = (db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sessions', []
  ))?.count ?? 0;

  const totalPresences = (db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM presences WHERE present = 1', []
  ))?.count ?? 0;

  const possible = totalMembres * totalSessions;
  const tauxMoyenPresence = possible > 0
    ? Math.round((totalPresences / possible) * 100)
    : 0;

  const parPupitre = db.getAllSync<{ pupitre: string; count: number }>(
    'SELECT pupitre, COUNT(*) as count FROM membres GROUP BY pupitre', []
  );

  const membresPupitre = {
    soprano: 0, alto: 0, tenor: 0, basse: 0,
  };
  parPupitre.forEach(({ pupitre, count }) => {
    (membresPupitre as any)[pupitre] = count;
  });

  return { totalMembres, totalSessions, totalPresences, tauxMoyenPresence, membresPupitre };
}

export function getPresencesParMois(annee: number) {
  return db.getAllSync<{ mois: string; total: number; presences: number }>(
    `SELECT
       strftime('%m', date) as mois,
       COUNT(*) as total,
       SUM(present) as presences
     FROM presences
     WHERE strftime('%Y', date) = ?
     GROUP BY mois
     ORDER BY mois`,
    [String(annee)]
  );
}

// ─── PARAMÈTRES ─────────────────────────────────────────────

export function getParametre(cle: string): string | null {
  const row = db.getFirstSync<{ valeur: string }>(
    'SELECT valeur FROM parametres WHERE cle = ?',
    [cle]
  );
  return row?.valeur ?? null;
}

export function setParametre(cle: string, valeur: string): void {
  db.runSync(
    'INSERT OR REPLACE INTO parametres (cle, valeur) VALUES (?, ?)',
    [cle, valeur]
  );
}

export function getTousParametres(): Record<string, string> {
  const rows = db.getAllSync<{ cle: string; valeur: string }>(
    'SELECT * FROM parametres', []
  );
  const result: Record<string, string> = {};
  rows.forEach(({ cle, valeur }) => { result[cle] = valeur; });
  return result;
}

export default db;
