import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "react-beautiful-dnd";
import {
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  CornerUpLeft,
  GripVertical,
  Plus,
  Trash2,
  UserX,
  Zap,
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LexNotice } from "../shared/lexKit";
import { cn } from "../../lib/utils";
import {
  needsRejectTarget,
  ON_REJECT_ACTIONS,
  type ApprovalPolicy,
  type OnRejectAction,
} from "../../redux/apis/apisApprovalWorkflows";
import type { Department } from "../../redux/apis/apisDepartments";
import {
  earlierStages,
  MAX_STAGES,
  moveStage,
  newStageDraft,
  normalizeCode,
  suggestStageCode,
  pruneRejectTargets,
  type ChainErrors,
  type StageDraft,
} from "./approvalChainUtils";

/** Roles as `/departments/{id}/roles` returns them — only the fields a stage needs. */
export interface DepartmentRole {
  id: string;
  roleCode?: string;
  roleName?: string;
  name?: string;
  active?: boolean;
}

/**
 * What the page knows about one department's roles. `undefined` means nobody has
 * asked yet, which is a different thing from an answered-and-empty department —
 * and the empty case needs saying out loud rather than showing a dead dropdown.
 */
export type RoleState = { loading: boolean; roles: DepartmentRole[] } | undefined;

interface Props {
  stages: StageDraft[];
  onChange: (stages: StageDraft[]) => void;
  departments: Department[];
  rolesByDepartment: Record<string, RoleState>;
  /** Called when a department is chosen and its roles have not been fetched yet. */
  onRequestRoles: (departmentId: string) => void;
  errors: ChainErrors;
  disabled?: boolean;
}

const roleLabel = (role: DepartmentRole) => role.roleName || role.name || role.roleCode || role.id;

/**
 * A deactivated department is refused as a stage target (DEPARTMENT_INACTIVE),
 * so it is not offered — but one a saved chain already routes to stays in the
 * list, or the stage's department reads as unset and the admin cannot see what
 * the chain actually says.
 */
const selectableDepartments = (departments: Department[], stages: StageDraft[]) => {
  const inUse = new Set(stages.map((stage) => stage.departmentId).filter(Boolean));
  return departments.filter((department) => department.active || inUse.has(department.id));
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;

const hasError = (row?: Record<string, string | undefined>) =>
  !!row && Object.values(row).some(Boolean);

/** The vertical rule the nodes hang off, drawn between two cards. */
const Connector = ({ children }: { children?: React.ReactNode }) => (
  <div className="relative flex flex-col items-center">
    <span className="h-4 w-px bg-[var(--surface-border-strong)]" />
    {children}
    <span className="h-4 w-px bg-[var(--surface-border-strong)]" />
  </div>
);

/** The `+` that drops a stage in at this point in the chain. */
const InsertButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title="Insert a stage here"
    aria-label="Insert a stage here"
    className={cn(
      "flex h-6 w-6 items-center justify-center rounded-md border border-dashed",
      "border-[var(--surface-border-strong)] bg-[var(--surface-card)] text-muted-foreground",
      "transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-[var(--surface-border-strong)] disabled:hover:text-muted-foreground"
    )}
  >
    <Plus className="h-3.5 w-3.5" />
  </button>
);

/**
 * The chain builder: a flow canvas on the left, and the selected stage's fields
 * on the right.
 *
 * The canvas is the point. A chain is a path — stage to stage, with rejections
 * running back up it — and a stack of open forms hides that shape behind the
 * fields. Here each stage is one small node showing only who acts and what it
 * decides; its rejection route is drawn as an arrow back up the chain, and the
 * whole path fits on a screen no matter how many stages it has.
 *
 * Two things the order of the nodes carries, rather than any field:
 *
 *   - **Sequence.** Position is the sequence number; there is no sequence field
 *     to edit and none is ever sent.
 *   - **The initiator.** The top node is it, by being first. It creates and is
 *     never rejected, so its reject block is not disabled — it is absent.
 */
