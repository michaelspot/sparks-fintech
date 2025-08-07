"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AlertCircle, ArrowRight, Calculator, FileText, Plus, RefreshCw, Trash2, TrendingUp, Info } from "lucide-react"
import { calcIR, mapBudgetToRevenuLines, mapMaritalStatusToStatut, Inputs, Outputs, RevenueLine, Statut } from "@/lib/impot-revenu"

const LOCAL_STORAGE_KEY_IR = "fiscaliteIRInfo"
const LOCAL_STORAGE_KEY_BUDGET_REVENUS = "budgetRevenusInfo"
const LOCAL_STORAGE_KEY_IDENTITY_PERSONAL = "identityPersonalInfo"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

const mapBudgetIncomeToFiscalRevenu = (budgetIncome: BudgetIncome): RevenuItem => {
  let fiscalType = "autre"
  let fiscalAbattement = 0
  let montantFiscal = budgetIncome.amount // Start with the gross amount from budget

  // This mapping needs to be robust based on budgetIncome.type and budgetIncome.fiscalRegime
  switch (budgetIncome.type) {
    case "Salaires":
      fiscalType = "salaire"
      // If frais réels were deducted in budget, montantFiscal should be pre-deduction.
      // For simplicity, assume budgetIncome.amount is always gross salary.
      // The 10% abattement is standard unless frais réels are chosen.
      // If budgetIncome.fiscalRegime implies frais réels, abattement is 0, but frais réels are part of `deductibleExpenses`.
      // The current structure of RevenuItem expects `montant` to be pre-abattement, and `abattement` to be the %
      if (budgetIncome.fiscalRegime === "Déduction des frais professionnels") {
        fiscalAbattement = 0 // Frais réels already handled by deductibleExpenses in budget
        montantFiscal = budgetIncome.amount - (budgetIncome.deductibleExpenses || 0) // Use net if frais reels
      } else {
        fiscalAbattement = 10 // Standard 10%
      }
      break
    case "Revenus fonciers":
      fiscalType = "foncier"
      if (budgetIncome.fiscalRegime === "Micro-foncier") {
        fiscalAbattement = 30
      } else {
        // Régime réel
        fiscalAbattement = 0
        montantFiscal = budgetIncome.amount - (budgetIncome.deductibleExpenses || 0)
      }
      break
    case "Revenus non commerciaux": // BNC
      fiscalType = "bnc"
      if (budgetIncome.fiscalRegime === "Micro-BNC") {
        fiscalAbattement = 34 // Standard for BNC, could vary
      } else {
        // Déclaration contrôlée
        fiscalAbattement = 0
        montantFiscal = budgetIncome.amount - (budgetIncome.deductibleExpenses || 0)
      }
      break
    case "Revenus industriels et commerciaux": // BIC
      fiscalType = "bic"
      if (budgetIncome.fiscalRegime?.startsWith("Micro-BIC")) {
        // Simplified: 50% for services, 71% for achat/revente. Needs more info.
        fiscalAbattement = budgetIncome.fiscalRegime?.includes("service") ? 50 : 71
      } else {
        // Régime réel
        fiscalAbattement = 0
        montantFiscal = budgetIncome.amount - (budgetIncome.deductibleExpenses || 0)
      }
      break
    case "Pensions et retraites":
      fiscalType = "pension"
      fiscalAbattement = 10 // Standard 10% on pensions
      break
    // Add more mappings as needed
    default:
      fiscalType = "autre"
      fiscalAbattement = 0
  }

  return {
    id: `budget-${budgetIncome.id}`,
    type: fiscalType,
    description: `${budgetIncome.denomination} (Budget)`,
    montant: montantFiscal,
    abattement: fiscalAbattement,
    source: "budget",
  }
}

// Fonction pour mapper le statut marital de l'identité vers la situation fiscale
const mapMaritalStatusToSituationFiscale = (maritalStatus: string): string => {
  switch(maritalStatus) {
    case 'marié': return 'marie'
    case 'pacsé': return 'pacs'
    case 'divorcé': return 'divorce'
    case 'veuf': return 'veuf'
    default: return 'celibataire'
  }
}

