import { ArrowLeft, ArrowRight } from "lucide-react"
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
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simah Check Rules</CardTitle>
          <p className="text-muted-foreground">Configure SIMAH credit check rules and thresholds.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Minimum SIMAH Score Allowed</Label>
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
              <p className="text-xs text-muted-foreground">Minimum SIMAH credit score required for eligibility</p>
            </div>

            <div className="space-y-2">
              <Label>Delinquency Allowed</Label>
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
              <p className="text-xs text-muted-foreground">Maximum number of delinquencies allowed</p>
            </div>

            <div className="space-y-2">
              <Label>Stage 2 Allowed (Last 12 Months)</Label>
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
              <p className="text-xs text-muted-foreground">Maximum Stage 2 accounts allowed in the last 12 months</p>
            </div>

            <div className="space-y-2">
              <Label>Stage 3 Allowed (Last 12 Months)</Label>
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
              <p className="text-xs text-muted-foreground">Maximum Stage 3 accounts allowed in the last 12 months</p>
            </div>

            <div className="space-y-2">
              <Label>Max Utility Write-off Amount</Label>
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
              <p className="text-xs text-muted-foreground">Maximum utility write-off amount allowed</p>
            </div>

            <div className="space-y-2">
              <Label>Max Telecom Write-off Amount</Label>
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
              <p className="text-xs text-muted-foreground">Maximum telecom write-off amount allowed</p>
            </div>

            <div className="space-y-2">
              <Label>Partial Settlements Allowed (Last 12 Months)</Label>
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
              <p className="text-xs text-muted-foreground">Maximum partial settlements allowed in the last 12 months</p>
            </div>

            <div className="space-y-2">
              <Label>Bounced Cheques Allowed</Label>
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
              <p className="text-xs text-muted-foreground">Maximum bounced cheques allowed</p>
            </div>

            <div className="space-y-2">
              <Label>Default Allowed (Last 12 Months)</Label>
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
              <p className="text-xs text-muted-foreground">Maximum defaults allowed in the last 12 months</p>
            </div>

            <div className="space-y-2">
              <Label>Write-off Allowed (Last 12 Months)</Label>
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
              <p className="text-xs text-muted-foreground">Maximum write-offs allowed in the last 12 months</p>
            </div>
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
          Next: Credit Scoring Engine
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

