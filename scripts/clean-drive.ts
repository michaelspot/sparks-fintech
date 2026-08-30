import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

// Initialiser l'authentification avec le compte de service
function getGoogleAuth() {
  const credentialsPath = path.join(process.cwd(), 'google-service-account.json');
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return auth;
}

async function cleanDrive() {
  try {
    console.log('🧹 Début du nettoyage du Drive...');

    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    // 1. Vider la corbeille d'abord (souvent c'est là que l'espace est pris)
    console.log('🗑️ Vidage de la corbeille...');
    await drive.files.emptyTrash();
    console.log('✅ Corbeille vidée.');

    // 2. Lister les fichiers restants
    let pageToken = undefined;
    let totalDeleted = 0;

    do {
      const res: any = await drive.files.list({
        q: "trashed=false and mimeType != 'application/vnd.google-apps.folder'", // On garde les dossiers pour l'instant
        fields: 'nextPageToken, files(id, name)',
        pageSize: 100,
        pageToken: pageToken
      });

      const files = res.data.files;
      pageToken = res.data.nextPageToken;

      const TEMPLATE_IDS = [
        '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado', // Ancien
        '1RHgg7nmm3SPHClDZm9JaeaWcum3LsXqupMEtVigEv-o'  // Nouveau
      ];

      for (const file of files) {
        if (!TEMPLATE_IDS.includes(file.id)) {
          console.log(`Suppression de : ${file.name} (${file.id})`);
          try {
            await drive.files.delete({ fileId: file.id });
            totalDeleted++;
          } catch (e) {
            console.error(`Erreur suppression ${file.name}:`, e);
          }
        } else {
            console.log(`🛡️ Préservation du template : ${file.name}`);
        }
      }
    } while (pageToken);

    console.log(`🎉 Nettoyage terminé ! ${totalDeleted} fichiers supprimés.`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

cleanDrive();
