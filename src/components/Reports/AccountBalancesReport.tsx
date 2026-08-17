import { useEffect, useState } from "react";
import { DatePicker, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import TableView from "../TableView/TableView";
import { getAccountBalancesReport } from "../../redux/apis/apisCrudLms";
import { ledgerErrorMessage } from "../../utils/ledgerErrors";
import ReportHeader from "./ReportHeader";

const formatNumber = (n: any) => {
  if (n === null || n === undefined || n === "") return "-";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Account balances as of a date (`/reports/account`).
 *
 * Not currency-scoped yet, so a balance here can be a sum across currencies —
 * the note on screen says so instead of presenting it as a single-currency
 * figure.
 */
const AccountBalancesReport = () => {
  const { t } = useTranslation("reports");
  const [asOfDate, setAsOfDate] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAccountBalancesReport(
        asOfDate ? asOfDate.format("YYYY-MM-DD") : undefined,
        { search: debouncedSearch || undefined, page: page - 1, size: pageSize }
      );
      const body = res?.data;
      const data = body?.data;
      const list = Array.isArray(data) ? data : (data?.accounts ?? data?.items ?? []);
      setRows(list);
      setTotalRows(body?.pagination?.totalElements ?? data?.totalCount ?? list.length);
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("accountBalances.toast.fetchError")));
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asOfDate, debouncedSearch, page, pageSize]);

  const columns = [
    {
      name: t("accountBalances.col.code"),
      selector: (row: any) => row.accountCode || "-",
    },
    {
      name: t("accountBalances.col.name"),
      cell: (row: any) => (
        <span style={{ whiteSpace: "break-spaces" }}>{row.accountName || "-"}</span>
      ),
    },
    {
      name: t("accountBalances.col.type"),
      selector: (row: any) => row.accountType || "-",
    },
    {
      name: t("accountBalances.col.debit"),
      cell: (row: any) => <span>{formatNumber(row.debitBalance)}</span>,
    },
    {
      name: t("accountBalances.col.credit"),
      cell: (row: any) => <span>{formatNumber(row.creditBalance)}</span>,
    },
    {
      name: t("accountBalances.col.balance"),
      cell: (row: any) => <b>{formatNumber(row.balance ?? row.closingBalance)}</b>,
    },
  ];

  const exportToCSV = () => {
    if (!rows.length) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const csv = [
      ["Code", "Name", "Type", "Debit", "Credit", "Balance"].join(","),
      ...rows.map((r: any) =>
        [
          r.accountCode,
          r.accountName,
          r.accountType,
          r.debitBalance,
          r.creditBalance,
          r.balance ?? r.closingBalance,
        ]
          .map((v) => `"${String(v ?? "")}"`)
          .join(",")
      ),
    ].join("\n");
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `Account_Balances_${dayjs().format("YYYYMMDD")}.csv`
    );
  };

  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className="service col-12">
      <ReportHeader icon={<Wallet className="h-4 w-4" />} title={t("accountBalances.title")} />

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("accountBalances.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <DatePicker
            value={asOfDate}
            onChange={(d) => setAsOfDate(d)}
            format="YYYY-MM-DD"
            placeholder={t("filter.asOfDate")}
            style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2 }}
          />
          <button
            type="button"
            className="theme-btn-next"
            onClick={fetchData}
            disabled={loading}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {loading ? t("common:loading") : t("common:refresh")}
          </button>
          <button
            type="button"
            className="theme-btn-next"
            onClick={exportToCSV}
            disabled={!rows.length}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("action.exportCsv")}
          </button>
        </div>
        <p className="mb-0 mt-2 text-xs text-muted-foreground">{t("notCurrencyAware")}</p>
      </div>

      <div className="pro-card">
        <TableView
          header={columns}
          data={rows}
          isLoading={loading}
          totalRows={totalRows}
          pageSize={pageSize}
          page={page}
          setPage={setPage}
          setPageSize={(size: number) => {
            setPageSize(size);
            setPage(1);
          }}
          from={from}
          to={to}
        />
      </div>
    </div>
  );
};

export default AccountBalancesReport;
