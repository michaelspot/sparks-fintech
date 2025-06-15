"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  // Initialiser l'état d'ouverture en fonction du chemin actuel
  useEffect(() => {
    const newOpenItems: Record<string, boolean> = {}
    
    items.forEach(item => {
      if (item.items) {
        // Vérifier si un des sous-éléments est actif
        const hasActiveChild = item.items.some(
          subItem => pathname === subItem.url || pathname.startsWith(subItem.url + "/")
        )
        newOpenItems[item.title] = hasActiveChild
      }
    })
    
    setOpenItems(newOpenItems)
  }, [pathname, items])

  const toggleItem = (title: string) => {
    setOpenItems(prev => {
      const newState = { ...prev }
      // Fermer tous les autres onglets
      Object.keys(newState).forEach(key => {
        if (key !== title) {
          newState[key] = false
        }
      })
      // Basculer l'état de l'onglet actuel
      newState[title] = !prev[title]
      return newState
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
          const isOpen = openItems[item.title] ?? false

          if (!item.items) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive} 
                  tooltip={item.title}
                  className="transition-colors hover:bg-accent/50"
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible 
              key={item.title} 
              asChild 
              open={isOpen}
              onOpenChange={() => toggleItem(item.title)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className="transition-colors hover:bg-accent/50"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/")
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isSubActive}
                            className="transition-colors hover:bg-accent/50"
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
