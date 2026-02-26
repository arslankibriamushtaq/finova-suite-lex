import { ArrowLeft, ArrowRight } from "lucide-react"
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
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Duration Settings</CardTitle>
          <p className="text-muted-foreground">Configure time limits for various process stages.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Request Duration (days)</Label>
              <Input
                type="number"
                placeholder="30"
                value={formData.request_duration}
                onChange={(e) => updateFormData("request_duration", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Time limit for initial request processing</p>
            </div>

            <div className="space-y-2">
              <Label>Approval Duration (days)</Label>
              <Input
                type="number"
                placeholder="7"
                value={formData.approval_duration}
                onChange={(e) => updateFormData("approval_duration", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Time limit for approval decision</p>
            </div>

            <div className="space-y-2">
              <Label>Disbursement Duration (hours)</Label>
              <Input
                type="number"
                placeholder="3"
                value={formData.disbursement_duration}
                onChange={(e) => updateFormData("disbursement_duration", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Time limit for fund disbursement</p>
            </div>

            <div className="space-y-2">
              <Label>Repayment Duration (days)</Label>
              <Input
                type="number"
                placeholder="365"
                value={formData.repayment_duration}
                onChange={(e) => updateFormData("repayment_duration", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Default repayment period</p>
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
          Next: Approval Workflows
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

