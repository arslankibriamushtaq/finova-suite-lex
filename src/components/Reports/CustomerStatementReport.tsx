import { useEffect, useMemo, useState } from "react";
import { DatePicker, Row as AntRow, Col as AntCol } from "antd";
import TableView from "../TableView/TableView";
import { getCustomerStatementReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

const formatAmount = (n: any) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CustomerStatementReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);
  // Client-side date filter â€” defaulted to current month start/end. Not sent
  // to the API; only used to filter the rows we already have.
  const [fromDate, setFromDate] = useState<any>(dayjs().startOf("month"));
  const [toDate, setToDate] = useState<any>(dayjs().endOf("month"));

  useEffect(() => {
    fetchReportData();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const columns = [
    {
      name: "Date",
      selector: (row: any) => row.date || row.transactionDate || "-",
      cell: (row: any) =>
        row.date || row.transactionDate
          ? dayjs(row.date || row.transactionDate).format("YYYY-MM-DD")
          : "-",
    },
    {
      name: "Description",
      selector: (row: any) =>
        row.description || row.narration || row.entryType || "-",
    },
    {
      name: "Reference",
      selector: (row: any) =>
        row.referenceNo ||
        row.voucherNo ||
        row.transactionId ||
        row.reference ||
        "-",
    },
    {
      name: "Debit",
      selector: (row: any) => row.debit || row.amountDebit || 0,
      cell: (row: any) =>
        `${formatAmount(row.debit || row.amountDebit || 0)} SAR`,
    },
    {
      name: "Credit",
      selector: (row: any) => row.credit || row.amountCredit || 0,
      cell: (row: any) =>
        `${formatAmount(row.credit || row.amountCredit || 0)} SAR`,
    },
    {
      name: "Balance",
      selector: (row: any) => row.balance || row.runningBalance || 0,
      cell: (row: any) => (
        <b>{formatAmount(row.balance || row.runningBalance || 0)} SAR</b>
      ),
    },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Hit the bare endpoint with just the tenant ID â€” no date params.
      const response = await getCustomerStatementReport(TENANT_ID);
      if (response && response.data) {
        const data = response.data.data;
        setTotals(data);

        const entries = data?.entries || [];
        setReportData(Array.isArray(entries) ? entries : []);
      }
    } catch (error: any) {
      console.error("Error fetching customer statement:", error);
      toast.error(error?.message || "Failed to fetch statement");
      setReportData([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filter against the picked date range
  const filteredData = useMemo(() => {
    if (!fromDate && !toDate) return reportData;
    const start = fromDate ? fromDate.startOf("day") : null;
    const end = toDate ? toDate.endOf("day") : null;
    return reportData.filter((row: any) => {
      const raw = row.date || row.transactionDate;
      if (!raw) return false;
      const d = dayjs(raw);
      if (!d.isValid()) return false;
      if (start && d.isBefore(start)) return false;
      if (end && d.isAfter(end)) return false;
      return true;
    });
  }, [reportData, fromDate, toDate]);

  const totalRows = filteredData.length;
  const totalPage = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const fromRow = totalRows > 0 ? startIndex + 1 : 0;
  const toRow = Math.min(startIndex + pageSize, totalRows);

  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Date", "Description", "Reference", "Debit", "Credit", "Balance"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((item: any) =>
        [
          dayjs(item.date || item.transactionDate).format("YYYY-MM-DD"),
          `"${item.description || item.narration || ""}"`,
          `"${item.referenceNo || item.voucherNo || item.transactionId || ""}"`,
          item.debit || item.amountDebit || 0,
          item.credit || item.amountCredit || 0,
          item.balance || item.runningBalance || 0,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Customer_Statement_${dayjs().format("YYYYMMDD")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="service p-4">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Customer Statement</h3>
      </div>

      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <DatePicker
          value={fromDate}
          onChange={(d) => setFromDate(d)}
          format="YYYY-MM-DD"
          placeholder="From Date"
          style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2 }}
        />
        <DatePicker
          value={toDate}
          onChange={(d) => setToDate(d)}
          format="YYYY-MM-DD"
          placeholder="To Date"
          style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2 }}
        />
        <button
          type="button"
          className="theme-btn-next"
          onClick={exportToCSV}
          disabled={!filteredData.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Export CSV
        </button>
        </div>
      </div>

      {totals && (
        <AntRow gutter={[16, 16]} className="mb-3">
          <AntCol xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Opening Balance</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(totals.openingBalance)} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Debits</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(totals.totalDebits)} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Credits</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(totals.totalCredits)} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Closing Balance</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(totals.closingBalance)} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
        </AntRow>
      )}

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
          header={columns}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          from={fromRow}
          to={toRow}
          data={paginatedData}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default CustomerStatementReport;
