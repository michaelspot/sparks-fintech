"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, FileText, Download, Volume2, TrendingUp, Shield, PiggyBank } from "lucide-react"

export default function RecommendationsPage() {
  const recommendations = [
    {
      id: 1,
      title: "Optimisation fiscale via PER",
      category: "Fiscalité",
      priority: "Haute",
      impact: "Économie de 2 400€/an d'impôts",
      description:
        "Versement de 8 000€ sur un Plan d'Épargne Retraite pour réduire votre tranche marginale d'imposition.",
      icon: PiggyBank,
      color: "text-green-600",
    },
    {
      id: 2,
      title: "Diversification du patrimoine financier",
      category: "Investissement",
      priority: "Moyenne",
      impact: "Réduction du risque de 15%",
      description:
        "Répartir vos investissements sur différentes classes d'actifs pour optimiser le couple rendement/risque.",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      id: 3,
      title: "Renforcement de la prévoyance",
      category: "Protection",
      priority: "Haute",
      impact: "Couverture familiale optimisée",
      description: "Souscrire une assurance décès complémentaire pour protéger votre famille en cas d'imprévu.",
      icon: Shield,
      color: "text-orange-600",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Moyenne":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Basse":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Préconisations</h1>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export PowerPoint
          </Button>
          <Button>
            <Volume2 className="w-4 h-4 mr-2" />
            Explication vocale
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <CardTitle>Analyse Patrimoniale Personnalisée</CardTitle>
            </div>
            <CardDescription>
              Basée sur vos informations financières et patrimoniales, voici nos recommandations pour optimiser votre
              situation.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${rec.color}`}>
                      <rec.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{rec.category}</Badge>
                        <Badge className={getPriorityColor(rec.priority)}>Priorité {rec.priority}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{rec.impact}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{rec.description}</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Plus de détails
                  </Button>
                  <Button size="sm">Appliquer cette recommandation</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions Recommandées</CardTitle>
            <CardDescription>Étapes suivantes pour optimiser votre patrimoine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Prendre rendez-vous avec votre conseiller</h4>
                  <p className="text-sm text-muted-foreground">
                    Discuter des recommandations prioritaires et planifier leur mise en œuvre
                  </p>
                </div>
                <Button size="sm">Planifier</Button>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Mettre à jour vos informations</h4>
                  <p className="text-sm text-muted-foreground">
                    Actualiser vos données patrimoniales pour des recommandations plus précises
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Mettre à jour
                </Button>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Effectuer un suivi régulier</h4>
                  <p className="text-sm text-muted-foreground">
                    Programmer des révisions trimestrielles de votre stratégie patrimoniale
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Programmer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Assistant Vocal IA
            </CardTitle>
            <CardDescription>
              Obtenez une explication détaillée de vos préconisations en langage naturel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Notre IA peut vous expliquer chaque recommandation de manière personnalisée et répondre à vos
                  questions.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Assistant vocal disponible
                </div>
              </div>
              <Button size="lg">
                <Volume2 className="w-4 h-4 mr-2" />
                Démarrer l'explication
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
