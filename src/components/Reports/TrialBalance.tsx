import { useEffect, useMemo, useState } from "react";
import { DatePicker, Input as AntInput, Row as AntRow, Col as AntCol } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { Scale } from "lucide-react";
import { getTrialBalanceReport } from "../../redux/apis/apisCrudLms";
import { ledgerErrorMessage } from "../../utils/ledgerErrors";
import CurrencySelect from "./CurrencySelect";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";
import ReportHeader from "./ReportHeader";

const formatAmount = (n: number | string | undefined | null) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TrialBalance = () => {
  const { t } = useTranslation("reports");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [date, setDate] = useState<any>(null);
  // A trial balance is per currency — debits and credits from two currencies
  // would never balance against each other.
  const [currency, setCurrency] = useState("SAR");
  // Starts empty, not zeroed — see `summary` below.
  const [totals, setTotals] = useState<any>({});
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
  }, [date, currency, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Only send `date` when the user picks one; otherwise hit the bare endpoint.
      const finalDate = date ? date.format("YYYY-MM-DD") : undefined;
      const response = await getTrialBalanceReport(finalDate, currency);
      if (response && response.data) {
        const root = response.data?.data ?? response.data;
        const list = root?.accounts || root?.items || (Array.isArray(root) ? root : []);
        setAccounts(Array.isArray(list) ? list : []);
        // Left undefined when the response omits them, so the summary below can
        // tell "the ledger says zero" from "the ledger didn't say".
        setTotals({
          totalDebits: root?.totalDebits,
          totalCredits: root?.totalCredits,
          difference: root?.difference,
          currency: root?.currency,
        });
      }
    } catch (error: any) {
      console.error("Error fetching trial balance:", error);
      toast.error(ledgerErrorMessage(error, t("trialBalance.toast.fetchError")));
      setAccounts([]);
      setTotals({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, currency]);

  // The response echoes the currency it was computed in; the selector is only
  // the fallback while a fetch is in flight.
  const reportCurrency = totals?.currency || currency;

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

  // The ledger does not always send the totals block; when it doesn't, add the
  // rows up here rather than showing 0.00 under a table full of figures.
  const summary = useMemo(() => {
    const debits = filteredAccounts.reduce((sum, row) => sum + Number(row.debitBalance || 0), 0);
    const credits = filteredAccounts.reduce((sum, row) => sum + Number(row.creditBalance || 0), 0);
    return {
      totalDebits: totals?.totalDebits ?? debits,
      totalCredits: totals?.totalCredits ?? credits,
      difference: totals?.difference ?? debits - credits,
    };
  }, [filteredAccounts, totals]);

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
      name: t("trialBalance.col.sNo"),
      selector: (row: any) => row.Sr,
      sortable: true,
      width: "70px",
    },
    {
      name: t("trialBalance.col.accountCode"),
      selector: (row: any) => row.accountCode,
      sortable: true,
    },
    {
      name: t("trialBalance.col.accountName"),
      selector: (row: any) => row.accountName,
      sortable: true,
      wrap: true,
    },
    {
      name: t("trialBalance.col.accountType"),
      selector: (row: any) => row.accountType,
      sortable: true,
    },
    {
      name: t("trialBalance.col.debitBalance"),
      selector: (row: any) => `${formatAmount(row.debitBalance)} ${reportCurrency}`,
      sortable: true,
      right: true,
    },
    {
      name: t("trialBalance.col.creditBalance"),
      selector: (row: any) => `${formatAmount(row.creditBalance)} ${reportCurrency}`,
      sortable: true,
      right: true,
    },
  ];

  const exportToCSV = () => {
    if (!filteredAccounts || filteredAccounts.length === 0) {
      toast.error(t("toast.noExportData"));
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
      ["", "", "TOTALS", summary.totalDebits, summary.totalCredits].join(","),
      ["", "", "DIFFERENCE", "", summary.difference].join(","),
    ].join("\n");

    const blob = new Blob([csvLines], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "trial_balance.csv");
  };

  const isBalanced = Number(summary.difference || 0) === 0;

  return (
    <>
      {loading && <Loader />}
      <div className="service col-12">
        <ReportHeader icon={<Scale className="h-4 w-4" />} title={t("trialBalance.title")} />

        <div className="pro-card p-3 mb-3">
          <div className="d-flex flex-wrap align-items-center gap-2 w-100">
            <AntInput
              allowClear
              placeholder={t("trialBalance.searchPlaceholder")}
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
            />
            <DatePicker
              value={date}
              onChange={(d) => setDate(d)}
              format="YYYY-MM-DD"
              placeholder={t("filter.asOfDate")}
              style={{ flex: "1 1 200px", minWidth: 180, borderRadius: 2, height: 40 }}
            />
            <CurrencySelect value={currency} onChange={setCurrency} />
            <button
              type="button"
              className="theme-btn-next"
              onClick={exportToCSV}
              disabled={!filteredAccounts.length}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t("action.exportCsv")}
            </button>
          </div>
        </div>

        <AntRow gutter={[16, 16]} className="mb-3">
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>{t("trialBalance.summary.totalDebits")}</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(summary.totalDebits)}{" "}
                <span style={{ fontSize: 14 }}>{reportCurrency}</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>{t("trialBalance.summary.totalCredits")}</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {formatAmount(summary.totalCredits)}{" "}
                <span style={{ fontSize: 14 }}>{reportCurrency}</span>
              </div>
            </div>
          </AntCol>
          <AntCol xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14 }}>{t("trialBalance.summary.difference")}</div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: isBalanced ? "var(--color-status-green)" : "var(--color-status-red)",
                }}
              >
                {formatAmount(summary.difference)}{" "}
                <span style={{ fontSize: 14 }}>{reportCurrency}</span>
              </div>
            </div>
          </AntCol>
        </AntRow>

        <div className="pro-card">
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
