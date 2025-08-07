"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from "recharts"

interface Income {
  id: string
  type: string
  denomination: string
  amount: number
  ownedBy: "Vous" | "Votre conjoint" | "Commun"
  fiscalRegime?: string
  deductibleExpenses?: number
}

const incomeTypes = [
  "Salaires",
  "Revenus industriels et commerciaux",
  "Revenus non commerciaux",
  "Revenus agricoles",
  "Revenus des locations meublées professionnels",
  "Pensions et retraites",
  "Pensions alimentaires",
  "Rentes viagères",
  "Allocations familiales",
  "Revenus mobiliers",
  "Revenus des locations meublées non professionnels",
  "Revenus fonciers",
  "Plus-values mobilières et gains divers",
  "Autres revenus réguliers",
  "Autres revenus exceptionnels",
]

const fiscalRegimeOptions: Record<string, string[]> = {
  "Revenus non commerciaux": ["Micro-BNC", "Régime de déclaration contrôlée"],
  Salaires: ["Aucun régime (déduction automatique de 10%)", "Déduction des frais professionnels"],
  "Revenus industriels et commerciaux": [
    "Micro-BIC Activités d'achat / revente",
    "Micro-BIC Activités de service",
    "Micro-BIC Activités de meublés de tourisme non classés",
    "Régime réel",
  ],
  "Revenus agricoles": ["Micro-bénéfices agricole", "Régime réel"],
  "Revenus fonciers": ["Micro-foncier", "Régime réel"],
  "Revenus mobiliers": ["Barème progressif", "PFU"],
}

const deductibleExpensesEnabledRegimes = [
  "Régime de déclaration contrôlée",
  "Déduction des frais professionnels",
  "Régime réel",
]

const LOCAL_STORAGE_KEY = "budgetRevenusInfo"

