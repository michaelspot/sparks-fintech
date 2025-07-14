function doPost(e) {
  try {
    // Vérifier que nous avons des données
    if (!e.postData || !e.postData.contents) {
      throw new Error('Aucune donnée reçue');
    }
    
    const data = JSON.parse(e.postData.contents);
    
    // ID de votre template Google Docs - REMPLACEZ PAR VOTRE ID
    const TEMPLATE_DOC_ID = '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado';
    
    // Vérifier que le template existe
    let templateDoc;
    try {
      templateDoc = DriveApp.getFileById(TEMPLATE_DOC_ID);
    } catch (error) {
      throw new Error(`Template non trouvé avec l'ID: ${TEMPLATE_DOC_ID}. Vérifiez l'ID dans le script.`);
    }
    
    // Faire une copie du template
    const timestamp = new Date().getTime();
    const firstName = data.variables?.firstName || 'Client';
    const lastName = data.variables?.lastName || 'Export';
    const copyName = `Export_${firstName}_${lastName}_${timestamp}`;
    
    const docCopy = templateDoc.makeCopy(copyName);
    
    // Ouvrir le document pour modification
    const doc = DocumentApp.openById(docCopy.getId());
    const body = doc.getBody();
    
    // Récupérer les variables
    const variables = data.variables || {};
    
    // REMPLACEMENT OPTIMISÉ - UNE SEULE MÉTHODE RAPIDE
    // Filtrer les variables spéciales de contrôle
    const controlVars = ['_CLEAN_EMPTY_ROWS', '_CLEAN_TABLES', '_EMPTY_VARIABLES'];
    const actualVariables = Object.entries(variables).filter(([key]) => !controlVars.includes(key));
    
    // Remplacement en lot avec replaceText (beaucoup plus rapide)
    for (const [key, value] of actualVariables) {
      const placeholder = `{{${key}}}`;
      const replacementValue = String(value || '');
      
      try {
        body.replaceText(placeholder, replacementValue);
      } catch (error) {
        // Ignorer les erreurs de remplacement pour ne pas ralentir
      }
    }
    
    // 🧹 NETTOYAGE DES LIGNES VIDES DANS LES TABLEAUX
    if (variables['_CLEAN_EMPTY_ROWS'] === 'smart') {
      const emptyVariables = variables['_EMPTY_VARIABLES'] ? variables['_EMPTY_VARIABLES'].split(',') : [];
      cleanEmptyTableRows(doc, emptyVariables);
    }
    
    // Sauvegarder le document
    doc.saveAndClose();
    
    // Convertir en PDF
    let pdfBlob;
    try {
      pdfBlob = docCopy.getAs('application/pdf');
    } catch (error) {
      throw new Error(`Erreur génération PDF: ${error.toString()}`);
    }
    
    // Encoder en base64
    let base64;
    try {
      base64 = Utilities.base64Encode(pdfBlob.getBytes());
    } catch (error) {
      throw new Error(`Erreur encodage base64: ${error.toString()}`);
    }
    
    // Nettoyer - supprimer la copie Google Docs
    try {
      DriveApp.getFileById(docCopy.getId()).setTrashed(true);
    } catch (error) {
      // Ignorer les erreurs de suppression
    }
    
    // Créer le nom du fichier
    const filename = `${firstName}_${lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        pdf: base64,
        filename: filename,
        message: 'PDF généré avec succès',
        stats: {
          variables: Object.keys(variables).length
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Erreur lors de la génération du PDF',
        stack: error.stack || 'Pas de stack trace disponible'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 🧩 FONCTION DE NETTOYAGE OPTIMISÉE DES LIGNES VIDES
function cleanEmptyTableRows(doc, emptyVariables) {
  const body = doc.getBody();
  const tables = body.getTables();
  
  // Fonction améliorée pour vérifier si une cellule est vide
  function isCellEmpty(cell) {
    const cellText = cell.getText().trim();
    
    // Cellule complètement vide
    if (!cellText || cellText === '') return true;
    
    // Cellule contenant seulement des espaces ou caractères invisibles
    if (cellText.replace(/\s+/g, '') === '') return true;
    
    // Cellule contenant seulement des variables non remplacées
    const variableMatches = cellText.match(/\{\{([^}]+)\}\}/g);
    if (variableMatches) {
      // Vérifier si TOUTES les variables de la cellule sont vides
      let allVariablesEmpty = true;
      for (const match of variableMatches) {
        const variableName = match.replace(/[{}]/g, '');
        if (!emptyVariables.includes(variableName)) {
          allVariablesEmpty = false;
          break;
        }
      }
      
      // Si toutes les variables sont vides ET il n'y a que des variables
      const textWithoutVariables = cellText.replace(/\{\{[^}]+\}\}/g, '').trim();
      if (allVariablesEmpty && textWithoutVariables === '') {
        return true;
      }
    }
    
    return false;
  }
  
  // Traiter chaque tableau (optimisé)
  tables.forEach((table, tableIndex) => {
    const initialRows = table.getNumRows();
    
    // Parcourir les lignes en sens inverse (important !)
    for (let rowIndex = initialRows - 1; rowIndex >= 1; rowIndex--) { // Commencer à partir de la ligne 1 (pas 0 = en-tête)
      try {
        const row = table.getRow(rowIndex);
        const numCells = row.getNumCells();
        
        // Vérifier chaque cellule de la ligne
        let allCellsEmpty = true;
        
        for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
          const cell = row.getCell(cellIndex);
          
          if (!isCellEmpty(cell)) {
            allCellsEmpty = false;
            break; // Optimisation: arrêter dès qu'on trouve une cellule non vide
          }
        }
        
        // Supprimer la ligne si toutes les cellules sont vides
        if (allCellsEmpty) {
          table.removeRow(rowIndex);
        }
        
      } catch (error) {
        // Ignorer les erreurs pour ne pas ralentir
      }
    }
  });
}
