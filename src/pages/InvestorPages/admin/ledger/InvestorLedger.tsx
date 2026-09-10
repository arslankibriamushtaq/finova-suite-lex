import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { BookOpenText, Download } from "lucide-react";
import { DatePicker, Select } from "antd";
import toast from "react-hot-toast";
import moment from "moment";
import { saveAs } from "file-saver";

import TableView from "../../../../components/TableView/TableView";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { EmptyState } from "../../../../components/shared/detailKit";
import { LexPageHeader } from "../../../../components/shared/lexKit";
import { getInvestorLedgerList } from "../../../../redux/apis/apisInvestor";

const InvestorLedger = () => {
  const { t } = useTranslation("investor");

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>();

  const [customerData, setCustomerData] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [fromDate, setFromDate] = useState<any>(moment().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState<any>(moment().format("YYYY-MM-DD"));
  const [responseData, setresponseData] = useState<any>();
  const [loading, setLoading] = useState(false);

  const getAllDaybookReport = [
    {
      name: t("led.col.sNo"),
      selector: (row: { Sr: number }) => row.Sr,
      sortable: true,
      width: "60px",
    },
    {
      name: t("led.col.id"),
      selector: (row: { id: string }) => row.id,
      omit: true, // Hide ID column
    },
    {
      name: t("led.col.customer"),
      selector: (row: { customer: string }) => row.customer,
    },
    {
      name: t("led.col.transactionDate"),
      selector: (row: { transactionDate: string }) =>
        formatDate(row.transactionDate),
    },
    {
      name: t("led.col.applicationNo"),
      selector: (row: { applicationNo: string }) => row.applicationNo,
    },
    {
      name: t("led.col.voucherNo"),
      selector: (row: { voucherNo: string }) => row.voucherNo,
    },
    {
      name: t("led.col.accountCode"),
      selector: (row: { accountCode: string }) => row.accountCode,
    },
    {
      name: t("led.col.account"),
      cell: (row: any) => <span>{row.account}</span>,
    },

    // Figures a reader compares down a column, so they are tabular and end
    // aligned. As plain selectors they came out ragged and left aligned.
    {
      name: t("led.col.debit"),
      cell: (row: { debit: number | string }) => (
        <span className="block w-full text-end font-mono text-sm tabular-nums">
          {typeof row.debit === "number" ? row.debit.toLocaleString() : row.debit}
        </span>
      ),
      width: "130px",
    },
    {
      name: t("led.col.credit"),
      cell: (row: { credit: number | string }) => (
        <span className="block w-full text-end font-mono text-sm tabular-nums">
          {typeof row.credit === "number" ? row.credit.toLocaleString() : row.credit}
        </span>
      ),
      width: "130px",
    },
  ];

  const mappedData =
    ledgerData &&
    ledgerData?.map((item: any, index: any) => {
      return {
        Sr: (page - 1) * pageSize + index + 1,
        id: item.id,
        customer: item?.customerNID || "-",
        transactionDate: item.transactionDate || "-",
        voucherNo: item.voucherNo || "-",
        accountCode: item.accountCode || "-",
        account: item.account || "-",
        debit: item.debit || "-",
        credit: item.credit || "-",
        applicationNo: item.applicationNumber || "-",
      };
    });

  function formatDate(dateString: any) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
    const year = date.getFullYear();
    return `${day}/${month}/${year} `;
  }

  const formatDates = (date: string) => {
    return date ? moment(date).format("YYYY-MM-DDTHH:mm:ss") : "";
  };

  const getDayBookReprtData = async () => {

    const formattedFromDate = formatDates(fromDate);
    const formattedToDate = formatDates(toDate);
    setLoading(true);
    try {
      const resposne = await getInvestorLedgerList(
        page,
        pageSize,
        searchValue == "all" ? "" : searchValue,
        formattedFromDate,
        formattedToDate
      );
      if (resposne) {
        const data = resposne?.data;
        const pageInfo = resposne?.pageInfo || data?.pageInfo || {};
        const totalItems = pageInfo.totalItems || 0;
        const currentPage = pageInfo.page || page;
        const currentPageSize = pageInfo.pageSize || pageSize;
        
        setTotalRows(totalItems);
        setPage(currentPage);
        setPageSize(currentPageSize);
        setTotalPage(pageInfo.totalPages || 1);
        setFrom(currentPage ? ((currentPage - 1) * currentPageSize) + 1 : 1);
        setTo(currentPage ? Math.min(currentPage * currentPageSize, totalItems) : 0);
        
        setresponseData(data);
        setLedgerData(data?.ledgerListDto || []);
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.message || t("led.fetchError"));
    }
  };



//   const accountsDetailsForList = async () => {
//     try {
//       const response = await getInvestorAccounts(1, 1000);
//       if (response?.success) {
        
//         const valueMain = response?.data || [];
//         const data = valueMain?.filter(
//           (item: any) => item.accountName !== "Micro Loan Interest Revenue Account"
//         );
//         setCustomerData(data);
//       }
//     } catch (error: any) {
//       toast.error(error?.message || "Failed to fetch accounts");
//     } finally {
//       setLoading(false);
//     }
//   };

  const exportToCSV = (data: any[], fileName: string) => {
    // `Object.keys(data[0])` throws on an empty list, and the button was live
    // before the first response landed.
    if (!Array.isArray(data) || data.length === 0) {
      toast.error(t("led.noData"));
      return;
    }

    const csvRows = [];
    const headers = Object.keys(data[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    // Create CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };

  /**
   * One trigger for one request.
   *
   * There were three effects calling this — a mount effect, one on
   * [fromDate, toDate] behind a 200ms setTimeout, and one on
   * [searchValue, page, pageSize] — and React runs all three on mount, so the
   * page opened with three identical requests in flight. The account Select
   * scheduled a fourth on every change, racing the effect that was already
   * going to fire. Every input that changes the query is in the dependency
   * list here instead, which also fixes the dates: they were not in any list
   * that fetched, so changing one did nothing until something else moved.
   */
  useEffect(() => {
    if (fromDate && toDate) {
      getDayBookReprtData();
    }
  }, [searchValue, page, pageSize, fromDate, toDate]);

  return (
    <div className="service">
      <LexPageHeader icon={BookOpenText} title={t("led.title")}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading || !ledgerData?.length}
          onClick={() => exportToCSV(ledgerData, "ledgerData")}
        >
          <Download className="h-4 w-4" />
          {t("led.exportCsv")}
        </Button>
      </LexPageHeader>

      {/* A `pro-card p-3` filter bar, which is what the app's compact-control
          rules key off: they pin .ant-picker and .ant-select to the same 34px
          and 12px as every other filter row. Loose in a Bootstrap grid, these
          three were full height and a size larger than their neighbours. */}
      <div className="pro-card p-3 mb-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="ledger-from" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("common:from")}
            </Label>
            <DatePicker
              id="ledger-from"
              className="w-full"
              value={fromDate ? moment(fromDate) : null}
              onChange={(date: any, dateString: string | string[]) => {
                setFromDate(dateString || null);
                setPage(1);
              }}
              placeholder={t("led.selectFromDate")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="ledger-to" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("common:to")}
            </Label>
            <DatePicker
              id="ledger-to"
              className="w-full"
              value={toDate ? moment(toDate) : null}
              onChange={(date, dateString: string | string[]) => {
                setToDate(dateString || null);
                setPage(1);
              }}
              placeholder={t("led.selectToDate")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("led.accounts")}
            </Label>
            {/* Controlled, so the box shows what is actually filtering. It was
                uncontrolled, which let the visible selection and searchValue
                drift apart. */}
            <Select
              className="ledger-account w-full"
              value={searchValue || undefined}
              placeholder={t("led.selectAccountName")}
              onChange={(value) => {
                setSearchValue(value);
                setPage(1);
              }}
            >
              <Select.Option value="all">{t("common:all")}</Select.Option>
              {customerData?.map((option) => (
                <Select.Option key={option.accountCode} value={option.accountCode}>
                  {option?.accountName}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="pro-card p-4">
        {!loading && ledgerData?.length === 0 ? (
          <EmptyState icon={BookOpenText} text={t("led.noData")} />
        ) : (
          <>
            <TableView
              data={mappedData}
              header={getAllDaybookReport}
              setPage={setPage}
              page={page}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalRows={totalRows}
              totalPage={totalPage}
              from={from}
              to={to}
              isLoading={loading}
              paginationRowsPerPageOptions={[10, 20, 50, 100]}
            />

            {/* The running totals are the point of a ledger, so they get their
                own band rather than a Bootstrap border-top/border-bottom pair
                that drew a line through the middle of the pager. */}
            {!loading && ledgerData?.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/40 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("led.overallTotal")}
                </span>
                <span className="flex flex-wrap items-center gap-5 text-sm font-semibold tabular-nums text-foreground">
                  <span>{t("led.debitLabel", { value: responseData?.totalDebitAmount ?? 0 })}</span>
                  <span>{t("led.creditLabel", { value: responseData?.toalCreditAmount ?? 0 })}</span>
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvestorLedger;

