import { NextRequest, NextResponse } from "next/server";
import yahooFinance from 'yahoo-finance2';

const SERP_API_KEY = "cd54b37e27452f8ad7ad5b834dea3ccc5e8c8f06dbf98fac897376e161fb0a22";

async function getISINFromSerpApi(fundName: string): Promise<string | null> {
  if (!SERP_API_KEY) return null;
  try {
    const q = `site:investing.com "${fundName}" + "ISIN"`;
    const url = `https://serpapi.com/search.json?engine=google_light&q=${encodeURIComponent(q)}&api_key=${SERP_API_KEY}&google_domain=google.com&hl=en&gl=us`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.organic_results && Array.isArray(data.organic_results)) {
      for (const result of data.organic_results) {
        const snippet = result.snippet || "";
        const match = snippet.match(/ISIN:\s*([A-Z0-9]{12})/i);
        if (match && match[1]) {
          return match[1].toUpperCase();
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur SerpAPI ISIN:", error);
    return null;
  }
}

// Helper pour le calcul du SRI
function calculateSRIFromCloses(closes: number[]): number {
    if (!closes || closes.length < 10) return 3; // Valeur par défaut

    let rendements = [];
    for (let i = 1; i < closes.length; i++) {
      const r = (closes[i] - closes[i - 1]) / closes[i - 1];
      rendements.push(r);
    }

    const moyenne = rendements.reduce((a, b) => a + b, 0) / rendements.length;
    const variance = rendements.reduce((a, b) => a + Math.pow(b - moyenne, 2), 0) / rendements.length;
    const ecartType = Math.sqrt(variance);
    const volAnn = ecartType * Math.sqrt(52) * 100;

    if (volAnn < 0.5) return 1;
    if (volAnn < 2) return 2;
    if (volAnn < 5) return 3;
    if (volAnn < 10) return 4;
    if (volAnn < 15) return 5;
    if (volAnn < 25) return 6;
    return 7;
}

// Fonction pour récupérer une instance utilisable de yahoo-finance2
function getYahooFinanceInstance() {
  // En fonction de l'import (ESM/CJS), yahooFinance peut être l'instance ou la classe
  // Le test a montré que dans cet environnement, c'est la classe qu'il faut instancier
  const yf: any = yahooFinance;
  
  // Si c'est un constructeur (classe), on instancie
  if (typeof yf === 'function' && yf.prototype && yf.prototype.search) {
    return new yf();
  }
  
  // Sinon c'est probablement déjà l'instance
  return yf;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const query = searchParams.get("query");
  const skipIsin = searchParams.get("skipIsin") === "true";

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const yf = getYahooFinanceInstance();

  try {
    if (type === "search") {
      const result = await yf.search(query, { quotesCount: 3, newsCount: 0 }); // Limité à 3 pour la performance de l'enrichissement ISIN

      // Enrichissement des résultats avec l'ISIN via SerpAPI
      // Attention : cela multiplie les appels API, d'où la limite à 3 résultats
      const quotesWithIsin = await Promise.all(result.quotes.map(async (quote: any) => {
        if (skipIsin) return quote;
        try {
          const name = quote.longname || quote.shortname || quote.symbol;
          const isin = await getISINFromSerpApi(name);
          return { ...quote, isin };
        } catch (e) {
          return quote;
        }
      }));

      return NextResponse.json({ ...result, quotes: quotesWithIsin });

    } else if (type === "quote") {
      let chartResult;
      try {
        // Essai avec period1 explicite (il y a 5 ans)
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);
        
        chartResult = await yf.chart(query, { period1: startDate, interval: '1wk' });
      } catch (chartError) {
        console.warn(`Chart failed for ${query}, trying fallback to quote:`, chartError);
        
        // Fallback: on récupère juste le prix actuel sans historique
        try {
          const quote = await yf.quote(query);
          return NextResponse.json({
            symbol: query,
            price: quote.regularMarketPrice || quote.ask || 0,
            currency: quote.currency || "EUR",
            name: quote.longName || quote.shortName || query,
            exchange: quote.exchange || "",
            sri: 3 // SRI par défaut (moyen) car pas d'historique pour le calcul
          });
        } catch (quoteError) {
          throw new Error(`Failed to fetch data for ${query}: ${quoteError.message}`);
        }
      }
      
      const meta = chartResult.meta;
      const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
      const currency = meta.currency || "EUR";
      const exchange = meta.exchangeName || "";
      // Gestion des noms qui peuvent être à différents endroits
      const longName = (meta as any).longName || (meta as any).shortName || query;

      // Tentative de récupération de l'ISIN via SerpAPI pour tous les supports
      let isin = null;
      if (!skipIsin) {
        try {
          isin = await getISINFromSerpApi(longName);
        } catch (e) {
          console.error("Erreur lors de la récupération ISIN:", e);
        }
      }

      let sri = 3;
      if (chartResult.quotes && chartResult.quotes.length > 0) {
        const closes = chartResult.quotes.map((q: any) => q.close).filter((c: any) => c != null);
        sri = calculateSRIFromCloses(closes);
      } else {
        // Fallback si structure différente (peu probable avec la lib)
        const indicators = (chartResult as any).indicators;
        if (indicators && indicators.quote && indicators.quote[0] && indicators.quote[0].close) {
             const closes = indicators.quote[0].close.filter((c: any) => c != null);
             sri = calculateSRIFromCloses(closes);
        }
      }

      return NextResponse.json({
        symbol: query,
        isin,
        price: currentPrice,
        currency,
        name: longName,
        exchange,
        sri
      });
    }

    return NextResponse.json({ error: "Invalid type parameter. Use 'search' or 'quote'" }, { status: 400 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
