import { useState, useEffect } from 'react';
import { ClientData } from './condition-evaluator';

/**
 * Hook pour récupérer les données client depuis le localStorage
 * et les formater pour les évaluations de conditions
 */
export function useClientData(): { clientData: ClientData; isLoading: boolean } {
  const [clientData, setClientData] = useState<ClientData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cette fonction s'exécute seulement côté client
    const loadClientData = () => {
      try {
        // Récupération des différentes sources de données
        const clientInfoStr = localStorage.getItem('clientInfo');
        const patrimoineStr = localStorage.getItem('patrimoine');
        const simulationsStr = localStorage.getItem('simulations');
        const revenusStr = localStorage.getItem('revenus');
        const chargesStr = localStorage.getItem('charges');
        const familleStr = localStorage.getItem('famille');
        
        // Parser les données
        const clientInfo = clientInfoStr ? JSON.parse(clientInfoStr) : {};
        const patrimoine = patrimoineStr ? JSON.parse(patrimoineStr) : {};
        const simulations = simulationsStr ? JSON.parse(simulationsStr) : {};
        const revenus = revenusStr ? JSON.parse(revenusStr) : {};
        const charges = chargesStr ? JSON.parse(chargesStr) : {};
        const famille = familleStr ? JSON.parse(familleStr) : {};
        
        // Calculer des données dérivées utiles pour les conditions
        const calculatedData = calculateDerivedData({
          clientInfo, patrimoine, simulations, revenus, charges, famille
        });
        
        // Organiser les données selon les types attendus par l'évaluateur de conditions
        const formattedData: ClientData = {
          profile: {
            age: clientInfo.age,
            situationFamiliale: clientInfo.situationMatrimoniale,
            regimeMatrimonial: clientInfo.regimeMatrimonial,
            profession: clientInfo.profession
          },
          
          fiscal: {
            trancheMarginaleImposition: revenus.tmi || 0,
            revenusFonciers: revenus.foncier || 0,
            revenusCapitauxMobiliers: revenus.financier || 0,
            revenuGlobal: revenus.total || 0,
            isf: patrimoine.isf || false,
            montantIFI: patrimoine.montantIFI || 0
          },
          
          patrimoine: {
            valeurResidencePrincipale: patrimoine.residencePrincipale || 0,
            valeurPatrimoineFinancier: patrimoine.patrimoineFinancier || 0,
            valeurPatrimoineImmobilier: patrimoine.patrimoineImmobilier || 0,
            concentrationActifs: calculatedData.concentrationActifs,
            liquiditesDisponibles: patrimoine.liquidites || 0,
            montantEmprunts: patrimoine.emprunts || 0,
            detentionAssuranceVie: patrimoine.assuranceVie || false,
            montantAssuranceVie: patrimoine.montantAssuranceVie || 0
          },
          
          famille: {
            enfantsACharge: famille.enfantsACharge || 0,
            enfantsMajeurs: famille.enfantsMajeurs || 0,
            petitsEnfants: famille.petitsEnfants || 0,
            ageConjoint: famille.ageConjoint
          },
          
          protection: {
            assuranceDecesExistante: clientInfo.assuranceDecesExistante || false,
            montantAssuranceDeces: clientInfo.montantAssuranceDeces || 0
          },
          
          simulations: {
            ...simulations,
            // Ajout des données de simulation spécifiques
            cessionImmobiliere: simulations.cessionImmobiliere || {}
          },
          
          objectifs: {
            preoccupationTransmission: clientInfo.objectifs?.includes('transmission') || false,
            preoccupationOptimisationFiscale: clientInfo.objectifs?.includes('optimisationFiscale') || false,
            preoccupationRetraite: clientInfo.objectifs?.includes('retraite') || false,
            preoccupationDefiscalisation: clientInfo.objectifs?.includes('defiscalisation') || false
          }
        };
        
        setClientData(formattedData);
      } catch (error) {
        console.error("Erreur lors du chargement des données client:", error);
        // Initialiser avec des données par défaut en cas d'erreur
        setClientData({});
      } finally {
        setIsLoading(false);
      }
    };

    // Exécuter seulement côté client
    if (typeof window !== 'undefined') {
      loadClientData();
      
      // Optionnel: mettre à jour si le localStorage change
      const handleStorageChange = () => loadClientData();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  return { clientData, isLoading };
}

/**
 * Calcule des données dérivées utiles pour les conditions
 */
function calculateDerivedData(data: any) {
  const { patrimoine, revenus } = data;
  
  // Calcul de la concentration d'actifs (exemple: pourcentage du patrimoine total dans l'immobilier)
  const patrimoineTotal = 
    (patrimoine.residencePrincipale || 0) + 
    (patrimoine.patrimoineImmobilier || 0) + 
    (patrimoine.patrimoineFinancier || 0);
  
  const patrimoineImmobilierTotal = 
    (patrimoine.residencePrincipale || 0) + 
    (patrimoine.patrimoineImmobilier || 0);
  
  const concentrationActifs = patrimoineTotal > 0 
    ? Math.round((patrimoineImmobilierTotal / patrimoineTotal) * 100) 
    : 0;
  
  // Autres calculs dérivés selon vos besoins...
  
  return {
    concentrationActifs,
    // Ajoutez d'autres propriétés calculées si besoin
  };
}
