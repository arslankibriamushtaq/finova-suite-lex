import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getCollectionsDueReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
const CollectionsDueReport = () => {
  const { t } = useTranslation("reports");
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
      // Both dates are required by the ledger; default to the current month
      // rather than firing a call that is guaranteed to 422.
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      const res = await getCollectionsDueReport(
        fromDate || monthStart,
        toDate || now.toISOString().slice(0, 10),
        { page: page - 1, size: pageSize }
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
        installmentAmount: item.installmentAmount || item.installmentAmount == 0 ? formatCurrency(item.installmentAmount) : "-",
        principalDue: item.principalDue || item.principalDue == 0 ? formatCurrency(item.principalDue) : "-",
        dueDate: formatDate(item.dueDate ? item.dueDate : "_"),
        profitDue: item.profitDue || item.profitDue == 0 ? formatCurrency(item.profitDue) : "-",
        penaltyDue: item.penaltyDue || item.penaltyDue == 0 ? formatCurrency(item.penaltyDue) : "-",
        totalAmountDue: item.totalAmountDue || item.totalAmountDue == 0 ? formatCurrency(item.totalAmountDue) : "-",
        daysPastDue: item.daysPastDue ? item.daysPastDue : "-",
      };
    });

  useEffect(() => {
    handleSubmit();
    return () => { };
  }, [id, page, pageSize, fromDate]);
  const Call_Activity_Header = [
    {
      name: t('collectionsDue.col.customer'),
      cell: (row: any) => row.customerName,
    },
    {
      name: t('collectionsDue.col.installmentAmount'),
      selector: (row: { installmentAmount: any }) => row.installmentAmount,
    },
    {
      name: t('collectionsDue.col.principalDue'),
      selector: (row: { principalDue: any }) => row.principalDue,
    },
    {
      name: t('collectionsDue.col.profitDue'),
      selector: (row: { profitDue: any }) => row.profitDue,
    },
    {
      name: t('collectionsDue.col.penaltyDue'),
      selector: (row: { penaltyDue: any }) => row.penaltyDue,
    },
    {
      name: t('collectionsDue.col.totalAmountDue'),
      selector: (row: { totalAmountDue: any }) => row.totalAmountDue,
    },
    {
      name: t('collectionsDue.col.daysPastDue'),
      selector: (row: { daysPastDue: any }) => row.daysPastDue,
    },
    {
      name: t('collectionsDue.col.dueDate'),
      selector: (row: { dueDate: any }) => row.dueDate,
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
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">{t('collectionsDue.title')}</h3>
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
                placeholder={t('collectionsDue.selectFromDate')}
              />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                {t('common:to')}
              </label>
              <DatePicker
                onChange={handleToDateChange}
                placeholder={t('collectionsDue.selectToDate')}
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
                exportToCSV(allCallActivity, "OverDueLoans");
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
            data={mappedData}
            isLoading={loading}
          />
        </div>
      </div>

      {/* <TableView /> */}
    </>
  );
};

export default CollectionsDueReport;
