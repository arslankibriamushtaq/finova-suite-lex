import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Pencil,
  PauseCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { Textarea } from "../../../components/ui/textarea";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
import { formatDate } from "../../../components/shared/detailKitUtils";
import { cn } from "../../../lib/utils";
import ApprovalChainEditor, {
  type DepartmentRole,
  type RoleState,
} from "../../../components/Settings/ApprovalChainEditor";
import {
  hasChainErrors,
  newStageDraft,
  toStageDraft,
  toStagePayload,
  validateChain,
  type ChainErrors,
  type StageDraft,
} from "../../../components/Settings/approvalChainUtils";
import {
  activateApprovalWorkflow,
  createApprovalWorkflow,
  deactivateApprovalWorkflow,
  deleteApprovalWorkflow,
  errorCodeOf,
  getActiveWorkflowForFlowType,
  getApprovalFlowTypes,
  getApprovalWorkflow,
  getApprovalWorkflows,
  isAccessDenied,
  stageErrorField,
  updateApprovalWorkflow,
  updateApprovalWorkflowStages,
  workflowMessage,
  WORKFLOW_ERRORS,
  type ApprovalFlowType,
  type ApprovalWorkflow,
} from "../../../redux/apis/apisApprovalWorkflows";
import {
  getDepartmentRoles,
  getDepartments,
  type Department,
} from "../../../redux/apis/apisDepartments";
import {
  usePermissions,
  APPROVAL_WORKFLOW_PERMISSIONS,
} from "../../../hooks/useProductPermissions";

type Mode = "list" | "create" | "edit";

const emptyHeader = { flowTypeCode: "", workflowName: "", description: "" };

/**
 * Maker-checker chains: per business flow, an ordered list of stages, each
 * naming a department and a role, and each saying where a rejection at that
 * stage goes.
 *
 * Definition only — identity-service defines chains here, it does not run them.
 * Nothing on this screen approves or rejects anything.
 */
