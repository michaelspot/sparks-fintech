/**
 * Script d'authentification OAuth pour générer le fichier google-tokens.json
 *
 * Exécutez ce script UNE SEULE FOIS avec : node scripts/generate-oauth-token.js
 * Il ouvrira votre navigateur pour vous connecter avec votre compte Gmail.
 * Une fois connecté, il générera le fichier google-tokens.json à la racine.
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const open = require('open');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de credentials OAuth téléchargé depuis Google Cloud Console
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-oauth-credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'google-tokens.json');

// Scopes nécessaires
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents'
];

async function authenticate() {
  // Lire les credentials
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Fichier google-oauth-credentials.json introuvable.');
    console.error('   Téléchargez-le depuis Google Cloud Console > APIs & Services > Identifiants');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Générer l'URL d'autorisation
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force l'affichage du consentement pour obtenir un refresh_token
  });

  console.log('🔐 Authentification OAuth requise.');
  console.log('📖 Votre navigateur va s\'ouvrir pour vous connecter avec votre compte Gmail.');
  console.log('');
  console.log('Si le navigateur ne s\'ouvre pas automatiquement, copiez ce lien :');
  console.log(authUrl);
  console.log('');

  // Créer un serveur temporaire pour recevoir le code
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url.indexOf('/api/auth/callback') > -1) {
          const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
          const code = qs.get('code');

          res.end('✅ Authentification réussie ! Vous pouvez fermer cet onglet et retourner au terminal.');

          server.destroy();

          // Échanger le code contre des tokens
          const { tokens } = await oAuth2Client.getToken(code);

          // Sauvegarder les tokens
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

          console.log('');
          console.log('✅ Tokens OAuth sauvegardés dans google-tokens.json');
          console.log('🎉 Configuration terminée ! Vous pouvez maintenant lancer votre serveur.');

          resolve(oAuth2Client);
        }
      } catch (e) {
        reject(e);
      }
    }).listen(3000, () => {
      // Ouvrir le navigateur
      open(authUrl, { wait: false }).then(cp => cp.unref());
    });

    // Gérer la fermeture propre du serveur
    server.destroy = function() {
      server.close();
    };
  });
}

authenticate().catch(console.error);
