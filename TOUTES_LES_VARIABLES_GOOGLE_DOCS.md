# 📋 TOUTES LES VARIABLES GOOGLE DOCS - ÉTUDE PATRIMONIALE COMPLÈTE

## 🎯 Variables d'État Civil et Identité

### 👤 **Client Principal**
```
{{title}}                    → Monsieur/Madame
{{firstName}}                → Prénom
{{lastName}}                 → Nom de famille
{{birthName}}                → Nom de naissance
{{fullName}}                 → Prénom + Nom complet
{{age}}                      → Âge (ex: "43 ans")
{{birthDate}}                → Date de naissance (format jj/mm/aaaa)
{{birthPostalCode}}          → Code postal de naissance
{{birthCity}}                → Ville de naissance
{{city}}                     → Ville de résidence
{{country}}                  → Pays (ex: "France")
{{nationality}}              → Nationalité (ex: "Française")
{{legalCapacity}}            → Capacité juridique
{{mifClassification}}        → Classification MIF
{{retirementAge}}            → Âge de départ à la retraite
```

### 💑 **Conjoint**
```
{{spouseTitle}}              → Monsieur/Madame (conjoint)
{{spouseFirstName}}          → Prénom du conjoint
{{spouseLastName}}           → Nom du conjoint
{{spouseBirthName}}          → Nom de naissance du conjoint
{{spouseFullName}}           → Prénom + Nom complet du conjoint
{{spouseAge}}                → Âge du conjoint (ex: "41 ans")
{{spouseBirthDate}}          → Date de naissance du conjoint (format jj/mm/aaaa)
{{spouseBirthPostalCode}}    → Code postal de naissance du conjoint
{{birthCity}}                → Ville de naissance du client
{{spouseBirthCity}}          → Ville de naissance du conjoint
{{spouseCity}}               → Ville de résidence du conjoint
{{spouseCountry}}            → Pays du conjoint
{{spouseNationality}}        → Nationalité du conjoint
{{legalCapacity}}            → Capacité juridique du client
{{spouseLegalCapacity}}      → Capacité juridique du conjoint
{{mifClassification}}        → Classification MIF du client
{{spouseRetirementAge}}      → Âge de départ à la retraite du conjoint
```

### 💒 **Situation Familiale**
```
{{maritalStatus}}            → Situation matrimoniale (Marié(e), Célibataire, etc.)
{{marriageDate}}             → Date de mariage (format jj/mm/aaaa)
{{marriagePlace}}            → Lieu de mariage
{{matrimonialRegime}}        → Régime matrimonial (libellé complet)
{{nbChildren}}               → Nombre d'enfants
{{parent1Name}}              → Nom du parent 1
{{parent2Name}}              → Nom du parent 2
```

### 🏢 **Informations Professionnelles**
```
{{profession}}               → Profession du client
{{company}}                  → Entreprise du client
{{csp}}                      → Catégorie socio-professionnelle (libellé complet)
{{spouseProfession}}         → Profession du conjoint
{{spouseCompany}}            → Entreprise du conjoint
{{spouseCsp}}                → Catégorie socio-professionnelle du conjoint (libellé complet)
```

## 💰 Variables de Patrimoine

### 📊 Exemples de Tableaux pour Google Docs

Cette section montre comment utiliser les variables de patrimoine, revenus et charges dans des tableaux directement copiables dans Google Docs. Le système récupère les données brutes (ex: `lastName`, `titleImmo1`) depuis votre application et les préfixes (ex: `eu-`, `M-`) appliquent un formatage directement dans le document.

### **Tableau Patrimoine**

