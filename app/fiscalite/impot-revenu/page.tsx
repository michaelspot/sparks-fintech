"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Plus, Trash2, Calculator, FileText, RefreshCw } from "lucide-react"

interface RevenuItem {
  id: string
  type: string // e.g. "salaire", "foncier"
  description: string
  montant: number // Gross amount for this fiscal category
  abattement: number // Fiscal abattement percentage for this category
  source?: "budget" | "manual"
}

// Structure from budget/revenus/page.tsx
interface BudgetIncome {
  id: string
  type: string // e.g., "Salaires", "Revenus fonciers"
  denomination: string
  amount: number // This is gross amount
  ownedBy: "Vous" | "Votre conjoint" | "Commun"
  fiscalRegime?: string
  deductibleExpenses?: number
}

const typeOptions = [
  { value: "salaire", label: "Salaires et traitements" },
  { value: "pension", label: "Pensions et retraites" },
  { value: "foncier", label: "Revenus fonciers" },
  { value: "mobilier", label: "Revenus mobiliers" },
  { value: "plus-value", label: "Plus-values" },
  { value: "bnc", label: "BNC (Non Commerciaux)" },
  { value: "bic", label: "BIC (Industriels et Commerciaux)" },
  { value: "agricole", label: "Revenus Agricoles" },
  { value: "autre", label: "Autres revenus" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

const LOCAL_STORAGE_KEY_IR = "fiscaliteIRInfo"
const LOCAL_STORAGE_KEY_BUDGET_REVENUS = "budgetRevenusInfo"

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

export default function ImpotRevenuPage() {
  const [revenus, setRevenus] = useState<RevenuItem[]>([])
  const [situationFamiliale, setSituationFamiliale] = useState("celibataire")
  const [nbParts, setNbParts] = useState(1)

  const loadDataFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      // Load manually entered fiscal data
      const savedFiscalData = localStorage.getItem(LOCAL_STORAGE_KEY_IR)
      let manualRevenus: RevenuItem[] = []
      if (savedFiscalData) {
        const parsed = JSON.parse(savedFiscalData)
        manualRevenus = parsed.revenus?.filter((r: RevenuItem) => r.source === "manual") || []
        setSituationFamiliale(parsed.situationFamiliale || "celibataire")
        setNbParts(parsed.nbParts || 1)
      }

      // Load and map budget revenus
      const savedBudgetRevenus = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET_REVENUS)
      let budgetMappedRevenus: RevenuItem[] = []
      if (savedBudgetRevenus) {
        const budgetIncomes: BudgetIncome[] = JSON.parse(savedBudgetRevenus)
        budgetMappedRevenus = budgetIncomes.map(mapBudgetIncomeToFiscalRevenu)
      }
      setRevenus([...budgetMappedRevenus, ...manualRevenus])
    }
  }, [])

  useEffect(() => {
    loadDataFromLocalStorage()
  }, [loadDataFromLocalStorage])

  const saveDataToLocalStorage = () => {
    if (typeof window !== "undefined") {
      const manualRevenus = revenus.filter((r) => r.source === "manual")
      const dataToSave = {
        revenus: manualRevenus, // Only save manually added/edited ones for this page
        situationFamiliale,
        nbParts,
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_IR, JSON.stringify(dataToSave))
      // alert("Données fiscales enregistrées !") // Optional: use a toast
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

  const calculerImpot = (revenu: number, parts: number) => {
    const quotientFamilial = revenu / parts
    let impot = 0
    if (quotientFamilial <= 11294) impot = 0
    else if (quotientFamilial <= 28797) impot = (quotientFamilial - 11294) * 0.11
    else if (quotientFamilial <= 82341) impot = (28797 - 11294) * 0.11 + (quotientFamilial - 28797) * 0.3
    else if (quotientFamilial <= 177106)
      impot = (28797 - 11294) * 0.11 + (82341 - 28797) * 0.3 + (quotientFamilial - 82341) * 0.41
    else
      impot =
        (28797 - 11294) * 0.11 + (82341 - 28797) * 0.3 + (177106 - 82341) * 0.41 + (quotientFamilial - 177106) * 0.45
    return Math.max(0, impot * parts)
  }

  const impotBrut = calculerImpot(revenuImposable, nbParts)
  const tauxMoyenImposition = revenuImposable > 0 ? (impotBrut / revenuImposable) * 100 : 0

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Impôt sur le revenu</h2>
          <p className="text-muted-foreground">Calculez votre impôt sur le revenu et optimisez votre fiscalité</p>
        </div>
        <Button onClick={loadDataFromLocalStorage} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser les données Budget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-9">
        <Card className="md:col-span-5">
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
                <Select value={situationFamiliale} onValueChange={setSituationFamiliale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celibataire">Célibataire</SelectItem>
                    <SelectItem value="marie">Marié(e)</SelectItem>
                    <SelectItem value="pacs">Pacsé(e)</SelectItem>
                    <SelectItem value="divorce">Divorcé(e)</SelectItem>
                    <SelectItem value="veuf">Veuf(ve)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parts">Nombre de parts</Label>
                <Input
                  id="parts"
                  type="number"
                  step="0.5"
                  min="1"
                  value={nbParts}
                  onChange={(e) => setNbParts(Number.parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Revenus (manuels ou importés du budget)</h3>
                <Button onClick={addRevenu} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un revenu manuel
                </Button>
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

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calcul de l'impôt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div className="flex justify-between text-lg font-semibold">
                  <span>Impôt sur le revenu</span>
                  <span className="text-red-600">
                    {impotBrut.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taux moyen d'imposition</span>
                  <Badge variant="secondary">{tauxMoyenImposition.toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Revenu net après impôt</span>
                  <span className="text-green-600">
                    {(revenuImposable - impotBrut).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Analyse fiscale</CardTitle>
            <CardDescription>Répartition et évolution de vos revenus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Répartition par type de revenu</h3>
              <ChartContainer config={{ revenus: { label: "Revenus" } }} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repartitionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {repartitionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-1 gap-1">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">{data.name}</span>
                                <span className="font-bold text-muted-foreground">
                                  {data.value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                </span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Évolution du calcul fiscal</h3>
              <ChartContainer
                config={{ montant: { label: "Montant", color: "hsl(var(--chart-1))" } }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evolutionData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {payload[0].payload.name}
                              </span>
                              <span className="font-bold">
                                {Math.abs(payload[0].value as number).toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: "EUR",
                                })}
                              </span>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="montant" fill="var(--color-montant)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3">
                <div className="text-2xl font-bold text-blue-600">{tauxMoyenImposition.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Taux moyen</p>
              </Card>
              <Card className="p-3">
                <div className="text-2xl font-bold text-green-600">{nbParts}</div>
                <p className="text-xs text-muted-foreground">Parts fiscales</p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
