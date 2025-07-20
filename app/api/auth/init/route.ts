import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    // Lire les identifiants OAuth
    const credentialsPath = path.join(process.cwd(), 'google-oauth-credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    // Créer le client OAuth2
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Définir les scopes nécessaires
    const SCOPES = [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive'
    ];

    // Générer l'URL d'authentification
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent' // Force la demande de refresh token
    });

    console.log('🔗 URL d\'authentification générée');
    
    return NextResponse.json({ 
      authUrl,
      message: 'Visitez cette URL pour vous authentifier avec le compte omet.fintech@gmail.com'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'URL d\'auth:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la génération de l\'URL d\'authentification',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
