"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calculator, Building2 } from "lucide-react"

// ===== INTERFACES =====
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

interface DutreilResults {
  // Scénario Sans Dutreil
  sansDutreil: {
    valeurParEnfant: number
    abattement100k: number
    baseTaxable: number
    droitsDus: number
    coutTotal: number
    ratioTransmission: number
  }
  // Scénario Avec Dutreil PP
  avecDutreilPP: {
    abattementDutreil75: number
    baseApresDutreil: number
    abattement100k: number
    baseTaxable: number
    droitsDusAvantReduction: number
    reductionSi70ans: number
    droitsDus: number
    coutTotal: number
    ratioTransmission: number
  }
  // Scénario Avec Dutreil NP
  avecDutreilNP: {
    valeurNP: number
    pourcentageNP: number
    valorisationNP: number
    abattementDutreil75: number
    baseApresDutreil: number
    abattement100k: number
    baseTaxable: number
    droitsDus: number
    coutTotal: number
    ratioTransmission: number
  }
}

// ===== CONSTANTES =====
const LOCAL_STORAGE_KEY_PATRIMOINE = "patrimoineProfessionnelInfo"
const LOCAL_STORAGE_KEY_DUTREIL = "pacteDutreilSimulation"

// Barème de l'usufruit selon l'âge (Article 669 CGI)
const BAREME_USUFRUIT: Record<string, number> = {
  "moins de 21 ans": 0.90,
  "de 21 à 30 ans": 0.80,
  "de 31 à 40 ans": 0.70,
  "de 41 à 50 ans": 0.60,
  "de 51 à 60 ans": 0.50,
  "de 61 à 70 ans": 0.40,
  "de 71 à 80 ans": 0.30,
  "de 81 à 90 ans": 0.20,
  "plus de 91 ans": 0.10,
}

// Barème des droits de donation en ligne directe (2025)
const BAREME_DONATION = [
  { max: 8072, taux: 0.05 },
  { max: 12109, taux: 0.10 },
  { max: 15932, taux: 0.15 },
  { max: 552324, taux: 0.20 },
  { max: 902838, taux: 0.30 },
  { max: 1805677, taux: 0.40 },
  { max: Infinity, taux: 0.45 },
]

// ===== FONCTIONS DE CALCUL =====

// Calcul du pourcentage de nue-propriété selon l'âge
function calculerPourcentageNP(age: number): number {
  if (age < 21) return 0.10 // Usufruit 90%, donc NP = 10%
  if (age <= 30) return 0.20 // Usufruit 80%, donc NP = 20%
  if (age <= 40) return 0.30
  if (age <= 50) return 0.40
  if (age <= 60) return 0.50
  if (age <= 70) return 0.60
  if (age <= 80) return 0.70
  if (age <= 90) return 0.80
  return 0.90 // Plus de 91 ans
}

// Calcul des droits de donation selon le barème progressif
function calculerDroitsDonation(baseTaxable: number): number {
  if (baseTaxable <= 0) return 0

  let droits = 0
  let restant = baseTaxable
  let seuilPrecedent = 0

  for (const tranche of BAREME_DONATION) {
    const plafond = tranche.max
    const montantTranche = Math.min(restant, plafond - seuilPrecedent)

    if (montantTranche <= 0) break

    droits += montantTranche * tranche.taux
    restant -= montantTranche
    seuilPrecedent = plafond

    if (restant <= 0) break
  }

  return droits
}

