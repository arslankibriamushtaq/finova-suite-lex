import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
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
import {
  getLexReasonCodes,
  type LexReasonCode,
} from "../../../redux/apis/apisCrudProductManagement"
import ReasonCodePicker, { ReasonCodeSummary } from "./ReasonCodePicker"

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

/**
 * The three kinds of workflow, with the colour, icon and one-line explanation
 * each carries everywhere it appears.
 *
 * Colour does the explaining before the words do: green approves, amber sends
 * it to a person, red refuses. The palette this replaced painted auto-approval
 * and rejection in the same red — the one pair a reader must never confuse.
 */
const WORKFLOW_KINDS = {
  manual: {
    type: "manual" as const,
    Icon: Clock,
    tint: "bg-amber-100 text-amber-700",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    header: "bg-amber-50/50",
    addKey: "workflows.addManual",
    nameKey: "workflows.kindManual",
    hintKey: "workflows.kindManualHint",
  },
  auto: {
    type: "auto" as const,
    Icon: Zap,
    tint: "bg-emerald-100 text-emerald-700",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    header: "bg-emerald-50/50",
    addKey: "workflows.addAuto",
    nameKey: "workflows.kindAuto",
    hintKey: "workflows.kindAutoHint",
  },
  rejection: {
    type: "rejection" as const,
    Icon: XCircle,
    tint: "bg-red-100 text-red-700",
    badge: "border-red-200 bg-red-50 text-red-700",
    header: "bg-red-50/50",
    addKey: "workflows.addRejection",
    nameKey: "workflows.kindRejection",
    hintKey: "workflows.kindRejectionHint",
  },
}

/** A scenario loaded from the server can carry a type this page does not know. */
const kindOf = (type: string) =>
  WORKFLOW_KINDS[type as keyof typeof WORKFLOW_KINDS] || WORKFLOW_KINDS.manual

