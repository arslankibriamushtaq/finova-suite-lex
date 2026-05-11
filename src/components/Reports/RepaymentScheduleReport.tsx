import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { Col, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { getRepaymentScheduleReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const formatNumber = (n: any) => {
  if (n === null || n === undefined || n === "") return "-";
  const num = Number(n);
  if (isNaN(num)) return String(n);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const RepaymentScheduleReport = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
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
  }, [pageSize]);

  const extractItems = (root: any): any[] => {
    const inner = root?.data ?? root;
    return Array.isArray(inner?.items)
      ? inner.items
      : Array.isArray(inner?.loans)
        ? inner.loans
        : Array.isArray(inner)
          ? inner
          : [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Backend caps each response at ~20 rows even when we ask for more, so
      // walk every page returned in `pagination.totalPages` and concatenate.
      const firstRes = await getRepaymentScheduleReport({ page: 0, size: 100 });
      const firstRoot = firstRes?.data;
      let combined: any[] = [...extractItems(firstRoot)];

      const pagination = firstRoot?.pagination;
      const totalPagesFromApi = Number(pagination?.totalPages) || 1;

      if (totalPagesFromApi > 1) {
        const remaining = await Promise.all(
          Array.from({ length: totalPagesFromApi - 1 }, (_, i) =>
            getRepaymentScheduleReport({ page: i + 1, size: 100 })
              .then((r) => extractItems(r?.data))
              .catch(() => [])
          )
        );
        combined = combined.concat(...remaining);
      }

      setLoans(combined);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch repayment schedule report");
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLoans = useMemo(() => {
    if (!debouncedSearch) return loans;
    return loans.filter((row: any) =>
      String(row.loanAccountNumber || "").toLowerCase().includes(debouncedSearch) ||
      String(row.productName || "").toLowerCase().includes(debouncedSearch) ||
      String(row.customerName || "").toLowerCase().includes(debouncedSearch) ||
      String(row.loanId || "").toLowerCase().includes(debouncedSearch)
    );
  }, [loans, debouncedSearch]);

  const totalRows = filteredLoans.length;
  const totalPage = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedData = useMemo(
    () =>
      filteredLoans.slice(startIndex, startIndex + pageSize).map((row: any, index: number) => ({
        Sr: startIndex + index + 1,
        loanId: row.loanId,
        loanAccountNumber: row.loanAccountNumber || "-",
        customerName: row.customerName || "-",
        productName: row.productName || "-",
        disbursedPrincipal: row.disbursedPrincipal ?? 0,
        totalProfit: row.totalProfit ?? 0,
        totalPayable: row.totalPayable ?? 0,
        tenureMonths: row.tenureMonths ?? "-",
        installmentsCount: Array.isArray(row.installments) ? row.installments.length : 0,
      })),
    [filteredLoans, startIndex, pageSize]
  );

  const visibleTotals = useMemo(() => {
    return filteredLoans.reduce(
      (acc: any, row: any) => {
        acc.disbursedPrincipal += Number(row.disbursedPrincipal ?? 0);
        acc.totalProfit += Number(row.totalProfit ?? 0);
        acc.totalPayable += Number(row.totalPayable ?? 0);
        return acc;
      },
      { disbursedPrincipal: 0, totalProfit: 0, totalPayable: 0 }
    );
  }, [filteredLoans]);

  const columns = [
    {
      name: "S No",
      selector: (row: any) => row.Sr,
      width: "70px",
    },
    {
      name: "Loan Account",
      selector: (row: any) => row.loanAccountNumber,
      sortable: true,
    },
    {
      name: "Customer",
      selector: (row: any) => row.customerName,
      sortable: true,
    },
    {
      name: "Product",
      selector: (row: any) => row.productName,
      sortable: true,
    },
    {
      name: "Disbursed Principal",
      selector: (row: any) => formatNumber(row.disbursedPrincipal),
      sortable: true,
      right: true,
    },
    {
      name: "Total Profit",
      selector: (row: any) => formatNumber(row.totalProfit),
      sortable: true,
      right: true,
    },
    {
      name: "Total Payable",
      selector: (row: any) => formatNumber(row.totalPayable),
      sortable: true,
      right: true,
    },
    {
      name: "Tenure (Months)",
      selector: (row: any) => row.tenureMonths,
      sortable: true,
    },
    {
      name: "Installments",
      selector: (row: any) => row.installmentsCount,
      sortable: true,
    },
  ];

  const exportToCSV = () => {
    if (!filteredLoans.length) {
      toast.error("No data to export");
      return;
    }
    const csvHeaders = [
      "Loan Account",
      "Customer",
      "Product",
      "Disbursed Principal",
      "Total Profit",
      "Total Payable",
      "Tenure (Months)",
      "Installments",
    ];
    const csvRows = [csvHeaders.join(",")];
    filteredLoans.forEach((r: any) => {
      const values = [
        r.loanAccountNumber || "",
        r.customerName || "",
        r.productName || "",
        r.disbursedPrincipal ?? 0,
        r.totalProfit ?? 0,
        r.totalPayable ?? 0,
        r.tenureMonths ?? "",
        Array.isArray(r.installments) ? r.installments.length : 0,
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `RepaymentScheduleReport_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Repayment Schedule Report</h3>
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
        <Input
          allowClear
          placeholder="Search by loan account, customer, product"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
        <button
          type="button"
          className="theme-btn-next"
          onClick={exportToCSV}
          disabled={!filteredLoans.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Export CSV
        </button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="mb-3">
        <Col xs={24} sm={12} lg={6}>
          <div className="card-product p-4 text-dark h-100">
            <div style={{ fontSize: 14, fontWeight: 600 }}>Total Loans</div>
            <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
              {totalRows.toLocaleString()}
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="card-product p-4 text-dark h-100">
            <div style={{ fontSize: 14, fontWeight: 600 }}>Disbursed Principal</div>
            <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
              {formatNumber(visibleTotals.disbursedPrincipal)}{" "}
              <span style={{ fontSize: 14 }}>SAR</span>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="card-product p-4 text-dark h-100">
            <div style={{ fontSize: 14, fontWeight: 600 }}>Total Profit</div>
            <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
              {formatNumber(visibleTotals.totalProfit)}{" "}
              <span style={{ fontSize: 14 }}>SAR</span>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="card-product p-4 text-dark h-100">
            <div style={{ fontSize: 14, fontWeight: 600 }}>Total Payable</div>
            <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
              {formatNumber(visibleTotals.totalPayable)}{" "}
              <span style={{ fontSize: 14 }}>SAR</span>
            </div>
          </div>
        </Col>
      </Row>

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
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          from={totalRows > 0 ? startIndex + 1 : 0}
          to={Math.min(startIndex + pageSize, totalRows)}
          header={columns}
          data={paginatedData}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default RepaymentScheduleReport;
