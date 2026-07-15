import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

interface DurationSettingsTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  onNext: () => void
  onPrevious: () => void
}

export default function DurationSettingsTab({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: DurationSettingsTabProps) {
  const { t } = useTranslation("productManagement2")
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("duration.title")}</CardTitle>
          <p className="text-muted-foreground">{t("duration.subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("duration.requestLabel")}</Label>
              <Input
                type="number"
                placeholder="30"
                value={formData.request_duration}
                onChange={(e) => updateFormData("request_duration", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{t("duration.requestHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("duration.approvalLabel")}</Label>
              <Input
                type="number"
                placeholder="7"
                value={formData.approval_duration}
                onChange={(e) => updateFormData("approval_duration", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{t("duration.approvalHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("duration.disbursementLabel")}</Label>
              <Input
                type="number"
                placeholder="3"
                value={formData.disbursement_duration}
                onChange={(e) => updateFormData("disbursement_duration", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{t("duration.disbursementHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("duration.repaymentLabel")}</Label>
              <Input
                type="number"
                placeholder="365"
                value={formData.repayment_duration}
                onChange={(e) => updateFormData("repayment_duration", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{t("duration.repaymentHint")}</p>
            </div>
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
          {t("duration.next")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

