"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  FileText,
  Download,
  Mail,
  Printer,
  Check,
  BrainCircuit,
  Settings2,
  AlertTriangle,
  Info,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  X,
  Presentation,
  Loader2
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { loadClientDataFromStorage } from "@/lib/preconisations/rules"

// --- TYPES ---

interface Recommendation {
  id: string
  title: string
  description: string
  impact: string
  category: "fiscal" | "civil" | "financier"
  urgency: "faible" | "moyenne" | "haute" | "critique" // Nouveau champ
  selected: boolean
  // Champs détaillés
  definition?: string
  advantages?: string[]
  disadvantages?: string[]
}

interface Person {
  id: string
  name: string
  role: string
  isPrimary: boolean
  selected: boolean
}

interface PlanSection {
  id: string
  title: string
  selected: boolean
}

// --- MOCK DATA ---

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    title: "Donation au dernier vivant",
    description: "Protéger le conjoint survivant en augmentant sa part d'héritage au-delà de la loi.",
    impact: "Protection Conjoint",
    category: "civil",
    urgency: "haute",
    selected: true,
    definition: "Acte notarié par lequel les époux se consentent mutuellement une donation de leurs biens au profit du survivant en cas de décès.",
    advantages: [
      "Augmente les droits du conjoint survivant",
      "Offre plus d'options (usufruit, pleine propriété, mixte)",
      "Révocable à tout moment (sauf si intégrée au contrat de mariage)"
    ],
    disadvantages: [
      "Coût de l'acte notarié",
      "Peut réduire la part immédiate des enfants (mais protège le conjoint)"
    ]
  },
  {
    id: "2",
    title: "Modification du régime matrimonial",
    description: "Passage en communauté universelle avec clause d'attribution intégrale.",
    impact: "Fiscalité 0% au 1er décès",
    category: "civil",
    urgency: "moyenne",
    selected: true,
    definition: "Changement de contrat de mariage pour mettre en commun l'ensemble des biens présents et futurs.",
    advantages: [
      "Protection maximale du conjoint",
      "Pas de droits de succession au premier décès",
      "Simplicité de gestion au premier décès"
    ],
    disadvantages: [
      "Droits de succession plus élevés pour les enfants au second décès (perte d'un abattement)",
      "Irrévocable sans nouvel acte",
      "Nécessite l'accord des enfants majeurs dans certains cas"
    ]
  },
  {
    id: "3",
    title: "Assurance Vie - Clause Bénéficiaire",
    description: "Démembrement de la clause bénéficiaire pour optimiser la transmission aux enfants.",
    impact: "Optimisation fiscale",
    category: "financier",
    urgency: "critique",
    selected: true,
    definition: "Rédaction spécifique de la clause désignant le bénéficiaire en cas de décès : l'usufruit pour le conjoint, la nue-propriété pour les enfants.",
    advantages: [
      "Le conjoint profite des capitaux sa vie durant",
      "Les enfants récupèrent le capital au second décès sans droits supplémentaires",
      "Double optimisation fiscale"
    ],
    disadvantages: [
      "Complexité de rédaction",
      "Nécessite une créance de restitution pour protéger les enfants"
    ]
  },
  {
    id: "4",
    title: "Création d'une SCI Familiale",
    description: "Structurer le patrimoine immobilier locatif et faciliter la transmission des parts.",
    impact: "Transmission progressive",
    category: "fiscal",
    urgency: "faible",
    selected: true,
    definition: "Société Civile Immobilière constituée entre membres d'une même famille pour gérer un patrimoine immobilier.",
    advantages: [
      "Évite l'indivision",
      "Facilite la transmission (donation de parts)",
      "Dissociation pouvoir/avoir (gérance)"
    ],
    disadvantages: [
      "Formalisme de création et de gestion (AG annuelle)",
      "Coûts comptables et juridiques",
      "Responsabilité indéfinie des associés"
    ]
  },
  {
    id: "5",
    title: "Pacte Dutreil",
    description: "Mise en place d'un pacte pour l'entreprise familiale.",
    impact: "Abattement de 75%",
    category: "fiscal",
    urgency: "haute",
    selected: true,
    definition: "Dispositif fiscal permettant une exonération de 75% de la valeur de l'entreprise pour le calcul des droits de mutation à titre gratuit.",
    advantages: [
      "Réduction massive des droits de succession/donation",
      "Facilite la pérennité de l'entreprise",
      "Cumulable avec d'autres abattements"
    ],
    disadvantages: [
      "Conditions strictes de conservation des titres",
      "Engagement de durée (2 ans collectif + 4 ans individuel)",
      "Formalisme rigoureux"
    ]
  }
]

