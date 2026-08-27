import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Layers,
  Power,
  PowerOff,
} from "lucide-react";
import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  getAdminCardProducts,
  createAdminCardProduct,
  updateAdminCardProduct,
  activateAdminCardProduct,
  deactivateAdminCardProduct,
  deleteAdminCardProduct,
} from "../../../redux/apis/apisCardManagement";
import { CARD_TYPES, CARD_TIERS, CARD_TYPE_LABELS, prettyEnum } from "./cardConstants";

const emptyForm = {
  code: "",
  cardType: "VIRTUAL_DEBIT",
  displayName: "",
  description: "",
  category: "DEBIT",
  binPrefix: "",
  tier: "CLASSIC",
  instantIssue: true,
  requiresShipping: false,
  requiresActivation: false,
  contactlessSupported: false,
  physicalOrderable: false,
  availableTiers: ["CLASSIC"] as string[],
  features: "",
  defaultDailyLimit: "",
  defaultMonthlyLimit: "",
  currency: "CAD",
  sortOrder: 0,
};

const CardProducts = () => {
  const { t } = useTranslation("cardManagement");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const setField = (key: keyof typeof emptyForm, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminCardProducts();
      const body = response?.data;
      const list = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.data?.content)
        ? body.data.content
        : Array.isArray(body)
        ? body
        : [];
      setData(list);
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error(t("products.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode("add");
    setCurrentItemId(null);
    setForm({ ...emptyForm });
    setShowFormModal(true);
  };

  const handleEdit = (row: any) => {
    setModalMode("edit");
    setCurrentItemId(row.id);
    setForm({
      code: row.code || "",
      cardType: row.cardType || "VIRTUAL_DEBIT",
      displayName: row.displayName || "",
      description: row.description || "",
      category: row.category || "DEBIT",
      binPrefix: row.binPrefix || "",
      tier: row.tier || "CLASSIC",
      instantIssue: !!row.instantIssue,
      requiresShipping: !!row.requiresShipping,
      requiresActivation: !!row.requiresActivation,
      contactlessSupported: !!row.contactlessSupported,
      physicalOrderable: !!row.physicalOrderable,
      availableTiers: Array.isArray(row.availableTiers) ? row.availableTiers : [],
      features: Array.isArray(row.features) ? row.features.join("\n") : "",
      defaultDailyLimit: row.defaultDailyLimit ?? "",
      defaultMonthlyLimit: row.defaultMonthlyLimit ?? "",
      currency: row.currency || "CAD",
      sortOrder: row.sortOrder ?? 0,
    });
    setShowFormModal(true);
  };

  const toggleTier = (tier: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      availableTiers: checked
        ? [...prev.availableTiers, tier]
        : prev.availableTiers.filter((t) => t !== tier),
    }));
  };

  const handleSave = async () => {
    if (!form.code.trim()) return toast.error(t("products.toast.codeRequired"));
    if (!form.displayName.trim()) return toast.error(t("products.toast.displayNameRequired"));
    if (!form.cardType) return toast.error(t("validation.cardTypeRequired"));

    const body: any = {
      code: form.code.trim(),
      cardType: form.cardType,
      displayName: form.displayName.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      binPrefix: form.binPrefix.trim() || null,
      tier: form.tier,
      instantIssue: form.instantIssue,
      requiresShipping: form.requiresShipping,
      requiresActivation: form.requiresActivation,
      contactlessSupported: form.contactlessSupported,
      physicalOrderable: form.physicalOrderable,
      availableTiers: form.availableTiers,
      features: form.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      currency: form.currency.trim() || "CAD",
      sortOrder: Number(form.sortOrder) || 0,
    };
    if (form.defaultDailyLimit !== "") body.defaultDailyLimit = Number(form.defaultDailyLimit);
    if (form.defaultMonthlyLimit !== "")
      body.defaultMonthlyLimit = Number(form.defaultMonthlyLimit);

    try {
      setIsSaving(true);
      if (modalMode === "edit" && currentItemId) {
        await updateAdminCardProduct(currentItemId, body);
        toast.success(t("products.toast.updated"));
      } else {
        await createAdminCardProduct(body);
        toast.success(t("products.toast.created"));
      }
      setShowFormModal(false);
      fetchData();
    } catch (error: any) {
      if (!error?.response?.data?.message)
        toast.error(
          modalMode === "edit"
            ? t("products.toast.updateFailed")
            : t("products.toast.createFailed")
        );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (row: any) => {
    try {
      setActioningId(row.id);
      if (row.active) {
        await deactivateAdminCardProduct(row.id);
        toast.success(t("products.toast.deactivated"));
      } else {
        await activateAdminCardProduct(row.id);
        toast.success(t("products.toast.activated"));
      }
      fetchData();
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error(t("toast.actionFailed"));
    } finally {
      setActioningId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteAdminCardProduct(deleteTarget.id);
      toast.success(t("products.toast.deleted"));
      setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error(t("products.toast.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side search over the (typically small) catalog.
  const filtered = searchTerm
    ? data.filter((p) =>
        [p.displayName, p.code, p.cardType]
          .filter(Boolean)
          .some((v: string) => v.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : data;

  const from = (page - 1) * pageSize;
  const paged = filtered.slice(from, from + pageSize);
  const totalPage = Math.ceil(filtered.length / pageSize) || 1;

  const headers = [
    { name: t("products.col.displayName"), selector: (row: any) => row.displayName || "-", sortable: true },
    { name: t("products.col.code"), selector: (row: any) => row.code || "-", sortable: true },
    {
      name: t("products.col.cardType"),
      cell: (row: any) => CARD_TYPE_LABELS[row.cardType] || prettyEnum(row.cardType),
    },
    {
      name: t("products.col.bin"),
      cell: (row: any) => row.binPrefix || "-",
      width: "80px",
    },
    {
      name: t("products.col.tiers"),
      cell: (row: any) =>
        Array.isArray(row.availableTiers) && row.availableTiers.length
          ? row.availableTiers.map((tier: string) => prettyEnum(tier)).join(", ")
          : "-",
    },
    {
      name: t("products.col.defaultLimits"),
      cell: (row: any) =>
        `${row.defaultDailyLimit ?? "-"} / ${row.defaultMonthlyLimit ?? "-"}`,
    },
    { name: t("products.col.order"), selector: (row: any) => row.sortOrder ?? "-", sortable: true, width: "90px" },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            row.active
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {row.active ? t("common:active") : t("common:inactive")}
        </span>
      ),
      width: "110px",
    },
    {
      name: t("products.col.action"),
      cell: (row: any) => (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={actioningId === row.id}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {t("common:select")}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleEdit(row);
                }}
              >
                <Pencil className="h-4 w-4" />
                {t("common:edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  toggleActive(row);
                }}
              >
                {row.active ? (
                  <>
                    <PowerOff className="h-4 w-4" />
                    {t("common:deactivate")}
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" />
                    {t("common:activate")}
                  </>
                )}
              </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="service card-products-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Layers className="h-4 w-4" />
          </span>
          {t("products.title")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("products.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 220, borderRadius: 2, height: 40 }}
          />
          <Button
            className="gap-2"
            onClick={handleAdd}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto" }}
          >
            <Plus className="h-4 w-4" />
            {t("products.addProduct")}
          </Button>
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={paged}
          totalRows={filtered.length}
          isLoading={isLoading}
          from={filtered.length === 0 ? 0 : from + 1}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={Math.min(page * pageSize, filtered.length)}
        />
      </div>

      {/* Add/Edit modal */}
      <Dialog open={showFormModal} onOpenChange={(open) => !open && setShowFormModal(false)}>
        <DialogContent className="cardprod-dialog sm:max-w-[820px] max-h-[85vh] overflow-y-auto">
          <style>{`
            .cardprod-dialog [data-slot="dialog-title"] { font-size: 15px; }
            .cardprod-dialog [data-slot="dialog-description"] { font-size: 12px; }
            .cardprod-dialog [data-slot="label"],
            .cardprod-dialog label,
            .cardprod-dialog label span,
            .cardprod-dialog .text-sm,
            .cardprod-dialog input,
            .cardprod-dialog textarea,
            .cardprod-dialog [data-slot="select-trigger"],
            .cardprod-dialog [data-slot="select-trigger"] span,
            .cardprod-dialog [data-slot="button"] {
              font-size: 12px !important;
            }
            .cardprod-dialog [data-slot="label"] { font-weight: 600; }
            .cardprod-dialog label span { font-weight: 500; }
            /* Compact field heights to match the smaller text */
            .cardprod-dialog input:not([type="checkbox"]),
            .cardprod-dialog [data-slot="select-trigger"] {
              height: 36px !important;
              min-height: 36px !important;
            }
          `}</style>
          <DialogHeader>
            <DialogTitle>{modalMode === "edit" ? t("products.dialog.editTitle") : t("products.dialog.addTitle")}</DialogTitle>
            <DialogDescription>
              {t("products.dialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("products.field.code")}</Label>
                <Input
                  placeholder={t("products.placeholder.code")}
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value)}
                  disabled={modalMode === "edit"}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("products.field.cardType")}</Label>
                <Select value={form.cardType} onValueChange={(v) => setField("cardType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {CARD_TYPE_LABELS[t] || prettyEnum(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("products.field.displayName")}</Label>
                <Input
                  placeholder={t("products.placeholder.displayName")}
                  value={form.displayName}
                  onChange={(e) => setField("displayName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("common:category")}</Label>
                <Input
                  placeholder="DEBIT"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("products.field.binPrefix")}</Label>
                <Input
                  placeholder={t("products.placeholder.binPrefix")}
                  value={form.binPrefix}
                  onChange={(e) => setField("binPrefix", e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("products.field.tier")}</Label>
                <Select value={form.tier} onValueChange={(v) => setField("tier", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TIERS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {prettyEnum(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("common:description")}</Label>
                <Input
                  placeholder={t("products.placeholder.description")}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("products.field.defaultDailyLimit")}</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={form.defaultDailyLimit}
                  onChange={(e) => setField("defaultDailyLimit", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("products.field.defaultMonthlyLimit")}</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={form.defaultMonthlyLimit}
                  onChange={(e) => setField("defaultMonthlyLimit", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("products.field.currency")}</Label>
                <Input
                  placeholder="CAD"
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("products.field.sortOrder")}</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setField("sortOrder", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("products.field.availableTiers")}</Label>
              <div className="flex flex-wrap gap-4">
                {CARD_TIERS.map((tier) => (
                  <label key={tier} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={form.availableTiers.includes(tier)}
                      onCheckedChange={(c) => toggleTier(tier, !!c)}
                    />
                    <span className="text-sm">{prettyEnum(tier)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("products.field.features")}</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={t("products.placeholder.features")}
                value={form.features}
                onChange={(e) => setField("features", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={form.instantIssue}
                  onCheckedChange={(c) => setField("instantIssue", !!c)}
                />
                <span className="text-sm">{t("products.check.instantIssue")}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={form.requiresShipping}
                  onCheckedChange={(c) => setField("requiresShipping", !!c)}
                />
                <span className="text-sm">{t("products.check.requiresShipping")}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={form.requiresActivation}
                  onCheckedChange={(c) => setField("requiresActivation", !!c)}
                />
                <span className="text-sm">{t("products.check.requiresActivation")}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={form.contactlessSupported}
                  onCheckedChange={(c) => setField("contactlessSupported", !!c)}
                />
                <span className="text-sm">{t("products.check.contactless")}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={form.physicalOrderable}
                  onCheckedChange={(c) => setField("physicalOrderable", !!c)}
                />
                <span className="text-sm">{t("products.check.physicalOrderable")}</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("action.saving") : modalMode === "edit" ? t("common:update") : t("common:create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("products.deleteDialog.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("products.deleteDialog.confirmPrefix")}{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.displayName || deleteTarget?.code}
            </span>
            {t("products.deleteDialog.confirmSuffix")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t("action.deleting") : t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardProducts;
