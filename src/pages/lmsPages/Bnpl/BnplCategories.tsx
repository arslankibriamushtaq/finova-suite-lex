import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Plus,
  Pencil,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  Power,
  PowerOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";

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
import { FilterField, SearchField } from "../../../components/shared/filterKit";
import { TONES } from "../../../components/shared/detailKitUtils";
import {
  listBnplCategories,
  listBnplCurrencyLimits,
  createBnplCategory,
  updateBnplCategory,
  activateBnplCategory,
  deactivateBnplCategory,
  deleteBnplCategory,
  formatBnplAmount,
  formatBnplFee,
  previewBnplFee,
  isDuplicateCodeError,
  bnplErrorMessage,
  type BnplCategory,
  type BnplCategoryField,
  type BnplCategoryStatus,
  type BnplFieldType,
  type BnplCurrencyLimit,
  type BnplFeeType,
  type CreateBnplCategoryRequest,
  type UpdateBnplCategoryRequest,
} from "../../../redux/apis/apisBnplAdmin";
import { usePermissions, BNPL_PERMISSIONS } from "../../../hooks/useProductPermissions";

const ALL = "ALL";

/**
 * Row-action dropdown trigger, identical to the other tables. The emerald
 * paint, padding and height come from the global table-action rules in
 * tokens.css, which key off `bg-foreground` / `aria-haspopup` — so keep those
 * classes for the button to look like every other Action column in the app.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/** The purchase amount the form's fee preview is worked out against. */
const PREVIEW_BASIS = 1000;

/**
 * One customer input while it is being edited. Every numeric bound is a string
 * for the same reason the category's own amounts are: a half-typed number is not
 * a number. `sortOrder` is not stored — the array order IS the display order,
 * so there is no second place for it to disagree with what the admin sees.
 */
type FieldFormState = {
  fieldKey: string;
  label: string;
  fieldType: BnplFieldType;
  required: boolean;
  placeholder: string;
  pattern: string;
  minLength: string;
  maxLength: string;
  minValue: string;
  maxValue: string;
};

const emptyField: FieldFormState = {
  fieldKey: "",
  label: "",
  fieldType: "TEXT",
  required: true,
  placeholder: "",
  pattern: "",
  minLength: "",
  maxLength: "",
  minValue: "",
  maxValue: "",
};

/** A blank optional bound is "not set", which the API wants as null, not 0. */
const numOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

const strOrNull = (value: string): string | null => value.trim() || null;

const toFieldForm = (field: BnplCategoryField): FieldFormState => ({
  fieldKey: field.fieldKey ?? "",
  label: field.label ?? "",
  fieldType: field.fieldType ?? "TEXT",
  required: !!field.required,
  placeholder: field.placeholder ?? "",
  pattern: field.pattern ?? "",
  minLength:
    field.minLength === null || field.minLength === undefined ? "" : String(field.minLength),
  maxLength:
    field.maxLength === null || field.maxLength === undefined ? "" : String(field.maxLength),
  minValue: field.minValue === null || field.minValue === undefined ? "" : String(field.minValue),
  maxValue: field.maxValue === null || field.maxValue === undefined ? "" : String(field.maxValue),
});

/** Value bounds belong to NUMBER alone, so they are dropped for the other types. */
const toFieldBody = (field: FieldFormState, index: number): BnplCategoryField => ({
  fieldKey: field.fieldKey.trim().toLowerCase(),
  label: field.label.trim(),
  fieldType: field.fieldType,
  required: field.required,
  placeholder: strOrNull(field.placeholder),
  pattern: strOrNull(field.pattern),
  minLength: numOrNull(field.minLength),
  maxLength: numOrNull(field.maxLength),
  minValue: field.fieldType === "NUMBER" ? numOrNull(field.minValue) : null,
  maxValue: field.fieldType === "NUMBER" ? numOrNull(field.maxValue) : null,
  // The list order is the display order; the API still wants it as a number.
  sortOrder: index + 1,
});

/** Every field is a string while editing — a half-typed number is not a number. */
type FormState = {
  code: string;
  nameEn: string;
  currency: string;
  minAmount: string;
  maxAmount: string;
  feeType: BnplFeeType;
  feeValue: string;
  repaymentDueDays: string;
  sortOrder: string;
  fields: FieldFormState[];
};

