import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import { Switch } from "../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  getInternalChecksConfigs,
  updateInternalCheckConfig,
  getRiskBlockCodes,
} from "../../../redux/apis/apisRiskManagement";

const InternalChecksConfig = () => {
  const { t } = useTranslation("riskManagement");
  const [isLoading, setIsLoading] = useState(false);
  const [configs, setConfigs] = useState<any[]>([]);
  const [blockCodes, setBlockCodes] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
    getRiskBlockCodes()
      .then((res) => {
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setBlockCodes(list);
      })
      .catch(() => {});
  }, []);

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const res = await getInternalChecksConfigs();
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setConfigs(list);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("internalChecks.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (config: any) => {
    setUpdatingId(config.id);
    try {
      await updateInternalCheckConfig(config.id, { active: !config.active });
      setConfigs((prev) =>
        prev.map((c) => (c.id === config.id ? { ...c, active: !c.active } : c))
      );
      toast.success(
        !config.active
          ? t("internalChecks.toast.enabled", { name: config.displayName })
          : t("internalChecks.toast.disabled", { name: config.displayName })
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("internalChecks.toast.updateFailed"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBlockCodeChange = async (config: any, value: string) => {
    const blockCodeId = value === "none" ? null : value;
    setUpdatingId(config.id);
    try {
      await updateInternalCheckConfig(config.id, { blockCodeId });
      setConfigs((prev) =>
        prev.map((c) => (c.id === config.id ? { ...c, blockCodeId } : c))
      );
      toast.success(t("internalChecks.toast.blockCodeUpdated"));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("internalChecks.toast.blockCodeFailed"));
    } finally {
      setUpdatingId(null);
    }
  };

  const headers = [
    {
      name: "#",
      cell: (_row: any, index: number) => index + 1,
      width: "60px",
    },
    {
      name: t("internalChecks.col.checkName"),
      selector: (row: any) => row.displayName || row.checkName || "-",
      sortable: true,
    },
    {
      name: t("common:description"),
      selector: (row: any) => row.description || "-",
      sortable: false,
      wrap: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const isBusy = updatingId === row.id;
        return (
          <div className="status-cell">
            <Switch
              checked={row.active}
              onCheckedChange={() => handleToggle(row)}
              disabled={isBusy}
            />
            <span className={`status-pill ${row.active ? "active" : "inactive"}`}>
              {row.active ? t("common:enabled") : t("common:disabled")}
            </span>
          </div>
        );
      },
      width: "180px",
    },
    {
      name: t("internalChecks.col.blockCodeOnFail"),
      cell: (row: any) => {
        const isBusy = updatingId === row.id;
        const currentVal = row.blockCodeId ? String(row.blockCodeId) : "none";
        return (
          <Select
            value={currentVal}
            onValueChange={(val) => handleBlockCodeChange(row, val)}
            disabled={isBusy}
          >
            <SelectTrigger className="h-8 text-xs w-[180px]">
              <SelectValue placeholder={t("common:none")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("common:none")}</SelectItem>
              {blockCodes.map((bc: any) => (
                <SelectItem key={bc.id} value={String(bc.id)}>
                  {bc.code}
                  {bc.description ? ` - ${bc.description}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
      width: "220px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ShieldCheck className="h-4 w-4" />
          </span>
          {t("internalChecks.title")}
        </h3>
      </div>

      <div
        className="bg-white"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          header={headers}
          data={configs}
          totalRows={configs.length}
          isLoading={isLoading}
          from={configs.length > 0 ? 1 : 0}
          to={configs.length}
          page={1}
          totalPage={1}
          setPage={() => {}}
          pageSize={configs.length || 20}
          setPageSize={() => {}}
          paginationShow={false}
        />
      </div>
    </div>
  );
};

export default InternalChecksConfig;
