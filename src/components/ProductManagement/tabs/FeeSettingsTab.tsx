import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

interface FeeSettingsTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
  onNext: () => void
 
  productTypeName?: string
}

export default function FeeSettingsTab({
  formData,
  updateFormData,
  errors,
  onNext,
  // onPrevious,
  productTypeName = "",
}: FeeSettingsTabProps) {
  // Check if product type is individual or company
  // Product type can be stored as name (e.g., "individual", "company") or as ID
  const isIndividual = productTypeName.toLowerCase() === "individual" || productTypeName === "1"
  const isCompany = productTypeName.toLowerCase() === "corporate" || productTypeName === "2"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fee Settings</CardTitle>
          <p className="text-muted-foreground">
            Configure financing amounts, VAT, revenue eligibility, and DBR settings.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Financing Amount Configuration */}
          <div>
            <h3 className="text-lg font-medium mb-4">Financing Amount Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Minimum Financing Amount *</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={formData.min_financing_amount}
                  onChange={(e) => updateFormData("min_financing_amount", Number(e.target.value))}
                  className={errors.min_financing_amount ? "border-destructive" : ""}
                />
                {errors.min_financing_amount && (
                  <p className="text-sm text-destructive">{errors.min_financing_amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Maximum Financing Amount *</Label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={formData.max_financing_amount}
                  onChange={(e) => updateFormData("max_financing_amount", Number(e.target.value))}
                  className={errors.max_financing_amount ? "border-destructive" : ""}
                />
                {errors.max_financing_amount && (
                  <p className="text-sm text-destructive">{errors.max_financing_amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Suggested Financing Amount</Label>
                <Input
                  type="number"
                  placeholder="1500"
                  value={formData.suggested_financing_amount}
                  onChange={(e) => updateFormData("suggested_financing_amount", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Recommended amount shown to customers</p>
              </div>
            </div>
          </div>

          {/* Tenure Configuration */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Tenure Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Minimum Tenure (Months)</Label>
                <Input
                  type="number"
                  placeholder="6"
                  value={formData.min_tenure}
                  onChange={(e) => updateFormData("min_tenure", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Minimum repayment period in months</p>
              </div>

              <div className="space-y-2">
                <Label>Maximum Tenure (Months)</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={formData.max_tenure}
                  onChange={(e) => updateFormData("max_tenure", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Maximum repayment period in months</p>
              </div>
            </div>
          </div>

          {/* Age and Other Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Eligibility Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{isCompany ? "Company Minimum Age" : "Minimum Age"}</Label>
                <Input
                  type="number"
                  placeholder="18"
                  value={formData.min_age}
                  onChange={(e) => updateFormData("min_age", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">{isCompany ? "Minimum company age requirement" : "Minimum customer age requirement"}</p>
              </div>

              <div className="space-y-2">
                <Label>{isCompany ? "Company Maximum Age" : "Maximum Age"}</Label>
                <Input
                  type="number"
                  placeholder="65"
                  value={formData.max_age}
                  onChange={(e) => updateFormData("max_age", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">{isCompany ? "Maximum company age requirement" : "Maximum customer age requirement"}</p>
              </div>

              <div className="space-y-2">
                <Label>VAT Percentage *</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="8"
                  value={formData.vat_percentage}
                  onChange={(e) => updateFormData("vat_percentage", Number(e.target.value))}
                  className={errors.vat_percentage ? "border-destructive" : ""}
                />
                {errors.vat_percentage && <p className="text-sm text-destructive">{errors.vat_percentage}</p>}
              </div>

              {!isIndividual && (
                <div className="space-y-2">
                  <Label>Minimum Annual Revenue</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.revenue_eligibility_threshold}
                    onChange={(e) => updateFormData("revenue_eligibility_threshold", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Minimum annual revenue required</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>GDBR Percentage</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="10"
                  value={formData.gdbr_percentage}
                  onChange={(e) => updateFormData("gdbr_percentage", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Gross Debt-to-Business Revenue ratio</p>
              </div>
             {!isIndividual && (
              <div className="space-y-2">
                <Label>Credit Line Percentage</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="10"
                  value={formData.credit_line_percentage}
                  onChange={(e) => updateFormData("credit_line_percentage", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Credit line allocation percentage</p>
              </div>
              )}
              <div className="space-y-2">
                <Label>Minimum Income</Label>
                <Input
                  type="number"
                  placeholder="Enter minimum income"
                  value={formData.min_income}
                  onChange={(e) => updateFormData("min_income", Number(e.target.value))}
                  className={errors.min_income ? "border-destructive" : ""}
                />
                {errors.min_income && <p className="text-sm text-destructive">{errors.min_income}</p>}
                <p className="text-xs text-muted-foreground">Minimum income required</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">DBR (Debt-to-Income Ratio) Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{isIndividual ? "Product DBR Percentage *" : "Maximum DBR Percentage *"}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="33"
                  value={formData.dbr_percentage}
                  onChange={(e) => updateFormData("dbr_percentage", Number(e.target.value))}
                  className={errors.dbr_percentage ? "border-destructive" : ""}
                />
                {errors.dbr_percentage && <p className="text-sm text-destructive">{errors.dbr_percentage}</p>}
                <p className="text-xs text-muted-foreground">{isIndividual ? "Product debt-to-income ratio" : "Maximum allowed debt-to-income ratio"}</p>
              </div>
              <div className="space-y-2">
                <Label>Maximum DTI (Debt-to-Income)</Label>
                <Input
                  type="number"
                  placeholder="Enter Maximum DTI"
                  value={formData.max_dti}
                  onChange={(e) => updateFormData("max_dti", Number(e.target.value))}
                  className={errors.max_dti ? "border-destructive" : ""}
                />
                {errors.max_dti && <p className="text-sm text-destructive">{errors.max_dti}</p>}
                {/* <p className="text-xs text-muted-foreground">Maximum allowed debt-to-income ratio</p> */}
              </div>
              </div>
              
{/* 
              <div className="space-y-2">
                <Label>DBR Calculation Method</Label>
                <Select
                  value={formData.dbr_calculation_method}
                  onValueChange={(value: "gross_income" | "net_income" | "disposable_income") =>
                    updateFormData("dbr_calculation_method", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gross_income">Based on Gross Income</SelectItem>
                    <SelectItem value="net_income">Based on Net Income</SelectItem>
                    <SelectItem value="disposable_income">Based on Disposable Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>DBR Exceptions</Label>
              <Textarea
                placeholder="List any exceptions or special cases for DBR calculation..."
                value={formData.dbr_exceptions.join("\n")}
                onChange={(e) => updateFormData("dbr_exceptions", e.target.value.split("\n").filter(Boolean))}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Enter each exception on a new line</p>
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
              <div className="space-y-2">
                <Label>Stress Buffer</Label>
                <Input
                  type="number"
                  placeholder="Enter Stress Buffer"
                  value={formData.stress_buffer}
                  onChange={(e) => updateFormData("stress_buffer", Number(e.target.value))}
                  className={errors.stress_buffer ? "border-destructive" : ""}
                />
                {errors.stress_buffer && <p className="text-sm text-destructive">{errors.stress_buffer}</p>}
                {/* <p className="text-xs text-muted-foreground">Maximum allowed debt-to-income ratio</p> */}
              </div>
            </div>
          </div>
          
        </CardContent>
      </Card>
      

      {/* Tab Navigation */}
      <div className="flex justify-end gap-3 mb-3 pt-4">
       
        <Button onClick={onNext} className="gap-2">
         Save
         
        </Button>
      </div>
    </div>
  )
}

