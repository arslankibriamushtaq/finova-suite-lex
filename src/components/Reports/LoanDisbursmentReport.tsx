import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import toast from "react-hot-toast";
import {
  getLoanDisbursementReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
const LoanDisbursmentReport = () => {
  const { t } = useTranslation("reports");
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await getLoanDisbursementReport(fromDate || undefined, toDate || undefined);
      if (res && res.data) {
        const data = res.data.data || [];
        setAllCallActivity(Array.isArray(data) ? data : []);
        setTotalRows(Array.isArray(data) ? data.length : 0);
        setPage(1);
      }
    } catch (error: any) {
      toast.error(error?.message || t('loanDisbursment.toast.fetchError'));
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
  const mappedData = allCallActivity &&
     allCallActivity.map((item: any) => {
      return {
        applicationNumber: item.applicationNumber ? item.applicationNumber : "-",
        customerName: item.customerName ? item.customerName : "-",
        productName: item.productName ? item.productName : "-",
        disbursementDate: item.disbursementDate ? formatDate(item.disbursementDate) : "-",
        disbursedAmount: item.disbursedAmount || item.disbursedAmount == 0 ? formatCurrency(item.disbursedAmount) : "-",
        tenure: item.tenure ? item.tenure : "-",
        status: item.status ? item.status : "-",
        branchOrChannel: item.branchOrChannel ? item.branchOrChannel : "-",
      
    }});
  ;

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return mappedData.slice(startIndex, endIndex);
  }, [mappedData, page, pageSize]);

  useEffect(() => {
    handleSubmit();
    return () => { };
  }, []);
  const Call_Activity_Header = [
    {
      name: t('loanDisbursment.col.applicationNumber'),
      selector: (row: { applicationNumber: any }) => row.applicationNumber,
    },
    {
      name: t('loanDisbursment.col.customerName'),
      cell: (row: any) => row.customerName,
      width:'200px',
    },
    {
      name: t('loanDisbursment.col.productName'),
      selector: (row: { productName: any }) => row.productName,
    },
    {
      name: t('loanDisbursment.col.disbursementDate'),
      selector: (row: { disbursementDate: any }) => row.disbursementDate,
    },
    {
      name: t('loanDisbursment.col.disbursedAmount'),
      selector: (row: { disbursedAmount: any }) => row.disbursedAmount,
    },
    {
      name: t('loanDisbursment.col.tenure'),
      selector: (row: { tenure: any }) => row.tenure,
    },
    {
      name: t('common:status'),
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
              return t('loanDisbursment.status.paid');
            case "unpaid":
              return t('loanDisbursment.status.unpaid');
            case "pending":
              return t('common:pending');
            case "approved":
              return t('common:approved');
            case "rejected":
            case "reject":
              return t('common:rejected');
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
      name: t('loanDisbursment.col.branchChannel'),
      selector: (row: { branchOrChannel: any }) => row.branchOrChannel,
    },
  ];

  useEffect(() => {
    handleSubmit();
  }, [fromDate, toDate]);
  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error(t('toast.noExportData'));
      return;
    }
    const csvRows = [];
    const headers = Object.keys(data[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle values that might contain commas
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value;
      });
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
      setFromDate(""); // Handle case when date is cleared
    }
  };

  // Handle "to" date change
  const handleToDateChange = (date: any | null) => {
    const dateTo = dayjs(date);
    if (dateTo) {
      const formattedDate = dateTo.format("YYYY-MM-DDTHH:mm:ss");
      setToDate(formattedDate);
    } else {
      setToDate(""); // Handle case when date is cleared
    }
  };

  return (
    <>
      <div className="col-12">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">{t('loanDisbursment.title')}</h3>
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-center">
          <div className="row align-items-center">
            {/* From Date */}
            <div className="col-md-4">
              <label htmlFor="fromDate" className="form-label">
                {t('common:from')}
              </label>
              <DatePicker
                onChange={(e: any) => {
                  handleFromDateChange(e);
                }}
                placeholder={t('filter.selectFromDate')}
              />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                {t('common:to')}
              </label>
              <DatePicker
                onChange={handleToDateChange}
                placeholder={t('filter.selectToDate')}
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
                  handleSubmit();
                }}
              >
                {t('common:clear')}
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
                exportToCSV(mappedData, "LoanDisbursementReport");
              }}
            >
              {t('action.exportCsv')}
            </button>
          </div>
        </div>
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
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Call_Activity_Header}
            data={paginatedData}
            isLoading={loading}
          />
        </div>
      </div>

      {/* <TableView /> */}
    </>
  );
};

export default LoanDisbursmentReport;