// Calcul complet des 3 scénarios
function calculerScenariosDutreil(
  valorisationSociete: number,
  nombreEnfants: number,
  ageDonateur: number
): DutreilResults {
  const valeurParEnfant = valorisationSociete / nombreEnfants

  // ===== SCÉNARIO 1 : SANS DUTREIL =====
  const sansDutreil_abattement = 100000
  const sansDutreil_baseTaxable = Math.max(0, valeurParEnfant - sansDutreil_abattement)
  const sansDutreil_droitsDus = calculerDroitsDonation(sansDutreil_baseTaxable)
  const sansDutreil_coutTotal = sansDutreil_droitsDus * nombreEnfants
  const sansDutreil_ratio = valorisationSociete > 0 ? (sansDutreil_coutTotal / valorisationSociete) * 100 : 0

  // ===== SCÉNARIO 2 : AVEC DUTREIL PLEINE PROPRIÉTÉ =====
  const dutreilPP_abattement75 = valeurParEnfant * 0.75
  const dutreilPP_baseApresDutreil = valeurParEnfant - dutreilPP_abattement75
  const dutreilPP_abattement100k = 100000
  const dutreilPP_baseTaxable = Math.max(0, dutreilPP_baseApresDutreil - dutreilPP_abattement100k)
  const dutreilPP_droitsAvantReduction = calculerDroitsDonation(dutreilPP_baseTaxable)
  
  // Réduction de 50% si donateur < 70 ans
  const dutreilPP_reduction = ageDonateur < 70 ? dutreilPP_droitsAvantReduction * 0.50 : 0
  const dutreilPP_droitsDus = dutreilPP_droitsAvantReduction - dutreilPP_reduction
  const dutreilPP_coutTotal = dutreilPP_droitsDus * nombreEnfants
  const dutreilPP_ratio = valorisationSociete > 0 ? (dutreilPP_coutTotal / valorisationSociete) * 100 : 0

  // ===== SCÉNARIO 3 : AVEC DUTREIL NUE-PROPRIÉTÉ =====
  const pourcentageNP = calculerPourcentageNP(ageDonateur)
  const valorisationNP = valeurParEnfant * pourcentageNP
  const dutreilNP_abattement75 = valorisationNP * 0.75
  const dutreilNP_baseApresDutreil = valorisationNP - dutreilNP_abattement75
  const dutreilNP_abattement100k = 100000
  const dutreilNP_baseTaxable = Math.max(0, dutreilNP_baseApresDutreil - dutreilNP_abattement100k)
  const dutreilNP_droitsDus = calculerDroitsDonation(dutreilNP_baseTaxable)
  const dutreilNP_coutTotal = dutreilNP_droitsDus * nombreEnfants
  const dutreilNP_ratio = valorisationSociete > 0 ? (dutreilNP_coutTotal / valorisationSociete) * 100 : 0

  return {
    sansDutreil: {
      valeurParEnfant,
      abattement100k: sansDutreil_abattement,
      baseTaxable: sansDutreil_baseTaxable,
      droitsDus: sansDutreil_droitsDus,
      coutTotal: sansDutreil_coutTotal,
      ratioTransmission: sansDutreil_ratio,
    },
    avecDutreilPP: {
      abattementDutreil75: dutreilPP_abattement75,
      baseApresDutreil: dutreilPP_baseApresDutreil,
      abattement100k: dutreilPP_abattement100k,
      baseTaxable: dutreilPP_baseTaxable,
      droitsDusAvantReduction: dutreilPP_droitsAvantReduction,
      reductionSi70ans: dutreilPP_reduction,
      droitsDus: dutreilPP_droitsDus,
      coutTotal: dutreilPP_coutTotal,
      ratioTransmission: dutreilPP_ratio,
    },
    avecDutreilNP: {
      valeurNP: pourcentageNP,
      pourcentageNP: pourcentageNP * 100,
      valorisationNP,
      abattementDutreil75: dutreilNP_abattement75,
      baseApresDutreil: dutreilNP_baseApresDutreil,
      abattement100k: dutreilNP_abattement100k,
      baseTaxable: dutreilNP_baseTaxable,
      droitsDus: dutreilNP_droitsDus,
      coutTotal: dutreilNP_coutTotal,
      ratioTransmission: dutreilNP_ratio,
    },
  }
}

