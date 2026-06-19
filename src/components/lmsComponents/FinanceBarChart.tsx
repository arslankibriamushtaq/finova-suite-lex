import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const FinanceBarChart = ({ dashboardData }: { dashboardData: any }) => {
  const chartData = [
    {
      name: "Finance Overview",
      Receivable: dashboardData?.receivableAmount || 0,
      Received: dashboardData?.receivedAmount || 0,
      EarlySettlement: dashboardData?.earlySettlementAmount || 0,
      Due: dashboardData?.dueAmount || 0,
      OverDue: dashboardData?.overDueAmount || 0,
      NonPerforming: dashboardData?.nonPerformingAmount || 0,
    },
  ];

  const CustomLegend = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 10,
        gap: 20,
      }}
    >
      {[
        ["#FFB1B1", "Receivable"],
        ["#6871BF", "Received"],
        ["#73C0A0", "Early Settlement"],
        ["#FFD700", "Due"],
        ["#FF6347", "Over Due"],
        ["#A9A9A9", "Non Performing"],
      ].map(([color, label]) => (
        <div key={label} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 14,
              height: 14,
              backgroundColor: color,
              marginRight: 5,
            }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              background: "var(--surface-card)",
              border: "1px solid var(--surface-border)",
              borderRadius: 6,
              color: "var(--foreground)",
            }}
          />
          <Legend wrapperStyle={{ color: "var(--foreground)" }} />
          <Bar dataKey="Receivable" fill="#FFB1B1" />
          <Bar dataKey="Received" fill="#6871BF" />
          <Bar dataKey="EarlySettlement" fill="#73C0A0" />
          <Bar dataKey="Due" fill="#FFD700" />
          <Bar dataKey="OverDue" fill="#FF6347" />
          <Bar dataKey="NonPerforming" fill="#A9A9A9" />
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend />
    </>
  );
};

export default FinanceBarChart;
