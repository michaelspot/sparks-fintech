/**
 * Moteur de Préconisations - Règles Métier
 *
 * Ce fichier contient toutes les règles conditionnelles pour déterminer
 * quelles préconisations sont pertinentes pour un client donné.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ClientData {
  // Identité
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;

  // Conjoint
  spouseFirstName: string;
  spouseBirthDate: string;
  spouseAge: number;

  // Situation familiale
  maritalStatus: 'célibataire' | 'marié' | 'pacsé' | 'divorcé' | 'veuf' | '';
  matrimonialRegime: string;
  lastWillDonation: 'oui' | 'non' | '';

  // Enfants
  children: Array<{
    firstName: string;
    birthDate: string;
    parentage: 'commun' | 'propre_parent1' | 'propre_parent2' | '';
  }>;
  numberOfChildren: number;
  hasNonCommonChildren: boolean;

  // Profil investisseur
  riskProfile: string;
  riskScore: number; // 1-7

  // Patrimoine Immobilier
  totalImmobilierBrut: number;
  totalImmobilierNet: number;
  totalDettesImmo: number;
  hasResidencePrincipale: boolean;
  hasLocatif: boolean;
  nombreBiensLocatifs: number;

  // Patrimoine Financier
  totalFinancier: number;
  totalAssuranceVie: number;
  totalPEA: number;
  totalPER: number;
  totalLiquidites: number;
  hasAssuranceVie: boolean;
  hasPEA: boolean;
  hasPER: boolean;

  // Patrimoine Professionnel
  totalProfessionnel: number;
  hasEntreprise: boolean;
  nombreEntreprises: number;
  entreprisesATransmettre: string[];
  isGerantMajoritaire: boolean;

  // Synthèse
  patrimoineTotal: number;
  partImmobilierPatrimoine: number;
  partFinancierPatrimoine: number;
  partProfessionnelPatrimoine: number;
}

export interface Preconisation {
  id: string;
  title: string;
  description: string;
  category: 'civil' | 'fiscal' | 'financier';
  urgency: 'faible' | 'moyenne' | 'haute' | 'critique';
  impact: string;
  definition: string;
  advantages: string[];
  disadvantages: string[];
  // Métadonnées pour le PDF
  legalReferences?: string[];
  estimatedSavings?: string;
}

export interface PreconisationRule {
  id: string;
  preconisation: Omit<Preconisation, 'urgency'>;
  condition: (data: ClientData) => boolean;
  getUrgency: (data: ClientData) => 'faible' | 'moyenne' | 'haute' | 'critique';
}

// ============================================================================
// HELPERS
// ============================================================================

const isMarried = (data: ClientData) => data.maritalStatus === 'marié';
const isPacsed = (data: ClientData) => data.maritalStatus === 'pacsé';
const isInCouple = (data: ClientData) => isMarried(data) || isPacsed(data);
const hasChildren = (data: ClientData) => data.numberOfChildren > 0;

// ============================================================================
// CATALOGUE DES RÈGLES
// ============================================================================

export const PRECONISATION_RULES: PreconisationRule[] = [

  // -------------------------------------------------------------------------
  // CIVIL
  // -------------------------------------------------------------------------

  {
    id: 'CIVIL-001',
    preconisation: {
      id: 'CIVIL-001',
      title: 'Donation au Dernier Vivant',
      description: 'Protéger le conjoint survivant en augmentant sa part d\'héritage au-delà des droits légaux.',
      category: 'civil',
      impact: 'Protection maximale du conjoint',
      definition: 'Acte notarié par lequel les époux se consentent mutuellement une donation de leurs biens au profit du survivant en cas de décès. Elle offre au conjoint survivant des options supplémentaires par rapport à la loi.',
      advantages: [
        'Augmente les droits du conjoint survivant (choix entre usufruit total, 1/4 PP, ou mixte)',
        'Permet au conjoint de rester dans le logement familial',
        'Révocable à tout moment (sauf si intégrée au contrat de mariage)',
        'Coût modéré (environ 150-300€ chez le notaire)'
      ],
      disadvantages: [
        'Peut temporairement réduire la part des enfants',
        'Nécessite un acte notarié',
        'N\'a pas d\'effet si le conjoint décède en premier'
      ],
      legalReferences: ['Article 1094-1 du Code civil'],
      estimatedSavings: 'Protection, pas d\'économie fiscale directe'
    },
    condition: (data) => {
      return isMarried(data)
        && data.lastWillDonation !== 'oui'
        && (hasChildren(data) || data.patrimoineTotal > 100000);
    },
    getUrgency: (data) => {
      if (data.hasNonCommonChildren) return 'critique';
      if (data.age >= 65) return 'haute';
      return 'moyenne';
    }
  },

  {
    id: 'CIVIL-002',
    preconisation: {
      id: 'CIVIL-002',
      title: 'Modification du Régime Matrimonial',
      description: 'Adapter le régime matrimonial à la situation patrimoniale actuelle pour optimiser la protection et la transmission.',
      category: 'civil',
      impact: 'Optimisation successorale',
      definition: 'Changement de contrat de mariage permettant de modifier les règles de propriété et de gestion des biens entre époux. Peut aller jusqu\'à la communauté universelle avec clause d\'attribution intégrale.',
      advantages: [
        'Communauté universelle : 0% de droits au 1er décès',
        'Simplifie la gestion du patrimoine',
        'Protection maximale du conjoint survivant',
        'Évite les conflits avec les enfants au 1er décès'
      ],
      disadvantages: [
        'Perte d\'un abattement pour les enfants au 2nd décès',
        'Coût notarial (1500-3000€)',
        'Délai de 2 ans minimum depuis le mariage',
        'Accord des enfants majeurs parfois requis'
      ],
      legalReferences: ['Articles 1396 et suivants du Code civil'],
      estimatedSavings: 'Jusqu\'à 100% d\'économie au 1er décès'
    },
    condition: (data) => {
      return isMarried(data) && (
        (data.matrimonialRegime === 'separation-biens' && data.patrimoineTotal > 500000)
        || (data.age >= 60 && data.numberOfChildren === 0)
        || (data.hasNonCommonChildren && data.lastWillDonation !== 'oui')
      );
    },
    getUrgency: (data) => {
      if (data.age >= 70) return 'haute';
      return 'moyenne';
    }
  },

  {
    id: 'CIVIL-003',
    preconisation: {
      id: 'CIVIL-003',
      title: 'Rédaction d\'un Testament',
      description: 'Organiser la transmission de son patrimoine selon ses volontés, dans le respect de la réserve héréditaire.',
      category: 'civil',
      impact: 'Maîtrise de la transmission',
      definition: 'Acte juridique par lequel une personne exprime ses dernières volontés concernant la répartition de ses biens après son décès.',
      advantages: [
        'Permet de gratifier des personnes non héritières',
        'Organise la répartition des biens spécifiques (legs particuliers)',
        'Peut désigner un exécuteur testamentaire',
        'Révocable à tout moment'
      ],
      disadvantages: [
        'Ne peut pas déshériter les héritiers réservataires',
        'Risque de contestation si mal rédigé',
        'Coût si authentique (notaire)'
      ],
      legalReferences: ['Articles 967 et suivants du Code civil']
    },
    condition: (data) => {
      return (data.maritalStatus === 'célibataire' || data.maritalStatus === 'veuf')
        || data.hasNonCommonChildren
        || (data.numberOfChildren === 0 && data.patrimoineTotal > 200000);
    },
    getUrgency: (data) => {
      if (data.numberOfChildren === 0 && data.patrimoineTotal > 500000) return 'haute';
      return 'moyenne';
    }
  },

  // -------------------------------------------------------------------------
  // FISCAL
  // -------------------------------------------------------------------------

  {
    id: 'FISCAL-001',
    preconisation: {
      id: 'FISCAL-001',
      title: 'Pacte Dutreil',
      description: 'Réduire de 75% la valeur taxable de l\'entreprise familiale lors de sa transmission.',
      category: 'fiscal',
      impact: 'Abattement de 75%',
      definition: 'Dispositif fiscal permettant une exonération de 75% de la valeur des titres d\'une société pour le calcul des droits de mutation à titre gratuit (donation ou succession).',
      advantages: [
        'Exonération de 75% de la valeur des titres',
        'Cumulable avec les abattements de droit commun',
        'Réduction supplémentaire de 50% si donation en pleine propriété avant 70 ans',
        'Facilite la transmission familiale de l\'entreprise'
      ],
      disadvantages: [
        'Engagement collectif de conservation de 2 ans minimum',
        'Engagement individuel de 4 ans après la transmission',
        'Obligation de fonction de direction pendant 3 ans',
        'Formalisme strict (déclarations annuelles)'
      ],
      legalReferences: ['Article 787 B du CGI'],
      estimatedSavings: 'Jusqu\'à 75% d\'économie sur les droits'
    },
    condition: (data) => {
      return data.hasEntreprise
        && data.entreprisesATransmettre.length > 0
        && data.totalProfessionnel > 100000;
    },
    getUrgency: (data) => {
      if (data.age >= 65) return 'critique';
      if (data.age >= 55) return 'haute';
      return 'moyenne';
    }
  },

  {
    id: 'FISCAL-002',
    preconisation: {
      id: 'FISCAL-002',
      title: 'Démembrement de Propriété',
      description: 'Séparer l\'usufruit de la nue-propriété pour optimiser la transmission tout en conservant les revenus.',
      category: 'fiscal',
      impact: 'Transmission progressive',
      definition: 'Technique consistant à diviser la pleine propriété d\'un bien entre l\'usufruit (droit d\'usage et de percevoir les revenus) et la nue-propriété (droit de disposer du bien).',
      advantages: [
        'Transmission à moindre coût fiscal (base = nue-propriété)',
        'Conservation des revenus par le donateur',
        'Reconstitution automatique de la pleine propriété au décès',
        'Pas de droits de succession sur l\'usufruit'
      ],
      disadvantages: [
        'Perte de la maîtrise totale du bien',
        'Accord nécessaire pour vendre',
        'Répartition des charges entre usufruitier et nu-propriétaire'
      ],
      legalReferences: ['Article 669 du CGI (barème fiscal)'],
      estimatedSavings: 'Variable selon l\'âge (jusqu\'à 90% de réduction de base)'
    },
    condition: (data) => {
      return (data.hasLocatif && data.totalImmobilierNet > 300000)
        || (data.hasEntreprise && data.age >= 55);
    },
    getUrgency: (data) => {
      if (data.age >= 70) return 'haute';
      return 'moyenne';
    }
  },

  {
    id: 'FISCAL-003',
    preconisation: {
      id: 'FISCAL-003',
      title: 'Donation avec Réserve d\'Usufruit',
      description: 'Transmettre la nue-propriété de biens tout en conservant l\'usufruit (revenus et usage).',
      category: 'fiscal',
      impact: 'Anticipation successorale',
      definition: 'Donation portant uniquement sur la nue-propriété d\'un bien, le donateur conservant l\'usufruit jusqu\'à son décès.',
      advantages: [
        'Utilisation des abattements (renouvelables tous les 15 ans)',
        'Base taxable réduite (valeur de la nue-propriété)',
        'Conservation des revenus et de l\'usage',
        'Gel de la valeur au jour de la donation'
      ],
      disadvantages: [
        'Donation irrévocable',
        'Fiscalité sur la plus-value en cas de vente ultérieure',
        'Rapport à la succession pour le calcul de la réserve'
      ],
      legalReferences: ['Articles 894 et suivants du Code civil'],
      estimatedSavings: '100 000€ d\'abattement par enfant tous les 15 ans'
    },
    condition: (data) => {
      return hasChildren(data)
        && data.patrimoineTotal > 200000
        && data.age >= 50;
    },
    getUrgency: (data) => {
      if (data.age >= 65 && data.patrimoineTotal > 500000) return 'haute';
      if (data.age >= 60) return 'moyenne';
      return 'faible';
    }
  },

  {
    id: 'FISCAL-004',
    preconisation: {
      id: 'FISCAL-004',
      title: 'Création d\'une SCI Familiale',
      description: 'Structurer le patrimoine immobilier locatif au sein d\'une société pour faciliter la gestion et la transmission.',
      category: 'fiscal',
      impact: 'Structuration patrimoniale',
      definition: 'Société Civile Immobilière constituée entre membres d\'une même famille pour détenir et gérer un patrimoine immobilier.',
      advantages: [
        'Évite l\'indivision successorale',
        'Transmission progressive par donation de parts',
        'Dissociation pouvoir/capital (gérance)',
        'Possibilité d\'opter pour l\'IS'
      ],
      disadvantages: [
        'Coûts de création et de gestion',
        'Formalisme juridique (AG, comptabilité)',
        'Responsabilité indéfinie des associés',
        'Plus-value sur les parts en cas de cession'
      ],
      legalReferences: ['Articles 1832 et suivants du Code civil'],
      estimatedSavings: 'Optimisation de la transmission dans le temps'
    },
    condition: (data) => {
      return data.nombreBiensLocatifs >= 2
        || (data.hasLocatif && hasChildren(data) && data.totalImmobilierNet > 500000);
    },
    getUrgency: (data) => {
      if (data.nombreBiensLocatifs >= 3) return 'haute';
      return 'moyenne';
    }
  },

  // -------------------------------------------------------------------------
  // FINANCIER
  // -------------------------------------------------------------------------

  {
    id: 'FINANCIER-001',
    preconisation: {
      id: 'FINANCIER-001',
      title: 'Optimisation Clause Bénéficiaire Assurance Vie',
      description: 'Revoir la rédaction de la clause bénéficiaire pour optimiser la transmission et éviter les écueils.',
      category: 'financier',
      impact: 'Sécurisation transmission',
      definition: 'La clause bénéficiaire désigne les personnes qui recevront le capital en cas de décès. Son démembrement permet d\'attribuer l\'usufruit au conjoint et la nue-propriété aux enfants.',
      advantages: [
        'Double optimisation fiscale (conjoint exonéré + abattement enfants)',
        'Le conjoint profite des capitaux sa vie durant',
        'Les enfants récupèrent le capital au 2nd décès sans droits',
        'Évite les conflits familiaux'
      ],
      disadvantages: [
        'Complexité de rédaction',
        'Nécessite une créance de restitution',
        'Attention au quasi-usufruit'
      ],
      legalReferences: ['Article 990 I du CGI', 'Article 757 B du CGI'],
      estimatedSavings: 'Abattement de 152 500€ par bénéficiaire'
    },
    condition: (data) => {
      return data.hasAssuranceVie
        && data.totalAssuranceVie > 50000
        && hasChildren(data);
    },
    getUrgency: (data) => {
      if (data.totalAssuranceVie > 152500) return 'critique';
      return 'haute';
    }
  },

  {
    id: 'FINANCIER-002',
    preconisation: {
      id: 'FINANCIER-002',
      title: 'Ouverture d\'un PER',
      description: 'Préparer sa retraite tout en réduisant son imposition actuelle grâce au Plan d\'Épargne Retraite.',
      category: 'financier',
      impact: 'Défiscalisation',
      definition: 'Le PER est une enveloppe d\'épargne retraite permettant de déduire les versements du revenu imposable, dans certaines limites.',
      advantages: [
        'Déduction des versements du revenu imposable',
        'Capitalisation en franchise d\'impôt',
        'Sortie en capital possible à la retraite',
        'Déblocage anticipé pour achat de résidence principale'
      ],
      disadvantages: [
        'Épargne bloquée jusqu\'à la retraite (sauf cas de déblocage)',
        'Fiscalité à la sortie (IR sur le capital, PFU sur les gains)',
        'Plafonds de déduction limités'
      ],
      legalReferences: ['Loi PACTE du 22 mai 2019'],
      estimatedSavings: 'Économie d\'IR = Versement × TMI'
    },
    condition: (data) => {
      return !data.hasPER && data.age < 60;
      // Note: La condition sur la TMI nécessiterait des données fiscales supplémentaires
    },
    getUrgency: (data) => {
      if (data.age >= 50 && data.age < 60) return 'haute';
      return 'moyenne';
    }
  },

  {
    id: 'FINANCIER-003',
    preconisation: {
      id: 'FINANCIER-003',
      title: 'Rééquilibrage de l\'Allocation d\'Actifs',
      description: 'Ajuster la répartition du patrimoine entre les différentes classes d\'actifs selon le profil de risque.',
      category: 'financier',
      impact: 'Optimisation rendement/risque',
      definition: 'Processus consistant à réajuster la composition du portefeuille pour maintenir une allocation cohérente avec les objectifs et le profil de risque.',
      advantages: [
        'Maintien du niveau de risque souhaité',
        'Discipline d\'investissement (vendre haut, acheter bas)',
        'Diversification optimale',
        'Adaptation à l\'évolution de la situation'
      ],
      disadvantages: [
        'Frais de transaction potentiels',
        'Fiscalité sur les plus-values réalisées',
        'Nécessite un suivi régulier'
      ],
      estimatedSavings: 'Amélioration du couple rendement/risque'
    },
    condition: (data) => {
      return data.partImmobilierPatrimoine > 70
        || (data.totalLiquidites / data.patrimoineTotal) > 0.30;
    },
    getUrgency: (data) => {
      if (data.partImmobilierPatrimoine > 80) return 'haute';
      return 'moyenne';
    }
  },

  {
    id: 'FINANCIER-004',
    preconisation: {
      id: 'FINANCIER-004',
      title: 'Ouverture d\'un PEA',
      description: 'Investir en actions européennes dans un cadre fiscal avantageux.',
      category: 'financier',
      impact: 'Fiscalité allégée',
      definition: 'Le Plan d\'Épargne en Actions permet d\'investir jusqu\'à 150 000€ en actions européennes avec une fiscalité avantageuse après 5 ans.',
      advantages: [
        'Exonération d\'IR sur les gains après 5 ans',
        'Seuls les prélèvements sociaux sont dus (17,2%)',
        'Large choix d\'investissements (actions, ETF, OPCVM)',
        'Possibilité de retrait partiel après 5 ans sans clôture'
      ],
      disadvantages: [
        'Plafond de versement de 150 000€',
        'Univers d\'investissement limité à l\'Europe',
        'Retrait avant 5 ans = clôture + fiscalité pleine'
      ],
      legalReferences: ['Article 163 quinquies D du CGI'],
      estimatedSavings: 'Économie de 12,8% d\'IR sur les gains après 5 ans'
    },
    condition: (data) => {
      return !data.hasPEA
        && data.totalFinancier > 10000
        && data.age < 70;
    },
    getUrgency: (data) => {
      return 'moyenne';
    }
  }
];

// ============================================================================
// MOTEUR D'ÉVALUATION
// ============================================================================

/**
 * Évalue toutes les règles et retourne les préconisations applicables
 */
