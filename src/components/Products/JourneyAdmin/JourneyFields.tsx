import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GripVertical, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "react-beautiful-dnd";

import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { EmptyState } from "../../shared/detailKit";
import { TONES } from "../../shared/detailKitUtils";
import { cn } from "../../../lib/utils";
import type { FieldType, JourneyFieldRow } from "../../../redux/apis/apisJourneyAdmin";

/** `validation` / `options` / `visibleWhen` travel as raw JSON strings. */
const asText = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";
  return typeof value === "string" ? value : JSON.stringify(value);
};

const parseOrNull = (text: string): { ok: boolean; value: string | null } => {
  const trimmed = text.trim();
  if (trimmed === "") return { ok: true, value: null };
  try {
    JSON.parse(trimmed);
    return { ok: true, value: trimmed };
  } catch {
    return { ok: false, value: null };
  }
};

interface Draft {
  fieldKey: string;
  fieldType: string;
  labelEn: string;
  labelAr: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  enabled: boolean;
  pii: boolean;
  validation: string;
  options: string;
  lovSource: string;
  visibleWhen: string;
}

const emptyDraft = (): Draft => ({
  fieldKey: "",
  fieldType: "TEXT",
  labelEn: "",
  labelAr: "",
  placeholder: "",
  helpText: "",
  required: false,
  enabled: true,
  pii: false,
  validation: "",
  options: "",
  lovSource: "",
  visibleWhen: "",
});

const draftFrom = (row: JourneyFieldRow): Draft => ({
  fieldKey: row.field.fieldKey || "",
  fieldType: row.field.fieldType || "TEXT",
  labelEn: row.field.labelEn || row.field.label || "",
  labelAr: row.field.labelAr || "",
  placeholder: row.field.placeholder || "",
  helpText: row.field.helpText || "",
  required: Boolean(row.field.required),
  enabled: row.enabled !== false && row.field.enabled !== false,
  pii: Boolean(row.field.pii),
  validation: asText(row.field.validation),
  options: asText(row.field.options),
  lovSource: row.field.lovSource || "",
  visibleWhen: asText(row.field.visibleWhen),
});

/**
 * The fields of one step.
 *
 * Everything here is local until the parent saves: the endpoint is replace-all
 * within the step, so a single add has to be sent as the whole list. Editing in
 * place and saving once is both fewer requests and the only way to express a
 * reorder.
 */
