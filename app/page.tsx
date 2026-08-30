"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Users, FileText, Download, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"

// Types pour les données du localStorage
interface Property {
  netValue: number;
}

interface FinancialAsset {
  realValue: number;
}

interface ProfessionalAsset {
  valuation: number;
}

interface Income {
  amount: number;
}

export default function Page() {
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // États pour les données calculées
  const [patrimoineTotal, setPatrimoineTotal] = useState(0);
  const [revenuAnnuel, setRevenuAnnuel] = useState(0);
  const [simulationsCount, setSimulationsCount] = useState(0);
  const [preconisationsCount, setPreconisationsCount] = useState(0);
  const [hasData, setHasData] = useState(false);

  // Fonction pour charger les données depuis le localStorage
  const loadDataFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Calculer le patrimoine total
      let totalPatrimoine = 0;

      // Patrimoine immobilier
      const immobilierStr = localStorage.getItem('patrimoineImmobilierInfo');
      if (immobilierStr) {
        const immobilier: Property[] = JSON.parse(immobilierStr);
        totalPatrimoine += immobilier.reduce((sum, item) => sum + (item.netValue || 0), 0);
      }

      // Patrimoine financier
      const financierStr = localStorage.getItem('patrimoineFinancierInfo');
      if (financierStr) {
        const financier: FinancialAsset[] = JSON.parse(financierStr);
        totalPatrimoine += financier.reduce((sum, item) => sum + (item.realValue || 0), 0);
      }

      // Patrimoine professionnel
      const professionnelStr = localStorage.getItem('patrimoineProfessionnelInfo');
      if (professionnelStr) {
        const professionnel: ProfessionalAsset[] = JSON.parse(professionnelStr);
        totalPatrimoine += professionnel.reduce((sum, item) => sum + (item.valuation || 0), 0);
      }

      setPatrimoineTotal(totalPatrimoine);

      // Calculer le revenu annuel (revenus mensuels × 12)
      const revenusStr = localStorage.getItem('budgetRevenusInfo');
      if (revenusStr) {
        const revenus: Income[] = JSON.parse(revenusStr);
        const revenuMensuel = revenus.reduce((sum, item) => sum + (item.amount || 0), 0);
        setRevenuAnnuel(revenuMensuel * 12);
      } else {
        setRevenuAnnuel(0);
      }

      // Compter les simulations
      // Les simulations peuvent être stockées sous différentes clés
      let simCount = 0;
      const simulationKeys = ['simulationCessionImmobiliere', 'simulationDMTG', 'simulationAllocation'];
      simulationKeys.forEach(key => {
        if (localStorage.getItem(key)) simCount++;
      });
      setSimulationsCount(simCount);

      // Compter les préconisations sélectionnées
      const precoStr = localStorage.getItem('selectedPreconisations');
      if (precoStr) {
        const precos = JSON.parse(precoStr);
        setPreconisationsCount(Array.isArray(precos) ? precos.length : 0);
      } else {
        setPreconisationsCount(0);
      }

      // Vérifier s'il y a des données
      const hasAnyData = !!(immobilierStr || financierStr || professionnelStr || revenusStr);
      setHasData(hasAnyData);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    loadDataFromStorage();
  }, [loadDataFromStorage]);

  // Fonction pour importer des données complètes d'un client fictif
  const importFictionalClientData = async () => {
    setIsImporting(true);

    try {
      // Nettoyer d'abord le localStorage pour éviter les conflits
      const keysToClean = [
        'identityPersonalInfo',
        'identityObjectifsInfo',
        'identityInvestorProfileInfo',
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
        spouseTitle: "madame",
        spouseFirstName: "Marie",
        spouseLastName: "Dupont",
        spouseBirthName: "Martin",
        birthDate: "1979-03-15",
        spouseBirthDate: "1982-07-22",
        age: "45",
        spouseAge: "42",
        birthPostalCode: "75001",
        spouseBirthPostalCode: "69001",
        city: "Neuilly-sur-Seine",
        spouseCity: "Neuilly-sur-Seine",
        country: "France",
        spouseCountry: "France",
        nationality: "Française",
        spouseNationality: "Française",
        legalCapacity: "majeur-capable",
        spouseLegalCapacity: "majeur-capable",
        mifClassification: "non-professionnel",
        maritalStatus: "marie",
        marriageDate: "2005-06-10",
        marriagePlace: "Paris 16ème",
        matrimonialRegime: "communaute-reduite",
        children: [
          {
            firstName: "Emma",
            lastName: "Dupont",
            birthDate: "2010-05-15",
            parentage: "commun",
          },
          {
            firstName: "Lucas",
            lastName: "Dupont",
            birthDate: "2012-09-22",
            parentage: "commun",
          },
        ],
        liberalities: "",
        liberalitiesAmount: "",
        lastWillDonation: "",
        lastWillDonationType: "",
        spouseLastWillDonation: "",
        spouseLastWillDonationType: "",
        profession: "Ingénieur informatique",
        spouseProfession: "Architecte",
        company: "TechCorp France",
        spouseCompany: "Atelier Design",
        csp: "38",
        spouseCsp: "31",
        retirementAge: "62",
        spouseRetirementAge: "62",
      };

      // Objectifs patrimoniaux (conformes à identityObjectifsInfo)
      const identityObjectivesInfo = {
        objectives: {
          "Se constituer une épargne de précaution": { selected: true, horizon: "1" },
          "Constituer, valoriser, diversifier un capital sur le long terme": { selected: true, horizon: "12" },
          "Obtenir des revenus complémentaires": { selected: true, horizon: "6" },
          "Préparer sa retraite": { selected: true, horizon: "15" },
          "Aider ses enfants": { selected: true, horizon: "8" },
        },
        monthlySavings: "800",
        precautionarySavings: "20000",
      };

      // Profil investisseur (conforme à identityInvestorProfileInfo)
      const identityInvestorProfileInfo = {
        userProfile: {
          knowledge: { label: "Informé", esgDetails: { envActivities: null, envSocialObjective: null, negativeImpacts: null } },
          risk: { label: "Équilibré", esgDetails: { envActivities: null, envSocialObjective: null, negativeImpacts: null } },
          capacity: { label: "Élevée", esgDetails: { envActivities: null, envSocialObjective: null, negativeImpacts: null } },
          esg: { label: "Modérée", esgDetails: { envActivities: null, envSocialObjective: null, negativeImpacts: null } },
        },
        spouseProfile: null,
      };

      // Patrimoine immobilier (conforme au type Property de /patrimoine/immobilier)
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
          netValue: 770000,
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
          netValue: 680000,
        },
      ];

      // Patrimoine financier (conforme au type FinancialAsset de /patrimoine/financier)
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
          performance: 3.2,
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
          performance: 6.8,
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
          performance: 3.0,
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
          performance: 4.5,
        },
      ];

      // Patrimoine professionnel (conforme à patrimoineProfessionnelInfo)
      const patrimoineProfessionnelInfo = [
        {
          id: "1",
          companyName: "SARL Atelier Design",
          activity: "Architecture",
          shareOwnership: "Parts sociales",
          ownershipPercentage: 50,
          willToTransfer: "Oui",
          ownership: "Commun",
          valuation: 120000,
        },
        {
          id: "2",
          companyName: "EI Conseil Tech",
          activity: "Conseil informatique",
          shareOwnership: "Entreprise individuelle",
          ownershipPercentage: 100,
          willToTransfer: "Non",
          ownership: "Vous",
          valuation: 85000,
        },
      ];

      // Budget - Revenus (conforme au type Income de /budget/revenus)
      const revenuInfo = [
        {
          id: "1",
          type: "Salaires",
          denomination: "Salaire Jean",
          amount: 6500,
          ownedBy: "Vous",
          fiscalRegime: "Aucun régime (déduction automatique de 10%)",
        },
        {
          id: "2",
          type: "Salaires",
          denomination: "Salaire Marie",
          amount: 4800,
          ownedBy: "Votre conjoint",
          fiscalRegime: "Aucun régime (déduction automatique de 10%)",
        },
        {
          id: "3",
          type: "Revenus fonciers",
          denomination: "Loyers appartement Paris",
          amount: 2800,
          ownedBy: "Vous",
          fiscalRegime: "Micro-foncier",
        },
        {
          id: "4",
          type: "Revenus mobiliers",
          denomination: "Dividendes PEA",
          amount: 400,
          ownedBy: "Vous",
          fiscalRegime: "PFU",
        },
        {
          id: "5",
          type: "Revenus industriels et commerciaux",
          denomination: "Activité freelance",
          amount: 1200,
          ownedBy: "Vous",
          fiscalRegime: "Micro-BIC Activités de service",
          deductibleExpenses: undefined,
        },
      ];

      // Budget - Charges (conforme au type Expense de /budget/charges)
      const chargeInfo = [
        {
          id: "1",
          type: "Échéances - Crédits immobiliers",
          denomination: "Crédit résidence principale",
          amount: 2200,
          ownedBy: "Commun",
        },
        {
          id: "2",
          type: "Autres dépenses courantes",
          denomination: "Charges copropriété",
          amount: 450,
          ownedBy: "Commun",
        },
        {
          id: "3",
          type: "Autres dépenses courantes",
          denomination: "Alimentation",
          amount: 800,
          ownedBy: "Commun",
        },
        {
          id: "4",
          type: "Charges d'éducation",
          denomination: "Frais scolaires enfants",
          amount: 1200,
          ownedBy: "Commun",
        },
        {
          id: "5",
          type: "Autres impôts et taxes",
          denomination: "Assurances diverses",
          amount: 350,
          ownedBy: "Commun",
        },
        {
          id: "6",
          type: "Impôts sur le Revenu",
          denomination: "Prélèvement IR mensuel",
          amount: 2100,
          ownedBy: "Commun",
        },
      ];

      // Sauvegarder toutes les données dans localStorage avec les bonnes clés
      localStorage.setItem('identityPersonalInfo', JSON.stringify(personalInfo));
      localStorage.setItem('identityObjectifsInfo', JSON.stringify(identityObjectivesInfo));
      localStorage.setItem('identityInvestorProfileInfo', JSON.stringify(identityInvestorProfileInfo));
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
        budgetChargesInfo: chargeInfo.length + ' charges',
        identityObjectifsInfo: identityObjectivesInfo,
        identityInvestorProfileInfo,
      });

      // Simuler un délai pour le feedback utilisateur
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Recharger les données pour mettre à jour l'affichage
      loadDataFromStorage();

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
              <div className="text-2xl font-bold">
                {patrimoineTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasData ? 'Immobilier + Financier + Professionnel' : 'Commencez par saisir vos informations'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Annuels</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenuAnnuel.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenuAnnuel > 0 ? 'Revenus mensuels × 12' : 'Aucun revenu saisi'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Simulations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulationsCount}</div>
              <p className="text-xs text-muted-foreground">
                {simulationsCount > 0 ? `${simulationsCount} simulation(s) créée(s)` : 'Aucune simulation créée'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Préconisations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{preconisationsCount}</div>
              <p className="text-xs text-muted-foreground">
                {preconisationsCount > 0 ? `${preconisationsCount} préconisation(s) sélectionnée(s)` : 'En attente d\'analyse'}
              </p>
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
                <div className="flex items-center space-x-4 rounded-md border p-4 bg-blue-50 border-blue-200">
                  <User className="h-6 w-6 text-blue-600" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-blue-900">
                      Ou testez avec des données pré-remplies
                    </p>
                    <p className="text-sm text-blue-700">
                      Importez un profil client complet pour découvrir toutes les fonctionnalités
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={importFictionalClientData}
                    disabled={isImporting}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
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