// Fonction pour calculer le nombre de parts fiscales
const calculateFiscalParts = (situationFamiliale: string, childrenCount: number): number => {
  // Déterminer le nombre de parts de base selon la situation familiale
  let baseParts = 1; // Célibataire, divorcé, veuf par défaut
  
  if (situationFamiliale === 'marie' || situationFamiliale === 'pacs') {
    baseParts = 2; // Marié ou pacsé
  }
  
  // Ajouter les parts pour les enfants selon la formule fournie
  switch(childrenCount) {
    case 0:
      return baseParts;
    case 1:
      return baseParts + 0.5;
    case 2:
      return baseParts + 0.5 + 0.5;
    case 3:
      return baseParts + 0.5 + 0.5 + 1;
    case 4:
      return baseParts + 0.5 + 0.5 + 1 + 1;
    default:
      // Pour plus de 4 enfants, on continue le modèle (1 part par enfant supplémentaire après le 4ème)
      return baseParts + 0.5 + 0.5 + 1 + 1 + (childrenCount - 4);
  }
}

// Fonction pour obtenir le libellé de la situation familiale
const getSituationFamilialeLabel = (situation: string): string => {
  switch(situation) {
    case 'celibataire': return 'Célibataire'
    case 'marie': return 'Marié(e)'
    case 'pacs': return 'Pacsé(e)'
    case 'divorce': return 'Divorcé(e)'
    case 'veuf': return 'Veuf(ve)'
    default: return 'Célibataire'
  }
}

