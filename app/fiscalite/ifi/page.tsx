"use client"

import { useState, useEffect, useCallback } from "react"

// Étendre l'interface Window pour notre utilisation
declare global {
  interface Window {
    lastPatrimoineData?: string;
  }
}
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
import { Plus, Trash2, Calculator, HomeIcon, Percent, RefreshCw, AlertCircle } from "lucide-react" // Renamed Home to HomeIcon

interface BienImmobilier {
  id: string
  type: string // e.g. "Résidence principale"
  description: string
  valeur: number // Valeur nette saisie par l'utilisateur
  source?: "patrimoine" | "manual"
}

// Structure from patrimoine/immobilier/page.tsx
interface PatrimoineProperty {
  id: string
  type: string // e.g., "Résidence principale"
  denomination: string
  grossValue: number
  attachedDebts: number
}

const typeBiens = [
  { value: "Résidence principale", label: "Résidence principale" },
  { value: "Résidence secondaire", label: "Résidence secondaire" },
  { value: "Investissement locatif", label: "Investissement locatif" },
  { value: "Terrain", label: "Terrain" },
  { value: "Garage/Parking", label: "Garage/Parking" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

const LOCAL_STORAGE_KEY_IFI = "fiscaliteIFIInfo"
const LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER = "patrimoineImmobilierInfo"

const mapPatrimoinePropertyToIFIBien = (property: PatrimoineProperty): BienImmobilier => {
  return {
    id: `patrimoine-${property.id}`,
    type: property.type,
    description: property.denomination,
    valeur: property.grossValue, // Considérée maintenant comme valeur nette
    source: "patrimoine",
  }
}

export default function IFIPage() {
  const [biens, setBiens] = useState<BienImmobilier[]>([])

  const loadDataFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedFiscalData = localStorage.getItem(LOCAL_STORAGE_KEY_IFI)
      let manualBiens: BienImmobilier[] = []
      if (savedFiscalData) {
        const parsed = JSON.parse(savedFiscalData)
        manualBiens = parsed.biens?.filter((b: BienImmobilier) => b.source === "manual") || []
      }

      const savedPatrimoineData = localStorage.getItem(LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER)
      let patrimoineMappedBiens: BienImmobilier[] = []
      if (savedPatrimoineData) {
        const properties: PatrimoineProperty[] = JSON.parse(savedPatrimoineData)
        patrimoineMappedBiens = properties.map(mapPatrimoinePropertyToIFIBien)
      }
      setBiens([...patrimoineMappedBiens, ...manualBiens])
    }
  }, [])

  // Charger les données au chargement initial
  useEffect(() => {
    loadDataFromLocalStorage()
    
    // Mettre en place un écouteur d'événements pour détecter les changements du localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER) {
        loadDataFromLocalStorage()
      }
    }
    
    // Surveiller les changements du localStorage
    window.addEventListener('storage', handleStorageChange)
    
    // Vérifier périodiquement les changements (car les modifications dans le même onglet ne déclenchent pas l'événement storage)
    const intervalId = setInterval(() => {
      const currentPatrimoineData = localStorage.getItem(LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER) || ''
      if (currentPatrimoineData !== window.lastPatrimoineData) {
        window.lastPatrimoineData = currentPatrimoineData
        loadDataFromLocalStorage()
      }
    }, 1000) // Vérifier chaque seconde
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [loadDataFromLocalStorage])

  const saveDataToLocalStorage = () => {
    if (typeof window !== "undefined") {
      const manualBiens = biens.filter((b) => b.source === "manual")
      const dataToSave = { biens: manualBiens }
      localStorage.setItem(LOCAL_STORAGE_KEY_IFI, JSON.stringify(dataToSave))
      // alert("Données IFI enregistrées !") // Optional
    }
  }

  useEffect(() => {
    saveDataToLocalStorage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biens])

  const addBien = () => {
    const newBien: BienImmobilier = {
      id: Date.now().toString(),
      type: "residence-secondaire",
      description: "",
      valeur: 0,
      source: "manual",
    }
    setBiens([...biens, newBien])
  }

  const updateBien = (id: string, field: keyof BienImmobilier, value: string | number | undefined) => {
    setBiens(
      biens.map((item) =>
        item.id === id
          ? { ...item, [field]: value, source: item.source === "patrimoine" ? "patrimoine" : "manual" }
          : item,
      ),
    )
    
    // Synchroniser avec la page Patrimoine/Immobilier si le bien vient de là
    if (typeof window !== "undefined") {
      const savedPatrimoineData = localStorage.getItem(LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER)
      if (savedPatrimoineData) {
        const properties: PatrimoineProperty[] = JSON.parse(savedPatrimoineData)
        const updatedProperties = properties.map(property => {
          if (`patrimoine-${property.id}` === id) {
            // Convertir la valeur IFI vers le format Patrimoine
            if (field === "valeur") {
              // Mettre à jour la valeur nette dans Patrimoine
              return { ...property, grossValue: value as number }
            }
            if (field === "type") {
              // Mise à jour du type de bien directement
              return { ...property, type: value as string }
            }
          }
          return property
        })
        localStorage.setItem(LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER, JSON.stringify(updatedProperties))
      }
    }
  }

  const deleteBien = (id: string) => {
    setBiens(biens.filter((item) => item.id !== id))
    
    // Si c'est un bien lié au patrimoine, mettre à jour le localStorage
    if (id.startsWith("patrimoine-") && typeof window !== "undefined") {
      const propertyId = id.replace("patrimoine-", "")
      const savedPatrimoineData = localStorage.getItem(LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER)
      
      if (savedPatrimoineData) {
        const properties: PatrimoineProperty[] = JSON.parse(savedPatrimoineData)
        const updatedProperties = properties.filter(property => property.id !== propertyId)
        localStorage.setItem(LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER, JSON.stringify(updatedProperties))
      }
    }
  }

  const valeurBruteTotal = biens.reduce((sum, bien) => sum + bien.valeur, 0)
  const patrimoineNetAvantAbattementRP = valeurBruteTotal
  // Calcul du patrimoine net (somme des valeurs nettes saisies)
  const patrimoineNet = biens.reduce((acc, bien) => acc + bien.valeur, 0)
  
  // Calcul du patrimoine taxable avec abattement pour résidence principale
  const patrimoineNetTaxable = biens.reduce(
    (acc, bien) => {
      let valeurAvecAbattement = bien.valeur;
      // Appliquer l'abattement de 30% uniquement pour la résidence principale
      if (bien.type === "Résidence principale") {
        valeurAvecAbattement = bien.valeur * 0.7; // 30% d'abattement
      }
      return acc + valeurAvecAbattement;
    },
    0
  )

  // Calcul de l'IFI
  const calculerIFI = (patrimoine: number): number => {
    if (patrimoine <= 800000) return 0
    if (patrimoine <= 1300000) return (patrimoine - 800000) * 0.005
    if (patrimoine <= 2570000) return 2500 + (patrimoine - 1300000) * 0.007
    if (patrimoine <= 5000000) return 11390 + (patrimoine - 2570000) * 0.01
    if (patrimoine <= 10000000) return 35690 + (patrimoine - 5000000) * 0.0125
    return 98190 + (patrimoine - 10000000) * 0.015
  }
  
  const ifi = calculerIFI(patrimoineNetTaxable)
  const tauxEffectif = patrimoineNetTaxable > 0 ? (ifi / patrimoineNetTaxable) * 100 : 0
  const seuilImposition = 800000
  const margeAvantSeuil = Math.max(0, seuilImposition - patrimoineNetTaxable)

  const repartitionData = biens
    .filter((bien) => bien.valeur > 0)
    .map((bien) => ({
      name: bien.type,
      value: bien.valeur,
    }))

  const evolutionPatrimoine = [
    { name: "Patrimoine brut", montant: valeurBruteTotal },
    { name: "Patrimoine après abattement", montant: patrimoineNetTaxable },
    { name: "IFI", montant: -ifi },
  ]

  const baremeIFI = [
    { tranche: "0 - 800k€", taux: 0, seuil: 800000 },
    { tranche: "800k€ - 1,3M€", taux: 0.5, seuil: 1300000 },
    { tranche: "1,3M€ - 2,57M€", taux: 0.7, seuil: 2570000 },
    { tranche: "2,57M€ - 5M€", taux: 1.0, seuil: 5000000 },
    { tranche: "5M€ - 10M€", taux: 1.25, seuil: 10000000 },
    { tranche: "> 10M€", taux: 1.5, seuil: Number.POSITIVE_INFINITY },
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
                <BreadcrumbPage>IFI</BreadcrumbPage>
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
              <CardTitle>
                Données de la déclaration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Biens immobiliers</h3>
                </div>
                {biens.map((bien) => (
                  <div
                    key={bien.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div>
                        <div className="font-medium">{bien.type}</div>
                        {bien.description && (
                          <div className="text-sm text-muted-foreground">
                            {bien.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        {bien.valeur.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteBien(bien.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calcul de l'IFI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valeur brute totale</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    {valeurBruteTotal.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Patrimoine après abattement RP</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    {patrimoineNetTaxable.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Taux effectif</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    {tauxEffectif.toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Marge avant seuil</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    {margeAvantSeuil.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>IFI à payer</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                  {ifi.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
