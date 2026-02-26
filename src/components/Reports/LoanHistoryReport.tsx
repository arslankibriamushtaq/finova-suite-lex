import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getCustomerWiseLoanHistoryReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
const LoanHistoryReport = () => {
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const id = useParams();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await getCustomerWiseLoanHistoryReport(
        fromDate || undefined,
        toDate || undefined
      );
      if (res) {
        const data = res.data.data;
        setAllCallActivity(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
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
  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number" ? amount.toFixed(2) : amount;
  };
  const mappedData =
    allCallActivity &&
    allCallActivity.map((item: any) => {
      return {
        customerName: item.customerName ? item.customerName : "-",
        eventType: item.eventType ? item.eventType : "-",
        eventDate: formatDate(item.eventDate ? item.eventDate : "_"),
        description: item.description ? item.description : "-",
        status: item.status ? item.status : "-",
        amountEffected: item.amountEffected || item.amountEffected == 0 ? formatCurrency(item.amountEffected) : "-",
        performedBy: item.performedBy ? item.performedBy : "-",
      };
    });

  useEffect(() => {
    handleSubmit();
    return () => { };
  }, [id, page, pageSize, fromDate]);
  const Call_Activity_Header = [
    {
      name: "Customer",
      cell: (row: any) => row.customerName,
    },
    {
      name: "Event Date",
      selector: (row: { eventDate: any }) => row.eventDate,
    },
    {
      name: "Event Type",
      selector: (row: { eventType: any }) => row.eventType,
    },
    {
      name: "Description",
      selector: (row: { description: any }) => row.description,
      width: "250px",
    },
    {
      name: "Status",
      cell: (row: { status: any }) => {
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case "paid":
              return "rgba(63, 195, 128, 0.9)";
            case "unpaid":
              return "#F84D4D";
            case "pending":
              return "#FFC107";
            case "approved":
              return "rgba(63, 195, 128, 0.9)";
            case "rejected":
            case "reject":
              return "#F84D4D";
            default:
              return "#6c757d";
          }
        };
        
        const getStatusLabel = (status: string) => {
          switch (status?.toLowerCase()) {
            case "paid":
              return "Paid";
            case "unpaid":
              return "Unpaid";
            case "pending":
              return "Pending";
            case "approved":
              return "Approved";
            case "rejected":
            case "reject":
              return "Rejected";
            default:
              return status || "-";
          }
        };
        
        return (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "32px",
              fontSize: "12px",
              backgroundColor: getStatusColor(row.status),
              color: "white",
              display: "inline-block",
              textTransform: "capitalize",
              fontWeight: "500"
            }}
          >
            {getStatusLabel(row.status)}
          </div>
        );
      },
    },
    {
      name: "Amount Effected",
      selector: (row: { amountEffected: any }) => row.amountEffected,
    },
    {
      name: "Performed By",
      selector: (row: { performedBy: any }) => row.performedBy,
    },
  ];

  useEffect(() => {
    if (fromDate && toDate) {
      handleSubmit();
    }
  }, [fromDate, toDate]);
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
            <h5 className="mb-0">Customer Wise Loan History Report</h5>
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
            {/* From Date */}
            <div className="col-md-4">
              <label htmlFor="fromDate" className="form-label">
                From
              </label>
              <DatePicker
                onChange={(e: any) => {
                  handleFromDateChange(e);
                }}
                placeholder="Select From Date"
              />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                To
              </label>
              <DatePicker
                onChange={handleToDateChange}
                placeholder="Select To Date"
              />
            </div>

            {/* Voucher Type Select */}
            <div className="col-md-2">
              {/* <label htmlFor="voucherType" className="form-label">
                Voucher Type
              </label>
                    <Select id="voucherType" /> */}
              <button
                className="invoice-btn bg-dark mt-4 "
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear
              </button>
            </div>

            {/* Account Select */}
            <div className="col-md-2">
              {/* <label htmlFor="account" className="form-label">
                Account
              </label>
              <Select id="account" /> */}
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
              className="invoice-btn mt-4 bg-dark"
              onClick={() => {
                exportToCSV(allCallActivity, "CustomerWiseLoanHistory");
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

export default LoanHistoryReport;
