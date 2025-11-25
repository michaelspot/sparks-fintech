"use client"

import { useState, useEffect, useCallback } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Trash2, AlertCircle, CheckCircle2, Wallet, PieChart, Info, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

// ===== TYPES =====

interface Envelope {
  id: string
  name: string
  type: "PEA" | "Assurance Vie" | "CTO" | "PER"
  insurer?: string
  fees: number // Frais de gestion annuels en %
}

interface Support {
  id: string
  symbol: string
  isin?: string
  name: string
  type: string
  price: number
  currency: string
  sri: number
  amount: number
  percentage: number
}

interface SearchResult {
  symbol: string
  isin?: string
  shortname?: string
  longname?: string
  exchDisp?: string
  typeDisp?: string
}

// ===== DONNÉES STATIQUES =====

const ENVELOPES_DB: Envelope[] = [
  { id: "pea-bourso", name: "PEA Boursorama", type: "PEA", fees: 0 },
  { id: "pea-fortuneo", name: "PEA Fortuneo", type: "PEA", fees: 0 },
  { id: "av-linxea-avenir", name: "Linxea Avenir 2", type: "Assurance Vie", insurer: "Suravenir", fees: 0.60 },
  { id: "av-bourso-vie", name: "BoursoVie", type: "Assurance Vie", insurer: "Generali", fees: 0.75 },
  { id: "av-lucya", name: "Lucya Cardif", type: "Assurance Vie", insurer: "Cardif", fees: 0.50 },
  { id: "cto-trade-republic", name: "Compte Titres Trade Republic", type: "CTO", fees: 0 },
  { id: "per-linxea-spirit", name: "Linxea Spirit PER", type: "PER", insurer: "Spirica", fees: 0.50 },
]

// Mapping Risque Profil -> SRI Cible approximatif
const RISK_PROFILE_MAP: Record<string, { label: string; maxSri: number; color: string }> = {
  "Sécuritaire": { label: "Sécuritaire", maxSri: 2, color: "text-green-600" },
  "Défensif": { label: "Défensif", maxSri: 3, color: "text-green-500" },
  "Équilibré": { label: "Équilibré", maxSri: 4, color: "text-yellow-500" },
  "Dynamique": { label: "Dynamique", maxSri: 5, color: "text-orange-500" },
  "Offensif": { label: "Offensif", maxSri: 7, color: "text-red-500" },
}

// ===== COMPOSANT =====

