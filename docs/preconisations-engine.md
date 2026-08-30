# Moteur de Préconisations - Documentation

## Vue d'ensemble

Ce document décrit l'ensemble des données disponibles dans l'application OMET, ainsi que les règles conditionnelles permettant de déclencher automatiquement les préconisations pertinentes pour chaque client.

---

## 1. Sources de Données Disponibles

### 1.1 Identité & Situation Familiale
**Clé localStorage** : `identityPersonalInfo`

| Champ | Type | Description |
|-------|------|-------------|
| `firstName` | string | Prénom du client |
| `lastName` | string | Nom de famille |
| `birthDate` | string (ISO) | Date de naissance |
| `spouseFirstName` | string | Prénom du conjoint |
| `spouseBirthDate` | string (ISO) | Date de naissance du conjoint |
| `maritalStatus` | enum | `célibataire`, `marié`, `pacsé`, `divorcé`, `veuf` |
| `matrimonialRegime` | enum | `communaute-reduite`, `communaute-biens`, `separation-biens`, `participation-acquets`, `communaute-universelle`, `indivision`, `separation` |
| `lastWillDonation` | enum | `oui`, `non` (Donation au dernier vivant existante) |
| `lastWillDonationType` | string | Type de DDV si existante |
| `children` | array | Liste des enfants |
| `children[].firstName` | string | Prénom de l'enfant |
| `children[].birthDate` | string | Date de naissance |
| `children[].parentage` | enum | `commun`, `propre_parent1`, `propre_parent2` |

**Données calculées** :
- `age` : Âge du client
- `spouseAge` : Âge du conjoint
- `numberOfChildren` : Nombre total d'enfants
- `hasNonCommonChildren` : Boolean - Présence d'enfants non communs
- `isMarried` : Boolean
- `isPacsed` : Boolean

---

### 1.2 Profil Investisseur
**Clé localStorage** : `identityInvestorProfileInfo`

| Champ | Type | Description |
|-------|------|-------------|
| `userProfile.knowledge.label` | enum | `Novice`, `Intermédiaire`, `Expert` |
| `userProfile.risk.label` | enum | `Sécuritaire`, `Prudent`, `Équilibré`, `Dynamique`, `Offensif` |
| `userProfile.capacity.label` | string | Capacité d'épargne |
| `userProfile.esg.label` | string | Préférences ESG |

**Données calculées** :
- `riskScore` : 1-7 (SRI cible)
- `isConservative` : Boolean (risk <= Prudent)
- `isAggressive` : Boolean (risk >= Dynamique)

---

### 1.3 Patrimoine Immobilier
**Clé localStorage** : `patrimoineImmobilierInfo`

| Champ | Type | Description |
|-------|------|-------------|
| `[].id` | string | Identifiant unique |
| `[].type` | enum | `Résidence principale`, `Résidence secondaire`, `Locatif`, `SCPI`, `Terrain` |
| `[].denomination` | string | Nom/Adresse du bien |
| `[].grossValue` | number | Valeur brute (€) |
| `[].attachedDebts` | number | Dettes rattachées (€) |
| `[].netValue` | number | Valeur nette (€) |
| `[].ownedBy` | enum | `Vous`, `Votre conjoint`, `Commun` |

**Données calculées** :
- `totalImmobilierBrut` : Somme des valeurs brutes
- `totalImmobilierNet` : Somme des valeurs nettes
- `totalDettesImmo` : Somme des dettes
- `hasResidencePrincipale` : Boolean
- `hasLocatif` : Boolean
- `nombreBiensLocatifs` : Number
- `partImmobilierPatrimoine` : Pourcentage du patrimoine total

---

### 1.4 Patrimoine Financier
**Clé localStorage** : `patrimoineFinancierInfo`

| Champ | Type | Description |
|-------|------|-------------|
| `[].id` | string | Identifiant unique |
| `[].type` | enum | `Compte courant`, `Livret A`, `LDDS`, `PEL`, `Assurance Vie`, `PEA`, `Compte-titres`, `PER`, `Autre` |
| `[].denomination` | string | Nom du contrat/compte |
| `[].realValue` | number | Valeur réelle (€) |
| `[].ownedBy` | enum | `Vous`, `Votre conjoint`, `Commun` |

**Données calculées** :
- `totalFinancier` : Somme des valeurs
- `totalAssuranceVie` : Somme des AV
- `totalPEA` : Somme des PEA
- `totalPER` : Somme des PER
- `totalLiquidites` : CC + Livrets
- `hasAssuranceVie` : Boolean
- `hasPEA` : Boolean
- `hasPER` : Boolean
- `partFinancierPatrimoine` : Pourcentage

---

### 1.5 Patrimoine Professionnel
**Clé localStorage** : `patrimoineProfessionnelInfo`

| Champ | Type | Description |
|-------|------|-------------|
| `[].id` | string | Identifiant unique |
| `[].companyName` | string | Nom de la société |
| `[].activity` | string | Secteur d'activité |
| `[].valuation` | number | Valorisation des titres (€) |
| `[].willToTransfer` | enum | `Oui`, `Non`, `À étudier` |
| `[].holders` | array | Liste des détenteurs |
| `[].holders[].owner` | string | Nom du détenteur |
| `[].holders[].jobTitle` | string | Fonction |
| `[].holders[].percentage` | number | % de détention |

