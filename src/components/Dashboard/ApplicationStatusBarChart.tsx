import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,

  TooltipProps
} from "recharts";
import ReactECharts from "echarts-for-react";
import toast from "react-hot-toast";
import { Select } from "antd";
import { useTranslation } from "react-i18next";

interface ChartData {
  name: string;
  [key: string]: any; // For dynamic values
}

interface CategoryConfig {
  key: string;
  color: string;
}

interface ReusableBarChartProps {
  title: string;
  data?: ChartData[];
  categories: CategoryConfig[];
  fetchData?: (year: string) => Promise<ChartData[]>;
  showYearSelector?: boolean;
  height?: number;
  width?: string | number;
  yearSelectorText?: string;
}

const ApplicationStatusBarChart = ({
  title,
  data: initialData,
  categories,
  fetchData,
  showYearSelector = true,
  height = 300,
  width = "100%",
  // yearSelectorText = "This Year",
}: ReusableBarChartProps) => {
  const { t } = useTranslation("dashboard");
  const [chartData, setChartData] = useState<ChartData[]>(initialData || []);
  const [year, setYear] = useState("2025");
  const [activeTooltip, setActiveTooltip] = useState<any>(null);
  const Option = Select;
  useEffect(() => {
    if (fetchData) {
      loadData();
    } else if (initialData) {
      setChartData(initialData);
    }
  }, [year, fetchData, initialData]);

  const loadData = async () => {
    if (!fetchData) return;
    
    try {
      const data = await fetchData(year);
      setChartData(data);
    } catch (error: any) {
      toast.error(error.message || t("appStatusChart.toast.loadFailed"));
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#fff', 
          padding: '8px 12px', 
          border: '1px solid #ddd',
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ color: '#FF3B3B', fontWeight: 'bold', marginBottom: '2px' }}>
            {`${payload?.[0]?.name || ''}: ${payload?.[0]?.value?.toLocaleString() || ''}`}
          </div>
        </div>
      );
    }
    return null;
  };
  const barChartOptions = {
    xAxis: {
      type: "category",
      data:chartData?.map(
          (day) => day?.name,
       ), // Days in Feb 2025
      // name: "Days in Feb 2025", // X-axis label
      nameLocation: "middle", // Position the label in the middl
    },
    yAxis: {
      type: "value",
      name: t("appStatusChart.yAxis.avgTime"), // Y-axis label
    },
    series: [
      {
        name: t("appStatusChart.series1"), // Name for the first set of bars
        data: [10, 20, 15, 25, 30], // Data for the first set of bars
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)
        itemStyle: {
          color: "#FED932", // Color for the first set of bars
        },
      },
 
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params: any[]) {
        // Custom tooltip to show both series values
        let tooltip = `${t("appStatusChart.tooltipDay", { day: params[0].axisValue })}<br>`;
        params.forEach((item) => {
          tooltip += `${item.marker} ${item.seriesName}: ${item.data}<br>`;
        });
        return tooltip;
      },
    },
  };
  return (
    <div className="bg-white rounded-lg" style={{ height: '100%' }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h5 style={{ fontWeight: 600, fontSize: "20px", margin: 0 }}>{title}</h5>
        {showYearSelector && (
             <Select
                  value={year}
                  className="custom-ant-select"
                  onChange={(value: any) => setYear(value)}
                  style={{
                    width: 78,
                    height: 33,
                  }}
                  bordered={false}
                >
                  <Option value="2025">2025</Option>
                  <Option value="2024">2024</Option>
                  <Option value="2023">2023</Option>
                </Select>
        )}
      </div>

      {/* <ResponsiveContainer width={width} height={height}> */}
        <ReactECharts
          option={barChartOptions}
     
                        style={{ width: "100%", height: "300px" }}
          
       />
          {/* <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#888' }}
            // padding={{ left: 10, right: 10 }}
            tickMargin={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#888' }}
            tickFormatter={(value) => {
              if (value === 0) return '0k';
              if (value >= 1000) return `${value / 1000}k`;
              return value;
            }}
            domain={[0, 'dataMax + 5000']}
            allowDecimals={false}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={false}
          /> */}
          
          {/* {categories.map((category) => (
            <Bar 
              key={category.key} 
              dataKey={category.key} 
              fill={category.color}
              radius={[8, 8, 8, 8]}
              maxBarSize={35}
              barSize={20}
            />
          ))} */}
        {/* </BarChart> */}
      {/* </ResponsiveContainer> */}
    </div>
  );
};

export default ApplicationStatusBarChart;