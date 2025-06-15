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
import { Trash2 } from "lucide-react"
import { CSPCombobox } from "@/components/ui/csp-combobox"

const LOCAL_STORAGE_KEY = "identityPersonalInfo"

// Type pour un enfant
type Child = {
  firstName: string;
  lastName: string;
  birthDate: string;
};

export default function PersonalInfoPage() {
  const [formData, setFormData] = useState({
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
    childrenCount: "0", // Nouveau champ: Nombre d'enfants
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        
        // Assurer que le tableau d'enfants existe et est correctement initialisé
        if (!Array.isArray(parsedData.children)) {
          parsedData.children = []
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
    const newFormData = { ...formData, [field]: value }
    
    // Gérer le nombre d'enfants
    if (field === "childrenCount") {
      const count = parseInt(value, 10) || 0
      
      // Ajuster le tableau d'enfants en fonction du nouveau nombre
      if (count > newFormData.children.length) {
        // Ajouter des enfants
        while (newFormData.children.length < count) {
          newFormData.children.push({
            firstName: "",
            lastName: "",
            birthDate: ""
          })
        }
      } else if (count < newFormData.children.length) {
        // Réduire le tableau d'enfants
        newFormData.children = newFormData.children.slice(0, count)
      }
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
                    <Label htmlFor="age">Âge</Label>
                    <Input
                      id="age"
                      placeholder="45"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-age">Âge du conjoint</Label>
                    <Input
                      id="spouse-age"
                      placeholder="42"
                      value={formData.spouseAge}
                      onChange={(e) => handleInputChange("spouseAge", e.target.value)}
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
                    <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Paris" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paris">Paris</SelectItem>
                        <SelectItem value="lyon">Lyon</SelectItem>
                        <SelectItem value="marseille">Marseille</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-city">Commune de naissance du conjoint</Label>
                    <Select
                      value={formData.spouseCity}
                      onValueChange={(value) => handleInputChange("spouseCity", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Entrez un code postal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paris">Paris</SelectItem>
                        <SelectItem value="lyon">Lyon</SelectItem>
                        <SelectItem value="marseille">Marseille</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
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
                    <Input
                      id="nationality"
                      placeholder="Française"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouse-nationality">Nationalité du conjoint</Label>
                    <Input
                      id="spouse-nationality"
                      placeholder="Française"
                      value={formData.spouseNationality}
                      onChange={(e) => handleInputChange("spouseNationality", e.target.value)}
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
              
              {/* Nombre d'enfants et champs dynamiques */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childrenCount">Nombre d'enfants</Label>
                  <Input
                    id="childrenCount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.childrenCount}
                    onChange={(e) => handleInputChange("childrenCount", e.target.value)}
                  />
                </div>
              </div>
              
              {/* Affichage dynamique des champs pour chaque enfant */}
              {formData.children.length > 0 && (
                <div className="space-y-6">
                  <Label>Informations sur les enfants</Label>
                  {formData.children.map((child, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Enfant {index + 1}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`child-firstName-${index}`}>Prénom</Label>
                          <Input
                            id={`child-firstName-${index}`}
                            value={child.firstName}
                            onChange={(e) => handleChildChange(index, "firstName", e.target.value)}
                            placeholder="Prénom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`child-lastName-${index}`}>Nom</Label>
                          <Input
                            id={`child-lastName-${index}`}
                            value={child.lastName}
                            onChange={(e) => handleChildChange(index, "lastName", e.target.value)}
                            placeholder="Nom"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`child-birthDate-${index}`}>Date de naissance</Label>
                          <Input
                            id={`child-birthDate-${index}`}
                            type="date"
                            value={child.birthDate}
                            onChange={(e) => handleChildChange(index, "birthDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Âge</Label>
                          <div className="h-10 px-3 flex items-center border rounded-md bg-muted/50">
                            {calculateAge(child.birthDate) || "--"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
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
                      onValueChange={(value) => handleInputChange("csp", value)}
                      placeholder="Sélectionner une CSP..."
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
                      onValueChange={(value) => handleInputChange("spouseCsp", value)}
                      placeholder="Sélectionner une CSP du conjoint..."
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
