import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Plus, Trash2, Settings } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Switch } from "../../ui/switch"
import { getCreditScoringFieldDefinitions } from "../../../redux/apis/apisCreditScoring"
import toast from "react-hot-toast"

const OPERATORS = [
  { value: "EQ", label: "Equal (=)" },
  { value: "GT", label: "Greater Than (>)" },
  { value: "GTE", label: "Greater or Equal (>=)" },
  { value: "LT", label: "Less Than (<)" },
  { value: "LTE", label: "Less or Equal (<=)" },
  { value: "BETWEEN", label: "Between" },
  { value: "IN", label: "In" },
]

interface CreditScoringTabProps {
  formData: any
  creditScoringFields: string[]
  creditScoringOperators: string[]
  isLoading: boolean
  onComplete: () => void
  onPrevious: () => void
  addCreditScoringCriteria: () => void
  removeCreditScoringCriteria: (id: string) => void
  updateCreditScoringCriteria: (id: string, field: string, value: any) => void
  addCreditScoringField: () => void
  removeCreditScoringField: (fieldId: string) => void
  updateCreditScoringFieldName: (fieldId: string, fieldName: string) => void
  addCreditScoringRule: (fieldId: string) => void
  removeCreditScoringRule: (fieldId: string, ruleId: string) => void
  updateCreditScoringRule: (fieldId: string, ruleId: string, field: string, value: any) => void
  updateFormData: (field: string, value: any) => void
  errors?: Record<string, string>
}

export default function CreditScoringTab({
  formData,
  isLoading,
  onComplete,
  onPrevious,
  addCreditScoringField,
  removeCreditScoringField,
  updateCreditScoringFieldName,
  addCreditScoringRule,
  removeCreditScoringRule,
  updateCreditScoringRule,
  updateFormData,
  errors = {},
}: CreditScoringTabProps) {
  const [fieldDefinitions, setFieldDefinitions] = useState<any[]>([])
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(false)

  useEffect(() => {
    loadFieldDefinitions()
  }, [])

  const loadFieldDefinitions = async () => {
    try {
      setIsLoadingDefinitions(true)
      const response = await getCreditScoringFieldDefinitions()
      const definitions = response?.data?.data || response?.data || []
      setFieldDefinitions(Array.isArray(definitions) ? definitions : [])
    } catch (error: any) {
      console.error("Failed to load field definitions:", error)
      toast.error("Failed to load credit scoring field definitions")
    } finally {
      setIsLoadingDefinitions(false)
    }
  }

  const handleFieldDefinitionChange = (creditFieldId: string, definitionId: string) => {
    const definition = fieldDefinitions.find((d: any) => String(d.id) === definitionId)
    if (definition) {
      const currentFields = Array.isArray(formData.credit_scoring_fields)
        ? formData.credit_scoring_fields
        : []
      const updatedFields = currentFields.map((f: any) =>
        f.id === creditFieldId
          ? { ...f, fieldDefinitionId: definition.id, field_name: definition.nameEn || definition.nameAr || "" }
          : f
      )
      updateFormData("credit_scoring_fields", updatedFields)
    }
  }

  const handleEnabledChange = (creditFieldId: string, enabled: boolean) => {
    const currentFields = Array.isArray(formData.credit_scoring_fields)
      ? formData.credit_scoring_fields
      : []
    const updatedFields = currentFields.map((f: any) =>
      f.id === creditFieldId ? { ...f, enabled } : f
    )
    updateFormData("credit_scoring_fields", updatedFields)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Credit Scoring Engine
              </CardTitle>
              <p className="mt-2 text-muted-foreground">
                Configure credit scoring criteria and rules for loan applications.
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={addCreditScoringField}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Scoring Field
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            {Array.isArray(formData.credit_scoring_fields) && formData.credit_scoring_fields.length > 0 ? (
              formData.credit_scoring_fields.map((creditField: any, fieldIndex: number) => (
              <Card key={creditField.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Criteria #{fieldIndex + 1}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={creditField.enabled !== false}
                          onCheckedChange={(checked) => handleEnabledChange(creditField.id, checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {creditField.enabled !== false ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      {formData.credit_scoring_fields.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCreditScoringField(creditField.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Credit Scoring Field</Label>
                      {isLoadingDefinitions ? (
                        <div className="h-10 bg-muted animate-pulse rounded" />
                      ) : (
                        <Select
                          value={creditField.fieldDefinitionId ? String(creditField.fieldDefinitionId) : ""}
                          onValueChange={(value) => handleFieldDefinitionChange(creditField.id, value)}
                        >
                          <SelectTrigger className={errors.name ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select a field definition" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldDefinitions.map((def: any) => (
                              <SelectItem key={def.id} value={String(def.id)}>
                                {def.nameEn || def.nameAr || def.fieldKey}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Custom Name</Label>
                      <Input
                        placeholder="Override display name"
                        value={creditField.field_name || ""}
                        onChange={(e) => updateCreditScoringFieldName(creditField.id, e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Rules</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Define operator, value, weight, and percentage for each rule
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addCreditScoringRule(creditField.id)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Rule
                    </Button>
                  </div>

                  {creditField.rules && creditField.rules.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded bg-muted/30">
                      No rules added. Click "Add Rule" to create scoring rules.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {creditField.rules && creditField.rules.map((rule: any) => (
                        <div
                          key={rule.id}
                          className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border rounded bg-background"
                        >
                          <div className="space-y-1">
                            <Label className="text-xs">Operator</Label>
                            <Select
                              value={rule.operator}
                              onValueChange={(value) =>
                                updateCreditScoringRule(creditField.id, rule.id, "operator", value)
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {OPERATORS.map((op) => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Value</Label>
                            <Input
                              placeholder={rule.operator === "BETWEEN" ? "e.g. 3000-7999" : "e.g. 750"}
                              value={rule.value}
                              onChange={(e) =>
                                updateCreditScoringRule(creditField.id, rule.id, "value", e.target.value)
                              }
                              className="h-9"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Weight</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              value={rule.weight}
                              onChange={(e) =>
                                updateCreditScoringRule(creditField.id, rule.id, "weight", Number(e.target.value))
                              }
                              placeholder="3.0"
                              className="h-9"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Percentage (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={rule.percentage ?? ""}
                              onChange={(e) =>
                                updateCreditScoringRule(creditField.id, rule.id, "percentage", Number(e.target.value))
                              }
                              placeholder="20.0"
                              className="h-9"
                            />
                          </div>

                          <div className="flex items-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCreditScoringRule(creditField.id, rule.id)}
                              className="text-destructive hover:text-destructive h-9"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded bg-background">
                No credit scoring criteria added. Click "Add Scoring Field" to create a new criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex justify-between gap-3 pt-4">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button onClick={onComplete} disabled={isLoading} className="gap-2">
          {isLoading ? "Saving..." : "Complete Settings"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
