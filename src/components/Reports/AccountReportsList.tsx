import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Select,
} from "antd";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  addAccountLedger,
  deleteChartOfAccount,
  getLedgerAccount,
  updateAccountLedger,
} from "../../redux/apis/apisCrudLms";
import { useNavigate } from "react-router-dom";

const AccountReportsList = ({
  loader,
}: any) => {
  const navigate = useNavigate();
  const [initialRendor, setInitialRendor] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRows(mappedData);
    } else {
      setSelectedRows([]);
    }
  };

  const handleCheckboxChange = (row: any, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, row]);
    } else {
      setSelectedRows((prev) => prev.filter((r) => r.accountCode !== row.accountCode));
    }
  };

  const Account_Documents_List_Header = [
    {
      name: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      cell: (row: any) => (
        <input
          type="checkbox"
         checked={selectedRows.some((r) => r.accountCode === row.accountCode)}
          onChange={(e) => handleCheckboxChange(row, e.target.checked)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "70px",
    },
    {
      name: "Account Code",
      selector: (row: { accountCode: any }) => row.accountCode,
    },
    {
      name: "Account Title",
      cell: (row: { accountTitle: any }) => (
        <span style={{ whiteSpace: "break-spaces" }}>{row.accountTitle}</span>
      ),
    },
    {
      name: "Account Type",
      selector: (row: { accountType: any }) => row.accountType,
    },

    {
      name: "Account Balance",
      selector: (row: { accountBalance: any }) => row.accountBalance,
    },
    {
      name: "IBAN",
      selector: (row: { bankAccountNumber: any }) =>
        row.bankAccountNumber || "-",
    },
    {
      name: "BIC",
      selector: (row: { bic: any }) => row.bic || "-",
    },
  ];

  const ledgerAccount = async () => {
    const dates = {
      from: null,
      to: null,
    };
    try {
      setLoading(true);
      const response = await getLedgerAccount(
        page,
        pageSize,
        '',
        dates
      );
      if (response) {
        const data = response.data.data;
        const newdata = data.filter((item: any) => {
          return item.bankAccountNumber !== "";
        });
        setLedgerData(newdata || []);
        
        // Extract pagination data from API response
        const pageInfo = response?.data?.pageInfo;
        if (pageInfo) {
          const currentPage = pageInfo.page || page;
          const currentPageSize = pageInfo.pageSize || pageSize;
          const totalItems = pageInfo.totalItems || 0;
          
          // Use totalItems from API for totalRows
          setTotalRows(totalItems);
          
          // Calculate from and to based on page, pageSize, and totalItems
          const calculatedFrom = totalItems > 0 ? (currentPage - 1) * currentPageSize + 1 : 0;
          const calculatedTo = totalItems > 0 ? Math.min(currentPage * currentPageSize, totalItems) : 0;
          
          setFrom(calculatedFrom);
          setTo(calculatedTo);
        } else {
          // Fallback if pageInfo is not available
          const filteredCount = newdata.length;
          setTotalRows(filteredCount);
          const calculatedFrom = filteredCount > 0 ? 1 : 0;
          const calculatedTo = filteredCount;
          setFrom(calculatedFrom);
          setTo(calculatedTo);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };
  useMemo(() => {
    setInitialRendor(true);
  }, [page, pageSize, loader]);
  const mappedData =
    ledgerData &&
    ledgerData.map((item: any) => {
      return {
        accountTitle: item.accountName,
        accountCode: item.accountCode,
        accountGroup: item.parentAccountName || "-",
        accountType: item.accountType === 0 ? "Debit" : "Credit",
        id: item.id,
        accountBalance: item.accountBalance || 0,
        bankAccountNumber: item?.bankAccountNumber || "",
        bic: item?.bic || "",
      };
    });
  useEffect(() => {
    if (initialRendor) {
      const timeoutId = setTimeout(() => {
        ledgerAccount();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [page, pageSize, loader]);
  const showReports =()=>{
     const formattedRows = selectedRows.map((row) => ({
    ledgerAccountId: row.id,
    bankAccountNumber: row.bankAccountNumber,
    accountTitle: row.accountTitle,
  }));
      navigate("/lms/Reports/AccountReport", {
      state: { formattedRows }, // ✅ pass full array here
    });
  }
  return (
    <div>
      <div className="d-flex justify-content-end mt-2">
        <div className="d-flex gap-2">
          <Button
            style={{
              borderRadius: "8px",
              border: "transparent",
            }}
            className="application-btn"
            disabled={selectedRows.length === 0}
            onClick={showReports}
          >
            View Reports
          </Button>
        </div>
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

export default AccountReportsList;