|  |  |  |  |  |  | {{title}} |  | Commun |  | {{spouseTitle}} |  |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | :---- | ----- | :---- | :---: | ----- |
| **Biens immobiliers ({{eu-totalImmo}} net \- {{pct-totalImmo}})** |  |  |  |  |  |  |  |  |  |  |  |
| {{bienImmobilier1}} |  |  |  |  |  | {{eu-titleImmo1}} |  | {{eu-comImmo1}} |  | {{eu-spouseTitleImmo1}} |  |
| {{bienImmobilier2}} |  |  |  |  |  | {{eu-titleImmo2}} |  | {{eu-comImmo2}} |  | {{eu-spouseTitleImmo2}} |  |
| {{bienImmobilier3}} |  |  |  |  |  | {{eu-titleImmo3}} |  | {{eu-comImmo3}} |  | {{eu-spouseTitleImmo3}} |  |
| {{bienImmobilier4}} |  |  |  |  |  | {{eu-titleImmo4}} |  | {{eu-comImmo4}} |  | {{eu-spouseTitleImmo4}} |  |
| {{bienImmobilier5}} |  |  |  |  |  | {{eu-titleImmo5}} |  | {{eu-comImmo5}} |  | {{eu-spouseTitleImmo5}} |  |
| {{bienImmobilier6}} |  |  |  |  |  | {{eu-titleImmo6}} |  | {{eu-comImmo6}} |  | {{eu-spouseTitleImmo6}} |  |
| {{bienImmobilier7}} |  |  |  |  |  | {{eu-titleImmo7}} |  | {{eu-comImmo7}} |  | {{eu-spouseTitleImmo7}} |  |
| {{bienImmobilier8}} |  |  |  |  |  | {{eu-titleImmo8}} |  | {{eu-comImmo8}} |  | {{eu-spouseTitleImmo8}} |  |
| {{bienImmobilier9}} |  |  |  |  |  | {{eu-titleImmo9}} |  | {{eu-comImmo9}} |  | {{eu-spouseTitleImmo9}} |  |
| {{bienImmobilier10}} |  |  |  |  |  | {{eu-titleImmo10}} |  | {{eu-comImmo10}} |  | {{eu-spouseTitleImmo10}} |  |
| **Biens professionnels ({{eu-totalPro}} net \- {{pct-totalPro}})** |  |  |  |  |  |  |  |  |  |  |  |
| {{bienProfessionnel1}} |  |  |  |  |  | {{eu-titlePro1}} |  | {{eu-comPro1}} |  | {{eu-spouseTitlePro1}} |  |
| {{bienProfessionnel2}} |  |  |  |  |  | {{eu-titlePro2}} |  | {{eu-comPro2}} |  | {{eu-spouseTitlePro2}} |  |
| {{bienProfessionnel3}} |  |  |  |  |  | {{eu-titlePro3}} |  | {{eu-comPro3}} |  | {{eu-spouseTitlePro3}} |  |
| {{bienProfessionnel4}} |  |  |  |  |  | {{eu-titlePro4}} |  | {{eu-comPro4}} |  | {{eu-spouseTitlePro4}} |  |
| {{bienProfessionnel5}} |  |  |  |  |  | {{eu-titlePro5}} |  | {{eu-comPro5}} |  | {{eu-spouseTitlePro5}} |  |
| {{bienProfessionnel6}} |  |  |  |  |  | {{eu-titlePro6}} |  | {{eu-comPro6}} |  | {{eu-spouseTitlePro6}} |  |
| {{bienProfessionnel7}} |  |  |  |  |  | {{eu-titlePro7}} |  | {{eu-comPro7}} |  | {{eu-spouseTitlePro7}} |  |
| {{bienProfessionnel8}} |  |  |  |  |  | {{eu-titlePro8}} |  | {{eu-comPro8}} |  | {{eu-spouseTitlePro8}} |  |
| {{bienProfessionnel9}} |  |  |  |  |  | {{eu-titlePro9}} |  | {{eu-comPro9}} |  | {{eu-spouseTitlePro9}} |  |
| {{bienProfessionnel10}} |  |  |  |  |  | {{eu-titlePro10}} |  | {{eu-comPro10}} |  | {{eu-spouseTitlePro10}} |  |
| **Patrimoine financier ({{eu-totalFi}} net \- {{pct-totalFi}})** |  |  |  |  |  |  |  |  |  |  |  |
| {{bienFinancier1}} |  |  |  |  |  | {{eu-titleFi1}} |  | {{eu-comFi1}} |  | {{eu-spouseTitleFi1}} |  |
| {{bienFinancier2}} |  |  |  |  |  | {{eu-titleFi2}} |  | {{eu-comFi2}} |  | {{eu-spouseTitleFi2}} |  |
| {{bienFinancier3}} |  |  |  |  |  | {{eu-titleFi3}} |  | {{eu-comFi3}} |  | {{eu-spouseTitleFi3}} |  |
| {{bienFinancier4}} |  |  |  |  |  | {{eu-titleFi4}} |  | {{eu-comFi4}} |  | {{eu-spouseTitleFi4}} |  |
| {{bienFinancier5}} |  |  |  |  |  | {{eu-titleFi5}} |  | {{eu-comFi5}} |  | {{eu-spouseTitleFi5}} |  |
| {{bienFinancier6}} |  |  |  |  |  | {{eu-titleFi6}} |  | {{eu-comFi6}} |  | {{eu-spouseTitleFi6}} |  |
| {{bienFinancier7}} |  |  |  |  |  | {{eu-titleFi7}} |  | {{eu-comFi7}} |  | {{eu-spouseTitleFi7}} |  |
| {{bienFinancier8}} |  |  |  |  |  | {{eu-titleFi8}} |  | {{eu-comFi8}} |  | {{eu-spouseTitleFi8}} |  |
| {{bienFinancier9}} |  |  |  |  |  | {{eu-titleFi9}} |  | {{eu-comFi9}} |  | {{eu-spouseTitleFi9}} |  |
| {{bienFinancier10}} |  |  |  |  |  | {{eu-titleFi10}} |  | {{eu-comFi10}} |  | {{eu-spouseTitleFi10}} |  |
| **Patrimoine net** |  |  |  |  |  | **{{eu-totalTitle}}** |  | **{{eu-totalCom}}** |  | **{{eu-totalSpouseTitle}}** |  |
| **Patrimoine net total** |  |  |  |  |  |  |  |  |  | **{{eu-totalPat}}** |  |

