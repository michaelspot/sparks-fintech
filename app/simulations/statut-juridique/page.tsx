"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function StatutJuridiquePage() {
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Vérifier si le script URSSAF existe déjà
    const existingScript = document.querySelector('script[src="https://mon-entreprise.urssaf.fr/simulateur-iframe-integration.js"]');
    
    if (!existingScript && iframeContainerRef.current) {
      // Détecter le thème actuel (dark/light)
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        document.documentElement.getAttribute('data-theme') === 'dark' ||
                        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Couleur d'accent selon le thème
      const accentColor = isDarkMode ? "#ffffff" : "#000000";
      
      // Création du script pour intégrer le simulateur URSSAF
      const script = document.createElement("script");
      script.setAttribute("data-module", "choix-statut-juridique");
      script.setAttribute("data-couleur", accentColor);
      script.src = "https://mon-entreprise.urssaf.fr/simulateur-iframe-integration.js";
      script.id = "urssaf-script"; // Ajouter un ID pour faciliter la gestion
      
      // Ajout du script au conteneur
      iframeContainerRef.current.appendChild(script);

      // Nettoyage lors du démontage du composant
      return () => {
        const scriptToRemove = document.getElementById("urssaf-script");
        if (scriptToRemove && scriptToRemove.parentNode) {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
        }
      };
    }
  }, []);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/simulations">Simulations</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Statut Juridique</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Simulateur URSSAF - Choix du statut juridique</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={iframeContainerRef} 
              className="w-full min-h-[800px]"
              id="urssaf-simulator-container"
            />
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
