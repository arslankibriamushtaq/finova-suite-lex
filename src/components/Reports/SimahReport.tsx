import { useState, useEffect, useMemo } from "react";
import { Button, DatePicker, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { getSimahReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const SimahReport = ({ loader }: any) => {
  const { t } = useTranslation("reports");

  const [initialRender, setInitialRender] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  // Debounce search so we don't refilter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const Simah_Report_Header = [
    // { 
    //   name: "Loan ID", 
    //   selector: (row: any) => row.loanId,
    //   sortable: true,
    //   width: "250px"
    // },
    // { 
    //   name: "Customer ID", 
    //   selector: (row: any) => row.customerId,
    //   sortable: true,
    //   width: "250px"
    // },
    {
      name: t('simah.col.facilityType'),
      selector: (row: any) => row.facilityType,
      sortable: true,
      // width: "150px"
    },
    {
      name: t('simah.col.paymentStatus'),
      selector: (row: any) => row.paymentStatus,
      sortable: true,
      // width: "150px"
    },
    {
      name: t('simah.col.simahStatus'),
      selector: (row: any) => row.simahStatus,
      sortable: true,
      // width: "150px"
    },
  ];

  // ================================
  // 📡 API CALL
  // ================================
  const fetchSimahReport = async () => {

    try {
      setLoading(true);

      // Pass from/to dates if the user has picked them; otherwise send no
      // params and let the backend return the default report.
      const response = await getSimahReport({
        from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
        to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
      });

      // Try every common envelope shape the backend might use:
      //   { data: [...] }
      //   { data: { items: [...] } }
      //   { data: { data: [...] } }
      //   { data: { reports: [...] } }
      //   { data: { records: [...] } }
      const root = response?.data;
      const inner = root?.data;
      const list: any[] = Array.isArray(root)
        ? root
        : Array.isArray(inner)
          ? inner
          : Array.isArray(inner?.items)
            ? inner.items
            : Array.isArray(inner?.reports)
              ? inner.reports
              : Array.isArray(inner?.records)
                ? inner.records
                : Array.isArray(inner?.data)
                  ? inner.data
                  : [];

      // eslint-disable-next-line no-console
      console.log("[Simah] response =", root, "→ rows:", list.length);

      const totalItems = list.length;
      setLedgerData(list);
      setTotalRows(totalItems);
      setFrom(totalItems > 0 ? (page - 1) * pageSize + 1 : 0);
      setTo(Math.min(page * pageSize, totalItems));
    } catch (error: any) {
      console.error("❌ Error fetching Simah Report:", error);
      toast.error(error?.message || t('simah.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // ⚙️ INITIALIZATION LOGS
  // ===========================================
  useMemo(() => {
    setInitialRender(true);
  }, [page, pageSize, loader]);

  const mappedData = useMemo(() =>
    ledgerData?.map((item: any) => ({
      loanId: item.loanId || "-",
      customerId: item.customerId || "-",
      facilityType: item.facilityType || "-",
      paymentStatus: item.paymentStatus || "-",
      simahStatus: item.simahStatus || "-",
    })) || [], [ledgerData]);

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return mappedData;
    const term = debouncedSearch.toLowerCase();
    return mappedData.filter((row: any) =>
      String(row.loanId).toLowerCase().includes(term) ||
      String(row.customerId).toLowerCase().includes(term) ||
      String(row.facilityType).toLowerCase().includes(term) ||
      String(row.paymentStatus).toLowerCase().includes(term) ||
      String(row.simahStatus).toLowerCase().includes(term)
    );
  }, [mappedData, debouncedSearch]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, page, pageSize]);

  // Sync totalRows / from / to with the filtered set
  useEffect(() => {
    const total = filteredData.length;
    setTotalRows(total);
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [filteredData, page, pageSize]);

  // ===========================================
  // 🔁 EFFECT HOOK TO FETCH DATA
  // ===========================================
  useEffect(() => {
    if (initialRender) {
      // Reset to page 1 when the date range changes; the table is client-side
      // paginated so we just refetch the dataset on date change.
      setPage(1);
      fetchSimahReport();
    }
  }, [loader, initialRender, fromDate, toDate]);

  // Recalculate from and to when page or pageSize changes
  useEffect(() => {
    if (totalRows > 0) {
      const calculatedFrom = (page - 1) * pageSize + 1;
      const calculatedTo = Math.min(page * pageSize, totalRows);
      setFrom(calculatedFrom);
      setTo(calculatedTo);
    }
  }, [page, pageSize, totalRows]);

  // ===========================================
  // 📥 EXPORT TO CSV FUNCTION
  // ===========================================
  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error(t('toast.noExportData'));
      return;
    }

    const updatedData = data.map((item) => ({
      "Loan ID": item.loanId,
      "Customer ID": item.customerId,
      "Facility Type": item.facilityType,
      "Payment Status": item.paymentStatus,
      "Simah Status": item.simahStatus,
    }));

    const csvRows = [];
    const headers = Object.keys(updatedData[0]);
    csvRows.push(headers.join(","));

    updatedData.forEach((row: any) => {
      const values = headers.map((header) => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
    toast.success(t('toast.exportSuccess'));
  };

  // ===========================================
  // 🖥️ RENDER
  // ===========================================
  return (
    <div className="service simah-report-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ShieldCheck className="h-4 w-4" />
          </span>
          {t('simah.title')}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t('simah.searchPlaceholder')}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <DatePicker
            placeholder={t('common:from')}
            value={fromDate}
            onChange={(d) => setFromDate(d)}
            format="YYYY-MM-DD"
            allowClear
            style={{ flex: "1 1 180px", minWidth: 160, height: 40, borderRadius: 2, background: "#fff" }}
          />
          <DatePicker
            placeholder={t('common:to')}
            value={toDate}
            onChange={(d) => setToDate(d)}
            format="YYYY-MM-DD"
            allowClear
            style={{ flex: "1 1 180px", minWidth: 160, height: 40, borderRadius: 2, background: "#fff" }}
          />
          <button
            type="button"
            className="theme-btn-next"
            disabled={filteredData.length === 0}
            onClick={() => exportToCSV(filteredData, `Simah_Report_${dayjs().format("YYYY-MM-DD")}`)}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t('action.exportReport')}
          </button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="pro-card"
      >
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPage={Math.max(1, Math.ceil(filteredData.length / pageSize))}
          from={from}
          to={to}
          header={Simah_Report_Header}
          data={paginatedData}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default SimahReport;
