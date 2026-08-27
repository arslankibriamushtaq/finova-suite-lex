import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FileText, Plus, Pencil, ChevronDown, ShieldCheck } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

import {
  listExchangeDocumentTypes,
  createExchangeDocumentType,
  updateExchangeDocumentType,
  ExchangeDocumentType,
  ExchangeDocumentTypeStatus,
  CreateExchangeDocumentTypeRequest,
  UpdateExchangeDocumentTypeRequest,
} from "../../../redux/apis/apisWalletAdmin";
import { usePermissions, EXCHANGE_PERMISSIONS } from "../../../hooks/useProductPermissions";

const SULLIS_DOC_LABELS: Record<string, string> = {
  ID_CARD: "ID Card",
  PASSPORT: "Passport",
};

const prettySullisDocType = (value?: string | null, enabledLabel = "Enabled") => {
  if (!value) return enabledLabel;
  return (
    SULLIS_DOC_LABELS[value] ||
    value
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
};

const StatusBadge = ({ status, label }: { status?: string; label?: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      status === "ACTIVE"
        ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
        : "bg-muted text-muted-foreground"
    }`}
  >
    {label || status || "-"}
  </span>
);

type FormState = {
  code: string;
  name: string;
  sullisVerify: boolean;
  sullisDocType: string;
  piiDocumentType: string;
  sortOrder: string;
  status: ExchangeDocumentTypeStatus;
};

const emptyForm: FormState = {
  code: "",
  name: "",
  sullisVerify: false,
  sullisDocType: "NONE",
  piiDocumentType: "",
  sortOrder: "0",
  status: "ACTIVE",
};

const ExchangeDocumentTypes = () => {
  const { t } = useTranslation("exchange");
  const statusLabel = (s?: string) =>
    s === "ACTIVE"
      ? t("common:active")
      : s === "INACTIVE"
        ? t("common:inactive")
        : s || "-";
  const sullisDocLabel = (value?: string | null) => {
    if (!value) return t("docTypes.badge.enabled");
    if (value === "ID_CARD") return t("docTypes.sullisDoc.idCard");
    if (value === "PASSPORT") return t("docTypes.sullisDoc.passport");
    return prettySullisDocType(value);
  };
  const { hasPermission } = usePermissions();
  const canCreateDocType = hasPermission(EXCHANGE_PERMISSIONS.DOCUMENT_TYPE_CREATE);
  const canEditDocType = hasPermission(EXCHANGE_PERMISSIONS.DOCUMENT_TYPE_EDIT);
  const [docTypes, setDocTypes] = useState<ExchangeDocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExchangeDocumentType | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await listExchangeDocumentTypes();
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
      setDocTypes(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("docTypes.toast.loadFailed")
      );
      setDocTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (dt: ExchangeDocumentType) => {
    setEditing(dt);
    setForm({
      code: dt.code,
      name: dt.name,
      sullisVerify: dt.sullisVerify,
      sullisDocType: dt.sullisDocType || "NONE",
      piiDocumentType: dt.piiDocumentType || "",
      sortOrder: String(dt.sortOrder ?? 0),
      status: dt.status,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing && !form.code.trim())
      return toast.error(t("docTypes.toast.codeRequired"));
    if (!form.name.trim()) return toast.error(t("docTypes.toast.nameRequired"));

    const sullisDocType =
      form.sullisVerify && form.sullisDocType !== "NONE"
        ? form.sullisDocType
        : null;

    setIsSaving(true);
    try {
      if (editing) {
        const body: UpdateExchangeDocumentTypeRequest = {
          name: form.name.trim(),
          sullisVerify: form.sullisVerify,
          sullisDocType,
          piiDocumentType: form.piiDocumentType.trim() || null,
          sortOrder: Number(form.sortOrder) || 0,
          status: form.status,
        };
        await updateExchangeDocumentType(editing.id, body);
        toast.success(t("docTypes.toast.updated"));
      } else {
        const body: CreateExchangeDocumentTypeRequest = {
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          sullisVerify: form.sullisVerify,
          sullisDocType,
          piiDocumentType: form.piiDocumentType.trim() || null,
          sortOrder: Number(form.sortOrder) || 0,
        };
        await createExchangeDocumentType(body);
        toast.success(t("docTypes.toast.created"));
      }
      setDialogOpen(false);
      load();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("docTypes.toast.saveFailed")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const headers = [
    {
      name: t("docTypes.col.order"),
      cell: (row: ExchangeDocumentType) => (
        <span className="text-sm text-muted-foreground">{row.sortOrder}</span>
      ),
      width: "80px",
    },
    {
      name: t("docTypes.col.code"),
      cell: (row: ExchangeDocumentType) => (
        <span className="font-mono text-xs font-medium">{row.code}</span>
      ),
      width: "140px",
    },
    {
      name: t("common:name"),
      cell: (row: ExchangeDocumentType) => (
        <span className="text-sm">{row.name}</span>
      ),
      width: "180px",
    },
    {
      name: t("docTypes.col.sullisVerify"),
      cell: (row: ExchangeDocumentType) =>
        row.sullisVerify ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {sullisDocLabel(row.sullisDocType)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      width: "150px",
    },
    {
      name: t("docTypes.col.piiReuse"),
      cell: (row: ExchangeDocumentType) => (
        <span className="text-sm text-muted-foreground">
          {row.piiDocumentType || "-"}
        </span>
      ),
      width: "150px",
    },
    {
      name: t("common:status"),
      cell: (row: ExchangeDocumentType) => (
        <StatusBadge status={row.status} label={statusLabel(row.status)} />
      ),
      width: "110px",
    },
    {
      name: t("docTypes.col.action"),
      cell: (row: ExchangeDocumentType) =>
        !canEditDocType ? (
          <span className="text-muted-foreground">-</span>
        ) : (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className={SELECT_TRIGGER_CLS}>
                {t("common:select")}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  openEdit(row);
                }}
              >
                <Pencil className="h-4 w-4" />
                {t("common:edit")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        ),
      width: "120px",
    },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docTypes;
    return docTypes.filter((dt) =>
      [dt.code, dt.name, dt.sullisDocType, dt.piiDocumentType, dt.status]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [docTypes, search]);

  const from = (page - 1) * pageSize;
  const paged = filtered.slice(from, from + pageSize);
  const totalPage = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="service">
      <style>{`
        .exch-dialog [data-slot="dialog-title"] { font-size: 15px; }
        .exch-dialog [data-slot="dialog-description"] { font-size: 12px; }
        .exch-dialog [data-slot="label"],
        .exch-dialog label,
        .exch-dialog label span,
        .exch-dialog .text-sm,
        .exch-dialog input,
        .exch-dialog textarea,
        .exch-dialog [data-slot="select-trigger"],
        .exch-dialog [data-slot="select-trigger"] span,
        .exch-dialog [data-slot="select-item"],
        .exch-dialog [data-slot="button"] {
          font-size: 12px !important;
        }
        .exch-dialog [data-slot="label"] { font-weight: 600; }
        .exch-dialog input:not([type="checkbox"]),
        .exch-dialog [data-slot="select-trigger"] {
          height: 36px !important;
          min-height: 36px !important;
        }
      `}</style>
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <FileText className="h-4 w-4" />
          </span>
          {t("docTypes.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">
          {t("docTypes.subtitle")}
        </p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("docTypes.search")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 220, borderRadius: 2, height: 40 }}
          />
          {canCreateDocType && (
          <Button
            className="gap-2 wallet-brand-btn"
            onClick={openCreate}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto" }}
          >
            <Plus className="h-4 w-4" />
            {t("docTypes.new")}
          </Button>
          )}
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={paged}
          totalRows={filtered.length}
          isLoading={isLoading}
          from={filtered.length === 0 ? 0 : from + 1}
          to={Math.min(page * pageSize, filtered.length)}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="exch-dialog sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("docTypes.dialog.editTitle")
                : t("docTypes.dialog.newTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 coa-form">
            <FormField label={t("docTypes.field.code")} required>
              <Input
                placeholder="VISA"
                value={form.code}
                disabled={!!editing}
                onChange={(e) =>
                  setForm((s) => ({ ...s, code: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("docTypes.field.name")} required>
              <Input
                placeholder="Travel Visa"
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
              />
            </FormField>

            <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">
                  {t("docTypes.sullis.title")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("docTypes.sullis.hint")}
                </p>
              </div>
              <Switch
                checked={form.sullisVerify}
                onCheckedChange={(v) =>
                  setForm((s) => ({ ...s, sullisVerify: v }))
                }
              />
            </div>

            {form.sullisVerify && (
              <FormField label={t("docTypes.field.sullisDocType")}>
                <Select
                  value={form.sullisDocType}
                  onValueChange={(v) =>
                    setForm((s) => ({ ...s, sullisDocType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">—</SelectItem>
                    <SelectItem value="ID_CARD">
                      {t("docTypes.sullisDoc.idCard")}
                    </SelectItem>
                    <SelectItem value="PASSPORT">
                      {t("docTypes.sullisDoc.passport")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            )}

            <FormField
              label={t("docTypes.field.piiReuseKind")}
              className={form.sullisVerify ? "" : "md:col-span-2"}
            >
              <Input
                placeholder={t("docTypes.field.piiPlaceholder")}
                value={form.piiDocumentType}
                onChange={(e) =>
                  setForm((s) => ({ ...s, piiDocumentType: e.target.value }))
                }
              />
            </FormField>

            <FormField label={t("docTypes.field.sortOrder")}>
              <Input
                type="number"
                placeholder="0"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((s) => ({ ...s, sortOrder: e.target.value }))
                }
              />
            </FormField>
            {editing && (
              <FormField label={t("common:status")}>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((s) => ({
                      ...s,
                      status: v as ExchangeDocumentTypeStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t("common:active")}</SelectItem>
                    <SelectItem value="INACTIVE">
                      {t("common:inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              {t("common:cancel")}
            </Button>
            <Button
              className="wallet-brand-btn"
              onClick={save}
              disabled={isSaving}
            >
              {isSaving
                ? t("docTypes.form.saving")
                : editing
                  ? t("common:saveChanges")
                  : t("common:create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FormField = ({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`space-y-2 ${className || ""}`}>
    <Label>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
  </div>
);

export default ExchangeDocumentTypes;
