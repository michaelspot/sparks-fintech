// Google Apps Script pour le document Google Docs
// ID du document : 1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado

// Gestion des pré-requêtes CORS (OPTIONS)
function doOptions(e) {
  return ContentService.createTextOutput('OK');
}

// Requête GET simple pour vérifier que le service fonctionne
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    message: 'Service Google Apps Script actif',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    console.log('Requête reçue:', e);
    
    // Vérifier que la requête contient des données
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Aucune donnée reçue'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    console.log('Paramètres reçus:', e.parameter);
    
    let data;
    
    // Vérifier si les données sont envoyées comme paramètre
    if (e.parameter && e.parameter.data) {
      try {
        // Données URLSearchParams
        data = JSON.parse(e.parameter.data);
        console.log('Données parsées depuis parameter.data:', data);
      } catch (parseError) {
        console.error('Erreur de parsing parameter.data:', parseError);
        return ContentService
          .createTextOutput(JSON.stringify({
            error: 'Erreur de parsing des données: ' + parseError.toString(),
            receivedData: e.parameter.data
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    // Vérifier si les données sont envoyées dans le corps
    else if (e.postData && e.postData.contents) {
      try {
        // Données JSON directes
        data = JSON.parse(e.postData.contents);
        console.log('Données parsées depuis postData.contents:', data);
      } catch (parseError) {
        console.error('Erreur de parsing postData.contents:', parseError);
        return ContentService
          .createTextOutput(JSON.stringify({
            error: 'Erreur de parsing du JSON: ' + parseError.toString(),
            receivedData: e.postData.contents
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      console.error('Aucune donnée trouvée dans la requête');
      return ContentService
        .createTextOutput(JSON.stringify({
          error: 'Format de données non reconnu', 
          debug: 'Ni parameter.data ni postData.contents n\'est présent'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Données parsées:', data);
    
    if (!data.variables) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Variables manquantes dans les données'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ID du document template
    const TEMPLATE_DOC_ID = '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado';
    
    // Faire une copie temporaire pour éviter de modifier l'original
    console.log('Création de la copie temporaire...');
    const tempDocFile = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy('Temp_Etude_Patrimoniale_' + new Date().getTime());
    const tempDoc = DocumentApp.openById(tempDocFile.getId());
    const tempBody = tempDoc.getBody();
    
    // Remplacer toutes les variables - méthode simplifiée sans formatage
    console.log('Remplacement des variables...');
    
    // Utiliser directement replaceText sur le corps du document
    Object.keys(data.variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = data.variables[key] || '';
      console.log(`Remplacement: ${placeholder} -> ${value}`);
      
      // Remplacer le texte sans formatage
      tempBody.replaceText(placeholder, value);
    });
    
    // Supprimer les lignes vides des tableaux
    console.log('Nettoyage des tableaux...');
    cleanEmptyTableRows(tempBody);
    
    // Générer le PDF
    console.log('Génération du PDF...');
    const pdfBlob = tempDoc.getAs('application/pdf');
    
    // Supprimer le document temporaire
    console.log('Suppression du document temporaire...');
    DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
    
    // Retourner le PDF en base64
    console.log('Retour du PDF...');
    // Retourner directement le résultat sans headers CORS supplémentaires
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        pdf: Utilities.base64Encode(pdfBlob.getBytes()),
        filename: `Etude_Patrimoniale_${data.variables.nom_client || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Erreur dans doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Erreur lors de la génération du PDF: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}



function cleanEmptyTableRows(body) {
  const tables = body.getTables();
  
  tables.forEach(table => {
    const numRows = table.getNumRows();
    
    // Parcourir les lignes de bas en haut pour éviter les problèmes d'index
    for (let i = numRows - 1; i >= 0; i--) {
      const row = table.getRow(i);
      const numCells = row.getNumCells();
      let isEmpty = true;
      
      // Vérifier si toutes les cellules de la ligne sont vides
      for (let j = 0; j < numCells; j++) {
        const cellText = row.getCell(j).getText().trim();
        // Considérer comme vide si c'est vide ou si ça contient encore des variables non remplacées
        if (cellText && !cellText.match(/^\{\{.*\}\}$/)) {
          isEmpty = false;
          break;
        }
      }
      
      // Supprimer la ligne si elle est vide (mais garder au moins une ligne d'en-tête)
      if (isEmpty && i > 0) {
        table.removeRow(i);
      }
    }
  });
}

// Fonction de test (optionnelle)
function testFunction() {
  const testData = {
    variables: {
      titre_client: "Monsieur",
      nom_client: "Dupont",
      situation_professionnelle_client: "Cadre",
      age_client: "45 ans",
      situation_matrimoniale_client: "marié",
      regime_matrimonial_client: "communauté légale"
    }
  };
  
  const result = doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });
  
  console.log(result.getContent());
}
