import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer
} from "recharts";
import { getBuisnessAndIndividualCustomerGraph } from "../../../redux/apis/apisCrud";

const COLORS = ["#000000", "#EB0D0D"];

const PieChartCollectrol = () => {
  const [pieData, setPieData] = useState<any>();
  const getCustomerPieDetail = async () => {
    try {
      const response = await getBuisnessAndIndividualCustomerGraph();
      if (response && response.data && response.data.data) {
        const data = response.data.data;
        setPieData(data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getCustomerPieDetail();
  }, []);
  const data = [
    {
      name: "Individual",
      value: pieData && pieData.numberOfIndividualCustomers,
    },
    { name: "Business", value: 10 },
  ];
  return (
    <ResponsiveContainer width="100%" height={100}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          nameKey={"Business"}
          fill="#EB0D0D"
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
        {/* <Legend />
        <Bar dataKey="Individual" fill="#00000" />
        <Bar dataKey="Business" fill="#EB0D0D" /> */}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartCollectrol;
