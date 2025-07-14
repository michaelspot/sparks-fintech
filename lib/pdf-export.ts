import { GOOGLE_APPS_SCRIPT_CONFIG } from './config';

// Interface pour les données d'identité
interface IdentityPersonalInfo {
  title?: string;
  firstName?: string;
  lastName?: string;
  birthName?: string;
  spouseTitle?: string;
  spouseFirstName?: string;
  spouseLastName?: string;
  spouseBirthName?: string;
  birthDate?: string;
  spouseBirthDate?: string;
  age?: string;
  spouseAge?: string;
  birthPostalCode?: string;
  spouseBirthPostalCode?: string;
  city?: string;
  spouseCity?: string;
  country?: string;
  spouseCountry?: string;
  nationality?: string;
  spouseNationality?: string;
  legalCapacity?: string;
  spouseLegalCapacity?: string;
  mifClassification?: string;
  maritalStatus?: string;
  marriageDate?: string;
  marriagePlace?: string;
  matrimonialRegime?: string;
  children?: any[];
  parent1Name?: string;
  parent2Name?: string;
  liberalities?: string;
  liberalitiesAmount?: string;
  lastWillDonation?: string;
  lastWillDonationType?: string;
  spouseLastWillDonation?: string;
  spouseLastWillDonationType?: string;
  profession?: string;
  spouseProfession?: string;
  company?: string;
  spouseCompany?: string;
  csp?: string;
  spouseCsp?: string;
  retirementAge?: string;
  spouseRetirementAge?: string;
}

// Fonction d'export PDF utilisant Google Apps Script
export async function exportToPDF() {
  try {
    // Récupérer les données du localStorage
    const identityData = localStorage.getItem('identityPersonalInfo');
    const selectedPreconisations = localStorage.getItem('selectedPreconisations');
    
    if (!identityData) {
      throw new Error('Aucune donnée client trouvée dans le localStorage (clé: identityPersonalInfo)');
    }

    const parsedIdentityData: IdentityPersonalInfo = JSON.parse(identityData);
    const parsedPreconisations = selectedPreconisations ? JSON.parse(selectedPreconisations) : [];

    // Fonction utilitaire pour formater les dates au format jj/mm/aaaa
    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Retourner la chaîne originale si invalide
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

    // Fonction utilitaire pour obtenir le libellé du statut marital
    const getMaritalStatusLabel = (status: string): string => {
      if (!status) return '';
      const statusMap: { [key: string]: string } = {
        'marie': 'Marié(e)',
        'celibataire': 'Célibataire',
        'divorce': 'Divorcé(e)',
        'veuf': 'Veuf/Veuve',
        'pacs': 'Pacsé(e)'
      };
      return statusMap[status] || status;
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

    // Préparer les variables pour le remplacement dans Google Docs
    // Les clés correspondent aux variables {{variable}} dans votre modèle
    const variables = {
      firstName: parsedIdentityData.firstName || '',
      lastName: parsedIdentityData.lastName || '',
      title: formatTitle(parsedIdentityData.title || ''),
      spouseFirstName: parsedIdentityData.spouseFirstName || '',
      spouseLastName: parsedIdentityData.spouseLastName || '',
      spouseTitle: formatTitle(parsedIdentityData.spouseTitle || ''),
      birthDate: formatDate(parsedIdentityData.birthDate || ''),
      spouseBirthDate: formatDate(parsedIdentityData.spouseBirthDate || ''),
      city: formatCity(parsedIdentityData.city || ''),
      spouseCity: formatCity(parsedIdentityData.spouseCity || ''),
      country: parsedIdentityData.country || 'France',
      spouseCountry: parsedIdentityData.spouseCountry || 'France',
      nationality: parsedIdentityData.nationality || 'Française',
      spouseNationality: parsedIdentityData.spouseNationality || 'Française',
      maritalStatus: getMaritalStatusLabel(parsedIdentityData.maritalStatus || ''),
      marriageDate: formatDate(parsedIdentityData.marriageDate || ''),
      matrimonialRegime: getMatrimonialRegimeLabel(parsedIdentityData.matrimonialRegime || ''),
      profession: parsedIdentityData.profession || '',
      spouseProfession: parsedIdentityData.spouseProfession || '',
      age: parsedIdentityData.age || '',
      spouseAge: parsedIdentityData.spouseAge || '',
      company: parsedIdentityData.company || '',
      spouseCompany: parsedIdentityData.spouseCompany || '',
      csp: getCspLabel(parsedIdentityData.csp || ''),
      spouseCsp: getCspLabel(parsedIdentityData.spouseCsp || ''),
      retirementAge: parsedIdentityData.retirementAge || '',
      spouseRetirementAge: parsedIdentityData.spouseRetirementAge || '',
      dateGeneration: new Date().toLocaleDateString('fr-FR'),
      nbPreconisations: parsedPreconisations.length.toString()
    };

    const exportData = {
      variables: variables,
      preconisations: parsedPreconisations
    };

    console.log('Données à exporter:', exportData);

    // Vérifier que l'URL est configurée
    if (GOOGLE_APPS_SCRIPT_CONFIG.SCRIPT_ID === 'YOUR_SCRIPT_ID') {
      throw new Error('Veuillez configurer votre SCRIPT_ID dans lib/config.ts');
    }

    // Créer les données du formulaire
    const formData = new FormData();
    formData.append('data', JSON.stringify(exportData));

    // Envoyer la requête
    const response = await fetch(GOOGLE_APPS_SCRIPT_CONFIG.URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Nécessaire pour Google Apps Script
    });

    // Afficher un message de succès
    alert('Export PDF en cours... Le document sera disponible dans votre Google Drive.');
    
    return true;

  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    alert('Erreur lors de l\'export PDF: ' + errorMessage);
    return false;
  }
}

// Fonction pour ajouter facilement de nouvelles variables
export function addVariableMapping(variableName: string, localStorageKey: string, nestedPath?: string) {
  // Cette fonction peut être utilisée pour mapper dynamiquement de nouvelles variables
  // Exemple d'utilisation future pour ajouter des variables
  console.log(`Variable ${variableName} mappée à ${localStorageKey}${nestedPath ? '.' + nestedPath : ''}`);
}
