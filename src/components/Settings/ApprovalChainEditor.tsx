import { DragDropContext, Draggable, Droppable, type DropResult } from "react-beautiful-dnd";
import { AlertTriangle, GripVertical, Plus, Trash2, UserX } from "lucide-react";

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

/**
 * The chain builder: an ordered list of stages, each naming a department and a
 * role, and each saying where a rejection at that stage goes.
 *
 * Two things the list itself carries, rather than any field:
 *
 *   - **Order.** Position is the sequence number; there is no sequence field to
 *     edit and none is ever sent.
 *   - **The initiator.** The first row is it, by being first. It creates and is
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

  const addStage = () => onChange([...stages, newStageDraft()]);

  const removeStage = (index: number) =>
    onChange(pruneRejectTargets(stages.filter((_, i) => i !== index)));

  const pickable = selectableDepartments(departments, stages);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onChange(moveStage(stages, result.source.index, result.destination.index));
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Drag to reorder. The first stage creates the request; every stage below it approves, and
          says where a rejection goes.
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addStage}
          disabled={disabled || stages.length >= MAX_STAGES}
        >
          <Plus className="h-4 w-4" /> Add stage
        </Button>
      </div>

      {stages.length >= MAX_STAGES && (
        <LexNotice tone="amber">A chain cannot have more than {MAX_STAGES} stages.</LexNotice>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="approval-stages">
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className="flex flex-col gap-3"
            >
              {stages.map((stage, index) => {
                const rowErrors = errors[index] || {};
                const roleState = rolesByDepartment[stage.departmentId];
                const roles = roleState?.roles || [];
                const rolesLoading = !!roleState?.loading;
                // Answered, and the department has nothing to offer. Most roles
                // predate departments and belong to none, so this is common and
                // an empty dropdown with no explanation is a dead end.
                const noRoles =
                  !!stage.departmentId && !!roleState && !rolesLoading && roles.length === 0;
                const targets = earlierStages(stages, index);
                const isInitiator = index === 0;

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
                        className={cn(
                          "rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] p-3",
                          snapshot.isDragging && "ring-2 ring-primary/40"
                        )}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span
                            {...dragProvided.dragHandleProps}
                            className="cursor-grab text-muted-foreground"
                            aria-label="Reorder stage"
                          >
                            <GripVertical className="h-4 w-4" />
                          </span>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          {isInitiator ? (
                            /* Not `variant="secondary"`: Bootstrap's `.bg-secondary`
                               utility wins over the Tailwind token of the same
                               name, which renders the badge grey-on-black. */
                            <Badge
                              variant="outline"
                              className="border-primary/30 bg-primary/10 text-primary"
                            >
                              Initiator — creates the request
                            </Badge>
                          ) : (
                            <Badge variant="outline">Approval stage</Badge>
                          )}
                          <div className="ms-auto">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeStage(index)}
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
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <Label className="mb-1 block text-xs">Stage code</Label>
                            <Input
                              value={stage.stageCode}
                              onChange={(e) =>
                                patch(index, { stageCode: normalizeCode(e.target.value) })
                              }
                              placeholder="MAKER"
                              // The code is the stage's identity on save: changing
                              // it deletes the stage and inserts a new one rather
                              // than renaming it, so it is frozen once saved.
                              disabled={disabled || stage.persisted}
                              aria-invalid={!!rowErrors.stageCode}
                            />
                            {stage.persisted ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Fixed after the first save.
                              </p>
                            ) : null}
                            <FieldError message={rowErrors.stageCode} />
                          </div>

                          <div>
                            <Label className="mb-1 block text-xs">Stage name</Label>
                            <Input
                              value={stage.stageName}
                              onChange={(e) => patch(index, { stageName: e.target.value })}
                              placeholder="Create"
                              maxLength={255}
                              disabled={disabled}
                              aria-invalid={!!rowErrors.stageName}
                            />
                            <FieldError message={rowErrors.stageName} />
                          </div>

                          <div>
                            <Label className="mb-1 block text-xs">Stage name (Arabic)</Label>
                            <Input
                              value={stage.stageNameAr}
                              onChange={(e) => patch(index, { stageNameAr: e.target.value })}
                              dir="rtl"
                              maxLength={255}
                              disabled={disabled}
                            />
                          </div>

                          <div>
                            <Label className="mb-1 block text-xs">Result status</Label>
                            <Input
                              value={stage.resultStatus}
                              onChange={(e) =>
                                patch(index, { resultStatus: normalizeCode(e.target.value) })
                              }
                              placeholder={isInitiator ? "PENDING" : "APPROVED_BY_CHECKER"}
                              disabled={disabled}
                              aria-invalid={!!rowErrors.resultStatus}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                              Where the request moves when this stage passes.
                            </p>
                            <FieldError message={rowErrors.resultStatus} />
                          </div>

                          <div>
                            <Label className="mb-1 block text-xs">Department</Label>
                            <Select
                              value={stage.departmentId || undefined}
                              onValueChange={(value) => pickDepartment(index, value)}
                              disabled={disabled}
                            >
                              <SelectTrigger aria-invalid={!!rowErrors.departmentId}>
                                <SelectValue placeholder="Pick a department" />
                              </SelectTrigger>
                              <SelectContent>
                                {pickable.map((department) => (
                                  <SelectItem key={department.id} value={department.id}>
                                    {department.departmentName}
                                    {department.departmentCode
                                      ? ` (${department.departmentCode})`
                                      : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldError message={rowErrors.departmentId} />
                          </div>

                          <div>
                            <Label className="mb-1 block text-xs">Role</Label>
                            {/* Keyed on the department: Radix caches the node of
                                the item that was selected, so clearing the value
                                when the department changes leaves the trigger
                                blank instead of re-prompting. Remounting is what
                                makes "Pick a role" come back. */}
                            <Select
                              key={`role-${stage.key}-${stage.departmentId}`}
                              value={stage.roleId || undefined}
                              onValueChange={(value) => patch(index, { roleId: value })}
                              disabled={disabled || !stage.departmentId || rolesLoading || noRoles}
                            >
                              <SelectTrigger aria-invalid={!!rowErrors.roleId}>
                                <SelectValue
                                  placeholder={
                                    !stage.departmentId
                                      ? "Pick a department first"
                                      : rolesLoading
                                        ? "Loading roles…"
                                        : "Pick a role"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {roleLabel(role)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {noRoles && (
                              <p className="mt-1 text-xs text-amber-600">
                                This department has no roles yet. Assign roles to it on the
                                Departments screen before using it in a stage.
                              </p>
                            )}
                            <FieldError message={rowErrors.roleId} />
                          </div>

                          <div>
                            <Label className="mb-1 block text-xs">Approval policy</Label>
                            <Select
                              value={stage.approvalPolicy}
                              onValueChange={(value) =>
                                patch(index, { approvalPolicy: value as ApprovalPolicy })
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
                        </div>

                        {/* The initiator is the thing being rejected — it has no
                            reject route, and sending one is an error. */}
                        {!isInitiator && (
                          <div className="mt-3 grid gap-3 rounded-md bg-muted/40 p-3 md:grid-cols-2">
                            <div>
                              <Label className="mb-1 block text-xs">On rejection</Label>
                              <Select
                                value={stage.onRejectAction}
                                onValueChange={(value) =>
                                  patch(index, {
                                    onRejectAction: value as OnRejectAction,
                                    // Only RETURN_TO_STAGE carries a target;
                                    // leaving one behind is REJECT_TARGET_INVALID.
                                    onRejectStageCode: needsRejectTarget(value as OnRejectAction)
                                      ? stage.onRejectStageCode
                                      : "",
                                  })
                                }
                                disabled={disabled}
                              >
                                <SelectTrigger aria-invalid={!!rowErrors.onRejectAction}>
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
                              <FieldError message={rowErrors.onRejectAction} />
                            </div>

                            {needsRejectTarget(stage.onRejectAction) && (
                              <div>
                                <Label className="mb-1 block text-xs">Goes back to</Label>
                                {/* Same reason: a reorder can prune this target,
                                    and the trigger has to say so rather than go
                                    blank. Keyed on the reachable set, so it
                                    remounts whenever that set changes. */}
                                <Select
                                  key={`target-${stage.key}-${targets.map((t) => t.stageCode).join("|")}`}
                                  value={stage.onRejectStageCode || undefined}
                                  onValueChange={(value) =>
                                    patch(index, { onRejectStageCode: value })
                                  }
                                  disabled={disabled || targets.length === 0}
                                >
                                  <SelectTrigger aria-invalid={!!rowErrors.onRejectStageCode}>
                                    <SelectValue
                                      placeholder={
                                        targets.length === 0
                                          ? "No stage above has a code yet"
                                          : "Pick a stage above"
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {/* Only stages above this one — the server
                                        refuses a forward or self target. */}
                                    {targets.map((target, targetIndex) => (
                                      <SelectItem key={target.key} value={target.stageCode}>
                                        {targetIndex + 1}. {target.stageName || target.stageCode}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FieldError message={rowErrors.onRejectStageCode} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Advisory only. An admin legitimately defines a chain
                            before hiring into the role, so this never blocks. */}
                        {stage.eligibleApproverCount === 0 && (
                          <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                            <UserX className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>
                              No one currently holds this role, so requests will stop here until
                              someone is assigned.
                            </span>
                          </div>
                        )}

                        {rowErrors.form && (
                          <div className="mt-3 flex items-start gap-2 text-xs text-destructive">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{rowErrors.form}</span>
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
    </div>
  );
};

export default ApprovalChainEditor;
