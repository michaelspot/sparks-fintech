import { Condition, Preconisation } from './preconisations';

// Type pour les données du client
export interface ClientData {
  [key: string]: any;
}

/**
 * Évalue une condition par rapport aux données du client
 */
export function evaluateCondition(condition: Condition, clientData: ClientData): boolean {
  // Récupérer la valeur du champ dans les données du client
  const dataPath = `${condition.type}.${condition.field}`;
  const pathParts = dataPath.split('.');
  
  // Parcourir l'objet clientData pour trouver la valeur
  let value = clientData;
  for (const part of pathParts) {
    if (value === undefined || value === null) return false;
    value = value[part];
  }
  
  // Si la valeur n'existe pas dans les données client, la condition n'est pas remplie
  if (value === undefined || value === null) return false;

  // Évaluer la condition selon l'opérateur
  switch (condition.operator) {
    case 'eq':
      return value === condition.value;
    case 'neq':
      return value !== condition.value;
    case 'gt':
      return value > condition.value;
    case 'lt':
      return value < condition.value;
    case 'gte':
      return value >= condition.value;
    case 'lte':
      return value <= condition.value;
    case 'contains':
      return Array.isArray(value) ? value.includes(condition.value) : String(value).includes(String(condition.value));
    case 'notContains':
      return Array.isArray(value) ? !value.includes(condition.value) : !String(value).includes(String(condition.value));
    default:
      return false;
  }
}

/**
 * Évalue toutes les conditions d'une préconisation
 */
export function evaluatePreconisation(preconisation: Preconisation, clientData: ClientData): boolean {
  // Une préconisation est applicable si toutes ses conditions sont remplies
  return preconisation.conditions.every(condition => evaluateCondition(condition, clientData));
}

/**
 * Filtre les préconisations applicables au client
 */
export function filterApplicablePreconisations(preconisations: Preconisation[], clientData: ClientData): Preconisation[] {
  return preconisations.filter(preconisation => evaluatePreconisation(preconisation, clientData));
}
