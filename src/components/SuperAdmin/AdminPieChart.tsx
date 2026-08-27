import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "LOS & Onboarding Studio", value: 400 },
  { name: "Loan Management System", value: 300 },
  { name: "Onboarding Studio", value: 300 },
  { name: "Forms Studio", value: 200 },
  { name: "Workflow Studio", value: 100 },
];

const COLORS = ["#BAEBFF", "#FEE6B5", "#ffc9c9", "#F4C5FF", "#D2D2D2"];

const PieChartAdmin = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="80%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="80%"
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                className="mt-4"
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartAdmin;
