import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import time from "../../assets/images/gg_time.png";
import csv from "../../assets/images/print-csv.svg";
import blackPrint from "../../assets/images/blac-print.png";
import { Tabs } from "antd";
import ChartSkeleton from "../ChartSkeleton";
const Bundles = (props: any) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [legends, setLegends] = useState<any>();
  const [activeTab, setActiveTab] = useState("numbers");
  const { TabPane } = Tabs;
  const barChartOptions = {
    xAxis: {
      type: "category",
      data: props?.dashboardData?.bundles?.graph?.map((day) => day?.name), // Days in Feb 2025
      // name: "Days in Feb 2025", // X-axis label
      nameLocation: "middle", // Position the label in the middle
      nameGap: 30, // Increase the gap between the label and the axis
    },
    yAxis: {
      type: "value",
      name: "Avg Time", // Y-axis label
    },
    series: {
      name: "Series 1", // Name for the first set of bars
      data: props?.dashboardData?.bundles?.graph?.map((day) => day?.amount), // Data for the first set of bars
      type: "bar",
      barGap: "0%", // No gap between bars in different series
      barCategoryGap: "0%", // No gap between bars in the same category
      barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)
      itemStyle: {
        color: "#FED932", // Color for the first set of bars
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Custom tooltip to show both series values
        let tooltip = `Day ${params[0].axisValue}:<br>`;
        params.forEach((item) => {
          tooltip += `${item.marker} ${item.seriesName}: ${item.data}<br>`;
        });
        return tooltip;
      },
    },
  };
  const chartRef: any = useRef(null);

  const data = [
    { name: "Available", value: 4 },
    { name: "Locked", value: 6 },
    { name: "Pleadge", value: 0 },
  ];
  const totalTickets = data.reduce((sum, item) => sum + item.value, 0);

  const seriesData = [
    {
      symbolSize: 1,
      data: [
        {
          name: "Available",
          value: 4,
        },
        { name: "Locked", value: 6 },
        { name: "Pleadge", value: 0 },
      ],
      name: "test",
      type: "pie",
      radius: ["60%", "80%"],
      center: isMobile ? ["50%", "50%"] : ["50%", "50%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        disabled: true, // Disable hover effects
      },
      labelLine: {
        show: false,
      },
    },
  ];

  const systemPieGraph = {
    color: ["#0089FF", "#FED932"],
    tooltip: {
      trigger: "item",
    },
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: `Total Tickets\n${totalTickets}`, // Display "Total Tickets" and the value
        fontSize: 12, // Font size for the text
        fontWeight: "bold",
        fill: "#333", // Text color
        textAlign: "center", // Center-align the text
        lineHeight: 15,
      },
    },
    series: seriesData,
  };
  const handleTabChange = (key) => {
    setActiveTab(key); // Update active tab
  };
  const numbersBarChartOptions = {
    xAxis: {
      type: "category",
      data: props?.dashboardData?.bundles?.graph?.map((day) => day?.name), // Days in Feb 2025
      nameLocation: "middle", // Position the label in the middle
      nameGap: 30, // Increase the gap between the label and the axis
    },
    yAxis: {
      type: "value",
      name: "Numbers", // Y-axis label
    },
    series: [
      {
        name: "Series 1", // Name for the first set of bars
        data: props?.dashboardData?.bundles?.graph?.map((day) => day?.count), // Data for the first set of bars
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "40%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: "#0089FF", // Color for the first set of bars
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Custom tooltip to show both series values
        let tooltip = `Day ${params[0].axisValue}:<br>`;
        params.forEach((item) => {
          tooltip += `${item.marker} ${item.seriesName}: ${item.data}<br>`;
        });
        return tooltip;
      },
    },
    grid: {
      containLabel: true, // Ensure labels fit within the chart
      left: "5%", // Add space on the left for the legend
      right: "5%",
      bottom: "15%", // Add space at the bottom for the x-axis label
    },
  };

  // Bar chart options for "Average" tab
  const averageBarChartOptions = {
    xAxis: {
      type: "category",
      data: ["12", "13", "14", "15", "16", "17", "18"], // Days in Feb 2025
      nameLocation: "middle", // Position the label in the middle
      nameGap: 30, // Increase the gap between the label and the axis
    },
    yAxis: {
      type: "value",
      name: "Average", // Y-axis label
    },
    series: [
      {
        name: "Series 1", // Name for the first set of bars
        data: [5, 10, 7.5, 12.5, 15, 11, 9], // Average data for the first set of bars
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "40%", // Adjust the width of the bars (e.g., 40% of the category width)
        itemStyle: {
          color: "#6C727F", // Color for the first set of bars
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Custom tooltip to show both series values
        let tooltip = `Day ${params[0].axisValue}:<br>`;
        params.forEach((item) => {
          tooltip += `${item.marker} ${item.seriesName}: ${item.data}<br>`;
        });
        return tooltip;
      },
    },
    grid: {
      containLabel: true, // Ensure labels fit within the chart
      left: "5%", // Add space on the left for the legend
      right: "5%",
      bottom: "15%", // Add space at the bottom for the x-axis label
    },
  };
  const ticketsTab = [
    { key: "Amount", label: "Amount", chartOptions: numbersBarChartOptions },
    {
      key: "Sales",
      label: "No of Sales",
      chartOptions: averageBarChartOptions,
    },
  ];
  return (
    <div className="service">
      <div
        className="row"
        style={{
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <div
          className="d-flex"
          style={{ justifyContent: "space-between", padding: "20px 15px" }}
        >
          <h4>Bundles</h4>
          <div className="csv-print">
            <img
              src={blackPrint}
              alt=""
              width={15}
              height={15}
              style={{ cursor: "pointer" }} // Add pointer cursor
            />
            Print CSV
          </div>
        </div>

        <div className="col-12">
          <div
            style={{
              position: "relative",
              backgroundColor: "white",
              zIndex: 1000,
              maxWidth: "100%",
              height: "380px",
              borderRadius: "16px",
            }}
          >
            <div className="ticket p-3">
              <label className="label-tag" style={{ position: "absolute" }}>
                Bundles sale
              </label>
              <Tabs
                defaultActiveKey="numbers"
                onChange={handleTabChange}
                tabBarStyle={{
                  backgroundColor: "#6C727F",
                  borderRadius: "50px",
                  padding: "10px",
                  border: "none",
                }}
                tabBarGutter={16}
                renderTabBar={(props, DefaultTabBar) => (
                  <DefaultTabBar {...props} style={{ borderRadius: "20px" }} />
                )}
              >
                {ticketsTab.map(({ key, label, chartOptions }) => (
                  <TabPane
                    tab={
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 20px",
                          borderRadius: "50px",
                          backgroundColor: "#6C727F",

                          color: "#FFFFFF",
                        }}
                      >
                        {label}
                      </span>
                    }
                    key={key}
                  >
                    {props?.loading ? (
                      <ChartSkeleton value={15} />
                    ) : (
                      <ReactECharts
                        option={chartOptions}
                        style={{ width: "100%", height: "300px" }}
                      />
                    )}
                  </TabPane>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bundles;
