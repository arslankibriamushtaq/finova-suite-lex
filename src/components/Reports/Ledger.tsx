import { useEffect, useState } from "react";
import { DatePicker, Select } from "antd";
import TableView from "../TableView/TableView";
import {
  getLedgerAccount,
  getLedgerReport,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import Loader from "../Loader/Loader";

const Ledger = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<any>(dayjs().startOf('month'));
  const [toDate, setToDate] = useState<any>(dayjs().endOf('month'));
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [responseData, setresponseData] = useState<any>();
  const [loading, setLoading] = useState(false);

  const getAllDaybookReport = [
    {
      name: "S No",
      selector: (row: { Sr: number }) => row.Sr,
      sortable: true,
      width: '70px',
    },
    {
      name: "Account Code",
      selector: (row: { accountCode: string }) => row.accountCode,
    },
    {
      name: "Account",
      selector: (row: { account: string }) => row.account,
    },
    {
      name: "Opening Balance",
      selector: (row: { openingBalance: number }) => row.openingBalance?.toLocaleString() || "0",
    },
    {
      name: "Debit",
      selector: (row: { debit: number }) => row.debit?.toLocaleString() || "0",
    },
    {
      name: "Credit",
      selector: (row: { credit: number }) => row.credit?.toLocaleString() || "0",
    },
    {
      name: "Closing Balance",
      selector: (row: { closingBalance: number }) => row.closingBalance?.toLocaleString() || "0",
    },
  ];

  const mappedData =
    ledgerData &&
    ledgerData?.map((item: any, index: any) => {
      return {
        Sr: (page - 1) * pageSize + index + 1,
        id: item.id || item.accountId,
        transactionDate: item.transactionDate || "-",
        voucherNo: item.voucherNo || "-",
        accountCode: item.accountCode || "-",
        account: item.account || item.accountName || "-",
        debit: item.debit ?? item.totalDebits ?? 0,
        credit: item.credit ?? item.totalCredits ?? 0,
        openingBalance: item.openingBalance ?? 0,
        closingBalance: item.closingBalance ?? 0,
        applicationNo: item.applicationNo || item.applicationNumber || "-",
      };
    });

  const getLedgerReportData = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select a date range");
      return;
    }

    try {
      setLoading(true);
      const res = await getLedgerReport(
        fromDate.format("YYYY-MM-DD"),
        toDate.format("YYYY-MM-DD"),
        selectedAccountCode === "all" ? "" : selectedAccountCode,
        selectedAccountId
      );
      
      if (res?.data) {
        // Handle responses that might have { success: true, data: [...] } or { data: [...] }
        const dataField = res.data.data;
        const rootData = res.data;
        
        let list = [];
        if (Array.isArray(dataField)) {
          list = dataField;
        } else if (dataField?.accounts && Array.isArray(dataField.accounts)) {
          list = dataField.accounts;
        } else if (Array.isArray(rootData)) {
          list = rootData;
        } else if (rootData?.accounts && Array.isArray(rootData.accounts)) {
          list = rootData.accounts;
        } else {
          // Fallback to other common structures
          const potentialData = dataField || rootData;
          list = potentialData?.ledgerListDto || potentialData?.ledgerReportDto || potentialData?.items || [];
        }
        
        setresponseData(dataField || rootData);
        setLedgerData(list);
        
        const totalItems = res?.data?.pageInfo?.totalItems || (res.data.totalAccounts || list.length);
        setTotalRows(totalItems);
        
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      console.error("Error fetching ledger:", error);
      toast.error(error?.message || "Failed to fetch ledger report");
      setLedgerData([]);
    } finally {
      setLoading(false);
    }
  };

  const accountsDetailsForList = async () => {
    try {
      const response = await getLedgerAccount(1, 1000, "");
      if (response?.data?.success) {
        const data = response.data.data || [];
        setCustomerData(data);
      }
    } catch (error: any) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    accountsDetailsForList();
  }, []);

  useEffect(() => {
    getLedgerReportData();
  }, [page, pageSize, fromDate, toDate, selectedAccountCode, selectedAccountId]);

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) return;
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };

  return (
    <>
      {loading && <Loader />}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Ledger Report</h3>
          <div className="d-flex align-items-center gap-2">
             <button
              className="invoice-btn bg-dark text-white px-4"
              onClick={() => exportToCSV(ledgerData, "ledger_report")}
              disabled={ledgerData.length === 0}
            >
              Export CSV
            </button>
            <button 
              className="theme-btn-next px-4" 
              onClick={getLedgerReportData} 
              disabled={loading}
              style={{ height: "42px" }}
            >
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-bold text-muted small uppercase">From Date</label>
            <DatePicker
              value={fromDate}
              onChange={(date) => setFromDate(date)}
              format="YYYY-MM-DD"
              className="w-100"
              size="large"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold text-muted small uppercase">To Date</label>
            <DatePicker
              value={toDate}
              onChange={(date) => setToDate(date)}
              format="YYYY-MM-DD"
              className="w-100"
              size="large"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold text-muted small uppercase">Account</label>
            <Select
              className="w-100"
              size="large"
              placeholder="Select Account"
              value={selectedAccountCode || "all"}
              onChange={(value) => setSelectedAccountCode(value)}
              showSearch
              filterOption={(input, option: any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Select.Option value="all">All Accounts</Select.Option>
              {customerData?.map((option) => (
                <Select.Option key={option.accountCode} value={option.accountCode}>
                  {option.accountCode} - {option.accountName}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="cs-table p-2 bg-white rounded shadow-sm border">
        <TableView
          data={mappedData}
          header={getAllDaybookReport}
          setPage={setPage}
          page={page}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          isLoading={loading}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
        />
        
        {ledgerData?.length > 0 && !loading && (
          <div className="d-flex justify-content-end gap-5 p-4 bg-light border-top rounded-bottom mt-2">
            <div className="text-end">
              <span className="text-muted small uppercase fw-bold d-block mb-1">Total Debit</span>
              <h4 className="mb-0 fw-bold text-dark">{responseData?.totalDebitAmount?.toLocaleString() || "0.00"} <span className="small text-muted">SAR</span></h4>
            </div>
            <div className="text-end">
              <span className="text-muted small uppercase fw-bold d-block mb-1">Total Credit</span>
              <h4 className="mb-0 fw-bold text-dark">{responseData?.toalCreditAmount?.toLocaleString() || "0.00"} <span className="small text-muted">SAR</span></h4>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Ledger;
