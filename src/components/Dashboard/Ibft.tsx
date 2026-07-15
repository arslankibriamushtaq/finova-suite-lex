import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import time from "../../assets/images/gg_time.png";
import csv from "../../assets/images/print-csv.svg";
import blackPrint from "../../assets/images/blac-print.png";
import { Tabs } from "antd";
import ChartSkeleton from "../ChartSkeleton";
import { useTranslation } from "react-i18next";
const Ibft = (props: any) => {
  const { t } = useTranslation("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [legends, setLegends] = useState<any>();
  const [activeTab, setActiveTab] = useState("numbers");
  const { TabPane } = Tabs;

  const data = [
    { name: "Available", value: 4 },
    { name: "Locked", value: 6 },
    { name: "Pleadge", value: 0 },
  ];
  const handleTabChange = (key) => {
    setActiveTab(key); // Update active tab
  };
  const numbersBarChartOptions = {
    xAxis: {
      type: "category",
      data: props?.dashboardData?.ibft_report_card?.graph?.map(
        (day) => day?.name
      ), // Days in Feb 2025
      nameLocation: "middle", // Position the label in the middle
      nameGap: 30, // Increase the gap between the label and the axis
    },
    yAxis: {
      type: "value",
      name: t("services.numbers"), // Y-axis label
    },
    series: [
      {
        name: t("ibft.series.incoming"), // Name for the first set of bars
        data: props?.dashboardData?.ibft_report_card?.graph?.map(
          (day) => day?.total_fund
        ), // Data for the first set of bars
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: "#03BB86", // Color for the first set of bars
        },
      },
      {
        name: t("ibft.series.outgoing"), // Name for the first set of bars
        data: props?.dashboardData?.ibft_report_card?.outgoing_graph?.map(
          (day) => day?.total_fund
        ), // Data for the first set of bars
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: "#D52C48", // Color for the first set of bars
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Custom tooltip to show both series values
        let tooltip = `${t("appStatusChart.tooltipDay", { day: params[0].axisValue })}<br>`;
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
  const avgBarChartOptions = {
    xAxis: {
      type: "category",
      data: props?.dashboardData?.ibft_report_card?.graph?.map(
        (day) => day?.name
      ), // Days in Feb 2025
      nameLocation: "middle", // Position the label in the middle
      nameGap: 30, // Increase the gap between the label and the axis
    },
    yAxis: {
      type: "value",
      name: t("services.numbers"), // Y-axis label
    },
    series: [
      {
        name: t("ibft.series.incoming"), // Name for the first set of bars
        data: props?.dashboardData?.ibft_report_card?.graph?.map(
          (day) => day?.average_fund
        ), // Data for the first set of bars
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: "#03BB86", // Color for the first set of bars
        },
      },
      {
        name: t("ibft.series.outgoing"), // Name for the first set of bars
        data: props?.dashboardData?.ibft_report_card?.outgoing_graph?.map(
          (day) => day?.average_fund
        ), // Data for the first set of bars
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: "#6C727F", // Color for the first set of bars
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Custom tooltip to show both series values
        let tooltip = `${t("appStatusChart.tooltipDay", { day: params[0].axisValue })}<br>`;
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

  const ticketsTab = [
    {
      key: "Amount",
      label: t("ibft.tab.totalFunds"),
      chartOptions: numbersBarChartOptions,
    },
    {
      key: "Sales",
      label: t("ibft.tab.avgFunds"),
      chartOptions: avgBarChartOptions,
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
          <h4>{t("ibft.title")}</h4>
          <div className="csv-print">
            <img
              src={blackPrint}
              alt=""
              width={15}
              height={15}
              style={{ cursor: "pointer" }} // Add pointer cursor
            />
            {t("services.printCsv")}
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
              borderRadius: "2px",
            }}
          >
            <div className="ticket p-3">
              <label className="label-tag" style={{ position: "absolute" }}>
                {t("ibft.label")}
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
                  <DefaultTabBar {...props} style={{ borderRadius: "2px" }} />
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
                      <ChartSkeleton value={22} />
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

export default Ibft;