// ===== COMPOSANT PRINCIPAL =====
export default function PacteDutreilPage() {
  const [entreprises, setEntreprises] = useState<ProfessionalAsset[]>([])
  const [entrepriseSelectionnee, setEntrepriseSelectionnee] = useState("")
  const [ageDonateur, setAgeDonateur] = useState(65)
  const [nombreEnfants, setNombreEnfants] = useState(2)
  const [resultats, setResultats] = useState<DutreilResults | null>(null)

  // Charger les entreprises depuis le patrimoine professionnel
  const loadDataFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedPatrimoine = localStorage.getItem(LOCAL_STORAGE_KEY_PATRIMOINE)
      if (savedPatrimoine) {
        const assets: ProfessionalAsset[] = JSON.parse(savedPatrimoine)
        setEntreprises(assets)
      }

      // Charger les données de simulation sauvegardées
      const savedSimulation = localStorage.getItem(LOCAL_STORAGE_KEY_DUTREIL)
      if (savedSimulation) {
        const simData = JSON.parse(savedSimulation)
        setEntrepriseSelectionnee(simData.entrepriseSelectionnee || "")
        setAgeDonateur(simData.ageDonateur || 65)
        setNombreEnfants(simData.nombreEnfants || 2)
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
        entrepriseSelectionnee,
        ageDonateur,
        nombreEnfants,
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_DUTREIL, JSON.stringify(dataToSave))
    }
  }, [entrepriseSelectionnee, ageDonateur, nombreEnfants])

  // Calculer automatiquement les résultats quand les données changent
  useEffect(() => {
    if (entrepriseSelectionnee && ageDonateur > 0 && nombreEnfants > 0) {
      const entreprise = entreprises.find((e) => e.id === entrepriseSelectionnee)
      if (entreprise && entreprise.valuation > 0) {
        const nouveauxResultats = calculerScenariosDutreil(
          entreprise.valuation,
          nombreEnfants,
          ageDonateur
        )
        setResultats(nouveauxResultats)
        saveDataToLocalStorage()
      }
    } else {
      setResultats(null)
    }
  }, [entrepriseSelectionnee, ageDonateur, nombreEnfants, entreprises, saveDataToLocalStorage])

  const entrepriseActuelle = entreprises.find((e) => e.id === entrepriseSelectionnee)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Vérifier si Dutreil est possible
  const dutreilPossible = entrepriseActuelle && 
    entrepriseActuelle.willToTransfer === "Oui" && 
    entrepriseActuelle.valuation > 0

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
                <BreadcrumbPage>Pacte Dutreil</BreadcrumbPage>
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
            <Card>
              <CardHeader>
                <CardTitle>Données de la transmission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sélection de l'entreprise */}
                <div className="space-y-2">
                  <Label htmlFor="entrepriseSelect">Entreprise à transmettre</Label>
                  <Select value={entrepriseSelectionnee} onValueChange={setEntrepriseSelectionnee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entreprise..." />
                    </SelectTrigger>
                    <SelectContent>
                      {entreprises.map((entreprise) => (
                        <SelectItem key={entreprise.id} value={entreprise.id}>
                          {entreprise.companyName} - {formatCurrency(entreprise.valuation)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {entreprises.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucune entreprise trouvée. Ajoutez des actifs dans Patrimoine Professionnel.
                    </p>
                  )}
                </div>

                {entrepriseActuelle && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium">{entrepriseActuelle.companyName}</div>
                          <div className="text-sm text-muted-foreground">
                            {entrepriseActuelle.activity} • {entrepriseActuelle.shareOwnership}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Valorisation de la société</Label>
                          <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                            {formatCurrency(entrepriseActuelle.valuation)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Dutreil possible ?</Label>
                          <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                            {dutreilPossible ? "✓ Oui" : "✗ Non"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Paramètres de transmission */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Paramètres de transmission</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ageDonateur">Âge du donateur</Label>
                      <Input
                        id="ageDonateur"
                        type="number"
                        value={ageDonateur}
                        onChange={(e) => setAgeDonateur(parseInt(e.target.value) || 0)}
                        min="20"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombreEnfants">Nombre d'enfants</Label>
                      <Input
                        id="nombreEnfants"
                        type="number"
                        value={nombreEnfants}
                        onChange={(e) => setNombreEnfants(parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  {entrepriseActuelle && nombreEnfants > 0 && (
                    <div className="space-y-2">
                      <Label>Valeur par enfant</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatCurrency(entrepriseActuelle.valuation / nombreEnfants)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLONNE DROITE - RÉSULTATS */}
          <div className="space-y-4">
            {resultats && entrepriseActuelle ? (
              <>
                {/* Scénario 1 : Sans Dutreil */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle>Sans Dutreil</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Voir détail</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Détails du calcul - Sans Dutreil</DialogTitle>
                          <DialogDescription>
                            Transmission classique sans dispositif Dutreil
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 1 : VALEUR À TRANSMETTRE
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Valorisation totale de la société :</span>
                                <span className="font-mono">{formatCurrency(entrepriseActuelle.valuation)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Nombre d'enfants :</span>
                                <span className="font-mono">{nombreEnfants}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>VALEUR PAR ENFANT :</span>
                                <span className="font-mono">{formatCurrency(resultats.sansDutreil.valeurParEnfant)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 2 : APPLICATION DES ABATTEMENTS
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Abattement personnel en ligne directe :</span>
                                <span className="font-mono">-{formatCurrency(resultats.sansDutreil.abattement100k)}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>BASE TAXABLE :</span>
                                <span className="font-mono">{formatCurrency(resultats.sansDutreil.baseTaxable)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 3 : CALCUL DES DROITS
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Application du barème progressif :</span>
                                <span className="font-mono">{formatCurrency(resultats.sansDutreil.droitsDus)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              RÉSULTAT FINAL
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between">
                                <span>Droits dus par enfant :</span>
                                <span className="font-mono">{formatCurrency(resultats.sansDutreil.droitsDus)}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold">
                                <span>COÛT TOTAL DE TRANSMISSION :</span>
                                <span className="font-mono">{formatCurrency(resultats.sansDutreil.coutTotal)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Ratio de transmission :</span>
                                <span className="font-mono">{formatPercentage(resultats.sansDutreil.ratioTransmission)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Droits dus par enfant</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                          {formatCurrency(resultats.sansDutreil.droitsDus)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Coût total</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                          {formatCurrency(resultats.sansDutreil.coutTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Ratio de transmission</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatPercentage(resultats.sansDutreil.ratioTransmission)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scénario 2 : Avec Dutreil PP */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle>Avec Dutreil - Pleine Propriété</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Voir détail</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Détails du calcul - Dutreil Pleine Propriété</DialogTitle>
                          <DialogDescription>
                            Transmission avec Pacte Dutreil en pleine propriété
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 1 : VALEUR À TRANSMETTRE
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Valorisation totale de la société :</span>
                                <span className="font-mono">{formatCurrency(entrepriseActuelle.valuation)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Nombre d'enfants :</span>
                                <span className="font-mono">{nombreEnfants}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>VALEUR PAR ENFANT :</span>
                                <span className="font-mono">{formatCurrency(resultats.sansDutreil.valeurParEnfant)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 2 : ABATTEMENT DUTREIL (75%)
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Abattement Dutreil (75%) :</span>
                                <span className="font-mono">-{formatCurrency(resultats.avecDutreilPP.abattementDutreil75)}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>BASE APRÈS DUTREIL :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilPP.baseApresDutreil)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 3 : ABATTEMENT PERSONNEL
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Abattement personnel en ligne directe :</span>
                                <span className="font-mono">-{formatCurrency(resultats.avecDutreilPP.abattement100k)}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>BASE TAXABLE :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilPP.baseTaxable)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 4 : CALCUL DES DROITS
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Application du barème progressif :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilPP.droitsDusAvantReduction)}</span>
                              </div>
                              {ageDonateur < 70 && (
                                <>
                                  <div className="flex justify-between">
                                    <span>• Réduction si donateur &lt; 70 ans (50%) :</span>
                                    <span className="font-mono">-{formatCurrency(resultats.avecDutreilPP.reductionSi70ans)}</span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-semibold">
                                    <span>DROITS APRÈS RÉDUCTION :</span>
                                    <span className="font-mono">{formatCurrency(resultats.avecDutreilPP.droitsDus)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              RÉSULTAT FINAL
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between">
                                <span>Droits dus par enfant :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilPP.droitsDus)}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold">
                                <span>COÛT TOTAL DE TRANSMISSION :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilPP.coutTotal)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Ratio de transmission :</span>
                                <span className="font-mono">{formatPercentage(resultats.avecDutreilPP.ratioTransmission)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Droits dus par enfant</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                          {formatCurrency(resultats.avecDutreilPP.droitsDus)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Coût total</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                          {formatCurrency(resultats.avecDutreilPP.coutTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Ratio de transmission</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatPercentage(resultats.avecDutreilPP.ratioTransmission)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scénario 3 : Avec Dutreil NP */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle>Avec Dutreil - Nue-Propriété</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Voir détail</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Détails du calcul - Dutreil Nue-Propriété</DialogTitle>
                          <DialogDescription>
                            Transmission avec Pacte Dutreil en nue-propriété (démembrement)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 1 : VALEUR À TRANSMETTRE
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Valorisation totale de la société :</span>
                                <span className="font-mono">{formatCurrency(entrepriseActuelle.valuation)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Nombre d'enfants :</span>
                                <span className="font-mono">{nombreEnfants}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>VALEUR PAR ENFANT :</span>
                                <span className="font-mono">{formatCurrency(resultats.sansDutreil.valeurParEnfant)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 2 : CALCUL NRUE-PROPRIÉTÉ (Art 669 CGI)
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Âge du donateur :</span>
                                <span className="font-mono">{ageDonateur} ans</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Valeur de la nue-propriété selon barème :</span>
                                <span className="font-mono">{formatPercentage(resultats.avecDutreilNP.pourcentageNP)}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>VALORISATION EN NUE-PROPRIÉTÉ :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilNP.valorisationNP)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 3 : ABATTEMENT DUTREIL (75%)
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Abattement Dutreil (75%) :</span>
                                <span className="font-mono">-{formatCurrency(resultats.avecDutreilNP.abattementDutreil75)}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>BASE APRÈS DUTREIL :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilNP.baseApresDutreil)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 4 : ABATTEMENT PERSONNEL
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Abattement personnel en ligne directe :</span>
                                <span className="font-mono">-{formatCurrency(resultats.avecDutreilNP.abattement100k)}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>BASE TAXABLE :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilNP.baseTaxable)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              ÉTAPE 5 : CALCUL DES DROITS
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>• Application du barème progressif :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilNP.droitsDus)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">
                              RÉSULTAT FINAL
                            </h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between">
                                <span>Droits dus par enfant :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilNP.droitsDus)}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold">
                                <span>COÛT TOTAL DE TRANSMISSION :</span>
                                <span className="font-mono">{formatCurrency(resultats.avecDutreilNP.coutTotal)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Ratio de transmission :</span>
                                <span className="font-mono">{formatPercentage(resultats.avecDutreilNP.ratioTransmission)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Droits dus par enfant</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                          {formatCurrency(resultats.avecDutreilNP.droitsDus)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Coût total</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                          {formatCurrency(resultats.avecDutreilNP.coutTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Ratio de transmission</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                        {formatPercentage(resultats.avecDutreilNP.ratioTransmission)}
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
                    <p>Sélectionnez une entreprise et configurez les paramètres pour voir les résultats</p>
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
