import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  ChevronDown,
  Plus,
  CreditCard,
  Eye,
  Lock,
  Unlock,
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
  isPhysical,
} from "./cardConstants";
import IssueCardDialog from "./components/IssueCardDialog";
import CardDetailDialog from "./components/CardDetailDialog";
import LimitsDialog from "./components/LimitsDialog";
import TrackingDialog from "./components/TrackingDialog";

const ALL = "all";

const CardsList = () => {
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
  const [detailId, setDetailId] = useState<string | null>(null);
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
      if (!error?.response?.data?.message) toast.error("Failed to fetch cards");
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
      if (!error?.response?.data?.message) toast.error("Action failed");
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
      name: "Reference",
      selector: (row: any) => row.cardReference || "-",
      sortable: true,
    },
    {
      name: "Cardholder",
      selector: (row: any) => row.cardholderName || "-",
      sortable: true,
    },
    {
      name: "Type",
      cell: (row: any) => CARD_TYPE_LABELS[row.cardType] || prettyEnum(row.cardType),
    },
    {
      name: "Tier",
      cell: (row: any) => prettyEnum(row.tier),
    },
    {
      name: "Masked PAN",
      selector: (row: any) => row.maskedPan || "-",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${cardStatusClasses(row.status)}`}
        >
          {prettyEnum(row.status)}
        </span>
      ),
    },
    {
      name: "Shipment",
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
                disabled={actioningId === row.id}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
              >
                Select
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setDetailId(row.id);
                }}
              >
                <Eye className="h-4 w-4" />
                View details
              </DropdownMenuItem>

              {isPhysical(row.cardType) && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setTrackingId(row.id);
                  }}
                >
                  <Truck className="h-4 w-4" />
                  Tracking
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLimitsCard(row);
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Edit limits
              </DropdownMenuItem>

              {row.status === "BLOCKED" ? (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    runAction(row.id, unblockAdminCard, "Card unblocked");
                  }}
                >
                  <Unlock className="h-4 w-4" />
                  Unfreeze
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    runAction(row.id, blockAdminCard, "Card frozen");
                  }}
                  disabled={row.status === "CANCELLED" || row.status === "EXPIRED"}
                >
                  <Lock className="h-4 w-4" />
                  Freeze
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  runAction(row.id, cancelAdminCard, "Card cancelled");
                }}
                disabled={row.status === "CANCELLED"}
              >
                <XCircle className="h-4 w-4" />
                Cancel
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
          Cards
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search reference, name, PAN, tracking..."
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 220, borderRadius: 2, height: 40 }}
          />
          {filterSelect(statusFilter, setStatusFilter, "All Statuses", CARD_STATUSES)}
          {filterSelect(typeFilter, setTypeFilter, "All Types", CARD_TYPES, CARD_TYPE_LABELS)}
          {filterSelect(tierFilter, setTierFilter, "All Tiers", CARD_TIERS)}
          {filterSelect(
            shipmentFilter,
            setShipmentFilter,
            "All Shipments",
            SHIPMENT_STATUSES,
            SHIPMENT_STATUS_LABELS
          )}
          {anyFilterActive && (
            <Button variant="outline" style={{ height: 40 }} onClick={resetFilters}>
              Reset
            </Button>
          )}
          <Button
            className="gap-2"
            onClick={() => setShowIssue(true)}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto" }}
          >
            <Plus className="h-4 w-4" />
            Add New Card
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
      <CardDetailDialog cardId={detailId} onOpenChange={() => setDetailId(null)} />
      <LimitsDialog card={limitsCard} onOpenChange={() => setLimitsCard(null)} onUpdated={fetchData} />
      <TrackingDialog cardId={trackingId} onOpenChange={() => setTrackingId(null)} onAdvanced={fetchData} />
    </div>
  );
};

export default CardsList;