const MOCK_PLAN: PlanSection[] = [
  { id: "audit", title: "Audit Patrimonial Global", selected: true },
  { id: "objectifs", title: "Analyse des Objectifs", selected: true },
  { id: "civil", title: "Stratégies Civiles & Matrimoniales", selected: true },
  { id: "fiscal", title: "Optimisation Fiscale & Successorale", selected: true },
  { id: "financier", title: "Allocation d'Actifs & Placements", selected: true },
  { id: "immo", title: "Structuration Immobilière", selected: true },
  { id: "concl", title: "Synthèse & Calendrier de mise en œuvre", selected: true },
]

// --- HELPERS ---

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "critique": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case "haute": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
    case "moyenne": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
    default: return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
  }
}

const getUrgencyLabel = (urgency: string) => {
  switch (urgency) {
    case "critique": return "Priorité Critique";
    case "haute": return "Haute Priorité";
    case "moyenne": return "Priorité Moyenne";
    default: return "Opportunité";
  }
}

// --- COMPONENTS ---

export default function PreconisationsPage() {
  const [step, setStep] = useState(1)

  // State Step 1
  const [recommendations, setRecommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS)
  const [selectedRecDetails, setSelectedRecDetails] = useState<Recommendation | null>(null)

  // State Step 2
  const [useAI, setUseAI] = useState(false)
  const [aiContext, setAiContext] = useState("")
  const [people, setPeople] = useState<Person[]>([
    { id: "p1", name: "Vous", role: "Client", isPrimary: true, selected: true },
    { id: "p2", name: "Votre conjoint", role: "Conjoint", isPrimary: true, selected: true },
    { id: "p3", name: "Enfant 1", role: "Héritier", isPrimary: false, selected: true },
    { id: "p4", name: "Enfant 2", role: "Héritier", isPrimary: false, selected: true },
  ])
  const [plan, setPlan] = useState<PlanSection[]>(MOCK_PLAN)
  const [isExportingPPT, setIsExportingPPT] = useState(false)

  // Handlers
  const toggleRecommendation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Empêche l'ouverture de la modale
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r))
  }

  const handleExportPPT = async () => {
    setIsExportingPPT(true)
    const toastId = toast.loading("Génération de la présentation en cours...")

    try {
        const clientData = loadClientDataFromStorage()
        if (!clientData) {
            throw new Error("Données patrimoniales introuvables")
        }

        const selectedRecs = recommendations.filter(r => r.selected)
        const selectedPlan = plan.filter(p => p.selected)

        const response = await fetch('/api/export/ppt', {
        method: 'POST',
        body: JSON.stringify({
                clientData,
                recommendations: selectedRecs,
                plan: selectedPlan
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || "Erreur lors de la génération");
        }

        // Récupérer le blob PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Créer un lien de téléchargement temporaire
        const a = document.createElement('a');
        a.href = url;
        // Nom de fichier par défaut ou récupéré du header Content-Disposition si possible (complexe en fetch simple)
        a.download = `Presentation_Patrimoniale.pdf`;
        document.body.appendChild(a);
        a.click();

        // Nettoyage
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Présentation téléchargée avec succès !", { id: toastId });

    } catch (error: any) {
        console.error(error)
        toast.error(`Erreur: ${error.message}`, { id: toastId })
    } finally {
        setIsExportingPPT(false)
    }
  }

  const openDetails = (rec: Recommendation) => {
    setSelectedRecDetails(rec)
  }

  const togglePersonPrimary = (id: string, isPrimary: boolean) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, isPrimary } : p))
  }

  const togglePersonSelected = (id: string) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p))
  }

  const togglePlanSection = (id: string) => {
    setPlan(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s))
  }

  // Helper pour récupérer le nom de l'identité
  useEffect(() => {
    const savedIdentity = localStorage.getItem("identityPersonalInfo")
    if (savedIdentity) {
        const data = JSON.parse(savedIdentity)
        setPeople(prev => {
            const newPeople = [...prev]
            if (data.firstName) newPeople[0].name = data.firstName
            if (data.spouseFirstName) newPeople[1].name = data.spouseFirstName
            return newPeople
        })
    }
  }, [])

  return (
    <SidebarInset>
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Étude & Préconisations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
           {/* Stepper simple */}
           <div className="flex items-center gap-2 mr-8 text-sm font-medium">
              <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"}`}>1</div>
                <span className="hidden sm:inline">Préconisations</span>
              </div>
              <div className="w-8 h-[1px] bg-border" />
              <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"}`}>2</div>
                <span className="hidden sm:inline">Préparatifs</span>
              </div>
              <div className="w-8 h-[1px] bg-border" />
              <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 3 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"}`}>3</div>
                <span className="hidden sm:inline">Restitution</span>
              </div>
           </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">

        {/* --- STEP 1: PRÉCONISATIONS --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Sélection des Préconisations</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Voici les stratégies identifiées comme pertinentes pour votre situation.
                Cliquez sur une carte pour voir les détails. Cochez pour inclure dans l'étude.
              </p>
                  </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => openDetails(rec)}
                  className={`
                    relative group cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-md flex flex-col
                    ${rec.selected
                      ? "border-primary bg-background shadow-sm"
                      : "border-muted bg-muted/30 opacity-70 hover:opacity-100"
                    }
                  `}
                >
                  {/* Header Card */}
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={`capitalize font-normal ${getUrgencyColor(rec.urgency)}`}>
                      {getUrgencyLabel(rec.urgency)}
                    </Badge>
                    <div
                      onClick={(e) => toggleRecommendation(e, rec.id)}
                      className={`
                        w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer z-10
                        ${rec.selected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground bg-background hover:border-primary"}
                      `}
                    >
                      {rec.selected && <Check className="w-4 h-4" />}
                  </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-2 ${rec.selected ? "text-foreground" : "text-muted-foreground"}`}>
                        {rec.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {rec.description}
                    </p>
                </div>

                  {/* Footer Card */}
                  <div className="mt-auto pt-4 flex items-center justify-end">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                        En savoir plus <ArrowRight className="w-3 h-3" />
                    </span>
              </div>
            </div>
              ))}
            </div>
          </div>
        )}

        {/* --- STEP 2: PRÉPARATIFS --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Configuration de l'Étude</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Personnalisez le contenu et l'angle de votre étude patrimoniale avant la génération finale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* ... (Code Step 2 identique au précédent) ... */}
              <div className="md:col-span-7 space-y-6">
                <Card className="border-indigo-100 bg-indigo-50/30 dark:bg-indigo-950/10 dark:border-indigo-900">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <CardTitle className="text-lg">Assistant IA</CardTitle>
                      </div>
                      <Switch
                        checked={useAI}
                        onCheckedChange={setUseAI}
                        className="data-[state=checked]:bg-indigo-600"
                      />
                    </div>
                    <CardDescription>
                      Intégrer une analyse IA pour contextualiser les choix.
                    </CardDescription>
                  </CardHeader>
                  {useAI && (
                    <CardContent className="animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label htmlFor="ai-context">Contexte ou angle spécifique</Label>
                        <Textarea
                          id="ai-context"
                          placeholder="Ex: Insister sur la protection du conjoint survivant car c'est leur inquiétude principale..."
                          className="min-h-[100px] bg-background resize-none border-indigo-200 focus-visible:ring-indigo-500"
                          value={aiContext}
                          onChange={(e) => setAiContext(e.target.value)}
                        />
                      </div>
                </CardContent>
                  )}
              </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Personnes concernées</CardTitle>
                        </div>
                    <CardDescription>
                      Définissez qui est au cœur de l'étude (Principal) et qui est mentionné (Secondaire).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {people.map((person) => (
                        <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={person.selected}
                              onCheckedChange={() => togglePersonSelected(person.id)}
                            />
                        <div>
                              <div className="font-medium">{person.name}</div>
                              <div className="text-xs text-muted-foreground">{person.role}</div>
                            </div>
                          </div>

                          {person.selected && (
                            <div className="flex bg-muted rounded-md p-1">
                               <button
                                onClick={() => togglePersonPrimary(person.id, true)}
                                className={`text-xs px-3 py-1 rounded-sm transition-all ${person.isPrimary ? "bg-white shadow text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                               >
                                 Principal
                               </button>
                               <button
                                onClick={() => togglePersonPrimary(person.id, false)}
                                className={`text-xs px-3 py-1 rounded-sm transition-all ${!person.isPrimary ? "bg-white shadow text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                               >
                                 Secondaire
                               </button>
                            </div>
                          )}
                          </div>
                      ))}
                        </div>
                  </CardContent>
                </Card>
                      </div>

              <div className="md:col-span-5">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Plan de l'étude</CardTitle>
                    </div>
                    <CardDescription>
                      Structure du document final.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-1">
                        {plan.map((section, idx) => (
                          <div
                            key={section.id}
                            onClick={() => togglePlanSection(section.id)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer group"
                          >
                            <div className={`
                              w-5 h-5 rounded border flex items-center justify-center transition-colors
                              ${section.selected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}
                            `}>
                              {section.selected && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`text-sm ${section.selected ? "font-medium" : "text-muted-foreground line-through"}`}>
                              {idx + 1}. {section.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: RESTITUTION --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            {/* ... (Code Step 3 identique) ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Étude prête à être générée
                </h1>
                <p className="text-muted-foreground">
                  Voici un aperçu de la structure de votre étude patrimoniale.
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={() => toast.success("Envoyé par email")}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                        </Button>
                 <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                 </Button>
                 <Button onClick={() => toast.success("Téléchargement lancé")}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter PDF
                 </Button>
                 <Button onClick={handleExportPPT} disabled={isExportingPPT} variant="default" className="bg-orange-600 hover:bg-orange-700 text-white">
                    {isExportingPPT ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Presentation className="w-4 h-4 mr-2" />
                    )}
                    Exporter PPT
                 </Button>
              </div>
            </div>

            <div className="flex-1 bg-muted/30 rounded-xl border-2 border-dashed p-8 flex justify-center overflow-auto">
                <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] flex flex-col relative animate-in zoom-in-95 duration-500">
                    <div className="border-b-2 border-primary pb-6 mb-10 flex justify-between items-end">
                       <div>
                         <h2 className="text-3xl font-bold text-slate-800">Bilan Patrimonial</h2>
                         <p className="text-slate-500 mt-2">Réalisé pour {people.find(p => p.role === "Client")?.name}</p>
                       </div>
                       <div className="text-right">
                         <div className="font-semibold text-primary">OMET</div>
                         <div className="text-sm text-slate-400">{new Date().toLocaleDateString()}</div>
                       </div>
                    </div>

                    <div className="space-y-8 flex-1">
                        {useAI && aiContext && (
                            <div className="bg-indigo-50 p-6 rounded-lg text-sm italic text-indigo-800 border-l-4 border-indigo-400 mb-8">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Note de synthèse (Générée par IA)
                                </h4>
                                "L'analyse de votre situation met en évidence la nécessité de privilégier {aiContext.toLowerCase()}..."
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-700 mb-4 border-l-4 border-slate-300 pl-3">Sommaire</h3>
                            <ul className="space-y-3">
                                {plan.filter(s => s.selected).map((section, i) => (
                                    <li key={section.id} className="flex justify-between text-slate-600 border-b border-dotted border-slate-300 pb-1">
                                        <span>{i + 1}. {section.title}</span>
                                        <span>p. {i * 4 + 3}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-12">
                            <h3 className="text-xl font-bold text-slate-700 mb-4 border-l-4 border-slate-300 pl-3">Préconisations retenues</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {recommendations.filter(r => r.selected).map(rec => (
                                    <div key={rec.id} className="border p-4 rounded bg-slate-50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-1">
                                            <div className={`w-2 h-2 rounded-full ${
                                                rec.urgency === 'critique' ? 'bg-red-500' :
                                                rec.urgency === 'haute' ? 'bg-orange-500' :
                                                rec.urgency === 'moyenne' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`} />
                                        </div>
                                        <div className="font-semibold text-slate-800">{rec.title}</div>
                                        <div className="text-xs text-slate-500 mt-1">{rec.impact}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 text-center text-xs text-slate-400 mt-auto">
                        Document confidentiel généré par OMET - Page 1/24
                    </div>
                </div>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER NAVIGATION */}
      <div className="sticky bottom-0 border-t bg-background p-4 flex justify-between items-center max-w-6xl mx-auto w-full z-10">
                            <Button
                              variant="outline"
          onClick={() => setStep(prev => Math.max(1, prev - 1))}
          disabled={step === 1}
                            >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
                            </Button>

        <div className="text-sm text-muted-foreground font-medium">
            Étape {step} / 3
        </div>

        {step < 3 ? (
             <Button onClick={() => setStep(prev => Math.min(3, prev + 1))}>
             Suivant
             <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
        ) : (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Étude validée et archivée")}>
                Valider et Archiver
                <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
        )}
      </div>

      {/* DIALOG DÉTAILS */}
      <Dialog open={!!selectedRecDetails} onOpenChange={(open) => !open && setSelectedRecDetails(null)}>
                          <DialogContent className="max-w-2xl">
            {selectedRecDetails && (
                <>
                            <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${getUrgencyColor(selectedRecDetails.urgency)} border hover:bg-transparent`}>
                                {getUrgencyLabel(selectedRecDetails.urgency)}
                            </Badge>
                            <Badge variant="outline" className="capitalize">{selectedRecDetails.category}</Badge>
                        </div>
                        <DialogTitle className="text-2xl">{selectedRecDetails.title}</DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            {selectedRecDetails.description}
                        </DialogDescription>
                            </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Définition */}
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Définition
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {selectedRecDetails.definition}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Avantages */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <ThumbsUp className="w-4 h-4" />
                                    Avantages
                                </h4>
                                <ul className="space-y-2">
                                    {selectedRecDetails.advantages?.map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <Check className="w-3 h-3 mt-1 text-green-600 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                  </ul>
                            </div>

                            {/* Inconvénients */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
                                    <ThumbsDown className="w-4 h-4" />
                                    Points d'attention
                                </h4>
                                <ul className="space-y-2">
                                    {selectedRecDetails.disadvantages?.map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <AlertTriangle className="w-3 h-3 mt-1 text-red-500 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                  </ul>
                            </div>
                      </div>
                    </div>

                    <DialogFooter className="flex sm:justify-between gap-2 items-center border-t pt-4">
                        <div className="text-sm text-muted-foreground hidden sm:block">
                            Impact : <span className="font-medium text-foreground">{selectedRecDetails.impact}</span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => setSelectedRecDetails(null)} className="flex-1 sm:flex-none">
                                Fermer
                            </Button>
                <Button
                                onClick={() => {
                                    toggleRecommendation({ stopPropagation: () => {} } as any, selectedRecDetails.id);
                                    setSelectedRecDetails(null);
                                }}
                                variant={selectedRecDetails.selected ? "secondary" : "default"}
                                className="flex-1 sm:flex-none"
                            >
                                {selectedRecDetails.selected ? "Retirer de l'étude" : "Sélectionner"}
                </Button>
              </div>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>

    </SidebarInset>
  )
}