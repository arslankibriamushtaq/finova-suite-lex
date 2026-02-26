import { useRef, useState } from "react";

import { themeStyle } from "../Config/Theme";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import blackPrint from "../../assets/images/blac-print.png";

import SkeletonLabel from "../SkeletonLabel";
import { NumberFormatter } from "../../utils/const.utils";
import { saveAs } from "file-saver";
const DashboardOnboardingInfo = (props: any) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const chartRef: any = useRef(null);

  const seriesData = [
    {
      symbolSize: 1,
      data: props?.dashboardData?.onboarding?.pie_graph?.data?.map((day) => ({
        value: day?.count,
        name: day?.name,
      })),

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
  const exportUserGraphStatsToCSV = (userStats: any[], graphType: string, fileName: string) => {
    const csvRows = [];
  
    // Set headers
    const headers = ["User", "Date", "Value"];
    csvRows.push(headers.join(","));
  
    userStats.forEach((user) => {
      const graph = user.graph.find((g: any) => g.name === graphType);
      if (graph) {
        graph.stats.forEach((stat: any) => {
          const row = [user.name, stat.name, stat.value];
          csvRows.push(row.join(","));
        });
      }
    });
  
    // Create and download the CSV
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };
  const systemPieGraph = {
    color: [themeStyle.primary, themeStyle.secondary, "#000000"],
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        // Custom tooltip content with a bar chart embedded
        return `
          <div>
            <strong>${params.name}</strong><br />
            Value: ${params.value}<br />
            Percentage: ${params.percent}%
            <div style="width: 200px; height: 100px; margin-top: 10px;">
              <ReactECharts
                option={barChartOption}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        `;
      },
    },
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: `Total \n${props?.dashboardData?.onboarding?.pie_graph?.total||"0"}`, // Display "Total Tickets" and the value
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
      <div className="dash-onboarding col-12 gap-3">
        <div className="d-flex" style={{ justifyContent: "space-between" }}>
          <h4>
            Onboardings <span className="on-view">View More</span>
          </h4>
          <div className="csv-print"   style={{ cursor: "pointer" }}   onClick={() => {
              exportUserGraphStatsToCSV(props?.dashboardData?.onboarding?.user_stats,"avg_type", "Dashboard-Onboarding");
            }}>
            <img
           
              src={blackPrint}
              alt=""
              width={15}
              height={15}
             // Add pointer cursor
            />
            Print CSV
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="row onboard-stats">
              <div className="col-md-12">
                <div className="in-out-fund onboard-cash">
                  <div className="onboarding-stats">
                    <span>Avg Onboarding Time</span>
                    <label>
                      {props?.loading ? (
                        <SkeletonLabel /> // Show the skeleton loader while loading
                      ) : (
                        <>
                          {
                            props?.dashboardData?.onboarding?.total_stats
                              ?.avg_time
                          }{" "}
                          <span>sec</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-7">
                    <div className="stats-values">
                      <span>Total Onboardings Volume</span>

                      <label>
                        {" "}
                        {props?.loading ? (
                          <SkeletonLabel /> // Show the skeleton loader while loading
                        ) : (
                          <>
                            {NumberFormatter(
                              props?.dashboardData?.onboarding?.total_stats
                                ?.total
                            )}{" "}
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <ReactECharts
                      ref={chartRef}
                      option={systemPieGraph}
                      style={{ height: "150px", width: "100%" }}
                    />
                  </div>
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

                    <span className="lite-h5">Barq Lite</span>
                    <label>
                      {" "}
                      {props?.loading ? (
                        <SkeletonLabel /> // Show the skeleton loader while loading
                      ) : (
                        <>
                          {NumberFormatter(
                            props?.dashboardData?.onboarding?.user_stats[1]
                              ?.total
                          )}{" "}
                        </>
                      )}
                    </label>
                  </div>
                  <div>
                    <div
                      style={{
                        height: "30px",
                        lineHeight: "30px",
                        display: "block",
                        textAlign: "right",
                      }}
                    >
                      <img src={circle} alt="" width={16} height={16} />
                    </div>
                    <div className="avg-time">
                      <span className="lite-h5">Avg Time</span>
                      <label>
                        {props?.loading ? (
                          <SkeletonLabel /> // Show the skeleton loader while loading
                        ) : (
                          <>
                            {NumberFormatter(
                              props?.dashboardData?.onboarding?.user_stats[1]
                                ?.avg_time
                            )}{" "}
                            sec
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="tail-one">
                  <div>
                    <span className="img-span">
                      <img src={icon} alt="" />
                    </span>

                    <span className="lite-h5">Barq Flex</span>
                    <label>
                      {" "}
                      {props?.loading ? (
                        <SkeletonLabel /> // Show the skeleton loader while loading
                      ) : (
                        <>
                          {NumberFormatter(
                            props?.dashboardData?.onboarding?.user_stats[2]
                              ?.total
                          )}{" "}
                          sec
                        </>
                      )}
                    </label>
                  </div>
                  <div>
                    <div
                      style={{
                        height: "30px",
                        lineHeight: "30px",
                        display: "block",
                        textAlign: "right",
                      }}
                    >
                      <img src={circle} alt="" width={16} height={16} />
                    </div>
                    <div className="avg-time">
                      <span className="lite-h5">Avg Time</span>
                      <label>
                        {" "}
                        {props?.loading ? (
                          <SkeletonLabel /> // Show the skeleton loader while loading
                        ) : (
                          <>
                            {NumberFormatter(
                              props?.dashboardData?.onboarding?.user_stats[2]
                                ?.avg_time
                            )}{" "}
                            sec
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="tail-one">
                  <div>
                    <span className="img-span">
                      <img src={icon} alt="" />
                    </span>

                    <span className="lite-h5">Barq Prime</span>
                    <label>
                      {" "}
                      {props?.loading ? (
                        <SkeletonLabel /> // Show the skeleton loader while loading
                      ) : (
                        <>
                          {NumberFormatter(
                            props?.dashboardData?.onboarding?.user_stats[3]
                              ?.total
                          )}{" "}
                        </>
                      )}
                    </label>
                  </div>
                  <div>
                    <div
                      style={{
                        height: "30px",
                        lineHeight: "30px",
                        display: "block",
                        textAlign: "right",
                      }}
                    >
                      <img src={circle} alt="" width={16} height={16} />
                    </div>
                    <div className="avg-time">
                      <span className="lite-h5">Avg Time</span>
                      <label>
                        {" "}
                        {props?.loading ? (
                          <SkeletonLabel /> // Show the skeleton loader while loading
                        ) : (
                          <>
                            {NumberFormatter(
                              props?.dashboardData?.onboarding?.user_stats[3]
                                ?.avg_time
                            )}{" "}
                            sec
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="tail-one">
                  <div>
                    <span className="img-span">
                      <img src={icon} alt="" />
                    </span>

                    <span className="lite-h5">Barq Guest</span>
                    <label>
                      {" "}
                      {props?.loading ? (
                        <SkeletonLabel /> // Show the skeleton loader while loading
                      ) : (
                        <>
                          {NumberFormatter(
                            props?.dashboardData?.onboarding?.user_stats[0]
                              ?.total
                          )}{" "}
                        </>
                      )}
                    </label>
                  </div>
                  <div>
                    <div
                      style={{
                        height: "30px",
                        lineHeight: "30px",
                        display: "block",
                        textAlign: "right",
                      }}
                    >
                      <img src={circle} alt="" width={16} height={16} />
                    </div>

                    <div className="avg-time">
                      <span className="lite-h5">Avg Time</span>
                      <label>
                        {" "}
                        {props?.loading ? (
                          <SkeletonLabel /> // Show the skeleton loader while loading
                        ) : (
                          <>
                            {NumberFormatter(
                              props?.dashboardData?.onboarding?.user_stats[0]
                                ?.avg_time
                            )}{" "}
                            sec
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

      <div className="col-12 mt-3"></div>
    </div>
  );
};

export default DashboardOnboardingInfo;