**Données calculées** :
- `totalProfessionnel` : Somme des valorisations
- `hasEntreprise` : Boolean
- `nombreEntreprises` : Number
- `entreprisesATransmettre` : Array (willToTransfer === 'Oui')
- `isGerantMajoritaire` : Boolean (détention > 50% + fonction Gérant)
- `partProfessionnelPatrimoine` : Pourcentage

---

### 1.6 Synthèse Patrimoniale (Calculée)

| Variable | Formule |
|----------|---------|
| `patrimoineTotal` | `totalImmobilierNet + totalFinancier + totalProfessionnel` |
| `patrimoineCommun` | Somme des biens `ownedBy === 'Commun'` |
| `patrimoineVous` | Somme des biens `ownedBy === 'Vous'` |
| `patrimoineConjoint` | Somme des biens `ownedBy === 'Votre conjoint'` |
| `tauxEndettement` | `totalDettes / patrimoineTotal * 100` |

---

## 2. Règles de Préconisations

### 2.1 Structure d'une Règle

```typescript
interface PreconisationRule {
  id: string;
  title: string;
  category: 'civil' | 'fiscal' | 'financier';
  urgency: 'faible' | 'moyenne' | 'haute' | 'critique';
  condition: (data: ClientData) => boolean;
  impact: string;
  definition: string;
  advantages: string[];
  disadvantages: string[];
}
```

---

### 2.2 Catalogue des Préconisations

#### CIVIL-001 : Donation au Dernier Vivant (DDV)

**Conditions d'activation** :
```
isMarried === true
AND lastWillDonation !== 'oui'
AND (hasChildren === true OR patrimoine > 100000)
```

**Urgence** : `haute` si `hasNonCommonChildren`, sinon `moyenne`

---

#### CIVIL-002 : Modification du Régime Matrimonial

**Conditions d'activation** :
```
isMarried === true
AND (
  (matrimonialRegime === 'separation-biens' AND patrimoine > 500000)
  OR (age >= 60 AND numberOfChildren === 0)
  OR (hasNonCommonChildren === true AND lastWillDonation !== 'oui')
)
```

**Urgence** : `moyenne`

---

#### CIVIL-003 : Testament / Legs Particuliers

**Conditions d'activation** :
```
(maritalStatus === 'célibataire' OR maritalStatus === 'veuf')
OR (hasNonCommonChildren === true)
OR (numberOfChildren === 0 AND patrimoine > 200000)
```

**Urgence** : `haute` si pas d'héritiers réservataires

---

#### FISCAL-001 : Pacte Dutreil

**Conditions d'activation** :
```
hasEntreprise === true
AND entreprisesATransmettre.length > 0
AND totalProfessionnel > 100000
```

**Urgence** : `critique` si `age >= 65`, sinon `haute`

---

#### FISCAL-002 : Démembrement de Propriété

**Conditions d'activation** :
```
(hasLocatif === true AND totalImmobilierNet > 300000)
OR (hasEntreprise === true AND age >= 55)
```

**Urgence** : `moyenne`

---

#### FISCAL-003 : Donation avec Réserve d'Usufruit

**Conditions d'activation** :
```
hasChildren === true
AND patrimoine > 200000
AND age >= 50
```

**Urgence** : `haute` si `age >= 65`

---

#### FISCAL-004 : Création SCI Familiale

**Conditions d'activation** :
```
nombreBiensLocatifs >= 2
OR (hasLocatif === true AND hasChildren === true AND totalImmobilierNet > 500000)
```

**Urgence** : `moyenne`

---

#### FINANCIER-001 : Optimisation Clause Bénéficiaire AV

**Conditions d'activation** :
```
hasAssuranceVie === true
AND totalAssuranceVie > 50000
AND hasChildren === true
```

**Urgence** : `critique` (souvent mal rédigée)

---

#### FINANCIER-002 : Ouverture PER

**Conditions d'activation** :
```
hasPER === false
AND age < 60
AND (TMI >= 30% OR revenus > 50000)
```

**Urgence** : `moyenne`

---

#### FINANCIER-003 : Rééquilibrage Allocation

**Conditions d'activation** :
```
(partImmobilierPatrimoine > 70%)
OR (totalLiquidites / patrimoineTotal > 30%)
OR (SRI_moyen_portefeuille !== riskScore)
```

**Urgence** : `faible` à `moyenne` selon écart

---

#### FINANCIER-004 : Diversification Internationale

**Conditions d'activation** :
```
totalFinancier > 200000
AND partActionsInternationales < 20%
```

**Urgence** : `faible`

---

## 3. Implémentation

Le fichier `lib/preconisations/rules.ts` contient l'implémentation TypeScript de ces règles.

Le fichier `lib/preconisations/engine.ts` contient le moteur d'évaluation qui :
1. Charge toutes les données client depuis localStorage
2. Calcule les variables dérivées
3. Évalue chaque règle
4. Retourne les préconisations applicables triées par urgence

---

## 4. Extension

Pour ajouter une nouvelle préconisation :
1. Définir la règle dans ce document
2. Implémenter dans `rules.ts`
3. Ajouter le contenu pédagogique (définition, avantages, inconvénients)
4. Tester avec différents profils clients

---

## 5. Intégration PDF

Les préconisations activées sont passées au générateur PDF qui utilise un template externe (voir section PDF Viewer).
