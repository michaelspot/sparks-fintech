# Configuration de l'Export PDF via Google Apps Script

## Vue d'ensemble

Votre système d'export PDF fonctionne en utilisant :
1. **Données localStorage** (clé: `identityPersonalInfo`)
2. **Google Apps Script** pour traiter les données
3. **Google Docs** comme modèle avec des variables
4. **Export automatique en PDF**

## Étapes de configuration

### 1. Créer et déployer votre Google Apps Script

1. Allez sur [script.google.com](https://script.google.com)
2. Créez un nouveau projet
3. Remplacez le code par le contenu de votre fichier `google-apps-script.js`
4. **Déployez** le script :
   - Cliquez sur "Déployer" > "Nouveau déploiement"
   - Type : "Application web"
   - Exécuter en tant que : "Moi"
   - Qui peut accéder : "Tout le monde"
   - Copiez l'**ID de déploiement** (pas l'URL complète)

### 2. Configurer l'ID du script

Modifiez le fichier `/lib/config.ts` :

```typescript
export const GOOGLE_APPS_SCRIPT_CONFIG = {
  SCRIPT_ID: 'VOTRE_VRAI_ID_ICI', // Remplacez par l'ID copié à l'étape 1
  TEMPLATE_DOCUMENT_ID: '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado'
};
```

### 3. Préparer votre modèle Google Docs

Dans votre document Google Docs (ID: `1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado`), vous pouvez utiliser ces variables :

#### Variables disponibles :
- `{{firstName}}` - Prénom du client
- `{{lastName}}` - Nom du client  
- `{{title}}` - Titre (Mr/Mme)
- `{{spouseFirstName}}` - Prénom du conjoint
- `{{spouseLastName}}` - Nom du conjoint
- `{{spouseTitle}}` - Titre du conjoint
- `{{city}}` - Ville
- `{{country}}` - Pays (défaut: France)
- `{{nationality}}` - Nationalité (défaut: Française)
- `{{maritalStatus}}` - Situation matrimoniale
- `{{profession}}` - Profession du client
- `{{spouseProfession}}` - Profession du conjoint
- `{{age}}` - Âge du client
- `{{spouseAge}}` - Âge du conjoint
- `{{company}}` - Entreprise du client
- `{{spouseCompany}}` - Entreprise du conjoint
- `{{dateGeneration}}` - Date de génération du document
- `{{nbPreconisations}}` - Nombre de préconisations sélectionnées

#### Exemple d'utilisation dans le Google Docs :
```
Étude patrimoniale pour {{title}} {{firstName}} {{lastName}}

Informations client :
- Nom complet : {{title}} {{firstName}} {{lastName}}
- Profession : {{profession}}
- Ville : {{city}}, {{country}}
- Nationalité : {{nationality}}

{{#if maritalStatus}}
Situation familiale : {{maritalStatus}}
{{#if spouseFirstName}}
Conjoint : {{spouseTitle}} {{spouseFirstName}} {{spouseLastName}}
Profession conjoint : {{spouseProfession}}
{{/if}}
{{/if}}

Date de génération : {{dateGeneration}}
Nombre de préconisations : {{nbPreconisations}}
```

### 4. Ajouter de nouvelles variables

Pour ajouter une nouvelle variable (par exemple `{{email}}`) :

1. **Dans votre modèle Google Docs** : Ajoutez `{{email}}` où vous voulez
2. **Dans `/lib/pdf-export.ts`** : Ajoutez dans l'objet `variables` :
   ```typescript
   const variables = {
     // ... variables existantes
     email: parsedIdentityData.email || '',
   };
   ```
3. **Dans `/lib/config.ts`** : Ajoutez dans `SUPPORTED_VARIABLES` :
   ```typescript
   export const SUPPORTED_VARIABLES = [
     // ... variables existantes
     'email',
   ] as const;
   ```

### 5. Structure des données localStorage

Le système utilise la clé `identityPersonalInfo` avec cette structure :

```json
{
  "title": "",
  "firstName": "Jean",
  "lastName": "Charlte",
  "birthName": "",
  "spouseTitle": "",
  "spouseFirstName": "",
  "spouseLastName": "",
  "spouseBirthName": "", 
  "birthDate": "",
  "spouseBirthDate": "",
  "age": "",
  "spouseAge": "",
  "city": "",
  "country": "France",
  "nationality": "Française",
  "maritalStatus": "",
  "profession": "",
  "spouseProfession": "",
  "company": "",
  "spouseCompany": ""
}
```

## Comment ça marche

1. **Clic sur "Export PDF"** déclenche la fonction `exportToPDF()`
2. **Récupération des données** depuis `localStorage.getItem('identityPersonalInfo')`
3. **Envoi vers Google Apps Script** avec les variables formatées
4. **Google Apps Script** :
   - Fait une copie du modèle Google Docs
   - Remplace toutes les variables `{{variable}}` par les vraies valeurs
   - Exporte en PDF dans Google Drive
5. **Notification** à l'utilisateur que le PDF est prêt

## Test et débogage

- Vérifiez la console pour les logs d'export
- Assurez-vous que `identityPersonalInfo` existe dans localStorage
- Confirmez que votre Google Apps Script est déployé et accessible
- Testez d'abord avec des variables simples comme `{{firstName}}` et `{{lastName}}`

## Avantages de cette approche

✅ **Simple** : Ajout facile de nouvelles variables  
✅ **Flexible** : Modifiez le modèle Google Docs sans changer le code  
✅ **Sécurisé** : Traitement côté Google, pas d'API keys exposées  
✅ **Automatique** : Export direct vers Google Drive  
✅ **Maintenance** : Variables centralisées dans `config.ts`
