"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

// ===== INTERFACES =====
interface RevenuItem {
  id: string;
  type: string;
  denomination: string;
  montant: number;
  regime: string;
  fraisReels?: number;
  source?: "budget" | "manual";
}

interface BudgetIncome {
  id: string;
  type: string;
  denomination: string;
  amount: number;
  ownedBy: "Vous" | "Votre conjoint" | "Commun";
  fiscalRegime?: string;
  deductibleExpenses?: number;
}

interface TaxCalculationResult {
  revenuBrutGlobal: number;
  revenuNetGlobal: number;
  impotBrutFinal: number;
  decote: number;
  impotNet: number;
  cehr: number;
  impotTotal: number;
  tmi: number;
  tauxMoyen: number;
  plafonnementFamilial: boolean;
  montantDepassement: number;
}

// ===== CONSTANTES =====
const typeOptions = [
  { value: "Salaires", label: "Salaires et traitements" },
  { value: "Pensions et retraites", label: "Pensions et retraites" },
  { value: "Revenus fonciers", label: "Revenus fonciers" },
  { value: "Revenus mobiliers", label: "Revenus mobiliers" },
  { value: "Revenus non commerciaux", label: "BNC (Non Commerciaux)" },
  {
    value: "Revenus industriels et commerciaux",
    label: "BIC (Industriels et Commerciaux)",
  },
  {
    value: "Revenus des locations meublées professionnels",
    label: "Locations meublées professionnels",
  },
  {
    value: "Revenus des locations meublées non professionnels",
    label: "Locations meublées non professionnels",
  },
  { value: "Revenus agricoles", label: "Revenus Agricoles" },
  { value: "Pensions alimentaires", label: "Pensions alimentaires" },
  { value: "Rentes viagères", label: "Rentes viagères" },
  { value: "Allocations familiales", label: "Allocations familiales" },
];

const regimeOptions: Record<string, { value: string; label: string }[]> = {
  Salaires: [
    {
      value: "Aucun régime",
      label: "Aucun régime (déduction automatique de 10%)",
    },
    {
      value: "Déduction des frais professionnels",
      label: "Déduction des frais professionnels",
    },
  ],
  "Pensions et retraites": [
    {
      value: "Aucun régime",
      label: "Aucun régime (déduction automatique de 10%)",
    },
  ],
  "Revenus fonciers": [
    { value: "Micro-foncier", label: "Micro-foncier (abattement de 30%)" },
    { value: "Régime réel", label: "Régime réel (déduction des charges)" },
  ],
  "Revenus mobiliers": [
    { value: "Barème progressif", label: "Barème progressif" },
    { value: "PFU", label: "Prélèvement forfaitaire unique (PFU)" },
  ],
  "Revenus non commerciaux": [
    { value: "Micro-BNC", label: "Micro-BNC (abattement de 34%)" },
    { value: "Déclaration contrôlée", label: "Déclaration contrôlée" },
  ],
  "Revenus industriels et commerciaux": [
    {
      value: "Micro-BIC Activités d'achat / revente",
      label: "Micro-BIC Achat/revente (abattement de 71%)",
    },
    {
      value: "Micro-BIC Activités de service",
      label: "Micro-BIC Services (abattement de 50%)",
    },
    {
      value: "Micro-BIC Activités de meublés de tourisme non classés",
      label: "Micro-BIC Meublés tourisme (abattement de 30%)",
    },
    { value: "Régime réel", label: "Régime réel" },
  ],
  "Revenus des locations meublées professionnels": [
    {
      value: "Micro-BIC Activités de service",
      label: "Micro-BIC Services (abattement de 50%)",
    },
    { value: "Régime réel", label: "Régime réel" },
  ],
  "Revenus des locations meublées non professionnels": [
    {
      value: "Micro-BIC Activités de service",
      label: "Micro-BIC Services (abattement de 50%)",
    },
    { value: "Régime réel", label: "Régime réel" },
  ],
  "Revenus agricoles": [
    {
      value: "Micro-bénéfices agricole",
      label: "Micro-bénéfices agricoles (abattement de 87%)",
    },
    { value: "Régime réel", label: "Régime réel" },
  ],
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
];

const LOCAL_STORAGE_KEY_IR = "fiscaliteIRInfo";
const LOCAL_STORAGE_KEY_BUDGET_REVENUS = "budgetRevenusInfo";
const LOCAL_STORAGE_KEY_IDENTITY_PERSONAL = "identityPersonalInfo";

// ===== FONCTIONS DE CALCUL FISCAL =====

// Application des abattements selon la logique exacte du Google Sheets
function calculerAbattementSalaires(revenus: RevenuItem[]): number {
  let total = 0;

  for (const revenu of revenus) {
    if (revenu.type === "Salaires") {
      if (revenu.fraisReels && revenu.fraisReels > 0) {
        // Frais réels : montant brut - frais réels
        total += revenu.montant - revenu.fraisReels;
      } else {
        // Abattement forfaitaire de 10% par défaut
        total += revenu.montant * 0.9;
      }
    }

    if (revenu.type === "Pensions et retraites") {
      total += revenu.montant * 0.9;
    }
  }

  return total;
}

