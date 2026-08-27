import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getEnvConfigsByApiId, getEnvConfigById, createEnvConfig, updateEnvConfig, deleteEnvConfig } from "../../redux/apis/apisMiddlewareProviders";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ArrowLeft, Plus, ChevronDown, Pencil, Trash2 } from "lucide-react";

const ENVIRONMENTS = ["DEVELOPMENT", "UAT", "PRODUCTION"];
const AUTH_TYPES = ["API_KEY", "OAUTH2", "BASIC_AUTH", "CERTIFICATE", "HMAC", "NONE"];

const initialFormValues = {
  apiId: "",
  environment: "DEVELOPMENT",
  baseUrl: "",
  endpointPath: "",
  credentials: "",
  headers: "",
  queryParams: "",
  authType: "API_KEY",
};

const ProviderApiEnvConfig = () => {
  const { t } = useTranslation("connector");
  const { apiId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Create/Edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEnvConfigs = async () => {
    if (!apiId) return;
    try {
      setIsLoading(true);
      const response = await getEnvConfigsByApiId(apiId);
      const result = response?.data?.data || response?.data || [];
      if (Array.isArray(result)) {
        setData(result);
      } else if (result && typeof result === "object") {
        setData([result]);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("providerApiEnvConfig.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnvConfigs();
  }, [apiId]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // Create
  const openAddDialog = () => {
    setEditingConfig(null);
    setFormValues({ ...initialFormValues, apiId: apiId || "" });
    setIsDialogOpen(true);
  };

  // Edit
  const openEditDialog = async (row: any) => {
    setEditingConfig(row);
    setIsDialogOpen(true);
    setIsLoadingEdit(true);
    try {
      const response = await getEnvConfigById(row.id);
      const config = response?.data?.data || response?.data || {};
      setFormValues({
        apiId: config.apiId || apiId || "",
        environment: config.environment || "DEVELOPMENT",
        baseUrl: config.baseUrl || "",
        endpointPath: config.endpointPath || "",
        credentials: typeof config.credentials === "object" ? JSON.stringify(config.credentials) : config.credentials || "",
        headers: typeof config.headers === "object" ? JSON.stringify(config.headers) : config.headers || "",
        queryParams: typeof config.queryParams === "object" ? JSON.stringify(config.queryParams) : config.queryParams || "",
        authType: config.authType || "API_KEY",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("providerApiEnvConfig.toast.fetchDetailFailed"));
      setIsDialogOpen(false);
      setEditingConfig(null);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!formValues.baseUrl?.trim()) {
      toast.error(t("providerApiEnvConfig.toast.baseUrlRequired"));
      return;
    }

    try {
      setIsSaving(true);
      const body: any = {
        apiId: formValues.apiId || apiId,
        environment: formValues.environment,
        baseUrl: formValues.baseUrl.trim(),
        endpointPath: formValues.endpointPath.trim() || null,
        credentials: formValues.credentials.trim() || null,
        headers: formValues.headers.trim() || null,
        queryParams: formValues.queryParams.trim() || null,
        authType: formValues.authType,
      };

      if (editingConfig) {
        await updateEnvConfig(editingConfig.id, body);
        toast.success(t("providerApiEnvConfig.toast.updateSuccess"));
      } else {
        await createEnvConfig(body);
        toast.success(t("providerApiEnvConfig.toast.createSuccess"));
      }

      setIsDialogOpen(false);
      setEditingConfig(null);
      setFormValues(initialFormValues);
      loadEnvConfigs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("providerApiEnvConfig.toast.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteEnvConfig(deleteId);
      toast.success(t("providerApiEnvConfig.toast.deleteSuccess"));
      setDeleteId(null);
      loadEnvConfigs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("providerApiEnvConfig.toast.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const getEnvColor = (env: string) => {
    switch (env) {
      case "PRODUCTION":
      case "PROD":
        return { backgroundColor: "var(--color-error)", color: "var(--primary-foreground)" };
      case "UAT":
        return { backgroundColor: "var(--color-warning)", color: "var(--primary-foreground)" };
      case "DEVELOPMENT":
      case "DEV":
      default:
        return { backgroundColor: "var(--color-info)", color: "var(--primary-foreground)" };
    }
  };

  const tableHeaders = [
    {
      name: t("providerApiEnvConfig.col.environment"),
      cell: (row: any) => (
        <span
          style={{
            ...getEnvColor(row.environment),
            padding: "4px 10px",
            borderRadius: "2px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {row.environment || "-"}
        </span>
      ),
      // width: "140px",
    },
    {
      name: t("providerApiEnvConfig.col.baseUrl"),
      selector: (row: any) => row.baseUrl || "-",
      sortable: true,
      wrap: true,
      // width: "250px",
    },
    {
      name: t("providerApiEnvConfig.col.endpointPath"),
      selector: (row: any) => row.endpointPath || "-",
      sortable: true,
      wrap: true,
      // width: "200px",
    },
    {
      name: t("providerApiEnvConfig.col.authType"),
      selector: (row: any) => row.authType || "-",
      // width: "120px",
    },
    {
      name: t("providerApiEnvConfig.col.active"),
      cell: (row: any) => (
        <span className={row.active ? "text-slate-500 font-medium" : "text-red-600 font-medium"}>
          {row.active ? t("common:yes") : t("common:no")}
        </span>
      ),
      // width: "80px",
    },
    {
      name: t("providerApiEnvConfig.col.createdAt"),
      cell: (row: any) => (
        <div>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}</div>
      ),
      sortable: true,
      // width: "120px",
    },
    {
      name: t("providerApiEnvConfig.col.action"),
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
                {t("providerApiEnvConfig.select")}
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
  const total = data.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div className="service p-4">
      <div className="d-flex align-items-center justify-content-between pb-3">
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold m-0">{t("providerApiEnvConfig.title")}</h1>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          {t("providerApiEnvConfig.addConfig")}
        </Button>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editingConfig ? t("providerApiEnvConfig.modalTitleEdit") : t("providerApiEnvConfig.modalTitleAdd")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4" style={{ opacity: isLoadingEdit ? 0.5 : 1, pointerEvents: isLoadingEdit ? "none" : "auto" }}>
            {isLoadingEdit && (
              <div className="col-span-2 text-center py-4 text-muted-foreground">{t("action.loading")}</div>
            )}
            <div className="space-y-2">
              <Label>{t("providerApiEnvConfig.form.environment")}</Label>
              <Select
                value={formValues.environment}
                onValueChange={(val) => setFormValues({ ...formValues, environment: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("providerApiEnvConfig.form.environmentPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>{env}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("providerApiEnvConfig.form.authType")}</Label>
              <Select
                value={formValues.authType}
                onValueChange={(val) => setFormValues({ ...formValues, authType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("providerApiEnvConfig.form.authTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {AUTH_TYPES.map((auth) => (
                    <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("providerApiEnvConfig.form.baseUrl")}</Label>
              <Input
                placeholder={t("providerApiEnvConfig.form.baseUrlPlaceholder")}
                value={formValues.baseUrl}
                onChange={(e) => setFormValues({ ...formValues, baseUrl: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("providerApiEnvConfig.form.endpointPath")}</Label>
              <Input
                placeholder={t("providerApiEnvConfig.form.endpointPlaceholder")}
                value={formValues.endpointPath}
                onChange={(e) => setFormValues({ ...formValues, endpointPath: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("providerApiEnvConfig.form.credentials")}</Label>
              <Textarea
                placeholder='{"clientId":"xxx","clientSecret":"xxx"}'
                value={formValues.credentials}
                onChange={(e) => setFormValues({ ...formValues, credentials: e.target.value })}
                rows={3}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("providerApiEnvConfig.form.headers")}</Label>
              <Textarea
                placeholder='{"X-Api-Version":"2.0"}'
                value={formValues.headers}
                onChange={(e) => setFormValues({ ...formValues, headers: e.target.value })}
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("providerApiEnvConfig.form.queryParams")}</Label>
              <Textarea
                placeholder='{"lang":"ar"}'
                value={formValues.queryParams}
                onChange={(e) => setFormValues({ ...formValues, queryParams: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common:cancel")}</Button>
            <Button onClick={handleSave} disabled={isSaving || isLoadingEdit}>
              {isSaving ? t("providerApiEnvConfig.saving") : editingConfig ? t("common:update") : t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("providerApiEnvConfig.deleteModalTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            {t("providerApiEnvConfig.deleteBody")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>{t("common:cancel")}</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t("action.deleting") : t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TableView
        header={tableHeaders}
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

export default ProviderApiEnvConfig;
