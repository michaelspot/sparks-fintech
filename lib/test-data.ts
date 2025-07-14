// Données de test pour l'export PDF
export const TEST_IDENTITY_DATA = {
  title: "Monsieur",
  firstName: "Jean",
  lastName: "Dupont",
  birthName: "",
  spouseTitle: "Madame",
  spouseFirstName: "Marie",
  spouseLastName: "Dupont",
  spouseBirthName: "Martin",
  birthDate: "1980-05-15",
  spouseBirthDate: "1982-03-20",
  age: "43",
  spouseAge: "41",
  birthPostalCode: "75001",
  spouseBirthPostalCode: "69001",
  city: "Paris",
  spouseCity: "Lyon",
  country: "France",
  spouseCountry: "France",
  nationality: "Française",
  spouseNationality: "Française",
  legalCapacity: "",
  spouseLegalCapacity: "",
  mifClassification: "non-professionnel",
  maritalStatus: "Marié",
  marriageDate: "2010-06-12",
  marriagePlace: "Paris",
  matrimonialRegime: "Communauté légale",
  children: [
    { name: "Paul", age: 12 },
    { name: "Sophie", age: 9 }
  ],
  parent1Name: "Pierre Dupont",
  parent2Name: "Françoise Dupont",
  liberalities: "",
  liberalitiesAmount: "",
  lastWillDonation: "",
  lastWillDonationType: "",
  spouseLastWillDonation: "",
  spouseLastWillDonationType: "",
  profession: "Ingénieur",
  spouseProfession: "Médecin",
  company: "Tech Corp",
  spouseCompany: "Clinique Saint-Jean",
  csp: "Cadre",
  spouseCsp: "Profession libérale",
  retirementAge: "62",
  spouseRetirementAge: "65"
};

// Fonction pour charger les données de test dans localStorage
export function loadTestDataToLocalStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('identityPersonalInfo', JSON.stringify(TEST_IDENTITY_DATA));
    
    // Ajouter aussi quelques préconisations de test
    const testPreconisations = ['1', '3', '5']; // IDs des préconisations
    localStorage.setItem('selectedPreconisations', JSON.stringify(testPreconisations));
    
    console.log('✅ Données de test chargées dans localStorage');
    console.log('- identityPersonalInfo:', TEST_IDENTITY_DATA);
    console.log('- selectedPreconisations:', testPreconisations);
    
    return true;
  }
  return false;
}

// Fonction pour vider les données de test
export function clearTestData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('identityPersonalInfo');
    localStorage.removeItem('selectedPreconisations');
    console.log('🗑️ Données de test supprimées du localStorage');
    return true;
  }
  return false;
}

// Fonction pour vérifier les données actuelles
export function checkCurrentData() {
  if (typeof window !== 'undefined') {
    const identity = localStorage.getItem('identityPersonalInfo');
    const preconisations = localStorage.getItem('selectedPreconisations');
    
    console.log('📊 Données actuelles dans localStorage:');
    console.log('- identityPersonalInfo:', identity ? JSON.parse(identity) : 'Aucune donnée');
    console.log('- selectedPreconisations:', preconisations ? JSON.parse(preconisations) : 'Aucune donnée');
    
    return {
      hasIdentity: !!identity,
      hasPreconisations: !!preconisations,
      identityData: identity ? JSON.parse(identity) : null,
      preconisationsData: preconisations ? JSON.parse(preconisations) : null
    };
  }
  return null;
}
