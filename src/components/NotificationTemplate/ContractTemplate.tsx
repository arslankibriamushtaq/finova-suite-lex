import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllContractTemplates,
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
  getProductsList,
  getAllTemplateTypes,
} from "../../redux/apis/apisCrudProductManagement";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const ContractTemplate = () => {
  const { t } = useTranslation("notifications");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Dropdown data
  const [products, setProducts] = useState<any[]>([]);
  const [templateTypes, setTemplateTypes] = useState<any[]>([]);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ar">("en");
  const [formData, setFormData] = useState({
    name: "",
    productId: "",
    typeId: "",
    language: "en",
    message: "",
    messageEn: "",
    messageAr: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchProducts();
    fetchTemplateTypes();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getAllContractTemplates();
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("contract.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProductsList();
      const list = res?.data?.data || res?.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const res = await getAllTemplateTypes();
      const list = res?.data?.data || res?.data || [];
      setTemplateTypes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load template types:", error);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    return product?.nameEn || product?.name_en || product?.name || productId || "-";
  };

  const getTypeName = (typeId: string) => {
    const tt = templateTypes.find((t: any) => t.id === typeId);
    return tt?.name || typeId || "-";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      productId: "",
      typeId: "",
      language: "en",
      message: "",
      messageEn: "",
      messageAr: "",
    });
    setSelectedLanguage("en");
    setCurrentItemId(null);
  };

  const handleAdd = () => {
    setModalMode("add");
    resetForm();
    setShowFormModal(true);
  };

  const handleEdit = (row: any) => {
    setModalMode("edit");
    setCurrentItemId(row.id);
    setFormData({
      name: row.name || "",
      productId: row.productId || row.product_id || "",
      typeId: row.typeId || row.type_id || "",
      language: row.language || "en",
      message: row.message || "",
      messageEn: row.language === "en" ? (row.message || "") : "",
      messageAr: row.language === "ar" ? (row.message || "") : "",
    });
    setSelectedLanguage(row.language === "ar" ? "ar" : "en");
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t("contract.toast.nameRequired"));
      return;
    }
    if (!formData.productId) {
      toast.error(t("contract.toast.selectProduct"));
      return;
    }
    if (!formData.typeId) {
      toast.error(t("contract.toast.selectType"));
      return;
    }

    try {
      setIsSaving(true);
      const message = selectedLanguage === "en" ? formData.messageEn : formData.messageAr;
      const body = {
        name: formData.name.trim(),
        productId: formData.productId,
        typeId: formData.typeId,
        language: selectedLanguage,
        message: message,
      };

      if (modalMode === "edit" && currentItemId) {
        await updateContractTemplate(currentItemId, body);
        toast.success(t("common:updatedSuccessfully"));
      } else {
        await createContractTemplate(body);
        toast.success(t("contract.toast.created"));
      }
      setShowFormModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (modalMode === "edit" ? t("contract.toast.updateFailed") : t("contract.toast.createFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteContractTemplate(deleteTarget.id);
      toast.success(t("common:deletedSuccessfully"));
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("contract.toast.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item?.name || "").toLowerCase().includes(term) ||
      getProductName(item?.productId || item?.product_id).toLowerCase().includes(term) ||
      getTypeName(item?.typeId || item?.type_id).toLowerCase().includes(term)
    );
  });

  const headers = [
    {
      name: t("common:name"),
      selector: (row: any) => row.name || "-",
      sortable: true,
    },
    {
      name: t("shared.product"),
      selector: (row: any) => getProductName(row.productId || row.product_id),
      sortable: true,
    },
    {
      name: t("common:type"),
      selector: (row: any) => getTypeName(row.typeId || row.type_id),
      sortable: true,
    },
    {
      name: t("shared.language"),
      selector: (row: any) => (row.language === "ar" ? t("shared.arabic") : t("shared.english")),
      sortable: true,
      width: "100px",
    },
    {
      name: t("common:createdAt"),
      selector: (row: any) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      sortable: true,
      width: "130px",
    },
    {
      name: t("shared.action"),
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
    <div className="service contract-template-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">{t("contract.title")}</h3>
      </div>

      {/* Filters card */}
      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("contract.searchPh")}
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
            {t("contract.addNew")}
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="bg-white"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          header={headers}
          data={filteredData}
          totalRows={filteredData.length}
          isLoading={isLoading}
          from={1}
          page={page}
          totalPage={Math.ceil(filteredData.length / pageSize) || 1}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={filteredData.length}
        />
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={showFormModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowFormModal(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "edit" ? t("contract.editTitle") : t("contract.addNew")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common:name")} *</Label>
              <Input
                placeholder={t("contract.ph.name")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("shared.product")} *</Label>
                <Select
                  value={formData.productId || undefined}
                  onValueChange={(val) => setFormData({ ...formData, productId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("shared.selectProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.nameEn || product.name_en || product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("shared.templateType")} *</Label>
                <Select
                  value={formData.typeId || undefined}
                  onValueChange={(val) => setFormData({ ...formData, typeId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("shared.selectTemplateType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((tt: any) => (
                      <SelectItem key={tt.id} value={tt.id}>
                        {tt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div className="space-y-2">
              <Label>{t("shared.language")}</Label>
              <Select
                value={selectedLanguage}
                onValueChange={(val: "en" | "ar") => setSelectedLanguage(val)}
              >
                <SelectTrigger className="w-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("shared.english")}</SelectItem>
                  <SelectItem value="ar">{t("shared.arabic")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>
            <div className="space-y-2">
              <Label>{t("contract.messageLabel", { lang: selectedLanguage === "en" ? t("shared.english") : t("shared.arabic") })}</Label>
              <div
                className="editor-fixed"
                style={{ direction: selectedLanguage === "ar" ? "rtl" : "ltr" }}
              >
                <CKEditor
                  key={`${currentItemId || "new"}-${selectedLanguage}`}
                  // @ts-ignore
                  editor={ClassicEditor}
                  data={selectedLanguage === "en" ? formData.messageEn : formData.messageAr}
                  onChange={(_event: any, editor: any) => {
                    const content = editor.getData();
                    if (selectedLanguage === "en") {
                      setFormData({ ...formData, messageEn: content });
                    } else {
                      setFormData({ ...formData, messageAr: content });
                    }
                  }}
                  config={{
                    language: selectedLanguage === "ar" ? "ar" : "en",
                    toolbar: [
                      "heading", "|",
                      "bold", "italic", "underline", "strikethrough",
                      "link", "bulletedList", "numberedList",
                      "blockQuote", "insertTable",
                      "undo", "redo",
                    ],
                  }}
                  onReady={(editor: any) => {
                    if (selectedLanguage === "ar") {
                      editor.editing.view.change((writer: any) => {
                        writer.setAttribute("dir", "rtl", editor.editing.view.document.getRoot());
                      });
                      const editable = editor.ui.getEditableElement();
                      if (editable) {
                        editable.setAttribute("dir", "rtl");
                        editable.setAttribute("lang", "ar");
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFormModal(false);
                resetForm();
              }}
              disabled={isSaving}
            >
              {t("common:cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("shared.saving") : modalMode === "edit" ? t("common:update") : t("common:create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("contract.delete.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("contract.delete.confirmPre")}
            <span className="font-medium text-foreground">{deleteTarget?.name}</span>
            {t("contract.delete.confirmPost")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t("shared.deleting") : t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractTemplate;
