import { useState, useEffect } from "react";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  getCreditScoringFieldDefinitions,
  createCreditScoringFieldDefinition,
  updateCreditScoringFieldDefinition,
  deleteCreditScoringFieldDefinition,
} from "../../redux/apis/apisRiskManagement";
import { RefreshCw, Edit2, Trash2, Plus, ChevronDown, ListChecks } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CreditScoringDefinitions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    fieldKey: "",
    nameEn: "",
    nameAr: "",
    dataType: "STRING",
    active: true,
    sortOrder: 50,
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    fieldKey: "",
    nameEn: "",
    nameAr: "",
    dataType: "STRING",
    active: true,
    sortOrder: 50,
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<any>(null);

  // Debounce search input so we only fire the request after the user stops typing.
  // Without this, fast typing causes overlapping requests whose out-of-order
  // responses can overwrite each other and show the wrong results.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  // Fetch data on component mount
  useEffect(() => {
    fetchDefinitions();
  }, [page, pageSize, debouncedSearch]);

  const fetchDefinitions = async () => {
    try {
      setIsLoading(true);

      if (debouncedSearch) {
        // Backend does not filter on the `search` param, so fetch the full
        // dataset and filter/paginate client-side. Dataset is small (LOV).
        const response = await getCreditScoringFieldDefinitions(0, 10000);
        const all: any[] = Array.isArray(response?.data?.data) ? response.data.data : [];
        const term = debouncedSearch.toLowerCase();
        const filtered = all.filter((item: any) =>
          (item.fieldKey || "").toLowerCase().includes(term) ||
          (item.nameEn || "").toLowerCase().includes(term) ||
          (item.nameAr || "").toLowerCase().includes(term)
        );
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        setDefinitions(filtered.slice(start, start + pageSize));
        setTotalRows(total);
        setTotalPage(totalPages);
        return;
      }

      // Backend uses 0-based indexing for page
      const response = await getCreditScoringFieldDefinitions(page - 1, pageSize);
      const list = response?.data?.data || [];
      setDefinitions(Array.isArray(list) ? list : []);

      const pagination = response?.data?.pagination;
      if (pagination) {
        setTotalRows(pagination.totalElements || 0);
        setTotalPage(pagination.totalPages || 1);
      } else {
        setTotalRows(list.length);
        setTotalPage(Math.ceil(list.length / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch credit scoring definitions"
      );
      console.error("Error fetching definitions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create Handler
  const openCreateModal = () => {
    setCreateFormData({
      fieldKey: "",
      nameEn: "",
      nameAr: "",
      dataType: "STRING",
      active: true,
      sortOrder: 50,
    });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateFormData({
      fieldKey: "",
      nameEn: "",
      nameAr: "",
      dataType: "STRING",
      active: true,
      sortOrder: 50,
    });
  };

  const handleCreateSubmit = async () => {
    if (!createFormData.fieldKey.trim()) {
      toast.error("Field Key is required");
      return;
    }
    if (!createFormData.nameEn.trim()) {
      toast.error("English Name is required");
      return;
    }
    if (!createFormData.nameAr.trim()) {
      toast.error("Arabic Name is required");
      return;
    }

    try {
      setIsCreating(true);
      const response = await createCreditScoringFieldDefinition(createFormData);
      if (response?.data?.success || response?.status === 201) {
        toast.success(response?.data?.message || "Field definition created successfully");
        closeCreateModal();
        fetchDefinitions();
      } else {
        toast.error(response?.data?.message || "Failed to create field definition");
      }
    } catch (error: any) {
      console.error("Error creating definition:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to create field definition"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Edit Handler
  const openEditModal = (definition: any) => {
    setSelectedDefinition(definition);
    setEditFormData({
      fieldKey: definition.fieldKey,
      nameEn: definition.nameEn,
      nameAr: definition.nameAr,
      dataType: definition.dataType,
      active: definition.active,
      sortOrder: definition.sortOrder,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDefinition(null);
    setEditFormData({
      fieldKey: "",
      nameEn: "",
      nameAr: "",
      dataType: "STRING",
      active: true,
      sortOrder: 50,
    });
  };

  const handleEditSubmit = async () => {
    if (!editFormData.fieldKey.trim()) {
      toast.error("Field Key is required");
      return;
    }
    if (!editFormData.nameEn.trim()) {
      toast.error("English Name is required");
      return;
    }
    if (!editFormData.nameAr.trim()) {
      toast.error("Arabic Name is required");
      return;
    }

    try {
      setIsEditing(true);
      const response = await updateCreditScoringFieldDefinition(
        selectedDefinition.id,
        editFormData
      );
      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Field definition updated successfully");
        setDefinitions((prev: any[]) =>
          prev.map((item) =>
            item.id === selectedDefinition.id
              ? { ...item, ...editFormData }
              : item
          )
        );
        closeEditModal();
      } else {
        toast.error(response?.data?.message || "Failed to update field definition");
      }
    } catch (error: any) {
      console.error("Error updating definition:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to update field definition"
      );
    } finally {
      setIsEditing(false);
    }
  };

  // Delete Handler
  const openDeleteModal = (definition: any) => {
    setSelectedForDelete(definition);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedForDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedForDelete) {
      toast.error("Definition not selected");
      return;
    }

    try {
      setIsDeletingItem(true);
      const response = await deleteCreditScoringFieldDefinition(selectedForDelete.id);
      if (response?.data?.success || response?.status === 200 || response?.status === 204) {
        toast.success(response?.data?.message || "Field definition deleted successfully");
        setDefinitions((prev: any[]) => prev.filter((item) => item.id !== selectedForDelete.id));
        closeDeleteModal();
      } else {
        toast.error(response?.data?.message || "Failed to delete field definition");
      }
    } catch (error: any) {
      console.error("Error deleting definition:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to delete field definition"
      );
    } finally {
      setIsDeletingItem(false);
    }
  };


  const tableHeaders = [
    {
      name: "Field Key",
      selector: (row: any) => row.fieldKey || "-",
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
      name: "Data Type",
      cell: (row: any) => (
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 rounded text-xs font-medium">
          {row.dataType || "-"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${row.active
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
          }`}>
          {row.active ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Sort Order",
      selector: (row: any) => row.sortOrder || "-",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              Select <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => openEditModal(row)}
              className="cursor-pointer gap-2"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDeleteModal(row)}
              className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  return (
    <div className="service credit-scoring-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ListChecks className="h-4 w-4" />
          </span>
          Credit Scoring Field Definitions
        </h3>
      </div>

      {/* Filters card */}
      <div
        className="pro-card p-3 mb-3"
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search by key or name"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <Button
            onClick={openCreateModal}
            className="gap-2"
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="pro-card"
      >
        <TableView
            header={tableHeaders}
            data={definitions}
            totalRows={totalRows}
            from={(page - 1) * pageSize + (totalRows > 0 ? 1 : 0)}
            to={Math.min(page * pageSize, totalRows)}
            page={page}
            totalPage={totalPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            isLoading={isLoading}
            paginationShow={true}
          />
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Field Definition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-fieldKey">Field Key</Label>
                <Input
                  id="create-fieldKey"
                  value={createFormData.fieldKey}
                  onChange={(e) => setCreateFormData({ ...createFormData, fieldKey: e.target.value })}
                  placeholder="e.g., INCOME_SCORE"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-nameEn">Name (English)</Label>
                <Input
                  id="create-nameEn"
                  value={createFormData.nameEn}
                  onChange={(e) => setCreateFormData({ ...createFormData, nameEn: e.target.value })}
                  placeholder="e.g., Income Score"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-nameAr">Name (Arabic)</Label>
                <Input
                  id="create-nameAr"
                  value={createFormData.nameAr}
                  onChange={(e) => setCreateFormData({ ...createFormData, nameAr: e.target.value })}
                  placeholder="e.g., درجة الدخل"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-dataType">Data Type</Label>
                <Select value={createFormData.dataType} onValueChange={(value) => setCreateFormData({ ...createFormData, dataType: value })}>
                  <SelectTrigger id="create-dataType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRING">String</SelectItem>
                    <SelectItem value="NUMERIC">Numeric</SelectItem>
                    <SelectItem value="BOOLEAN">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-sortOrder">Sort Order</Label>
                <Input
                  id="create-sortOrder"
                  type="number"
                  value={createFormData.sortOrder}
                  onChange={(e) => setCreateFormData({ ...createFormData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 50"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create-active"
                  checked={createFormData.active}
                  onChange={(e) => setCreateFormData({ ...createFormData, active: e.target.checked })}
                  className="rounded border-input"
                />
                <Label htmlFor="create-active" className="font-normal cursor-pointer">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateSubmit} disabled={isCreating}>{isCreating ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Field Definition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-fieldKey">Field Key</Label>
                <Input
                  id="edit-fieldKey"
                  value={editFormData.fieldKey}
                  onChange={(e) => setEditFormData({ ...editFormData, fieldKey: e.target.value })}
                  placeholder="e.g., INCOME_SCORE"
                  className="mt-1"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="edit-nameEn">Name (English)</Label>
                <Input
                  id="edit-nameEn"
                  value={editFormData.nameEn}
                  onChange={(e) => setEditFormData({ ...editFormData, nameEn: e.target.value })}
                  placeholder="e.g., Income Score"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-nameAr">Name (Arabic)</Label>
                <Input
                  id="edit-nameAr"
                  value={editFormData.nameAr}
                  onChange={(e) => setEditFormData({ ...editFormData, nameAr: e.target.value })}
                  placeholder="e.g., درجة الدخل"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-dataType">Data Type</Label>
                <Select value={editFormData.dataType} onValueChange={(value) => setEditFormData({ ...editFormData, dataType: value })}>
                  <SelectTrigger id="edit-dataType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRING">String</SelectItem>
                    <SelectItem value="NUMERIC">Numeric</SelectItem>
                    <SelectItem value="BOOLEAN">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-sortOrder">Sort Order</Label>
                <Input
                  id="edit-sortOrder"
                  type="number"
                  value={editFormData.sortOrder}
                  onChange={(e) => setEditFormData({ ...editFormData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 50"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editFormData.active}
                  onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
                  className="rounded border-input"
                />
                <Label htmlFor="edit-active" className="font-normal cursor-pointer">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={isEditing}>{isEditing ? "updating..." : "Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400">Delete Field Definition</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-foreground">Are you sure you want to delete this field definition?</p>
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-3">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">Field Key: {selectedForDelete?.fieldKey}</p>
              </div>
              <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeletingItem}>
                {isDeletingItem ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default CreditScoringDefinitions;
