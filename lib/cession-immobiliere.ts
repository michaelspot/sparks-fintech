/**
 * Calculs de fiscalité pour la cession immobilière
 * Toutes les formules et règles fiscales sont centralisées dans ce fichier
 */

export interface CessionImmobiliereInputs {
  // Données du bien
  valeurAcquisition: number
  dateAcquisition: string
  valeurCession: number
  dateCession: string
  
  // Frais
  fraisNotaire: number
  fraisTravaux: number
  
  // Données fiscales du propriétaire
  situationFamiliale?: string
  nbParts?: number
}

export interface CessionImmobiliereResults {
  // Calculs de base
  plusValueBrute: number
  nombreAnneesDetention: number
  valeurAcquisitionAjustee: number
  
  // Abattements IR (Impôt sur le Revenu)
  abattementIR: number // en pourcentage
  valeurAbattementIR: number // en euros
  valeurApresAbattementIR: number
  impotIR: number // 19% de la valeur après abattement
  
  // Abattements PS (Prélèvements Sociaux)
  abattementPS: number // en pourcentage
  valeurAbattementPS: number // en euros
  valeurApresAbattementPS: number
  impotPS: number // 17.2% de la valeur après abattement
  
  // Surtaxe plus-value immobilière
  surtaxePlusValue: number
  
  // Totaux
  impotTotal: number
  poidsImpotSurPVBrute: number // en pourcentage
  rendementGlobal: number // en pourcentage
  rendementAnnualise: number // en pourcentage
}

/**
 * Calcule l'abattement pour durée de détention sur l'Impôt sur le Revenu
 * @param annees Nombre d'années de détention
 * @returns Pourcentage d'abattement (0-100)
 */
function calculerAbattementIR(annees: number): number {
  if (annees < 6) return 0
  if (annees < 22) {
    // 6% par année au-delà de la 5ème année, jusqu'à la 21ème
    return Math.min(6 * (annees - 5), 100)
  }
  return 100 // Exonération totale après 22 ans
}

/**
 * Calcule l'abattement pour durée de détention sur les Prélèvements Sociaux
 * @param annees Nombre d'années de détention
 * @returns Pourcentage d'abattement (0-100)
 */
function calculerAbattementPS(annees: number): number {
  if (annees < 6) return 0
  if (annees < 22) {
    // 1.65% par année de la 6ème à la 21ème année
    return Math.min(1.65 * (annees - 5), 100)
  }
  if (annees < 30) {
    // 1.60% par année de la 22ème à la 29ème année
    return Math.min(100 - 1.6 * (annees - 21), 100)
  }
  return 100 // Exonération totale après 30 ans
}

/**
 * Calcule la surtaxe sur les plus-values immobilières importantes
 * Applicable sur la fraction de la plus-value nette excédant 50 000 €
 * @param plusValueNette Plus-value après abattement IR
 * @returns Montant de la surtaxe
 */
function calculerSurtaxePlusValue(plusValueNette: number): number {
  if (plusValueNette <= 50000) return 0
  
  const franchise = 50000
  const plusValueSurtaxable = plusValueNette - franchise
  
  // Barème progressif
  let surtaxe = 0
  
  if (plusValueSurtaxable <= 10000) {
    // Tranche 50 001 € à 60 000 € : 2%
    surtaxe = plusValueSurtaxable * 0.02
  } else if (plusValueSurtaxable <= 20000) {
    // Tranche 60 001 € à 70 000 € : 3%
    surtaxe = 10000 * 0.02 + (plusValueSurtaxable - 10000) * 0.03
  } else if (plusValueSurtaxable <= 30000) {
    // Tranche 70 001 € à 80 000 € : 4%
    surtaxe = 10000 * 0.02 + 10000 * 0.03 + (plusValueSurtaxable - 20000) * 0.04
  } else if (plusValueSurtaxable <= 40000) {
    // Tranche 80 001 € à 90 000 € : 5%
    surtaxe = 10000 * 0.02 + 10000 * 0.03 + 10000 * 0.04 + (plusValueSurtaxable - 30000) * 0.05
  } else {
    // Au-delà de 90 000 € : 6%
    surtaxe = 10000 * 0.02 + 10000 * 0.03 + 10000 * 0.04 + 10000 * 0.05 + (plusValueSurtaxable - 40000) * 0.06
  }
  
  return Math.round(surtaxe)
}