export default function RevenuesPage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [isClient, setIsClient] = useState(false)

  // Initialize from localStorage only on client side
  useEffect(() => {
    setIsClient(true)
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedData) {
      try {
        setIncomes(JSON.parse(savedData))
      } catch (error) {
        console.error('Error parsing saved income data:', error)
      }
    }
  }, [])

  const saveIncomesToLocalStorage = (updatedIncomes: Income[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedIncomes))
    }
  }

  useEffect(() => saveIncomesToLocalStorage(incomes), [incomes])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentIncome, setCurrentIncome] = useState<Partial<Income>>({})
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  const calculateNetAmount = (income: Income) => {
    return income.amount - (income.deductibleExpenses || 0)
  }

  const totalNetAmount = useMemo(() => {
    return incomes.reduce((sum, income) => sum + calculateNetAmount(income), 0)
  }, [incomes])

  const handleInputChange = (field: keyof Income, value: any) => {
    setCurrentIncome((prev) => ({ ...prev, [field]: value }))
    if (field === "type") {
      setCurrentIncome((prev) => ({
        ...prev,
        denomination: value as string,
        fiscalRegime: undefined,
        deductibleExpenses: undefined,
      }))
    }
    if (field === "fiscalRegime") {
      setCurrentIncome((prev) => ({ ...prev, deductibleExpenses: undefined }))
    }
  }

  const handleAddIncome = () => {
    if (
      currentIncome.type &&
      currentIncome.denomination &&
      currentIncome.amount !== undefined &&
      currentIncome.ownedBy
    ) {
      const newIncome: Income = {
        id: Date.now().toString(),
        type: currentIncome.type,
        denomination: currentIncome.denomination,
        amount: currentIncome.amount,
        ownedBy: currentIncome.ownedBy,
        fiscalRegime: currentIncome.fiscalRegime,
        deductibleExpenses: currentIncome.deductibleExpenses,
      }
      const updatedIncomes = [...incomes, newIncome]
      setIncomes(updatedIncomes)
      setCurrentIncome({})
      setIsAddDialogOpen(false)
    }
  }

  const openEditDialog = (income: Income) => {
    setEditingIncome(income)
    setCurrentIncome(income)
    setIsEditDialogOpen(true)
  }

  const handleUpdateIncome = () => {
    if (
      editingIncome &&
      currentIncome.type &&
      currentIncome.denomination &&
      currentIncome.amount !== undefined &&
      currentIncome.ownedBy
    ) {
      const updatedIncome: Income = {
        ...editingIncome,
        type: currentIncome.type,
        denomination: currentIncome.denomination,
        amount: currentIncome.amount,
        ownedBy: currentIncome.ownedBy,
        fiscalRegime: currentIncome.fiscalRegime,
        deductibleExpenses: currentIncome.deductibleExpenses,
      }
      const updatedIncomesList = incomes.map((inc) => (inc.id === editingIncome.id ? updatedIncome : inc))
      setIncomes(updatedIncomesList)
      setCurrentIncome({})
      setEditingIncome(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteIncome = (id: string) => {
    const updatedIncomes = incomes.filter((inc) => inc.id !== id)
    setIncomes(updatedIncomes)
  }

  const ownershipData = useMemo(
    () => [
      {
        name: "Vous",
        value: incomes.filter((inc) => inc.ownedBy === "Vous").reduce((sum, inc) => sum + calculateNetAmount(inc), 0),
        fill: "#3b82f6", // blue-500
      },
      {
        name: "Votre conjoint",
        value: incomes
          .filter((inc) => inc.ownedBy === "Votre conjoint")
          .reduce((sum, inc) => sum + calculateNetAmount(inc), 0),
        fill: "#60a5fa", // blue-400
      },
      {
        name: "Commun",
        value: incomes.filter((inc) => inc.ownedBy === "Commun").reduce((sum, inc) => sum + calculateNetAmount(inc), 0),
        fill: "#93c5fd", // blue-300
      },
    ],
    [incomes],
  )

  const typeDistributionData = useMemo(() => {
    const distribution = incomeTypes
      .map((type) => ({
        name: type,
        value: incomes.filter((inc) => inc.type === type).reduce((sum, inc) => sum + calculateNetAmount(inc), 0),
      }))
      .filter((item) => item.value > 0)

    const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"]
    return distribution.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length],
    }))
  }, [incomes])

  const selectedFiscalRegimes = currentIncome.type ? fiscalRegimeOptions[currentIncome.type] || [] : []
  const isDeductibleEnabled =
    !!currentIncome.fiscalRegime && deductibleExpensesEnabledRegimes.includes(currentIncome.fiscalRegime)

  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type de revenu</Label>
        <Select value={currentIncome.type || ""} onValueChange={(value) => handleInputChange("type", value)}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Sélectionner un type..." />
          </SelectTrigger>
          <SelectContent>
            {incomeTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="denomination">Dénomination</Label>
        <Input
          id="denomination"
          value={currentIncome.denomination || ""}
          onChange={(e) => handleInputChange("denomination", e.target.value)}
          placeholder="Ex: Salaire principal"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Montant (€)</Label>
        <Input
          id="amount"
          type="number"
          value={currentIncome.amount || ""}
          onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value) || 0)}
          placeholder="Ex: 30000"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ownedBy">Détention</Label>
        <Select value={currentIncome.ownedBy || ""} onValueChange={(value) => handleInputChange("ownedBy", value)}>
          <SelectTrigger id="ownedBy">
            <SelectValue placeholder="Sélectionner détenteur..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Vous">Vous</SelectItem>
            <SelectItem value="Votre conjoint">Votre conjoint</SelectItem>
            <SelectItem value="Commun">Commun</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {selectedFiscalRegimes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="fiscalRegime">Régime fiscal</Label>
          <Select
            value={currentIncome.fiscalRegime || ""}
            onValueChange={(value) => handleInputChange("fiscalRegime", value)}
          >
            <SelectTrigger id="fiscalRegime">
              <SelectValue placeholder="Sélectionner un régime..." />
            </SelectTrigger>
            <SelectContent>
              {selectedFiscalRegimes.map((regime) => (
                <SelectItem key={regime} value={regime}>
                  {regime}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="deductibleExpenses">Frais déductibles (€)</Label>
        <Input
          id="deductibleExpenses"
          type="number"
          value={currentIncome.deductibleExpenses || ""}
          onChange={(e) => handleInputChange("deductibleExpenses", Number.parseFloat(e.target.value) || 0)}
          placeholder="Ex: 1500"
          disabled={!isDeductibleEnabled}
        />
        {!isDeductibleEnabled && currentIncome.fiscalRegime && (
          <p className="text-xs text-muted-foreground">Non applicable pour ce régime fiscal.</p>
        )}
      </div>
    </div>
  )

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/budget">Budget</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Revenus</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setCurrentIncome({})
                  setIsAddDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un revenu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un revenu</DialogTitle>
                <DialogDescription>Saisissez les informations de votre revenu.</DialogDescription>
              </DialogHeader>
              {renderFormFields()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddIncome}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {!isClient ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="animate-pulse">Chargement...</div>
          </div>
        ) : incomes.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Aucun revenu n'a été ajouté pour le moment.</h3>
                <p className="text-muted-foreground">Cliquez sur "+ Ajouter un revenu" pour commencer.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid gap-6 md:grid-cols-9 items-stretch">
              <div className="md:col-span-5 space-y-6">
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <h3 className="text-3xl font-bold">{totalNetAmount.toLocaleString("fr-FR")} €</h3>
                    <CardDescription>Revenu Annuel Net Total</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-col h-full justify-between gap-2">
                      {ownershipData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: `${item.fill}20` }} // Lighter background
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.fill }}></div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold">{(item.value || 0).toLocaleString("fr-FR")} €</span>
                            <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                              {totalNetAmount > 0 ? (((item.value || 0) / totalNetAmount) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle>Répartition par type</CardTitle>
                  <CardDescription>Distribution par catégorie de revenu (net)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full md:w-1/2 h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {typeDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${(value || 0).toLocaleString("fr-FR")} €`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 space-y-1 text-sm">
                      {typeDistributionData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: item.fill }}></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">{(item.value || 0).toLocaleString("fr-FR")} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Incomes List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vos revenus</h3>
              {incomes.map((income) => (
                <Card key={income.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{income.denomination}</CardTitle>
                        <CardDescription>
                          {income.type} • Net: {calculateNetAmount(income).toLocaleString("fr-FR")} € • {income.ownedBy}
                          {income.fiscalRegime && ` • ${income.fiscalRegime}`}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(income)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteIncome(income.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier un revenu</DialogTitle>
            <DialogDescription>Modifiez les informations de votre revenu.</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateIncome}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  )
}
