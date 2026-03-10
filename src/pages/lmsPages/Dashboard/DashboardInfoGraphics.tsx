import { useEffect, useState } from "react";
import { Col, Card } from "antd";
import { UserOutlined } from "@ant-design/icons";
import BarChart from "../../../components/lmsComponents/BarChart";
import LineChart from "../../../components/lmsComponents/LineChart";
// import PieChart from "../../../components/Dashboard/PieChart";
import TableView from "../../../components/TableView/TableView";
import FinanceBarChart from "../../../components/lmsComponents/FinanceBarChart";
import {
  getAllBusinessAndIndividualCustomer,
  // getBuisnessAndIndividualCustomerGraph,
  getDashboardInformation,
  getLedgerAccount,
} from "../../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { Images } from "../../../components/Config/Images";
import { themeStyle } from "../../../components/Config/Theme";
import PulseLoading from "../../../components/Loader/PulseLoader";
import NoLedgerAccountModal from "../../../components/ChartOfAccount/NoLedgerAccount";
import { createGlobalStyle } from "styled-components";
import { DatePicker, Radio } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const Dashboard = () => {
  // const [customers, setCustomers] = useState<any>([]);
  const [allTypeCustomer, setAllTypeCustomer] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loader, setLoader] = useState(false);
  const [ledgerData, setLedgerData] = useState<any>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const [radioValue, setRadioValue] = useState("last-month");
  const [dashboardData, setDashboardData] = useState<any>();
  const [fromPicker, setFromPicker] = useState(null);
  const [toPicker, setToPicker] = useState(null);

  useEffect(() => {
    dashboardInformation();
  }, [fromDate, toDate]);
  useEffect(() => {
    handleRangeChange("last-month");
  }, []);

  // Function to format numeric values to max 2 decimal places
  const formatNumericValue = (value: any): string | number => {
    // Return as-is if value is null, undefined, or not a number
    if (value === null || value === undefined || value === "") {
      return value;
    }
    
    // Convert to number if it's a string
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    
    // Return as-is if it's not a valid number
    if (isNaN(numValue)) {
      return value;
    }
    
    // Format to max 2 decimal places (removes trailing zeros)
    const formatted = parseFloat(numValue.toFixed(2));
    
    // Return as integer if it's a whole number, otherwise return with decimals
    return formatted % 1 === 0 ? formatted.toString() : formatted.toFixed(2);
  };

  const handleRangeChange = (value: string) => {
    setRadioValue(value);
    setFromPicker(null);
    setToPicker(null);

    if (value === "today") {
      // Ensure we're working with the local time and set 'from' to today at 00:00:00
      setFromDate(dayjs()?.local()?.startOf("day"));
      // Set 'to' to today at 23:59:59
      setToDate(dayjs()?.local()?.endOf("day"));
    } else if (value === "last-week") {
      // Set 'from' to 7 days ago at 00:00:00 (local time)
      setFromDate(dayjs()?.subtract(7, "days")?.local()?.startOf("day"));
      // Set 'to' to today at 23:59:59 (local time)
      setToDate(dayjs()?.local()?.endOf("day"));
    } else if (value === "last-month") {
      // Set 'from' to 1 month ago at 00:00:00 (local time)
      setFromDate(dayjs().subtract(1, "month").local().startOf("day"));
      // Set 'to' to today at 23:59:59 (local time)
      setToDate(dayjs()?.local()?.endOf("day"));
    }
  };

  const dashboardInformation = async () => {
    // API calls commented out temporarily
    // setLoader(true);
    // try {
    //   const body = {
    //     from: fromDate ? fromDate.toISOString() : null,
    //     to: toDate ? toDate.toISOString() : null,
    //   };

    //   const res = await getDashboardInformation(body);
    //   if (res?.data?.data) {
    //     const data = res?.data?.data;
    //     // Format all numeric values in the response
    //     const formattedData = {
    //       ...data,
    //       totalCustomers: formatNumericValue(data.totalCustomers),
    //       individualCount: formatNumericValue(data.individualCount),
    //       businessCount: formatNumericValue(data.businessCount),
    //       receivedAmount: formatNumericValue(data.receivedAmount),
    //       nonPerformingAmount: formatNumericValue(data.nonPerformingAmount),
    //       receivableAmount: formatNumericValue(data.receivableAmount),
    //       dueAmount: formatNumericValue(data.dueAmount),
    //       earlySettlementAmount: formatNumericValue(data.earlySettlementAmount),
    //       overDueAmount: formatNumericValue(data.overDueAmount),
    //       disbursedAmount: formatNumericValue(data.disbursedAmount),
    //     };
    //     setDashboardData(formattedData);
    //   }
    // } catch (error: any) {
    //   toast.error(error?.message);
    // } finally {
    //   setLoader(false);
    // }
  };

  // API calls commented out temporarily
  // useEffect(() => {
  //   const fetchLedgerAccount = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await getLedgerAccount(1, 10000, "");

  //       if (response) {
  //         const data = response.data.data;
  //         if (!data || data.length === 0) {
  //           setIsModalVisible(true); // Show modal if no ledger accounts exist
  //         } else {
  //           setLedgerData(data);
  //         }
  //       }
  //     } catch (error: any) {
  //       toast.error(error?.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchLedgerAccount();
  // }, []);

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const Customer_ALL_List_Header = [
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
    },
    {
      name: "Type",
      selector: (row: { type: any }) => row.type,
    },
    {
      name: "Partner Name",
      selector: (row: { partnerName: any }) => row.partnerName,
    },
    {
      name: "Customer ID",
      selector: (row: { nationalId: any }) => row.nationalId,
    },
    {
      name: "Email",
      selector: (row: { email: any }) =>
        row.email.trim() !== "" ? row.email : "-",
    },
    {
      name: "Status",

      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "12px",
            backgroundColor: row.status
              ? "var(--color-status-green)"
              : "var(--color-status-dark)",
            color: "var(--primary-foreground)",
            cursor: row.status ? "pointer" : "default",
          }}
        >
          {row.status ? "Active" : "Inactive"}
        </div>
      ),
    },
  ];
  const getAllTypeCustomers = async () => {
    // API calls commented out temporarily
    // try {
    //   const res = await getAllBusinessAndIndividualCustomer(page, 10);
    //   if (res && res.data && res.data.data) {
    //     const values = res.data.data;
    //     setAllTypeCustomer(values);
    //     setTotalRows(res?.data?.pageInfo?.totalItems || 0);
    //   }
    // } catch (error: any) {
    //   toast.error(error?.message);
    //   // setIndividualModal(false);
    // }
  };
  const mappedData =
    allTypeCustomer &&
    allTypeCustomer.map((item: any) => {
      return {
        CustomerID: item.customerId,
        name: item.name,
        type: item.type,
        nationalId: item.nationalId,
        partnerName: item.channel,
        email: item.email,
        status: item.status,
      };
    });
  useEffect(() => {
    // getCustomer();
    getAllTypeCustomers();
  }, [page, pageSize]);
  useEffect(() => {
    if (fromDate && toDate) {
      dashboardInformation();
    }
  }, [fromDate, toDate]);
  const cardsData = dashboardData
    ? [
        {
          title: "All Customers",
          value: dashboardData.totalCustomers || 0,
          icon: <UserOutlined style={{ fontSize: "24px" }} />,
          subtitle1: "Individuals",
          value1: dashboardData.individualCount || 0,
          // subtitle2: "Business",
          // value2: dashboardData.businessCount || 0,
          cardType: "highlight",
        },
      ]
    : [
        {
          title: "All Customers",
          value: 8,
          icon: <UserOutlined style={{ fontSize: "24px" }} />,
          subtitle1: "Individuals",
          value1: 2,
          // subtitle2: "Business",
          // value2: 6,
          cardType: "highlight",
        },
      ];
  const loans = [
    {
      title: "Received Loans",
      value: dashboardData?.receivedAmount || 0,
      title1: "Non Performing Loans",
      value1: dashboardData?.nonPerformingAmount || 0,
    },
    {
      title: "Receivable Loan",
      value: dashboardData?.receivableAmount || 0,
      title1: "Due Loans",
      value1: dashboardData?.dueAmount || 0,
    },

    {
      title: "Early Settlements",
      value: dashboardData?.earlySettlementAmount || 0,
      title1: "Over Due Loans",
      value1: dashboardData?.overDueAmount || 0,
    },
  ];
  const distributedAmount = [
    {
      title: "Disbured Amount",
      value: dashboardData?.disbursedAmount || 0,
      icon: <img src={Images.disburedIcon} alt="" />,
      extraInfo: "+12%",
      cardType: "default",
    },
  ];
  const producer = [
    {
      title: "Total Vendors",
      value: "1",
      icon: (
        <svg
          filter="invert(1)"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M25.3333 2.66602C25.687 2.66602 26.0261 2.80649 26.2762 3.05654C26.5262 3.30659 26.6667 3.64573 26.6667 3.99935V27.9993C26.6667 28.353 26.5262 28.6921 26.2762 28.9422C26.0261 29.1922 25.687 29.3327 25.3333 29.3327H6.66668C6.31305 29.3327 5.97392 29.1922 5.72387 28.9422C5.47382 28.6921 5.33334 28.353 5.33334 27.9993V3.99935C5.33334 3.64573 5.47382 3.30659 5.72387 3.05654C5.97392 2.80649 6.31305 2.66602 6.66668 2.66602H25.3333ZM24 5.33268H8.00001V26.666H24V5.33268ZM16 9.33268C17.4507 9.33252 18.8618 9.80556 20.0193 10.68C21.1768 11.5545 22.0175 12.7826 22.4138 14.1781C22.8101 15.5736 22.7404 17.0603 22.2153 18.4126C21.6902 19.7649 20.7383 20.909 19.504 21.6713L16.6667 15.9993H20C20 15.2082 19.7654 14.4349 19.3259 13.7771C18.8864 13.1193 18.2616 12.6066 17.5307 12.3038C16.7998 12.0011 15.9956 11.9219 15.2196 12.0762C14.4437 12.2305 13.731 12.6115 13.1716 13.1709C12.6122 13.7303 12.2312 14.4431 12.0769 15.219C11.9225 15.9949 12.0017 16.7992 12.3045 17.5301C12.6072 18.261 13.1199 18.8857 13.7777 19.3252C14.4355 19.7648 15.2089 19.9993 16 19.9993L17.2733 22.5447C16.8609 22.6247 16.4365 22.6651 16 22.666C14.2319 22.666 12.5362 21.9636 11.286 20.7134C10.0357 19.4632 9.33334 17.7675 9.33334 15.9993C9.33334 14.2312 10.0357 12.5355 11.286 11.2853C12.5362 10.0351 14.2319 9.33268 16 9.33268Z"
            fill="white"
          />
        </svg>
      ),
      cardType: "default",
    },
  ];
  const GlobalStyle = createGlobalStyle`
  .header_layout {
    background: ${themeStyle?.headerColor.dashboardHeaderBgColor} !important;
  }
  .subheader_layout {
    background: ${themeStyle?.headerColor.dashboardSubheaderBgColor} !important;
  }
`;
  return (
    <>
      <div className="dashboard">
        {isModalVisible && (
          <NoLedgerAccountModal
            isVisible={isModalVisible}
            onClose={handleCloseModal}
          />
        )}
        <div style={{backgroundColor:'var(--color-border-disabled)'}}>
          <div className="d-flex align-items-center justify-content-between">
            <div
              className="d-flex align-items-center ms-2"
              style={{ fontWeight: "600", fontSize: "20px", color: "var(--foreground)" }}
            >
              Overview
            </div>
            <div className="d-flex align-items-center">
              <Radio.Group
                value={radioValue}
                onChange={(e) => handleRangeChange(e.target.value)}
                buttonStyle="solid"
                style={{ marginRight: "16px" }}
              >
                <Radio value="today">Today</Radio>
                <Radio value="last-week">Last Week</Radio>
                <Radio value="last-month">Last Month</Radio>
              </Radio.Group>

              <div className="d-flex gap-1 p-2">
                <DatePicker
                  className="date-picker"
                  style={{backgroundColor:'white' ,borderRadius:'32px'}}
                  placeholder="From"
                  value={fromPicker}
                  onChange={(date) => {
                    setRadioValue("");
                    setFromPicker(date);
                    setFromDate(date);
                  }}
                />

                <DatePicker
                  className="date-picker"
                  style={{backgroundColor:'white' ,borderRadius:'32px'}}
                  placeholder="To"
                  value={toPicker}
                  onChange={(date) => {
                    setToPicker(date);
                    setToDate(date);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="d-flex mt-3 col-12 gap-3">
            {cardsData &&
              cardsData.map((card: any, index: any) => (
                <Col style={{ flex: 7.5 }} key={index}>
                  <div className="card-product p-4 text-dark">
                    <div className="d-flex justify-content-between ">
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>
                        {card.title}

                        <div
                          className="mt-2"
                          style={{ fontSize: "20px", fontWeight: 600 }}
                        >
                          {" "}
                          {loader ? <PulseLoading /> : card.value}
                        </div>
                      </div>
                      <div>
                        <img
                          src={Images.iconUser}
                          style={{ filter: "invert(1) brightness(1)" }}
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-5">
                      <div style={{ fontSize: "12px", fontWeight: 600 }}>
                        {card.subtitle1}
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 600 }}>
                        {card.subtitle2}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <div
                        className="mt-2"
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                        }}
                      >
                        {loader ? <PulseLoading /> : card.value1}
                      </div>
                      <div
                        className="mt-2"
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                        }}
                      >
                        {loader ? <PulseLoading /> : card.value2}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            {producer.map((card, index) => (
              <Col style={{ flex: 4.5 }} key={index}>
                <div className="card-product p-4 text-dark">
                  <div className="pb-3">{card.icon}</div>
                  <div
                    className="mt-4"
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: themeStyle.textColor,
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    className="mt-2"
                    style={{
                      fontSize: "20px",
                      color: themeStyle.textColor,
                      fontWeight: "600",
                    }}
                  >
                    {loader ? <PulseLoading /> : card.value}
                  </div>
                </div>
              </Col>
            ))}
            {distributedAmount.map((card, index) => (
              <Col style={{ flex: 6.8 }} key={index}>
                <div className="card-product p-4 text-dark">
                  <div className="pb-3" style={{ filter: "invert(1)" }}>
                    {card.icon}
                  </div>
                  <div
                    className="mt-4"
                    style={{
                      display: 'flex',
                      fontSize: "14px",
                      fontWeight: "600",
                      color: themeStyle.textColor,
                    }}
                  >
                    {card.title}
                    <img src={Images.upArrow} className="ms-2" alt="" />
                  </div>
                  <div
                    className="mt-2"
                    style={{ fontSize: "20px", color: themeStyle.textColor }}
                  >
                    <span
                      style={{ fontSize: "10px", color: themeStyle.textColor }}
                    >
                      SAR{" "}
                    </span>
                    <span
                      style={{ color: themeStyle.textColor, fontWeight: "600" }}
                    >
                      {loader ? <PulseLoading /> : card.value}
                    </span>
                  </div>
                </div>
              </Col>
            ))}
          </div>
          <div className="d-flex mt-3 col-12 gap-3">
            <div className="d-flex p-3  card-product" style={{ flex: 8.5 }}>
              {loans.map((card, index) => (
                <Col span={9} key={index}>
                  <div className="ms-2 text-dark">
                    <div
                      className="mt-2"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: "12px",
                        fontWeight: "600",
                        color: themeStyle.textColor,
                      }}
                    >
                      {card.title}
                      {card.title !== "Receivable Loan" && (
                        <img src={Images.downArrow} alt="" className="ms-2" />
                      )}
                    </div>
                    <div style={{ fontSize: "20px" }} className="mt-2">
                      <span
                        style={{
                          fontSize: "10px",
                          color: themeStyle.textColor,
                        }}
                      >
                        SAR{" "}
                      </span>
                      <span style={{ color: themeStyle.textColor,fontWeight: "600" }}>
                        {loader ? <PulseLoading /> : card.value}
                      </span>
                    </div>
                    <div
                      className="mt-5"
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: themeStyle.textColor,
                      }}
                    >
                      {card.title1}
                    </div>
                    <div style={{ fontSize: "20px" }} className="mt-2">
                      <span
                        style={{
                          fontSize: "10px",
                          color: themeStyle.textColor,
                        }}
                      >
                        SAR{" "}
                      </span>
                      <span style={{ color: themeStyle.textColor,fontWeight: "600" }}>
                        {loader ? <PulseLoading /> : card.value1}
                      </span>
                    </div>
                  </div>
                </Col>
              ))}
            </div>

            <div className="" style={{ flex: 3.5 }}>
              <Col>
                <LineChart dashboardData={dashboardData} />
              </Col>
            </div>
          </div>
          <div className="d-flex mt-3 col-12 gap-3">
            <div className="" style={{ flex: 8.8 }}>
              <Col>
                <Card title="All Customers">
                  <BarChart dashboardData={dashboardData} />
                </Card>
              </Col>
            </div>
            {/* <div className="" style={{ flex: 3.5 }}>
              <Col>
                <Card title="All Customers">
                  <PieChart />
                </Card>
              </Col>
            </div> */}
          </div>
          <div className="col-12 mt-3">
            <Col>
              <Card title="Finance Details">
                <FinanceBarChart dashboardData={dashboardData} />
              </Card>
            </Col>
          </div>
          <div className="col-12">
            <div className="cs-table p-2">
              <h6 className="mt-3 fw-600">Recent Customers</h6>
              <TableView
                setPage={setPage}
                setPageSize={setPageSize}
                totalRows={totalRows}
                header={Customer_ALL_List_Header}
                data={mappedData}
                paginationShow={false}
              />
            </div>
          </div>
        </div>
      </div>
      <GlobalStyle />
    </>
  );
};

export default Dashboard;
