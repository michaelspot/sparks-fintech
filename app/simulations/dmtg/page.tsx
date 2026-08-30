"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Calculator } from "lucide-react"

// ===== INTERFACES =====
interface Child {
  firstName: string
  lastName: string
  birthDate: string
  parentage: "propre_parent1" | "propre_parent2" | "commun" | ""
}

interface PersonalInfo {
  firstName: string
  spouseFirstName: string
  birthDate: string
  spouseBirthDate: string
  age: string
  spouseAge: string
  maritalStatus: string
  matrimonialRegime: string
  children: Child[]
  lastWillDonation: string
  lastWillDonationType: string
}

interface Property {
  id: string
  type: string
  denomination: string
  grossValue: number
  attachedDebts: number
  netValue: number
  ownedBy: string
}

interface FinancialAsset {
  id: string
  type: string
  denomination: string
  realValue: number
  ownedBy: string
}

interface ProfessionalAsset {
  id: string
  companyName: string
  valuation: number
  ownership: string
}

interface SuccessionInputs {
  deceased: "vous" | "conjoint"
  deathDate: string
  ageAtDeath: number
  survivingSpouseAge: number
  matrimonialRegime: string
  hasDDV: boolean
  children: Child[]
  commonAssetsValue: number
  personalAssetsValue: number
  survivorPersonalAssetsValue: number
  debts: number
  spouseOption: string
  scenario: "premier" | "deuxieme"
}

interface SuccessionResults {
  // Liquidation
  liquidation: {
    communityAssets: number
    communitySharePerPerson: number
    personalAssets: number
    totalSuccessionAssets: number
  }
  // Dévolution
  devolution: {
    spouse: {
      theoreticalRights: string
      fiscalValue: number
      taxToPay: number
    }
    children: {
      totalInheritance: number
      inheritancePerChild: number
    }
  }
  // Droits par enfant
  rightsPerChild: {
    grossShare: number
    abatement: number
    taxableBase: number
    taxAmount: number
  }
  // Synthèse
  summary: {
    totalAssetsTransmitted: number
    totalSuccessionTax: number
    netReceivedByHeirs: number
  }
  // Détails pour le Dialog
  details: {
    label: string
    value: string | number
    highlight?: boolean
  }[]
}

// ===== CONSTANTES =====
const LOCAL_STORAGE_KEY_DMTG = "dmtgSimulation"
const LOCAL_STORAGE_KEY_IDENTITY = "identityPersonalInfo"
const LOCAL_STORAGE_KEY_IMMOBILIER = "patrimoineImmobilierInfo"
const LOCAL_STORAGE_KEY_FINANCIER = "patrimoineFinancierInfo"
const LOCAL_STORAGE_KEY_PROFESSIONNEL = "patrimoineProfessionnelInfo"

// Barème de l'usufruit selon l'âge (Article 669 CGI)
const BAREME_USUFRUIT: Record<string, number> = {
  "moins de 21 ans": 0.90,
  "de 21 à 30 ans": 0.80,
  "de 31 à 40 ans": 0.70,
  "de 41 à 50 ans": 0.60,
  "de 51 à 60 ans": 0.50,
  "de 61 à 70 ans": 0.40,
  "de 71 à 80 ans": 0.30,
  "de 81 à 90 ans": 0.20,
  "plus de 91 ans": 0.10,
}

// Barème des droits de succession en ligne directe (2025)
const BAREME_SUCCESSION = [
  { max: 8072, taux: 0.05 },
  { max: 12109, taux: 0.10 },
  { max: 15932, taux: 0.15 },
  { max: 552324, taux: 0.20 },
  { max: 902838, taux: 0.30 },
  { max: 1805677, taux: 0.40 },
  { max: Infinity, taux: 0.45 },
]

// ===== FONCTIONS DE CALCUL =====

