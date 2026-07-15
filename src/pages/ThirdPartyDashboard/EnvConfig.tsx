import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getEnvironmentConfig } from "../../redux/apis/apisThirdParty";
import { updateEnvConfig } from "../../redux/apis/apisMiddlewareProviders";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";

const EnvConfig = () => {
  const { t } = useTranslation("connector");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headersList, setHeadersList] = useState<Array<{ key: string; value: string }>>([]);
  const [credentialsList, setCredentialsList] = useState<Array<{ key: string; value: string }>>([]);
  const [formValues, setFormValues] = useState({
    baseUrl: "",
    endpointPath: "",
    httpMethod: "GET",
    environment: "DEV",
    active: true,
  });

  useEffect(() => {
    fetchEnvironmentConfig();
  }, []);

  const fetchEnvironmentConfig = async () => {
    try {
      setIsLoading(true);
      const response = await getEnvironmentConfig();
      const providers = response?.data?.data || response?.data || [];

      // Flatten providers → apis → envConfigs into flat rows for the table
      const flatRows: any[] = [];
      if (Array.isArray(providers)) {
        providers.forEach((provider: any) => {
          const apis = provider.apis || [];
          apis.forEach((api: any) => {
            const envConfigs = api.envConfigs || [];
            if (envConfigs.length > 0) {
              envConfigs.forEach((config: any) => {
                flatRows.push({
                  configId: config.id,
                  providerName: provider.name || "-",
                  providerId: provider.id,
                  apiId: api.id,
                  apiName: api.name || "-",
                  httpMethod: api.httpMethod || "-",
                  endpointPath: config.endpointPath || api.endpointPath || "-",
                  baseUrl: config.baseUrl || "-",
                  environment: config.environment || "-",
                  authType: config.authType || "-",
                  active: config.active,
                  credentials: config.credentials,
                  headers: config.headers,
                });
              });
            } else {
              flatRows.push({
                configId: null,
                providerName: provider.name || "-",
                providerId: provider.id,
                apiId: api.id,
                apiName: api.name || "-",
                httpMethod: api.httpMethod || "-",
                endpointPath: api.endpointPath || "-",
                baseUrl: "-",
                environment: "-",
                authType: "-",
                active: false,
                credentials: null,
                headers: null,
              });
            }
          });
        });
      }

      setData(flatRows);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("envConfig.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Parse JSON string or object into key-value pairs
  const parseJsonToKeyValue = (input: any): Array<{ key: string; value: string }> => {
    if (!input) return [];
    try {
      const obj = typeof input === "string" ? JSON.parse(input) : input;
      if (!obj || typeof obj !== "object") return [];
      return Object.entries(obj).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    } catch {
      return [];
    }
  };

  const handleEdit = (row: any) => {
    setSelectedItem(row);

    const flatHeaders = parseJsonToKeyValue(row.headers);
    setHeadersList(flatHeaders.length > 0 ? flatHeaders : [{ key: "", value: "" }]);

    const flatCredentials = parseJsonToKeyValue(row.credentials);
    setCredentialsList(flatCredentials.length > 0 ? flatCredentials : [{ key: "", value: "" }]);

    setFormValues({
      baseUrl: row.baseUrl !== "-" ? row.baseUrl : "",
      endpointPath: row.endpointPath !== "-" ? row.endpointPath : "",
      httpMethod: row.httpMethod !== "-" ? row.httpMethod : "GET",
      environment: row.environment !== "-" ? row.environment : "DEV",
      active: row.active ?? true,
    });

    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;

    if (!formValues.baseUrl.trim()) {
      toast.error(t("envConfig.toast.baseUrlRequired"));
      return;
    }

    try {
      setIsSubmitting(true);

      const headersObj: Record<string, string> = {};
      headersList.forEach((h) => {
        if (h.key.trim()) headersObj[h.key.trim()] = h.value;
      });

      const credentialsObj: Record<string, string> = {};
      credentialsList.forEach((c) => {
        if (c.key.trim()) credentialsObj[c.key.trim()] = c.value;
      });

      const body = {
        apiId: selectedItem.apiId,
        environment: formValues.environment,
        baseUrl: formValues.baseUrl.trim(),
        endpointPath: formValues.endpointPath.trim(),
        credentials: JSON.stringify(credentialsObj),
        headers: JSON.stringify(headersObj),
        queryParams: null,
        authType: selectedItem.authType !== "-" ? selectedItem.authType : "API_KEY",
      };

      await updateEnvConfig(selectedItem.configId, body);
      toast.success(t("envConfig.toast.updateSuccess"));
      closeModal();
      fetchEnvironmentConfig();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("envConfig.toast.updateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setHeadersList([{ key: "", value: "" }]);
    setCredentialsList([{ key: "", value: "" }]);
    setFormValues({ baseUrl: "", endpointPath: "", httpMethod: "GET", environment: "DEV", active: true });
  };

  const addHeader = () => setHeadersList([...headersList, { key: "", value: "" }]);
  const removeHeader = (index: number) => setHeadersList(headersList.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: "key" | "value", newValue: string) => {
    const updated = [...headersList];
    updated[index] = { ...updated[index], [field]: newValue };
    setHeadersList(updated);
  };

  const addCredential = () => setCredentialsList([...credentialsList, { key: "", value: "" }]);
  const removeCredential = (index: number) => setCredentialsList(credentialsList.filter((_, i) => i !== index));
  const updateCredential = (index: number, field: "key" | "value", newValue: string) => {
    const updated = [...credentialsList];
    updated[index] = { ...updated[index], [field]: newValue };
    setCredentialsList(updated);
  };

  const tableHeaders = [
    {
      name: t("envConfig.col.provider"),
      selector: (row: any) => row.providerName,
      sortable: true,
    },
    {
      name: t("envConfig.col.apiName"),
      selector: (row: any) => row.apiName,
      sortable: true,
    },
    {
      name: t("envConfig.col.baseUrl"),
      selector: (row: any) => row.baseUrl,
      sortable: true,
      // width: "250px",
    },
    {
      name: t("envConfig.col.endpoint"),
      selector: (row: any) => row.endpointPath,
      sortable: true,
      // width: "250px",
    },
    {
      name: t("envConfig.col.method"),
      selector: (row: any) => row.httpMethod,
      sortable: true,
      // width: "100px",
    },
    {
      name: t("envConfig.col.environment"),
      selector: (row: any) => row.environment,
      sortable: true,
      // width: "120px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const isActive = row.active === true;
        return (
          <span className={isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isActive ? t("common:active") : t("common:inactive")}
          </span>
        );
      },
      sortable: true,
      // width: "100px",
    },
    {
      name: t("envConfig.col.action"),
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
                {t("envConfig.select")}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      // width: "100px",
    },
  ];

  return (
    <div className="service p-4">
      <h1 className="text-xl font-bold pb-3">{t("envConfig.title")}</h1>

      <TableView
        header={tableHeaders}
        data={data}
        totalRows={data.length}
        isLoading={isLoading}
        from={1}
        page={page}
        totalPage={Math.ceil(data.length / pageSize) || 1}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={data.length}
      />

      <Dialog open={showEditModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("envConfig.modalTitle")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedItem && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{selectedItem.providerName}</span>
                {" — "}
                {selectedItem.apiName}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("envConfig.form.baseUrl")}</Label>
                <Input
                  placeholder={t("envConfig.form.baseUrlPlaceholder")}
                  value={formValues.baseUrl}
                  onChange={(e) => setFormValues({ ...formValues, baseUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("envConfig.form.endpointPath")}</Label>
                <Input
                  placeholder={t("envConfig.form.endpointPlaceholder")}
                  value={formValues.endpointPath}
                  onChange={(e) => setFormValues({ ...formValues, endpointPath: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("envConfig.form.method")}</Label>
                <Select
                  value={formValues.httpMethod}
                  onValueChange={(val) => setFormValues({ ...formValues, httpMethod: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("envConfig.form.environment")}</Label>
                <Select
                  value={formValues.environment}
                  onValueChange={(val) => setFormValues({ ...formValues, environment: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["DEV", "STAGING", "UAT", "PROD"].map((env) => (
                      <SelectItem key={env} value={env}>{env}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("envConfig.form.status")}</Label>
              <Select
                value={formValues.active ? "active" : "inactive"}
                onValueChange={(val) => setFormValues({ ...formValues, active: val === "active" })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("common:active")}</SelectItem>
                  <SelectItem value="inactive">{t("common:inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Headers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold">{t("envConfig.headers")}</Label>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addHeader}>
                  <Plus className="h-3 w-3" />
                  {t("envConfig.addHeader")}
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {headersList.map((header, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={t("envConfig.headerKey")}
                      value={header.key}
                      onChange={(e) => updateHeader(index, "key", e.target.value)}
                    />
                    <Input
                      placeholder={t("envConfig.headerValue")}
                      value={header.value}
                      onChange={(e) => updateHeader(index, "value", e.target.value)}
                    />
                    {headersList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHeader(index)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Credentials */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold">{t("envConfig.credentials")}</Label>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addCredential}>
                  <Plus className="h-3 w-3" />
                  {t("envConfig.addCredential")}
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {credentialsList.map((credential, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={t("envConfig.credentialKey")}
                      value={credential.key}
                      onChange={(e) => updateCredential(index, "key", e.target.value)}
                    />
                    <Input
                      placeholder={t("envConfig.credentialValue")}
                      value={credential.value}
                      onChange={(e) => updateCredential(index, "value", e.target.value)}
                    />
                    {credentialsList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCredential(index)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? t("envConfig.updating") : t("common:update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnvConfig;
