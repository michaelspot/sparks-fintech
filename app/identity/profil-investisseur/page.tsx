"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Brain, TrendingUp, Shield, Leaf, Users, Edit3 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type ProfileHolder = "vous" | "conjoint"

interface ProfileSectionData {
  label: string | null // e.g., "Novice", "Sécuritaire"
  // For ESG, we might store detailed preferences if needed later
  esgDetails?: {
    envActivities: string | null
    envSocialObjective: string | null
    negativeImpacts: string | null
  }
}

interface InvestorProfile {
  knowledge: ProfileSectionData
  risk: ProfileSectionData
  capacity: ProfileSectionData
  esg: ProfileSectionData
}

const initialSectionData: ProfileSectionData = {
  label: null,
  esgDetails: { envActivities: null, envSocialObjective: null, negativeImpacts: null },
}
const initialProfile: InvestorProfile = {
  knowledge: { ...initialSectionData },
  risk: { ...initialSectionData },
  capacity: { ...initialSectionData },
  esg: { ...initialSectionData },
}

// Definitions for levels and their corresponding progress values and colors
const KNOWLEDGE_LEVELS = [
  { id: "novice", label: "Novice", progress: 33, color: "bg-blue-500" },
  { id: "informe", label: "Informé", progress: 67, color: "bg-blue-500" },
  { id: "experimente", label: "Expérimenté", progress: 100, color: "bg-blue-500" },
]

const RISK_PROFILES = [
  { id: "securitaire", label: "Sécuritaire", progress: 20, color: "bg-orange-500" },
  { id: "defensif", label: "Défensif", progress: 40, color: "bg-orange-500" },
  { id: "equilibre", label: "Équilibré", progress: 60, color: "bg-orange-500" },
  { id: "dynamique", label: "Dynamique", progress: 80, color: "bg-orange-500" },
  { id: "offensif", label: "Offensif", progress: 100, color: "bg-orange-500" },
]

const CAPACITY_LEVELS = [
  { id: "tres_faible", label: "Très faible", progress: 20, color: "bg-red-500" },
  { id: "faible", label: "Faible", progress: 40, color: "bg-red-500" },
  { id: "moyenne", label: "Moyenne", progress: 60, color: "bg-red-500" },
  { id: "elevee", label: "Élevée", progress: 80, color: "bg-red-500" },
  { id: "tres_elevee", label: "Très élevée", progress: 100, color: "bg-red-500" },
]

const ESG_SENSITIVITY_LEVELS = [
  { id: "neutre", label: "Neutre", progress: 25, color: "bg-green-500" },
  { id: "moderee", label: "Modérée", progress: 50, color: "bg-green-500" },
  { id: "significative", label: "Significative", progress: 75, color: "bg-green-500" },
  { id: "forte", label: "Forte", progress: 100, color: "bg-green-500" },
]

const ESG_PREFERENCE_OPTIONS = ["Non défini", "Faible", "Moyen", "Élevé", "Très élevé"]

interface ProfileGaugeProps {
  title: string
  profileSectionData: ProfileSectionData
  levels: Array<{ id: string; label: string; progress: number; color: string }>
  icon: React.ElementType
  description: string
}

