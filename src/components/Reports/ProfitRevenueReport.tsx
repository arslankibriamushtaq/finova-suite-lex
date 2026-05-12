import { useEffect, useMemo, useState } from "react";
import { DatePicker, Input as AntInput, Row as AntRow, Col as AntCol } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { getProfitRevenueReport } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import Loader from "../Loader/Loader";

const formatAmount = (n: number | string | undefined | null) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ProfitRevenueReport = () => {
  const [period, setPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [period, pageSize]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const periodParam = period ? period.format("YYYY-MM") : undefined;
      const response = await getProfitRevenueReport(periodParam);
      if (response && response.data) {
        const root = response.data?.data ?? response.data ?? {};
        setResponseData(root);

        // Defensively pick up any list field the backend may return.
        const list =
          root?.details ||
          root?.breakdown ||
          root?.items ||
          root?.records ||
          root?.loans ||
          root?.accounts ||
          [];
        setItems(Array.isArray(list) ? list : []);
      }
    } catch (error: any) {
      console.error("Error fetching profit revenue report:", error);
      toast.error(error?.message || "Failed to fetch report");
      setResponseData(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const filteredItems = useMemo(() => {
    if (!debouncedSearch) return items;
    return items.filter((row: any) => {
      return Object.values(row || {}).some((v) =>
        String(v ?? "").toLowerCase().includes(debouncedSearch)
      );
    });
  }, [items, debouncedSearch]);

  const totalRows = filteredItems.length;
  const totalPage = Math.max(1, Math.ceil(totalRows / pageSize));

  const mappedData = useMemo(
    () =>
      filteredItems
        .slice((page - 1) * pageSize, page * pageSize)
        .map((row: any, index: number) => ({
          Sr: (page - 1) * pageSize + index + 1,
          ...row,
        })),
    [filteredItems, page, pageSize]
  );

  // Build columns from the first row's keys when we have detail rows.
  const columns = useMemo(() => {
    const base = [
      {
        name: "S No",
        selector: (row: any) => row.Sr,
        sortable: true,
        width: "70px",
      },
    ];
    if (!items.length) return base;
    const sample = items[0] || {};
    const keys = Object.keys(sample);
    return [
      ...base,
      ...keys.map((k) => ({
        name: k
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase())
          .trim(),
        selector: (row: any) => {
          const val = row[k];
          if (val == null) return "-";
          if (typeof val === "number") return formatAmount(val);
          return String(val);
        },
        sortable: true,
        wrap: true,
      })),
    ];
  }, [items]);

  const exportToCSV = () => {
    const profitEarned = responseData?.profitEarned ?? 0;
    const profitCollected = responseData?.profitCollected ?? 0;
    const accruedProfit = responseData?.accruedProfit ?? 0;

    const csvLines: string[] = [];
    csvLines.push("Metric,Value");
    csvLines.push(`Profit Earned,${profitEarned}`);
    csvLines.push(`Profit Collected,${profitCollected}`);
    csvLines.push(`Accrued Profit,${accruedProfit}`);

    if (filteredItems.length > 0) {
      csvLines.push("");
      const keys = Object.keys(filteredItems[0] || {});
      csvLines.push(keys.join(","));
      filteredItems.forEach((row: any) => {
        csvLines.push(
          keys
            .map((k) => {
              const val = row[k];
              if (val == null) return "";
              const s = String(val).replace(/"/g, '""');
              return /[",\n]/.test(s) ? `"${s}"` : s;
            })
            .join(",")
        );
      });
    }

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "profit_revenue_report.csv");
  };

  return (
    <>
      {loading && <Loader />}
      <div className="service p-4">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Profit & Revenue Report</h3>
        </div>

        <div
          className="bg-white p-3 mb-3"
          style={{
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="d-flex flex-wrap align-items-center gap-2 w-100">
            <AntInput
              allowClear
              placeholder="Search"
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
            />
            <DatePicker
              value={period}
              onChange={(d) => setPeriod(d)}
              picker="month"
              format="YYYY-MM"
              placeholder="Period"
              style={{ flex: "1 1 180px", minWidth: 160, borderRadius: 8, height: 40, background: "#fff" }}
            />
            <button
              type="button"
              className="theme-btn-next"
              onClick={exportToCSV}
              disabled={!responseData}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Export CSV
            </button>
          </div>
        </div>

        <AntRow gutter={[16, 16]} className="mb-3">
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Profit Earned</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(responseData?.profitEarned)} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Profit Collected</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(responseData?.profitCollected)} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Accrued Profit</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(responseData?.accruedProfit)} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
        </AntRow>

        {items.length > 0 && (
          <div
            className="bg-white"
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            <TableView
              data={mappedData}
              header={columns}
              setPage={setPage}
              page={page}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalRows={totalRows}
              totalPage={totalPage}
              from={totalRows > 0 ? (page - 1) * pageSize + 1 : 0}
              to={Math.min(page * pageSize, totalRows)}
              isLoading={loading}
              paginationShow={true}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ProfitRevenueReport;
