# Guide d'Export PDF - Configuration et Test

## 🚀 Configuration rapide

### 1. Créer le Google Apps Script
1. Allez sur [script.google.com](https://script.google.com)
2. Nouveau projet → Copiez le code de `google-apps-script.js`
3. Remplacez `VOTRE_TEMPLATE_DOC_ID_ICI` par l'ID de votre Google Docs
4. Déployez comme "Application Web" accessible à tous
5. Copiez l'URL de déploiement

### 2. Créer le template Google Docs
1. Nouveau Google Docs
2. Ajoutez du contenu avec des variables :
   ```
   Bonjour {{firstName}} {{lastName}},
   
   Votre profession : {{profession}}
   Date : {{dateGeneration}}
   
   Vos préconisations :
   {{preconisations_client}}
   ```
3. Récupérez l'ID du document depuis l'URL

### 3. Mettre à jour le code Next.js
1. Dans `/app/preconisations/page.tsx` ligne ~325
2. Remplacez `APPS_SCRIPT_URL` par votre nouvelle URL

## ✅ Test rapide

### Données de test dans localStorage
```javascript
// Dans la console du navigateur :
localStorage.setItem('identityPersonalInfo', JSON.stringify({
  "firstName": "Jacques",
  "lastName": "Dupont", 
  "profession": "Ingénieur",
  "city": "Paris"
}));
```

### Variables disponibles actuellement
- `{{firstName}}` - Prénom
- `{{lastName}}` - Nom de famille
- `{{profession}}` - Profession
- `{{dateGeneration}}` - Date du jour
- `{{preconisations_client}}` - Toutes les préconisations formatées
- `{{nbPreconisations}}` - Nombre de préconisations

## 🔧 Ajouter de nouvelles variables

### Dans le code Next.js (ligne ~162)
```typescript
const variables: Record<string, string> = {
  // Existant...
  'firstName': clientInfo.firstName || "",
  
  // ✨ Ajoutez votre nouvelle variable ici :
  'nouvelleVariable': clientInfo.nouvelleVariable || "valeur par défaut",
};
```

### Dans Google Docs
```
Utilisez simplement : {{nouvelleVariable}}
```

## 🐛 Résolution de problèmes

### ❌ Erreur "getSize is not a function"
**Solution :** Utilisez le script corrigé `google-apps-script-final.js`
1. Copiez le contenu de `google-apps-script-final.js`
2. Remplacez tout le code dans votre Google Apps Script
3. Changez l'ID du template (ligne 15)
4. Redéployez le script

### Le PDF ne se génère pas
1. Vérifiez l'URL Google Apps Script dans la console
2. Vérifiez l'ID du template Google Docs
3. Vérifiez les permissions du script (accessible à tous)

### Les variables ne sont pas remplacées
1. Vérifiez que les variables dans Google Docs sont exactement `{{variable}}` (pas d'espaces)
2. Utilisez des caractères ASCII simples uniquement
3. Vérifiez la console pour voir les variables envoyées

### Erreur de permissions
1. Le script doit être déployé avec "Exécuter en tant que : Moi"
2. Accès : "Tout le monde"
3. Redéployez si nécessaire

## 📝 Variables complexes supportées

- **Client** : firstName, lastName, title, profession, age, etc.
- **Conjoint** : spouseFirstName, spouseLastName, spouseProfession, etc.
- **Préconisations** : preconisations_client (texte complet formaté)
- **Méta** : dateGeneration, nbPreconisations, nbChildren

Voir `VARIABLES_GOOGLE_DOCS.md` pour la liste complète.
