import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { Input } from "antd";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getDueLoansReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const Due = () => {
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const id = useParams();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Wide default range so the endpoint always returns data without exposing pickers in the UI.
      const start = "2000-01-01";
      const end = dayjs().format("YYYY-MM-DD");
      const res = await getDueLoansReport(start, end);
      if (res) {
        const data = res.data.data?.items;
        setAllCallActivity(Array.isArray(data) ? data : []);
        setTotalRows(Array.isArray(data) ? data.length : 0);
      }
    } catch (error: any) {
      console.error("Error fetching due loans:", error);
      toast.error(error?.message || "Failed to fetch due loans");
      setAllCallActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData = useMemo(() => {
    const all = (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => {
      return {
        loanAccountNumber: item.loanAccountNumber || "-",
        customerName: item.customerName || "-",
        productName: item.productName || "-",
        installmentNumber: item.installmentNumber != null ? item.installmentNumber : "-",
        dueDate: item.dueDate ? formatDate(item.dueDate) : "-",
        principalDue: item.principalDue != null ? `${Number(item.principalDue).toFixed(2)} SAR` : "-",
        profitDue: item.profitDue != null ? `${Number(item.profitDue).toFixed(2)} SAR` : "-",
        installmentAmount: item.installmentAmount != null ? `${Number(item.installmentAmount).toFixed(2)} SAR` : "-",
        daysUntilDue: item.daysUntilDue != null ? item.daysUntilDue : "-",
        status: item.status || "-",
      };
    });

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.loanAccountNumber).toLowerCase().includes(term) ||
      String(row.customerName).toLowerCase().includes(term) ||
      String(row.productName).toLowerCase().includes(term) ||
      String(row.status).toLowerCase().includes(term) ||
      String(row.dueDate).toLowerCase().includes(term)
    );
  }, [allCallActivity, debouncedSearch]);

  // Client-side pagination on the filtered set
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mappedData.slice(start, start + pageSize);
  }, [mappedData, page, pageSize]);

  // Keep totalRows / totalPage / from / to in sync with the filtered set
  useEffect(() => {
    const total = mappedData.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [mappedData, page, pageSize]);

  // Debounce search so we don't refilter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    handleSubmit();
  }, [id]);

  const Call_Activity_Header = [
    {
      name: "Loan Account No.",
      selector: (row: any) => row.loanAccountNumber,
      width: "180px",
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName,
      width: "160px",
    },
    {
      name: "Product",
      selector: (row: any) => row.productName,
      width: "140px",
    },
    {
      name: "Installment #",
      selector: (row: any) => row.installmentNumber,
      width: "120px",
    },
    {
      name: "Due Date",
      selector: (row: any) => row.dueDate,
      width: "130px",
    },
    {
      name: "Principal Due",
      selector: (row: any) => row.principalDue,
      width: "150px",
    },
    {
      name: "Profit Due",
      selector: (row: any) => row.profitDue,
      width: "140px",
    },
    {
      name: "Installment Amount",
      selector: (row: any) => row.installmentAmount,
      width: "170px",
    },
    {
      name: "Days Until Due",
      selector: (row: any) => row.daysUntilDue,
      width: "140px",
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      width: "120px",
    },
  ];

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const csvRows: string[] = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">Due Loans</h5>
          </div>
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-center gap-2 flex-wrap">
          <Input
            placeholder="Search by loan, customer, product, or status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 320 }}
          />
          <div className="text-end">
            <button
              className="invoice-btn bg-dark text-white"
              onClick={() => {
                exportToCSV(mappedData, "DueLoans");
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            totalPage={totalPage}
            from={from}
            to={to}
            header={Call_Activity_Header}
            data={paginatedData}
            isLoading={loading}
            paginationShow={true}
          />
        </div>
      </div>
    </>
  );
};

export default Due;
