import { useState, useEffect, useMemo } from "react";
import { Button, DatePicker } from "antd";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { getSimahReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const SimahReport = ({ loader }: any) => {

  const [initialRender, setInitialRender] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<any>(dayjs());

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
      name: "Facility Type",
      selector: (row: any) => row.facilityType,
      sortable: true,
      // width: "150px"
    },
    {
      name: "Payment Status",
      selector: (row: any) => row.paymentStatus,
      sortable: true,
      // width: "150px"
    },
    {
      name: "Simah Status",
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

      const response = await getSimahReport(period.format("YYYY-MM"));


      const apiData = response?.data?.data?.items;

      if (Array.isArray(apiData)) {
        const totalItems = apiData.length;
        setLedgerData(apiData);
        setTotalRows(totalItems);

        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      } else {
        console.warn("⚠️ Unexpected API response structure:", response?.data);
        setLedgerData([]);
        setTotalRows(0);
        setFrom(0);
        setTo(0);
      }
    } catch (error: any) {
      console.error("❌ Error fetching Simah Report:", error);
      toast.error(error?.message || "Failed to fetch Simah Report");
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

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return mappedData.slice(startIndex, startIndex + pageSize);
  }, [mappedData, page, pageSize]);

  // ===========================================
  // 🔁 EFFECT HOOK TO FETCH DATA
  // ===========================================
  useEffect(() => {
    if (initialRender && period) {
      fetchSimahReport();
    }
  }, [page, pageSize, loader, initialRender, period]);

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
      toast.error("No data to export");
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
    toast.success("Report exported successfully!");
  };

  // ===========================================
  // 🖥️ RENDER
  // ===========================================
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0">Period:</label>
          <DatePicker
            picker="month"
            value={period}
            onChange={(date) => setPeriod(date)}
            allowClear={false}
            format="YYYY-MM"
          />
        </div>
        <Button
          style={{
            borderRadius: "8px",
            border: "transparent",
          }}
          className="application-btn"
          disabled={mappedData.length === 0}
          onClick={() => exportToCSV(mappedData, `Simah_Report_${dayjs().format("YYYY-MM-DD")}`)}
        >
          Export Report
        </Button>
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
          header={Simah_Report_Header}
          data={paginatedData}
          style={{ borderRadius: "7px" }}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default SimahReport;
