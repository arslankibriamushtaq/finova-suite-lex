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
} from "lucide-react";

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
import { FilterField, SearchField } from "../../../components/shared/filterKit";
import { TONES } from "../../../components/shared/detailKitUtils";
import {
  listBnplCategories,
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
  type BnplCategoryStatus,
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

/** Every field is a string while editing — a half-typed number is not a number. */
type FormState = {
  code: string;
  nameEn: string;
  nameAr: string;
  minAmount: string;
  maxAmount: string;
  feeType: BnplFeeType;
  feeValue: string;
  repaymentDueDays: string;
  sortOrder: string;
};

const emptyForm: FormState = {
  code: "",
  nameEn: "",
  nameAr: "",
  minAmount: "",
  maxAmount: "",
  feeType: "PERCENT",
  feeValue: "",
  repaymentDueDays: "30",
  sortOrder: "0",
};

const BnplCategories = () => {
  const { t } = useTranslation("bnpl");
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(BNPL_PERMISSIONS.CATEGORY_CREATE);
  const canEdit = hasPermission(BNPL_PERMISSIONS.CATEGORY_EDIT);
  const canDelete = hasPermission(BNPL_PERMISSIONS.CATEGORY_DELETE);

  const [categories, setCategories] = useState<BnplCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [feeType, setFeeType] = useState(ALL);
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
      setCategories(await listBnplCategories());
    } catch (error) {
      toast.error(bnplErrorMessage(error, t("cat.toast.loadFailed")));
      setCategories([]);
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

  const openEdit = (row: BnplCategory) => {
    setEditing(row);
    setForm({
      code: row.code,
      nameEn: row.nameEn ?? "",
      nameAr: row.nameAr ?? "",
      minAmount: String(row.minAmount ?? ""),
      maxAmount: String(row.maxAmount ?? ""),
      feeType: row.feeType ?? "PERCENT",
      feeValue: String(row.feeValue ?? ""),
      repaymentDueDays: String(row.repaymentDueDays ?? ""),
      sortOrder: String(row.sortOrder ?? 0),
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
    if (!Number.isFinite(min) || min <= 0) return t("cat.valid.minAmount");
    if (!Number.isFinite(max) || max < min) return t("cat.valid.maxAmount");
    if (!Number.isFinite(fee) || fee < 0) return t("cat.valid.feeValue");
    if (form.feeType === "PERCENT" && fee > 100) return t("cat.valid.percentRange");
    if (!Number.isFinite(days) || days <= 0) return t("cat.valid.dueDays");
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return toast.error(problem);

    // Shared by both bodies — create adds `code` on top.
    const common: UpdateBnplCategoryRequest = {
      nameEn: form.nameEn.trim(),
      nameAr: form.nameAr.trim() || null,
      minAmount: Number(form.minAmount),
      maxAmount: Number(form.maxAmount),
      feeType: form.feeType,
      feeValue: Number(form.feeValue),
      repaymentDueDays: Number(form.repaymentDueDays),
      sortOrder: Number(form.sortOrder) || 0,
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
      // Code and name stack rather than sit inline: TableView sizes a column
      // from its widest stacked line, but measures inline siblings as the
      // widest single one, so an inline pair renders wider than its column.
      name: t("cat.col.name"),
      cell: (row: BnplCategory) => (
        <div className="flex flex-col">
          <span>{row.nameEn || "-"}</span>
          {row.nameAr && <span className="text-muted-foreground">{row.nameAr}</span>}
        </div>
      ),
      width: "220px",
    },
    {
      name: t("cat.col.range"),
      // One interpolated string, not `{min} — {max}`: TableView measures inline
      // siblings as the widest SINGLE child rather than their sum, so a split
      // expression sizes the column to "SAR 2,000.00" alone and the cell —
      // overflow:hidden globally — clips the rest of the range.
      cell: (row: BnplCategory) => (
        <span className="whitespace-nowrap">
          {`${formatBnplAmount(row.minAmount)} — ${formatBnplAmount(row.maxAmount)}`}
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
          {formatBnplFee(row.feeType, row.feeValue)}
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
      if (!q) return true;
      return [c.code, c.nameEn, c.nameAr]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q));
    });
  }, [categories, search, status, feeType]);

  // How many of the collapsed filters are applied — search is excluded, it has
  // its own visible field. Shown on the Filters button so a hidden filter is
  // never a surprise, and it keeps Clear disabled while nothing is set.
  const activeFilterCount = [status !== ALL, feeType !== ALL].filter(Boolean).length;

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
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                disabled={activeFilterCount === 0 && !search.trim()}
                onClick={() => {
                  setStatus(ALL);
                  setFeeType(ALL);
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
        <DialogContent className="pro-dialog sm:max-w-[560px]">
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

            <FormField label={t("cat.field.nameAr")}>
              <Input
                dir="rtl"
                placeholder={t("cat.field.nameArPlaceholder")}
                value={form.nameAr}
                onChange={(e) => setForm((s) => ({ ...s, nameAr: e.target.value }))}
              />
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
                  : t("cat.field.feeValueFlatHint")
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

            {Number(form.feeValue) > 0 && (
              <div className="md:col-span-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <p className="text-xs font-semibold">{t("cat.preview.title")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("cat.preview.line", {
                    amount: formatBnplAmount(PREVIEW_BASIS),
                    fee: formatBnplAmount(previewFee),
                    total: formatBnplAmount(PREVIEW_BASIS + previewFee),
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
