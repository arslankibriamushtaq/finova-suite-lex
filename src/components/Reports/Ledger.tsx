import { useEffect, useMemo, useState } from "react";
import { DatePicker, Input as AntInput, Row as AntRow, Col as AntCol } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import {
  getLedgerAccount,
  getLedgerReport,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import Loader from "../Loader/Loader";

const formatAmount = (n: number | string | undefined | null) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Ledger = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [, setCustomerData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, pageSize]);

  // Flatten the response: each account has many `movements`. Render one row per
  // movement (with parent account info) so the table reflects all transactions.
  const allMovements = useMemo(() => {
    const rows: any[] = [];
    accounts.forEach((acc: any) => {
      const movements = Array.isArray(acc?.movements) ? acc.movements : [];
      movements.forEach((m: any) => {
        rows.push({
          accountCode: acc.accountCode || "-",
          accountName: acc.accountName || "-",
          accountType: acc.accountType || "-",
          currency: acc.currency || "SAR",
          entryDate: m.entryDate || "-",
          voucherNumber: m.voucherNumber || "-",
          referenceType: m.referenceType || "-",
          transactionType: m.transactionType || "-",
          description: m.description || "-",
          debitAmount: Number(m.debitAmount || 0),
          creditAmount: Number(m.creditAmount || 0),
          runningBalance: Number(m.runningBalance || 0),
          status: m.status || "-",
        });
      });
    });
    return rows;
  }, [accounts]);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return allMovements;
    return allMovements.filter((r: any) => {
      return (
        r.accountCode.toLowerCase().includes(debouncedSearch) ||
        r.accountName.toLowerCase().includes(debouncedSearch) ||
        r.accountType.toLowerCase().includes(debouncedSearch) ||
        r.voucherNumber.toLowerCase().includes(debouncedSearch) ||
        r.description.toLowerCase().includes(debouncedSearch) ||
        r.referenceType.toLowerCase().includes(debouncedSearch) ||
        r.transactionType.toLowerCase().includes(debouncedSearch)
      );
    });
  }, [allMovements, debouncedSearch]);

  const totalRows = filteredRows.length;
  const totalPage = Math.max(1, Math.ceil(totalRows / pageSize));

  const mappedData = useMemo(
    () =>
      filteredRows
        .slice((page - 1) * pageSize, page * pageSize)
        .map((row: any, index: number) => ({
          Sr: (page - 1) * pageSize + index + 1,
          ...row,
        })),
    [filteredRows, page, pageSize]
  );

  // Cards reflect the filtered rows so they always match the table.
  const visibleTotals = useMemo(() => {
    return filteredRows.reduce(
      (acc: any, row: any) => {
        acc.debits += row.debitAmount;
        acc.credits += row.creditAmount;
        return acc;
      },
      { debits: 0, credits: 0 }
    );
  }, [filteredRows]);

  const columns = [
    {
      name: "S No",
      selector: (row: { Sr: number }) => row.Sr,
      sortable: true,
      width: "70px",
    },
    {
      name: "Date",
      selector: (row: any) => row.entryDate,
      sortable: true,
      width: "110px",
    },
    {
      name: "Voucher #",
      selector: (row: any) => row.voucherNumber,
      sortable: true,
    },
    {
      name: "Account",
      cell: (row: any) => (
        <div className="d-flex flex-column">
          <span className="fw-bold">{row.accountCode}</span>
          <small className="text-muted">{row.accountName}</small>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Type",
      selector: (row: any) => row.transactionType,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      wrap: true,
      grow: 2,
    },
    {
      name: "Debit",
      selector: (row: any) => formatAmount(row.debitAmount),
      sortable: true,
      right: true,
    },
    {
      name: "Credit",
      selector: (row: any) => formatAmount(row.creditAmount),
      sortable: true,
      right: true,
    },
    {
      name: "Running Balance",
      selector: (row: any) => formatAmount(row.runningBalance),
      right: true,
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
    },
  ];

  const getLedgerReportData = async () => {
    try {
      setLoading(true);
      const start = fromDate ? fromDate.format("YYYY-MM-DD") : undefined;
      const end = toDate ? toDate.format("YYYY-MM-DD") : undefined;

      // Pull all accounts in one shot â€” backend paginates by accounts but each
      // account has many movements, and we paginate movements client-side.
      const res = await getLedgerReport(start, end, "", "", 0, 1000);

      if (res?.data) {
        const dataField = res.data.data;
        const rootData = res.data;

        let list: any[] = [];
        if (dataField?.accounts && Array.isArray(dataField.accounts)) {
          list = dataField.accounts;
        } else if (Array.isArray(dataField)) {
          list = dataField;
        } else if (rootData?.accounts && Array.isArray(rootData.accounts)) {
          list = rootData.accounts;
        }

        setAccounts(list);
      }
    } catch (error: any) {
      console.error("Error fetching ledger:", error);
      toast.error(error?.message || "Failed to fetch ledger report");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const accountsDetailsForList = async () => {
    try {
      const response = await getLedgerAccount(1, 1000, "");
      if (response?.data?.success) {
        const data = response.data.data || [];
        setCustomerData(data);
      }
    } catch (error: any) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    accountsDetailsForList();
  }, []);

  useEffect(() => {
    getLedgerReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const exportToCSV = () => {
    if (!filteredRows || filteredRows.length === 0) return;
    const headers = [
      "Date",
      "Voucher #",
      "Account Code",
      "Account Name",
      "Type",
      "Description",
      "Debit",
      "Credit",
      "Running Balance",
      "Status",
    ];
    const rows = filteredRows.map((row: any) => [
      row.entryDate,
      row.voucherNumber,
      row.accountCode,
      `"${(row.accountName || "").replace(/"/g, '""')}"`,
      row.transactionType,
      `"${(row.description || "").replace(/"/g, '""')}"`,
      row.debitAmount,
      row.creditAmount,
      row.runningBalance,
      row.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "ledger_report.csv");
  };

  return (
    <>
      {loading && <Loader />}
      <div className="service p-4">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Ledger Report</h3>
        </div>

        <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search by account, voucher, description, or type"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
          />
          <DatePicker
            value={fromDate}
            onChange={(date) => setFromDate(date)}
            format="YYYY-MM-DD"
            placeholder="From Date"
            style={{ flex: "1 1 180px", minWidth: 160, borderRadius: 8, height: 40 }}
          />
          <DatePicker
            value={toDate}
            onChange={(date) => setToDate(date)}
            format="YYYY-MM-DD"
            placeholder="To Date"
            style={{ flex: "1 1 180px", minWidth: 160, borderRadius: 8, height: 40 }}
          />
          <button
            type="button"
            className="theme-btn-next"
            onClick={exportToCSV}
            disabled={filteredRows.length === 0}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Export CSV
          </button>
        </div>
      </div>

        <AntRow gutter={[16, 16]} className="mb-3">
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Total Entries</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {totalRows.toLocaleString()}
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Total Debits</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(visibleTotals.debits)}
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Total Credits</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(visibleTotals.credits)}
              </div>
            </div>
          </AntCol>
        </AntRow>

        <div
          className="bg-white"
          style={{
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <TableView
            data={mappedData}
            header={columns}
            setPage={setPage}
            page={page}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalRows={totalRows}
            totalPage={totalPage}
            from={totalRows > 0 ? (page - 1) * pageSize + 1 : 0}
            to={Math.min(page * pageSize, totalRows)}
            isLoading={loading}
            paginationShow={true}
          />
        </div>
      </div>
    </>
  );
};

export default Ledger;
