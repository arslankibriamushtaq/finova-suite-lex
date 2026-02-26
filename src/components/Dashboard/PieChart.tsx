import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Bar,
} from "recharts";
// import { getBuisnessAndIndividualCustomerGraph } from "../../redux/apis/apisCrud";

const COLORS = ["#EB0D0D", "#000000"];

const CustomPieChart = () => {
  const [pieData, setPieData] = useState<any>();
  // const getCustomerPieDetail = async () => {
  //   try {
  //     const response = await getBuisnessAndIndividualCustomerGraph();
  //     if (response && response.data && response.data.data) {
  //       const data = response.data.data;
  //       setPieData(data);
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message);
  //   }
  // };

  useEffect(() => {
    // getCustomerPieDetail();
  }, []);
  const data = [
    {
      name: "Individual",
      value: (pieData && pieData.numberOfIndividualCustomers) || 0,
    },
    {
      name: "Business",
      value: (pieData && pieData.numberOfBusinessCustomers) || 0,
    },
  ];
  const CustomLegend = () => (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", marginRight: 20 }}>
        <div
          style={{
            width: 14,
            height: 14,
            backgroundColor: "#000000",
            marginRight: 5,
          }}
        />
        <span>Individual</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 14,
            height: 14,
            backgroundColor: "#EB0D0D",
            marginRight: 5,
          }}
        />
        <span>Business</span>
      </div>
    </div>
  );
  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            nameKey={"Business"}
            fill="#EB0D0D"
            style={{ fontSize: "18px" }}
            label={({ name, value }) => ` ${value}`}
            innerRadius={50}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}`, `${name}`]}
          />

          <Bar dataKey="Individual" fill="#000000" />
          <Bar dataKey="Business" fill="#EB0D0D" />
        </PieChart>
      </ResponsiveContainer>
      <CustomLegend />
    </>
  );
};

export default CustomPieChart;
