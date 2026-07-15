import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllProviderApis, createProviderApi, updateProviderApi, getProviderApiById, deleteProviderApi, getAllProviders, updateProviderApiCostByCode } from "../../redux/apis/apisMiddlewareProviders";
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
import { Plus, ChevronDown, Pencil, Trash2, Settings, SaudiRiyal, Webhook } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
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
  const { t } = useTranslation("connector");
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
      toast.error(error?.response?.data?.message || t("allProviderApis.toast.fetchFailed"));
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
      toast.error(error?.response?.data?.message || t("allProviderApis.toast.fetchDetailFailed"));
      setIsDialogOpen(false);
      setEditingApi(null);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleSave = async () => {
    if (!formValues.name?.trim()) {
      toast.error(t("allProviderApis.validation.nameRequired"));
      return;
    }
    if (!formValues.endpointPath?.trim()) {
      toast.error(t("allProviderApis.validation.endpointRequired"));
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
        toast.success(t("allProviderApis.toast.updateSuccess"));
      } else {
        if (!formValues.code?.trim()) {
          toast.error(t("allProviderApis.validation.codeRequired"));
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
        toast.success(t("allProviderApis.toast.createSuccess"));
      }

      setIsDialogOpen(false);
      setEditingApi(null);
      setFormValues(initialFormValues);
      loadProviderApis();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("allProviderApis.toast.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [costApi, setCostApi] = useState<any>(null);
  const [costValues, setCostValues] = useState({ costPerCall: "", costCurrency: "SAR" });
  const [isSavingCost, setIsSavingCost] = useState(false);

  const openCostDialog = (row: any) => {
    setCostApi(row);
    setCostValues({
      costPerCall: row?.costPerCall != null ? String(row.costPerCall) : "",
      costCurrency: row?.costCurrency || "SAR",
    });
  };

  const handleSaveCost = async () => {
    if (!costApi?.code) {
      toast.error(t("allProviderApis.validation.apiCodeMissing"));
      return;
    }
    const trimmed = costValues.costPerCall?.toString().trim();
    if (!trimmed || isNaN(Number(trimmed))) {
      toast.error(t("allProviderApis.validation.costValidNumber"));
      return;
    }
    if (!costValues.costCurrency?.trim()) {
      toast.error(t("allProviderApis.validation.currencyRequired"));
      return;
    }
    try {
      setIsSavingCost(true);
      await updateProviderApiCostByCode(costApi.code, {
        costPerCall: Number(trimmed).toFixed(4),
        costCurrency: costValues.costCurrency.trim(),
      });
      toast.success(t("allProviderApis.toast.costUpdateSuccess"));
      setCostApi(null);
      loadProviderApis();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("allProviderApis.toast.costUpdateFailed"));
    } finally {
      setIsSavingCost(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteProviderApi(deleteId);
      toast.success(t("allProviderApis.toast.deleteSuccess"));
      setDeleteId(null);
      loadProviderApis();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("allProviderApis.toast.deleteFailed"));
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
      name: t("allProviderApis.col.code"),
      selector: (row: any) => row.code || "-",
      sortable: true,
      wrap: true,
      width: "200px",
    },
    {
      name: t("allProviderApis.col.name"),
      selector: (row: any) => row.name || "-",
      sortable: true,
      wrap: true,
      // width: "200px",
    },
    {
      name: t("allProviderApis.col.method"),
      cell: (row: any) => (
        <span
          style={{
            ...getMethodColor(row.httpMethod),
            padding: "4px 10px",
            borderRadius: "2px",
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
      name: t("allProviderApis.col.endpointPath"),
      selector: (row: any) => row.endpointPath || "-",
      sortable: true,
      wrap: true,
      // width: "220px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span className={getStatusColor(row.status)}>
          {row.status || "-"}
        </span>
      ),
      sortable: true,
      // width: "110px",
    },
    {
      name: t("allProviderApis.col.async"),
      selector: (row: any) => (row.async ? t("common:yes") : t("common:no")),
      // width: "80px",
    },
    {
      name: t("allProviderApis.col.timeout"),
      selector: (row: any) => row.timeoutMs ?? "-",
      // width: "120px",
    },
    {
      name: t("allProviderApis.col.createdAt"),
      cell: (row: any) => (
        <div>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
        </div>
      ),
      sortable: true,
      // width: "120px",
    },
    {
      name: t("allProviderApis.col.action"),
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
                {t("allProviderApis.select")}
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
                {t("common:edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  openCostDialog(row);
                }}
              >
                <SaudiRiyal className="h-4 w-4" />
                {t("allProviderApis.updateCost")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/ThirdPartyManagement/AllProviderApis/EnvConfig/${row.id}`);
                }}
              >
                <Settings className="h-4 w-4" />
                {t("allProviderApis.envConfig")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteId(row.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                {t("common:delete")}
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
    <div className="service all-provider-apis-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Webhook className="h-4 w-4" />
          </span>
          {t("allProviderApis.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("allProviderApis.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <Button
            className="gap-2"
            onClick={openAddDialog}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <Plus className="h-4 w-4" />
            {t("allProviderApis.addProviderApi")}
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editingApi ? t("allProviderApis.modalTitleEdit") : t("allProviderApis.modalTitleAdd")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4" style={{ opacity: isLoadingEdit ? 0.5 : 1, pointerEvents: isLoadingEdit ? "none" : "auto" }}>
            {isLoadingEdit && (
              <div className="col-span-2 text-center py-4 text-muted-foreground">{t("action.loading")}</div>
            )}
            {!editingApi && (
              <div className="space-y-2">
                <Label>{t("allProviderApis.form.provider")}</Label>
                <Select
                  value={formValues.providerId}
                  onValueChange={(val) => setFormValues({ ...formValues, providerId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("allProviderApis.form.providerPlaceholder")} />
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
              <Label>{t("allProviderApis.form.code")} {!editingApi && "*"}</Label>
              <Input
                placeholder={t("allProviderApis.form.codePlaceholder")}
                value={formValues.code}
                onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
                disabled={!!editingApi}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("allProviderApis.form.name")}</Label>
              <Input
                placeholder={t("allProviderApis.form.namePlaceholder")}
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("allProviderApis.form.httpMethod")}</Label>
              <Select
                value={formValues.httpMethod}
                onValueChange={(val) => setFormValues({ ...formValues, httpMethod: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("allProviderApis.form.methodPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("allProviderApis.form.description")}</Label>
              <Input
                placeholder={t("allProviderApis.form.descriptionPlaceholder")}
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("allProviderApis.form.endpointPath")}</Label>
              <Input
                placeholder={t("allProviderApis.form.endpointPlaceholder")}
                value={formValues.endpointPath}
                onChange={(e) => setFormValues({ ...formValues, endpointPath: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("allProviderApis.form.timeout")}</Label>
              <Input
                type="number"
                placeholder={t("allProviderApis.form.timeoutPlaceholder")}
                value={formValues.timeoutMs}
                onChange={(e) => setFormValues({ ...formValues, timeoutMs: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={formValues.async}
                onCheckedChange={(val) => setFormValues({ ...formValues, async: val })}
              />
              <Label>{t("allProviderApis.form.async")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common:cancel")}</Button>
            <Button onClick={handleSave} disabled={isSaving || isLoadingEdit}>
              {isSaving ? t("allProviderApis.saving") : editingApi ? t("common:update") : t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!costApi} onOpenChange={(open) => { if (!open) setCostApi(null); }}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t("allProviderApis.costModalTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("allProviderApis.cost.apiCode")}</Label>
              <Input value={costApi?.code || ""} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("allProviderApis.cost.costPerCall")}</Label>
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder={t("allProviderApis.cost.costPlaceholder")}
                  value={costValues.costPerCall}
                  onChange={(e) => setCostValues({ ...costValues, costPerCall: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("allProviderApis.cost.currency")}</Label>
                <Select
                  value={costValues.costCurrency}
                  onValueChange={(val) => setCostValues({ ...costValues, costCurrency: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("allProviderApis.cost.currencyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCostApi(null)} disabled={isSavingCost}>{t("common:cancel")}</Button>
            <Button onClick={handleSaveCost} disabled={isSavingCost}>
              {isSavingCost ? t("allProviderApis.saving") : t("common:update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("allProviderApis.deleteModalTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            {t("allProviderApis.deleteBody")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>{t("common:cancel")}</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t("action.deleting") : t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={paginatedData}
          totalRows={total}
          isLoading={isLoading}
          from={total > 0 ? startIndex + 1 : 0}
          page={page}
          totalPage={Math.max(1, Math.ceil(total / pageSize))}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={Math.min(endIndex, total)}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default AllProviderApis;
