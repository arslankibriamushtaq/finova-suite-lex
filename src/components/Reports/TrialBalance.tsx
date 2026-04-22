import { useEffect, useState, useMemo } from "react";

import { DatePicker } from "antd";
import TableView from "../TableView/TableView";
import { getTrialBalanceReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";
const TrialBalance = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0)
  const [totalRows, setTotalRows] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>([]);
  const [date, setDate] = useState<any>(null);
  const [totals, setTotals] = useState<any>({ totalDebits: 0, totalCredits: 0, difference: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDayBookReprtData();
  }, [page, pageSize, date]);

  const getAllDaybookReport = [
    {
      name: "Account Code",
      selector: (row: any) => row.accountCode,
    },
    {
      name: "Account Name",
      selector: (row: any) => row.accountName,
    },
    {
      name: "Account Type",
      selector: (row: any) => row.accountType,
    },
    {
      name: "Debit Balance",
      selector: (row: any) => row.debitBalance,
    },
    {
      name: "Credit Balance",
      selector: (row: any) => row.creditBalance,
    },
  ];

  const mappedData = useMemo(() => {
    return (Array.isArray(ledgerData) ? ledgerData : []).map((item: any) => {
      return {
        accountCode: item.accountCode || "-",
        accountName: item.accountName || "-",
        accountType: item.accountType || "-",
        debitBalance: item.debitBalance != null ? `${item.debitBalance.toLocaleString()} SAR` : "-",
        creditBalance: item.creditBalance != null ? `${item.creditBalance.toLocaleString()} SAR` : "-",
      };
    });
  }, [ledgerData]);

  const getDayBookReprtData = async () => {
    try {
      setLoading(true);
      const finalDate = date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const response = await getTrialBalanceReport(finalDate);
      if (response && response.data.data) {
        const reportData = response.data.data;
        const accounts = reportData.accounts || [];
        setLedgerData(accounts);
        setTotals({
          totalDebits: reportData.totalDebits || 0,
          totalCredits: reportData.totalCredits || 0,
          difference: reportData.difference || 0,
        });

        const totalItems = accounts.length;
        setTotalRows(totalItems);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) { 
      console.error("Error fetching trial balance:", error);
      setLedgerData([]);
      toast.error("Failed to fetch trial balance");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!mappedData || mappedData.length === 0) {
      alert("No data available to export");
      return;
    }

    // Define CSV headers
    const headers = ["Account Code", "Account Name", "Account Type", "Debit Balance", "Credit Balance"];
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(","), // Header row
      ...mappedData.map((row: any) =>
        [
          `"${row.accountCode || ""}"`,
          `"${row.accountName || ""}"`,
          `"${row.accountType || ""}"`,
          row.debitBalance || 0,
          row.creditBalance || 0,
        ].join(",")
      ),
      ["", "", "TOTALS", totals.totalDebits, totals.totalCredits].join(","),
      ["", "", "DIFFERENCE", "", totals.difference].join(","),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Trial_Balance_${date.format("YYYY-MM-DD")}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">Trial Balance</h5>
          </div>
          {/* <div className="col-2 text-end">
            <button
              className="theme-btn-next"
              onClick={() => {
                setModal(true);
              }}
            >
              Create Voucher
            </button>
          </div> */}
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-center">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label">Date</label>
              <DatePicker
                value={date}
                onChange={(d) => setDate(d)}
                placeholder="Select Date"
              />
            </div>

            {/* Voucher Type Select */}
            <div className="col-md-3">
              {/* <label htmlFor="voucherType" className="form-label">
                Voucher Type
              </label>
              <Select id="voucherType" /> */}
            </div>

            {/* Account Select */}
            <div className="col-md-3">
              {/* <label htmlFor="account" className="form-label">
                Account
              </label>
              <Select id="account" /> */}
            </div>
          </div>
          {/* <div className="col-md-3 mt-3">
            <button
              className="btn btn-primary"
            >
              Search
            </button>
          </div> */}
          <div className="col-2 text-end">
            <button
              className="invoice-btn bg-dark text-white"
              onClick={exportToCSV}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
      <div className="cs-table p-2">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          to={to}
          from={from}
          totalRows={totalRows}
          data={mappedData}
          header={getAllDaybookReport}
          isLoading={loading}
        />
      </div>
      {totals && (
        <div className="mt-3 p-3 bg-light rounded">
          <div className="row">
            <div className="col-md-4">
              <strong>Total Debits:</strong> {totals.totalDebits.toLocaleString()} SAR
            </div>
            <div className="col-md-4">
              <strong>Total Credits:</strong> {totals.totalCredits.toLocaleString()} SAR
            </div>
            <div className="col-md-4 text-danger">
              <strong>Difference:</strong> {totals.difference.toLocaleString()} SAR
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrialBalance;
