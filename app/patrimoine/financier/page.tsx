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
import { Plus, Wallet, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts"

interface FinancialAsset {
  id: string
  type: string
  denomination: string
  fullOwnershipValue: number
  realValue: number
  ownershipMode: string
  ownershipPercentage: number
  ownedBy: string
  performance: number
}

const LOCAL_STORAGE_KEY = "patrimoineFinancierInfo"

export default function FinancialPatrimonyPage() {
  const [assets, setAssets] = useState<FinancialAsset[]>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) return JSON.parse(savedData)
    }
    return []
  })

  const saveAssetsToLocalStorage = (updatedAssets: FinancialAsset[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAssets))
    }
  }

  useEffect(() => saveAssetsToLocalStorage(assets), [assets])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAsset, setNewAsset] = useState<Partial<FinancialAsset>>({})
  const [editingAsset, setEditingAsset] = useState<FinancialAsset | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const totalRealValue = assets.reduce((sum, asset) => sum + asset.realValue, 0)

  const handleAddAsset = () => {
    if (newAsset.type && newAsset.denomination) {
      const asset: FinancialAsset = {
        id: Date.now().toString(),
        type: newAsset.type || "",
        denomination: newAsset.denomination || "",
        fullOwnershipValue: newAsset.fullOwnershipValue || 0,
        realValue: newAsset.realValue || 0,
        ownershipMode: newAsset.ownershipMode || "",
        ownershipPercentage: newAsset.ownershipPercentage || 100,
        ownedBy: newAsset.ownedBy || "",
        performance: newAsset.performance || 0,
      }
      const updatedAssets = [...assets, asset]
      setAssets(updatedAssets)
      setNewAsset({})
      setIsDialogOpen(false)
    }
  }

  const handleEditAsset = (asset: FinancialAsset) => {
    setEditingAsset(asset)
    setNewAsset(asset)
    setIsEditDialogOpen(true)
  }

  const handleUpdateAsset = () => {
    if (editingAsset && newAsset.type && newAsset.denomination) {
      const updatedAsset: FinancialAsset = {
        ...editingAsset,
        type: newAsset.type || "",
        denomination: newAsset.denomination || "",
        fullOwnershipValue: newAsset.fullOwnershipValue || 0,
        realValue: newAsset.realValue || 0,
        ownershipMode: newAsset.ownershipMode || "",
        ownershipPercentage: newAsset.ownershipPercentage || 100,
        ownedBy: newAsset.ownedBy || "",
        performance: newAsset.performance || 0,
      }
      const updatedAssetsList = assets.map((a) => (a.id === editingAsset.id ? updatedAsset : a))
      setAssets(updatedAssetsList)
      setNewAsset({})
      setEditingAsset(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteAsset = (id: string) => {
    const updatedAssets = assets.filter((a) => a.id !== id)
    setAssets(updatedAssets)
  }

  // Data for ownership distribution - always show all three categories
  const ownershipData = [
    {
      name: "Vous",
      value: assets.filter((a) => a.ownedBy === "Vous").reduce((sum, a) => sum + a.realValue, 0),
      fill: "#3b82f6", // blue-500
    },
    {
      name: "Votre conjoint",
      value: assets.filter((a) => a.ownedBy === "Votre conjoint").reduce((sum, a) => sum + a.realValue, 0),
      fill: "#60a5fa", // blue-400
    },
    {
      name: "Commun",
      value: assets.filter((a) => a.ownedBy === "Commun").reduce((sum, a) => sum + a.realValue, 0),
      fill: "#93c5fd", // blue-300
    },
  ]

  const typeData = [
    {
      name: "Assurance-vie",
      value: assets.filter((a) => a.type === "Assurance-vie").reduce((sum, a) => sum + a.realValue, 0),
    },
    {
      name: "PEA",
      value: assets.filter((a) => a.type === "PEA").reduce((sum, a) => sum + a.realValue, 0),
    },
    {
      name: "Livret A",
      value: assets.filter((a) => a.type === "Livret A").reduce((sum, a) => sum + a.realValue, 0),
    },
    {
      name: "Actions",
      value: assets.filter((a) => a.type === "Actions").reduce((sum, a) => sum + a.realValue, 0),
    },
    {
      name: "Obligations",
      value: assets.filter((a) => a.type === "Obligations").reduce((sum, a) => sum + a.realValue, 0),
    },
    {
      name: "SCPI",
      value: assets.filter((a) => a.type === "SCPI").reduce((sum, a) => sum + a.realValue, 0),
    },
  ].filter((item) => item.value > 0)

  // Assigne les couleurs dynamiquement
  const blueColors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"]
  typeData.forEach((item, index) => {
    ;(item as any).fill = blueColors[Math.min(index, blueColors.length - 1)]
  })

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/patrimoine">Patrimoine</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Patrimoine Financier</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un actif
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un actif financier</DialogTitle>
                <DialogDescription>Saisissez les informations de votre actif financier</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type d'actif</Label>
                    <Select value={newAsset.type} onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assurance-vie">Assurance-vie</SelectItem>
                        <SelectItem value="PEA">PEA</SelectItem>
                        <SelectItem value="Livret A">Livret A</SelectItem>
                        <SelectItem value="Actions">Actions</SelectItem>
                        <SelectItem value="Obligations">Obligations</SelectItem>
                        <SelectItem value="SCPI">SCPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="denomination">Dénomination</Label>
                    <Input
                      id="denomination"
                      placeholder="Ex: Livret A XYZ Banque"
                      value={newAsset.denomination || ""}
                      onChange={(e) => setNewAsset({ ...newAsset, denomination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullOwnershipValue">Valeur en Pleine Propriété</Label>
                    <Input
                      id="fullOwnershipValue"
                      type="number"
                      placeholder="Ex: 10000"
                      value={newAsset.fullOwnershipValue || ""}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, fullOwnershipValue: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="realValue">Valeur Réelle (pour calculs)</Label>
                    <Input
                      id="realValue"
                      type="number"
                      placeholder="Ex: 10500"
                      value={newAsset.realValue || ""}
                      onChange={(e) => setNewAsset({ ...newAsset, realValue: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownedBy">Détenu par</Label>
                    <Select
                      value={newAsset.ownedBy}
                      onValueChange={(value) => setNewAsset({ ...newAsset, ownedBy: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vous">Vous</SelectItem>
                        <SelectItem value="Votre conjoint">Votre conjoint</SelectItem>
                        <SelectItem value="Commun">Commun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="performance">Performance (annuelle, +/- value)</Label>
                    <Input
                      id="performance"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 250 ou -50"
                      value={newAsset.performance || ""}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, performance: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddAsset}>Enregistrer l'actif</Button>
              </div>
            </DialogContent>
          </Dialog>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {assets.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Aucun actif financier n'a été ajouté pour le moment.</h3>
                <p className="text-muted-foreground">Cliquez sur "+ Ajouter un actif" pour commencer.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="space-y-6">
              {/* Patrimoine Total, Répartition dans le couple et Répartition par type */}
              <div className="grid gap-6 md:grid-cols-9 items-stretch">
                <div className="md:col-span-5 space-y-6">
                  <Card className="flex flex-col h-full">
                    <CardHeader>
                      <h3 className="text-3xl font-bold text-black">{totalRealValue.toLocaleString("fr-FR")} €</h3>
                      <CardDescription>Patrimoine Financier Total</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex flex-col h-full justify-between gap-2">
                        {ownershipData.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: `${item.fill}15` }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.fill }}></div>
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-semibold">{item.value.toLocaleString("fr-FR")} €</span>
                              <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                                {totalRealValue > 0 ? ((item.value / totalRealValue) * 100).toFixed(1) : 0}%
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
                    <CardDescription>Distribution par catégorie d'actif</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-row items-center gap-6">
                      {/* Graphique à gauche (50%) */}
                      <div className="w-1/2 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={typeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            ></Pie>
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} €`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Légende à droite (50%) */}
                      <div className="w-1/2 space-y-2">
                        {typeData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.fill }}></div>
                              <span className="text-sm">{item.name}</span>
                            </div>
                            <span className="text-sm font-medium">{item.value.toLocaleString("fr-FR")} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Assets List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vos actifs financiers</h3>
              {assets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{asset.denomination}</CardTitle>
                        <CardDescription>
                          {asset.type} • {asset.realValue.toLocaleString("fr-FR")} € • {asset.ownedBy}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {asset.performance >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              asset.performance >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {asset.performance >= 0 ? "+" : ""}
                            {asset.performance.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditAsset(asset)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteAsset(asset.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </SidebarInset>
  )
}