export default function JourneyFields({
  rows,
  fieldTypes,
  readOnly,
  onChange,
}: {
  rows: JourneyFieldRow[];
  fieldTypes: FieldType[];
  readOnly?: boolean;
  onChange: (next: JourneyFieldRow[]) => void;
}) {
  const { t } = useTranslation("journeyAdmin");
  const [editing, setEditing] = useState<{ index: number | null; draft: Draft } | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const typeOf = useMemo(() => {
    const map = new Map<string, FieldType>();
    fieldTypes.forEach((ft) => map.set(ft.fieldType, ft));
    return map;
  }, [fieldTypes]);

  const draftType = editing ? typeOf.get(editing.draft.fieldType) : undefined;

  const move = (result: DropResult) => {
    if (readOnly || !result.destination) return;
    const next = [...rows];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onChange(next);
  };

  const commit = () => {
    if (!editing) return;
    const { draft, index } = editing;

    if (!draft.fieldKey.trim()) {
      setJsonError(t("ja.field.keyRequired"));
      return;
    }
    // The three JSON columns are parsed by the server, which answers 422 on bad
    // input. Catching it here means the operator is told which box is wrong.
    for (const [key, label] of [
      ["validation", t("ja.field.validation")],
      ["options", t("ja.field.options")],
      ["visibleWhen", t("ja.field.visibleWhen")],
    ] as const) {
      if (!parseOrNull(draft[key]).ok) {
        setJsonError(t("ja.field.badJson", { field: label }));
        return;
      }
    }
    setJsonError(null);

    const existing = index !== null ? rows[index] : undefined;
    const row: JourneyFieldRow = {
      system: existing?.system,
      enabled: draft.enabled,
      field: {
        ...(existing?.field || {}),
        fieldKey: draft.fieldKey.trim(),
        fieldType: draft.fieldType,
        labelEn: draft.labelEn || undefined,
        labelAr: draft.labelAr || undefined,
        placeholder: draft.placeholder || undefined,
        helpText: draft.helpText || undefined,
        required: draft.required,
        enabled: draft.enabled,
        pii: draft.pii,
        validation: parseOrNull(draft.validation).value,
        options: parseOrNull(draft.options).value,
        lovSource: draft.lovSource || null,
        visibleWhen: parseOrNull(draft.visibleWhen).value,
      },
    };

    const next = [...rows];
    if (index === null) next.push(row);
    else next[index] = row;
    onChange(next);
    setEditing(null);
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h5 className="m-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("ja.fields.title", { count: rows.length })}
        </h5>
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setJsonError(null);
              setEditing({ index: null, draft: emptyDraft() });
            }}
          >
            <Plus className="h-4 w-4" />
            {t("ja.fields.add")}
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Plus} text={t("ja.fields.none")} />
      ) : (
        <DragDropContext onDragEnd={move}>
          <Droppable droppableId="journey-fields">
            {(dropProvided) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className="space-y-1.5"
              >
                {rows.map((row, index) => {
                  // Defensive: a row reaching here unwrapped would take the
                  // whole page down rather than render one bad line.
                  const field = row.field || ({} as typeof row.field);
                  const disabled = row.enabled === false || field.enabled === false;
                  return (
                    <Draggable
                      key={field.fieldKey || String(index)}
                      draggableId={field.fieldKey || String(index)}
                      index={index}
                      isDragDisabled={readOnly}
                    >
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={cn(
                            "flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2.5",
                            disabled && "opacity-60"
                          )}
                        >
                          <span
                            {...dragProvided.dragHandleProps}
                            className={cn(
                              "shrink-0 text-muted-foreground",
                              readOnly ? "cursor-not-allowed opacity-40" : "cursor-grab"
                            )}
                          >
                            <GripVertical className="h-4 w-4" />
                          </span>

                          <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
                            {index + 1}
                          </span>

                          <span className="min-w-0 flex-1 basis-40">
                            <span className="block truncate font-mono text-xs text-foreground">
                              {field.fieldKey}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {field.labelEn || field.label || "—"}
                            </span>
                          </span>

                          <Badge variant="outline" className={cn("border font-medium", TONES.slate)}>
                            {field.fieldType || "—"}
                          </Badge>

                          {field.required && (
                            <Badge
                              variant="outline"
                              className={cn("border font-medium", TONES.amber)}
                            >
                              {t("ja.field.required")}
                            </Badge>
                          )}

                          {row.system && (
                            <span
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                              title={t("ja.field.systemHint")}
                            >
                              <Lock className="h-3.5 w-3.5" />
                              {t("ja.field.system")}
                            </span>
                          )}

                          <span className="hidden max-w-[220px] truncate font-mono text-[11px] text-muted-foreground lg:block">
                            {asText(field.validation)}
                          </span>

                          <span className="ms-auto flex shrink-0 items-center gap-1">
                            <Switch
                              checked={!disabled}
                              disabled={readOnly}
                              onCheckedChange={(checked) => {
                                const next = [...rows];
                                next[index] = {
                                  ...row,
                                  enabled: checked,
                                  field: { ...field, enabled: checked },
                                };
                                onChange(next);
                              }}
                              aria-label={t("ja.field.enabled")}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={readOnly}
                              onClick={() => {
                                setJsonError(null);
                                setEditing({ index, draft: draftFrom(row) });
                              }}
                              title={t("common:edit")}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {/* A system field is read by name in code. The
                                server refuses to delete one (422), so the
                                button is not offered — only the toggle. */}
                            {!row.system && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                disabled={readOnly}
                                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                                title={t("common:delete")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </span>
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
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Pencil className="h-4 w-4" />
              </span>
              {editing?.index === null ? t("ja.fields.add") : t("ja.fields.edit")}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="max-h-[65vh] space-y-3 overflow-y-auto pe-1">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="jf-key">{t("ja.field.key")}</Label>
                  <Input
                    id="jf-key"
                    value={editing.draft.fieldKey}
                    // The key identifies the row on the server; changing it on
                    // an existing field would delete one and create another.
                    disabled={editing.index !== null}
                    onChange={(e) =>
                      setEditing({ ...editing, draft: { ...editing.draft, fieldKey: e.target.value } })
                    }
                    placeholder="employerName"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jf-type">{t("ja.field.type")}</Label>
                  <Select
                    value={editing.draft.fieldType}
                    onValueChange={(value) =>
                      setEditing({ ...editing, draft: { ...editing.draft, fieldType: value } })
                    }
                  >
                    <SelectTrigger id="jf-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((ft) => (
                        <SelectItem key={ft.fieldType} value={ft.fieldType}>
                          {ft.label || ft.fieldType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jf-label-en">{t("ja.field.labelEn")}</Label>
                  <Input
                    id="jf-label-en"
                    value={editing.draft.labelEn}
                    onChange={(e) =>
                      setEditing({ ...editing, draft: { ...editing.draft, labelEn: e.target.value } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jf-label-ar">{t("ja.field.labelAr")}</Label>
                  <Input
                    id="jf-label-ar"
                    dir="rtl"
                    value={editing.draft.labelAr}
                    onChange={(e) =>
                      setEditing({ ...editing, draft: { ...editing.draft, labelAr: e.target.value } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jf-placeholder">{t("ja.field.placeholder")}</Label>
                  <Input
                    id="jf-placeholder"
                    value={editing.draft.placeholder}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        draft: { ...editing.draft, placeholder: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jf-help">{t("ja.field.helpText")}</Label>
                  <Input
                    id="jf-help"
                    value={editing.draft.helpText}
                    onChange={(e) =>
                      setEditing({ ...editing, draft: { ...editing.draft, helpText: e.target.value } })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 rounded-lg border bg-muted/40 p-3">
                {/* INFO-style types collect nothing, so "required" would be a
                    promise the form cannot keep. */}
                {draftType?.collectsValue !== false && (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={editing.draft.required}
                      onCheckedChange={(checked) =>
                        setEditing({
                          ...editing,
                          draft: { ...editing.draft, required: checked === true },
                        })
                      }
                    />
                    {t("ja.field.required")}
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={editing.draft.enabled}
                    onCheckedChange={(checked) =>
                      setEditing({
                        ...editing,
                        draft: { ...editing.draft, enabled: checked === true },
                      })
                    }
                  />
                  {t("ja.field.enabled")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={editing.draft.pii}
                    onCheckedChange={(checked) =>
                      setEditing({ ...editing, draft: { ...editing.draft, pii: checked === true } })
                    }
                  />
                  {t("ja.field.pii")}
                </label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jf-validation">{t("ja.field.validation")}</Label>
                <Textarea
                  id="jf-validation"
                  rows={2}
                  className="font-mono text-xs"
                  value={editing.draft.validation}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      draft: { ...editing.draft, validation: e.target.value },
                    })
                  }
                  placeholder={'{"minLength":2,"maxLength":80}'}
                />
                <p className="m-0 text-xs text-muted-foreground">{t("ja.field.validationHint")}</p>
              </div>

              {draftType?.choice && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="jf-options">{t("ja.field.options")}</Label>
                    <Textarea
                      id="jf-options"
                      rows={2}
                      className="font-mono text-xs"
                      value={editing.draft.options}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          draft: { ...editing.draft, options: e.target.value },
                        })
                      }
                      placeholder={'["SALARY","BUSINESS"]'}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jf-lov">{t("ja.field.lovSource")}</Label>
                    <Input
                      id="jf-lov"
                      value={editing.draft.lovSource}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          draft: { ...editing.draft, lovSource: e.target.value },
                        })
                      }
                    />
                    <p className="m-0 text-xs text-muted-foreground">{t("ja.field.lovHint")}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="jf-visible-when">{t("ja.field.visibleWhen")}</Label>
                <Input
                  id="jf-visible-when"
                  className="font-mono text-xs"
                  value={editing.draft.visibleWhen}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      draft: { ...editing.draft, visibleWhen: e.target.value },
                    })
                  }
                  placeholder={'{"field":"isPep","equals":"true"}'}
                />
              </div>

              {jsonError && (
                <p className="m-0 text-sm text-destructive">{jsonError}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("common:cancel")}
            </Button>
            <Button onClick={commit}>{t("common:done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
