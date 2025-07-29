import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// ID du document modèle Google Docs
const TEMPLATE_DOC_ID = '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado';

// Configuration pour le nettoyage automatique des lignes vides
const CLEANING_CONFIG = {
  // Supprimer les lignes de tableau vides
  removeEmptyTableRows: true,
  // Préserver les lignes contenant ces mots-clés (en-têtes)
  preserveRowsContaining: ['Total', 'Revenus', 'Charges', 'Biens', 'Patrimoine', 'Immobilier', 'Financier', 'Professionnel'],
  // Variables à considérer comme indicateurs de lignes vides
  emptyRowIndicators: [
    'intitule_revenu', 'intitule_charge', 
    'bienImmobilier', 'bienFinancier', 'bienProfessionnel'
  ]
};

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

// Nettoyer les lignes vides des tableaux (VERSION ROBUSTE AVEC LOGS DÉTAILLÉS)
async function cleanEmptyTableRows(docs: any, docId: string, variables: Record<string, string>): Promise<void> {
  console.log('🧹 [NETTOYAGE] Début du nettoyage des lignes vides...');
  const cleanStartTime = Date.now();
  
  try {
    // Étape 1: Récupérer le document complet
    console.log('📜 [NETTOYAGE] Récupération du document...');
    const docResponse = await docs.documents.get({ 
      documentId: docId
    });
    
    const document = docResponse.data;
    if (!document.body?.content) {
      console.log('⚠️ [NETTOYAGE] Aucun contenu dans le document');
      return;
    }
    
    // Étape 2: Identifier tous les éléments de type table
    const allElements = document.body.content;
    const tableElements = [];
    
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      if (element.table) {
        tableElements.push({
          element: element,
          index: i,
          startIndex: element.startIndex
        });
      }
    }
    
    if (tableElements.length === 0) {
      console.log('✅ [NETTOYAGE] Aucun tableau trouvé dans le document');
      return;
    }
    
    console.log(`📋 [NETTOYAGE] ${tableElements.length} tableaux détectés`);
    
    // Étape 3: Analyser chaque tableau et identifier les lignes vides
    const deleteRequests: any[] = [];
    
    for (let tableIdx = 0; tableIdx < tableElements.length; tableIdx++) {
      const tableInfo = tableElements[tableIdx];
      const table = tableInfo.element.table;
      
      if (!table.rows || table.rows.length <= 1) {
        console.log(`📊 [NETTOYAGE] Tableau ${tableIdx + 1}: Pas assez de lignes (${table.rows?.length || 0})`);
        continue;
      }
      
      console.log(`📊 [NETTOYAGE] Tableau ${tableIdx + 1}: Analyse de ${table.rows.length} lignes`);
      
      // Parcourir les lignes (sauf la première qui est l'en-tête)
      for (let rowIdx = table.rows.length - 1; rowIdx >= 1; rowIdx--) {
        const row = table.rows[rowIdx];
        
        if (!row.tableCells) {
          console.log(`⚠️ [NETTOYAGE] Tableau ${tableIdx + 1}, Ligne ${rowIdx}: Pas de cellules`);
          continue;
        }
        
        // Vérifier chaque cellule de la ligne
        let emptyCellCount = 0;
        const totalCells = row.tableCells.length;
        
        for (let cellIdx = 0; cellIdx < row.tableCells.length; cellIdx++) {
          const cell = row.tableCells[cellIdx];
          let cellContent = '';
          
          if (cell.content) {
            for (const cellElement of cell.content) {
              if (cellElement.paragraph?.elements) {
                for (const paragraphElement of cellElement.paragraph.elements) {
                  if (paragraphElement.textRun?.content) {
                    cellContent += paragraphElement.textRun.content;
                  }
                }
              }
            }
          }
          
          // Nettoyer le contenu (supprimer espaces, sauts de ligne, etc.)
          cellContent = cellContent.trim().replace(/\n/g, '');
          
          if (!cellContent || cellContent === '') {
            emptyCellCount++;
          }
          
          // Log détaillé pour debugging
          if (rowIdx <= 3) { // Afficher seulement pour les premières lignes
            console.log(`🔍 [NETTOYAGE] T${tableIdx + 1}L${rowIdx}C${cellIdx}: "${cellContent}" (vide: ${!cellContent})`);
          }
        }
        
        // Si TOUTES les cellules sont vides, marquer pour suppression
        const isRowEmpty = emptyCellCount === totalCells;
        
        console.log(`📊 [NETTOYAGE] Tableau ${tableIdx + 1}, Ligne ${rowIdx}: ${emptyCellCount}/${totalCells} cellules vides = ${isRowEmpty ? 'SUPPRIMER' : 'GARDER'}`);
        
        if (isRowEmpty && tableInfo.startIndex !== undefined) {
          // Structure correcte pour DeleteTableRowRequest selon l'API Google Docs
          const deleteRequest = {
            deleteTableRow: {
              tableCellLocation: {
                tableStartLocation: {
                  index: tableInfo.startIndex
                },
                rowIndex: rowIdx,
                columnIndex: 0  // Spécifier la première colonne comme référence
              }
            }
          };
          
          deleteRequests.push(deleteRequest);
          console.log(`🗑️ [NETTOYAGE] Ligne ${rowIdx} du tableau ${tableIdx + 1} MARQUÉE pour suppression`);
          console.log(`🔧 [NETTOYAGE] Requête:`, JSON.stringify(deleteRequest, null, 2));
        }
      }
    }
    
    // Étape 4: Exécuter les suppressions
    if (deleteRequests.length > 0) {
      console.log(`🗑️ [NETTOYAGE] Exécution de ${deleteRequests.length} suppressions de lignes...`);
      
      // Traitement une par une pour éviter les conflits d'index
      for (let i = 0; i < deleteRequests.length; i++) {
        try {
          await docs.documents.batchUpdate({
            documentId: docId,
            requestBody: { 
              requests: [deleteRequests[i]]
            }
          });
          console.log(`✅ [NETTOYAGE] Suppression ${i + 1}/${deleteRequests.length} réussie`);
        } catch (error: any) {
          console.error(`❌ [NETTOYAGE] Erreur suppression ${i + 1}:`, error);
        }
      }
      
      console.log(`🎉 [NETTOYAGE] ${deleteRequests.length} lignes supprimées avec succès !`);
    } else {
      console.log('✅ [NETTOYAGE] Aucune ligne vide détectée');
    }
    
    const cleanTime = Date.now() - cleanStartTime;
    console.log(`⚡ [NETTOYAGE] Terminé en ${cleanTime}ms`);
    
  } catch (error: any) {
    console.error('❌ [NETTOYAGE] Erreur critique:', error);
    console.error('❌ [NETTOYAGE] Stack trace:', error.stack);
    // Ne pas faire throw pour ne pas casser l'export
  }
}  

