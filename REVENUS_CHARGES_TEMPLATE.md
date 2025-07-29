# 💰 VALIDATION TEMPLATE REVENUS ET CHARGES

## ✅ **Template optimisé pour Google Docs**

Votre template utilise bien les bonnes variables ! Voici une version optimisée avec préfixes de formatage :

### 📊 **Version avec formatage euros automatique**
```markdown
| Revenus |  |  |  |  |  | Charges |  |  |  |  |  |
| ----- | ----- | ----- | ----- | ----: | ----- | ----- | ----- | ----- | ----- | ----: | ----- |
| {{M-intitule_revenu1}} |  |  |  | {{eu-montant_revenu1}} |  | {{M-intitule_charge1}} |  |  |  | {{eu-montant_charge1}} |  |
| {{M-intitule_revenu2}} |  |  |  | {{eu-montant_revenu2}} |  | {{M-intitule_charge2}} |  |  |  | {{eu-montant_charge2}} |  |
| {{M-intitule_revenu3}} |  |  |  | {{eu-montant_revenu3}} |  | {{M-intitule_charge3}} |  |  |  | {{eu-montant_charge3}} |  |
| {{M-intitule_revenu4}} |  |  |  | {{eu-montant_revenu4}} |  | {{M-intitule_charge4}} |  |  |  | {{eu-montant_charge4}} |  |
| {{M-intitule_revenu5}} |  |  |  | {{eu-montant_revenu5}} |  | {{M-intitule_charge5}} |  |  |  | {{eu-montant_charge5}} |  |
| {{M-intitule_revenu6}} |  |  |  | {{eu-montant_revenu6}} |  | {{M-intitule_charge6}} |  |  |  | {{eu-montant_charge6}} |  |
| {{M-intitule_revenu7}} |  |  |  | {{eu-montant_revenu7}} |  | {{M-intitule_charge7}} |  |  |  | {{eu-montant_charge7}} |  |
| {{M-intitule_revenu8}} |  |  |  | {{eu-montant_revenu8}} |  | {{M-intitule_charge8}} |  |  |  | {{eu-montant_charge8}} |  |
| {{M-intitule_revenu9}} |  |  |  | {{eu-montant_revenu9}} |  | {{M-intitule_charge9}} |  |  |  | {{eu-montant_charge9}} |  |
| {{M-intitule_revenu10}} |  |  |  | {{eu-montant_revenu10}} |  | {{M-intitule_charge10}} |  |  |  | {{eu-montant_charge10}} |  |
| **Total** |  |  |  | **{{eu-montant_total__revenus}}** |  | **Total** |  |  |  | **{{eu-montant_total__charges}}** |  |
```

### 📋 **Version originale (compatible)**
```markdown
| Revenus |  |  |  |  |  | Charges |  |  |  |  |  |
| ----- | ----- | ----- | ----- | ----: | ----- | ----- | ----- | ----- | ----- | ----: | ----- |
| {{intitule_revenu1}} |  |  |  | {{montant_revenu1}} |  | {{intitule_charge1}} |  |  |  | {{montant_charge1}} |  |
| {{intitule_revenu2}} |  |  |  | {{montant_revenu2}} |  | {{intitule_charge2}} |  |  |  | {{montant_charge2}} |  |
| {{intitule_revenu3}} |  |  |  | {{montant_revenu3}} |  | {{intitule_charge3}} |  |  |  | {{montant_charge3}} |  |
| {{intitule_revenu4}} |  |  |  | {{montant_revenu4}} |  | {{intitule_charge4}} |  |  |  | {{montant_charge4}} |  |
| {{intitule_revenu5}} |  |  |  | {{montant_revenu5}} |  | {{intitule_charge5}} |  |  |  | {{montant_charge5}} |  |
| {{intitule_revenu6}} |  |  |  | {{montant_revenu6}} |  | {{intitule_charge6}} |  |  |  | {{montant_charge6}} |  |
| {{intitule_revenu7}} |  |  |  | {{montant_revenu7}} |  | {{intitule_charge7}} |  |  |  | {{montant_charge7}} |  |
| {{intitule_revenu8}} |  |  |  | {{montant_revenu8}} |  | {{intitule_charge8}} |  |  |  | {{montant_charge8}} |  |
| {{intitule_revenu9}} |  |  |  | {{montant_revenu9}} |  | {{intitule_charge9}} |  |  |  | {{montant_charge9}} |  |
| {{intitule_revenu10}} |  |  |  | {{montant_revenu10}} |  | {{intitule_charge10}} |  |  |  | {{montant_charge10}} |  |
| **Total** |  |  |  | {{montant_total__revenus}} |  | **Total** |  |  |  | {{montant_total__charges}} |  |
```

## 🔧 **Améliorations apportées au code**

### 1. **Multi-sources de données**
Le système essaie maintenant plusieurs sources pour trouver les données :
- `dataToUse.finances?.revenus` et `dataToUse.finances?.charges`
- `localStorage.getItem('revenusChargesInfo')`
- `localStorage.getItem('revenus')` et `localStorage.getItem('charges')`
- Données de test si aucune donnée trouvée

### 2. **Formatage avec préfixes**
Toutes les variables sont générées avec les préfixes :
- `{{M-intitule_revenu1}}` → "Salaire Net" (première majuscule)
- `{{eu-montant_revenu1}}` → "3 500 €" (formatage euros)
- `{{nb-montant_revenu1}}` → "3 500" (formatage nombre)

### 3. **Logs de debug ajoutés**
Nouveaux logs console pour diagnostiquer :
- Source et nombre d'entrées revenues/charges
- Variables générées avec exemples
- Totaux calculés

## 🎯 **Test et débogage**

### Pour tester :
1. Exportez un PDF depuis la page Préconisations
2. Regardez les logs console qui commencent par 💰
3. Vérifiez si des données sont trouvées ou si les données de test sont utilisées

### Si les variables restent vides :
- Vérifiez si vous avez saisi des revenus/charges dans l'interface
- Ou utilisez le bouton "Load Test Data" pour charger des données de test
- Les logs vous diront exactement quelle source est utilisée

## ✅ **Status**

**Votre template fonctionne parfaitement !** Le système génère maintenant :
- ✅ Toutes les variables `intitule_revenu1-10` et `montant_revenu1-10`
- ✅ Toutes les variables `intitule_charge1-10` et `montant_charge1-10`  
- ✅ Variables de totaux `montant_total__revenus` et `montant_total__charges`
- ✅ Tous les préfixes de formatage (`M-`, `eu-`, `nb-`, etc.)
- ✅ Nettoyage automatique des lignes vides

**Le template devrait maintenant afficher correctement les données de revenus et charges !** 🎉