const emptyForm: FormState = {
  code: "",
  nameEn: "",
  currency: "",
  minAmount: "",
  maxAmount: "",
  feeType: "PERCENT",
  feeValue: "",
  repaymentDueDays: "30",
  sortOrder: "0",
  fields: [],
};

const BnplCategories = () => {
  const { t } = useTranslation("bnpl");
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(BNPL_PERMISSIONS.CATEGORY_CREATE);
  const canEdit = hasPermission(BNPL_PERMISSIONS.CATEGORY_EDIT);
  const canDelete = hasPermission(BNPL_PERMISSIONS.CATEGORY_DELETE);

  const [categories, setCategories] = useState<BnplCategory[]>([]);
  /**
   * The configured currency limits — a category can only be created in a
   * currency that has one, so this list is what the form's currency select
   * offers. Loaded alongside the catalog rather than on dialog open, so the
   * "no currency configured yet" case is visible before the admin starts.
   */
  const [currencyLimits, setCurrencyLimits] = useState<BnplCurrencyLimit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [feeType, setFeeType] = useState(ALL);
  const [currency, setCurrency] = useState(ALL);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BnplCategory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  /** The row whose status/delete call is in flight — keeps its menu disabled. */
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BnplCategory | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      // The limits ride along with the catalog: they populate both the currency
      // filter and the form's currency select, and one failing must not blank
      // the other, hence allSettled over Promise.all.
      const [rows, limits] = await Promise.allSettled([
        listBnplCategories(),
        listBnplCurrencyLimits(),
      ]);
      if (rows.status === "fulfilled") setCategories(rows.value);
      else {
        toast.error(bnplErrorMessage(rows.reason, t("cat.toast.loadFailed")));
        setCategories([]);
      }
      setCurrencyLimits(limits.status === "fulfilled" ? limits.value : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Currencies a category may be created in — configured and switched on. */
  const enabledCurrencies = useMemo(
    () => currencyLimits.filter((l) => l.enabled).map((l) => l.currency),
    [currencyLimits]
  );

  /**
   * What the currency filter offers: every currency actually present in the
   * catalog, plus any configured one — a currency can be set up before it has
   * categories, and filtering to it should show that it is empty.
   */
  const filterCurrencies = useMemo(
    () =>
      Array.from(
        new Set(
          [...categories.map((c) => c.currency), ...currencyLimits.map((l) => l.currency)].filter(
            Boolean
          )
        )
      ).sort(),
    [categories, currencyLimits]
  );

  const openCreate = () => {
    setEditing(null);
    // Pre-pick when there is only one currency to pick — the field is then a
    // formality, and an empty required select would be the only thing standing
    // between the admin and a save.
    setForm({
      ...emptyForm,
      currency: enabledCurrencies.length === 1 ? enabledCurrencies[0] : "",
    });
    setDialogOpen(true);
  };

  const openEdit = (row: BnplCategory) => {
    setEditing(row);
    setForm({
      code: row.code,
      nameEn: row.nameEn ?? "",
      currency: row.currency ?? "",
      minAmount: String(row.minAmount ?? ""),
      maxAmount: String(row.maxAmount ?? ""),
      feeType: row.feeType ?? "PERCENT",
      feeValue: String(row.feeValue ?? ""),
      repaymentDueDays: String(row.repaymentDueDays ?? ""),
      sortOrder: String(row.sortOrder ?? 0),
      // Sorted here rather than trusted from the response, since the array order
      // is what the editor then treats as the display order.
      fields: [...(row.fields ?? [])]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map(toFieldForm),
    });
    setDialogOpen(true);
  };

  /**
   * Mirror of the API's own rules, so a bad body never leaves the browser:
   * min > 0, max ≥ min, fee ≥ 0, dueDays > 0. Returns the message to show, or
   * null when the form is good.
   */
  const validate = (): string | null => {
    const min = Number(form.minAmount);
    const max = Number(form.maxAmount);
    const fee = Number(form.feeValue);
    const days = Number(form.repaymentDueDays);

    if (!editing && !form.code.trim()) return t("cat.valid.codeRequired");
    if (!form.nameEn.trim()) return t("cat.valid.nameRequired");
    if (!editing && !form.currency.trim()) return t("cat.valid.currencyRequired");
    if (!Number.isFinite(min) || min <= 0) return t("cat.valid.minAmount");
    if (!Number.isFinite(max) || max < min) return t("cat.valid.maxAmount");
    if (!Number.isFinite(fee) || fee < 0) return t("cat.valid.feeValue");
    if (form.feeType === "PERCENT" && fee > 100) return t("cat.valid.percentRange");
    if (!Number.isFinite(days) || days <= 0) return t("cat.valid.dueDays");

    // The customer's form, checked here for the same reason the rest is: a bad
    // field definition comes back as a flat 400 with no clue which row broke it.
    const seen = new Set<string>();
    for (let i = 0; i < form.fields.length; i += 1) {
      const field = form.fields[i];
      const where = { index: i + 1, label: field.label.trim() || field.fieldKey.trim() };
      const key = field.fieldKey.trim().toLowerCase();
      if (!key) return t("cat.valid.field.keyRequired", where);
      if (!/^[a-z0-9_]+$/.test(key)) return t("cat.valid.field.keyFormat", where);
      if (seen.has(key)) return t("cat.valid.field.keyDuplicate", { ...where, key });
      seen.add(key);
      if (!field.label.trim()) return t("cat.valid.field.labelRequired", where);

      if (field.pattern.trim()) {
        try {
          // Compiled, not just eyeballed: the API rejects a malformed pattern at
          // save time, and doing it here names the field that carries it.
          new RegExp(field.pattern.trim());
        } catch {
          return t("cat.valid.field.pattern", where);
        }
      }

      const minLen = numOrNull(field.minLength);
      const maxLen = numOrNull(field.maxLength);
      if (minLen !== null && minLen < 0) return t("cat.valid.field.lengthNegative", where);
      if (minLen !== null && maxLen !== null && maxLen < minLen)
        return t("cat.valid.field.lengthOrder", where);

      if (field.fieldType === "NUMBER") {
        const minVal = numOrNull(field.minValue);
        const maxVal = numOrNull(field.maxValue);
        if (minVal !== null && maxVal !== null && maxVal < minVal)
          return t("cat.valid.field.valueOrder", where);
      }
    }
    return null;
  };

  const patchField = (index: number, patch: Partial<FieldFormState>) =>
    setForm((state) => ({
      ...state,
      fields: state.fields.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    }));

  const addField = () =>
    setForm((state) => ({ ...state, fields: [...state.fields, { ...emptyField }] }));

  const removeField = (index: number) =>
    setForm((state) => ({ ...state, fields: state.fields.filter((_, i) => i !== index) }));

  /** Reordering is the only way to set display order — see FieldFormState. */
  const moveField = (index: number, delta: number) =>
    setForm((state) => {
      const target = index + delta;
      if (target < 0 || target >= state.fields.length) return state;
      const fields = [...state.fields];
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...state, fields };
    });

  const save = async () => {
    const problem = validate();
    if (problem) return toast.error(problem);

    // Shared by both bodies — create adds `code` on top.
    const common: UpdateBnplCategoryRequest = {
      nameEn: form.nameEn.trim(),
      minAmount: Number(form.minAmount),
      maxAmount: Number(form.maxAmount),
      feeType: form.feeType,
      feeValue: Number(form.feeValue),
      repaymentDueDays: Number(form.repaymentDueDays),
      sortOrder: Number(form.sortOrder) || 0,
      // Replace-all: whatever is in the editor becomes the complete set, so the
      // array is always sent — an omitted one would delete the lot.
      fields: form.fields.map(toFieldBody),
    };

    setIsSaving(true);
    try {
      if (editing) {
        await updateBnplCategory(editing.id, common);
        toast.success(t("cat.toast.updated"));
      } else {
        const body: CreateBnplCategoryRequest = {
          ...common,
          code: form.code.trim().toUpperCase(),
          currency: form.currency.trim().toUpperCase(),
        };
        await createBnplCategory(body);
        toast.success(t("cat.toast.created"));
      }
      setDialogOpen(false);
      load();
    } catch (error) {
      // A taken code is the one failure the admin can act on directly, so it
      // gets its own message rather than the generic save error.
      toast.error(
        isDuplicateCodeError(error)
          ? t("cat.toast.duplicateCode")
          : bnplErrorMessage(error, t("cat.toast.saveFailed"))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (row: BnplCategory) => {
    const activating = row.status !== "ACTIVE";
    setBusyId(row.id);
    try {
      if (activating) {
        await activateBnplCategory(row.id);
        toast.success(t("cat.toast.activated"));
      } else {
        await deactivateBnplCategory(row.id);
        toast.success(t("cat.toast.deactivated"));
      }
      load();
    } catch (error) {
      toast.error(bnplErrorMessage(error, t("cat.toast.statusFailed")));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    try {
      await deleteBnplCategory(pendingDelete.id);
      toast.success(t("cat.toast.deleted"));
      setPendingDelete(null);
      load();
    } catch (error) {
      toast.error(bnplErrorMessage(error, t("cat.toast.deleteFailed")));
    } finally {
      setBusyId(null);
    }
  };

  const statusLabel = (value?: BnplCategoryStatus) =>
    value === "ACTIVE" ? t("common:active") : t("common:inactive");

  const headers = [
    {
      name: t("cat.col.order"),
      cell: (row: BnplCategory) => (
        <span className="text-muted-foreground">{row.sortOrder ?? 0}</span>
      ),
      width: "80px",
    },
    {
      name: t("cat.col.code"),
      cell: (row: BnplCategory) => <span className="font-mono font-medium">{row.code}</span>,
      width: "170px",
    },
    {
      name: t("cat.col.name"),
      cell: (row: BnplCategory) => <span>{row.nameEn || "-"}</span>,
      width: "220px",
    },
    {
      // The same code exists once per currency, so the currency is what tells
      // two otherwise identical EASYLOAD rows apart — it belongs in the table,
      // not just in the amounts.
      name: t("cat.col.currency"),
      cell: (row: BnplCategory) => (
        <span className="font-mono font-medium">{row.currency || "-"}</span>
      ),
      width: "110px",
    },
    {
      name: t("cat.col.range"),
      // One interpolated string, not `{min} — {max}`: TableView measures inline
      // siblings as the widest SINGLE child rather than their sum, so a split
      // expression sizes the column to "SAR 2,000.00" alone and the cell —
      // overflow:hidden globally — clips the rest of the range.
      cell: (row: BnplCategory) => (
        <span className="whitespace-nowrap">
          {`${formatBnplAmount(row.minAmount, row.currency)} — ${formatBnplAmount(row.maxAmount, row.currency)}`}
        </span>
      ),
      width: "230px",
    },
    {
      name: t("cat.col.fee"),
      // Value only, on one line. The formatted value already carries its type —
      // "2%" is visibly a percent and "SAR 15.00" visibly a flat amount — so the
      // "Percent" / "Flat" caption underneath was saying it a second time. The
      // fee-type filter is still there for anyone who wants to split them.
      cell: (row: BnplCategory) => (
        <span className="font-medium whitespace-nowrap">
          {formatBnplFee(row.feeType, row.feeValue, row.currency)}
        </span>
      ),
      width: "140px",
    },
    {
      name: t("cat.col.dueDays"),
      cell: (row: BnplCategory) => <span>{t("cat.dueDays", { count: row.repaymentDueDays })}</span>,
      width: "130px",
    },
    {
      name: t("cat.col.status"),
      // The badge is built inline rather than pulled out into a <StatusBadge/>
      // component: TableView measures a cell by walking `props.children`, and a
      // child component's own render output is invisible to it — the column
      // would be sized from the header text alone and clip a longer label
      // (Arabic "غير نشط", French "Inactif").
      cell: (row: BnplCategory) => (
        <Badge
          variant="outline"
          className={`border font-medium whitespace-nowrap ${
            row.status === "ACTIVE" ? TONES.emerald : TONES.slate
          }`}
        >
          {statusLabel(row.status)}
        </Badge>
      ),
      width: "110px",
    },
    {
      name: t("cat.col.action"),
      cell: (row: BnplCategory) =>
        !canEdit && !canDelete ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          // Row clicks are stopped here so opening the menu never triggers the
          // row's own handlers, same as every other Action column in the app.
          <div
            className="relative inline-block"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button type="button" className={SELECT_TRIGGER_CLS} disabled={busyId === row.id}>
                  {t("common:select")}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
                {canEdit && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      openEdit(row);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    {t("cat.action.edit")}
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleStatus(row);
                    }}
                  >
                    {row.status === "ACTIVE" ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                    {row.status === "ACTIVE"
                      ? t("cat.action.deactivate")
                      : t("cat.action.activate")}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => {
                      e.preventDefault();
                      setPendingDelete(row);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("cat.action.delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      width: "120px",
    },
  ];

  // The list endpoint returns the whole catalog in `sortOrder`, so search,
  // filtering and paging all happen here rather than round-tripping.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => {
      if (status !== ALL && c.status !== status) return false;
      if (feeType !== ALL && c.feeType !== feeType) return false;
      if (currency !== ALL && c.currency !== currency) return false;
      if (!q) return true;
      return [c.code, c.nameEn, c.currency]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q));
    });
  }, [categories, search, status, feeType, currency]);

  // How many of the collapsed filters are applied — search is excluded, it has
  // its own visible field. Shown on the Filters button so a hidden filter is
  // never a surprise, and it keeps Clear disabled while nothing is set.
  const activeFilterCount = [status !== ALL, feeType !== ALL, currency !== ALL].filter(
    Boolean
  ).length;

  const fromIndex = (page - 1) * pageSize;
  const paged = filtered.slice(fromIndex, fromIndex + pageSize);
  const totalPage = Math.ceil(filtered.length / pageSize) || 1;

  // Live preview of what a percent fee actually costs — a "2" on screen says
  // nothing about the money until it is applied to an amount.
  const previewFee = previewBnplFee(form.feeType, Number(form.feeValue) || 0, PREVIEW_BASIS);

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <ShoppingBag className="h-4 w-4" />
          </span>
          {t("cat.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("cat.subtitle")}</p>
      </div>

      {/* Search stays out front; the rest of the filters live behind the
          Filters button so the page opens on one clean row. */}
      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            id="bnpl-categories-search"
            className="flex-1"
            placeholder={t("cat.search")}
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
              aria-expanded={showFilters}
              aria-controls="bnpl-categories-filter-panel"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("cat.filter.title")}
              {activeFilterCount > 0 && (
                <Badge
                  variant="outline"
                  title={t("cat.filter.active", { count: activeFilterCount })}
                  className={`border font-medium ${TONES.emerald}`}
                >
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 sm:flex-none"
              onClick={load}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
            {canCreate && (
              <Button
                className="wallet-brand-btn h-10 flex-1 gap-2 sm:flex-none"
                onClick={openCreate}
              >
                <Plus className="h-4 w-4" />
                {t("cat.new")}
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div id="bnpl-categories-filter-panel" className="mt-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterField label={t("cat.filter.status")}>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setPage(1);
                  }}
                >
                  {/* h-10 to match the search field; the data-size variant is
                      what SelectTrigger sizes itself with, so plain h-10 loses. */}
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("cat.filter.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("cat.filter.allStatuses")}</SelectItem>
                    <SelectItem value="ACTIVE">{t("common:active")}</SelectItem>
                    <SelectItem value="INACTIVE">{t("common:inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("cat.filter.feeType")}>
                <Select
                  value={feeType}
                  onValueChange={(v) => {
                    setFeeType(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("cat.filter.feeType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("cat.filter.allFeeTypes")}</SelectItem>
                    <SelectItem value="FLAT">{t("cat.feeType.flat")}</SelectItem>
                    <SelectItem value="PERCENT">{t("cat.feeType.percent")}</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("cat.filter.currency")}>
                <Select
                  value={currency}
                  onValueChange={(v) => {
                    setCurrency(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("cat.filter.currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("cat.filter.allCurrencies")}</SelectItem>
                    {filterCurrencies.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                disabled={activeFilterCount === 0 && !search.trim()}
                onClick={() => {
                  setStatus(ALL);
                  setFeeType(ALL);
                  setCurrency(ALL);
                  setSearch("");
                  setPage(1);
                }}
              >
                {t("cat.filter.clear")}
              </Button>
            </div>
          </div>
        )}
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
        <DialogContent className="pro-dialog sm:max-w-[720px]">
          <DialogHeader className="text-start">
            <DialogTitle>
              {editing ? t("cat.dialog.editTitle") : t("cat.dialog.newTitle")}
            </DialogTitle>
            <DialogDescription>
              {editing ? t("cat.dialog.editDescription") : t("cat.dialog.newDescription")}
            </DialogDescription>
          </DialogHeader>

          {/* Scrolling lives here: tokens.css sets `overflow: hidden` on
              [data-slot="dialog-content"] unlayered, which outranks utilities. */}
          <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto overflow-x-hidden md:grid-cols-2">
            <FormField
              label={t("cat.field.code")}
              required
              hint={editing ? t("cat.field.codeLocked") : t("cat.field.codeHint")}
            >
              <Input
                placeholder={t("cat.field.codePlaceholder")}
                value={form.code}
                // Immutable once created: a renamed code would orphan the
                // BnplTransaction rows already pointing at it.
                disabled={!!editing}
                onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
              />
            </FormField>

            <FormField label={t("cat.field.sortOrder")}>
              <Input
                type="number"
                placeholder="0"
                value={form.sortOrder}
                onChange={(e) => setForm((s) => ({ ...s, sortOrder: e.target.value }))}
              />
            </FormField>

            <FormField label={t("cat.field.nameEn")} required>
              <Input
                placeholder={t("cat.field.nameEnPlaceholder")}
                value={form.nameEn}
                onChange={(e) => setForm((s) => ({ ...s, nameEn: e.target.value }))}
              />
            </FormField>

            <FormField
              label={t("cat.field.currency")}
              required
              hint={
                editing
                  ? t("cat.field.currencyLocked")
                  : enabledCurrencies.length === 0
                    ? t("cat.field.currencyNone")
                    : t("cat.field.currencyHint")
              }
            >
              <Select
                value={form.currency}
                // Immutable once created: re-denominating a category would
                // re-price the purchases already booked against it.
                disabled={!!editing || enabledCurrencies.length === 0}
                onValueChange={(v) => setForm((s) => ({ ...s, currency: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("cat.field.currencyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {/* On edit the row's own currency may be disabled or gone from
                      the limits list, so it is offered from the form itself. */}
                  {(editing && form.currency ? [form.currency] : enabledCurrencies).map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("cat.field.minAmount")} required>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="50.00"
                value={form.minAmount}
                onChange={(e) => setForm((s) => ({ ...s, minAmount: e.target.value }))}
              />
            </FormField>

            <FormField label={t("cat.field.maxAmount")} required>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="2000.00"
                value={form.maxAmount}
                onChange={(e) => setForm((s) => ({ ...s, maxAmount: e.target.value }))}
              />
            </FormField>

            <FormField label={t("cat.field.feeType")} required>
              <Select
                value={form.feeType}
                onValueChange={(v) => setForm((s) => ({ ...s, feeType: v as BnplFeeType }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">{t("cat.feeType.flat")}</SelectItem>
                  <SelectItem value="PERCENT">{t("cat.feeType.percent")}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label={t("cat.field.feeValue")}
              required
              hint={
                form.feeType === "PERCENT"
                  ? t("cat.field.feeValuePercentHint")
                  : t("cat.field.feeValueFlatHint", {
                      currency: form.currency || t("cat.field.currencyFallback"),
                    })
              }
            >
              <Input
                type="number"
                min="0"
                step={form.feeType === "PERCENT" ? "1" : "0.01"}
                placeholder={form.feeType === "PERCENT" ? "2" : "15.00"}
                value={form.feeValue}
                onChange={(e) => setForm((s) => ({ ...s, feeValue: e.target.value }))}
              />
            </FormField>

            <FormField
              label={t("cat.field.repaymentDueDays")}
              required
              className="md:col-span-2"
              hint={t("cat.field.repaymentDueDaysHint")}
            >
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="30"
                value={form.repaymentDueDays}
                onChange={(e) => setForm((s) => ({ ...s, repaymentDueDays: e.target.value }))}
              />
            </FormField>

            {/* The customer's own form. Nothing here is hardcoded in the app —
                what an admin declares is exactly what the customer is asked
                for, so an Easyload asks for a mobile number and a utility bill
                asks for a bill reference. */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label>{t("cat.fields.title")}</Label>
                  <p className="mt-1 text-xs text-muted-foreground">{t("cat.fields.hint")}</p>
                </div>
                <Button type="button" variant="outline" className="gap-2" onClick={addField}>
                  <Plus className="h-4 w-4" />
                  {t("cat.fields.add")}
                </Button>
              </div>

              {form.fields.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                  {t("cat.fields.empty")}
                </p>
              ) : (
                form.fields.map((field, index) => (
                  <div
                    key={index}
                    className="space-y-3 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("cat.fields.position", {
                          index: index + 1,
                          total: form.fields.length,
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={t("cat.fields.moveUp")}
                          disabled={index === 0}
                          onClick={() => moveField(index, -1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={t("cat.fields.moveDown")}
                          disabled={index === form.fields.length - 1}
                          onClick={() => moveField(index, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title={t("cat.fields.remove")}
                          onClick={() => removeField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField label={t("cat.fields.field.key")} required>
                        <Input
                          placeholder="mobile_number"
                          value={field.fieldKey}
                          onChange={(e) => patchField(index, { fieldKey: e.target.value })}
                        />
                      </FormField>

                      <FormField label={t("cat.fields.field.label")} required>
                        <Input
                          placeholder={t("cat.fields.field.labelPlaceholder")}
                          value={field.label}
                          onChange={(e) => patchField(index, { label: e.target.value })}
                        />
                      </FormField>

                      <FormField label={t("cat.fields.field.type")} required>
                        <Select
                          value={field.fieldType}
                          onValueChange={(v) =>
                            patchField(index, { fieldType: v as BnplFieldType })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEXT">{t("cat.fields.type.text")}</SelectItem>
                            <SelectItem value="NUMBER">{t("cat.fields.type.number")}</SelectItem>
                            <SelectItem value="MOBILE">{t("cat.fields.type.mobile")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label={t("cat.fields.field.placeholder")}>
                        <Input
                          placeholder="05XXXXXXXX"
                          value={field.placeholder}
                          onChange={(e) => patchField(index, { placeholder: e.target.value })}
                        />
                      </FormField>

                      <FormField
                        label={t("cat.fields.field.pattern")}
                        className="sm:col-span-2"
                        hint={t("cat.fields.field.patternHint")}
                      >
                        <Input
                          className="font-mono"
                          placeholder="^05[0-9]{8}$"
                          value={field.pattern}
                          onChange={(e) => patchField(index, { pattern: e.target.value })}
                        />
                      </FormField>

                      <FormField label={t("cat.fields.field.minLength")}>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={field.minLength}
                          onChange={(e) => patchField(index, { minLength: e.target.value })}
                        />
                      </FormField>

                      <FormField label={t("cat.fields.field.maxLength")}>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={field.maxLength}
                          onChange={(e) => patchField(index, { maxLength: e.target.value })}
                        />
                      </FormField>

                      {/* Value bounds are a NUMBER-only concept, so they are not
                          offered for the other types — the save drops them too. */}
                      {field.fieldType === "NUMBER" && (
                        <>
                          <FormField label={t("cat.fields.field.minValue")}>
                            <Input
                              type="number"
                              step="0.01"
                              value={field.minValue}
                              onChange={(e) => patchField(index, { minValue: e.target.value })}
                            />
                          </FormField>

                          <FormField label={t("cat.fields.field.maxValue")}>
                            <Input
                              type="number"
                              step="0.01"
                              value={field.maxValue}
                              onChange={(e) => patchField(index, { maxValue: e.target.value })}
                            />
                          </FormField>
                        </>
                      )}

                      <div className="flex items-center justify-between gap-3 sm:col-span-2">
                        <div>
                          <Label>{t("cat.fields.field.required")}</Label>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {field.required
                              ? t("cat.fields.field.requiredOnHint")
                              : t("cat.fields.field.requiredOffHint")}
                          </p>
                        </div>
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => patchField(index, { required: checked })}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {Number(form.feeValue) > 0 && (
              <div className="md:col-span-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <p className="text-xs font-semibold">{t("cat.preview.title")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("cat.preview.line", {
                    amount: formatBnplAmount(PREVIEW_BASIS, form.currency),
                    fee: formatBnplAmount(previewFee, form.currency),
                    total: formatBnplAmount(PREVIEW_BASIS + previewFee, form.currency),
                  })}
                </p>
              </div>
            )}
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

      {/* Delete is a deactivation, not a removal — the copy says so, because
          "Delete" on a financial record otherwise reads as destructive.

          Dialog + `pro-dialog confirm-dialog`, not AlertDialog: the app's global
          dialog theming is all written against [data-slot="dialog-*"], which
          AlertDialog's slots never match. */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="pro-dialog confirm-dialog sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
              <Trash2 className="size-6 text-red-600 dark:text-red-400" />
            </span>
            <DialogTitle className="text-center">
              {t("cat.delete.title", { name: pendingDelete?.nameEn || pendingDelete?.code || "" })}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("cat.delete.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={!!busyId}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={!!busyId}>
              {t("cat.delete.confirm")}
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
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`space-y-2 ${className || ""}`}>
    <Label>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default BnplCategories;
