import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = Array.from({ length: 20 }, (_, i) => ({
  name: `${i + 1}`,
  AppliedFinance: Math.floor(Math.random() * 5000) + 1000,
  ApprovedFinance: Math.floor(Math.random() * 4000) + 1000,
  DisbursedFinance: Math.floor(Math.random() * 3000) + 1000,
  RejectedFinance: Math.floor(Math.random() * 2000) + 1000,
}));

const FinanceBarChart: React.FC = () => (
  // <ResponsiveContainer width="100%" height={300}>
  //   <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
  //     <CartesianGrid strokeDasharray="3 3" />
  //     <XAxis dataKey="name" />
  //     <YAxis />
  //     <Legend />
  //     <Bar dataKey="RejectedFinance" fill="#D2D2D2" name="Rejected Finance"/>
  //     <Bar dataKey="DisbursedFinance" fill="#73C0A0" name="Disbursed Finance"/>
  //     <Bar dataKey="ApprovedFinance" fill="#6871BF" name="Approved Finance"/>
  //     <Bar dataKey="AppliedFinance" fill="#FFB1B1" name="Applied Finance"/>
  //   </BarChart>
  // </ResponsiveContainer>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip cursor={false} />
      <Legend />
      <Bar dataKey="RejectedFinance" fill="#D2D2D2" name="Rejected Finance" />
      <Bar dataKey="DisbursedFinance" fill="#73C0A0" name="Disbursed Finance" />
      <Bar dataKey="ApprovedFinance" fill="#6871BF" name="Approved Finance" />
      <Bar dataKey="AppliedFinance" fill="#FFB1B1" name="Applied Finance" />
    </BarChart>
  </ResponsiveContainer>
);

export default FinanceBarChart;
