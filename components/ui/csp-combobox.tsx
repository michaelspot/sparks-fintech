"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Liste des CSP (Catégories Socio-Professionnelles)
export const cspOptions = [
  { value: "11", label: "Agriculteurs sur petite exploitation" },
  { value: "12", label: "Agriculteurs sur moyenne exploitation" },
  { value: "13", label: "Agriculteurs sur grande exploitation" },
  { value: "21", label: "Artisans" },
  { value: "22", label: "Commerçants et assimilés" },
  { value: "23", label: "Chefs d'entreprise de 10 salariés ou plus" },
  { value: "31", label: "Professions libérales" },
  { value: "33", label: "Cadres de la fonction publique" },
  { value: "34", label: "Professeurs, professions scientifiques" },
  { value: "35", label: "Professions de l'information, des arts et des spectacles" },
  { value: "37", label: "Cadres administratifs et commerciaux d'entreprise" },
  { value: "38", label: "Ingénieurs et cadres techniques d'entreprise" },
  { value: "42", label: "Professeurs des écoles, instituteurs et assimilés" },
  { value: "43", label: "Professions intermédiaires de la santé et du travail social" },
  { value: "44", label: "Clergé, religieux" },
  { value: "45", label: "Professions intermédiaires administratives de la fonction publique" },
  { value: "46", label: "Professions intermédiaires administratives et commerciales des entreprises" },
  { value: "47", label: "Techniciens" },
  { value: "48", label: "Contrémaîtres, agents de maîtrise" },
  { value: "52", label: "Employés civils et agents de service de la fonction publique" },
  { value: "53", label: "Policiers et militaires" },
  { value: "54", label: "Employés administratifs d'entreprise" },
  { value: "55", label: "Employés de commerce" },
  { value: "56", label: "Personnels des services directs aux particuliers" },
  { value: "62", label: "Ouvriers qualifiés de type industriel" },
  { value: "63", label: "Ouvriers qualifiés de type artisanal" },
  { value: "64", label: "Chauffeurs" },
  { value: "65", label: "Ouvriers qualifiés de la manutention, du magasinage et du transport" },
  { value: "67", label: "Ouvriers non qualifiés de type industriel" },
  { value: "68", label: "Ouvriers non qualifiés de type artisanal" },
  { value: "69", label: "Ouvriers agricoles" },
  { value: "71", label: "Anciens agriculteurs exploitants" },
  { value: "72", label: "Anciens artisans, commerçants, chefs d'entreprise" },
  { value: "74", label: "Anciens cadres" },
  { value: "75", label: "Anciennes professions intermédiaires" },
  { value: "77", label: "Anciens employés" },
  { value: "78", label: "Anciens ouvriers" },
  { value: "81", label: "Chômeurs n'ayant jamais travaillé" },
  { value: "83", label: "Militaires du contingent" },
  { value: "84", label: "Elèves, étudiants" },
  { value: "85", label: "Personnes diverses sans activité professionnelle de moins de 60 ans" },
  { value: "86", label: "Personnes diverses sans activité professionnelle de 60 ans et plus" },
]

interface CSPComboboxProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CSPCombobox({
  value,
  onValueChange,
  placeholder = "Sélectionner une CSP...",
  disabled = false,
  className,
}: CSPComboboxProps) {
  const [open, setOpen] = React.useState(false)
  
  // S'assurer que la valeur n'est jamais undefined pour éviter l'erreur de changement controlled/uncontrolled
  const safeValue = value || ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          {safeValue
            ? cspOptions.find((option) => option.value === safeValue)?.label || "CSP inconnue"
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Rechercher une CSP..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucune CSP trouvée.</CommandEmpty>
            <CommandGroup>
              {cspOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === safeValue ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-sm font-medium">{option.value}</span>
                    <span>{option.label}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      safeValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
