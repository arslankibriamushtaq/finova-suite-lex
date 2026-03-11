import { useState, useEffect } from "react";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllProviders, createProvider, updateProvider, deleteProvider } from "../../redux/apis/apisMiddlewareProviders";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Plus, ChevronDown, Pencil, Trash2 } from "lucide-react";

const CATEGORIES = ["KYC", "PAYMENT", "CREDIT_BUREAU", "GOVERNMENT", "COMMUNICATION", "COMPLIANCE", "BANKING", "RISK"];
const AUTH_TYPES = ["API_KEY", "OAUTH2", "BASIC_AUTH", "CERTIFICATE", "HMAC", "NONE"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "DEPRECATED"];

const initialFormValues = {
  code: "",
  name: "",
  description: "",
  category: "KYC",
  baseUrlDev: "",
  baseUrlProd: "",
  authType: "API_KEY",
  timeoutMs: 30000,
  retryCount: 3,
  status: "ACTIVE",
};

const ProvidersList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [isSaving, setIsSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const response = await getAllProviders();
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch providers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const openAddDialog = () => {
    setEditingProvider(null);
    setFormValues(initialFormValues);
    setIsDialogOpen(true);
  };

  const openEditDialog = (row: any) => {
    setEditingProvider(row);
    setFormValues({
      code: row.code || "",
      name: row.name || "",
      description: row.description || "",
      category: row.category || "KYC",
      baseUrlDev: row.baseUrlDev || "",
      baseUrlProd: row.baseUrlProd || "",
      authType: row.authType || "API_KEY",
      timeoutMs: row.timeoutMs ?? 30000,
      retryCount: row.retryCount ?? 3,
      status: row.status || "ACTIVE",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formValues.code?.trim() || !formValues.name?.trim()) {
      toast.error("Code and Name are required");
      return;
    }

    try {
      setIsSaving(true);

      if (editingProvider) {
        const body = {
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          baseUrlDev: formValues.baseUrlDev.trim(),
          baseUrlProd: formValues.baseUrlProd.trim(),
          authType: formValues.authType,
          timeoutMs: Number(formValues.timeoutMs),
          retryCount: Number(formValues.retryCount),
          status: formValues.status,
        };
        await updateProvider(editingProvider.id, body);
        toast.success("Provider updated successfully");
      } else {
        const body = {
          code: formValues.code.trim(),
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          category: formValues.category,
          baseUrlDev: formValues.baseUrlDev.trim(),
          baseUrlProd: formValues.baseUrlProd.trim(),
          authType: formValues.authType,
          timeoutMs: Number(formValues.timeoutMs),
          retryCount: Number(formValues.retryCount),
        };
        await createProvider(body);
        toast.success("Provider created successfully");
      }

      setIsDialogOpen(false);
      setEditingProvider(null);
      setFormValues(initialFormValues);
      loadProviders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save provider");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this provider?")) return;
    try {
      await deleteProvider(id);
      toast.success("Provider deleted successfully");
      loadProviders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete provider");
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item?.name || "").toLowerCase().includes(term) ||
      (item?.code || "").toLowerCase().includes(term) ||
      (item?.category || "").toLowerCase().includes(term)
    );
  });

  const headers = [
    {
      name: "Code",
      selector: (row: any) => row.code || "-",
      sortable: true,
    },
    {
      name: "Name",
      selector: (row: any) => row.name || "-",
      sortable: true,
    },
    {
      name: "Category",
      selector: (row: any) => row.category || "-",
      sortable: true,
    },
    {
      name: "Auth Type",
      selector: (row: any) => row.authType || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.status || "ACTIVE";
        const colorClass =
          status === "ACTIVE"
            ? "text-green-600 font-medium"
            : status === "INACTIVE"
            ? "text-yellow-600 font-medium"
            : "text-red-600 font-medium";
        return <span className={colorClass}>{status}</span>;
      },
    },
    {
      name: "Timeout (ms)",
      selector: (row: any) => row.timeoutMs ?? "-",
      sortable: true,
    },
    {
      name: "Retries",
      selector: (row: any) => row.retryCount ?? "-",
      sortable: true,
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
                  openEditDialog(row);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  handleDelete(row.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="service p-4">
      <h1 className="text-xl font-bold pb-3">Providers</h1>

      <div className="d-flex justify-content-between mb-3 gap-2">
        <Input
          placeholder="Search by name, code, or category"
          className="w-[280px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit Provider" : "Add Provider"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                placeholder="e.g. NAFATH"
                value={formValues.code}
                onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
                disabled={!!editingProvider}
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Provider name"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description"
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formValues.category}
                onValueChange={(val) => setFormValues({ ...formValues, category: val })}
                disabled={!!editingProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Auth Type</Label>
              <Select
                value={formValues.authType}
                onValueChange={(val) => setFormValues({ ...formValues, authType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select auth type" />
                </SelectTrigger>
                <SelectContent>
                  {AUTH_TYPES.map((auth) => (
                    <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Base URL (Dev)</Label>
              <Input
                placeholder="https://sandbox.example.com/api"
                value={formValues.baseUrlDev}
                onChange={(e) => setFormValues({ ...formValues, baseUrlDev: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL (Prod)</Label>
              <Input
                placeholder="https://api.example.com/api"
                value={formValues.baseUrlProd}
                onChange={(e) => setFormValues({ ...formValues, baseUrlProd: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Timeout (ms)</Label>
              <Input
                type="number"
                placeholder="30000"
                value={formValues.timeoutMs}
                onChange={(e) => setFormValues({ ...formValues, timeoutMs: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Retry Count</Label>
              <Input
                type="number"
                placeholder="3"
                value={formValues.retryCount}
                onChange={(e) => setFormValues({ ...formValues, retryCount: Number(e.target.value) })}
              />
            </div>
            {editingProvider && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(val) => setFormValues({ ...formValues, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
  );
};

export default ProvidersList;
