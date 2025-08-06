"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Users, FileText, Download, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function Page() {
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Fonction pour importer des données complètes d'un client fictif
  const importFictionalClientData = async () => {
    setIsImporting(true);
    
    try {
      // Nettoyer d'abord le localStorage pour éviter les conflits
      const keysToClean = [
        'identityPersonalInfo',
        'identityObjectifsInfo', 
        'identityInvestorInfo',
        'patrimoineImmobilierInfo',
        'patrimoineFinancierInfo',
        'patrimoineProfessionnelInfo',
        'budgetRevenusInfo',
        'budgetChargesInfo'
      ];
      
      keysToClean.forEach(key => {
        localStorage.removeItem(key);
      });
      // Données d'identité personnelle (avec valeurs exactes des formulaires)
      const personalInfo = {
        title: "monsieur",
        firstName: "Jean",
        lastName: "Dupont",
        birthName: "Dupont",
        age: "45",
        birthDate: "1979-03-15", // Format ISO pour input date
        birthPostalCode: "75001",
        birthCity: "Paris",
        city: "Neuilly-sur-Seine",
        country: "France",
        nationality: "francaise", // Valeur exacte du dropdown
        legalCapacity: "majeur-capable", // Valeur exacte du dropdown
        mifClassification: "non-professionnel", // Valeur exacte du dropdown
        retirementAge: "62",
        // Informations conjoint
        spouseTitle: "madame",
        spouseFirstName: "Marie",
        spouseLastName: "Dupont",
        spouseBirthName: "Martin",
        spouseAge: "42",
        spouseBirthDate: "1982-07-22", // Format ISO pour input date
        spouseBirthPostalCode: "69001",
        spouseBirthCity: "Lyon",
        spouseCity: "Neuilly-sur-Seine",
        spouseCountry: "France",
        spouseNationality: "francaise", // Valeur exacte du dropdown
        spouseLegalCapacity: "majeur-capable", // Valeur exacte du dropdown
        spouseRetirementAge: "62",
        // Situation familiale
        maritalStatus: "marie", // Valeur exacte du dropdown
        marriageDate: "2005-06-10", // Format ISO pour input date
        marriagePlace: "Paris 16ème",
        matrimonialRegime: "communaute-reduite", // Valeur exacte du dropdown
        nbChildren: "2",
        parent1Name: "Paul Dupont",
        parent2Name: "Sophie Martin",
        // Informations professionnelles
        profession: "Ingénieur informatique",
        company: "TechCorp France",
        csp: "38", // Code CSP exact pour "Ingénieurs et cadres techniques d'entreprise"
        spouseProfession: "Architecte",
        spouseCompany: "Atelier Design",
        spouseCsp: "31", // Code CSP exact pour "Professions libérales"
        // Données des enfants avec tous les champs requis
        children: [
          {
            id: "1",
            firstName: "Emma",
            birthDate: "2010-05-15",
            age: "14",
            parentage: "commun",
            dependant: "oui",
            studies: "scolarite",
            handicap: "non"
          },
          {
            id: "2", 
            firstName: "Lucas",
            birthDate: "2012-09-22",
            age: "12",
            parentage: "commun",
            dependant: "oui",
            studies: "scolarite",
            handicap: "non"
          }
        ]
      };

      // Objectifs patrimoniaux (avec toutes les valeurs détaillées)
      const objectives = {
        primaryObjective: "preparation-retraite",
        secondaryObjective: "transmission-patrimoine",
        timeHorizon: "long-terme", // >10 ans
        riskTolerance: "modere",
        liquidityNeeds: "moyenne",
        investmentExperience: "confirme",
        specificProjects: "Achat résidence secondaire, éducation des enfants",
        retirementGoals: "Maintenir le niveau de vie actuel",
        inheritanceGoals: "Transmettre 70% du patrimoine aux enfants",
        targetRetirementIncome: "8000",
        currentSavingsRate: "25",
        expectedRetirementAge: "62",
        targetLegacyAmount: "500000",
        liquidityBuffer: "6", // mois
        emergencyFund: "50000"
      };

      // Profil investisseur (avec valeurs exactes des dropdowns)
      const investorProfile = {
        riskProfile: "modere",
        investmentHorizon: "long-terme",
        knowledgeLevel: "confirme",
        previousExperience: "Actions, obligations, immobilier, SCPI",
        maxLossAcceptable: "15", // pourcentage sans le %
        preferredAssets: ["immobilier", "actions-europeennes", "obligations"],
        excludedAssets: ["crypto-monnaies", "produits-derives"],
        investmentObjectives: ["croissance", "revenus"],
        portfolioAllocation: {
          actions: "40",
          obligations: "30",
          immobilier: "20",
          liquidites: "10"
        },
        rebalancingFrequency: "annuelle",
        esgPreferences: "important"
      };

      // Patrimoine immobilier (avec tous les champs obligatoires correspondant aux types Property)
      const patrimoineImmobilierInfo = [
        {
          id: "1",
          type: "appartement",
          denomination: "Résidence principale",
          postalCode: "92200",
          city: "Neuilly-sur-Seine",
          surface: 120,
          pricePerSqm: 7916,
          fullOwnershipValue: 950000,
          evolutionPercentage: 3.5,
          ownershipMode: "pleine-propriete",
          ownershipPercentage: 100,
          ownedBy: "Commun",
          dpe: "C",
          ges: "C",
          grossValue: 950000,
          attachedDebts: 180000,
          netValue: 770000
        },
        {
          id: "2",
          type: "appartement",
          denomination: "Appartement locatif",
          postalCode: "75001",
          city: "Paris",
          surface: 65,
          pricePerSqm: 10462,
          fullOwnershipValue: 680000,
          evolutionPercentage: 3.0,
          ownershipMode: "pleine-propriete",
          ownershipPercentage: 100,
          ownedBy: "Vous",
          dpe: "D",
          ges: "D",
          grossValue: 680000,
          attachedDebts: 0,
          netValue: 680000
        }
      ];

      // Patrimoine financier (avec valeurs exactes et types corrigés)
      const patrimoineFinancierInfo = [
        {
          id: "1",
          type: "Assurance vie",
          denomination: "Contrat AXA Multisupports",
          fullOwnershipValue: 185000,
          realValue: 185000,
          ownershipMode: "Pleine propriété",
          ownershipPercentage: 100,
          ownedBy: "Vous",
          performance: 3.2
        },
        {
          id: "2",
          type: "PEA",
          denomination: "PEA BNP Paribas",
          fullOwnershipValue: 95000,
          realValue: 95000,
          ownershipMode: "Pleine propriété",
          ownershipPercentage: 100,
          ownedBy: "Vous",
          performance: 6.8
        },
        {
          id: "3",
          type: "Livret A",
          denomination: "Livret A Crédit Agricole",
          fullOwnershipValue: 22950,
          realValue: 22950,
          ownershipMode: "Commun",
          ownershipPercentage: 50,
          ownedBy: "Commun",
          performance: 3.0
        },
        {
          id: "4",
          type: "SCPI",
          denomination: "SCPI Corum Européenne",
          fullOwnershipValue: 45000,
          realValue: 45000,
          ownershipMode: "Commun",
          ownershipPercentage: 50,
          ownedBy: "Commun",
          performance: 4.5
        }
      ];

      // Patrimoine professionnel (avec valeurs exactes et types corrigés)
      const patrimoineProfessionnelInfo = [
        {
          id: "1",
          assetName: "PERP",
          category: "perp",
          value: 45000,
          ownership: "Vous",
          institution: "Generali",
          annualReturn: 2.8,
          riskLevel: "faible",
          notes: "Plan d'épargne retraite populaire"
        }
      ];

      // Budget - Revenus (avec valeurs exactes et types corrigés)
      const revenuInfo = [
        {
          id: "1",
          intitule: "Salaire Jean",
          montant: 6500,
          periodicite: "mensuel",
          type: "salaire",
          fiscalite: "imposable",
          netBrut: "net",
          evolutionPrevue: 2,
          notes: "Salaire ingénieur informatique"
        },
        {
          id: "2",
          intitule: "Salaire Marie",
          montant: 4800,
          periodicite: "mensuel",
          type: "salaire",
          fiscalite: "imposable",
          netBrut: "net",
          evolutionPrevue: 2,
          notes: "Salaire architecte"
        },
        {
          id: "3",
          intitule: "Loyers appartement",
          montant: 2800,
          periodicite: "mensuel",
          type: "revenus-fonciers",
          fiscalite: "imposable",
          evolutionPrevue: 1,
          notes: "Revenus locatifs Paris"
        }
      ];

      // Budget - Charges (avec valeurs exactes et types corrigés)
      const chargeInfo = [
        {
          id: "1",
          intitule: "Crédit immobilier",
          montant: 2200,
          periodicite: "mensuel",
          type: "credit-immobilier",
          obligatoire: true,
          evolutionPrevue: 0,
          dateFinPrevue: "2030-03-15",
          notes: "Crédit résidence principale"
        },
        {
          id: "2",
          intitule: "Charges copropriété",
          montant: 450,
          periodicite: "mensuel",
          type: "charges-logement",
          obligatoire: true,
          evolutionPrevue: 2,
          notes: "Syndic et entretien"
        },
        {
          id: "3",
          intitule: "Alimentation",
          montant: 800,
          periodicite: "mensuel",
          type: "alimentation",
          obligatoire: true,
          evolutionPrevue: 2,
          notes: "Courses et repas famille"
        },
        {
          id: "4",
          intitule: "Frais scolaires enfants",
          montant: 1200,
          periodicite: "mensuel",
          type: "education",
          obligatoire: false,
          evolutionPrevue: 3,
          dateFinPrevue: "2040-06-30",
          notes: "Scolarité et activités"
        },
        {
          id: "5",
          intitule: "Assurances diverses",
          montant: 350,
          periodicite: "mensuel",
          type: "assurances",
          obligatoire: true,
          evolutionPrevue: 2,
          notes: "Auto, habitation, santé"
        },
        {
          id: "6",
          intitule: "Impôts sur le revenu",
          montant: 2100,
          periodicite: "mensuel",
          type: "impots",
          obligatoire: true,
          evolutionPrevue: 2,
          notes: "Prélèvement mensuel"
        }
      ];

      // Sauvegarder toutes les données dans localStorage avec les bonnes clés
      localStorage.setItem('identityPersonalInfo', JSON.stringify(personalInfo));
      localStorage.setItem('identityObjectifsInfo', JSON.stringify(objectives));
      localStorage.setItem('identityInvestorInfo', JSON.stringify(investorProfile));
      localStorage.setItem('patrimoineImmobilierInfo', JSON.stringify(patrimoineImmobilierInfo));
      localStorage.setItem('patrimoineFinancierInfo', JSON.stringify(patrimoineFinancierInfo));
      localStorage.setItem('patrimoineProfessionnelInfo', JSON.stringify(patrimoineProfessionnelInfo));
      localStorage.setItem('budgetRevenusInfo', JSON.stringify(revenuInfo));
      localStorage.setItem('budgetChargesInfo', JSON.stringify(chargeInfo));
      
      console.log('✅ Toutes les données ont été importées avec succès!');
      console.log('📋 Données sauvegardées:', {
        identityPersonalInfo: personalInfo,
        patrimoineImmobilierInfo: patrimoineImmobilierInfo.length + ' biens',
        patrimoineFinancierInfo: patrimoineFinancierInfo.length + ' actifs',
        budgetRevenusInfo: revenuInfo.length + ' revenus',
        budgetChargesInfo: chargeInfo.length + ' charges'
      });

      // Simuler un délai pour le feedback utilisateur
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
      
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Tableau de bord</h1>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patrimoine Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ 0</div>
              <p className="text-xs text-muted-foreground">Commencez par saisir vos informations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Annuels</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ 0</div>
              <p className="text-xs text-muted-foreground">Aucun revenu saisi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Simulations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Aucune simulation créée</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Préconisations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">En attente d'analyse</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Bienvenue sur Omet Patrimoine</CardTitle>
              <CardDescription>Votre plateforme d'analyse patrimoniale moderne et complète</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <Building2 className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Commencez par vos informations personnelles</p>
                    <p className="text-sm text-muted-foreground">
                      Saisissez vos données d'identité et vos objectifs patrimoniaux
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/identity/personal">Commencer</Link>
                  </Button>
                </div>

                {/* Bouton Importer des données */}
                <div className="flex items-center space-x-4 rounded-md border p-4 bg-purple-50 border-purple-200">
                  <User className="h-6 w-6 text-purple-600" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-purple-900">
                      Ou testez avec des données pré-remplies
                    </p>
                    <p className="text-sm text-purple-700">
                      Importez un profil client complet pour découvrir toutes les fonctionnalités
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={importFictionalClientData}
                    disabled={isImporting}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    {isImporting ? (
                      <>
                        <Download className="w-4 h-4 mr-2 animate-spin" />
                        Import...
                      </>
                    ) : importSuccess ? (
                      <>
                        <User className="w-4 h-4 mr-2 text-green-600" />
                        Importé !
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Importer
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center space-x-4 rounded-md border p-4 opacity-50">
                  <TrendingUp className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Analysez votre patrimoine</p>
                    <p className="text-sm text-muted-foreground">Obtenez des recommandations personnalisées</p>
                  </div>
                  <Button size="sm" disabled>
                    Bientôt disponible
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Fonctionnalités</CardTitle>
              <CardDescription>Découvrez tout ce que vous pouvez faire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Gestion du patrimoine immobilier</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Suivi des actifs financiers</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Analyse fiscale complète</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Simulations avancées</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Préconisations personnalisées</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Export PDF et PowerPoint</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Agent vocal IA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
