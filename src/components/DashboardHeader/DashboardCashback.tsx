import { Col, Card } from "antd";
import LineChart from "../Dashboard/LineChart";
import PieChart from "../Dashboard/PieChart";
import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";
import { Images } from "../Config/Images";
import { themeStyle } from "../Config/Theme";
import PulseLoading from "../Loader/PulseLoader";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";

const DashboardCashback = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [legends, setLegends] = useState<any>();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const popupRef = useRef(null); // Ref for the popup

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

  const barChartOptions = {
    xAxis: {
      type: "category",
      data: ["12", "13", "14", "15", "16", "17", "18"], // Days in Feb 2025
      nameLocation: "middle", // Position the label in the middle
      nameGap: 30, // Increase the gap between the label and the axis
    },
    yAxis: {
      type: "value",
      name: "Avg Time", // Y-axis label
    },
    series: [
      {
        name: "Series 1", // Name for the first set of bars
        data: [10, 20, 15, 25, 30, 22, 18], // Data for the first set of bars
        type: "bar",
        itemStyle: {
          color: "#03BB86", // Color for the first set of bars
        },
      },
      {
        name: "Series 2", // Name for the second set of bars
        data: [5, 15, 10, 20, 25, 18, 12], // Data for the second set of bars
        type: "bar",
        itemStyle: {
          color: "#D52C48", // Color for the second set of bars
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
    legend: {
      data: ["Series 1", "Series 2"], // Legend to differentiate the bars
      left: "left", // Position the legend on the left
      bottom: "bottom", // Position the legend at the bottom
      orient: "horizontal", // Display the legend vertically
      padding: 30, // Increase the gap between the label and the axis
    },
    grid: {
      containLabel: true, // Ensure labels fit within the chart
      left: "5%", // Add space on the left for the legend
      right: "5%",
      bottom: "15%", // Add space at the bottom for the x-axis label
    },
  };

  const handleClick = () => {
    setPopupVisible(!isPopupVisible); // Toggle popup visibility on click
  };

  const chartRef: any = useRef(null);
  let colors: any = "";
  // Function to handle finished event
  const handleChartFinish = () => {
    // Access echarts instance
    const instance = chartRef.current.getEchartsInstance();
    // Get colors used in the chart
    colors = instance.getOption().color;
    // Log colors to the console
    if (!legends) {
      setLegends(colors);
    }
  };

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
    color: [themeStyle.primary, themeStyle.secondary, "#000000"],
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

  return (
    <div className="dashboard">
      {isPopupVisible && (
        <div ref={popupRef}>
          {/* Popup with Bar Chart */}
          <div
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
              maxWidth: "530px",
              height: "380px",
              borderRadius: "6px",
            }}
          >
            <label className="label-tag">Barq Lite Cash in/Out</label>
            <ReactECharts
              option={barChartOptions}
              style={{ width: "100%", height: "350px" }}
            />
          </div>
        </div>
      )}

      <div className="dash-onboarding cash-in-out cash-back col-12 gap-3">
        <h4>Cashback</h4>
        <div className="row">
          <div className="col-md-6">
            <div className="row onboard-stats" style={{ cursor: "pointer" }}>
              <div className="col-md-6">
                <div className="onboarding-stats">
                  <span>Avg Cash in/out</span>
                  <label>
                    1,650 <label className="red-cash">950</label>
                  </label>
                </div>
                <div className="stats-values">
                  <label>
                    115,541 <label className="red-cash">95,541</label>
                  </label>
                  <span>Total Cash in/out</span>
                </div>
              </div>

              <div className="col-md-6">
                <div>
                  <ReactECharts
                    ref={chartRef}
                    option={systemPieGraph}
                    style={{ height: "190px", width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="row stats-block">
              <div className="col-md-6">
                <div className="tail-one">
                  <div>
                    <span className="img-span">
                      <img src={icon} alt="" />
                    </span>

                    <span className="lite-h5">Barq Lite Cash in/out</span>
                    <label>
                      35,000 <label className="lite-red">32,000</label>
                    </label>
                  </div>
                  <div>
                    <img
                      src={circle}
                      alt=""
                      width={16}
                      height={16}
                      onClick={handleClick} // Open popup on click
                      style={{ cursor: "pointer" }} // Add pointer cursor
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="tail-one">
                  <div>
                    <span className="img-span">
                      <img src={icon} alt="" />
                    </span>

                    <span className="lite-h5">Barq Lite</span>
                    <label>
                      35,000 <label className="lite-red">32,000</label>
                    </label>
                  </div>
                  <div>
                    <img src={circle} alt="" width={16} height={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 mt-3"></div>
    </div>
  );
};

export default DashboardCashback;