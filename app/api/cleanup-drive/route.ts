import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

// Initialiser l'authentification avec le compte de service
function getGoogleAuth() {
  const credentialsPath = path.join(process.cwd(), 'google-service-account.json');
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive',
    ],
  });
  
  return auth;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Début du nettoyage du Drive du compte de service...');
    
    // Initialiser les services Google
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    // Lister tous les fichiers du Drive
    const filesResponse = await drive.files.list({
      q: "trashed=false", // Seulement les fichiers non supprimés
      fields: 'files(id, name, createdTime)',
      pageSize: 100
    });
    
    const files = filesResponse.data.files || [];
    console.log(`📁 ${files.length} fichiers trouvés dans le Drive`);
    
    if (files.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Aucun fichier à supprimer',
        filesDeleted: 0 
      });
    }
    
    // Supprimer tous les fichiers sauf les templates originaux
    const TEMPLATE_IDS = [
        '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado', // Ancien template
        '1RHgg7nmm3SPHClDZm9JaeaWcum3LsXqupMEtVigEv-o'  // Nouveau template Paysage
    ];
    let deletedCount = 0;
    
    for (const file of files) {
      if (!TEMPLATE_IDS.includes(file.id!)) {
        try {
          await drive.files.delete({
            fileId: file.id!,
          });
          console.log(`🗑️ Supprimé: ${file.name} (${file.id})`);
          deletedCount++;
        } catch (deleteError) {
          console.warn(`⚠️ Erreur lors de la suppression de ${file.name}:`, deleteError);
        }
      }
    }
    
    // Vider la corbeille
    try {
      await drive.files.emptyTrash();
      console.log('🗑️ Corbeille vidée');
    } catch (trashError) {
      console.warn('⚠️ Erreur lors du vidage de la corbeille:', trashError);
    }
    
    console.log(`✅ Nettoyage terminé: ${deletedCount} fichiers supprimés`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Nettoyage réussi: ${deletedCount} fichiers supprimés`,
      filesDeleted: deletedCount 
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du nettoyage du Drive',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
