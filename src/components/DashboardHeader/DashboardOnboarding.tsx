import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import time from "../../assets/images/gg_time.png";
import { Tabs } from "antd";
import csv from "../../assets/images/print-csv.svg";
import blackPrint from "../../assets/images/blac-print.png";
import DashboardUserDetail from "./DashboardUserDetail";
import DashboardUserDetail2 from "./DashboardUserDetail2";
import DashboardLocation from "./DashboardLocation";
import toast from "react-hot-toast";
import { onboardingDashboardList } from "../../redux/apis/apisCrud";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import SkeletonLabel from "../SkeletonLabel";
import ChartSkeleton from "../ChartSkeleton";

const DashboardOnboarding = () => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("numbers"); // State for active tab
  const popupRef = useRef(null); // Ref for the popup
  const [dashboardData, setDashboardData] = useState<any>();
  const [labelData, setlabelData] = useState<any>();
  const filterValue = useSelector((state: RootState) => state.block.theme);
  const fromFilter = useSelector((state: RootState) => state.block.fromFilter);
  const toFilter = useSelector((state: RootState) => state.block.toFilter);
  const [loading, setLoading] = useState(false);

  const { TabPane } = Tabs;
  const getList = async (filter: any, from: any, to: any) => {
    try {
      // setSkelitonLoading(true);
      setLoading(true);

      const response = await onboardingDashboardList(filter, from, to);
      if (response) {
        const data = response?.data;
        setDashboardData(data);
        // setData(data || []);
        // setSkelitonLoading(false);
        // setTotalRows(response?.data?.data?.total || 0);
        // setFrom(response?.data?.data?.from || 0);
        // setTo(response?.data?.data?.to || 0);
        // setPage(response?.data?.data?.current_page);
        // setTotalPage(response?.data?.data?.last_page);
        setLoading(false);

      }
    } catch (error: any) {
      toast.error(error?.message);
      setLoading(false);

      // setSkelitonLoading(false);
    } finally {
      setLoading(false);

      // setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getList(filterValue, fromFilter, toFilter);
  }, [filterValue,toFilter,fromFilter]);
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
      data: dashboardData?.onboarding_report?.total_stats?.graph[1]?.stats?.map((day) => day?.name), // Days in Feb 2025
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
        data: dashboardData?.onboarding_report?.total_stats?.graph[1]?.stats?.map((day) => day?.value), // Days in Feb 2025
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "40%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: "#FED932", // Color for the first set of bars
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
      data: dashboardData?.onboarding_report?.total_stats?.graph[0]?.stats?.map((day) => day?.name), // Days in Feb 2025
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
        data: dashboardData?.onboarding_report?.total_stats?.graph[0]?.stats?.map((day) => day?.value), // Days in Feb 2025
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
  const barqguestnum = {
    xAxis: {
      type: "category",
      data: labelData=="guest"?dashboardData?.onboarding_report?.user_stats[0]?.graph[1]?.stats?.map((day) => day?.name):labelData=="lite"?dashboardData?.onboarding_report?.user_stats[1]?.graph[1]?.stats?.map((day) => day?.name):labelData=="flex"?dashboardData?.onboarding_report?.user_stats[2]?.graph[1]?.stats?.map((day) => day?.name):dashboardData?.onboarding_report?.user_stats[3]?.graph[1]?.stats?.map((day) => day?.name), // Days in Feb 2025

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
        data: labelData=="guest"?dashboardData?.onboarding_report?.user_stats[0]?.graph[1]?.stats?.map((day) => day?.value):labelData=="lite"?dashboardData?.onboarding_report?.user_stats[1]?.graph[1]?.stats?.map((day) => day?.value):labelData=="flex"?dashboardData?.onboarding_report?.user_stats[2]?.graph[1]?.stats?.map((day) => day?.value):dashboardData?.onboarding_report?.user_stats[3]?.graph[1]?.stats?.map((day) => day?.value), // Days in Feb 2025
        type: "bar",
        barGap: "0%", // No gap between bars in different series
        barCategoryGap: "0%", // No gap between bars in the same category
        barWidth: "40%", // Adjust the width of the bars (e.g., 40% of the category width)

        itemStyle: {
          color: "#FED932", // Color for the first set of bars
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
  const barqguestavg = {
    xAxis: {
      type: "category",
      data: labelData=="guest"?dashboardData?.onboarding_report?.user_stats[0]?.graph[0]?.stats?.map((day) => day?.name):labelData=="lite"?dashboardData?.onboarding_report?.user_stats[1]?.graph[0]?.stats?.map((day) => day?.name):labelData=="flex"?dashboardData?.onboarding_report?.user_stats[2]?.graph[0]?.stats?.map((day) => day?.name):dashboardData?.onboarding_report?.user_stats[3]?.graph[0]?.stats?.map((day) => day?.name), // Days in Feb 2025
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
        data: labelData=="guest"?dashboardData?.onboarding_report?.user_stats[0]?.graph[0]?.stats?.map((day) => day?.value):labelData=="lite"?dashboardData?.onboarding_report?.user_stats[1]?.graph[0]?.stats?.map((day) => day?.value):labelData=="flex"?dashboardData?.onboarding_report?.user_stats[2]?.graph[0]?.stats?.map((day) => day?.value):dashboardData?.onboarding_report?.user_stats[3]?.graph[0]?.stats?.map((day) => day?.value), // Days in Feb 2025
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

  const handleTabChange = (key) => {
    setActiveTab(key); // Update active tab
  };

  const handleClick = (label:any) => {
    setPopupVisible(!isPopupVisible); // Toggle popup visibility on click
    setlabelData(label);
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
            borderRadius: "2px",
          }}
        >
          <label className="label-tag" style={{ position: "absolute" }}>
            Total Onboarding
          </label>
          <Tabs
            defaultActiveKey="numbers"
            onChange={handleTabChange}
            tabBarStyle={{
              backgroundColor: "#6C727F", // Background color for the tabs
              borderRadius: "2px", // Border radius for the tabs
              padding: "8px", // Add padding for better spacing
              border: "none", // Remove the border
            }}
            tabBarGutter={16} // Add spacing between tabs
            renderTabBar={(props, DefaultTabBar) => (
              <DefaultTabBar
                {...props}
                style={{
                  borderRadius: "2px", // Ensure the active tab has rounded corners
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
                    borderRadius: "2px",
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
                option={barqguestnum}
                style={{ width: "100%", height: "300px" }}
              />
            </TabPane>
            <TabPane
              tab={
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "2px",
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
                option={barqguestavg}
                style={{ width: "100%", height: "300px" }}
              />
            </TabPane>
          </Tabs>
        </div>
      )}

      <div className="dash-onboarding col-12 gap-3">
        <div className="d-flex" style={{ justifyContent: "space-between" }}>
          <h4>Onboardings</h4>
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
  <div className="col-md-12">
    <div className="row onboard-stats">
      <div className="col-md-3">
        <div className="onboarding-stats">
          <span>Avg Onboarding Time</span>
          <label>
            {loading ? (
              <SkeletonLabel />
            ) : (
              <>
                {dashboardData?.onboarding_report?.total_stats?.avg_time ?? 0} sec
              </>
            )}
          </label>
        </div>
        <div className="stats-values">
          <label>
            {loading ? (
              <SkeletonLabel />
            ) : (
              <>
                {dashboardData?.onboarding_report?.total_stats?.total ?? 0}
              </>
            )}
          </label>
          <span>Total Onboardings</span>
        </div>
      </div>
      <div className="col-md-9">
        <div
          style={{
            position: "relative",
            maxWidth: "100%",
            height: "340px",
            borderRadius: "2px",
          }}
        >
          <Tabs
            defaultActiveKey="numbers"
            onChange={handleTabChange}
            tabBarStyle={{
              backgroundColor: "#6C727F",
              borderRadius: "2px",
              padding: "8px",
              border: "none",
            }}
            tabBarGutter={16}
            renderTabBar={(props, DefaultTabBar) => (
              <DefaultTabBar
                {...props}
                style={{
                  borderRadius: "2px",
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
                    borderRadius: "2px",
                    backgroundColor: "#6C727F",
                    color: "#FFFFFF",
                  }}
                >
                  Numbers
                </span>
              }
              key="numbers"
            >
              {loading ? (
                            <ChartSkeleton value={16} />
                          ) : (
                            <ReactECharts
                            option={numbersBarChartOptions}
                            style={{ width: "100%", height: "300px" }}
                          />
                          )}
           
            </TabPane>
            <TabPane
              tab={
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "2px",
                    backgroundColor: "#6C727F",
                    color: "#FFFFFF",
                  }}
                >
                  Average
                </span>
              }
              key="average"
            >
               {loading ? (
                            <ChartSkeleton value={12} />
                          ) : (
                            <ReactECharts
                            option={averageBarChartOptions}
                            style={{ width: "100%", height: "300px" }}
                          />
                          )}
             
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  </div>
  <div className="col-md-12" style={{ padding: "0px" }}>
    <div className="row stats-block onborading-stats">
      <div className="col-md-3">
        <div className="tail-one">
          <div className="onboard-tail">
            <span className="img-span" style={{ backgroundColor: "#FCDEE6" }}>
              <img src={icon} alt="" />
            </span>
            <img
              src={circle}
              alt=""
              width={16}
              height={16}
              onClick={() => { handleClick("guest") }}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div className="onboard-tail">
            <div className="av-time">
              <span className="lite-h5">Barq Guest</span>
              <label>
                {loading ? (
                  <SkeletonLabel />
                ) : (
                  <>
                    {dashboardData?.onboarding_report?.user_stats?.[0]?.total ?? 0}
                  </>
                )}
              </label>
            </div>
            <div className="av-time">
              <span className="lite-h5">
                <img src={time} alt="" style={{ marginRight: "10px" }} />
                Avg Time
              </span>
              <label>
                {loading ? (
                  <SkeletonLabel />
                ) : (
                  <>
                    {dashboardData?.onboarding_report?.user_stats?.[0]?.avg_time ?? 0}
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="tail-one">
          <div className="onboard-tail">
            <span className="img-span" style={{ backgroundColor: "#FCF4D4" }}>
              <img src={icon} alt="" />
            </span>
            <img
              src={circle}
              alt=""
              width={16}
              height={16}
              onClick={() => { handleClick("lite") }}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div className="onboard-tail">
            <div className="av-time">
              <span className="lite-h5">Barq Lite</span>
              <label>
                {loading ? (
                  <SkeletonLabel />
                ) : (
                  <>
                    {dashboardData?.onboarding_report?.user_stats?.[1]?.total ?? 0}
                  </>
                )}
              </label>
            </div>
            <div className="av-time">
              <span className="lite-h5">
                <img src={time} alt="" style={{ marginRight: "10px" }} />
                Avg Time
              </span>
              <label>
                {loading ? (
                  <SkeletonLabel />
                ) : (
                  <>
                    {dashboardData?.onboarding_report?.user_stats?.[1]?.avg_time ?? 0}
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="tail-one">
          <div className="onboard-tail">
            <span className="img-span" style={{ backgroundColor: "#EBEBFF" }}>
              <img src={icon} alt="" />
            </span>
            <img
              src={circle}
              alt=""
              width={16}
              height={16}
              onClick={() => { handleClick("flex") }}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div className="onboard-tail">
            <div className="av-time">
              <span className="lite-h5">Barq Flex</span>
              <label>
                {loading ? (
                  <SkeletonLabel />
                ) : (
                  <>
                    {dashboardData?.onboarding_report?.user_stats?.[2]?.total ?? 0}
                  </>
                )}
              </label>
            </div>
            <div className="av-time">
              <span className="lite-h5">
                <img src={time} alt="" style={{ marginRight: "10px" }} />
                Avg Time
              </span>
              <label>
                {loading ? (
                  <SkeletonLabel />
                ) : (
                  <>
                    {dashboardData?.onboarding_report?.user_stats?.[2]?.avg_time ?? 0}
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="tail-one">
          <div className="onboard-tail">
            <span className="img-span" style={{ backgroundColor: "#FAF2F3" }}>
              <img src={icon} alt="" />
            </span>
            <img
              src={circle}
              alt=""
              width={16}
              height={16}
              onClick={() => { handleClick("prime") }}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div className="onboard-tail">
            <div className="av-time">
              <span className="lite-h5">Barq Prime</span>
              <label>
                {loading ? (
                  <SkeletonLabel />
                ) : (
                  <>
                    {dashboardData?.onboarding_report?.user_stats?.[3]?.total ?? 0}
                  </>
                )}
              </label>
            </div>
            <div className="av-time">
              <span className="lite-h5">
                <img src={time} alt="" style={{ marginRight: "10px" }} />
                Avg Time
              </span>
              <label>
                {loading ? (
                  <SkeletonLabel />
                ) : (
                  <>
                    {dashboardData?.onboarding_report?.user_stats?.[3]?.avg_time ?? 0}
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  </div>
</div>
      </div>
      <div className="dashboard-detail">
        <DashboardUserDetail dashboardData={dashboardData} loading={loading} />
        <DashboardUserDetail2 dashboardData={dashboardData} loading={loading} />
      </div>
      <div className="dashboard-detail">
        <DashboardLocation dashboardData={dashboardData} loading={loading} />
      </div>

      <div className="col-12 mt-3"></div>
    </div>
  );
};

export default DashboardOnboarding;