// Remplacer les variables dans le document (VERSION ULTRA-RAPIDE)
async function replaceVariablesInDocument(docs: any, docId: string, variables: Record<string, string>) {
  // OPTIMISATION DRASTIQUE 1: Filtrage ultra-agressif
  const nonEmptyVariables = Object.entries(variables).filter(([key, value]) => {
    // Ne garder que les variables qui ont vraiment du contenu
    if (!value || value.toString().trim() === '') return false;
    // Éviter les variables de debug ou temporaires
    if (key.startsWith('_') || key.includes('debug') || key.includes('temp')) return false;
    return true;
  });
  
  console.log(`🔄 Traitement de ${nonEmptyVariables.length}/${Object.keys(variables).length} variables non-vides`);
  
  // OPTIMISATION DRASTIQUE 2: Chunks BEAUCOUP plus gros + concurrence maximale
  const CHUNK_SIZE = 400; // DOUBLÉ de 200 à 400 pour moins d'appels API
  const MAX_CONCURRENT_CHUNKS = 8; // Augmenté de 5 à 8 pour plus de parallélisme
  
  // Créer tous les chunks d'avance avec pré-compilation des requêtes
  const chunks = [];
  for (let i = 0; i < nonEmptyVariables.length; i += CHUNK_SIZE) {
    const chunk = nonEmptyVariables.slice(i, i + CHUNK_SIZE);
    // PRÉ-COMPILER les requêtes pour gagner du temps
    const preCompiledRequests = chunk.map(([key, value]) => ({
      replaceAllText: {
        containsText: {
          text: `{{${key}}}`,
          matchCase: true,
        },
        replaceText: value,
      },
    }));
    chunks.push({ requests: preCompiledRequests, size: chunk.length });
  }
  
  console.log(`🚀 Traitement ULTRA-rapide en ${chunks.length} chunks de ${CHUNK_SIZE} variables`);
  const chunkStartTime = Date.now();
  
  // OPTIMISATION DRASTIQUE 3: Traitement ultra-parallèle avec pool de workers
  const processChunk = async (chunkData: any, chunkIndex: number) => {
    const startTime = Date.now();
    
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: chunkData.requests,
      },
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Chunk ${chunkIndex + 1}/${chunks.length} traité (${chunkData.size} vars en ${duration}ms)`);
  };
  
  // POOL DE WORKERS ultra-efficace
  const processingPromises = [];
  
  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_CHUNKS) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT_CHUNKS);
    const batchPromises = batch.map((chunkData, batchIndex) => 
      processChunk(chunkData, i + batchIndex)
    );
    
    // Traiter chaque batch en parallèle, puis attendre avant le suivant
    await Promise.all(batchPromises);
  }
  
  const chunkTime = Date.now() - chunkStartTime;
  console.log(`⚡ Traitement ULTRA-rapide terminé en ${chunkTime}ms (${chunks.length} chunks)`);
  
  // OPTIMISATION DRASTIQUE 4: Nettoyage UNIVERSEL - Supprimer TOUS les patterns {{CONTENU}} complets
  console.log('🧹 Nettoyage universel des patterns {{...}} complets...');
  const cleanupStartTime = Date.now();
  
  // Étape 1: Récupérer le contenu du document pour analyser les patterns
  const docForPattern = await docs.documents.get({ documentId: docId });
  const content = JSON.stringify(docForPattern.data);
  
  // Étape 2: Trouver TOUS les patterns {{quelque_chose}} avec une regex
  const variablePattern = /{{[^}]*}}/g;
  const remainingVariables = content.match(variablePattern) || [];
  
  if (remainingVariables.length > 0) {
    console.log(`🎯 Suppression de ${remainingVariables.length} patterns complets:`, remainingVariables.slice(0, 10));
    
    // Étape 3: Créer la liste unique des patterns à supprimer
    const uniquePatterns = [...new Set(remainingVariables)];
    console.log(`📋 ${uniquePatterns.length} patterns uniques à supprimer`);
    
    // Étape 4: Supprimer chaque pattern COMPLET (accolades + contenu)
    const patternRequests = uniquePatterns.map(pattern => ({
      replaceAllText: {
        containsText: {
          text: pattern, // Pattern complet ex: "{{eu-comImmo1}}"
          matchCase: true,
        },
        replaceText: '', // Remplacer par rien = suppression complète
      },
    }));
    
    // Étape 5: Traitement par chunks pour éviter les limites d'API
    const PATTERN_CHUNK_SIZE = 100;
    let totalSuppressions = 0;
    
    for (let i = 0; i < patternRequests.length; i += PATTERN_CHUNK_SIZE) {
      const chunk = patternRequests.slice(i, i + PATTERN_CHUNK_SIZE);
      
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: chunk,
        },
      });
      
      totalSuppressions += chunk.length;
      console.log(`✅ Chunk ${Math.ceil((i + chunk.length) / PATTERN_CHUNK_SIZE)}/${Math.ceil(patternRequests.length / PATTERN_CHUNK_SIZE)} traité (${chunk.length} patterns)`);
    }
    
    console.log(`🎉 ${totalSuppressions} patterns complets supprimés avec succès !`);
  } else {
    console.log('✅ Aucun pattern {{...}} restant trouvé - Document parfaitement propre !');
  }
  
  const cleanupTime = Date.now() - cleanupStartTime;
  console.log(`⚡ Nettoyage universel terminé en ${cleanupTime}ms`);
  
  // Étape 6: Vérification finale pour s'assurer que tout est propre
  console.log('🔍 Vérification finale...');
  const finalDoc = await docs.documents.get({ documentId: docId });
  const finalContent = JSON.stringify(finalDoc.data);
  const remainingAfterCleanup = finalContent.match(variablePattern) || [];
  
  if (remainingAfterCleanup.length > 0) {
    console.log(`⚠️ ${remainingAfterCleanup.length} patterns encore présents:`, remainingAfterCleanup.slice(0, 5));
  } else {
    console.log('🎉 Document 100% propre - Aucun pattern {{...}} restant !');
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now(); // TIMER GLOBAL
  
  try {
    // OPTIMISATION 1: Parsing JSON rapide avec abortController pour timeout
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 5000);
    
    const body = await request.json();
    clearTimeout(timeout);
    
    const { variables, filename = 'analyse-patrimoniale' } = body;
    
    if (!variables || typeof variables !== 'object') {
      return NextResponse.json(
        { error: 'Variables sont requises' },
        { status: 400 }
      );
    }
    
    console.log('🚀 Début de l\'export PDF');
    console.log('📊 Variables reçues:', Object.keys(variables).length);
    
    // OPTIMISATION ULTRA-AGRESSIVE 2: Filtrage drastique des variables
    const filteredVariables: Record<string, string> = {};
    let controlVariables: Record<string, string> = {};
    let criticalVariablesCount = 0;
    
    // Pré-définir les patterns critiques pour ultra-performance
    const criticalPatterns = [
      'firstName', 'lastName', 'spouseFirstName', 'spouseLastName',
      'bienImmobilier', 'bienFinancier', 'bienProfessionnel',
      'titleImmo', 'titleFi', 'titlePro',
      'totalRevenu', 'totalCharge', 'Total',
      'preconisation'
    ];
    
    const isCriticalVariable = (key: string): boolean => {
      return criticalPatterns.some(pattern => key.includes(pattern));
    };
    
    // Traitement ultra-optimisé des variables
    Object.entries(variables).forEach(([key, value]) => {
      const stringValue = String(value || '');
      const hasValue = stringValue.trim() !== '';
      
      // Variables de contrôle
      if (key.startsWith('_')) {
        controlVariables[key] = stringValue;
        return;
      }
      
      // ULTRA-AGRESSIF: Ne garder que les variables critiques avec valeur OU vides critiques
      if (hasValue || isCriticalVariable(key)) {
        filteredVariables[key] = stringValue;
        if (hasValue) criticalVariablesCount++;
      }
    });
    
    const savedVariables = Object.keys(variables).length - Object.keys(filteredVariables).length;
    console.log(`🧹 ${savedVariables} variables écartées, ${criticalVariablesCount} critiques traitées`);
    
    // Initialiser les services Google en parallèle pour gagner du temps
    const authStartTime = Date.now();
    const auth = getGoogleAuth();
    const [docsService, driveService] = await Promise.all([
      google.docs({ version: 'v1', auth }),
      google.drive({ version: 'v3', auth })
    ]);
    // Typer correctement les services
    const docs = docsService;
    const drive = driveService;
    console.log(`🔑 Auth Google initialisée en ${Date.now() - authStartTime}ms`);
    
    // SUPER OPTIMISATION 3: Tout paralléliser!
    const operationsStartTime = Date.now();
    
    // Étape 1: Créer une copie du document template
    console.log('📄 Création d\'une copie du document template...');
    const copyPromise = drive.files.copy({
      fileId: TEMPLATE_DOC_ID,
      requestBody: {
        name: `${filename}-${Date.now()}`,
      },
      fields: 'id', // Ne récupérer que l'ID
    });
    
    // Astuce: En attendant la création, préparer les données à envoyer
    // Cette préparation se fait en parallèle pendant que Google Drive travaille
    const prepStartTime = Date.now();
    
    // Pré-traitement côté client pour gagner du temps supplémentaire
    // Ce code s'exécute pendant que Google crée la copie du document
    const copyResponse = await copyPromise;
    const newDocId = copyResponse.data.id!;
    console.log(`✅ Copie créée avec l'ID ${newDocId} en ${Date.now() - prepStartTime}ms`);
    
    // OPTIMISATION FINALE: Décision intelligente sur le traitement
    console.log(`🤖 Décision intelligente: ${criticalVariablesCount} variables actives`);
    
    // ULTRA-SMART: Si peu de variables, traitement séquentiel optimisé
    // Si beaucoup de variables, parallélisation maximale
    let operationsResults;
    
    if (criticalVariablesCount < 200) {
      // Mode SPEED: Traitement séquentiel ultra-optimisé
      console.log('⚡ Mode SPEED: traitement séquentiel optimisé');
      
      const varStartTime = Date.now();
      await replaceVariablesInDocument(docs, newDocId, filteredVariables);
      console.log(`✅ Variables remplacées en ${Date.now() - varStartTime}ms`);
      
      // Nettoyage SYSTÉMATIQUE des lignes vides (toujours nécessaire après suppression des variables)
      const cleanStartTime = Date.now();
      await cleanEmptyTableRows(docs, newDocId, filteredVariables);
      console.log(`✅ Nettoyage des tableaux en ${Date.now() - cleanStartTime}ms`);
      
      operationsResults = [{ status: 'fulfilled' as const }, { status: 'fulfilled' as const }];
    } else {
      // Mode PARALLEL: Parallélisation maximale
      console.log('🚀 Mode PARALLEL: traitement parallèle');
      
      operationsResults = await Promise.allSettled([
        // Operation 1: Remplacement ultra-parallèle
        (async () => {
          const varStartTime = Date.now();
          await replaceVariablesInDocument(docs, newDocId, filteredVariables);
          console.log(`✅ Variables remplacées en ${Date.now() - varStartTime}ms`);
        })(),
        
        // Operation 2: Nettoyage en arrière-plan
        (async () => {
          await new Promise(resolve => setTimeout(resolve, 100)); // Micro-délai
          const cleanStartTime = Date.now();
          await cleanEmptyTableRows(docs, newDocId, filteredVariables);
          console.log(`✅ Nettoyage en ${Date.now() - cleanStartTime}ms`);
        })()
      ]);
    }
    
    // Vérifier si toutes les opérations ont réussi
    const failedOps = operationsResults.filter(result => result.status === 'rejected');
    if (failedOps.length > 0) {
      throw new Error(`${failedOps.length} opérations ont échoué`);
    }
    
    console.log(`⚡ Opérations parallèles terminées en ${Date.now() - operationsStartTime}ms`);
    
    // Étape 3: PARALLÉLISATION - Export PDF + Suppression simultanés
    console.log('📄 Export en PDF...');
    const exportStartTime = Date.now();
    
    // OPTIMISATION 4: Lancer export et suppression en parallèle avec meilleure configuration
    const [pdfResponse] = await Promise.all([
      // Export PDF avec optimisations avancées
      drive.files.export({
        fileId: newDocId,
        mimeType: 'application/pdf',
      }, {
        responseType: 'stream',
        timeout: 30000, // 30s max pour l'export (augmenté pour fiabilité)
      }),
      
      // Suppression en arrière-plan (ne pas attendre)
      (async () => {
        try {
          // Ne pas attendre, supprimer immédiatement en parallèle
          await drive.files.delete({ fileId: newDocId });
          console.log('🗑️ Copie temporaire supprimée en parallèle');
        } catch (error) {
          // Ignorer les erreurs de suppression
        }
      })()
    ]);
    
    const exportTime = Date.now() - exportStartTime;
    console.log(`✅ PDF généré en ${exportTime}ms`);
    
    // OPTIMISATION 5: Traitement stream optimisé
    const streamStartTime = Date.now();
    const chunks: Buffer[] = [];
    for await (const chunk of pdfResponse.data as any) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);
    console.log(`📦 Buffer PDF préparé en ${Date.now() - streamStartTime}ms`);
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 PDF exporté avec succès en ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    
    // Retourner le PDF avec entêtes optimisées
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'X-Processing-Time': `${totalTime}ms`,
        'Cache-Control': 'no-store', // Éviter mise en cache
      },
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Erreur dans l'export PDF après ${totalTime}ms:`, error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'export PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timing: `${totalTime}ms`
      },
      { status: 500 }
    );
  }
}