/**
 * Calcule tous les éléments de la fiscalité d'une cession immobilière
 * @param inputs Données d'entrée de la simulation
 * @returns Tous les résultats calculés
 */
export function calculCessionImmobiliere(inputs: CessionImmobiliereInputs): CessionImmobiliereResults {
  const {
    valeurAcquisition,
    dateAcquisition,
    valeurCession,
    dateCession,
    fraisNotaire,
    fraisTravaux
  } = inputs
  
  // 1. Calcul de la durée de détention
  const dateAcq = new Date(dateAcquisition)
  const dateCess = new Date(dateCession)
  const diffTime = Math.abs(dateCess.getTime() - dateAcq.getTime())
  const nombreAnneesDetention = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25))
  
  // 2. Valeur d'acquisition ajustée (prix + frais)
  const valeurAcquisitionAjustee = valeurAcquisition + fraisNotaire + fraisTravaux
  
  // 3. Plus-value brute
  const plusValueBrute = Math.max(0, valeurCession - valeurAcquisitionAjustee)
  
  // 4. Calculs des abattements IR
  const abattementIR = calculerAbattementIR(nombreAnneesDetention)
  const valeurAbattementIR = Math.round(plusValueBrute * (abattementIR / 100))
  const valeurApresAbattementIR = plusValueBrute - valeurAbattementIR
  const impotIR = Math.round(valeurApresAbattementIR * 0.19) // Taux forfaitaire 19%
  
  // 5. Calculs des abattements PS
  const abattementPS = calculerAbattementPS(nombreAnneesDetention)
  const valeurAbattementPS = Math.round(plusValueBrute * (abattementPS / 100))
  const valeurApresAbattementPS = plusValueBrute - valeurAbattementPS
  const impotPS = Math.round(valeurApresAbattementPS * 0.172) // Taux 17.2%
  
  // 6. Surtaxe plus-value immobilière
  const surtaxePlusValue = calculerSurtaxePlusValue(valeurApresAbattementIR)
  
  // 7. Totaux
  const impotTotal = impotIR + impotPS + surtaxePlusValue
  const poidsImpotSurPVBrute = plusValueBrute > 0 ? (impotTotal / plusValueBrute) * 100 : 0
  
  // 8. Rendements
  const gainNet = valeurCession - valeurAcquisitionAjustee - impotTotal
  const rendementGlobal = valeurAcquisitionAjustee > 0 ? (gainNet / valeurAcquisitionAjustee) * 100 : 0
  const rendementAnnualise = nombreAnneesDetention > 0 ? Math.pow(1 + rendementGlobal / 100, 1 / nombreAnneesDetention) - 1 : 0
  
  return {
    plusValueBrute: Math.round(plusValueBrute),
    nombreAnneesDetention,
    valeurAcquisitionAjustee: Math.round(valeurAcquisitionAjustee),
    
    abattementIR: Math.round(abattementIR * 100) / 100,
    valeurAbattementIR,
    valeurApresAbattementIR: Math.round(valeurApresAbattementIR),
    impotIR,
    
    abattementPS: Math.round(abattementPS * 100) / 100,
    valeurAbattementPS,
    valeurApresAbattementPS: Math.round(valeurApresAbattementPS),
    impotPS,
    
    surtaxePlusValue,
    impotTotal,
    poidsImpotSurPVBrute: Math.round(poidsImpotSurPVBrute * 100) / 100,
    rendementGlobal: Math.round(rendementGlobal * 100) / 100,
    rendementAnnualise: Math.round(rendementAnnualise * 10000) / 100 // en pourcentage
  }
}
