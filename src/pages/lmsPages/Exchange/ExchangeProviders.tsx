import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeftRight, Plus, Pencil, Globe, Check, ChevronDown } from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

import {
  listExchangeProviders,
  createExchangeProvider,
  updateExchangeProvider,
  listExchangeCountries,
  ExchangeProvider,
  ExchangeProviderStatus,
  ExchangeCountry,
  CreateExchangeProviderRequest,
  UpdateExchangeProviderRequest,
} from "../../../redux/apis/apisWalletAdmin";
import { usePermissions, EXCHANGE_PERMISSIONS } from "../../../hooks/useProductPermissions";

const StatusBadge = ({ status, label }: { status?: string; label?: string }) => {
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
      {label || status || "-"}
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
  countryCodes: string[];
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
  countryCodes: [],
};

const ExchangeProviders = () => {
  const { t } = useTranslation("exchange");
  const statusLabel = (s?: string) =>
    s === "ACTIVE"
      ? t("common:active")
      : s === "INACTIVE"
        ? t("common:inactive")
        : s || "-";
  const { hasPermission } = usePermissions();
  const canCreateProvider = hasPermission(EXCHANGE_PERMISSIONS.PROVIDER_CREATE);
  const canEditProvider = hasPermission(EXCHANGE_PERMISSIONS.PROVIDER_EDIT);
  const [providers, setProviders] = useState<ExchangeProvider[]>([]);
  const [countries, setCountries] = useState<ExchangeCountry[]>([]);
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
        error?.response?.data?.message || t("providers.toast.loadFailed")
      );
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await listExchangeCountries();
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
      setCountries(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProviders();
    loadCountries();
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
      countryCodes: provider.countryCodes ?? [],
    });
    setDialogOpen(true);
  };

  const toggleCountry = (code: string) =>
    setForm((s) => ({
      ...s,
      countryCodes: s.countryCodes.includes(code)
        ? s.countryCodes.filter((c) => c !== code)
        : [...s.countryCodes, code],
    }));

  const optionalNumber = (value: string) =>
    value.trim() === "" ? null : Number(value);

  const save = async () => {
    if (!editing) {
      if (!form.code.trim()) return toast.error(t("providers.toast.codeRequired"));
      if (!form.name.trim()) return toast.error(t("providers.toast.nameRequired"));
    }
    if (!form.name.trim()) return toast.error(t("providers.toast.nameRequired"));
    if (Number(form.fxMarginPercent) < 0)
      return toast.error(t("providers.toast.fxMarginMin"));
    if (Number(form.feePercent) < 0) return toast.error(t("providers.toast.feeMin"));

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
          countryCodes: form.countryCodes,
        };
        await updateExchangeProvider(editing.providerId, body);
        toast.success(t("providers.toast.updated"));
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
          countryCodes: form.countryCodes,
        };
        await createExchangeProvider(body);
        toast.success(t("providers.toast.created"));
      }
      setDialogOpen(false);
      loadProviders();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || t("providers.toast.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const headers = [
    {
      name: t("providers.col.order"),
      cell: (row: ExchangeProvider) => (
        <span className="text-sm text-muted-foreground">{row.sortOrder}</span>
      ),
      width: "80px",
    },
    {
      name: t("providers.col.code"),
      cell: (row: ExchangeProvider) => (
        <span className="font-mono text-xs font-medium">{row.code}</span>
      ),
      width: "120px",
    },
    {
      name: t("common:name"),
      cell: (row: ExchangeProvider) => (
        <span className="text-sm">{row.name}</span>
      ),
      width: "200px",
    },
    {
      name: t("providers.col.fxMargin"),
      cell: (row: ExchangeProvider) => (
        <span className="text-sm">{formatPercent(row.fxMarginPercent)}</span>
      ),
      width: "110px",
    },
    {
      name: t("providers.col.fee"),
      cell: (row: ExchangeProvider) => (
        <span className="text-sm">{formatPercent(row.feePercent)}</span>
      ),
      width: "90px",
    },
    {
      name: t("providers.col.minMax"),
      cell: (row: ExchangeProvider) => (
        <span className="text-sm text-muted-foreground">
          {formatAmount(row.minAmount)} / {formatAmount(row.maxAmount)}
        </span>
      ),
      width: "160px",
    },
    {
      name: t("providers.col.countries"),
      cell: (row: ExchangeProvider) =>
        !row.countryCodes || row.countryCodes.length === 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/15 dark:text-green-300">
            <Globe className="h-3.5 w-3.5" />
            {t("providers.allCountries")}
          </span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {row.countryCodes.map((c) => (
              <span
                key={c}
                className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground"
              >
                {c}
              </span>
            ))}
          </span>
        ),
      width: "180px",
    },
    {
      name: t("common:status"),
      cell: (row: ExchangeProvider) => (
        <StatusBadge status={row.status} label={statusLabel(row.status)} />
      ),
      width: "120px",
    },
    {
      name: t("providers.col.action"),
      cell: (row: ExchangeProvider) =>
        !canEditProvider ? (
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
        .exch-dialog .country-picker button {
          font-size: 12px !important;
          font-weight: 500 !important;
          line-height: 1 !important;
        }
      `}</style>
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <div>
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            {t("providers.title")}
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            {t("providers.subtitle")}
          </p>
        </div>
        {canCreateProvider && (
        <Button className="gap-2 wallet-brand-btn" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("providers.new")}
        </Button>
        )}
      </div>

      <Card className="pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base">{t("providers.cardTitle")}</CardTitle>
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
        <DialogContent className="exch-dialog sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("providers.dialog.editTitle") : t("providers.dialog.newTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 coa-form">
            <FormField label={t("providers.field.code")} required>
              <Input
                placeholder="WISE"
                value={form.code}
                disabled={!!editing}
                onChange={(e) =>
                  setForm((s) => ({ ...s, code: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("common:name")} required>
              <Input
                placeholder="Wise"
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("providers.field.fxMargin")} required>
              <Input
                type="number"
                placeholder="0.5"
                value={form.fxMarginPercent}
                onChange={(e) =>
                  setForm((s) => ({ ...s, fxMarginPercent: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("providers.field.fee")}>
              <Input
                type="number"
                placeholder="0.25"
                value={form.feePercent}
                onChange={(e) =>
                  setForm((s) => ({ ...s, feePercent: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("providers.field.minAmount")}>
              <Input
                type="number"
                placeholder={t("common:optional")}
                value={form.minAmount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, minAmount: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("providers.field.maxAmount")}>
              <Input
                type="number"
                placeholder={t("common:optional")}
                value={form.maxAmount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, maxAmount: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("providers.field.sortOrder")}>
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
                      status: v as ExchangeProviderStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t("common:active")}</SelectItem>
                    <SelectItem value="INACTIVE">{t("common:inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            )}
            <FormField label={t("providers.field.logoUrl")} className="md:col-span-2">
              <Input
                placeholder="https://…"
                value={form.logoUrl}
                onChange={(e) =>
                  setForm((s) => ({ ...s, logoUrl: e.target.value }))
                }
              />
            </FormField>

            <div className="md:col-span-2 space-y-2">
              <Label>
                {t("providers.field.countriesServed")}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {t("providers.field.countriesHint")}
                </span>
              </Label>
              {countries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("providers.noCountries")}
                </p>
              ) : (
                <div className="country-picker flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  {countries.map((c) => {
                    const selected = form.countryCodes.includes(c.countryCode);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCountry(c.countryCode)}
                        className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 transition ${
                          selected
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                            : "border-border bg-background text-foreground hover:border-emerald-400 hover:bg-muted"
                        }`}
                      >
                        <Check
                          className={`h-3 w-3 shrink-0 ${
                            selected ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {c.countryCode} · {c.countryName}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
                ? t("providers.form.saving")
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

export default ExchangeProviders;