function calculerAbattementBIC(revenus: RevenuItem[]): number {
  let total = 0;

  const typesBIC = [
    "Revenus industriels et commerciaux",
    "Revenus des locations meublées professionnels",
    "Revenus des locations meublées non professionnels",
  ];

  for (const revenu of revenus) {
    if (typesBIC.includes(revenu.type)) {
      if (revenu.fraisReels && revenu.fraisReels > 0) {
        total += revenu.montant - revenu.fraisReels;
      } else {
        switch (revenu.regime) {
          case "Micro-BIC Activités d'achat / revente":
            total += revenu.montant * 0.29;
            break;
          case "Micro-BIC Activités de service":
            total += revenu.montant * 0.5;
            break;
          case "Micro-BIC Activités de meublés de tourisme non classés":
            total += revenu.montant * 0.7;
            break;
          default:
            total += revenu.montant;
        }
      }
    }
  }

  return total;
}

function calculerAbattementBNC(revenus: RevenuItem[]): number {
  let total = 0;

  for (const revenu of revenus) {
    if (revenu.type === "Revenus non commerciaux") {
      if (revenu.fraisReels && revenu.fraisReels > 0) {
        total += revenu.montant - revenu.fraisReels;
      } else if (revenu.regime === "Micro-BNC") {
        total += revenu.montant * 0.66;
      } else {
        total += revenu.montant;
      }
    }
  }

  return total;
}

function calculerAbattementBA(revenus: RevenuItem[]): number {
  let total = 0;

  for (const revenu of revenus) {
    if (revenu.type === "Revenus agricoles") {
      if (revenu.fraisReels && revenu.fraisReels > 0) {
        total += revenu.montant - revenu.fraisReels;
      } else if (revenu.regime === "Micro-bénéfices agricole") {
        total += revenu.montant * 0.13;
      } else {
        total += revenu.montant;
      }
    }
  }

  return total;
}

function calculerAbattementFonciers(revenus: RevenuItem[]): number {
  let total = 0;

  for (const revenu of revenus) {
    if (revenu.type === "Revenus fonciers") {
      if (revenu.fraisReels && revenu.fraisReels > 0) {
        total += revenu.montant - revenu.fraisReels;
      } else if (revenu.regime === "Micro-foncier") {
        total += revenu.montant * 0.7; // 30% d'abattement = on garde 70%
      } else {
        total += revenu.montant;
      }
    }
  }

  return total;
}

function calculerAbattementRCM(revenus: RevenuItem[]): number {
  let total = 0;

  for (const revenu of revenus) {
    if (revenu.type === "Revenus mobiliers") {
      if (revenu.regime === "Barème progressif") {
        total += revenu.montant; // Pas d'abattement particulier mentionné dans le sheet
      } else if (revenu.regime === "PFU") {
        total += revenu.montant * 0.7; // 30% d'abattement
      } else {
        total += revenu.montant;
      }
    }
  }

  return total;
}

function calculerAutresRevenus(revenus: RevenuItem[]): number {
  let total = 0;
  const typesAutres = [
    "Pensions alimentaires",
    "Rentes viagères",
    "Allocations familiales",
  ];

  for (const revenu of revenus) {
    if (typesAutres.includes(revenu.type)) {
      total += revenu.montant;
    }
  }

  return total;
}

// Calcul du barème progressif de l'impôt (barème 2025)
function calculerImpotBareme(quotientFamilial: number): number {
  if (quotientFamilial <= 11498) return 0;
  if (quotientFamilial <= 29315) return (quotientFamilial - 11498) * 0.11;
  if (quotientFamilial <= 83823) {
    return (29315 - 11498) * 0.11 + (quotientFamilial - 29315) * 0.3;
  }
  if (quotientFamilial <= 180294) {
    return (
      (29315 - 11498) * 0.11 +
      (83823 - 29315) * 0.3 +
      (quotientFamilial - 83823) * 0.41
    );
  }
  return (
    (29315 - 11498) * 0.11 +
    (83823 - 29315) * 0.3 +
    (180294 - 83823) * 0.41 +
    (quotientFamilial - 180294) * 0.45
  );
}

// Calcul avec plafonnement familial
function calculerImpotAvecPlafonnement(
  revenuNetGlobal: number,
  partsBase: number,
  partsTotales: number,
  nombreEnfants: number,
): {
  impotFinal: number;
  depassementPlafond: boolean;
  montantDepassement: number;
} {
  const quotientAvecEnfants = revenuNetGlobal / partsTotales;
  const impotAvecEnfants =
    calculerImpotBareme(quotientAvecEnfants) * partsTotales;

  const quotientSansEnfants = revenuNetGlobal / partsBase;
  const impotSansEnfants = calculerImpotBareme(quotientSansEnfants) * partsBase;

  const economieImpot = Math.max(0, impotSansEnfants - impotAvecEnfants);

  let plafondEconomie = 0;
  if (nombreEnfants === 1) plafondEconomie = 1791;
  else if (nombreEnfants >= 2) plafondEconomie = 3582;

  const depassementPlafond = Math.max(0, economieImpot - plafondEconomie);

  const impotFinal =
    depassementPlafond > 0
      ? impotAvecEnfants + depassementPlafond
      : impotAvecEnfants;

  return {
    impotFinal,
    depassementPlafond: depassementPlafond > 0,
    montantDepassement: depassementPlafond,
  };
}

