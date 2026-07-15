import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { GetReconciliationSummary } from "../../redux/apis/apisCrudLms";
const SummaryReport = ({formValues}: any) => {
  const { t } = useTranslation("reconciliation");
  const [tableData, setTableData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);

  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const pagedata = {
        pageNo: page,
        pageSize: pageSize,
        from: null,
        to: null,
      };
      const payload = {
        fromDate: formValues?.dateRange[0],
        toDate: formValues?.dateRange[1],
        reportType: 0,
        channel: 0,
        status: 0,
      };
      const res = await GetReconciliationSummary(pagedata,payload);
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
        totalTransactions: item.totalTransactions,
        matchedTransactions: item.matchedTransactions,
        Date: formatDate(item.date),
        unmatchedTransactions: item.unmatchedTransactions,
        machedPercent: item.machedPercent,
        totalAmount: item.totalAmount,
        exceptions: item.exceptions,
      };
    });

  useEffect(() => {
    getData();
  }, [page, pageSize,formValues]);

  const Call_Activity_Header = [
    {
      name: t("common:date"),
      selector: (row: { Date: any }) => row.Date,
    },
    {
      name: t("col.totalTransactions"),
      selector: (row: { totalTransactions: any }) => row.totalTransactions,
    },
    {
      name: t("col.matched"),
      selector: (row: { matchedTransactions: any }) => row.matchedTransactions,
    },

    {
      name: t("col.unmatched"),
      cell: (row: { unmatchedTransactions: any }) => row.unmatchedTransactions,
    },
    {
      name: t("col.matchPercent"),
      selector: (row: { machedPercent: any }) => row.machedPercent,
    },
    {
      name: t("col.totalValuePkr"),
      selector: (row: { totalAmount: any }) => row.totalAmount,
    },
    {
      name: t("col.exceptions"),
      selector: (row: { exceptions: any }) => row.exceptions,
    },
  ];

  return (
    <>
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
          {tableData?.length == 0 && !skelitonLoading && (
            <div className="d-flex justify-content-center mt-5 bg-red">
              {t("common:noData")}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SummaryReport;
