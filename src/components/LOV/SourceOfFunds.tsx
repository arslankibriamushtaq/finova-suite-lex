import { useState, useEffect } from "react";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllSourceOfFunds,
  createSourceOfFunds,
  updateSourceOfFunds,
  deleteSourceOfFunds,
} from "../../redux/apis/apisEddReferenceData";
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
import { ChevronDown, Pencil, Trash2, Plus, ListChecks } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const SourceOfFunds = () => {
  const { t } = useTranslation("lov");
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
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    is_active: true,
    display_order: 0,
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
      const response = await getAllSourceOfFunds(page - 1, pageSize, searchTerm);
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
      toast.error(error?.response?.data?.message || t("sourceOfFunds.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode("add");
    setCurrentItemId(null);
    setFormData({
      code: "",
      name_en: "",
      name_ar: "",
      description_en: "",
      description_ar: "",
      is_active: true,
      display_order: 0,
    });
    setShowFormModal(true);
  };

  const handleEdit = (row: any) => {
    setModalMode("edit");
    setCurrentItemId(row.id);
    setFormData({
      code: row.code || "",
      name_en: row.nameEn || row.name_en || "",
      name_ar: row.nameAr || row.name_ar || "",
      description_en: row.descriptionEn || row.description_en || "",
      description_ar: row.descriptionAr || row.description_ar || "",
      is_active: row.isActive ?? row.is_active ?? true,
      display_order: row.displayOrder ?? row.display_order ?? 0,
    });
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error(t("sourceOfFunds.validation.code"));
      return;
    }
    if (!formData.name_en.trim()) {
      toast.error(t("sourceOfFunds.validation.nameEn"));
      return;
    }

    try {
      setIsSaving(true);
      const body = {
        code: formData.code.trim(),
        nameEn: formData.name_en.trim(),
        nameAr: formData.name_ar.trim(),
        descriptionEn: formData.description_en.trim(),
        descriptionAr: formData.description_ar.trim(),
        isActive: formData.is_active,
        displayOrder: Number(formData.display_order) || 0,
      };

      if (modalMode === "edit" && currentItemId) {
        await updateSourceOfFunds(currentItemId, body);
        toast.success(t("sourceOfFunds.toast.updated"));
      } else {
        await createSourceOfFunds(body);
        toast.success(t("sourceOfFunds.toast.created"));
      }

      setShowFormModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (modalMode === "edit" ? t("sourceOfFunds.toast.updateFailed") : t("sourceOfFunds.toast.createFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteSourceOfFunds(deleteTarget.id);
      toast.success(t("sourceOfFunds.toast.deleted"));
      setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("sourceOfFunds.toast.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };


  const headers = [
    {
      name: t("sourceOfFunds.col.code"),
      selector: (row: any) => row.code || "-",
      sortable: true,
    },
    {
      name: t("sourceOfFunds.col.nameEn"),
      selector: (row: any) => row.nameEn || row.name_en || "-",
      sortable: true,
    },
    {
      name: t("sourceOfFunds.col.nameAr"),
      selector: (row: any) => row.nameAr || row.name_ar || "-",
      sortable: true,
    },
    {
      name: t("sourceOfFunds.col.descriptionEn"),
      selector: (row: any) => row.descriptionEn || row.description_en || "-",
      sortable: true,
    },
    {
      name: t("sourceOfFunds.col.displayOrder"),
      selector: (row: any) => row.displayOrder ?? row.display_order ?? "-",
      sortable: true,
      width: "130px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const isActive = row.isActive ?? row.is_active;
        return (
          <span className={isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isActive ? t("common:active") : t("common:inactive")}
          </span>
        );
      },
      sortable: true,
      width: "100px",
    },
    {
      name: t("common:actions"),
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
      width: "100px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ListChecks className="h-4 w-4" />
          </span>
          {t("sourceOfFunds.heading")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <AntInput
          allowClear
          placeholder={t("sourceOfFunds.ph.search")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
          <Plus className="h-4 w-4" />
          {t("shared.addNewRecord")}
        </Button>
        </div>
      </div>

      <div className="pro-card">
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
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{modalMode === "edit" ? t("sourceOfFunds.modal.editTitle") : t("shared.addNewRecord")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("sourceOfFunds.label.code")} *</Label>
                <Input
                  placeholder={t("sourceOfFunds.ph.code")}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={modalMode === "edit"}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("sourceOfFunds.label.displayOrder")}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("sourceOfFunds.label.nameEn")} *</Label>
                <Input
                  placeholder={t("sourceOfFunds.ph.nameEn")}
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("sourceOfFunds.label.nameAr")}</Label>
                <Input
                  placeholder={t("sourceOfFunds.ph.nameAr")}
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("sourceOfFunds.label.descriptionEn")}</Label>
                <Input
                  placeholder={t("sourceOfFunds.ph.descriptionEn")}
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("sourceOfFunds.label.descriptionAr")}</Label>
                <Input
                  placeholder={t("sourceOfFunds.ph.descriptionAr")}
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
              />
              <span className="text-sm">{t("common:active")}</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("sourceOfFunds.saving") : modalMode === "edit" ? t("common:update") : t("common:create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("sourceOfFunds.modal.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("sourceOfFunds.confirmDeleteBefore")}{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.nameEn || deleteTarget?.name_en || deleteTarget?.code}
            </span>
            {t("sourceOfFunds.confirmDeleteAfter")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t("sourceOfFunds.deleting") : t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SourceOfFunds;
