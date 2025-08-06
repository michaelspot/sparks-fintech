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
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Spinner } from "@/components/ui/spinner"
import { Lightbulb, FileText, Download, TrendingUp, Shield, PiggyBank, Users, Gift, HeartHandshake, Check, Eye, EyeOff, Calculator, BarChart3, Clock, CreditCard, Home } from "lucide-react"
import { exportToPDF as exportToPDFExternal } from "@/lib/pdf-export"

// Interface pour les props du composant FinalizationStep
interface FinalizationStepProps {
  selectedPreconisations: number[];
  filteredRecommendations: Preconisation[];
  customPriorities: Record<number, "Haute" | "Moyenne" | "Basse">;
  exportToPDFRapide: () => void;
  isExportingFast: boolean;
  setCurrentStep: (step: 'selection' | 'finalization') => void;
}

// État pour gérer la sélection des sections du plan d'étude
interface StudyPlanSection {
  id: string;
  title: string;
  description: string;
  included: boolean;
}

// Interface pour les simulations disponibles
interface SimulationItem {
  id: string;
  title: string;
  description: string;
  type: 'fiscalite' | 'investissement' | 'retraite' | 'emprunt' | 'transmission';
  status: 'disponible' | 'calculee' | 'non_calculee';
  included: boolean;
  lastCalculated?: Date;
  resultSummary?: string;
}

