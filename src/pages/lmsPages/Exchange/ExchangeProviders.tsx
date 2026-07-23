import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeftRight, Plus, Pencil } from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
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
  listExchangeProviders,
  createExchangeProvider,
  updateExchangeProvider,
  ExchangeProvider,
  ExchangeProviderStatus,
  CreateExchangeProviderRequest,
  UpdateExchangeProviderRequest,
} from "../../../redux/apis/apisWalletAdmin";
import { usePermissions, EXCHANGE_PERMISSIONS } from "../../../hooks/useProductPermissions";

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, string> = {
    ACTIVE:
      "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    INACTIVE: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        map[status || ""] || "bg-muted text-foreground"
      }`}
    >
      {status || "-"}
    </span>
  );
};

const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? "-"
    : `${Number(value)}%`;

const formatAmount = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? "-"
    : Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

type FormState = {
  code: string;
  name: string;
  logoUrl: string;
  fxMarginPercent: string;
  feePercent: string;
  minAmount: string;
  maxAmount: string;
  sortOrder: string;
  status: ExchangeProviderStatus;
};

const emptyForm: FormState = {
  code: "",
  name: "",
  logoUrl: "",
  fxMarginPercent: "0",
  feePercent: "0",
  minAmount: "",
  maxAmount: "",
  sortOrder: "0",
  status: "ACTIVE",
};

const ExchangeProviders = () => {
  const { hasPermission } = usePermissions();
  const canCreateProvider = hasPermission(EXCHANGE_PERMISSIONS.PROVIDER_CREATE);
  const canEditProvider = hasPermission(EXCHANGE_PERMISSIONS.PROVIDER_EDIT);
  const [providers, setProviders] = useState<ExchangeProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExchangeProvider | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const res = await listExchangeProviders();
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
      setProviders(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load exchange providers"
      );
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (provider: ExchangeProvider) => {
    setEditing(provider);
    setForm({
      code: provider.code,
      name: provider.name,
      logoUrl: provider.logoUrl ?? "",
      fxMarginPercent: String(provider.fxMarginPercent ?? 0),
      feePercent: String(provider.feePercent ?? 0),
      minAmount: provider.minAmount == null ? "" : String(provider.minAmount),
      maxAmount: provider.maxAmount == null ? "" : String(provider.maxAmount),
      sortOrder: String(provider.sortOrder ?? 0),
      status: provider.status,
    });
    setDialogOpen(true);
  };

  const optionalNumber = (value: string) =>
    value.trim() === "" ? null : Number(value);

  const save = async () => {
    if (!editing) {
      if (!form.code.trim()) return toast.error("Code is required");
      if (!form.name.trim()) return toast.error("Name is required");
    }
    if (!form.name.trim()) return toast.error("Name is required");
    if (Number(form.fxMarginPercent) < 0)
      return toast.error("FX margin must be ≥ 0");
    if (Number(form.feePercent) < 0) return toast.error("Fee must be ≥ 0");

    setIsSaving(true);
    try {
      if (editing) {
        const body: UpdateExchangeProviderRequest = {
          name: form.name.trim(),
          logoUrl: form.logoUrl.trim() || null,
          fxMarginPercent: Number(form.fxMarginPercent),
          feePercent: Number(form.feePercent),
          minAmount: optionalNumber(form.minAmount),
          maxAmount: optionalNumber(form.maxAmount),
          sortOrder: Number(form.sortOrder) || 0,
          status: form.status,
        };
        await updateExchangeProvider(editing.providerId, body);
        toast.success("Provider updated");
      } else {
        const body: CreateExchangeProviderRequest = {
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          logoUrl: form.logoUrl.trim() || null,
          fxMarginPercent: Number(form.fxMarginPercent),
          feePercent: Number(form.feePercent) || 0,
          minAmount: optionalNumber(form.minAmount),
          maxAmount: optionalNumber(form.maxAmount),
          sortOrder: Number(form.sortOrder) || 0,
        };
        await createExchangeProvider(body);
        toast.success("Provider created");
      }
      setDialogOpen(false);
      loadProviders();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save provider");
    } finally {
      setIsSaving(false);
    }
  };

  const headers = [
    {
      name: "Order",
      cell: (row: ExchangeProvider) => (
        <span className="text-sm text-muted-foreground">{row.sortOrder}</span>
      ),
      width: "80px",
    },
    {
      name: "Code",
      cell: (row: ExchangeProvider) => (
        <span className="font-mono text-xs font-medium">{row.code}</span>
      ),
      width: "120px",
    },
    {
      name: "Name",
      cell: (row: ExchangeProvider) => (
        <span className="text-sm">{row.name}</span>
      ),
      width: "200px",
    },
    {
      name: "FX Margin",
      cell: (row: ExchangeProvider) => (
        <span className="text-sm">{formatPercent(row.fxMarginPercent)}</span>
      ),
      width: "110px",
    },
    {
      name: "Fee",
      cell: (row: ExchangeProvider) => (
        <span className="text-sm">{formatPercent(row.feePercent)}</span>
      ),
      width: "90px",
    },
    {
      name: "Min / Max",
      cell: (row: ExchangeProvider) => (
        <span className="text-sm text-muted-foreground">
          {formatAmount(row.minAmount)} / {formatAmount(row.maxAmount)}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Status",
      cell: (row: ExchangeProvider) => <StatusBadge status={row.status} />,
      width: "120px",
    },
    {
      name: "Action",
      cell: (row: ExchangeProvider) =>
        !canEditProvider ? (
          <span className="text-muted-foreground">-</span>
        ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => openEdit(row)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        ),
      width: "120px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <div>
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            Exchange Providers
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            Configure the partners shown in the customer "Choose exchange option"
            dropdown.
          </p>
        </div>
        {canCreateProvider && (
        <Button className="gap-2 wallet-brand-btn" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Provider
        </Button>
        )}
      </div>

      <Card className="pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base">Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <TableView
            header={headers}
            data={providers}
            isLoading={isLoading}
            paginationShow={false}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Provider" : "New Provider"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 coa-form">
            <FormField label="Code" required>
              <Input
                placeholder="WISE"
                value={form.code}
                disabled={!!editing}
                onChange={(e) =>
                  setForm((s) => ({ ...s, code: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Name" required>
              <Input
                placeholder="Wise"
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
              />
            </FormField>
            <FormField label="FX Margin (%)" required>
              <Input
                type="number"
                placeholder="0.5"
                value={form.fxMarginPercent}
                onChange={(e) =>
                  setForm((s) => ({ ...s, fxMarginPercent: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Fee (%)">
              <Input
                type="number"
                placeholder="0.25"
                value={form.feePercent}
                onChange={(e) =>
                  setForm((s) => ({ ...s, feePercent: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Min Amount">
              <Input
                type="number"
                placeholder="Optional"
                value={form.minAmount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, minAmount: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Max Amount">
              <Input
                type="number"
                placeholder="Optional"
                value={form.maxAmount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, maxAmount: e.target.value }))
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
                      status: v as ExchangeProviderStatus,
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
            <FormField label="Logo URL" className="md:col-span-2">
              <Input
                placeholder="https://…"
                value={form.logoUrl}
                onChange={(e) =>
                  setForm((s) => ({ ...s, logoUrl: e.target.value }))
                }
              />
            </FormField>
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

export default ExchangeProviders;
