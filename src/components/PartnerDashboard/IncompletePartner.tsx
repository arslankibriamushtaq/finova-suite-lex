import { useEffect, useState } from "react";
import { Button, DatePicker, Dropdown, Menu, Select } from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { getIncompletePartnerApplications } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import arrowDown from "../../assets/images/arrow-down.png";

const IncompletePartner = () => {
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
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
      width: "180px",
    },
    {
      name: "Phone No.",
      selector: (row: any) => row.phoneNo ?? "--",
      sortable: true,
      width: "120px",
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
      width: "180px",
    },

    {
      name: "Parent Status",
      cell: (row: any) => (
        <span
          style={{
            backgroundColor:
              row.parentStatus === "INCOMPLETE" ? "#ffc107" : "#adb5bd",
            padding: "4px 12px",
            borderRadius: 2,
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
            borderRadius: 2,
            color: "#fff",
            fontWeight: 500,
            fontSize: 12,
          }}
        >
          {row.status}
        </span>
      ),
      sortable: true,
      width: "260px",
    },

    {
      name: "Reason",
      selector: (row: any) => row.reason ?? "--",
      sortable: true,
      width: "200px",
    },
    {
      name: "Reason from Partner",
      selector: (row: any) => row.reasonFromPartner ?? "--",
      sortable: true,
      width: "220px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            // className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#EB0D0D",
              color: "#ffffff",
              borderRadius: "2px",
              padding: "6px 16px",
              fontSize: "12px",
            }}
          >
            Action <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
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
  //     reason: "--",
  //     reasonFromPartner: "--",
  //   },
  // ];

  
  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined/>}
        onClick={() => handleMenuClick("view", row)}
      >
        View Details
      </Menu.Item>
    </Menu>
  );
  const handleMenuClick = (action: string, row: any) => {
    switch (action) {
      case "view":
        navigate(`/partner/PendingApplication/${row.applicationNumber}`);

        break;
    }
  };
  const getData = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getIncompletePartnerApplications(page, pageSize);
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
    getData();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index: any) => {
      return {
        id: item.id,
        Sr: index + from,
        applicationNumber: item?.loan_application_number,
        customerName: item?.customer_name,
        product: item?.product_name,
        phoneNo: item?.phone,
        email: item?.email,
        applicationDate: item?.application_date,
        financingAmount: item?.financing_amount,
        parentStatus: item?.parent_status,
        status: item?.status ?? "--",
        reason: item?.reason ?? "--",
        reasonFromPartner: item?.reason_from_partner ?? "--",
      };
    });

  return (
    <div className="service">
      <div className="d-flex justify-content-end  col-12">
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
                  dispatch(authSlice.actions.setTheme({ theme: "" }));
                }}
                allowClear
              />
            </div>
          </div>
          <button className="theme-btn-next">Export CSV</button>
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

export default IncompletePartner;
