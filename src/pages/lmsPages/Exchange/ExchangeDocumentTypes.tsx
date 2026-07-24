import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileText, Plus, Pencil, ChevronDown } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Badge } from "../../../components/ui/badge";
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

const StatusBadge = ({ status }: { status?: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      status === "ACTIVE"
        ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
        : "bg-muted text-muted-foreground"
    }`}
  >
    {status || "-"}
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
        error?.response?.data?.message || "Failed to load document types"
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
    if (!editing && !form.code.trim()) return toast.error("Code is required");
    if (!form.name.trim()) return toast.error("Name is required");

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
        toast.success("Document type updated");
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
        toast.success("Document type created");
      }
      setDialogOpen(false);
      load();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to save document type"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const headers = [
    {
      name: "Order",
      cell: (row: ExchangeDocumentType) => (
        <span className="text-sm text-muted-foreground">{row.sortOrder}</span>
      ),
      width: "80px",
    },
    {
      name: "Code",
      cell: (row: ExchangeDocumentType) => (
        <span className="font-mono text-xs font-medium">{row.code}</span>
      ),
      width: "140px",
    },
    {
      name: "Name",
      cell: (row: ExchangeDocumentType) => (
        <span className="text-sm">{row.name}</span>
      ),
      width: "180px",
    },
    {
      name: "Sullis Verify",
      cell: (row: ExchangeDocumentType) =>
        row.sullisVerify ? (
          <Badge variant="secondary">{row.sullisDocType || "YES"}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">No</span>
        ),
      width: "140px",
    },
    {
      name: "PII Reuse",
      cell: (row: ExchangeDocumentType) => (
        <span className="text-sm text-muted-foreground">
          {row.piiDocumentType || "-"}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Status",
      cell: (row: ExchangeDocumentType) => <StatusBadge status={row.status} />,
      width: "110px",
    },
    {
      name: "Action",
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
                Select
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
                Edit
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
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <FileText className="h-4 w-4" />
          </span>
          Document Types
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">
          The KYC document catalog referenced by each country's required-document
          set.
        </p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search code, name…"
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
            New Document Type
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
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Document Type" : "New Document Type"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 coa-form">
            <FormField label="Code" required>
              <Input
                placeholder="VISA"
                value={form.code}
                disabled={!!editing}
                onChange={(e) =>
                  setForm((s) => ({ ...s, code: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Name" required>
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
                <p className="text-sm font-medium">Sullis Verify</p>
                <p className="text-xs text-muted-foreground">
                  Run through Sullis OCR + selfie face-match (identity document).
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
              <FormField label="Sullis Doc Type">
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
                    <SelectItem value="ID_CARD">ID_CARD</SelectItem>
                    <SelectItem value="PASSPORT">PASSPORT</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            )}

            <FormField
              label="PII Reuse Kind"
              className={form.sullisVerify ? "" : "md:col-span-2"}
            >
              <Input
                placeholder="e.g. NATIONAL_ID (blank = never reuse)"
                value={form.piiDocumentType}
                onChange={(e) =>
                  setForm((s) => ({ ...s, piiDocumentType: e.target.value }))
                }
              />
            </FormField>

            <FormField label="Sort Order">
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
              <FormField label="Status">
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
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
              Cancel
            </Button>
            <Button
              className="wallet-brand-btn"
              onClick={save}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : editing ? "Save Changes" : "Create"}
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