const ApprovalChainEditor = ({
  stages,
  onChange,
  departments,
  rolesByDepartment,
  onRequestRoles,
  errors,
  disabled,
}: Props) => {
  // Nothing is open until a node is clicked. The canvas already says what every
  // stage does, so opening one by default would put a form in front of the shape
  // the admin came to read.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // A node can vanish under the selection (deleted here, or the page reloading a
  // saved chain into fresh drafts), and a panel pinned to a key nothing holds any
  // more would simply be blank.
  useEffect(() => {
    if (selectedKey && !stages.some((stage) => stage.key === selectedKey)) {
      setSelectedKey(null);
    }
  }, [stages, selectedKey]);

  // Errors are raised on save against the whole chain, and the offending stage is
  // usually not the open one. Jumping to the first bad node is what makes the
  // messages in the panel reachable at all.
  const firstErrorIndex = useMemo(
    () => stages.findIndex((_, index) => hasError(errors[index])),
    [stages, errors]
  );
  useEffect(() => {
    if (firstErrorIndex >= 0) setSelectedKey(stages[firstErrorIndex].key);
    // Only when the error set itself changes — not on every selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  const selectedIndex = stages.findIndex((stage) => stage.key === selectedKey);
  const selected = selectedIndex >= 0 ? stages[selectedIndex] : undefined;

  const patch = (index: number, changes: Partial<StageDraft>) => {
    const next = stages.map((stage, i) => (i === index ? { ...stage, ...changes } : stage));
    // A changed code can orphan a pointer aimed at the old one.
    onChange(changes.stageCode !== undefined ? pruneRejectTargets(next) : next);
  };

  const pickDepartment = (index: number, departmentId: string) => {
    // The role must belong to the stage's department, so it cannot survive a
    // department change — keeping it is how ROLE_DEPARTMENT_MISMATCH happens.
    patch(index, { departmentId, roleId: "" });
    if (!rolesByDepartment[departmentId]) onRequestRoles(departmentId);
  };

  const insertStageAt = (index: number) => {
    const draft = newStageDraft(suggestStageCode(index, stages));
    const next = [...stages.slice(0, index), draft, ...stages.slice(index)];
    // The new row can push a stage below its own reject target's new position.
    onChange(pruneRejectTargets(next));
    setSelectedKey(draft.key);
  };

  const removeStage = (index: number) =>
    onChange(pruneRejectTargets(stages.filter((_, i) => i !== index)));

  const pickable = selectableDepartments(departments, stages);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onChange(moveStage(stages, result.source.index, result.destination.index));
  };

  const departmentName = (id: string) =>
    departments.find((department) => department.id === id)?.departmentName;

  /** What a node says about its rejection route, in one short line. */
  const rejectSummary = (stage: StageDraft) => {
    if (stage.onRejectAction === "RETURN_TO_INITIATOR") return "Rejected → creator";
    if (stage.onRejectAction === "RETURN_TO_PREVIOUS") return "Rejected → stage above";
    return stage.onRejectStageCode
      ? `Rejected → ${stage.onRejectStageCode}`
      : "Rejected → not set";
  };

  const atMax = stages.length >= MAX_STAGES;

  const panelErrors = selectedIndex >= 0 ? errors[selectedIndex] || {} : {};
  const selectedRoleState = selected ? rolesByDepartment[selected.departmentId] : undefined;
  const selectedRoles = selectedRoleState?.roles || [];
  const selectedRolesLoading = !!selectedRoleState?.loading;
  // Answered, and the department has nothing to offer. Most roles predate
  // departments and belong to none, so this is common and an empty dropdown with
  // no explanation is a dead end.
  const selectedNoRoles =
    !!selected?.departmentId &&
    !!selectedRoleState &&
    !selectedRolesLoading &&
    selectedRoles.length === 0;
  const targets = selectedIndex > 0 ? earlierStages(stages, selectedIndex) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* ── The canvas ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card-alt)] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Click a stage to edit it. Drag to reorder, or use <Plus className="inline h-3 w-3" /> to
            insert one.
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => insertStageAt(stages.length)}
            disabled={disabled || atMax}
          >
            <Plus className="h-4 w-4" /> Add stage
          </Button>
        </div>

        {atMax && <LexNotice tone="amber">A chain cannot have more than {MAX_STAGES} stages.</LexNotice>}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="approval-stages">
            {(dropProvided) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className="flex flex-col items-center py-2"
              >
                {/* The chain has a start, and saying so is what makes the top
                    node read as the trigger rather than just the first row. */}
                <div className="flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Request is raised
                </div>

                {stages.map((stage, index) => {
                  const rowErrors = errors[index] || {};
                  const isInitiator = index === 0;
                  const isSelected = stage.key === selectedKey;
                  const bad = hasError(rowErrors);
                  const dept = departmentName(stage.departmentId);
                  const role = selectableRoleLabel(rolesByDepartment, stage);

                  return (
                    <Draggable
                      key={stage.key}
                      draggableId={stage.key}
                      index={index}
                      isDragDisabled={disabled}
                    >
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className="flex flex-col items-center"
                        >
                          <Connector>
                            <InsertButton
                              onClick={() => insertStageAt(index)}
                              disabled={disabled || atMax}
                            />
                          </Connector>

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedKey(stage.key)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedKey(stage.key);
                              }
                            }}
                            className={cn(
                              "w-full max-w-md cursor-pointer rounded-xl border bg-[var(--surface-card)] px-3 py-2.5 text-start shadow-sm transition",
                              "border-[var(--surface-border)] hover:border-primary/50 hover:shadow",
                              isSelected && "border-primary ring-2 ring-primary/25",
                              bad && "border-destructive ring-2 ring-destructive/25",
                              snapshot.isDragging && "shadow-lg"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                {...dragProvided.dragHandleProps}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-grab text-muted-foreground"
                                aria-label="Reorder stage"
                              >
                                <GripVertical className="h-4 w-4" />
                              </span>
                              <span
                                className={cn(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                                  isInitiator
                                    ? "bg-primary/10 text-primary"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {isInitiator ? (
                                  <Zap className="h-4 w-4" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-semibold">
                                    {stage.stageName || stage.stageCode || "Untitled stage"}
                                  </span>
                                  {isInitiator && (
                                    /* Not `variant="secondary"`: Bootstrap's
                                       `.bg-secondary` utility wins over the
                                       Tailwind token of the same name, which
                                       renders the badge grey-on-black. */
                                    <Badge
                                      variant="outline"
                                      className="border-primary/30 bg-primary/10 text-primary"
                                    >
                                      Initiator
                                    </Badge>
                                  )}
                                  {stage.approvalPolicy === "ANY" && !isInitiator && (
                                    <Badge variant="outline">Any one</Badge>
                                  )}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {dept || "No department"}
                                  {role ? ` · ${role}` : ""}
                                  {stage.resultStatus ? ` → ${stage.resultStatus}` : ""}
                                </div>
                              </div>

                              {bad && (
                                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                              )}
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStage(index);
                                }}
                                disabled={disabled || stages.length <= 1}
                                title={
                                  stages.length <= 1
                                    ? "A workflow needs at least one stage."
                                    : "Remove this stage"
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            {/* Advisory only. An admin legitimately defines a
                                chain before hiring into the role, so this never
                                blocks. */}
                            {stage.eligibleApproverCount === 0 && (
                              <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-400">
                                <UserX className="mt-0.5 h-3 w-3 shrink-0" />
                                <span>Nobody holds this role — requests will stop here.</span>
                              </div>
                            )}
                          </div>

                          {/* The rejection route, drawn beside the node it
                              leaves from — the one thing a linear list of forms
                              could never show. */}
                          {!isInitiator && (
                            <div
                              className={cn(
                                "mt-1 flex items-center gap-1 text-[11px]",
                                stage.onRejectAction === "RETURN_TO_STAGE" &&
                                  !stage.onRejectStageCode
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              <CornerUpLeft className="h-3 w-3" />
                              {rejectSummary(stage)}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {dropProvided.placeholder}

                <Connector>
                  <InsertButton
                    onClick={() => insertStageAt(stages.length)}
                    disabled={disabled || atMax}
                  />
                </Connector>
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <ArrowDown className="h-3.5 w-3.5" />
                  Finally approved
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* ── The panel ──────────────────────────────────────────────────── */}
      <div className="h-fit rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 lg:sticky lg:top-4">
        {!selected ? (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No stage open</p>
            <p className="mt-1">
              Click a stage on the canvas to edit its code, department, role and rejection route.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-sm font-semibold">
                Stage {selectedIndex + 1} of {stages.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedIndex === 0
                  ? "The initiator. It creates the request and is never rejected."
                  : "An approval stage. It also says where a rejection here goes."}
              </p>
            </div>

            <div>
              <Label className="mb-1 block text-xs">Stage code</Label>
              <Input
                value={selected.stageCode}
                onChange={(e) =>
                  patch(selectedIndex, { stageCode: normalizeCode(e.target.value) })
                }
                placeholder="MAKER"
                // The code is the stage's identity on save: changing it deletes
                // the stage and inserts a new one rather than renaming it, so it
                // is frozen once saved.
                disabled={disabled || selected.persisted}
                aria-invalid={!!panelErrors.stageCode}
              />
              {selected.persisted ? (
                <p className="mt-1 text-xs text-muted-foreground">Fixed after the first save.</p>
              ) : null}
              <FieldError message={panelErrors.stageCode} />
            </div>

            <div>
              <Label className="mb-1 block text-xs">Stage name</Label>
              <Input
                value={selected.stageName}
                onChange={(e) => patch(selectedIndex, { stageName: e.target.value })}
                placeholder="Create"
                maxLength={255}
                disabled={disabled}
                aria-invalid={!!panelErrors.stageName}
              />
              <FieldError message={panelErrors.stageName} />
            </div>

            <div>
              <Label className="mb-1 block text-xs">Stage name (Arabic)</Label>
              <Input
                value={selected.stageNameAr}
                onChange={(e) => patch(selectedIndex, { stageNameAr: e.target.value })}
                dir="rtl"
                maxLength={255}
                disabled={disabled}
              />
            </div>

            <div>
              <Label className="mb-1 block text-xs">Department</Label>
              <Select
                value={selected.departmentId || undefined}
                onValueChange={(value) => pickDepartment(selectedIndex, value)}
                disabled={disabled}
              >
                <SelectTrigger aria-invalid={!!panelErrors.departmentId}>
                  <SelectValue placeholder="Pick a department" />
                </SelectTrigger>
                <SelectContent>
                  {pickable.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.departmentName}
                      {department.departmentCode ? ` (${department.departmentCode})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={panelErrors.departmentId} />
            </div>

            <div>
              <Label className="mb-1 block text-xs">Role</Label>
              {/* Keyed on the department: Radix caches the node of the item that
                  was selected, so clearing the value when the department changes
                  leaves the trigger blank instead of re-prompting. Remounting is
                  what makes "Pick a role" come back. */}
              <Select
                key={`role-${selected.key}-${selected.departmentId}`}
                value={selected.roleId || undefined}
                onValueChange={(value) => patch(selectedIndex, { roleId: value })}
                disabled={
                  disabled || !selected.departmentId || selectedRolesLoading || selectedNoRoles
                }
              >
                <SelectTrigger aria-invalid={!!panelErrors.roleId}>
                  <SelectValue
                    placeholder={
                      !selected.departmentId
                        ? "Pick a department first"
                        : selectedRolesLoading
                          ? "Loading roles…"
                          : "Pick a role"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectedRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {roleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedNoRoles && (
                <p className="mt-1 text-xs text-amber-600">
                  This department has no roles yet. Assign roles to it on the Departments screen
                  before using it in a stage.
                </p>
              )}
              <FieldError message={panelErrors.roleId} />
            </div>

            <div>
              <Label className="mb-1 block text-xs">Approval policy</Label>
              <Select
                value={selected.approvalPolicy}
                onValueChange={(value) =>
                  patch(selectedIndex, { approvalPolicy: value as ApprovalPolicy })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All must approve</SelectItem>
                  <SelectItem value="ANY">Any one may approve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block text-xs">Result status</Label>
              <Input
                value={selected.resultStatus}
                onChange={(e) =>
                  patch(selectedIndex, { resultStatus: normalizeCode(e.target.value) })
                }
                placeholder={selectedIndex === 0 ? "PENDING" : "APPROVED_BY_CHECKER"}
                disabled={disabled}
                aria-invalid={!!panelErrors.resultStatus}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Where the request moves when this stage passes.
              </p>
              <FieldError message={panelErrors.resultStatus} />
            </div>

            {/* The initiator is the thing being rejected — it has no reject
                route, and sending one is an error. */}
            {selectedIndex > 0 && (
              <div className="flex flex-col gap-3 rounded-md bg-muted/40 p-3">
                <div>
                  <Label className="mb-1 block text-xs">On rejection</Label>
                  <Select
                    value={selected.onRejectAction}
                    onValueChange={(value) =>
                      patch(selectedIndex, {
                        onRejectAction: value as OnRejectAction,
                        // Only RETURN_TO_STAGE carries a target; leaving one
                        // behind is REJECT_TARGET_INVALID.
                        onRejectStageCode: needsRejectTarget(value as OnRejectAction)
                          ? selected.onRejectStageCode
                          : "",
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger aria-invalid={!!panelErrors.onRejectAction}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ON_REJECT_ACTIONS.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={panelErrors.onRejectAction} />
                </div>

                {needsRejectTarget(selected.onRejectAction) && (
                  <div>
                    <Label className="mb-1 block text-xs">Goes back to</Label>
                    {/* Same reason: a reorder can prune this target, and the
                        trigger has to say so rather than go blank. Keyed on the
                        reachable set, so it remounts whenever that set changes. */}
                    <Select
                      key={`target-${selected.key}-${targets.map((t) => t.stageCode).join("|")}`}
                      value={selected.onRejectStageCode || undefined}
                      onValueChange={(value) => patch(selectedIndex, { onRejectStageCode: value })}
                      disabled={disabled || targets.length === 0}
                    >
                      <SelectTrigger aria-invalid={!!panelErrors.onRejectStageCode}>
                        <SelectValue
                          placeholder={
                            targets.length === 0
                              ? "No stage above has a code yet"
                              : "Pick a stage above"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Only stages above this one — the server refuses a
                            forward or self target. */}
                        {targets.map((target, targetIndex) => (
                          <SelectItem key={target.key} value={target.stageCode}>
                            {targetIndex + 1}. {target.stageName || target.stageCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={panelErrors.onRejectStageCode} />
                  </div>
                )}
              </div>
            )}

            {panelErrors.form && (
              <div className="flex items-start gap-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{panelErrors.form}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * The role's name for the node subtitle. The roles of a department are only
 * fetched once it has been opened in the panel, so an unopened stage shows its
 * department alone rather than a wrong or empty name.
 */
const selectableRoleLabel = (
  rolesByDepartment: Record<string, RoleState>,
  stage: StageDraft
): string | undefined => {
  if (!stage.roleId) return undefined;
  const role = rolesByDepartment[stage.departmentId]?.roles.find((r) => r.id === stage.roleId);
  return role ? roleLabel(role) : undefined;
};

export default ApprovalChainEditor;
