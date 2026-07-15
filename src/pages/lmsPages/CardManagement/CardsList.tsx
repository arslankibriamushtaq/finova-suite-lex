import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  ChevronDown,
  Plus,
  CreditCard,
  Eye,
  Snowflake,
  Ban,
  ShieldCheck,
  XCircle,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  getAllAdminCards,
  freezeAdminCard,
  unfreezeAdminCard,
  blockAdminCard,
  unblockAdminCard,
  cancelAdminCard,
} from "../../../redux/apis/apisCardManagement";
import {
  CARD_STATUSES,
  CARD_TYPES,
  CARD_TIERS,
  SHIPMENT_STATUSES,
  CARD_TYPE_LABELS,
  SHIPMENT_STATUS_LABELS,
  cardStatusClasses,
  shipmentStatusClasses,
  prettyEnum,
} from "./cardConstants";
import IssueCardDialog from "./components/IssueCardDialog";
import LimitsDialog from "./components/LimitsDialog";
import TrackingDialog from "./components/TrackingDialog";

const ALL = "all";

const CardsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("cardManagement");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [tierFilter, setTierFilter] = useState(ALL);
  const [shipmentFilter, setShipmentFilter] = useState(ALL);

  // Dialog state
  const [showIssue, setShowIssue] = useState(false);
  const [limitsCard, setLimitsCard] = useState<any | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchTerm, statusFilter, typeFilter, tierFilter, shipmentFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getAllAdminCards({
        page: page - 1,
        size: pageSize,
        sort: "createdAt,desc",
        search: searchTerm || undefined,
        status: statusFilter !== ALL ? statusFilter : undefined,
        cardType: typeFilter !== ALL ? typeFilter : undefined,
        tier: tierFilter !== ALL ? tierFilter : undefined,
        shipmentStatus: shipmentFilter !== ALL ? shipmentFilter : undefined,
      });

      // Envelope: { data: [...cards], pagination: {...}, message, timestamp }.
      // Fall back to a nested `content` shape just in case.
      const body = response?.data ?? {};
      const list = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.data?.content)
        ? body.data.content
        : Array.isArray(body?.content)
        ? body.content
        : [];
      setData(list);

      const pagination = body?.pagination ?? body?.data?.pagination;
      const total = pagination?.totalElements ?? list.length;
      setTotalRows(total);
      setTotalPage(Math.ceil(total / pageSize) || 1);
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error(t("list.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const runAction = async (
    id: string,
    action: (id: string) => Promise<any>,
    successMsg: string
  ) => {
    try {
      setActioningId(id);
      await action(id);
      toast.success(successMsg);
      fetchData();
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error(t("toast.actionFailed"));
    } finally {
      setActioningId(null);
    }
  };

  const resetFilters = () => {
    setStatusFilter(ALL);
    setTypeFilter(ALL);
    setTierFilter(ALL);
    setShipmentFilter(ALL);
    setSearchTerm("");
    setPage(1);
  };

  const anyFilterActive =
    statusFilter !== ALL ||
    typeFilter !== ALL ||
    tierFilter !== ALL ||
    shipmentFilter !== ALL ||
    !!searchTerm;

  const headers = [
    {
      name: t("list.col.reference"),
      selector: (row: any) => row.cardReference || "-",
      sortable: true,
    },
    {
      name: t("list.col.cardholder"),
      selector: (row: any) => row.cardholderName || "-",
      sortable: true,
    },
    {
      name: t("common:type"),
      cell: (row: any) => CARD_TYPE_LABELS[row.cardType] || prettyEnum(row.cardType),
    },
    {
      name: t("list.col.tier"),
      cell: (row: any) => prettyEnum(row.tier),
    },
    {
      name: t("list.col.maskedPan"),
      selector: (row: any) => row.maskedPan || "-",
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${cardStatusClasses(row.status)}`}
        >
          {prettyEnum(row.status)}
        </span>
      ),
    },
    {
      name: t("list.col.shipment"),
      cell: (row: any) =>
        row.shipmentStatus ? (
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${shipmentStatusClasses(
              row.shipmentStatus
            )}`}
          >
            {SHIPMENT_STATUS_LABELS[row.shipmentStatus] || prettyEnum(row.shipmentStatus)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      name: t("list.col.action"),
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
                disabled={actioningId === row.id}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {t("common:select")}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/CardManagement/Cards/${row.id}`);
                }}
              >
                <Eye className="h-4 w-4" />
                {t("common:viewDetails")}
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setTrackingId(row.id);
                }}
              >
                <Truck className="h-4 w-4" />
                {t("list.action.tracking")}
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLimitsCard(row);
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("list.action.editLimits")}
              </DropdownMenuItem>

              {/* Soft freeze — a reversible hold (ACTIVE ⇄ FROZEN) */}
              {row.status === "FROZEN" ? (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    runAction(row.id, unfreezeAdminCard, t("list.toast.cardUnfrozen"));
                  }}
                >
                  <Snowflake className="h-4 w-4" />
                  {t("list.action.unfreeze")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    runAction(row.id, freezeAdminCard, t("list.toast.cardFrozen"));
                  }}
                  disabled={row.status !== "ACTIVE"}
                >
                  <Snowflake className="h-4 w-4" />
                  {t("list.action.freeze")}
                </DropdownMenuItem>
              )}

              {/* Hard block — admin-only, for lost/fraud (ACTIVE/FROZEN → BLOCKED) */}
              {row.status === "BLOCKED" ? (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    runAction(row.id, unblockAdminCard, t("list.toast.cardUnblocked"));
                  }}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t("common:unblock")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    runAction(row.id, blockAdminCard, t("list.toast.cardBlocked"));
                  }}
                  disabled={row.status === "CANCELLED" || row.status === "EXPIRED"}
                >
                  <Ban className="h-4 w-4" />
                  {t("common:block")}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  runAction(row.id, cancelAdminCard, t("list.toast.cardCancelled"));
                }}
                disabled={row.status === "CANCELLED"}
              >
                <XCircle className="h-4 w-4" />
                {t("common:cancel")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  const filterSelect = (
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    options: readonly string[],
    labels?: Record<string, string>
  ) => (
    <Select
      value={value}
      onValueChange={(v) => {
        onChange(v);
        setPage(1);
      }}
    >
      <SelectTrigger className="h-10 w-[160px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {labels?.[opt] || prettyEnum(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="service card-list-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <CreditCard className="h-4 w-4" />
          </span>
          {t("list.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("list.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 220, borderRadius: 2, height: 40 }}
          />
          {filterSelect(statusFilter, setStatusFilter, t("list.filter.allStatuses"), CARD_STATUSES)}
          {filterSelect(typeFilter, setTypeFilter, t("list.filter.allTypes"), CARD_TYPES, CARD_TYPE_LABELS)}
          {filterSelect(tierFilter, setTierFilter, t("list.filter.allTiers"), CARD_TIERS)}
          {filterSelect(
            shipmentFilter,
            setShipmentFilter,
            t("list.filter.allShipments"),
            SHIPMENT_STATUSES,
            SHIPMENT_STATUS_LABELS
          )}
          {anyFilterActive && (
            <Button variant="outline" style={{ height: 40 }} onClick={resetFilters}>
              {t("common:reset")}
            </Button>
          )}
          <Button
            className="gap-2"
            onClick={() => setShowIssue(true)}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto" }}
          >
            <Plus className="h-4 w-4" />
            {t("list.addNewCard")}
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={data}
          totalRows={totalRows}
          isLoading={isLoading}
          from={(page - 1) * pageSize + 1}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={Math.min(page * pageSize, totalRows)}
        />
      </div>

      <IssueCardDialog open={showIssue} onOpenChange={setShowIssue} onIssued={fetchData} />
      <LimitsDialog card={limitsCard} onOpenChange={() => setLimitsCard(null)} onUpdated={fetchData} />
      <TrackingDialog cardId={trackingId} onOpenChange={() => setTrackingId(null)} onAdvanced={fetchData} />
    </div>
  );
};

export default CardsList;
