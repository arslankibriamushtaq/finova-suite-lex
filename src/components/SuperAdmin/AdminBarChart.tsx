import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { getBuisnessAndIndividualCustomerGraph } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import moment from "moment";

interface CustomerData {
  name: string;
  Individual: number;
  Business: number;
}

const CustomBarChart = () => {
  const data = [
    { name: "JAN", uv: 4000 },
    { name: "Feb", uv: 3000 },
    { name: "March", uv: 2000 },
    { name: "April", uv: 2780 },
    { name: "May", uv: 1890 },
    { name: "June", uv: 2390 },
    { name: "July", uv: 3490 },
    { name: "August", uv: 3490 },
    { name: "Sep", uv: 2490 },
    { name: "Oct", uv: 1490 },
    { name: "Nov", uv: 3490 },
    { name: "Dec", uv: 1490 },
  ];

  // const getCustomerDetail = async () => {
  //   // Fetch data code here
  // };

  // useEffect(() => {
  //   getCustomerDetail();
  // }, []);

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar radius={10} dataKey="uv" fill="#FFB2A5" />
          <LabelList dataKey="uv" position="insideTop" fill="#fff" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default CustomBarChart;
