import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAllReports,
} from "../../redux/apis/apisCrud";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
const BrokenPromise = () => {
  const { t } = useTranslation("reports");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [editForm, setEditForm] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const id = useParams();

  const handleSubmit = async () => {
    try {
      const res = await getAllReports(
        page,
        pageSize,
        5,
        fromDate,
        toDate
      );
      if (res) {
        const data = res.data.data;
        setAllCallActivity(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const mappedData =
    allCallActivity &&
    allCallActivity.map((item: any) => {
      return {
        customerName: item.customerName ? item.customerName : "-",
        loanAmount: item.loanAmount ? item.loanAmount : "-",
        remaingAmount: item.remaingAmount ? item.remaingAmount : "-",
        date: formatDate(item.date ? item.date : "_"),
        iqamaId: item.iqamaId ? item.iqamaId : "-",
        status: t("brokenPromise.statusDue"),
        applicationNum: item.applicationNum ? item.applicationNum : "-",
      };
    });

  useEffect(() => {
    handleSubmit();
    return () => { };
  }, [id, page, pageSize, fromDate]);
  const Call_Activity_Header = [
    {
      name: t("brokenPromise.col.customer"),
      cell: (row: any) => row.customerName,
    },
    {
      name: t("brokenPromise.col.loanAmount"),
      selector: (row: { loanAmount: any }) => row.loanAmount,
    },
    {
      name: t("brokenPromise.col.overdueAmount"),
      selector: (row: { remaingAmount: any }) => row.remaingAmount,
    },
    {
      name: t("brokenPromise.col.payableStatus"),
      selector: (row: { status: any }) => row.status,
    },
    {
      name: t("brokenPromise.col.iqamaId"),
      selector: (row: { iqamaId: any }) => row.iqamaId,
    },
    {
      name: t("brokenPromise.col.loanApplicationNo"),
      selector: (row: { applicationNum: any }) => row.applicationNum,
    },
    {
      name: t("common:date"),
      selector: (row: { date: any }) => row.date,
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
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">{t("brokenPromise.title")}</h5>
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
                {t("common:from")}
              </label>
              <DatePicker
                onChange={(e: any) => {
                  handleFromDateChange(e);
                }}
                placeholder={t("brokenPromise.selectFromDate")}
              />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                {t("common:to")}
              </label>
              <DatePicker
                onChange={handleToDateChange}
                placeholder={t("brokenPromise.selectToDate")}
              />
            </div>

            {/* Voucher Type Select */}
            <div className="col-md-2">
              {/* <label htmlFor="voucherType" className="form-label">
                Voucher Type
              </label>
                    <Select id="voucherType" /> */}
              <button
                className="mt-4 invoice-btn bg-dark"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                {t("common:clear")}
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
              className="mt-4 invoice-btn bg-dark"
              onClick={() => {
                exportToCSV(allCallActivity, "OverDueLoans");
              }}
            >
              {t("action.exportCsv")}
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
          />
        </div>
      </div>

      {/* <TableView /> */}
    </>
  );
};

export default BrokenPromise;
