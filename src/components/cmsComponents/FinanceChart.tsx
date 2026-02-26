import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import { Select } from "antd";
import { getDailyChart } from "../../redux/apis/apisCrudCms";
const { Option } = Select;
interface CustomerData {
  name: string;
  Pending: number;
  Assigned: number;
  Rejected: number;
  Resolved: number;
  Invalid: number;
}
const FinanceBarChart = () => {
  const [data, setData] = useState<CustomerData[]>([]);
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("Oct");
  const chartRef = useRef<any>(null);
  useEffect(() => {
    getDashboardMonthlyAppliction();
  }, [year, month]);

  const getDashboardMonthlyAppliction = async () => {
  try {
    const response = await getDailyChart(month);

    if (response) {
      const data = response?.data?.data;

      const formattedData: CustomerData[] = data?.days_in_month?.map((day: number, index: number) => {
        return {
          name: day.toString(),
          Pending: data.pending_tickets_data[index] || 0,
          Assigned: data.assigned_tickets_data[index] || 0,
          Rejected: data.rejected_tickets_data[index] || 0,
          Resolved: data.resolved_tickets_data[index] || 0,
          Invalid: data.invalid_tickets_data[index] || 0
        };
      });

      setData(formattedData);
    }
  } catch (error: any) {
    toast.error(error.message);
  }
};

  const CustomLegend = () => (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginTop: 10, gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", marginRight: 20 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: "#FFCC6A",
            marginRight: 5,
          }}
        />
        <span>Pending</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginRight: 20 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: "#4A90E2",
            marginRight: 5,
          }}
        />
        <span>Assigned</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginRight: 20 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: "#FF6B6B",
            marginRight: 5,
          }}
        />
        <span>Rejected</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginRight: 20 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: "#73E98D",
            marginRight: 5,
          }}
        />
        <span>Resolved</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: "#95A5A6",
            marginRight: 5,
          }}
        />
        <span>Invalid</span>
      </div>
    </div>
  );
  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            marginBottom: 20,
          }}
        >
        
          <Select
            value={month}
            className="custom-ant-select"
            onChange={(value) => setMonth(value)}
            style={{
              width: 100,
              height: 33,
              marginRight: 10
            }}
            bordered={false}
          >
            <Option value="Jan">January</Option>
            <Option value="Feb">February</Option>
            <Option value="Mar">March</Option>
            <Option value="Apr">April</Option>
            <Option value="May">May</Option>
            <Option value="Jun">June</Option>
            <Option value="Jul">July</Option>
            <Option value="Aug">August</Option>
            <Option value="Sep">September</Option>
            <Option value="Oct">October</Option>
            <Option value="Nov">November</Option>
            <Option value="Dec">December</Option>
          </Select>
          <Select
            value={year}
            className="custom-ant-select"
            onChange={(value) => setYear(value)}
            style={{
              width: 78,
              height: 33,
              marginRight: 10
            }}
            bordered={false}
          >
            <Option value="2025">2025</Option>
            {/* <Option value="2024">2024</Option>
            <Option value="2023">2023</Option> */}
          </Select>
        </div>
      
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            ref={chartRef}
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip cursor={false} />

            <Bar
              radius={[8, 8, 8, 8]}
              dataKey="Pending"
              barSize={15}
              fill={"#FFCC6A"}
            />
            <Bar
              radius={[8, 8, 8, 8]}
              dataKey="Assigned"
              barSize={15}
              fill={"#4A90E2"}
            />
            <Bar
              radius={[8, 8, 8, 8]}
              dataKey="Rejected"
              barSize={15}
              fill={"#FF6B6B"}
            />
            <Bar
              radius={[8, 8, 8, 8]}
              dataKey="Resolved"
              barSize={15}
              fill={"#73E98D"}
            />
            <Bar
              radius={[8, 8, 8, 8]}
              dataKey="Invalid"
              barSize={15}
              fill={"#95A5A6"}
            />
          </BarChart>
        </ResponsiveContainer>
        <CustomLegend />
      </div>
    </>
  );
};

export default FinanceBarChart;
