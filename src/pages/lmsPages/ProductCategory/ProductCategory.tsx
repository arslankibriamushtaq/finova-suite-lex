import { useState, useEffect } from "react";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllCategories,
  createMasterCategory,
  updateMasterCategory,
  deleteMasterCategory,
} from "../../../redux/apis/apisCrudProductManagement";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { ChevronDown, Pencil, Trash2, Plus, FolderTree } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const ProductCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    iconUrl: "",
    sortOrder: 0,
    active: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchTerm]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Backend uses 0-based index for page
      const response = await getAllCategories(page - 1, pageSize, searchTerm);
      
      // Response structure: { data: [...], pagination: { totalElements, totalPages, ... } }
      const list = response?.data?.data;
      setData(Array.isArray(list) ? list : []);
      
      const pagination = response?.data?.pagination;
      if (pagination) {
        const total = pagination.totalElements || 0;
        setTotalRows(total);
        // Calculate total pages locally to ensure it matches pageSize
        setTotalPage(Math.ceil(total / pageSize) || 1);
      } else {
        // Fallback if pagination is missing entirely
        const listLen = Array.isArray(list) ? list.length : 0;
        setTotalRows(listLen);
        setTotalPage(Math.ceil(listLen / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode("add");
    setCurrentItemId(null);
    setFormData({
      code: "",
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      iconUrl: "",
      sortOrder: 0,
      active: true,
    });
    setShowFormModal(true);
  };

  const handleEdit = (row: any) => {
    setModalMode("edit");
    setCurrentItemId(row.id);
    setFormData({
      code: row.code || "",
      nameEn: row.nameEn || "",
      nameAr: row.nameAr || "",
      descriptionEn: row.descriptionEn || "",
      descriptionAr: row.descriptionAr || "",
      iconUrl: row.iconUrl || "",
      sortOrder: row.sortOrder ?? 0,
      active: row.active ?? true,
    });
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error("Code is required");
      return;
    }
    if (!formData.nameEn.trim()) {
      toast.error("Name (EN) is required");
      return;
    }

    try {
      setIsSaving(true);
      const body: any = {
        nameEn: formData.nameEn.trim(),
        nameAr: formData.nameAr.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        iconUrl: formData.iconUrl.trim() || null,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (modalMode === "edit" && currentItemId) {
        body.active = formData.active;
        await updateMasterCategory(currentItemId, body);
        toast.success("Category updated successfully");
      } else {
        body.code = formData.code.trim();
        await createMasterCategory(body);
        toast.success("Category created successfully");
      }

      setShowFormModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${modalMode === "edit" ? "update" : "create"} category`);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteMasterCategory(deleteTarget.id);
      toast.success("Category deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };


  const headers = [
    {
      name: "Code",
      selector: (row: any) => row.code || "-",
      sortable: true,
    },
    {
      name: "Name (EN)",
      selector: (row: any) => row.nameEn || "-",
      sortable: true,
    },
    {
      name: "Name (AR)",
      selector: (row: any) => row.nameAr || "-",
      sortable: true,
    },
    {
      name: "Description (EN)",
      selector: (row: any) => row.descriptionEn || "-",
      sortable: true,
    },
    {
      name: "Display Order",
      selector: (row: any) => row.sortOrder ?? "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Status",
      cell: (row: any) => {
        const isActive = row.active;
        return (
          <span className={isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
      sortable: true,
      width: "100px",
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
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
      width: "100px",
    },
  ];

  return (
    <div className="service product-category-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <FolderTree className="h-4 w-4" />
          </span>
          Product Categories
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search by code or name"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <Button
            className="gap-2"
            onClick={handleAdd}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <Plus className="h-4 w-4" />
            Add New Record
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={data}
          totalRows={totalRows}
          isLoading={isLoading}
          from={(page - 1) * pageSize + 1}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={Math.min(page * pageSize, totalRows)}
        />
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showFormModal} onOpenChange={(open) => !open && setShowFormModal(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{modalMode === "edit" ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  placeholder="e.g. MURABAHA"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={modalMode === "edit"}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Name (EN) *</Label>
                <Input
                  placeholder="English name"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Name (AR)</Label>
                <Input
                  placeholder="Arabic name"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (EN)</Label>
                <Input
                  placeholder="English description"
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (AR)</Label>
                <Input
                  placeholder="Arabic description"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Icon URL</Label>
                <Input
                  placeholder="Icon URL (optional)"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                />
              </div>
            </div>
            {modalMode === "edit" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                />
                <span className="text-sm">Active</span>
              </label>
            )}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.nameEn || deleteTarget?.code}
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

export default ProductCategory;
