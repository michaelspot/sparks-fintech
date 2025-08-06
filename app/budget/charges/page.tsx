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

interface Expense {
  id: string
  type: string
  denomination: string
  amount: number
  ownedBy: "Vous" | "Votre conjoint" | "Commun"
}

const expenseTypes = [
  "Loyers (hors charges)",
  "Charges d'éducation",
  "Emploi d'un salarié à domicile",
  "Frais de garde",
  "Pensions alimentaires",
  "Échéances - Crédits immobiliers",
  "Échéances - Autres crédits",
  "Autres dépenses courantes",
  "Taxe d'habitation",
  "Taxe foncière",
  "Impôts sur le Revenu",
  "Prélèvements sociaux",
  "Contributions sociales prélevées à la source",
  "Impôts sur les plus-values immobilières",
  "Autres impôts et taxes",
  "Épargne programmée",
  "Frais liés aux actifs",
  "Charges exceptionnelles",
]

const LOCAL_STORAGE_KEY = "budgetChargesInfo"

export default function RevenuesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) return JSON.parse(savedData)
    }
    return []
  })

  const saveExpensesToLocalStorage = (updatedExpenses: Expense[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedExpenses))
    }
  }

  useEffect(() => saveExpensesToLocalStorage(expenses), [expenses])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({})
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const calculateNetAmount = (expense: Expense) => {
    return expense.amount
  }

  const totalNetAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + calculateNetAmount(expense), 0)
  }, [expenses])

  const handleInputChange = (field: keyof Expense, value: any) => {
    setCurrentExpense((prev) => ({ ...prev, [field]: value }))
    if (field === "type") {
      setCurrentExpense((prev) => ({
        ...prev,
        denomination: value as string,
      }))
    }
  }

  const handleAddExpense = () => {
    if (
      currentExpense.type &&
      currentExpense.denomination &&
      currentExpense.amount !== undefined &&
      currentExpense.ownedBy
    ) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        type: currentExpense.type,
        denomination: currentExpense.denomination,
        amount: currentExpense.amount,
        ownedBy: currentExpense.ownedBy,
      }
      const updatedExpenses = [...expenses, newExpense]
      setExpenses(updatedExpenses)
      setCurrentExpense({})
      setIsAddDialogOpen(false)
    }
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    setCurrentExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleUpdateExpense = () => {
    if (
      editingExpense &&
      currentExpense.type &&
      currentExpense.denomination &&
      currentExpense.amount !== undefined &&
      currentExpense.ownedBy
    ) {
      const updatedExpense: Expense = {
        ...editingExpense,
        type: currentExpense.type,
        denomination: currentExpense.denomination,
        amount: currentExpense.amount,
        ownedBy: currentExpense.ownedBy,
      }
      const updatedExpensesList = expenses.map((inc) => (inc.id === editingExpense.id ? updatedExpense : inc))
      setExpenses(updatedExpensesList)
      setCurrentExpense({})
      setEditingExpense(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((inc) => inc.id !== id)
    setExpenses(updatedExpenses)
  }

  const ownershipData = useMemo(
    () => [
      {
        name: "Vous",
        value: expenses.filter((inc) => inc.ownedBy === "Vous").reduce((sum, inc) => sum + calculateNetAmount(inc), 0),
        fill: "#3b82f6", // blue-500
      },
      {
        name: "Votre conjoint",
        value: expenses
          .filter((inc) => inc.ownedBy === "Votre conjoint")
          .reduce((sum, inc) => sum + calculateNetAmount(inc), 0),
        fill: "#60a5fa", // blue-400
      },
      {
        name: "Commun",
        value: expenses
          .filter((inc) => inc.ownedBy === "Commun")
          .reduce((sum, inc) => sum + calculateNetAmount(inc), 0),
        fill: "#93c5fd", // blue-300
      },
    ],
    [expenses],
  )

  const typeDistributionData = useMemo(() => {
    const distribution = expenseTypes
      .map((type) => ({
        name: type,
        value: expenses.filter((inc) => inc.type === type).reduce((sum, inc) => sum + calculateNetAmount(inc), 0),
      }))
      .filter((item) => item.value > 0)

    const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"]
    return distribution.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length],
    }))
  }, [expenses])

  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type de charge</Label>
        <Select value={currentExpense.type} onValueChange={(value) => handleInputChange("type", value)}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Sélectionner un type..." />
          </SelectTrigger>
          <SelectContent>
            {expenseTypes.map((type) => (
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
          value={currentExpense.denomination || ""}
          onChange={(e) => handleInputChange("denomination", e.target.value)}
          placeholder="Ex: Salaire principal"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Montant (€)</Label>
        <Input
          id="amount"
          type="number"
          value={currentExpense.amount || ""}
          onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value) || 0)}
          placeholder="Ex: 30000"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ownedBy">Détention</Label>
        <Select value={currentExpense.ownedBy} onValueChange={(value) => handleInputChange("ownedBy", value)}>
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
                <BreadcrumbPage>Charges</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setCurrentExpense({})
                  setIsAddDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une charge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter une charge</DialogTitle>
                <DialogDescription>Saisissez les informations de votre charge.</DialogDescription>
              </DialogHeader>
              {renderFormFields()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddExpense}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {expenses.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Aucune charge n'a été ajoutée pour le moment.</h3>
                <p className="text-muted-foreground">Cliquez sur "+ Ajouter une charge" pour commencer.</p>
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
                    <CardDescription>Charges Annuelles Totales</CardDescription>
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
                            <span className="font-semibold">{item.value.toLocaleString("fr-FR")} €</span>
                            <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                              {totalNetAmount > 0 ? ((item.value / totalNetAmount) * 100).toFixed(1) : 0}%
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
                  <CardDescription>Distribution par catégorie de charge (net)</CardDescription>
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
                          <Tooltip formatter={(value: number) => `${value.toLocaleString("fr-FR")} €`} />
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
                          <span className="font-medium">{item.value.toLocaleString("fr-FR")} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Incomes List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vos charges</h3>
              {expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{expense.denomination}</CardTitle>
                        <CardDescription>
                          {expense.type} • Net: {calculateNetAmount(expense).toLocaleString("fr-FR")} € •{" "}
                          {expense.ownedBy}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(expense)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
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
            <DialogTitle>Modifier une charge</DialogTitle>
            <DialogDescription>Modifiez les informations de votre charge.</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateExpense}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  )
}
