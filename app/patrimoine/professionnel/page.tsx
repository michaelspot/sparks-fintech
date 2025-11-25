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
import { Plus, Briefcase, Edit, Trash2, Building, X } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts"
import { toast } from "sonner"
import { OwnershipChartDialog } from "./OwnershipChartDialog"

interface AssetHolder {
  id: string
  owner: string // Clé interne : "Vous", "Conjoint", "Commun", "NomSociété", "Autre"
  displayName?: string // Pour affichage (optionnel, calculé à la volée)
  jobTitle: string
  percentage: number
}

interface ProfessionalAsset {
  id: string
  companyName: string
  activity: string
  willToTransfer: string
  valuation: number
  holders: AssetHolder[]
}

const LOCAL_STORAGE_KEY = "patrimoineProfessionnelInfo"
const IDENTITY_KEY = "identityPersonalInfo"

// Composant de formulaire extrait pour éviter le démontage/remontage lors des mises à jour de state
function AssetFormContent({
  asset,
  setAsset,
  tempHolder,
  setTempHolder,
  onAddHolder,
  onRemoveHolder,
  otherAssets,
  identity,
}: {
  asset: Partial<ProfessionalAsset>
  setAsset: (a: Partial<ProfessionalAsset>) => void
  tempHolder: Partial<AssetHolder>
  setTempHolder: (h: Partial<AssetHolder>) => void
  onAddHolder: () => void
  onRemoveHolder: (id: string) => void
  otherAssets: ProfessionalAsset[]
  identity: any
}) {
  // Construction des options de propriétaires
  const ownerOptions = []

  // Personnes physiques
  if (identity) {
    ownerOptions.push({ value: "Vous", label: identity.firstName || "Vous" })
    if (identity.spouseFirstName) {
      ownerOptions.push({ value: "Conjoint", label: identity.spouseFirstName })
    }
    // Gestion des enfants
    if (identity.children && Array.isArray(identity.children)) {
      identity.children.forEach((child: any, index: number) => {
        const label = child.firstName || `Enfant ${index + 1}`
        ownerOptions.push({ value: label, label: label }) // On utilise le prénom comme valeur pour les enfants pour l'instant
      })
    }
  } else {
    // Fallback
    ownerOptions.push({ value: "Vous", label: "Vous" })
    ownerOptions.push({ value: "Conjoint", label: "Conjoint" })
  }
  ownerOptions.push({ value: "Commun", label: "Communauté" })

  // Personnes morales (autres sociétés)
  if (otherAssets.length > 0) {
    otherAssets.forEach((a) => {
      ownerOptions.push({ value: a.companyName, label: a.companyName })
    })
  }

  ownerOptions.push({ value: "Autre", label: "Autre Tiers" })

  // Helper pour trouver le label d'un owner stocké
  const getOwnerLabel = (value: string) => {
    const option = ownerOptions.find((o) => o.value === value)
    return option ? option.label : value
  }

  return (
    <Tabs defaultValue="identification" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="identification">Identification</TabsTrigger>
        <TabsTrigger value="detenteurs">Détenteurs</TabsTrigger>
      </TabsList>

      <TabsContent value="identification" className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de la société</Label>
            <Input
              id="companyName"
              placeholder="Ex: SARL Dupont & Fils"
              value={asset.companyName || ""}
              onChange={(e) => setAsset({ ...asset, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity">Activité de la société</Label>
            <Select
              value={asset.activity}
              onValueChange={(value) => setAsset({ ...asset, activity: value })}
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
            <Label htmlFor="willToTransfer">Volonté de transmettre</Label>
            <Select
              value={asset.willToTransfer}
              onValueChange={(value) => setAsset({ ...asset, willToTransfer: value })}
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
            <Label htmlFor="valuation">Valorisation des titres (€)</Label>
            <Input
              id="valuation"
              type="number"
              placeholder="Ex: 150000"
              value={asset.valuation || ""}
              onChange={(e) => setAsset({ ...asset, valuation: Number.parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="detenteurs" className="space-y-4 py-4">
        <div className="space-y-4 border rounded-md p-4 bg-muted/20">
          <h4 className="text-sm font-medium">Ajouter un détenteur</h4>
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4 space-y-1">
              <Label htmlFor="holder-owner" className="text-xs">
                Qui détient ?
              </Label>
              <Select
                value={tempHolder.owner || ""}
                onValueChange={(value) => setTempHolder({ ...tempHolder, owner: value })}
              >
                <SelectTrigger id="holder-owner" className="h-8">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {ownerOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-4 space-y-1">
              <Label htmlFor="holder-function" className="text-xs">
                Fonction
              </Label>
              <Select
                value={tempHolder.jobTitle || ""}
                onValueChange={(value) => setTempHolder({ ...tempHolder, jobTitle: value })}
              >
                <SelectTrigger id="holder-function" className="h-8">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Président">Président</SelectItem>
                  <SelectItem value="Directeur Général">Directeur Général</SelectItem>
                  <SelectItem value="Directeur Général Délégué">Directeur Général Délégué</SelectItem>
                  <SelectItem value="Gérant">Gérant</SelectItem>
                  <SelectItem value="Co-gérant">Co-gérant</SelectItem>
                  <SelectItem value="Président du CA">Président du CA</SelectItem>
                  <SelectItem value="Membre du Directoire">Membre du Directoire</SelectItem>
                  <SelectItem value="Associé">Associé</SelectItem>
                  <SelectItem value="Actionnaire">Actionnaire</SelectItem>
                  <SelectItem value="Usufruitier">Usufruitier</SelectItem>
                  <SelectItem value="Nu-propriétaire">Nu-propriétaire</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3 space-y-1">
              <Label htmlFor="holder-percent" className="text-xs">
                % Capital
              </Label>
              <Input
                id="holder-percent"
                type="number"
                placeholder="%"
                className="h-8"
                value={tempHolder.percentage || ""}
                onChange={(e) => setTempHolder({ ...tempHolder, percentage: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-1">
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={onAddHolder}
                disabled={!tempHolder.owner || !tempHolder.percentage}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Liste des détenteurs</Label>
          {asset.holders && asset.holders.length > 0 ? (
            <div className="space-y-2">
              {asset.holders.map((holder, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded bg-background text-sm">
                  <div className="flex gap-2">
                    <span className="font-semibold">{getOwnerLabel(holder.owner)}</span>
                    <span className="text-muted-foreground">
                      - {holder.jobTitle} - {holder.percentage}%
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemoveHolder(holder.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded">
              Aucun détenteur ajouté
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default function ProfessionalPatrimonyPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [assets, setAssets] = useState<ProfessionalAsset[]>([])
  const [identity, setIdentity] = useState<any>(null)

  // Chargement des données au montage (Client-side only pour éviter Hydration Mismatch)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAssets = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets))
      }
      
      const savedIdentity = localStorage.getItem(IDENTITY_KEY)
      if (savedIdentity) {
        setIdentity(JSON.parse(savedIdentity))
      }

      setIsLoaded(true)
    }
  }, [])

  const saveAssetsToLocalStorage = (updatedAssets: ProfessionalAsset[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAssets))
    }
  }

  useEffect(() => {
    if (isLoaded) {
      saveAssetsToLocalStorage(assets)
    }
  }, [assets, isLoaded])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAsset, setNewAsset] = useState<Partial<ProfessionalAsset>>({ holders: [] })
  const [editingAsset, setEditingAsset] = useState<ProfessionalAsset | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // State pour l'ajout d'un détenteur
  const [tempHolder, setTempHolder] = useState<Partial<AssetHolder>>({})

  const totalValuation = assets.reduce((sum, asset) => sum + (asset.valuation || 0), 0)

  const handleAddHolder = () => {
    if (tempHolder.owner && tempHolder.percentage) {
      const currentTotal = (newAsset.holders || []).reduce((sum, h) => sum + h.percentage, 0)
      if (currentTotal + Number(tempHolder.percentage) > 100) {
        toast.error(`Impossible d'ajouter : le total dépasse 100% (Actuel: ${currentTotal}%)`)
        return
      }

      const holder: AssetHolder = {
        id: Date.now().toString(),
        owner: tempHolder.owner,
        jobTitle: tempHolder.jobTitle || "",
        percentage: Number(tempHolder.percentage),
      }
      setNewAsset({
        ...newAsset,
        holders: [...(newAsset.holders || []), holder],
      })
      setTempHolder({})
    }
  }

  const handleRemoveHolder = (holderId: string) => {
    setNewAsset({
      ...newAsset,
      holders: (newAsset.holders || []).filter((h) => h.id !== holderId),
    })
  }

  const handleAddAsset = () => {
    if (newAsset.companyName && newAsset.activity) {
      const asset: ProfessionalAsset = {
        id: Date.now().toString(),
        companyName: newAsset.companyName || "",
        activity: newAsset.activity || "",
        willToTransfer: newAsset.willToTransfer || "",
        valuation: newAsset.valuation || 0,
        holders: newAsset.holders || [],
      }
      const updatedAssets = [...assets, asset]
      setAssets(updatedAssets)
      setNewAsset({ holders: [] })
      setTempHolder({})
      setIsDialogOpen(false)
    }
  }

  const handleDeleteAsset = (id: string) => {
    const updatedAssets = assets.filter((a) => a.id !== id)
    setAssets(updatedAssets)
  }

  const handleEditAsset = (asset: ProfessionalAsset) => {
    setEditingAsset(asset)
    setNewAsset({ ...asset })
    setIsEditDialogOpen(true)
  }

  const handleUpdateAsset = () => {
    if (editingAsset && newAsset.companyName && newAsset.activity) {
      const updatedAsset: ProfessionalAsset = {
        id: editingAsset.id,
        companyName: newAsset.companyName || "",
        activity: newAsset.activity || "",
        willToTransfer: newAsset.willToTransfer || "",
        valuation: newAsset.valuation || 0,
        holders: newAsset.holders || [],
      }
      const updatedAssetsList = assets.map((a) => (a.id === editingAsset.id ? updatedAsset : a))
      setAssets(updatedAssetsList)
      setNewAsset({ holders: [] })
      setTempHolder({})
      setEditingAsset(null)
      setIsEditDialogOpen(false)
    }
  }

  // Data for ownership distribution
  const ownershipData = [
    { name: identity?.firstName || "Vous", value: 0, fill: "#3b82f6" },
    { name: identity?.spouseFirstName || "Conjoint", value: 0, fill: "#60a5fa" },
    { name: "Commun", value: 0, fill: "#93c5fd" },
  ]

  assets.forEach((asset) => {
    if (asset.holders) {
      asset.holders.forEach((holder) => {
        const value = (asset.valuation || 0) * (holder.percentage / 100)
        // Logique de mappage : Vous -> ownershipData[0], Conjoint -> ownershipData[1]
        // Les autres sont ignorés dans ce graph simplifié ou nécessiteraient plus de catégories
        if (holder.owner === "Vous") ownershipData[0].value += value
        else if (holder.owner === "Conjoint") ownershipData[1].value += value
        else if (holder.owner === "Commun") ownershipData[2].value += value
      })
    }
  })

  const activityData = [
    {
      name: "Développement logiciel",
      value: assets.filter((a) => a.activity === "Développement logiciel").reduce((sum, a) => sum + (a.valuation || 0), 0),
    },
    {
      name: "Conseil en management",
      value: assets.filter((a) => a.activity === "Conseil en management").reduce((sum, a) => sum + (a.valuation || 0), 0),
    },
    {
      name: "Commerce",
      value: assets.filter((a) => a.activity === "Commerce").reduce((sum, a) => sum + (a.valuation || 0), 0),
    },
    {
      name: "Services",
      value: assets.filter((a) => a.activity === "Services").reduce((sum, a) => sum + (a.valuation || 0), 0),
    },
    {
      name: "Industrie",
      value: assets.filter((a) => a.activity === "Industrie").reduce((sum, a) => sum + (a.valuation || 0), 0),
    },
    {
      name: "BTP",
      value: assets.filter((a) => a.activity === "BTP").reduce((sum, a) => sum + (a.valuation || 0), 0),
    },
    {
      name: "Restauration",
      value: assets.filter((a) => a.activity === "Restauration").reduce((sum, a) => sum + (a.valuation || 0), 0),
    },
  ].filter((item) => item.value > 0)

  const blueColors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"]
  activityData.forEach((item, index) => {
    ;(item as any).fill = blueColors[Math.min(index, blueColors.length - 1)]
  })

  // Eviter le rendu SSR mismatch en attendant le chargement
  if (!isLoaded) {
      return null // ou un loader
  }

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
              <Button onClick={() => { setNewAsset({ holders: [] }); setTempHolder({}); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un actif professionnel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un actif professionnel</DialogTitle>
                <DialogDescription>Saisissez les informations de votre participation professionnelle</DialogDescription>
              </DialogHeader>
              
              <AssetFormContent
                asset={newAsset}
                setAsset={setNewAsset}
                tempHolder={tempHolder}
                setTempHolder={setTempHolder}
                onAddHolder={handleAddHolder}
                onRemoveHolder={handleRemoveHolder}
                otherAssets={assets}
                identity={identity}
              />

              <div className="flex justify-end space-x-2 mt-4">
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
              
              <AssetFormContent
                asset={newAsset}
                setAsset={setNewAsset}
                tempHolder={tempHolder}
                setTempHolder={setTempHolder}
                onAddHolder={handleAddHolder}
                onRemoveHolder={handleRemoveHolder}
                otherAssets={editingAsset ? assets.filter(a => a.id !== editingAsset.id) : assets}
                identity={identity}
              />

              <div className="flex justify-end space-x-2 mt-4">
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
              <div className="grid gap-6 md:grid-cols-9 items-stretch">
                <div className="md:col-span-5 space-y-6">
                  <Card className="flex flex-col h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-3xl font-bold text-foreground">{totalValuation.toLocaleString("fr-FR")} €</h3>
                          <CardDescription>Patrimoine Professionnel Total</CardDescription>
                        </div>
                        <OwnershipChartDialog assets={assets} identity={identity} />
                      </div>
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
                          {asset.activity} • {(asset.valuation || 0).toLocaleString("fr-FR")} €
                        </CardDescription>
                        {asset.holders && asset.holders.length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-2">
                             {asset.holders.map(h => (
                               <span key={h.id} className="bg-muted px-2 py-0.5 rounded text-xs">
                                 {/* Helper local pour récupérer le label si "Vous"/"Conjoint" est stocké */}
                                 {h.owner === "Vous" && identity?.firstName ? identity.firstName : 
                                  h.owner === "Conjoint" && identity?.spouseFirstName ? identity.spouseFirstName : h.owner}
                                 {" "} ({h.percentage}%) - {h.jobTitle}
                               </span>
                             ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-blue-500" />
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