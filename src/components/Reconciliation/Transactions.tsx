import React, { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { GetAllTransactionLogs } from "../../redux/apis/apisCrudLms";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const Transactions = () => {
  const [tableData, setTableData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0)
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
      const res = await GetAllTransactionLogs(data);
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
        Date: formatDate(item.date),
        description: item.description,
        transactionType: item.transactionType,
        debitAccount: item.debitAccount,
        creditAccount: item.creditAccount,
        amount: item.amount,
        transferNumber: item.transferNumber,
        customerId: item.customerId,
        notes: item.notes,
        reconciliationStatus: item.reconciliationStatus,
      };
    });
  useEffect(() => {
    getData();
  }, [page, pageSize, toDate, fromDate]);
  const Call_Activity_Header = [
    {
      name: "Transaction ID",
      cell: (row: any) => row?.transactionId || "-",
    },
    {
      name: "Date",
      selector: (row: { Date: any }) => row?.Date || "-",
    },
    {
      name: "Description",
      selector: (row: { description: any }) => row.description || "-",
    },
    {
      name: "Transaction Type",
      selector: (row: { transactionType: any }) => row.transactionType || "-",
      width: "200px",
    },
    {
      name: "Debit Account",
      selector: (row: { debitAccount: any }) => row.debitAccount || "-",
    },
    {
      name: "Credit Account",
      selector: (row: { creditAccount: any }) => row.creditAccount || "-",
    },
    {
      name: "Amount",
      selector: (row: { amount: any }) => row.amount || "-",
    },
    {
      name: "Transfer Number",
      selector: (row: { transferNumber: any }) => row.transferNumber || "-",
    },
    {
      name: "Customer ID",
      cell: (row: any) => row.customerId || "-",
    },
    {
      name: "Notes",
      selector: (row: { notes: any }) => row.notes || "-",
    },
    {
      name: "Reconciliation Status",
      selector: (row: { reconciliationStatus: any }) =>
        row.reconciliationStatus || "-",
    },
  ];

  return (
    <>
      <div className="d-flex align-items-center justify-content-end gap-1 p-2">
        <strong>Selected Dates: </strong>
        <DatePicker
          className="date-picker"
          placeholder="From"
          value={fromPicker}
          onChange={(date) => {
            setFromPicker(date);
            setFromDate(date ? date.format("YYYY-MM-DD") : "");
          }}
        />

        <DatePicker
          className="date-picker"
          placeholder="To"
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
            to={to}
            from={from}
            totalRows={totalRows}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
        </div>
      </div>
    </>
  );
};

export default Transactions;