### **Tableau Revenus et Charges**

| Revenus |  |  |  |  |  | Charges |  |  |  |  |  |
| ----- | ----- | ----- | ----- | ----: | ----- | ----- | ----- | ----- | ----- | ----: | ----- |
| {{intitule_revenu1}} |  |  |  | {{eu-montant_revenu1}} |  | {{intitule_charge1}} |  |  |  | {{eu-montant_charge1}} |  |
| {{intitule_revenu2}} |  |  |  | {{eu-montant_revenu2}} |  | {{intitule_charge2}} |  |  |  | {{eu-montant_charge2}} |  |
| {{intitule_revenu3}} |  |  |  | {{eu-montant_revenu3}} |  | {{intitule_charge3}} |  |  |  | {{eu-montant_charge3}} |  |
| {{intitule_revenu4}} |  |  |  | {{eu-montant_revenu4}} |  | {{intitule_charge4}} |  |  |  | {{eu-montant_charge4}} |  |
| {{intitule_revenu5}} |  |  |  | {{eu-montant_revenu5}} |  | {{intitule_charge5}} |  |  |  | {{eu-montant_charge5}} |  |
| {{intitule_revenu6}} |  |  |  | {{eu-montant_revenu6}} |  | {{intitule_charge6}} |  |  |  | {{eu-montant_charge6}} |  |
| {{intitule_revenu7}} |  |  |  | {{eu-montant_revenu7}} |  | {{intitule_charge7}} |  |  |  | {{eu-montant_charge7}} |  |
| {{intitule_revenu8}} |  |  |  | {{eu-montant_revenu8}} |  | {{intitule_charge8}} |  |  |  | {{eu-montant_charge8}} |  |
| {{intitule_revenu9}} |  |  |  | {{eu-montant_revenu9}} |  | {{intitule_charge9}} |  |  |  | {{eu-montant_charge9}} |  |
| {{intitule_revenu10}} |  |  |  | {{eu-montant_revenu10}} |  | {{intitule_charge10}} |  |  |  | {{eu-montant_charge10}} |  |
| **Total** |  |  |  | {{eu-montant_total__revenus}} |  | **Total** |  |  |  | {{eu-montant_total__charges}} |  |

