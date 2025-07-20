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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Spinner } from "@/components/ui/spinner"
import { Lightbulb, FileText, Download, Volume2, TrendingUp, Shield, PiggyBank, Users, Gift, HeartHandshake, Check, ShoppingCart, X } from "lucide-react"
import { exportToPDF as exportToPDFExternal } from "@/lib/pdf-export"
import { loadTestDataToLocalStorage, checkCurrentData, clearTestData } from "@/lib/test-data"

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
  const [exportProgress, setExportProgress] = useState(0);
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
    setExportProgress(0);
    
    try {
      // Étape 1 : Préparation
      setExportProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Étape 2 : Génération du document
      setExportProgress(60);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Étape 3 : Export PDF avec la fonction externe
      setExportProgress(80);
      const success = await exportToPDFExternal();
      
      if (success) {
        setExportProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        setExportDialogOpen(false);
      } else {
        throw new Error('Erreur lors de l\'export PDF');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setExportError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Fonction utilitaire pour obtenir la couleur de priorité
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
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSelected = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED);
      if (savedSelected) {
        setSelectedPreconisations(JSON.parse(savedSelected));
      }
      
      const savedPriorities = localStorage.getItem(LOCAL_STORAGE_KEY_PRIORITIES);
      if (savedPriorities) {
        setCustomPriorities(JSON.parse(savedPriorities));
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
      // {{M-variable}} = Majuscule puis minuscule (ex: "MONSIEUR" → "Monsieur")
      // {{m-variable}} = tout en minuscule (ex: "MONSIEUR" → "monsieur")
      // {{MM-variable}} = tout en majuscule (ex: "monsieur" → "MONSIEUR")
      // {{cap-variable}} = Première lettre de chaque mot en majuscule (ex: "jean dupont" → "Jean Dupont")
      // {{eu-variable}} = format euros (ex: "1000" → "1 000,00 €")
      // {{pct-variable}} = format pourcentage (ex: "15" → "15%")
      // {{nb-variable}} = format nombre avec espaces (ex: "1000" → "1 000")
      // {{k-variable}} = format milliers (ex: "1000" → "1k")
      // {{ord-variable}} = format ordinal (ex: "1" → "1er", "2" → "2ème")
      const applyFormatPrefix = (value: string, prefix: string): string => {
        if (!value) return '';
        
        switch (prefix) {
          case 'M': // Majuscule puis minuscule
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
          case 'm': // tout en minuscule
            return value.toLowerCase();
          case 'MM': // tout en majuscule
            return value.toUpperCase();
          case 'cap': // Première lettre de chaque mot en majuscule
            return value.replace(/\b\w/g, l => l.toUpperCase());
          case 'eu': // format euros - arrondi à l'entier supérieur
            const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            if (isNaN(numValue)) return value;
            const roundedValue = Math.ceil(numValue); // Arrondi à l'entier supérieur
            return `${roundedValue.toLocaleString('fr-FR')} €`;
          case 'pct': // format pourcentage - arrondi à l'entier
            const pctValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            if (isNaN(pctValue)) return value;
            const roundedPct = Math.round(pctValue); // Arrondi à l'entier
            return `${roundedPct} %`;
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
        const prefixes = ['M', 'm', 'MM', 'cap', 'eu', 'pct', 'nb', 'k', 'ord'];
        
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
        
        // Informations méta
        'dateGeneration': new Date().toLocaleDateString('fr-FR'),
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
        
        const pctImmoVars = generateVariableVariants('totalImmo', pctImmo);
        const pctFiVars = generateVariableVariants('totalFi', pctFi);
        const pctProVars = generateVariableVariants('totalPro', pctPro);
        
        // Ajouter toutes les variables
        Object.assign(patrimoineVars, totalImmoVars, totalFiVars, totalProVars);
        
        // Ajouter spécifiquement les variables de pourcentage formatées
        patrimoineVars['pct-totalImmo'] = applyFormatPrefix(pctImmo, 'pct');
        patrimoineVars['pct-totalFi'] = applyFormatPrefix(pctFi, 'pct');
        patrimoineVars['pct-totalPro'] = applyFormatPrefix(pctPro, 'pct');
        
        patrimoineVars['totalTitle'] = totalTitle.toString();
        patrimoineVars['totalCom'] = totalCom.toString();
        patrimoineVars['totalSpouseTitle'] = totalSpouseTitle.toString();
        patrimoineVars['totalPat'] = totalPatrimoine.toString();
        
        return patrimoineVars;
      };
      
      // Générer les variables de patrimoine
      const patrimoineVariables = generatePatrimoineVariables();
      
      // Fusionner avec les variables de base
      Object.assign(baseVariables, patrimoineVariables);

      // Générer les blocs conditionnels
      const conditionalBlocks = generateConditionalBlocks(baseVariables, clientInfo);
      
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
      console.log('📄 Nombre de préconisations:', selectedPreconisationsDetails.length);
      
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
      
      // 🧩 NETTOYAGE INTELLIGENT DES LIGNES VIDES DANS LES TABLEAUX
      // Instructions pour Google Apps Script :
      // - Supprimer les lignes de tableau où TOUTES les colonnes sont vides
      
      // Identifier les variables vides pour le nettoyage
      const emptyVariables: string[] = [];
      Object.entries(variables).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          emptyVariables.push(key);
        }
      });
      
      // OPTIMISATION: Filtrer les variables vides inutiles (garder seulement celles nécessaires)
      const filteredVariables: { [key: string]: any } = {};
      Object.entries(variables).forEach(([key, value]) => {
        // Garder les variables avec valeur OU les variables principales vides (pour template)
        if (value !== '' && value !== null && value !== undefined) {
          filteredVariables[key] = value;
        } else if (key.match(/^(bienImmobilier|titleImmo|comImmo|spouseTitleImmo|bienFinancier|titleFi|comFi|spouseTitleFi|bienProfessionnel|titlePro|comPro|spouseTitlePro|eu-)/)) {
          filteredVariables[key] = '';
        }
      });
      
      // Ajouter les variables de contrôle
      filteredVariables['_CLEAN_EMPTY_ROWS'] = 'smart';
      filteredVariables['_CLEAN_TABLES'] = 'patrimoine,finances';
      filteredVariables['_EMPTY_VARIABLES'] = emptyVariables.join(',');
      
      console.log(`⚡ Optimisation: ${Object.keys(variables).length} → ${Object.keys(filteredVariables).length} variables`);
      
      // 🔧 URL Google Apps Script
      const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztzaYKReSnMMi_vdJiuOn9-f4IFN8EtsO6q09rzSesgrwxO0JSByMSTfvQJRIImQBrKw/exec';
      
      console.log('🚀 Envoi optimisé vers Google Apps Script...');
      
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ variables: filteredVariables }),
      });
      
      console.log('Réponse du serveur:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Résultat parsé:', result);
      
      if (result.success) {
        console.log('✅ PDF généré avec succès!');
        
        // Télécharger automatiquement le PDF
        const byteCharacters = atob(result.pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `preconisations_${clientInfo.firstName}_${clientInfo.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Définir pdfData pour afficher le message de succès
        setPdfData(result);
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
          {/* Boutons de test pour développement */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              loadTestDataToLocalStorage();
              window.location.reload();
            }}
            className="text-xs"
          >
            🧪 Test Data
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkCurrentData}
            className="text-xs"
          >
            📊 Check Data
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              clearTestData();
              window.location.reload();
            }}
            className="text-xs"
          >
            🗑️ Clear
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" onClick={exportToPDFExternal}>
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
              <div className="min-h-[60px] max-h-[240px] overflow-y-auto pr-1">
                {selectedPreconisations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
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
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-sm font-medium">Aucune préconisation sélectionnée</h3>
                  </div>
                )}
              </div>
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
        
        {/* Nouveau Dialog d'export PDF moderne */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="sm:max-w-[850px]">
            <DialogHeader>
              <DialogTitle>
                {isExporting 
                  ? "Génération de votre étude patrimoniale" 
                  : exportError 
                    ? "Erreur d'export" 
                    : "Export de l'étude patrimoniale"
                }
              </DialogTitle>
              <DialogDescription>
                {isExporting 
                  ? "Création de votre document PDF personnalisé..." 
                  : exportError 
                    ? "Une erreur est survenue lors de l'exportation" 
                    : `Export de votre étude avec ${selectedPreconisations.length} préconisation${selectedPreconisations.length > 1 ? 's' : ''} sélectionnée${selectedPreconisations.length > 1 ? 's' : ''}`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Résumé des préconisations sélectionnées */}
              {!isExporting && !exportError && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Préconisations incluses :</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {preconisations
                      .filter(preco => selectedPreconisations.includes(preco.id))
                      .map(preco => {
                        const priority = customPriorities[preco.id] || preco.priority;
                        return (
                          <div key={preco.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{preco.title}</p>
                            </div>
                            <Badge className={getPriorityColor(priority)}>
                              {priority}
                            </Badge>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
              
              {/* Progress bar pendant l'export */}
              {isExporting && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Progression de l'export
                    </p>
                    <Progress value={exportProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {exportProgress}% - {exportProgress < 30 ? 'Préparation...' : 
                                          exportProgress < 70 ? 'Génération du document...' : 
                                          exportProgress < 100 ? 'Export PDF...' : 'Terminé !'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Message d'erreur */}
              {exportError && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                      <X className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Erreur d'exportation</h4>
                    <p className="text-sm text-muted-foreground">{exportError}</p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              {!isExporting && (
                <>
                  <DialogClose asChild>
                    <Button variant="outline">
                      Annuler
                    </Button>
                  </DialogClose>
                  {!exportError && (
                    <Button onClick={exportToPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Générer le PDF
                    </Button>
                  )}
                  {exportError && (
                    <Button onClick={exportToPDF}>
                      Réessayer
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
