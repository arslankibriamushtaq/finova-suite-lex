import { Plus, Trash2, DropletsIcon as DragHandleDots2Icon, ArrowRight } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Checkbox } from "../../ui/checkbox"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

interface ApplicationStep {
  id: string
  title: string
  title_ar: string
  description: string
  required: boolean
  order: number
}

interface ApplicationStepsTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  errors: Record<string, Record<string, string>>
  onNext: () => void
  addApplicationStep: () => void
  removeApplicationStep: (id: string) => void
  updateApplicationStep: (id: string, field: keyof ApplicationStep, value: any) => void
}

export default function ApplicationStepsTab({
  formData,
  errors,
  onNext,
  addApplicationStep,
  removeApplicationStep,
  updateApplicationStep,
}: ApplicationStepsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Application Steps</CardTitle>
              <p className="mt-2 text-muted-foreground">Define the workflow steps for processing applications.</p>
            </div>
            <Button onClick={addApplicationStep} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.application_steps.map((step: any, index: number) => {
              const stepErrors = errors[index.toString()] || {}
              return (
                <Card key={step.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 mt-2">
                      <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground cursor-move" />
                      <Badge variant="outline">{index + 1}</Badge>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Step Title (English)</Label>
                          <Input
                            placeholder="e.g., Document Verification"
                            value={step.title}
                            onChange={(e) => updateApplicationStep(step.id, "title", e.target.value)}
                            className={stepErrors.title_en ? "border-red-500" : ""}
                          />
                          {stepErrors.title_en && (
                            <p className="text-sm text-red-500 mt-1">{stepErrors.title_en}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Step Title (Arabic)</Label>
                          <Input
                            placeholder="مثال: التحقق من الوثائق"
                            value={step.title_ar}
                            onChange={(e) => updateApplicationStep(step.id, "title_ar", e.target.value)}
                            dir="rtl"
                            className={stepErrors.title_ar ? "border-red-500" : ""}
                          />
                          {stepErrors.title_ar && (
                            <p className="text-sm text-red-500 mt-1" dir="rtl">{stepErrors.title_ar}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe what happens in this step..."
                          value={step.description}
                          onChange={(e) => updateApplicationStep(step.id, "description", e.target.value)}
                          rows={2}
                          className={stepErrors.description ? "border-red-500" : ""}
                        />
                        {stepErrors.description && (
                          <p className="text-sm text-red-500 mt-1">{stepErrors.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`required-${step.id}`}
                            checked={step.required}
                            onCheckedChange={(checked) => updateApplicationStep(step.id, "required", checked)}
                          />
                          <Label htmlFor={`required-${step.id}`} className="text-sm">
                            Required Step
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeApplicationStep(step.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex justify-end gap-3 pt-4">
        <Button onClick={onNext} className="gap-2">
          Next: Terms & Conditions
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