// Calcul de la décôte
function calculerDecote(impotBrut: number, partsBase: number): number {
  if (partsBase === 1) {
    if (impotBrut < 1964) {
      return 889 - 0.4525 * impotBrut;
    }
  } else if (partsBase === 2) {
    if (impotBrut < 3249) {
      return 1470 - 0.4525 * impotBrut;
    }
  }
  return 0;
}

// Calcul CEHR
function calculerCEHR(revenuNetGlobal: number, partsBase: number): number {
  if (partsBase === 1) {
    if (revenuNetGlobal <= 250000) return 0;
    if (revenuNetGlobal <= 500000) return (revenuNetGlobal - 250000) * 0.03;
    return 250000 * 0.03 + (revenuNetGlobal - 500000) * 0.04;
  } else if (partsBase === 2) {
    if (revenuNetGlobal <= 500000) return 0;
    if (revenuNetGlobal <= 1000000) return (revenuNetGlobal - 500000) * 0.03;
    return 500000 * 0.03 + (revenuNetGlobal - 1000000) * 0.04;
  }
  return 0;
}

// Calcul du TMI
function calculerTMI(quotientFamilial: number): number {
  if (quotientFamilial <= 11497) return 0;
  if (quotientFamilial <= 29315) return 0.11;
  if (quotientFamilial <= 83823) return 0.3;
  if (quotientFamilial <= 180294) return 0.41;
  return 0.45;
}

// Fonction principale de calcul de l'impôt
function calculerImpotTotal({
  revenus,
  situationFamiliale,
  nombreEnfants,
  deductionsImpot = 0,
  reductionsImpot = 0,
  creditImpot = 0,
}: {
  revenus: RevenuItem[];
  situationFamiliale: string;
  nombreEnfants: number;
  deductionsImpot?: number;
  reductionsImpot?: number;
  creditImpot?: number;
}): TaxCalculationResult {
  // 1. Calcul des parts fiscales
  const partsBase =
    situationFamiliale === "Célibataire" || situationFamiliale === "Veuf"
      ? 1
      : 2;
  const partsTotales = calculerPartsFiscales(partsBase, nombreEnfants);

  // 2. Calcul du revenu brut global
  const revenuBrutGlobal = revenus.reduce((sum, r) => sum + r.montant, 0);

  // 3. Application des abattements par catégorie
  const abattementSalaires = calculerAbattementSalaires(revenus);
  const abattementBIC = calculerAbattementBIC(revenus);
  const abattementBNC = calculerAbattementBNC(revenus);
  const abattementBA = calculerAbattementBA(revenus);
  const abattementFonciers = calculerAbattementFonciers(revenus);
  const abattementRCM = calculerAbattementRCM(revenus);
  const autresRevenus = calculerAutresRevenus(revenus);

  // 4. Revenu Net Global
  const revenuNetCategoriels =
    abattementSalaires +
    abattementBIC +
    abattementBNC +
    abattementBA +
    abattementFonciers +
    abattementRCM +
    autresRevenus;
  const revenuNetGlobal = revenuNetCategoriels - deductionsImpot;

  // 5. Calcul de l'impôt avec plafonnement familial
  const resultPlafonnement = calculerImpotAvecPlafonnement(
    revenuNetGlobal,
    partsBase,
    partsTotales,
    nombreEnfants,
  );

  // 6. Application de la décôte
  const decote = calculerDecote(resultPlafonnement.impotFinal, partsBase);
  const impotApresDecote = Math.max(resultPlafonnement.impotFinal - decote, 0);

  // 7. Application des réductions et crédits d'impôt
  const impotNetAvantCEHR =
    Math.max(0, impotApresDecote - reductionsImpot) - creditImpot;

  // 8. Calcul CEHR
  const cehr = calculerCEHR(revenuNetGlobal, partsBase);

  // 9. Impôt total final
  const impotTotal = impotNetAvantCEHR + cehr;

  // 10. TMI et taux moyen
  const quotientFamilial = revenuNetGlobal / partsTotales;
  const tmi = calculerTMI(quotientFamilial);
  const tauxMoyen = revenuNetGlobal > 0 ? impotTotal / revenuNetGlobal : 0;

  return {
    revenuBrutGlobal,
    revenuNetGlobal,
    impotBrutFinal: resultPlafonnement.impotFinal,
    decote,
    impotNet: impotApresDecote,
    cehr,
    impotTotal,
    tmi: tmi * 100,
    tauxMoyen: tauxMoyen * 100,
    plafonnementFamilial: resultPlafonnement.depassementPlafond,
    montantDepassement: resultPlafonnement.montantDepassement,
  };
}

