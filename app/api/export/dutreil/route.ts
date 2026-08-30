import { NextRequest } from 'next/server';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// IDs des templates
const TEMPLATE_DOC_ID = '1ds6RdCfPdA8Y5Alo_7YSnlmEg7zCVUlnt8DScarQOgg';
const TEMPLATE_SHEETS_ID = '1KGoVWbjxEfEggosGYaWxgIh2xPex1gOgeCNpOlle_LQ';

function getGoogleAuth() {
    const credentialsPath = path.join(process.cwd(), 'google-oauth-credentials.json');
    const tokensPath = path.join(process.cwd(), 'google-tokens.json');

    if (!fs.existsSync(credentialsPath)) {
        throw new Error('Fichier google-oauth-credentials.json non trouve.');
    }

    if (!fs.existsSync(tokensPath)) {
        throw new Error('Tokens OAuth non trouves. Executez : node scripts/generate-oauth-token.js');
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
    let tempDocId: string | null = null;
    let tempSheetsId: string | null = null;
    let originalSheetData: (string | number | boolean)[][] | null = null;

    try {
        const auth = getGoogleAuth();
        const drive = google.drive({ version: 'v3', auth });
        const docs = google.docs({ version: 'v1', auth });
        const sheets = google.sheets({ version: 'v4', auth });

        console.log('Export PDF PACTE DUTREIL (avec graphique lie)');

        const body = await request.json();
        const { dutreilData } = body;

        if (!dutreilData) {
            throw new Error("Donnees Dutreil manquantes");
        }

        const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value);

        const formatPercentage = (value: number) => value.toFixed(2) + '%';

        // ETAPE 1: Sauvegarder les donnees actuelles du Sheets ORIGINAL
        console.log('Sauvegarde des donnees originales du Sheets...');
        const originalDataResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: TEMPLATE_SHEETS_ID,
            range: 'A1:D4',
        });
        originalSheetData = originalDataResponse.data.values || [];
        console.log('Donnees originales sauvegardees');

        // ETAPE 2: Mettre a jour le Sheets ORIGINAL avec les nouvelles donnees
        console.log('Mise a jour temporaire du Sheets original...');
        const newSheetData = [
            ['', 'Droits dus par enfant', 'Cout total', 'Ratio de transmission'],
            ['Sans Dutreil',
                dutreilData.sansDutreil?.droitsDus || 0,
                dutreilData.sansDutreil?.coutTotal || 0,
                (dutreilData.sansDutreil?.ratioTransmission || 0) / 100
            ],
            ['Avec Dutreil en pleine propriete',
                dutreilData.avecDutreilPP?.droitsDus || 0,
                dutreilData.avecDutreilPP?.coutTotal || 0,
                (dutreilData.avecDutreilPP?.ratioTransmission || 0) / 100
            ],
            ['Avec Dutreil en nue-propriete',
                dutreilData.avecDutreilNP?.droitsDus || 0,
                dutreilData.avecDutreilNP?.coutTotal || 0,
                (dutreilData.avecDutreilNP?.ratioTransmission || 0) / 100
            ],
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: TEMPLATE_SHEETS_ID,
            range: 'A1:D4',
            valueInputOption: 'RAW',
            requestBody: {
                values: newSheetData,
            },
        });
        console.log('Sheets original mis a jour temporairement');

        // ETAPE 3: Attendre un moment pour que Google synchronise
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(2000);

        // ETAPE 4: Copier le Google Docs (le graphique pointe vers le Sheets original MAJ)
        console.log('Copie du template Docs...');
        const docsResponse = await drive.files.copy({
            fileId: TEMPLATE_DOC_ID,
            requestBody: {
                name: 'Temp_Dutreil_Docs_' + Date.now(),
            },
        });
        tempDocId = docsResponse.data.id!;
        console.log('Docs copie (ID: ' + tempDocId + ')');

        // ETAPE 5: Rafraichir le graphique lie dans le Docs copie
        console.log('Recherche et rafraichissement du graphique...');
        const docContent = await docs.documents.get({
            documentId: tempDocId,
        });

        const inlineObjects = docContent.data.inlineObjects;
        if (inlineObjects) {
            for (const [objectId, obj] of Object.entries(inlineObjects)) {
                const embeddedObject = obj.inlineObjectProperties?.embeddedObject;
                if (embeddedObject?.linkedContentReference?.sheetsChartReference) {
                    console.log('Graphique trouve, rafraichissement...');

                    // Rafraichir le graphique pour qu'il prenne les nouvelles donnees
                    await docs.documents.batchUpdate({
                        documentId: tempDocId,
                        requestBody: {
                            requests: [
                                {
                                    replaceAllShapesWithSheetsChart: {
                                        containsText: {
                                            text: '{{CHART_PLACEHOLDER}}',
                                            matchCase: false,
                                        },
                                        spreadsheetId: TEMPLATE_SHEETS_ID,
                                        chartId: embeddedObject.linkedContentReference.sheetsChartReference.chartId || 0,
                                        linkingMode: 'LINKED',
                                    },
                                },
                            ],
                        },
                    }).catch(() => {
                        // Si pas de placeholder, ignorer
                        console.log('Pas de placeholder trouve, graphique existant utilise');
                    });
                    break;
                }
            }
        }

        // ETAPE 6: Remplacer les variables texte
        console.log('Remplacement des variables texte...');
        const dateEtude = new Date().toLocaleDateString('fr-FR');

        const variables: Record<string, string> = {
            dateEtude: dateEtude,
            entrepriseName: dutreilData.entrepriseName || '',
            valorisationSociete: dutreilData.valorisationSociete ? formatCurrency(dutreilData.valorisationSociete) : '',
            nombreEnfants: dutreilData.nombreEnfants?.toString() || '',
            ageDonateur: dutreilData.ageDonateur?.toString() || '',
            valeurParEnfant: dutreilData.valeurParEnfant ? formatCurrency(dutreilData.valeurParEnfant) : '',
            sansDutreil_baseTaxable: dutreilData.sansDutreil?.baseTaxable ? formatCurrency(dutreilData.sansDutreil.baseTaxable) : '',
            sansDutreil_droitsDus: dutreilData.sansDutreil?.droitsDus ? formatCurrency(dutreilData.sansDutreil.droitsDus) : '',
            sansDutreil_coutTotal: dutreilData.sansDutreil?.coutTotal ? formatCurrency(dutreilData.sansDutreil.coutTotal) : '',
            sansDutreil_ratio: dutreilData.sansDutreil?.ratioTransmission ? formatPercentage(dutreilData.sansDutreil.ratioTransmission) : '',
            dutreilPP_abattement75: dutreilData.avecDutreilPP?.abattementDutreil75 ? formatCurrency(dutreilData.avecDutreilPP.abattementDutreil75) : '',
            dutreilPP_baseApresDutreil: dutreilData.avecDutreilPP?.baseApresDutreil ? formatCurrency(dutreilData.avecDutreilPP.baseApresDutreil) : '',
            dutreilPP_baseTaxable: dutreilData.avecDutreilPP?.baseTaxable ? formatCurrency(dutreilData.avecDutreilPP.baseTaxable) : '',
            dutreilPP_droitsDus: dutreilData.avecDutreilPP?.droitsDus ? formatCurrency(dutreilData.avecDutreilPP.droitsDus) : '',
            dutreilPP_coutTotal: dutreilData.avecDutreilPP?.coutTotal ? formatCurrency(dutreilData.avecDutreilPP.coutTotal) : '',
            dutreilPP_ratio: dutreilData.avecDutreilPP?.ratioTransmission ? formatPercentage(dutreilData.avecDutreilPP.ratioTransmission) : '',
            dutreilPP_reduction50: dutreilData.avecDutreilPP?.reductionSi70ans ? formatCurrency(dutreilData.avecDutreilPP.reductionSi70ans) : '0 EUR',
            dutreilNP_pourcentageNP: dutreilData.avecDutreilNP?.pourcentageNP ? formatPercentage(dutreilData.avecDutreilNP.pourcentageNP) : '',
            dutreilNP_valorisationNP: dutreilData.avecDutreilNP?.valorisationNP ? formatCurrency(dutreilData.avecDutreilNP.valorisationNP) : '',
            dutreilNP_abattement75: dutreilData.avecDutreilNP?.abattementDutreil75 ? formatCurrency(dutreilData.avecDutreilNP.abattementDutreil75) : '',
            dutreilNP_baseApresDutreil: dutreilData.avecDutreilNP?.baseApresDutreil ? formatCurrency(dutreilData.avecDutreilNP.baseApresDutreil) : '',
            dutreilNP_baseTaxable: dutreilData.avecDutreilNP?.baseTaxable ? formatCurrency(dutreilData.avecDutreilNP.baseTaxable) : '',
            dutreilNP_droitsDus: dutreilData.avecDutreilNP?.droitsDus ? formatCurrency(dutreilData.avecDutreilNP.droitsDus) : '',
            dutreilNP_coutTotal: dutreilData.avecDutreilNP?.coutTotal ? formatCurrency(dutreilData.avecDutreilNP.coutTotal) : '',
            dutreilNP_ratio: dutreilData.avecDutreilNP?.ratioTransmission ? formatPercentage(dutreilData.avecDutreilNP.ratioTransmission) : '',
            economiePP: dutreilData.sansDutreil?.coutTotal && dutreilData.avecDutreilPP?.coutTotal
                ? formatCurrency(dutreilData.sansDutreil.coutTotal - dutreilData.avecDutreilPP.coutTotal) : '',
            economieNP: dutreilData.sansDutreil?.coutTotal && dutreilData.avecDutreilNP?.coutTotal
                ? formatCurrency(dutreilData.sansDutreil.coutTotal - dutreilData.avecDutreilNP.coutTotal) : '',
        };

        const textRequests = Object.entries(variables).map(([key, value]) => ({
            replaceAllText: {
                containsText: { text: '{{' + key + '}}', matchCase: true },
                replaceText: value || '',
            },
        }));

        if (textRequests.length > 0) {
            await docs.documents.batchUpdate({
                documentId: tempDocId,
                requestBody: { requests: textRequests },
            });
            console.log('Variables texte remplacees');
        }

        // ETAPE 7: Exporter en PDF
        console.log('Export en PDF...');
        await delay(3000);

        let pdfResponse;
        let retries = 3;
        let lastError;

        while (retries > 0) {
            try {
                await delay(2000);
                pdfResponse = await drive.files.export({
                    fileId: tempDocId,
                    mimeType: 'application/pdf',
                }, {
                    responseType: 'arraybuffer'
                });
                break;
            } catch (exportError: unknown) {
                lastError = exportError;
                retries--;
                console.log('Retry PDF export... (' + retries + ' restants)');
                if (retries > 0) await delay(5000);
                else throw exportError;
            }
        }

        if (!pdfResponse) {
            throw lastError || new Error('Export PDF echoue');
        }

        console.log('PDF genere');

        // ETAPE 8: Restaurer les donnees originales du Sheets
        console.log('Restauration des donnees originales du Sheets...');
        if (originalSheetData && originalSheetData.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: TEMPLATE_SHEETS_ID,
                range: 'A1:D4',
                valueInputOption: 'RAW',
                requestBody: {
                    values: originalSheetData,
                },
            });
            console.log('Donnees originales restaurees');
        }

        // ETAPE 9: Nettoyage du Docs temporaire
        console.log('Nettoyage...');
        await drive.files.delete({ fileId: tempDocId });
        console.log('Fichier temporaire supprime');

        const pdfBuffer = Buffer.from(pdfResponse.data as ArrayBuffer);
        const entrepriseName = dutreilData.entrepriseName?.replace(/\s+/g, '_') || 'Export';
        const filename = 'Simulation_Dutreil_' + entrepriseName + '.pdf';

        console.log('Export termine en ' + (Date.now() - totalStartTime) + 'ms');

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="' + filename + '"',
            },
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('Erreur export Dutreil:', errorMessage);

        // TOUJOURS restaurer les donnees originales en cas d'erreur
        if (originalSheetData && originalSheetData.length > 0) {
            try {
                const auth = getGoogleAuth();
                const sheets = google.sheets({ version: 'v4', auth });
                await sheets.spreadsheets.values.update({
                    spreadsheetId: TEMPLATE_SHEETS_ID,
                    range: 'A1:D4',
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: originalSheetData,
                    },
                });
                console.log('Donnees originales restaurees apres erreur');
            } catch (e) {
                console.error('Erreur lors de la restauration:', e);
            }
        }

        const auth = getGoogleAuth();
        const drive = google.drive({ version: 'v3', auth });

        if (tempDocId) {
            try { await drive.files.delete({ fileId: tempDocId }); } catch (e) { /* ignore */ }
        }
        if (tempSheetsId) {
            try { await drive.files.delete({ fileId: tempSheetsId }); } catch (e) { /* ignore */ }
        }

        return new Response(
            JSON.stringify({ error: 'Erreur generation PDF Dutreil', details: errorMessage }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
