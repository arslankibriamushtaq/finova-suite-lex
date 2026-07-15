import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { GetErrorReport } from "../../redux/apis/apisCrudLms";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const ErrorReport = () => {
  const { t } = useTranslation("reconciliation");
  const [tableData, setTableData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [fromPicker, setFromPicker] = useState<any>(null);
  const [toPicker, setToPicker] = useState<any>(null);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const data = {
        pageNo: page,
        pageSize: pageSize,
        from: fromDate,
        to: toDate,
      };
      const res = await GetErrorReport(data);
      if (res?.data?.success) {
        const data = res.data.data;
        setTableData(data || []);
        
        // Extract pagination data from API response
        const pageInfo = res?.data?.pageInfo;
        const totalItems = pageInfo?.totalItems || 0;
        setTotalRows(totalItems);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      } else {
        toast.error(res?.data?.notificationMessage);
        // Reset pagination values on error
        setTotalRows(0);
        setFrom(0);
        setTo(0);
      }
    } catch (error: any) {
      toast.error(error?.message);
      // Reset pagination values on error
      setTotalRows(0);
      setFrom(0);
      setTo(0);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
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
    tableData &&
    tableData.map((item: any) => {
      return {
        transactionId: item?.transactionId,
        description: item.description,
        Date: formatDate(item.date),
        amount: item.amount,
        errorType: item.errorType,
        affectedAccount: item.affectedAccount,
        requiredAction: item.creditAccount,
        priority: item.priority,
      };
    });
  useEffect(() => {
    getData();
  }, [page, pageSize, toDate, fromDate]);
  const Call_Activity_Header = [
    {
      name: t("col.transactionId"),
      cell: (row: any) => row.transactionId || "-",
    },
    {
      name: t("common:date"),
      selector: (row: { Date: any }) => row.Date,
    },

    {
      name: t("common:description"),
      selector: (row: { description: any }) => row.description || "-",
    },

    {
      name: t("common:amount"),
      selector: (row: { amount: any }) => row.amount || "-",
    },
    {
      name: t("col.errorType"),
      selector: (row: { errorType: any }) => row.errorType || "-",
    },
    {
      name: t("col.affectedAccount"),
      selector: (row: { affectedAccount: any }) => row.affectedAccount || "-",
    },
    {
      name: t("col.requiredAction"),
      selector: (row: { requiredAction: any }) => row.requiredAction || "-",
    },
    {
      name: t("col.priority"),
      selector: (row: { priority: any }) => row.priority || "-",
    },
  ];

  return (
    <>
      <div className="d-flex align-items-center justify-content-end gap-1 p-2">
        <strong>{t("filters.selectedDates")}</strong>
        <DatePicker
          className="date-picker"
          placeholder={t("common:from")}
          value={fromPicker}
          onChange={(date) => {
            setFromPicker(date);
            setFromDate(date ? date.format("YYYY-MM-DD") : "");
          }}
        />

        <DatePicker
          className="date-picker"
          placeholder={t("common:to")}
          value={toPicker}
          onChange={(date) => {
            setToPicker(date);
            setToDate(date ? date.format("YYYY-MM-DD") : "");
          }}
        />
      </div>
      <div className="col-12">
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            from={from}
            to={to}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
        </div>
      </div>
    </>
  );
};

export default ErrorReport;
