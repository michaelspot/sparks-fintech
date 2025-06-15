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
import { Plus, Trash2, Calculator, HomeIcon, Percent, RefreshCw } from "lucide-react" // Renamed Home to HomeIcon

interface BienImmobilier {
  id: string
  type: string // e.g. "residence-principale"
  description: string
  valeur: number // Gross value
  dette: number
  abattement: number // Abatement percentage
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
  { value: "residence-principale", label: "Résidence principale" },
  { value: "residence-secondaire", label: "Résidence secondaire" },
  { value: "locatif", label: "Bien locatif" },
  { value: "terrain", label: "Terrain" },
  { value: "parts-sci", label: "Parts de SCI" },
  { value: "autre", label: "Autre bien immobilier" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

const LOCAL_STORAGE_KEY_IFI = "fiscaliteIFIInfo"
const LOCAL_STORAGE_KEY_PATRIMOINE_IMMOBILIER = "patrimoineImmobilierInfo"

const mapPatrimoinePropertyToIFIBien = (property: PatrimoineProperty): BienImmobilier => {
  let ifiType = "autre"
  let abattementIFI = 0

  switch (property.type) {
    case "Résidence principale":
      ifiType = "residence-principale"
      abattementIFI = 30 // 30% abattement for principal residence
      break
    case "Résidence secondaire":
      ifiType = "residence-secondaire"
      break
    case "Investissement locatif":
      ifiType = "locatif"
      break
    case "Terrain":
      ifiType = "terrain"
      break
    // Add more specific mappings if needed
  }

  return {
    id: `patrimoine-${property.id}`,
    type: ifiType,
    description: `${property.denomination} (Patrimoine)`,
    valeur: property.grossValue,
    dette: property.attachedDebts,
    abattement: abattementIFI,
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

  useEffect(() => {
    loadDataFromLocalStorage()
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
      dette: 0,
      abattement: 0,
      source: "manual",
    }
    setBiens([...biens, newBien])
  }

  const updateBien = (id: string, field: keyof BienImmobilier, value: string | number) => {
    setBiens(
      biens.map((item) =>
        item.id === id
          ? { ...item, [field]: value, source: item.source === "patrimoine" ? "patrimoine" : "manual" }
          : item,
      ),
    )
  }

  const deleteBien = (id: string) => {
    setBiens(biens.filter((item) => item.id !== id))
  }

  const valeurBruteTotal = biens.reduce((sum, bien) => sum + bien.valeur, 0)
  const dettesTotal = biens.reduce((sum, bien) => sum + bien.dette, 0)
  const abattementsTotalIFI = biens.reduce((sum, bien) => {
    // L'abattement de 30% sur la RP s'applique sur la valeur nette de dettes, mais pour la base IFI,
    // on applique l'abattement sur la valeur brute avant déduction des dettes spécifiques à ce bien.
    // La loi dit : "la valeur de la résidence principale (...) fait l'objet d'un abattement de 30 %"
    // Donc, (valeur brute * % abattement).
    return sum + (bien.valeur * bien.abattement) / 100
  }, 0)

  const patrimoineNetAvantAbattementRP = valeurBruteTotal - dettesTotal
  // L'abattement de 30% pour la RP s'applique sur la valeur vénale brute.
  // Le patrimoine net taxable est (Valeur Brute Totale - Abattement RP si applicable) - Dettes Totales.
  // Or, more accurately: Sum(Valeur nette de chaque bien après son abattement spécifique)
  // Let's recalculate patrimoineNet correctly:
  const patrimoineNet = biens.reduce((sum, bien) => {
    const valeurApresAbattement = bien.valeur * (1 - bien.abattement / 100)
    return sum + (valeurApresAbattement - bien.dette)
  }, 0)

  const calculerIFI = (patrimoine: number) => {
    if (patrimoine <= 800000) return 0
    if (patrimoine <= 1300000) return (patrimoine - 800000) * 0.005
    if (patrimoine <= 2570000) return 2500 + (patrimoine - 1300000) * 0.007
    if (patrimoine <= 5000000) return 11390 + (patrimoine - 2570000) * 0.01
    if (patrimoine <= 10000000) return 35690 + (patrimoine - 5000000) * 0.0125
    return 98190 + (patrimoine - 10000000) * 0.015
  }

  const ifi = calculerIFI(patrimoineNet)
  const tauxEffectif = patrimoineNet > 0 ? (ifi / patrimoineNet) * 100 : 0
  const seuilImposition = 800000
  const margeAvantSeuil = Math.max(0, seuilImposition - patrimoineNet)

  const repartitionData = biens
    .filter((bien) => bien.valeur * (1 - bien.abattement / 100) - bien.dette > 0)
    .map((bien, index) => ({
      name: typeBiens.find((type) => type.value === bien.type)?.label || bien.type,
      value: bien.valeur * (1 - bien.abattement / 100) - bien.dette, // Valeur nette du bien
      color: COLORS[index % COLORS.length],
    }))

  const evolutionPatrimoine = [
    { name: "Valeur brute", montant: valeurBruteTotal },
    { name: "Dettes", montant: -dettesTotal },
    { name: "Abattements RP", montant: -abattementsTotalIFI }, // Specific abattement for RP
    { name: "Patrimoine net taxable", montant: patrimoineNet },
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Impôt sur la Fortune Immobilière (IFI)</h2>
          <p className="text-muted-foreground">Calculez votre IFI et optimisez votre patrimoine immobilier</p>
        </div>
        <Button onClick={loadDataFromLocalStorage} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser les données Patrimoine
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-9">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Patrimoine immobilier
            </CardTitle>
            <CardDescription>
              Déclarez vos biens immobiliers pour calculer votre IFI. Les biens du patrimoine sont importés.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Biens immobiliers (manuels ou importés)</h3>
                <Button onClick={addBien} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un bien manuel
                </Button>
              </div>
              {biens.map((bien) => (
                <Card
                  key={bien.id}
                  className={`p-4 ${bien.source === "patrimoine" ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700" : ""}`}
                >
                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-3">
                      <Label>Type de bien</Label>
                      <Select
                        value={bien.type}
                        onValueChange={(value) => updateBien(bien.id, "type", value)}
                        disabled={bien.source === "patrimoine"}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {typeBiens.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Input
                        value={bien.description}
                        onChange={(e) => updateBien(bien.id, "description", e.target.value)}
                        placeholder="Description du bien"
                        disabled={bien.source === "patrimoine"}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Valeur (€)</Label>
                      <Input
                        type="number"
                        value={bien.valeur}
                        onChange={(e) => updateBien(bien.id, "valeur", Number.parseFloat(e.target.value) || 0)}
                        disabled={bien.source === "patrimoine"}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Dette (€)</Label>
                      <Input
                        type="number"
                        value={bien.dette}
                        onChange={(e) => updateBien(bien.id, "dette", Number.parseFloat(e.target.value) || 0)}
                        disabled={bien.source === "patrimoine"}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Abatt. (%)</Label>
                      <Input
                        type="number"
                        value={bien.abattement}
                        onChange={(e) => updateBien(bien.id, "abattement", Number.parseFloat(e.target.value) || 0)}
                        disabled={bien.source === "patrimoine" && bien.type !== "residence-principale"} // Allow editing abattement for RP even if synced
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      {bien.source === "patrimoine" && (
                        <Badge variant="outline" className="mr-1 h-9 py-0 text-xs">
                          Patrim.
                        </Badge>
                      )}
                      <Button variant="outline" size="icon" onClick={() => deleteBien(bien.id)} className="h-9 w-9">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Barème IFI 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {baremeIFI.map((tranche, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-sm">{tranche.tranche}</span>
                      <Badge
                        variant={
                          patrimoineNet >= (index === 0 ? 0 : baremeIFI[index - 1]?.seuil || 0) &&
                          patrimoineNet < tranche.seuil
                            ? "default"
                            : "secondary"
                        }
                      >
                        {tranche.taux}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calcul de l'IFI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Valeur brute totale</span>
                  <span className="font-medium">
                    {valeurBruteTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dettes déductibles</span>
                  <span className="font-medium">
                    -{dettesTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Abattement Rés. Principale (si applicable)</span>
                  <span className="font-medium">
                    -{abattementsTotalIFI.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Patrimoine net taxable</span>
                  <span>{patrimoineNet.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>IFI à payer</span>
                  <span className={ifi > 0 ? "text-red-600" : "text-green-600"}>
                    {ifi.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
                {ifi > 0 && (
                  <div className="flex justify-between">
                    <span>Taux effectif</span>
                    <Badge variant="secondary">{tauxEffectif.toFixed(3)}%</Badge>
                  </div>
                )}
                {margeAvantSeuil > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Marge avant seuil d'imposition</span>
                    <span className="font-medium">
                      {margeAvantSeuil.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Analyse patrimoniale IFI</CardTitle>
            <CardDescription>Répartition et évolution de votre patrimoine taxable à l'IFI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Répartition du patrimoine net taxable</h3>
              <ChartContainer config={{ patrimoine: { label: "Patrimoine" } }} className="h-[200px]">
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
                              <span className="text-[0.70rem] uppercase text-muted-foreground">{data.name}</span>
                              <span className="font-bold text-muted-foreground">
                                {data.value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                              </span>
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
              <h3 className="text-sm font-medium mb-3">Évolution du calcul IFI</h3>
              <ChartContainer
                config={{ montant: { label: "Montant", color: "hsl(var(--chart-1))" } }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evolutionPatrimoine} layout="horizontal">
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
                <div className="text-2xl font-bold text-blue-600">{(patrimoineNet / 1000000).toFixed(2)} M€</div>
                <p className="text-xs text-muted-foreground">Patrimoine net taxable</p>
              </Card>
              <Card className="p-3">
                <div className={`text-2xl font-bold ${ifi > 0 ? "text-red-600" : "text-green-600"}`}>
                  {ifi > 0 ? `${(ifi / 1000).toFixed(1)} k€` : "0 €"}
                </div>
                <p className="text-xs text-muted-foreground">IFI à payer</p>
              </Card>
            </div>
            <Card
              className={`p-4 ${ifi > 0 ? "border-red-200 bg-red-50 dark:bg-red-900/30" : "border-green-200 bg-green-50 dark:bg-green-900/30"}`}
            >
              <div className="flex items-center gap-2">
                <Percent
                  className={`h-5 w-5 ${ifi > 0 ? "text-red-600 dark:text-red-200" : "text-green-600 dark:text-green-200"}`}
                />
                <div>
                  <p
                    className={`font-medium ${ifi > 0 ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"}`}
                  >
                    {ifi > 0 ? "Assujetti à l'IFI" : "Non assujetti à l'IFI"}
                  </p>
                  <p
                    className={`text-sm ${ifi > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                  >
                    {ifi > 0
                      ? `Patrimoine supérieur au seuil de ${seuilImposition.toLocaleString("fr-FR")}€`
                      : `Patrimoine inférieur au seuil de ${seuilImposition.toLocaleString("fr-FR")}€`}
                  </p>
                </div>
              </div>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