// ===== FONCTIONS UTILITAIRES =====

function calculerPartsFiscales(
  partsBase: number,
  nombreEnfants: number,
): number {
  if (nombreEnfants === 1) return partsBase + 0.5;
  if (nombreEnfants === 2) return partsBase + 1;
  if (nombreEnfants === 3) return partsBase + 2;
  if (nombreEnfants === 4) return partsBase + 3;
  if (nombreEnfants === 5) return partsBase + 4;
  if (nombreEnfants === 6) return partsBase + 5;
  if (nombreEnfants === 7) return partsBase + 6;
  if (nombreEnfants === 8) return partsBase + 7;
  if (nombreEnfants === 9) return partsBase + 8;
  if (nombreEnfants === 10) return partsBase + 9;
  return partsBase;
}

const mapBudgetIncomeToFiscalRevenu = (
  budgetIncome: BudgetIncome,
): RevenuItem => {
  return {
    id: `budget-${budgetIncome.id}`,
    type: budgetIncome.type,
    denomination: `${budgetIncome.denomination} (Budget)`,
    montant: budgetIncome.amount,
    regime: budgetIncome.fiscalRegime || "Aucun régime",
    fraisReels: budgetIncome.deductibleExpenses,
    source: "budget",
  };
};

const mapMaritalStatusToSituationFiscale = (maritalStatus: string): string => {
  switch (maritalStatus) {
    case "marié":
      return "Marié";
    case "pacsé":
      return "Pacsé";
    case "divorcé":
      return "Divorcé";
    case "veuf":
      return "Veuf";
    default:
      return "Célibataire";
  }
};

