import { NextRequest } from 'next/server';
import { google } from 'googleapis';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  const totalStartTime = Date.now();
  
  try {
    console.log('🚀 Export PDF RAPIDE - Début avec Google Docs');
    
    // Étape 1: Récupérer les variables (0.1ms)
    const startParse = Date.now();
    const variables = await request.json();
    console.log(`📊 Variables reçues: ${Object.keys(variables).length} en ${Date.now() - startParse}ms`);
    
    // Étape 2: Télécharger le Google Docs en HTML (50-200ms)
    const startDownload = Date.now();
    const GOOGLE_DOC_ID = '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado';
    
    // Configuration Google API
    const auth = new google.auth.GoogleAuth({
      keyFile: './google-service-account.json',
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Télécharger le document en HTML
    const response = await drive.files.export({
      fileId: GOOGLE_DOC_ID,
      mimeType: 'text/html',
    });
    
    let htmlContent = response.data as string;
    console.log(`📄 Google Docs téléchargé en HTML en ${Date.now() - startDownload}ms`);
    
    // Injection du CSS pour marges spécifiques par page et interligne
    const pageMarginCSS = `
    <style>
      @page :first {
        margin-top: 0cm;
        margin-bottom: 2cm;
        margin-left: 0cm;
        margin-right: 0cm;
      }
      @page {
        margin-top: 2cm;
        margin-bottom: 2cm;
        margin-left: 0cm;
        margin-right: 0cm;
      }
      
      /* Interligne 1,1 uniquement sur les paragraphes et contenu texte (pas les titres) */
      p, div, span, li, td, th {
        line-height: 1.1 !important;
      }
      
      /* Éviter les coupures de tableaux et sections */
      table {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-before: auto !important;
        page-break-after: auto !important;
      }
      
      /* Éviter les coupures des lignes de tableau */
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      /* Éviter les coupures des sections importantes */
      .section, .tableau-section {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      /* Contrôler les coupures avant les titres */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    </style>
    `;
    
    // Insérer le CSS avant la fermeture du <head> ou au début du <body>
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', pageMarginCSS + '</head>');
    } else if (htmlContent.includes('<body')) {
      htmlContent = htmlContent.replace('<body', pageMarginCSS + '<body');
    } else {
      htmlContent = pageMarginCSS + htmlContent;
    }
    
    console.log('🎨 CSS de marges spécifiques injecté');
    
    // Étape 3: Remplacement ultra-rapide des variables (10-50ms)
    const startReplace = Date.now();
    let replacementCount = 0;
    
    // Filtrage intelligent des variables à remplacer
    const filteredVariables = Object.entries(variables).filter(([key, value]) => {
      // Ne traiter que les variables qui ont du contenu ou qui sont critiques
      if (value && String(value).trim() !== '') return true;
      if (key.includes('title') || key.includes('bien') || key.includes('Total')) return true;
      return false;
    });
    
    console.log(`🧹 ${Object.keys(variables).length - filteredVariables.length} variables vides ignorées`);
    
    // Remplacement ultra-efficace avec regex globale
    for (const [key, value] of filteredVariables) {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value || '');
      
      // Compter et remplacer en une passe
      const beforeLength = htmlContent.length;
      htmlContent = htmlContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stringValue);
      const afterLength = htmlContent.length;
      
      if (beforeLength !== afterLength) {
        replacementCount++;
      }
    }
    
    console.log(`✅ ${replacementCount} variables remplacées en ${Date.now() - startReplace}ms`);
    
    // Étape 4: Nettoyage final des variables non remplacées (2-5ms)
    const startCleanVars = Date.now();
    
    // Supprimer toutes les variables {{...}} restantes
    const beforeVarClean = htmlContent.length;
    htmlContent = htmlContent.replace(/{{[^}]*}}/g, '');
    const varsRemoved = Math.max(0, Math.floor((beforeVarClean - htmlContent.length) / 10)); // Estimation
    
    console.log(`🗑️ ~${varsRemoved} variables non remplacées supprimées en ${Date.now() - startCleanVars}ms`);
    
    // Étape 5: Nettoyage ultra-rapide des lignes vides (5-20ms)
    const startClean = Date.now();
    
    // Regex pour supprimer les lignes de tableau complètement vides
    const emptyTableRowRegex = /<tr[^>]*>\s*(?:<td[^>]*>\s*<p[^>]*>\s*<span[^>]*>\s*(?:{{[^}]+}})?\s*<\/span>\s*<\/p>\s*<\/td>\s*)+<\/tr>/gi;
    const beforeClean = htmlContent.length;
    htmlContent = htmlContent.replace(emptyTableRowRegex, '');
    const rowsRemoved = Math.max(0, Math.floor((beforeClean - htmlContent.length) / 200)); // Estimation
    
    console.log(`🧹 ~${rowsRemoved} lignes vides supprimées en ${Date.now() - startClean}ms`);
    
    // Étape 6: Génération PDF avec Puppeteer (1000-3000ms)
    const startPDF = Date.now();
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });
    
    const page = await browser.newPage();
    
    // Charger le HTML Google Docs tel quel, sans aucune modification
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });
    
    console.log('📄 HTML Google Docs chargé dans Puppeteer');
    
    // Génération PDF avec marges gérées par CSS
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      // Marges à zéro : gérées par les règles CSS @page injectées
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      // Respecter les règles CSS @page
      preferCSSPageSize: true,
      // Pas d'en-têtes ni de pieds de page
      displayHeaderFooter: false,
    });
    
    await browser.close();
    
    const pdfTime = Date.now() - startPDF;
    console.log(`📄 PDF généré en ${pdfTime}ms`);
    
    // Temps total
    const totalTime = Date.now() - totalStartTime;
    console.log(`🎉 Export PDF RAPIDE terminé en ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    
    // Retourner le PDF
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="analyse-patrimoniale-rapide.pdf"',
        'X-Processing-Time': `${totalTime}ms`,
        'X-Method': 'HTML-Template',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur export PDF rapide:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'export PDF rapide' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Fonction utilitaire pour nettoyer les lignes de tableau vides (non utilisée actuellement, mais disponible)
function cleanEmptyTableRowsAdvanced(html: string): string {
  // Regex plus sophistiquée pour détecter les lignes complètement vides
  const patterns = [
    // Lignes avec seulement des variables vides
    /<tr[^>]*>\s*(?:<td[^>]*>\s*<p[^>]*>\s*<span[^>]*>\s*{{[^}]*}}\s*<\/span>\s*<\/p>\s*<\/td>\s*)+<\/tr>/gi,
    // Lignes avec seulement des espaces
    /<tr[^>]*>\s*(?:<td[^>]*>\s*<p[^>]*>\s*<span[^>]*>\s*<\/span>\s*<\/p>\s*<\/td>\s*)+<\/tr>/gi,
    // Lignes complètement vides
    /<tr[^>]*>\s*(?:<td[^>]*>\s*<\/td>\s*)+<\/tr>/gi,
  ];
  
  let result = html;
  for (const pattern of patterns) {
    result = result.replace(pattern, '');
  }
  
  return result;
}
