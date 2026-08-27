import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
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
      setData(formatted);
    } else {
      // Placeholder gentle wave so the trend card never renders empty
      setData([
        { name: "1", value: 4 },
        { name: "2", value: 6 },
        { name: "3", value: 5 },
        { name: "4", value: 8 },
        { name: "5", value: 7 },
        { name: "6", value: 9 },
      ]);
    }
  }, [application]);

  return (
    <div style={{ width: "100%", height: 56 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-success, #AB1920)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-success, #AB1920)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
