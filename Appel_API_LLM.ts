/**
 * 🤖 CONFIGURATION DES APPELS API LLM - GEMINI 2.0 FLASH-LITE
 * 
 * Ce fichier contient toutes les configurations pour les appels API LLM
 * utilisés dans l'analyse des données clients pour l'export PDF.
 * 
 * Pour chaque appel, définir :
 * - variable: Nom de la variable pour le Google Docs (format {{variable}})
 * - prompt: Prompt d'analyse personnalisé
 * - contextKeys: Clés localStorage à inclure comme contexte
 * - maxTokens: Limite de tokens pour la réponse (optionnel)
 */

export interface LLMCallConfig {
  variable: string;           // Variable qui remplacera la réponse dans Google Docs
  prompt: string;            // Prompt personnalisé pour l'analyse
  contextKeys: string[];     // Clés localStorage à inclure comme contexte
  maxTokens?: number;        // Limite de tokens pour la réponse
  description?: string;      // Description de l'analyse (pour documentation)
}

// Configuration API
export const GEMINI_CONFIG = {
  API_KEY: 'AIzaSyBy7JnOyppwWWYhr-nt8Ihw65LNuQ6rnao',
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TEMPERATURE: 0.7,
};

/**
 * 📋 CONFIGURATION DES APPELS LLM
 * 
 * Chaque configuration génère une variable utilisable dans le Google Docs
 * avec le format {{variable}}
 */
