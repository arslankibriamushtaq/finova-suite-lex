import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Coins, Plus, Pencil, ChevronDown, RefreshCw } from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { SearchField } from "../../../components/shared/filterKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import {
  listBnplCurrencyLimits,
  setBnplCurrencyLimit,
  formatBnplAmount,
  bnplErrorMessage,
  type BnplCurrencyLimit,
} from "../../../redux/apis/apisBnplAdmin";
import { usePermissions, BNPL_PERMISSIONS } from "../../../hooks/useProductPermissions";

/**
 * Same trigger as every other Action column — the emerald paint, padding and
 * height come from the global table-action rules in tokens.css, which key off
 * `bg-foreground` / `aria-haspopup`.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/** Every field is a string while editing — a half-typed number is not a number. */
type FormState = {
  currency: string;
  totalLimit: string;
  enabled: boolean;
};

const emptyForm: FormState = { currency: "", totalLimit: "", enabled: true };

/** ISO 4217 is three letters; anything else is a typo, not a currency. */
const ISO_CODE = /^[A-Za-z]{3}$/;

const BnplCurrencyLimits = () => {
  const { t } = useTranslation("bnpl");
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(BNPL_PERMISSIONS.CURRENCY_LIMIT_UPDATE);

  const [limits, setLimits] = useState<BnplCurrencyLimit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [dialogOpen, setDialogOpen] = useState(false);
  /** The currency being edited — null while adding a new one. */
  const [editing, setEditing] = useState<BnplCurrencyLimit | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      setLimits(await listBnplCurrencyLimits());
    } catch (error) {
      toast.error(bnplErrorMessage(error, t("lim.toast.loadFailed")));
      setLimits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: BnplCurrencyLimit) => {
    setEditing(row);
    setForm({
      currency: row.currency,
      totalLimit: String(row.totalLimit ?? ""),
      enabled: !!row.enabled,
    });
    setDialogOpen(true);
  };

  /** Mirror of the API's own rules: a three-letter code and a limit above 0. */
  const validate = (): string | null => {
    const code = form.currency.trim();
    const limit = Number(form.totalLimit);
    if (!editing) {
      if (!code) return t("lim.valid.currencyRequired");
      if (!ISO_CODE.test(code)) return t("lim.valid.currencyFormat");
      if (limits.some((l) => l.currency?.toUpperCase() === code.toUpperCase()))
        return t("lim.valid.currencyExists");
    }
    if (!Number.isFinite(limit) || limit <= 0) return t("lim.valid.totalLimit");
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return toast.error(problem);

    const code = form.currency.trim().toUpperCase();
    setIsSaving(true);
    try {
      await setBnplCurrencyLimit(code, {
        totalLimit: Number(form.totalLimit),
        enabled: form.enabled,
      });
      toast.success(editing ? t("lim.toast.updated") : t("lim.toast.created"));
      setDialogOpen(false);
      load();
    } catch (error) {
      toast.error(bnplErrorMessage(error, t("lim.toast.saveFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  const headers = [
    {
      name: t("lim.col.currency"),
      cell: (row: BnplCurrencyLimit) => (
        <span className="font-mono font-medium">{row.currency}</span>
      ),
      width: "130px",
    },
    {
      name: t("lim.col.totalLimit"),
      cell: (row: BnplCurrencyLimit) => (
        <span className="font-medium whitespace-nowrap">
          {formatBnplAmount(row.totalLimit, row.currency)}
        </span>
      ),
      width: "200px",
    },
    {
      // The badge is built inline rather than pulled into a component: TableView
      // measures a cell by walking `props.children`, and a child component's own
      // render output is invisible to it — the column would be sized from the
      // header text alone and clip a longer label.
      name: t("lim.col.status"),
      cell: (row: BnplCurrencyLimit) => (
        <Badge
          variant="outline"
          className={`border font-medium whitespace-nowrap ${
            row.enabled ? TONES.emerald : TONES.slate
          }`}
        >
          {row.enabled ? t("lim.status.enabled") : t("lim.status.disabled")}
        </Badge>
      ),
      width: "130px",
    },
    {
      name: t("lim.col.updatedAt"),
      cell: (row: BnplCurrencyLimit) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {row.updatedAt ? formatDateTime(row.updatedAt) : "-"}
        </span>
      ),
      width: "190px",
    },
    {
      name: t("lim.col.action"),
      cell: (row: BnplCurrencyLimit) =>
        !canEdit ? (
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
                  {t("lim.action.edit")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      width: "120px",
    },
  ];

  // The endpoint returns every configured currency at once, so search and
  // paging happen here rather than round-tripping.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return limits;
    return limits.filter((l) =>
      String(l.currency || "")
        .toLowerCase()
        .includes(q)
    );
  }, [limits, search]);

  const fromIndex = (page - 1) * pageSize;
  const paged = filtered.slice(fromIndex, fromIndex + pageSize);
  const totalPage = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <Coins className="h-4 w-4" />
          </span>
          {t("lim.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("lim.subtitle")}</p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            id="bnpl-currency-limits-search"
            className="flex-1"
            placeholder={t("lim.search")}
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 sm:flex-none"
              onClick={load}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
            {canEdit && (
              <Button
                className="wallet-brand-btn h-10 flex-1 gap-2 sm:flex-none"
                onClick={openCreate}
              >
                <Plus className="h-4 w-4" />
                {t("lim.new")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={paged}
          totalRows={filtered.length}
          isLoading={isLoading}
          from={filtered.length === 0 ? 0 : fromIndex + 1}
          to={Math.min(page * pageSize, filtered.length)}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={(size: number) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="pro-dialog sm:max-w-[480px]">
          <DialogHeader className="text-start">
            <DialogTitle>
              {editing
                ? t("lim.dialog.editTitle", { currency: editing.currency })
                : t("lim.dialog.newTitle")}
            </DialogTitle>
            <DialogDescription>
              {editing ? t("lim.dialog.editDescription") : t("lim.dialog.newDescription")}
            </DialogDescription>
          </DialogHeader>

          {/* Scrolling lives here: tokens.css sets `overflow: hidden` on
              [data-slot="dialog-content"] unlayered, which outranks utilities. */}
          <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto overflow-x-hidden">
            <FormField
              label={t("lim.field.currency")}
              required
              hint={editing ? t("lim.field.currencyLocked") : t("lim.field.currencyHint")}
            >
              <Input
                placeholder="SAR"
                maxLength={3}
                // The currency IS the row's identity — editing it would silently
                // write a second row rather than rename this one.
                disabled={!!editing}
                value={form.currency}
                onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value.toUpperCase() }))}
              />
            </FormField>

            <FormField
              label={t("lim.field.totalLimit")}
              required
              hint={t("lim.field.totalLimitHint")}
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="5000.00"
                value={form.totalLimit}
                onChange={(e) => setForm((s) => ({ ...s, totalLimit: e.target.value }))}
              />
            </FormField>

            <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-3">
              <div>
                <Label>{t("lim.field.enabled")}</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {/* Turning a currency off is the one destructive-feeling
                      action here, so the copy says exactly how far it reaches. */}
                  {form.enabled ? t("lim.field.enabledOnHint") : t("lim.field.enabledOffHint")}
                </p>
              </div>
              <Switch
                checked={form.enabled}
                onCheckedChange={(checked) => setForm((s) => ({ ...s, enabled: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={save} disabled={isSaving}>
              {isSaving
                ? t("cat.field.saving")
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
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default BnplCurrencyLimits;
