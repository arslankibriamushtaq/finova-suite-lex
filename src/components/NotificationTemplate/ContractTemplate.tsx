import { useEffect, useState } from "react";
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
      toast.error(error?.response?.data?.message || "Failed to fetch contract templates");
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
      toast.error("Name is required");
      return;
    }
    if (!formData.productId) {
      toast.error("Please select a product");
      return;
    }
    if (!formData.typeId) {
      toast.error("Please select a template type");
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
        toast.success("Updated successfully");
      } else {
        await createContractTemplate(body);
        toast.success("Created successfully");
      }
      setShowFormModal(false);
      resetForm();
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
      await deleteContractTemplate(deleteTarget.id);
      toast.success("Deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete");
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
      name: "Name",
      selector: (row: any) => row.name || "-",
      sortable: true,
    },
    {
      name: "Product",
      selector: (row: any) => getProductName(row.productId || row.product_id),
      sortable: true,
    },
    {
      name: "Type",
      selector: (row: any) => getTypeName(row.typeId || row.type_id),
      sortable: true,
    },
    {
      name: "Language",
      selector: (row: any) => (row.language === "ar" ? "Arabic" : "English"),
      sortable: true,
      width: "100px",
    },
    {
      name: "Created At",
      selector: (row: any) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      sortable: true,
      width: "130px",
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
      <h1 className="text-xl font-bold pb-3">Contract Templates</h1>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <AntInput
          allowClear
          placeholder="Search by name, product, or type"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
        <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
          <Plus className="h-4 w-4" />
          Add New Contract Template
        </Button>
      </div>

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
              {modalMode === "edit" ? "Edit Contract Template" : "Add New Contract Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Murabaha Financing Agreement"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select
                  value={formData.productId || undefined}
                  onValueChange={(val) => setFormData({ ...formData, productId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
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
                <Label>Template Type *</Label>
                <Select
                  value={formData.typeId || undefined}
                  onValueChange={(val) => setFormData({ ...formData, typeId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
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
              <Label>Language</Label>
              <Select
                value={selectedLanguage}
                onValueChange={(val: "en" | "ar") => setSelectedLanguage(val)}
              >
                <SelectTrigger className="w-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>
            <div className="space-y-2">
              <Label>Message ({selectedLanguage === "en" ? "English" : "Arabic"})</Label>
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
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Contract Template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
            This action cannot be undone.
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

export default ContractTemplate;
