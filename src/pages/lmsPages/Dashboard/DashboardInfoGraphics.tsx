import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  Users,
  Store,
  Banknote,
  HandCoins,
  Wallet,
  BadgeCheck,
  AlertTriangle,
  Clock,
  CalendarX,
} from "lucide-react";
import BarChart from "../../../components/lmsComponents/BarChart";
import LineChart from "../../../components/lmsComponents/LineChart";
import TableView from "../../../components/TableView/TableView";
import FinanceBarChart from "../../../components/lmsComponents/FinanceBarChart";
import {
  getAllBusinessAndIndividualCustomer,
  getDashboardInformation,
  getLedgerAccount,
} from "../../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { Images } from "../../../components/Config/Images";
import PulseLoading from "../../../components/Loader/PulseLoader";
import NoLedgerAccountModal from "../../../components/ChartOfAccount/NoLedgerAccount";
import { DatePicker, Radio } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "./DashboardInfoGraphics.css";
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
            borderRadius: "2px",
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
  const allCustomers = {
    title: "All Customers",
    value: dashboardData?.totalCustomers ?? 8,
    subLabel: "Individuals",
    subValue: dashboardData?.individualCount ?? 2,
  };

  const totalVendors = {
    title: "Total Vendors",
    value: dashboardData?.totalVendors ?? 1,
  };

  const disbursedAmount = {
    title: "Disbursed Amount",
    value: dashboardData?.disbursedAmount ?? 0,
    unit: "SAR",
  };

  const loans = [
    { title: "Received Loans", value: dashboardData?.receivedAmount ?? 0, color: "#C81D25", Icon: HandCoins },
    { title: "Receivable Loan", value: dashboardData?.receivableAmount ?? 0, color: "#6366f1", Icon: Wallet },
    { title: "Early Settlements", value: dashboardData?.earlySettlementAmount ?? 0, color: "#0ea5e9", Icon: BadgeCheck },
    { title: "Non Performing Loans", value: dashboardData?.nonPerformingAmount ?? 0, color: "#6E1418", Icon: AlertTriangle },
    { title: "Due Loans", value: dashboardData?.dueAmount ?? 0, color: "#f59e0b", Icon: Clock },
    { title: "Over Due Loans", value: dashboardData?.overDueAmount ?? 0, color: "#db2777", Icon: CalendarX },
  ];
  return (
    <div className="lms-dashboard">
      {isModalVisible && (
        <NoLedgerAccountModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
        />
      )}

      {/* ===== Overview bar ===== */}
      <div className="overview-bar">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={8}>
            <h2 className="overview-title">Overview</h2>
          </Col>
          <Col xs={24} md={16}>
            <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
              <Radio.Group
                value={radioValue}
                onChange={(e) => handleRangeChange(e.target.value)}
                buttonStyle="solid"
              >
                <Radio value="today">Today</Radio>
                <Radio value="last-week">Last Week</Radio>
                <Radio value="last-month">Last Month</Radio>
              </Radio.Group>

              <DatePicker
                className="date-picker"
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
                placeholder="To"
                value={toPicker}
                onChange={(date) => {
                  setToPicker(date);
                  setToDate(date);
                }}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* ===== KPI cards ===== */}
      <Row gutter={[16, 16]} className="lms-stats mt-2">
        <Col xs={24} sm={12} lg={6}>
          <div className="kpi-card tall" style={{ ["--c" as any]: "#6366f1" }}>
            <div className="kpi-header">{allCustomers.title}</div>
            <div className="kpi-body">
              <p className="kpi-value">
                {loader ? <PulseLoading /> : allCustomers.value}
              </p>
              <div className="kpi-sub">
                <span className="kpi-sub-label">{allCustomers.subLabel}</span>
                <span className="kpi-sub-value">
                  {loader ? <PulseLoading /> : allCustomers.subValue}
                </span>
              </div>
            </div>
            <div className="kpi-icon">
              <Users strokeWidth={2} />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="kpi-card" style={{ ["--c" as any]: "#8b5cf6" }}>
            <div className="kpi-header">{totalVendors.title}</div>
            <div className="kpi-body">
              <p className="kpi-value">
                {loader ? <PulseLoading /> : totalVendors.value}
              </p>
            </div>
            <div className="kpi-icon">
              <Store strokeWidth={2} />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="kpi-card" style={{ ["--c" as any]: "#C81D25" }}>
            <div className="kpi-header">{disbursedAmount.title}</div>
            <div className="kpi-body">
              <p className="kpi-value">
                <span className="kpi-unit">{disbursedAmount.unit}</span>
                {loader ? <PulseLoading /> : disbursedAmount.value}
              </p>
            </div>
            <div className="kpi-icon">
              <Banknote strokeWidth={2} />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="kpi-card trend" style={{ ["--c" as any]: "#0ea5e9" }}>
            <div className="kpi-header">Total Applications</div>
            <div className="kpi-body">
              <div className="kpi-trend-row">
                <p className="kpi-value" style={{ fontSize: 20 }}>
                  {loader ? <PulseLoading /> : dashboardData?.totalApplications ?? 0}
                </p>
                <span className="kpi-trend-pct">
                  12%
                  <img src={Images.upArrow} alt="" style={{ width: 12, height: 12 }} />
                </span>
              </div>
              <LineChart dashboardData={dashboardData} />
            </div>
          </div>
        </Col>
      </Row>

      {/* ===== Loan Overview — individual cards ===== */}
      <div className="lms-section mt-3">
        <h6 className="lms-section-title">Loan Overview</h6>
        <Row gutter={[16, 16]} className="lms-stats">
          {loans.map((card, index) => {
            const Icon = card.Icon;
            return (
              <Col xs={12} sm={8} lg={4} key={index}>
                <div className="kpi-card loan-kpi" style={{ ["--c" as any]: card.color }}>
                  <div className="kpi-header">{card.title}</div>
                  <div className="kpi-body">
                    <p className="kpi-value">
                      <span className="kpi-unit">SAR</span>
                      {loader ? <PulseLoading /> : card.value}
                    </p>
                  </div>
                  <div className="kpi-icon">
                    <Icon strokeWidth={2} />
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* ===== Charts ===== */}
      <Row gutter={[16, 16]} className="lms-stats mt-3">
        <Col xs={24}>
          <div className="chart-card">
            <h6 className="chart-card-title">Customers Trend</h6>
            <BarChart dashboardData={dashboardData} />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="lms-stats">
        <Col xs={24}>
          <div className="chart-card">
            <h6 className="chart-card-title">Finance Details</h6>
            <FinanceBarChart dashboardData={dashboardData} />
          </div>
        </Col>
      </Row>

      {/* ===== Recent customers ===== */}
      <Row gutter={[16, 16]} className="lms-stats">
        <Col xs={24}>
          <div className="chart-card">
            <h6 className="chart-card-title">Recent Customers</h6>
            <TableView
              setPage={setPage}
              setPageSize={setPageSize}
              totalRows={totalRows}
              header={Customer_ALL_List_Header}
              data={mappedData}
              paginationShow={false}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