### 💰 **Variables Financières - Revenus et Charges**
```
{{intitule_revenu1}}         → Intitulé du revenu 1
{{montant_revenu1}}          → Montant du revenu 1 (formaté avec €)
{{intitule_revenu2}}         → Intitulé du revenu 2
{{montant_revenu2}}          → Montant du revenu 2
...
{{intitule_revenu10}}        → Intitulé du revenu 10
{{montant_revenu10}}         → Montant du revenu 10

{{montant_total__revenus}}   → TOTAL des revenus (formaté avec €)

{{intitule_charge1}}         → Intitulé de la charge 1
{{montant_charge1}}          → Montant de la charge 1 (formaté avec €)
{{intitule_charge2}}         → Intitulé de la charge 2
{{montant_charge2}}          → Montant de la charge 2
...
{{intitule_charge10}}        → Intitulé de la charge 10
{{montant_charge10}}         → Montant de la charge 10

{{montant_total__charges}}   → TOTAL des charges (formaté avec €)
```

## 🎯 Variables de Préconisations

### 📊 **Préconisations Globales**
```
{{nbPreconisations}}         → Nombre total de préconisations sélectionnées
{{preconisations_client}}    → TOUTES les préconisations formatées (texte complet)
```

### 📝 **Préconisations Individuelles (jusqu'à 20)**
```
{{preconisation_1_titre}}           → Titre de la préconisation 1
{{preconisation_1_description}}     → Description complète
{{preconisation_1_priorite}}        → Priorité (Haute, Moyenne, Faible)
{{preconisation_1_categorie}}       → Catégorie (Fiscalité, Investissement, etc.)
{{preconisation_1_impact}}          → Impact estimé

{{preconisation_1_avantage_1}}      → Premier avantage
{{preconisation_1_avantage_2}}      → Deuxième avantage
{{preconisation_1_avantage_3}}      → Troisième avantage (si existe)

{{preconisation_1_inconvenient_1}}  → Premier inconvénient
{{preconisation_1_inconvenient_2}}  → Deuxième inconvénient
{{preconisation_1_inconvenient_3}}  → Troisième inconvénient (si existe)

{{preconisation_2_titre}}           → Titre de la préconisation 2
{{preconisation_2_description}}     → Description de la préconisation 2
... (et ainsi de suite jusqu'à 20)
```

## 📅 Variables Méta et Système

### 🕒 **Informations de Génération**
```
{{dateGeneration}}           → Date du jour (format français)
{{heureGeneration}}          → Heure de génération (si ajoutée)
{{anneeGeneration}}          → Année courante
{{moisGeneration}}           → Mois courant
```

### 📊 **Statistiques**
```
{{totalRevenus}}             → Total des revenus (même que montant_total__revenus)
{{totalCharges}}             → Total des charges (même que montant_total__charges)
{{soldeNet}}                 → Revenus - Charges (si calculé)
{{tauxEpargne}}              → Taux d'épargne en % (si calculé)
```

## 💬 Préfixes et Variantes de Formatage

Toutes les variables numériques peuvent être préfixées pour obtenir différents formats. Voici les préfixes disponibles :

### Nouveaux préfixes principaux
- `{{M-variable}}` → Capitalise seulement la première lettre
- `{{mm-variable}}` → Tout en minuscules  
- `{{MM-variable}}` → Tout en majuscules
- `{{eu-variable}}` → Formatage en euros, arrondi à l'entier supérieur
- `{{%-variable}}` → Formatage en pourcentage sans espace avant le %
- `{{block-variable}}` → Blocs conditionnels (affichés seulement si condition remplie)

### Anciens préfixes (compatibilité maintenue)
- `{{cap-variable}}` → Première lettre majuscule (équivalent à M-)
- `{{pct-variable}}` → Formatage pourcentage avec espace (équivalent à %- mais avec espace)
- `{{nb-variable}}` → Nombre formaté
- `{{k-variable}}` → Milliers (format "123 k€")
- `{{ord-variable}}` → Nombre ordinal (1er, 2ème, etc.)

