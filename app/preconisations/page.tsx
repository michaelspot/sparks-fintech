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
  
  // États pour l'export PDF
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfData, setPdfData] = useState<{pdf: string, filename: string} | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  
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

  // Fonction pour exporter vers Google Docs et générer le PDF
  const exportToPDF = async () => {
    setExportDialogOpen(true);
    setIsExporting(true);
    setExportError(null);
    setPdfData(null);
    
    try {
      // Utiliser les données du localStorage ou les données fallback
      const dataToUse = Object.keys(clientData).length > 0 ? clientData : fallbackData;
      
      // Récupérer les préconisations sélectionnées avec leurs priorités
      const selectedPreconisationsDetails = preconisations
        .filter(preco => selectedPreconisations.includes(preco.id))
        .map(preco => ({
          ...preco,
          priority: customPriorities[preco.id] || preco.priority
        }));
      
      // Préparer les variables pour le Google Docs
      const variables: Record<string, string> = {
        // Informations client de base
        titre_client: dataToUse.profile?.titre || "Monsieur/Madame",
        nom_client: dataToUse.profile?.nom || "Client",
        prenom_client: dataToUse.profile?.prenom || "",
        situation_professionnelle_client: dataToUse.profile?.profession || "Non spécifié",
        age_client: dataToUse.profile?.age ? `${dataToUse.profile.age} ans` : "Non spécifié",
        situation_matrimoniale_client: dataToUse.profile?.situationFamiliale || "Non spécifié",
        regime_matrimonial_client: dataToUse.profile?.regimeMatrimonial || "Non spécifié",
        
        // Informations fiscales
        tranche_imposition: dataToUse.fiscal?.trancheMarginaleImposition ? `${dataToUse.fiscal.trancheMarginaleImposition}%` : "Non spécifié",
        revenu_global: dataToUse.fiscal?.revenuGlobal ? `${dataToUse.fiscal.revenuGlobal.toLocaleString()} €` : "Non spécifié",
        
        // Informations patrimoniales
        valeur_residence_principale: dataToUse.patrimoine?.valeurResidencePrincipale ? `${dataToUse.patrimoine.valeurResidencePrincipale.toLocaleString()} €` : "Non spécifié",
        valeur_patrimoine_financier: dataToUse.patrimoine?.valeurPatrimoineFinancier ? `${dataToUse.patrimoine.valeurPatrimoineFinancier.toLocaleString()} €` : "Non spécifié",
        valeur_patrimoine_immobilier: dataToUse.patrimoine?.valeurPatrimoineImmobilier ? `${dataToUse.patrimoine.valeurPatrimoineImmobilier.toLocaleString()} €` : "Non spécifié",
        liquidites_disponibles: dataToUse.patrimoine?.liquiditesDisponibles ? `${dataToUse.patrimoine.liquiditesDisponibles.toLocaleString()} €` : "Non spécifié",
        
        // Nombre de préconisations
        nombre_preconisations: selectedPreconisationsDetails.length.toString(),
      };
      
      // Ajouter la date de l'étude
      variables['date_etude'] = new Date().toLocaleDateString('fr-FR');
      
      // Log des données client utilisées
      console.log('Données client utilisées:', dataToUse.profile);
      
      // Ajouter les préconisations individuellement
      selectedPreconisationsDetails.forEach((preco, index) => {
        const num = index + 1;
        variables[`preconisation_${num}_titre`] = preco.title;
        variables[`preconisation_${num}_description`] = preco.description;
        variables[`preconisation_${num}_priorite`] = preco.priority;
        variables[`preconisation_${num}_categorie`] = preco.category;
        variables[`preconisation_${num}_impact`] = preco.impact;
        
        // Avantages
        if (preco.advantages && preco.advantages.length > 0) {
          preco.advantages.forEach((adv, advIndex) => {
            variables[`preconisation_${num}_avantage_${advIndex + 1}`] = adv;
          });
        }
        
        // Inconvénients
        if (preco.disadvantages && preco.disadvantages.length > 0) {
          preco.disadvantages.forEach((disadv, disadvIndex) => {
            variables[`preconisation_${num}_inconvenient_${disadvIndex + 1}`] = disadv;
          });
        }
      });
      
      // Créer une section complète avec toutes les préconisations pour la variable {{preconisations_client}}
      let preconisationsClientText = '';
      
      selectedPreconisationsDetails.forEach((preco, index) => {
        // Ajouter un séparateur entre les préconisations
        if (index > 0) {
          preconisationsClientText += '\n\n---\n\n';
        }
        
        // Titre et description
        preconisationsClientText += `## ${index + 1}. ${preco.title}\n\n`;
        preconisationsClientText += `${preco.description}\n\n`;
        
        // Priorité, catégorie et impact
        preconisationsClientText += `**Priorité:** ${preco.priority}\n`;
        preconisationsClientText += `**Catégorie:** ${preco.category}\n`;
        preconisationsClientText += `**Impact:** ${preco.impact}\n\n`;
        
        // Avantages
        if (preco.advantages && preco.advantages.length > 0) {
          preconisationsClientText += `**Avantages:**\n`;
          preco.advantages.forEach((adv) => {
            preconisationsClientText += `- ${adv}\n`;
          });
          preconisationsClientText += '\n';
        }
        
        // Inconvénients
        if (preco.disadvantages && preco.disadvantages.length > 0) {
          preconisationsClientText += `**Inconvénients:**\n`;
          preco.disadvantages.forEach((disadv) => {
            preconisationsClientText += `- ${disadv}\n`;
          });
        }
      });
      
      // Ajouter la section complète des préconisations
      variables['preconisations_client'] = preconisationsClientText;
      
      // Utiliser les données réelles du client pour les revenus et charges
      // Récupérer les revenus et charges du client depuis la structure correcte
      const revenus = dataToUse.finances?.revenus || [];
      const charges = dataToUse.finances?.charges || [];
      
      console.log('Revenus utilisés:', revenus);
      console.log('Charges utilisées:', charges);
      
      // Définir les interfaces pour les revenus et charges
      interface FinancialItem {
        intitule?: string;
        montant?: number;
      }
      
      // Calculer les totaux
      const totalRevenus = revenus.reduce((sum: number, item: FinancialItem) => sum + (item.montant || 0), 0);
      const totalCharges = charges.reduce((sum: number, item: FinancialItem) => sum + (item.montant || 0), 0);
      
      // Ajouter les revenus aux variables
      revenus.forEach((revenu: FinancialItem, index: number) => {
        if (index < 10) { // Limiter à 10 entrées
          variables[`intitule_revenu${index + 1}`] = revenu.intitule || '';
          variables[`montant_revenu${index + 1}`] = revenu.montant ? `${revenu.montant.toLocaleString()} €` : '';
        }
      });
      
      // Ajouter les charges aux variables
      charges.forEach((charge: FinancialItem, index: number) => {
        if (index < 10) { // Limiter à 10 entrées
          variables[`intitule_charge${index + 1}`] = charge.intitule || '';
          variables[`montant_charge${index + 1}`] = charge.montant ? `${charge.montant.toLocaleString()} €` : '';
        }
      });
      
      // Ajouter les totaux
      variables['montant_total__revenus'] = `${totalRevenus.toLocaleString()} €`;
      variables['montant_total__charges'] = `${totalCharges.toLocaleString()} €`;
      
      // Vider les variables non utilisées (pour les tableaux)
      for (let i = 1; i <= 10; i++) {
        if (!variables[`intitule_revenu${i}`]) {
          variables[`intitule_revenu${i}`] = "";
          variables[`montant_revenu${i}`] = "";
        }
        if (!variables[`intitule_charge${i}`]) {
          variables[`intitule_charge${i}`] = "";
          variables[`montant_charge${i}`] = "";
        }
      }
      
      // Appel à l'API Google Apps Script directement
      // URL de votre Apps Script déployé
      const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwquTkwi6vWR4CLQtltQpeKv90SEFj-hHvtsFJ9xmkSBlm_6TzOcfAHBIPu1Xc7lYTUuw/exec';
      
      console.log('Données envoyées au script:', { variables });
      console.log('Tentative de fetch direct vers:', APPS_SCRIPT_URL);
      
      // Solution basée sur le forum Reddit: utiliser Content-Type text/plain
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',  // Important pour éviter les requêtes preflight CORS
        },
        body: JSON.stringify({ variables }),
      });
      
      console.log('Réponse du serveur:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Résultat parsé:', result);
      
      if (result.success) {
        setPdfData({
          pdf: result.pdf,
          filename: result.filename
        });
      } else {
        setExportError(result.error || 'Erreur lors de la génération du PDF');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setExportError(`Erreur de connexion: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Fonction pour télécharger le PDF
  const downloadPDF = () => {
    if (!pdfData) return;
    
    const byteCharacters = atob(pdfData.pdf);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdfData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Fermer le dialog après téléchargement
    setExportDialogOpen(false);
    setPdfData(null);
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
          <Button variant="outline" onClick={exportToPDF}>
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
        
        {/* Dialog d'export PDF */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Export de l'étude patrimoniale</DialogTitle>
              <DialogDescription>
                Génération du document PDF personnalisé avec vos préconisations sélectionnées
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {isExporting && (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="h-12 w-12 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">Génération en cours...</h3>
                  <p className="text-center text-muted-foreground">
                    Traitement des données et création du document PDF personnalisé
                  </p>
                </div>
              )}
              
              {exportError && (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <X className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-red-600">Erreur lors de l'export</h3>
                  <p className="text-center text-muted-foreground mb-4">{exportError}</p>
                  <Button onClick={() => setExportDialogOpen(false)} variant="outline">
                    Fermer
                  </Button>
                </div>
              )}
              
              {pdfData && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                      <Check className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-green-600">Document généré avec succès</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      Votre étude patrimoniale personnalisée est prête à être téléchargée
                    </p>
                  </div>
                  
                  {/* Résumé des préconisations incluses */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Préconisations incluses dans le document :</h4>
                    <div className="space-y-2">
                      {preconisations
                        .filter(preco => selectedPreconisations.includes(preco.id))
                        .map(preco => (
                          <div key={preco.id} className="flex items-center justify-between text-sm">
                            <span>{preco.title}</span>
                            <Badge className={`text-xs ${getPriorityColor(customPriorities[preco.id] || preco.priority)}`}>
                              {customPriorities[preco.id] || preco.priority}
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => setExportDialogOpen(false)} variant="outline">
                      Fermer
                    </Button>
                    <Button onClick={downloadPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger le PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
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
