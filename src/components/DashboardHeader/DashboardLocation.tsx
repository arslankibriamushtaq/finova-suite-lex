import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import time from "../../assets/images/gg_time.png";
import { Tabs } from "antd";
import csv from "../../assets/images/print-csv.svg";
import mapImg from "../../assets/images/img-map.png";
import ChartSkeleton from "../ChartSkeleton";



const DashboardLocation = (props: any) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [legends, setLegends] = useState<any>();
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("numbers"); // State for active tab
    const { TabPane } = Tabs;

    const numbersBarChartOptions = {
        xAxis: {
          type: "category",
          data: props?.dashboardData?.data?.location_details?.data?.provinces?.map((day) => day?.name),
          nameLocation: "middle", // Position the label in the middle
          nameGap: 30, // Increase the gap between the label and the axis
        },
        yAxis: {
          type: "value",
          name: "Numbers", // Y-axis label
        },
        series: [
          {
            name: "Cities", // Name for the first set of bars
            data: props?.dashboardData?.data?.location_details?.data?.provinces?.map((day) => day?.total_users),
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
          data: props?.dashboardData?.data?.location_details?.data?.cities?.map((day) => day?.name),
          nameLocation: "middle", // Position the label in the middle
          nameGap: 30, // Increase the gap between the label and the axis
        },
        yAxis: {
          type: "value",
          name: "Average", // Y-axis label
        },
        series: [
          {
            name: "Provinces", // Name for the first set of bars
            data: props?.dashboardData?.data?.location_details?.data?.cities?.map((day) => day?.total_users),
            type: "bar",
            barGap: "0%", // No gap between bars in different series
            barCategoryGap: "0%", // No gap between bars in the same category
            barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)
            itemStyle: {
              color: "#FF9811", // Color for the first set of bars
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
      const handleTabChange = (key) => {
        setActiveTab(key); // Update active tab
      };
    
      const handleClick = () => {
        setPopupVisible(!isPopupVisible); // Toggle popup visibility on click
      };
    
  return (
    <div className="dashboard">
        <div className="row" style={{
            padding:"20px",
            marginTop:"20px"
        }}>
            <div className="col-md-6">
                                <div
                                style={{
                                position: "relative",
                                backgroundColor: "#fff",
                                maxWidth: "100%",
                                height: "400px",
                                borderRadius: "16px",
                                }}
                                >
                                <Tabs
                                defaultActiveKey="numbers"
                                onChange={handleTabChange}
                                tabBarStyle={{
                                backgroundColor: "#6C727F", // Background color for the tabs
                                borderRadius: "20px", // Border radius for the tabs
                                padding: "8px", // Add padding for better spacing
                                border: "none", // Remove the border
                                }}
                                tabBarGutter={16} // Add spacing between tabs
                                renderTabBar={(props, DefaultTabBar) => (
                                <DefaultTabBar
                                {...props}
                                style={{
                                borderRadius: "20px", // Ensure the active tab has rounded corners
                                }}
                                />
                                )}
                                >
                                <TabPane
                                tab={
                                <span
                                style={{
                                display: "inline-block",
                                padding: "8px 16px",
                                borderRadius: "20px",
                                backgroundColor: "#6C727F", // Default background color
                                color: "#FFFFFF", // Default text color
                                }}
                                >
                                Cities
                                </span>
                                }
                                key="numbers"
                                >
                                   {props?.loading ? (
                                    <ChartSkeleton value={12} />
                                ) : (
                                  <ReactECharts
                                  option={averageBarChartOptions}
                                  style={{ width: "100%", height: "380px" }}
                                  />
                                )}
                                
                                </TabPane>
                                <TabPane
                                tab={
                                <span
                                style={{
                                display: "inline-block",
                                padding: "8px 16px",
                                borderRadius: "20px",
                                backgroundColor: "#6C727F", // Default background color
                                color: "#FFFFFF", // Default text color
                                }}
                                >
                               Provinces
                                </span>
                                }
                                key="average"
                                >
                                <ReactECharts
                                option={numbersBarChartOptions}
                                style={{ width: "100%", height: "380px" }}
                                />
                                </TabPane>
                                </Tabs>
                                </div>
                          </div>
            <div className="col-md-6">
                    <div style={{
                        position: "relative",
                        backgroundColor: "white",
                        zIndex: 1000,
                        maxWidth: "100%",
                        borderRadius: "16px",
                    }}>
                        <img
                        src={mapImg}
                        alt=""
                        className="img-size"
                        style={{ cursor: "pointer" }} // Add pointer cursor
                      />
                    </div>  
            </div>
            
     </div>
    </div>
  );
};

export default DashboardLocation;