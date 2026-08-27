import { Container, Row, Col, Card } from "react-bootstrap";

import ApplicationStatusBarChart from "../Dashboard/ApplicationStatusBarChart";

interface MetricCardProps {
  title: string;
  value: string;
  percent?: string;
}
const metrics = [
  { title: "All Entities", value: "7,265" },
  { title: "Emergency", value: "7,265" },
  { title: "Alert", value: "7,265" },
  { title: "Critical", value: "7,265" },
  { title: "Error", value: "7,265" },
  { title: "Warning", value: "7,265" },
  { title: "Notice", value: "7,265" },
  { title: "Info", value: "7,265" },
  { title: "Debug", value: "7,265" },
];

const MetricCard = ({ title, value, percent = "+11.01%" }: MetricCardProps) => {
  return (
    <Card
      className="p-3 text-center mb-3 shadow-sm"
      style={{ minHeight: "120px" }}
    >
      <div className="fw-semibold">{title}</div>
      <div className="d-flex justify-content-between align-items-center w-100">
        <h4 className="fw-bold my-2">{value}</h4>
      <div className="text-success small">{percent} ↑</div>
      </div>
    </Card>
  );
};

interface ChartData {
  name: string;
  [key: string]: any;
}

interface CategoryConfig {
  key: string;
  color: string;
}
const Dashboard = () => {
  // Department wise chart configuration
  const departmentCategories: CategoryConfig[] = [
    { key: "Operations", color: "#FF6B6B" },
    { key: "Account", color: "#ff8080" },
    { key: "HR", color: "#FFCC6A" },
    { key: "Sales", color: "#B6A4FF" },
    { key: "Risk", color: "#FF9F9F" },
    { key: "Credit", color: "#FFB86C" },
  ];

  const realDepartmentData: ChartData[] = [
    {
      name: "Operations",
      Operations: 18000,
    },
    {
      name: "Account",
      Account: 25000,
    },
    {
      name: "HR",
      HR: 20000,
    },
    {
      name: "Sales",
      Sales: 30000,
    },
    {
      name: "Risk",
      Risk: 12000,
    },
    {
      name: "Credit",
      Credit: 24000,
    },
  ];

  return (
    <>
      <Container fluid className="pb-4 px-0">
        <Row className="mb-3 gutter-y-30 system-logs-dashboard">
          {metrics.map((metric, idx) => (
            <Col key={idx} xs={6} sm={4} md={3} lg={2}>
              <MetricCard title={metric.title} value={metric.value} />
            </Col>
          ))}
        </Row>
        <Row>
          <Col md={12}>
            <Card className="p-4 mb-4 dashboard-card">
              <ApplicationStatusBarChart
                title="Entities Status"
                data={realDepartmentData}
                categories={departmentCategories}
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

export default Dashboard;
