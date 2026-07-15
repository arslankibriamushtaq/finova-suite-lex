import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

interface SimahCheckRulesTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  onNext: () => void
  onPrevious: () => void
  errors?: Record<string, string>
}

export default function SimahCheckRulesTab({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  errors = {},
}: SimahCheckRulesTabProps) {
  const { t } = useTranslation("productManagement2")
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("simah.title")}</CardTitle>
          <p className="text-muted-foreground">{t("simah.subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("simah.minScoreLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.minimum_simah_score_allowed ?? ""}
                onChange={(e) => updateFormData("minimum_simah_score_allowed", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.minimum_simah_score_allowed ? "border-red-500" : ""}
              />
              {errors.minimum_simah_score_allowed && (
                <p className="text-xs text-red-500">{errors.minimum_simah_score_allowed}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.minScoreHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.delinquencyLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.delinquency_allowed ?? ""}
                onChange={(e) => updateFormData("delinquency_allowed", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.delinquency_allowed ? "border-red-500" : ""}
              />
              {errors.delinquency_allowed && (
                <p className="text-xs text-red-500">{errors.delinquency_allowed}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.delinquencyHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.stage2Label")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.stage2_allowed_last_12 ?? ""}
                onChange={(e) => updateFormData("stage2_allowed_last_12", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.stage2_allowed_last_12 ? "border-red-500" : ""}
              />
              {errors.stage2_allowed_last_12 && (
                <p className="text-xs text-red-500">{errors.stage2_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.stage2Hint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.stage3Label")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.stage3_allowed_last_12 ?? ""}
                onChange={(e) => updateFormData("stage3_allowed_last_12", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.stage3_allowed_last_12 ? "border-red-500" : ""}
              />
              {errors.stage3_allowed_last_12 && (
                <p className="text-xs text-red-500">{errors.stage3_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.stage3Hint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.utilityLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.max_utility_writeoff_amount ?? ""}
                onChange={(e) => updateFormData("max_utility_writeoff_amount", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.max_utility_writeoff_amount ? "border-red-500" : ""}
              />
              {errors.max_utility_writeoff_amount && (
                <p className="text-xs text-red-500">{errors.max_utility_writeoff_amount}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.utilityHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.telecomLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.max_telecom_writeoff_amount ?? ""}
                onChange={(e) => updateFormData("max_telecom_writeoff_amount", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.max_telecom_writeoff_amount ? "border-red-500" : ""}
              />
              {errors.max_telecom_writeoff_amount && (
                <p className="text-xs text-red-500">{errors.max_telecom_writeoff_amount}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.telecomHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.partialLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.partial_settlements_allowed_last_12 ?? ""}
                onChange={(e) => updateFormData("partial_settlements_allowed_last_12", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.partial_settlements_allowed_last_12 ? "border-red-500" : ""}
              />
              {errors.partial_settlements_allowed_last_12 && (
                <p className="text-xs text-red-500">{errors.partial_settlements_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.partialHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.bouncedLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.bounced_cheques_allowed ?? ""}
                onChange={(e) => updateFormData("bounced_cheques_allowed", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.bounced_cheques_allowed ? "border-red-500" : ""}
              />
              {errors.bounced_cheques_allowed && (
                <p className="text-xs text-red-500">{errors.bounced_cheques_allowed}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.bouncedHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.defaultLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.default_allowed_last_12 ?? ""}
                onChange={(e) => updateFormData("default_allowed_last_12", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.default_allowed_last_12 ? "border-red-500" : ""}
              />
              {errors.default_allowed_last_12 && (
                <p className="text-xs text-red-500">{errors.default_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.defaultHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.writeoffLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.writeoff_allowed_last_12 ?? ""}
                onChange={(e) => updateFormData("writeoff_allowed_last_12", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.writeoff_allowed_last_12 ? "border-red-500" : ""}
              />
              {errors.writeoff_allowed_last_12 && (
                <p className="text-xs text-red-500">{errors.writeoff_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.writeoffHint")}</p>
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
          {t("simah.next")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

