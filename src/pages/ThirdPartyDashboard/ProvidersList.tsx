import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Plus, ChevronDown, Pencil, Trash2, Plug } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

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
  const { t } = useTranslation("connector");
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
      toast.error(error?.response?.data?.message || t("providersList.toast.fetchFailed"));
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
      toast.error(t("providersList.validation.codeNameRequired"));
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
        toast.success(t("providersList.toast.updateSuccess"));
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
        toast.success(t("providersList.toast.createSuccess"));
      }

      setIsDialogOpen(false);
      setEditingProvider(null);
      setFormValues(initialFormValues);
      loadProviders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("providersList.toast.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("providersList.deleteConfirm"))) return;
    try {
      await deleteProvider(id);
      toast.success(t("providersList.toast.deleteSuccess"));
      loadProviders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("providersList.toast.deleteFailed"));
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize]);

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
      name: t("providersList.col.code"),
      selector: (row: any) => row.code || "-",
      sortable: true,
    },
    {
      name: t("providersList.col.name"),
      selector: (row: any) => row.name || "-",
      sortable: true,
    },
    {
      name: t("providersList.col.category"),
      selector: (row: any) => row.category || "-",
      sortable: true,
    },
    {
      name: t("providersList.col.authType"),
      selector: (row: any) => row.authType || "-",
      sortable: true,
    },
    {
      name: t("common:status"),
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
      name: t("providersList.col.timeout"),
      selector: (row: any) => row.timeoutMs ?? "-",
      sortable: true,
    },
    {
      name: t("providersList.col.retries"),
      selector: (row: any) => row.retryCount ?? "-",
      sortable: true,
    },
    {
      name: t("providersList.col.action"),
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
                {t("providersList.select")}
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
                  handleDelete(row.id);
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

  return (
    <div className="service providers-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Plug className="h-4 w-4" />
          </span>
          {t("providersList.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("providersList.searchPlaceholder")}
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
            {t("providersList.addProvider")}
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editingProvider ? t("providersList.modalTitleEdit") : t("providersList.modalTitleAdd")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("providersList.form.code")}</Label>
              <Input
                placeholder={t("providersList.form.codePlaceholder")}
                value={formValues.code}
                onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
                disabled={!!editingProvider}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("providersList.form.name")}</Label>
              <Input
                placeholder={t("providersList.form.namePlaceholder")}
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("providersList.form.description")}</Label>
              <Input
                placeholder={t("providersList.form.descriptionPlaceholder")}
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("providersList.form.category")}</Label>
              <Select
                value={formValues.category}
                onValueChange={(val) => setFormValues({ ...formValues, category: val })}
                disabled={!!editingProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("providersList.form.categoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("providersList.form.authType")}</Label>
              <Select
                value={formValues.authType}
                onValueChange={(val) => setFormValues({ ...formValues, authType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("providersList.form.authTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {AUTH_TYPES.map((auth) => (
                    <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("providersList.form.baseUrlDev")}</Label>
              <Input
                placeholder={t("providersList.form.baseUrlDevPlaceholder")}
                value={formValues.baseUrlDev}
                onChange={(e) => setFormValues({ ...formValues, baseUrlDev: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("providersList.form.baseUrlProd")}</Label>
              <Input
                placeholder={t("providersList.form.baseUrlProdPlaceholder")}
                value={formValues.baseUrlProd}
                onChange={(e) => setFormValues({ ...formValues, baseUrlProd: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("providersList.form.timeout")}</Label>
              <Input
                type="number"
                placeholder={t("providersList.form.timeoutPlaceholder")}
                value={formValues.timeoutMs}
                onChange={(e) => setFormValues({ ...formValues, timeoutMs: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("providersList.form.retryCount")}</Label>
              <Input
                type="number"
                placeholder={t("providersList.form.retryPlaceholder")}
                value={formValues.retryCount}
                onChange={(e) => setFormValues({ ...formValues, retryCount: Number(e.target.value) })}
              />
            </div>
            {editingProvider && (
              <div className="space-y-2">
                <Label>{t("providersList.form.status")}</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(val) => setFormValues({ ...formValues, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("providersList.form.statusPlaceholder")} />
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common:cancel")}</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("providersList.saving") : t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={filteredData.slice((page - 1) * pageSize, page * pageSize)}
          totalRows={filteredData.length}
          isLoading={isLoading}
          from={filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0}
          page={page}
          totalPage={Math.max(1, Math.ceil(filteredData.length / pageSize))}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={Math.min(page * pageSize, filteredData.length)}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default ProvidersList;
