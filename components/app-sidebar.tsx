"use client"

import type * as React from "react"
import {
  User,
  Building2,
  Wallet,
  Calculator,
  Receipt,
  TrendingUp,
  Lightbulb,
  Info,
  Home,
  Target,
  Briefcase,
  CreditCard,
  DollarSign,
  FileText,
  Shield,
  Building,
  PiggyBank,
  BarChart3,
  Banknote,
  TrendingDown,
  Percent,
  UserCheck,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  teams: [
    {
      name: "Omet Patrimoine",
      logo: Building2,
      plan: "Professionnel",
    },
  ],
  navMain: [
    {
      title: "Identité",
      url: "/identity",
      icon: User,
      // isActive: true, // This might need dynamic logic based on current page
      items: [
        {
          title: "Informations personnelles",
          url: "/identity/personal",
          icon: User,
        },
        {
          title: "Objectifs",
          url: "/identity/objectifs",
          icon: Target,
        },
        {
          title: "Profil investisseur",
          url: "/identity/profil-investisseur",
          icon: UserCheck,
        },
      ],
    },
    {
      title: "Patrimoine",
      url: "/patrimoine",
      icon: Building2,
      items: [
        {
          title: "Immobilier",
          url: "/patrimoine/immobilier",
          icon: Home,
        },
        {
          title: "Financier",
          url: "/patrimoine/financier",
          icon: Wallet,
        },
        {
          title: "Professionnel",
          url: "/patrimoine/professionnel",
          icon: Briefcase,
        },
      ],
    },
    {
      title: "Budget",
      url: "/budget",
      icon: Calculator,
      isActive: true, // Set active for the current page context
      items: [
        {
          title: "Revenus",
          url: "/budget/revenus",
          icon: DollarSign,
          isActive: true, // Set active for the current page context
        },
        {
          title: "Charges",
          url: "/budget/charges", // Placeholder URL
          icon: CreditCard,
        },
      ],
    },
    {
      title: "Fiscalité",
      url: "/fiscalite",
      icon: Receipt,
      items: [
        {
          title: "Impôt sur le revenu",
          url: "/fiscalite/impot-revenu",
          icon: FileText,
        },
        {
          title: "IFI",
          url: "/fiscalite/ifi",
          icon: Percent,
        },
      ],
    },
    {
      title: "Simulations",
      url: "/simulations",
      icon: TrendingUp,
      items: [
        {
          title: "Prévoyance",
          url: "/simulations/prevoyance",
          icon: Shield,
        },
        {
          title: "Pacte Dutreil",
          url: "/simulations/pacte-dutreil",
          icon: Building,
        },
        {
          title: "Cession immobilière",
          url: "/simulations/cession-immobiliere",
          icon: Home,
        },
        {
          title: "Analyse macroéconomique",
          url: "/simulations/macro",
          icon: BarChart3,
        },
        {
          title: "Versement de PER",
          url: "/simulations/per",
          icon: PiggyBank,
        },
        {
          title: "Rachat d'assurance-vie",
          url: "/simulations/assurance-vie",
          icon: Banknote,
        },
        {
          title: "Valorisation d'un bien",
          url: "/simulations/valorisation",
          icon: TrendingDown,
        },
      ],
    },
    {
      title: "Préconisations",
      url: "/preconisations",
      icon: Lightbulb,
    },
    {
      title: "Informations utiles",
      url: "/informations",
      icon: Info,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Determine active state based on current path (example logic)
  // In a real app, you'd use a router hook like usePathname from next/navigation
  const currentPath = typeof window !== "undefined" ? window.location.pathname : ""

  const updatedNavMain = data.navMain.map((item) => ({
    ...item,
    isActive: currentPath.startsWith(item.url || "-----"), // Handle undefined url
    items: item.items
      ? item.items.map((subItem) => ({
          ...subItem,
          isActive: currentPath === subItem.url,
        }))
      : undefined,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={updatedNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