const KIND_ORDER = [WORKFLOW_KINDS.manual, WORKFLOW_KINDS.auto, WORKFLOW_KINDS.rejection]

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
  const { t } = useTranslation("productManagement2")

  /**
   * The LEX reason-code catalogue, fetched once for the whole tab.
   *
   * It belongs to the engine rather than to this product, so it is the same
   * list for every condition on the page — fetching it per condition would be
   * dozens of identical calls for one unchanging answer.
   */
  const [reasonCodes, setReasonCodes] = useState<LexReasonCode[]>([])
  const [reasonCodesLoading, setReasonCodesLoading] = useState(true)
  const [reasonCodesFailed, setReasonCodesFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    getLexReasonCodes()
      .then((response) => {
        if (cancelled) return
        const list = Array.isArray(response?.data?.data) ? response.data.data : []
        setReasonCodes(list)
        setReasonCodesFailed(false)
      })
      .catch(() => {
        // A catalogue that did not load must not block the rest of the tab:
        // thresholds, actions and priorities are all still editable, and a
        // condition saves with whatever reason code it already had.
        if (!cancelled) setReasonCodesFailed(true)
      })
      .finally(() => {
        if (!cancelled) setReasonCodesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("workflows.title")}
          </CardTitle>
          <p className="text-muted-foreground">
            {t("workflows.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Three stretched outline buttons read as empty inputs and said
              nothing about the difference between them. A tile carries the one
              sentence that decides which of the three you want. */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {KIND_ORDER.map((kind) => (
              <button
                key={kind.type}
                type="button"
                onClick={() => addApprovalScenario(kind.type)}
                className="group flex items-start gap-3 rounded-lg border bg-card p-4 text-start transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${kind.tint}`}>
                  <kind.Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t(kind.addKey)}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {t(kind.hintKey)}
                  </span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
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
                  <Zap className="h-4 w-4 text-red-500" />
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
                  {previewTemplate?.type === "auto" && <Zap className="h-5 w-5 text-red-500" />}
                  {previewTemplate?.type === "rejection" && <XCircle className="h-5 w-5 text-red-500" />}
                  {t("workflows.templatePreview", { name: previewTemplate?.template?.name })}
                </DialogTitle>
                <DialogDescription>
                  {t("workflows.previewDescription")}
                </DialogDescription>
              </DialogHeader>

              {previewTemplate && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">{t("workflows.templateInformation")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">{t("workflows.templateName")}</Label>
                        <p className="text-sm">{previewTemplate.template.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">{t("workflows.templateType")}</Label>
                        <Badge
                          variant={
                            previewTemplate.type === "auto"
                              ? "default"
                              : previewTemplate.type === "rejection"
                                ? "destructive"
                                : "secondary"
                          }
                          className="ms-2"
                        >
                          {previewTemplate.type.charAt(0).toUpperCase() + previewTemplate.type.slice(1)}
                        </Badge>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">{t("common:description")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {previewTemplate.template.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {t("workflows.conditionsCount", { count: previewTemplate.template.conditions.length })}
                    </h3>
                    <div className="space-y-2">
                      {previewTemplate.template.conditions.map((condition: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg bg-background">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">{t("workflows.field")}</Label>
                              <p className="font-medium">{getFieldDisplayName(condition.field)}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">{t("workflows.operator")}</Label>
                              <p className="font-medium">{condition.operator}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">{t("workflows.value")}</Label>
                              <p className="font-medium">{condition.value}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">{t("workflows.logic")}</Label>
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
                      {t("workflows.actionsCount", { count: previewTemplate.template.actions.length })}
                    </h3>
                    <div className="space-y-2">
                      {previewTemplate.template.actions.map((action: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg bg-background">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">{t("workflows.actionType")}</Label>
                              <p className="font-medium">{action.type}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                {t("workflows.actionValue")}
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
                      {t("workflows.whatHappensTitle")}
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        {t("workflows.whatHappens1", { name: previewTemplate.template.name })}
                      </li>
                      <li>
                        {t("workflows.whatHappens2", { count: previewTemplate.template.conditions.length })}
                      </li>
                      <li>
                        {t("workflows.whatHappens3", { count: previewTemplate.template.actions.length })}
                      </li>
                      <li>{t("workflows.whatHappens4")}</li>
                    </ul>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  {t("common:cancel")}
                </Button>
                <Button onClick={applyTemplateFromPreview} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("workflows.applyTemplate")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {formData.approval_scenarios.length === 0 ? (
            <div className="rounded-lg border border-dashed px-6 py-10 text-center">
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </span>
              <p className="text-sm font-medium">{t("workflows.noScenarios")}</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                {t("workflows.noScenariosHint")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {t("workflows.configuredWorkflows")}
                  <span className="ms-2 text-xs font-normal text-muted-foreground">
                    {t("workflows.scenarioCount", { value: formData.approval_scenarios.length })}
                  </span>
                </h3>
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
                const kind = kindOf(scenario.type)
                const isEnabled = scenario.enabled ?? true
                return (
                <Card key={scenario.id} className="gap-0 overflow-hidden p-0">
                  {/* The header identifies the rule; the body edits it. Before,
                      the name appeared twice — once as a heading and again in
                      the field below it — and the type showed as a solid black
                      pill that matched nothing else on the page. */}
                  <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${kind.header}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${kind.tint}`}>
                        <kind.Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {scenario.name || t("workflows.untitledScenario")}
                        </h3>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span
                            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${kind.badge}`}
                          >
                            {t(kind.nameKey)}
                          </span>
                          <span>{t("workflows.priorityLabel", { value: scenario.priority || 1 })}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* `active` has always been sent to the server and there
                          was no way to set it — the only control was commented
                          out, and wired to onChange, which a Radix switch never
                          fires. */}
                      {/* Associated by id rather than by wrapping: the switch
                          renders a <button>, and a labelable control inside its
                          own <label> is the classic double-toggle. */}
                      <span className="flex items-center gap-2">
                        <Switch
                          id={`wf-active-${scenario.id}`}
                          checked={isEnabled}
                          onCheckedChange={(checked: boolean) =>
                            updateApprovalScenario(scenario.id, "enabled", checked)
                          }
                        />
                        <Label
                          htmlFor={`wf-active-${scenario.id}`}
                          className="cursor-pointer text-xs font-normal text-muted-foreground"
                        >
                          {isEnabled ? t("workflows.enabled") : t("workflows.disabled")}
                        </Label>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeApprovalScenario(scenario.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6 p-4">
                    {/* Priority is a small number and was given half the row;
                        the description is a sentence and had no field at all,
                        even though it is sent on every save. */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_7rem]">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {t("workflows.scenarioName")}
                        </Label>
                        <Input
                          value={scenario.name}
                          onChange={(e: any) => updateApprovalScenario(scenario.id, "name", e.target.value)}
                          placeholder={t("workflows.scenarioNamePlaceholder")}
                          className={scenarioErrors.scenario_name ? "border-red-500" : ""}
                        />
                        {scenarioErrors.scenario_name && (
                          <p className="text-xs text-red-500">{scenarioErrors.scenario_name}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {t("workflows.priority")}
                        </Label>
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

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {t("workflows.description")}
                      </Label>
                      <Input
                        value={scenario.description || ""}
                        onChange={(e: any) =>
                          updateApprovalScenario(scenario.id, "description", e.target.value)
                        }
                        placeholder={t("workflows.descriptionPlaceholder")}
                      />
                    </div>

                    <div className="space-y-4">
                      {/* WHEN … THEN. The two halves of a rule were headed
                          "Conditions" and "Actions" and set in identical type,
                          so the page read as two unrelated lists rather than as
                          one sentence with a trigger and a consequence. */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {t("workflows.when")}
                          </span>
                          <p className="text-xs text-muted-foreground">{t("workflows.whenHint")}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addConditionToScenario(scenario.id)}
                          className="gap-2 shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                          {t("workflows.addCondition")}
                        </Button>
                      </div>

                      {scenario.conditions.length === 0 && (
                        <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                          {t("workflows.noConditions")}
                        </p>
                      )}

                      {/* No vertical rhythm on the list itself: every gap
                          between two cards holds exactly one AND/OR connector,
                          so the connector's own padding spaces the list and the
                          chip sits evenly between the cards it joins. */}
                      <div>
                      {scenario.conditions.map((condition: any, conditionIndex: number) => {
                        const conditionErrorKey = `conditions.${conditionIndex}.operator`
                        const conditionError = scenarioErrors[conditionErrorKey]
                        const isLast = conditionIndex === scenario.conditions.length - 1

                        // One writer for every field on the card. The four
                        // separate copies this replaced each rebuilt the whole
                        // scenario array by hand, and each was a place for the
                        // `c.id === condition.id` match to be got wrong.
                        const patchCondition = (patch: Record<string, any>) => {
                          const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                            s.id === scenario.id
                              ? {
                                ...s,
                                conditions: s.conditions.map((c: any) =>
                                  c.id === condition.id ? { ...c, ...patch } : c,
                                ),
                              }
                              : s,
                          )
                          updateFormData("approval_scenarios", updatedScenarios)
                        }

                        const selectedReason = reasonCodes.find(
                          (code) => code.referenceCode === condition.reasonCode,
                        )

                        return (
                        <div key={condition.id} className="space-y-0">
                          <div className="overflow-hidden rounded-md border bg-card">
                            {/* The delete control lives in a header strip
                                rather than floating beside the fields: nudged
                                into line with a margin it drifted every time a
                                label wrapped or an error appeared under the
                                operator. */}
                            <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-3 py-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t("workflows.conditionNumber", { number: conditionIndex + 1 })}
                              </span>
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
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-3 p-3">
                              {/* Three columns, not four. The logical operator
                                  moved out to the connector below, where it
                                  actually applies — it joins this condition to
                                  the next one rather than describing this one,
                                  and the width it gave back goes to the value. */}
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    {t("workflows.field")}
                                  </Label>
                                  <Select
                                    value={condition.field}
                                    onValueChange={(value) => {
                                      // The code was chosen against the old
                                      // field, and left alone it would label,
                                      // say, a DBR breach as an age failure.
                                      // Only a code tied to a policy parameter
                                      // is dropped: one with no parameter —
                                      // document tampering, a restricted
                                      // country — is not about the field at all
                                      // and survives the change.
                                      const linked = selectedReason?.linkedPolicyParameter
                                      const stale = Boolean(linked) && linked !== value.toUpperCase()
                                      patchCondition(
                                        stale ? { field: value, reasonCode: null } : { field: value },
                                      )
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder={t("workflows.field")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {conditionFields.map((field) => (
                                        <SelectItem key={field} value={field}>
                                          {getFieldDisplayName(field)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    {t("workflows.operator")}
                                  </Label>
                                  <Select
                                    value={condition.operator}
                                    onValueChange={(value) => patchCondition({ operator: value })}
                                  >
                                    <SelectTrigger className={`w-full ${conditionError ? "border-red-500" : ""}`}>
                                      <SelectValue placeholder={t("workflows.operator")} />
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
                                    <p className="text-xs text-red-500">{conditionError}</p>
                                  )}
                                </div>

                                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    {t("workflows.value")}
                                  </Label>
                                  <Input
                                    placeholder={t("workflows.value")}
                                    value={condition.value}
                                    onChange={(e) => patchCondition({ value: e.target.value })}
                                  />
                                </div>
                              </div>

                              {/* Full width, and aligned with the fields above
                                  rather than set beside them: a reason code is
                                  a sentence, and every layout that gave it a
                                  column truncated the title it exists to show. */}
                              <div className="space-y-1.5 border-t pt-3">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  {t("workflows.reasonCode")}
                                </Label>
                                <ReasonCodePicker
                                  reasonCodes={reasonCodes}
                                  loading={reasonCodesLoading}
                                  value={condition.reasonCode ?? null}
                                  field={condition.field}
                                  onChange={(referenceCode) => patchCondition({ reasonCode: referenceCode })}
                                />
                                {selectedReason && <ReasonCodeSummary code={selectedReason} />}
                                {reasonCodesFailed && !selectedReason && (
                                  <p className="text-xs text-muted-foreground">
                                    {t("workflows.reasonCodeFailed")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* AND / OR belongs between two conditions, not on
                              one. On the last card it joins nothing, so it is
                              not drawn — which also stops it reading as a
                              property of the threshold above it. */}
                          {!isLast && (
                            <div className="flex items-center gap-3 py-3">
                              <span className="h-px flex-1 bg-border" />
                              <Select
                                value={condition.logic || "AND"}
                                onValueChange={(value: string) => patchCondition({ logic: value })}
                              >
                                <SelectTrigger
                                  size="sm"
                                  className="w-24 bg-card text-xs font-semibold uppercase tracking-wide"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AND">AND</SelectItem>
                                  <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="h-px flex-1 bg-border" />
                            </div>
                          )}
                        </div>
                        )
                      })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {t("workflows.then")}
                          </span>
                          <p className="text-xs text-muted-foreground">{t("workflows.thenHint")}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addActionToScenario(scenario.id)}
                          className="gap-2 shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                          {t("workflows.addAction")}
                        </Button>
                      </div>

                      {scenario.actions.length === 0 && (
                        <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                          {t("workflows.noActions")}
                        </p>
                      )}

                      {scenario.actions.map((action: any, actionIndex: number) => {
                        // One writer for the whole row, matching the conditions
                        // above — three hand-rolled copies of the same array
                        // rebuild is three chances to get the id match wrong.
                        const patchAction = (patch: Record<string, any>) => {
                          const updatedScenarios = formData.approval_scenarios.map((s: any) =>
                            s.id === scenario.id
                              ? {
                                ...s,
                                actions: s.actions.map((a: any) =>
                                  a.id === action.id ? { ...a, ...patch } : a,
                                ),
                              }
                              : s,
                          )
                          updateFormData("approval_scenarios", updatedScenarios)
                        }

                        // The engine takes configuration as a JSON string, so
                        // the field cannot be anything but raw JSON — but it
                        // can at least say when what is typed will not parse,
                        // rather than failing silently on save.
                        const configuration = action.configuration ?? action.value ?? ""
                        let configurationBroken = false
                        if (String(configuration).trim()) {
                          try {
                            JSON.parse(String(configuration))
                          } catch {
                            configurationBroken = true
                          }
                        }

                        return (
                        <div key={action.id} className="overflow-hidden rounded-md border bg-card">
                          <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-3 py-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {t("workflows.actionNumber", { number: actionIndex + 1 })}
                            </span>
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
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Three bare inputs with nothing but placeholders —
                              one of them holding raw JSON — were the least
                              readable thing on the page. Labels, and the JSON
                              marked as JSON. */}
                          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_7rem]">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">
                                {t("workflows.actionType")}
                              </Label>
                              <Select
                                value={action.type}
                                onValueChange={(value) => patchAction({ type: value })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t("workflows.actionType")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {actionTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">
                                {t("workflows.actionConfiguration")}
                              </Label>
                              <Input
                                placeholder={"{}"}
                                value={configuration}
                                onChange={(e) =>
                                  patchAction({ configuration: e.target.value, value: e.target.value })
                                }
                                className={`font-mono text-xs ${configurationBroken ? "border-red-500" : ""}`}
                              />
                              <p className={`text-xs ${configurationBroken ? "text-red-500" : "text-muted-foreground"}`}>
                                {configurationBroken
                                  ? t("workflows.actionConfigurationInvalid")
                                  : t("workflows.actionConfigurationHint")}
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">
                                {t("workflows.delayHours")}
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={action.delay_hours || ""}
                                onChange={(e) => patchAction({ delay_hours: Number(e.target.value) })}
                              />
                            </div>
                          </div>
                        </div>
                        )
                      })}
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
          {t("common:previous")}
        </Button>
        <Button onClick={onNext} className="gap-2">
          {t("workflows.next")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

