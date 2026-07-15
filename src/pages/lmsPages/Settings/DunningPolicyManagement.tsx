import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ChevronDown, Megaphone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import TableView from "../../../components/TableView/TableView";
import {
  getDunningPolicies,
  createDunningPolicy,
  updateDunningPolicy,
  deleteDunningPolicy,
} from "../../../redux/apis/apisLendingService";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-";

interface DunningPolicyForm {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  penaltyWaiverAllowed: boolean;
  maxWaiversAllowed: string;
}

const emptyForm: DunningPolicyForm = {
  name: "",
  description: "",
  active: true,
  penaltyWaiverAllowed: false,
  maxWaiversAllowed: "",
};

const DunningPolicyManagement = () => {
  const { t } = useTranslation("settings");
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<DunningPolicyForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 2s debounce — match the rest of the project
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 2000);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getDunningPolicies(page - 1, pageSize, debouncedSearch);
      const list = response?.data?.data;
      setData(Array.isArray(list) ? list : []);
      const pagination = response?.data?.pagination || response?.data?.pageInfo;
      if (pagination) {
        const total = pagination.totalElements ?? pagination.totalCount ?? 0;
        setTotalRows(total);
        setTotalPage(Math.ceil(total / pageSize) || 1);
      } else {
        const arr = Array.isArray(list) ? list : [];
        setTotalRows(arr.length);
        setTotalPage(Math.ceil(arr.length / pageSize) || 1);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // Backend currently returns 404 for an empty resource on this list endpoint —
        // render as an empty list instead of showing an error toast.
        setData([]);
        setTotalRows(0);
        setTotalPage(1);
      } else {
        toast.error(error?.response?.data?.message || t("dunning.toast.fetchFailed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, debouncedSearch]);

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setModalMode("add");
    setShowFormModal(true);
  };

  const openEdit = (row: any) => {
    setForm({
      id: row.id,
      name: row.name || row.nameEn || "",
      description: row.description || "",
      active: !!row.active,
      penaltyWaiverAllowed: !!row.penaltyWaiverAllowed,
      maxWaiversAllowed: row.maxWaiversAllowed != null ? String(row.maxWaiversAllowed) : "",
    });
    setErrors({});
    setModalMode("edit");
    setShowFormModal(true);
  };

  const closeModal = () => {
    setShowFormModal(false);
    setErrors({});
  };

  const setField = <K extends keyof DunningPolicyForm>(key: K, value: DunningPolicyForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("dunning.val.name");
    if (form.penaltyWaiverAllowed && form.maxWaiversAllowed !== "") {
      const n = Number(form.maxWaiversAllowed);
      if (!Number.isInteger(n) || n < 1)
        e.maxWaiversAllowed = t("dunning.val.maxWaivers");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    active: form.active,
    penaltyWaiverAllowed: form.penaltyWaiverAllowed,
    maxWaiversAllowed:
      form.penaltyWaiverAllowed && form.maxWaiversAllowed !== ""
        ? Number(form.maxWaiversAllowed)
        : null,
  });

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setIsSaving(true);
      if (modalMode === "add") {
        await createDunningPolicy(buildPayload());
        toast.success(t("dunning.toast.created"));
      } else {
        await updateDunningPolicy(form.id!, buildPayload());
        toast.success(t("dunning.toast.updated"));
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("dunning.toast.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteDunningPolicy(deleteTarget.id);
      toast.success(t("dunning.toast.deleted"));
      setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("dunning.toast.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      name: t("common:name"),
      selector: (row: any) => row.name || row.nameEn || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: t("common:description"),
      cell: (row: any) => (
        <span
          title={row.description || ""}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: 12,
          }}
        >
          {row.description || "-"}
        </span>
      ),
      width: "260px",
    },
    {
      name: t("dunning.col.penaltyWaiver"),
      cell: (row: any) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 32,
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: row.penaltyWaiverAllowed
              ? "var(--color-status-green)"
              : "var(--muted)",
            color: row.penaltyWaiverAllowed
              ? "var(--primary-foreground)"
              : "var(--muted-foreground)",
          }}
        >
          {row.penaltyWaiverAllowed ? t("dunning.allowed") : t("dunning.notAllowed")}
        </span>
      ),
      width: "140px",
    },
    {
      name: t("dunning.col.maxWaivers"),
      selector: (row: any) =>
        row.penaltyWaiverAllowed && row.maxWaiversAllowed != null
          ? String(row.maxWaiversAllowed)
          : "-",
      width: "120px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 32,
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: row.active
              ? "var(--color-status-green)"
              : "var(--color-status-coral)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.active ? t("common:active") : t("common:inactive")}
        </span>
      ),
      width: "100px",
    },
    {
      name: t("dunning.col.updated"),
      selector: (row: any) => formatDate(row.updatedAt),
      width: "180px",
    },
    {
      name: t("dunning.col.action"),
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {t("common:select")} <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openEdit(row)}>
              <Pencil className="h-4 w-4 me-2" />
              {t("common:edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-4 w-4 me-2" />
              {t("common:delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="service dunning-policy-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Megaphone className="h-4 w-4" />
          </span>
          {t("dunning.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("dunning.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <Button
            className="gap-1"
            onClick={openAdd}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <Plus className="h-4 w-4" />
            {t("dunning.addPolicy")}
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={columns}
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

      {/* Add / Edit Modal */}
      <Dialog open={showFormModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "add" ? t("dunning.modal.addTitle") : t("dunning.modal.editTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>{t("dunning.field.policyName")} *</Label>
              <Input
                placeholder={t("dunning.ph.name")}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>{t("common:description")}</Label>
              <Input
                placeholder={t("dunning.ph.description")}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setField("active", v)}
              />
              <Label>{t("common:active")}</Label>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-medium">{t("dunning.penaltyConfig")}</h4>

              <div className="flex items-center gap-3">
                <Switch
                  checked={form.penaltyWaiverAllowed}
                  onCheckedChange={(v) => {
                    setField("penaltyWaiverAllowed", v);
                    if (!v) setField("maxWaiversAllowed", "");
                  }}
                />
                <Label>{t("dunning.field.penaltyWaiverAllowed")}</Label>
              </div>

              {form.penaltyWaiverAllowed && (
                <div className="space-y-1">
                  <Label>{t("dunning.field.maxWaiversAllowed")}</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder={t("dunning.ph.maxWaivers")}
                    value={form.maxWaiversAllowed}
                    onChange={(e) => setField("maxWaiversAllowed", e.target.value)}
                    className={errors.maxWaiversAllowed ? "border-destructive" : ""}
                  />
                  {errors.maxWaiversAllowed && (
                    <p className="text-sm text-destructive">{errors.maxWaiversAllowed}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("dunning.saving") : t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("dunning.modal.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("dunning.deletePrefix")}{" "}
            <strong>{deleteTarget?.name || deleteTarget?.nameEn}</strong>{t("dunning.deleteSuffix")}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              {t("common:cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("dunning.deleting") : t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DunningPolicyManagement;