const ApprovalWorkflows = () => {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission(APPROVAL_WORKFLOW_PERMISSIONS.LIST);
  const canCreate = hasPermission(APPROVAL_WORKFLOW_PERMISSIONS.CREATE);
  const canEdit = hasPermission(APPROVAL_WORKFLOW_PERMISSIONS.EDIT);
  const canDelete = hasPermission(APPROVAL_WORKFLOW_PERMISSIONS.DELETE);

  const [mode, setMode] = useState<Mode>("list");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [denied, setDenied] = useState(false);

  const [flowTypes, setFlowTypes] = useState<ApprovalFlowType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);

  const [current, setCurrent] = useState<ApprovalWorkflow | null>(null);
  const [header, setHeader] = useState(emptyHeader);
  const [stages, setStages] = useState<StageDraft[]>([]);
  const [errors, setErrors] = useState<ChainErrors>({});
  const [formError, setFormError] = useState<string>("");

  const [rolesByDepartment, setRolesByDepartment] = useState<Record<string, RoleState>>({});

  const [deleteTarget, setDeleteTarget] = useState<ApprovalWorkflow | null>(null);
  // The incumbent an activate collided with, so the offer to stand it down names it.
  const [incumbent, setIncumbent] = useState<{
    blocked: ApprovalWorkflow;
    live?: ApprovalWorkflow;
    message: string;
  } | null>(null);

  const flowTypeByCode = useMemo(() => {
    const map: Record<string, ApprovalFlowType> = {};
    flowTypes.forEach((type) => {
      map[type.flowTypeCode] = type;
    });
    return map;
  }, [flowTypes]);

  const flowTypeName = useCallback(
    (code: string) => flowTypeByCode[code]?.flowTypeName || code,
    [flowTypeByCode]
  );

  /**
   * Workflows under the flow type they govern.
   *
   * The grouping is the point, not decoration: "one live chain per flow type" is
   * the rule the whole screen turns on, and a flat list cannot show whether a
   * flow type is currently governed at all. Grouped, each heading answers it.
   *
   * Flow types the admin has no workflow for are left out — they are not a gap
   * to fill from here, and listing every seeded type would bury the real ones.
   */
  const groups = useMemo(() => {
    const byCode = new Map<string, ApprovalWorkflow[]>();
    workflows.forEach((row) => {
      const list = byCode.get(row.flowTypeCode) || [];
      list.push(row);
      byCode.set(row.flowTypeCode, list);
    });
    return [...byCode.entries()]
      .map(([code, items]) => ({
        code,
        flowType: flowTypeByCode[code],
        items: [...items].sort(
          (a, b) =>
            Number(b.active) - Number(a.active) || a.workflowName.localeCompare(b.workflowName)
        ),
        live: items.find((i) => i.active),
      }))
      .sort(
        (a, b) =>
          (a.flowType?.displayOrder ?? 999) - (b.flowType?.displayOrder ?? 999) ||
          a.code.localeCompare(b.code)
      );
  }, [workflows, flowTypeByCode]);

  /**
   * Roles come from `/departments/{id}/roles`, never from the flat role list:
   * the server enforces that a stage's role belongs to that stage's department,
   * so a free list produces ROLE_DEPARTMENT_MISMATCH on save.
   */
  const loadRoles = useCallback(async (departmentId: string) => {
    if (!departmentId) return;
    setRolesByDepartment((prev) =>
      prev[departmentId] ? prev : { ...prev, [departmentId]: { loading: true, roles: [] } }
    );
    try {
      const res = await getDepartmentRoles(departmentId);
      const rows: DepartmentRole[] = Array.isArray(res?.data?.data) ? res.data.data : [];
      setRolesByDepartment((prev) => ({
        ...prev,
        [departmentId]: { loading: false, roles: rows },
      }));
    } catch (error) {
      setRolesByDepartment((prev) => ({
        ...prev,
        [departmentId]: { loading: false, roles: [] },
      }));
      toast.error(workflowMessage(error, "Could not load the roles for that department."));
    }
  }, []);

  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const [flowRes, workflowRes, deptRes] = await Promise.all([
        getApprovalFlowTypes(0, 100),
        getApprovalWorkflows(0, 200),
        getDepartments(0, 200),
      ]);
      const types: ApprovalFlowType[] = Array.isArray(flowRes?.data?.data) ? flowRes.data.data : [];
      setFlowTypes([...types].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
      setWorkflows(Array.isArray(workflowRes?.data?.data) ? workflowRes.data.data : []);
      setDepartments(Array.isArray(deptRes?.data?.data) ? deptRes.data.data : []);
      setDenied(false);
    } catch (error) {
      if (isAccessDenied(error)) {
        setDenied(true);
      } else {
        toast.error(workflowMessage(error, "Could not load the approval workflows."));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canRead) loadWorkflows();
    else setIsLoading(false);
  }, [canRead, loadWorkflows]);

  // ---------------------------------------------------------------------
  // Opening the editor
  // ---------------------------------------------------------------------

  const openCreate = () => {
    setCurrent(null);
    setHeader(emptyHeader);
    setStages([newStageDraft()]);
    setErrors({});
    setFormError("");
    setMode("create");
  };

  const openEdit = async (row: ApprovalWorkflow) => {
    setIsLoading(true);
    try {
      // The list is header-only — every row comes back with `stages: []` — so
      // the chain has to be fetched before it can be rendered.
      const res = await getApprovalWorkflow(row.id);
      const detail: ApprovalWorkflow = res?.data?.data;
      const drafts = (detail?.stages || []).map(toStageDraft);
      setCurrent(detail);
      setHeader({
        flowTypeCode: detail.flowTypeCode,
        workflowName: detail.workflowName || "",
        description: detail.description || "",
      });
      setStages(drafts.length ? drafts : [newStageDraft()]);
      setErrors({});
      setFormError("");
      setMode("edit");
      // Every department already on the chain needs its role list, or the role
      // dropdowns open empty on a chain that is perfectly valid.
      [...new Set(drafts.map((d) => d.departmentId).filter(Boolean))].forEach(loadRoles);
    } catch (error) {
      toast.error(workflowMessage(error, "Could not open that workflow."));
    } finally {
      setIsLoading(false);
    }
  };

  const backToList = () => {
    setMode("list");
    setCurrent(null);
    setErrors({});
    setFormError("");
  };

  // ---------------------------------------------------------------------
  // Saving
  // ---------------------------------------------------------------------

  /**
   * A stage-level 422 names the offending stage in a localized message, not in a
   * structured field, so the code is mapped to a control and — where the client
   * can tell which row it is — anchored there. Otherwise it sits at form level
   * with the server's own text, which is already in the admin's language.
   */
  const applyServerError = (error: unknown, fallback: string) => {
    const code = errorCodeOf(error);
    const field = stageErrorField(code);
    const message = workflowMessage(error, fallback);
    setFormError(message);
    toast.error(message);

    if (!field || field === "form") return;
    // Best effort at putting the error on the row that caused it. The response
    // has no structured stage reference, but the message quotes the stage code,
    // and a stage code is the one part of it that is not localized. When no code
    // matches, the form-level message above is the whole answer.
    const guilty = stages.findIndex(
      (stage) => stage.stageCode && message.includes(stage.stageCode)
    );
    if (guilty >= 0) {
      setErrors((prev) => ({
        ...prev,
        [guilty]: { ...(prev[guilty] || {}), [field]: message },
      }));
    }
  };

  const save = async () => {
    const chainErrors = validateChain(stages);
    setErrors(chainErrors);
    setFormError("");

    if (!header.flowTypeCode) {
      setFormError("Pick the flow type this chain governs.");
      return;
    }
    if (!header.workflowName.trim()) {
      setFormError("Give the workflow a name.");
      return;
    }
    if (hasChainErrors(chainErrors)) {
      setFormError("Some stages need fixing before this can be saved.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = toStagePayload(stages);
      if (mode === "create") {
        await createApprovalWorkflow({
          flowTypeCode: header.flowTypeCode,
          workflowName: header.workflowName.trim(),
          description: header.description.trim() || null,
          stages: payload,
        });
        toast.success("Workflow created.");
      } else if (current) {
        // Two endpoints by design: the header PUT does not touch stages, and the
        // stages PUT does not touch the header. Only send the header when it
        // actually changed — `null` there means "leave unchanged", not "clear".
        const nameChanged = header.workflowName.trim() !== (current.workflowName || "");
        const descChanged = header.description.trim() !== (current.description || "");
        if (nameChanged || descChanged) {
          await updateApprovalWorkflow(current.id, {
            workflowName: header.workflowName.trim(),
            description: header.description.trim() || null,
          });
        }
        await updateApprovalWorkflowStages(current.id, payload);
        toast.success("Workflow saved.");
      }
      await loadWorkflows();
      backToList();
    } catch (error) {
      // The stages replace is atomic — nothing changed, so what is on screen is
      // still what the server holds and the admin can fix it in place.
      applyServerError(error, "Could not save the workflow.");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------

  const activate = async (row: ApprovalWorkflow) => {
    try {
      await activateApprovalWorkflow(row.id);
      toast.success(`${row.workflowName} is now live.`);
      await loadWorkflows();
    } catch (error) {
      if (errorCodeOf(error) === WORKFLOW_ERRORS.DUPLICATE_ACTIVE) {
        // Only one chain per flow type may be live, and the server refuses
        // rather than silently standing the incumbent down. Name it and offer.
        let live: ApprovalWorkflow | undefined;
        try {
          const res = await getActiveWorkflowForFlowType(row.flowTypeCode);
          live = res?.data?.data;
        } catch {
          // 404 means it went away between the refusal and this read; the offer
          // below still works, it just cannot name the incumbent.
        }
        setIncumbent({
          blocked: row,
          live,
          message: workflowMessage(error, "Another workflow already governs this flow type."),
        });
        return;
      }
      toast.error(workflowMessage(error, "Could not activate the workflow."));
    }
  };

  const deactivate = async (row: ApprovalWorkflow) => {
    try {
      await deactivateApprovalWorkflow(row.id);
      toast.success(`${row.workflowName} is no longer live.`);
      await loadWorkflows();
    } catch (error) {
      toast.error(workflowMessage(error, "Could not deactivate the workflow."));
    }
  };

  /** Stand the incumbent down, then activate the one that was refused. */
  const swapActive = async () => {
    if (!incumbent?.live) return;
    setIsSaving(true);
    try {
      await deactivateApprovalWorkflow(incumbent.live.id);
      await activateApprovalWorkflow(incumbent.blocked.id);
      toast.success(`${incumbent.blocked.workflowName} is now live.`);
      setIncumbent(null);
      await loadWorkflows();
    } catch (error) {
      toast.error(workflowMessage(error, "Could not switch the live workflow."));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await deleteApprovalWorkflow(deleteTarget.id);
      toast.success("Workflow deleted.");
      setDeleteTarget(null);
      await loadWorkflows();
    } catch (error) {
      toast.error(workflowMessage(error, "Could not delete the workflow."));
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  if (!canRead || denied) {
    return <PermissionDenied message="You do not have access to approval workflows." />;
  }

  const activeFlowTypes = flowTypes.filter((type) => type.active);

  if (mode !== "list") {
    return (
      <div className="p-3">
        <LexPageHeader
          icon={GitBranch}
          title={mode === "create" ? "New approval workflow" : header.workflowName || "Workflow"}
          subtitle={
            mode === "edit" && current
              ? `${flowTypeName(current.flowTypeCode)} · ${current.active ? "Live" : "Not live"}`
              : "Define the chain of stages a request walks before it is finally approved."
          }
        >
          <Button variant="outline" onClick={backToList} disabled={isSaving}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={save} disabled={isSaving || !canEdit}>
            {isSaving ? "Saving…" : "Save workflow"}
          </Button>
        </LexPageHeader>

        {formError && <LexNotice tone="red">{formError}</LexNotice>}

        <div className="mb-4 grid gap-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] p-3 md:grid-cols-3">
          <div>
            <Label className="mb-1 block text-xs">Flow type</Label>
            <Select
              value={header.flowTypeCode || undefined}
              onValueChange={(value) => setHeader((h) => ({ ...h, flowTypeCode: value }))}
              // A chain cannot move between flow types — that is a different chain.
              disabled={mode === "edit"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a flow type" />
              </SelectTrigger>
              <SelectContent>
                {/* Retired flow types are hidden here — the API refuses a new
                    chain on one — but stay visible on workflows that already
                    use them, which is why the edit case shows the value. */}
                {(mode === "edit" ? flowTypes : activeFlowTypes).map((type) => (
                  <SelectItem key={type.id} value={type.flowTypeCode}>
                    {type.flowTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Workflow name</Label>
            <Input
              value={header.workflowName}
              onChange={(e) => setHeader((h) => ({ ...h, workflowName: e.target.value }))}
              placeholder="POF maker-checker"
              maxLength={255}
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Description</Label>
            <Textarea
              value={header.description}
              onChange={(e) => setHeader((h) => ({ ...h, description: e.target.value }))}
              rows={2}
            />
          </div>
        </div>

        <ApprovalChainEditor
          stages={stages}
          onChange={setStages}
          departments={departments}
          rolesByDepartment={rolesByDepartment}
          onRequestRoles={loadRoles}
          errors={errors}
          disabled={isSaving || !canEdit}
        />
      </div>
    );
  }

  return (
    <div className="p-3">
      <LexPageHeader
        icon={GitBranch}
        title="Approval Workflows"
        subtitle="One chain per business flow: who checks a request, in what order, and where a rejection goes."
      >
        <Button variant="outline" onClick={loadWorkflows} disabled={isLoading}>
          <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
        </Button>
        {canCreate && (
          <Button onClick={openCreate} disabled={activeFlowTypes.length === 0}>
            <Plus className="h-4 w-4" /> New workflow
          </Button>
        )}
      </LexPageHeader>

      <LexNotice tone="slate">
        One chain can be live per flow type. Activating a second is refused rather than silently
        replacing the first, and a live chain cannot be deleted.
      </LexNotice>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <EmptyState icon={GitBranch} text="No approval workflows defined yet." />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.code}>
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-[var(--surface-border)] pb-2">
                <div className="min-w-0">
                  {/* A div, not an h4: Bootstrap's unlayered `h4` rule beats
                      Tailwind's layered `text-sm`, so a heading element here
                      renders at page-title size no matter what class it carries. */}
                  <div
                    role="heading"
                    aria-level={2}
                    className="truncate text-sm font-semibold tracking-tight text-foreground"
                  >
                    {group.flowType?.flowTypeName || group.code}
                  </div>
                  <p className="mb-0 mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {group.code}
                  </p>
                </div>
                {/* The answer to "is this flow type governed right now?" — the
                    question the whole screen exists to settle. */}
                {group.live ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Governed by {group.live.workflowName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full border border-current" />
                    No live chain — writes are not held for approval
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {group.items.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] px-3 py-2.5 transition-colors hover:border-primary/30"
                  >
                    {/* A rail rather than another pill: state reads down the
                        column at a glance, without competing with the name. */}
                    <span
                      className={cn(
                        "h-8 w-1 shrink-0 rounded-full",
                        row.active ? "bg-emerald-500" : "bg-[var(--surface-border)]"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold text-foreground">
                          {row.workflowName}
                        </span>
                        {/* Explicit tones, not the `default`/`secondary` badge
                            variants: Bootstrap ships `.bg-primary` and
                            `.bg-secondary` utilities that override the Tailwind
                            tokens of the same name and render these unreadable. */}
                        <Badge
                          variant="outline"
                          className={cn(
                            "border font-medium",
                            row.active
                              ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-300"
                          )}
                        >
                          {row.active ? "Live" : "Draft"}
                        </Badge>
                      </div>
                      <p className="mb-0 mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                        {row.version != null && <span>v{row.version}</span>}
                        {row.version != null && row.updatedAt && <span aria-hidden>·</span>}
                        {row.updatedAt && <span>updated {formatDate(row.updatedAt)}</span>}
                        {row.description && (
                          <>
                            <span aria-hidden>·</span>
                            <span className="truncate">{row.description}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" /> {canEdit ? "Edit chain" : "View chain"}
                      </Button>
                      {canEdit &&
                        (row.active ? (
                          <Button size="sm" variant="ghost" onClick={() => deactivate(row)}>
                            <PauseCircle className="h-4 w-4" /> Deactivate
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => activate(row)}>
                            <CheckCircle2 className="h-4 w-4" /> Activate
                          </Button>
                        ))}
                      {/* Delete is not offered on a live workflow — the API
                          refuses it, and the path is deactivate → delete, two
                          deliberate steps. */}
                      {canDelete && !row.active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteTarget(row)}
                          title="Delete this workflow"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this workflow?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget?.workflowName} and its whole chain will be removed. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSaving}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!incumbent} onOpenChange={(open) => !open && setIncumbent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Another workflow is already live</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{incumbent?.message}</p>
          {incumbent?.live && (
            <p className="text-sm">
              <strong>{incumbent.live.workflowName}</strong> currently governs{" "}
              {flowTypeName(incumbent.live.flowTypeCode)}. Deactivate it and make{" "}
              <strong>{incumbent.blocked.workflowName}</strong> live instead?
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncumbent(null)} disabled={isSaving}>
              Leave it as it is
            </Button>
            <Button onClick={swapActive} disabled={isSaving || !incumbent?.live}>
              Deactivate and switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalWorkflows;
