import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Globe, Plus, Pencil, FileText, Trash2, ChevronDown } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  listExchangeCountries,
  createExchangeCountry,
  updateExchangeCountry,
  listExchangeDocumentTypes,
  listCountryDocuments,
  addCountryDocument,
  removeCountryDocument,
  ExchangeCountry,
  ExchangeCountryStatus,
  ExchangeDocumentType,
  CountryDocument,
  CreateExchangeCountryRequest,
  UpdateExchangeCountryRequest,
} from "../../../redux/apis/apisWalletAdmin";
import { usePermissions, EXCHANGE_PERMISSIONS } from "../../../hooks/useProductPermissions";

const StatusBadge = ({ status, label }: { status?: string; label?: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      status === "ACTIVE"
        ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
        : "bg-muted text-muted-foreground"
    }`}
  >
    {label || status || "-"}
  </span>
);

type FormState = {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  flagUrl: string;
  sortOrder: string;
  status: ExchangeCountryStatus;
};

const emptyForm: FormState = {
  countryCode: "",
  countryName: "",
  currencyCode: "",
  flagUrl: "",
  sortOrder: "0",
  status: "ACTIVE",
};

const ExchangeCountries = () => {
  const { t } = useTranslation("exchange");
  const statusLabel = (s?: string) =>
    s === "ACTIVE"
      ? t("common:active")
      : s === "INACTIVE"
        ? t("common:inactive")
        : s || "-";
  const { hasPermission } = usePermissions();
  const canCreateCountry = hasPermission(EXCHANGE_PERMISSIONS.COUNTRY_CREATE);
  const canEditCountry = hasPermission(EXCHANGE_PERMISSIONS.COUNTRY_EDIT);
  const [countries, setCountries] = useState<ExchangeCountry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExchangeCountry | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Per-country required-document manager
  const [docTypes, setDocTypes] = useState<ExchangeDocumentType[]>([]);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [docsCountry, setDocsCountry] = useState<ExchangeCountry | null>(null);
  const [countryDocs, setCountryDocs] = useState<CountryDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [addDocTypeId, setAddDocTypeId] = useState("");
  const [addMandatory, setAddMandatory] = useState("true");
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await listExchangeCountries();
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
      setCountries(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("countries.toast.loadFailed")
      );
      setCountries([]);
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

  const openEdit = (c: ExchangeCountry) => {
    setEditing(c);
    setForm({
      countryCode: c.countryCode,
      countryName: c.countryName,
      currencyCode: c.currencyCode || "",
      flagUrl: c.flagUrl || "",
      sortOrder: String(c.sortOrder ?? 0),
      status: c.status,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing && !form.countryCode.trim())
      return toast.error(t("countries.toast.codeRequired"));
    if (!form.countryName.trim())
      return toast.error(t("countries.toast.nameRequired"));

    setIsSaving(true);
    try {
      if (editing) {
        const body: UpdateExchangeCountryRequest = {
          countryName: form.countryName.trim(),
          currencyCode: form.currencyCode.trim() || null,
          flagUrl: form.flagUrl.trim() || null,
          sortOrder: Number(form.sortOrder) || 0,
          status: form.status,
        };
        await updateExchangeCountry(editing.id, body);
        toast.success(t("countries.toast.updated"));
      } else {
        const body: CreateExchangeCountryRequest = {
          countryCode: form.countryCode.trim().toUpperCase(),
          countryName: form.countryName.trim(),
          currencyCode: form.currencyCode.trim() || null,
          flagUrl: form.flagUrl.trim() || null,
          sortOrder: Number(form.sortOrder) || 0,
        };
        await createExchangeCountry(body);
        toast.success(t("countries.toast.created"));
      }
      setDialogOpen(false);
      load();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("countries.toast.saveFailed")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const loadCountryDocs = async (countryCode: string) => {
    setDocsLoading(true);
    try {
      const res = await listCountryDocuments(countryCode);
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
      setCountryDocs(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("countries.docs.loadFailed")
      );
      setCountryDocs([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const openDocs = async (c: ExchangeCountry) => {
    setDocsCountry(c);
    setDocsDialogOpen(true);
    setAddDocTypeId("");
    setAddMandatory("true");
    // Load the catalog lazily once.
    if (docTypes.length === 0) {
      try {
        const res = await listExchangeDocumentTypes();
        const body = res?.data ?? {};
        const inner = body?.data ?? body;
        const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
        setDocTypes(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error(error);
      }
    }
    loadCountryDocs(c.countryCode);
  };

  const addDoc = async () => {
    if (!docsCountry) return;
    if (!addDocTypeId) return toast.error(t("countries.docs.selectTypeError"));
    setIsAddingDoc(true);
    try {
      await addCountryDocument(docsCountry.countryCode, {
        documentTypeId: addDocTypeId,
        mandatory: addMandatory === "true",
        sortOrder: countryDocs.length + 1,
      });
      toast.success(t("countries.docs.added"));
      setAddDocTypeId("");
      loadCountryDocs(docsCountry.countryCode);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("countries.docs.addFailed")
      );
    } finally {
      setIsAddingDoc(false);
    }
  };

  const removeDoc = async (row: CountryDocument) => {
    if (!docsCountry) return;
    setRemovingId(row.id);
    try {
      await removeCountryDocument(row.id);
      toast.success(t("countries.docs.removed"));
      loadCountryDocs(docsCountry.countryCode);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("countries.docs.removeFailed")
      );
    } finally {
      setRemovingId(null);
    }
  };

  // Catalog entries not yet attached to this country.
  const availableDocTypes = docTypes.filter(
    (dt) =>
      dt.status === "ACTIVE" &&
      !countryDocs.some((cd) => cd.documentTypeId === dt.id)
  );

  const headers = [
    {
      name: t("countries.col.order"),
      cell: (row: ExchangeCountry) => (
        <span className="text-sm text-muted-foreground">{row.sortOrder}</span>
      ),
      width: "80px",
    },
    {
      name: t("countries.col.code"),
      cell: (row: ExchangeCountry) => (
        <span className="font-mono text-xs font-medium">{row.countryCode}</span>
      ),
      width: "100px",
    },
    {
      name: t("common:name"),
      cell: (row: ExchangeCountry) => (
        <span className="text-sm">{row.countryName}</span>
      ),
      width: "200px",
    },
    {
      name: t("countries.col.currency"),
      cell: (row: ExchangeCountry) => (
        <span className="text-sm text-muted-foreground">
          {row.currencyCode || "-"}
        </span>
      ),
      width: "110px",
    },
    {
      name: t("common:status"),
      cell: (row: ExchangeCountry) => (
        <StatusBadge status={row.status} label={statusLabel(row.status)} />
      ),
      width: "110px",
    },
    {
      name: t("countries.col.action"),
      cell: (row: ExchangeCountry) => (
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
                  openDocs(row);
                }}
              >
                <FileText className="h-4 w-4" />
                {t("countries.action.documents")}
              </DropdownMenuItem>
              {canEditCountry && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    openEdit(row);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  {t("common:edit")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) =>
      [c.countryCode, c.countryName, c.currencyCode, c.status]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [countries, search]);

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
            <Globe className="h-4 w-4" />
          </span>
          {t("countries.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">
          {t("countries.subtitle")}
        </p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("countries.search")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 220, borderRadius: 2, height: 40 }}
          />
          {canCreateCountry && (
            <Button
              className="gap-2 wallet-brand-btn"
              onClick={openCreate}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto" }}
            >
              <Plus className="h-4 w-4" />
              {t("countries.new")}
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

      {/* Create / edit country */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="exch-dialog sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("countries.dialog.editTitle")
                : t("countries.dialog.newTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 coa-form">
            <FormField label={t("countries.field.code")} required>
              <Input
                placeholder="AE"
                maxLength={2}
                value={form.countryCode}
                disabled={!!editing}
                onChange={(e) =>
                  setForm((s) => ({ ...s, countryCode: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("countries.field.name")} required>
              <Input
                placeholder="United Arab Emirates"
                value={form.countryName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, countryName: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("countries.field.currency")}>
              <Input
                placeholder="AED"
                maxLength={3}
                value={form.currencyCode}
                onChange={(e) =>
                  setForm((s) => ({ ...s, currencyCode: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("countries.field.sortOrder")}>
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
                      status: v as ExchangeCountryStatus,
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
            <FormField label={t("countries.field.flagUrl")} className="md:col-span-2">
              <Input
                placeholder="https://…"
                value={form.flagUrl}
                onChange={(e) =>
                  setForm((s) => ({ ...s, flagUrl: e.target.value }))
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
              {t("common:cancel")}
            </Button>
            <Button
              className="wallet-brand-btn"
              onClick={save}
              disabled={isSaving}
            >
              {isSaving
                ? t("countries.form.saving")
                : editing
                  ? t("common:saveChanges")
                  : t("common:create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Required documents manager */}
      <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
        <DialogContent className="exch-dialog sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("countries.docs.titleFor", {
                name: docsCountry?.countryName || "",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("countries.docs.description")}
            </DialogDescription>
          </DialogHeader>

          {/* Add row */}
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("countries.docs.addTitle")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">{t("countries.docs.docType")}</Label>
                <Select value={addDocTypeId} onValueChange={setAddDocTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("countries.docs.selectCatalog")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDocTypes.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {t("countries.docs.noMoreTypes")}
                      </div>
                    ) : (
                      availableDocTypes.map((dt) => (
                        <SelectItem key={dt.id} value={dt.id}>
                          {dt.name} ({dt.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full space-y-1.5 sm:w-[150px]">
                <Label className="text-xs">
                  {t("countries.docs.requirement")}
                </Label>
                <Select value={addMandatory} onValueChange={setAddMandatory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">
                      {t("countries.docs.mandatory")}
                    </SelectItem>
                    <SelectItem value="false">
                      {t("countries.docs.optional")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="wallet-brand-btn gap-1"
                onClick={addDoc}
                disabled={isAddingDoc || !addDocTypeId}
              >
                <Plus className="h-4 w-4" />
                {isAddingDoc
                  ? t("countries.docs.adding")
                  : t("countries.docs.add")}
              </Button>
            </div>
          </div>

          {/* Current list */}
          <div className="mt-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("countries.docs.listTitle")}
              </p>
              {countryDocs.length > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {countryDocs.length}
                </span>
              )}
            </div>

            {docsLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10 text-sm text-muted-foreground">
                {t("countries.docs.loading")}
              </div>
            ) : countryDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-10 text-center">
                <FileText className="h-6 w-6 text-muted-foreground/60" />
                <p className="text-sm font-medium">
                  {t("countries.docs.emptyTitle")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("countries.docs.emptyHint")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {countryDocs.map((cd) => (
                  <div
                    key={cd.id}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {cd.documentTypeName}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {cd.documentTypeCode}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant={cd.mandatory ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {cd.mandatory
                              ? t("countries.docs.mandatory")
                              : t("countries.docs.optional")}
                          </Badge>
                          {cd.sullisVerify && (
                            <Badge variant="outline" className="text-[10px]">
                              {t("countries.docs.sullisVerify")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeDoc(cd)}
                      disabled={removingId === cd.id}
                      title={t("countries.docs.removeTitle")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDocsDialogOpen(false)}
            >
              {t("common:done")}
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

export default ExchangeCountries;
