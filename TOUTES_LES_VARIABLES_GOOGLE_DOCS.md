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
{{spouseBirthCity}}          → Ville de naissance du conjoint
{{spouseCity}}               → Ville de résidence du conjoint
{{spouseCountry}}            → Pays du conjoint
{{spouseNationality}}        → Nationalité du conjoint
{{spouseLegalCapacity}}      → Capacité juridique du conjoint
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

### 🏠 **Patrimoine Immobilier (1 à 10 biens)**
```
{{bienImmobilier1}}          → Dénomination du bien immobilier 1
{{titleImmo1}}               → Valeur du bien 1 (détention "Vous")
{{comImmo1}}                 → Valeur du bien 1 (détention "Commun")
{{spouseTitleImmo1}}         → Valeur du bien 1 (détention "Votre conjoint")

{{bienImmobilier2}}          → Dénomination du bien immobilier 2
{{titleImmo2}}               → Valeur du bien 2 (détention "Vous")
{{comImmo2}}                 → Valeur du bien 2 (détention "Commun")
{{spouseTitleImmo2}}         → Valeur du bien 2 (détention "Votre conjoint")

... (jusqu'à bienImmobilier10, titleImmo10, comImmo10, spouseTitleImmo10)
```

### 💼 **Patrimoine Financier (1 à 10 biens)**
```
{{bienFinancier1}}           → Dénomination du bien financier 1
{{titleFi1}}                 → Valeur du bien 1 (détention "Vous")
{{comFi1}}                   → Valeur du bien 1 (détention "Commun")
{{spouseTitleFi1}}           → Valeur du bien 1 (détention "Votre conjoint")

{{bienFinancier2}}           → Dénomination du bien financier 2
{{titleFi2}}                 → Valeur du bien 2 (détention "Vous")
{{comFi2}}                   → Valeur du bien 2 (détention "Commun")
{{spouseTitleFi2}}           → Valeur du bien 2 (détention "Votre conjoint")

... (jusqu'à bienFinancier10, titleFi10, comFi10, spouseTitleFi10)
```

### 🏢 **Patrimoine Professionnel (1 à 10 biens)**
```
{{bienProfessionnel1}}       → Dénomination du bien professionnel 1
{{titlePro1}}                → Valeur du bien 1 (détention "Vous")
{{comPro1}}                  → Valeur du bien 1 (détention "Commun")
{{spouseTitlePro1}}          → Valeur du bien 1 (détention "Votre conjoint")

{{bienProfessionnel2}}       → Dénomination du bien professionnel 2
{{titlePro2}}                → Valeur du bien 2 (détention "Vous")
{{comPro2}}                  → Valeur du bien 2 (détention "Commun")
{{spouseTitlePro2}}          → Valeur du bien 2 (détention "Votre conjoint")

... (jusqu'à bienProfessionnel10, titlePro10, comPro10, spouseTitlePro10)
```

### 📊 **Totaux et Pourcentages**
```
{{totalImmo}}                → Total patrimoine immobilier
{{totalFi}}                  → Total patrimoine financier
{{totalPro}}                 → Total patrimoine professionnel
{{totalTitle}}               → Total détention client ("Vous")
{{totalCom}}                 → Total détention commune ("Commun")
{{totalSpouseTitle}}         → Total détention conjoint ("Votre conjoint")
{{totalPat}}                 → Total patrimoine global
```

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

```
{{variable}}                → Valeur brute (ex: 150000)
{{eu-variable}}             → Formaté avec euros (ex: 150 000 €)
{{M-variable}}              → Formaté en millions (ex: 0,15 M€)
{{nb-variable}}             → Formaté en nombre (ex: 150 000)
{{pct-variable}}            → Formaté en pourcentage (ex: 15%)
```

### 💳 **Exemples avec Patrimoine**

Pour un bien immobilier de 150 000 € :

```
{{titleImmo1}}              → 150000
{{eu-titleImmo1}}           → 150 000 €
{{M-titleImmo1}}            → 0,15 M€
{{nb-titleImmo1}}           → 150 000
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
