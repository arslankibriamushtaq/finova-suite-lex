import {
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Images } from "../Config/Images";

const CustomLineChart = () => {
  const data = [
    { value: 1000 },
    { value: 5000 },
    { value: 3000 },
    { value: 7000 }
  ];
  const isHighData =
    data.reduce((acc, { value }) => acc + value, 0) / data.length >= 5000;

  return (
    <div
      style={{
        padding: "0px",
        color: "white",
        height: "100px",
      }}
    >
      {/* Title displayed above the chart */}
     

      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ right: 0, left: 20, bottom: 40 }}>
          <Legend />
          <Line
            type="linear"
            dataKey="value"
            stroke="#AB1920"
            strokeWidth={1}
            activeDot={{ r: 2, fill: isHighData ? "#D96368" : "#D96368" }}
            dot={{ r: 2, fill: isHighData ? "#AB1920" : "#AB1920" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
