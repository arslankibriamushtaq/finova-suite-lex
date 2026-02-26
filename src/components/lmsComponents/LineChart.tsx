import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
} from "recharts";
import { Images } from "../../components/Config/Images";
import moment from "moment";

const CustomLineChart = ({ dashboardData }: { dashboardData: any }) => {
  const [data, setData] = useState<any[]>([]);

  const application = dashboardData?.application;
  useEffect(() => {
    if (application && application.length > 0) {
      const formatted = application.map((item: any) => ({
        name: moment(item.date).format("MMM DD"),
        value: item.applications,
      }));
      setData(formatted || 0);
    }
  }, [application]);

  return (
    <div
      style={{
        background: "#a6c8ed",
        borderRadius: "1.5rem",
        padding: "13px",
        color: "#000",
        height: "11rem",
      }}
    >
      {/* Title displayed above the chart */}
      <div className="d-flex">
        <h6
          className="col-8"
          style={{
            textAlign: "start",
            fontSize: "16px",
            fontWeight: 600,
            paddingLeft: "1rem",
            paddingTop: "0.5rem",
          }}
        >
          Total Applications
        </h6>
        <span className="col-4 d-flex align-items-center justify-content-end">
          <span
            style={{ color: "#000", fontSize: "16px", fontWeight: "600" }}
          >
            12%
          </span>
          <img src={Images.upArrowDashbaord} alt="" />
        </span>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data} margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
          <Legend values="false" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="white"
            strokeWidth={1}
            activeDot={{ r: 5, fill: "#66BF5E" }}
            dot={{ r: 5, fill: "#66BF5E" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
