import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// ID du document modèle Google Docs
const TEMPLATE_DOC_ID = '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado';

// Initialiser l'authentification avec le compte de service
function getGoogleAuth() {
  const credentialsPath = path.join(process.cwd(), 'google-oauth-credentials.json');
  const tokensPath = path.join(process.cwd(), 'google-tokens.json');
  
  // Vérifier que les fichiers existent
  if (!fs.existsSync(credentialsPath)) {
    throw new Error('Fichier de credentials OAuth non trouvé. Lancez d\'abord l\'authentification.');
  }
  
  if (!fs.existsSync(tokensPath)) {
    throw new Error('Tokens OAuth non trouvés. Lancez d\'abord l\'authentification.');
  }
  
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  
  // Créer le client OAuth2
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(tokens);
  
  return oAuth2Client;
}

// Remplacer les variables dans le document
async function replaceVariablesInDocument(docs: any, docId: string, variables: Record<string, string>) {
  const requests = [];
  
  // Créer les requêtes de remplacement pour chaque variable
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    requests.push({
      replaceAllText: {
        containsText: {
          text: placeholder,
          matchCase: true,
        },
        replaceText: value || '', // Si la valeur est vide, remplacer par chaîne vide
      },
    });
  }
  
  if (requests.length > 0) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variables, filename = 'analyse-patrimoniale' } = body;
    
    if (!variables || typeof variables !== 'object') {
      return NextResponse.json(
        { error: 'Variables sont requises' },
        { status: 400 }
      );
    }
    
    console.log('🚀 Début de l\'export PDF');
    console.log('📊 Variables reçues:', Object.keys(variables).length);
    
    // Initialiser les services Google avec OAuth
    const auth = getGoogleAuth();
    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });
    
    // Étape 1: Créer une copie du document template
    console.log('📄 Création d\'une copie du document template...');
    const copyResponse = await drive.files.copy({
      fileId: TEMPLATE_DOC_ID,
      requestBody: {
        name: `${filename}-${Date.now()}`,
      },
    });
    
    const newDocId = copyResponse.data.id!;
    console.log('✅ Copie créée avec l\'ID:', newDocId);
    
    // Étape 2: Remplacer les variables dans la copie
    console.log('🔄 Remplacement des variables...');
    await replaceVariablesInDocument(docs, newDocId, variables);
    console.log('✅ Variables remplacées');
    
    // Étape 3: Exporter le document en PDF
    console.log('📄 Export en PDF...');
    const pdfResponse = await drive.files.export({
      fileId: newDocId,
      mimeType: 'application/pdf',
    }, {
      responseType: 'stream'
    });
    
    console.log('✅ PDF généré');
    
    // Étape 4: Supprimer IMMÉDIATEMENT la copie temporaire pour libérer l'espace
    try {
      await drive.files.delete({
        fileId: newDocId,
      });
      console.log('🗑️ Copie temporaire supprimée (libération d\'espace)');
    } catch (deleteError) {
      console.warn('⚠️ Erreur lors de la suppression:', deleteError);
      // Continuer même si la suppression échoue
    }
    
    // Étape 5: Retourner le PDF
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      pdfResponse.data.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      pdfResponse.data.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        
        const response = new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}.pdf"`,
          },
        });
        
        console.log('🎉 PDF envoyé avec succès');
        resolve(response);
      });
      
      pdfResponse.data.on('error', (error: any) => {
        console.error('❌ Erreur lors de la génération PDF:', error);
        reject(new NextResponse(
          JSON.stringify({ error: 'Erreur lors de la génération PDF' }),
          { status: 500 }
        ));
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur dans l\'export PDF:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'export PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
