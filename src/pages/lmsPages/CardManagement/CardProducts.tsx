import { useState, useEffect } from "react";
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
  instantIssue: true,
  requiresShipping: false,
  requiresActivation: false,
  contactlessSupported: false,
  availableTiers: ["CLASSIC"] as string[],
  features: "",
  defaultDailyLimit: "",
  defaultMonthlyLimit: "",
  currency: "CAD",
  sortOrder: 0,
};

const CardProducts = () => {
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
      if (!error?.response?.data?.message) toast.error("Failed to fetch card products");
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
      instantIssue: !!row.instantIssue,
      requiresShipping: !!row.requiresShipping,
      requiresActivation: !!row.requiresActivation,
      contactlessSupported: !!row.contactlessSupported,
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
    if (!form.code.trim()) return toast.error("Code is required");
    if (!form.displayName.trim()) return toast.error("Display name is required");
    if (!form.cardType) return toast.error("Card type is required");

    const body: any = {
      code: form.code.trim(),
      cardType: form.cardType,
      displayName: form.displayName.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      instantIssue: form.instantIssue,
      requiresShipping: form.requiresShipping,
      requiresActivation: form.requiresActivation,
      contactlessSupported: form.contactlessSupported,
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
        toast.success("Product updated successfully");
      } else {
        await createAdminCardProduct(body);
        toast.success("Product created successfully");
      }
      setShowFormModal(false);
      fetchData();
    } catch (error: any) {
      if (!error?.response?.data?.message)
        toast.error(`Failed to ${modalMode === "edit" ? "update" : "create"} product`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (row: any) => {
    try {
      setActioningId(row.id);
      if (row.active) {
        await deactivateAdminCardProduct(row.id);
        toast.success("Product deactivated");
      } else {
        await activateAdminCardProduct(row.id);
        toast.success("Product activated");
      }
      fetchData();
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error("Action failed");
    } finally {
      setActioningId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteAdminCardProduct(deleteTarget.id);
      toast.success("Product deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error("Failed to delete product");
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
    { name: "Display Name", selector: (row: any) => row.displayName || "-", sortable: true },
    { name: "Code", selector: (row: any) => row.code || "-", sortable: true },
    {
      name: "Card Type",
      cell: (row: any) => CARD_TYPE_LABELS[row.cardType] || prettyEnum(row.cardType),
    },
    {
      name: "Tiers",
      cell: (row: any) =>
        Array.isArray(row.availableTiers) && row.availableTiers.length
          ? row.availableTiers.map((t: string) => prettyEnum(t)).join(", ")
          : "-",
    },
    {
      name: "Default Limits",
      cell: (row: any) =>
        `${row.defaultDailyLimit ?? "-"} / ${row.defaultMonthlyLimit ?? "-"}`,
    },
    { name: "Order", selector: (row: any) => row.sortOrder ?? "-", sortable: true, width: "90px" },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            row.active
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {row.active ? "Active" : "Inactive"}
        </span>
      ),
      width: "110px",
    },
    {
      name: "Action",
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
                Select
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
                Edit
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
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" />
                    Activate
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
                Delete
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
          Card Products
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search by name, code or type"
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
            Add Product
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
        <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === "edit" ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              Active products appear in the customer "choose a card" catalog, ordered by sort order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  placeholder="e.g. VIRTUAL_STUDENT"
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value)}
                  disabled={modalMode === "edit"}
                />
              </div>
              <div className="space-y-2">
                <Label>Card Type *</Label>
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
                <Label>Display Name *</Label>
                <Input
                  placeholder="Student Virtual Card"
                  value={form.displayName}
                  onChange={(e) => setField("displayName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="DEBIT"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Input
                  placeholder="Zero-fee virtual card for students"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Default Daily Limit</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={form.defaultDailyLimit}
                  onChange={(e) => setField("defaultDailyLimit", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Monthly Limit</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={form.defaultMonthlyLimit}
                  onChange={(e) => setField("defaultMonthlyLimit", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  placeholder="CAD"
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setField("sortOrder", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Tiers</Label>
              <div className="flex flex-wrap gap-4">
                {CARD_TIERS.map((tier) => (
                  <label key={tier} className="flex items-center gap-2 cursor-pointer">
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
              <Label>Features (one per line)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={"No fees\nStudent rewards"}
                value={form.features}
                onChange={(e) => setField("features", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.instantIssue}
                  onCheckedChange={(c) => setField("instantIssue", !!c)}
                />
                <span className="text-sm">Instant issue</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.requiresShipping}
                  onCheckedChange={(c) => setField("requiresShipping", !!c)}
                />
                <span className="text-sm">Requires shipping</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.requiresActivation}
                  onCheckedChange={(c) => setField("requiresActivation", !!c)}
                />
                <span className="text-sm">Requires activation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.contactlessSupported}
                  onCheckedChange={(c) => setField("contactlessSupported", !!c)}
                />
                <span className="text-sm">Contactless</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : modalMode === "edit" ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.displayName || deleteTarget?.code}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardProducts;
