import { useState, useEffect } from "react";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  getApprovalConditionFields,
  createApprovalConditionField,
  updateApprovalConditionField,
  deleteApprovalConditionField,
} from "../../redux/apis/apisCrudProductManagement";
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
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("lov");
  const [conditions, setConditions] = useState<ApprovalFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

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
      // Backend uses 0-based indexing for page
      const response = await getApprovalConditionFields(page - 1, pageSize, searchTerm);
      const list = response?.data?.data || [];
      setConditions(Array.isArray(list) ? list : []);

      const pagination = response?.data?.pagination;
      if (pagination) {
        setTotalRows(pagination.totalElements || 0);
        setTotalPage(pagination.totalPages || 1);
      } else {
        setTotalRows(list.length);
        setTotalPage(Math.ceil(list.length / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("approvalConditions.toast.fetchFailed"));
      setConditions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, [page, pageSize, searchTerm]);

  // Handle Create Submit
  const handleCreateSubmit = async () => {
    if (!createFormData.fieldKey.trim() || !createFormData.nameEn.trim() || !createFormData.nameAr.trim()) {
      toast.error(t("approvalConditions.validation.allRequired"));
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
      toast.success(t("approvalConditions.toast.created"));
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
      toast.error(error?.response?.data?.message || t("approvalConditions.toast.createFailed"));
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!editFormData.nameEn.trim() || !editFormData.nameAr.trim()) {
      toast.error(t("approvalConditions.validation.allRequired"));
      return;
    }

    if (!selectedCondition?.id) {
      toast.error(t("approvalConditions.toast.noFieldEdit"));
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
      toast.success(t("approvalConditions.toast.updated"));
      setConditions((prev) =>
        prev.map((item) =>
          item.id === selectedCondition.id
            ? { ...item, ...payload, fieldKey: item.fieldKey }
            : item
        )
      );
      setIsEditModalOpen(false);
      setSelectedCondition(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("approvalConditions.toast.updateFailed"));
    } finally {
      setIsEditing(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedForDelete?.id) {
      toast.error(t("approvalConditions.toast.noFieldDelete"));
      return;
    }

    setIsDeletingItem(true);
    try {
      await deleteApprovalConditionField(selectedForDelete.id);
      toast.success(t("approvalConditions.toast.deleted"));
      setConditions((prev) => prev.filter((item) => item.id !== selectedForDelete.id));
      setIsDeleteModalOpen(false);
      setSelectedForDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("approvalConditions.toast.deleteFailed"));
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


  // Table Headers
  const tableHeaders = [
    {
      name: t("approvalConditions.col.fieldKey"),
      selector: (row: any) => row.fieldKey,
      sortable: true,
    },
    {
      name: t("approvalConditions.col.nameEn"),
      selector: (row: any) => row.nameEn,
      sortable: true,
    },
    {
      name: t("approvalConditions.col.nameAr"),
      selector: (row: any) => row.nameAr,
      sortable: true,
    },
    {
      name: t("approvalConditions.col.dataType"),
      cell: (row: any) => (
        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100">
          {row.dataType}
        </Badge>
      ),
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <Badge variant="outline" className={row.active ? "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100" : "bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100"}>
          {row.active ? t("common:active") : t("common:inactive")}
        </Badge>
      ),
      sortable: true,
    },
    {
      name: t("approvalConditions.col.sortOrder"),
      selector: (row: any) => row.sortOrder,
      sortable: true,
    },
    {
      name: t("common:actions"),
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              {t("common:select")} <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditModal(row)} className="cursor-pointer gap-2">
              <Edit2 className="h-4 w-4" />
              <span>{t("common:edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteModal(row)} className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950">
              <Trash2 className="h-4 w-4" />
              <span>{t("common:delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  return (
    <div className="service approval-conditions-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ListChecks className="h-4 w-4" />
          </span>
          {t("approvalConditions.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("approvalConditions.ph.search")}
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
            {t("common:create")}
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
            header={tableHeaders}
            data={conditions}
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
              <DialogTitle>{t("approvalConditions.modal.createTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-fieldKey">{t("approvalConditions.label.fieldKey")}</Label>
                <Input
                  id="create-fieldKey"
                  value={createFormData.fieldKey}
                  onChange={(e) => setCreateFormData({ ...createFormData, fieldKey: e.target.value })}
                  placeholder={t("approvalConditions.ph.fieldKey")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-nameEn">{t("approvalConditions.label.nameEn")}</Label>
                <Input
                  id="create-nameEn"
                  value={createFormData.nameEn}
                  onChange={(e) => setCreateFormData({ ...createFormData, nameEn: e.target.value })}
                  placeholder={t("approvalConditions.ph.nameEn")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-nameAr">{t("approvalConditions.label.nameAr")}</Label>
                <Input
                  id="create-nameAr"
                  value={createFormData.nameAr}
                  onChange={(e) => setCreateFormData({ ...createFormData, nameAr: e.target.value })}
                  placeholder={t("approvalConditions.ph.nameAr")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-dataType">{t("approvalConditions.label.dataType")}</Label>
                <Select value={createFormData.dataType} onValueChange={(value) => setCreateFormData({ ...createFormData, dataType: value })}>
                  <SelectTrigger id="create-dataType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRING">{t("approvalConditions.dataType.string")}</SelectItem>
                    <SelectItem value="NUMERIC">{t("approvalConditions.dataType.numeric")}</SelectItem>
                    <SelectItem value="BOOLEAN">{t("approvalConditions.dataType.boolean")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-sortOrder">{t("approvalConditions.label.sortOrder")}</Label>
                <Input
                  id="create-sortOrder"
                  type="number"
                  value={createFormData.sortOrder}
                  onChange={(e) => setCreateFormData({ ...createFormData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder={t("approvalConditions.ph.sortOrder")}
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
                <Label htmlFor="create-active" className="font-normal cursor-pointer">{t("common:active")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>{t("common:cancel")}</Button>
              <Button onClick={handleCreateSubmit} disabled={isCreating}>{isCreating ? t("approvalConditions.creating") : t("common:create")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("approvalConditions.modal.editTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-fieldKey">{t("approvalConditions.label.fieldKey")}</Label>
                <Input
                  id="edit-fieldKey"
                  value={editFormData.fieldKey}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="edit-nameEn">{t("approvalConditions.label.nameEn")}</Label>
                <Input
                  id="edit-nameEn"
                  value={editFormData.nameEn}
                  onChange={(e) => setEditFormData({ ...editFormData, nameEn: e.target.value })}
                  placeholder={t("approvalConditions.ph.nameEn")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-nameAr">{t("approvalConditions.label.nameAr")}</Label>
                <Input
                  id="edit-nameAr"
                  value={editFormData.nameAr}
                  onChange={(e) => setEditFormData({ ...editFormData, nameAr: e.target.value })}
                  placeholder={t("approvalConditions.ph.nameAr")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-dataType">{t("approvalConditions.label.dataType")}</Label>
                <Select value={editFormData.dataType} onValueChange={(value) => setEditFormData({ ...editFormData, dataType: value })}>
                  <SelectTrigger id="edit-dataType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRING">{t("approvalConditions.dataType.string")}</SelectItem>
                    <SelectItem value="NUMERIC">{t("approvalConditions.dataType.numeric")}</SelectItem>
                    <SelectItem value="BOOLEAN">{t("approvalConditions.dataType.boolean")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-sortOrder">{t("approvalConditions.label.sortOrder")}</Label>
                <Input
                  id="edit-sortOrder"
                  type="number"
                  value={editFormData.sortOrder}
                  onChange={(e) => setEditFormData({ ...editFormData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder={t("approvalConditions.ph.sortOrder")}
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
                <Label htmlFor="edit-active" className="font-normal cursor-pointer">{t("common:active")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t("common:cancel")}</Button>
              <Button onClick={handleEditSubmit} disabled={isEditing}>{isEditing ? t("approvalConditions.updating") : t("common:update")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400">{t("approvalConditions.modal.deleteTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-foreground">{t("approvalConditions.confirmDeleteBody")}</p>
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-3">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">{t("approvalConditions.fieldKeyLabel", { value: selectedForDelete?.fieldKey })}</p>
              </div>
              <p className="text-xs text-muted-foreground">{t("approvalConditions.actionUndone")}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>{t("common:cancel")}</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeletingItem}>
                {isDeletingItem ? t("approvalConditions.deleting") : t("common:delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default ApprovalConditions;
