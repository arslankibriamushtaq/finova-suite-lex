import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

interface EligibilityTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  onNext: () => void
  onPrevious: () => void
  errors?: Record<string, string>
}

export default function EligibilityTab({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  errors = {},
}: EligibilityTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Definitions</CardTitle>
          <p className="text-muted-foreground">Define the product definitions for this product.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Eligibility (English)</Label>
            <Textarea
              placeholder="Enter the eligibility criteria in English..."
              value={formData.eligibility_criteria_en || ""}
              onChange={(e) => updateFormData("eligibility_criteria_en", e.target.value)}
              rows={10}
              className={`font-mono text-sm ${errors.eligibility_criteria_en ? "border-red-500" : ""}`}
            />
            {errors.eligibility_criteria_en && (
              <p className="text-sm text-red-500 mt-1">{errors.eligibility_criteria_en}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Eligibility (Arabic)</Label>
            <Textarea
              placeholder="أدخل معايير الأهلية باللغة العربية..."
              value={formData.eligibility_criteria_ar || ""}
              onChange={(e) => updateFormData("eligibility_criteria_ar", e.target.value)}
              rows={10}
              dir="rtl"
              className={`font-mono text-sm ${errors.eligibility_criteria_ar ? "border-red-500" : ""}`}
            />
            {errors.eligibility_criteria_ar && (
              <p className="text-sm text-red-500 mt-1" dir="rtl">{errors.eligibility_criteria_ar}</p>
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
        <Button onClick={onNext} className="gap-2">
          Next: Affordablity Income Slabs
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

