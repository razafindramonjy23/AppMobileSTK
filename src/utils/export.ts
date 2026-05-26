// ============================================================
// UTILITAIRE D'EXPORT EXCEL (.xlsx)
// ============================================================

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { utils, write } from 'xlsx';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as DB from '../database/database';


export async function exporterExcel(): Promise<void> {
  try {
    // ── 1. Récupérer les données ──────────────────────────
    const membres = DB.getMembres();
    const sessions = DB.getSessions();

    // ── 2. Feuille : Liste des membres ───────────────────
    const donneesMembres = membres.map((m) => {
      const stats = DB.getStatsMembre(m.id);
      return {
        Prénom: m.prenom,
        Nom: m.nom,
        Pupitre: m.pupitre.charAt(0).toUpperCase() + m.pupitre.slice(1),
        Téléphone: m.telephone,
        'Total présences': stats.totalPresences,
        'Total sessions': stats.totalSessions,
        'Taux (%)': stats.tauxPresence,
      };
    });

    // ── 3. Feuille : Présences par date ──────────────────
    const lignesPresences: any[] = [];

    for (const session of sessions) {
      const presences = DB.getPresencesParDate(session.date);
      const jour = parse(session.date, 'yyyy-MM-dd', new Date());
      jour.setHours(12, 0, 0, 0);
      const dateFormatee = format(jour, 'dd/MM/yyyy', { locale: fr });
      const offrandeJour = session.offrande ?? 0;

      for (const membre of membres) {
        const presence = presences.find((p) => p.membreId === membre.id);
        lignesPresences.push({
          Date: dateFormatee,
          'Offrande du jour': offrandeJour,
          Prénom: membre.prenom,
          Nom: membre.nom,
          Pupitre: membre.pupitre,
          Présent: presence?.present ? 'Oui' : 'Non',
        });
      }
    }

    const lignesSessionsRecap = sessions.map((session) => {
      const jour = parse(session.date, 'yyyy-MM-dd', new Date());
      jour.setHours(12, 0, 0, 0);
      return {
        Date: format(jour, 'dd/MM/yyyy', { locale: fr }),
        'Offrande du jour': session.offrande ?? 0,
      };
    });

    // ── 4. Créer le classeur Excel ────────────────────────
    const classeur = utils.book_new();

    const feuilleMembres = utils.json_to_sheet(donneesMembres);
    utils.book_append_sheet(classeur, feuilleMembres, 'Membres');

    if (lignesSessionsRecap.length > 0) {
      const feuilleSessions = utils.json_to_sheet(lignesSessionsRecap);
      utils.book_append_sheet(classeur, feuilleSessions, 'Sessions_offrandes');
    }

    if (lignesPresences.length > 0) {
      const feuillePresences = utils.json_to_sheet(lignesPresences);
      utils.book_append_sheet(classeur, feuillePresences, 'Présences');
    }

    // ── 5. Statistiques globales ──────────────────────────
    const stats = DB.getStatsGlobales();
    const donneesStats = [
      { Statistique: 'Total membres', Valeur: stats.totalMembres },
      { Statistique: 'Total sessions', Valeur: stats.totalSessions },
      { Statistique: 'Total présences', Valeur: stats.totalPresences },
      { Statistique: 'Taux moyen (%)', Valeur: stats.tauxMoyenPresence },
      { Statistique: 'Sopranos', Valeur: stats.membresPupitre.soprano },
      { Statistique: 'Altos', Valeur: stats.membresPupitre.alto },
      { Statistique: 'Ténors', Valeur: stats.membresPupitre.tenor },
      { Statistique: 'Basses', Valeur: stats.membresPupitre.basse },
    ];
    const feuilleStats = utils.json_to_sheet(donneesStats);
    utils.book_append_sheet(classeur, feuilleStats, 'Statistiques');

    // ── 6. Écrire le fichier ──────────────────────────────
    const donneesBinaires = write(classeur, { type: 'base64', bookType: 'xlsx' });
    const nomFichier = `choral_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    const cheminFichier = `${FileSystem.documentDirectory}${nomFichier}`;

    await FileSystem.writeAsStringAsync(cheminFichier, donneesBinaires, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // ── 7. Partager le fichier ────────────────────────────
    const peutPartager = await Sharing.isAvailableAsync();
    if (peutPartager) {
      await Sharing.shareAsync(cheminFichier, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Exporter les données du choral',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } else {
      throw new Error('Le partage n\'est pas disponible sur cet appareil.');
    }
  } catch (error) {
    console.error('Erreur export Excel:', error);
    throw error;
  }
}

export async function exporterExcelPourDate(dateISO: string): Promise<void> {
  const membres = DB.getMembres();
  const presences = DB.getPresencesParDate(dateISO);
  const sessionJour = DB.getSessionParDate(dateISO);
  const offrandeJour = sessionJour?.offrande ?? 0;
  const jour = parse(dateISO, 'yyyy-MM-dd', new Date());
  jour.setHours(12, 0, 0, 0);
  const dateFormatee = format(jour, 'dd/MM/yyyy', { locale: fr });

  const lignes = membres.map((membre) => {
    const presence = presences.find((p) => p.membreId === membre.id);
    return {
      Date: dateFormatee,
      'Offrande du jour': offrandeJour,
      Prénom: membre.prenom,
      Nom: membre.nom,
      Pupitre: membre.pupitre.charAt(0).toUpperCase() + membre.pupitre.slice(1),
      Présent: presence?.present ? 'Oui' : 'Non',
    };
  });

  const classeur = utils.book_new();
  const feuilleSession = utils.json_to_sheet([
    { Date: dateFormatee, 'Offrande du jour': offrandeJour },
  ]);
  utils.book_append_sheet(classeur, feuilleSession, 'Session');
  const feuille = utils.json_to_sheet(lignes);
  utils.book_append_sheet(classeur, feuille, 'Présences');

  const donneesBinaires = write(classeur, { type: 'base64', bookType: 'xlsx' });
  const nomFichier = `choral_presences_${dateISO}.xlsx`;
  const cheminFichier = `${FileSystem.documentDirectory}${nomFichier}`;

  await FileSystem.writeAsStringAsync(cheminFichier, donneesBinaires, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const peutPartager = await Sharing.isAvailableAsync();
  if (!peutPartager) throw new Error('Le partage n\'est pas disponible sur cet appareil.');
  await Sharing.shareAsync(cheminFichier, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: `Export présences du ${dateFormatee}`,
    UTI: 'com.microsoft.excel.xlsx',
  });
}