import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, XCircle, Clock, Settings, Zap, Eye } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Switch } from "../../ui/switch"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { getApprovalWorkflowScenarios } from "../../../redux/apis/apisCrudProductManagement"

interface ApprovalWorkflowsTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  onNext: () => void
  onPrevious: () => void
  predefinedWorkflowTemplates: any
  conditionFields: string[]
  conditionOperators: string[]
  actionTypes: string[]
  addApprovalScenario: (type: "manual" | "auto" | "rejection") => void
  updateApprovalScenario: (id: string, field: string, value: any) => void
  removeApprovalScenario: (id: string) => void
  addConditionToScenario: (scenarioId: string) => void
  addActionToScenario: (scenarioId: string) => void
  loadPredefinedWorkflow: (type: "manual" | "auto" | "rejection", templateIndex: number) => void
  openTemplatePreview: (type: "manual" | "auto" | "rejection", templateIndex: number) => void
  previewTemplate: any
  isPreviewOpen: boolean
  setIsPreviewOpen: (value: boolean) => void
  applyTemplateFromPreview: () => void
  errors?: Record<string, Record<string, string>>
}
const productId = sessionStorage.getItem("productId")

// Helper function to map field values to display names
const getFieldDisplayName = (field: string): string => {
  const fieldMap: Record<string, string> = {
    "dbr": "DBR",
    "loan_amount": "Loan Amount",
    "credit_score": "Credit Score",
    "simah": "SIMAH",
    "risk_type": "Risk Type",
    "pep": "PEP",
  }
  return fieldMap[field] || field.replace(/_/g, " ")
}

