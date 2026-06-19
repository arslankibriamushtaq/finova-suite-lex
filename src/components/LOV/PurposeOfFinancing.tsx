import { useState, useEffect } from "react";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllPurposeOfFinance,
  createPurposeOfFinance,
  updatePurposeOfFinance,
  deletePurposeOfFinance,
} from "../../redux/apis/apisLendingService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const PurposeOfFinancing = () => {
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
    active: true,
    sortOrder: 0,
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
      // Backend uses 0-based indexing for page
      const response = await getAllPurposeOfFinance(page - 1, pageSize, searchTerm);
      const list = response?.data?.data || [];
      setData(Array.isArray(list) ? list : []);

      const pagination = response?.data?.pagination;
      if (pagination) {
        setTotalRows(pagination.totalElements || 0);
        setTotalPage(pagination.totalPages || 1);
      } else {
        setTotalRows(list.length);
        setTotalPage(Math.ceil(list.length / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch purpose of finance data");
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
      active: true,
      sortOrder: 0,
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
      active: row.active ?? true,
      sortOrder: row.sortOrder ?? 0,
    });
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error("Code is required");
      return;
    }
    if (!formData.nameEn.trim()) {
      toast.error("English name is required");
      return;
    }

    try {
      setIsSaving(true);
      const body: any = {
        code: formData.code.trim(),
        nameEn: formData.nameEn.trim(),
        nameAr: formData.nameAr.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (modalMode === "edit") {
        body.active = formData.active;
      }

      if (modalMode === "edit" && currentItemId) {
        await updatePurposeOfFinance(currentItemId, body);
        toast.success("Updated successfully");
      } else {
        await createPurposeOfFinance(body);
        toast.success("Created successfully");
      }

      setShowFormModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${modalMode === "edit" ? "update" : "create"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deletePurposeOfFinance(deleteTarget.id);
      toast.success("Deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete");
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
      name: "Sort Order",
      selector: (row: any) => row.sortOrder ?? "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Status",
      cell: (row: any) => {
        const isActive = row.active ?? true;
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
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Purpose of Finance</h3>
      </div>

      <div className="bg-white p-3 mb-3" style={{ borderRadius: 6, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)", border: "1px solid var(--border)" }}>
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <AntInput
          allowClear
          placeholder="Search by code or name"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 6, height: 40 }}
        />
        <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
          <Plus className="h-4 w-4" />
          Add New Record
        </Button>
        </div>
      </div>

      <div className="bg-white" style={{ borderRadius: 6, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <TableView
        header={headers}
        data={data}
        totalRows={totalRows}
        isLoading={isLoading}
        from={(page - 1) * pageSize + (totalRows > 0 ? 1 : 0)}
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
            <DialogTitle>{modalMode === "edit" ? "Edit Record" : "Add New Record"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  placeholder="e.g. HOME_PURCHASE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={modalMode === "edit"}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
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
            <DialogTitle>Delete Record</DialogTitle>
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

export default PurposeOfFinancing;