export function evaluatePreconisations(clientData: ClientData): Preconisation[] {
  const applicablePreconisations: Preconisation[] = [];

  for (const rule of PRECONISATION_RULES) {
    try {
      if (rule.condition(clientData)) {
        applicablePreconisations.push({
          ...rule.preconisation,
          urgency: rule.getUrgency(clientData)
        });
      }
    } catch (error) {
      console.warn(`Erreur lors de l'évaluation de la règle ${rule.id}:`, error);
    }
  }

  // Trier par urgence (critique > haute > moyenne > faible)
  const urgencyOrder = { 'critique': 0, 'haute': 1, 'moyenne': 2, 'faible': 3 };
  applicablePreconisations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return applicablePreconisations;
}

/**
 * Charge les données client depuis le localStorage et les transforme
 */
export function loadClientDataFromStorage(): ClientData | null {
  if (typeof window === 'undefined') return null;

  try {
    // Charger les différentes sources
    const identity = JSON.parse(localStorage.getItem('identityPersonalInfo') || '{}');
    const investorProfile = JSON.parse(localStorage.getItem('identityInvestorProfileInfo') || '{}');
    const immobilier = JSON.parse(localStorage.getItem('patrimoineImmobilierInfo') || '[]');
    const financier = JSON.parse(localStorage.getItem('patrimoineFinancierInfo') || '[]');
    const professionnel = JSON.parse(localStorage.getItem('patrimoineProfessionnelInfo') || '[]');

    // Calculer l'âge
    const calculateAge = (birthDate: string): number => {
      if (!birthDate) return 0;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    };

    // Calculer les totaux immobilier
    const totalImmobilierBrut = immobilier.reduce((sum: number, b: any) => sum + (b.grossValue || 0), 0);
    const totalImmobilierNet = immobilier.reduce((sum: number, b: any) => sum + (b.netValue || 0), 0);
    const totalDettesImmo = immobilier.reduce((sum: number, b: any) => sum + (b.attachedDebts || 0), 0);
    const hasResidencePrincipale = immobilier.some((b: any) => b.type === 'Résidence principale');
    const hasLocatif = immobilier.some((b: any) => b.type === 'Locatif');
    const nombreBiensLocatifs = immobilier.filter((b: any) => b.type === 'Locatif').length;

    // Calculer les totaux financier
    const totalFinancier = financier.reduce((sum: number, a: any) => sum + (a.realValue || 0), 0);
    const totalAssuranceVie = financier.filter((a: any) => a.type === 'Assurance Vie').reduce((sum: number, a: any) => sum + (a.realValue || 0), 0);
    const totalPEA = financier.filter((a: any) => a.type === 'PEA').reduce((sum: number, a: any) => sum + (a.realValue || 0), 0);
    const totalPER = financier.filter((a: any) => a.type === 'PER').reduce((sum: number, a: any) => sum + (a.realValue || 0), 0);
    const totalLiquidites = financier.filter((a: any) => ['Compte courant', 'Livret A', 'LDDS', 'PEL'].includes(a.type)).reduce((sum: number, a: any) => sum + (a.realValue || 0), 0);

    // Calculer les totaux professionnel
    const totalProfessionnel = professionnel.reduce((sum: number, e: any) => sum + (e.valuation || 0), 0);
    const entreprisesATransmettre = professionnel.filter((e: any) => e.willToTransfer === 'Oui').map((e: any) => e.companyName);
    const isGerantMajoritaire = professionnel.some((e: any) =>
      e.holders?.some((h: any) => h.percentage > 50 && ['Gérant', 'Président'].includes(h.jobTitle))
    );

    // Synthèse
    const patrimoineTotal = totalImmobilierNet + totalFinancier + totalProfessionnel;

    // Enfants
    const children = identity.children || [];
    const hasNonCommonChildren = children.some((c: any) => c.parentage === 'propre_parent1' || c.parentage === 'propre_parent2');

    // Risk score mapping
    const riskScoreMap: Record<string, number> = {
      'Sécuritaire': 1,
      'Prudent': 2,
      'Équilibré': 4,
      'Dynamique': 5,
      'Offensif': 7
    };

    return {
      firstName: identity.firstName || '',
      lastName: identity.lastName || '',
      birthDate: identity.birthDate || '',
      age: calculateAge(identity.birthDate),

      spouseFirstName: identity.spouseFirstName || '',
      spouseBirthDate: identity.spouseBirthDate || '',
      spouseAge: calculateAge(identity.spouseBirthDate),

      maritalStatus: identity.maritalStatus || '',
      matrimonialRegime: identity.matrimonialRegime || '',
      lastWillDonation: identity.lastWillDonation || '',

      children,
      numberOfChildren: children.length,
      hasNonCommonChildren,

      riskProfile: investorProfile?.userProfile?.risk?.label || '',
      riskScore: riskScoreMap[investorProfile?.userProfile?.risk?.label] || 4,

      totalImmobilierBrut,
      totalImmobilierNet,
      totalDettesImmo,
      hasResidencePrincipale,
      hasLocatif,
      nombreBiensLocatifs,

      totalFinancier,
      totalAssuranceVie,
      totalPEA,
      totalPER,
      totalLiquidites,
      hasAssuranceVie: totalAssuranceVie > 0,
      hasPEA: totalPEA > 0,
      hasPER: totalPER > 0,

      totalProfessionnel,
      hasEntreprise: professionnel.length > 0,
      nombreEntreprises: professionnel.length,
      entreprisesATransmettre,
      isGerantMajoritaire,

      patrimoineTotal,
      partImmobilierPatrimoine: patrimoineTotal > 0 ? (totalImmobilierNet / patrimoineTotal) * 100 : 0,
      partFinancierPatrimoine: patrimoineTotal > 0 ? (totalFinancier / patrimoineTotal) * 100 : 0,
      partProfessionnelPatrimoine: patrimoineTotal > 0 ? (totalProfessionnel / patrimoineTotal) * 100 : 0,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données client:', error);
    return null;
  }
}
