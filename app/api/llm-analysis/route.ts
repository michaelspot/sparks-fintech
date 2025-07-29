import { NextRequest, NextResponse } from 'next/server';
import { LLM_CALLS_CONFIG, GEMINI_CONFIG, LLMCallConfig } from '../../../Appel_API_LLM';

// Configuration désormais importée depuis Appel_API_LLM.ts

// Option pour désactiver temporairement les appels LLM (développement)
const ENABLE_LLM_ANALYSIS = true; // Mettre à false pour désactiver

/**
 * Fonction de formatage pour les réponses d'analyses LLM
 * Convertit en HTML avec retours à la ligne pour le PDF
 * Gère différents formats de séparateurs que Gemini peut renvoyer
 */
function formatAnalyseResponse(response: string): string {
  console.log('📄 Réponse brute LLM:', response);
  
  // Nettoyer et normaliser la réponse
  let cleaned = response.trim();
  
  // Gérer tous les formats possibles de séparateurs
  const separatorPatterns = [
    / — /g,           // " — " (avec espaces)
    /—/g,             // "—" (sans espaces) 
    / - /g,           // " - " (tiret avec espaces)
    /\n—\n/g,         // Déjà formaté
    /\n-\n/g,          // Tiret déjà formaté
    /Force \d+ :/g     // "Force 1:", "Force 2:", etc.
  ];
  
  // Remplacer tous les patterns par un marqueur temporaire
  separatorPatterns.forEach((pattern, index) => {
    if (index === separatorPatterns.length - 1) {
      // Pour "Force X:", on garde juste le contenu après
      cleaned = cleaned.replace(pattern, '|||SEPARATOR|||');
    } else {
      cleaned = cleaned.replace(pattern, '|||SEPARATOR|||');
    }
  });
  
  // Diviser par le marqueur et rejoindre avec le format voulu
  const parts = cleaned.split('|||SEPARATOR|||')
    .map(part => part.trim())
    .filter(part => part.length > 0);
  
  console.log('📄 Parts extraites:', parts);
  
  // Créer le format HTML compact avec retours à la ligne
  const htmlFormatted = parts.join('<br>—<br>');
  
  console.log('📄 Formaté HTML final:', htmlFormatted);
  
  return htmlFormatted;
}

/**
 * Fonction pour appeler l'API Gemini
 */
async function callGeminiAPI(prompt: string, context: any): Promise<string> {
  const contextString = JSON.stringify(context, null, 2);
  
  const fullPrompt = `${prompt}

CONTEXTE CLIENT:
${contextString}

Réponds de manière concise et professionnelle. Utilise un ton de conseiller financier expérimenté.`;

  try {
    const response = await fetch(GEMINI_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: GEMINI_CONFIG.DEFAULT_MAX_TOKENS,
          temperature: GEMINI_CONFIG.DEFAULT_TEMPERATURE,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API Gemini: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Réponse invalide de l\'API Gemini');
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Gemini:', error);
    return 'Erreur lors de l\'analyse. Veuillez réessayer.';
  }
}

/**
 * Endpoint pour générer toutes les analyses LLM
 */
export async function POST(request: NextRequest) {
  try {
    const { localStorageData } = await request.json();
    
    if (!localStorageData) {
      return NextResponse.json({ error: 'Données localStorage requises' }, { status: 400 });
    }
    
    // Si les analyses LLM sont désactivées, retourner des analyses vides
    if (!ENABLE_LLM_ANALYSIS) {
      console.log('⚠️ Analyses LLM désactivées - retour rapide');
      const results: Record<string, string> = {};
      LLM_CALLS_CONFIG.forEach(config => {
        results[config.variable] = 'Analyse désactivée (mode développement)';
      });
      return NextResponse.json({ analyses: results });
    }

    console.log(`🤖 Démarrage de ${LLM_CALLS_CONFIG.length} analyses en parallèle...`);
    
    // Créer toutes les promesses d'analyses en parallèle
    const analysisPromises = LLM_CALLS_CONFIG.map(async (config) => {
      console.log(`🚀 Démarrage analyse: ${config.variable}`);
      
      // Construire le contexte avec les données demandées
      const context: any = {};
      config.contextKeys.forEach(key => {
        if (localStorageData[key]) {
          context[key] = localStorageData[key];
        }
      });

      try {
        // Appel à l'API Gemini
        const rawAnalysis = await callGeminiAPI(config.prompt, context);
        
        // Appliquer le formatage pour assurer les retours à la ligne
        const formattedAnalysis = formatAnalyseResponse(rawAnalysis);
        
        console.log(`✅ ${config.variable}: ${formattedAnalysis.length} caractères`);
        return { variable: config.variable, analysis: formattedAnalysis };
      } catch (error) {
        console.error(`❌ Erreur ${config.variable}:`, error);
        return { variable: config.variable, analysis: 'Analyse non disponible' };
      }
    });
    
    // Attendre que toutes les analyses soient terminées
    const analysisResults = await Promise.all(analysisPromises);
    
    // Convertir en objet de résultats
    const results: Record<string, string> = {};
    analysisResults.forEach(({ variable, analysis }) => {
      results[variable] = analysis;
    });
    
    console.log(`🎉 Toutes les analyses terminées:`, Object.keys(results));

    return NextResponse.json({ analyses: results });
    
  } catch (error) {
    console.error('Erreur lors de la génération des analyses:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
