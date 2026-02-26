import React, { useState, useEffect, useMemo } from "react";
import {
 
  Input,

  Select,
} from "antd";

import TableView from "../TableView/TableView";

import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { GetAccountBlanceReport } from "../../redux/apis/apisCrudLms";


const AccountReport = () => {

   const location = useLocation();
  const { formattedRows } = location.state || { formattedRows: [] };

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
 
 const [reportData,setReportData]= useState<any>([]);
  const [loading, setLoading] = useState(false);
 

useEffect(() => {
  if(formattedRows){

    fetchData(formattedRows);
  }
}, [])
const transformData = (rows: any[]) => {
  return rows.map((row) => ({
    bankAccount: {
      name: row.accountTitle,             // accountTitle → bankAccount.name
      iban: row.bankAccountNumber,        // bankAccountNumber → bankAccount.iban
      balance: row.anbBalance,            // anbBalance → bankAccount.balance
    },
    coa: {
      name: row.accountTitle,             // accountTitle → coa.name
      code: row.bankAccountNumber,          // ledgerAccountId → coa.code
      balance: row.ledgerBalance,         // ledgerBalance → coa.balance
    },
    status: {
      matched: row.blanceStatus === "Matched",
      unmatched: row.blanceStatus.trim() === "Unmatched",
      blanceStatus:row.blanceStatus,
      amount: row.difference,             // difference → status.amount
    },
  }));
};
 const fetchData = async (payload: any) => {
    try {
      setLoading(true);
      const res = await GetAccountBlanceReport(payload);
      const data = res?.data?.data || res?.data || [];
      setReportData(transformData(data));
      
      // Extract pagination data if available
      const currentPage = res?.data?.pageInfo?.page || page;
      const currentPageSize = res?.data?.pageInfo?.pageSize || pageSize;
      const totalItems = res?.data?.pageInfo?.totalItems || data.length || 0;
      
      setTotalRows(totalItems);
      
      // Calculate from and to based on page, pageSize, and totalItems
      const calculatedFrom = (currentPage - 1) * currentPageSize + 1;
      const calculatedTo = Math.min(currentPage * currentPageSize, totalItems);
      
      setFrom(calculatedFrom);
      setTo(calculatedTo);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

const Account_Documents_List_Header = [
  {
    name: "ANB",
    cell: (row: any) => (
        <div className="d-flex flex-column py-2">
      <div>
        <strong>Name: </strong><span>{row.bankName}</span>
      </div>
      <div>
        <strong>IBAN: </strong><span>{row.iban}</span>
      </div>
      <div>
        <strong>Balance: </strong><span>{row.bankBalance}</span>
      </div>
        </div>
    ),
  },
  {
    name: "COA",
    cell: (row: any) => (
        <div className="d-flex flex-column py-2">
      <div>
        <strong>Name: </strong><span>{row.coaName}</span>
      </div>
      <div>
        <strong>IBAN: </strong><span>{row.coaCode}</span>
      </div>
      <div>
        <strong>Balance: </strong><span>{row.coaBalance}</span>
      </div>
        </div>
    ),
  },

  {
    name: "Status",
    cell: (row: any) => (
      <div>
        {row.matched && (
          <span style={{ color: "green", fontWeight: "bold" }}>Matched</span>
        )}
        {row.unmatched && (
          <span style={{ color: "red", fontWeight: "bold" }}>
            Unmatched {row.amount ? `(${row.amount})` : ""}
          </span>
        )}
       {!row.matched && !row.unmatched && (
          <span style={{ color: "gray", fontWeight: "bold" }}>{row.blanceStatus}</span>
        )}
      </div>
    ),
  },
];




const mappedData =
  reportData &&
  reportData.map((item: any) => {
    return {
      // Bank Account
      bankName: item.bankAccount?.name || "-",
      iban: item.bankAccount?.iban || "-",
      bankBalance: item.bankAccount?.balance || 0,

      // COA
      coaName: item.coa?.name || "-",
      coaCode: item.coa?.code || "-",
      coaBalance: item.coa?.balance || 0,

      // Status
      matched: item.status?.matched || false,
      unmatched: item.status?.unmatched || false,
      amount: item.status?.amount || null,
      blanceStatus: item?.status?.blanceStatus || ''
    };
  });

  return (
    <div>
    
      <div className="d-flex justify-content-end mt-2">
      </div>

      <div className="cs-table mt-2">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          header={Account_Documents_List_Header}
          data={mappedData}
          style={{ borderRadius: "7px" }}
          isLoading={loading}
        />
      </div>

    </div>
  );
};

export default AccountReport;

