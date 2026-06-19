import { useEffect, useState } from "react";
import { ResponsiveContainer } from "recharts";
import ReactECharts from "echarts-for-react";
import {
  Container,
  Row,
  Col,
  Card,
  Dropdown,
  Tab,
  Tabs,
} from "react-bootstrap";
import ApplicationStatusBarChart from "./ApplicationStatusBarChart";
import { Select } from "antd";
import {
  getApplicationsCountMonthlyandYearly,
  getcomplianceData,
  getdepartmentApplications,
  getdepartmentWiseApplications,
  getproducTypeApplications,
  getstatusWiseApplications,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

// const productsData = [
//   "Quick Finance",
//   "Tawarruq",
//   "Invoice Discounting",
//   "Invoice Factoring",
//   "Car Ijarah",
//   "Collateral",
//   "Tawarruq Retail",
//   "Car Ijara",
// ];
const tabOptions = [
  {
    title: "Application Type",
    subTitle: "Type Wise",
    key: "applicationType",
  },
  {
    title: "Application Status",
    subTitle: "Department Wise",
    key: "departmentWise",
  },
  {
    title: "Application Status",
    subTitle: "Product Wise",
    key: "productWise",
  },
  {
    title: "Compliance Credit",
    subTitle: "Approval Average",
    key: "approvalAverage",
  },
];
interface ChartData {
  name: string;
  [key: string]: any;
}

interface CategoryConfig {
  key: string;
  color: string;
}
type FinanceData = Record<string, number>;
const DashboardProductDetails = () => {
  const [activeTab, setActiveTab] = useState("applicationType");
  const [activeObject, setActiveObject] = useState<any>(tabOptions[0]);
  const [applicationData, setApplicationData] = useState<any>([]);
  const [realDepartmentData, setrealDepartmentData] = useState<any>([]);
  const [realStatusData, setrealStatusData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("2025")
  const [financeData, setFinanceData] = useState<FinanceData>({});
  const Option = Select
  //   const chartRef: any = useRef(null);
  useEffect(() => {
    if (activeTab === "applicationType") {
      // setApplicationData([
      //   { name: "Individual", value: 8500241, color: "#73E98D" },
      //   { name: "Corporate", value: 8500241, color: "#FFCC6A" },
      //   { name: "SME", value: 2500241, color: "#ff6961" },
      // ]);
      getProducTypeApplications();
    } else if (activeTab === "departmentWise") {
      getDepartmentApplications();
      // setApplicationData([
      //   { name: "Approved", value: 8500241, color: "#73E98D" },
      //   { name: "Pending", value: 8500241, color: "#FFCC6A" },
      //   { name: "Rejected", value: 2500241, color: "#ff6961" },
      //   { name: "Disbursed", value: 8500241, color: "#80D1FF" },
      // ]);
    } else if (activeTab === "productWise") {
      getStatusWiseApplications();
      // setApplicationData([
      //   { name: "Approved", value: 8500241, color: "#73E98D" },
      //   { name: "Pending", value: 8500241, color: "#FFCC6A" },
      //   { name: "Rejected", value: 2500241, color: "#ff6961" },
      //   { name: "Disbursed", value: 8500241, color: "#80D1FF" },
      // ]);
    } else if (activeTab === "approvalAverage") {
      getComplianceData();
      // setApplicationData([
      //   { name: "Compliance", value: 8500241, color: "#73E98D" },
      //   { name: "Credit", value: 2500241, color: "#ff6961" },
      // ]);
    }
  }, [activeTab]);
  useEffect(() => {
    getData();
    getProducTypeApplications();
    getDepartmentWiseApplications();
    getStatusWiseApplications();
  }, []);
  const getData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationsCountMonthlyandYearly();

      if (response) {
        const data = response?.data?.data;
        setFinanceData(data);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const getProducTypeApplications = async () => {
    try {
      const res = await getproducTypeApplications();
      const data = res?.data?.data;
      const colorsMap: Record<string, string> = {
        Individual: "#73E98D",
        Corporate: "#FFCC6A",
        SME: "#ff6961",
      };

      const result = Object.entries(data).map(([key, value]) => ({
        name: key,
        value,
        color: colorsMap[key] || "#000000", // default color if not mapped
      }));
      setApplicationData(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const getDepartmentApplications = async () => {
    try {
      const res = await getdepartmentApplications();
      const statusData = res?.data?.data?.departmentStatusPercentages;

      // Mapping: original key => display name + color
      const labelColorMap: Record<string, { name: string; color: string }> = {
        "REVENUE-APPROVED": { name: "Approved", color: "#73E98D" },
        PENDING: { name: "Pending", color: "#FFCC6A" },
        REJECTED: { name: "Rejected", color: "#ff6961" },
        DISBURSED: { name: "Disbursed", color: "#80D1FF" },
        "NON-DISBURSED": { name: "Non Disbursed", color: "#FFA07A" },
      };

      // Transform to array format
      const formattedData = Object.entries(statusData)
        .filter(([key]) => key in labelColorMap)
        .map(([key, value]) => ({
          name: labelColorMap[key].name,
          value,
          color: labelColorMap[key].color,
        }));

      setApplicationData(formattedData);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const getStatusWiseApplications = async () => {
    try {
      const res = await getstatusWiseApplications();
      const statusData = res?.data?.data?.statusCounts;

      // Mapping: original key => display name + color
      const labelColorMap: Record<string, { name: string; color: string }> = {
        "REVENUE-APPROVED": { name: "Approved", color: "#73E98D" },
        PENDING: { name: "Pending", color: "#FFCC6A" },
        REJECTED: { name: "Rejected", color: "#ff6961" },
        DISBURSED: { name: "Disbursed", color: "#80D1FF" },
        "NON-DISBURSED": { name: "Non Disbursed", color: "#FFA07A" },
      };

      // Transform to array format
      const formattedData = Object.entries(statusData)
        .filter(([key]) => key in labelColorMap)
        .map(([key, value]) => ({
          name: labelColorMap[key].name,
          value,
          color: labelColorMap[key].color,
        }));

      setApplicationData(formattedData);

      

      // Convert to desired format
      const data = Object.entries(statusData).map(
        ([key, value]) => ({
          name: key,
          [key]: value, // Replace with `value` if using real data
        })
      );

      setrealStatusData(data)
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const getComplianceData = async () => {
    try {
      const res = await getcomplianceData();
      const input = res?.data?.data;

      // Define mapping: original key -> desired label and color
      const labelMap: Record<string, { name: string; color: string }> = {
        averageComplianceTimes: { name: "Compliance", color: "#73E98D" },
        averageCreditTimes: { name: "Credit", color: "#ff6961" },
      };

      // Convert to array format
      const formattedData = Object.entries(input)
        .filter(([key]) => key in labelMap)
        .map(([key, value]) => ({
          name: labelMap[key].name,
          value, // You can replace this with a real number if needed
          color: labelMap[key].color,
        }));

      setApplicationData(formattedData);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const getDepartmentWiseApplications = async () => {
    try {
      const res = await getdepartmentWiseApplications();

      const input = res?.data?.data?.departmentCount;

      // Convert to desired format
      const departmentData = Object.entries(input).map(
        ([key, value]) => ({
          name: key,
          [key]: value, // Replace with `value` if using real data
        })
      );

      setrealDepartmentData(departmentData)
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const formatLabel = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  };
  const totalApplications = applicationData.reduce(
    (acc: any, curr: { value: any }) => acc + curr.value,
    0
  );
  const seriesData = [
    {
      symbolSize: 1,
      data: applicationData?.map((day: { value: any; name: any }) => ({
        value: day?.value,
        name: day?.name, // Map the name
      })),

      type: "pie",
      radius: ["60%", "80%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        disabled: true, // Disable hover effects
      },
      labelLine: {
        show: false,
      },
    },
  ];
  const systemPieGraph = {
    color: applicationData?.map((item: { color: any }) => item.color),
    tooltip: {
      trigger: "item",
    },
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: `Total \n${totalApplications.toLocaleString()}`, // Display "Total Tickets" and the value
        fontSize: 20, // Font size for the text
        fontWeight: "500",
        fill: "#828282", // Text color
        textAlign: "center", // Center-align the text
        lineHeight: 25,
      },
    },
    series: seriesData,
  };
  const handleSelect = (key: any) => {
    const activeItem = tabOptions.find((tab) => tab.key === key);
    setActiveObject(activeItem);
    setActiveTab(key);
  };
  const totalFinancing = 32000000;

  // Department wise chart configuration
  const departmentCategories: CategoryConfig[] = [
    { key: "Operations", color: "#FF6B6B" },
    { key: "Account", color: "#6CDF9C" },
    { key: "HR", color: "#FFCC6A" },
    { key: "Sales", color: "#B6A4FF" },
    { key: "Risk", color: "#FF9F9F" },
    { key: "Credit", color: "#FFB86C" },
  ];

  // Status wise chart configuration
  const statusCategories: CategoryConfig[] = [
    { key: "Rejected", color: "#FF6B6B" },
    { key: "Approved", color: "#6CDF9C" },
    { key: "Pending", color: "#FFCC6A" },
    { key: "Incomplete", color: "#B6A4FF" },
    { key: "InProgress", color: "#7CD1DE" },
    { key: "Cancelled", color: "#FFB86C" },
  ];

  // const realDepartmentData: ChartData[] = [
  //   {
  //     name: "Operations",
  //     Operations: 18000,
  //   },
  //   {
  //     name: "Account",
  //     Account: 25000,
  //   },
  //   {
  //     name: "HR",
  //     HR: 20000,
  //   },
  //   {
  //     name: "Sales",
  //     Sales: 30000,
  //   },
  //   {
  //     name: "Risk",
  //     Risk: 12000,
  //   },
  //   {
  //     name: "Credit",
  //     Credit: 24000,
  //   },
  // ];

  // const realStatusData: ChartData[] = [
  //   {
  //     name: "Rejected",
  //     Rejected: 18000,
  //   },
  //   {
  //     name: "Approved",
  //     Approved: 25000,
  //   },
  //   {
  //     name: "Pending",
  //     Pending: 20000,
  //   },
  //   {
  //     name: "Incomplete",
  //     Incomplete: 30000,
  //   },
  //   {
  //     name: "In Progress",
  //     InProgress: 12000,
  //   },
  //   {
  //     name: "Cancelled",
  //     Cancelled: 24000,
  //   },
  // ];
  return (
    <>
      <Container fluid className="py-4">
        <Row>
          {/* Left side */}
          <div style={{ flex: 1 }}>
            <Card className="p-4 mb-4 h-100 dashboard-card">
              <h5 className="fs-20 fw-600">{activeObject?.title}</h5>
              <small className="fw-medium fs-14 mb-3">
                {activeObject?.subTitle}
              </small>
              <Tabs
                activeKey={activeTab}
                className="d-flex"
                onSelect={handleSelect}
              >
                {tabOptions.map((tab) => (
                  <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
                    {activeTab === tab.key && (
                      <Row>
                        <Col md={8}>
                          <ResponsiveContainer width="100%" height={300}>
                            <ReactECharts
                              option={systemPieGraph}
                              style={{ height: "100%", width: "100%" }}
                            />
                          </ResponsiveContainer>
                        </Col>
                        <Col
                          md={4}
                          className="d-flex flex-column justify-content-center align-items-start"
                        >
                          {applicationData.map((item: any, idx: any) => (
                            <div
                              key={idx}
                              className="d-flex align-items-center mb-2"
                            >
                              <div
                                style={{
                                  width: 20,
                                  height: 20,
                                  backgroundColor: item.color,
                                  marginRight: 8,
                                  borderRadius: "2px",
                                }}
                              ></div>
                              <div className="fw-normal fs-14">
                                <div
                                  className="mb-1"
                                  style={{ color: "#828282" }}
                                >
                                  {" "}
                                  {item.name}
                                </div>
                                {item.value.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </Col>
                      </Row>
                    )}
                  </Tab>
                ))}
              </Tabs>
            </Card>
          </div>

          {/* Right side - Products */}
          <div style={{ width: "30%", minWidth: "367px" }}>
            <Card className="p-4 mb-4 dashboard-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Products</h5>
                <Select
                  value={year}
                  className="custom-ant-select"
                  onChange={(value: any) => setYear(value)}
                  style={{
                    width: 78,
                    height: 33,
                  }}
                  bordered={false}
                >
                  <Option value="2025">2025</Option>
                  <Option value="2024">2024</Option>
                  <Option value="2023">2023</Option>
                </Select>
              </div>
              <h4>Total Financing</h4>
              <h2 className="text-danger mb-4">
                SAR {totalFinancing.toLocaleString()}
              </h2>

              <div className="d-flex gap-1 mb-4">
                {applicationData.map((item: any, idx: any) => (
                  <div
                    key={idx}
                    style={{ flex: 1, height: 20, backgroundColor: item.color }}
                  ></div>
                ))}
              </div>

              <ol className="ps-3">
                {Object.entries(financeData).map(([key, value]) => (
                  <li key={key} className="d-flex justify-content-between my-2">
                    <span>{formatLabel(key)}</span>
                    <span>SAR {value.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </Row>
      </Container>
      <Container fluid className="pb-4">
        <Row>
          <Col md={6}>
            <Card className="p-4 mb-4 dashboard-card">
              <ApplicationStatusBarChart
                title="Department Wise Applications"
                data={realDepartmentData}
                categories={departmentCategories}
                showYearSelector={true}
                yearSelectorText="This Year"
              />
            </Card>
          </Col>
          <Col md={6}>
            <Card className="p-4 mb-4 dashboard-card">
              <ApplicationStatusBarChart
                title="Status Wise Applications"
                data={realStatusData}
                categories={statusCategories}
                showYearSelector={true}
                yearSelectorText="This Year"
              />
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default DashboardProductDetails;