// Composant pour l'étape de finalisation
function FinalizationStep({ selectedPreconisations, filteredRecommendations, customPriorities, exportToPDFRapide, isExportingFast, setCurrentStep }: FinalizationStepProps) {
  // État pour gérer la sélection des sections du plan d'étude
  const [studyPlanSections, setStudyPlanSections] = useState<StudyPlanSection[]>([
    {
      id: 'informations-client',
      title: 'Informations Client',
      description: 'État civil, coordonnées et situation personnelle',
      included: true
    },
    {
      id: 'informations-conjoint',
      title: 'Informations Conjoint',
      description: 'Données du conjoint et situation familiale',
      included: true
    },
    {
      id: 'situation-familiale',
      title: 'Situation Familiale',
      description: 'Régime matrimonial, enfants et liens familiaux',
      included: true
    },
    {
      id: 'situation-professionnelle',
      title: 'Situation Professionnelle',
      description: 'Activité, revenus et évolution de carrière',
      included: true
    },
    {
      id: 'situation-patrimoniale',
      title: 'Situation Patrimoniale',
      description: 'Bilan détaillé des actifs et passifs',
      included: true
    },
    {
      id: 'analyse-revenus-charges',
      title: 'Analyse Revenus et Charges',
      description: 'Flux financiers et capacité d\'épargne',
      included: true
    },
    {
      id: 'objectifs-patrimoniaux',
      title: 'Objectifs Patrimoniaux',
      description: 'Projets et stratégie patrimoniale',
      included: true
    },
    {
      id: 'preconisations-patrimoniales',
      title: 'Préconisations Patrimoniales',
      description: 'Recommandations personnalisées sélectionnées',
      included: true
    },
    {
      id: 'planning-mise-oeuvre',
      title: 'Planning de Mise en Œuvre',
      description: 'Échéancier et étapes de réalisation',
      included: true
    },
    {
      id: 'annexes-documents',
      title: 'Annexes et Documents',
      description: 'Pièces justificatives et références',
      included: false
    }
  ]);

  // État pour gérer les simulations disponibles
  const [availableSimulations, setAvailableSimulations] = useState<SimulationItem[]>([
    {
      id: 'simulation-fiscale',
      title: 'Optimisation Fiscale',
      description: 'Calculs d\'optimisation de l\'imposition et des niches fiscales',
      type: 'fiscalite',
      status: 'calculee',
      included: false,
      lastCalculated: new Date(),
      resultSummary: 'Économie fiscale potentielle : 2 400€/an'
    },
    {
      id: 'simulation-investissement',
      title: 'Projection d\'Investissement',
      description: 'Simulation de rendements et scénarios d\'investissement',
      type: 'investissement',
      status: 'calculee',
      included: false,
      lastCalculated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      resultSummary: 'Rendement projeté : 6,2%/an sur 15 ans'
    },
    {
      id: 'simulation-retraite',
      title: 'Projection Retraite',
      description: 'Estimation des revenus et besoins à la retraite',
      type: 'retraite',
      status: 'calculee',
      included: false,
      lastCalculated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      resultSummary: 'Besoin complément retraite : 1 200€/mois'
    },
    {
      id: 'simulation-emprunt',
      title: 'Capacité d\'Emprunt',
      description: 'Analyse de la capacité d\'endettement et optimisation crédit',
      type: 'emprunt',
      status: 'disponible',
      included: false
    },
    {
      id: 'simulation-transmission',
      title: 'Transmission Patrimoniale',
      description: 'Simulation des droits de succession et stratégies de transmission',
      type: 'transmission',
      status: 'non_calculee',
      included: false
    }
  ]);

  // Fonction pour basculer l'inclusion d'une section
  const toggleSectionInclusion = (sectionId: string) => {
    setStudyPlanSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, included: !section.included }
          : section
      )
    );
  };

  // Fonction pour basculer l'inclusion d'une simulation
  const toggleSimulationInclusion = (simulationId: string) => {
    setAvailableSimulations(prev => 
      prev.map(simulation => 
        simulation.id === simulationId 
          ? { ...simulation, included: !simulation.included }
          : simulation
      )
    );
  };

  // Obtenir les préconisations sélectionnées
  const selectedRecommendations = filteredRecommendations.filter(rec => 
    selectedPreconisations.includes(rec.id)
  );

  // Fonction utilitaire pour obtenir la couleur de priorité
  const getPriorityColor = (priority: "Haute" | "Moyenne" | "Basse") => {
    switch (priority) {
      case "Haute": return "text-red-600 bg-red-50 border-red-200";
      case "Moyenne": return "text-orange-600 bg-orange-50 border-orange-200";
      case "Basse": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <>
      {/* Header avec progress bar intégrée */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">✓</div>
              <span className="text-green-600">Sélection</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded-full mx-4 max-w-32">
              <div className="h-full bg-blue-600 rounded-full" style={{width: '100%'}}></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <span className="font-medium text-blue-600">Finalisation</span>
            </div>
          </div>

        </div>
      </div>



      {/* Plan de l'étude */}
      <Card>
        <CardHeader>
          <CardTitle>
            Plan de l'étude
          </CardTitle>
          <CardDescription>
            Sélectionnez les sections que vous souhaitez inclure dans votre rapport final.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studyPlanSections.map((section) => (
              <div 
                key={section.id} 
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  section.included ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
                onClick={() => toggleSectionInclusion(section.id)}
              >
                <div className="flex-shrink-0">
                  {section.included ? (
                    <Eye className="h-5 w-5 text-blue-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    section.included ? 'text-blue-900' : 'text-gray-600'
                  }`}>
                    {section.title}
                  </h4>
                  <p className={`text-sm ${
                    section.included ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {section.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-4 h-4 rounded border-2 ${
                    section.included 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300'
                  }`}>
                    {section.included && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Sections incluses :</strong> {studyPlanSections.filter(s => s.included).length} sur {studyPlanSections.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Simulateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-600" />
            Simulateurs
          </CardTitle>
          <CardDescription>
            Sélectionnez les calculs et simulations à intégrer dans votre rapport d'analyse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableSimulations.map((simulation) => {
              const getSimulationIcon = (type: string) => {
                switch (type) {
                  case 'fiscalite': return Shield;
                  case 'investissement': return BarChart3;
                  case 'retraite': return Clock;
                  case 'emprunt': return CreditCard;
                  case 'transmission': return Home;
                  default: return Calculator;
                }
              };
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'calculee': return 'text-green-600 bg-green-50 border-green-200';
                  case 'disponible': return 'text-blue-600 bg-blue-50 border-blue-200';
                  case 'non_calculee': return 'text-gray-600 bg-gray-50 border-gray-200';
                  default: return 'text-gray-600 bg-gray-50 border-gray-200';
                }
              };
              
              const getStatusText = (status: string) => {
                switch (status) {
                  case 'calculee': return 'Calculée';
                  case 'disponible': return 'Disponible';
                  case 'non_calculee': return 'Non calculée';
                  default: return 'Inconnue';
                }
              };
              
              const SimulationIcon = getSimulationIcon(simulation.type);
              
              return (
                <div 
                  key={simulation.id} 
                  className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    simulation.included ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => toggleSimulationInclusion(simulation.id)}
                >
                  <div className="flex-shrink-0">
                    <SimulationIcon className={`h-5 w-5 ${
                      simulation.included ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        simulation.included ? 'text-purple-900' : 'text-gray-600'
                      }`}>
                        {simulation.title}
                      </h4>
                      <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        getStatusColor(simulation.status)
                      }`}>
                        {getStatusText(simulation.status)}
                      </div>
                    </div>
                    <p className={`text-sm ${
                      simulation.included ? 'text-purple-700' : 'text-gray-500'
                    }`}>
                      {simulation.description}
                    </p>
                    {simulation.resultSummary && simulation.status === 'calculee' && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        🏆 {simulation.resultSummary}
                      </p>
                    )}
                    {simulation.lastCalculated && simulation.status === 'calculee' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Dernière mise à jour : {simulation.lastCalculated.toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded border-2 ${
                      simulation.included 
                        ? 'bg-purple-600 border-purple-600' 
                        : 'border-gray-300'
                    }`}>
                      {simulation.included && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              <strong>Simulations incluses :</strong> {availableSimulations.filter(s => s.included).length} sur {availableSimulations.length}
            </p>
            {availableSimulations.filter(s => s.included && s.status !== 'calculee').length > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Certaines simulations sélectionnées n'ont pas encore été calculées.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Boutons de navigation en bas */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4 mt-8">
        <div className="flex justify-center gap-4">
          <Button 
            size="lg"
            variant="outline" 
            onClick={() => setCurrentStep('selection')}
            className="px-8 py-3 text-lg"
          >
            ← Précédent
          </Button>
          <Button 
            size="lg"
            variant="default" 
            onClick={exportToPDFRapide}
            disabled={isExportingFast || selectedPreconisations.length === 0}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
          >
            {isExportingFast ? (
              <>
                <Spinner className="mr-2 h-5 w-5" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Exporter l'analyse en PDF
              </>
            )}
          </Button>
        </div>
        {selectedPreconisations.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Retournez à l'étape précédente pour sélectionner des préconisations
          </p>
        )}
      </div>
    </>
  );
}

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
  const [isExportingFast, setIsExportingFast] = useState(false);
  const [pdfData, setPdfData] = useState<{pdf: string, filename: string} | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  
  // État pour la navigation entre les étapes
  const [currentStep, setCurrentStep] = useState<'selection' | 'finalization'>('selection');
  
  // Local storage keys
  const LOCAL_STORAGE_KEY_SELECTED = "selectedPreconisations"
  const LOCAL_STORAGE_KEY_PRIORITIES = "customPriorities"

  // Fonction utilitaire pour obtenir la couleur de pastille selon la priorité
  const getPriorityDotColor = (priority: "Haute" | "Moyenne" | "Basse") => {
    switch (priority) {
      case "Haute": return "bg-red-500"
      case "Moyenne": return "bg-orange-500"
      case "Basse": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

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
    setIsExporting(true);
    setExportError(null);
    setPdfData(null);
    setExportProgress(0);
    
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
      
      // Interface pour les données client
      interface ClientData {
        // Informations de base
        title?: string;
        firstName?: string;
        lastName?: string;
        birthName?: string;
        age?: string | number;
        
        // Informations du conjoint
        spouseTitle?: string;
        spouseFirstName?: string;
        spouseLastName?: string;
        spouseBirthName?: string;
        spouseAge?: string | number;
        
        // Situation familiale
        maritalStatus?: string;
        marriageDate?: string;
        marriagePlace?: string;
        matrimonialRegime?: string;
        
        // Informations professionnelles
        profession?: string;
        spouseProfession?: string;
        company?: string;
        spouseCompany?: string;
        
        // Informations personnelles
        birthDate?: string;
        city?: string;
        birthPostalCode?: string;
        nationality?: string;
        
        // Informations du conjoint
        spouseBirthDate?: string;
        spouseCity?: string;
        spouseBirthPostalCode?: string;
        spouseNationality?: string;
        
        // Enfants
        children?: any[];
      }
      
      // Récupérer les données client depuis le localStorage avec la clé 'identityPersonalInfo'
      let clientInfo: ClientData = {};
      try {
        const identityDataStr = localStorage.getItem('identityPersonalInfo');
        if (identityDataStr) {
          clientInfo = JSON.parse(identityDataStr);
          console.log('🔍 Données identité trouvées dans le localStorage:', clientInfo);
          console.log('🔍 Title:', clientInfo.title);
          console.log('🔍 SpouseTitle:', clientInfo.spouseTitle);
        } else {
          console.warn('Aucune donnée identité trouvée dans le localStorage avec la clé identityPersonalInfo');
        }
      } catch (error) {
        console.error('Erreur lors de la lecture des données identité:', error);
      }

      // Fonction utilitaire pour formater les dates au format jj/mm/aaaa
      const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('fr-FR');
      };

      // Fonction utilitaire pour formater les titres
      const formatTitle = (title: string): string => {
        if (!title) return '';
        return title === 'monsieur' ? 'Monsieur' : title === 'madame' ? 'Madame' : title;
      };

      // Fonction utilitaire pour formater les villes (première lettre majuscule)
      const formatCity = (city: string): string => {
        if (!city) return '';
        return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      };

      // Fonction utilitaire pour obtenir le libellé CSP
      const getCspLabel = (cspValue: string): string => {
        if (!cspValue) return '';
        const cspOptions = [
          { value: "11", label: "Agriculteurs sur petite exploitation" },
          { value: "12", label: "Agriculteurs sur moyenne exploitation" },
          { value: "13", label: "Agriculteurs sur grande exploitation" },
          { value: "21", label: "Artisans" },
          { value: "22", label: "Commerçants et assimilés" },
          { value: "23", label: "Chefs d'entreprise de 10 salariés ou plus" },
          { value: "31", label: "Professions libérales" },
          { value: "33", label: "Cadres de la fonction publique" },
          { value: "34", label: "Professeurs, professions scientifiques" },
          { value: "35", label: "Professions de l'information, des arts et des spectacles" },
          { value: "37", label: "Cadres administratifs et commerciaux d'entreprise" },
          { value: "38", label: "Ingénieurs et cadres techniques d'entreprise" },
          { value: "42", label: "Professeurs des écoles, instituteurs et assimilés" },
          { value: "43", label: "Professions intermédiaires de la santé et du travail social" },
          { value: "44", label: "Clergé, religieux" },
          { value: "45", label: "Professions intermédiaires administratives de la fonction publique" },
          { value: "46", label: "Professions intermédiaires administratives et commerciales des entreprises" },
          { value: "47", label: "Techniciens" },
          { value: "48", label: "Contremaîtres, agents de maîtrise" },
          { value: "52", label: "Employés civils et agents de service de la fonction publique" },
          { value: "53", label: "Policiers et militaires" },
          { value: "54", label: "Employés administratifs d'entreprise" },
          { value: "55", label: "Employés de commerce" },
          { value: "56", label: "Personnels des services directs aux particuliers" },
          { value: "62", label: "Ouvriers qualifiés de type industriel" },
          { value: "63", label: "Ouvriers qualifiés de type artisanal" },
          { value: "64", label: "Chauffeurs" },
          { value: "65", label: "Ouvriers qualifiés de la manutention, du magasinage et du transport" },
          { value: "67", label: "Ouvriers non qualifiés de type industriel" },
          { value: "68", label: "Ouvriers non qualifiés de type artisanal" },
          { value: "69", label: "Ouvriers agricoles" },
          { value: "71", label: "Anciens agriculteurs exploitants" },
          { value: "72", label: "Anciens artisans, commerçants, chefs d'entreprise" },
          { value: "74", label: "Anciens cadres" },
          { value: "75", label: "Anciennes professions intermédiaires" },
          { value: "77", label: "Anciens employés" },
          { value: "78", label: "Anciens ouvriers" },
          { value: "81", label: "Chômeurs n'ayant jamais travaillé" },
          { value: "83", label: "Militaires du contingent" },
          { value: "84", label: "Elèves, étudiants" },
          { value: "85", label: "Personnes diverses sans activité professionnelle de moins de 60 ans" },
          { value: "86", label: "Personnes diverses sans activité professionnelle de 60 ans et plus" }
        ];
        const option = cspOptions.find(opt => opt.value === cspValue);
        return option ? option.label : cspValue;
      };

      // Fonction utilitaire pour obtenir le libellé du statut marital accordé selon le genre
      const getMaritalStatusLabel = (status: string, title: string): string => {
        if (!status) return '';
        const isFeminine = title === 'madame' || title === 'Madame';
        
        const statusMap: { [key: string]: string } = {
          'marie': isFeminine ? 'Mariée' : 'Marié',
          'celibataire': 'Célibataire',
          'divorce': isFeminine ? 'Divorcée' : 'Divorcé',
          'veuf': isFeminine ? 'Veuve' : 'Veuf',
          'pacs': isFeminine ? 'Pacsée' : 'Pacsé'
        };
        return statusMap[status] || status;
      };

      // Fonction utilitaire pour appliquer les préfixes de formatage
      // 📝 GUIDE DES PRÉFIXES DISPONIBLES DANS GOOGLE DOCS :
      // {{M-variable}} = Majuscule au début (ex: "monsieur" → "Monsieur")
      // {{mm-variable}} = tout en minuscule (ex: "MONSIEUR" → "monsieur")
      // {{MM-variable}} = tout en majuscule (ex: "monsieur" → "MONSIEUR")
      // {{eu-variable}} = format euros arrondi (ex: "1000" → "1 000 €")
      // {{%-variable}} = format pourcentage (ex: "15" → "15%")
      // {{block-variable}} = bloc conditionnel (sera géré séparément)
      const applyFormatPrefix = (value: string, prefix: string): string => {
        if (!value || value === '') return '';
        
        switch (prefix) {
          case 'M': // Majuscule au début
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
          case 'mm': // tout minuscule
            return value.toLowerCase();
          case 'MM': // tout majuscule
            return value.toUpperCase();
          case 'eu': // format euros arrondi à l'entier au dessus
            const euValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(euValue) ? value : `${Math.ceil(euValue).toLocaleString('fr-FR')} €`;
          case '%': // format pourcentage
            const pctValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(pctValue) ? value : `${Math.round(pctValue)}%`;
          // Anciens préfixes conservés pour compatibilité
          case 'cap': // Première lettre de chaque mot en majuscule
            return value.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
          case 'pct': // ancien format pourcentage avec espace
            const oldPctValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(oldPctValue) ? value : `${Math.round(oldPctValue)} %`;
          case 'nb': // format nombre avec espaces
            const nbValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(nbValue) ? value : nbValue.toLocaleString('fr-FR');
          case 'k': // format milliers
            const kValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(kValue) ? value : kValue >= 1000 ? `${Math.round(kValue/1000)}k` : kValue.toString();
          case 'ord': // format ordinal
            const ordValue = parseInt(value.replace(/[^0-9]/g, ''));
            if (isNaN(ordValue)) return value;
            if (ordValue === 1) return '1er';
            return `${ordValue}ème`;
          default:
            return value;
        }
      };

      // Fonction pour générer toutes les variantes d'une variable avec préfixes
      const generateVariableVariants = (key: string, value: string): Record<string, string> => {
        const variants: Record<string, string> = {};
        // Nouveaux préfixes selon les spécifications utilisateur + anciens pour compatibilité
        const prefixes = ['M', 'mm', 'MM', 'eu', '%', 'cap', 'pct', 'nb', 'k', 'ord'];
        
        // Variable de base
        variants[key] = value;
        
        // Variantes avec préfixes
        prefixes.forEach(prefix => {
          variants[`${prefix}-${key}`] = applyFormatPrefix(value, prefix);
        });
        
        return variants;
      };

      // 🎯 FONCTION DE RENDU CONDITIONNEL POUR GOOGLE DOCS
      // Syntaxe : {{'texte fixe' & {{variable}} & 'autre texte'}}
      // Si la variable a une valeur → affiche tout le bloc
      // Si la variable est vide/null → n'affiche rien du tout
      // 
      // Exemples d'utilisation :
      // {{'Vous avez ' & {{nbChildren}} & ' enfants à charge :'}} 
      // {{'(' & {{matrimonialRegime}} & ')'}}
      // {{'Né(e) le ' & {{birthDate}} & ' à ' & {{city}}}}
      const generateConditionalBlocks = (baseVariables: Record<string, string>, clientInfo: any): Record<string, string> => {
        const conditionalBlocks: Record<string, string> = {};
        
        // Fonction utilitaire pour calculer l'âge à partir de la date de naissance
        const calculateAgeFromBirthDate = (birthDate: string): string => {
          if (!birthDate) return 'Age non spécifié';
          
          try {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            
            return age.toString();
          } catch (error) {
            return 'Age non spécifié';
          }
        };
        
        // Bloc conditionnel pour les enfants - VERSION DÉTAILLÉE
        const children = clientInfo.children || [];
        if (children.length > 0) {
          const childrenCount = children.length;
          let childrenText = `Vous avez ${childrenCount} enfant${childrenCount > 1 ? 's' : ''} à charge :\n`;
          
          children.forEach((child: any, index: number) => {
            const childName = child.firstName || `Enfant ${index + 1}`;
            
            // Calculer l'âge à partir de la date de naissance ou utiliser l'âge saisi
            let childAge = 'Age non spécifié';
            if (child.birthDate) {
              childAge = calculateAgeFromBirthDate(child.birthDate);
            } else if (child.age) {
              childAge = child.age.toString();
            }
            
            // Déterminer la parenté
            let parentageText = '';
            if (child.parentage === 'commun') {
              parentageText = 'enfant commun';
            } else if (child.parentage === 'propre_parent1') {
              const parent1Name = clientInfo.firstName || 'Parent 1';
              parentageText = `enfant propre à ${parent1Name}`;
            } else if (child.parentage === 'propre_parent2') {
              const parent2Name = clientInfo.spouseFirstName || 'Parent 2';
              parentageText = `enfant propre à ${parent2Name}`;
            } else {
              parentageText = 'parenté non spécifiée';
            }
            
            childrenText += `- ${childName}, qui a ${childAge} ans, ${parentageText}`;
            if (index < children.length - 1) {
              childrenText += '\n';
            }
          });
          
          conditionalBlocks['childrenBlock'] = childrenText;
        } else {
          conditionalBlocks['childrenBlock'] = '';
        }
        
        // Bloc conditionnel pour le régime matrimonial
        const matrimonialRegime = baseVariables.matrimonialRegime;
        if (matrimonialRegime && matrimonialRegime.trim()) {
          conditionalBlocks['matrimonialRegimeBlock'] = `(${matrimonialRegime})`;
        } else {
          conditionalBlocks['matrimonialRegimeBlock'] = '';
        }
        
        // Bloc conditionnel pour la date et lieu de naissance
        const birthDate = baseVariables.birthDate;
        const city = baseVariables.city;
        if (birthDate && city) {
          conditionalBlocks['birthInfoBlock'] = `Né(e) le ${birthDate} à ${city}`;
        } else if (birthDate) {
          conditionalBlocks['birthInfoBlock'] = `Né(e) le ${birthDate}`;
        } else {
          conditionalBlocks['birthInfoBlock'] = '';
        }
        
        // Bloc conditionnel pour le conjoint
        const spouseFullName = baseVariables.spouseFullName;
        if (spouseFullName && spouseFullName.trim()) {
          conditionalBlocks['spouseBlock'] = `Conjoint : ${spouseFullName}`;
        } else {
          conditionalBlocks['spouseBlock'] = '';
        }
        
        // Bloc conditionnel pour la profession
        const profession = baseVariables.profession;
        const company = baseVariables.company;
        if (profession && profession !== 'Non spécifié') {
          if (company && company.trim()) {
            conditionalBlocks['professionBlock'] = `${profession} chez ${company}`;
          } else {
            conditionalBlocks['professionBlock'] = profession;
          }
        } else {
          conditionalBlocks['professionBlock'] = '';
        }
        
        return conditionalBlocks;
      };

      // Fonction utilitaire pour obtenir le libellé du régime matrimonial
      const getMatrimonialRegimeLabel = (regime: string): string => {
        if (!regime) return '';
        const regimeMap: { [key: string]: string } = {
          'communaute-reduite': 'Communauté réduite aux acquêts (depuis 1er février 1966)',
          'communaute-biens': 'Communauté de biens (avant 1er février 1966)',
          'separation-biens': 'Séparation de biens',
          'participation-acquets': 'Participation aux acquêts',
          'communaute-universelle': 'Communauté universelle',
          'indivision': 'Régime de l\'indivision',
          'separation': 'Régime de séparation'
        };
        return regimeMap[regime] || regime;
      };

      // Préparer les variables pour le Google Docs - Format simple {{variable}}
      // 📝 Pour ajouter une nouvelle variable :
      // 1. Ajoutez-la ici : 'nouvelleVariable': clientInfo.nouvelleVariable || "valeur par défaut",
      // 2. Dans Google Docs, utilisez : {{nouvelleVariable}}
      // Logs de débogage pour les titres
      const titleFormatted = formatTitle(clientInfo.title || "");
      const spouseTitleFormatted = formatTitle(clientInfo.spouseTitle || "");
      console.log('🔍 Title avant formatage:', clientInfo.title);
      console.log('🔍 Title après formatage:', titleFormatted);
      console.log('🔍 SpouseTitle avant formatage:', clientInfo.spouseTitle);
      console.log('🔍 SpouseTitle après formatage:', spouseTitleFormatted);

      // Définir les variables de base
      const baseVariables: Record<string, string> = {
        // Informations client de base
        'firstName': clientInfo.firstName || "",
        'lastName': clientInfo.lastName || "Client",
        'title': titleFormatted,
        'birthName': clientInfo.birthName || "",
        'age': clientInfo.age ? `${clientInfo.age} ans` : "Non spécifié",
        'birthDate': formatDate(clientInfo.birthDate || ""),
        'city': formatCity(clientInfo.city || ""),
        'country': (clientInfo as any).country || "France",
        'nationality': clientInfo.nationality || "Française",
        
        // Informations professionnelles
        'profession': clientInfo.profession || "Non spécifié",
        'company': clientInfo.company || "",
        'csp': getCspLabel((clientInfo as any).csp || ""),
        'retirementAge': (clientInfo as any).retirementAge || "",
        
        // Situation familiale
        'maritalStatus': getMaritalStatusLabel(clientInfo.maritalStatus || "", clientInfo.title || ""),
        'matrimonialRegime': getMatrimonialRegimeLabel(clientInfo.matrimonialRegime || ""),
        'marriageDate': formatDate(clientInfo.marriageDate || ""),
        'marriagePlace': clientInfo.marriagePlace || "",
        
        // Informations conjoint
        'spouseTitle': spouseTitleFormatted,
        'spouseFirstName': clientInfo.spouseFirstName || "",
        'spouseLastName': clientInfo.spouseLastName || "",
        'spouseBirthName': clientInfo.spouseBirthName || "",
        'spouseAge': clientInfo.spouseAge ? `${clientInfo.spouseAge} ans` : "",
        'spouseProfession': clientInfo.spouseProfession || "",
        'spouseCompany': clientInfo.spouseCompany || "",
        'spouseBirthDate': formatDate(clientInfo.spouseBirthDate || ""),
        'spouseCity': formatCity(clientInfo.spouseCity || ""),
        'spouseCountry': (clientInfo as any).spouseCountry || "France",
        'spouseNationality': clientInfo.spouseNationality || "Française",
        'spouseCsp': getCspLabel((clientInfo as any).spouseCsp || ""),
        'spouseRetirementAge': (clientInfo as any).spouseRetirementAge || "",
        
        // Informations supplémentaires
        'birthPostalCode': clientInfo.birthPostalCode || "",
        'spouseBirthPostalCode': clientInfo.spouseBirthPostalCode || "",
        'nbChildren': clientInfo.children ? clientInfo.children.length.toString() : "0",
        'birthCity': clientInfo.city || "",  // Ville de naissance (même que résidence pour simplifier)
        'spouseBirthCity': clientInfo.spouseCity || "",
        'legalCapacity': (clientInfo as any).legalCapacity || "",
        'spouseLegalCapacity': (clientInfo as any).spouseLegalCapacity || "",
        'mifClassification': (clientInfo as any).mifClassification || "",
        
        // Informations parents
        'parent1Name': (clientInfo as any).parent1Name || "",
        'parent2Name': (clientInfo as any).parent2Name || "",
        
        // Informations méta
        'dateGeneration': new Date().toLocaleDateString('fr-FR'),
        'heureGeneration': new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        'anneeGeneration': new Date().getFullYear().toString(),
        'moisGeneration': (new Date().getMonth() + 1).toString(),
        'nbPreconisations': selectedPreconisationsDetails.length.toString(),
        'fullName': `${clientInfo.firstName || ''} ${clientInfo.lastName || ''}`.trim(),
        'spouseFullName': clientInfo.spouseFirstName && clientInfo.spouseLastName ? 
          `${clientInfo.spouseFirstName} ${clientInfo.spouseLastName}`.trim() : "",
      };

      // Générer les variables de patrimoine selon le format Google Docs
      const generatePatrimoineVariables = (): Record<string, string> => {
        const patrimoineVars: Record<string, string> = {};
        
        // Charger les données de patrimoine depuis localStorage
        const realEstateData = localStorage.getItem('patrimoineImmobilierInfo');
        const financialData = localStorage.getItem('patrimoineFinancierInfo');
        const professionalData = localStorage.getItem('patrimoineProfessionnelInfo');
        
        const realEstate = realEstateData ? JSON.parse(realEstateData) : [];
        const financial = financialData ? JSON.parse(financialData) : [];
        const professional = professionalData ? JSON.parse(professionalData) : [];
        
        // Calculer les totaux
        let totalImmo = 0, totalImmoTitle = 0, totalImmoCom = 0, totalImmoSpouseTitle = 0;
        let totalFi = 0, totalFiTitle = 0, totalFiCom = 0, totalFiSpouseTitle = 0;
        let totalPro = 0, totalProTitle = 0, totalProCom = 0, totalProSpouseTitle = 0;
        
        // Générer les variables immobilières (jusqu'à 10 biens)
        for (let i = 1; i <= 10; i++) {
          const property = realEstate[i - 1];
          if (property && property.denomination) {
            const denomination = property.denomination;
            const netValue = property.netValue || 0;
            
            // Générer les variantes pour la dénomination
            const bienVars = generateVariableVariants(`bienImmobilier${i}`, denomination);
            Object.assign(patrimoineVars, bienVars);
            
            // Répartition selon le mode de propriété (valeurs correctes)
            if (property.ownedBy === 'Vous') {
              // Optimisation: générer seulement les variantes avec valeur
              const titleVars = generateVariableVariants(`titleImmo${i}`, netValue.toString());
              Object.assign(patrimoineVars, titleVars);
              // Générer les variantes vides seulement pour eu- et M- (les plus utilisées)
              patrimoineVars[`comImmo${i}`] = '';
              patrimoineVars['eu-comImmo' + i] = '';
              patrimoineVars['M-comImmo' + i] = '';
              patrimoineVars[`spouseTitleImmo${i}`] = '';
              patrimoineVars['eu-spouseTitleImmo' + i] = '';
              patrimoineVars['M-spouseTitleImmo' + i] = '';
              totalImmoTitle += netValue;
            } else if (property.ownedBy === 'Votre conjoint') {
              const spouseTitleVars = generateVariableVariants(`spouseTitleImmo${i}`, netValue.toString());
              Object.assign(patrimoineVars, spouseTitleVars);
              // Variantes vides optimisées
              patrimoineVars[`titleImmo${i}`] = '';
              patrimoineVars['eu-titleImmo' + i] = '';
              patrimoineVars['M-titleImmo' + i] = '';
              patrimoineVars[`comImmo${i}`] = '';
              patrimoineVars['eu-comImmo' + i] = '';
              patrimoineVars['M-comImmo' + i] = '';
              totalImmoSpouseTitle += netValue;
            } else { // Commun
              const comVars = generateVariableVariants(`comImmo${i}`, netValue.toString());
              Object.assign(patrimoineVars, comVars);
              // Variantes vides optimisées
              patrimoineVars[`titleImmo${i}`] = '';
              patrimoineVars['eu-titleImmo' + i] = '';
              patrimoineVars['M-titleImmo' + i] = '';
              patrimoineVars[`spouseTitleImmo${i}`] = '';
              patrimoineVars['eu-spouseTitleImmo' + i] = '';
              patrimoineVars['M-spouseTitleImmo' + i] = '';
              totalImmoCom += netValue;
            }
            totalImmo += netValue;
          } else {
            // Bien vide - générer uniquement les variables principales vides
            patrimoineVars[`bienImmobilier${i}`] = '';
            patrimoineVars[`titleImmo${i}`] = '';
            patrimoineVars[`comImmo${i}`] = '';
            patrimoineVars[`spouseTitleImmo${i}`] = '';
            // Variables eu- pour compatibilité
            patrimoineVars['eu-titleImmo' + i] = '';
            patrimoineVars['eu-comImmo' + i] = '';
            patrimoineVars['eu-spouseTitleImmo' + i] = '';
          }
        }
        
        // Générer les variables financières (jusqu'à 10 biens)
        for (let i = 1; i <= 10; i++) {
          const asset = financial[i - 1];
          if (asset && asset.denomination) {
            const denomination = asset.denomination;
            const realValue = asset.realValue || 0;
            
            // Générer les variantes pour la dénomination
            const bienVars = generateVariableVariants(`bienFinancier${i}`, denomination);
            Object.assign(patrimoineVars, bienVars);
            
            // Répartition selon le mode de propriété (valeurs correctes)
            if (asset.ownedBy === 'Vous') {
              const titleVars = generateVariableVariants(`titleFi${i}`, realValue.toString());
              Object.assign(patrimoineVars, titleVars);
              // Variantes vides optimisées
              patrimoineVars[`comFi${i}`] = '';
              patrimoineVars['eu-comFi' + i] = '';
              patrimoineVars['M-comFi' + i] = '';
              patrimoineVars[`spouseTitleFi${i}`] = '';
              patrimoineVars['eu-spouseTitleFi' + i] = '';
              patrimoineVars['M-spouseTitleFi' + i] = '';
              totalFiTitle += realValue;
            } else if (asset.ownedBy === 'Votre conjoint') {
              const spouseTitleVars = generateVariableVariants(`spouseTitleFi${i}`, realValue.toString());
              Object.assign(patrimoineVars, spouseTitleVars);
              // Variantes vides optimisées
              patrimoineVars[`titleFi${i}`] = '';
              patrimoineVars['eu-titleFi' + i] = '';
              patrimoineVars['M-titleFi' + i] = '';
              patrimoineVars[`comFi${i}`] = '';
              patrimoineVars['eu-comFi' + i] = '';
              patrimoineVars['M-comFi' + i] = '';
              totalFiSpouseTitle += realValue;
            } else { // Commun
              const comVars = generateVariableVariants(`comFi${i}`, realValue.toString());
              Object.assign(patrimoineVars, comVars);
              // Variantes vides optimisées
              patrimoineVars[`titleFi${i}`] = '';
              patrimoineVars['eu-titleFi' + i] = '';
              patrimoineVars['M-titleFi' + i] = '';
              patrimoineVars[`spouseTitleFi${i}`] = '';
              patrimoineVars['eu-spouseTitleFi' + i] = '';
              patrimoineVars['M-spouseTitleFi' + i] = '';
              totalFiCom += realValue;
            }
            totalFi += realValue;
          } else {
            // Bien vide - générer uniquement les variables principales vides
            patrimoineVars[`bienFinancier${i}`] = '';
            patrimoineVars[`titleFi${i}`] = '';
            patrimoineVars[`comFi${i}`] = '';
            patrimoineVars[`spouseTitleFi${i}`] = '';
            // Variables eu- pour compatibilité
            patrimoineVars['eu-titleFi' + i] = '';
            patrimoineVars['eu-comFi' + i] = '';
            patrimoineVars['eu-spouseTitleFi' + i] = '';
          }
        }
        
        // Générer les variables professionnelles (jusqu'à 10 biens)
        for (let i = 1; i <= 10; i++) {
          const asset = professional[i - 1];
          if (asset && (asset.companyName || asset.activity)) {
            const denomination = asset.companyName || asset.activity || '';
            const valuation = asset.valuation || 0;
            
            // Générer les variantes pour la dénomination
            const bienVars = generateVariableVariants(`bienProfessionnel${i}`, denomination);
            Object.assign(patrimoineVars, bienVars);
            
            // Répartition selon le mode de propriété (valeurs correctes)
            if (asset.ownership === 'Vous') {
              const titleVars = generateVariableVariants(`titlePro${i}`, valuation.toString());
              Object.assign(patrimoineVars, titleVars);
              // Variantes vides optimisées
              patrimoineVars[`comPro${i}`] = '';
              patrimoineVars['eu-comPro' + i] = '';
              patrimoineVars['M-comPro' + i] = '';
              patrimoineVars[`spouseTitlePro${i}`] = '';
              patrimoineVars['eu-spouseTitlePro' + i] = '';
              patrimoineVars['M-spouseTitlePro' + i] = '';
              totalProTitle += valuation;
            } else if (asset.ownership === 'Votre conjoint') {
              const spouseTitleVars = generateVariableVariants(`spouseTitlePro${i}`, valuation.toString());
              Object.assign(patrimoineVars, spouseTitleVars);
              // Variantes vides optimisées
              patrimoineVars[`titlePro${i}`] = '';
              patrimoineVars['eu-titlePro' + i] = '';
              patrimoineVars['M-titlePro' + i] = '';
              patrimoineVars[`comPro${i}`] = '';
              patrimoineVars['eu-comPro' + i] = '';
              patrimoineVars['M-comPro' + i] = '';
              totalProSpouseTitle += valuation;
            } else { // Commun
              const comVars = generateVariableVariants(`comPro${i}`, valuation.toString());
              Object.assign(patrimoineVars, comVars);
              // Variantes vides optimisées
              patrimoineVars[`titlePro${i}`] = '';
              patrimoineVars['eu-titlePro' + i] = '';
              patrimoineVars['M-titlePro' + i] = '';
              patrimoineVars[`spouseTitlePro${i}`] = '';
              patrimoineVars['eu-spouseTitlePro' + i] = '';
              patrimoineVars['M-spouseTitlePro' + i] = '';
              totalProCom += valuation;
            }
            totalPro += valuation;
          } else {
            // Bien vide - générer uniquement les variables principales vides
            patrimoineVars[`bienProfessionnel${i}`] = '';
            patrimoineVars[`titlePro${i}`] = '';
            patrimoineVars[`comPro${i}`] = '';
            patrimoineVars[`spouseTitlePro${i}`] = '';
            // Variables eu- pour compatibilité
            patrimoineVars['eu-titlePro' + i] = '';
            patrimoineVars['eu-comPro' + i] = '';
            patrimoineVars['eu-spouseTitlePro' + i] = '';
          }
        }
        
        // Calculer les totaux et pourcentages
        const totalPatrimoine = totalImmo + totalFi + totalPro;
        const totalTitle = totalImmoTitle + totalFiTitle + totalProTitle;
        const totalCom = totalImmoCom + totalFiCom + totalProCom;
        const totalSpouseTitle = totalImmoSpouseTitle + totalFiSpouseTitle + totalProSpouseTitle;
        
        // Ajouter les variables de totaux avec formatage automatique
        const totalImmoVars = generateVariableVariants('totalImmo', totalImmo.toString());
        const totalFiVars = generateVariableVariants('totalFi', totalFi.toString());
        const totalProVars = generateVariableVariants('totalPro', totalPro.toString());
        
        // Calculer les pourcentages et les formater
        const pctImmo = totalPatrimoine > 0 ? Math.round((totalImmo / totalPatrimoine) * 100).toString() : '0';
        const pctFi = totalPatrimoine > 0 ? Math.round((totalFi / totalPatrimoine) * 100).toString() : '0';
        const pctPro = totalPatrimoine > 0 ? Math.round((totalPro / totalPatrimoine) * 100).toString() : '0';
        
        // Ajouter toutes les variables de totaux avec toutes leurs variantes
        Object.assign(patrimoineVars, totalImmoVars, totalFiVars, totalProVars);
        
        // Ajouter spécifiquement les variables de pourcentage formatées
        // Format ancien avec espace (pct-) : "15 %"
        patrimoineVars['pct-totalImmo'] = applyFormatPrefix(pctImmo, 'pct');
        patrimoineVars['pct-totalFi'] = applyFormatPrefix(pctFi, 'pct');
        patrimoineVars['pct-totalPro'] = applyFormatPrefix(pctPro, 'pct');
        
        // Format nouveau sans espace (%-) : "15%" - pour correspondre exactement au tableau utilisateur
        patrimoineVars['%-totalImmo'] = applyFormatPrefix(pctImmo, '%');
        patrimoineVars['%-totalFi'] = applyFormatPrefix(pctFi, '%');
        patrimoineVars['%-totalPro'] = applyFormatPrefix(pctPro, '%');
        
        // Variables de totaux par détention avec variantes complètes
        const totalTitleVars = generateVariableVariants('totalTitle', totalTitle.toString());
        const totalComVars = generateVariableVariants('totalCom', totalCom.toString());
        const totalSpouseTitleVars = generateVariableVariants('totalSpouseTitle', totalSpouseTitle.toString());
        const totalPatVars = generateVariableVariants('totalPat', totalPatrimoine.toString());
        
        Object.assign(patrimoineVars, totalTitleVars, totalComVars, totalSpouseTitleVars, totalPatVars);
        
        return patrimoineVars;
      };
      
      // Générer les variables de patrimoine
      const patrimoineVariables = generatePatrimoineVariables();
      
      // Fusionner avec les variables de base
      Object.assign(baseVariables, patrimoineVariables);

      // Générer les blocs conditionnels
      const conditionalBlocks = generateConditionalBlocks(baseVariables, clientInfo);
      
      // Fonction pour générer les blocs conditionnels avec préfixe "block-"
      const generateBlockVariables = (baseVars: Record<string, string>): Record<string, string> => {
        const blockVars: Record<string, string> = {};
        
        // Bloc enfants - affiché seulement si nbChildren > 0
        const nbChildren = parseInt(baseVars.nbChildren || "0");
        if (nbChildren > 0) {
          blockVars['block-childrenInfo'] = `Nombre d'enfants : ${nbChildren}`;
          blockVars['block-childrenPresent'] = 'true';
        } else {
          blockVars['block-childrenInfo'] = '';
          blockVars['block-childrenPresent'] = 'false';
        }
        
        // Bloc conjoint - affiché seulement si conjoint existe
        if (baseVars.spouseFirstName && baseVars.spouseLastName) {
          blockVars['block-spouseInfo'] = `Conjoint : ${baseVars.spouseFullName}`;
          blockVars['block-spousePresent'] = 'true';
        } else {
          blockVars['block-spouseInfo'] = '';
          blockVars['block-spousePresent'] = 'false';
        }
        
        // Bloc mariage - affiché seulement si date de mariage existe
        if (baseVars.marriageDate) {
          blockVars['block-marriageInfo'] = `Marié(e) le ${baseVars.marriageDate}`;
          if (baseVars.marriagePlace) {
            blockVars['block-marriageInfo'] += ` à ${baseVars.marriagePlace}`;
          }
          blockVars['block-marriagePresent'] = 'true';
        } else {
          blockVars['block-marriageInfo'] = '';
          blockVars['block-marriagePresent'] = 'false';
        }
        
        return blockVars;
      };
      
      // Ajouter les blocs conditionnels aux variables de base
      const blockVariables = generateBlockVariables(baseVariables);
      Object.assign(baseVariables, blockVariables);
      
      // Générer toutes les variantes avec préfixes pour chaque variable
      const variables: Record<string, string> = {};
      
      // Ajouter les variables de base avec leurs variantes
      Object.entries(baseVariables).forEach(([key, value]) => {
        const variants = generateVariableVariants(key, value);
        Object.assign(variables, variants);
      });
      
      // Ajouter les blocs conditionnels avec leurs variantes
      Object.entries(conditionalBlocks).forEach(([key, value]) => {
        const variants = generateVariableVariants(key, value);
        Object.assign(variables, variants);
      });
      
      console.log('📊 Variables préparées pour Google Docs:', variables);
      console.log('🔍 Variables title dans l\'objet final:', {
        title: variables.title,
        spouseTitle: variables.spouseTitle
      });
      
      // 🔍 DEBUG: Logs spécifiques patrimoine
      console.log('🏠 Variables patrimoine immobilier:', {
        totalImmo: variables.totalImmo,
        'eu-totalImmo': variables['eu-totalImmo'],
        'pct-totalImmo': variables['pct-totalImmo'],
        bienImmobilier1: variables.bienImmobilier1,
        'M-bienImmobilier1': variables['M-bienImmobilier1'],
        'eu-titleImmo1': variables['eu-titleImmo1'],
        'eu-comImmo1': variables['eu-comImmo1'],
        'eu-spouseTitleImmo1': variables['eu-spouseTitleImmo1']
      });
      
      console.log('💰 Variables totaux finaux:', {
        'eu-totalTitle': variables['eu-totalTitle'],
        'eu-totalCom': variables['eu-totalCom'],
        'eu-totalSpouseTitle': variables['eu-totalSpouseTitle'],
        'eu-totalPat': variables['eu-totalPat']
      });
      

      
      // Compter les variables non vides
      const nonEmptyVars = Object.entries(variables).filter(([key, value]) => value !== '' && value !== null && value !== undefined);
      console.log(`📈 Total variables générées: ${Object.keys(variables).length}, Non vides: ${nonEmptyVars.length}`);
      
      // Logs spécifiques localStorage
      const realEstateData = localStorage.getItem('patrimoineImmobilierInfo');
      const financialData = localStorage.getItem('patrimoineFinancierInfo');
      const professionalData = localStorage.getItem('patrimoineProfessionnelInfo');
      
      console.log('💾 Données patrimoine localStorage:', {
        immobilier: realEstateData ? JSON.parse(realEstateData).length + ' biens' : 'Aucune donnée',
        financier: financialData ? JSON.parse(financialData).length + ' biens' : 'Aucune donnée',
        professionnel: professionalData ? JSON.parse(professionalData).length + ' biens' : 'Aucune donnée'
      });
      setExportProgress(10);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('📄 Nombre de préconisations:', selectedPreconisationsDetails.length);
      setExportProgress(20);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Ajouter les préconisations individuellement  
      setExportProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
      // Essayer plusieurs sources de données pour les revenus et charges
      let revenus: FinancialItem[] = [];
      let charges: FinancialItem[] = [];
      
      // 1. Essayer depuis la structure dataToUse.finances
      if (dataToUse.finances?.revenus) {
        revenus = dataToUse.finances.revenus;
      }
      if (dataToUse.finances?.charges) {
        charges = dataToUse.finances.charges;
      }
      
      // 2. Essayer depuis localStorage si pas trouvé dans dataToUse
      if (revenus.length === 0) {
        try {
          const revenusData = localStorage.getItem('revenusChargesInfo');
          if (revenusData) {
            const parsed = JSON.parse(revenusData);
            revenus = parsed.revenus || [];
            charges = parsed.charges || [];
          }
        } catch (error) {
          console.error('Erreur parsing revenus/charges:', error);
        }
      }
      
      // 3. Essayer d'autres clés localStorage possibles
      if (revenus.length === 0) {
        try {
          const revenusOnly = localStorage.getItem('revenus');
          const chargesOnly = localStorage.getItem('charges');
          if (revenusOnly) revenus = JSON.parse(revenusOnly);
          if (chargesOnly) charges = JSON.parse(chargesOnly);
        } catch (error) {
          console.error('Erreur parsing revenus/charges séparés:', error);
        }
      }
      
      // 4. Données de test si aucune donnée trouvée
      if (revenus.length === 0) {
        console.log('⚠️ Aucune donnée revenus/charges trouvée, utilisation de données de test');
        revenus = [
          { intitule: 'Salaire net', montant: 3500 },
          { intitule: 'Primes', montant: 800 }
        ];
        charges = [
          { intitule: 'Crédit immobilier', montant: 1200 },
          { intitule: 'Assurances', montant: 300 }
        ];
      }
      
      console.log('💰 Revenus finaux utilisés:', revenus.length, 'entrées');
      console.log('💸 Charges finales utilisées:', charges.length, 'entrées');
      console.log('🔍 Détail revenus:', revenus);
      console.log('🔍 Détail charges:', charges);
      
      // Définir les interfaces pour les revenus et charges
      interface FinancialItem {
        intitule?: string;
        montant?: number;
      }
      
      // Calculer les totaux
      const totalRevenus = revenus.reduce((sum: number, item: FinancialItem) => sum + (item.montant || 0), 0);
      const totalCharges = charges.reduce((sum: number, item: FinancialItem) => sum + (item.montant || 0), 0);
      
      // Ajouter les revenus aux variables avec tous les préfixes de formatage
      revenus.forEach((revenu: FinancialItem, index: number) => {
        if (index < 10) { // Limiter à 10 entrées
          // Variables de base
          const intituleKey = `intitule_revenu${index + 1}`;
          const montantKey = `montant_revenu${index + 1}`;
          
          // Générer toutes les variantes pour l'intitulé
          const intituleVars = generateVariableVariants(intituleKey, revenu.intitule || '');
          Object.assign(variables, intituleVars);
          
          // Générer toutes les variantes pour le montant
          if (revenu.montant) {
            const montantVars = generateVariableVariants(montantKey, revenu.montant.toString());
            Object.assign(variables, montantVars);
          } else {
            variables[montantKey] = '';
            variables[`eu-${montantKey}`] = '';
          }
        }
      });
      
      // Ajouter les charges aux variables avec tous les préfixes de formatage
      charges.forEach((charge: FinancialItem, index: number) => {
        if (index < 10) { // Limiter à 10 entrées
          // Variables de base
          const intituleKey = `intitule_charge${index + 1}`;
          const montantKey = `montant_charge${index + 1}`;
          
          // Générer toutes les variantes pour l'intitulé
          const intituleVars = generateVariableVariants(intituleKey, charge.intitule || '');
          Object.assign(variables, intituleVars);
          
          // Générer toutes les variantes pour le montant
          if (charge.montant) {
            const montantVars = generateVariableVariants(montantKey, charge.montant.toString());
            Object.assign(variables, montantVars);
          } else {
            variables[montantKey] = '';
            variables[`eu-${montantKey}`] = '';
          }
        }
      });
      
      // Ajouter les totaux avec toutes les variantes
      const totalRevenusVars = generateVariableVariants('montant_total__revenus', totalRevenus.toString());
      const totalChargesVars = generateVariableVariants('montant_total__charges', totalCharges.toString());
      Object.assign(variables, totalRevenusVars, totalChargesVars);
      
      // 🔍 DEBUG: Logs spécifiques revenus et charges (après génération)
      console.log('💰 Variables revenus et charges générées:', {
        'revenus source': `${revenus.length} entrées`,
        'charges source': `${charges.length} entrées`,
        'total revenus': totalRevenus,
        'total charges': totalCharges,
        intitule_revenu1: variables.intitule_revenu1,
        montant_revenu1: variables.montant_revenu1,
        'eu-montant_revenu1': variables['eu-montant_revenu1'],
        intitule_charge1: variables.intitule_charge1,
        montant_charge1: variables.montant_charge1,
        'eu-montant_charge1': variables['eu-montant_charge1'],
        'eu-montant_total__revenus': variables['eu-montant_total__revenus'],
        'eu-montant_total__charges': variables['eu-montant_total__charges']
      });
      
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
      
      // 🧩 NETTOYAGE INTELLIGENT DES LIGNES VIDES DANS LES TABLEAUX
      // Instructions améliorées pour Google Apps Script :
      // - Supprimer automatiquement toutes les lignes de tableau vides
      // - Détecter les patterns de variables pour chaque type de tableau
      
      // Ajouter des variables de contrôle pour le nettoyage avancé
      variables['_CLEAN_EMPTY_LINES'] = 'true';
      variables['_CLEAN_TABLE_ROWS'] = 'true';
      variables['_CLEAN_REVENUE_ROWS'] = 'true';
      variables['_CLEAN_PATRIMOINE_ROWS'] = 'true';
      
      // Identifier les patterns de variables pour nettoyage automatique
      const cleaningPatterns = {
        // Revenus et charges (lignes 3-10 à nettoyer si vides)
        revenus: [
          'intitule_revenu3', 'intitule_revenu4', 'intitule_revenu5', 'intitule_revenu6',
          'intitule_revenu7', 'intitule_revenu8', 'intitule_revenu9', 'intitule_revenu10'
        ],
        charges: [
          'intitule_charge3', 'intitule_charge4', 'intitule_charge5', 'intitule_charge6',
          'intitule_charge7', 'intitule_charge8', 'intitule_charge9', 'intitule_charge10'
        ],
        // Patrimoine (lignes de biens vides à nettoyer)
        biens: [
          'bienImmobilier3', 'bienImmobilier4', 'bienImmobilier5', 'bienImmobilier6',
          'bienImmobilier7', 'bienImmobilier8', 'bienImmobilier9', 'bienImmobilier10',
          'bienFinancier3', 'bienFinancier4', 'bienFinancier5', 'bienFinancier6',
          'bienFinancier7', 'bienFinancier8', 'bienFinancier9', 'bienFinancier10',
          'bienProfessionnel3', 'bienProfessionnel4', 'bienProfessionnel5', 'bienProfessionnel6',
          'bienProfessionnel7', 'bienProfessionnel8', 'bienProfessionnel9', 'bienProfessionnel10'
        ]
      };
      
      // Envoyer les patterns de nettoyage à Google Apps Script
      variables['_CLEANING_PATTERNS'] = JSON.stringify(cleaningPatterns);
      
      // Identifier les variables vides pour le nettoyage
      const emptyVariables: string[] = [];
      Object.entries(variables).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          emptyVariables.push(key);
        }
      });
      
      console.log('🧩 Variables vides à nettoyer:', emptyVariables.length, 'sur', Object.keys(variables).length);
      
      // OPTIMISATION: Filtrer les variables vides inutiles (garder seulement celles nécessaires)
      const filteredVariables: { [key: string]: any } = {};
      Object.entries(variables).forEach(([key, value]) => {
        // Garder les variables avec valeur OU les variables principales vides (pour template)
        if (value !== '' && value !== null && value !== undefined) {
          filteredVariables[key] = value;
        } else if (key.match(/^(bienImmobilier|titleImmo|comImmo|spouseTitleImmo|bienFinancier|titleFi|comFi|spouseTitleFi|bienProfessionnel|titlePro|comPro|spouseTitlePro|eu-|M-|pct-|%-|mm-|MM-|cap-|nb-|k-|ord-)/)) {
          filteredVariables[key] = '';
        }
      });
      
      console.log(`⚡ Optimisation: ${Object.keys(variables).length} → ${Object.keys(filteredVariables).length} variables`);
      
      // 🚀 NOUVEAU SYSTÈME - Appel API Next.js directement (plus d'Apps Script!)
      console.log('🚀 Envoi vers API Next.js pour génération PDF...');
      
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          variables: filteredVariables,
          filename: `preconisations_${clientInfo.firstName}_${clientInfo.lastName}_${new Date().toISOString().split('T')[0]}`
        }),
      });
      
      console.log('Réponse API:', response.status, response.statusText);
      console.log('Temps de traitement:', response.headers.get('X-Processing-Time'));
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur API: ${response.status} - ${errorData.error || response.statusText}`);
      }
      
      setExportProgress(90);
      console.log('✅ PDF généré avec succès via API Next.js!');
      
      // Le PDF arrive directement comme stream depuis l'API
      const pdfBlob = await response.blob();
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preconisations_${clientInfo.firstName}_${clientInfo.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
        
      // Finaliser la progress bar
      setExportProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fermer automatiquement le dialog après téléchargement
      setTimeout(() => {
        setExportDialogOpen(false);
        setExportProgress(0);
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setExportError(`Erreur de connexion: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Fonction pour export PDF rapide via HTML
  const exportToPDFRapide = async () => {
    setIsExportingFast(true);
    
    try {
      const startTime = Date.now();
      console.log('🚀 Début export PDF rapide HTML');
      
      // Fonctions utilitaires pour le formatage
      const applyFormatPrefix = (value: string, prefix: string): string => {
        if (!value || value === '') return '';
        
        switch (prefix) {
          case 'M': // Majuscule au début
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
          case 'mm': // tout minuscule
            return value.toLowerCase();
          case 'MM': // tout majuscule
            return value.toUpperCase();
          case 'eu': // format euros arrondi à l'entier au dessus
            const euValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(euValue) ? value : `${Math.ceil(euValue).toLocaleString('fr-FR')} €`;
          case '%': // format pourcentage
            const pctValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(pctValue) ? value : `${Math.round(pctValue)}%`;
          // Anciens préfixes conservés pour compatibilité
          case 'cap': // Première lettre de chaque mot en majuscule
            return value.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
          case 'pct': // ancien format pourcentage avec espace
            const oldPctValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(oldPctValue) ? value : `${Math.round(oldPctValue)} %`;
          case 'nb': // format nombre avec espaces
            const nbValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(nbValue) ? value : nbValue.toLocaleString('fr-FR');
          case 'k': // format milliers
            const kValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(kValue) ? value : kValue >= 1000 ? `${Math.round(kValue/1000)}k` : kValue.toString();
          case 'ord': // format ordinal
            const ordValue = parseInt(value.replace(/[^0-9]/g, ''));
            if (isNaN(ordValue)) return value;
            if (ordValue === 1) return '1er';
            return `${ordValue}ème`;
          case 'm2': // format m² (mètres carrés)
            const m2Value = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(m2Value) ? value : `${Math.round(m2Value).toLocaleString('fr-FR')} m²`;
          case 'block': // blocs conditionnels - affiche seulement si valeur non vide
            return value && value.trim() !== '' ? value : '';
          default:
            return value;
        }
      };
      
      // Fonction pour générer toutes les variantes d'une variable avec préfixes
      const generateVariableVariants = (key: string, value: string): Record<string, string> => {
        const variants: Record<string, string> = {};
        // Nouveaux préfixes selon les spécifications utilisateur + anciens pour compatibilité
        const prefixes = ['M', 'mm', 'MM', 'eu', '%', 'block', 'cap', 'pct', 'nb', 'k', 'ord', 'm2'];
        
        // Variable de base
        variants[key] = value;
        
        // Variantes avec préfixes
        prefixes.forEach(prefix => {
          variants[`${prefix}-${key}`] = applyFormatPrefix(value, prefix);
        });
        
        return variants;
      };
      
      // Récupérer les données directement depuis localStorage
      let identityData: any = {};
      try {
        const identityDataStr = localStorage.getItem('identityPersonalInfo');
        if (identityDataStr) {
          identityData = JSON.parse(identityDataStr);
          console.log('🔍 Données identité récupérées:', identityData);
        } else {
          console.warn('Aucune donnée identité trouvée dans localStorage');
        }
      } catch (error) {
        console.error('Erreur lors de la lecture des données identité:', error);
      }
      
      // Récupérer les préconisations sélectionnées avec leurs priorités
      const selectedPreconisationsDetails = preconisations
        .filter(preco => selectedPreconisations.includes(preco.id))
        .sort((a, b) => {
          const priorities = { "Haute": 3, "Moyenne": 2, "Basse": 1 };
          const aPriority = customPriorities[a.id] || a.priority;
          const bPriority = customPriorities[b.id] || b.priority;
          return priorities[bPriority] - priorities[aPriority];
        });
      
      // Générer toutes les variables
      let variables: Record<string, any> = {};
      
      // Utiliser les données d'identité directement
      const personal = identityData;
      const children = identityData.children || [];
      
      // Fonctions utilitaires pour formater les données
      const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('fr-FR');
      };
      
      const formatTitle = (title: string): string => {
        if (!title) return '';
        return title === 'monsieur' ? 'Monsieur' : title === 'madame' ? 'Madame' : title;
      };
      
      const getFullName = (firstName: string, lastName: string): string => {
        return `${firstName || ''} ${lastName || ''}`.trim();
      };
      
      const getCspLabel = (cspValue: string): string => {
        if (!cspValue) return '';
        const cspOptions = [
          { value: "11", label: "Agriculteurs sur petite exploitation" },
          { value: "12", label: "Agriculteurs sur moyenne exploitation" },
          { value: "13", label: "Agriculteurs sur grande exploitation" },
          { value: "21", label: "Artisans" },
          { value: "22", label: "Commerçants et assimilés" },
          { value: "23", label: "Chefs d'entreprise de 10 salariés ou plus" },
          { value: "31", label: "Professions libérales" },
          { value: "33", label: "Cadres de la fonction publique" },
          { value: "34", label: "Professeurs, professions scientifiques" },
          { value: "35", label: "Professions de l'information, des arts et des spectacles" },
          { value: "37", label: "Cadres administratifs et commerciaux d'entreprise" },
          { value: "38", label: "Ingénieurs et cadres techniques d'entreprise" }
        ];
        const option = cspOptions.find(opt => opt.value === cspValue);
        return option ? option.label : cspValue;
      };
      
      const getMatrimonialRegimeLabel = (regime: string): string => {
        const regimes = {
          'communaute-reduite': 'Communauté réduite aux acquêts',
          'communaute-universelle': 'Communauté universelle',
          'separation-biens': 'Séparation de biens',
          'participation-acquets': 'Participation aux acquêts'
        };
        return regimes[regime as keyof typeof regimes] || regime;
      };
      
      // Fonction utilitaire pour obtenir le libellé du statut marital accordé selon le genre (comme dans l'export Google Docs)
      const getMaritalStatusLabel = (status: string, title: string): string => {
        if (!status) return '';
        const isFeminine = title === 'madame' || title === 'Madame';
        
        const statusMap: { [key: string]: string } = {
          'marie': isFeminine ? 'Mariée' : 'Marié',
          'celibataire': 'Célibataire',
          'divorce': isFeminine ? 'Divorcée' : 'Divorcé',
          'veuf': isFeminine ? 'Veuve' : 'Veuf',
          'pacs': isFeminine ? 'Pacsée' : 'Pacsé',
          'pacse': isFeminine ? 'Pacsée' : 'Pacsé'
        };
        return statusMap[status] || status;
      };
      
      // Variables d'identité complètes du client principal
      Object.assign(variables, generateVariableVariants('title', formatTitle(personal.title || '')));
      Object.assign(variables, generateVariableVariants('firstName', personal.firstName || ''));
      Object.assign(variables, generateVariableVariants('lastName', personal.lastName || ''));
      Object.assign(variables, generateVariableVariants('birthName', personal.birthName || ''));
      Object.assign(variables, generateVariableVariants('fullName', getFullName(personal.firstName || '', personal.lastName || '')));
      Object.assign(variables, generateVariableVariants('age', personal.age ? `${personal.age} ans` : ''));
      Object.assign(variables, generateVariableVariants('birthDate', formatDate(personal.birthDate || '')));
      Object.assign(variables, generateVariableVariants('birthPostalCode', personal.birthPostalCode || ''));
      Object.assign(variables, generateVariableVariants('city', personal.city || ''));
      Object.assign(variables, generateVariableVariants('country', personal.country || 'France'));
      Object.assign(variables, generateVariableVariants('nationality', personal.nationality || 'Française'));
      Object.assign(variables, generateVariableVariants('legalCapacity', personal.legalCapacity || ''));
      Object.assign(variables, generateVariableVariants('mifClassification', personal.mifClassification || ''));
      Object.assign(variables, generateVariableVariants('retirementAge', personal.retirementAge?.toString() || ''));
      
      // Variables professionnelles du client
      Object.assign(variables, generateVariableVariants('profession', personal.profession || ''));
      Object.assign(variables, generateVariableVariants('company', personal.company || ''));
      Object.assign(variables, generateVariableVariants('csp', getCspLabel(personal.csp || '')));
      
      // Variables de situation familiale
      Object.assign(variables, generateVariableVariants('maritalStatus', getMaritalStatusLabel(personal.maritalStatus || '', personal.title || '')));
      Object.assign(variables, generateVariableVariants('marriageDate', formatDate(personal.marriageDate || '')));
      Object.assign(variables, generateVariableVariants('marriagePlace', personal.marriagePlace || ''));
      Object.assign(variables, generateVariableVariants('matrimonialRegime', getMatrimonialRegimeLabel(personal.matrimonialRegime || '')));
      Object.assign(variables, generateVariableVariants('nbChildren', (children.length || 0).toString()));
      
      // Variables complètes du conjoint
      Object.assign(variables, generateVariableVariants('spouseTitle', formatTitle(personal.spouseTitle || '')));
      Object.assign(variables, generateVariableVariants('spouseFirstName', personal.spouseFirstName || ''));
      Object.assign(variables, generateVariableVariants('spouseLastName', personal.spouseLastName || ''));
      Object.assign(variables, generateVariableVariants('spouseBirthName', personal.spouseBirthName || ''));
      Object.assign(variables, generateVariableVariants('spouseFullName', getFullName(personal.spouseFirstName || '', personal.spouseLastName || '')));
      Object.assign(variables, generateVariableVariants('spouseAge', personal.spouseAge ? `${personal.spouseAge} ans` : ''));
      Object.assign(variables, generateVariableVariants('spouseBirthDate', formatDate(personal.spouseBirthDate || '')));
      Object.assign(variables, generateVariableVariants('spouseBirthPostalCode', personal.spouseBirthPostalCode || ''));
      Object.assign(variables, generateVariableVariants('spouseCity', personal.spouseCity || ''));
      Object.assign(variables, generateVariableVariants('spouseCountry', personal.spouseCountry || 'France'));
      Object.assign(variables, generateVariableVariants('spouseNationality', personal.spouseNationality || 'Française'));
      Object.assign(variables, generateVariableVariants('spouseLegalCapacity', personal.spouseLegalCapacity || ''));
      Object.assign(variables, generateVariableVariants('spouseRetirementAge', personal.spouseRetirementAge?.toString() || ''));
      
      // Variables professionnelles du conjoint
      Object.assign(variables, generateVariableVariants('spouseProfession', personal.spouseProfession || ''));
      Object.assign(variables, generateVariableVariants('spouseCompany', personal.spouseCompany || ''));
      Object.assign(variables, generateVariableVariants('spouseCsp', getCspLabel(personal.spouseCsp || '')));
      
      // Variables supplémentaires (pour les noms des parents si disponibles)
      const parent1Name = children.length > 0 && children[0] ? personal.firstName || '' : '';
      const parent2Name = children.length > 0 && children[0] ? personal.spouseFirstName || '' : '';
      Object.assign(variables, generateVariableVariants('parent1Name', parent1Name));
      Object.assign(variables, generateVariableVariants('parent2Name', parent2Name));
      
      // Variable birthCity pour le client principal (manquante dans la section précédente)
      Object.assign(variables, generateVariableVariants('birthCity', personal.city || ''));
      Object.assign(variables, generateVariableVariants('spouseBirthCity', personal.spouseCity || ''));
      
      // Variables enfants
      Object.assign(variables, generateVariableVariants('numberOfChildren', children.length.toString()));
      
      // Génération des blocs conditionnels (même logique que l'export Google Docs)
      const generateConditionalBlocks = (baseVariables: Record<string, string>, clientInfo: any): Record<string, string> => {
        const conditionalBlocks: Record<string, string> = {};
        
        // Fonction utilitaire pour calculer l'âge à partir de la date de naissance
        const calculateAgeFromBirthDate = (birthDate: string): string => {
          if (!birthDate) return 'Age non spécifié';
          
          try {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            
            return age.toString();
          } catch (error) {
            return 'Age non spécifié';
          }
        };
        
        // Bloc conditionnel pour les enfants - VERSION DÉTAILLÉE
        const children = clientInfo.children || [];
        if (children.length > 0) {
          const childrenCount = children.length;
          let childrenText = `Vous avez ${childrenCount} enfant${childrenCount > 1 ? 's' : ''} à charge :\n`;
          
          children.forEach((child: any, index: number) => {
            const childName = child.firstName || `Enfant ${index + 1}`;
            
            // Calculer l'âge à partir de la date de naissance ou utiliser l'âge saisi
            let childAge = 'Age non spécifié';
            if (child.birthDate) {
              childAge = calculateAgeFromBirthDate(child.birthDate);
            } else if (child.age) {
              childAge = child.age.toString();
            }
            
            // Déterminer la parenté
            let parentageText = '';
            if (child.parentage === 'commun') {
              parentageText = 'enfant commun';
            } else if (child.parentage === 'propre_parent1') {
              const parent1Name = clientInfo.firstName || 'Parent 1';
              parentageText = `enfant propre à ${parent1Name}`;
            } else if (child.parentage === 'propre_parent2') {
              const parent2Name = clientInfo.spouseFirstName || 'Parent 2';
              parentageText = `enfant propre à ${parent2Name}`;
            } else {
              parentageText = 'parenté non spécifiée';
            }
            
            childrenText += `- ${childName}, qui a ${childAge} ans, ${parentageText}`;
            if (index < children.length - 1) {
              childrenText += '\n';
            }
          });
          
          conditionalBlocks['childrenBlock'] = childrenText;
        } else {
          conditionalBlocks['childrenBlock'] = '';
        }
        
        // Bloc conditionnel pour le régime matrimonial
        const matrimonialRegime = baseVariables.matrimonialRegime;
        if (matrimonialRegime && matrimonialRegime.trim()) {
          conditionalBlocks['matrimonialRegimeBlock'] = `(${matrimonialRegime})`;
        } else {
          conditionalBlocks['matrimonialRegimeBlock'] = '';
        }
        
        // Bloc conditionnel pour la date et lieu de naissance
        const birthDate = baseVariables.birthDate;
        const city = baseVariables.city;
        if (birthDate && city) {
          conditionalBlocks['birthInfoBlock'] = `Né(e) le ${birthDate} à ${city}`;
        } else if (birthDate) {
          conditionalBlocks['birthInfoBlock'] = `Né(e) le ${birthDate}`;
        } else {
          conditionalBlocks['birthInfoBlock'] = '';
        }
        
        // Bloc conditionnel pour le conjoint
        const spouseFullName = baseVariables.spouseFullName;
        if (spouseFullName && spouseFullName.trim()) {
          conditionalBlocks['spouseBlock'] = `Conjoint : ${spouseFullName}`;
        } else {
          conditionalBlocks['spouseBlock'] = '';
        }
        
        // Bloc conditionnel pour la profession
        const profession = baseVariables.profession;
        const company = baseVariables.company;
        if (profession && profession !== 'Non spécifié') {
          if (company && company.trim()) {
            conditionalBlocks['professionBlock'] = `${profession} chez ${company}`;
          } else {
            conditionalBlocks['professionBlock'] = profession;
          }
        } else {
          conditionalBlocks['professionBlock'] = '';
        }
        
        // Maintenir aussi les variables block-* pour compatibilité
        if (children.length > 0) {
          conditionalBlocks['block-childrenInfo'] = `Nombre d'enfants : ${children.length}`;
          conditionalBlocks['block-childrenPresent'] = 'true';
        } else {
          conditionalBlocks['block-childrenInfo'] = '';
          conditionalBlocks['block-childrenPresent'] = 'false';
        }
        
        if (personal.spouseFirstName) {
          conditionalBlocks['block-spouseInfo'] = `Conjoint : ${personal.spouseFirstName} ${personal.spouseLastName || ''}`;
          conditionalBlocks['block-spousePresent'] = 'true';
        } else {
          conditionalBlocks['block-spouseInfo'] = '';
          conditionalBlocks['block-spousePresent'] = 'false';
        }
        
        const marriageDate = personal.marriageDate;
        const marriagePlace = personal.marriagePlace;
        if (personal.maritalStatus === 'marie' && marriageDate) {
          const formattedDate = formatDate(marriageDate);
          conditionalBlocks['block-marriageInfo'] = `Marié(e) le ${formattedDate}${marriagePlace ? ` à ${marriagePlace}` : ''}`;
          conditionalBlocks['block-marriagePresent'] = 'true';
        } else {
          conditionalBlocks['block-marriageInfo'] = '';
          conditionalBlocks['block-marriagePresent'] = 'false';
        }
        
        return conditionalBlocks;
      };
      
      // Créer un objet baseVariables avec toutes les variables de base
      const baseVariables: Record<string, string> = {
        matrimonialRegime: personal.matrimonialRegime || '',
        birthDate: formatDate(personal.birthDate || ''),
        city: personal.city || '',
        spouseFullName: getFullName(personal.spouseFirstName || '', personal.spouseLastName || ''),
        profession: personal.profession || '',
        company: personal.company || '',
        marriageDate: formatDate(personal.marriageDate || ''),
        marriagePlace: personal.marriagePlace || ''
      };
      
      // Appliquer les blocs conditionnels
      const conditionalBlocks = generateConditionalBlocks(baseVariables, personal);
      
      // Ajouter tous les blocs conditionnels aux variables
      Object.entries(conditionalBlocks).forEach(([key, value]) => {
        variables[key] = value;
      });
      
      // 🏠 GÉNÉRATION DES VARIABLES DE PATRIMOINE
      console.log('🏠 Génération des variables de patrimoine...');
      
      // Charger les données de patrimoine depuis localStorage
      let realEstate: any[] = [];
      let financial: any[] = [];
      let professional: any[] = [];
      
      try {
        const realEstateData = localStorage.getItem('patrimoineImmobilierInfo');
        const financialData = localStorage.getItem('patrimoineFinancierInfo');
        const professionalData = localStorage.getItem('patrimoineProfessionnelInfo');
        
        if (realEstateData) realEstate = JSON.parse(realEstateData);
        if (financialData) financial = JSON.parse(financialData);
        if (professionalData) professional = JSON.parse(professionalData);
        
        console.log('💰 Données patrimoine chargées:', {
          immobilier: realEstate.length,
          financier: financial.length,
          professionnel: professional.length
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données patrimoine:', error);
      }
      
      // Variables de totaux
      let totalImmo = 0, totalImmoTitle = 0, totalImmoCom = 0, totalImmoSpouseTitle = 0;
      let totalFi = 0, totalFiTitle = 0, totalFiCom = 0, totalFiSpouseTitle = 0;
      let totalPro = 0, totalProTitle = 0, totalProCom = 0, totalProSpouseTitle = 0;
      
      // 🏠 BIENS IMMOBILIERS (1-10)
      for (let i = 1; i <= 10; i++) {
        const property = realEstate[i - 1];
        if (property && property.denomination) {
          const denomination = property.denomination;
          const netValue = property.netValue || 0;
          
          // Dénomination du bien
          Object.assign(variables, generateVariableVariants(`bienImmobilier${i}`, denomination));
          
          // 🏠 NOUVELLES VARIABLES IMMOBILIÈRES DÉTAILLÉES
          // Valeur nette
          Object.assign(variables, generateVariableVariants(`valeurNette${i}`, netValue.toString()));
          
          // Surface
          const surface = property.surface || 0;
          Object.assign(variables, generateVariableVariants(`surface${i}`, surface.toString()));
          
          // Rendement (évolution sur 5 ans)
          const rendement = property.evolutionPercentage || 0;
          Object.assign(variables, generateVariableVariants(`rendement${i}`, rendement.toString()));
          
          // Emplacement (ville)
          const emplacement = property.city || '';
          Object.assign(variables, generateVariableVariants(`emplacement${i}`, emplacement));
          
          // DPE
          const dpe = property.dpe || '';
          Object.assign(variables, generateVariableVariants(`dpe${i}`, dpe));
          
          // GES
          const ges = property.ges || '';
          Object.assign(variables, generateVariableVariants(`ges${i}`, ges));
          
          // Répartition selon la détention
          if (property.ownedBy === 'Vous') {
            // Variables détention "Vous" avec toutes les variantes
            Object.assign(variables, generateVariableVariants(`titleImmo${i}`, netValue.toString()));
            // Variables autres détentions vides
            variables[`comImmo${i}`] = '';
            variables[`eu-comImmo${i}`] = '';
            variables[`spouseTitleImmo${i}`] = '';
            variables[`eu-spouseTitleImmo${i}`] = '';
            totalImmoTitle += netValue;
          } else if (property.ownedBy === 'Votre conjoint') {
            // Variables détention "Votre conjoint" avec toutes les variantes
            Object.assign(variables, generateVariableVariants(`spouseTitleImmo${i}`, netValue.toString()));
            // Variables autres détentions vides
            variables[`titleImmo${i}`] = '';
            variables[`eu-titleImmo${i}`] = '';
            variables[`comImmo${i}`] = '';
            variables[`eu-comImmo${i}`] = '';
            totalImmoSpouseTitle += netValue;
          } else { // Commun
            // Variables détention "Commun" avec toutes les variantes
            Object.assign(variables, generateVariableVariants(`comImmo${i}`, netValue.toString()));
            // Variables autres détentions vides
            variables[`titleImmo${i}`] = '';
            variables[`eu-titleImmo${i}`] = '';
            variables[`spouseTitleImmo${i}`] = '';
            variables[`eu-spouseTitleImmo${i}`] = '';
            totalImmoCom += netValue;
          }
          totalImmo += netValue;
        } else {
          // Bien vide - toutes les variables vides
          variables[`bienImmobilier${i}`] = '';
          variables[`titleImmo${i}`] = '';
          variables[`eu-titleImmo${i}`] = '';
          variables[`comImmo${i}`] = '';
          variables[`eu-comImmo${i}`] = '';
          variables[`spouseTitleImmo${i}`] = '';
          variables[`eu-spouseTitleImmo${i}`] = '';
          
          // Variables détaillées vides
          variables[`valeurNette${i}`] = '';
          variables[`eu-valeurNette${i}`] = '';
          variables[`surface${i}`] = '';
          variables[`rendement${i}`] = '';
          variables[`pct-rendement${i}`] = '';
          variables[`emplacement${i}`] = '';
          variables[`dpe${i}`] = '';
          variables[`ges${i}`] = '';
        }
      }
      
      // 💼 BIENS FINANCIERS (1-10)
      for (let i = 1; i <= 10; i++) {
        const asset = financial[i - 1];
        if (asset && asset.denomination) {
          const denomination = asset.denomination;
          const realValue = asset.realValue || 0;
          
          // Dénomination du bien
          Object.assign(variables, generateVariableVariants(`bienFinancier${i}`, denomination));
          
          // Répartition selon la détention
          if (asset.ownedBy === 'Vous') {
            Object.assign(variables, generateVariableVariants(`titleFi${i}`, realValue.toString()));
            variables[`comFi${i}`] = '';
            variables[`eu-comFi${i}`] = '';
            variables[`spouseTitleFi${i}`] = '';
            variables[`eu-spouseTitleFi${i}`] = '';
            totalFiTitle += realValue;
          } else if (asset.ownedBy === 'Votre conjoint') {
            Object.assign(variables, generateVariableVariants(`spouseTitleFi${i}`, realValue.toString()));
            variables[`titleFi${i}`] = '';
            variables[`eu-titleFi${i}`] = '';
            variables[`comFi${i}`] = '';
            variables[`eu-comFi${i}`] = '';
            totalFiSpouseTitle += realValue;
          } else { // Commun
            Object.assign(variables, generateVariableVariants(`comFi${i}`, realValue.toString()));
            variables[`titleFi${i}`] = '';
            variables[`eu-titleFi${i}`] = '';
            variables[`spouseTitleFi${i}`] = '';
            variables[`eu-spouseTitleFi${i}`] = '';
            totalFiCom += realValue;
          }
          totalFi += realValue;
        } else {
          // Bien vide - toutes les variables vides
          variables[`bienFinancier${i}`] = '';
          variables[`titleFi${i}`] = '';
          variables[`eu-titleFi${i}`] = '';
          variables[`comFi${i}`] = '';
          variables[`eu-comFi${i}`] = '';
          variables[`spouseTitleFi${i}`] = '';
          variables[`eu-spouseTitleFi${i}`] = '';
        }
      }
      
      // 🏢 BIENS PROFESSIONNELS (1-10)
      for (let i = 1; i <= 10; i++) {
        const asset = professional[i - 1];
        if (asset && asset.companyName) {
          const denomination = asset.companyName;
          const netValue = asset.valuation || 0;
          
          // Dénomination du bien
          Object.assign(variables, generateVariableVariants(`bienProfessionnel${i}`, denomination));
          
          // Répartition selon la détention (utilise 'ownership' pour les biens professionnels)
          if (asset.ownership === 'Vous') {
            Object.assign(variables, generateVariableVariants(`titlePro${i}`, netValue.toString()));
            variables[`comPro${i}`] = '';
            variables[`eu-comPro${i}`] = '';
            variables[`spouseTitlePro${i}`] = '';
            variables[`eu-spouseTitlePro${i}`] = '';
            totalProTitle += netValue;
          } else if (asset.ownership === 'Votre conjoint') {
            Object.assign(variables, generateVariableVariants(`spouseTitlePro${i}`, netValue.toString()));
            variables[`titlePro${i}`] = '';
            variables[`eu-titlePro${i}`] = '';
            variables[`comPro${i}`] = '';
            variables[`eu-comPro${i}`] = '';
            totalProSpouseTitle += netValue;
          } else { // Commun
            Object.assign(variables, generateVariableVariants(`comPro${i}`, netValue.toString()));
            variables[`titlePro${i}`] = '';
            variables[`eu-titlePro${i}`] = '';
            variables[`spouseTitlePro${i}`] = '';
            variables[`eu-spouseTitlePro${i}`] = '';
            totalProCom += netValue;
          }
          totalPro += netValue;
        } else {
          // Bien vide - toutes les variables vides
          variables[`bienProfessionnel${i}`] = '';
          variables[`titlePro${i}`] = '';
          variables[`eu-titlePro${i}`] = '';
          variables[`comPro${i}`] = '';
          variables[`eu-comPro${i}`] = '';
          variables[`spouseTitlePro${i}`] = '';
          variables[`eu-spouseTitlePro${i}`] = '';
        }
      }
      
      // 📊 TOTAUX ET POURCENTAGES
      const totalPatrimoine = totalImmo + totalFi + totalPro;
      const totalTitle = totalImmoTitle + totalFiTitle + totalProTitle;
      const totalCom = totalImmoCom + totalFiCom + totalProCom;
      const totalSpouseTitle = totalImmoSpouseTitle + totalFiSpouseTitle + totalProSpouseTitle;
      
      // Variables de totaux par catégorie avec toutes les variantes
      Object.assign(variables, generateVariableVariants('totalImmo', totalImmo.toString()));
      Object.assign(variables, generateVariableVariants('totalFi', totalFi.toString()));
      Object.assign(variables, generateVariableVariants('totalPro', totalPro.toString()));
      
      // Variables de totaux par détention avec toutes les variantes
      Object.assign(variables, generateVariableVariants('totalTitle', totalTitle.toString()));
      Object.assign(variables, generateVariableVariants('totalCom', totalCom.toString()));
      Object.assign(variables, generateVariableVariants('totalSpouseTitle', totalSpouseTitle.toString()));
      Object.assign(variables, generateVariableVariants('totalPat', totalPatrimoine.toString()));
      
      // Pourcentages par catégorie (si patrimoine total > 0)
      if (totalPatrimoine > 0) {
        const pctImmo = Math.round((totalImmo / totalPatrimoine) * 100);
        const pctFi = Math.round((totalFi / totalPatrimoine) * 100);
        const pctPro = Math.round((totalPro / totalPatrimoine) * 100);
        
        Object.assign(variables, generateVariableVariants('pctImmo', pctImmo.toString()));
        Object.assign(variables, generateVariableVariants('pctFi', pctFi.toString()));
        Object.assign(variables, generateVariableVariants('pctPro', pctPro.toString()));
        
        // Pourcentages par détention
        const pctTitle = Math.round((totalTitle / totalPatrimoine) * 100);
        const pctCom = Math.round((totalCom / totalPatrimoine) * 100);
        const pctSpouseTitle = Math.round((totalSpouseTitle / totalPatrimoine) * 100);
        
        Object.assign(variables, generateVariableVariants('pctTitle', pctTitle.toString()));
        Object.assign(variables, generateVariableVariants('pctCom', pctCom.toString()));
        Object.assign(variables, generateVariableVariants('pctSpouseTitle', pctSpouseTitle.toString()));
      } else {
        // Patrimoine vide - tous les pourcentages à 0
        ['pctImmo', 'pctFi', 'pctPro', 'pctTitle', 'pctCom', 'pctSpouseTitle'].forEach(key => {
          variables[key] = '0';
          variables[`pct-${key}`] = '0 %';
          variables[`%-${key}`] = '0%';
        });
      }
      
      console.log('📊 Variables patrimoine générées:', {
        totalImmo,
        totalFi,
        totalPro,
        totalPatrimoine,
        totalTitle,
        totalCom,
        totalSpouseTitle
      });
      
      // 💰 GÉNÉRATION DES VARIABLES REVENUS ET CHARGES
      console.log('💰 Génération des variables revenus et charges...');
      
      // Charger les données de revenus et charges depuis localStorage
      let revenus: any[] = [];
      let charges: any[] = [];
      
      try {
        const revenusData = localStorage.getItem('budgetRevenusInfo');
        const chargesData = localStorage.getItem('budgetChargesInfo');
        
        if (revenusData) revenus = JSON.parse(revenusData);
        if (chargesData) charges = JSON.parse(chargesData);
        
        console.log('💰 Données budget chargées:', {
          revenus: revenus.length,
          charges: charges.length
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données budget:', error);
      }
      
      // Calculer les totaux
      const totalRevenus = revenus.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalCharges = charges.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // 💰 VARIABLES REVENUS (1-10)
      for (let i = 1; i <= 10; i++) {
        const revenu = revenus[i - 1];
        if (revenu && revenu.denomination) {
          // Intitulé avec toutes les variantes
          Object.assign(variables, generateVariableVariants(`intitule_revenu${i}`, revenu.denomination));
          // Montant avec toutes les variantes
          Object.assign(variables, generateVariableVariants(`montant_revenu${i}`, (revenu.amount || 0).toString()));
        } else {
          // Ligne vide
          variables[`intitule_revenu${i}`] = '';
          variables[`montant_revenu${i}`] = '';
          variables[`eu-montant_revenu${i}`] = '';
        }
      }
      
      // 💸 VARIABLES CHARGES (1-10)
      for (let i = 1; i <= 10; i++) {
        const charge = charges[i - 1];
        if (charge && charge.denomination) {
          // Intitulé avec toutes les variantes
          Object.assign(variables, generateVariableVariants(`intitule_charge${i}`, charge.denomination));
          // Montant avec toutes les variantes
          Object.assign(variables, generateVariableVariants(`montant_charge${i}`, (charge.amount || 0).toString()));
        } else {
          // Ligne vide
          variables[`intitule_charge${i}`] = '';
          variables[`montant_charge${i}`] = '';
          variables[`eu-montant_charge${i}`] = '';
        }
      }
      
      // 📊 TOTAUX REVENUS ET CHARGES
      Object.assign(variables, generateVariableVariants('montant_total__revenus', totalRevenus.toString()));
      Object.assign(variables, generateVariableVariants('montant_total__charges', totalCharges.toString()));
      
      console.log('💰 Variables revenus et charges générées:', {
        totalRevenus,
        totalCharges,
        'revenus source': revenus.length,
        'charges source': charges.length
      });
      
      // 🎯 GÉNÉRATION DES NOUVELLES VARIABLES DEMANDÉES
      console.log('🎯 Génération des nouvelles variables calculées...');
      
      // Chargement des données fiscales depuis localStorage
      let fiscalData: any = {};
      try {
        const fiscalDataString = localStorage.getItem('fiscaliteIRInfo');
        if (fiscalDataString) {
          fiscalData = JSON.parse(fiscalDataString);
          console.log('📊 Données fiscales chargées:', fiscalData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données fiscales:', error);
      }
      
      // 💰 1. CAPACITÉ D'ÉPARGNE ANNUELLE ET MENSUELLE
      const capaciteEpargneAnnuelle = totalRevenus - totalCharges;
      const capaciteEpargneMensuelle = capaciteEpargneAnnuelle / 12;
      
      Object.assign(variables, generateVariableVariants('capacite_epargneAnnuelle', capaciteEpargneAnnuelle.toString()));
      Object.assign(variables, generateVariableVariants('capacite_epargneMensuelle', capaciteEpargneMensuelle.toString()));
      
      // 💳 2. TAUX D'ENDETTEMENT
      // Pour le calcul du taux d'endettement, nous utilisons les charges fixes (crédits et charges récurrentes)
      // divisées par les revenus nets. Pour simplifier, nous utilisons le total des charges / total des revenus
      const tauxEndettement = totalRevenus > 0 ? (totalCharges / totalRevenus) : 0;
      
      Object.assign(variables, generateVariableVariants('taux_endettement', tauxEndettement.toString()));
      
      // 🏛️ 3. DONNÉES FISCALES (IR, TMI, PRESSION FISCALE)
      // L'impôt sur le revenu est calculé et stocké comme impotApresAvantages dans les données fiscales
      // Si négatif, c'est un remboursement, donc on considère 0 pour l'éventuel calcul de ratios
      const impotRevenu = Math.max(0, fiscalData.impotApresAvantages || 0);
      const trancheMarginal = fiscalData.trancheMarginaleDimposition || 0;
      const tauxMoyenImposition = fiscalData.tauxMoyenDimposition || 0;
      
      Object.assign(variables, generateVariableVariants('ir', impotRevenu.toString()));
      Object.assign(variables, generateVariableVariants('tmi', trancheMarginal.toString()));
      Object.assign(variables, generateVariableVariants('pressionFiscaleMoyenne', tauxMoyenImposition.toString()));
      
      console.log('🎯 Nouvelles variables calculées:', {
        capaciteEpargneAnnuelle: capaciteEpargneAnnuelle.toLocaleString(),
        capaciteEpargneMensuelle: capaciteEpargneMensuelle.toLocaleString(),
        tauxEndettement: (tauxEndettement * 100).toFixed(2) + '%',
        impotRevenu: impotRevenu.toLocaleString(),
        trancheMarginal: trancheMarginal + '%',
        tauxMoyenImposition: tauxMoyenImposition + '%'
      });
      
      // 🎯 GÉNÉRATION DES VARIABLES D'OBJECTIFS
      console.log('🎯 Génération des variables d\'objectifs...');
      
      // Chargement des données d'objectifs depuis localStorage
      let objectifsData: any = {};
      try {
        const objectifsDataString = localStorage.getItem('identityObjectifsInfo');
        if (objectifsDataString) {
          objectifsData = JSON.parse(objectifsDataString);
          console.log('🎯 Données d\'objectifs chargées:', objectifsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données d\'objectifs:', error);
      }
      
      // Classification des objectifs selon leur horizon temporel
      const objectifsCourtTerme: string[] = [];
      const objectifsMoyenTerme: string[] = [];
      const objectifsLongTerme: string[] = [];
      
      if (objectifsData.objectives) {
        Object.entries(objectifsData.objectives).forEach(([objectif, data]: [string, any]) => {
          if (data.selected && data.horizon) {
            const horizon = parseInt(data.horizon);
            
            if (horizon >= 1 && horizon <= 5) {
              objectifsCourtTerme.push(objectif);
            } else if (horizon >= 6 && horizon <= 10) {
              objectifsMoyenTerme.push(objectif);
            } else if (horizon >= 11) {
              objectifsLongTerme.push(objectif);
            }
          }
        });
      }
      
      // 🔷 Génération des variables COURT TERME (0-5 ans)
      for (let i = 1; i <= 10; i++) {
        const objectif = objectifsCourtTerme[i - 1];
        if (objectif) {
          Object.assign(variables, generateVariableVariants(`objectifCourtTerme${i}`, `- ${objectif}`));
        } else {
          variables[`objectifCourtTerme${i}`] = '';
        }
      }
      
      // 🔶 Génération des variables MOYEN TERME (6-10 ans)
      for (let i = 1; i <= 10; i++) {
        const objectif = objectifsMoyenTerme[i - 1];
        if (objectif) {
          Object.assign(variables, generateVariableVariants(`objectifMoyenTerme${i}`, `- ${objectif}`));
        } else {
          variables[`objectifMoyenTerme${i}`] = '';
        }
      }
      
      // 🔵 Génération des variables LONG TERME (11+ ans)
      for (let i = 1; i <= 10; i++) {
        const objectif = objectifsLongTerme[i - 1];
        if (objectif) {
          Object.assign(variables, generateVariableVariants(`objectifLongTerme${i}`, `- ${objectif}`));
        } else {
          variables[`objectifLongTerme${i}`] = '';
        }
      }
      
      console.log('🎯 Objectifs classés par terme:', {
        courtTerme: objectifsCourtTerme.length,
        moyenTerme: objectifsMoyenTerme.length,
        longTerme: objectifsLongTerme.length,
        exemples: {
          court: objectifsCourtTerme.slice(0, 2),
          moyen: objectifsMoyenTerme.slice(0, 2),
          long: objectifsLongTerme.slice(0, 2)
        }
      });
      
      // 💰 GÉNÉRATION DES VARIABLES DE BIENS FINANCIERS PAR HORIZON TEMPOREL
      console.log('💰 Tri des biens financiers par horizon temporel...');
      
      // Fonction pour déterminer l'horizon temporel basé sur la performance et le type d'actif
      const getHorizonTemporel = (asset: any): 'CT' | 'MT' | 'LT' => {
        // Logique de classification par horizon temporel
        // Court terme (0-2 ans): Livrets, comptes courants, obligations courtes
        // Moyen terme (3-5 ans): Assurance-vie, PEA, obligations moyennes
        // Long terme (6+ ans): Actions, immobilier financier, PEA ancien
        
        const type = asset.type ? asset.type.toLowerCase() : '';
        const performance = asset.performance || 0;
        
        // Classification par type d'actif
        if (type.includes('livret') || type.includes('compte courant') || type.includes('liquidité')) {
          return 'CT'; // Court terme
        } else if (type.includes('obligation') && performance < 5) {
          return 'CT'; // Obligations courtes
        } else if (type.includes('assurance-vie') || type.includes('pea') || type.includes('obligation')) {
          return 'MT'; // Moyen terme
        } else if (type.includes('action') || type.includes('scpi') || type.includes('fcp') || performance > 7) {
          return 'LT'; // Long terme
        }
        
        // Classification par performance si le type n'est pas déterminant
        if (performance <= 3) {
          return 'CT'; // Faible performance = court terme
        } else if (performance <= 6) {
          return 'MT'; // Performance modérée = moyen terme
        } else {
          return 'LT'; // Forte performance = long terme
        }
      };
      
      // Trier les biens financiers par horizon temporel
      const biensFinanciersCT: any[] = [];
      const biensFinanciersMT: any[] = [];
      const biensFinanciersLT: any[] = [];
      
      financial.forEach((asset: any) => {
        if (asset && asset.denomination) {
          const horizon = getHorizonTemporel(asset);
          
          switch (horizon) {
            case 'CT':
              biensFinanciersCT.push(asset);
              break;
            case 'MT':
              biensFinanciersMT.push(asset);
              break;
            case 'LT':
              biensFinanciersLT.push(asset);
              break;
          }
        }
      });
      
      // Générer les variables pour COURT TERME (0-2 ans)
      for (let i = 1; i <= 10; i++) {
        const asset = biensFinanciersCT[i - 1];
        if (asset) {
          Object.assign(variables, generateVariableVariants(`bienFinancierCT${i}`, asset.denomination));
          Object.assign(variables, generateVariableVariants(`CT${i}`, asset.performance ? `${asset.performance.toFixed(1)}%` : '0%'));
        } else {
          variables[`bienFinancierCT${i}`] = '';
          variables[`CT${i}`] = '';
        }
      }
      
      // Générer les variables pour MOYEN TERME (3-5 ans)
      for (let i = 1; i <= 10; i++) {
        const asset = biensFinanciersMT[i - 1];
        if (asset) {
          Object.assign(variables, generateVariableVariants(`bienFinancierMT${i}`, asset.denomination));
          Object.assign(variables, generateVariableVariants(`MT${i}`, asset.performance ? `${asset.performance.toFixed(1)}%` : '0%'));
        } else {
          variables[`bienFinancierMT${i}`] = '';
          variables[`MT${i}`] = '';
        }
      }
      
      // Générer les variables pour LONG TERME (6+ ans)
      for (let i = 1; i <= 10; i++) {
        const asset = biensFinanciersLT[i - 1];
        if (asset) {
          Object.assign(variables, generateVariableVariants(`bienFinancierLT${i}`, asset.denomination));
          Object.assign(variables, generateVariableVariants(`LT${i}`, asset.performance ? `${asset.performance.toFixed(1)}%` : '0%'));
        } else {
          variables[`bienFinancierLT${i}`] = '';
          variables[`LT${i}`] = '';
        }
      }
      
      console.log('💰 Biens financiers classés par horizon:', {
        courtTerme: biensFinanciersCT.length,
        moyenTerme: biensFinanciersMT.length,
        longTerme: biensFinanciersLT.length,
        exemples: {
          CT: biensFinanciersCT.slice(0, 2).map(a => `${a.denomination} (${a.performance}%)`),
          MT: biensFinanciersMT.slice(0, 2).map(a => `${a.denomination} (${a.performance}%)`),
          LT: biensFinanciersLT.slice(0, 2).map(a => `${a.denomination} (${a.performance}%)`)
        }
      });
      
      // 🤖 GÉNÉRATION DES ANALYSES LLM
      console.log('🤖 Génération des analyses LLM...');
      
      try {
        // Préparer toutes les données localStorage pour le contexte
        const localStorageData = {
          identityPersonalInfo: personal,
          budgetRevenusInfo: revenus,
          budgetChargesInfo: charges,
          patrimoineImmobilierInfo: realEstate,
          patrimoineFinancierInfo: financial,
          patrimoineProfessionnelInfo: professional,
          identityObjectifsInfo: objectifsData,
          fiscaliteIRInfo: fiscalData
        };
        
        // Appel à l'API LLM pour toutes les analyses
        const llmResponse = await fetch('/api/llm-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ localStorageData }),
        });
        
        if (llmResponse.ok) {
          const { analyses } = await llmResponse.json();
          
          // Ajouter les analyses aux variables
          Object.entries(analyses).forEach(([key, value]) => {
            Object.assign(variables, generateVariableVariants(key, value as string));
          });
          
          console.log('🤖 Analyses LLM générées:', Object.keys(analyses));
        } else {
          console.error('Erreur lors de la génération des analyses LLM:', llmResponse.status);
          // Ajouter des variables vides pour éviter les erreurs dans le template
          const llmVariables = ['analyseFluxForcesIA', 'analyseFluxFaiblessesIA', 'poidsFluxIA', 'origineFluxIA', 'perenniteFluxIA', 'analyseTempsLongIA', 'analyseTempsCourtIA', 'profilRisqueIA', 'conformiteIA', 'caracteristiquesCTIA', 'caracteristiquesMTIA', 'caracteristiquesLTIA', 'ameliorationsCTIA', 'ameliorationsMTIA', 'ameliorationsLTIA', 'allocationActifIA', 'analyseStocksFinanciersForcesIA', 'analyseStocksFinanciersFaiblessesIA', 'analyseStocksFinanciersRisquesIA'];
          llmVariables.forEach(varName => {
            variables[varName] = 'Analyse non disponible';
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'appel LLM:', error);
        // Ajouter des variables vides pour éviter les erreurs dans le template
        const llmVariables = ['analyseFluxForcesIA', 'analyseFluxFaiblessesIA', 'poidsFluxIA', 'origineFluxIA', 'perenniteFluxIA', 'analyseTempsLongIA', 'analyseTempsCourtIA', 'profilRisqueIA', 'conformiteIA', 'caracteristiquesCTIA', 'caracteristiquesMTIA', 'caracteristiquesLTIA', 'ameliorationsCTIA', 'ameliorationsMTIA', 'ameliorationsLTIA', 'allocationActifIA', 'analyseStocksFinanciersForcesIA', 'analyseStocksFinanciersFaiblessesIA', 'analyseStocksFinanciersRisquesIA'];
        llmVariables.forEach(varName => {
          variables[varName] = 'Analyse non disponible';
        });
      }
      
      console.log(`📊 ${Object.keys(variables).length} variables générées en ${Date.now() - startTime}ms`);
      
      // Debug: afficher quelques variables importantes
      console.log('🔍 Variables de test:');
      console.log('- title:', variables.title);
      console.log('- M-title:', variables['M-title']);
      console.log('- lastName:', variables.lastName);
      console.log('- MM-lastName:', variables['MM-lastName']);
      console.log('- profession:', variables.profession);
      console.log('- mm-profession:', variables['mm-profession']);
      console.log('- eu-totalImmo:', variables['eu-totalImmo']);
      console.log('- pct-totalImmo:', variables['pct-totalImmo']);
      console.log('- eu-titleImmo1:', variables['eu-titleImmo1']);
      console.log('- eu-comImmo1:', variables['eu-comImmo1']);
      console.log('- eu-spouseTitleImmo1:', variables['eu-spouseTitleImmo1']);
      console.log('- eu-montant_total__revenus:', variables['eu-montant_total__revenus']);
      console.log('- eu-montant_total__charges:', variables['eu-montant_total__charges']);
      console.log('- intitule_revenu1:', variables['intitule_revenu1']);
      console.log('- eu-montant_revenu1:', variables['eu-montant_revenu1']);
      console.log('- intitule_charge1:', variables['intitule_charge1']);
      console.log('- eu-montant_charge1:', variables['eu-montant_charge1']);
      // Nouvelles variables
      console.log('- eu-capacite_epargneAnnuelle:', variables['eu-capacite_epargneAnnuelle']);
      console.log('- eu-capacite_epargneMensuelle:', variables['eu-capacite_epargneMensuelle']);
      console.log('- pct-taux_endettement:', variables['pct-taux_endettement']);
      console.log('- eu-ir:', variables['eu-ir']);
      console.log('- tmi:', variables['tmi']);
      console.log('- pct-pressionFiscaleMoyenne:', variables['pct-pressionFiscaleMoyenne']);
      // Variables d'objectifs
      console.log('- objectifCourtTerme1:', variables['objectifCourtTerme1']);
      console.log('- objectifMoyenTerme1:', variables['objectifMoyenTerme1']);
      console.log('- objectifLongTerme1:', variables['objectifLongTerme1']);
      // Variables biens financiers par horizon temporel
      console.log('- bienFinancierCT1:', variables['bienFinancierCT1']);
      console.log('- CT1:', variables['CT1']);
      console.log('- bienFinancierMT1:', variables['bienFinancierMT1']);
      console.log('- MT1:', variables['MT1']);
      console.log('- bienFinancierLT1:', variables['bienFinancierLT1']);
      console.log('- LT1:', variables['LT1']);
      // Variables immobilières détaillées
      console.log('- valeurNette1:', variables['valeurNette1']);
      console.log('- eu-valeurNette1:', variables['eu-valeurNette1']);
      console.log('- surface1:', variables['surface1']);
      console.log('- rendement1:', variables['rendement1']);
      console.log('- pct-rendement1:', variables['pct-rendement1']);
      console.log('- emplacement1:', variables['emplacement1']);
      console.log('- dpe1:', variables['dpe1']);
      console.log('- ges1:', variables['ges1']);
      // Variables d'analyses LLM
      console.log('- analyseFluxForcesIA:', variables['analyseFluxForcesIA'] ? variables['analyseFluxForcesIA'].substring(0, 50) + '...' : 'non disponible');
      console.log('- analyseFluxFaiblessesIA:', variables['analyseFluxFaiblessesIA'] ? variables['analyseFluxFaiblessesIA'].substring(0, 50) + '...' : 'non disponible');
      console.log('- analyseStocksFinanciersForcesIA:', variables['analyseStocksFinanciersForcesIA'] ? variables['analyseStocksFinanciersForcesIA'].substring(0, 50) + '...' : 'non disponible');
      
      // Appel à l'API rapide
      const response = await fetch('/api/export-pdf-fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Télécharger le PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analyse-patrimoniale-rapide-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Export PDF rapide terminé en ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
      
    } catch (error) {
      console.error('❌ Erreur export PDF rapide:', error);
      // On peut ajouter un toast ou une notification d'erreur ici
    } finally {
      setIsExportingFast(false);
    }
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
                <BreadcrumbPage>
                  Préconisations - {currentStep === 'selection' ? 'Sélection' : 'Finalisation'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="ml-auto px-4 flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {currentStep === 'selection' ? (
          <>
            {/* Header avec progress bar intégrée */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <span className="font-medium text-blue-600">Sélection</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full mx-4 max-w-32">
                    <div className="h-full bg-blue-600 rounded-full" style={{width: '50%'}}></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <span className="text-gray-500">Finalisation</span>
                  </div>
                </div>

              </div>
            </div>

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
            
            {/* Bouton de navigation en bas */}
            <div className="sticky bottom-0 bg-background border-t border-border p-4 mt-8">
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  variant="default" 
                  onClick={() => setCurrentStep('finalization')}
                  disabled={selectedPreconisations.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                >
                  <span className="mr-2">➤</span>
                  Suivant - Finaliser l'analyse
                </Button>
              </div>
              {selectedPreconisations.length === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Sélectionnez au moins une préconisation pour continuer
                </p>
              )}
            </div>
          </>
        ) : (
          // Étape de finalisation
          <FinalizationStep 
            selectedPreconisations={selectedPreconisations}
            filteredRecommendations={filteredRecommendations}
            customPriorities={customPriorities}
            exportToPDFRapide={exportToPDFRapide}
            isExportingFast={isExportingFast}
            setCurrentStep={setCurrentStep}
          />
        )}
      </div>
    </SidebarInset>
  )
}
