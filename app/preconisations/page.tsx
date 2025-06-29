"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useClientData } from "@/lib/use-client-data"
import { ClientData } from "@/lib/condition-evaluator"
import { filterApplicablePreconisations } from "@/lib/condition-evaluator"
import { preconisations, Preconisation } from "@/lib/preconisations"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Lightbulb, FileText, Download, Volume2, TrendingUp, Shield, PiggyBank, Users, Gift, HeartHandshake, Check, ShoppingCart, X } from "lucide-react"

export default function RecommendationsPage() {
  // Utilisation du hook pour récupérer les données du client depuis le localStorage
  const { clientData, isLoading } = useClientData();
  
  // Données fallback pour le développement si localStorage est vide
  const fallbackData: ClientData = {
    profile: {
      age: 45,
      situationFamiliale: "Marié",
      regimeMatrimonial: "Communauté légale",
      profession: "Cadre"
    },
    fiscal: {
      trancheMarginaleImposition: 30,
      revenuGlobal: 85000
    },
    patrimoine: {
      valeurResidencePrincipale: 450000,
      valeurPatrimoineFinancier: 120000,
      valeurPatrimoineImmobilier: 200000,
      liquiditesDisponibles: 50000
    },
    famille: {
      enfantsACharge: 2
    }
  }

  // État pour stocker les préconisations filtrées
  const [filteredRecommendations, setFilteredRecommendations] = useState(preconisations)
  
  // État pour la préconisation sélectionnée pour afficher les détails
  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null)
  
  // État pour contrôler l'ouverture/fermeture du dialogue de détails
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // État pour stocker les préconisations ajoutées au panier
  const [selectedPreconisations, setSelectedPreconisations] = useState<number[]>([])
  
  // État pour stocker les priorités personnalisées
  const [customPriorities, setCustomPriorities] = useState<Record<number, "Haute" | "Moyenne" | "Basse">>({});
  
  // Local storage keys
  const LOCAL_STORAGE_KEY_SELECTED = "selectedPreconisations"
  const LOCAL_STORAGE_KEY_PRIORITIES = "customPriorities"

  // Fonction pour ajouter ou supprimer une préconisation du panier
  const toggleSelectedPreconisation = (id: number) => {
    setSelectedPreconisations(prev => {
      if (prev.includes(id)) {
        return prev.filter(precoId => precoId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Fonction pour changer la priorité d'une préconisation
  const togglePriority = (id: number) => {
    const preco = preconisations.find(p => p.id === id);
    if (!preco) return;
    
    // Déterminer la priorité actuelle (personnalisée ou par défaut)
    const currentPriority = customPriorities[id] || preco.priority;
    
    // Définir la prochaine priorité dans le cycle (Basse -> Moyenne -> Haute -> Basse)
    let nextPriority: "Haute" | "Moyenne" | "Basse";
    switch (currentPriority) {
      case "Basse":
        nextPriority = "Moyenne";
        break;
      case "Moyenne":
        nextPriority = "Haute";
        break;
      case "Haute":
        nextPriority = "Basse";
        break;
      default:
        nextPriority = "Moyenne";
    }
    
    // Mettre à jour l'état des priorités personnalisées
    setCustomPriorities(prev => ({
      ...prev,
      [id]: nextPriority
    }));
  };
  
  // Charger les préconisations sélectionnées et les priorités personnalisées depuis localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Charger les préconisations sélectionnées
      const savedSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED);
      if (savedSelection) {
        try {
          const parsedSelection = JSON.parse(savedSelection);
          setSelectedPreconisations(parsedSelection);
        } catch (error) {
          console.error('Erreur lors du chargement des préconisations sélectionnées:', error);
        }
      }
      
      // Charger les priorités personnalisées
      const savedPriorities = localStorage.getItem(LOCAL_STORAGE_KEY_PRIORITIES);
      if (savedPriorities) {
        try {
          const parsedPriorities = JSON.parse(savedPriorities);
          setCustomPriorities(parsedPriorities);
        } catch (error) {
          console.error('Erreur lors du chargement des priorités personnalisées:', error);
        }
      }
    }
  }, []);

  // Sauvegarder les préconisations sélectionnées dans localStorage quand elles changent
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED, JSON.stringify(selectedPreconisations));
    }
  }, [selectedPreconisations]);
  
  // Sauvegarder les priorités personnalisées dans localStorage quand elles changent
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY_PRIORITIES, JSON.stringify(customPriorities));
    }
  }, [customPriorities]);

  // Filtre les préconisations en fonction des données du client
  useEffect(() => {
    // Utiliser les données du localStorage ou les données fallback si rien n'est disponible
    const dataToUse = Object.keys(clientData).length > 0 ? clientData : fallbackData;
    const applicable = filterApplicablePreconisations(preconisations, dataToUse)
    setFilteredRecommendations(applicable)
  }, [clientData])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Moyenne":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Basse":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
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
              <BreadcrumbItem>
                <BreadcrumbPage>Préconisations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Panier de préconisations sélectionnées - sticky */}
        <div className="sticky top-0 z-10 pt-2 pb-1 bg-background/80 dark:bg-background/90 backdrop-blur-sm">
          <Card className="border-2 border-blue-500/80 dark:border-blue-700/80 shadow-md bg-background/80 dark:bg-background/90">
            <CardHeader className="py-2 pb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  <h3 className="text-base font-medium">Préconisations sélectionnées {selectedPreconisations.length > 0 && `(${selectedPreconisations.length})`}</h3>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              {selectedPreconisations.length > 0 ? (
                <div className="flex flex-wrap gap-2 min-h-[60px] max-h-[240px] overflow-y-auto pr-1">
                  {preconisations
                    .filter(preco => selectedPreconisations.includes(preco.id))
                    // Tri par priorité : Haute > Moyenne > Basse
                    .sort((a, b) => {
                      const priorityOrder = { "Haute": 1, "Moyenne": 2, "Basse": 3 };
                      const priorityA = customPriorities[a.id] || a.priority;
                      const priorityB = customPriorities[b.id] || b.priority;
                      return priorityOrder[priorityA] - priorityOrder[priorityB];
                    })
                    .map(preco => (
                      <div key={`selected-${preco.id}`} className="group relative inline-flex border rounded-lg bg-card shadow-sm hover:shadow transition-shadow">
                        <button
                          onClick={() => toggleSelectedPreconisation(preco.id)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900 z-10"
                          aria-label="Retirer la préconisation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="p-2 pr-6 flex items-center justify-center w-full h-full" data-component-name="RecommendationsPage">
                          <span className="font-medium text-sm">{preco.title}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center min-h-[60px]">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="text-sm font-medium">Aucune préconisation sélectionnée</h3>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <CardTitle>Analyse Patrimoniale Personnalisée</CardTitle>
            </div>
            <CardDescription>
              Basée sur vos informations financières et patrimoniales, voici nos recommandations pour optimiser votre
              situation.
            </CardDescription>
          </CardHeader>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="h-12 w-12 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Chargement des préconisations</h3>
              <p className="text-center text-muted-foreground">
                Analyse de votre situation patrimoniale en cours...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((rec) => (
                <Card key={rec.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${rec.color}`}>
                          {rec.icon && <rec.icon className="h-5 w-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{rec.category}</Badge>
                            <div 
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-none select-none ${getPriorityColor(customPriorities[rec.id] || rec.priority)}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                togglePriority(rec.id);
                              }}
                              style={{
                                cursor: 'pointer',
                                pointerEvents: 'auto',
                                WebkitTapHighlightColor: 'transparent',
                              }}
                            >
                              Priorité {customPriorities[rec.id] || rec.priority}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{rec.impact}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{rec.description}</p>
                    <div className="flex justify-end space-x-2">
                      <Dialog open={dialogOpen && selectedRecommendation === rec.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) setSelectedRecommendation(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRecommendation(rec.id)}
                          >
                            Plus de détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{rec.title}</DialogTitle>
                            <DialogDescription>{rec.description}</DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="avantages">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="avantages">Avantages</TabsTrigger>
                              <TabsTrigger value="inconvenients">Inconvénients</TabsTrigger>
                            </TabsList>
                            <TabsContent value="avantages" className="mt-4 space-y-2">
                              {rec.advantages?.length ? (
                                <ul className="list-disc pl-5 space-y-2">
                                  {rec.advantages.map((advantage, idx) => (
                                    <li key={idx}>{advantage}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground">Aucun avantage spécifié</p>
                              )}
                            </TabsContent>
                            <TabsContent value="inconvenients" className="mt-4 space-y-2">
                              {rec.disadvantages?.length ? (
                                <ul className="list-disc pl-5 space-y-2">
                                  {rec.disadvantages.map((disadvantage, idx) => (
                                    <li key={idx}>{disadvantage}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground">Aucun inconvénient spécifié</p>
                              )}
                            </TabsContent>
                          </Tabs>
                          
                          <div className="flex justify-end mt-6">
                            <Button>
                              Appliquer cette préconisation
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant={selectedPreconisations.includes(rec.id) ? "secondary" : "default"}
                        className={selectedPreconisations.includes(rec.id) ? "gap-2" : ""}
                        onClick={() => toggleSelectedPreconisation(rec.id)}
                      >
                        {selectedPreconisations.includes(rec.id) ? (
                          <>
                            <Check className="w-4 h-4" />
                            Ajoutée au rapport
                          </>
                        ) : "Ajouter au rapport"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <h3 className="text-lg font-medium mb-2">Aucune préconisation disponible</h3>
                  <p className="text-center text-muted-foreground">
                    Veuillez vérifier vos informations patrimoniales et réessayer.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actions Recommandées</CardTitle>
            <CardDescription>Étapes suivantes pour optimiser votre patrimoine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Prendre rendez-vous avec votre conseiller</h4>
                  <p className="text-sm text-muted-foreground">
                    Discuter des recommandations prioritaires et planifier leur mise en œuvre
                  </p>
                </div>
                <Button size="sm">Planifier</Button>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Mettre à jour vos informations</h4>
                  <p className="text-sm text-muted-foreground">
                    Actualiser vos données patrimoniales pour des recommandations plus précises
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Mettre à jour
                </Button>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Effectuer un suivi régulier</h4>
                  <p className="text-sm text-muted-foreground">
                    Programmer des révisions trimestrielles de votre stratégie patrimoniale
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Programmer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Assistant Vocal IA
            </CardTitle>
            <CardDescription>
              Obtenez une explication détaillée de vos préconisations en langage naturel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Notre IA peut vous expliquer chaque recommandation de manière personnalisée et répondre à vos
                  questions.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Assistant vocal disponible
                </div>
              </div>
              <Button size="lg">
                <Volume2 className="w-4 h-4 mr-2" />
                Démarrer l'explication
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
