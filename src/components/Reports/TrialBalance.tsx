import { useEffect, useState } from "react";

import { DatePicker } from "antd";
import TableView from "../TableView/TableView";
import { getTrialList } from "../../redux/apis/apisCrudLms";
const TrialBalance = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0)
  const [totalRows, setTotalRows] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getDayBookReprtData();
  }, [page, pageSize]);

  const getAllDaybookReport = [
    {
      name: "Particular",
      selector: (row: { particular: string }) => row.particular,
    },
    {
      name: "Opening Balance",
      selector: (row: { openingBalance: number }) => row.openingBalance,
    },
    {
      name: "Debit",
      selector: (row: { debit: number }) => row.debit,
    },
    {
      name: "Credit",
      selector: (row: { credit: number }) => row.credit,
    },
    {
      name: "Closing Balance",
      selector: (row: { closingBalance: number }) => row.closingBalance,
    },
  ];

  const mappedData =
    ledgerData &&
    ledgerData.map((item: any) => {
      return {
        id: item.id,
        particular: item.particular,
        openingBalance: item.openingBalance,
        debit: item.debit,
        credit: item.credit,
        closingBalance: item.closingBalance,
      };
    });

  const getDayBookReprtData = async () => {
    try {
      setLoading(true);
      const resposne = await getTrialList(page, pageSize);
      if (resposne) {
        const data = resposne.data.data;

        const totalItems = resposne?.data?.pageInfo?.totalItems || 0;
        setLedgerData(data);
        setTotalRows(totalItems);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) { 
      setLoading(false);
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
    const headers = ["Particular", "Opening Balance", "Debit", "Credit", "Closing Balance"];
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(","), // Header row
      ...mappedData.map((row: any) =>
        [
          `"${row.particular || ""}"`,
          row.openingBalance || 0,
          row.debit || 0,
          row.credit || 0,
          row.closingBalance || 0,
        ].join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Trial_Balance_${new Date().toISOString().slice(0, 10)}.csv`);
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
            {/* From Date */}
            <div className="col-md-4">
              <label htmlFor="fromDate" className="form-label">
                From
              </label>
              <DatePicker />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                To
              </label>
              <DatePicker />
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
              className="invoice-btn bg-dark"
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
    </>
  );
};

export default TrialBalance;
