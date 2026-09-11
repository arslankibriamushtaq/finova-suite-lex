import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Receipt, ShieldCheck, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

import {
  getKycByInvestorId,
  getKybByInvestorId,
  getTransactionHistoryByInvestorId,
} from "../../../../redux/apis/apisInvestor";
import TableView from "../../../../components/TableView/TableView";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Tabs, TabsContent } from "../../../../components/ui/tabs";
import {
  Block,
  DetailTabsList,
  DetailTabsTrigger,
  EmptyState,
  Field,
  TabSkeleton,
} from "../../../../components/shared/detailKit";
import { TONES } from "../../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader } from "../../../../components/shared/lexKit";

const formatMoney = (amount?: number) =>
  `SAR ${Number(amount ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Fields the record carries that this screen does not show: internal ids the
 * operator cannot act on, and the raw image blob.
 */
const HIDDEN_FIELDS = new Set([
  "profileimage",
  "profile_image",
  "countryid",
  "country_id",
  "verificationstatus",
  "verification_status",
  "language",
  "issuancecountryid",
  "issuance_country_id",
  "timezone",
  "time_zone",
  "currencyid",
  "currency_id",
  "verificationstatusid",
  "verification_status_id",
  "lastlogin",
  "last_login",
]);

/** `dateOfBirth` → `Date Of Birth`. The API key is the only label we have. */
const labelFor = (key: string) =>
  (key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")).replace(/\s+/g, " ").trim();

const KycKybDetail = () => {
  const { t } = useTranslation("investor");
  const { investorId } = useParams<{ investorId: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") as "kyc" | "kyb";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [tab, setTab] = useState("details");

  const fetchDetailData = useCallback(async () => {
    if (!investorId) return;
    try {
      setLoading(true);
      setError(null);
      const response =
        type === "kyc"
          ? await getKycByInvestorId(investorId)
          : await getKybByInvestorId(investorId);

      if (response?.success) {
        setDetailData(response.data || {});
      } else {
        const message = response?.notificationMessage || t("kkd.fetchError");
        setError(message);
        toast.error(message);
      }
    } catch (err: any) {
      const message = err?.notificationMessage || err?.message || t("kkd.fetchError");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [investorId, type, t]);

  const fetchTransactions = useCallback(async () => {
    if (!investorId) return;
    try {
      setTransactionsLoading(true);
      const response = await getTransactionHistoryByInvestorId(investorId);
      if (response?.success) {
        const data = response.data || [];
        setTransactions(Array.isArray(data) ? data : []);
        setTransactionsLoaded(true);
      } else {
        toast.error(response?.notificationMessage || t("kkd.txFetchError"));
      }
    } catch (err: any) {
      toast.error(err?.notificationMessage || err?.message || t("kkd.txFetchError"));
    } finally {
      setTransactionsLoading(false);
    }
  }, [investorId, t]);

  useEffect(() => {
    fetchDetailData();
  }, [fetchDetailData]);

  /* The history was behind a "View All Transactions" button that replaced
     itself with the table. Opening the tab is the same intent, so the tab is
     the trigger — and it still only fetches once. */
  useEffect(() => {
    if (tab === "transactions" && !transactionsLoaded && !transactionsLoading) {
      fetchTransactions();
    }
  }, [tab, transactionsLoaded, transactionsLoading, fetchTransactions]);

  /* TransactionType: 0=Deposit … 6=Return. */
  const TX_TYPE_KEYS = [
    "kkd.txType.deposit",
    "kkd.txType.withdrawal",
    "kkd.txType.transfer",
    "kkd.txType.payment",
    "kkd.txType.refund",
    "kkd.txType.investment",
    "kkd.txType.return",
  ];

  /**
   * TransactionStatus: 0=Pending … 4=Reversed.
   *
   * These were five inline background colours, two of which (Failed and
   * Reversed) were both reds a shade apart, and Completed was a green the
   * brand does not have. Five statuses now read as five distinct tones.
   */
  const TX_STATUS = [
    { key: "kkd.txStatus.pending", tone: TONES.amber },
    { key: "kkd.txStatus.completed", tone: TONES.emerald },
    { key: "kkd.txStatus.failed", tone: TONES.red },
    { key: "kkd.txStatus.cancelled", tone: TONES.slate },
    { key: "kkd.txStatus.reversed", tone: TONES.sky },
  ];

  const transactionHeaders = [
    {
      name: t("kkd.col.txId"),
      cell: (row: any) => (
        <span className="truncate font-mono text-xs text-muted-foreground">{row.id || "—"}</span>
      ),
      width: "220px",
    },
    {
      name: t("kkd.col.txType"),
      cell: (row: any) => {
        const raw = row.transactionType ?? row.type;
        const value = typeof raw === "number" ? raw : parseInt(raw, 10);
        if (raw === undefined || raw === null || Number.isNaN(value)) {
          return <span className="text-sm">{raw?.toString() || "—"}</span>;
        }
        return (
          <span className="text-sm text-foreground">
            {TX_TYPE_KEYS[value] ? t(TX_TYPE_KEYS[value]) : t("kkd.txType.unknown")}
          </span>
        );
      },
      width: "160px",
    },
    {
      name: t("common:amount"),
      cell: (row: any) => (
        <span className="text-sm font-medium tabular-nums text-foreground">
          {row.amount === undefined || row.amount === null ? "—" : formatMoney(row.amount)}
        </span>
      ),
      width: "160px",
    },
    {
      name: t("common:description"),
      cell: (row: any) => (
        <span className="truncate text-sm text-muted-foreground">{row.description || "—"}</span>
      ),
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const raw = row.status;
        const value = typeof raw === "number" ? raw : parseInt(raw, 10);
        const entry = TX_STATUS[Number.isNaN(value) ? 0 : value];
        if (!entry) return <span className="text-sm">{raw?.toString() || "—"}</span>;
        return (
          <Badge variant="outline" className={`border font-medium ${entry.tone}`}>
            {t(entry.key)}
          </Badge>
        );
      },
      width: "140px",
    },
    {
      name: t("common:createdAt"),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
        </span>
      ),
      width: "190px",
    },
  ];

  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? t("common:yes") : t("common:no");

    const lower = key.toLowerCase();

    if (typeof value === "object") {
      // A nested object used to be dumped as JSON.stringify into the value
      // column. Kept readable rather than pretty: it is still raw, but it no
      // longer stretches the row.
      return (
        <span className="font-mono text-[11px] leading-relaxed text-muted-foreground">
          {JSON.stringify(value)}
        </span>
      );
    }
    if (typeof value === "number" && lower.includes("amount")) return formatMoney(value);
    if (lower.includes("employeedesignation") || lower.includes("employee_designation")) {
      /* The enum comment on this switch said 0=Intern, 1=JuniorDeveloper … but
         the branches mapped 0=CEO, 1=CFO, 2=Director, and a second unreachable
         `case 0` meant Manager was never reached. Only these four labels exist
         in the locale file, so the order below is the reachable half of what
         was there — worth confirming against the service's enum. */
      const designations = ["kkd.desig.ceo", "kkd.desig.cfo", "kkd.desig.director", "kkd.desig.manager"];
      const index = typeof value === "number" ? value : parseInt(value, 10);
      return designations[index] ? t(designations[index]) : value?.toString() || "—";
    }
    if (lower.includes("date") || lower.endsWith("at")) {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
    }
    return String(value);
  };

  const fields = detailData
    ? Object.keys(detailData).filter((key) => !HIDDEN_FIELDS.has(key.toLowerCase()))
    : [];

  return (
    <div className="service">
      <LexPageHeader
        icon={type === "kyc" ? UserCheck : ShieldCheck}
        title={type === "kyc" ? t("kkd.kycDetail") : t("kkd.kybDetail")}
        subtitle={t("kkd.subtitle")}
      >
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/InvestorDashboard/Investors")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("kycd.backToInvestors")}
        </Button>
      </LexPageHeader>

      {error && (
        <LexNotice tone="red" icon={AlertTriangle}>
          {error}
        </LexNotice>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <DetailTabsList>
          <DetailTabsTrigger value="details">{t("kkd.tab.details")}</DetailTabsTrigger>
          <DetailTabsTrigger value="transactions">{t("kkd.tab.transactions")}</DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="details" className="mt-3">
          {loading ? (
            <TabSkeleton variant="fields" />
          ) : fields.length === 0 ? (
            <Block title={t("kkd.investorInfo")} icon={UserCheck}>
              <EmptyState icon={UserCheck} text={t("kkd.noDetails")} />
            </Block>
          ) : (
            <Block title={t("kkd.investorInfo")} icon={UserCheck}>
              {/* Two columns on wide screens, one on a phone — the old
                  Descriptions grid collapsed the same way. */}
              <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
                {fields.map((key) => (
                  <Field key={key} label={labelFor(key)} value={renderValue(key, detailData[key])} />
                ))}
              </div>
            </Block>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-3">
          <Block title={t("kkd.transactionHistory")} icon={Receipt}>
            {!transactionsLoading && transactionsLoaded && transactions.length === 0 ? (
              <EmptyState icon={Receipt} text={t("kkd.noTransactions")} />
            ) : (
              <TableView
                header={transactionHeaders}
                data={transactions}
                totalRows={transactions.length}
                isLoading={transactionsLoading}
                from={transactions.length ? 1 : 0}
                page={1}
                totalPage={1}
                setPage={() => {}}
                pageSize={transactions.length || 10}
                setPageSize={() => {}}
                to={transactions.length}
              />
            )}
          </Block>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KycKybDetail;
