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
import { SearchOutlined } from "@ant-design/icons";
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
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
        debouncedSearch,
        dates
      );
      if (response) {
        const list = Array.isArray(response?.data?.data) ? response.data.data : [];
        setLedgerData(list);

        // New backend shape: { pagination: { page, size, totalElements, totalPages } }
        const pagination = response?.data?.pagination;
        const pageInfo = response?.data?.pageInfo;

        if (pagination) {
          const totalItems = pagination.totalElements || 0;
          setTotalRows(totalItems);
          setTotalPage(pagination.totalPages || 1);
          setFrom(totalItems > 0 ? (page - 1) * pageSize + 1 : 0);
          setTo(totalItems > 0 ? Math.min(page * pageSize, totalItems) : 0);
        } else if (pageInfo) {
          // Legacy backend shape
          const currentPage = pageInfo.page || page;
          const currentPageSize = pageInfo.pageSize || pageSize;
          const totalItems = pageInfo.totalItems || 0;
          setTotalRows(totalItems);
          setTotalPage(Math.ceil(totalItems / currentPageSize) || 1);
          setFrom(totalItems > 0 ? (currentPage - 1) * currentPageSize + 1 : 0);
          setTo(totalItems > 0 ? Math.min(currentPage * currentPageSize, totalItems) : 0);
        } else {
          const count = list.length;
          setTotalRows(count);
          setTotalPage(Math.ceil(count / pageSize) || 1);
          setFrom(count > 0 ? 1 : 0);
          setTo(count);
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
  // Debounce search so we don't refetch on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    if (initialRendor) {
      ledgerAccount();
    }
  }, [page, pageSize, loader, debouncedSearch, initialRendor]);
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
    <div className="service account-reports-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Account Reports</h3>
      </div>

      {/* Filters card */}
      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder="Search by code, name, or type"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 6, height: 40 }}
          />
          <button
            type="button"
            className="theme-btn-next"
            disabled={selectedRows.length === 0}
            onClick={showReports}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            View Reports
          </button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="bg-white"
        style={{
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          from={from}
          to={to}
          header={Account_Documents_List_Header}
          data={mappedData}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default AccountReportsList;
