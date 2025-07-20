import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'Code d\'autorisation manquant' }, { status: 400 });
    }

    // Lire les identifiants OAuth
    const credentialsPath = path.join(process.cwd(), 'google-oauth-credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    // Créer le client OAuth2
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Échanger le code contre des tokens
    const { tokens } = await oAuth2Client.getToken(code);
    
    // Sauvegarder les tokens
    const tokensPath = path.join(process.cwd(), 'google-tokens.json');
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));

    console.log('✅ Tokens OAuth sauvegardés avec succès!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Authentification réussie! Les tokens ont été sauvegardés.',
      tokens: {
        access_token: tokens.access_token ? '***' : null,
        refresh_token: tokens.refresh_token ? '***' : null
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'authentification OAuth:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'authentification',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
