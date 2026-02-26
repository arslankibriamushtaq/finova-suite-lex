import { useEffect, useState } from "react";
import { DatePicker, Dropdown, Input, Menu, Select } from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { getPartnerAllApplications, leadsList } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, SyncOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
const PartnerAllApplication = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const navigate = useNavigate();

  const Activity_Loans_Header = [
    {
      name: "Application No.",
      selector: (row: any) => row.applicationNumber,
      sortable: true,
      width: "220px",
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName,
      sortable: true,
      width: "220px",
    },
    {
      name: "Product",
      selector: (row: any) => row.product,
      sortable: true,
      width: "200px",
    },
    {
      name: "Phone No.",
      selector: (row: any) => row.phoneNo,
      sortable: true,
      width: "140px",
    },
    {
      name: "Email",
      selector: (row: any) => row.email,
      sortable: true,
      width: "260px",
    },
    {
      name: "Application Date",
      selector: (row: any) => row.applicationDate,
      sortable: true,
      width: "220px",
    },
    {
      name: "Financing Amount",
      selector: (row: any) => row.financingAmount,
      sortable: true,
      width: "190px",
    },
    {
      name: "Parent Status",
      cell: (row: any) => (
        <span
          style={{
            backgroundColor:
              row.parentStatus === "In Progress" ? "#ffc107" : "#adb5bd",
            padding: "4px 12px",
            borderRadius: 6,
            color: "#000",
            fontWeight: 500,
            fontSize: 12,
          }}
        >
          {row.parentStatus}
        </span>
      ),
      sortable: true,
      width: "160px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            backgroundColor: "#6c757d",
            padding: "4px 12px",
            borderRadius: 6,
            color: "#fff",
            fontWeight: 500,
            fontSize: 12,
          }}
        >
          {row.status}
        </span>
      ),
      sortable: true,
      width: "280px",
    },
    // (Optional) keep Actions if you still need it
    // {
    //   name: "Action",
    //   cell: (row: any) => (
    //     <Dropdown overlay={menu(row)} trigger={["click"]}>
    //       <Button className="gradient-btn" type="primary">
    //         Select <img src={arrowDown} alt="" />
    //       </Button>
    //     </Dropdown>
    //   ),
    //   width: "140px",
    // },
  ];

  // const Activity_Loans_Data = [
  //   {
  //     applicationNumber: "FVAN-9518132543",
  //     customerName: "شركة XXX المحدودة",
  //     product: "Invoice Factoring",
  //     phoneNo: "--",
  //     email: "usman.arshad+03@xintsolutions.com",
  //     applicationDate: "08 July, 2025 01:45 PM",
  //     financingAmount: "SR 0.00",
  //     parentStatus: "In Progress",
  //     status: "FACTORING-AMOUNT-APPROVED",
  //   },
  //   {
  //     applicationNumber: "FVAN-3470962978",
  //     customerName: "شركة XXX المحدودة",
  //     product: "Invoice Factoring",
  //     phoneNo: "--",
  //     email: "usman.arshad+76543@xintsolutions.com",
  //     applicationDate: "08 July, 2025 01:29 PM",
  //     financingAmount: "SR 0.00",
  //     parentStatus: "In Progress",
  //     status: "FACTORING-AMOUNT-APPROVED",
  //   },
  //   {
  //     applicationNumber: "FVAN-8461525774",
  //     customerName: "--",
  //     product: "Tawarruq Individual",
  //     phoneNo: "--",
  //     email: "salmanahmad2905@gmail.com",
  //     applicationDate: "07 July, 2025 03:25 PM",
  //     financingAmount: "SR 250,000.00",
  //     parentStatus: "Pending",
  //     status: "--",
  //   },
  //   {
  //     applicationNumber: "FVAN-9526800272",
  //     customerName: "شركة XXX المحدودة",
  //     product: "QuickFinance",
  //     phoneNo: "--",
  //     email: "salmanahmad2905@gmail.com",
  //     applicationDate: "03 July, 2025 03:14 PM",
  //     financingAmount: "SR 12,345,677.00",
  //     parentStatus: "Pending",
  //     status: "--",
  //   },
  // ];

  //   const menu = (row: any) => (
  //     <Menu>
  //       <Menu.Item
  //         key="view"
  //         icon={<EyeOutlined />}
  //         onClick={() => handleMenuClick("view", row)}
  //       >
  //         View
  //       </Menu.Item>
  //       <Menu.Item
  //         key="Invoices"
  //         icon={<EyeOutlined />}
  //         onClick={() => handleMenuClick("Invoices", row)}
  //       >
  //         Invoices
  //       </Menu.Item>
  //       <Menu.Item
  //         key="Documents"
  //         icon={<EyeOutlined />}
  //         onClick={() => handleMenuClick("Documents", row)}
  //       >
  //         Documents
  //       </Menu.Item>
  //       <Menu.Item
  //         key="ActivityLogs"
  //         icon={<EyeOutlined />}
  //         onClick={() => handleMenuClick("ActivityLogs", row)}
  //       >
  //         Activity Logs
  //       </Menu.Item>
  //       <Menu.Item
  //         key="ResendLoginEmail"
  //         icon={<EyeOutlined />}
  //         onClick={() => handleMenuClick("ResendLoginEmail", row)}
  //       >
  //         Resend Login Email
  //       </Menu.Item>
  //       <Menu.Item
  //         key="RetryKastleEntry"
  //         icon={<SyncOutlined />}
  //         onClick={() => handleMenuClick("RetryKastleEntry", row)}
  //       >
  //         Retry Kastle Entry
  //       </Menu.Item>
  //     </Menu>
  //   );
  //   const handleMenuClick = (key: string, row: any) => {
  //     switch (key) {
  //       case "view":
  //         navigate(`/FinancingApplications/AllApplications/View/${row.Sr}`);
  //         break;
  //       case "Invoices":
  //         navigate(`/FinancingApplications/AllApplications/Invoices/${row.Sr}`);
  //         break;
  //       case "Documents":
  //         navigate(`/FinancingApplications/AllApplications/Documents/${row.Sr}`);
  //         break;
  //       case "ActivityLogs":
  //         navigate(
  //           `/FinancingApplications/AllApplications/ActivityLogs/${row.Sr}`
  //         );
  //         break;
  //       case "ResendLoginEmail":
  //         // Trigger resend logic here
  //         break;
  //       case "RetryKastleEntry":
  //         // Retry Kastle logic
  //         break;
  //       default:
  //         console.warn("Unknown action:", key);
  //     }
  //   };

  const getApplicationsList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getPartnerAllApplications(page, pageSize);
      if (response) {
        const data = response?.data?.data?.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page);
        setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getApplicationsList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item.id,
        Sr: index + from,
        phone: item?.phone,
        cnic: item?.cnic || "-",
        accountBalance: item?.balance,
        UpdatedBy: item?.updated_at,
        accountType: item?.user_type || "-",
        accountStatus: item?.accountStatus,
        status: item?.status,
      };
    });
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "Leads.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "ID",
      "Phone",
      "Cnic",
      "Total Balance",
      "Register Date",
      "Type",
      "Status",
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.id,
      item.phone,
      item.cnic || "-",
      item.accountBalance,
      item.UpdatedBy,
      item.accountType || "-",
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Leads.pdf");
  };
  const [selectedValue, setSelectedValue] = useState("today");
  const items = [
    { key: "1", label: "View Details" },
    { key: "2", label: "Change Status" },
  ];
  return (
    <div className="service ">
      <div className="d-flex justify-content-end col-12 filter-select">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          // onChange={handleChange}
          placeholder="Filter"
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}

          // options={options}
        />

        <div className="d-flex gap-2 w-100" style={{ height: 40 }}>
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder="Search..."
            />
          </div>
          <div className="d-flex align-items-center">
            <div
              className="d-flex gap-1 p-2"
              style={{ paddingLeft: "0px !important" }}
            >
              {" "}
              <Select>search</Select>
              <DatePicker
                className="date-picker"
                placeholder="From"
                value={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  dispatch(
                    authSlice.actions.setFromFilter({
                      fromFilter: formatDate(date ? date : null),
                    })
                  );
                }}
                allowClear
              />
              <DatePicker
                className="date-picker"
                placeholder="To"
                value={toDate}
                onChange={(date) => {
                  setToDate(date);
                  dispatch(
                    authSlice.actions.setToFilter({
                      toFilter: formatDate(date),
                    })
                  );
                  setSelectedValue(!toDate ? "" : "today");
                  dispatch(authSlice.actions.setTheme({ theme: "" }));
                }}
                allowClear
              />
            </div>
          </div>
          <button className="theme-btn-next" onClick={exportToExcel}>
            Export CSV
          </button>
        </div>
      </div>
      <div className="p-2">
        <TableView
          header={Activity_Loans_Header}
          data={mappedData}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
      </div>
    </div>
  );
};

export default PartnerAllApplication;
