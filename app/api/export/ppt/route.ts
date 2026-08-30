import { NextRequest } from 'next/server';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// ID du template Google Docs (Format Paysage)
const TEMPLATE_DOC_ID = '1RHgg7nmm3SPHClDZm9JaeaWcum3LsXqupMEtVigEv-o';

// Initialiser l'authentification OAuth avec votre compte Gmail
function getGoogleAuth() {
    const credentialsPath = path.join(process.cwd(), 'google-oauth-credentials.json');
    const tokensPath = path.join(process.cwd(), 'google-tokens.json');

    if (!fs.existsSync(credentialsPath)) {
        throw new Error('Fichier google-oauth-credentials.json non trouvé. Téléchargez-le depuis Google Cloud Console.');
    }

    if (!fs.existsSync(tokensPath)) {
        throw new Error('Tokens OAuth non trouvés. Exécutez : node scripts/generate-oauth-token.js');
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(tokens);

    return oAuth2Client;
}

export async function POST(request: NextRequest) {
    const totalStartTime = Date.now();
    let tempFileId: string | null = null;

    try {
        const auth = getGoogleAuth();
        const drive = google.drive({ version: 'v3', auth });
        const docs = google.docs({ version: 'v1', auth });

        console.log('🚀 Export PRÉSENTATION (Mode OAuth - Compte Gmail Personnel)');

        // Étape 1: Récupérer les données
        const body = await request.json();
        const { clientData } = body;

        if (!clientData) {
            throw new Error("Données client manquantes");
        }

        const nomClient = `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim();
        const dateEtude = new Date().toLocaleDateString('fr-FR');

        const variables: Record<string, string> = {
            nomClient: nomClient,
            dateEtude: dateEtude,
            patrimoineTotal: clientData.patrimoineTotal ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(clientData.patrimoineTotal) : '',
        };

        // Étape 2: Copier le template (sur VOTRE Drive personnel = 4To disponibles)
        console.log(`📄 Copie du template sur votre Drive...`);

        const copyResponse = await drive.files.copy({
            fileId: TEMPLATE_DOC_ID,
            requestBody: {
                name: `Presentation_${nomClient.replace(/\s+/g, '_')}_${Date.now()}`,
            },
        });

        tempFileId = copyResponse.data.id!;
        console.log(`✅ Copie créée (ID: ${tempFileId})`);

        // Étape 3: Remplacer les variables
        const requests = Object.entries(variables).map(([key, value]) => ({
            replaceAllText: {
                containsText: {
                    text: `{{${key}}}`,
                    matchCase: true,
                },
                replaceText: value || '',
            },
        }));

        if (requests.length > 0) {
            await docs.documents.batchUpdate({
                documentId: tempFileId,
                requestBody: { requests },
            });
            console.log(`✅ Variables remplacées`);
        }

        // Étape 4: Exporter en PDF (Moteur de rendu Google = Fidélité 100%)
        // Ajouter un délai pour éviter le rate limiting
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        let pdfResponse;
        let retries = 3;
        let lastError;

        while (retries > 0) {
            try {
                // Attendre un peu avant l'export pour laisser Google traiter le document
                await delay(2000);

                pdfResponse = await drive.files.export({
                    fileId: tempFileId,
                    mimeType: 'application/pdf',
                }, {
                    responseType: 'arraybuffer'
                });

                break; // Succès, sortir de la boucle
            } catch (exportError: any) {
                lastError = exportError;
                retries--;

                // Log détaillé de l'erreur Google
                let errorDetails: string;
                if (exportError.response?.data) {
                    if (typeof exportError.response.data === 'string') {
                        errorDetails = exportError.response.data;
                    } else if (Buffer.isBuffer(exportError.response.data)) {
                        errorDetails = exportError.response.data.toString('utf-8');
                    } else {
                        errorDetails = JSON.stringify(exportError.response.data, null, 2);
                    }
                } else {
                    errorDetails = exportError.message;
                }
                console.log(`❌ Erreur export (code ${exportError.code || exportError.status}):`, errorDetails);

                if (retries > 0 && (exportError.code === 403 || exportError.status === 403)) {
                    console.log(`⏳ Export PDF rate limited, retry dans 5s... (${retries} essais restants)`);
                    await delay(5000); // Attendre 5 secondes avant de réessayer
                } else {
                    throw exportError;
                }
            }
        }

        if (!pdfResponse) {
            throw lastError || new Error('Export PDF échoué après plusieurs tentatives');
        }

        console.log(`📄 PDF natif généré`);

        // Étape 5: Nettoyage immédiat
        await drive.files.delete({ fileId: tempFileId });
        console.log(`🗑️ Fichier temporaire supprimé`);

        const pdfBuffer = Buffer.from(pdfResponse.data as ArrayBuffer);
        const totalTime = Date.now() - totalStartTime;
        const filename = `Presentation_Patrimoniale_${nomClient.replace(/\s+/g, '_')}.pdf`;

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'X-Processing-Time': `${totalTime}ms`,
            },
        });

    } catch (error: any) {
        console.error('❌ Erreur export PPT:', error);

        if (tempFileId) {
            try {
                const auth = getGoogleAuth();
                const drive = google.drive({ version: 'v3', auth });
                await drive.files.delete({ fileId: tempFileId });
            } catch (e) { }
        }

        return new Response(
            JSON.stringify({ error: 'Erreur génération PDF', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
