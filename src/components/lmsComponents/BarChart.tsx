import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";

const CustomBarChart = ({ dashboardData }: { dashboardData: any }) => {
  const [data, setData] = useState<any[]>([]);

  const allMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const rawData = dashboardData?.customer || [];

    // Step 1: Create a map with 0 values
    const monthlyDataMap: Record<string, { name: string; Individual: number; Business: number }> = allMonths.reduce(
      (acc, month) => {
        acc[month] = { name: month, Individual: 0, Business: 0 };
        return acc;
      },
      {} as Record<string, { name: string; Individual: number; Business: number }>
    );

    // Step 2: Fill actual data
    rawData.forEach((item: { date: moment.MomentInput; individualCount: any; businessCount: any; }) => {
      const monthName = moment(item.date).format("MMMM"); // e.g., "January"
      if (monthlyDataMap[monthName]) {
        monthlyDataMap[monthName].Individual += item.individualCount || 0;
        monthlyDataMap[monthName].Business += item.businessCount || 0;
      }
    });

    // Step 3: Convert map to array in correct month order
    const finalData = allMonths.map((month) => monthlyDataMap[month]);

    setData(finalData);
  }, [dashboardData]);

  const CustomLegend = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 10,
        color: "var(--foreground)",
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginRight: 20 }}>
        <div
          style={{
            width: 14,
            height: 14,
            backgroundColor: "var(--chart-1, #10b981)",
            marginRight: 6,
            borderRadius: 3,
          }}
        />
        <span>Customer</span>
      </div>
    </div>
  );

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            interval={0}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={true}
            axisLine={true}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-card)",
              border: "1px solid var(--surface-border)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
            cursor={{ fill: "var(--surface-card-hover)" }}
          />
          <Bar
            radius={[5, 5, 0, 0]}
            dataKey="Individual"
            fill="var(--chart-1, #10b981)"
          />
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  );
};

export default CustomBarChart;