// Calcul du pourcentage de l'usufruit selon l'âge
function calculerPourcentageUsufruit(age: number): number {
  if (age < 21) return 0.90
  if (age <= 30) return 0.80
  if (age <= 40) return 0.70
  if (age <= 50) return 0.60
  if (age <= 60) return 0.50
  if (age <= 70) return 0.40
  if (age <= 80) return 0.30
  if (age <= 90) return 0.20
  return 0.10
}

// Calcul des droits de succession selon le barème progressif
function calculerDroitsSuccession(baseTaxable: number): number {
  if (baseTaxable <= 0) return 0

  let droits = 0
  let restant = baseTaxable
  let seuilPrecedent = 0

  for (const tranche of BAREME_SUCCESSION) {
    const plafond = tranche.max
    const montantTranche = Math.min(restant, plafond - seuilPrecedent)

    if (montantTranche <= 0) break

    droits += montantTranche * tranche.taux
    restant -= montantTranche
    seuilPrecedent = plafond

    if (restant <= 0) break
  }

  return droits
}

// Calcul complet de la succession
function calculerSuccession(inputs: SuccessionInputs): SuccessionResults {
  const {
    deceased,
    matrimonialRegime,
    children,
    commonAssetsValue,
    personalAssetsValue,
    survivorPersonalAssetsValue,
    debts,
    spouseOption,
    survivingSpouseAge,
    scenario
  } = inputs

  // ===== LIQUIDATION DU RÉGIME MATRIMONIAL =====
  // Base commune : séparation des biens communs
  let communityAssets = 0
  let communitySharePerPerson = 0

  if (matrimonialRegime.includes("communaute") || matrimonialRegime === "indivision") {
    // Régime communautaire ou indivision (PACS)
    communityAssets = commonAssetsValue - debts
    communitySharePerPerson = communityAssets / 2
  } else {
    // Séparation de biens
    communityAssets = 0
    communitySharePerPerson = 0
  }

  // ===== LOGIQUE SELON SCÉNARIO =====
  if (scenario === "premier") {
    const personalAssets = personalAssetsValue
  const totalSuccessionAssets = communitySharePerPerson + personalAssets

    // DÉVOLUTION SUCCESSORALE
  const numberOfChildren = children.length
  let spouseTheoriticalRights = ""
  let spouseFiscalValue = 0
  const spouseTaxToPay = 0 // Loi TEPA : Conjoint exonéré

  // Déterminer les droits du conjoint
  const hasNonCommonChildren = children.some(
    (child) => child.parentage === "propre_parent1" || child.parentage === "propre_parent2"
  )

  if (hasNonCommonChildren && !inputs.hasDDV) {
    // Enfants non communs sans DDV => 1/4 PP imposé
    spouseTheoriticalRights = "1/4 en pleine propriété (imposé par la loi)"
    spouseFiscalValue = totalSuccessionAssets * 0.25
  } else {
    // Choix du conjoint
    if (spouseOption === "usufruit-total") {
      spouseTheoriticalRights = "100% en usufruit"
      const pourcentageUsufruit = calculerPourcentageUsufruit(survivingSpouseAge)
      spouseFiscalValue = totalSuccessionAssets * pourcentageUsufruit
    } else if (spouseOption === "quart-pp") {
      spouseTheoriticalRights = "1/4 en pleine propriété"
      spouseFiscalValue = totalSuccessionAssets * 0.25
    } else if (spouseOption === "usufruit-partiel") {
      spouseTheoriticalRights = "1/4 PP + 3/4 US"
      const pourcentageUsufruit = calculerPourcentageUsufruit(survivingSpouseAge)
      spouseFiscalValue = totalSuccessionAssets * 0.25 + totalSuccessionAssets * 0.75 * pourcentageUsufruit
    } else if (spouseOption === "quotite-disponible") {
      spouseTheoriticalRights = "Quotité disponible en pleine propriété"
      let reserve = 0.5
      if (numberOfChildren === 2) reserve = 2 / 3
      if (numberOfChildren >= 3) reserve = 0.75
      const quotiteDisponible = 1 - reserve
      spouseFiscalValue = totalSuccessionAssets * quotiteDisponible
    }
  }

  const childrenTotalInheritance = totalSuccessionAssets - spouseFiscalValue
  const inheritancePerChild = numberOfChildren > 0 ? childrenTotalInheritance / numberOfChildren : 0

  const abatementPerChild = 100000
  const taxableBasePerChild = Math.max(0, inheritancePerChild - abatementPerChild)
  const taxAmountPerChild = calculerDroitsSuccession(taxableBasePerChild)
  const totalTaxForChildren = taxAmountPerChild * numberOfChildren

  const totalAssetsTransmitted = totalSuccessionAssets
  const totalSuccessionTax = totalTaxForChildren
  const netReceivedByHeirs = totalAssetsTransmitted - totalSuccessionTax

  const details = [
    { label: "LIQUIDATION DU RÉGIME MATRIMONIAL", value: "", highlight: true },
    { label: "Actif de communauté", value: formatCurrency(communityAssets) },
    { label: "Part de communauté (50%)", value: formatCurrency(communitySharePerPerson) },
    { label: "Actifs propres du défunt", value: formatCurrency(personalAssets) },
    { label: "ACTIF SUCCESSORAL TAXABLE", value: formatCurrency(totalSuccessionAssets), highlight: true },
    { label: "", value: "" },
    { label: "DÉVOLUTION SUCCESSORALE", value: "", highlight: true },
    { label: "Droits du conjoint survivant", value: spouseTheoriticalRights },
    { label: "Valeur fiscale du conjoint", value: formatCurrency(spouseFiscalValue) },
    { label: "Droits à payer (conjoint)", value: "0 € (Loi TEPA)" },
    { label: "", value: "" },
    { label: "Part des enfants", value: formatCurrency(childrenTotalInheritance) },
    { label: "Nombre d'enfants", value: numberOfChildren.toString() },
    { label: "Part par enfant", value: formatCurrency(inheritancePerChild) },
    { label: "", value: "" },
    { label: "CALCUL DES DROITS (PAR ENFANT)", value: "", highlight: true },
    { label: "Part brute", value: formatCurrency(inheritancePerChild) },
    { label: "Abattement personnel", value: `-${formatCurrency(abatementPerChild)}` },
    { label: "Base taxable", value: formatCurrency(taxableBasePerChild) },
    { label: "Droits dus par enfant", value: formatCurrency(taxAmountPerChild), highlight: true },
    { label: "", value: "" },
    { label: "SYNTHÈSE", value: "", highlight: true },
    { label: "Total actif transmis", value: formatCurrency(totalAssetsTransmitted) },
    { label: "Total droits de succession", value: formatCurrency(totalSuccessionTax) },
    { label: "Net perçu par les héritiers", value: formatCurrency(netReceivedByHeirs), highlight: true },
  ]

  return {
    liquidation: {
      communityAssets,
      communitySharePerPerson,
      personalAssets,
      totalSuccessionAssets,
    },
    devolution: {
      spouse: {
        theoreticalRights: spouseTheoriticalRights,
        fiscalValue: spouseFiscalValue,
        taxToPay: spouseTaxToPay,
      },
      children: {
        totalInheritance: childrenTotalInheritance,
        inheritancePerChild,
      },
    },
    rightsPerChild: {
      grossShare: inheritancePerChild,
      abatement: abatementPerChild,
      taxableBase: taxableBasePerChild,
      taxAmount: taxAmountPerChild,
    },
    summary: {
      totalAssetsTransmitted,
      totalSuccessionTax,
      netReceivedByHeirs,
        details,
    },
    details,
    }
  } else {
    // ===== SCÉNARIO 2 : DEUXIÈME DÉCÈS =====
    
    // 1. Simulation du 1er décès pour déterminer l'héritage PP du survivant
    const personalAssets1 = personalAssetsValue // Biens propres du 1er défunt
    const totalSuccessionAssets1 = communitySharePerPerson + personalAssets1
    
    let heritageRecuPP = 0
    let texteHeritage = ""

    const hasNonCommonChildren = children.some(
      (child) => child.parentage === "propre_parent1" || child.parentage === "propre_parent2"
    )

    // Logique simplifiée de récupération de la PP (identique au 1er décès)
    if (hasNonCommonChildren && !inputs.hasDDV) {
      heritageRecuPP = totalSuccessionAssets1 * 0.25
      texteHeritage = "1/4 PP (Légal)"
    } else {
      if (spouseOption === "usufruit-total") {
        heritageRecuPP = 0
        texteHeritage = "0% PP (100% US)"
      } else if (spouseOption === "quart-pp") {
        heritageRecuPP = totalSuccessionAssets1 * 0.25
        texteHeritage = "1/4 PP"
      } else if (spouseOption === "usufruit-partiel") {
        heritageRecuPP = totalSuccessionAssets1 * 0.25
        texteHeritage = "1/4 PP (+ 3/4 US)"
      } else if (spouseOption === "quotite-disponible") {
        let reserve = 0.5
        if (children.length === 2) reserve = 2 / 3
        if (children.length >= 3) reserve = 0.75
        const quotiteDisponible = 1 - reserve
        heritageRecuPP = totalSuccessionAssets1 * quotiteDisponible
        texteHeritage = "Quotité Disponible PP"
      }
    }

    // 2. Reconstitution du patrimoine du 2ème défunt (le survivant)
    const survivorOwnAssets = survivorPersonalAssetsValue
    const totalSuccessionAssets2 = survivorOwnAssets + communitySharePerPerson + heritageRecuPP

    // 3. Dévolution (Tout aux enfants)
    const numberOfChildren = children.length
    const childrenTotalInheritance = totalSuccessionAssets2
    const inheritancePerChild = numberOfChildren > 0 ? childrenTotalInheritance / numberOfChildren : 0

    // 4. Droits de succession
    const abatementPerChild = 100000
    const taxableBasePerChild = Math.max(0, inheritancePerChild - abatementPerChild)
    const taxAmountPerChild = calculerDroitsSuccession(taxableBasePerChild)
    const totalTaxForChildren = taxAmountPerChild * numberOfChildren

    const totalAssetsTransmitted = totalSuccessionAssets2
    const totalSuccessionTax = totalTaxForChildren
    const netReceivedByHeirs = totalAssetsTransmitted - totalSuccessionTax

    const details = [
      { label: "RECONSTITUTION DU PATRIMOINE DU SURVIVANT", value: "", highlight: true },
      { label: "Ses biens propres initiaux", value: formatCurrency(survivorOwnAssets) },
      { label: "Sa part de communauté (50%)", value: formatCurrency(communitySharePerPerson) },
      { label: "Héritage reçu en PP (1er décès)", value: formatCurrency(heritageRecuPP) },
      { label: `Option 1er décès: ${texteHeritage}`, value: "" },
      { label: "ACTIF SUCCESSORAL TAXABLE", value: formatCurrency(totalSuccessionAssets2), highlight: true },
      { label: "", value: "" },
      { label: "DÉVOLUTION (ENFANTS UNIQUEMENT)", value: "", highlight: true },
      { label: "Part totale des enfants", value: formatCurrency(childrenTotalInheritance) },
      { label: "Nombre d'enfants", value: numberOfChildren.toString() },
      { label: "Part par enfant", value: formatCurrency(inheritancePerChild) },
      { label: "", value: "" },
      { label: "CALCUL DES DROITS (PAR ENFANT)", value: "", highlight: true },
      { label: "Part brute", value: formatCurrency(inheritancePerChild) },
      { label: "Abattement personnel", value: `-${formatCurrency(abatementPerChild)}` },
      { label: "Base taxable", value: formatCurrency(taxableBasePerChild) },
      { label: "Droits dus par enfant", value: formatCurrency(taxAmountPerChild), highlight: true },
      { label: "", value: "" },
      { label: "SYNTHÈSE 2ÈME DÉCÈS", value: "", highlight: true },
      { label: "Total actif transmis", value: formatCurrency(totalAssetsTransmitted) },
      { label: "Total droits de succession", value: formatCurrency(totalSuccessionTax) },
      { label: "Net perçu par les enfants", value: formatCurrency(netReceivedByHeirs), highlight: true },
    ]

    return {
      liquidation: {
        communityAssets,
        communitySharePerPerson,
        personalAssets: survivorOwnAssets,
        totalSuccessionAssets: totalSuccessionAssets2,
      },
      devolution: {
        spouse: {
          theoreticalRights: "Décédé(e)",
          fiscalValue: 0,
          taxToPay: 0,
        },
        children: {
          totalInheritance: childrenTotalInheritance,
          inheritancePerChild,
        },
      },
      rightsPerChild: {
        grossShare: inheritancePerChild,
        abatement: abatementPerChild,
        taxableBase: taxableBasePerChild,
        taxAmount: taxAmountPerChild,
      },
      summary: {
        totalAssetsTransmitted,
        totalSuccessionTax,
        netReceivedByHeirs,
        details,
      },
      details,
    }
  }
}