function ProfileGauge({ title, profileSectionData, levels, icon: Icon, description }: ProfileGaugeProps) {
  const currentLevel = levels.find((l) => l.label === profileSectionData.label)
  const progressValue = currentLevel ? currentLevel.progress : 0
  const displayLabel = currentLevel ? currentLevel.label : "Non défini"

  // Déterminer la couleur de base selon le type de profil
  const getBaseColor = () => {
    if (title.includes("Connaissance")) return "bg-blue-500"
    if (title.includes("risque")) return "bg-orange-500"
    if (title.includes("Capacité")) return "bg-red-500"
    if (title.includes("ESG")) return "bg-green-500"
    return "bg-gray-500"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{displayLabel}</span>
            <span className="text-sm text-muted-foreground">{progressValue}%</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* Progress bar avec couleur unie */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBaseColor()}`}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface ProfileFormDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  currentProfileData: InvestorProfile
  onSave: (profile: InvestorProfile) => void
  profileHolder: ProfileHolder
}

function ProfileFormDialog({
  isOpen,
  onOpenChange,
  currentProfileData,
  onSave,
  profileHolder,
}: ProfileFormDialogProps) {
  const [knowledge, setKnowledge] = useState<string>(currentProfileData.knowledge.label || "")
  const [risk, setRisk] = useState<string>(currentProfileData.risk.label || "")
  const [capacity, setCapacity] = useState<string>(currentProfileData.capacity.label || "")
  const [esgSensitivity, setEsgSensitivity] = useState<string>(currentProfileData.esg.label || "")
  const [envActivities, setEnvActivities] = useState<string>(
    currentProfileData.esg.esgDetails?.envActivities || ESG_PREFERENCE_OPTIONS[0],
  )
  const [envSocialObjective, setEnvSocialObjective] = useState<string>(
    currentProfileData.esg.esgDetails?.envSocialObjective || ESG_PREFERENCE_OPTIONS[0],
  )
  const [negativeImpacts, setNegativeImpacts] = useState<string>(
    currentProfileData.esg.esgDetails?.negativeImpacts || ESG_PREFERENCE_OPTIONS[0],
  )

  const handleSave = () => {
    onSave({
      knowledge: { label: knowledge || null },
      risk: { label: risk || null },
      capacity: { label: capacity || null },
      esg: {
        label: esgSensitivity || null,
        esgDetails: {
          envActivities: envActivities === ESG_PREFERENCE_OPTIONS[0] ? null : envActivities,
          envSocialObjective: envSocialObjective === ESG_PREFERENCE_OPTIONS[0] ? null : envSocialObjective,
          negativeImpacts: negativeImpacts === ESG_PREFERENCE_OPTIONS[0] ? null : negativeImpacts,
        },
      },
    })
    onOpenChange(false)
  }

  const dialogTitle = profileHolder === "vous" ? "Définir votre profil d'investisseur" : "Définir le profil du conjoint"

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>Répondez à ces questions pour établir ce profil d'investisseur.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-8 py-4">
            {/* Connaissance et expérience */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <Label className="text-base font-semibold">Connaissance et expérience</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Quel est le niveau de connaissance des produits financiers et des marchés ?
              </p>
              <RadioGroup value={knowledge} onValueChange={setKnowledge} className="space-y-2">
                {KNOWLEDGE_LEVELS.map((level) => (
                  <div key={level.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.label} id={`knowledge-${profileHolder}-${level.id}`} />
                    <Label htmlFor={`knowledge-${profileHolder}-${level.id}`} className="font-normal">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Profil de risque */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <Label className="text-base font-semibold">Profil de risque</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Quelle est l'attitude face au risque et à la volatilité des investissements ?
              </p>
              <RadioGroup value={risk} onValueChange={setRisk} className="space-y-2">
                {RISK_PROFILES.map((profile) => (
                  <div key={profile.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={profile.label} id={`risk-${profileHolder}-${profile.id}`} />
                    <Label htmlFor={`risk-${profileHolder}-${profile.id}`} className="font-normal">
                      {profile.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Capacité à subir des pertes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <Label className="text-base font-semibold">Capacité à subir des pertes</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Quelle est la capacité financière à absorber d'éventuelles pertes en capital ?
              </p>
              <RadioGroup value={capacity} onValueChange={setCapacity} className="space-y-2">
                {CAPACITY_LEVELS.map((level) => (
                  <div key={level.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.label} id={`capacity-${profileHolder}-${level.id}`} />
                    <Label htmlFor={`capacity-${profileHolder}-${level.id}`} className="font-normal">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Sensibilité ESG */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-green-500" />
                <Label className="text-base font-semibold">Sensibilité ESG</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Quelle importance est accordée aux critères Environnementaux, Sociaux et de Gouvernance ?
              </p>
              <RadioGroup value={esgSensitivity} onValueChange={setEsgSensitivity} className="space-y-2">
                {ESG_SENSITIVITY_LEVELS.map((level) => (
                  <div key={level.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.label} id={`esg-${profileHolder}-${level.id}`} />
                    <Label htmlFor={`esg-${profileHolder}-${level.id}`} className="font-normal">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="esg-details">
                  <AccordionTrigger className="text-sm">Préférences ESG détaillées (optionnel)</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Activités environnementales</Label>
                      <Select value={envActivities} onValueChange={setEnvActivities}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ESG_PREFERENCE_OPTIONS.map((opt) => (
                            <SelectItem key={`envAct-${opt}`} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Objectif environnemental et social</Label>
                      <Select value={envSocialObjective} onValueChange={setEnvSocialObjective}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ESG_PREFERENCE_OPTIONS.map((opt) => (
                            <SelectItem key={`envSoc-${opt}`} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Incidences négatives</Label>
                      <Select value={negativeImpacts} onValueChange={setNegativeImpacts}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ESG_PREFERENCE_OPTIONS.map((opt) => (
                            <SelectItem key={`negImp-${opt}`} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer le profil</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const LOCAL_STORAGE_KEY = "identityInvestorProfileInfo"

export default function InvestorProfilePage() {
  const [userProfile, setUserProfile] = useState<InvestorProfile>({ ...initialProfile })
  const [spouseProfile, setSpouseProfile] = useState<InvestorProfile | null>(null)

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isSpouseDialogOpen, setIsSpouseDialogOpen] = useState(false)

  // Charger les données du localStorage au montage du composant
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) {
        const { userProfile: savedUserProfile, spouseProfile: savedSpouseProfile } = JSON.parse(savedData)
        if (savedUserProfile) setUserProfile(savedUserProfile)
        if (savedSpouseProfile) setSpouseProfile(savedSpouseProfile)
      }
    }
  }, [])

  // Sauvegarder les données dans le localStorage
  const saveToLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          userProfile,
          spouseProfile,
        })
      )
    }
  }

  const handleSaveUserProfile = (newProfile: InvestorProfile) => {
    setUserProfile(newProfile)
    // Sauvegarde automatique après modification
    setTimeout(() => saveToLocalStorage(), 0)
  }

  const handleSaveSpouseProfile = (newProfile: InvestorProfile) => {
    setSpouseProfile(newProfile)
    // Sauvegarde automatique après modification
    setTimeout(() => saveToLocalStorage(), 0)
  }

  const isUserProfileDefined = Object.values(userProfile).some((section) => section.label !== null)
  const isSpouseProfileDefined = spouseProfile && Object.values(spouseProfile).some((section) => section.label !== null)

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/identity">Identité</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Profil Investisseur</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* User Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Votre profil investisseur</h2>
              <p className="text-sm text-muted-foreground">
                Évaluation de votre profil pour des recommandations personnalisées
              </p>
            </div>
            <Button onClick={() => setIsUserDialogOpen(true)} variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              {isUserProfileDefined ? "Modifier votre profil" : "Ajouter votre profil"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileGauge
              title="Connaissance et expérience"
              profileSectionData={userProfile.knowledge}
              levels={KNOWLEDGE_LEVELS}
              icon={Brain}
              description="Votre niveau de compréhension des produits et marchés financiers"
            />
            <ProfileGauge
              title="Profil de risque"
              profileSectionData={userProfile.risk}
              levels={RISK_PROFILES}
              icon={TrendingUp}
              description="Votre attitude face au risque et à la volatilité des investissements"
            />
            <ProfileGauge
              title="Capacité à subir des pertes"
              profileSectionData={userProfile.capacity}
              levels={CAPACITY_LEVELS}
              icon={Shield}
              description="Votre capacité financière à absorber d'éventuelles pertes en capital"
            />
            <ProfileGauge
              title="Sensibilité ESG"
              profileSectionData={userProfile.esg}
              levels={ESG_SENSITIVITY_LEVELS}
              icon={Leaf}
              description="Votre sensibilité aux critères Environnementaux, Sociaux et de Gouvernance"
            />
          </div>
        </section>

        <Separator />

        {/* Spouse Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Profil investisseur du conjoint</h2>
              <p className="text-sm text-muted-foreground">
                Évaluation du profil de votre conjoint pour des recommandations adaptées
              </p>
            </div>
            <Button onClick={() => setIsSpouseDialogOpen(true)} variant="outline" size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              {isSpouseProfileDefined ? "Modifier profil conjoint" : "Ajouter profil conjoint"}
            </Button>
          </div>
          {spouseProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileGauge
                title="Connaissance et expérience (Conjoint)"
                profileSectionData={spouseProfile.knowledge}
                levels={KNOWLEDGE_LEVELS}
                icon={Brain}
                description="Son niveau de compréhension des produits et marchés financiers"
              />
              <ProfileGauge
                title="Profil de risque (Conjoint)"
                profileSectionData={spouseProfile.risk}
                levels={RISK_PROFILES}
                icon={TrendingUp}
                description="Son attitude face au risque et à la volatilité des investissements"
              />
              <ProfileGauge
                title="Capacité à subir des pertes (Conjoint)"
                profileSectionData={spouseProfile.capacity}
                levels={CAPACITY_LEVELS}
                icon={Shield}
                description="Sa capacité financière à absorber d'éventuelles pertes en capital"
              />
              <ProfileGauge
                title="Sensibilité ESG (Conjoint)"
                profileSectionData={spouseProfile.esg}
                levels={ESG_SENSITIVITY_LEVELS}
                icon={Leaf}
                description="Sa sensibilité aux critères Environnementaux, Sociaux et de Gouvernance"
              />
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2" />
                <p>Aucun profil conjoint défini.</p>
                <p className="text-xs">Cliquez sur "Ajouter profil conjoint" pour commencer.</p>
              </CardContent>
            </Card>
          )}
        </section>

        <ProfileFormDialog
          isOpen={isUserDialogOpen}
          onOpenChange={setIsUserDialogOpen}
          currentProfileData={userProfile}
          onSave={handleSaveUserProfile}
          profileHolder="vous"
        />
        <ProfileFormDialog
          isOpen={isSpouseDialogOpen}
          onOpenChange={setIsSpouseDialogOpen}
          currentProfileData={spouseProfile || initialProfile} // Pass initial if spouseProfile is null
          onSave={handleSaveSpouseProfile}
          profileHolder="conjoint"
        />
      </div>
    </SidebarInset>
  )
}
