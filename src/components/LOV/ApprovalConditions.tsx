import { useState, useEffect } from "react";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  getApprovalConditionFields,
  createApprovalConditionField,
  updateApprovalConditionField,
  deleteApprovalConditionField,
} from "../../redux/apis/apisCrudProductManagement";
import { RefreshCw, Edit2, Trash2, Plus, ChevronDown } from "lucide-react";
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
import { Badge } from "../ui/badge";

interface ApprovalFieldDefinition {
  id?: string;
  fieldKey: string;
  nameEn: string;
  nameAr: string;
  dataType: string;
  active?: boolean;
  sortOrder: number;
}

const ApprovalConditions = () => {
  const [conditions, setConditions] = useState<ApprovalFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState<ApprovalFieldDefinition>({
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
  const [selectedCondition, setSelectedCondition] = useState<ApprovalFieldDefinition | null>(null);
  const [editFormData, setEditFormData] = useState<ApprovalFieldDefinition>({
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
  const [selectedForDelete, setSelectedForDelete] = useState<ApprovalFieldDefinition | null>(null);

  // Fetch conditions
  const fetchConditions = async () => {
    setIsLoading(true);
    try {
      const response = await getApprovalConditionFields();
      const data = response?.data?.data || [];
      setConditions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch approval conditions");
      setConditions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  // Handle Create Submit
  const handleCreateSubmit = async () => {
    if (!createFormData.fieldKey.trim() || !createFormData.nameEn.trim() || !createFormData.nameAr.trim()) {
      toast.error("All fields are required");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        fieldKey: createFormData.fieldKey,
        nameEn: createFormData.nameEn,
        nameAr: createFormData.nameAr,
        dataType: createFormData.dataType,
        active: createFormData.active,
        sortOrder: createFormData.sortOrder,
      };

      await createApprovalConditionField(payload);
      toast.success("Approval condition field created successfully");
      setIsCreateModalOpen(false);
      setCreateFormData({
        fieldKey: "",
        nameEn: "",
        nameAr: "",
        dataType: "STRING",
        active: true,
        sortOrder: 50,
      });
      fetchConditions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create approval condition field");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!editFormData.nameEn.trim() || !editFormData.nameAr.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (!selectedCondition?.id) {
      toast.error("No field selected for editing");
      return;
    }

    setIsEditing(true);
    try {
      const payload = {
        nameEn: editFormData.nameEn,
        nameAr: editFormData.nameAr,
        dataType: editFormData.dataType,
        active: editFormData.active,
        sortOrder: editFormData.sortOrder,
      };

      await updateApprovalConditionField(selectedCondition.id, payload);
      toast.success("Approval condition field updated successfully");
      setIsEditModalOpen(false);
      setSelectedCondition(null);
      fetchConditions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update approval condition field");
    } finally {
      setIsEditing(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedForDelete?.id) {
      toast.error("No field selected for deletion");
      return;
    }

    setIsDeletingItem(true);
    try {
      await deleteApprovalConditionField(selectedForDelete.id);
      toast.success("Approval condition field deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedForDelete(null);
      fetchConditions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete approval condition field");
    } finally {
      setIsDeletingItem(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (row: ApprovalFieldDefinition) => {
    setSelectedCondition(row);
    setEditFormData({
      fieldKey: row.fieldKey,
      nameEn: row.nameEn,
      nameAr: row.nameAr,
      dataType: row.dataType,
      active: row.active ?? true,
      sortOrder: row.sortOrder,
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (row: ApprovalFieldDefinition) => {
    setSelectedForDelete(row);
    setIsDeleteModalOpen(true);
  };

  // Open Create Modal
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

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = conditions.slice(startIndex, endIndex);
  const total = conditions.length;
  const totalPage = Math.ceil(total / pageSize);
  const fromValue = total === 0 ? 0 : startIndex + 1;
  const toValue = Math.min(endIndex, total);

  // Table Headers
  const tableHeaders = [
    {
      name: "Field Key",
      selector: (row: any) => row.fieldKey,
      sortable: true,
    },
    {
      name: "Name (EN)",
      selector: (row: any) => row.nameEn,
      sortable: true,
    },
    {
      name: "Name (AR)",
      selector: (row: any) => row.nameAr,
      sortable: true,
    },
    {
      name: "Data Type",
      cell: (row: any) => (
        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100">
          {row.dataType}
        </Badge>
      ),
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <Badge variant="outline" className={row.active ? "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100" : "bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100"}>
          {row.active ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: true,
    },
    {
      name: "Sort Order",
      selector: (row: any) => row.sortOrder,
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
            <DropdownMenuItem onClick={() => openEditModal(row)} className="cursor-pointer gap-2">
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteModal(row)} className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950">
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
    <div className="w-full">
      <div className="px-6 py-4 bg-background">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Approval Condition Fields</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and view approval condition field definitions</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={openCreateModal}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </Button>
            {/* <Button
              onClick={fetchConditions}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {isLoading ? "Loading..." : "Refresh"}
            </Button> */}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-border shadow-sm">
          <TableView
            header={tableHeaders}
            data={paginatedData}
            totalRows={total}
            from={fromValue}
            to={toValue}
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
              <DialogTitle>Create Approval Condition Field</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-fieldKey">Field Key</Label>
                <Input
                  id="create-fieldKey"
                  value={createFormData.fieldKey}
                  onChange={(e) => setCreateFormData({ ...createFormData, fieldKey: e.target.value })}
                  placeholder="e.g., IQAMA_REMAINING_MONTHS"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-nameEn">Name (English)</Label>
                <Input
                  id="create-nameEn"
                  value={createFormData.nameEn}
                  onChange={(e) => setCreateFormData({ ...createFormData, nameEn: e.target.value })}
                  placeholder="e.g., Iqama Remaining Months"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-nameAr">Name (Arabic)</Label>
                <Input
                  id="create-nameAr"
                  value={createFormData.nameAr}
                  onChange={(e) => setCreateFormData({ ...createFormData, nameAr: e.target.value })}
                  placeholder="e.g., أشهر الإقامة المتبقية"
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
                  placeholder="e.g., 21"
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
              <DialogTitle>Edit Approval Condition Field</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-fieldKey">Field Key</Label>
                <Input
                  id="edit-fieldKey"
                  value={editFormData.fieldKey}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="edit-nameEn">Name (English)</Label>
                <Input
                  id="edit-nameEn"
                  value={editFormData.nameEn}
                  onChange={(e) => setEditFormData({ ...editFormData, nameEn: e.target.value })}
                  placeholder="e.g., Iqama Remaining Months"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-nameAr">Name (Arabic)</Label>
                <Input
                  id="edit-nameAr"
                  value={editFormData.nameAr}
                  onChange={(e) => setEditFormData({ ...editFormData, nameAr: e.target.value })}
                  placeholder="e.g., أشهر الإقامة المتبقية"
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
                  placeholder="e.g., 21"
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
              <Button onClick={handleEditSubmit} disabled={isEditing}>{isEditing ? "Updating..." : "Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400">Delete Approval Condition Field</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-foreground">Are you sure you want to delete this approval condition field?</p>
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
    </div>
  );
};

export default ApprovalConditions;
