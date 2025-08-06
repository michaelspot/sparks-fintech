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
import { Plus, Briefcase, Edit, Trash2, Building } from "lucide-react"
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

interface ProfessionalAsset {
  id: string
  companyName: string
  activity: string
  shareOwnership: string
  ownershipPercentage: number
  willToTransfer: string
  ownership: string
  valuation: number
}

const LOCAL_STORAGE_KEY = "patrimoineProfessionnelInfo"

export default function ProfessionalPatrimonyPage() {
  const [assets, setAssets] = useState<ProfessionalAsset[]>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) return JSON.parse(savedData)
    }
    return []
  })

  const saveAssetsToLocalStorage = (updatedAssets: ProfessionalAsset[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAssets))
    }
  }

  useEffect(() => saveAssetsToLocalStorage(assets), [assets])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAsset, setNewAsset] = useState<Partial<ProfessionalAsset>>({})
  const [editingAsset, setEditingAsset] = useState<ProfessionalAsset | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const totalValuation = assets.reduce((sum, asset) => sum + asset.valuation, 0)

  const handleAddAsset = () => {
    if (newAsset.companyName && newAsset.activity) {
      const asset: ProfessionalAsset = {
        id: Date.now().toString(),
        companyName: newAsset.companyName || "",
        activity: newAsset.activity || "",
        shareOwnership: newAsset.shareOwnership || "",
        ownershipPercentage: newAsset.ownershipPercentage || 0,
        willToTransfer: newAsset.willToTransfer || "",
        ownership: newAsset.ownership || "",
        valuation: newAsset.valuation || 0,
      }
      const updatedAssets = [...assets, asset]
      setAssets(updatedAssets)
      setNewAsset({})
      setIsDialogOpen(false)
    }
  }

  const handleDeleteAsset = (id: string) => {
    const updatedAssets = assets.filter((a) => a.id !== id)
    setAssets(updatedAssets)
  }

  const handleEditAsset = (asset: ProfessionalAsset) => {
    setEditingAsset(asset)
    setNewAsset(asset)
    setIsEditDialogOpen(true)
  }

  const handleUpdateAsset = () => {
    if (editingAsset && newAsset.companyName && newAsset.activity) {
      const updatedAsset: ProfessionalAsset = {
        ...editingAsset,
        companyName: newAsset.companyName || "",
        activity: newAsset.activity || "",
        shareOwnership: newAsset.shareOwnership || "",
        ownershipPercentage: newAsset.ownershipPercentage || 0,
        willToTransfer: newAsset.willToTransfer || "",
        ownership: newAsset.ownership || "",
        valuation: newAsset.valuation || 0,
      }
      const updatedAssetsList = assets.map((a) => (a.id === editingAsset.id ? updatedAsset : a))
      setAssets(updatedAssetsList)
      setNewAsset({})
      setEditingAsset(null)
      setIsEditDialogOpen(false)
    }
  }

  // Data for ownership distribution - always show all three categories
  const ownershipData = [
    {
      name: "Vous",
      value: assets.filter((a) => a.ownership === "Vous").reduce((sum, a) => sum + a.valuation, 0),
      fill: "#3b82f6", // blue-500
    },
    {
      name: "Votre conjoint",
      value: assets.filter((a) => a.ownership === "Votre conjoint").reduce((sum, a) => sum + a.valuation, 0),
      fill: "#60a5fa", // blue-400
    },
    {
      name: "Commun",
      value: assets.filter((a) => a.ownership === "Commun").reduce((sum, a) => sum + a.valuation, 0),
      fill: "#93c5fd", // blue-300
    },
  ]

  const activityData = [
    {
      name: "Développement logiciel",
      value: assets.filter((a) => a.activity === "Développement logiciel").reduce((sum, a) => sum + a.valuation, 0),
    },
    {
      name: "Conseil en management",
      value: assets.filter((a) => a.activity === "Conseil en management").reduce((sum, a) => sum + a.valuation, 0),
    },
    {
      name: "Commerce",
      value: assets.filter((a) => a.activity === "Commerce").reduce((sum, a) => sum + a.valuation, 0),
    },
    {
      name: "Services",
      value: assets.filter((a) => a.activity === "Services").reduce((sum, a) => sum + a.valuation, 0),
    },
    {
      name: "Industrie",
      value: assets.filter((a) => a.activity === "Industrie").reduce((sum, a) => sum + a.valuation, 0),
    },
    {
      name: "BTP",
      value: assets.filter((a) => a.activity === "BTP").reduce((sum, a) => sum + a.valuation, 0),
    },
    {
      name: "Restauration",
      value: assets.filter((a) => a.activity === "Restauration").reduce((sum, a) => sum + a.valuation, 0),
    },
  ].filter((item) => item.value > 0)

  // Assigne les couleurs dynamiquement
  const blueColors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"]
  activityData.forEach((item, index) => {
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
                <BreadcrumbPage>Patrimoine Professionnel</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un actif professionnel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un actif professionnel</DialogTitle>
                <DialogDescription>Saisissez les informations de votre participation professionnelle</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de la société</Label>
                    <Input
                      id="companyName"
                      placeholder="Ex: SARL Dupont & Fils"
                      value={newAsset.companyName || ""}
                      onChange={(e) => setNewAsset({ ...newAsset, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity">Activité de la société</Label>
                    <Select
                      value={newAsset.activity}
                      onValueChange={(value) => setNewAsset({ ...newAsset, activity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une activité..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Développement logiciel">Développement logiciel</SelectItem>
                        <SelectItem value="Conseil en management">Conseil en management</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Industrie">Industrie</SelectItem>
                        <SelectItem value="BTP">BTP</SelectItem>
                        <SelectItem value="Restauration">Restauration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shareOwnership">Détention des titres</Label>
                    <Select
                      value={newAsset.shareOwnership}
                      onValueChange={(value) => setNewAsset({ ...newAsset, shareOwnership: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gérant majoritaire">Gérant majoritaire</SelectItem>
                        <SelectItem value="Gérant minoritaire">Gérant minoritaire</SelectItem>
                        <SelectItem value="Associé">Associé</SelectItem>
                        <SelectItem value="Actionnaire">Actionnaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownershipPercentage">Détention (%)</Label>
                    <Input
                      id="ownershipPercentage"
                      type="number"
                      placeholder="Ex: 50"
                      value={newAsset.ownershipPercentage || ""}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, ownershipPercentage: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="willToTransfer">Volonté de transmettre</Label>
                    <Select
                      value={newAsset.willToTransfer}
                      onValueChange={(value) => setNewAsset({ ...newAsset, willToTransfer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Oui">Oui</SelectItem>
                        <SelectItem value="Non">Non</SelectItem>
                        <SelectItem value="À étudier">À étudier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownership">Détention</Label>
                    <Select
                      value={newAsset.ownership}
                      onValueChange={(value) => setNewAsset({ ...newAsset, ownership: value })}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valuation">Valorisation des titres (€)</Label>
                  <Input
                    id="valuation"
                    type="number"
                    placeholder="Ex: 150000"
                    value={newAsset.valuation || ""}
                    onChange={(e) => setNewAsset({ ...newAsset, valuation: Number.parseInt(e.target.value) || 0 })}
                  />
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
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier un actif professionnel</DialogTitle>
                <DialogDescription>Modifiez les informations de votre participation professionnelle</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyNameEdit">Nom de la société</Label>
                    <Input
                      id="companyNameEdit"
                      placeholder="Ex: SARL Dupont & Fils"
                      value={newAsset.companyName || ""}
                      onChange={(e) => setNewAsset({ ...newAsset, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityEdit">Activité de la société</Label>
                    <Select
                      value={newAsset.activity}
                      onValueChange={(value) => setNewAsset({ ...newAsset, activity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une activité..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Développement logiciel">Développement logiciel</SelectItem>
                        <SelectItem value="Conseil en management">Conseil en management</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Industrie">Industrie</SelectItem>
                        <SelectItem value="BTP">BTP</SelectItem>
                        <SelectItem value="Restauration">Restauration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shareOwnershipEdit">Détention des titres</Label>
                    <Select
                      value={newAsset.shareOwnership}
                      onValueChange={(value) => setNewAsset({ ...newAsset, shareOwnership: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gérant majoritaire">Gérant majoritaire</SelectItem>
                        <SelectItem value="Gérant minoritaire">Gérant minoritaire</SelectItem>
                        <SelectItem value="Associé">Associé</SelectItem>
                        <SelectItem value="Actionnaire">Actionnaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownershipPercentageEdit">Détention (%)</Label>
                    <Input
                      id="ownershipPercentageEdit"
                      type="number"
                      placeholder="Ex: 50"
                      value={newAsset.ownershipPercentage || ""}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, ownershipPercentage: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="willToTransferEdit">Volonté de transmettre</Label>
                    <Select
                      value={newAsset.willToTransfer}
                      onValueChange={(value) => setNewAsset({ ...newAsset, willToTransfer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Oui">Oui</SelectItem>
                        <SelectItem value="Non">Non</SelectItem>
                        <SelectItem value="À étudier">À étudier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownershipEdit">Détention</Label>
                    <Select
                      value={newAsset.ownership}
                      onValueChange={(value) => setNewAsset({ ...newAsset, ownership: value })}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valuationEdit">Valorisation des titres (€)</Label>
                  <Input
                    id="valuationEdit"
                    type="number"
                    placeholder="Ex: 150000"
                    value={newAsset.valuation || ""}
                    onChange={(e) => setNewAsset({ ...newAsset, valuation: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateAsset}>Mettre à jour l'actif</Button>
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
              <Briefcase className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Aucun actif professionnel n'a été ajouté pour le moment.</h3>
                <p className="text-muted-foreground">Cliquez sur "+ Ajouter un actif professionnel" pour commencer.</p>
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
                      <h3 className="text-3xl font-bold text-black">{totalValuation.toLocaleString("fr-FR")} €</h3>
                      <CardDescription>Patrimoine Professionnel Total</CardDescription>
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
                                {totalValuation > 0 ? ((item.value / totalValuation) * 100).toFixed(1) : 0}%
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
                    <CardDescription>Distribution par catégorie de bien</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-row items-center gap-6">
                      {/* Graphique à gauche (50%) */}
                      <div className="w-1/2 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={activityData}
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
                        {activityData.map((item) => (
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
              <h3 className="text-lg font-semibold">Vos participations professionnelles</h3>
              {assets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{asset.companyName}</CardTitle>
                        <CardDescription>
                          {asset.activity} • {asset.shareOwnership} ({asset.ownershipPercentage}%) •{" "}
                          {asset.valuation.toLocaleString("fr-FR")} € • {asset.ownership}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">Transmission: {asset.willToTransfer}</span>
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