export default function ImpotRevenuPage() {
  // États pour la nouvelle logique de calcul
  const [situationFiscale, setSituationFiscale] = useState<Statut>('Célibataire')
  const [nombreEnfants, setNombreEnfants] = useState(0)
  const [deductionsSupplementaires, setDeductionsSupplementaires] = useState(0)
  const [reductionsImpotNew, setReductionsImpotNew] = useState(0)
  const [creditsImpotNew, setCreditsImpotNew] = useState(0)
  const [resultatCalcul, setResultatCalcul] = useState<Outputs | null>(null)
  const [revenuLines, setRevenuLines] = useState<RevenueLine[]>([])  
  const [dataLoaded, setDataLoaded] = useState(false)

  const loadDataFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedIdentityData = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY_PERSONAL)
      console.log("🔍 Données d'identité trouvées:", savedIdentityData)
      
      if (savedIdentityData) {
        const parsedIdentity = JSON.parse(savedIdentityData)
        console.log("📊 Données d'identité parsées:", parsedIdentity)
        
        const maritalStatus = parsedIdentity.maritalStatus || ''
        const children = parsedIdentity.children || []
        
        console.log("👫 Statut marital:", maritalStatus)
        console.log("👶 Enfants:", children, "Nombre:", children.length)
        
        const mappedSituationFamiliale = mapMaritalStatusToSituationFiscale(maritalStatus)
        const calculatedParts = calculateFiscalParts(mappedSituationFamiliale, children.length)
        const familialeLabel = getSituationFamilialeLabel(mappedSituationFamiliale)
        
        console.log("🏠 Situation familiale mappée:", mappedSituationFamiliale)
        console.log("🧮 Parts calculées:", calculatedParts)
        console.log("🏷️ Libellé situation familiale:", familialeLabel)
        
        setSituationFamiliale(mappedSituationFamiliale)
        setSituationFamilialeLabel(familialeLabel)
        setNbParts(calculatedParts)
      } else {
        console.log("❌ Aucune donnée d'identité trouvée dans localStorage")
      }
      
      const savedFiscalData = localStorage.getItem(LOCAL_STORAGE_KEY_IR)
      let manualRevenus: RevenuItem[] = []
      if (savedFiscalData) {
        const parsed = JSON.parse(savedFiscalData)
        console.log("💰 Données fiscales existantes:", parsed)
        manualRevenus = parsed.revenus?.filter((r: RevenuItem) => r.source === "manual") || []
        
        if (parsed.nbParts && typeof parsed.nbParts === 'number') {
          console.log("⚠️ Utilisation du nombre de parts des données fiscales:", parsed.nbParts)
          setNbParts(parsed.nbParts)
          setPartsModifiedManually(true) // Marquer comme modifié manuellement si des données fiscales existent
          // Ne pas écraser la situation familiale qui vient de l'identité
        }
        
        // Charger les valeurs des déductions, réductions et crédits d'impôt
        if (parsed.deductionsImpot !== undefined) setDeductionsImpot(parsed.deductionsImpot)
        if (parsed.reductionsImpot !== undefined) setReductionsImpot(parsed.reductionsImpot)
        if (parsed.creditImpot !== undefined) setCreditImpot(parsed.creditImpot)
      }
      
      const savedBudgetRevenus = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET_REVENUS)
      let budgetMappedRevenus: RevenuItem[] = []
      if (savedBudgetRevenus) {
        const budgetIncomes: BudgetIncome[] = JSON.parse(savedBudgetRevenus)
        budgetMappedRevenus = budgetIncomes.map(mapBudgetIncomeToFiscalRevenu)
      }
      setRevenus([...budgetMappedRevenus, ...manualRevenus])
    }
  }, [])

  // Étendre l'interface Window pour notre utilisation
  useEffect(() => {
    loadDataFromLocalStorage()
    
    // Mettre en place un écouteur d'événements pour détecter les changements du localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_BUDGET_REVENUS || e.key === LOCAL_STORAGE_KEY_IDENTITY_PERSONAL) {
        loadDataFromLocalStorage()
      }
    }
    
    // Surveiller les changements du localStorage
    window.addEventListener('storage', handleStorageChange)
    
    // Variables pour stocker les dernières valeurs connues
    let lastBudgetData = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET_REVENUS) || ''
    let lastIdentityData = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY_PERSONAL) || ''
    
    // Vérifier périodiquement les changements (car les modifications dans le même onglet ne déclenchent pas l'événement storage)
    const intervalId = setInterval(() => {
      const currentBudgetData = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET_REVENUS) || ''
      const currentIdentityData = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY_PERSONAL) || ''
      
      if (currentBudgetData !== lastBudgetData || currentIdentityData !== lastIdentityData) {
        lastBudgetData = currentBudgetData
        lastIdentityData = currentIdentityData
        loadDataFromLocalStorage()
      }
    }, 1000) // Vérifier chaque seconde
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [loadDataFromLocalStorage])
  
  // Effet pour recalculer le nombre de parts quand la situation familiale change, sauf si modifié manuellement
  useEffect(() => {
    const savedIdentityData = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY_PERSONAL)
    if (savedIdentityData && !partsModifiedManually) {
      const parsedIdentity = JSON.parse(savedIdentityData)
      const children = parsedIdentity.children || []
      const calculatedParts = calculateFiscalParts(situationFamiliale, children.length)
      setNbParts(calculatedParts)
    }
  }, [situationFamiliale, partsModifiedManually])

  const saveDataToLocalStorage = () => {
    if (typeof window !== "undefined") {
      // Récupérer la situation familiale actuelle depuis l'identité
      const savedIdentityData = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY_PERSONAL)
      let currentSituationFamiliale = situationFamiliale
      
      if (savedIdentityData) {
        const parsedIdentity = JSON.parse(savedIdentityData)
        const maritalStatus = parsedIdentity.maritalStatus || ''
        currentSituationFamiliale = mapMaritalStatusToSituationFiscale(maritalStatus)
      }
      
      // Calculer les informations fiscales actuelles
      const impotResult = calculateImpot(revenuImposable, nbParts)
      
      const manualRevenus = revenus.filter((r) => r.source === "manual")
      const dataToSave = {
        revenus: manualRevenus, // Only save manually added/edited ones for this page
        situationFamiliale: currentSituationFamiliale, // Utiliser la valeur de l'identité
        nbParts,
        deductionsImpot,
        reductionsImpot,
        creditImpot,
        // Ajouter les nouvelles informations fiscales
        trancheMarginaleDimposition: impotResult.trancheMarginal,
        tauxMoyenDimposition: impotResult.tauxMoyen,
        impotApresAvantages: impotResult.impotApresAvantages,
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_IR, JSON.stringify(dataToSave))
    }
  }

  const addRevenu = () => {
    const newRevenu: RevenuItem = {
      id: Date.now().toString(),
      type: "salaire",
      description: "",
      montant: 0,
      abattement: 10,
      source: "manual",
    }
    setRevenus([...revenus, newRevenu])
  }

  const updateRevenu = (id: string, field: keyof RevenuItem, value: string | number) => {
    const updatedRevenu: RevenuItem[] = revenus.map((item) => {
      if (item.id === id) {
        // Garantir que le type source reste dans l'union "budget" | "manual" | undefined
        const updatedSource: "budget" | "manual" | undefined = item.source === "budget" ? "budget" : "manual";
        const updatedItem: RevenuItem = { ...item, [field]: value, source: updatedSource }
        
        // Si c'est un revenu provenant du budget, on synchronise avec le budget
        if (item.source === "budget") {
          const savedBudgetRevenus = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET_REVENUS)
          if (savedBudgetRevenus) {
            const budgetIncomes: BudgetIncome[] = JSON.parse(savedBudgetRevenus)
            const budgetId = item.id.replace("budget-", "") // Récupérer l'ID original du budget
            
            // Mettre à jour les données du budget
            const updatedBudgetIncomes = budgetIncomes.map((budgetItem) => {
              if (budgetItem.id === budgetId) {
                const updatedBudgetItem = { ...budgetItem }
                
                // Synchroniser le montant
                if (field === "montant") {
                  updatedBudgetItem.amount = value as number
                }
                
                // Synchroniser le type (nécessite une conversion)
                if (field === "type") {
                  // Conversion du type fiscal vers le type budget
                  const typeValue = value as string
                  const typeMapping: Record<string, string> = {
                    "salaire": "Salaires",
                    "pension": "Pensions et retraites",
                    "foncier": "Revenus fonciers",
                    "mobilier": "Revenus mobiliers",
                    "plus-value": "Plus-values mobilières et gains divers",
                    "bnc": "Revenus non commerciaux",
                    "bic": "Revenus industriels et commerciaux",
                    "agricole": "Revenus agricoles",
                    "autre": "Autres revenus réguliers"
                  }
                  
                  updatedBudgetItem.type = typeMapping[typeValue] || "Autres revenus réguliers"
                  
                  // Mise à jour du régime fiscal selon le type
                  if (typeValue === "salaire") {
                    updatedBudgetItem.fiscalRegime = "Aucun régime (déduction automatique de 10%)"
                  } else if (typeValue === "foncier") {
                    updatedBudgetItem.fiscalRegime = "Micro-foncier"
                  } else if (typeValue === "bnc") {
                    updatedBudgetItem.fiscalRegime = "Micro-BNC"
                  } else if (typeValue === "bic") {
                    updatedBudgetItem.fiscalRegime = "Micro-BIC Activités de service"
                  }
                }
                
                return updatedBudgetItem
              }
              return budgetItem
            })
            
            // Enregistrer les modifications dans localStorage
            localStorage.setItem(LOCAL_STORAGE_KEY_BUDGET_REVENUS, JSON.stringify(updatedBudgetIncomes))
          }
        }
        
        return updatedItem
      }
      return item
    })
    
    setRevenus(updatedRevenu)
  }

  const deleteRevenu = (id: string) => {
    setRevenus(revenus.filter((item) => item.id !== id))
  }

  useEffect(() => {
    saveDataToLocalStorage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revenus, situationFamiliale, nbParts]) // Save whenever these change

  // Calculs fiscaux
  const revenuBrutGlobal = revenus.reduce((sum, item) => sum + item.montant, 0)
  const abattementsTotal = revenus.reduce((sum, item) => {
    // For salaries with 10% abattement, it's capped. Simplified here.
    // Min abattement 495€, max 14171€ per declarant for 2023 revenus.
    // This simplified calculation doesn't include these caps/floors.
    return sum + (item.montant * item.abattement) / 100
  }, 0)
  const revenuNetGlobal = revenuBrutGlobal - abattementsTotal
  const revenuImposable = Math.max(0, revenuNetGlobal)

  const calculateImpot = (revenuImposable: number, nbParts: number): { impot: number; tauxMoyen: number; trancheMarginal: number; impotApresAvantages: number } => {
    const bareme = [
      { limite: 10777, taux: 0 },
      { limite: 27478, taux: 0.11 },
      { limite: 78570, taux: 0.30 },
      { limite: 168994, taux: 0.41 },
      { limite: Infinity, taux: 0.45 },
    ]

    // Calcul du quotient familial
    // On applique d'abord les déductions d'impôt au revenu imposable
    const revenuApresDeductions = Math.max(0, revenuImposable - deductionsImpot)
    const quotient = revenuApresDeductions / nbParts

    // Calcul de l'impôt par part
    let impotParPart = 0
    let trancheMarginal = 0

    for (let i = 0; i < bareme.length; i++) {
      const tranche = bareme[i]
      const tranchePrecedente = i > 0 ? bareme[i - 1].limite : 0

      if (quotient > tranchePrecedente) {
        const montantDansLaTranche = Math.min(quotient, tranche.limite) - tranchePrecedente
        impotParPart += montantDansLaTranche * tranche.taux

        if (quotient <= tranche.limite) {
          trancheMarginal = tranche.taux
          break
        }
      }
    }

    // Calcul de l'impôt total
    const impotBrut = impotParPart * nbParts
    const impot = Math.max(0, impotBrut)
    
    // Application des réductions et crédits d'impôt
    // Les réductions d'impôt ne peuvent pas réduire l'impôt en dessous de zéro
    const impotApresReductions = Math.max(0, impot - reductionsImpot)
    // Les crédits d'impôt peuvent générer un remboursement (impôt négatif)
    const impotApresAvantages = impotApresReductions - creditImpot
    
    const tauxMoyen = revenuImposable > 0 ? (impot / revenuImposable) * 100 : 0

    return {
      impot, // Impôt brut avant avantages fiscaux
      tauxMoyen,
      trancheMarginal: trancheMarginal * 100,
      impotApresAvantages, // Impôt final après déductions, réductions et crédits
    }
  }

  const impotResult = calculateImpot(revenuImposable, nbParts)
  const impotBrut = impotResult.impot
  const tauxMoyenImposition = impotResult.tauxMoyen
  const trancheMarginal = impotResult.trancheMarginal
  const impotApresAvantages = impotResult.impotApresAvantages

  const repartitionData = revenus
    .filter((item) => item.montant > 0)
    .map((item, index) => ({
      name: typeOptions.find((opt) => opt.value === item.type)?.label || item.type,
      value: item.montant,
      color: COLORS[index % COLORS.length],
    }))

  const evolutionData = [
    { name: "Revenu brut", montant: revenuBrutGlobal },
    { name: "Abattements", montant: -abattementsTotal },
    { name: "Revenu imposable", montant: revenuImposable },
    { name: "Impôt", montant: -impotBrut },
    { name: "Revenu net après impôt", montant: revenuImposable - impotBrut },
  ]

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/fiscalite">Fiscalité</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Impôt sur le revenu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Déclaration de revenus
              </CardTitle>
              <CardDescription>
                Saisissez vos différents revenus pour calculer votre impôt. Les revenus du budget sont automatiquement
                importés.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="situation">Situation familiale</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {situationFamilialeLabel}
                  </div>
                  <p className="text-xs text-muted-foreground">Définie dans la section Identité</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parts">Nombre de parts</Label>
                  <div className="relative">
                    <Input
                      id="parts"
                      type="number"
                      step="0.5"
                      min="1"
                      value={nbParts}
                      onChange={(e) => {
                        setNbParts(Number.parseFloat(e.target.value) || 1)
                        setPartsModifiedManually(true) // Marquer comme modifié manuellement quand l'utilisateur change la valeur
                      }}
                      className="pr-8"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
                      onClick={() => {
                        // Réinitialiser le nombre de parts à partir des données d'identité
                        const savedIdentityData = localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY_PERSONAL)
                        if (savedIdentityData) {
                          const parsedIdentity = JSON.parse(savedIdentityData)
                          const children = parsedIdentity.children || []
                          const calculatedParts = calculateFiscalParts(situationFamiliale, children.length)
                          setNbParts(calculatedParts)
                          setPartsModifiedManually(false)
                        }
                      }}
                      title="Réinitialiser le nombre de parts"
                    >
                      <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Calculé automatiquement mais modifiable</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium">Avantages fiscaux</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Déductions d'impôt (€)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={deductionsImpot}
                      onChange={(e) => setDeductionsImpot(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reductions">Réductions d'impôt (€)</Label>
                    <Input
                      id="reductions"
                      type="number"
                      value={reductionsImpot}
                      onChange={(e) => setReductionsImpot(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit">Crédit d'impôt (€)</Label>
                    <Input
                      id="credit"
                      type="number"
                      value={creditImpot}
                      onChange={(e) => setCreditImpot(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Revenus (importés du budget)</h3>
                </div>
                {revenus.map((revenu) => (
                  <Card
                    key={revenu.id}
                    className={`p-4 ${revenu.source === "budget" ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700" : ""}`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                      <div className={revenu.source === "budget" ? "lg:col-span-5" : "lg:col-span-4"}>
                        <Label>Type de revenu</Label>
                        <Select
                          value={revenu.type}
                          onValueChange={(value) => updateRevenu(revenu.id, "type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {revenu.source !== "budget" && (
                        <div className="lg:col-span-4">
                          <Label>Description</Label>
                          <Input
                            value={revenu.description}
                            onChange={(e) => updateRevenu(revenu.id, "description", e.target.value)}
                            placeholder="Description du revenu"
                          />
                        </div>
                      )}
                      <div className={revenu.source === "budget" ? "lg:col-span-5" : "lg:col-span-2"}>
                        <Label>Montant (€)</Label>
                        <Input
                          type="number"
                          value={revenu.montant}
                          onChange={(e) => updateRevenu(revenu.id, "montant", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      {revenu.source !== "budget" && (
                        <div className="lg:col-span-1">
                          <Label>Abattement (%)</Label>
                          <Input
                            type="number"
                            value={revenu.abattement}
                            onChange={(e) => updateRevenu(revenu.id, "abattement", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      )}
                      <div className="lg:col-span-2 flex items-end">
                        <Button variant="outline" size="icon" onClick={() => deleteRevenu(revenu.id)} className="h-9 w-9">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* La section Calcul de l'impôt a été déplacée vers la colonne de droite */}
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Analyse fiscale</CardTitle>
              <CardDescription>Répartition et évolution de vos revenus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Revenu imposable</div>
                    <div className="text-2xl font-bold">{revenuImposable.toLocaleString()} €</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Impôt brut</div>
                    <div className="text-2xl font-bold">{impotBrut.toLocaleString()} €</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Avantages fiscaux</div>
                    <div className="text-2xl font-bold">{(deductionsImpot + reductionsImpot + creditImpot).toLocaleString()} €</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Impôt final</div>
                    <div className={`text-2xl font-bold ${impotApresAvantages < 0 ? 'text-green-600' : ''}`}>
                      {impotApresAvantages.toLocaleString()} €
                      {impotApresAvantages < 0 && <span className="text-sm ml-2">(remboursement)</span>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Tranche marginale</div>
                    <div className="text-2xl font-bold">{trancheMarginal.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Taux moyen</div>
                    <div className="text-2xl font-bold">{tauxMoyenImposition.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
              
              <Card className="bg-muted/50">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5" />
                    Calcul de l'impôt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  <div className="flex justify-between">
                    <span>Revenu brut global</span>
                    <span className="font-medium">
                      {revenuBrutGlobal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Abattements</span>
                    <span className="font-medium">
                      -{abattementsTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenu net global</span>
                    <span className="font-medium">
                      {revenuNetGlobal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Déductions d'impôt</span>
                    <span className="font-medium">
                      -{deductionsImpot.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Réductions d'impôt</span>
                    <span className="font-medium">
                      -{reductionsImpot.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crédit d'impôt</span>
                    <span className="font-medium">
                      -{creditImpot.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Impôt sur le revenu</span>
                    <span className={impotApresAvantages < 0 ? "text-green-600" : "text-red-600"}>
                      {impotApresAvantages.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      {impotApresAvantages < 0 && " (remboursement)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenu net après impôt</span>
                    <span className="text-green-600">
                      {(revenuImposable - impotApresAvantages).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
