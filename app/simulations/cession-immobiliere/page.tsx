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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Home, Calculator, FileText, TrendingUp, ArrowRight } from "lucide-react"
import { calculCessionImmobiliere, CessionImmobiliereInputs, CessionImmobiliereResults } from "@/lib/cession-immobiliere"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ThemeToggle } from "@/components/theme-toggle"

interface PatrimoineBien {
  id: string
  denomination: string
  type: string
  netValue: number
  grossValue?: number
  attachedDebts?: number
  dateAcquisition?: string
  valeurAcquisition?: number
}

const LOCAL_STORAGE_KEY_CESSION = "cessionImmobiliereSimulation"
const LOCAL_STORAGE_KEY_PATRIMOINE = "patrimoineImmobilierInfo"

export default function CessionImmobilierePage() {
  // États pour les données d'entrée
  const [bienSelectionne, setBienSelectionne] = useState("")
  const [valeurAcquisition, setValeurAcquisition] = useState(0)
  const [dateAcquisition, setDateAcquisition] = useState("")
  const [valeurCession, setValeurCession] = useState(0)
  const [dateCession, setDateCession] = useState(new Date().toISOString().split('T')[0])
  const [fraisNotaire, setFraisNotaire] = useState(0)
  const [fraisTravaux, setFraisTravaux] = useState(0)
  
  // États pour les données calculées
  const [resultats, setResultats] = useState<CessionImmobiliereResults | null>(null)
  const [biens, setBiens] = useState<PatrimoineBien[]>([])

  // Couleurs pour les graphiques
  const COLORS = {
    impotIR: '#ef4444', // rouge
    impotPS: '#f97316', // orange
    surtaxe: '#dc2626', // rouge foncé
    gainNet: '#22c55e', // vert
    coutAcquisition: '#3b82f6', // bleu
    impotTotal: '#ef4444' // rouge
  }

  // Préparer les données pour le graphique de répartition des impôts
  const prepareImpotData = (resultats: CessionImmobiliereResults) => {
    const data = []
    if (resultats.impotIR > 0) {
      data.push({ name: 'Impôt IR (19%)', value: resultats.impotIR, color: COLORS.impotIR })
    }
    if (resultats.impotPS > 0) {
      data.push({ name: 'Prélèvements sociaux (17,2%)', value: resultats.impotPS, color: COLORS.impotPS })
    }
    if (resultats.surtaxePlusValue > 0) {
      data.push({ name: 'Surtaxe plus-value', value: resultats.surtaxePlusValue, color: COLORS.surtaxe })
    }
    return data
  }

  // Préparer les données pour le graphique de répartition du prix de cession
  const prepareCessionData = (resultats: CessionImmobiliereResults) => {
    const gainNet = valeurCession - resultats.valeurAcquisitionAjustee - resultats.impotTotal
    return [
      { name: 'Gain net', value: Math.max(0, gainNet), color: COLORS.gainNet },
      { name: 'Impôts totaux', value: resultats.impotTotal, color: COLORS.impotTotal },
      { name: 'Coût d\'acquisition ajusté', value: resultats.valeurAcquisitionAjustee, color: COLORS.coutAcquisition }
    ]
  }

  // Charger les données depuis localStorage
  const loadDataFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      // Charger les biens du patrimoine
      const savedPatrimoine = localStorage.getItem(LOCAL_STORAGE_KEY_PATRIMOINE)
      if (savedPatrimoine) {
        try {
          const patrimoineData = JSON.parse(savedPatrimoine)
          // Mapper les données du patrimoine vers l'interface PatrimoineBien
          const biensMappes: PatrimoineBien[] = patrimoineData.map((property: any) => ({
            id: property.id,
            denomination: property.denomination,
            type: property.type,
            netValue: property.netValue || 0,
            grossValue: property.grossValue,
            attachedDebts: property.attachedDebts,
            dateAcquisition: property.dateAcquisition,
            valeurAcquisition: property.valeurAcquisition
          }))
          setBiens(biensMappes)
          console.log('Biens chargés:', biensMappes) // Debug
        } catch (error) {
          console.error('Erreur lors du chargement des biens:', error)
          setBiens([])
        }
      } else {
        console.log('Aucune donnée de patrimoine trouvée dans localStorage')
        setBiens([])
      }
      
      // Charger les données de simulation sauvegardées
      const savedSimulation = localStorage.getItem(LOCAL_STORAGE_KEY_CESSION)
      if (savedSimulation) {
        const simData = JSON.parse(savedSimulation)
        setBienSelectionne(simData.bienSelectionne || "")
        setValeurAcquisition(simData.valeurAcquisition || 0)
        setDateAcquisition(simData.dateAcquisition || "")
        setValeurCession(simData.valeurCession || 0)
        setDateCession(simData.dateCession || new Date().toISOString().split('T')[0])
        setFraisNotaire(simData.fraisNotaire || 0)
        setFraisTravaux(simData.fraisTravaux || 0)
      }
    }
  }, [])

  useEffect(() => {
    loadDataFromLocalStorage()
  }, [loadDataFromLocalStorage])

  // Sauvegarder les données dans localStorage
  const saveDataToLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const dataToSave = {
        bienSelectionne,
        valeurAcquisition,
        dateAcquisition,
        valeurCession,
        dateCession,
        fraisNotaire,
        fraisTravaux
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_CESSION, JSON.stringify(dataToSave))
    }
  }, [bienSelectionne, valeurAcquisition, dateAcquisition, valeurCession, dateCession, fraisNotaire, fraisTravaux])

  // Calculer automatiquement les résultats quand les données changent
  useEffect(() => {
    console.log('useEffect déclenché avec:', {
      valeurAcquisition,
      valeurCession,
      dateAcquisition,
      dateCession,
      fraisNotaire,
      fraisTravaux
    })
    
    if (valeurAcquisition > 0 && valeurCession > 0 && dateAcquisition && dateCession) {
      console.log('Conditions remplies, calcul en cours...')
      
      const inputs: CessionImmobiliereInputs = {
        valeurAcquisition,
        dateAcquisition,
        valeurCession,
        dateCession,
        fraisNotaire,
        fraisTravaux
      }
      
      console.log('Inputs pour le calcul:', inputs)
      
      try {
        const nouveauxResultats = calculCessionImmobiliere(inputs)
        console.log('Résultats calculés:', nouveauxResultats)
        setResultats(nouveauxResultats)
        saveDataToLocalStorage()
      } catch (error) {
        console.error('Erreur lors du calcul:', error)
      }
    } else {
      console.log('Conditions non remplies pour le calcul')
      setResultats(null)
    }
  }, [valeurAcquisition, dateAcquisition, valeurCession, dateCession, fraisNotaire, fraisTravaux, saveDataToLocalStorage])

  // Gérer la sélection d'un bien
  const handleBienSelection = (bienId: string) => {
    setBienSelectionne(bienId)
    const bien = biens.find(b => b.id === bienId)
    if (bien) {
      setValeurCession(bien.netValue)
      
      // Date d'acquisition : utiliser celle du bien ou une date par défaut
      if (bien.dateAcquisition) {
        setDateAcquisition(bien.dateAcquisition)
      } else {
        // Date par défaut : il y a 10 ans
        const dateParDefaut = new Date()
        dateParDefaut.setFullYear(dateParDefaut.getFullYear() - 10)
        setDateAcquisition(dateParDefaut.toISOString().split('T')[0])
      }
      
      // Valeur d'acquisition : utiliser celle du bien ou 80% de la valeur actuelle par défaut
      if (bien.valeurAcquisition) {
        setValeurAcquisition(bien.valeurAcquisition)
        // Calculer automatiquement les frais de notaire (7,5% par défaut)
        setFraisNotaire(Math.round(bien.valeurAcquisition * 0.075))
      } else {
        // Valeur par défaut : 80% de la valeur actuelle
        const valeurParDefaut = Math.round(bien.netValue * 0.8)
        setValeurAcquisition(valeurParDefaut)
        setFraisNotaire(Math.round(valeurParDefaut * 0.075))
      }
      
      console.log('Bien sélectionné:', bien)
      console.log('Données mises à jour:', {
        valeurCession: bien.netValue,
        dateAcquisition: bien.dateAcquisition || 'date par défaut',
        valeurAcquisition: bien.valeurAcquisition || 'valeur par défaut'
      })
    }
  }

  // Gérer les changements de valeur d'acquisition
  const handleValeurAcquisitionChange = (value: string) => {
    const newValue = parseFloat(value) || 0
    setValeurAcquisition(newValue)
    // Recalculer automatiquement les frais de notaire
    setFraisNotaire(Math.round(newValue * 0.075))
  }

  // Gérer les changements de frais de travaux avec limite
  const handleFraisTravauxChange = (value: string) => {
    const newValue = parseFloat(value) || 0
    const limite = valeurAcquisition * 0.15
    setFraisTravaux(Math.min(newValue, limite))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
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
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/simulations">Simulations</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Cession Immobilière</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* COLONNE GAUCHE - ENTRÉES */}
          <div className="space-y-4">
            {/* Données de l'opération avec sélection du bien */}
            <Card>
              <CardHeader>
                <CardTitle>Données de l'opération</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sélection du bien */}
                <div className="space-y-2">
                  <Label htmlFor="bienSelect">Bien immobilier</Label>
                  <Select value={bienSelectionne} onValueChange={handleBienSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un bien..." />
                    </SelectTrigger>
                    <SelectContent>
                      {biens.map((bien) => (
                        <SelectItem key={bien.id} value={bien.id}>
                          {bien.denomination} - {formatCurrency(bien.netValue)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {biens.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucun bien trouvé. Ajoutez des biens dans la section Patrimoine Immobilier.
                    </p>
                  )}
                </div>

                {/* Section acquisition */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Acquisition</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateAcquisition">Date d'acquisition</Label>
                      <Input
                        id="dateAcquisition"
                        type="date"
                        value={dateAcquisition}
                        onChange={(e) => setDateAcquisition(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valeurAcquisition">Valeur d'acquisition</Label>
                      <Input
                        id="valeurAcquisition"
                        type="number"
                        value={valeurAcquisition || ""}
                        onChange={(e) => handleValeurAcquisitionChange(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fraisNotaire">
                        Frais de notaire
                        <Badge variant="secondary" className="ml-2">7,5% par défaut</Badge>
                      </Label>
                      <Input
                        id="fraisNotaire"
                        type="number"
                        value={fraisNotaire || ""}
                        onChange={(e) => setFraisNotaire(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fraisTravaux">
                        Frais de travaux
                        <Badge variant="secondary" className="ml-2">
                          Max {formatCurrency(valeurAcquisition * 0.15)}
                        </Badge>
                      </Label>
                      <Input
                        id="fraisTravaux"
                        type="number"
                        value={fraisTravaux || ""}
                        onChange={(e) => handleFraisTravauxChange(e.target.value)}
                        placeholder="0"
                        max={valeurAcquisition * 0.15}
                      />
                    </div>
                  </div>

                  {valeurAcquisition > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Valeur d'acquisition ajustée:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(valeurAcquisition + fraisNotaire + fraisTravaux)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Section cession */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Cession</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateCession">Date de cession</Label>
                      <Input
                        id="dateCession"
                        type="date"
                        value={dateCession}
                        onChange={(e) => setDateCession(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valeurCession">Valeur de cession</Label>
                      <Input
                        id="valeurCession"
                        type="number"
                        value={valeurCession || ""}
                        onChange={(e) => setValeurCession(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLONNE DROITE - RÉSULTATS */}
          <div className="space-y-4">
            {resultats ? (
              <>
                {/* Résultats principaux avec métriques clés */}
                <Card>
                  <CardHeader>
                    <CardTitle>Résultats de la simulation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(resultats.plusValueBrute)}
                        </div>
                        <div className="text-sm text-muted-foreground">Plus-value brute</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(resultats.impotTotal)}
                        </div>
                        <div className="text-sm text-muted-foreground">Impôts totaux</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(valeurCession - resultats.valeurAcquisitionAjustee - resultats.impotTotal)}
                        </div>
                        <div className="text-sm text-muted-foreground">Gain net</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">
                          {resultats.nombreAnneesDetention} ans
                        </div>
                        <div className="text-sm text-muted-foreground">Détention</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {formatPercentage(resultats.rendementGlobal)}
                        </div>
                        <div className="text-sm text-muted-foreground">Rendement global</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {formatPercentage(resultats.rendementAnnualise)}
                        </div>
                        <div className="text-sm text-muted-foreground">Rendement annualisé</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Graphique de répartition des impôts */}
                {resultats.impotTotal > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Répartition des impôts ({formatCurrency(resultats.impotTotal)})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareImpotData(resultats)}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {prepareImpotData(resultats).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), '']}
                              labelStyle={{ color: '#374151' }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Détail des impôts */}
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Impôt IR (19%) - Abattement {formatPercentage(resultats.abattementIR)}</span>
                          <span className="font-medium text-red-600">{formatCurrency(resultats.impotIR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prélèvements sociaux (17,2%) - Abattement {formatPercentage(resultats.abattementPS)}</span>
                          <span className="font-medium text-orange-600">{formatCurrency(resultats.impotPS)}</span>
                        </div>
                        {resultats.surtaxePlusValue > 0 && (
                          <div className="flex justify-between">
                            <span>Surtaxe plus-value</span>
                            <span className="font-medium text-red-700">{formatCurrency(resultats.surtaxePlusValue)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Graphique de répartition du prix de cession */}
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition du prix de cession ({formatCurrency(valeurCession)})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareCessionData(resultats)}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {prepareCessionData(resultats).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), '']}
                            labelStyle={{ color: '#374151' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Détail de la répartition */}
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Coût d'acquisition ajusté</span>
                        <span className="font-medium text-blue-600">{formatCurrency(resultats.valeurAcquisitionAjustee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impôts totaux ({formatPercentage(resultats.poidsImpotSurPVBrute)} de la PV)</span>
                        <span className="font-medium text-red-600">{formatCurrency(resultats.impotTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gain net après impôts</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(Math.max(0, valeurCession - resultats.valeurAcquisitionAjustee - resultats.impotTotal))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Remplissez les champs de gauche pour voir les résultats de la simulation</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
