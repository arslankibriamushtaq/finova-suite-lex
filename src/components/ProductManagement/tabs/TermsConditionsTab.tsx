import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

interface TermsConditionsTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  onNext: () => void
  onPrevious: () => void
  errors?: Record<string, string>
}

export default function TermsConditionsTab({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  errors = {},
}: TermsConditionsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <p className="text-muted-foreground">Define the legal terms and conditions for this product.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Terms & Conditions (English)</Label>
            <Textarea
              placeholder="Enter the terms and conditions in English..."
              value={formData.terms_conditions_en}
              onChange={(e) => updateFormData("terms_conditions_en", e.target.value)}
              rows={10}
              className={`font-mono text-sm ${errors.terms_conditions_en ? "border-red-500" : ""}`}
            />
            {errors.terms_conditions_en && (
              <p className="text-sm text-red-500 mt-1">{errors.terms_conditions_en}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Terms & Conditions (Arabic)</Label>
            <Textarea
              placeholder="أدخل الشروط والأحكام باللغة العربية..."
              value={formData.terms_conditions_ar}
              onChange={(e) => updateFormData("terms_conditions_ar", e.target.value)}
              rows={10}
              dir="rtl"
              className={`font-mono text-sm ${errors.terms_conditions_ar ? "border-red-500" : ""}`}
            />
            {errors.terms_conditions_ar && (
              <p className="text-sm text-red-500 mt-1" dir="rtl">{errors.terms_conditions_ar}</p>
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
          Next: Fee Settings
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