### Variables de blocs conditionnels spéciaux
- `{{block-childrenInfo}}` → "Nombre d'enfants : X" (seulement si enfants > 0)
- `{{block-childrenPresent}}` → "true" ou "false"
- `{{block-spouseInfo}}` → "Conjoint : Prénom Nom" (seulement si conjoint existe)
- `{{block-spousePresent}}` → "true" ou "false"
- `{{block-marriageInfo}}` → "Marié(e) le JJ/MM/AAAA à Lieu" (seulement si marié)
- `{{block-marriagePresent}}` → "true" ou "false"

### Exemples de formatage
```
{{titleImmo1}}              → 150000
{{eu-titleImmo1}}           → 150 000 €
{{M-titleImmo1}}            → 0,15 M€
{{nb-titleImmo1}}           → 150 000
{{pct-titleImmo1}}          → 15%
{{%-titleImmo1}}            → 15%
{{block-titleImmo1}}        → Affiché si condition remplie
```

Pour un pourcentage de patrimoine (15%) :

```
{{pctImmo}}                 → 0.15
{{pct-pctImmo}}             → 15%
```

### ⚙️ **Variables de Contrôle**

Ces variables spéciales contrôlent le comportement du document :

```
{{_CLEAN_EMPTY_ROWS}}       → Active le nettoyage des lignes vides (true/false)
{{_CLEAN_TABLES}}           → Active le nettoyage des tableaux vides (true/false)
{{_EMPTY_VARIABLES}}        → Liste des variables considérées comme vides
```

## 🎨 Exemple de Template Google Docs Complet

```
═══════════════════════════════════════════════════════════════
                    ÉTUDE PATRIMONIALE PERSONNALISÉE
═══════════════════════════════════════════════════════════════

Généré le : {{dateGeneration}}

📋 INFORMATIONS CLIENT
─────────────────────────────────────────────────────────────

Client : {{title}} {{firstName}} {{lastName}}
Nom de naissance : {{birthName}}
Âge : {{age}}
Date de naissance : {{birthDate}}
Lieu de naissance : {{birthCity}} ({{birthPostalCode}})
Nationalité : {{nationality}}

Profession : {{profession}}
Entreprise : {{company}}
Catégorie : {{csp}}
Âge de retraite prévu : {{retirementAge}} ans

📋 INFORMATIONS CONJOINT
─────────────────────────────────────────────────────────────

Conjoint : {{spouseTitle}} {{spouseFirstName}} {{spouseLastName}}
Nom de naissance : {{spouseBirthName}}
Âge : {{spouseAge}}
Date de naissance : {{spouseBirthDate}}
Lieu de naissance : {{spouseBirthCity}} ({{spouseBirthPostalCode}})
Profession : {{spouseProfession}}
Entreprise : {{spouseCompany}}

💒 SITUATION FAMILIALE
─────────────────────────────────────────────────────────────

Situation matrimoniale : {{maritalStatus}}
Date de mariage : {{marriageDate}}
Lieu de mariage : {{marriagePlace}}
Régime matrimonial : {{matrimonialRegime}}
Nombre d'enfants : {{nbChildren}}

💰 SITUATION PATRIMONIALE
─────────────────────────────────────────────────────────────

Patrimoine total : {{eu-totalPat}}

Répartition :
- Immobilier : {{eu-totalImmo}} ({{pct-pctImmo}})
- Financier : {{eu-totalFi}} ({{pct-pctFi}})
- Professionnel : {{eu-totalPro}} ({{pct-pctPro}})

Détention :
- {{title}} {{lastName}} : {{eu-totalTitle}} ({{pct-pctTitle}})
- {{spouseTitle}} {{spouseLastName}} : {{eu-totalSpouseTitle}} ({{pct-pctSpouseTitle}})
- Commun : {{eu-totalCom}} ({{pct-pctCom}})

📈 REVENUS :
• {{intitule_revenu1}} : {{montant_revenu1}}
• {{intitule_revenu2}} : {{montant_revenu2}}
{{ ... }}

TOTAL REVENUS : {{montant_total__revenus}}

📉 CHARGES :
• {{intitule_charge1}} : {{montant_charge1}}
• {{intitule_charge2}} : {{montant_charge2}}
• {{intitule_charge3}} : {{montant_charge3}}

TOTAL CHARGES : {{montant_total__charges}}

🎯 PRÉCONISATIONS PATRIMONIALES
─────────────────────────────────────────────────────────────

Nombre de préconisations analysées : {{nbPreconisations}}

{{preconisations_client}}

📊 PRÉCONISATION DÉTAILLÉE N°1
─────────────────────────────────────────────────────────────

Titre : {{preconisation_1_titre}}
Catégorie : {{preconisation_1_categorie}}
Priorité : {{preconisation_1_priorite}}
Impact : {{preconisation_1_impact}}

Description :
{{preconisation_1_description}}

✅ Avantages :
• {{preconisation_1_avantage_1}}
• {{preconisation_1_avantage_2}}
• {{preconisation_1_avantage_3}}

❌ Inconvénients :
• {{preconisation_1_inconvenient_1}}
• {{preconisation_1_inconvenient_2}}
• {{preconisation_1_inconvenient_3}}

```

