import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Input, Button, Select } from "antd";
import toast from "react-hot-toast";
import {
  getLoanBalanceReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const { Option } = Select;

const LoanBalanceReport = () => {
  const [asOfDate, setAsOfDate] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [productCode, setProductCode] = useState<string>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const params: any = {};
      params.asOfDate = asOfDate || dayjs().format("YYYY-MM-DD");
      if (customerId) params.customerId = customerId;
      if (productCode) params.productCode = productCode;

      const res = await getLoanBalanceReport(params);
      if (res && res.data) {
        const responseData = res.data.data;
        let items = [];
        if (Array.isArray(responseData)) {
          items = responseData;
        } else if (responseData && responseData.content && Array.isArray(responseData.content)) {
          items = responseData.content;
        } else if (responseData && responseData.items && Array.isArray(responseData.items)) {
          items = responseData.items;
        } else if (responseData && typeof responseData === 'object') {
          // If it's a single object, wrap it in an array
          items = [responseData];
        }
        
        setAllCallActivity(items);
        setTotalRows(responseData?.totalElements || items.length);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch loan balance report");
      setAllCallActivity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSubmit();
  }, [asOfDate, customerId, productCode]);

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number"
      ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount;
  };

  const mappedData = (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => ({
    customerName: item.customerName || "-",
    loanId: item.loanId || "-",
    disbursedAmount: formatCurrency(item.disbursedAmount ?? 0),
    totalPaid: formatCurrency(item.totalPaid ?? 0),
    principalOutstanding: formatCurrency(item.principalOutstanding ?? 0),
    profitOutstanding: formatCurrency(item.profitOutstanding ?? 0),
    penaltiesOutstanding: formatCurrency(item.penaltiesOutstanding ?? 0),
    totalOutstanding: formatCurrency((item.principalOutstanding ?? 0) + (item.profitOutstanding ?? 0) + (item.penaltiesOutstanding ?? 0)),
    nextDueDate: item.nextDueDate ? formatDate(item.nextDueDate) : "-",
    status: item.loanStatus || item.status || "-",
  }));

  useEffect(() => {
    handleSubmit();
  }, []);

  const Call_Activity_Header = [
    { name: "Customer Name", selector: (row: any) => row.customerName },
    { name: "Disbursed Amount", selector: (row: any) => row.disbursedAmount },
    { name: "Total Paid", selector: (row: any) => row.totalPaid },
    { name: "Principal Outstanding", selector: (row: any) => row.principalOutstanding },
    { name: "Profit Outstanding", selector: (row: any) => row.profitOutstanding },
    { name: "Total Outstanding", selector: (row: any) => row.totalOutstanding },
    { name: "Next Due Date", selector: (row: any) => row.nextDueDate },
    {
      name: "Status",
      cell: (row: any) => {
        const color = (() => {
          switch (row.status?.toLowerCase()) {
            case "active": case "paid": case "approved": return "rgba(63,195,128,0.9)";
            case "overdue": case "unpaid": case "rejected": return "#F84D4D";
            case "pending": return "#FFC107";
            default: return "#6c757d";
          }
        })();
        return (
          <div style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "11px", backgroundColor: color, color: "white", display: "inline-block", fontWeight: "600" }}>
            {row.status}
          </div>
        );
      },
    },
  ];

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) { toast.error("No data to export"); return; }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];
    data.forEach((row) => {
      csvRows.push(headers.map((h) => {
        const v = row[h];
        return typeof v === "string" && v.includes(",") ? `"${v}"` : v;
      }).join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Loan Balance & Outstanding Report</h3>
          <button className="invoice-btn bg-dark text-white" onClick={() => exportToCSV(mappedData, "LoanBalanceOutstandingReport")}>
            Export CSV
          </button>
        </div>

        <div className="bg-white p-4 rounded border mb-4 shadow-sm">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="mb-1 fw-bold text-muted small text-uppercase">As of Date</label>
              <DatePicker 
                className="w-100" 
                onChange={(date) => setAsOfDate(date ? date.format("YYYY-MM-DD") : "")} 
              />
            </div>
            <div className="col-md-3">
              <label className="mb-1 fw-bold text-muted small text-uppercase">Customer ID</label>
              <Input 
                placeholder="Enter Customer UUID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="mb-1 fw-bold text-muted small text-uppercase">Product Code</label>
              <Select 
                className="w-100" 
                placeholder="Select Product"
                value={productCode}
                onChange={(val) => setProductCode(val)}
              >
                <Option value="">All Products</Option>
                <Option value="MICROFINANCE">Microfinance</Option>
                <Option value="SME">SME Loan</Option>
                <Option value="PERSONAL">Personal Loan</Option>
              </Select>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <Button className="theme-btn-next w-100" onClick={handleSubmit} loading={loading} style={{ height: "38px" }}>
                Filter
              </Button>
              <Button className="w-100" onClick={() => { setCustomerId(""); setProductCode(""); setAsOfDate(""); handleSubmit(); }} style={{ height: "38px" }}>
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="cs-table p-2">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
};

export default LoanBalanceReport;
