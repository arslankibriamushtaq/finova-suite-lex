import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllFraudRules,
  enableFraudRule,
  disableFraudRule,
  updateFraudRuleParameters,
  assignBlockCodeToFraudRule,
  getRiskBlockCodes,
} from "../../../redux/apis/apisRiskManagement";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ChevronDown, Pencil, Plus, Trash2, Link2, ShieldAlert } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { usePermissions, RISK_FRAUD_PERMISSIONS } from "../../../hooks/useProductPermissions";

interface ParamEntry {
  key: string;
  value: string;
  dataType: string;
  description: string;
}

const FraudRuleManagement = () => {
  const { t } = useTranslation("riskManagement");
  const { hasPermission } = usePermissions();
  const canEditFraud = hasPermission(RISK_FRAUD_PERMISSIONS.EDIT);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Edit parameters modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [paramsList, setParamsList] = useState<ParamEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Assign block code modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [blockCodes, setBlockCodes] = useState<any[]>([]);
  const [selectedBlockCodeId, setSelectedBlockCodeId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Debounce search so we don't refetch / re-filter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    getRiskBlockCodes()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
        setBlockCodes(list);
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      if (debouncedSearch) {
        // Backend search support is unverified â€" fetch full set, filter client-side.
        const response = await getAllFraudRules(0, 10000);
        const all: any[] = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];
        const term = debouncedSearch.toLowerCase();
        const filtered = all.filter((item: any) =>
          (item?.ruleId || "").toLowerCase().includes(term) ||
          (item?.scenarioName || "").toLowerCase().includes(term) ||
          (item?.scenarioNameAr || "").toLowerCase().includes(term) ||
          (item?.category || "").toLowerCase().includes(term) ||
          (item?.defaultAction || "").toLowerCase().includes(term) ||
          (item?.status || "").toLowerCase().includes(term)
        );
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        setData(filtered.slice(start, start + pageSize));
        setTotalRows(total);
        setTotalPage(totalPages);
        return;
      }

      // Backend uses 0-based indexing for page
      const response = await getAllFraudRules(page - 1, pageSize);
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);

      const pagination = response?.data?.pagination;
      if (pagination) {
        setTotalRows(pagination.totalElements || 0);
        setTotalPage(pagination.totalPages || 1);
      } else {
        setTotalRows(Array.isArray(list) ? list.length : 0);
        setTotalPage(Math.ceil((Array.isArray(list) ? list.length : 0) / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fraudRule.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (rule: any) => {
    const ruleId = rule.ruleId || rule.id;
    const isActive = rule.status === "ACTIVE";
    try {
      if (isActive) {
        await disableFraudRule(ruleId);
        toast.success(t("fraudRule.toast.ruleDisabled", { ruleId }));
      } else {
        await enableFraudRule(ruleId);
        toast.success(t("fraudRule.toast.ruleEnabled", { ruleId }));
      }
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fraudRule.toast.statusFailed"));
    }
  };

  // Parse parameters â€" JSON string containing array of {key, value, dataType, description}
  const parseParams = (params: any): ParamEntry[] => {
    try {
      const parsed = typeof params === "string" ? JSON.parse(params) : params;
      if (Array.isArray(parsed)) {
        return parsed.map((p: any) => ({
          key: p.key || "",
          value: String(p.value ?? ""),
          dataType: p.dataType || "STRING",
          description: p.description || "",
        }));
      }
      return [];
    } catch {
      return [];
    }
  };

  const handleEditParams = (rule: any) => {
    setSelectedRule(rule);
    const entries = parseParams(rule.parameters);
    setParamsList(entries.length > 0 ? entries : [{ key: "", value: "", dataType: "STRING", description: "" }]);
    setShowEditModal(true);
  };

  const handleSaveParams = async () => {
    if (!selectedRule) return;
    const ruleId = selectedRule.ruleId || selectedRule.id;

    try {
      setIsSaving(true);
      const paramsArray = paramsList
        .filter((p) => p.key.trim())
        .map((p) => ({
          key: p.key.trim(),
          value: p.value,
          dataType: p.dataType || "STRING",
          description: p.description,
        }));

      await updateFraudRuleParameters(ruleId, paramsArray);
      toast.success(t("fraudRule.toast.paramsSuccess"));
      setShowEditModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fraudRule.toast.paramsFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setSelectedRule(null);
    setParamsList([]);
  };

  const handleOpenAssign = (rule: any) => {
    setAssignTarget(rule);
    setSelectedBlockCodeId(rule.blockCode?.id ?? rule.blockCodeId ?? "");
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssignTarget(null);
    setSelectedBlockCodeId("");
  };

  const handleSaveAssign = async () => {
    if (!assignTarget || !selectedBlockCodeId) return;
    const ruleId = assignTarget.id || assignTarget.id;
    try {
      setIsAssigning(true);
      await assignBlockCodeToFraudRule(ruleId, selectedBlockCodeId);
      toast.success(t("fraudRule.toast.assignSuccess"));
      setShowAssignModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fraudRule.toast.assignFailed"));
    } finally {
      setIsAssigning(false);
    }
  };

  const addParam = () => setParamsList([...paramsList, { key: "", value: "", dataType: "STRING", description: "" }]);
  const removeParam = (index: number) => setParamsList(paramsList.filter((_, i) => i !== index));
  const updateParam = (index: number, field: keyof ParamEntry, newValue: string) => {
    const updated = [...paramsList];
    updated[index] = { ...updated[index], [field]: newValue };
    setParamsList(updated);
  };

  const blockCodeMap: Record<string, string> = {};
  blockCodes.forEach((bc: any) => { blockCodeMap[bc.id] = bc.code; });

  const headers = [
    {
      name: t("fraudRule.col.ruleId"),
      selector: (row: any) => row.ruleId || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: t("common:name"),
      selector: (row: any) => row.scenarioName || "-",
      sortable: true,
    },
    {
      name: t("common:category"),
      selector: (row: any) => row.category || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: t("fraudRule.col.priority"),
      selector: (row: any) => row.priority ?? "-",
      sortable: true,
      width: "100px",
    },
    {
      name: t("fraudRule.col.decision"),
      selector: (row: any) => row.defaultAction || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: t("fraudRule.col.detectionLogic"),
      selector: (row: any) => row.detectionLogic || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: t("fraudRule.col.assignedBlockCode"),
      cell: (row: any) => {
        const code = (row.blockCodeId ? blockCodeMap[row.blockCodeId] : null) ?? row.blockCode?.code ?? null;
        return code ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
            {code}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
      width: "200px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.status === "ACTIVE"}
            disabled={!canEditFraud}
            onCheckedChange={() => handleToggleStatus(row)}
          />
          <span className={row.status === "ACTIVE" ? "text-green-600 text-sm font-medium" : "text-red-600 text-sm font-medium"}>
            {row.status || "DISABLED"}
          </span>
        </div>
      ),
      width: "160px",
    },
    {
      name: t("fraudRule.col.action"),
      cell: (row: any) =>
        !canEditFraud ? (
          <span className="text-muted-foreground">-</span>
        ) : (
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
                {t("fraudRule.action.select")}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleEditParams(row);
                }}
              >
                <Pencil className="h-4 w-4" />
                {t("fraudRule.action.editParameters")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleOpenAssign(row);
                }}
              >
                <Link2 className="h-4 w-4" />
                {t("fraudRule.action.assignBlockCode")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        ),
      width: "120px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ShieldAlert className="h-4 w-4" />
          </span>
          {t("fraudRule.title")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <AntInput
          allowClear
          placeholder={t("fraudRule.searchPlaceholder")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        </div>
      </div>

      <div className="pro-card">
        <TableView
        header={headers}
        data={data}
        totalRows={totalRows}
        isLoading={isLoading}
        from={(page - 1) * pageSize + (totalRows > 0 ? 1 : 0)}
        to={Math.min(page * pageSize, totalRows)}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        paginationShow={true}
      />
      </div>

      {/* Edit Parameters Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("fraudRule.editModal.title")}</DialogTitle>
          </DialogHeader>

          {selectedRule && (
            <div className="text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{selectedRule.ruleId}</span>
              {" — "}
              {selectedRule.scenarioName}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold">{t("fraudRule.params.label")}</Label>
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addParam}>
                <Plus className="h-3 w-3" />
                {t("fraudRule.params.add")}
              </Button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {paramsList.map((param, index) => (
                <div key={index} className="p-3 border rounded bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">{t("fraudRule.params.key")}</Label>
                      <Input
                        placeholder={t("fraudRule.params.keyPlaceholder")}
                        value={param.key}
                        onChange={(e) => updateParam(index, "key", e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">{t("fraudRule.params.value")}</Label>
                      <Input
                        placeholder={t("fraudRule.params.valuePlaceholder")}
                        value={param.value}
                        onChange={(e) => updateParam(index, "value", e.target.value)}
                      />
                    </div>
                    <div className="w-[100px] space-y-1">
                      <Label className="text-xs">{t("fraudRule.params.dataType")}</Label>
                      <Input
                        placeholder={t("fraudRule.params.dataTypePlaceholder")}
                        value={param.dataType}
                        onChange={(e) => updateParam(index, "dataType", e.target.value)}
                      />
                    </div>
                    {paramsList.length > 1 && (
                      <div className="pt-5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParam(index)}
                          className="text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("common:description")}</Label>
                    <Input
                      placeholder={t("fraudRule.params.descriptionPlaceholder")}
                      value={param.description}
                      onChange={(e) => updateParam(index, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleSaveParams} disabled={isSaving}>
              {isSaving ? t("fraudRule.save.saving") : t("common:update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Block Code Modal */}
      <Dialog open={showAssignModal} onOpenChange={(open) => !open && closeAssignModal()}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t("fraudRule.assignModal.title")}</DialogTitle>
          </DialogHeader>

          {assignTarget && (
            <div className="text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{assignTarget.ruleId}</span>
              {" — "}
              {assignTarget.scenarioName}
            </div>
          )}

          <div className="space-y-1">
            <Label className="font-semibold">{t("fraudRule.blockCodeLabel")}</Label>
            <Select
              value={selectedBlockCodeId || ""}
              onValueChange={(val) => setSelectedBlockCodeId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("fraudRule.assign.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {blockCodes.map((bc: any) => (
                  <SelectItem key={bc.id} value={String(bc.id)}>
                    {bc.code}{bc.description ? ` — ${bc.description}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeAssignModal} disabled={isAssigning}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleSaveAssign} disabled={isAssigning || !selectedBlockCodeId}>
              {isAssigning ? t("fraudRule.assign.assigning") : t("fraudRule.assign.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FraudRuleManagement;