## 🔧 Comment Ajouter de Nouvelles Variables

### 1. Règles de nommage

- Utilisez le format `{{nomVariable}}` (camelCase sans espaces)
- Pour les variables de patrimoine, respectez les conventions :
  - `bienImmobilier1`, `titleImmo1`, `comImmo1`, `spouseTitleImmo1` pour l'immobilier
  - `bienFinancier1`, `titleFi1`, `comFi1`, `spouseTitleFi1` pour le financier
  - `bienProfessionnel1`, `titlePro1`, `comPro1`, `spouseTitlePro1` pour le professionnel

### 2. Formatage des valeurs

- Utilisez les préfixes (`eu-`, `M-`, `nb-`, `pct-`) pour le formatage automatique
- Pour les dates, utilisez le format français (jj/mm/aaaa)
- Pour les titres, utilisez la première lettre en majuscule ("Monsieur", "Madame")
- Pour les villes, utilisez la première lettre en majuscule

### 3. Implémentation dans le code

```typescript
// Dans /app/preconisations/page.tsx
const variables: Record<string, string> = {
  // Variables existantes...
  
  // ✨ Ajoutez vos nouvelles variables ici :
  'nouvelleVariable': clientInfo.nouvelleVariable || "valeur par défaut",
  'calculSpecial': calculateSpecialValue(clientInfo),
  'datePersonnalisee': formatCustomDate(clientInfo.someDate),
};

// Pour les variables de patrimoine avec formatage
const titleVars = generateVariableVariants('titleImmo1', value);
```

### 4. Variables de contrôle

Pour optimiser le nettoyage des tableaux et lignes vides :

```javascript
// Dans le code d'export PDF
variables['_CLEAN_EMPTY_ROWS'] = true;
variables['_CLEAN_TABLES'] = true;
variables['_EMPTY_VARIABLES'] = JSON.stringify(emptyVariables);
```

## 📝 Notes Importantes

1. **Variables vides** : Si une donnée n'existe pas, la variable sera remplacée par une chaîne vide
2. **Formatage automatique** : Les montants sont automatiquement formatés avec des espaces et le symbole €
3. **Préconisations dynamiques** : Le nombre de préconisations varie selon la sélection
4. **Caractères spéciaux** : Utilisez uniquement des caractères ASCII dans les noms de variables
5. **Sensibilité à la casse** : `{{firstName}}` ≠ `{{firstname}}`
6. **Performance** : Limitez le nombre de variables envoyées pour optimiser l'export PDF

## 📋 Maintenance

Ce document doit être maintenu à jour à chaque modification du système de variables. Il sert de référence unique pour tous les développeurs et utilisateurs du système d'export PDF.

🎉 **Vous avez maintenant accès à TOUTES les variables pour créer une étude patrimoniale complète !**
