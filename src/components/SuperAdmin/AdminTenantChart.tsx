import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Bar,
  Legend,
} from "recharts";
import { getBuisnessAndIndividualCustomerGraph } from "../../redux/apis/apisCrud";

const COLORS = ["#373435", "#EB0D0D", "#D2D2D2"];

const CustomPieChart = () => {
  //   const [pieData, setPieData] = useState<any>();
  //   const getCustomerPieDetail = async () => {
  //     try {
  //       const response = await getBuisnessAndIndividualCustomerGraph();
  //       if (response && response.data && response.data.data) {
  //         const data = response.data.data;
  //         setPieData(data);
  //       }
  //     } catch (error: any) {
  //       toast.error(error.message);
  //     }
  //   };

  //   useEffect(() => {
  //     getCustomerPieDetail();
  //   }, []);
  const data = [
    {
      name: "Leads",
      value: 200,
    },
    { name: "Oppurtunities", value: 300 },
    { name: "Tenants", value: 400 },
  ];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          nameKey={"Leads"}
          fill="#D2D2D2"
          label={({ name, value }) => `${name}: ${value}`}
          innerRadius={50}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value}`, `${name}`]}
        />
        <Legend />
        <Bar dataKey="Leads" fill="#D2D2D2" />
        <Bar dataKey="Opportunities" fill="#373435" />
        <Bar dataKey="Tenants" fill="#EB0D0D" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