// ===== HELPER FUNCTIONS =====
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// ===== COMPOSANT PRINCIPAL =====
export default function DMTGPage() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [financialAssets, setFinancialAssets] = useState<FinancialAsset[]>([])
  const [professionalAssets, setProfessionalAssets] = useState<ProfessionalAsset[]>([])

  // États pour les inputs de simulation
  const [deathScenario, setDeathScenario] = useState<"premier" | "deuxieme">("premier")
  const [deceased, setDeceased] = useState<"vous" | "conjoint">("vous")
  const [deathDate, setDeathDate] = useState(new Date().toISOString().split("T")[0])
  const [ageAtDeath, setAgeAtDeath] = useState(0)
  const [survivingSpouseAge, setSurvivingSpouseAge] = useState(0)
  const [spouseOption, setSpouseOption] = useState("usufruit-total")

  const [resultats, setResultats] = useState<SuccessionResults | null>(null)

  // Charger les données depuis localStorage
  const loadDataFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      // Charger les données personnelles
      const savedIdentity = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY)
      if (savedIdentity) {
        const identity: PersonalInfo = JSON.parse(savedIdentity)
        setPersonalInfo(identity)
        
        // Initialiser les âges
        const age1 = calculateAge(identity.birthDate)
        const age2 = calculateAge(identity.spouseBirthDate)
        setAgeAtDeath(age1)
        setSurvivingSpouseAge(age2)
      }

      // Charger les biens immobiliers
      const savedImmobilier = localStorage.getItem(LOCAL_STORAGE_KEY_IMMOBILIER)
      if (savedImmobilier) {
        setProperties(JSON.parse(savedImmobilier))
      }

      // Charger les actifs financiers
      const savedFinancier = localStorage.getItem(LOCAL_STORAGE_KEY_FINANCIER)
      if (savedFinancier) {
        setFinancialAssets(JSON.parse(savedFinancier))
      }

      // Charger les actifs professionnels
      const savedProfessionnel = localStorage.getItem(LOCAL_STORAGE_KEY_PROFESSIONNEL)
      if (savedProfessionnel) {
        setProfessionalAssets(JSON.parse(savedProfessionnel))
      }

      // Charger les données de simulation sauvegardées
      const savedSimulation = localStorage.getItem(LOCAL_STORAGE_KEY_DMTG)
      if (savedSimulation) {
        const simData = JSON.parse(savedSimulation)
        setDeathScenario(simData.deathScenario || "premier")
        setDeceased(simData.deceased || "vous")
        setDeathDate(simData.deathDate || new Date().toISOString().split("T")[0])
        setAgeAtDeath(simData.ageAtDeath || 0)
        setSurvivingSpouseAge(simData.survivingSpouseAge || 0)
        setSpouseOption(simData.spouseOption || "usufruit-total")
      }
    }
  }, [])

  useEffect(() => {
    loadDataFromLocalStorage()
  }, [loadDataFromLocalStorage])

  // Sauvegarder les données dans localStorage
  const saveDataToLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const dataToSave = {
        deathScenario,
        deceased,
        deathDate,
        ageAtDeath,
        survivingSpouseAge,
        spouseOption,
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_DMTG, JSON.stringify(dataToSave))
    }
  }, [deathScenario, deceased, deathDate, ageAtDeath, survivingSpouseAge, spouseOption])

  // Calculer la valeur des actifs par propriétaire
  const calculateAssetValues = useCallback(() => {
    let commonAssets = 0
    let personalAssets = 0
    let survivorPersonalAssets = 0
    let debts = 0

    const ownerField = deceased === "vous" ? "Vous" : "Votre conjoint"
    const survivorField = deceased === "vous" ? "Votre conjoint" : "Vous"

    // Biens immobiliers
    properties.forEach((property) => {
      if (property.ownedBy === "Commun") {
        commonAssets += property.netValue
      } else if (property.ownedBy === ownerField) {
        personalAssets += property.netValue
      } else if (property.ownedBy === survivorField) {
        survivorPersonalAssets += property.netValue
      }

      if (property.attachedDebts) {
        debts += property.attachedDebts
      }
    })

    // Actifs financiers
    financialAssets.forEach((asset) => {
      if (asset.ownedBy === "Commun") {
        commonAssets += asset.realValue
      } else if (asset.ownedBy === ownerField) {
        personalAssets += asset.realValue
      } else if (asset.ownedBy === survivorField) {
        survivorPersonalAssets += asset.realValue
      }
    })

    // Actifs professionnels
    professionalAssets.forEach((asset) => {
      if (asset.ownership === "Commun") {
        commonAssets += asset.valuation
      } else if (asset.ownership === ownerField) {
        personalAssets += asset.valuation
      } else if (asset.ownership === survivorField) {
        survivorPersonalAssets += asset.valuation
      }
    })

    return { commonAssets, personalAssets, survivorPersonalAssets, debts }
  }, [properties, financialAssets, professionalAssets, deceased])

  // Calculer automatiquement les résultats quand les données changent
  useEffect(() => {
    if (personalInfo && ageAtDeath > 0 && survivingSpouseAge > 0) {
      const { commonAssets, personalAssets, survivorPersonalAssets, debts } = calculateAssetValues()

      const inputs: SuccessionInputs = {
        deceased,
        deathDate,
        ageAtDeath, // 1er décès
        survivingSpouseAge, // 1er décès
        matrimonialRegime: personalInfo.matrimonialRegime || "",
        hasDDV: personalInfo.lastWillDonation === "oui",
        children: personalInfo.children || [],
        commonAssetsValue: commonAssets,
        personalAssetsValue: personalAssets,
        survivorPersonalAssetsValue: survivorPersonalAssets,
        debts,
        spouseOption,
        scenario: deathScenario
      }

      const nouveauxResultats = calculerSuccession(inputs)
      setResultats(nouveauxResultats)
      saveDataToLocalStorage()
    } else {
      setResultats(null)
    }
  }, [
    personalInfo,
    deceased,
    deathDate,
    ageAtDeath,
    survivingSpouseAge,
    spouseOption,
    deathScenario,
    calculateAssetValues,
    saveDataToLocalStorage,
  ])

  // Mise à jour de l'âge au décès selon qui décède
  useEffect(() => {
    if (personalInfo) {
      if (deceased === "vous") {
        setAgeAtDeath(calculateAge(personalInfo.birthDate))
        setSurvivingSpouseAge(calculateAge(personalInfo.spouseBirthDate))
      } else {
        setAgeAtDeath(calculateAge(personalInfo.spouseBirthDate))
        setSurvivingSpouseAge(calculateAge(personalInfo.birthDate))
      }
    }
  }, [deceased, personalInfo])

  // Fonction pour mettre à jour les données personnelles dans localStorage
  const handleUpdatePersonalInfo = useCallback((field: string, value: string) => {
    if (!personalInfo || typeof window === "undefined") return

    const updatedInfo = { ...personalInfo, [field]: value }
    setPersonalInfo(updatedInfo)
    localStorage.setItem(LOCAL_STORAGE_KEY_IDENTITY, JSON.stringify(updatedInfo))
  }, [personalInfo])

  // Déterminer les options disponibles pour le conjoint survivant
  const getSpouseOptions = () => {
    if (!personalInfo) return []

    const hasNonCommonChildren = personalInfo.children.some(
      (child) => child.parentage === "propre_parent1" || child.parentage === "propre_parent2"
    )
    const hasDDV = personalInfo.lastWillDonation === "oui"

    if (hasNonCommonChildren && !hasDDV) {
      // Enfants non communs sans DDV => 1/4 PP imposé
      return [{ value: "quart-pp-impose", label: "1/4 en pleine propriété (imposé par la loi)" }]
    }

    // Toutes les options disponibles
    const options = [
      { value: "usufruit-total", label: "100% en usufruit" },
      { value: "quart-pp", label: "1/4 en pleine propriété" },
    ]

    if (hasDDV) {
      options.push({ value: "usufruit-partiel", label: "1/4 PP + 3/4 US (avec DDV)" })
      options.push({ value: "quotite-disponible", label: "Quotité disponible en pleine propriété" })
    }

    return options
  }

  const spouseOptions = getSpouseOptions()

  // Informations patrimoniales
  const { commonAssets, personalAssets, survivorPersonalAssets, debts } = calculateAssetValues()

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/simulations">Simulations</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>DMTG - Droits de Succession</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* COLONNE GAUCHE - ENTRÉES */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Données de la succession</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Situation familiale */}
                {personalInfo && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Situation familiale</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="matrimonialRegime">Régime matrimonial</Label>
                          <Select
                            value={personalInfo.matrimonialRegime || ""}
                            onValueChange={(value) => handleUpdatePersonalInfo("matrimonialRegime", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="communaute-reduite">Communauté réduite aux acquêts</SelectItem>
                              <SelectItem value="communaute-biens">Communauté de biens (avant 1966)</SelectItem>
                              <SelectItem value="separation-biens">Séparation de biens</SelectItem>
                              <SelectItem value="participation-acquets">Participation aux acquêts</SelectItem>
                              <SelectItem value="communaute-universelle">Communauté universelle</SelectItem>
                              <SelectItem value="indivision">Régime de l'indivision (PACS)</SelectItem>
                              <SelectItem value="separation">Régime de séparation (PACS)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastWillDonation">Donation au dernier vivant</Label>
                          <Select
                            value={personalInfo.lastWillDonation || ""}
                            onValueChange={(value) => handleUpdatePersonalInfo("lastWillDonation", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oui">Oui</SelectItem>
                              <SelectItem value="non">Non</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="children">Enfants</Label>
                        <Select
                          value={personalInfo.children.length.toString()}
                          onValueChange={(value) => {
                            const newCount = parseInt(value)
                            const currentChildren = personalInfo.children || []
                            let updatedChildren = [...currentChildren]
                            
                            if (newCount > currentChildren.length) {
                              for (let i = currentChildren.length; i < newCount; i++) {
                                updatedChildren.push({
                                  firstName: `Enfant ${i + 1}`,
                                  lastName: personalInfo.firstName || "",
                                  birthDate: "",
                                  parentage: "commun" as const,
                                })
                              }
                            } else if (newCount < currentChildren.length) {
                              updatedChildren = updatedChildren.slice(0, newCount)
                            }
                            
                            const updatedInfo = { ...personalInfo, children: updatedChildren }
                            setPersonalInfo(updatedInfo)
                            if (typeof window !== "undefined") {
                              localStorage.setItem(LOCAL_STORAGE_KEY_IDENTITY, JSON.stringify(updatedInfo))
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "enfant" : "enfants"}
                                {num > 0 && personalInfo.children.some(
                                  (c) => c.parentage === "propre_parent1" || c.parentage === "propre_parent2"
                                ) && " (dont enfants non communs)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                  </>
                )}

                {/* Paramètres du décès */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Paramètres du 1er décès</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deceased">Qui décède en premier ?</Label>
                      <Select value={deceased} onValueChange={(value) => setDeceased(value as "vous" | "conjoint")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vous">
                            {personalInfo?.firstName || "Vous"}
                          </SelectItem>
                          <SelectItem value="conjoint">
                            {personalInfo?.spouseFirstName || "Conjoint"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deathDate">Date du décès</Label>
                      <Input
                        id="deathDate"
                        type="date"
                        value={deathDate}
                        onChange={(e) => setDeathDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ageAtDeath">Âge au décès (1er)</Label>
                      <Input
                        id="ageAtDeath"
                        type="number"
                        value={ageAtDeath}
                        onChange={(e) => setAgeAtDeath(parseInt(e.target.value) || 0)}
                        min="0"
                        max="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="survivingSpouseAge">Âge du conjoint (au 1er décès)</Label>
                      <Input
                        id="survivingSpouseAge"
                        type="number"
                        value={survivingSpouseAge}
                        onChange={(e) => setSurvivingSpouseAge(parseInt(e.target.value) || 0)}
                        min="0"
                        max="120"
                      />
                    </div>
                  </div>
                  {personalInfo && spouseOptions.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="spouseOption">Option choisie au 1er décès</Label>
                      {spouseOptions.length === 1 ? (
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                          {spouseOptions[0].label}
                        </div>
                      ) : (
                        <Select value={spouseOption} onValueChange={setSpouseOption}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {spouseOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Inventaire patrimonial */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Inventaire patrimonial</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Actifs de communauté</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(commonAssets)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Actifs propres ({deceased === "vous" ? "Vous" : "Conjoint"})</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(personalAssets)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Actifs propres ({deceased === "vous" ? "Conjoint" : "Vous"})</Label>
                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                      {formatCurrency(survivorPersonalAssets)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLONNE DROITE - RÉSULTATS */}
          <div className="space-y-4">
            {resultats && personalInfo ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle>Résultats de la succession</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Voir détail
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Détails du calcul de succession</DialogTitle>
                        <DialogDescription>
                          Calcul complet des droits de mutation à titre gratuit (succession)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {resultats.details.map((detail, index) => (
                          <div key={index}>
                            {detail.label === "" ? (
                              <Separator className="my-2" />
                            ) : detail.highlight ? (
                              <div className="bg-muted/30 rounded-lg p-4">
                                <div className="font-semibold text-sm">{detail.label}</div>
                                {detail.value && (
                                  <div className="text-lg font-bold mt-2">{detail.value}</div>
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-between text-sm py-1">
                                <span>{detail.label}</span>
                                <span className="font-mono">{detail.value}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={deathScenario} onValueChange={(value) => setDeathScenario(value as "premier" | "deuxieme")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="premier">Premier décès</TabsTrigger>
                      <TabsTrigger value="deuxieme">Deuxième décès</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Actif taxable total</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(resultats.liquidation.totalSuccessionAssets)}
                      </div>
                    </div>
                    {deathScenario === "premier" && (
                    <div className="space-y-2">
                      <Label>Conjoint survivant</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(resultats.devolution.spouse.fiscalValue)}
                      </div>
                    </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Enfants (total)</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(resultats.devolution.children.totalInheritance)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Part par enfant</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(resultats.devolution.children.inheritancePerChild)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Base taxable (par enfant)</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(resultats.rightsPerChild.taxableBase)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Droits dus par enfant</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(resultats.rightsPerChild.taxAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Total droits de succession</Label>
                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                      {formatCurrency(resultats.summary.totalSuccessionTax)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Net perçu par les héritiers</Label>
                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                      {formatCurrency(resultats.summary.netReceivedByHeirs)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configurez les paramètres de la succession pour voir les résultats</p>
                    {!personalInfo && (
                      <p className="text-sm mt-2">
                        Renseignez vos informations personnelles et patrimoniales pour commencer.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}