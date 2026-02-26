import { useEffect, useState } from "react";
import { FaSearchengin } from "react-icons/fa";
import { Button, Dropdown, Input, Menu, Select } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate } from "react-router-dom";
import {
  getAllInvoices,
  getNextInvoiceNumber,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import Loader from "../Loader/Loader";
import { NumberFormatter } from "../../App";

const InvoiceManagement = () => {
  const [searchValue, setSearchValue] = useState("");
  const [editRowId, setEditRowId] = useState(null);
  const [selectApplicable, setSelectApplicable] = useState<any>();
  const [editFormData, setEditFormData] = useState<any>({});
  const [frozenColumns, setFrozenColumns] = useState<string[]>([]);
  const [allinvoices, setAllinvoices] = useState<any>();
  const [allReason, setAllReason] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [open, setOpen] = useState(false);
  const [initialRendor, setInitialRendor] = useState(false);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const navigate = useNavigate();

  const handleView = (row: any) => {
    alert("View");
    // navigate(`/view/viewdetails/Individuals/${row.CustomerID}`);
  };

  const handleEditClick = (row: any) => {
    // alert("Edit")
    navigate(`/lms/LoanManagement/InvoiceManagement/${row.applicationID}/0`);
    // setEditRowId(row.CustomerID);
    // setEditFormData({ ...row });
    // navigate(`/view/edit/individuals/${row.CustomerID}`);
  };

  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "view") {
      handleView(row);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item
        key="edit"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-receipt-text"
          >
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
            <path d="M14 8H8" />
            <path d="M16 12H8" />
            <path d="M13 16H8" />
          </svg>
        }
      >
        Loan Invoice
      </Menu.Item>
      <Menu.Item
        key="view"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-file-up"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M12 12v6" />
            <path d="m15 15-3-3-3 3" />
          </svg>
        }
      >
        Activity Logs
      </Menu.Item>
    </Menu>
  );
  const customSearchInput = (
    <Input
      placeholder="Search Invoices"
      value={searchValue}
      prefix={<FaSearchengin />}
      onChange={(e: any) => setSearchValue(e.target.value)}
    />
  );
  const button = [
    // { title: "edit", onClick: handleClick },
    // { title: "view", onClick: handleView },
    { title: "Close" },
  ];

  const Customer_ALL_List_Header = [
    {
      name: "Product Name",
      selector: (row: any) => row.productName,
    },
    {
      name: "Application Key",
      selector: (row: any) => row.applicationKey,
    },
    {
      name: "Loan Amount",
      selector: (row: any) => <NumberFormatter value={row.billingTo} />, // Assuming billingTo is the customer name
    },
    {
      name: "Invoice Date",
      selector: (row: any) => new Date(row.invoiceDate).toLocaleDateString(),
      frozen: frozenColumns.includes("Invoice Date"),
    },
    {
      name: "Due Date",
      selector: (row: any) => new Date(row.dueDate).toLocaleDateString(),
      frozen: frozenColumns.includes("Due Date"),
    },
    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const individualCustomer = async () => {
    try {
      setSkelitonLoading(true);
      const requestBody = {
        pageNo: page,
        pageSize: pageSize,
        searchTypes: selectApplicable,
        searchQuery: searchValue,
        from: "2024-06-15T10:30:39.150Z",
        to: new Date(),
      };
      // setLoader(true);
      const res = await getAllInvoices(requestBody);
      if (res) {
        const value = res.data.data;
        setAllinvoices(value || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const enums = {
    Gender: [
      { value: 1, label: "Male" },
      { value: 2, label: "Female" },
      { value: 3, label: "Non_Binary" },
      { value: 4, label: "Prefer_not_to_say" },
    ],
  };
  const getGenderLabel = (value: any) => {
    const gender = enums.Gender.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const handleSubmitInvoice = async () => {
    navigate("/lms/LoanManagement/createInvoice");
    try {
      const res = await getNextInvoiceNumber();
      if (res) {
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const getReasonDescriptionById = (id: any) => {
    const entry: any = allReason?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData =
    // [{
    //   "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "payableStatus": "string",
    //   "accountNumber": "string",
    //   "applicationID": "string",
    //   "invoiceLogo": "string",
    //   "paymentTerms": 1,
    //   "invoiceNumber": "string",
    //   "from": "string",
    //   "billingTo": "string",
    //   "shipTo": "string",
    //   "dueDate": "2024-09-24T07:43:47.954Z",
    //   "poNumber": "string",
    //   "subTotalAmount": 0,
    //   "tax": 0,
    //   "shipping": 0,
    //   "discount": 0,
    //   "notes": "string",
    //   "terms": "string",
    //   "totalAmount": 0,
    //   "addInvoiceDescription": [
    //     {
    //       "item": "string",
    //       "amount": 0
    //     }
    //   ]
    // }];
    //     "loanId": "00000000-0000-0000-0000-000000000000",
    //     "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //     "applicationKey": "",
    //     "loanKey": ""
    allinvoices &&
    allinvoices.map((item: any) => {
      return {
        productName: item.productName || "N/A",
        applicationKey: item.applicationKey || "N/A",
        applicationID: item.applicationId || "N/A",
        billingTo: item.loanAmount || "N/A",
        invoiceDate: item.invoiceDate ? formatDate(item.invoiceDate) : "N/A",
        dueDate: item.dueDate ? formatDate(item.dueDate) : "N/A",
      };
    });
  useEffect(() => {
    if (initialRendor) {
      const timeoutId = setTimeout(() => {
        {
          individualCustomer();
        }
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);
  useEffect(() => {
    individualCustomer();
    setInitialRendor(true);
  }, [page, pageSize]);
  const applicableOption = [
    { label: "Name", value: 0 },
    { label: "Email", value: 1 },
    { label: "NID", value: 3 },
    { label: "LoanId", value: 4 },
    { label: "InvoiceId", value: 5 },
    { label: "ApplicationId", value: 6 },
    { label: "ApplicationNo", value: 7 },
    // { label: "ProductName", value: 8 },
    { label: "LegalName", value: 9 },
    { label: "TaxId", value: 10 },
    { label: "Invoice No", value: 12 },
    { label: "None", value: 11 },
  ];
  return (
    <>
      <div>
        <div className="col-12 d-flex  align-items-center mt-3">
          <div
            className="d-flex align-items-center col-6 justify-content-between mt-1"
            style={{ fontSize: "18px", fontWeight: "Bold" }}
          >
            Invoice Management
          </div>
          <div className="col-6 d-flex justify-content-end">
            <span className="pe-3">
              <Select
                value={selectApplicable}
                onChange={(e: any) => {
                  setSelectApplicable(e);
                }}
                style={{ width: "100%", minWidth: "100px", height: "33px" }}
                placeholder="Search Type"
              >
                {applicableOption?.map((option) => (
                  <Select.Option value={option.value}>
                    {option?.label}
                  </Select.Option>
                ))}
              </Select>
            </span>
            <span className="pe-2">
              <Input
                placeholder="Search"
                value={searchValue}
                prefix={<SearchOutlined />}
                onChange={(e: any) => {
                  setSearchValue(e.target.value);
                }}
              />
            </span>
            <Button
              className="application-btn"
              style={{
                //backgroundColor: "#EB0D0D",
                color: "#ffffff",
                //height: "32px",
                padding: "9px",
                borderRadius: "8px",
                border: "transparent",
              }}
              onClick={handleSubmitInvoice}
            >
              Create Invoice
            </Button>
          </div>
        </div>
        {/* <div className="d-flex col-12 align-items-end mb-3">
          <div className="col-6 d-flex gap-3 align-items-end">
            <div>
              <p>From</p>
              <input
                type="date"
                placeholder="Select"
                style={{
                  height: "42px",
                  width: "242px",
                  padding: "0px 12px",
                  borderRadius: "7px",
                  border: "1px solid lightgray",
                }}
              />
            </div>
            <div>
              <p>To</p>
              <input
                type="date"
                placeholder="Select"
                style={{
                  height: "42px",
                  width: "242px",
                  padding: "0px 12px",
                  borderRadius: "7px",
                  border: "1px solid lightgray",
                }}
              />
            </div>
            <button
              style={{
                backgroundColor: "#363435",
                color: "#ffffff",
                height: "42px",
                padding: "0px 14px",
                borderRadius: "7px",
                border: "transparent",
              }}
              onClick={() => {
              }}
            >
              Clear
            </button>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center gap-3">
            <span className="pe-3">
              <Select
                value={selectApplicable}
                onChange={(e: any) => {
                  setSelectApplicable(e);
                }}
                style={{ width: "100%", height: "33px" }}
                placeholder="Search Type"
              >
                {applicableOption?.map((option) => (
                  <Select.Option value={option.value}>
                    {option?.label}
                  </Select.Option>
                ))}
              </Select>
            </span>
            <span className="pe-2">
              <Input
                placeholder="Search"
                value={searchValue}
                onChange={(e: any) => {
                  setSearchValue(e.target.value);
                }}
              />
            </span>
            <button
              style={{
                backgroundColor: "#EB0D0D",
                color: "#ffffff",
                height: "42px",
                padding: "0px 8px",
                borderRadius: "7px",
                border: "transparent",
              }}
              onClick={handleSubmitInvoice}
            >
              Create Invoice
            </button>
          </div>
        </div> */}

        <div className="cs-table">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            header={Customer_ALL_List_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
          {allinvoices?.length == 0 && (
            <div
              className="d-flex justify-content-center mt-5"
              style={{ color: "red" }}
            >
              No data found
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InvoiceManagement;
