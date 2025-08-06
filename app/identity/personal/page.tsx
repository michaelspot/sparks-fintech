"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Plus, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils"
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

const LOCAL_STORAGE_KEY = "identityPersonalInfo"

// Interface pour les communes de l'API française
interface Commune {
  nom: string
  code: string
  codeDepartement: string
  siren: string
  codeEpci: string
  codeRegion: string
  codesPostaux: string[]
  population: number
}

// Fonction pour formatter le texte en Title Case (première lettre majuscule)
const formatTitleCase = (text: string): string => {
  if (!text) return text
  // Autoriser seulement les lettres, espaces et tirets
  const cleanText = text.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '')
  return cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase()
}

// Fonction pour formatter le texte en MAJUSCULES
const formatUpperCase = (text: string): string => {
  if (!text) return text
  // Autoriser seulement les lettres, espaces et tirets
  const cleanText = text.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '')
  return cleanText.toUpperCase()
}

// Fonction pour calculer l'âge à partir d'une date de naissance
const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Fonction pour récupérer les communes à partir d'un code postal
const fetchCommunes = async (postalCode: string): Promise<Commune[]> => {
  if (!postalCode || postalCode.length !== 5) return []
  try {
    const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${postalCode}`)
    if (!response.ok) return []
    const communes: Commune[] = await response.json()
    return communes
  } catch (error) {
    console.error('Erreur lors de la récupération des communes:', error)
    return []
  }
}

// Données CSP
const cspOptions = [
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
];

// Données des nationalités (principaux pays)
const nationalityOptions = [
  { value: "afghane", label: "Afghane" },
  { value: "albanaise", label: "Albanaise" },
  { value: "algerienne", label: "Algérienne" },
  { value: "allemande", label: "Allemande" },
  { value: "americaine", label: "Américaine" },
  { value: "andorrane", label: "Andorrane" },
  { value: "angolaise", label: "Angolaise" },
  { value: "antiguaise", label: "Antiguaise" },
  { value: "argentine", label: "Argentine" },
  { value: "armenienne", label: "Arménienne" },
  { value: "australienne", label: "Australienne" },
  { value: "autrichienne", label: "Autrichienne" },
  { value: "azerbaidjanaise", label: "Azerbaïdjanaise" },
  { value: "bahamienne", label: "Bahamienne" },
  { value: "bahreinienne", label: "Bahreïnienne" },
  { value: "bangladaise", label: "Bangladaise" },
  { value: "barbadienne", label: "Barbadienne" },
  { value: "belge", label: "Belge" },
  { value: "belizienne", label: "Bélizienne" },
  { value: "beninoise", label: "Béninoise" },
  { value: "bhoutanaise", label: "Bhoutanaise" },
  { value: "bielorusse", label: "Biélorusse" },
  { value: "birmane", label: "Birmane" },
  { value: "bolivienne", label: "Bolivienne" },
  { value: "bosnienne", label: "Bosnienne" },
  { value: "botswanaise", label: "Botswanaise" },
  { value: "bresilienne", label: "Brésilienne" },
  { value: "britannique", label: "Britannique" },
  { value: "bruneienne", label: "Brunéienne" },
  { value: "bulgare", label: "Bulgare" },
  { value: "burkinabe", label: "Burkinabé" },
  { value: "burundaise", label: "Burundaise" },
  { value: "cambodgienne", label: "Cambodgienne" },
  { value: "camerounaise", label: "Camerounaise" },
  { value: "canadienne", label: "Canadienne" },
  { value: "cap-verdienne", label: "Cap-verdienne" },
  { value: "centrafricaine", label: "Centrafricaine" },
  { value: "chilienne", label: "Chilienne" },
  { value: "chinoise", label: "Chinoise" },
  { value: "chypriote", label: "Chypriote" },
  { value: "colombienne", label: "Colombienne" },
  { value: "comorienne", label: "Comorienne" },
  { value: "congolaise", label: "Congolaise" },
  { value: "costaricienne", label: "Costaricienne" },
  { value: "croate", label: "Croate" },
  { value: "cubaine", label: "Cubaine" },
  { value: "danoise", label: "Danoise" },
  { value: "djiboutienne", label: "Djiboutienne" },
  { value: "dominicaine", label: "Dominicaine" },
  { value: "egyptienne", label: "Égyptienne" },
  { value: "emirienne", label: "Émirienne" },
  { value: "equatorienne", label: "Équatorienne" },
  { value: "erythreenne", label: "Érythréenne" },
  { value: "espagnole", label: "Espagnole" },
  { value: "estonienne", label: "Estonienne" },
  { value: "ethiopienne", label: "Éthiopienne" },
  { value: "fidjienne", label: "Fidjienne" },
  { value: "finlandaise", label: "Finlandaise" },
  { value: "francaise", label: "Française" },
  { value: "gabonaise", label: "Gabonaise" },
  { value: "gambienne", label: "Gambienne" },
  { value: "georgienne", label: "Géorgienne" },
  { value: "ghaneenne", label: "Ghanéenne" },
  { value: "grecque", label: "Grecque" },
  { value: "grenadienne", label: "Grenadienne" },
  { value: "guatemalteque", label: "Guatémaltèque" },
  { value: "guineenne", label: "Guinéenne" },
  { value: "guyanienne", label: "Guyanienne" },
  { value: "haitienne", label: "Haïtienne" },
  { value: "hondurienne", label: "Hondurienne" },
  { value: "hongroise", label: "Hongroise" },
  { value: "indienne", label: "Indienne" },
  { value: "indonesienne", label: "Indonésienne" },
  { value: "irakienne", label: "Irakienne" },
  { value: "iranienne", label: "Iranienne" },
  { value: "irlandaise", label: "Irlandaise" },
  { value: "islandaise", label: "Islandaise" },
  { value: "israelienne", label: "Israélienne" },
  { value: "italienne", label: "Italienne" },
  { value: "ivoirienne", label: "Ivoirienne" },
  { value: "jamaicaine", label: "Jamaïcaine" },
  { value: "japonaise", label: "Japonaise" },
  { value: "jordanienne", label: "Jordanienne" },
  { value: "kazakhe", label: "Kazakhe" },
  { value: "kenyane", label: "Kényane" },
  { value: "kirghize", label: "Kirghize" },
  { value: "kiribatienne", label: "Kiribatienne" },
  { value: "koweitienne", label: "Koweïtienne" },
  { value: "laotienne", label: "Laotienne" },
  { value: "lesothane", label: "Lesothane" },
  { value: "lettone", label: "Lettone" },
  { value: "libanaise", label: "Libanaise" },
  { value: "liberienne", label: "Libérienne" },
  { value: "libyenne", label: "Libyenne" },
  { value: "liechtensteinoise", label: "Liechtensteinoise" },
  { value: "lituanienne", label: "Lituanienne" },
  { value: "luxembourgeoise", label: "Luxembourgeoise" },
  { value: "macedonienne", label: "Macédonienne" },
  { value: "malgache", label: "Malgache" },
  { value: "malaisienne", label: "Malaisienne" },
  { value: "malawienne", label: "Malawienne" },
  { value: "maldivienne", label: "Maldivienne" },
  { value: "malienne", label: "Malienne" },
  { value: "maltaise", label: "Maltaise" },
  { value: "marocaine", label: "Marocaine" },
  { value: "marshallaise", label: "Marshallaise" },
  { value: "mauricienne", label: "Mauricienne" },
  { value: "mauritanienne", label: "Mauritanienne" },
  { value: "mexicaine", label: "Mexicaine" },
  { value: "micronesienne", label: "Micronésienne" },
  { value: "moldave", label: "Moldave" },
  { value: "monegasque", label: "Monégasque" },
  { value: "mongole", label: "Mongole" },
  { value: "montenegrine", label: "Monténégrine" },
  { value: "mozambicaine", label: "Mozambicaine" },
  { value: "namibienne", label: "Namibienne" },
  { value: "nauruane", label: "Nauruane" },
  { value: "nepalaise", label: "Népalaise" },
  { value: "nicaraguayenne", label: "Nicaraguayenne" },
  { value: "nigeriane", label: "Nigériane" },
  { value: "nigerienne", label: "Nigérienne" },
  { value: "nord-coreenne", label: "Nord-coréenne" },
  { value: "norvegienne", label: "Norvégienne" },
  { value: "neo-zelandaise", label: "Néo-zélandaise" },
  { value: "omanaise", label: "Omanaise" },
  { value: "ougandaise", label: "Ougandaise" },
  { value: "ouzbeke", label: "Ouzbèke" },
  { value: "pakistanaise", label: "Pakistanaise" },
  { value: "palau", label: "Palau" },
  { value: "palestinienne", label: "Palestinienne" },
  { value: "panameenne", label: "Panaméenne" },
  { value: "papouane", label: "Papouane" },
  { value: "paraguayenne", label: "Paraguayenne" },
  { value: "peruvienne", label: "Péruvienne" },
  { value: "philippine", label: "Philippine" },
  { value: "polonaise", label: "Polonaise" },
  { value: "portugaise", label: "Portugaise" },
  { value: "qatarienne", label: "Qatarienne" },
  { value: "roumaine", label: "Roumaine" },
  { value: "russe", label: "Russe" },
  { value: "rwandaise", label: "Rwandaise" },
  { value: "saint-marinaise", label: "Saint-marinaise" },
  { value: "salvadorienne", label: "Salvadorienne" },
  { value: "samoane", label: "Samoane" },
  { value: "saoudienne", label: "Saoudienne" },
  { value: "senegalaise", label: "Sénégalaise" },
  { value: "serbe", label: "Serbe" },
  { value: "seychelloise", label: "Seychelloise" },
  { value: "sierra-leonaise", label: "Sierra-léonaise" },
  { value: "singapourienne", label: "Singapourienne" },
  { value: "slovaque", label: "Slovaque" },
  { value: "slovene", label: "Slovène" },
  { value: "solomonaise", label: "Solomonaise" },
  { value: "somalienne", label: "Somalienne" },
  { value: "soudanaise", label: "Soudanaise" },
  { value: "sri-lankaise", label: "Sri-lankaise" },
  { value: "sud-africaine", label: "Sud-africaine" },
  { value: "sud-coreenne", label: "Sud-coréenne" },
  { value: "suedoise", label: "Suédoise" },
  { value: "suisse", label: "Suisse" },
  { value: "surinamaise", label: "Surinamaise" },
  { value: "swazie", label: "Swazie" },
  { value: "syrienne", label: "Syrienne" },
  { value: "tadjike", label: "Tadjike" },
  { value: "tanzanienne", label: "Tanzanienne" },
  { value: "tchadienne", label: "Tchadienne" },
  { value: "tcheque", label: "Tchèque" },
  { value: "thailandaise", label: "Thaïlandaise" },
  { value: "timoraise", label: "Timoraise" },
  { value: "togolaise", label: "Togolaise" },
  { value: "tongienne", label: "Tongienne" },
  { value: "trinidadienne", label: "Trinidadienne" },
  { value: "tunisienne", label: "Tunisienne" },
  { value: "turkmene", label: "Turkmène" },
  { value: "turque", label: "Turque" },
  { value: "tuvaluane", label: "Tuvaluane" },
  { value: "ukrainienne", label: "Ukrainienne" },
  { value: "uruguayenne", label: "Uruguayenne" },
  { value: "vanuataise", label: "Vanuataise" },
  { value: "venezuelienne", label: "Vénézuélienne" },
  { value: "vietnamienne", label: "Vietnamienne" },
  { value: "yemenite", label: "Yéménite" },
  { value: "zambienne", label: "Zambienne" },
  { value: "zimbabweenne", label: "Zimbabwéenne" },
];

// Composant CSP Combobox
function CSPCombobox({ value, onChange, placeholder = "Sélectionner..." }: { value: string, onChange: (value: string) => void, placeholder?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? cspOptions.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0">
        <Command>
          <CommandInput placeholder="Rechercher une CSP..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucune CSP trouvée.</CommandEmpty>
            <CommandGroup>
              {cspOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  keywords={[option.label, option.value]}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0"
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

// Composant Nationalité Combobox
function NationalityCombobox({ value, onChange, placeholder = "Sélectionner..." }: { value: string, onChange: (value: string) => void, placeholder?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? nationalityOptions.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Rechercher une nationalité..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucune nationalité trouvée.</CommandEmpty>
            <CommandGroup>
              {nationalityOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  keywords={[option.label, option.value]}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0"
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

// Type pour un enfant
type Child = {
  firstName: string;
  lastName: string;
  birthDate: string;
  parentage: "propre_parent1" | "propre_parent2" | "commun" | "";
};

type FormData = {
  title: string;
  firstName: string;
  lastName: string;
  birthName: string;
  spouseTitle: string;
  spouseFirstName: string;
  spouseLastName: string;
  spouseBirthName: string;
  birthDate: string;
  spouseBirthDate: string;
  age: string;
  spouseAge: string;
  birthPostalCode: string;
  spouseBirthPostalCode: string;
  city: string;
  spouseCity: string;
  country: string;
  spouseCountry: string;
  nationality: string;
  spouseNationality: string;
  legalCapacity: string;
  spouseLegalCapacity: string;
  mifClassification: string;
  maritalStatus: string;
  marriageDate: string;
  marriagePlace: string;
  matrimonialRegime: string;
  children: Child[];

  liberalities: string;
  liberalitiesAmount: string;
  lastWillDonation: string;
  lastWillDonationType: string;
  spouseLastWillDonation: string;
  spouseLastWillDonationType: string;
  profession: string;
  spouseProfession: string;
  company: string;
  spouseCompany: string;
  csp: string;
  spouseCsp: string;
  retirementAge: string;
  spouseRetirementAge: string;
};

export default function PersonalInfoPage() {
  // États pour la gestion de l'interface
  const [showChildPanel, setShowChildPanel] = useState<boolean>(false);
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(null);

  // État pour les données du formulaire
  const [formData, setFormData] = useState<FormData>({
    title: "",
    firstName: "",
    lastName: "",
    birthName: "", // Nouveau champ: Nom de naissance
    spouseTitle: "",
    spouseFirstName: "",
    spouseLastName: "",
    spouseBirthName: "", // Nouveau champ: Nom de naissance du conjoint
    birthDate: "",
    spouseBirthDate: "",
    age: "",
    spouseAge: "",
    birthPostalCode: "", // Remplace birthPlace
    spouseBirthPostalCode: "", // Remplace spouseBirthPlace
    city: "",
    spouseCity: "",
    country: "France",
    spouseCountry: "France",
    nationality: "Française",
    spouseNationality: "Française",
    legalCapacity: "",
    spouseLegalCapacity: "",
    mifClassification: "non-professionnel", // Nouveau champ: Classification MIF
    maritalStatus: "",
    marriageDate: "",
    marriagePlace: "",
    matrimonialRegime: "",
    children: [] as Child[], // Nouveau champ: Liste des enfants

    liberalities: "", // Nouveau champ: Libéralités
    liberalitiesAmount: "", // Nouveau champ: Montant des libéralités
    lastWillDonation: "", // Renommé de lastWillBenefit
    lastWillDonationType: "", // Nouveau champ: Type de donation au dernier vivant
    spouseLastWillDonation: "", // Renommé de spouseLastWillBenefit
    spouseLastWillDonationType: "", // Nouveau champ: Type de donation au dernier vivant du conjoint
    profession: "",
    spouseProfession: "",
    company: "",
    spouseCompany: "",
    csp: "",
    spouseCsp: "",
    retirementAge: "",
    spouseRetirementAge: "",
  })

  // États pour les communes
  const [communes, setCommunes] = useState<Commune[]>([])
  const [spouseCommunes, setSpouseCommunes] = useState<Commune[]>([])
  const [loadingCommunes, setLoadingCommunes] = useState(false)
  const [loadingSpouseCommunes, setLoadingSpouseCommunes] = useState(false)

  // Fonction pour charger les communes en fonction du code postal
  const loadCommunesForPostalCode = async (postalCode: string, isSpouse: boolean) => {
    if (isSpouse) {
      setLoadingSpouseCommunes(true)
    } else {
      setLoadingCommunes(true)
    }
    
    try {
      const communesData = await fetchCommunes(postalCode)
      if (isSpouse) {
        setSpouseCommunes(communesData)
      } else {
        setCommunes(communesData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des communes:', error)
    } finally {
      if (isSpouse) {
        setLoadingSpouseCommunes(false)
      } else {
        setLoadingCommunes(false)
      }
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        
        // Assurer que le tableau d'enfants existe et est correctement initialisé
        if (!Array.isArray(parsedData.children)) {
          parsedData.children = []
        } else {
          // Assurer que chaque enfant a un champ parentage
          parsedData.children = parsedData.children.map((child: Partial<Child>) => ({
            ...child,
            parentage: child.parentage || ""
          }))
        }
        
        // Assurer que le nombre d'enfants correspond au tableau d'enfants
        if (parsedData.childrenCount !== parsedData.children.length.toString()) {
          parsedData.childrenCount = parsedData.children.length.toString()
        }
        

        
        setFormData(parsedData)
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value
    
    // Appliquer les formatages selon le champ
    const upperCaseFields = ['lastName', 'spouseLastName', 'birthName', 'spouseBirthName']
    const titleCaseFields = ['firstName', 'spouseFirstName', 'country', 'spouseCountry', 'marriagePlace', 'profession', 'spouseProfession']
    
    if (upperCaseFields.includes(field)) {
      processedValue = formatUpperCase(value)
    } else if (titleCaseFields.includes(field)) {
      processedValue = formatTitleCase(value)
    }
    
    const newFormData = { ...formData, [field]: processedValue }
    
    // Calculer automatiquement l'âge quand la date de naissance change
    if (field === 'birthDate' && processedValue) {
      const age = calculateAge(processedValue)
      newFormData.age = age.toString()
    }
    
    if (field === 'spouseBirthDate' && processedValue) {
      const age = calculateAge(processedValue)
      newFormData.spouseAge = age.toString()
    }
    
    // Charger les communes quand le code postal change
    if (field === 'birthPostalCode' && processedValue.length === 5) {
      loadCommunesForPostalCode(processedValue, false)
    }
    
    if (field === 'spouseBirthPostalCode' && processedValue.length === 5) {
      loadCommunesForPostalCode(processedValue, true)
    }
    
    setFormData(newFormData)
    
    // Sauvegarde automatique après chaque modification
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFormData))
    }
  }
  
  // Fonction pour mettre à jour les données d'un enfant spécifique
  const handleChildChange = (index: number, field: string, value: string) => {
    const newChildren = [...formData.children]
    newChildren[index] = {
      ...newChildren[index],
      [field]: value
    }
    
    const newFormData = { ...formData, children: newChildren }
    setFormData(newFormData)
    
    // Sauvegarde automatique
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFormData))
    }
  }
  
  // Fonction pour calculer l'âge à partir d'une date de naissance
  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return ""
    
    const today = new Date()
    const birth = new Date(birthDate)
    
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age.toString()
  }

  // Ajouter un enfant
  const addChild = () => {
    setFormData(prev => {
      const childNumber = prev.children.length + 1;
      const newChildren = [...prev.children, { 
        firstName: `Enfant ${childNumber}`, 
        lastName: prev.lastName || "", // Hérite du nom de famille par défaut
        birthDate: "", 
        parentage: "commun" as "commun" | "propre_parent1" | "propre_parent2" | "" 
      }];
      const newFormData = { ...prev, children: newChildren };
      // Sauvegarde automatique
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFormData));
      }
      return newFormData;
    });
    
    // Ouvrir automatiquement le panneau d'édition pour le nouvel enfant
    setTimeout(() => {
      const newIndex = formData.children.length;
      selectChildForEdit(newIndex);
    }, 100);
  };

  // Sauvegarder les données dans le localStorage
  const saveChildData = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    }
    setShowChildPanel(false);
    setEditingChildIndex(null);
  };

  // Sélectionner un enfant pour l'édition
  const selectChildForEdit = (index: number) => {
    setEditingChildIndex(index);
    setShowChildPanel(true);
  };

  // Supprimer un enfant
  const removeChild = (index: number) => {
    setFormData(prev => {
      const newChildren = [...prev.children];
      newChildren.splice(index, 1);
      const newFormData = { ...prev, children: newChildren };
      
      // Sauvegarde automatique
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFormData));
      }
      
      return newFormData;
    });
    
    // Fermer le panneau d'édition
    setShowChildPanel(false);
    setEditingChildIndex(null);
  };

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
                <BreadcrumbPage>Informations personnelles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="space-y-6">
          {/* Généralités */}
          <Card>
            <CardHeader>
              <CardTitle>Généralités</CardTitle>
              <CardDescription>Informations personnelles de base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Select value={formData.title} onValueChange={(value) => handleInputChange("title", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Monsieur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monsieur">Monsieur</SelectItem>
                        <SelectItem value="madame">Madame</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-title">Titre du conjoint</Label>
                    <Select
                      value={formData.spouseTitle}
                      onValueChange={(value) => handleInputChange("spouseTitle", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Madame" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monsieur">Monsieur</SelectItem>
                        <SelectItem value="madame">Madame</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-firstName">Prénom du conjoint</Label>
                    <Input
                      id="spouse-firstName"
                      placeholder="Jeanne"
                      value={formData.spouseFirstName}
                      onChange={(e) => handleInputChange("spouseFirstName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-lastName">Nom du conjoint</Label>
                    <Input
                      id="spouse-lastName"
                      placeholder="Dupont"
                      value={formData.spouseLastName}
                      onChange={(e) => handleInputChange("spouseLastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthName">Nom de naissance</Label>
                    <Input
                      id="birthName"
                      placeholder="Nom de naissance"
                      value={formData.birthName}
                      onChange={(e) => handleInputChange("birthName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-birthName">Nom de naissance du conjoint</Label>
                    <Input
                      id="spouse-birthName"
                      placeholder="Nom de naissance du conjoint"
                      value={formData.spouseBirthName}
                      onChange={(e) => handleInputChange("spouseBirthName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-birthDate">Date de naissance du conjoint</Label>
                    <Input
                      id="spouse-birthDate"
                      type="date"
                      value={formData.spouseBirthDate}
                      onChange={(e) => handleInputChange("spouseBirthDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Âge (calculé automatiquement)</Label>
                    <Input
                      id="age"
                      placeholder="Calculé à partir de la date de naissance"
                      value={formData.age}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-age">Âge du conjoint (calculé automatiquement)</Label>
                    <Input
                      id="spouse-age"
                      placeholder="Calculé à partir de la date de naissance"
                      value={formData.spouseAge}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthPostalCode">Code postal de naissance</Label>
                    <Input
                      id="birthPostalCode"
                      placeholder="75001"
                      value={formData.birthPostalCode}
                      onChange={(e) => handleInputChange("birthPostalCode", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-birthPostalCode">Code postal de naissance du conjoint</Label>
                    <Input
                      id="spouse-birthPostalCode"
                      placeholder="69001"
                      value={formData.spouseBirthPostalCode}
                      onChange={(e) => handleInputChange("spouseBirthPostalCode", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Commune de naissance</Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(value) => handleInputChange("city", value)}
                      disabled={communes.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          loadingCommunes 
                            ? "Chargement..." 
                            : communes.length === 0 
                              ? "Entrez d'abord un code postal" 
                              : "Sélectionner une commune"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {communes.map((commune) => (
                          <SelectItem key={commune.code} value={commune.nom}>
                            {commune.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-city">Commune de naissance du conjoint</Label>
                    <Select
                      value={formData.spouseCity}
                      onValueChange={(value) => handleInputChange("spouseCity", value)}
                      disabled={spouseCommunes.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          loadingSpouseCommunes 
                            ? "Chargement..." 
                            : spouseCommunes.length === 0 
                              ? "Entrez d'abord un code postal" 
                              : "Sélectionner une commune"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {spouseCommunes.map((commune) => (
                          <SelectItem key={commune.code} value={commune.nom}>
                            {commune.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      placeholder="France"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-country">Pays du conjoint</Label>
                    <Input
                      id="spouse-country"
                      placeholder="France"
                      value={formData.spouseCountry}
                      onChange={(e) => handleInputChange("spouseCountry", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationalité</Label>
                    <NationalityCombobox 
                      value={formData.nationality} 
                      onChange={(value) => handleInputChange("nationality", value)}
                      placeholder="Sélectionner une nationalité"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-nationality">Nationalité du conjoint</Label>
                    <NationalityCombobox 
                      value={formData.spouseNationality} 
                      onChange={(value) => handleInputChange("spouseNationality", value)}
                      placeholder="Sélectionner une nationalité"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="legalCapacity">Capacité juridique</Label>
                    <Select
                      value={formData.legalCapacity}
                      onValueChange={(value) => handleInputChange("legalCapacity", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Majeur capable" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="majeur-capable">Majeur capable</SelectItem>
                        <SelectItem value="majeur-protege">Majeur protégé</SelectItem>
                        <SelectItem value="mineur">Mineur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-legalCapacity">Capacité juridique du conjoint</Label>
                    <Select
                      value={formData.spouseLegalCapacity}
                      onValueChange={(value) => handleInputChange("spouseLegalCapacity", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="majeur-capable">Majeur capable</SelectItem>
                        <SelectItem value="majeur-protege">Majeur protégé</SelectItem>
                        <SelectItem value="mineur">Mineur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mifClassification">Classification MIF</Label>
                    <Select
                      value={formData.mifClassification}
                      onValueChange={(value) => handleInputChange("mifClassification", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Non-professionnel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non-professionnel">Non-professionnel</SelectItem>
                        <SelectItem value="professionnel">Professionnel</SelectItem>
                        <SelectItem value="contrepartie-eligible">Contrepartie éligible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Situation Familiale */}
          <Card>
            <CardHeader>
              <CardTitle>Situation Familiale</CardTitle>
              <CardDescription>Informations sur votre situation matrimoniale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Situation familiale</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => handleInputChange("maritalStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Marié(e)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marie">Marié(e)</SelectItem>
                      <SelectItem value="celibataire">Célibataire</SelectItem>
                      <SelectItem value="divorce">Divorcé(e)</SelectItem>
                      <SelectItem value="veuf">Veuf/Veuve</SelectItem>
                      <SelectItem value="pacs">Pacsé(e)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marriageDate">Date de mariage / PACS</Label>
                  <Input
                    id="marriageDate"
                    type="date"
                    value={formData.marriageDate}
                    onChange={(e) => handleInputChange("marriageDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marriagePlace">Lieu de mariage / PACS</Label>
                  <Input
                    id="marriagePlace"
                    placeholder="Paris"
                    value={formData.marriagePlace}
                    onChange={(e) => handleInputChange("marriagePlace", e.target.value)}
                  />
                </div>
              </div>
              
              {/* Régime matrimonial conditionnel en fonction de la situation familiale */}
              {(formData.maritalStatus === "marie" || formData.maritalStatus === "pacs") && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matrimonialRegime">
                      {formData.maritalStatus === "marie" ? "Régime matrimonial" : "Convention de PACS"}
                    </Label>
                    <Select
                      value={formData.matrimonialRegime}
                      onValueChange={(value) => handleInputChange("matrimonialRegime", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.maritalStatus === "marie" ? (
                          <>
                            <SelectItem value="communaute-reduite">Communauté réduite aux acquêts (depuis 1er février 1966)</SelectItem>
                            <SelectItem value="communaute-biens">Communauté de biens (avant 1er février 1966)</SelectItem>
                            <SelectItem value="separation-biens">Séparation de biens</SelectItem>
                            <SelectItem value="participation-acquets">Participation aux acquêts</SelectItem>
                            <SelectItem value="communaute-universelle">Communauté universelle</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="indivision">Régime de l'indivision</SelectItem>
                            <SelectItem value="separation">Régime de séparation</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              

              
              {/* Section des enfants */}
              <div className="space-y-4 mt-4">
                <Label>Informations sur les enfants</Label>
                
                {/* Bouton pour ajouter un enfant */}
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChild}
                    id="add-child"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Ajouter un enfant
                  </Button>
                </div>
                
                {/* Organigram pour visualiser les relations */}
                {formData.children.length > 0 && (
                    <div className="mb-4 p-4 border rounded-md bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">Relations familiales</h4>
                      
                      <div className="relative">
                        {/* Grouper les enfants par type de parenté */}
                        {(() => {
                          const commonChildren = formData.children.filter(child => child.parentage === "commun");
                          const parent1Children = formData.children.filter(child => child.parentage === "propre_parent1");
                          const parent2Children = formData.children.filter(child => child.parentage === "propre_parent2");
                          
                          return (
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                              {/* Enfants du Parent 1 */}
                              {parent1Children.length > 0 && (
                                <div className="flex flex-col items-center mb-4">
                                  {/* Parent 1 */}
                                  <div className="mb-2">
                                    <div className="text-center p-2 rounded-md bg-blue-600 text-white font-medium w-[100px]">
                                      {formData.firstName}
                                    </div>
                                  </div>
                                  {/* Ligne verticale */}
                                  <div className="w-0.5 h-6 bg-blue-600"></div>
                                  {/* Enfants du Parent 1 */}
                                  <div className="flex flex-col items-center">
                                    {parent1Children.map((child, idx) => (
                                      <div key={`p1-${idx}`} 
                                           onClick={() => selectChildForEdit(formData.children.findIndex(c => c === child))}
                                           className="text-center p-2 rounded-md bg-blue-600 text-white font-medium w-[100px] my-1 cursor-pointer hover:bg-blue-700 transition-colors relative group">
                                           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md flex items-center justify-center transition-all">
                                             <span className="opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-70 text-white px-2 py-1 rounded transition-opacity">Modifier</span>
                                           </div>
                                         <div>{child.firstName || "Sans nom"}</div>
                                         <div className="text-xs">
                                           {calculateAge(child.birthDate) || "--"} ans
                                         </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Enfants Communs */}
                              {commonChildren.length > 0 && (
                                <div className="flex flex-col items-center mb-4">
                                  {/* Parents communs */}
                                  <div className="mb-2">
                                    <div className="text-center p-2 rounded-md bg-blue-600 text-white font-medium w-[150px]">
                                      {formData.firstName && formData.spouseFirstName 
                                        ? `${formData.firstName} et ${formData.spouseFirstName}` 
                                        : formData.firstName || formData.spouseFirstName || "Parents"}
                                    </div>
                                  </div>
                                  {/* Structure pour les enfants communs */}
                                  <div className="relative w-full">
                                    {/* Ligne verticale centrale */}
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-blue-600"></div>
                                    {/* Ligne horizontale pour les connexions */}
                                    {commonChildren.length > 1 && (
                                      <div className="absolute top-6 left-0 right-0 h-0.5 bg-blue-600"></div>
                                    )}
                                    {/* Lignes verticales vers chaque enfant */}
                                    <div className="flex justify-center gap-4 pt-6">
                                      {commonChildren.map((child, idx) => (
                                        <div key={`common-${idx}`} className="flex flex-col items-center">
                                          {commonChildren.length > 1 && (
                                            <div className="w-0.5 h-3 bg-blue-600"></div>
                                          )}
                                          <div 
                                            onClick={() => selectChildForEdit(formData.children.findIndex(c => c === child))}
                                            className="text-center p-2 rounded-md bg-blue-600 text-white font-medium w-[100px] cursor-pointer hover:bg-blue-700 transition-colors relative group">
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md flex items-center justify-center transition-all">
                                              <span className="opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-70 text-white px-2 py-1 rounded transition-opacity">Modifier</span>
                                            </div>
                                            <div>{child.firstName || "Sans nom"}</div>
                                            <div className="text-xs">
                                              {calculateAge(child.birthDate) || "--"} ans
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Enfants du Parent 2 */}
                              {parent2Children.length > 0 && (
                                <div className="flex flex-col items-center mb-4">
                                  {/* Parent 2 */}
                                  <div className="mb-2">
                                    <div className="text-center p-2 rounded-md bg-blue-600 text-white font-medium w-[100px]">
                                      {formData.spouseFirstName}
                                    </div>
                                  </div>
                                  {/* Ligne verticale */}
                                  <div className="w-0.5 h-6 bg-blue-600"></div>
                                  {/* Enfants du Parent 2 */}
                                  <div className="flex flex-col items-center">
                                    {parent2Children.map((child, idx) => (
                                      <div 
                                        key={`p2-${idx}`} 
                                        onClick={() => selectChildForEdit(formData.children.findIndex(c => c === child))}
                                        className="text-center p-2 rounded-md bg-blue-600 text-white font-medium w-[100px] my-1 cursor-pointer hover:bg-blue-700 transition-colors relative group">
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md flex items-center justify-center transition-all">
                                          <span className="opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-70 text-white px-2 py-1 rounded transition-opacity">Modifier</span>
                                        </div>
                                         <div>{child.firstName || "Sans nom"}</div>
                                         <div className="text-xs">
                                           {calculateAge(child.birthDate) || "--"} ans
                                         </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* Panneau latéral pour l'édition d'un enfant */}
                  {showChildPanel && editingChildIndex !== null && editingChildIndex < formData.children.length && (
                    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-4 z-50 overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Modifier l'enfant</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowChildPanel(false);
                            setEditingChildIndex(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="child-firstname" className="text-sm">Prénom</Label>
                          <Input
                            id="child-firstname"
                            value={formData.children[editingChildIndex]?.firstName || ""}
                            onChange={(e) => handleChildChange(editingChildIndex, "firstName", e.target.value)}
                            placeholder="Prénom"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="child-birthdate" className="text-sm">Date de naissance</Label>
                          <Input
                            id="child-birthdate"
                            type="date"
                            value={formData.children[editingChildIndex]?.birthDate || ""}
                            onChange={(e) => handleChildChange(editingChildIndex, "birthDate", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="child-relation" className="text-sm">Parenté</Label>
                          <Select
                            value={formData.children[editingChildIndex]?.parentage || ""}
                            onValueChange={(value) => handleChildChange(editingChildIndex, "parentage", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="commun">Commun</SelectItem>
                              {formData.firstName && (
                                <SelectItem value="propre_parent1">Propre à {formData.firstName}</SelectItem>
                              )}
                              {formData.spouseFirstName && (
                                <SelectItem value="propre_parent2">Propre à {formData.spouseFirstName}</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                          <Button
                            type="button"
                            onClick={saveChildData}
                            className="flex-1"
                          >
                            Enregistrer
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => removeChild(editingChildIndex)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              
              {/* Libéralités faites */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liberalities">Libéralités faites</Label>
                  <Input
                    id="liberalities"
                    placeholder="Détails des libéralités"
                    value={formData.liberalities}
                    onChange={(e) => handleInputChange("liberalities", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liberalitiesAmount">Montant (€)</Label>
                  <Input
                    id="liberalitiesAmount"
                    type="number"
                    placeholder="0"
                    value={formData.liberalitiesAmount}
                    onChange={(e) => handleInputChange("liberalitiesAmount", e.target.value)}
                  />
                </div>
              </div>
              
              {/* Donation au dernier vivant */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastWillDonation">Donation au dernier vivant</Label>
                  <Select
                    value={formData.lastWillDonation}
                    onValueChange={(value) => handleInputChange("lastWillDonation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oui">Oui</SelectItem>
                      <SelectItem value="non">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Type de donation au dernier vivant (si oui) */}
              {formData.lastWillDonation === "oui" && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastWillDonationType">Type de donation au dernier vivant</Label>
                    <Select
                      value={formData.lastWillDonationType}
                      onValueChange={(value) => handleInputChange("lastWillDonationType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="choix-deces">Choix laissé lors du décès</SelectItem>
                        <SelectItem value="usufruit-total">Totalité en usufruit</SelectItem>
                        <SelectItem value="usufruit-partiel">¾ en usufruit et ¼ en pleine propriété</SelectItem>
                        <SelectItem value="quotite-disponible">Quotité disponible en pleine propriété</SelectItem>
                        <SelectItem value="pleine-propriete">Totalité en pleine propriété</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Situation Professionnelle */}
          <Card>
            <CardHeader>
              <CardTitle>Situation Professionnelle</CardTitle>
              <CardDescription>Informations sur votre activité professionnelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csp">Catégorie Socio-Professionnelle (CSP)</Label>
                    <CSPCombobox 
                      value={formData.csp} 
                      onChange={(value) => handleInputChange("csp", value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession actuelle</Label>
                    <Input
                      id="profession"
                      placeholder="Ingénieur"
                      value={formData.profession}
                      onChange={(e) => handleInputChange("profession", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise actuelle</Label>
                    <Input
                      id="company"
                      placeholder="Tech Corp"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retirementAge">Départ en retraite prévu à</Label>
                    <Input
                      id="retirementAge"
                      placeholder="65"
                      value={formData.retirementAge}
                      onChange={(e) => handleInputChange("retirementAge", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="spouseCsp">Catégorie Socio-Professionnelle (CSP) du conjoint</Label>
                    <CSPCombobox 
                      value={formData.spouseCsp} 
                      onChange={(value) => handleInputChange("spouseCsp", value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-profession">Profession actuelle du conjoint</Label>
                    <Input
                      id="spouse-profession"
                      placeholder="Profession du conjoint"
                      value={formData.spouseProfession}
                      onChange={(e) => handleInputChange("spouseProfession", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-company">Entreprise actuelle du conjoint</Label>
                    <Input
                      id="spouse-company"
                      placeholder="Entreprise du conjoint"
                      value={formData.spouseCompany}
                      onChange={(e) => handleInputChange("spouseCompany", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-retirementAge">Départ en retraite prévu à (conjoint)</Label>
                    <Input
                      id="spouse-retirementAge"
                      placeholder="65"
                      value={formData.spouseRetirementAge}
                      onChange={(e) => handleInputChange("spouseRetirementAge", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Les boutons d'enregistrement et d'annulation ont été supprimés, la sauvegarde est automatique */}
        </div>
      </div>
    </SidebarInset>
  )
}
