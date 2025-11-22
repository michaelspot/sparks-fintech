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
import { Plus, Home, Edit, Trash2 } from "lucide-react"
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

interface Property {
  id: string
  type: string
  denomination: string
  postalCode: string
  city: string
  surface: number
  pricePerSqm: number
  fullOwnershipValue: number
  evolutionPercentage: number
  ownershipMode: string
  ownershipPercentage: number
  ownedBy: string
  dpe: string
  ges: string
  grossValue: number
  attachedDebts: number
  netValue: number
}

const LOCAL_STORAGE_KEY = "patrimoineImmobilierInfo"

export default function RealEstatePage() {
  const [properties, setProperties] = useState<Property[]>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) return JSON.parse(savedData)
    }
    return []
  })

  const savePropertiesToLocalStorage = (updatedProperties: Property[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProperties))
    }
  }

  useEffect(() => savePropertiesToLocalStorage(properties), [properties])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProperty, setNewProperty] = useState<Partial<Property>>({})
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const totalNetValue = properties.reduce((sum, property) => sum + property.netValue, 0)

  const handleAddProperty = () => {
    if (newProperty.type && newProperty.denomination) {
      const property: Property = {
        id: Date.now().toString(),
        type: newProperty.type || "",
        denomination: newProperty.denomination || "",
        postalCode: newProperty.postalCode || "",
        city: newProperty.city || "",
        surface: newProperty.surface || 0,
        pricePerSqm: newProperty.pricePerSqm || 0,
        fullOwnershipValue: newProperty.fullOwnershipValue || 0,
        evolutionPercentage: newProperty.evolutionPercentage || 0,
        ownershipMode: newProperty.ownershipMode || "",
        ownershipPercentage: newProperty.ownershipPercentage || 100,
        ownedBy: newProperty.ownedBy || "",
        dpe: newProperty.dpe || "",
        ges: newProperty.ges || "",
        grossValue: newProperty.grossValue || 0,
        attachedDebts: newProperty.attachedDebts || 0,
        netValue: (newProperty.grossValue || 0) - (newProperty.attachedDebts || 0),
      }
      const updatedProperties = [...properties, property]
      setProperties(updatedProperties)
      // savePropertiesToLocalStorage(updatedProperties) // Handled by useEffect
      setNewProperty({})
      setIsDialogOpen(false)
    }
  }

  const handleDeleteProperty = (id: string) => {
    const updatedProperties = properties.filter((p) => p.id !== id)
    setProperties(updatedProperties)
    // savePropertiesToLocalStorage(updatedProperties) // Handled by useEffect
  }

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property)
    setNewProperty(property)
    setIsEditDialogOpen(true)
  }

  const handleUpdateProperty = () => {
    if (editingProperty && newProperty.type && newProperty.denomination) {
      const updatedProperty: Property = {
        ...editingProperty,
        type: newProperty.type || "",
        denomination: newProperty.denomination || "",
        postalCode: newProperty.postalCode || "",
        city: newProperty.city || "",
        surface: newProperty.surface || 0,
        pricePerSqm: newProperty.pricePerSqm || 0,
        fullOwnershipValue: newProperty.fullOwnershipValue || 0,
        evolutionPercentage: newProperty.evolutionPercentage || 0,
        ownershipMode: newProperty.ownershipMode || "",
        ownershipPercentage: newProperty.ownershipPercentage || 100,
        ownedBy: newProperty.ownedBy || "",
        dpe: newProperty.dpe || "",
        ges: newProperty.ges || "",
        grossValue: newProperty.grossValue || 0,
        attachedDebts: newProperty.attachedDebts || 0,
        netValue: (newProperty.grossValue || 0) - (newProperty.attachedDebts || 0),
      }
      const updatedPropertiesList = properties.map((p) => (p.id === editingProperty.id ? updatedProperty : p))
      setProperties(updatedPropertiesList)
      setNewProperty({})
      setEditingProperty(null)
      setIsEditDialogOpen(false)
    }
  }

  // Data for ownership distribution - always show all three categories
  const ownershipData = [
    {
      name: "Vous",
      value: properties.filter((p) => p.ownedBy === "Vous").reduce((sum, p) => sum + p.netValue, 0),
      fill: "#3b82f6", // blue-500
    },
    {
      name: "Votre conjoint",
      value: properties.filter((p) => p.ownedBy === "Votre conjoint").reduce((sum, p) => sum + p.netValue, 0),
      fill: "#60a5fa", // blue-400
    },
    {
      name: "Commun",
      value: properties.filter((p) => p.ownedBy === "Commun").reduce((sum, p) => sum + p.netValue, 0),
      fill: "#93c5fd", // blue-300
    },
  ]

  // Remplace la data statique du PieChart par :
  const propertyTypeData = properties.reduce(
    (acc, property) => {
      const existingType = acc.find((item) => item.name === property.type)
      if (existingType) {
        existingType.value += property.netValue
      } else {
        acc.push({
          name: property.type,
          value: property.netValue,
          fill: "",
        })
      }
      return acc
    },
    [] as Array<{ name: string; value: number; fill: string }>,
  )

  // Assigne les couleurs en fonction du nombre d'éléments
  const blueColors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"]
  propertyTypeData.forEach((item, index) => {
    item.fill = blueColors[Math.min(index, blueColors.length - 1)]
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
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/patrimoine">Patrimoine</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Patrimoine Immobilier</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un bien
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Ajouter un bien immobilier</DialogTitle>
                <DialogDescription>Saisissez les informations de votre bien immobilier</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de bien</Label>
                    <Select
                      value={newProperty.type}
                      onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Résidence principale">Résidence principale</SelectItem>
                        <SelectItem value="Résidence secondaire">Résidence secondaire</SelectItem>
                        <SelectItem value="Investissement locatif">Investissement locatif</SelectItem>
                        <SelectItem value="Terrain">Terrain</SelectItem>
                        <SelectItem value="Garage/Parking">Garage/Parking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="denomination">Dénomination</Label>
                    <Input
                      id="denomination"
                      value={newProperty.denomination || ""}
                      onChange={(e) => setNewProperty({ ...newProperty, denomination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      value={newProperty.postalCode || ""}
                      onChange={(e) => setNewProperty({ ...newProperty, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={newProperty.city || ""}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="surface">Surface (m²)</Label>
                    <Input
                      id="surface"
                      type="number"
                      value={newProperty.surface || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, surface: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerSqm">Prix au m²</Label>
                    <Input
                      id="pricePerSqm"
                      type="number"
                      value={newProperty.pricePerSqm || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, pricePerSqm: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullOwnershipValue">Valeur en pleine propriété</Label>
                    <Input
                      id="fullOwnershipValue"
                      type="number"
                      value={newProperty.fullOwnershipValue || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, fullOwnershipValue: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="evolutionPercentage">Évolution (%)</Label>
                    <Input
                      id="evolutionPercentage"
                      type="number"
                      step="0.1"
                      value={newProperty.evolutionPercentage || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, evolutionPercentage: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownershipMode">Mode de détention</Label>
                    <Select
                      value={newProperty.ownershipMode}
                      onValueChange={(value) => setNewProperty({ ...newProperty, ownershipMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pleine propriété">Pleine propriété</SelectItem>
                        <SelectItem value="Nue-propriété">Nue-propriété</SelectItem>
                        <SelectItem value="Usufruit">Usufruit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownershipPercentage">Pourcentage de détention (%)</Label>
                    <Input
                      id="ownershipPercentage"
                      type="number"
                      value={newProperty.ownershipPercentage || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, ownershipPercentage: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownedBy">Détenu par</Label>
                  <Select
                    value={newProperty.ownedBy}
                    onValueChange={(value) => setNewProperty({ ...newProperty, ownedBy: value })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dpe">DPE</Label>
                    <Select
                      value={newProperty.dpe}
                      onValueChange={(value) => setNewProperty({ ...newProperty, dpe: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ges">GES</Label>
                    <Select
                      value={newProperty.ges}
                      onValueChange={(value) => setNewProperty({ ...newProperty, ges: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grossValue">Valeur brute</Label>
                    <Input
                      id="grossValue"
                      type="number"
                      value={newProperty.grossValue || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, grossValue: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attachedDebts">Dettes rattachées</Label>
                    <Input
                      id="attachedDebts"
                      type="number"
                      value={newProperty.attachedDebts || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, attachedDebts: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddProperty}>Enregistrer le bien</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Modifier le bien immobilier</DialogTitle>
                <DialogDescription>Modifiez les informations de votre bien immobilier</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Type de bien</Label>
                    <Select
                      value={newProperty.type}
                      onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Résidence principale">Résidence principale</SelectItem>
                        <SelectItem value="Résidence secondaire">Résidence secondaire</SelectItem>
                        <SelectItem value="Investissement locatif">Investissement locatif</SelectItem>
                        <SelectItem value="Terrain">Terrain</SelectItem>
                        <SelectItem value="Garage/Parking">Garage/Parking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-denomination">Dénomination</Label>
                    <Input
                      id="edit-denomination"
                      value={newProperty.denomination || ""}
                      onChange={(e) => setNewProperty({ ...newProperty, denomination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-postalCode">Code postal</Label>
                    <Input
                      id="edit-postalCode"
                      value={newProperty.postalCode || ""}
                      onChange={(e) => setNewProperty({ ...newProperty, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">Ville</Label>
                    <Input
                      id="edit-city"
                      value={newProperty.city || ""}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-surface">Surface (m²)</Label>
                    <Input
                      id="edit-surface"
                      type="number"
                      value={newProperty.surface || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, surface: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-pricePerSqm">Prix au m²</Label>
                    <Input
                      id="edit-pricePerSqm"
                      type="number"
                      value={newProperty.pricePerSqm || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, pricePerSqm: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fullOwnershipValue">Valeur en pleine propriété</Label>
                    <Input
                      id="edit-fullOwnershipValue"
                      type="number"
                      value={newProperty.fullOwnershipValue || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, fullOwnershipValue: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-evolutionPercentage">Évolution (%)</Label>
                    <Input
                      id="edit-evolutionPercentage"
                      type="number"
                      step="0.1"
                      value={newProperty.evolutionPercentage || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, evolutionPercentage: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-ownershipMode">Mode de détention</Label>
                    <Select
                      value={newProperty.ownershipMode}
                      onValueChange={(value) => setNewProperty({ ...newProperty, ownershipMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pleine propriété">Pleine propriété</SelectItem>
                        <SelectItem value="Nue-propriété">Nue-propriété</SelectItem>
                        <SelectItem value="Usufruit">Usufruit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-ownershipPercentage">Pourcentage de détention (%)</Label>
                    <Input
                      id="edit-ownershipPercentage"
                      type="number"
                      value={newProperty.ownershipPercentage || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, ownershipPercentage: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-ownedBy">Détenu par</Label>
                  <Select
                    value={newProperty.ownedBy}
                    onValueChange={(value) => setNewProperty({ ...newProperty, ownedBy: value })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-dpe">DPE</Label>
                    <Select
                      value={newProperty.dpe}
                      onValueChange={(value) => setNewProperty({ ...newProperty, dpe: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-ges">GES</Label>
                    <Select
                      value={newProperty.ges}
                      onValueChange={(value) => setNewProperty({ ...newProperty, ges: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-grossValue">Valeur brute</Label>
                    <Input
                      id="edit-grossValue"
                      type="number"
                      value={newProperty.grossValue || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, grossValue: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-attachedDebts">Dettes rattachées</Label>
                    <Input
                      id="edit-attachedDebts"
                      type="number"
                      value={newProperty.attachedDebts || ""}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, attachedDebts: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateProperty}>Mettre à jour le bien</Button>
              </div>
            </DialogContent>
          </Dialog>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {properties.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <Home className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Aucun bien immobilier n'a été ajouté pour le moment.</h3>
                <p className="text-muted-foreground">Cliquez sur "+ Ajouter un bien" pour commencer.</p>
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
                      <h3 className="text-3xl font-bold text-black">{totalNetValue.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</h3>
                      <CardDescription>Patrimoine Immobilier Total</CardDescription>
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
                              <span className="font-semibold">{item.value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                              <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                                {totalNetValue > 0 ? ((item.value / totalNetValue) * 100).toFixed(1) : 0}%
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
                              data={propertyTypeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            />
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Légende à droite (50%) */}
                      <div className="w-1/2 space-y-2">
                        {propertyTypeData.map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.fill }}></div>
                              <span className="text-sm">{item.name}</span>
                            </div>
                            <span className="text-sm font-medium">{item.value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Properties List */}
            <div className="space-y-4">
              {properties.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{property.denomination}</CardTitle>
                        <CardDescription>
                          {property.type} • {property.city} • {property.netValue.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} •{" "}
                          {property.ownedBy}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProperty(property)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProperty(property.id)}>
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
    </SidebarInset>
  )
}
