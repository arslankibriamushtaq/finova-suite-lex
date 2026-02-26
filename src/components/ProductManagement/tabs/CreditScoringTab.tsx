import { ArrowLeft, ArrowRight, Plus, Trash2, Settings } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

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
  creditScoringFields,
  creditScoringOperators,
  isLoading,
  onComplete,
  onPrevious,
  addCreditScoringCriteria,
  removeCreditScoringCriteria,
  updateCreditScoringCriteria,
  addCreditScoringField,
  removeCreditScoringField,
  updateCreditScoringFieldName,
  addCreditScoringRule,
  removeCreditScoringRule,
  updateCreditScoringRule,
  updateFormData,
  errors = {},
}: CreditScoringTabProps) {
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
                Configure credit scoring criteria and eligibility parameters for loan applications.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                List Credit Check
              </Button> */}
              {/* <Button onClick={addCreditScoringCriteria} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Criteria
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditScoringFields.map((field) => (
              <div key={field} className="space-y-2">
                <Label className="text-sm font-medium">
                  {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Label>
                <Select defaultValue="No data available">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No data available">No data available</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Required">Required</SelectItem>
                    <SelectItem value="Optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div> */}

          {/* Credit Scoring Fields Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Credit Scoring Fields
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure credit scoring fields and their rules for auto-approval
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={addCreditScoringField}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Scoring Fields
              </Button>
            </div>

            {Array.isArray(formData.credit_scoring_fields) && formData.credit_scoring_fields.length > 0 ? (
              formData.credit_scoring_fields.map((creditField: any, fieldIndex: number) => (
              <Card key={creditField.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Credit Scoring Field #{fieldIndex + 1}
                    </CardTitle>
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Credit Scoring Field Name</Label>
                    <Input
                      placeholder="Enter field name"
                      value={creditField.field_name || ""}
                      onChange={(e) => {
                        updateCreditScoringFieldName(creditField.id, e.target.value)
                      }}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Rules</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add rules for this credit scoring field
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
                    <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded bg-gray-50">
                      No rules added. Click "Add Rule" to create scoring rules.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {creditField.rules && creditField.rules.map((rule: any) => (
                        <div
                          key={rule.id}
                          className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded bg-white"
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
                                {creditScoringOperators.map((op) => (
                                  <SelectItem key={op} value={op}>
                                    {op}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Value</Label>
                            <Input
                              placeholder="e.g., 750 or Not Available"
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
                              min="0"
                              max="100"
                              value={rule.weight}
                              onChange={(e) =>
                                updateCreditScoringRule(creditField.id, rule.id, "weight", Number(e.target.value))
                              }
                              placeholder="40"
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
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded bg-white">
                No credit scoring fields added. Click "Add Scoring Fields" to create a new credit scoring field.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation - Last Tab */}
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

