"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface InputField {
  id: string
  label: string
  value: string | number
  type: "text" | "number" | "select" | "date" | "currency"
  options?: { value: string; label: string }[]
  unit?: string
  source?: "manual" | "imported"
  description?: string
  onChange?: (value: string | number) => void
  disabled?: boolean
}

interface OutputMetric {
  id: string
  label: string
  value: string | number
  type: "currency" | "percentage" | "number" | "text"
  highlighted?: boolean
  color?: "default" | "success" | "warning" | "destructive"
  description?: string
}

interface OutputChart {
  id: string
  title: string
  type: "bar" | "line" | "pie" | "area"
  data: any[]
  description?: string
}

interface SimulationTemplateProps {
  title: string
  description: string
  icon: LucideIcon
  inputSections: {
    title: string
    description?: string
    fields: InputField[]
  }[]
  outputSections: {
    title: string
    description?: string
    metrics?: OutputMetric[]
    charts?: OutputChart[]
  }[]
  children?: React.ReactNode
}

export function SimulationTemplate({
  title,
  description,
  icon: Icon,
  inputSections,
  outputSections,
  children
}: SimulationTemplateProps) {
  const renderInputField = (field: InputField) => {
    const baseClasses = "w-full p-2 border rounded-md"
    const disabledClasses = field.disabled ? "bg-gray-50 cursor-not-allowed" : ""

    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.unit && <span className="text-muted-foreground ml-1">({field.unit})</span>}
          </label>
          {field.source && (
            <Badge variant={field.source === "imported" ? "secondary" : "outline"} className="text-xs">
              {field.source === "imported" ? "Importé" : "Manuel"}
            </Badge>
          )}
        </div>
        {field.type === "select" ? (
          <select
            id={field.id}
            value={field.value}
            onChange={(e) => field.onChange?.(e.target.value)}
            disabled={field.disabled}
            className={`${baseClasses} ${disabledClasses}`}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={field.id}
            type={field.type === "currency" ? "number" : field.type}
            value={field.value}
            onChange={(e) => {
              const value = field.type === "number" || field.type === "currency" 
                ? Number(e.target.value) 
                : e.target.value
              field.onChange?.(value)
            }}
            disabled={field.disabled}
            className={`${baseClasses} ${disabledClasses}`}
            placeholder={field.type === "currency" ? "0" : ""}
          />
        )}
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
      </div>
    )
  }

  const renderOutputMetric = (metric: OutputMetric) => {
    const formatValue = (value: string | number, type: string) => {
      if (typeof value === "number") {
        switch (type) {
          case "currency":
            return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
          case "percentage":
            return `${value.toFixed(2)}%`
          case "number":
            return value.toLocaleString("fr-FR")
          default:
            return value.toString()
        }
      }
      return value
    }

    const getColorClasses = (color?: string, highlighted?: boolean) => {
      const base = highlighted ? "text-lg font-semibold" : "font-medium"
      switch (color) {
        case "success":
          return `${base} text-green-600`
        case "warning":
          return `${base} text-orange-600`
        case "destructive":
          return `${base} text-red-600`
        default:
          return base
      }
    }

    return (
      <div key={metric.id} className="flex justify-between items-start">
        <div className="flex-1">
          <span className="text-sm">{metric.label}</span>
          {metric.description && (
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          )}
        </div>
        <span className={getColorClasses(metric.color, metric.highlighted)}>
          {formatValue(metric.value, metric.type)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="grid gap-6 w-full lg:grid-cols-12">
        {/* Input Sections - Left Side */}
        <div className="lg:col-span-8 space-y-6">
          {inputSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map(renderInputField)}
                </div>
              </CardContent>
            </Card>
          ))}
          {children && <div>{children}</div>}
        </div>

        {/* Output Sections - Right Side */}
        <div className="lg:col-span-4 space-y-6">
          {outputSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {section.metrics && (
                  <div className="space-y-3">
                    {section.metrics.map((metric, idx) => (
                      <div key={metric.id}>
                        {renderOutputMetric(metric)}
                        {idx < section.metrics!.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                )}
                {section.charts && (
                  <div className="space-y-4 mt-4">
                    {section.charts.map((chart) => (
                      <div key={chart.id}>
                        <h4 className="text-sm font-medium mb-2">{chart.title}</h4>
                        {chart.description && (
                          <p className="text-xs text-muted-foreground mb-3">{chart.description}</p>
                        )}
                        {/* Placeholder for charts - can be replaced with actual chart components */}
                        <div className="h-32 border rounded-md flex items-center justify-center text-muted-foreground">
                          Graphique {chart.type} - {chart.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
