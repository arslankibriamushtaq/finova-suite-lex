import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation("productManagement2")
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("terms.title")}</CardTitle>
          <p className="text-muted-foreground">{t("terms.subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t("terms.labelEn")}</Label>
            <Textarea
              placeholder={t("terms.placeholderEn")}
              value={formData.terms_conditions_en}
              onChange={(e) => updateFormData("terms_conditions_en", e.target.value)}
              rows={10}
              className={`text-sm ${errors.terms_conditions_en ? "border-red-500" : ""}`}
            />
            {errors.terms_conditions_en && (
              <p className="text-sm text-red-500 mt-1">{errors.terms_conditions_en}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("terms.labelAr")}</Label>
            <Textarea
              placeholder={t("terms.placeholderAr")}
              value={formData.terms_conditions_ar}
              onChange={(e) => updateFormData("terms_conditions_ar", e.target.value)}
              rows={10}
              dir="rtl"
              className={`text-sm ${errors.terms_conditions_ar ? "border-red-500" : ""}`}
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
          {t("common:previous")}
        </Button>
        <Button onClick={onNext} className="gap-2">
          {t("terms.next")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

