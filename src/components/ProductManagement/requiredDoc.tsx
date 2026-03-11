import toast from "react-hot-toast";
import { getProductById } from "../../redux/apis/apisCrud";
import { addProductDocument, editProductDocument, removeProductDocument } from "../../redux/apis/apisCrudProductManagement";
import { useLocation } from "react-router-dom";
import TableView from "../TableView/TableView";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Check, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button as UIButton } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { useSelector } from "react-redux";
import { usePermissions, DOCUMENT_PERMISSIONS } from "../../hooks/useProductPermissions";
const RequiredDoc = ({setSelectedTab}:any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const initialFormValues = {
    nameEn: "",
    nameAr: "",
    documentType: "TEMPLATE",
    fileUrl: null as string | null,
    fileSizeBytes: null as number | null,
    fileVersion: "v1",
    createdByName: "Admin",
    required: true,
  };
  const [formValues, setFormValues] = useState(initialFormValues);
  const [data, setData] = useState<any>();
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const product = useSelector((s: any) => s.block.productData);
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // TODO: Re-enable when permission API is implemented
  // const {
  //   canCreate,
  //   canUpdate,
  //   canRemove,
  //   canVerifyModule,
  //   canRejectAsChecker,
  //   canApproveModule,
  //   canRejectAsApprover
  // } = usePermissions();
  const canCreate = () => true;
  const canUpdate = () => true;
  const canRemove = () => true;
  const canVerifyModule = () => true;
  const canRejectAsChecker = () => true;
  const canApproveModule = () => true;
  const canRejectAsApprover = () => true;
  const headers = [
    { name: "Name (En)", selector: (row: any) => row.nameEn, },
    { name: "Name (Ar)", selector: (row: any) => row.nameAr, },
    { name: "Document Type", selector: (row: any) => row.documentType, },
    { name: "Version", selector: (row: any) => row.fileVersion || "-" },
    { name: "Created By", selector: (row: any) => row.createdByName || "-" },
    {
      name: "Required",
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "12px",
            backgroundColor: row.required ? "var(--chart-2)" : "var(--destructive)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.required ? "Yes" : "No"}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: any) => {
        if (!hasAnyActionPermission()) {
          return "-";
        }
        const items = getMenuItems(row);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UIButton className="gradient-btn bg-teal-600 text-foreground border border-primary-foreground rounded-lg py-2.5 px-5">
                Select <ChevronDown className="h-4 w-4" />
              </UIButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {items.map((item) => (
                <DropdownMenuItem
                  key={item.key}
                  variant={item.danger ? "destructive" : "default"}
                  onSelect={(e) => {
                    e.preventDefault();
                    item.onClick?.();
                  }}
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const getMenuItems = (row: any) => {
    const items: { key: string; label: string; icon: React.ReactNode; onClick?: () => void; danger?: boolean }[] = [];
    if (canUpdate(DOCUMENT_PERMISSIONS)) {
      items.push({ key: "edit", label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(row) });
    }
    if (canRemove(DOCUMENT_PERMISSIONS)) {
      items.push({ key: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => removeDoc(row.id) });
    }
    if (canVerifyModule(DOCUMENT_PERMISSIONS)) {
      items.push({ key: "verify", label: "Verify", icon: <Check className="h-4 w-4" />, onClick: () => console.log("Verify", row.id) });
    }
    if (canRejectAsChecker(DOCUMENT_PERMISSIONS)) {
      items.push({ key: "checker-reject", label: "Reject (Checker)", icon: <X className="h-4 w-4" />, onClick: () => console.log("Checker Reject", row.id), danger: true });
    }
    if (canApproveModule(DOCUMENT_PERMISSIONS)) {
      items.push({ key: "approve", label: "Approve", icon: <Check className="h-4 w-4" />, onClick: () => console.log("Approve", row.id) });
    }
    if (canRejectAsApprover(DOCUMENT_PERMISSIONS)) {
      items.push({ key: "approver-reject", label: "Reject (Approver)", icon: <X className="h-4 w-4" />, onClick: () => console.log("Approver Reject", row.id), danger: true });
    }
    return items;
  };

  // Check if user has any action permissions
  const hasAnyActionPermission = () => {
    return canUpdate(DOCUMENT_PERMISSIONS) || 
           canRemove(DOCUMENT_PERMISSIONS) || 
           canVerifyModule(DOCUMENT_PERMISSIONS) || 
           canRejectAsChecker(DOCUMENT_PERMISSIONS) || 
           canApproveModule(DOCUMENT_PERMISSIONS) || 
           canRejectAsApprover(DOCUMENT_PERMISSIONS);
  };
  const openEdit = (row: any) => {
    setEditingId(row.id);
    setSelectedItem("edit");
    setFormValues({
      nameEn: row.nameEn || "",
      nameAr: row.nameAr || "",
      documentType: row.documentType || "TEMPLATE",
      fileUrl: row.fileUrl || null,
      fileSizeBytes: row.fileSizeBytes || null,
      fileVersion: row.fileVersion || "v1",
      createdByName: row.createdByName || "Admin",
      required: !!row.required,
    });
    setIsModalVisible(true);
  };

  const removeDoc = async (id: number) => {
    if (!productId) return;
    try {
      const response = await removeProductDocument(productId, String(id));
      if (response?.data?.message === "success") {
        toast.success("Document removed successfully");
        loadDocuments();
      } else {
        toast.error(response?.data?.message || "Failed to remove document");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove document");
    }
  };

  const loadDocuments = async () => {
    try {
      if (!productId) return;
      setIsLoading(true);
      const res = await getProductById(productId, "documents");
      const list = res?.data?.data?.documents || res?.data?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (e: any) {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [productId]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSave = async () => {
    if (!formValues.nameEn || !formValues.nameAr) {
      toast.error("Please fill Name (En) and Name (Ar)");
      return;
    }
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    const body = {
      nameEn: formValues.nameEn,
      nameAr: formValues.nameAr,
      documentType: formValues.documentType,
      fileUrl: formValues.fileUrl,
      fileSizeBytes: formValues.fileSizeBytes,
      fileVersion: formValues.fileVersion,
      createdByName: formValues.createdByName,
      required: formValues.required,
    };

    try {
      const apiCall = editingId
        ? editProductDocument(productId, String(editingId), body)
        : addProductDocument(productId, body);

      await toast.promise(apiCall, {
        loading: editingId ? "Updating Document..." : "Adding Document...",
        success: (response: any) => {
          setIsModalVisible(false);
          setFormValues(initialFormValues);
          setEditingId(null);
          loadDocuments();
          return response?.data?.message || "Document saved successfully";
        },
        error: (err) => {
          return err?.response?.data?.message || "Failed to save document";
        },
      });
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  };

  const filteredData = data
    ? data.filter((item: any) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          (item?.nameEn || "").toLowerCase().includes(term) ||
          (item?.nameAr || "").toLowerCase().includes(term)
        );
      })
    : [];

  const mappedData = filteredData.map((item: any) => ({
    id: item.id,
    nameEn: item?.nameEn || item?.name_en || "-",
    nameAr: item?.nameAr || item?.name_ar || "-",
    documentType: item?.documentType || item?.type || "-",
    fileUrl: item?.fileUrl,
    fileSizeBytes: item?.fileSizeBytes,
    fileVersion: item?.fileVersion || "-",
    createdByName: item?.createdByName || item?.created_by || "-",
    required: item?.required ?? true,
  }));

  return (
    <div className="service">
      <h1 className="pt-2 pb-3" style={{ fontSize: "16px", fontWeight: "bold" }}>
        Required Documents
      </h1>
      <div className="d-flex justify-content-end mb-3 gap-2">
        <Input
          placeholder="Search By Name"
          className="w-[220px]"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {canCreate(DOCUMENT_PERMISSIONS) && (
          <UIButton className="theme-btn-next" onClick={() => { setSelectedItem("add"); setEditingId(null); setFormValues(initialFormValues); setIsModalVisible(true); }}>
            Add New Document
          </UIButton>
        )}
      </div>

      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Document" : "Add Document"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Name (En)</Label>
              <Input
                placeholder="Document Name in English"
                value={formValues.nameEn}
                onChange={(e) => setFormValues({ ...formValues, nameEn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ textAlign: "right", display: "block" }}>الاسم (عربي)</Label>
              <Input
                placeholder="اسم المستند بالعربي"
                value={formValues.nameAr}
                onChange={(e) => setFormValues({ ...formValues, nameAr: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select
                value={formValues.documentType || ""}
                onValueChange={(val) => setFormValues({ ...formValues, documentType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEMPLATE">Template</SelectItem>
                  <SelectItem value="UPLOAD">Upload</SelectItem>
                  <SelectItem value="GENERATED">Generated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File Version</Label>
              <Input
                placeholder="e.g. v1"
                value={formValues.fileVersion}
                onChange={(e) => setFormValues({ ...formValues, fileVersion: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Created By</Label>
              <Input
                placeholder="Creator name"
                value={formValues.createdByName}
                onChange={(e) => setFormValues({ ...formValues, createdByName: e.target.value })}
              />
            </div>
            <div className="space-y-2 flex items-end">
              <div className="flex items-center gap-2 pb-1">
                <Switch
                  checked={formValues.required}
                  onCheckedChange={(checked) => setFormValues({ ...formValues, required: checked })}
                />
                <span>Required</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <UIButton variant="outline" onClick={() => setIsModalVisible(false)}>Cancel</UIButton>
            <UIButton className="theme-btn-next" onClick={handleSave}>Save</UIButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TableView
        header={headers}
        data={mappedData}
        totalRows={mappedData.length}
        isLoading={isLoading}
        from={1}
        page={1}
        totalPage={1}
        setPage={() => {}}
        pageSize={mappedData.length || 15}
        setPageSize={() => {}}
        to={mappedData.length}
      />

      <div className="d-flex justify-content-end mt-3">
        <UIButton className="theme-btn-next">Next</UIButton>
      </div>
    </div>
  );
};

export default RequiredDoc;