export default function AllocationPage() {
  // État global
  const [totalAmount, setTotalAmount] = useState<number>(10000)
  const [investorProfile, setInvestorProfile] = useState<string | null>(null)
  
  // État de l'allocation
  const [selectedEnvelope, setSelectedEnvelope] = useState<Envelope | null>(null)
  const [supports, setSupports] = useState<Support[]>([])

  // État de recherche
  const [envelopeSearch, setEnvelopeSearch] = useState("")
  const [supportSearch, setSupportSearch] = useState("")
  const [supportSearchResults, setSupportSearchResults] = useState<SearchResult[]>([])
  const [isSearchingSupport, setIsSearchingSupport] = useState(false)
  const [showIsin, setShowIsin] = useState(true)

  // Chargement du profil investisseur
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("identityInvestorProfileInfo")
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          const riskLabel = parsed?.userProfile?.risk?.label
          if (riskLabel) {
            setInvestorProfile(riskLabel)
          }
        } catch (e) {
          console.error("Erreur lecture profil", e)
        }
      }
    }
  }, [])

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (supportSearch.length >= 2) {
        handleSearchSupport(supportSearch)
      } else {
        setSupportSearchResults([])
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [supportSearch])

  // Recherche de supports via API (Exécutée par le debounce)
  const handleSearchSupport = async (query: string) => {
    setIsSearchingSupport(true)
    try {
      const res = await fetch(`/api/yahoo/proxy?type=search&query=${encodeURIComponent(query)}${!showIsin ? '&skipIsin=true' : ''}`)
      const data = await res.json()
      if (data.quotes) {
        setSupportSearchResults(data.quotes)
      }
    } catch (error) {
      console.error("Erreur recherche", error)
      toast.error("Erreur lors de la recherche du support")
    } finally {
      setIsSearchingSupport(false)
    }
  }

  // Ajout d'un support
  const addSupport = async (result: SearchResult) => {
    const symbol = result.symbol
    
    // Vérifier si déjà présent
    if (supports.find(s => s.symbol === symbol)) {
      toast.warning("Ce support est déjà dans l'allocation")
      return
    }

    const toastId = toast.loading("Récupération des données...")

    try {
      const res = await fetch(`/api/yahoo/proxy?type=quote&query=${encodeURIComponent(symbol)}${!showIsin ? '&skipIsin=true' : ''}`)
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      const newSupport: Support = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: data.symbol,
        isin: data.isin,
        name: data.name,
        type: result.typeDisp || "Fonds",
        price: data.price,
        currency: data.currency,
        sri: data.sri,
        amount: 0,
        percentage: 0
      }

      setSupports(prev => [...prev, newSupport])
      // setSupportSearch("") // Conservé pour permettre d'ajouter plusieurs fois le même ou continuer la recherche
      // setSupportSearchResults([])
      toast.success("Support ajouté", { id: toastId })
    } catch (error) {
      console.error("Erreur ajout support", error)
      toast.error("Impossible de récupérer les détails du support", { id: toastId })
    }
  }

  // Mise à jour des montants
  const updateSupportAmount = (id: string, amount: number) => {
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    setSupports(prev => prev.map(s => s.id === id ? { ...s, amount, percentage } : s))
  }

  const updateSupportPercentage = (id: string, percentage: number) => {
    const amount = (percentage / 100) * totalAmount
    setSupports(prev => prev.map(s => s.id === id ? { ...s, percentage, amount } : s))
  }

  // Recalculer les montants si le total change
  useEffect(() => {
    setSupports(prev => prev.map(s => ({
      ...s,
      amount: (s.percentage / 100) * totalAmount
    })))
  }, [totalAmount])

  // Suppression
  const removeSupport = (id: string) => {
    setSupports(prev => prev.filter(s => s.id !== id))
  }

  // Calculs globaux
  const currentTotalAmount = supports.reduce((acc, s) => acc + s.amount, 0)
  const currentTotalPercentage = supports.reduce((acc, s) => acc + s.percentage, 0)
  
  const averageSRI = supports.length > 0
    ? supports.reduce((acc, s) => acc + (s.sri * (s.percentage / 100)), 0) / (currentTotalPercentage / 100 || 1)
    : 0

  const getAdequation = () => {
    if (!investorProfile || !RISK_PROFILE_MAP[investorProfile]) return null
    const target = RISK_PROFILE_MAP[investorProfile]
    const diff = averageSRI - target.maxSri

    if (averageSRI === 0) return { status: "neutre", text: "En attente", variant: "outline" as const }
    if (diff > 1) return { status: "danger", text: "Risqué", variant: "destructive" as const }
    if (diff > 0) return { status: "warning", text: "Élevé", variant: "default" as const, className: "bg-orange-500 hover:bg-orange-600" }
    if (diff < -2) return { status: "warning", text: "Prudent", variant: "secondary" as const }
    return { status: "success", text: "Adéquat", variant: "default" as const, className: "bg-green-600 hover:bg-green-700" }
  }

  const adequation = getAdequation()
  const filteredEnvelopes = ENVELOPES_DB.filter(e => 
    e.name.toLowerCase().includes(envelopeSearch.toLowerCase()) || 
    e.type.toLowerCase().includes(envelopeSearch.toLowerCase())
  )

  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/simulations">Simulations</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Allocation d'actifs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col p-4 pt-0 h-[calc(100vh-4rem)]">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border bg-background shadow-sm">
        
        {/* === GAUCHE : PARAMÈTRES === */}
        <ResizablePanel defaultSize={30} minSize={25} className="flex flex-col gap-4 p-4 overflow-hidden">
          
          {/* Données de l'allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Données de l'allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Montant total à investir</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={totalAmount} 
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Profil Investisseur</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={investorProfile ? "default" : "secondary"}>
                      {investorProfile || "Non défini"}
                    </Badge>
                    {investorProfile && RISK_PROFILE_MAP[investorProfile] && (
                      <span className="text-xs text-muted-foreground">
                        {RISK_PROFILE_MAP[investorProfile].maxSri}/7
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Adéquation</span>
                  <div className="flex items-center gap-2">
                    {adequation ? (
                      <Badge variant={adequation.variant} className={adequation.className}>
                        {adequation.text}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                       {averageSRI === 0 ? "0" : averageSRI.toFixed(2)}/7
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t flex items-center space-x-2">
                <Switch id="show-isin" checked={showIsin} onCheckedChange={setShowIsin} />
                <Label htmlFor="show-isin" className="text-xs text-muted-foreground cursor-pointer">
                  Afficher les codes ISIN
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Onglets Enveloppe / Supports */}
          <Card className="flex-1 flex flex-col min-h-0">

            <Tabs defaultValue="envelope" className="flex-1 flex flex-col">
              <div className="px-6 pt-6">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="envelope">1. Enveloppe</TabsTrigger>
                  <TabsTrigger value="supports">2. Supports</TabsTrigger>
                </TabsList>
              </div>

              {/* Onglet 1: Enveloppe */}
              <TabsContent value="envelope" className="flex-1 flex flex-col p-0 min-h-0 data-[state=inactive]:hidden">
                <div className="p-4 pb-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Rechercher une enveloppe (PEA, AV...)" 
                      className="pl-8"
                      value={envelopeSearch}
                      onChange={(e) => setEnvelopeSearch(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {filteredEnvelopes.map(env => (
                      <div 
                        key={env.id}
                        onClick={() => setSelectedEnvelope(env)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between group
                          ${selectedEnvelope?.id === env.id 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${selectedEnvelope?.id === env.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{env.name}</div>
                            <div className="text-xs text-muted-foreground">{env.type} {env.insurer ? `• ${env.insurer}` : ""}</div>
                          </div>
                        </div>
                        {selectedEnvelope?.id === env.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Onglet 2: Supports */}
              <TabsContent value="supports" className="flex-1 flex flex-col p-0 min-h-0 data-[state=inactive]:hidden">
                <div className="p-4 pb-2 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Rechercher un fonds, action, ETF..." 
                      className="pl-8 pr-8"
                      value={supportSearch}
                      onChange={(e) => setSupportSearch(e.target.value)}
                    />
                    {supportSearch && (
                      <button 
                        className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSupportSearch("");
                          setSupportSearchResults([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {isSearchingSupport ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Chargement...</div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {supportSearchResults.map((res, idx) => (
                        <div 
                          key={`${res.symbol}-${idx}`}
                          className="p-3 rounded-lg border hover:bg-muted transition-colors flex items-center justify-between cursor-pointer group"
                          onClick={() => addSupport(res)}
                        >
                          <div className="flex-1 overflow-hidden mr-2">
                            <div className="font-medium truncate">{res.longname || res.shortname || res.symbol}</div>
                            <div className="text-xs text-muted-foreground flex gap-2">
                              <span className="font-mono bg-muted px-1 rounded">{res.isin || res.symbol}</span>
                              <span>{res.typeDisp}</span>
                              <span>{res.exchDisp}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-muted-foreground hover:text-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://finance.yahoo.com/quote/${res.symbol}/`, '_blank');
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {supportSearch && supportSearchResults.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          Aucun résultat trouvé
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* === DROITE : RÉSULTATS === */}
          <ResizablePanel defaultSize={70} minSize={25} className="flex flex-col h-full p-4 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Résultats de l'allocation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-6">
              
              {/* Enveloppe sélectionnée */}
              {selectedEnvelope ? (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex justify-between items-center text-base">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-base">{selectedEnvelope.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedEnvelope.type} • Frais de gestion : {selectedEnvelope.fees}%
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEnvelope(null)}>Changer</Button>
                </div>
              ) : (
                <div className="border-dashed border-2 rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground text-center">
                  <Wallet className="h-10 w-10 mb-2 opacity-20" />
                  <p>Aucune enveloppe sélectionnée</p>
                  <p className="text-sm">Sélectionnez une enveloppe dans le volet de gauche</p>
                </div>
              )}

              {/* Liste des supports */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Allocation ({supports.length} supports)
                </h3>
                
                {supports.length === 0 ? (
                  <div className="bg-muted/30 rounded-lg p-8 text-center text-muted-foreground">
                    <p>Aucun support ajouté.</p>
                    <p className="text-sm">Recherchez et ajoutez des supports depuis l'onglet "Supports".</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* En-têtes */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-2">
                      <div className="col-span-4">SUPPORT</div>
                      <div className="col-span-2 text-center">PRIX</div>
                      <div className="col-span-2 text-center">MONTANT</div>
                      <div className="col-span-2 text-center">POIDS</div>
                      <div className="col-span-1 text-center">SRI</div>
                      <div className="col-span-1"></div>
                    </div>

                    {supports.map((support) => (
                      <div key={support.id} className="grid grid-cols-12 gap-2 items-center bg-card border rounded-md p-3 shadow-sm hover:shadow-md transition-shadow text-base">
                        
                        {/* Info Support (Nom) */}
                        <div className="col-span-4 min-w-0 flex items-center gap-2">
                          <div className="overflow-hidden">
                            <div className="font-medium text-base truncate" title={support.name}>{support.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{support.isin || support.symbol}</div>
                          </div>
                        </div>

                        {/* Prix */}
                        <div className="col-span-2 text-center text-base">
                          <div>{support.price.toFixed(2)} {support.currency}</div>
                        </div>

                        {/* Input Montant */}
                        <div className="col-span-2">
                          <div className="relative">
                            <Input 
                              type="number" 
                              className="h-9 text-center pr-6 text-base" 
                              value={Math.round(support.amount)}
                              onChange={(e) => updateSupportAmount(support.id, Number(e.target.value))}
                            />
                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">€</span>
                          </div>
                        </div>

                        {/* Input Pourcentage */}
                        <div className="col-span-2">
                          <div className="relative">
                            <Input 
                              type="number" 
                              className="h-9 text-center pr-6 text-base" 
                              value={Number(support.percentage.toFixed(2))}
                              onChange={(e) => updateSupportPercentage(support.id, Number(e.target.value))}
                              max={100}
                            />
                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">%</span>
                          </div>
                        </div>

                        {/* SRI */}
                        <div className="col-span-1 flex justify-center">
                          <Badge variant="outline" className={`
                            ${support.sri <= 2 ? 'bg-green-100 text-green-800 border-green-200' : 
                              support.sri <= 4 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                              'bg-red-100 text-red-800 border-red-200'}
                          `}>
                            {support.sri}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeSupport(support.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SidebarInset>
  )
}


