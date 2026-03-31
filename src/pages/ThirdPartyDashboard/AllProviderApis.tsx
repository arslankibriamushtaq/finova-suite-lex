import { useState, useEffect } from "react";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllProviderApis, createProviderApi, updateProviderApi, getProviderApiById, deleteProviderApi, getAllProviders } from "../../redux/apis/apisMiddlewareProviders";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
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
import { Plus, ChevronDown, Pencil, Trash2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const initialFormValues = {
  providerId: "",
  code: "",
  name: "",
  description: "",
  httpMethod: "GET",
  endpointPath: "",
  async: false,
  timeoutMs: 30000,
};

const AllProviderApis = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<any>(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [isSaving, setIsSaving] = useState(false);

  const loadProviderApis = async () => {
    try {
      setIsLoading(true);
      const response = await getAllProviderApis();
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch provider APIs");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await getAllProviders();
      const list = response?.data?.data || response?.data || [];
      setProviders(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error("Failed to load providers:", error);
    }
  };

  useEffect(() => {
    loadProviderApis();
    loadProviders();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize]);

  const openAddDialog = () => {
    setEditingApi(null);
    setFormValues(initialFormValues);
    setIsDialogOpen(true);
  };

  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  const openEditDialog = async (row: any) => {
    setEditingApi(row);
    setIsDialogOpen(true);
    setIsLoadingEdit(true);
    try {
      const response = await getProviderApiById(row.id);
      const apiData = response?.data?.data || response?.data || {};
      setFormValues({
        providerId: apiData.providerId || "",
        code: apiData.code || "",
        name: apiData.name || "",
        description: apiData.description || "",
        httpMethod: apiData.httpMethod || "GET",
        endpointPath: apiData.endpointPath || "",
        async: apiData.async || false,
        timeoutMs: apiData.timeoutMs ?? "",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch provider API details");
      setIsDialogOpen(false);
      setEditingApi(null);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleSave = async () => {
    if (!formValues.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formValues.endpointPath?.trim()) {
      toast.error("Endpoint Path is required");
      return;
    }

    try {
      setIsSaving(true);

      if (editingApi) {
        const body = {
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          httpMethod: formValues.httpMethod,
          endpointPath: formValues.endpointPath.trim(),
          async: formValues.async,
          timeoutMs: formValues.timeoutMs ? Number(formValues.timeoutMs) : null,
        };
        await updateProviderApi(editingApi.id, body);
        toast.success("Provider API updated successfully");
      } else {
        if (!formValues.code?.trim()) {
          toast.error("Code is required");
          setIsSaving(false);
          return;
        }
        const body: any = {
          code: formValues.code.trim(),
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          httpMethod: formValues.httpMethod,
          endpointPath: formValues.endpointPath.trim(),
          async: formValues.async,
          timeoutMs: formValues.timeoutMs ? Number(formValues.timeoutMs) : null,
        };
        if (formValues.providerId) {
          body.providerId = formValues.providerId;
        }
        await createProviderApi(body);
        toast.success("Provider API created successfully");
      }

      setIsDialogOpen(false);
      setEditingApi(null);
      setFormValues(initialFormValues);
      loadProviderApis();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save provider API");
    } finally {
      setIsSaving(false);
    }
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteProviderApi(deleteId);
      toast.success("Provider API deleted successfully");
      setDeleteId(null);
      loadProviderApis();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete provider API");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item?.name || "").toLowerCase().includes(term) ||
      (item?.code || "").toLowerCase().includes(term) ||
      (item?.endpointPath || "").toLowerCase().includes(term) ||
      (item?.httpMethod || "").toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 font-medium";
      case "INACTIVE":
        return "text-yellow-600 font-medium";
      case "DEPRECATED":
        return "text-red-600 font-medium";
      default:
        return "text-muted-foreground";
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return { backgroundColor: "var(--color-success)", color: "var(--primary-foreground)" };
      case "POST":
        return { backgroundColor: "var(--color-info)", color: "var(--primary-foreground)" };
      case "PUT":
        return { backgroundColor: "var(--color-warning)", color: "var(--primary-foreground)" };
      case "DELETE":
        return { backgroundColor: "var(--color-error)", color: "var(--primary-foreground)" };
      default:
        return { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" };
    }
  };

  const headers = [
    {
      name: "Code",
      selector: (row: any) => row.code || "-",
      sortable: true,
      wrap: true,
      width: "200px",
    },
    {
      name: "Name",
      selector: (row: any) => row.name || "-",
      sortable: true,
      wrap: true,
      // width: "200px",
    },
    {
      name: "Method",
      cell: (row: any) => (
        <span
          style={{
            ...getMethodColor(row.httpMethod),
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {row.httpMethod || "-"}
        </span>
      ),
      // width: "100px",
    },
    {
      name: "Endpoint Path",
      selector: (row: any) => row.endpointPath || "-",
      sortable: true,
      wrap: true,
      // width: "220px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span className={getStatusColor(row.status)}>
          {row.status || "-"}
        </span>
      ),
      sortable: true,
      // width: "110px",
    },
    {
      name: "Async",
      selector: (row: any) => (row.async ? "Yes" : "No"),
      // width: "80px",
    },
    {
      name: "Timeout (ms)",
      selector: (row: any) => row.timeoutMs ?? "-",
      // width: "120px",
    },
    {
      name: "Created At",
      cell: (row: any) => (
        <div>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
        </div>
      ),
      sortable: true,
      // width: "120px",
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
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/ThirdPartyManagement/AllProviderApis/EnvConfig/${row.id}`);
                }}
              >
                <Settings className="h-4 w-4" />
                Env Configuration
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteId(row.id);
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

  // Client-side pagination
  const total = filteredData.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="service p-4">
      <h1 className="text-xl font-bold pb-3">All Provider APIs</h1>

      <div className="d-flex justify-content-between mb-3 gap-2">
        <Input
          placeholder="Search by name, code, method, or endpoint"
          className="w-[320px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Provider API
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editingApi ? "Edit Provider API" : "Add Provider API"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4" style={{ opacity: isLoadingEdit ? 0.5 : 1, pointerEvents: isLoadingEdit ? "none" : "auto" }}>
            {isLoadingEdit && (
              <div className="col-span-2 text-center py-4 text-muted-foreground">Loading...</div>
            )}
            {!editingApi && (
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={formValues.providerId}
                  onValueChange={(val) => setFormValues({ ...formValues, providerId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Code {!editingApi && "*"}</Label>
              <Input
                placeholder="e.g. NAFATH_INITIATE"
                value={formValues.code}
                onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
                disabled={!!editingApi}
              />
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="API name"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>HTTP Method</Label>
              <Select
                value={formValues.httpMethod}
                onValueChange={(val) => setFormValues({ ...formValues, httpMethod: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description"
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Endpoint Path *</Label>
              <Input
                placeholder="/v2/initiate"
                value={formValues.endpointPath}
                onChange={(e) => setFormValues({ ...formValues, endpointPath: e.target.value })}
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
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={formValues.async}
                onCheckedChange={(val) => setFormValues({ ...formValues, async: val })}
              />
              <Label>Async</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || isLoadingEdit}>
              {isSaving ? "Saving..." : editingApi ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Provider API</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this provider API? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TableView
        header={headers}
        data={paginatedData}
        totalRows={total}
        isLoading={isLoading}
        from={total > 0 ? startIndex + 1 : 0}
        page={page}
        totalPage={Math.ceil(total / pageSize) || 1}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={Math.min(endIndex, total)}
      />
    </div>
  );
};

export default AllProviderApis;
