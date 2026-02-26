import { useState, useEffect, useMemo } from "react";
import { Button } from "antd";
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

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const Simah_Report_Header = [
    { 
      name: "Contract Number", 
      selector: (row: any) => row.contractNumber,
      sortable: true,
      width: "150px"
    },
    { 
      name: "Consumer ID", 
      selector: (row: any) => row.consumerId,
      sortable: true,
      width: "130px"
    },
    { 
      name: "Full Name", 
      selector: (row: any) => row.fullNameEnglish,
      sortable: true,
      width: "150px"
    },
    { 
      name: "Product Type", 
      selector: (row: any) => row.productType,
      sortable: true,
      width: "150px"
    },
    { 
      name: "Product Status", 
      selector: (row: any) => row.productStatus,
      sortable: true,
      width: "140px"
    },
    { 
      name: "Original Amount", 
      selector: (row: any) => row.productLimitOrOriginalAmount ? `${row.productLimitOrOriginalAmount.toFixed(2)} SAR` : "-",
      sortable: true,
      width: "150px"
    },
    { 
      name: "Total Leasing Amount", 
      selector: (row: any) => row.totalLeasingAmount ? `${row.totalLeasingAmount.toFixed(2)} SAR` : "-",
      sortable: true,
      width: "170px"
    },
    { 
      name: "Instalment Amount", 
      selector: (row: any) => row.instalmentAmount ? `${row.instalmentAmount.toFixed(2)} SAR` : "-",
      sortable: true,
      width: "160px"
    },
    { 
      name: "Tenure", 
      selector: (row: any) => row.tenure,
      sortable: true,
      width: "120px"
    },
    { 
      name: "Issue Date", 
      selector: (row: any) => row.issueDate,
      sortable: true,
      width: "130px"
    },
    { 
      name: "Expiry Date", 
      selector: (row: any) => row.productExpiryDate,
      sortable: true,
      width: "130px"
    },
    { 
      name: "Last Payment Date", 
      selector: (row: any) => row.lastPaymentDate,
      sortable: true,
      width: "150px"
    },
    { 
      name: "Last Amount Paid", 
      selector: (row: any) => row.lastAmountPaid ? `${row.lastAmountPaid.toFixed(2)} SAR` : "-",
      sortable: true,
      width: "160px"
    },
    { 
      name: "Payment Method", 
      selector: (row: any) => row.preferredMethodOfPayment,
      sortable: true,
      width: "150px"
    },
    { 
      name: "Payment Type", 
      selector: (row: any) => row.paymentType,
      sortable: true,
      width: "150px"
    },
    { 
      name: "ID Type", 
      selector: (row: any) => row.idType,
      sortable: true,
      width: "130px"
    },
    { 
      name: "Gender", 
      selector: (row: any) => row.gender,
      sortable: true,
      width: "100px"
    },
    { 
      name: "Marital Status", 
      selector: (row: any) => row.maritalStatus,
      sortable: true,
      width: "130px"
    },
    { 
      name: "Date of Birth", 
      selector: (row: any) => row.dateOfBirth,
      sortable: true,
      width: "130px"
    },
    { 
      name: "Applicant Type", 
      selector: (row: any) => row.applicantType,
      sortable: true,
      width: "140px"
    },
  ];

  // ================================
  // 📡 API CALL
  // ================================
  const fetchSimahReport = async () => {

    try {
      setLoading(true);

      const response = await getSimahReport();


      const apiData = response?.data?.data;

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

  const mappedData =
    ledgerData?.map((item: any) => ({
      creditInstrumentNumber: item.creditInstrumentNumber || "-",
      contractNumber: item.contractNumber || "-",
      consumerId: item.consumerId || "-",
      fullNameEnglish: item.fullNameEnglish || "N/A",
      fullNameArabic: item.fullNameArabic || "N/A",
      productType: item.productType || "-",
      productStatus: item.productStatus || "-",
      productLimitOrOriginalAmount: item.productLimitOrOriginalAmount || 0,
      totalLeasingAmount: item.totalLeasingAmount || 0,
      instalmentAmount: item.instalmentAmount || 0,
      tenure: item.tenure || "-",
      issueDate: formatDate(item.issueDate),
      productExpiryDate: formatDate(item.productExpiryDate),
      lastPaymentDate: formatDate(item.lastPaymentDate),
      lastAmountPaid: item.lastAmountPaid || 0,
      preferredMethodOfPayment: item.preferredMethodOfPayment || "-",
      paymentType: item.paymentType || "-",
      paymentStatus: item.paymentStatus || "-",
      idType: item.idType || "-",
      gender: item.gender || "-",
      maritalStatus: item.maritalStatus || "-",
      dateOfBirth: formatDate(item.dateOfBirth),
      applicantType: item.applicantType || "-",
      applicantPaymentStatus: item.applicantPaymentStatus || "-",
      outstandingBalance: item.outstandingBalance || 0,
      pastDueBalance: item.pastDueBalance || 0,
    })) || [];

  // ===========================================
  // 🔁 EFFECT HOOK TO FETCH DATA
  // ===========================================
  useEffect(() => {
    if (initialRender) {
      fetchSimahReport();
    }
  }, [page, pageSize, loader, initialRender]);

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
      "Credit Instrument Number": item.creditInstrumentNumber,
      "Contract Number": item.contractNumber,
      "Consumer ID": item.consumerId,
      "Full Name (English)": item.fullNameEnglish,
      "Full Name (Arabic)": item.fullNameArabic,
      "Product Type": item.productType,
      "Product Status": item.productStatus,
      "Original Amount (SAR)": item.productLimitOrOriginalAmount,
      "Total Leasing Amount (SAR)": item.totalLeasingAmount,
      "Instalment Amount (SAR)": item.instalmentAmount,
      "Tenure": item.tenure,
      "Issue Date": item.issueDate,
      "Expiry Date": item.productExpiryDate,
      "Last Payment Date": item.lastPaymentDate,
      "Last Amount Paid (SAR)": item.lastAmountPaid,
      "Payment Method": item.preferredMethodOfPayment,
      "Payment Type": item.paymentType,
      "Payment Status": item.paymentStatus,
      "ID Type": item.idType,
      "Gender": item.gender,
      "Marital Status": item.maritalStatus,
      "Date of Birth": item.dateOfBirth,
      "Applicant Type": item.applicantType,
      "Applicant Payment Status": item.applicantPaymentStatus,
      "Outstanding Balance (SAR)": item.outstandingBalance,
      "Past Due Balance (SAR)": item.pastDueBalance,
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
      <div className="d-flex justify-content-end mt-2">
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
          data={mappedData}
          style={{ borderRadius: "7px" }}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default SimahReport;
