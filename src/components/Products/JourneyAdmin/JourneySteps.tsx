import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock,
  EyeOff,
  GripVertical,
  Lock,
} from "lucide-react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "react-beautiful-dnd";

import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import { TONES } from "../../shared/detailKitUtils";
import { cn } from "../../../lib/utils";
import JourneyFields from "./JourneyFields";
import {
  stepKey,
  type FieldType,
  type JourneyFieldRow,
  type JourneyStepRow,
  type StepType,
} from "../../../redux/apis/apisJourneyAdmin";

const asText = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
};

/**
 * One journey's steps.
 *
 * Everything is edited locally and saved as one replace-all PUT, which is what
 * the endpoint expects: the list sent becomes the whole configuration, and a
 * step left out is removed. Expanding a row costs no request — the steps
 * response already carries each step's fields.
 */
export default function JourneySteps({
  rows,
  stepTypes,
  fieldTypes,
  reorderIsReal,
  readOnly,
  onChange,
}: {
  rows: JourneyStepRow[];
  stepTypes: StepType[];
  fieldTypes: FieldType[];
  /** False for onboarding, where order only drives the progress bar. */
  reorderIsReal: boolean;
  readOnly?: boolean;
  onChange: (next: JourneyStepRow[]) => void;
}) {
  const { t } = useTranslation("journeyAdmin");
  const [expanded, setExpanded] = useState<string | null>(null);

  const catalogue = useMemo(() => {
    const map = new Map<string, StepType>();
    stepTypes.forEach((st) => map.set(st.stepType, st));
    return map;
  }, [stepTypes]);

  /** `mandatory` comes from the catalogue; the row may also carry its own flag. */
  const isMandatory = (row: JourneyStepRow) =>
    Boolean(row.mandatory ?? catalogue.get(row.step.stepType || "")?.mandatory);

  /** Only CUSTOMER_INPUT steps collect anything, so the rest show no fields. */
  const collectsFields = (row: JourneyStepRow) => {
    const type = catalogue.get(row.step.stepType || "");
    if (type?.collectsFields === false) return false;
    const driver = row.step.stepDriver;
    return !driver || driver === "CUSTOMER_INPUT";
  };

  const patch = (index: number, change: Partial<JourneyStepRow["step"]> | { enabled: boolean }) => {
    const next = [...rows];
    if ("enabled" in change) next[index] = { ...next[index], enabled: change.enabled };
    else next[index] = { ...next[index], step: { ...next[index].step, ...change } };
    onChange(next);
  };

  /** The button equivalent of a drag, so ordering works without a pointer. */
  const shift = (index: number, delta: number) => {
    const target = index + delta;
    if (readOnly || target < 0 || target >= rows.length) return;
    const next = [...rows];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const move = (result: DropResult) => {
    if (readOnly || !result.destination) return;
    const next = [...rows];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onChange(next);
  };

  return (
    <DragDropContext onDragEnd={move}>
      <Droppable droppableId="journey-steps">
        {(dropProvided) => (
          <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="space-y-2">
            {rows.map((row, index) => {
              const step = row.step;
              const key = stepKey(row);
              const mandatory = isMandatory(row);
              const enabled = row.enabled !== false;
              const open = expanded === key;
              const fieldRows = step.fields || [];
              const hasFields = collectsFields(row);
              const dependsOn = catalogue.get(step.stepType || "")?.dependsOn || [];

              return (
                <Draggable key={key} draggableId={key} index={index} isDragDisabled={readOnly}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={cn("pro-card p-0", !enabled && "opacity-60")}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 p-3">
                        <span
                          {...dragProvided.dragHandleProps}
                          className={cn(
                            "shrink-0 text-muted-foreground",
                            readOnly ? "cursor-not-allowed opacity-40" : "cursor-grab"
                          )}
                          title={
                            reorderIsReal ? t("ja.step.dragHint") : t("ja.step.dragHintDisplay")
                          }
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>

                        {/* The server renumbers 1..n from list order, so this is
                            the position in the list, not step.stepOrder. */}
                        <span className="w-6 shrink-0 text-sm tabular-nums text-muted-foreground">
                          {index + 1}
                        </span>

                        <button
                          type="button"
                          className="min-w-0 flex-1 basis-56 text-start"
                          onClick={() => setExpanded(open ? null : key)}
                        >
                          <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                            {step.label || step.labelEn || key}
                          </span>
                          {/* Code and provider together: the code identifies the
                              row, the provider says who actually performs it. */}
                          <span className="block truncate font-mono text-[11px] uppercase text-muted-foreground">
                            {key}
                            {step.providerCode ? ` · ${step.providerCode}` : ""}
                          </span>
                        </button>

                        {mandatory && (
                          <Badge
                            variant="outline"
                            className={cn("gap-1 border font-medium", TONES.sky)}
                            title={t("ja.step.mandatoryHint")}
                          >
                            <Lock className="h-3 w-3" />
                            {t("ja.step.mandatory")}
                          </Badge>
                        )}

                        {step.stepDriver && (
                          <Badge
                            variant="outline"
                            className={cn("gap-1 border font-medium", TONES.slate)}
                          >
                            <Clock className="h-3 w-3" />
                            {/* The enum is the fallback: a driver the catalogue
                                gains later still reads as something. */}
                            {t(`ja.driver.${step.stepDriver}`, step.stepDriver)}
                          </Badge>
                        )}

                        {step.visible === false && (
                          <span
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                            title={t("ja.step.hiddenHint")}
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                            {t("ja.step.hidden")}
                          </span>
                        )}

                        {typeof step.timeoutMinutes === "number" && (
                          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {t("ja.step.minutes", { count: step.timeoutMinutes })}
                          </span>
                        )}

                        {hasFields && (
                          <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                            {t("ja.step.fieldCount", { count: fieldRows.length })}
                          </span>
                        )}

                        <span className="ms-auto flex shrink-0 items-center gap-1.5">
                          {/* A mandatory step cannot be disabled — the server
                              answers 422. Better refused here than learned from
                              an error. */}
                          <Switch
                            checked={enabled}
                            disabled={readOnly || mandatory}
                            onCheckedChange={(checked) => patch(index, { enabled: checked })}
                            aria-label={t("ja.step.enabled")}
                          />
                          {/* Dragging is not reachable by keyboard and is awkward
                              on a touch screen, so the same move is a button. */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={readOnly || index === 0}
                            onClick={() => shift(index, -1)}
                            title={t("ja.step.moveUp")}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={readOnly || index === rows.length - 1}
                            onClick={() => shift(index, 1)}
                            title={t("ja.step.moveDown")}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setExpanded(open ? null : key)}
                            title={t("ja.step.expand")}
                          >
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                            />
                          </Button>
                        </span>
                      </div>

                      {open && (
                        <div className="space-y-3 border-t p-3">
                          {dependsOn.length > 0 && (
                            <p className="m-0 text-xs text-muted-foreground">
                              {t("ja.step.dependsOn", { list: dependsOn.join(", ") })}
                            </p>
                          )}

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor={`js-${key}-en`}>{t("ja.step.labelEn")}</Label>
                              <Input
                                id={`js-${key}-en`}
                                value={step.labelEn || ""}
                                disabled={readOnly}
                                onChange={(e) => patch(index, { labelEn: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor={`js-${key}-ar`}>{t("ja.step.labelAr")}</Label>
                              <Input
                                id={`js-${key}-ar`}
                                dir="rtl"
                                value={step.labelAr || ""}
                                disabled={readOnly}
                                onChange={(e) => patch(index, { labelAr: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor={`js-${key}-timeout`}>{t("ja.step.timeout")}</Label>
                              <Input
                                id={`js-${key}-timeout`}
                                type="number"
                                min="0"
                                value={step.timeoutMinutes ?? ""}
                                disabled={readOnly}
                                onChange={(e) =>
                                  patch(index, {
                                    timeoutMinutes: e.target.value ? Number(e.target.value) : null,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor={`js-${key}-attempts`}>{t("ja.step.attempts")}</Label>
                              <Input
                                id={`js-${key}-attempts`}
                                type="number"
                                min="0"
                                value={step.maxAttempts ?? ""}
                                disabled={readOnly}
                                onChange={(e) =>
                                  patch(index, {
                                    maxAttempts: e.target.value ? Number(e.target.value) : null,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor={`js-${key}-desc`}>{t("ja.step.description")}</Label>
                            <Textarea
                              id={`js-${key}-desc`}
                              rows={2}
                              value={step.description || ""}
                              disabled={readOnly}
                              onChange={(e) => patch(index, { description: e.target.value })}
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-5 rounded-lg border bg-muted/40 p-3">
                            <label className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={step.visible !== false}
                                disabled={readOnly}
                                onCheckedChange={(checked) =>
                                  patch(index, { visible: checked === true })
                                }
                              />
                              {t("ja.step.visible")}
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={Boolean(step.blocking)}
                                disabled={readOnly}
                                onCheckedChange={(checked) =>
                                  patch(index, { blocking: checked === true })
                                }
                              />
                              {t("ja.step.blocking")}
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={Boolean(step.required)}
                                disabled={readOnly}
                                onCheckedChange={(checked) =>
                                  patch(index, { required: checked === true })
                                }
                              />
                              {t("ja.step.required")}
                            </label>
                          </div>

                          {step.config !== undefined && (
                            <div className="space-y-1.5">
                              <Label htmlFor={`js-${key}-config`}>{t("ja.step.config")}</Label>
                              <Textarea
                                id={`js-${key}-config`}
                                rows={3}
                                className="font-mono text-xs"
                                value={asText(step.config)}
                                disabled={readOnly}
                                onChange={(e) => patch(index, { config: e.target.value })}
                              />
                            </div>
                          )}

                          {hasFields ? (
                            <div className="border-t pt-3">
                              <JourneyFields
                                rows={fieldRows}
                                fieldTypes={fieldTypes}
                                readOnly={readOnly}
                                onChange={(nextFields: JourneyFieldRow[]) =>
                                  patch(index, { fields: nextFields })
                                }
                              />
                            </div>
                          ) : (
                            <p className="m-0 border-t pt-3 text-xs text-muted-foreground">
                              {t("ja.step.noFieldsForDriver")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {dropProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
