import { useEffect, useMemo, useState } from "react";
import { DatePicker, Input as AntInput, Row as AntRow, Col as AntCol } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { getTrialBalanceReport } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import Loader from "../Loader/Loader";

const formatAmount = (n: number | string | undefined | null) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TrialBalance = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [date, setDate] = useState<any>(null);
  const [totals, setTotals] = useState<any>({
    totalDebits: 0,
    totalCredits: 0,
    difference: 0,
  });
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [date, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Only send `date` when the user picks one; otherwise hit the bare endpoint.
      const finalDate = date ? date.format("YYYY-MM-DD") : undefined;
      const response = await getTrialBalanceReport(finalDate);
      if (response && response.data) {
        const root = response.data?.data ?? response.data;
        const list =
          root?.accounts ||
          root?.items ||
          (Array.isArray(root) ? root : []);
        setAccounts(Array.isArray(list) ? list : []);
        setTotals({
          totalDebits: root?.totalDebits ?? 0,
          totalCredits: root?.totalCredits ?? 0,
          difference: root?.difference ?? 0,
        });
      }
    } catch (error: any) {
      console.error("Error fetching trial balance:", error);
      toast.error(error?.message || "Failed to fetch trial balance");
      setAccounts([]);
      setTotals({ totalDebits: 0, totalCredits: 0, difference: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filteredAccounts = useMemo(() => {
    if (!debouncedSearch) return accounts;
    return accounts.filter((row: any) => {
      const code = (row.accountCode || "").toString().toLowerCase();
      const name = (row.accountName || "").toString().toLowerCase();
      const type = (row.accountType || "").toString().toLowerCase();
      return (
        code.includes(debouncedSearch) ||
        name.includes(debouncedSearch) ||
        type.includes(debouncedSearch)
      );
    });
  }, [accounts, debouncedSearch]);

  const totalRows = filteredAccounts.length;
  const totalPage = Math.max(1, Math.ceil(totalRows / pageSize));

  const mappedData = useMemo(
    () =>
      filteredAccounts
        .slice((page - 1) * pageSize, page * pageSize)
        .map((row: any, index: number) => ({
          Sr: (page - 1) * pageSize + index + 1,
          accountCode: row.accountCode || "-",
          accountName: row.accountName || "-",
          accountType: row.accountType || "-",
          debitBalance: row.debitBalance ?? 0,
          creditBalance: row.creditBalance ?? 0,
        })),
    [filteredAccounts, page, pageSize]
  );

  const columns = [
    {
      name: "S No",
      selector: (row: any) => row.Sr,
      sortable: true,
      width: "70px",
    },
    {
      name: "Account Code",
      selector: (row: any) => row.accountCode,
      sortable: true,
    },
    {
      name: "Account Name",
      selector: (row: any) => row.accountName,
      sortable: true,
      wrap: true,
    },
    {
      name: "Account Type",
      selector: (row: any) => row.accountType,
      sortable: true,
    },
    {
      name: "Debit Balance",
      selector: (row: any) => `${formatAmount(row.debitBalance)} SAR`,
      sortable: true,
      right: true,
    },
    {
      name: "Credit Balance",
      selector: (row: any) => `${formatAmount(row.creditBalance)} SAR`,
      sortable: true,
      right: true,
    },
  ];

  const exportToCSV = () => {
    if (!filteredAccounts || filteredAccounts.length === 0) {
      toast.error("No data available to export");
      return;
    }
    const headers = [
      "Account Code",
      "Account Name",
      "Account Type",
      "Debit Balance",
      "Credit Balance",
    ];
    const csvLines = [
      headers.join(","),
      ...filteredAccounts.map((row: any) =>
        [
          `"${(row.accountCode || "").toString().replace(/"/g, '""')}"`,
          `"${(row.accountName || "").toString().replace(/"/g, '""')}"`,
          `"${(row.accountType || "").toString().replace(/"/g, '""')}"`,
          row.debitBalance ?? 0,
          row.creditBalance ?? 0,
        ].join(",")
      ),
      ["", "", "TOTALS", totals.totalDebits, totals.totalCredits].join(","),
      ["", "", "DIFFERENCE", "", totals.difference].join(","),
    ].join("\n");

    const blob = new Blob([csvLines], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "trial_balance.csv");
  };

  const isBalanced = Number(totals.difference || 0) === 0;

  return (
    <>
      {loading && <Loader />}
      <div className="service p-4">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Trial Balance</h3>
        </div>

        <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search by account code, name, or type"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 6, height: 40 }}
          />
          <DatePicker
            value={date}
            onChange={(d) => setDate(d)}
            format="YYYY-MM-DD"
            placeholder="As of date"
            style={{ flex: "1 1 200px", minWidth: 180, borderRadius: 6, height: 40 }}
          />
          <button
            type="button"
            className="theme-btn-next"
            onClick={exportToCSV}
            disabled={!filteredAccounts.length}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Export CSV
          </button>
        </div>
      </div>

        <AntRow gutter={[16, 16]} className="mb-3">
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Total Debits</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(totals.totalDebits)}{" "}
                <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Total Credits</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(totals.totalCredits)}{" "}
                <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>Difference</div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: isBalanced ? "var(--color-status-green)" : "var(--color-status-red)",
                }}
              >
                {formatAmount(totals.difference)}{" "}
                <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </AntCol>
        </AntRow>

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

export default TrialBalance;
