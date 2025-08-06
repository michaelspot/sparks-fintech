"use client"

import { BreadcrumbList } from "@/components/ui/breadcrumb"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ScrollArea } from "@/components/ui/scroll-area" // useEffect was missing
import { useEffect } from "react"

const allObjectives = [
  "Se constituer une épargne de précaution",
  "Placer des liquidités à court terme",
  "Constituer, valoriser, diversifier un capital sur le long terme",
  "Obtenir des revenus complémentaires",
  "Se constituer un patrimoine",
  "Optimiser la rentabilité de ses placements",
  "Convertir immédiatement en revenus réguliers et viagers un capital disponible",
  "Accéder à l'univers d'investissement luxembourgeois (multi-devises, multi-supports)",
  "Déléguer à un professionnel la gestion financière de son épargne",
  "Optimiser sa fiscalité",
  "Réduire son IFI",
  "Financer un achat immobilier",
  "Aider ses enfants",
  "Anticiper sa mobilité géographique",
  "Se prémunir contre les accidents de la vie",
  "Protéger son conjoint survivant",
  "Protéger ses proches",
  "Préparer sa retraite",
  "Préparer la transmission de son patrimoine",
  "Préparer la transmission de son entreprise",
]

interface ObjectiveState {
  [key: string]: {
    selected: boolean
    horizon: string
  }
}

const LOCAL_STORAGE_KEY = "identityObjectifsInfo"

export default function ObjectivesPage() {
  const initialObjectivesState = allObjectives.reduce((acc, obj) => {
    acc[obj] = { selected: false, horizon: "" }
    return acc
  }, {} as ObjectiveState)

  const [objectives, setObjectives] = useState<ObjectiveState>(() => initialObjectivesState)
  const [monthlySavings, setMonthlySavings] = useState("")
  const [precautionarySavings, setPrecautionarySavings] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) {
        const {
          objectives: savedObjectives,
          monthlySavings: savedMonthly,
          precautionarySavings: savedPrecautionary,
        } = JSON.parse(savedData)
        if (savedObjectives) setObjectives(savedObjectives)
        if (savedMonthly) setMonthlySavings(savedMonthly)
        if (savedPrecautionary) setPrecautionarySavings(savedPrecautionary)
      }
    }
  }, [])

  // Fonction de sauvegarde automatique
  const saveToLocalStorage = () => {
    if (typeof window !== "undefined") {
      const dataToSave = { objectives, monthlySavings, precautionarySavings }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave))
    }
  }

  const handleObjectiveChange = (objective: string) => {
    const newObjectives = {
      ...objectives,
      [objective]: { ...objectives[objective], selected: !objectives[objective].selected },
    }
    setObjectives(newObjectives)
    saveToLocalStorage()
  }

  const handleHorizonChange = (objective: string, value: string) => {
    const newObjectives = {
      ...objectives,
      [objective]: { ...objectives[objective], horizon: value },
    }
    setObjectives(newObjectives)
    saveToLocalStorage()
  }

  const selectedObjectivesCount = Object.values(objectives).filter((obj) => obj.selected).length

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
                <BreadcrumbPage>Objectifs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Définition de vos objectifs</CardTitle>
            <CardDescription>
              Sélectionnez vos objectifs financiers et précisez votre horizon de placement pour chacun.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Objectifs ({selectedObjectivesCount} sélectionné(s))</Label>
              <ScrollArea className="h-96 w-full rounded-md border mt-2">
                <div className="p-4">
                  {/* En-tête avec colonnes */}
                  <div className="flex items-center space-x-4 mb-4 pb-2 border-b">
                    <div className="flex-grow">
                      <Label className="text-sm font-medium text-muted-foreground">Objectif</Label>
                    </div>
                    <div className="w-32">
                      <Label className="text-sm font-medium text-muted-foreground">Horizon (ans)</Label>
                    </div>
                  </div>
                  
                  {/* Liste des objectifs */}
                  <div className="space-y-3">
                    {allObjectives.map((obj) => (
                      <div key={obj} className="flex items-start space-x-4 min-h-[32px]">
                        <div className="flex items-start space-x-2 flex-grow">
                          <Checkbox
                            id={obj}
                            checked={objectives[obj].selected}
                            onCheckedChange={() => handleObjectiveChange(obj)}
                            className="mt-0.5"
                          />
                          <Label htmlFor={obj} className="font-normal flex-1 cursor-pointer leading-relaxed">
                            {obj}
                          </Label>
                        </div>
                        <div className="w-32 flex justify-center">
                          <Input
                            type="number"
                            placeholder={objectives[obj].selected ? "" : ""}
                            value={objectives[obj].horizon}
                            onChange={(e) => handleHorizonChange(obj, e.target.value)}
                            className="h-8 text-sm w-20 text-center"
                            disabled={!objectives[obj].selected}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="monthlySavings">Effort d'épargne mensuel consacré aux objectifs (€)</Label>
                <Input
                  id="monthlySavings"
                  type="number"
                  placeholder="Ex: 500"
                  value={monthlySavings}
                  onChange={(e) => {
                    setMonthlySavings(e.target.value)
                    saveToLocalStorage()
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precautionarySavings">Montant de l'épargne de précaution souhaité (€)</Label>
                <Input
                  id="precautionarySavings"
                  type="number"
                  placeholder="Ex: 10000"
                  value={precautionarySavings}
                  onChange={(e) => {
                    setPrecautionarySavings(e.target.value)
                    saveToLocalStorage()
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Les boutons d'enregistrement et d'annulation ont été supprimés, la sauvegarde est automatique */}
      </div>
    </SidebarInset>
  )
}
