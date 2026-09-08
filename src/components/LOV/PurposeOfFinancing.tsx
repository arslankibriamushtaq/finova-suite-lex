import { useState, useEffect } from "react";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllPurposeOfFinance,
  createPurposeOfFinance,
  updatePurposeOfFinance,
  deletePurposeOfFinance,
} from "../../redux/apis/apisLendingService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown, Pencil, Trash2, Plus, ListChecks } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { usePermissions, LOV_PURPOSE_OF_FINANCE_PERMISSIONS } from "../../hooks/useProductPermissions";
import { Link } from "react-router-dom";
import {
  getApprovalRequests,
  isEntityAlreadyPending,
  isParkedForApproval,
  parkedApproval,
  approvalRequestMessage,
  type ApprovalRequest,
} from "../../redux/apis/apisApprovalRequests";

const PurposeOfFinancing = () => {
  const { t } = useTranslation("lov");
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(LOV_PURPOSE_OF_FINANCE_PERMISSIONS.CREATE);
  const canEdit = hasPermission(LOV_PURPOSE_OF_FINANCE_PERMISSIONS.EDIT);
  const canDelete = hasPermission(LOV_PURPOSE_OF_FINANCE_PERMISSIONS.DELETE);
  const canRowActions = canEdit || canDelete;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    active: true,
    sortOrder: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Rows with a change already parked for approval.
   *
   * One list call rather than a lookup per row: filtering the requests by entity
   * type gives every pending `entityId` in one go. CREATEs carry a null
   * `entityId` — they have no row yet — so they are counted separately and
   * announced above the table instead.
   */
  const [pendingEntityIds, setPendingEntityIds] = useState<Set<string>>(new Set());
  const [pendingCreates, setPendingCreates] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  /**
   * Silent on failure: a chain may not be configured for this entity at all, in
   * which case there is nothing pending and nothing to say. An error here must
   * not put a toast over a screen that is working perfectly well.
   */
  const fetchPendingApprovals = async () => {
    try {
      const res = await getApprovalRequests({
        status: "PENDING",
        entityType: "PURPOSE_OF_FINANCE",
        page: 0,
        size: 200,
      });
      const all: ApprovalRequest[] = Array.isArray(res?.data?.data) ? res.data.data : [];
      // The status and entityType filters are asked for in the query, but a badge
      // that says "pending" must not depend on the server having honoured them:
      // an unfiltered list would include already-decided requests and leave the
      // row flagged for good. Narrow again here on what each row actually says.
      const rows = all.filter(
        (r) => r.status === "PENDING" && r.entityType === "PURPOSE_OF_FINANCE"
      );
      setPendingEntityIds(new Set(rows.map((r) => r.entityId).filter(Boolean) as string[]));
      setPendingCreates(rows.filter((r) => r.action === "CREATE").length);
    } catch {
      setPendingEntityIds(new Set());
      setPendingCreates(0);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Backend uses 0-based indexing for page
      const response = await getAllPurposeOfFinance(page - 1, pageSize, searchTerm);
      const list = response?.data?.data || [];
      setData(Array.isArray(list) ? list : []);

      const pagination = response?.data?.pagination;
      if (pagination) {
        setTotalRows(pagination.totalElements || 0);
        setTotalPage(pagination.totalPages || 1);
      } else {
        setTotalRows(list.length);
        setTotalPage(Math.ceil(list.length / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("purposeOfFinancing.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode("add");
    setCurrentItemId(null);
    setFormData({
      code: "",
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      active: true,
      sortOrder: 0,
    });
    setShowFormModal(true);
  };

  const handleEdit = (row: any) => {
    setModalMode("edit");
    setCurrentItemId(row.id);
    setFormData({
      code: row.code || "",
      nameEn: row.nameEn || "",
      nameAr: row.nameAr || "",
      descriptionEn: row.descriptionEn || "",
      descriptionAr: row.descriptionAr || "",
      active: row.active ?? true,
      sortOrder: row.sortOrder ?? 0,
    });
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error(t("purposeOfFinancing.validation.code"));
      return;
    }
    if (!formData.nameEn.trim()) {
      toast.error(t("purposeOfFinancing.validation.nameEn"));
      return;
    }

    try {
      setIsSaving(true);
      const body: any = {
        code: formData.code.trim(),
        nameEn: formData.nameEn.trim(),
        nameAr: formData.nameAr.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (modalMode === "edit") {
        body.active = formData.active;
      }

      const response =
        modalMode === "edit" && currentItemId
          ? await updatePurposeOfFinance(currentItemId, body)
          : await createPurposeOfFinance(body);

      // Once a chain governs PURPOSE_OF_FINANCE the write is parked, not
      // applied: 202 and a pending-approval body instead of the record. Saying
      // "saved" here would promise a row that will not be in the list.
      if (isParkedForApproval(response)) {
        const parked = parkedApproval(response);
        toast.success(parked?.message || t("purposeOfFinancing.toast.submittedForApproval"));
        fetchPendingApprovals();
      } else {
        toast.success(
          modalMode === "edit"
            ? t("purposeOfFinancing.toast.updated")
            : t("purposeOfFinancing.toast.created")
        );
      }

      setShowFormModal(false);
      fetchData();
    } catch (error: any) {
      // The record already has a change in flight — that is a place to go, not a
      // failure to report.
      if (isEntityAlreadyPending(error)) {
        toast.error(t("purposeOfFinancing.toast.alreadyPending"));
      } else {
        toast.error(
          approvalRequestMessage(
            error,
            modalMode === "edit"
              ? t("purposeOfFinancing.toast.updateFailed")
              : t("purposeOfFinancing.toast.createFailed")
          )
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const response = await deletePurposeOfFinance(deleteTarget.id);
      // A parked deletion leaves the row exactly where it is, so it must not be
      // dropped from the table the way an applied one is.
      if (isParkedForApproval(response)) {
        const parked = parkedApproval(response);
        toast.success(parked?.message || t("purposeOfFinancing.toast.submittedForApproval"));
        fetchPendingApprovals();
      } else {
        toast.success(t("purposeOfFinancing.toast.deleted"));
        setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (error: any) {
      if (isEntityAlreadyPending(error)) {
        toast.error(t("purposeOfFinancing.toast.alreadyPending"));
      } else {
        toast.error(approvalRequestMessage(error, t("purposeOfFinancing.toast.deleteFailed")));
      }
    } finally {
      setIsDeleting(false);
    }
  };


  const headers = [
    {
      name: t("purposeOfFinancing.col.code"),
      selector: (row: any) => row.code || "-",
      sortable: true,
    },
    {
      name: t("purposeOfFinancing.col.nameEn"),
      selector: (row: any) => row.nameEn || "-",
      sortable: true,
    },
    {
      name: t("purposeOfFinancing.col.nameAr"),
      selector: (row: any) => row.nameAr || "-",
      sortable: true,
    },
    {
      name: t("purposeOfFinancing.col.descriptionEn"),
      selector: (row: any) => row.descriptionEn || "-",
      sortable: true,
    },
    {
      name: t("purposeOfFinancing.col.sortOrder"),
      selector: (row: any) => row.sortOrder ?? "-",
      sortable: true,
      width: "120px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const isActive = row.active ?? true;
        return (
          <div className="flex flex-col gap-1">
            <span className={isActive ? "text-slate-500 font-medium" : "text-red-600 font-medium"}>
              {isActive ? t("common:active") : t("common:inactive")}
            </span>
            {/* What is on screen is the approved record; a pending change is a
                separate thing waiting on a chain, so it is flagged rather than
                merged into the row. */}
            {pendingEntityIds.has(row.id) && (
              <span className="text-[11px] font-medium text-amber-600">
                {t("purposeOfFinancing.pendingChange")}
              </span>
            )}
          </div>
        );
      },
      sortable: true,
      width: "130px",
    },
    {
      name: t("common:actions"),
      cell: (row: any) =>
        !canRowActions ? (
          <span className="text-muted-foreground">-</span>
        ) : (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("common:select")}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              {canEdit && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleEdit(row);
                }}
              >
                <Pencil className="h-4 w-4" />
                {t("common:edit")}
              </DropdownMenuItem>
              )}
              {canDelete && (
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteTarget(row);
                }}
              >
                <Trash2 className="h-4 w-4" />
                {t("common:delete")}
              </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        ),
      width: "100px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ListChecks className="h-4 w-4" />
          </span>
          {t("purposeOfFinancing.title")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <AntInput
          allowClear
          placeholder={t("purposeOfFinancing.ph.search")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        {canCreate && (
        <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
          <Plus className="h-4 w-4" />
          {t("shared.addNewRecord")}
        </Button>
        )}
        </div>
      </div>

      {/* A pending CREATE has no row to badge — the record does not exist yet —
          so the only place it can be announced is above the table. */}
      {pendingCreates > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <span>{t("purposeOfFinancing.pendingCreates", { count: pendingCreates })}</span>
          <Link to="/LOS/Setting/ApprovalRequests" className="font-medium underline">
            {t("purposeOfFinancing.viewApprovals")}
          </Link>
        </div>
      )}

      <div className="pro-card">
        <TableView
        header={headers}
        data={data}
        totalRows={totalRows}
        isLoading={isLoading}
        from={(page - 1) * pageSize + (totalRows > 0 ? 1 : 0)}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={Math.min(page * pageSize, totalRows)}
      />
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showFormModal} onOpenChange={(open) => !open && setShowFormModal(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{modalMode === "edit" ? t("purposeOfFinancing.modal.editTitle") : t("shared.addNewRecord")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("purposeOfFinancing.label.code")} *</Label>
                <Input
                  placeholder={t("purposeOfFinancing.ph.code")}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={modalMode === "edit"}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("purposeOfFinancing.label.sortOrder")}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("purposeOfFinancing.label.nameEn")} *</Label>
                <Input
                  placeholder={t("purposeOfFinancing.ph.nameEn")}
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("purposeOfFinancing.label.nameAr")}</Label>
                <Input
                  placeholder={t("purposeOfFinancing.ph.nameAr")}
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("purposeOfFinancing.label.descriptionEn")}</Label>
                <Input
                  placeholder={t("purposeOfFinancing.ph.descriptionEn")}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("purposeOfFinancing.label.descriptionAr")}</Label>
                <Input
                  placeholder={t("purposeOfFinancing.ph.descriptionAr")}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                />
              </div>
            </div>
            {modalMode === "edit" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                />
                <span className="text-sm">{t("common:active")}</span>
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("purposeOfFinancing.saving") : modalMode === "edit" ? t("common:update") : t("common:create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("purposeOfFinancing.modal.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("purposeOfFinancing.confirmDeletePrefix")}{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.nameEn || deleteTarget?.code}
            </span>
            {t("purposeOfFinancing.confirmDeleteSuffix")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t("purposeOfFinancing.deleting") : t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurposeOfFinancing;
