import { useEffect, useState } from "react";

import { DatePicker, Select } from "antd";
import TableView from "../TableView/TableView";
import {
  getAllAccountDetails,
  getLedgerAccount,
  getLedgerList,
  getProducts,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import moment from "moment";
import { saveAs } from "file-saver";
const Ledger = () => {
  const [modal, setModal] = useState(false);
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>();
  const [accountData, setAccountData] = useState<any>();
  const [selectedAccountId, setSelectedAccountId] = useState<any>();
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [responseData,setresponseData]=useState<any>();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<any>(null);

  const getAllDaybookReport = [
    {
      name: "S No",
      selector: (row: { Sr: number }) => row.Sr,
      sortable: true,
      width:'60px',
    },
    {
      name: "ID",
      selector: (row: { id: string }) => row.id,
      omit: true, // Hide ID column
    },
     {
      name: "Customer",
      selector: (row: { customer: string }) => row.customer,
    },
    {
      name: "Transaction Date",
      selector: (row: { transactionDate: string }) =>
        formatDate(row.transactionDate),
    },
    {
      name: "Application No",
      selector: (row: { applicationNo: string }) => row.applicationNo,
    },
    {
      name: "Voucher No",
      selector: (row: { voucherNo: string }) => row.voucherNo,
    },
 {
      name: "Account Code",
      selector: (row: { accountCode: string }) => row.accountCode,
    },
    {
      name: "Account",
      cell: (row:any)=>(
        <span>{row.account}</span>
      ),
    },

    {
      name: "Debit",
      selector: (row: { debit: number }) => row.debit,
    },
    {
      name: "Credit",
      selector: (row: { credit: number }) => row.credit,
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
      const resposne = await getLedgerList(
        page,
        pageSize,
        searchValue == "all" ? "" : searchValue,
        formattedFromDate,
        formattedToDate,
        selectedProductId
      );
      if (resposne) {
        const data = resposne.data.data;
        const totalItems = resposne?.data?.pageInfo?.totalItems || 0;
        setTotalRows(totalItems);
        setresponseData(data)
        setLedgerData(data?.ledgerListDto || []);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
        
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (fromDate && toDate) {

      setTimeout(() => {
        getDayBookReprtData();
      }, 200); // Small delay to ensure state is updated
    }
  }, [fromDate, toDate]);

  const accountDetails = async () => {
    try {
      const response = await getAllAccountDetails();
      if (response) {
        if (response) {
          const data = response.data.data;
          setAccountData(data || []);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleSelectChange = (event: any) => {
    const selectedId = event?.target?.value;
    if (selectedId) {
      setSelectedAccountId(selectedId);
    }
  };
  const accountsDetailsForList = async () => {
    try {
      // setLoading(true);
      const response = await getLedgerAccount(1, 1000, searchValue);
      if (response) {
        const valueMain = response?.data?.data || [];
        const data = valueMain?.filter((item: any)=> item.accountName !=="Micro Loan Interest Revenue Account");
        setCustomerData(data);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProductId = async () => {
    try {
      const res = await getProducts();
      if (res) {
        const data = res.data.data;
        setProducts(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const exportToCSV = (data: any[], fileName: string) => {
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
  useEffect(() => {
    accountsDetailsForList();
    accountDetails();
    getProductId();
  }, []);

  useEffect(() => {
    getDayBookReprtData();
  }, [searchValue, page, pageSize, selectedProductId]);
  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h3 className="mb-0">Ledger</h3>
          </div>
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-center">
          <div className="row align-items-center w-75">
            {/* From Date */}
            <div className="col-md-3 d-grid">
              <label htmlFor="fromDate" className="form-label">
                From
              </label>
              <DatePicker
                value={fromDate ? moment(fromDate) : null}
                onChange={(date: any, dateString: string | string[]) => {
                  setFromDate(typeof dateString === 'string' ? dateString : null);
                }}
                // format="YYYY-MM-DD"
                placeholder="Select From Date"
              />
            </div>

            {/* To Date */}
            <div className="col-md-3 d-grid">
              <label htmlFor="toDate" className="form-label">
                To
              </label>
              <DatePicker
                value={toDate ? moment(toDate) : null}
                onChange={(date: any, dateString: string | string[]) => {
                  setToDate(typeof dateString === 'string' ? dateString : null);
                }}
                // format="YYYY-MM-DD"
                placeholder="Select To Date"
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="Accounts" className="form-label">
                Accounts
              </label>
              <Select
                // style={{ width: "100%" }}
                size="middle"
                className="ledger-account"
                placeholder="Select Account Name"
                onChange={(value) => setSearchValue(value)}
              >
                <Select.Option value="all">
                  <div
                    onChange={(e: any) => {
                      setSearchValue(e.target.value);
                    }}
                  >
                    All
                  </div>
                </Select.Option>
                {customerData?.map((option) => (
                  <Select.Option
                    key={option.accountCode}
                    value={option.accountCode}
                  >
                    <div
                      onChange={(e: any) => {
                        setSearchValue(e.target.value);
                      }}
                    >
                      {option?.accountName}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="col-md-3">
              <label htmlFor="Product" className="form-label">
                Product
              </label>
              <Select
                size="middle"
                className="ledger-product"
                placeholder="Select Product"
                value={selectedProductId}
                onChange={(value) => setSelectedProductId(value || null)}
                allowClear
              >
                {products?.map((product: any) => (
                  <Select.Option key={product.id} value={product.id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="col-2 text-end mt-4">
            <button
              className="invoice-btn bg-dark text-white"
               onClick={() => {
                exportToCSV(ledgerData, "ledgerData");
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="cs-table p-2">
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
          paginationRowsPerPageOptions={[10,20,50,100]}
        />
        {
          ledgerData?.length !== 0 && !loading &&
         <div className="d-flex justify-content-between p-3 border-top border-bottom">
        <strong>Overall Total</strong>
        <span className="d-flex gap-4">
          <strong>Debit: {responseData?.totalDebitAmount}</strong><strong>Credit: {responseData?.toalCreditAmount}</strong>
          </span>
      </div>
        }
        {ledgerData?.length == 0 && !loading && (
          <div className="d-flex justify-content-center mt-5 bg-red">
            No data found
          </div>
        )}
      </div>
    </>
  );
};

export default Ledger;