// ===== COMPOSANT PRINCIPAL =====
export default function ImpotRevenuPage() {
  const [revenus, setRevenus] = useState<RevenuItem[]>([]);
  const [situationFamiliale, setSituationFamiliale] = useState("Célibataire");
  const [nombreEnfants, setNombreEnfants] = useState(0);
  const [nbParts, setNbParts] = useState(1);
  const [partsModifiedManually, setPartsModifiedManually] = useState(false);
  const [deductionsImpot, setDeductionsImpot] = useState(0);
  const [reductionsImpot, setReductionsImpot] = useState(0);
  const [creditImpot, setCreditImpot] = useState(0);

  const loadDataFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      // Charger les données d'identité
      const savedIdentityData = localStorage.getItem(
        LOCAL_STORAGE_KEY_IDENTITY_PERSONAL,
      );
      if (savedIdentityData) {
        const parsedIdentity = JSON.parse(savedIdentityData);
        const maritalStatus = parsedIdentity.maritalStatus || "";
        const children = parsedIdentity.children || [];

        const mappedSituationFamiliale =
          mapMaritalStatusToSituationFiscale(maritalStatus);
        const calculatedParts = calculerPartsFiscales(
          mappedSituationFamiliale === "Célibataire" ||
            mappedSituationFamiliale === "Veuf"
            ? 1
            : 2,
          children.length,
        );

        setSituationFamiliale(mappedSituationFamiliale);
        setNombreEnfants(children.length);
        if (!partsModifiedManually) {
          setNbParts(calculatedParts);
        }
      }

      // Charger les données fiscales existantes
      const savedFiscalData = localStorage.getItem(LOCAL_STORAGE_KEY_IR);
      let manualRevenus: RevenuItem[] = [];
      if (savedFiscalData) {
        const parsed = JSON.parse(savedFiscalData);
        manualRevenus =
          parsed.revenus?.filter((r: RevenuItem) => r.source === "manual") ||
          [];

        if (parsed.nbParts && typeof parsed.nbParts === "number") {
          setNbParts(parsed.nbParts);
          setPartsModifiedManually(true);
        }

        if (parsed.deductionsImpot !== undefined)
          setDeductionsImpot(parsed.deductionsImpot);
        if (parsed.reductionsImpot !== undefined)
          setReductionsImpot(parsed.reductionsImpot);
        if (parsed.creditImpot !== undefined)
          setCreditImpot(parsed.creditImpot);
      }

      // Charger les revenus du budget
      const savedBudgetRevenus = localStorage.getItem(
        LOCAL_STORAGE_KEY_BUDGET_REVENUS,
      );
      let budgetMappedRevenus: RevenuItem[] = [];
      if (savedBudgetRevenus) {
        const budgetIncomes: BudgetIncome[] = JSON.parse(savedBudgetRevenus);
        budgetMappedRevenus = budgetIncomes.map(mapBudgetIncomeToFiscalRevenu);
      }

      setRevenus([...budgetMappedRevenus, ...manualRevenus]);
    }
  }, [partsModifiedManually]);

  useEffect(() => {
    loadDataFromLocalStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === LOCAL_STORAGE_KEY_BUDGET_REVENUS ||
        e.key === LOCAL_STORAGE_KEY_IDENTITY_PERSONAL
      ) {
        loadDataFromLocalStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    let lastBudgetData =
      localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET_REVENUS) || "";
    let lastIdentityData =
      localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY_PERSONAL) || "";

    const intervalId = setInterval(() => {
      const currentBudgetData =
        localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET_REVENUS) || "";
      const currentIdentityData =
        localStorage.getItem(LOCAL_STORAGE_KEY_IDENTITY_PERSONAL) || "";

      if (
        currentBudgetData !== lastBudgetData ||
        currentIdentityData !== lastIdentityData
      ) {
        lastBudgetData = currentBudgetData;
        lastIdentityData = currentIdentityData;
        loadDataFromLocalStorage();
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [loadDataFromLocalStorage]);

  const saveDataToLocalStorage = () => {
    if (typeof window !== "undefined") {
      const manualRevenus = revenus.filter((r) => r.source === "manual");
      const taxResult = calculerImpotTotal({
        revenus,
        situationFamiliale,
        nombreEnfants,
        deductionsImpot,
        reductionsImpot,
        creditImpot,
      });

      const dataToSave = {
        revenus: manualRevenus,
        situationFamiliale,
        nombreEnfants,
        nbParts,
        deductionsImpot,
        reductionsImpot,
        creditImpot,
        trancheMarginaleDimposition: taxResult.tmi,
        tauxMoyenDimposition: taxResult.tauxMoyen,
        impotTotal: taxResult.impotTotal,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_IR, JSON.stringify(dataToSave));
    }
  };

  const addRevenu = () => {
    const newRevenu: RevenuItem = {
      id: Date.now().toString(),
      type: "Salaires",
      denomination: "",
      montant: 0,
      regime: "Aucun régime",
      source: "manual",
    };
    setRevenus([...revenus, newRevenu]);
  };

  const updateRevenu = (
    id: string,
    field: keyof RevenuItem,
    value: string | number,
  ) => {
    setRevenus((prevRevenus) =>
      prevRevenus.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Auto-select appropriate regime when type changes
          if (field === "type" && typeof value === "string") {
            const defaultRegime =
              regimeOptions[value]?.[0]?.value || "Aucun régime";
            updatedItem.regime = defaultRegime;
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  const deleteRevenu = (id: string) => {
    setRevenus(revenus.filter((item) => item.id !== id));
  };

  useEffect(() => {
    saveDataToLocalStorage();
  }, [
    revenus,
    situationFamiliale,
    nombreEnfants,
    nbParts,
    deductionsImpot,
    reductionsImpot,
    creditImpot,
  ]);

  // Calculs fiscaux avec la nouvelle logique
  const taxResult = calculerImpotTotal({
    revenus,
    situationFamiliale,
    nombreEnfants,
    deductionsImpot,
    reductionsImpot,
    creditImpot,
  });

  const repartitionData = revenus
    .filter((item) => item.montant > 0)
    .map((item, index) => ({
      name: item.type,
      value: item.montant,
      color: COLORS[index % COLORS.length],
    }));

  return (
    <SidebarInset className="overflow-hidden">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/fiscalite">Fiscalité</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Impôt sur le revenu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Colonne de gauche - Saisie des données */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>
                Données de la déclaration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Situation familiale */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="situation">Situation familiale</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {situationFamiliale}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parts">Nombre de parts fiscales</Label>
                  <div className="relative">
                    <Input
                      id="parts"
                      type="number"
                      step="0.5"
                      min="1"
                      value={nbParts}
                      onChange={(e) => {
                        setNbParts(Number.parseFloat(e.target.value) || 1);
                        setPartsModifiedManually(true);
                      }}
                      className="pr-8"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
                      onClick={() => {
                        const calculatedParts = calculerPartsFiscales(
                          situationFamiliale === "Célibataire" ||
                            situationFamiliale === "Veuf"
                            ? 1
                            : 2,
                          nombreEnfants,
                        );
                        setNbParts(calculatedParts);
                        setPartsModifiedManually(false);
                      }}
                      title="Réinitialiser le nombre de parts"
                    >
                      <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Avantages fiscaux */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Avantages fiscaux</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Déductions d'impôt (€)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={deductionsImpot}
                      onChange={(e) =>
                        setDeductionsImpot(Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reductions">Réductions d'impôt (€)</Label>
                    <Input
                      id="reductions"
                      type="number"
                      value={reductionsImpot}
                      onChange={(e) =>
                        setReductionsImpot(Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit">Crédit d'impôt (€)</Label>
                    <Input
                      id="credit"
                      type="number"
                      value={creditImpot}
                      onChange={(e) =>
                        setCreditImpot(Number(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Liste des revenus */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Revenus déclarés</h3>
                </div>

                {revenus.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun revenu déclaré</p>
                    <p className="text-sm">
                      Veuillez ajouter vos revenus dans la section Revenus
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {revenus.map((revenu) => (
                    <div
                      key={revenu.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <div className="font-medium">{revenu.type}</div>
                          {revenu.denomination && (
                            <div className="text-sm text-muted-foreground">
                              {revenu.denomination}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {revenu.montant.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </div>
                        {revenu.source === "manual" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteRevenu(revenu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colonne de droite - Résultats du calcul */}
          <Card className="md:col-span-1">
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle>
                  Calcul de l'impôt sur le revenu
                </CardTitle>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Voir détail</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Détails du calcul (vérification)</DialogTitle>
                    <DialogDescription>
                      Cette section montre le détail étape par étape du calcul fiscal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Étape 1: Revenus bruts */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        ÉTAPE 1 : REVENUS BRUTS PAR CATÉGORIE
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                        {(() => {
                          const salaires = revenus.filter(
                            (r) =>
                              r.type === "Salaires" ||
                              r.type === "Pensions et retraites",
                          );
                          const bic = revenus.filter((r) =>
                            [
                              "Revenus industriels et commerciaux",
                              "Revenus des locations meublées professionnels",
                              "Revenus des locations meublées non professionnels",
                            ].includes(r.type),
                          );
                          const bnc = revenus.filter(
                            (r) => r.type === "Revenus non commerciaux",
                          );
                          const ba = revenus.filter(
                            (r) => r.type === "Revenus agricoles",
                          );
                          const fonciers = revenus.filter(
                            (r) => r.type === "Revenus fonciers",
                          );
                          const rcm = revenus.filter(
                            (r) => r.type === "Revenus mobiliers",
                          );
                          const autres = revenus.filter(
                            (r) =>
                              ![
                                "Salaires",
                                "Pensions et retraites",
                                "Revenus industriels et commerciaux",
                                "Revenus des locations meublées professionnels",
                                "Revenus des locations meublées non professionnels",
                                "Revenus non commerciaux",
                                "Revenus agricoles",
                                "Revenus fonciers",
                                "Revenus mobiliers",
                              ].includes(r.type),
                          );

                          return (
                            <>
                              {salaires.length > 0 && (
                                <div className="flex justify-between">
                                  <span>• Salaires et pensions :</span>
                                  <span className="font-mono">
                                    {salaires
                                      .reduce((sum, r) => sum + r.montant, 0)
                                      .toLocaleString("fr-FR")} {" "}
                                    €
                                  </span>
                                </div>
                              )}
                              {bic.length > 0 && (
                                <div className="flex justify-between">
                                  <span>
                                    • BIC (Bénéfices Industriels et Commerciaux) :
                                  </span>
                                  <span className="font-mono">
                                    {bic
                                      .reduce((sum, r) => sum + r.montant, 0)
                                      .toLocaleString("fr-FR")} {" "}
                                    €
                                  </span>
                                </div>
                              )}
                              {bnc.length > 0 && (
                                <div className="flex justify-between">
                                  <span>• BNC (Bénéfices Non Commerciaux) :</span>
                                  <span className="font-mono">
                                    {bnc
                                      .reduce((sum, r) => sum + r.montant, 0)
                                      .toLocaleString("fr-FR")} {" "}
                                    €
                                  </span>
                                </div>
                              )}
                              {ba.length > 0 && (
                                <div className="flex justify-between">
                                  <span>• BA (Bénéfices Agricoles) :</span>
                                  <span className="font-mono">
                                    {ba
                                      .reduce((sum, r) => sum + r.montant, 0)
                                      .toLocaleString("fr-FR")} {" "}
                                    €
                                  </span>
                                </div>
                              )}
                              {fonciers.length > 0 && (
                                <div className="flex justify-between">
                                  <span>• Revenus fonciers :</span>
                                  <span className="font-mono">
                                    {fonciers
                                      .reduce((sum, r) => sum + r.montant, 0)
                                      .toLocaleString("fr-FR")} {" "}
                                    €
                                  </span>
                                </div>
                              )}
                              {rcm.length > 0 && (
                                <div className="flex justify-between">
                                  <span>
                                    • RCM (Revenus de Capitaux Mobiliers) :
                                  </span>
                                  <span className="font-mono">
                                    {rcm
                                      .reduce((sum, r) => sum + r.montant, 0)
                                      .toLocaleString("fr-FR")} {" "}
                                    €
                                  </span>
                                </div>
                              )}
                              {autres.length > 0 && (
                                <div className="flex justify-between">
                                  <span>• Autres revenus :</span>
                                  <span className="font-mono">
                                    {autres
                                      .reduce((sum, r) => sum + r.montant, 0)
                                      .toLocaleString("fr-FR")} {" "}
                                    €
                                  </span>
                                </div>
                              )}
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>TOTAL REVENUS BRUTS :</span>
                                <span className="font-mono">
                                  {taxResult.revenuBrutGlobal.toLocaleString(
                                    "fr-FR",
                                  )} {" "}
                                  €
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Étape 2: Abattements par catégorie */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        ÉTAPE 2 : APPLICATION DES ABATTEMENTS
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                        {(() => {
                          const abattementSalaires =
                            calculerAbattementSalaires(revenus);
                          const abattementBIC = calculerAbattementBIC(revenus);
                          const abattementBNC = calculerAbattementBNC(revenus);
                          const abattementBA = calculerAbattementBA(revenus);
                          const abattementFonciers =
                            calculerAbattementFonciers(revenus);
                          const abattementRCM = calculerAbattementRCM(revenus);
                          const autresRevenus = calculerAutresRevenus(revenus);

                          return (
                            <>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>
                                    • Salaires après abattement (10% ou frais réels)
                                    :
                                  </span>
                                  <span className="font-mono">
                                    {abattementSalaires.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>• BIC après abattement :</span>
                                  <span className="font-mono">
                                    {abattementBIC.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>
                                    • BNC après abattement (34% micro ou frais
                                    réels) :
                                  </span>
                                  <span className="font-mono">
                                    {abattementBNC.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>
                                    • BA après abattement (87% micro ou frais réels)
                                    :
                                  </span>
                                  <span className="font-mono">
                                    {abattementBA.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>• Revenus fonciers après abattement :</span>
                                  <span className="font-mono">
                                    {abattementFonciers.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>• RCM après abattement :</span>
                                  <span className="font-mono">
                                    {abattementRCM.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>• Autres revenus :</span>
                                  <span className="font-mono">
                                    {autresRevenus.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold">
                                <span>REVENU NET GLOBAL AVANT DÉDUCTIONS :</span>
                                <span className="font-mono">
                                  {(
                                    abattementSalaires +
                                    abattementBIC +
                                    abattementBNC +
                                    abattementBA +
                                    abattementFonciers +
                                    abattementRCM +
                                    autresRevenus
                                  ).toLocaleString("fr-FR")} {" "}
                                  €
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Étape 3: Déductions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        ÉTAPE 3 : DÉDUCTIONS SUR LE REVENU GLOBAL
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>• Déductions fiscales appliquées :</span>
                          <span className="font-mono">
                            -{deductionsImpot.toLocaleString("fr-FR")} €
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>REVENU NET IMPOSABLE :</span>
                          <span className="font-mono">
                            {taxResult.revenuNetGlobal.toLocaleString("fr-FR")} €
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Étape 4: Quotient familial */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        ÉTAPE 4 : CALCUL DU QUOTIENT FAMILIAL
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>• Situation familiale :</span>
                          <span className="font-mono">{situationFamiliale}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Nombre d'enfants :</span>
                          <span className="font-mono">{nombreEnfants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Parts fiscales de base :</span>
                          <span className="font-mono">
                            {situationFamiliale === "Célibataire" ||
                            situationFamiliale === "Veuf"
                              ? 1
                              : 2}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Parts supplémentaires (enfants) :</span>
                          <span className="font-mono">
                            {(
                              nbParts -
                              (situationFamiliale === "Célibataire" ||
                              situationFamiliale === "Veuf"
                                ? 1
                                : 2)
                            ).toFixed(1)}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>NOMBRE TOTAL DE PARTS :</span>
                          <span className="font-mono">{nbParts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            • Quotient familial (Revenu imposable / Parts) :
                          </span>
                          <span className="font-mono">
                            {(taxResult.revenuNetGlobal / nbParts).toLocaleString(
                              "fr-FR",
                            )} {" "}
                            €
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Étape 5: Barème progressif */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        ÉTAPE 5 : APPLICATION DU BARÈME PROGRESSIF 2025
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                        {(() => {
                          const quotient = taxResult.revenuNetGlobal / nbParts;
                          const tranches = [
                            { min: 0, max: 11498, taux: 0 },
                            { min: 11498, max: 29315, taux: 11 },
                            { min: 29315, max: 83823, taux: 30 },
                            { min: 83823, max: 180294, taux: 41 },
                            { min: 180294, max: Infinity, taux: 45 },
                          ];

                          let impotParPart = 0;
                          const details = tranches
                            .map((tranche) => {
                              const base = Math.min(
                                Math.max(quotient - tranche.min, 0),
                                tranche.max - tranche.min,
                              );
                              const impot = (base * tranche.taux) / 100;
                              impotParPart += impot;
                              return { tranche, base, impot };
                            })
                            .filter((d) => d.base > 0);

                          return (
                            <>
                              <div className="space-y-1">
                                {details.map((d, i) => (
                                  <div key={i} className="flex justify-between">
                                    <span>
                                      • Tranche {d.tranche.taux}% (
                                      {d.tranche.min.toLocaleString("fr-FR")} € - {" "}
                                      {d.tranche.max === Infinity
                                        ? "∞"
                                        : d.tranche.max.toLocaleString(
                                            "fr-FR",
                                          )} {" "}
                                      €) :
                                    </span>
                                    <span className="font-mono">
                                      {d.base.toLocaleString("fr-FR")} € × {" "}
                                      {d.tranche.taux}% = {" "}
                                      {d.impot.toLocaleString("fr-FR")} €
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between">
                                <span>Impôt par part :</span>
                                <span className="font-mono">
                                  {impotParPart.toLocaleString("fr-FR")} €
                                </span>
                              </div>
                              <div className="flex justify-between font-semibold">
                                <span>
                                  IMPÔT AVANT PLAFONNEMENT (
                                  {impotParPart.toLocaleString("fr-FR")} € × {" "}
                                  {nbParts} parts) :
                                </span>
                                <span className="font-mono">
                                  {(impotParPart * nbParts).toLocaleString("fr-FR")} {" "}
                                  €
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Étape 6: Plafonnement du quotient familial */}
                    {taxResult.plafonnementFamilial && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          ÉTAPE 6 : PLAFONNEMENT DU QUOTIENT FAMILIAL
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>
                              • Avantage fiscal maximal par demi-part supplémentaire :
                            </span>
                            <span className="font-mono">1 759 €</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Dépassement du plafond :</span>
                            <span className="font-mono">
                              {taxResult.montantDepassement.toLocaleString("fr-FR")} {" "}
                              €
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>IMPÔT APRÈS PLAFONNEMENT :</span>
                            <span className="font-mono">
                              {taxResult.impotBrutFinal.toLocaleString("fr-FR")} €
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Étape 7: Décote */}
                    {taxResult.decote > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          ÉTAPE 7 : APPLICATION DE LA DÉCOTE
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>
                              • Seuil de décote (
                              {situationFamiliale === "Célibataire" ||
                              situationFamiliale === "Veuf"
                                ? "célibataire"
                                : "couple"}
                              ) :
                            </span>
                            <span className="font-mono">
                              {(situationFamiliale === "Célibataire" ||
                              situationFamiliale === "Veuf"
                                ? 1929
                                : 3191
                              ).toLocaleString("fr-FR")} {" "}
                              €
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Montant de la décote :</span>
                            <span className="font-mono">
                              -{taxResult.decote.toLocaleString("fr-FR")} €
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>IMPÔT APRÈS DÉCOTE :</span>
                            <span className="font-mono">
                              {taxResult.impotNet.toLocaleString("fr-FR")} €
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Étape 8: Réductions et crédits d'impôt */}
                    {(reductionsImpot > 0 || creditImpot > 0) && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          ÉTAPE 8 : RÉDUCTIONS ET CRÉDITS D'IMPÔT
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                          {reductionsImpot > 0 && (
                            <div className="flex justify-between">
                              <span>• Réductions d'impôt :</span>
                              <span className="font-mono text-green-600">
                                -{reductionsImpot.toLocaleString("fr-FR")} €
                              </span>
                            </div>
                          )}
                          {creditImpot > 0 && (
                            <div className="flex justify-between">
                              <span>• Crédits d'impôt :</span>
                              <span className="font-mono text-green-600">
                                -{creditImpot.toLocaleString("fr-FR")} €
                              </span>
                            </div>
                          )}
                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>IMPÔT APRÈS AVANTAGES :</span>
                            <span className="font-mono">
                              {Math.max(
                                0,
                                taxResult.impotNet - reductionsImpot - creditImpot,
                              ).toLocaleString("fr-FR")} {" "}
                              €
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Étape 9: CEHR */}
                    {taxResult.cehr > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          ÉTAPE 9 : CONTRIBUTION EXCEPTIONNELLE (CEHR)
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>
                              • Seuil d'application (
                              {situationFamiliale === "Célibataire" ||
                              situationFamiliale === "Veuf"
                                ? "célibataire"
                                : "couple"}
                              ) :
                            </span>
                            <span className="font-mono">
                              {(situationFamiliale === "Célibataire" ||
                              situationFamiliale === "Veuf"
                                ? 250000
                                : 500000
                              ).toLocaleString("fr-FR")} {" "}
                              €
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Taux appliqué :</span>
                            <span className="font-mono">
                              {taxResult.revenuNetGlobal >
                              (situationFamiliale === "Célibataire" ||
                              situationFamiliale === "Veuf"
                                ? 500000
                                : 1000000)
                                ? "4%"
                                : "3%"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Montant de la CEHR :</span>
                            <span className="font-mono">
                              +{taxResult.cehr.toLocaleString("fr-FR")} €
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Résultat final */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        RÉSULTAT FINAL
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>IMPÔT TOTAL À PAYER :</span>
                          <span className="font-mono">
                            {taxResult.impotTotal.toLocaleString("fr-FR")} €
                          </span>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Tranche marginale d'imposition
                            </span>
                            <p className="text-xl font-bold">{taxResult.tmi}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Taux moyen d'imposition
                            </span>
                            <p className="text-xl font-bold">
                              {taxResult.tauxMoyen.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Revenu brut global</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    {taxResult.revenuBrutGlobal.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Revenu net global</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    {taxResult.revenuNetGlobal.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tranche marginale</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    {taxResult.tmi.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Taux moyen</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    {taxResult.tauxMoyen.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Impôt total dû</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                  {taxResult.impotTotal.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                  {taxResult.impotTotal < 0 && (
                    <span className="ml-2 text-sm font-normal">(remboursement)</span>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
