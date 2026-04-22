import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getOverdueLoansReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
const OverDue = () => {
  const [modal, setModal] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [editForm, setEditForm] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [asOfDate, setAsOfDate] = useState<any>(null);
  const [productCode, setProductCode] = useState("MICROFINANCE");
  const id = useParams();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const finalAsOfDate = asOfDate ? asOfDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const res = await getOverdueLoansReport(
        finalAsOfDate,
        1,
        productCode
      );
      if (res) {
        const data = res.data.data?.items;
        setAllCallActivity(Array.isArray(data) ? data : []);
        setTotalRows(Array.isArray(data) ? data.length : 0);
      }
    } catch (error: any) {
      console.error("Error fetching overdue loans:", error);
      toast.error(error?.message || "Failed to fetch overdue loans");
      setAllCallActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const mappedData = useMemo(() => {
    return (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => {
      return {
        loanId: item.loanId || "-",
        customerId: item.customerId || "-",
        facilityType: item.facilityType || "-",
        overdueAmount: item.overdueAmount != null ? `${item.overdueAmount} SAR` : "-",
        daysPastDue: item.daysPastDue != null ? item.daysPastDue : "-",
        paymentStatus: item.paymentStatus || "-",
        dueDate: item.dueDate ? formatDate(item.dueDate) : "-",
      };
    });
  }, [allCallActivity]);

  useEffect(() => {
    handleSubmit();
  }, [asOfDate, productCode]);
  const Call_Activity_Header = [
    {
      name: "Loan ID",
      selector: (row: any) => row.loanId,
      width: "250px"
    },
    {
      name: "Customer ID",
      selector: (row: any) => row.customerId,
      width: "250px"
    },
    {
      name: "Facility Type",
      selector: (row: any) => row.facilityType,
    },
    {
      name: "Overdue Amount",
      selector: (row: any) => row.overdueAmount,
    },
    {
      name: "Days Past Due",
      selector: (row: any) => row.daysPastDue,
    },
    {
      name: "Due Date",
      selector: (row: any) => row.dueDate,
    },
  ];

  // Removed extra useEffect for fromDate/toDate
  
  const exportToCSV = (data: any[], fileName: string) => {
    const csvRows = [];
    const headers = Object.keys(data[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    // Create CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };
  const handleFromDateChange = (date: any) => {
    const dateFrom = dayjs(date);
    if (dateFrom) {
      const formattedDate = dateFrom.format("YYYY-MM-DDTHH:mm:ss");
      setFromDate(formattedDate);
    } else {
      setFromDate(null); // Handle case when date is cleared
    }
  };

  // Handle "to" date change
  const handleToDateChange = (date: any | null) => {
    const dateTo = dayjs(date);
    if (dateTo) {
      const formattedDate = dateTo.format("YYYY-MM-DDTHH:mm:ss");
      setToDate(formattedDate);
    } else {
      setToDate(null); // Handle case when date is cleared
    }
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">Overdue Loans</h5>
          </div>
          {/* <div className="col-2 text-end">
            <button
              className="theme-btn-next"
              onClick={() => {
                setModal(true);
              }}
            >
              Create Voucher
            </button>
          </div> */}
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-center">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label">As Of Date</label>
              <DatePicker
                value={asOfDate}
                onChange={(date) => setAsOfDate(date)}
                placeholder="Select Date"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Product Code</label>
              <input
                type="text"
                className="form-control"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="Enter Product Code"
              />
            </div>
          </div>
          <div className="col-md-3 mt-3">
            {/* <button
              className="mt-2 theme-btn-next bg-dark"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </button> */}
          </div>
          <div className="col-2 text-end">
            <button
              className="invoice-btn mt-4 bg-primary text-white"
              onClick={() => {
                exportToCSV(allCallActivity, "OverDueLoans");
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
            totalRows={totalRows}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={loading}
          />
        </div>
      </div>

      {/* <TableView /> */}
    </>
  );
};

export default OverDue;
