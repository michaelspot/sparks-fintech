# 🧪 GUIDE DE TEST - EXPORT PDF NOUVELLE VERSION

## ✅ **Système Migré avec Succès !**

Le système d'export PDF a été complètement migré de Google Apps Script vers Next.js. Voici comment tester le nouveau système :

## 🚀 **Test de l'Export PDF**

### **1. Accéder à la page Préconisations**
- URL : `http://localhost:3001/preconisations`
- Vous devriez voir le bouton "Export PDF" en haut à droite

### **2. Tester l'export PDF**
1. Cliquez sur "Export PDF"
2. Regardez les logs dans la console (F12)
3. Le PDF devrait se télécharger automatiquement

### **3. Logs à observer dans la Console**

**Frontend (Console navigateur) :**
```javascript
🚀 Envoi vers API Next.js pour génération PDF...
⚡ Optimisation: 245 → 187 variables
💰 Variables revenus et charges générées: XX variables
🏠 Variables patrimoine immobilier: XX variables
✅ PDF généré avec succès via API Next.js!
```

**Backend (Terminal Next.js) :**
```javascript
🚀 Début de l'export PDF
📊 Variables reçues: 187
📄 Création d'une copie du document template...
✅ Copie créée avec l'ID: XXXXX
🔄 Remplacement des variables...
✅ Variables remplacées
🧩 Nettoyage des tableaux...
✅ 12 lignes vides supprimées de 4 tableaux
📄 Export en PDF...
✅ PDF généré en 3.2s
```

## 🔍 **Vérifications à Effectuer**

### **A. Test avec données de test**
1. Cliquez sur "Load Test Data" si disponible
2. Exportez le PDF
3. Vérifiez que les tableaux sont propres (pas de lignes vides)

### **B. Test avec données réelles**
1. Remplissez quelques informations dans les sections :
   - Identité (si accessible)
   - Patrimoine (si accessible) 
   - Budget/Revenus-Charges (si accessible)
2. Exportez le PDF
3. Vérifiez le contenu du PDF

### **C. Vérification du nettoyage**
Le nouveau système devrait automatiquement :
- ✅ Supprimer les lignes vides des tableaux revenus/charges
- ✅ Supprimer les lignes vides des tableaux patrimoine
- ✅ Préserver les en-têtes (Total, Revenus, Charges, etc.)
- ✅ Formater correctement les variables (euros, pourcentages)

## 🚨 **Problèmes Potentiels et Solutions**

### **1. Erreur 404**
Si vous voyez une erreur 404 dans les logs :
- Vérifiez que le serveur Next.js tourne bien
- L'API `/api/export-pdf` devrait être accessible

### **2. Erreur d'authentification Google**
```javascript
❌ Tokens OAuth non trouvés. Lancez d'abord l'authentification.
```
**Solution :** Allez sur `http://localhost:3001/admin/oauth` pour réauthentifier

### **3. Template Google Docs non accessible**
```javascript
❌ Erreur dans l'export PDF: Request failed with status code 404
```
**Solution :** Vérifiez que le template ID dans `/app/api/export-pdf/route.ts` est correct

### **4. Variables non remplacées**
Si des variables `{{...}}` apparaissent dans le PDF :
- Vérifiez les logs pour voir quelles variables sont vides
- Ajoutez des données de test ou réelles dans l'interface

## 📊 **Template ID Actuel**
Le template utilisé est : `1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado`

Assurez-vous que :
- Ce document existe dans Google Drive
- Il est partagé avec le compte OAuth configuré
- Il contient les variables attendues

## 🎯 **Résultat Attendu**

**Avant (avec lignes vides) :**
```
| Salaire net | 3500 € | Crédit immobilier | 1200 € |
| Primes      | 800 €  | Assurances        | 300 €  |
| {{intitule_revenu3}} | {{montant_revenu3}} | {{intitule_charge3}} | {{montant_charge3}} |
| {{intitule_revenu4}} | {{montant_revenu4}} | {{intitule_charge4}} | {{montant_charge4}} |
```

**Après (système nettoyé) :**
```
| Salaire net | 3500 € | Crédit immobilier | 1200 € |
| Primes      | 800 €  | Assurances        | 300 €  |
| Total       | 4300 € | Total             | 1500 € |
```

## 🚀 **Commandes de Debug**

Si vous avez des problèmes, vérifiez :

```bash
# Vérifier que les tokens OAuth existent
ls -la google-*

# Vérifier les logs du serveur Next.js
# (dans le terminal où tourne npm run dev)

# Redémarrer le serveur si nécessaire
npm run dev
```

**Le nouveau système est maintenant prêt ! Testez-le et vérifiez que les tableaux sont automatiquement nettoyés ! 🎉**
