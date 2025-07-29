# 🧪 TEST DES VARIABLES DE PATRIMOINE - EXPORT GOOGLE DOCS

## ✅ Améliorations apportées

### 1. **Support des deux formats de pourcentage** :
- `{{pct-totalImmo}}` → Format avec espace : "15 %"
- `{{%-totalImmo}}` → Format sans espace : "15%" (nouveau format pour correspondre au tableau)

### 2. **Variables générées automatiquement** :

#### **BIENS IMMOBILIERS** (1-10) :
- `{{bienImmobilier1}}` à `{{bienImmobilier10}}` → Dénomination des biens
- `{{eu-titleImmo1}}` à `{{eu-titleImmo10}}` → Valeurs si détention = "Vous"
- `{{eu-comImmo1}}` à `{{eu-comImmo10}}` → Valeurs si détention = "Commun"  
- `{{eu-spouseTitleImmo1}}` à `{{eu-spouseTitleImmo10}}` → Valeurs si détention = "Votre conjoint"

#### **BIENS PROFESSIONNELS** (1-10) :
- `{{bienProfessionnel1}}` à `{{bienProfessionnel10}}` → Dénomination des biens
- `{{eu-titlePro1}}` à `{{eu-titlePro10}}` → Valeurs si détention = "Vous"
- `{{eu-comPro1}}` à `{{eu-comPro10}}` → Valeurs si détention = "Commun"
- `{{eu-spouseTitlePro1}}` à `{{eu-spouseTitlePro10}}` → Valeurs si détention = "Votre conjoint"

#### **PATRIMOINE FINANCIER** (1-10) :
- `{{bienFinancier1}}` à `{{bienFinancier10}}` → Dénomination des biens
- `{{eu-titleFi1}}` à `{{eu-titleFi10}}` → Valeurs si détention = "Vous"
- `{{eu-comFi1}}` à `{{eu-comFi10}}` → Valeurs si détention = "Commun"
- `{{eu-spouseTitleFi1}}` à `{{eu-spouseTitleFi10}}` → Valeurs si détention = "Votre conjoint"

#### **VARIABLES DE TOTAUX** :
- `{{eu-totalImmo}}`, `{{eu-totalFi}}`, `{{eu-totalPro}}` → Totaux par catégorie
- `{{pct-totalImmo}}`, `{{pct-totalFi}}`, `{{pct-totalPro}}` → Pourcentages avec espace
- `{{%-totalImmo}}`, `{{%-totalFi}}`, `{{%-totalPro}}` → Pourcentages sans espace (NOUVEAU)
- `{{eu-totalTitle}}`, `{{eu-totalCom}}`, `{{eu-totalSpouseTitle}}` → Totaux par détention
- `{{eu-totalPat}}` → Total patrimoine global

### 3. **Système de nettoyage automatique** :

#### **Lignes vides supprimées** :
- ✅ Lignes où TOUTES les colonnes sont vides
- ✅ Variables non remplacées `{{variable}}` supprimées

#### **Lignes préservées** :
- ✅ En-têtes de tableaux
- ✅ Lignes avec au moins une colonne remplie

### 4. **Correspondance parfaite avec votre tableau** :

Votre tableau utilise exactement ces variables (maintenant toutes générées) :
```
{{title}} / {{spouseTitle}} → Noms des colonnes
{{eu-totalImmo}} / {{pct-totalImmo}} → Totaux immobilier
{{eu-titleImmo1}} / {{eu-comImmo1}} / {{eu-spouseTitleImmo1}} → Répartition bien 1
{{eu-totalTitle}} / {{eu-totalCom}} / {{eu-totalSpouseTitle}} → Totaux par détention
{{eu-totalPat}} → Total patrimoine
```

## 🚀 Fonctionnement

1. **Données récupérées** depuis localStorage :
   - `patrimoineImmobilierInfo` → Biens immobiliers
   - `patrimoineFinancierInfo` → Biens financiers  
   - `patrimoineProfessionnelInfo` → Biens professionnels

2. **Répartition automatique** selon `ownedBy`/`ownership` :
   - "Vous" → Variables `titleXxx` remplies, autres vides
   - "Votre conjoint" → Variables `spouseTitleXxx` remplies, autres vides
   - "Commun" → Variables `comXxx` remplies, autres vides

3. **Export vers Google Docs** :
   - Remplacement de toutes les variables `{{variable}}`
   - Nettoyage automatique des lignes vides
   - Suppression des variables non remplacées
   - Export PDF final propre et professionnel

## ✅ RÉSULTAT ATTENDU

Le tableau de votre document Google Docs va maintenant :
- ✅ Afficher tous les biens du client avec leurs valeurs
- ✅ Répartir correctement selon la détention saisie
- ✅ Calculer automatiquement tous les totaux et pourcentages
- ✅ Supprimer toutes les lignes vides
- ✅ Retirer toutes les variables non remplacées `{{}}`

**Le système est maintenant parfaitement aligné avec votre tableau ! 🎉**
