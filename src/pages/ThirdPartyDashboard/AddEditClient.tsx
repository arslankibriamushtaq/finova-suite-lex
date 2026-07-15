import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createClient, updateClient, getClientById, listApiAccess, bulkGrantAccess, getAllProviders, getProviderApisByProvider } from "../../redux/apis/apisMiddlewareProviders";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

const ENVIRONMENTS = ["DEV", "STAGING", "UAT", "PROD"];

interface Provider {
  id: string;
  name: string;
  code: string;
  category: string;
  status: string;
}

interface ProviderApi {
  id: string;
  name: string;
  code: string;
  providerId: string;
}

const AddEditClient = () => {
  const { t } = useTranslation("connector");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    code: "",
    description: "",
    callbackUrl: "",
    environment: "DEV",
    ipWhitelist: [""],
  });

  // Provider & API access state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerApis, setProviderApis] = useState<Record<string, ProviderApi[]>>({});
  const [loadingApis, setLoadingApis] = useState<Record<string, boolean>>({});
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const [selectedApis, setSelectedApis] = useState<Set<string>>(new Set());
  // Track what was originally granted (edit mode) to compute diffs
  useEffect(() => {
    loadProviders();
    if (isEditMode && id) {
      fetchClientData(id);
    }
  }, [id]);

  const loadProviders = async () => {
    try {
      const response = await getAllProviders();
      const list = response?.data?.data || response?.data || [];
      setProviders(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error("Failed to load providers:", error);
    }
  };

  const fetchClientData = async (clientId: string) => {
    try {
      setLoading(true);
      const response = await getClientById(clientId);
      const client = response?.data?.data || response?.data;
      if (client) {
        setFormValues({
          name: client.name || "",
          code: client.code || "",
          description: client.description || "",
          callbackUrl: client.callbackUrl || "",
          environment: client.environment || "DEV",
          ipWhitelist:
            client.ipWhitelist && client.ipWhitelist.length > 0
              ? client.ipWhitelist
              : [""],
        });
      }

      // Load existing access grants from API access list
      try {
        const apiAccessRes = await listApiAccess(clientId);
        const apiAccessList = apiAccessRes?.data?.data || apiAccessRes?.data || [];

        const provIds = new Set<string>();
        const apiIds = new Set<string>();

        if (Array.isArray(apiAccessList)) {
          apiAccessList.forEach((item: any) => {
            // apiId is the provider API ID, providerId is the parent provider
            if (item.apiId) apiIds.add(item.apiId);
            if (item.providerId) provIds.add(item.providerId);
          });
        }

        setSelectedProviders(new Set(provIds));
        setSelectedApis(new Set(apiIds));

        // Load child APIs for each selected provider
        for (const pid of provIds) {
          loadProviderApis(pid);
        }
      } catch {
        // Access control may not exist yet
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("addEditClient.toast.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  const loadProviderApis = async (providerId: string) => {
    if (providerApis[providerId]) return;
    try {
      setLoadingApis((prev) => ({ ...prev, [providerId]: true }));
      const response = await getProviderApisByProvider(providerId);
      const list = response?.data?.data || response?.data || [];
      setProviderApis((prev) => ({
        ...prev,
        [providerId]: Array.isArray(list) ? list : [],
      }));
    } catch {
      setProviderApis((prev) => ({ ...prev, [providerId]: [] }));
    } finally {
      setLoadingApis((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const handleProviderToggle = (providerId: string, checked: boolean) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(providerId);
        loadProviderApis(providerId);
      } else {
        next.delete(providerId);
        // Also uncheck all APIs under this provider
        const apis = providerApis[providerId] || [];
        setSelectedApis((prevApis) => {
          const nextApis = new Set(prevApis);
          apis.forEach((api) => nextApis.delete(api.id));
          return nextApis;
        });
      }
      return next;
    });
  };

  const handleApiToggle = (apiId: string, checked: boolean) => {
    setSelectedApis((prev) => {
      const next = new Set(prev);
      if (checked) next.add(apiId);
      else next.delete(apiId);
      return next;
    });
  };

  const handleSelectAllApis = (providerId: string, checked: boolean) => {
    const apis = providerApis[providerId] || [];
    setSelectedApis((prev) => {
      const next = new Set(prev);
      apis.forEach((api) => {
        if (checked) next.add(api.id);
        else next.delete(api.id);
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!formValues.name.trim()) {
      toast.error(t("addEditClient.toast.nameRequired"));
      return;
    }
    if (!formValues.code.trim()) {
      toast.error(t("addEditClient.toast.codeRequired"));
      return;
    }

    try {
      setIsSaving(true);
      const ipList = formValues.ipWhitelist
        .map((ip) => ip.trim())
        .filter((ip) => ip !== "");

      const body = {
        name: formValues.name.trim(),
        code: formValues.code.trim(),
        description: formValues.description.trim(),
        callbackUrl: formValues.callbackUrl.trim(),
        environment: formValues.environment,
        ipWhitelist: ipList,
      };

      let clientId = id;

      if (isEditMode && id) {
        await updateClient(id, body);
        toast.success(t("addEditClient.toast.updateSuccess"));
      } else {
        const res = await createClient(body);
        const created = res?.data?.data || res?.data;
        clientId = created?.id;
        toast.success(t("addEditClient.toast.createSuccess"));
      }

      // Save access grants if we have a clientId
      if (clientId) {
        await saveAccessGrants(clientId);
      }

      navigate("/ThirdPartyManagement/Clients");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          (isEditMode ? t("addEditClient.toast.updateFailed") : t("addEditClient.toast.createFailed"))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const saveAccessGrants = async (clientId: string) => {
    try {
      // Build providers array: each selected provider with its selected API IDs
      const providersPayload = [...selectedProviders]
        .map((providerId) => {
          const apis = providerApis[providerId] || [];
          const apiIds = apis
            .filter((api) => selectedApis.has(api.id))
            .map((api) => api.id);
          return { providerId, apiIds };
        })
        .filter((p) => p.apiIds.length > 0);

      if (providersPayload.length > 0) {
        await bulkGrantAccess(clientId, {
          clientId,
          environment: "BOTH",
          providers: providersPayload,
        });
      }
    } catch (error: any) {
      console.error("Error saving access grants:", error);
      toast.error(t("addEditClient.toast.accessGrantsFailed"));
    }
  };

  const addIpEntry = () => {
    setFormValues((prev) => ({
      ...prev,
      ipWhitelist: [...prev.ipWhitelist, ""],
    }));
  };

  const removeIpEntry = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter((_, i) => i !== index),
    }));
  };

  const updateIpEntry = (index: number, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.map((ip, i) => (i === index ? value : ip)),
    }));
  };

  if (loading) {
    return (
      <div className="service p-4">
        <p className="text-muted-foreground">{t("addEditClient.loadingClientData")}</p>
      </div>
    );
  }

  return (
    <div className="service p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">
          {isEditMode ? t("addEditClient.titleEdit") : t("addEditClient.titleAdd")}
        </h1>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/ThirdPartyManagement/Clients")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common:back")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("addEditClient.cardClientDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("addEditClient.form.name")}</Label>
              <Input
                placeholder={t("addEditClient.form.namePlaceholder")}
                value={formValues.name}
                onChange={(e) =>
                  setFormValues({ ...formValues, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("addEditClient.form.code")}</Label>
              <Input
                placeholder={t("addEditClient.form.codePlaceholder")}
                value={formValues.code}
                onChange={(e) =>
                  setFormValues({ ...formValues, code: e.target.value })
                }
                disabled={isEditMode}
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label>{t("addEditClient.form.description")}</Label>
              <Input
                placeholder={t("addEditClient.form.descriptionPlaceholder")}
                value={formValues.description}
                onChange={(e) =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("addEditClient.form.callbackUrl")}</Label>
              <Input
                placeholder={t("addEditClient.form.callbackPlaceholder")}
                value={formValues.callbackUrl}
                onChange={(e) =>
                  setFormValues({ ...formValues, callbackUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("addEditClient.form.environment")}</Label>
              <Select
                value={formValues.environment}
                onValueChange={(val) =>
                  setFormValues({ ...formValues, environment: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("addEditClient.form.environmentPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("addEditClient.form.ipWhitelist")}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={addIpEntry}
                >
                  <Plus className="h-3 w-3" />
                  {t("addEditClient.addIp")}
                </Button>
              </div>
              <div className="space-y-2">
                {formValues.ipWhitelist.map((ip, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={t("addEditClient.ipPlaceholder")}
                      value={ip}
                      onChange={(e) => updateIpEntry(index, e.target.value)}
                    />
                    {formValues.ipWhitelist.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIpEntry(index)}
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
        </CardContent>
      </Card>

      {/* Provider & API Access */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("addEditClient.cardProviderApiAccess")}</CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("addEditClient.noProviders")}</p>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
                {providers.map((provider) => {
                  const isChecked = selectedProviders.has(provider.id);
                  const apis = providerApis[provider.id] || [];
                  const isLoadingProviderApis = loadingApis[provider.id];
                  const allApiIds = apis.map((a) => a.id);
                  const allSelected =
                    allApiIds.length > 0 &&
                    allApiIds.every((aid) => selectedApis.has(aid));

                  const providerLabel =
                    (provider as any).name ||
                    (provider as any).providerName ||
                    (provider as any).code ||
                    (provider as any).providerCode ||
                    (provider as any).title ||
                    provider.id;
                  return (
                    <div key={provider.id}>
                      {/* Provider checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleProviderToggle(provider.id, !!checked)
                          }
                        />
                        <span
                          className="text-sm font-medium ms-2"
                          style={{ color: "var(--foreground)" }}
                        >
                          {providerLabel}
                        </span>
                      </label>

                      {/* Child APIs — shown directly below the provider */}
                      {isChecked && (
                        <div className="flex flex-col ms-6 mt-3 space-y-2.5">
                          {isLoadingProviderApis ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              {t("action.loading")}
                            </div>
                          ) : apis.length === 0 ? (
                            <p className="text-xs text-muted-foreground">{t("addEditClient.noApis")}</p>
                          ) : (
                            <>
                              <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox
                                  checked={allSelected}
                                  onCheckedChange={(checked) =>
                                    handleSelectAllApis(provider.id, !!checked)
                                  }
                                />
                                <span className="text-sm font-semibold ms-2">{t("addEditClient.selectAllApis")}</span>
                              </label>
                              {apis.map((api) => {
                                const apiLabel =
                                  (api as any).name ||
                                  (api as any).apiName ||
                                  (api as any).code ||
                                  (api as any).apiCode ||
                                  (api as any).title ||
                                  api.id;
                                return (
                                  <label
                                    key={api.id}
                                    className="flex items-center gap-2.5 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={selectedApis.has(api.id)}
                                      onCheckedChange={(checked) =>
                                        handleApiToggle(api.id, !!checked)
                                      }
                                    />
                                    <span
                                      className="text-sm font-normal ms-2"
                                      style={{ color: "var(--foreground)" }}
                                    >
                                      {apiLabel}
                                    </span>
                                  </label>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 mt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/ThirdPartyManagement/Clients")}
        >
          {t("common:cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving
            ? t("addEditClient.saving")
            : isEditMode
            ? t("addEditClient.updateClient")
            : t("addEditClient.createClient")}
        </Button>
      </div>
    </div>
  );
};

export default AddEditClient;
