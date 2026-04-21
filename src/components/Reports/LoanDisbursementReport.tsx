import { useEffect, useState } from "react";
import { DatePicker, Button, Select } from "antd";
import TableView from "../TableView/TableView";
import { getLoanDisbursementReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const LoanDisbursementReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [reportData, setReportData] = useState<any>([]);
  const [fromDate, setFromDate] = useState<any>(dayjs("2026-01-01"));
  const [toDate, setToDate] = useState<any>(dayjs("2026-03-31"));
  const [productCode, setProductCode] = useState<string>("MICROFINANCE");
  const [branch, setBranch] = useState<string>("RIYADH");
  const [status, setStatus] = useState<string>("DISBURSED");
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [page, pageSize]);

  const columns = [
    {
      name: "Loan ID",
      selector: (row: any) => row.loanId || row.id || "-",
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName || row.name || "-",
    },
    {
      name: "Disbursement Date",
      selector: (row: any) => row.disbursementDate || row.date || "-",
      cell: (row: any) => row.disbursementDate || row.date ? dayjs(row.disbursementDate || row.date).format("YYYY-MM-DD") : "-"
    },
    {
      name: "Amount",
      selector: (row: any) => row.amount || row.disbursedAmount || 0,
      cell: (row: any) => <b>{Number(row.amount || row.disbursedAmount || 0).toLocaleString()} SAR</b>
    },
    {
      name: "Product",
      selector: (row: any) => row.productName || row.productCode || "-",
    },
    {
      name: "Branch",
      selector: (row: any) => row.branchName || row.branch || "-",
    },
    {
      name: "Status",
      selector: (row: any) => row.status || "-",
      cell: (row: any) => (
        <span className={`badge ${row.status === 'DISBURSED' ? 'bg-success' : 'bg-secondary'}`}>
          {row.status || "-"}
        </span>
      )
    },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params: any = {
        fromDate: fromDate.format("YYYY-MM-DD"),
        toDate: toDate.format("YYYY-MM-DD"),
        productCode,
        branchOrChannel: branch,
        status
      };
      
      const response = await getLoanDisbursementReport(params);
      if (response && response.data) {
        const data = response.data.data;
        let totalItems = 0;
        
        if (data && !Array.isArray(data) && data.items) {
          // Response with summary and items
          setTotals(data);
          const items = data.items || [];
          setReportData(items);
          totalItems = data.pageInfo?.totalItems || items.length;
          setTotalRows(totalItems);
        } else {
          // Direct array response
          const list = Array.isArray(data) ? data : (data?.items || []);
          setReportData(list);
          setTotals(data && !Array.isArray(data) ? data : null);
          totalItems = list.length;
          setTotalRows(totalItems);
        }

        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      console.error("Error fetching disbursement report:", error);
      toast.error(error?.message || "Failed to fetch report");
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

    const headers = ["Loan ID", "Customer Name", "Date", "Amount", "Product", "Branch", "Status"];
    const csvContent = [
      headers.join(","),
      ...reportData.map((item: any) => [
        `"${item.loanId || item.id || ""}"`,
        `"${item.customerName || item.name || ""}"`,
        item.disbursementDate || item.date || "",
        item.amount || item.disbursedAmount || 0,
        `"${item.productName || item.productCode || ""}"`,
        `"${item.branchName || item.branch || ""}"`,
        `"${item.status || ""}"`,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Loan_Disbursement_Report_${dayjs().format("YYYYMMDD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Loan Disbursement Report</h3>
          <Button 
            className="invoice-btn bg-dark text-white" 
            onClick={exportToCSV}
            style={{ height: "42px" }}
          >
            Export CSV
          </Button>
        </div>

        <div className="bg-white p-3 rounded border mb-4 shadow-sm">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="mb-1 fw-bold text-muted small uppercase">From Date</label>
              <DatePicker 
                value={fromDate} 
                onChange={(d) => setFromDate(d)} 
                format="YYYY-MM-DD"
                allowClear={false}
                className="w-100"
              />
            </div>
            <div className="col-md-2">
              <label className="mb-1 fw-bold text-muted small uppercase">To Date</label>
              <DatePicker 
                value={toDate} 
                onChange={(d) => setToDate(d)} 
                format="YYYY-MM-DD"
                allowClear={false}
                className="w-100"
              />
            </div>
            <div className="col-md-2">
              <label className="mb-1 fw-bold text-muted small uppercase">Product</label>
              <Select 
                value={productCode} 
                onChange={(v) => setProductCode(v)}
                className="w-100"
                options={[
                  { label: "Microfinance", value: "MICROFINANCE" },
                  { label: "SME Loan", value: "SME" },
                  { label: "Personal Loan", value: "PERSONAL" },
                ]}
              />
            </div>
            <div className="col-md-2">
              <label className="mb-1 fw-bold text-muted small uppercase">Branch</label>
              <Select 
                value={branch} 
                onChange={(v) => setBranch(v)}
                className="w-100"
                options={[
                  { label: "Riyadh", value: "RIYADH" },
                  { label: "Jeddah", value: "JEDDAH" },
                  { label: "Dammam", value: "DAMMAM" },
                ]}
              />
            </div>
            <div className="col-md-2">
              <label className="mb-1 fw-bold text-muted small uppercase">Status</label>
              <Select 
                value={status} 
                onChange={(v) => setStatus(v)}
                className="w-100"
                options={[
                  { label: "Disbursed", value: "DISBURSED" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Cancelled", value: "CANCELLED" },
                ]}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <Button 
                className="theme-btn-next w-100" 
                onClick={fetchReportData} 
                loading={loading}
                style={{ height: "38px" }}
              >
                Fetch Data
              </Button>
            </div>
          </div>
        </div>

        {totals && (
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Disbursed Amount</small>
                <h4 className="mb-0 fw-bold text-primary">{(totals.totalAmount || totals.totalDisbursedAmount || 0).toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Loan Count</small>
                <h4 className="mb-0 fw-bold text-success">{(totals.totalCount || totals.loanCount || reportData.length).toLocaleString()}</h4>
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

export default LoanDisbursementReport;