export const LLM_CALLS_CONFIG: LLMCallConfig[] = [
  
  // 💰 ANALYSE BUDGET
  {
    variable: 'analyseFluxForcesIA',
    description: 'Analyse des flux financiers',
    prompt: `Tu es en train de rédiger une toute petite partie d'une étude patrimoniale écrite par un ingénieur patrimonial expert.
    Rédige 3 forces des flux du client, dans le contexte de la gestion de patrimoine. Par exemple, selon son patrimoine, tu peux dire des forces comme (à adapter à la situation du client) : 

    ##########
    Revenus diversifiés : Salaires stables, revenus d'activité indépendante, dividendes, plus-values mobilières, prestations sociales—Revenus passifs : Le fait d'avoir d'ores et déjà des revenus fonciers à hauteur de ...% est une bonne chose, il faudra encore accentuer ou optimiser ces revenus
    —
    Bonne capacité d'épargne : La capacité d'épargne de ...€/mois servira pour faire des préconisations permettant de répondre à vos besoins.
    —
    Gestion maîtrisée des charges : Les charges courantes représentent ...% des revenus, ce qui témoigne d'une bonne maîtrise budgétaire et laisse des marges de manœuvre.
    —
    Absence d'endettement excessif : Le taux d'endettement de ...% reste bien en deçà des seuils bancaires, permettant une capacité d'emprunt supplémentaire.
    —
    Réserves de précaution constituées : L'épargne de précaution de ...€ représente ... mois de charges, assurant une sécurité financière appropriée.
    —
    Régularité des flux : La stabilité des revenus mensuels de ...€ facilite la planification financière et les projets à moyen terme.
    —
    Optimisation fiscale en cours : Les dispositifs fiscaux utilisés (..., ..., ...) génèrent une économie d'impôt de ...€ annuels.
    —
    Patrimoine existant valorisable : La valeur du patrimoine immobilier/mobilier existant de ...€ constitue une base solide pour de futurs arbitrages.
    —
    Revenus passifs : Le fait d’avoir d’ores et déjà des revenus fonciers à hauteur de 14% est une bonne chose, il faudra encore accentuer ou optimiser ces revenus.
    —
    Bonne capacité d’épargne : La capacité d’épargne de ... servira pour faire des préconisations permettant de répondre à vos besoins.
    ##########

    En enlevant tous les #
    
    RÈGLES STRICTES :
    - EXACTEMENT 3 forces, pas plus, pas moins
    - Chaque force séparée par " — " (cadratin avec espaces)
    - Mentionne juste Monsieur ou Madame, mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Commence directement par le titre de la force
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - 15-25 mots par force
    - Style professionnel descriptif
    - Maximum 75 mots au total`,
    contextKeys: ['budgetRevenusInfo', 'budgetChargesInfo', 'identityPersonalInfo'],
    maxTokens: 500
  },
  

  {
    variable: 'analyseFluxFaiblessesIA',
    description: 'Analyse des flux financiers',
    prompt: `Tu es en train de rédiger une toute petite partie d'une étude patrimoniale écrite par un ingénieur patrimonial expert.
    Rédige 3 faiblesses des flux du client, dans le contexte de la gestion de patrimoine. Par exemple, selon son patrimoine, tu peux dire des forces comme (à adapter à la situation du client) : 

    ##########
    Concentration des revenus : La dépendance excessive aux revenus salariaux (...% du total) expose à un risque en cas de perte d'emploi ou de baisse d'activité.

    Capacité d'épargne limitée : La capacité d'épargne mensuelle de ...€ reste insuffisante pour atteindre vos objectifs dans les délais souhaités.
    —
    Charges élevées : Les charges courantes représentent ...% des revenus, réduisant significativement les marges de manœuvre financières.
    —
    Endettement préoccupant : Le taux d'endettement de ...% approche les seuils bancaires et limite la capacité d'emprunt future.
    —
    Réserves de précaution insuffisantes : L'épargne de précaution de ...€ ne représente que ... mois de charges, en deçà des 3-6 mois recommandés.
    —
    Irrégularité des revenus : La variabilité des revenus (...€ à ...€) complique la planification financière et l'obtention de crédits.
    —
    Optimisation fiscale négligée : L'absence de dispositifs fiscaux adaptés génère une surcharge d'impôt estimée à ...€ annuels.
    —
    Patrimoine peu diversifié : La concentration sur l'immobilier (...% du patrimoine) expose à un risque de marché spécifique.
    —
    Absence de revenus passifs : L'inexistence de revenus fonciers ou financiers réguliers limite l'autonomie financière future.
    —
    Épargne non productive : ...€ placés sur des livrets peu rémunérés (...% brut) subissent l'érosion de l'inflation.
    —
    Couverture assurantielle lacunaire : Les garanties actuelles (..., ...) présentent des lacunes face aux risques identifiés.
    —
    Planification successorale inexistante : L'absence d'optimisation successorale expose à une fiscalité majorée de ...€ potentiels.
    ##########

    En enlevant tous les #
    
    RÈGLES STRICTES :
    - EXACTEMENT 3 faiblesses, pas plus, pas moins
    - Chaque faiblesse séparée par " — " (cadratin avec espaces)
    - Commence directement par le titre de la faiblesse
    - Mentionne juste Monsieur ou Madame, mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - 15-25 mots par faiblesse
    - Style professionnel descriptif
    - Maximum 75 mots au total`,
    contextKeys: ['budgetRevenusInfo', 'budgetChargesInfo', 'identityPersonalInfo'],
    maxTokens: 500
  },


  {
    variable: 'poidsFluxIA',
    description: 'Analyse des poids des flux',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse la composition des flux de ce client et évalue sa diversification.

    Évalue :
    - La répartition entre revenus, charges et épargne
    - Les déséquilibres potentiels dans les flux que tu constates
    - Les risques de concentration

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Concernant le poids des flux, vous touchez …..% de salaire, qui sont des revenus fixes et stables, car Monsieur est fonctionnaire, ……% de BNC, qui sont des revenus issus de l’activité de Madame, plus instable et qu’il conviendra de sécuriser. Enfin, ……% sont issus des revenus fonciers de vos appartements.
    ##########

    En enlevant tous les #

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 75 mots au total`,
    contextKeys: ['budgetRevenusInfo', 'budgetChargesInfo', 'identityPersonalInfo'],
    maxTokens: 500
  },
  

  {
    variable: 'origineFluxIA',
    description: 'Analyse des origines des flux',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse la composition des flux de ce client et évalue sa diversification.

    Évalue :
    - Les origines des flux
    - Les déséquilibres potentiels dans les flux et ui apporte quoi au foyer fiscal

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Monsieur, vous percevez des revenus totaux de ... €, vous permettant d'apporter au foyer ...% des revenus, tandis que Madame apporte ...% des revenus au foyer, grâce à des revenus propres qui s'élèvent à ... €.
    ##########

    En enlevant tous les #

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 75 mots au total`,
    contextKeys: ['budgetRevenusInfo', 'budgetChargesInfo', 'identityPersonalInfo'],
    maxTokens: 500
  },

  {
    variable: 'perenniteFluxIA',
    description: 'Analyse des perennité des flux',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse la composition du patrimoine de ce client et évalue sa diversification.

    Évalue :
    - Les origines des flux
    - Les déséquilibres potentiels dans les flux et ui apporte quoi au foyer fiscal

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Monsieur, vous êtes marié(e) sous le régime de la communauté universelle, sans contrat. Dans ce cadre, il est important de constater la pérennité des revenus, et d’anticiper une protection le cas échéant.
    Vos revenus sont globalement stables, ce qui constitue un socle favorable à la projection patrimoniale.
    Pour rappel, votre capacité d’épargne s’établit à ... €/mois, ce qui servira otamment à nourrir vos objectifs patrimoniaux.
    ##########

    En enlevant tous les #

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 75 mots au total`,
    contextKeys: ['budgetRevenusInfo', 'budgetChargesInfo', 'identityPersonalInfo'],
    maxTokens: 500
  },

  {
    variable: 'analyseTempsLongIA',
    description: 'Analyse des perennité des flux',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse la composition du patrimoine de ce client et évalue sur le temps long.

    Évalue :
    - L'analyse sur un temps long de l'évolution du patrimoine du client
    - Les risques potentiels
    - Les opportunités d'optimisation

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Dans notre analyse, nous constatons que vos biens immobiliers nets représentent aujourd’hui ...% et vos actifs financiers nets ...%. D’après l’INSEE le patrimoine des français doit être constitué d’un maximum de 60% d'actifs immobiliers, et 40% d’actifs financiers, c’est pourquoi il peut être judicieux d’équilibrer légèrement ce rapport selon les standards afin de trouver une stabilité dans votre patrimoine. Votre patrimoine immobilier, bien que rapportant des revenus fonciers, est illiquide, ce qui peut être désavantageux, et entraîne des taxes parfois mal anticipées.
    D’autre part, vous êtes à environ ...% du seuil de l’IFI (1 300 000 €). Il peut être judicieux de rééquilibrer votre patrimoine vers plus de financier pour optimiser sa structure et prévenir une imposition future.
    Enfin, le patrimoine immobilier, lorsqu’il sera transmis, entraînera de fort droits de mutation à titre gratuit (DMTG), c’est pourquoi il sera envisageable de démembrer des biens ou encore créer une société civile, afin d’améliorer la fluidité de la transmission.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 100 mots au total`,
    contextKeys: ['fiscaliteIRInfo', 'fiscaliteIFIInfo', 'patrimoineImmobilierInfo', 'patrimoineFinancierInfo', 'identityPersonalInfo'],
    maxTokens: 500
  },


  {
    variable: 'analyseTempsCourtIA',
    description: 'Analyse des perennité des flux',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse la composition du patrimoine de ce client et évalue sur le temps court.

    Évalue :
    - L'analyse sur un temps court de l'évolution du patrimoine du client
    - Les risques potentiels
    - Les opportunités d'optimisation

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    En ce qui concerne votre part de liquidité, vous possédez une épargne disponible à hauteur de ... € (ensemble des comptes courants + autres livrets bancaires). La recommandation de l’AMF préconise une épargne disponible de ... € (Revenus annuels /12*6) d’épargne disponible à avoir.
    Il y a une surpondération de ... €, qui vous permettra d’investir sur des supports d’investissements financiers sur le long terme, tels que votre  assurance-vie ou encore votre compte-titres, tout en maintenant une épargne de précaution qui vous apporte un confort. A noter que cette surpondération peut être justifiée par le fait qu’il constitue une réserve de secours en cas de problème dans votre foyer."
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 100 mots au total`,
    contextKeys: ['fiscaliteIRInfo', 'fiscaliteIFIInfo', 'patrimoineImmobilierInfo', 'patrimoineFinancierInfo', 'identityPersonalInfo'],
    maxTokens: 500
  },


  {
    variable: 'profilRisqueIA',
    description: 'Analyse des risques',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse le profil de risque de ce client.

    Évalue :
    - Le profil de risque du client
    - Les risques potentiels
    - Les opportunités d'optimisation

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Vous nous avez fait part de votre appétence au risque, qui est ... sur une échelle de 1 à 7. 
    D'autre part, vous n’avez pas précisé de profil extra-financier, c’est-à-dire concernant les critères environnementaux, sociaux et de gouvernance, c’est pourquoi nous considérerons que vous avez un profil neutre de ce point de vue.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 100 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineImmobilierInfo', 'patrimoineFinancierInfo', 'identityObjectifsInfo'],
    maxTokens: 500
  },


  {
    variable: 'conformiteIA',
    description: 'Analyse des risques',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse la conformité du profil de risque de ce client.

    Évalue :
    - Le profil de risque du client
    - Les risques potentiels
    - Les opportunités d'optimisation

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    En constatant votre profil de risque que vous avez avez actuellement dans votre patrimoine, nous constatons un profil de ... sur une échelle de 1 à 7. Nous constations ainsi qu'il y a à première vue un décalage entre votre appétence au risque et votre profil de risque actuel.
    Suite à cette information et la communication de votre patrimoine financier actuel nous pourrons proposer une allocation d’actif en ce sens pour répondre au maximum à vos objectifs et/ou répondre à une attente de rendement plus important.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 100 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineImmobilierInfo', 'patrimoineFinancierInfo', 'identityObjectifsInfo'],
    maxTokens: 500
  },


  {
    variable: 'caracteristiquesCTIA',
    description: 'Caractéristiques des placements financiers court terme',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse les caractéristiques des placements financiers court terme.

    Évalue :
    - Les caractéristiques des placements financiers court terme
    - Les définitions ou informations primordiales

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Les placements sur ... et ... sont très liquides, accessibles rapidement, avec un taux de rémunération de ...% pour le ... et ...% pour le ....
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 25 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
    maxTokens: 500
  },

  {
    variable: 'caracteristiquesMTIA',
    description: 'Caractéristiques des placements financiers moyen terme',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse les caractéristiques des placements financiers moyen terme.

    Évalue :
    - Les caractéristiques des placements financiers moyen terme
    - Les définitions ou informations primordiales

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Les placements sur ... sont des placements flexibles permettant d'investir en actions, obligations et autres titres, offrant une liquidité modérée et une diversification des actifs, avec des frais de gestion réduits.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 25 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
    maxTokens: 500
  },

  {
    variable: 'caracteristiquesLTIA',
    description: 'Caractéristiques des placements financiers long terme',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse les caractéristiques des placements financiers long terme.

    Évalue :
    - Les caractéristiques des placements financiers long terme
    - Les définitions ou informations primordiales

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Les placements sur ... offre une flexibilité d'investissement avec des supports variés, tout en bénéficiant d'une fiscalité avantageuse et d'une liquidité partielle, avec des frais de gestion à prendre en compte.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 25 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
    maxTokens: 500
  },

  {
    variable: 'ameliorationsCTIA',
    description: 'Améliorations des placements financiers court terme',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse les améliorations des placements financiers court terme.

    Évalue :
    - Les améliorations des placements financiers court terme

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    La sur-pondération de liquidités de ... € offre une opportunité d'optimiser les placements à court terme, tout en maintenant une réserve de précaution adaptée aux besoins du foyer.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 25 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
    maxTokens: 500
  },

  {
    variable: 'ameliorationsMTIA',
    description: 'Améliorations des placements financiers moyen terme',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse les améliorations des placements financiers moyen terme.

    Évalue :
    - Les améliorations des placements financiers moyen terme

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Les performances des ... sont très disparates, avec un écart significatif de ...%, ce qui pourrait être l'occasion d'analyser la composition des portefeuilles pour envisager des rééquilibrages.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 25 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
    maxTokens: 500
  },

  {
    variable: 'ameliorationsLTIA',
    description: 'Améliorations des placements financiers long terme',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse les améliorations des placements financiers long terme.

    Évalue :
    - Les améliorations des placements financiers long terme

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    Vos placements financiers, bien que ..., ne reflètent pas/reflètent votre appétence au risque, notamment avec des ... sous-performantes et un manque d'investissements en actions.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 25 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
    maxTokens: 500
  },

  {
    variable: 'allocationActifIA',
    description: 'Allocation des actifs',
    prompt: `Tu es un ingénieur patrimonial expert. Analyse l'allocation des actifs.

    Évalue :
    - L'allocation des actifs

    Exemple de réponse (à adapter à la situation du client) :
    ##########
    L’allocation d’actifs est un élément central dans la préparation aux évènements de la vie, la ... ou une .... L’allocation concourt à la "fabrication" des compléments de revenus futurs, et à la stabilisation de votre patrimoine financier. Si rien n’est fait sur le long terme (10 ans et plus), votre train de vie risque d’en souffrir, ce qui aura des conséquences au moment de la retraite, d’autant que nous sommes dans un contexte où l’inflation est encore forte (conséquences sur le pouvoir d’achat).

    Nous avons vu de nombreuses incohérences :
    ➣ Tant sur le niveau des encours avec une poche MT non validée par un objectif patrimonial
    ➣ Que sur les rendements avec une divergence : certains fonds de long terme rapportent moins que le court terme.
    ➣ Enfin, le respect du profil investisseur est à ajuster.

    Dans les préconisations nous vous proposerons une nouvelle allocation d’actif en phase avec la performance financière que vous devez avoir compte tenu de votre niveau de risque et de votre objectif de long terme.
    ##########

    RÈGLES STRICTES :
    - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
    - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
    - Style professionnel descriptif
    - Maximum 25 mots au total`,
    contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
    maxTokens: 500
  },



    // 💰 ANALYSE BUDGET
    {
      variable: 'analyseStocksFinanciersForcesIA',
      description: 'Analyse des stocks financiers',
      prompt: `Tu es en train de rédiger une toute petite partie d'une étude patrimoniale écrite par un ingénieur patrimonial expert.
      Rédige 3 forces des stocks financiers du client, dans le contexte de la gestion de patrimoine. Par exemple, selon son patrimoine, tu peux dire des forces comme (à adapter à la situation du client) : 
  
      ##########
      Bonne diversification des produits, avec des liquidités conséquentes
      —
      Sécurité du patrimoine financier assuré avec beaucoup de liquidités
      —
      Flexibilité du patrimoine financier grâce à des compte-titres et assurance-vie dont les arbitrages sont possibles rapidement.
      ##########
  
      En enlevant tous les #
      
      RÈGLES STRICTES :
      - EXACTEMENT 3 forces, pas plus, pas moins
      - Chaque force séparée par " — " (cadratin avec espaces)
      - Commence directement par le titre de la force
      - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
      - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
      - 15-25 mots par force
      - Style professionnel descriptif
      - Maximum 75 mots au total`,
      contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
      maxTokens: 500
    },
    
  
    {
      variable: 'analyseStocksFinanciersFaiblessesIA',
      description: 'Analyse des stocks financiers',
      prompt: `Tu es en train de rédiger une toute petite partie d'une étude patrimoniale écrite par un ingénieur patrimonial expert.
      Rédige 3 faiblesses des stocks financiers du client, dans le contexte de la gestion de patrimoine. Par exemple, selon son patrimoine, tu peux dire des forces comme (à adapter à la situation du client) : 
  
      ##########
      Rendements hétérogènes et peu rémunérateurs des ..., avec un écart significatif de ...% entre les deux comptes.
      —
      Faible rémunération des liquidités, avec des ... à ...% et des ... à ...%.
      —
      Sous-pondération de liquidités, avec ...€ placés sur des ... et ... à ...%, offrant une opportunité d'optimisation des placements à court terme.
      ##########
  
      En enlevant tous les #
      
      RÈGLES STRICTES :
      - EXACTEMENT 3 faiblesses, pas plus, pas moins
      - Chaque faiblesse séparée par " — " (cadratin avec espaces)
      - Commence directement par le titre de la faiblesse
      - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
      - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
      - 15-25 mots par faiblesse
      - Style professionnel descriptif
      - Maximum 75 mots au total`,
      contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
      maxTokens: 500
    },


    {
      variable: 'analyseStocksFinanciersRisquesIA',
      description: 'Analyse des stocks financiers',
      prompt: `Tu es en train de rédiger une toute petite partie d'une étude patrimoniale écrite par un ingénieur patrimonial expert.
      Rédige 3 risques des stocks financiers du client, dans le contexte de la gestion de patrimoine. Par exemple, selon son patrimoine, tu peux dire des forces comme (à adapter à la situation du client) : 
  
      ##########
      Erosion du patrimoine financier par l’inflation de ...% environ, et une baisse attendue du rendement des livrets A, ce qui limiterait l'évolution du patrimoine financier, sans optimisation.
      —
      Volatilité importante sur les comptes titres ordinaires, avec un écart de performance significatif de ...%, ce qui pourrait affecter la stabilité du patrimoine.
      —
      Risque de concentration des placements en ..., avec une performance moyenne de ...%, ce qui pourrait limiter les opportunités de diversification.
      ##########
  
      En enlevant tous les #
      
      RÈGLES STRICTES :
      - EXACTEMENT 3 risques, pas plus, pas moins
      - Chaque risque séparé par " — " (cadratin avec espaces)
      - Commence directement par le titre du risque
      - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
      - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
      - 15-25 mots par risque
      - Style professionnel descriptif
      - Maximum 75 mots au total`,
      contextKeys: ['identityPersonalInfo', 'patrimoineFinancierInfo'],
      maxTokens: 500
    },


    {
      variable: 'analysePerformancesIA',
      description: 'Analyse des stocks immobiliers',
      prompt: `Tu es en train de rédiger une toute petite partie d'une étude patrimoniale écrite par un ingénieur patrimonial expert.
      Rédige un court paragraphe explicatif sur les performances des stocks immobiliers du client, dans le contexte de la gestion de patrimoine. Par exemple, selon son patrimoine, tu peux dire des forces comme (à adapter à la situation du client impérativement) : 
  
      ##########
      La résidence secondaire de ... avec une valeur vénale de ... €, ne génère pas/génère de revenus .... Cette absence de revenus ... peut être un manque à gagner si vous n’utilisez pas souvent cette résidence secondaire.
      ##########

      ou

      ##########
      Les performances des biens immobiliers sont très ..., avec des écarts ... de rendement. Ainsi, en performances annualisées, le rendement de la résidence secondaire de ... est de ...%/an en moyenne depuis ... ans. Ce rendement est ... mais il contribue à la stabilité et à la diversification des sources de revenus.
      ##########
  
      En enlevant tous les #
      
      RÈGLES STRICTES :
      - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
      - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
      - Style professionnel descriptif
      - Maximum 75 mots au total`,
      contextKeys: ['identityPersonalInfo', 'patrimoineImmobilierInfo'],
      maxTokens: 500
    },


    {
      variable: 'analyseEmplacementIA',
      description: 'Analyse des stocks immobiliers',
      prompt: `Tu es en train de rédiger une toute petite partie d'une étude patrimoniale écrite par un ingénieur patrimonial expert.
      Rédige un court paragraphe explicatif sur les emplacements des biens immobiliers du client, dans le contexte de la gestion de patrimoine. Par exemple, selon son patrimoine, tu peux dire des forces comme (à adapter à la situation du client) : 
  
      ##########
      Le seul bien immobilier est situé à ..., une commune de ..., réputée pour son cadre de vie agréable et son attractivité touristique. Cette localisation permet de bénéficier d'un environnement ..., proche de ..., ce qui peut être un atout pour la gestion des biens.
      ##########

      ou

      ##########
      Les biens immobiliers du client sont situés à ..., une commune de .... Cette localisation offre un cadre de vie agréable, avec un accès à la mer et un environnement naturel préservé. .... est également une destination touristique prisée, ce qui peut influencer la dynamique du marché immobilier local. La situation géographique de ...., proche de ...., permet également de bénéficier d'une certaine proximité avec une grande métropole, ce qui peut être un atout pour la gestion des biens.
      ##########
  
      En enlevant tous les #
      
      RÈGLES STRICTES :
      - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
      - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
      - Style professionnel descriptif
      - Maximum 75 mots au total`,
      contextKeys: ['identityPersonalInfo', 'patrimoineImmobilierInfo'],
      maxTokens: 500
    },


    {
      variable: 'analyseEcologieIA',
      description: 'Analyse des stocks immobiliers',
      prompt: `Tu es en train de rédiger une toute petite partie d'une étude patrimoniale écrite par un ingénieur patrimonial expert.
      Rédige un court paragraphe explicatif sur les emplacements des biens immobiliers du client, dans le contexte de la gestion de patrimoine. Par exemple, selon son patrimoine, tu peux dire des forces comme (à adapter à la situation du client) : 
  
      ##########
      Les informations sur les DPE et GES sont/ne sont disponibles/pas disponibles. Cependant, il est important de noter que la Loi Climat et Résilience introduit des restrictions pour la location de biens immobiliers. À partir du 1er janvier 2025, les logements classés G seront interdits à la location. Cette interdiction s'étendra aux logements classés F à partir du 1er janvier 2028. Ces réglementations visent à améliorer l'efficacité énergétique du parc immobilier français et à réduire l'empreinte carbone des bâtiments.
      ##########
  
      En enlevant tous les #
      
      RÈGLES STRICTES :
      - Ne mets jamais de gras, jamais d'italique, jamais de signes spéciaux (**, _, etc.)
      - Mentionne juste "Monsieur" ou "Madame", mais sans leur nom ou prénom puisque c'est une partie d'une étude pour eux
      - Style professionnel descriptif
      - Maximum 75 mots au total`,
      contextKeys: ['identityPersonalInfo', 'patrimoineImmobilierInfo'],
      maxTokens: 500
    },


];



/**
 * 📊 CLÉS LOCALSTORAGE DISPONIBLES
 * 
 * Liste des clés disponibles pour le contexte :
 * - identityPersonalInfo: Informations personnelles (âge, situation familiale, etc.)
 * - budgetRevenusInfo: Revenus du client
 * - budgetChargesInfo: Charges du client
 * - patrimoineImmobilierInfo: Patrimoine immobilier
 * - patrimoineFinancierInfo: Patrimoine financier
 * - patrimoineProfessionnelInfo: Patrimoine professionnel
 * - identityObjectifsInfo: Objectifs financiers
 * - fiscaliteIRInfo: Situation fiscale (impôt sur le revenu)
 */

/**
 * 🔧 INSTRUCTIONS D'UTILISATION
 * 
 * 1. Ajouter une nouvelle configuration dans LLM_CALLS_CONFIG
 * 2. Définir la variable (sera utilisée comme {{variable}} dans Google Docs)
 * 3. Rédiger le prompt d'analyse
 * 4. Sélectionner les contextKeys appropriées
 * 5. Les variables seront automatiquement générées dans l'export PDF
 */

/**
 * 📋 EXEMPLES D'UTILISATION DANS GOOGLE DOCS
 * 
 * {{analyseFluxForcesIA}} - Analyse des forces des flux
 * {{analyseFluxFaiblessesIA}} - Analyse des faiblesses des flux
 * {{poidsFluxIA}} - Analyse du poids des flux
 * {{origineFluxIA}} - Analyse de l'origine des flux
 * {{perenniteFluxIA}} - Analyse de la pérennité des flux
 * {{analyseTempsLongIA}} - Analyse long terme
 * {{analyseTempsCourtIA}} - Analyse court terme
 * {{profilRisqueIA}} - Analyse du profil de risque
 * {{conformiteIA}} - Analyse de conformité
 * {{caracteristiquesCTIA}} - Caractéristiques court terme
 * {{caracteristiquesMTIA}} - Caractéristiques moyen terme
 * {{caracteristiquesLTIA}} - Caractéristiques long terme
 * {{ameliorationsCTIA}} - Améliorations court terme
 * {{ameliorationsMTIA}} - Améliorations moyen terme
 * {{ameliorationsLTIA}} - Améliorations long terme
 * {{allocationActifIA}} - Allocation des actifs
 * {{analyseStocksFinanciersForcesIA}} - Forces des stocks financiers
 * {{analyseStocksFinanciersFaiblessesIA}} - Faiblesses des stocks financiers
 * {{analyseStocksFinanciersRisquesIA}} - Risques des stocks financiers
 */
