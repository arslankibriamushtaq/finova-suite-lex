import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import time from "../../assets/images/gg_time.png";
import { Tabs } from "antd";
import csv from "../../assets/images/print-csv.svg";
import blackPrint from "../../assets/images/blac-print.png";
import ChartSkeleton from "../ChartSkeleton";



const DashboardUserDetail2 = (props: any) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [legends, setLegends] = useState<any>();
    const transformPieData = (pie) => {
      if (!pie || typeof pie !== 'object') return [];
      
      return Object.entries(pie)
        .filter(([key]) => key !== "gender") // Exclude the gender field
        .map(([key, count]) => ({
          name: key.toUpperCase(), // Convert remaining keys to uppercase
          count: parseInt(count) || 0 // Ensure count is a number
        }));
    };
    
    const activeuserAge= transformPieData(props?.dashboardData?.data?.user_details?.age_group_statistics?.data[0]);
    const concurrentuserAge = transformPieData(props?.dashboardData?.data?.user_details?.age_group_statistics?.data[1]);
    const barChartOptions = {
        xAxis: {
          type: "category",
          data: activeuserAge?.map((day) => 
            day?.name,
          ),
          nameLocation: "middle", // Position the label in the middle
          nameGap: 30, // Increase the gap between the label and the axis
        },
        yAxis: {
          type: "value",
          name: "Avg Time", // Y-axis label
        },
        series: [
          {
            name: "Active", // Name for the first set of bars
            data: activeuserAge?.map((day) => 
              day?.count,
          ),
            type: "bar",
            barGap: "0%", // No gap between bars in different series
            barCategoryGap: "0%", // No gap between bars in the same category
            barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)
            itemStyle: {
              color: "#FF9811", // Color for the first set of bars
            },
          },
          {
            name: "Concurrent", // Name for the second set of bars
            data: concurrentuserAge?.map((day) => 
              day?.count,
          ),
            type: "bar",
            barGap: "0%", // No gap between bars in different series
            barCategoryGap: "0%", // No gap between bars in the same category
            barWidth: "20%", // Adjust the width of the bars (e.g., 40% of the category width)
            itemStyle: {
              color: "#614FA2", // Color for the second set of bars
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
          data: ["Active", "Concurrent"], // Legend to differentiate the bars
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
        data: props?.dashboardData?.data?.user_details?.device_statistics?.data?.map((day) => ({
          value: day?.count,
          name: day?.name,
        })),
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
        color: ["#C81D25", "#AB1920","#64797a"],
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: 'horizontal', // or 'vertical'
          bottom: -10, // Position at the bottom
          padding: 20,
          data: props?.dashboardData?.data?.user_details?.device_statistics?.data?.map(item => item?.name) || [], // Legend items from your data
          textStyle: {
            fontSize: 12,
            color: '#333'
          }
        },
        graphic: {
          type: "text",
          left: "center",
          top: "center",
          style: {
            text: `Total Tickets\n${props?.dashboardData?.data?.user_details?.device_statistics?.total ?? 0}`,
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
        <div className="row" style={{
            padding:"20px",
            marginTop:"20px"
        }}>
            <div className="col-md-8">
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
                <label className="label-tag">Active and Concurrent Users</label>
                   
                    {props?.loading ? (
                            <ChartSkeleton value={15} />
                          ) : (
                            <ReactECharts
                            option={barChartOptions}
                            style={{ width: "100%", height: "350px" }}
                        />
                          )}

                          
                </div>
            </div>
            <div className="col-md-4">
                    <div style={{
                        position: "relative",
                        backgroundColor: "white",
                        zIndex: 1000,
                        maxWidth: "100%",
                        height: "380px",
                        borderRadius: "2px",
                    }}>
                    <label className="label-tag">Device Type</label>
                    <ReactECharts
                        ref={chartRef}
                        option={systemPieGraph}
                        style={{  height: "350px", width: "100%" }}
                    />
                    </div>  
            </div>
            
     </div>
    </div>
  );
};

export default DashboardUserDetail2;