export default function ApprovalWorkflowsTab({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  predefinedWorkflowTemplates,
  conditionFields,
  conditionOperators,
  actionTypes,
  addApprovalScenario,
  updateApprovalScenario,
  removeApprovalScenario,
  addConditionToScenario,
  addActionToScenario,
  loadPredefinedWorkflow,
  openTemplatePreview,
  previewTemplate,
  isPreviewOpen,
  setIsPreviewOpen,
  applyTemplateFromPreview,
  errors = {},
}: ApprovalWorkflowsTabProps) {

  useEffect(() => {
    getData();
  }, [])

  const getData = async () => {
    if (!productId) {
      console.warn("No productId found in sessionStorage.");
      return;
    }
    const response = await getApprovalWorkflowScenarios(productId);
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Approval Workflows
          </CardTitle>
          <p className="text-muted-foreground">
            Configure automated and manual approval scenarios for loan applications.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => addApprovalScenario("manual")} variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Add Manual Approval
            </Button>
            <Button onClick={() => addApprovalScenario("auto")} variant="outline" className="gap-2">
              <Zap className="h-4 w-4" />
              Add Auto-Approval
            </Button>
            <Button onClick={() => addApprovalScenario("rejection")} variant="outline" className="gap-2">
              <XCircle className="h-4 w-4" />
              Add Rejection Scenario
            </Button>
          </div>

          {/* <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Pre-defined Workflow Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick-start with industry-standard approval workflows
              </p>
            </CardHeader>
            <CardContent className="space-y-6"> */}
              {/* Manual Approval Templates */}
              {/* <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium">Manual Approval Templates</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {predefinedWorkflowTemplates.manual.map((template: any, index: number) => (
                    <Card key={index} className="p-3 hover:bg-accent transition-colors">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">{template.name}</h5>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {template.conditions.length} conditions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.actions.length} actions
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTemplatePreview("manual", index)}
                            className="gap-1 flex-1"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => loadPredefinedWorkflow("manual", index)}
                            className="flex-1"
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div> */}

              {/* Auto-Approval Templates */}
              {/* <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">Auto-Approval Templates</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {predefinedWorkflowTemplates.auto.map((template: any, index: number) => (
                    <Card key={index} className="p-3 hover:bg-accent transition-colors">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">{template.name}</h5>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {template.conditions.length} conditions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.actions.length} actions
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTemplatePreview("auto", index)}
                            className="gap-1 flex-1"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => loadPredefinedWorkflow("auto", index)}
                            className="flex-1"
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div> */}

              {/* Rejection Templates */}
              {/* <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium">Rejection Scenario Templates</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {predefinedWorkflowTemplates.rejection.map((template: any, index: number) => (
                    <Card key={index} className="p-3 hover:bg-accent transition-colors">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">{template.name}</h5>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {template.conditions.length} conditions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.actions.length} actions
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTemplatePreview("rejection", index)}
                            className="gap-1 flex-1"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => loadPredefinedWorkflow("rejection", index)}
                            className="flex-1"
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div> */}
            {/* </CardContent>
          </Card> */}

          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {previewTemplate?.type === "manual" && <Clock className="h-5 w-5 text-orange-500" />}
                  {previewTemplate?.type === "auto" && <Zap className="h-5 w-5 text-green-500" />}
                  {previewTemplate?.type === "rejection" && <XCircle className="h-5 w-5 text-red-500" />}
                  Template Preview: {previewTemplate?.template?.name}
                </DialogTitle>
                <DialogDescription>
                  Review the template details before applying it to your workflow configuration.
                </DialogDescription>
              </DialogHeader>

              {previewTemplate && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Template Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Template Name</Label>
                        <p className="text-sm">{previewTemplate.template.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Template Type</Label>
                        <Badge
                          variant={
                            previewTemplate.type === "auto"
                              ? "default"
                              : previewTemplate.type === "rejection"
                                ? "destructive"
                                : "secondary"
                          }
                          className="ml-2"
                        >
                          {previewTemplate.type.charAt(0).toUpperCase() + previewTemplate.type.slice(1)}
                        </Badge>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-muted-foreground">
                          {previewTemplate.template.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Conditions ({previewTemplate.template.conditions.length})
                    </h3>
                    <div className="space-y-2">
                      {previewTemplate.template.conditions.map((condition: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg bg-background">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Field</Label>
                              <p className="font-medium">{getFieldDisplayName(condition.field)}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Operator</Label>
                              <p className="font-medium">{condition.operator}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Value</Label>
                              <p className="font-medium">{condition.value}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Logic</Label>
                              <Badge variant="outline" className="text-xs">
                                {condition.logic}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Actions ({previewTemplate.template.actions.length})
                    </h3>
                    <div className="space-y-2">
                      {previewTemplate.template.actions.map((action: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg bg-background">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Action Type</Label>
                              <p className="font-medium">{action.type}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                Action Value
                              </Label>
                              <p className="font-medium">{action.value}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      What happens when you apply this template?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • A new workflow scenario will be created with the name "
                        {previewTemplate.template.name}"
                      </li>
                      <li>
                        • All {previewTemplate.template.conditions.length} conditions will be automatically
                        configured
                      </li>
                      <li>
                        • All {previewTemplate.template.actions.length} actions will be set up and ready to
                        use
                      </li>
                      <li>• The workflow will be enabled by default and can be modified after creation</li>
                    </ul>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={applyTemplateFromPreview} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Apply Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {formData.approval_scenarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                No approval scenarios configured. Add scenarios manually or use pre-defined templates above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Configured Workflows</h3>
                <div className="flex gap-2">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                    }}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save All Workflows
                  </Button> */}
                </div>
              </div>

              {formData.approval_scenarios.map((scenario: any) => {
                const scenarioErrors = errors[scenario.id] || {}
                return (
                <Card key={scenario.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {scenario.type === "manual" && <Clock className="h-5 w-5 text-orange-500" />}
                        {scenario.type === "auto" && <Zap className="h-5 w-5 text-green-500" />}
                        {scenario.type === "rejection" && <XCircle className="h-5 w-5 text-red-500" />}
                        <div>
                          <h3 className="text-lg font-medium">{scenario.name}</h3>
                          <Badge
                            variant={
                              scenario.type === "auto"
                                ? "default"
                                : scenario.type === "rejection"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {scenario.type.charAt(0).toUpperCase() + scenario.type.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                          }}
                          className="gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button> */}
                        {/* <Switch
                          checked={scenario.enabled}
                          onChange={(e: any) => updateApprovalScenario(scenario.id, "enabled", e.target.checked)}
                        /> */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeApprovalScenario(scenario.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Scenario Name</Label>
                        <Input
                          value={scenario.name}
                          onChange={(e: any) => updateApprovalScenario(scenario.id, "name", e.target.value)}
                          placeholder="Enter scenario name"
                          className={scenarioErrors.scenario_name ? "border-red-500" : ""}
                        />
                        {scenarioErrors.scenario_name && (
                          <p className="text-sm text-red-500 mt-1">{scenarioErrors.scenario_name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Input
                          type="number"
                          value={scenario.priority}
                          onChange={(e: any) =>
                            updateApprovalScenario(scenario.id, "priority", Number(e.target.value))
                          }
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Conditions</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addConditionToScenario(scenario.id)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Condition
                        </Button>
                      </div>

                      {scenario.conditions.map((condition: any, conditionIndex: number) => {
                        const conditionErrorKey = `conditions.${conditionIndex}.operator`
                        const conditionError = scenarioErrors[conditionErrorKey]
                        return (
                        <div
                          key={condition.id}
                          className="space-y-2"
                        >
                          <div className="flex items-start gap-2">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded flex-1">
                            <Select
                              value={condition.field}
                              onValueChange={(value) => {
                                const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                                  s.id === scenario.id
                                    ? {
                                      ...s,
                                      conditions: s.conditions.map((c: any) =>
                                        c.id === condition.id ? { ...c, field: value } : c,
                                      ),
                                    }
                                    : s,
                                )
                                updateFormData("approval_scenarios", updatedScenarios)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Field" />
                              </SelectTrigger>
                              <SelectContent>
                                {conditionFields.map((field) => (
                                  <SelectItem key={field} value={field}>
                                    {getFieldDisplayName(field)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="space-y-1">
                              <Select
                                value={condition.operator}
                                onValueChange={(value) => {
                                  const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                                    s.id === scenario.id
                                      ? {
                                        ...s,
                                        conditions: s.conditions.map((c: any) =>
                                          c.id === condition.id ? { ...c, operator: value } : c,
                                        ),
                                      }
                                      : s,
                                  )
                                  updateFormData("approval_scenarios", updatedScenarios)
                                }}
                              >
                                <SelectTrigger className={conditionError ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  {conditionOperators.map((op) => (
                                    <SelectItem key={op} value={op}>
                                      {op}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {conditionError && (
                                <p className="text-sm text-red-500 mt-1">{conditionError}</p>
                              )}
                            </div>

                            <Input
                              placeholder="Value"
                              value={condition.value}
                              onChange={(e) => {
                                const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                                  s.id === scenario.id
                                    ? {
                                      ...s,
                                      conditions: s.conditions.map((c: any) =>
                                        c.id === condition.id ? { ...c, value: e.target.value } : c,
                                      ),
                                    }
                                    : s,
                                )
                                updateFormData("approval_scenarios", updatedScenarios)
                              }}
                            />

                            <Select
                              value={condition.logic}
                              onValueChange={(value: string) => {
                                const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                                  s.id === scenario.id
                                    ? {
                                      ...s,
                                      conditions: s.conditions.map((c: any) =>
                                        c.id === condition.id ? { ...c, logic: value } : c,
                                      ),
                                    }
                                    : s,
                                )
                                updateFormData("approval_scenarios", updatedScenarios)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                                s.id === scenario.id
                                  ? {
                                    ...s,
                                    conditions: s.conditions.filter((c: any) => c.id !== condition.id),
                                  }
                                  : s,
                              )
                              updateFormData("approval_scenarios", updatedScenarios)
                            }}
                            className="text-destructive hover:text-destructive mt-3"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          </div>
                        </div>
                        )
                      })}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Actions</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addActionToScenario(scenario.id)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Action
                        </Button>
                      </div>

                      {scenario.actions.map((action: any) => (
                        <div
                          key={action.id}
                          className="flex items-start gap-2"
                        >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded flex-1">
                          <Select
                            value={action.type}
                            onValueChange={(value) => {
                              const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                                s.id === scenario.id
                                  ? {
                                    ...s,
                                    actions: s.actions.map((a: any) =>
                                      a.id === action.id ? { ...a, type: value } : a,
                                    ),
                                  }
                                  : s,
                              )
                              updateFormData("approval_scenarios", updatedScenarios)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Action Value"
                            value={action.value}
                            onChange={(e) => {
                              const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                                s.id === scenario.id
                                  ? {
                                    ...s,
                                    actions: s.actions.map((a: any) =>
                                      a.id === action.id ? { ...a, value: e.target.value } : a,
                                    ),
                                  }
                                  : s,
                              )
                              updateFormData("approval_scenarios", updatedScenarios)
                            }}
                          />

                          <Input
                            type="number"
                            placeholder="Delay (hours)"
                            value={action.delay_hours || ""}
                            onChange={(e) => {
                              const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                                s.id === scenario.id
                                  ? {
                                    ...s,
                                    actions: s.actions.map((a: any) =>
                                      a.id === action.id
                                        ? { ...a, delay_hours: Number(e.target.value) }
                                        : a,
                                    ),
                                  }
                                  : s,
                              )
                              updateFormData("approval_scenarios", updatedScenarios)
                            }}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                              s.id === scenario.id
                                ? {
                                  ...s,
                                  actions: s.actions.filter((a: any) => a.id !== action.id),
                                }
                                : s,
                            )
                            updateFormData("approval_scenarios", updatedScenarios)
                          }}
                          className="text-destructive hover:text-destructive mt-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex justify-between gap-3 pt-4">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button onClick={onNext} className="gap-2">
          Next: Credit Scoring
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

