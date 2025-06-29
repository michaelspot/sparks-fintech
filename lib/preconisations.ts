import { LucideIcon } from "lucide-react";

export interface Condition {
  type: string;
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "notContains";
  value: any;
}

export interface Preconisation {
  id: number;
  title: string;
  category: string;
  priority: "Haute" | "Moyenne" | "Basse";
  impact: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  icon: LucideIcon;
  color: string;
  conditions: Condition[];
}

// Liste complète des préconisations avec leurs conditions
import {
  PiggyBank,
  TrendingUp,
  Shield,
  Banknote,
  LifeBuoy,
  FileSignature,
  Split,
  LineChart,
  Home,
  FileStack,
  Layers,
  Gift,
  Users,
  UserPlus,
  HeartHandshake,
  Scale,
  Globe,
  Landmark,
  Umbrella,
  Briefcase,
  Building2,
  ClipboardList,
  DollarSign,
  BarChart2,
  PieChart,
  Activity,
  Repeat,
  RefreshCw,
  MoveRight,
  Sparkle,
  Coins,
  ArchiveRestore,
  Aperture
} from "lucide-react";

export const preconisations: Preconisation[] = [
  {
    id: 1,
    title: "Compte à terme",
    category: "Placement garanti",
    priority: "Basse",
    impact: "Taux fixe jusqu’à 2,40 % brut",
    description:
      "Placer des liquidités à court terme (2–17 mois) sur un support à capital garanti avec taux connu dès la souscription.",
    advantages: [
      "Capital 100 % garanti",
      "Taux figé et connu à l’avance",
      "Aucune fluctuation de marché"
    ],
    disadvantages: [
      "Préavis de 32 jours pour un retrait anticipé",
      "Pénalité sur la rémunération en cas de sortie avant terme"
    ],
    icon: Banknote,
    color: "text-amber-600",
    conditions: [
      // Pour les hauts revenus
      { type: "fiscal", field: "revenuGlobal", operator: "gte", value: 100000 },
      // Avec un patrimoine conséquent pour le fonds euros
      { type: "patrimoine", field: "valeurPatrimoineFinancier", operator: "gte", value: 150000 },
      // Mais sans concentration excessive dans l'assurance-vie
      { type: "patrimoine", field: "detentionAssuranceVie", operator: "eq", value: false }
    ]
  },
  {
    id: 2,
    title: "Assurance‑vie",
    category: "Investissement diversifié",
    priority: "Haute",
    impact: "Véhicule polyvalent épargne + transmission",
    description:
      "Contrat multi‑supports (fonds euros + unités de compte) bénéficiant d’une fiscalité dégressive après 8 ans et d’avantages successoraux.",
    advantages: [
      "Fiscalité allégée après 8 ans (abattement 4 600 €/9 200 €)",
      "Abattement décès 152 500 € avant 70 ans par bénéficiaire",
      "Souplesse des rachats partiels programmés"
    ],
    disadvantages: [
      "Risque de perte en capital sur les unités de compte",
      "Abattement décès réduit à 30 500 € après 70 ans"
    ],
    icon: LifeBuoy,
    color: "text-blue-600",
    conditions: [
      // Pour les personnes approchant de la retraite
      { type: "profile", field: "age", operator: "gte", value: 50 },
      // Avec un patrimoine immobilier conséquent
      { type: "patrimoine", field: "valeurPatrimoineImmobilier", operator: "gte", value: 300000 },
      // Qui ont des revenus significatifs
      { type: "fiscal", field: "revenuGlobal", operator: "gte", value: 60000 },
      // Et une préoccupation pour la retraite
      { type: "objectifs", field: "preoccupationRetraite", operator: "eq", value: true }
    ]
  },
  {
    id: 3,
    title: "Clause bénéficiaire dédiée",
    category: "Transmission",
    priority: "Moyenne",
    impact: "Sécurise la transmission de l’assurance‑vie",
    description:
      "Rédiger ou mettre à jour la clause bénéficiaire pour cibler précisément les ayants droit et éviter la dévolution légale par défaut.",
    advantages: [
      "Libre désignation ou modification à tout moment",
      "Peut intégrer des bénéficiaires non héritiers",
      "Pas de nécessité de mise à jour fréquente si clause déterminable"
    ],
    disadvantages: [
      "Certaines professions ne peuvent être désignées",
      "Rédaction imprécise ⟶ litiges potentiels"
    ],
    icon: FileSignature,
    color: "text-purple-600",
    conditions: [
      // Age permettant de bénéficier d'un bon rendement à long terme
      { type: "profile", field: "age", operator: "gte", value: 25 },
      { type: "profile", field: "age", operator: "lte", value: 50 },
      // Avoir des liquidités à investir
      { type: "patrimoine", field: "liquiditesDisponibles", operator: "gte", value: 10000 },
      // Ne pas avoir déjà trop investi dans l'immobilier
      { type: "patrimoine", field: "concentrationActifs", operator: "lte", value: 70 }
    ]
  },
  {
    id: 4,
    title: "Clause bénéficiaire démembrée",
    category: "Transmission",
    priority: "Haute",
    impact: "Protège le conjoint tout en transmettant aux enfants",
    description:
      "Attribuer l’usufruit du capital décès au conjoint survivant et la nue‑propriété aux enfants pour optimiser protection et fiscalité.",
    advantages: [
      "Protection financière du conjoint (usufruit)",
      "Double abattement successoral (article 669 CGI)",
      "Créance de restitution au profit des enfants"
    ],
    disadvantages: [
      "Rédaction notariale indispensable",
      "Conflits potentiels si le capital est consommé par l’usufruitier"
    ],
    icon: Split,
    color: "text-pink-600",
    conditions: [
      // Uniquement pour les personnes mariées
      { type: "profile", field: "situationFamiliale", operator: "eq", value: "Marié" },
      // Avec un patrimoine significatif
      { type: "patrimoine", field: "valeurResidencePrincipale", operator: "gte", value: 200000 },
      // Préoccupation de transmission
      { type: "objectifs", field: "preoccupationTransmission", operator: "eq", value: true }
    ]
  },
  {
    id: 5,
    title: "Plan d’Épargne en Actions (PEA)",
    category: "Investissement",
    priority: "Moyenne",
    impact: "Exonération d’IR sur la plus‑value après 5 ans",
    description:
      "Compte titres réservé aux actions européennes offrant une enveloppe fiscale avantageuse après 5 ans de détention.",
    advantages: [
      "Exonération d’IR sur la plus‑value > 5 ans",
      "Espérance de rendement supérieur aux fonds euros"
    ],
    disadvantages: [
      "Risque actions : volatilité et perte en capital",
      "Clôture du plan si retrait avant 5 ans"
    ],
    icon: LineChart,
    color: "text-green-600",
    conditions: [
      // TMI suffisante pour que la défiscalisation soit intéressante
      { type: "fiscal", field: "trancheMarginaleImposition", operator: "gte", value: 30 },
      // Patrimoine immobilier déjà constitué
      { type: "patrimoine", field: "valeurPatrimoineImmobilier", operator: "gte", value: 200000 },
      // Objectif de défiscalisation
      { type: "objectifs", field: "preoccupationDefiscalisation", operator: "eq", value: true }
    ]
  },
  {
    id: 6,
    title: "Plan d’Épargne Retraite (PER)",
    category: "Retraite & Fiscalité",
    priority: "Haute",
    impact: "Réduction d’IR immédiate + préparation retraite",
    description:
      "Verser sur un PER pour déduire le montant investi de votre revenu imposable et constituer un capital ou une rente pour la retraite.",
    advantages: [
      "Déductibilité des versements (plafond fiscal)",
      "Possibilité de rattraper les 3 années non utilisées",
      "Gestion financière libre (fonds euros + UC)"
    ],
    disadvantages: [
      "Blocage des fonds jusqu’à la retraite",
      "Fiscalité à la sortie selon mode de liquidation"
    ],
    icon: PiggyBank,
    color: "text-teal-600",
    conditions: [
      // Le PER est plus intéressant fiscalement pour les tranches élevées
      { type: "fiscal", field: "trancheMarginaleImposition", operator: "gte", value: 30 },
      // Il est pertinent pour les personnes en activité, avant la retraite
      { type: "profile", field: "age", operator: "gte", value: 30 },
      { type: "profile", field: "age", operator: "lt", value: 62 },
      // Une préoccupation pour la retraite rend cette solution plus pertinente
      { type: "objectifs", field: "preoccupationRetraite", operator: "eq", value: true }
    ]
  },
  {
    id: 7,
    title: "Investissement en nue‑propriété",
    category: "Immobilier",
    priority: "Moyenne",
    impact: "Décote 30‑40 % sur le prix du bien",
    description:
      "Acquérir la nue‑propriété d’un bien avec usufruit temporaire cédé à un bailleur institutionnel (15–20 ans).",
    advantages: [
      "Absence de gestion locative et de fiscalité",
      "Valorisation automatique à la reconstitution de la pleine propriété",
      "Préparation de revenus complémentaires à la retraite"
    ],
    disadvantages: [
      "Pas de loyers pendant la phase de démembrement",
      "Liquidité réduite avant remembrement"
    ],
    icon: Home,
    color: "text-orange-600",
    conditions: []
  },
  {
    id: 8,
    title: "Contrat de capitalisation",
    category: "Investissement",
    priority: "Moyenne",
    impact: "Enveloppe fiscale pour personnes physiques ou morales",
    description:
      "Produit cousin de l’assurance‑vie, transmissible par donation ou succession et adapté aux personnes morales soumises à l’IR.",
    advantages: [
      "Accès au fonds euros + UC",
      "Conserve l’antériorité fiscale en cas de donation ou succession",
      "Éligible aux personnes morales"
    ],
    disadvantages: [
      "Entre dans l’actif successoral du défunt",
      "Complexité déclarative pour les sociétés"
    ],
    icon: FileStack,
    color: "text-indigo-600",
    conditions: [
      // TMI suffisante pour une défiscalisation intéressante
      { type: "fiscal", field: "trancheMarginaleImposition", operator: "gte", value: 30 },
      // Avoir un revenu foncier existant à défiscaliser
      { type: "fiscal", field: "revenusFonciers", operator: "gte", value: 10000 },
      // Préoccupation de défiscalisation
      { type: "objectifs", field: "preoccupationDefiscalisation", operator: "eq", value: true }
    ]
  },
  {
    id: 9,
    title: "Démembrement de propriété",
    category: "Transmission immobilière",
    priority: "Haute",
    impact: "Réduction des DMTG",
    description:
      "Donner la nue‑propriété d’un bien (immobilier ou titres) tout en conservant l’usufruit afin d’abaisser la base taxable selon l’âge du donateur.",
    advantages: [
      "Droits réduits pour le nu‑propriétaire",
      "Pleine propriété reconstituée sans taxation supplémentaire",
      "Peut combiner avec l’article 669 CGI pour optimiser"
    ],
    disadvantages: [
      "Droits plus élevés si le donateur est âgé",
      "Perte de contrôle partiel sur la substance du bien"
    ],
    icon: Layers,
    color: "text-yellow-600",
    conditions: []
  },
  {
    id: 10,
    title: "Donation en ligne directe (100 000 €)",
    category: "Transmission",
    priority: "Moyenne",
    impact: "Abattement 100 000 € par parent/enfant",
    description:
      "Don manuel ou notarié de tout type de bien avec abattement renouvelable tous les 15 ans.",
    advantages: [
      "Pas de droits jusqu’à 100 000 € par parent/enfant",
      "Large palette d’actifs transmissibles"
    ],
    disadvantages: [
      "Reprise fiscale si décès dans les 15 ans",
      "Frais notariés selon nature du bien"
    ],
    icon: Gift,
    color: "text-rose-600",
    conditions: [
      // Pour les personnes d'âge mûr
      { type: "profile", field: "age", operator: "gte", value: 60 },
      // Avec un patrimoine significatif à transmettre
      { type: "patrimoine", field: "valeurPatrimoineImmobilier", operator: "gte", value: 300000 },
      { type: "patrimoine", field: "valeurPatrimoineFinancier", operator: "gte", value: 100000 },
      // Et une préoccupation de transmission
      { type: "objectifs", field: "preoccupationTransmission", operator: "eq", value: true }
    ]
  },
  {
    id: 11,
    title: "Don familial de sommes d’argent (31 865 €)",
    category: "Transmission",
    priority: "Basse",
    impact: "Abattement supplémentaire non rapportable",
    description:
      "Don espèces ou virement d’un parent (< 80 ans) à un enfant majeur, exonéré jusqu’à 31 865 €.",
    advantages: [
      "Exonération immédiate",
      "Pas de rattrapage à la succession"
    ],
    disadvantages: [
      "Donateur < 80 ans et enfant majeur",
      "Limité aux sommes d’argent"
    ],
    icon: Users,
    color: "text-lime-600",
    conditions: [
      // Plutôt pour profils fortunés
      { type: "fiscal", field: "trancheMarginaleImposition", operator: "gte", value: 41 },
      // Avec patrimoine financier significatif
      { type: "patrimoine", field: "valeurPatrimoineFinancier", operator: "gte", value: 300000 },
      // Stratégies patrimoniales longues
      { type: "profile", field: "age", operator: "lte", value: 65 },
      // Préoccupation de transmission
      { type: "objectifs", field: "preoccupationTransmission", operator: "eq", value: true }
    ]
  },
  {
    id: 12,
    title: "Donation au dernier des vivants (DDV)",
    category: "Protection du conjoint",
    priority: "Haute",
    impact: "Augmente la part successorale du conjoint",
    description:
      "Acte notarié permettant au conjoint survivant de choisir entre 100 % usufruit, ¼ PP + ¾ US ou la quotité disponible.",
    advantages: [
      "Libre choix au décès",
      "Révocable sauf stipulation dans contrat de mariage",
      "Réduit les droits pour les enfants"
    ],
    disadvantages: [
      "Coût notarié",
      "Sur‑protection possible au détriment des enfants"
    ],
    icon: HeartHandshake,
    color: "text-red-600",
    conditions: []
  },
  {
    id: 13,
    title: "Donation transgénérationnelle",
    category: "Transmission avancée",
    priority: "Moyenne",
    impact: "Saute une génération à moindre coût",
    description:
      "Donation‑partage permettant au parent donataire de renoncer en faveur de ses enfants pour transmettre directement de G1 à G3.",
    advantages: [
      "Réduction potentielle des DMTG (2,5 % si > 15 ans)",
      "Permet la transmission directe aux petits‑enfants"
    ],
    disadvantages: [
      "Nécessite les 3 générations vivantes",
      "Fiscalité plus lourde si < 15 ans entre deux donations"
    ],
    icon: UserPlus,
    color: "text-sky-600",
    conditions: []
  },
  {
    id: 14,
    title: "Donation graduelle",
    category: "Transmission conditionnelle",
    priority: "Basse",
    impact: "Obligation de conservation & retransmission",
    description:
      "Le donataire doit conserver le bien puis le transmettre à son décès à un second gratifié désigné par le donateur.",
    advantages: [
      "Garantie de la destination finale de l’actif",
      "Adaptée pour protéger un héritier fragile"
    ],
    disadvantages: [
      "Absence de liberté pour le donataire",
      "Risque de blocage patrimonial"
    ],
    icon: Umbrella,
    color: "text-fuchsia-600",
    conditions: []
  },
  {
    id: 15,
    title: "Donation résiduelle",
    category: "Transmission conditionnelle",
    priority: "Basse",
    impact: "Transmet le reste du bien au second gratifié",
    description:
      "Le second gratifié reçoit ce qui subsiste du bien au décès du premier donataire, sans obligation de conservation pendant la vie de celui‑ci.",
    advantages: [
      "Souplesse pour le premier donataire",
      "Choix du gratifié final par le donateur"
    ],
    disadvantages: [
      "Aucune garantie sur la valeur résiduelle",
      "Pas de pouvoir de choix pour le donataire initial"
    ],
    icon: RefreshCw,
    color: "text-emerald-600",
    conditions: []
  },
  {
    id: 16,
    title: "Succession – exonération du conjoint survivant",
    category: "Succession",
    priority: "Haute",
    impact: "Aucun droit de succession pour le conjoint",
    description:
      "Depuis la loi TEPA 2007, le conjoint (ou partenaire PACS avec testament) est exonéré de droits de succession sur l’ensemble du patrimoine.",
    advantages: [
      "Transmission intégrale sans fiscalité",
      "Simplifie la liquidation successorale"
    ],
    disadvantages: [
      "Ne concerne pas les concubins",
      "Peut léser les enfants en l’absence de planification"
    ],
    icon: Scale,
    color: "text-gray-600",
    conditions: []
  },
  {
    id: 17,
    title: "Réduction de l’IR (dons, charges, PER, etc.)",
    category: "Fiscalité",
    priority: "Moyenne",
    impact: "Optimise l’impôt sur le revenu",
    description:
      "Mettre en place les leviers classiques : versements PER (rattrapage 3 ans), dons (75 % ou 66 %), déficit foncier, frais de garde, emploi à domicile…",
    advantages: [
      "Large panel de niches fiscales",
      "Cumuls possibles sous plafonds spécifiques"
    ],
    disadvantages: [
      "Plafond global des niches (10 000 €)",
      "Suivi administratif nécessaire"
    ],
    icon: Globe,
    color: "text-cyan-600",
    conditions: [
      // Pour les personnes avec une résidence principale importante
      { type: "patrimoine", field: "valeurResidencePrincipale", operator: "gte", value: 400000 },
      // TMI élevée pour que la défiscalisation soit significative
      { type: "fiscal", field: "trancheMarginaleImposition", operator: "gte", value: 41 },
      // Préoccupation de transmission ou défiscalisation
      { type: "objectifs", field: "preoccupationTransmission", operator: "eq", value: true }
    ]
  },
  {
    id: 18,
    title: "Réduction de l’IFI",
    category: "Fiscalité foncière",
    priority: "Haute",
    impact: "Baisse ou sortie du seuil 1,3 M €",
    description:
      "Arbitrage immobilier (vente/SCPI), apport en société (SCI/SARL de famille) avec dette, donation d’usufruit temporaire ou don IF.",
    advantages: [
      "Trois leviers cumulables (vente, société, donation)",
      "Peut préparer la transmission"
    ],
    disadvantages: [
      "Montage sociétaire complexe",
      "Attention aux motivations principalement fiscales"
    ],
    icon: Landmark,
    color: "text-red-500",
    conditions: []
  },
  {
    id: 19,
    title: "Prévoyance individuelle",
    category: "Protection",
    priority: "Haute",
    impact: "Maintien de revenus & capital décès",
    description:
      "Souscrire un contrat prévoyance pour couvrir incapacité, invalidité et décès avec versement d’IJ et capital aux bénéficiaires.",
    advantages: [
      "Sécurise le niveau de vie",
      "Capital décès exonéré d’IR/DMTG (sous conditions)"
    ],
    disadvantages: [
      "Coût croissant avec l’âge",
      "Formalités médicales éventuelles"
    ],
    icon: Shield,
    color: "text-orange-600",
    conditions: []
  },
  {
    id: 20,
    title: "Prévoyance Homme/Femme clé",
    category: "Protection – Entreprise",
    priority: "Moyenne",
    impact: "Compense la perte d’une personne clé",
    description:
      "Assurance versant un capital à l’entreprise en cas de décès ou incapacité du dirigeant ou collaborateur clé ; primes déductibles à l’IS.",
    advantages: [
      "Réduit le risque financier pour la société",
      "Primes déductibles (charge intelligente)"
    ],
    disadvantages: [
      "Coût proportionnel au capital assuré",
      "Évaluation du préjudice parfois délicate"
    ],
    icon: Briefcase,
    color: "text-violet-600",
    conditions: []
  },
  {
    id: 21,
    title: "Revenus fonciers (location nue)",
    category: "Immobilier",
    priority: "Basse",
    impact: "Complément de revenus stable",
    description:
      "Gestion de biens loués nus via micro‑foncier (< 15 000 €) ou réel (déduction charges/travaux, déficit foncier 10 700 €).",
    advantages: [
      "Possibilité de déficit foncier imputable",
      "Abattement 30 % en micro‑foncier"
    ],
    disadvantages: [
      "Rendement inférieur à la location meublée",
      "Pas d’amortissement comptable"
    ],
    icon: Building2,
    color: "text-amber-700",
    conditions: []
  },
  {
    id: 22,
    title: "Location meublée (LMNP/LMP)",
    category: "Immobilier",
    priority: "Moyenne",
    impact: "Rendement net optimisé via amortissements",
    description:
      "Exploitation meublée en nom propre, société à l’IS ou SARL de famille (option IR) ; régime micro‑BIC ou réel avec amortissement.",
    advantages: [
      "Amortissement du bien et du mobilier",
      "Rendement supérieur au nu",
      "Statut LMNP possible sans charges sociales (< 23 000 €)"
    ],
    disadvantages: [
      "Gestion plus complexe",
      "Requalification LMP si > 23 000 € et > 50 % revenus"
    ],
    icon: ClipboardList,
    color: "text-green-700",
    conditions: []
  },
  {
    id: 23,
    title: "SCI vs détention directe",
    category: "Structuration immobilière",
    priority: "Moyenne",
    impact: "Facilite la gestion à plusieurs & transmission",
    description:
      "Créer une SCI (IR ou option IS) pour gérer un parc immobilier, démembrer des parts et optimiser IFI.",
    advantages: [
      "Souplesse statutaire",
      "Transmission par cession de parts (abattement donations)",
      "Possibilité d’option IS pour amortir"
    ],
    disadvantages: [
      "Tenue comptable",
      "Plus‑value professionnelle à l’IS"
    ],
    icon: Layers,
    color: "text-blue-700",
    conditions: []
  },
  {
    id: 24,
    title: "SCI IR vs SCI IS",
    category: "Structuration immobilière",
    priority: "Basse",
    impact: "Choix fiscal selon projet",
    description:
      "Comparer les régimes : IR (plus‑value des particuliers, abattement durée) vs IS (amortissement, imposition société, plus‑value pro).",
    advantages: [
      "Charges plus larges à l’IS",
      "Pas de comptabilité obligatoire à l’IR",
      "Amortissement composant possible à l’IS"
    ],
    disadvantages: [
      "Quote‑part de dividendes taxée",
      "Plus‑value alourdie à l’IS (réintégration amortiss.)"
    ],
    icon: Scale,
    color: "text-indigo-700",
    conditions: []
  },
  {
    id: 25,
    title: "SARL de famille (option IR)",
    category: "Immobilier meublé",
    priority: "Moyenne",
    impact: "Location meublée en société avec amortissements",
    description:
      "Société commerciale entre membres d’une même famille (≤ 2ᵉ degré) permettant LMNP au réel avec amortissement et transmission.",
    advantages: [
      "Limite de responsabilité",
      "Amortissement et déduction travaux",
      "Anticipation transmission par cession de parts"
    ],
    disadvantages: [
      "Formalisme de création + compta",
      "Plus‑value professionnelle (2025)"
    ],
    icon: Users,
    color: "text-purple-700",
    conditions: []
  },
  {
    id: 26,
    title: "Pacte Dutreil transmission titres",
    category: "Entreprise",
    priority: "Haute",
    impact: "Abattement 75 % + éventuelle réduction 50 %",
    description:
      "Mise en place d’un engagement collectif (2 ans) puis individuel (4 ans) pour transmettre les titres avec abattement 75 % et réduction 50 % si donateur < 70 ans.",
    advantages: [
      "Forte économie de droits",
      "Possible en pleine propriété ou démembrement"
    ],
    disadvantages: [
      "Contraintes de conservation 6 ans mini",
      "Coûts et formalisme"
    ],
    icon: DollarSign,
    color: "text-emerald-700",
    conditions: []
  },
  {
    id: 27,
    title: "Family buy‑out (FBO) / soulte holding",
    category: "Entreprise",
    priority: "Moyenne",
    impact: "Financement de la reprise intrafamiliale",
    description:
      "Donation‑partage avec soulte : la holding de l’héritier repreneur finance la soulte via emprunt remboursé par dividendes (régime mère/fille).",
    advantages: [
      "Maintien de l’équilibre entre héritiers",
      "Optimise liquidités de la société"
    ],
    disadvantages: [
      "Montage bancaire et juridique complexe",
      "Nécessite activité compatible (libérale)"
    ],
    icon: BarChart2,
    color: "text-cyan-700",
    conditions: []
  },
  {
    id: 28,
    title: "Donation avant cession",
    category: "Entreprise",
    priority: "Haute",
    impact: "Purge la plus‑value latente pour les enfants",
    description:
      "Donner les titres avant signature d’une promesse de vente pour transférer la plus‑value aux donataires et réduire l’impôt global.",
    advantages: [
      "Économie d’IR‑PV",
      "Transmission anticipée du patrimoine"
    ],
    disadvantages: [
      "Frais de donation",
      "Risque de requalification si donation‑façade"
    ],
    icon: PieChart,
    color: "text-pink-700",
    conditions: []
  },
  {
    id: 29,
    title: "Apport‑cession (article 150‑0 B ter)",
    category: "Entreprise",
    priority: "Moyenne",
    impact: "Report d’imposition de la plus‑value",
    description:
      "Apporter les titres à une holding avant cession pour bénéficier du report d’imposition et réinvestir dans des activités économiques.",
    advantages: [
      "Report illimité si réinvestissement 60 %",
      "Holding outil de structuration patrimoniale"
    ],
    disadvantages: [
      "Contraintes de réinvestissement",
      "Complexité juridique"
    ],
    icon: Activity,
    color: "text-orange-700",
    conditions: []
  },
  {
    id: 30,
    title: "Titres de participation – régime long terme",
    category: "Entreprise",
    priority: "Basse",
    impact: "QPFC 12 % : taux effectif ≈ 3 %",
    description:
      "Cession de titres de participation détenus > 2 ans par une société à l’IS : exonération d’IS hors quote‑part 12 %.",
    advantages: [
      "Fiscalité très faible sur la plus‑value",
      "Planification stratégique des cessions"
    ],
    disadvantages: [
      "Moins‑value LT non imputable",
      "Réservé aux titres ≥ 10 % (ou influence)"
    ],
    icon: Repeat,
    color: "text-gray-700",
    conditions: []
  },
  {
    id: 31,
    title: "Leverage Buy‑Out (LBO)",
    category: "Financement",
    priority: "Moyenne",
    impact: "Effet de levier financier sur la rentabilité",
    description:
      "Création d’une holding endettée (NewCo) pour racheter une cible, remboursement via remontée de dividendes.",
    advantages: [
      "Facilite la transmission ou la cession d’entreprise",
      "Optimise la rentabilité des capitaux propres"
    ],
    disadvantages: [
      "Endettement élevé",
      "Vigilance du banquier sur la trésorerie"
    ],
    icon: MoveRight,
    color: "text-blue-800",
    conditions: []
  },
  {
    id: 32,
    title: "Owner Buy‑Out (OBO)",
    category: "Financement",
    priority: "Moyenne",
    impact: "Monétise un actif en gardant le contrôle",
    description:
      "Cession à soi‑même via une société contrôlée pour dégager du cash et préparer la transmission (inclure un proche pour éviter abus fiscal).",
    advantages: [
      "Réduit l’IFI via endettement",
      "Flux de trésorerie immédiatement disponibles"
    ],
    disadvantages: [
      "Suspicion d’abus de droit si objectif purement fiscal",
      "Nécessite structure sociétaire et comptable"
    ],
    icon: Sparkle,
    color: "text-indigo-800",
    conditions: []
  },
  {
    id: 33,
    title: "Réduction de capital non motivée par des pertes",
    category: "Entreprise",
    priority: "Basse",
    impact: "Rachats de titres traités en dividendes",
    description:
      "Rembourser le capital aux associés proportionnellement en rachetant les titres, possibilité d’optimiser l’intégration fiscale.",
    advantages: [
      "Augmente le pouvoir relatif des associés restants",
      "Souplesse de distribution de trésorerie"
    ],
    disadvantages: [
      "Plus‑value imposée (flat tax 30 %)",
      "Formalités AGE + délais d’opposition"
    ],
    icon: Coins,
    color: "text-amber-800",
    conditions: []
  }
];
