import { useEffect, useState } from "react";
import { Card, Row, Col, Select, DatePicker } from "antd";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs";
import "./ThirdPartyDashboard.css";
import { getClients, getDashboardData, getServiceStats, getClientStatsGraph, getClientsList } from "../../redux/apis/apisThirdParty";
import toast from "react-hot-toast";
import { PulseLoader } from "react-spinners";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ThirdPartyDashboard = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clients, setClients] = useState<any>([]);
  const [serviceStats, setServiceStats] = useState<any>([]);
  const [clientStats, setClientStats] = useState<any>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>([
    dayjs("2024-10-01"),
    dayjs("2024-10-25"),
  ]);

  // Dynamic stats based on dashboard data
  const stats = [
    { 
      title: "Total Clients", 
      value: dashboardData?.clients_count || "0", 
      color: "var(--primary-foreground)" ,
      border: true
    },
    {
      title: "No. of Requests",
      value: dashboardData?.client_requests_count || "0",
      color: "var(--primary-foreground)",
      border: true
    },
    {
      title: "Total Services",
      value: dashboardData?.services_count || "0",
      color: "var(--primary-foreground)",
      border: true
    },
    {
      title: "Total Users",
      value: dashboardData?.users || "0",
      color: "var(--primary-foreground)" ,
      border: true 
    },
  ];

  // Chart data for Client Wise Requests
  const clientWiseData = {
    labels: dashboardData?.clientWiseRequests?.map((item: any) => item.clientName) || [],
    datasets: [
      {
        label: "Requests",
        data: clientStats?.clientWiseRequests?.map((item: any) => item.requestCount) || [],
        backgroundColor: "#5B9BD5",
      },
    ],
  };

  // Chart data for Success/Failed Requests
  const successFailedData = {
    labels: dashboardData?.dailyStats?.map((item: any) => item.date) || [],
    datasets: [
      {
        label: "Success Requests",
        data: serviceStats?.success_percentage||[],
        backgroundColor: "var(--foreground)",
        borderColor: "var(--foreground)",
        tension: 0.4,
      },
      {
        label: "Failed Requests",
        data: serviceStats?.failure_percentage||[],
        backgroundColor: "#FF6B9D",
        borderColor: "#FF6B9D",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1.0,
        ticks: {
          stepSize: 0.1,
        },
      },
    },
  };

const getClientsApi = async () => {
  try{
    const response = await getClientsList(10, 1);
    if(response?.data?.success){
   setClients(response?.data?.data?.clients?.data);
   if(response?.data?.data?.clients?.data){
     setSelectedClient(response?.data?.data?.clients?.data[0].id);
   }
    }
    
  } catch (error) {
  }
  
}
const getClientGraphData = async () => {
  try{
    const response = await getServiceStats();
    if(response?.data?.success){
      setServiceStats(response?.data?.data||[]);
    }
  } catch (error: any) {
    toast.error(error.message);
  }
};

const getClientStats = async () => {
  try{
    const response = await getClientStatsGraph();
    if(response?.data?.success){
      setClientStats(response?.data?.data||[]);
    }
  } catch (error: any) {
    toast.error(error.message);
  }
};
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const from = dateRange[0].format('YYYY-MM-DD');
    const to = dateRange[1].format('YYYY-MM-DD');
    
  
    
    const response = await getDashboardData(from, to, selectedClient || undefined);
  
    
    if (response?.data?.success || response?.data?.status) {
      setDashboardData(response.data.data || response.data);
    } else {
      console.error('Dashboard API failed:', response?.data);
    }
  } catch (error) {
  
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  getClientsApi();
  getClientGraphData()
  getClientStats()
}, []);

useEffect(() => {
  if (dateRange && dateRange.length === 2 && selectedClient) {
    fetchDashboardData();
  }
}, [selectedClient, dateRange]);


  return (
    <div className="third-party-dashboard">
      {/* <div className="dashboard-header-section">
        <h1 className="welcome-text">Welcome!</h1>
      </div> */}

      <div className="overview-section">
        {/* <h2 className="section-title">Overview</h2> */}
        <div className="d-flex justify-content-start gap-2">
          <div className="col-2 filter-item">
            <label className="pb-1">Client</label>
            <Select
              placeholder="Select Client"
              value={selectedClient}
              onChange={(value) => setSelectedClient(value)}
              style={{ width: '100%',height: '32px' }}
            >
              {clients?.map((department: any) => (
                <Select.Option key={department.id} value={department.id}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="filter-item">
            <label className="pb-1">From</label>
            <DatePicker
              value={dateRange[0]}
              onChange={(date) => setDateRange([date, dateRange[1]])}
              format="MM/DD/YYYY"
            />
          </div>
          <div className="filter-item">
            <label className="pb-1">To</label>
            <DatePicker
              value={dateRange[1]}
              onChange={(date) => setDateRange([dateRange[0], date])}
              format="MM/DD/YYYY"
            />
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-cards">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              className={`stat-card ${stat.border ? "bordered-card" : ""}`}
              style={{
                backgroundColor: stat.color,
                borderColor: stat.border ? "var(--color-border-subtle)" : "transparent",
              }}
            >
              <div className="stat-title">{stat.title}</div>
              <div
                className="stat-value"
                style={{
                  color: stat.color === "var(--primary-foreground)" ? "var(--foreground)" : "var(--primary-foreground)",
                }}
              >
                {loading ? <PulseLoader/> : stat.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="charts-section">
        <Col xs={24} lg={12}>
          <Card className="chart-card">
            <h3 className="chart-title">Client Wise Requests</h3>
            <div className="chart-container">
              <Bar data={clientWiseData} options={chartOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card">
            <h3 className="chart-title">Success/Failed Requests against Services</h3>
            <div className="chart-container">
              <Line data={successFailedData} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ThirdPartyDashboard;

