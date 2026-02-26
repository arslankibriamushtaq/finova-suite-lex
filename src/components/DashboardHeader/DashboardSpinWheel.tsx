import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import time from "../../assets/images/gg_time.png";
import { Tabs } from "antd";
import csv from "../../assets/images/print-csv.svg";
import blackPrint from "../../assets/images/blac-print.png";
import ChartSkeleton from "../ChartSkeleton";

const DashboardSpinWheel = (props: any) => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("numbers"); // State for active tab
  const popupRef = useRef(null); // Ref for the popup
  const { TabPane } = Tabs;

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupVisible(false); // Close the popup
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Bar chart options for "Numbers" tab
  const numbersBarChartOptions = {
    xAxis: {
      type: "category",
      data: props?.dashboardData?.spin_wheel_stats?.graph?.map((day) => day?.name), // Days in Feb 2025
      nameLocation: "middle", // Position the label in the middle
      nameGap: 30, // Increase the gap between the label and the axis
    },
    yAxis: {
      type: "value",
      name: "Numbers", // Y-axis label
    },
    series: [
      {
        name: "Onboarding", // Name for the first set of bars
        data: props?.dashboardData?.spin_wheel_stats?.graph.map((day) => day?.onboarding_count), // Days in Feb 2025
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "15%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: " #98D2DA", // Color for the first set of bars
        },
      },
      {
        name: "Referral", // Name for the first set of bars
        data: props?.dashboardData?.spin_wheel_stats?.graph.map((day) => day?.referral_count), // Days in Feb 2025
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "15%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: " #03BB86", // Color for the first set of bars
        },
      },
      {
        name: "Transactions", // Name for the first set of bars
        data: props?.dashboardData?.spin_wheel_stats?.graph.map((day) => day?.transactional_count), // Days in Feb 2025
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "15%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: " #0089FF", // Color for the first set of bars
        },
      }
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
    legend: {
      data: ["Onboarding", "Referral","Transactions"], // Legend to differentiate the bars
      left: "left", // Position the legend on the left
      bottom: "bottom", // Position the legend at the bottom
      orient: "horizontal", // Display the legend vertically
      padding: 10, // Increase the gap between the label and the axis
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
        name: "Onboarding", // Name for the first set of bars
        data: props?.dashboardData?.spin_wheel_stats?.graph.map((day) => day?.onboarding_reward), // Days in Feb 2025
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "15%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: " #98D2DA", // Color for the first set of bars
        },
      },
      {
        name: "Referral", // Name for the first set of bars
        data: props?.dashboardData?.spin_wheel_stats?.graph.map((day) => day?.referral_reward), // Days in Feb 2025
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "15%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: " #03BB86", // Color for the first set of bars
        },
      },
      {
        name: "Transactions", // Name for the first set of bars
        data: props?.dashboardData?.spin_wheel_stats?.graph.map((day) => day?.transactional_reward), // Days in Feb 2025
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "15%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: " #0089FF", // Color for the first set of bars
        },
      }
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
    legend: {
      data: ["Onboarding", "Referral","Transactions"], // Legend to differentiate the bars
      left: "left", // Position the legend on the left
      bottom: "bottom", // Position the legend at the bottom
      orient: "horizontal", // Display the legend vertically
      padding: 10, // Increase the gap between the label and the axis
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
    {isPopupVisible && (
      <div
        ref={popupRef} // Attach the ref to the popup container
        style={{
          position: "absolute",
          top: "60px",
          left: "0",
          right: "0",
          margin: "0 auto",
          backgroundColor: "white",
          border: "1px solid #ccc",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          padding: "0px",
          zIndex: 1000,
          maxWidth: "630px",
          height: "380px",
          borderRadius: "16px",
        }}
      >
        <label className="label-tag" style={{position: 'absolute'}}>Total Onboarding</label>
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
              Numbers
            </span>
          }
          key="numbers"
     >
      <ReactECharts
        option={numbersBarChartOptions}
        style={{ width: "100%", height: "300px" }}
      />
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
              Average
            </span>
          }
          key="average"
        >
      <ReactECharts
        option={averageBarChartOptions}
        style={{ width: "100%", height: "300px" }}
      />
    </TabPane>
  </Tabs>
      </div>
    )}

    <div className="dash-onboarding javalin-center-board spin-wheel col-12 gap-3">
      <div className="d-flex" style={{    justifyContent: "space-between"}}>
        <h4>Spin The Wheel</h4>
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
      
      <div className="row">
      <div className="col-md-12" style={{padding:"0px"}}>
          <div className="row stats-block onborading-stats">
            <div className="col-md-4">
              <div className="tail-one">
                <div className="onboard-tail">
                    <h5>Onboarding Reward</h5>
                </div>
                <div className="onboard-tail">
                  <div className="av-time">
                      <span className="lite-h5">Total Amount</span>
                      <label>{props?.dashboardData?.spin_wheel_stats?.onboarding_count}</label>
                  </div>
                  <div className="av-time">
                      <span className="lite-h5">
                       
                          Total Spins</span>
                        <label>{props?.dashboardData?.spin_wheel_stats?.onboarding_reward}</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
                <div className="tail-one">
                <div className="onboard-tail">
                  <h5>Referral Reward</h5>
                </div>
                <div className="onboard-tail">
                  <div className="av-time">
                      <span className="lite-h5">Total Amount</span>
                      <label>{props?.dashboardData?.spin_wheel_stats?.referral_count}</label>
                  </div>
                  <div className="av-time">
                      <span className="lite-h5">
                       
                          Total Spins</span>
                        <label>{props?.dashboardData?.spin_wheel_stats?.referral_reward}</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
                <div className="tail-one">
                <div className="onboard-tail">
                  <h5>Transaction Reward</h5>
                </div>
                <div className="onboard-tail">
                  <div className="av-time">
                      <span className="lite-h5">Total Amount</span>
                      <label>{props?.dashboardData?.spin_wheel_stats?.transactional_count}</label>
                  </div>
                  <div className="av-time">
                      <span className="lite-h5">
                        
                          Total Spins</span>
                        <label>{props?.dashboardData?.spin_wheel_stats?.transactional_reward}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="user-detail-bg" style={{backgroundColor:"#E1F4FF", borderRadius:"16px" }}>
          </div>
        </div>
        <div className="col-md-12">
          <div className="row onboard-stats">
           
            <div className="col-md-12">
                  <div
                  style={{
                  position: "relative",

                  maxWidth: "100%",
                  height: "420px",
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
                  Amount
                  </span>
                  }
                  key="numbers"
                  >
                    {props.loading ? (
                        <ChartSkeleton value={19} />
                        ) : (
                          <ReactECharts
                  option={numbersBarChartOptions}
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
                  Game Played 
                  </span>
                  }
                  key="average"
                  >
                  <ReactECharts
                  option={averageBarChartOptions}
                  style={{ width: "100%", height: "300px" }}
                  />
                  </TabPane>
                  </Tabs>
                  </div>
            </div>
          </div>
        </div>
       
      </div>
    </div>
    <div className="dashboard-detail">
                 
    </div>
    <div className="dashboard-detail">
    </div>

    <div className="col-12 mt-3"></div>
  </div>
  );
};

export default DashboardSpinWheel;
