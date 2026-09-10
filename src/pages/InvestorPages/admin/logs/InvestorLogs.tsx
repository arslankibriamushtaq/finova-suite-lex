import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Coins, Calculator, Layers, ScrollText, Sigma } from "lucide-react";
import toast from "react-hot-toast";

import TableView from "../../../../components/TableView/TableView";
import { Badge } from "../../../../components/ui/badge";
import { LexMetricTile, LexPageHeader } from "../../../../components/shared/lexKit";
import { TONES } from "../../../../components/shared/detailKitUtils";
import { getAllLogs } from "../../../../redux/apis/apisInvestor";

const InvestorLogs = () => {
  const { t } = useTranslation("investor");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [allLogsData, setAllLogsData] = useState<any>([]);

  useEffect(() => {
    getLogsList();
  }, [page, pageSize]);

  useEffect(() => {
    getAllLogsForSummary();
  }, []);

  // Fetch all logs for summary calculations
  const getAllLogsForSummary = async () => {
    try {
      const response = await getAllLogs(1, 1000); // Fetch large number for summary
      if (response?.success) {
        const hits = response?.data?.hits?.hits || [];
        setAllLogsData(hits);
      }
    } catch (error: any) {
      console.error("Error fetching logs for summary:", error);
    }
  };

  const getLogsList = async () => {
    try {
      setLoading(true);
      const response = await getAllLogs(page, pageSize);
      
      
      if (response?.success) {
        // Handle Elasticsearch response structure
        const hits = response?.data?.hits?.hits || [];
        const totalCount = response?.data?.hits?.total?.value || 0;
        
        
        // Map the Elasticsearch hits to display format
        const mappedData = hits.map((hit: any, index: number) => {
          const source = hit._source || {};
          const context = source.context || {};
          const request = context.request || {};
          const response = context.response || {};
          
          return {
            id: hit._id || `log-${index}`,
            sr: (page - 1) * pageSize + index + 1,
            action: source.message || "-",
            level: source.level || "-",
            channel: source.channel || "-",
            message: source.message || "-",
            timestamp: source.timestamp || source["@timestamp"] || "-",
            traceId: source.trace_id || source.traceId || "-",
            transactionId: source.transaction_id || "-",
            createdAt: source.timestamp || source["@timestamp"] || "-",
            // Request data
            investorId: request.InvestorId || request.investorId || "-",
            investmentId: request.InvesmentId || request.invesmentId || request.investmentId || "-",
            returnAmount: request.ReturnAmount !== undefined ? request.ReturnAmount : (request.returnAmount !== undefined ? request.returnAmount : "-"),
            netReturnAmount: request.NetReturnAmount !== undefined ? request.NetReturnAmount : (request.netReturnAmount !== undefined ? request.netReturnAmount : "-"),
            returnType: request.ReturnType || request.returnType || "-",
            roiRate: request.RoiRate !== undefined ? request.RoiRate : (request.roiRate !== undefined ? request.roiRate : "-"),
            returnStatus: request.ReturnStatus || request.returnStatus || "-",
            returnNotes: request.ReturnNotes || request.returnNotes || "-",
            calculatedDate: request.CalculatedDate || request.calculatedDate || "-",
            approvedDate: request.ApprovedDate || request.approvedDate || "-",
            paidDate: request.PaidDate || request.paidDate || "-",
            taxWithHeld: request.TaxWithHeld !== undefined ? request.TaxWithHeld : (request.taxWithHeld !== undefined ? request.taxWithHeld : "-"),
            taxRate: request.TaxRate !== undefined ? request.TaxRate : (request.taxRate !== undefined ? request.taxRate : "-"),
            // Response data
            responseSuccess: response.success !== undefined ? response.success : "-",
            responseCode: response.responseCode || response.responseCode || "-",
            responseMessage: response.notificationMessage || response.message || "-",
            referenceNo: response.data?.referenceNo || request.referenceNo || "-",
            // Other request fields
            name: request.name || "-",
            code: request.code || "-",
            countryId: request.countryId || "-",
            // Full context for details
            context: context,
            fullSource: source,
          };
        });
        
        setData(mappedData);
        setTotalRows(totalCount);
        setFrom((page - 1) * pageSize + 1);
        setTo(Math.min(page * pageSize, totalCount));
        setTotalPage(Math.ceil(totalCount / pageSize));
      } else {
        const errorMessage = response?.notificationMessage || response?.errors?.[0] || t("ilog.fetchError");
        toast.error(errorMessage);
        setData([]);
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      const errorMessage = error?.notificationMessage || error?.message || t("ilog.fetchError");
      toast.error(errorMessage);
      setLoading(false);
      setData([]);
    }
  };

  /**
   * Thousands separators on the summary figures.
   *
   * They were `toFixed(2)` strings, so a large total rendered as "1234567.89"
   * — readable only by counting digits. No currency symbol is added: these are
   * summed straight from the log payload and nothing in it says what unit they
   * are in, and guessing SAR on a figure this prominent is worse than leaving
   * the reader to know.
   */
  const formatAmount = (value: string | number) =>
    Number(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /** Log level is the one column a reader scans, so it carries a tone. */
  const levelTone = (level: string) => {
    switch (String(level || "").toLowerCase()) {
      case "error":
      case "critical":
      case "fatal":
      case "emergency":
      case "alert":
        return TONES.red;
      case "warning":
      case "warn":
        return TONES.amber;
      case "info":
      case "notice":
        return TONES.sky;
      default:
        return TONES.slate;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    let totalReturnAmount = 0;
    let totalNetReturnAmount = 0;
    let returnCount = 0;

    allLogsData.forEach((hit: any) => {
      const source = hit._source || {};
      const context = source.context || {};
      const request = context.request || {};
      
      if (request.ReturnAmount !== undefined && request.ReturnAmount !== null) {
        totalReturnAmount += parseFloat(request.ReturnAmount) || 0;
        returnCount++;
      }
      
      if (request.NetReturnAmount !== undefined && request.NetReturnAmount !== null) {
        totalNetReturnAmount += parseFloat(request.NetReturnAmount) || 0;
      }
    });

    return {
      totalLogs: totalRows,
      totalReturnAmount: totalReturnAmount.toFixed(2),
      totalNetReturnAmount: totalNetReturnAmount.toFixed(2),
      returnCount: returnCount,
      averageReturnAmount: returnCount > 0 ? (totalReturnAmount / returnCount).toFixed(2) : 0,
    };
  };

  const summary = calculateSummary();

  const Headers = [
    {
      name: t("ilog.col.sr"),
      selector: (row: any) => row.sr || "-",
      sortable: true,
      width: "60px",
    },
    {
      name: t("ilog.col.level"),
      cell: (row: any) =>
        row.level && row.level !== "-" ? (
          <Badge
            variant="outline"
            className={`border font-medium uppercase ${levelTone(row.level)}`}
          >
            {row.level}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortable: true,
      width: "110px",
    },
    {
      name: t("ilog.col.message"),
      selector: (row: any) => row.message || "-",
      sortable: true,
      width: "250px",
    },
    {
      name: t("ilog.col.channel"),
      selector: (row: any) => row.channel || "-",
      sortable: true,
      width: "120px",
    },

    {
      name: t("ilog.col.returnAmount"),
      selector: (row: any) => row.returnAmount !== "-" ? row.returnAmount.toLocaleString() : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: t("ilog.col.netReturnAmount"),
      selector: (row: any) => row.netReturnAmount !== "-" ? row.netReturnAmount.toLocaleString() : "-",
      sortable: true,
      width: "150px",
    },
    {
      name: t("ilog.col.returnType"),
      selector: (row: any) => row.returnType || "-",
      sortable: true,
      width: "100px",
    },
    {
      name: t("ilog.col.roiRate"),
      selector: (row: any) => row.roiRate !== "-" ? `${row.roiRate}%` : "-",
      sortable: true,
      width: "100px",
    },
    {
      name: t("ilog.col.returnStatus"),
      selector: (row: any) => row.returnStatus || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: t("ilog.col.referenceNo"),
      selector: (row: any) => row.referenceNo || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: t("ilog.col.calculatedDate"),
      selector: (row: any) => row.calculatedDate !== "-" ? formatDate(row.calculatedDate) : "-",
      sortable: true,
      width: "180px",
    },
    {
      name: t("ilog.col.approvedDate"),
      selector: (row: any) => row.approvedDate !== "-" ? formatDate(row.approvedDate) : "-",
      sortable: true,
      width: "180px",
    },
    {
      name: t("ilog.col.paidDate"),
      selector: (row: any) => row.paidDate !== "-" ? formatDate(row.paidDate) : "-",
      sortable: true,
      width: "180px",
    },
    {
      name: t("ilog.col.taxWithheld"),
      selector: (row: any) => row.taxWithHeld !== "-" ? row.taxWithHeld.toLocaleString() : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: t("ilog.col.taxRate"),
      selector: (row: any) => row.taxRate !== "-" ? `${row.taxRate}%` : "-",
      sortable: true,
      width: "100px",
    },
    {
      name: t("ilog.col.traceId"),
      selector: (row: any) => row.traceId || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: t("ilog.col.transactionId"),
      selector: (row: any) => row.transactionId || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: t("common:createdAt"),
      selector: (row: any) => formatDate(row.createdAt),
      sortable: true,
      width: "180px",
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={ScrollText} title={t("logs.title")} />

      {/* Bootstrap's grid and `bg-white … text-black` cards, which ignored the
          theme in both directions — invisible text in dark mode, and a white
          card on a page whose other surfaces are tokens. */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t("ilog.totalLogs")}
          icon={Layers}
          tone="sky"
          loading={loading && data.length === 0}
          value={totalRows.toLocaleString()}
        />
        <LexMetricTile
          label={t("ilog.totalReturnAmount")}
          icon={Coins}
          tone="emerald"
          value={formatAmount(summary.totalReturnAmount)}
        />
        <LexMetricTile
          label={t("ilog.totalNetReturnAmount")}
          icon={Sigma}
          tone="slate"
          value={formatAmount(summary.totalNetReturnAmount)}
        />
        <LexMetricTile
          label={t("ilog.averageReturnAmount")}
          icon={Calculator}
          tone="amber"
          value={formatAmount(summary.averageReturnAmount)}
        />
      </div>

      {/* The whole page used to be replaced by a spinner on first load, so the
          heading and the tiles appeared only once the rows had arrived.
          TableView draws its own skeleton rows. */}
      <div className="pro-card p-4">
        <TableView
          header={Headers}
          data={data}
          totalRows={totalRows}
          isLoading={loading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
      </div>
    </div>
  );
};

export default InvestorLogs;
