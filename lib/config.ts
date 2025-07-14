// Configuration pour l'export PDF via Google Apps Script
export const GOOGLE_APPS_SCRIPT_CONFIG = {
  // ID de votre Google Apps Script FINAL - remplacez par l'ID du script google-apps-script-final.js
  SCRIPT_ID: 'AKfycbztzaYKReSnMMi_vdJiuOn9-f4IFN8EtsO6q09rzSesgrwxO0JSByMSTfvQJRIImQBrKw', // Remplacez par l'ID de votre script FINAL déployé
  
  // URL complète - sera construite avec l'ID ci-dessus
  get URL() {
    return `https://script.google.com/macros/s/${this.SCRIPT_ID}/exec`;
  },
  
  // ID du document Google Docs modèle
  TEMPLATE_DOCUMENT_ID: '1SEQaYl8jiynfTxdS6lp7nmHZSkdgw8DQqT99Bva-ado'
};

// Variables supportées dans le modèle Google Docs
export const SUPPORTED_VARIABLES = [
  'firstName',
  'lastName', 
  'title',
  'spouseFirstName',
  'spouseLastName',
  'spouseTitle',
  'city',
  'country',
  'nationality',
  'maritalStatus',
  'profession',
  'spouseProfession',
  'age',
  'spouseAge',
  'company',
  'spouseCompany',
  'dateGeneration'
] as const;

export type SupportedVariable = typeof SUPPORTED_VARIABLES[number];
