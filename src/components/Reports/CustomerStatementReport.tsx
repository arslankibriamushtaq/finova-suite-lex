import { useEffect, useState } from "react";
import { DatePicker, Button, Select } from "antd";
import TableView from "../TableView/TableView";
import { getCustomerStatementReport } from "../../redux/apis/apisCrudLms";
import { getActiveOnboardings } from "../../redux/apis/apisOnboardingService";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const CustomerStatementReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [reportData, setReportData] = useState<any>([]);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setFetchingCustomers(true);
      const response = await getActiveOnboardings();
      const list = response?.data?.data || [];

      const formatted = list.map((c: any) => ({
        label: `${c.fullName || c.name || c.businessName || 'Unknown'} (${c.customerType || 'Customer'})`,
        value: c.customerId || c.id || c.individualId
      })).filter((c: any) => c.value);

      setCustomers(formatted);
      if (formatted.length > 0 && !customerId) {
        setCustomerId(formatted[0].value);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setFetchingCustomers(false);
    }
  };

  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    if (customerId) {
      fetchReportData();
    }
  }, [page, pageSize, customerId, fromDate, toDate]);

  const columns = [
    {
      name: "Date",
      selector: (row: any) => row.date || row.transactionDate || "-",
      cell: (row: any) => row.date || row.transactionDate ? dayjs(row.date || row.transactionDate).format("YYYY-MM-DD") : "-"
    },
    {
      name: "Description",
      selector: (row: any) => row.description || row.narration || row.entryType || "-",
    },
    {
      name: "Reference",
      selector: (row: any) => row.referenceNo || row.voucherNo || row.transactionId || row.reference || "-",
    },
    {
      name: "Debit",
      selector: (row: any) => row.debit || row.amountDebit || 0,
      cell: (row: any) => `${Number(row.debit || row.amountDebit || 0).toLocaleString()} SAR`
    },
    {
      name: "Credit",
      selector: (row: any) => row.credit || row.amountCredit || 0,
      cell: (row: any) => `${Number(row.credit || row.amountCredit || 0).toLocaleString()} SAR`
    },
    {
      name: "Balance",
      selector: (row: any) => row.balance || row.runningBalance || 0,
      cell: (row: any) => <b>{Number(row.balance || row.runningBalance || 0).toLocaleString()} SAR</b>
    },
  ];

  const fetchReportData = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const params: any = {};
      params.fromDate = fromDate ? fromDate.format("YYYY-MM-DD") : "2000-01-01";
      params.toDate = toDate ? toDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");

      const response = await getCustomerStatementReport(customerId, params);
      if (response && response.data) {
        const data = response.data.data;
        setTotals(data);

        const entries = data?.entries || [];
        setReportData(Array.isArray(entries) ? entries : []);

        const totalItems = response?.data?.pageInfo?.totalItems || (Array.isArray(entries) ? entries.length : 0);
        setTotalRows(totalItems);

        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
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

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Date", "Description", "Reference", "Debit", "Credit", "Balance"];
    const csvContent = [
      headers.join(","),
      ...reportData.map((item: any) => [
        dayjs(item.date || item.transactionDate).format("YYYY-MM-DD"),
        `"${item.description || item.narration || ""}"`,
        `"${item.referenceNo || item.voucherNo || item.transactionId || ""}"`,
        item.debit || item.amountDebit || 0,
        item.credit || item.amountCredit || 0,
        item.balance || item.runningBalance || 0,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Customer_Statement_${customerId}_${dayjs().format("YYYYMMDD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <h3 className="mb-0 fw-bold text-dark">Customer Statement</h3>
            {totals?.customerName && (
              <span className="badge bg-light text-dark border p-2">
                {totals.customerName} {totals.nationalId ? `(${totals.nationalId})` : ""}
              </span>
            )}
          </div>
          <div className="d-flex align-items-center gap-3">
            {/* <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border" style={{ minWidth: "300px" }}>
              <label className="mb-0 fw-bold text-muted small uppercase">Customer:</label>
              <Select
                showSearch
                placeholder="Select Customer"
                optionFilterProp="children"
                value={customerId}
                onChange={(v) => setCustomerId(v)}
                loading={fetchingCustomers}
                style={{ width: "100%" }}
                bordered={false}
                options={customers}
              />
            </div> */}
            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border">
              <label className="mb-0 fw-bold text-muted small uppercase">From:</label>
              <DatePicker
                value={fromDate}
                onChange={(d) => setFromDate(d)}
                format="YYYY-MM-DD"
                bordered={false}
                className="p-0"
              />
            </div>
            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border">
              <label className="mb-0 fw-bold text-muted small uppercase">To:</label>
              <DatePicker
                value={toDate}
                onChange={(d) => setToDate(d)}
                format="YYYY-MM-DD"
                bordered={false}
                className="p-0"
              />
            </div>
            <Button
              className="invoice-btn bg-dark text-white"
              onClick={exportToCSV}
              style={{ height: "42px" }}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {totals && (
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Opening Balance</small>
                <h4 className="mb-0 fw-bold">{totals.openingBalance?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Debits</small>
                <h4 className="mb-0 fw-bold text-danger">{totals.totalDebits?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Credits</small>
                <h4 className="mb-0 fw-bold text-success">{totals.totalCredits?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Closing Balance</small>
                <h4 className="mb-0 fw-bold text-dark">{totals.closingBalance?.toLocaleString()} SAR</h4>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="cs-table p-2">
        <TableView
          header={columns}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          data={reportData}
          isLoading={loading}
        />
      </div>
    </>
  );
};

export default CustomerStatementReport;
