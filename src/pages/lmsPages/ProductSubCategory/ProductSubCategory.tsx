import { useState, useEffect } from "react";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllCategories,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../../redux/apis/apisCrudProductManagement";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
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
import { ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const ProductSubCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Master categories
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    masterCategoryId: "",
    code: "",
    nameEn: "",
    nameAr: "",
    sortOrder: 0,
    active: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchData();
    }
  }, [selectedCategoryId, page, pageSize, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      const list = response?.data?.data || response?.data || [];
      const arr = Array.isArray(list) ? list : [];
      setCategories(arr);
      if (arr.length > 0) {
        setSelectedCategoryId(arr[0].id);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch categories");
    }
  };

  const fetchData = async () => {
    if (!selectedCategoryId) return;
    try {
      setIsLoading(true);
      // Backend uses 0-based page indexing
      const response = await getSubCategories(selectedCategoryId, page - 1, pageSize, searchTerm);
      
      const list = response?.data?.data;
      setData(Array.isArray(list) ? list : []);
      
      const pagination = response?.data?.pagination;
      if (pagination) {
        const total = pagination.totalElements || 0;
        setTotalRows(total);
        setTotalPage(Math.ceil(total / pageSize) || 1);
      } else {
        const listLen = Array.isArray(list) ? list.length : 0;
        setTotalRows(listLen);
        setTotalPage(Math.ceil(listLen / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch sub categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode("add");
    setCurrentItemId(null);
    setFormData({
      masterCategoryId: selectedCategoryId,
      code: "",
      nameEn: "",
      nameAr: "",
      sortOrder: 0,
      active: true,
    });
    setShowFormModal(true);
  };

  const handleEdit = (row: any) => {
    setModalMode("edit");
    setCurrentItemId(row.id);
    setFormData({
      masterCategoryId: row.masterCategoryId || selectedCategoryId,
      code: row.code || "",
      nameEn: row.nameEn || "",
      nameAr: row.nameAr || "",
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
    if (!formData.masterCategoryId) {
      toast.error("Master Category is required");
      return;
    }

    try {
      setIsSaving(true);
      const body: any = {
        nameEn: formData.nameEn.trim(),
        nameAr: formData.nameAr.trim(),
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (modalMode === "edit" && currentItemId) {
        body.active = formData.active;
        await updateSubCategory(currentItemId, body);
        toast.success("Sub Category updated successfully");
      } else {
        body.masterCategoryId = formData.masterCategoryId;
        body.code = formData.code.trim();
        await createSubCategory(body);
        toast.success("Sub Category created successfully");
      }

      setShowFormModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${modalMode === "edit" ? "update" : "create"} sub category`);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteSubCategory(deleteTarget.id);
      toast.success("Sub Category deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete sub category");
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
    <div className="service p-4">
      <h1 className="text-xl font-bold pb-3">Product Sub Categories</h1>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2" style={{ flex: "1 1 auto", minWidth: 0 }}>
          <Select
            value={selectedCategoryId}
            onValueChange={(value) => {
              setSelectedCategoryId(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[220px]" style={{ height: 40 }}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AntInput
            allowClear
            placeholder="Search by code or name"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
          />
        </div>
        <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
          <Plus className="h-4 w-4" />
          Add New Record
        </Button>
      </div>

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

      {/* Add/Edit Modal */}
      <Dialog open={showFormModal} onOpenChange={(open) => !open && setShowFormModal(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{modalMode === "edit" ? "Edit Sub Category" : "Add New Sub Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Master Category *</Label>
              <Select
                value={formData.masterCategoryId}
                onValueChange={(value) => setFormData({ ...formData, masterCategoryId: value })}
                disabled={modalMode === "edit"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select master category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  placeholder="e.g. AUTO_FINANCE"
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
            <DialogTitle>Delete Sub Category</DialogTitle>
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

export default ProductSubCategory;
