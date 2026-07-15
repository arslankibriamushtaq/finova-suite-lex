import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { getPoolAcount } from "../../redux/apis/apisCrudLms";
const PoolAccount = () => {
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
      const data = {
        pageNo: page,
        pageSize: pageSize,
        from: null,
        to: null,
      };
      const res = await getPoolAcount(data);
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
        operationId: item.operationId,
        customerId: item.customerId,
        Date: formatDate(item.date),
        operationType: item.operationType,
        amount: item.amount,
        remainingBlance: item.remainingBlance,
      };
    });

  useEffect(() => {
    getData();
  }, [page, pageSize]);

  const Call_Activity_Header = [
    // {
    //   name: "Operation ID",
    //   cell: (row: any) => row.operationId,
    // },

    {
      name: t("common:date"),
      selector: (row: { Date: any }) => row.Date,
    },
    {
      name: t("col.operationType"),
      selector: (row: { operationType: any }) => row.operationType,
    },
    {
      name: t("common:amount"),
      selector: (row: { amount: any }) => row.amount,
    },

    {
      name: t("col.customerId"),
      cell: (row: { customerId: any }) => row.customerId,
    },
    {
      name: t("col.remainingBalance"),
      selector: (row: { remainingBlance: any }) => row.remainingBlance,
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
        </div>
      </div>
    </>
  );
};

export default PoolAccount;
