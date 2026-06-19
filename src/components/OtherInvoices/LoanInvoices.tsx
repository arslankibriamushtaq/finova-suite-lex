import { useEffect, useState } from "react";
import { FaSearchengin } from "react-icons/fa";
import { Button, Dropdown, Input, Menu } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate } from "react-router-dom";
import { getAllInvoices } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

import { DownOutlined, EyeOutlined } from "@ant-design/icons";
import { NumberFormatter } from "../../App";

const LoanInvoices = () => {
  const [searchValue, setSearchValue] = useState("");
  const [editRowId, setEditRowId] = useState(null);
  const [selectApplicable, setSelectApplicable] = useState<any>();
  const [editFormData, setEditFormData] = useState<any>({});
  const [frozenColumns, setFrozenColumns] = useState<string[]>([]);
  const [allinvoices, setAllinvoices] = useState<any>();
  const [allReason, setAllReason] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [open, setOpen] = useState(false);
  const [initialRendor, setInitialRendor] = useState(false);
  const navigate = useNavigate();

  const handleView = (row: any) => {
    alert("View");
    // navigate(`/view/viewdetails/Individuals/${row.CustomerID}`);
  };

  const handleEditClick = (row: any) => {
    // alert("Edit")
    navigate(`/lms/LoanManagement/InvoiceManagement/${row.applicationID}/1`);
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
          <EyeOutlined/>
        }
      >
       View
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
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const [loader, setLoader] = useState<boolean>(false);
  const individualCustomer = async () => {
    try {
      setLoader(true);
      const requestBody = {
        pageNo: page,
        pageSize: 10,
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
      setLoader(false);
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

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData =
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

  return (
    <>
      <div>
        <div className="cs-table p-2">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Customer_ALL_List_Header}
            data={mappedData}
            isLoading={loader}
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

export default LoanInvoices;
