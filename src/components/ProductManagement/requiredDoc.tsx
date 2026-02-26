import toast from "react-hot-toast";
import { getProductById, getReqDocument, storeReqDocument, updateReqDocument } from "../../redux/apis/apisCrud";
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
  const [formValues, setFormValues] = useState({ name: "", type: "", status: false });
  const [data, setData] = useState<any>();
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const product = useSelector((s: any) => s.block.productData);
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Permissions hook
  const { 
    canCreate, 
    canUpdate, 
    canRemove, 
    canVerifyModule, 
    canRejectAsChecker, 
    canApproveModule, 
    canRejectAsApprover 
  } = usePermissions();
  const headers = [
    { name: "Name", selector: (row: any) => row.name, },
    { name: "Type", selector: (row: any) => row.type, },
    { name: "Created By", selector: (row: any) => row.created_by || "-" },
    { name: "Creation Date", selector: (row: any) => row.created_at || "-" },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "12px",
            backgroundColor: row.status ? "var(--chart-2)" : "var(--destructive)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.status ? "Active" : "Inactive"}
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
    
    setSelectedItem("edit")
    

    setFormValues({ name: row.name, type: row.type, status: !!row.status });
    setIsModalVisible(true);
  };

  const removeDoc = (id: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.success("Removed");
  };

  const loadDocuments = async () => {
    try {
      if (!productId) return;
      setIsLoading(true);
      const res = await getProductById(productId, "documents");
      const list = res?.data?.data?.documents || [];
      const mapped = list.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        created_by: d.created_by,
        created_at: d.created_at,
        status: d.status === 1 || d.status === "Active",
      }));
      setDocuments(mapped);
    } catch (e: any) {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();

  }, [productId]);
  useEffect(() => {
    getInfo(productId)

  }, [productId]);
  const getInfo = async (id: any, searchName?: string) => {
    try {
      const response = await getReqDocument(id);
      if (response) {
        const data = response?.data?.data?.data;
        setData(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (productId) {
      getInfo(productId, value);
    }
  };
  const handleSave = async () => {
    const body: any = {

      product_id:productId,
name:formValues.name,
type:formValues.type,
status:formValues.status,

    };
    try {
      if (selectedItem == "edit" && editingId !== null) {
        await toast.promise(updateReqDocument(editingId, body), {
          loading: "Updating Document...",
          success: (response: any) => {
            setIsModalVisible(false);
            setFormValues({
              name: "",
              type: "",
              status: false,
            });
            getInfo(productId);
            return response?.data?.message;
          },
          error: (err) => err?.message || "Failed to update Document",
        });
      } else if (selectedItem == "add") {
        await toast.promise(storeReqDocument(body), {
          loading: "Adding Document...",
          success: (response) => {
            setIsModalVisible(false);
            setFormValues({
              name: "",
              type: "",
              status: false,
            });
            getInfo(productId);

            return response?.data?.message;
          },
          error: (err) => {
            const errors = err?.data?.errors;

            if (errors) {
              const allMessages = Object.values(errors).flat();
              allMessages.forEach((msg: any) => toast.error(msg));
            } else {
              toast.error("Something went wrong!");
            }
            return "Validation error";
          },
        });
      }
    } catch (error) {
      console.error("Failed to save department:", error);
    }
  };
  
  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item.id,
        // Sr: index + from,
        name: item?.name,
        type: item?.type,
        created_by: item?.created_by,
        created_at: item?.created_at,
        status: item?.status,

    
      };
    });

  return (
    <div className="service">
      <h1 className="pt-2 pb-3" style={{ fontSize: "16px", fontWeight: "bold" }}>
      Factoring Vallery Documents
      </h1>
      <div className="d-flex justify-content-end mb-3 gap-2">
        <Input
          placeholder="Search By Name"
          className="w-[220px]"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {canCreate(DOCUMENT_PERMISSIONS) && (
          <UIButton className="theme-btn-next" onClick={() => { setSelectedItem("add"); setIsModalVisible(true); }}>
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
              <Label>Document Name</Label>
              <Input
                placeholder="Document Name"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select
                value={formValues.type || ""}
                onValueChange={(val) => setFormValues({ ...formValues, type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formValues.status}
              onCheckedChange={(checked) => setFormValues({ ...formValues, status: checked })}
            />
            <span>Status</span>
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
        totalRows={documents.length}
        isLoading={isLoading}
        from={1}
        page={1}
        totalPage={1}
        setPage={() => {}}
        pageSize={documents.length || 15}
        setPageSize={() => {}}
        to={documents.length}
      />

      <div className="d-flex justify-content-end mt-3">
        <UIButton className="theme-btn-next">Save</UIButton>
      </div>
    </div>
  );
};

export default RequiredDoc;
