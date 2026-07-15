import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col } from "antd";

import { Images } from "../../../components/Config/Images";
import { Button, Input, Dropdown, Menu } from "antd";
import { DownOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import TableView from "../../../components/TableView/TableView";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import * as echarts from "echarts/core";
import { themeStyle } from "../../../components/Config/Theme";
const CollateralAllocation = () => {
  const { t } = useTranslation("loanManagement");
  const id = useParams();
  const [collectrolData, setCollectrolData] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [producer, setProducer] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [legends, setLegends] = useState<any>();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const documentsData = [
    {
      key: "1",
      name: "Document 1",
      age: 1324567,
      address: "9/9/2024",
      status: "Active",
      action: "select",
    },
    {
      key: "2",
      name: "Document 2",
      age: 1324567,
      address: "9/9/2024",
      status: "Active",
      action: "select",
    },
  ];

  const Header = [
    {
      name: t("collateralAllocation.colFileName"),
      selector: (row: { name: any }) => row.name,
      width: "300px",
    },
    {
      name: t("collateralAllocation.colTrackingNo"),
      selector: (row: { age: any }) => row.age,
      width: "300px",
    },

    {
      name: t("collateralAllocation.colReceivedDate"),
      selector: (row: { address: any }) => row.address,
      width: "200px",
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("common:status"),
      width: "220px",
      cell: (row: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "0.2rem 1rem",
            borderRadius: "2px",
            // fontSize:"12px",

            backgroundColor: row.Status ? "var(--color-status-green)" : "var(--color-status-red-soft)",
            color: "var(--primary-foreground)",
            cursor: row.Status ? "pointer" : "default",
          }}
        >
          {row.Status ? t("collateralAllocation.statusActive") : t("collateralAllocation.statusInactive")}
        </div>
      ),
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },

    {
      name: t("applications.colAction"),
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            style={{
              background: "linear-gradient(100deg, #DEF5FF, #90CAFF)",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("applications.select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const linkedApplications = [
    {
      key: "1",
      applicationID: "65498712",
      accountID: 65498712,
      lockedAmount: "SAR 300,000",
      pledgedAmount: "SAR 0.00",
      expiryDate: "9/9/2025",
      availability: "Locked",
      action: "select",
    },
    {
      key: "2",
      applicationID: "65498712",
      accountID: 65498712,
      lockedAmount: "SAR 300,000",
      pledgedAmount: "SAR 0.00",
      expiryDate: "9/9/2025",
      availability: "Locked",
      action: "select",
    },
  ];

  const linkedApplicationscolumns = [
    {
      name: t("collateralAllocation.colApplicationId"),
      selector: (row: { applicationID: any }) => row.applicationID,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("collateralAllocation.colAccountId"),
      selector: (row: { accountID: any }) => row.accountID,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("collateralAllocation.colLockedAmount"),
      selector: (row: { lockedAmount: any }) => row.lockedAmount,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("collateralAllocation.colPledgedAmount"),
      selector: (row: { pledgedAmount: any }) => row.pledgedAmount,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("field.expiryDate"),
      selector: (row: { expiryDate: any }) => row.expiryDate,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("collateral.colAvailability"),
      width: "150px",
      cell: (row: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "0.2rem 1rem",
            borderRadius: "2px",
            backgroundColor: row.Status ? "var(--color-status-green)" : "var(--color-status-red-soft)",
            color: "var(--primary-foreground)",
            cursor: row.Status ? "pointer" : "default",
          }}
        >
          {row.Status ? t("collateralAllocation.locked") : t("collateralAllocation.unlocked")}
        </div>
      ),
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("applications.colAction"),
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            style={{
              background: "linear-gradient(100deg, #DEF5FF, #90CAFF)",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("applications.select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    const fetchCollateralData = async () => {
      try {
        const requestId = uuidv4();
        const headers = {
          "Request-Id": requestId,
        };
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_BASE_URL
          }/api/Collateral/GetById/${id.id}`,
          { headers }
        );
        const data = response.data.data;
        setCollectrolData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCollateralData();
  }, []);

  useEffect(() => {
    if (collectrolData) {
      setLoans([
        {
          title: t("field.collateralId"),
          value: "649582124",
        },
        {
          title: t("collateralAllocation.collateralType"),
          value:
            collectrolData.collateralType === 1
              ? t("collateral.typeVehicle")
              : collectrolData.collateralType == 2
              ? t("collateral.typeCashCash")
              : t("collateral.typeProperty"),
        },
        {
          title: t("common:status"),
          value: collectrolData.status ? t("collateral.statusActive") : t("collateral.statusInactive"),
        },
      ]);

      setProducer([
        {
          title: t("collateralAllocation.cardValuationAmount"),
          value: `SAR ${collectrolData.collateralValuation?.valuationAmount}`,
          icon: <img src={Images.ValuationAmount} alt="" />,
          cardType: "default",
        },
        {
          title: t("collateralAllocation.cardLockedAmount"),
          value: "SAR 600,000",
          icon: <img src={Images.LockedAmount} alt="" />,
          cardType: "default",
        },
        {
          title: t("collateralAllocation.cardAvailableBalance"),
          value: "SAR 400,000",
          icon: <img src={Images.AvailableBalance} alt="" />,
          cardType: "default",
        },
      ]);
    }
  }, [collectrolData]);
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="Edit" icon={<EyeOutlined />}>
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item key="loanInvoice" icon={<EditOutlined />}>
        {t("collateralAllocation.menuLoanInvoice")}
      </Menu.Item>
      <Menu.Item key="activitylogs" icon={<EditOutlined />}>
        {t("collateralAllocation.menuActivityLogs")}
      </Menu.Item>
    </Menu>
  );
  const handleChange = (key: string, row: any) => {
    if (key == "Edit") {
      //   navigate("/lms/viewdetails/collateralmanagement/Edit")
    }
    if (key === "loanInvoice") {
      //   navigate("/lms/viewdetails/collateralmanagement/allocation");
      //   handleEditClick(row);
    } else if (key === "view") {
      // handleView(row);
    }
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

  // Effect to subscribe to finished event when component mounts
  useEffect(() => {
    // Cleanup function
    return () => {
      // Unsubscribe from finished event
      if (chartRef.current) {
        chartRef.current
          .getEchartsInstance()
          .off("finished", handleChartFinish);
      }
    };
  }, []);
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
      radius: ["40%", "80%"],
      center: isMobile ? ["50%", "50%"] : ["50%", "50%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: "bold",
        },
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

    series: seriesData,
  };
  const getChainData = [
    {
      name: t("collateralAllocation.legendAvailable"),
      value: 4,
      color: themeStyle.primary,
    },
    { name: t("collateralAllocation.legendLocked"), value: 6, color: "#D1D1D1" },
    { name: t("collateralAllocation.legendPledge"), value: 0, color: themeStyle.secondary },
  ];
  return (
    <>
      <h6 className="mt-3 fw-bold">{t("collateralAllocation.title")}</h6>
      <div className="d-flex mt-3 col-12 gap-2 mb-3">
        <div
          className="d-flex col-12 p-5 justify-content-center"
          style={{
            fontWeight: "700",
            borderRadius: "2px",
            border: `1px solid var(--color-border-light)`,
          }}
        >
          {loans?.map((card, index) => (
            <Col span={8} key={index}>
              <div className="ms-2 text-dark">
                <div
                  className="mt-2"
                  style={{ fontSize: "14px", fontWeight: "400" }}
                >
                  {card.title}
                </div>
                <div
                  className="mt-2"
                  style={{ fontSize: "20px", fontWeight: "600" }}
                  onClick={() => {
                  }}
                >
                  {card?.value ? card?.value : "-"}
                </div>
              </div>
            </Col>
          ))}
        </div>
      </div>

      <div className="d-flex col-12 gap-3">
        {producer.map((card, index) => (
          <Col span={5} key={index}>
            <div
              className="card-product p-4 text-dark"
              style={{ backgroundColor: themeStyle.secondary }}
            >
              <div>{card.icon}</div>
              <div
                className="mt-5"
                style={{ fontSize: "14px", fontWeight: "400", color: "var(--foreground)" }}
              >
                {card.title}
              </div>
              <div
                className="mt-2"
                style={{ fontSize: "20px", fontWeight: "600", color: "var(--foreground)" }}
                onClick={() => {
                }}
              >
                {card.value}
              </div>
            </div>
          </Col>
        ))}
        <div
          className="col-4 card-product  d-flex"
          style={{ backgroundColor: "transparent" }}
        >
          <div className="col-6 pt-2">
            <ReactECharts
              ref={chartRef}
              echarts={echarts}
              option={systemPieGraph}
              style={{ height: "160px", width: "100%" }}
            />
          </div>
          <div className="col-6 d-flex align-items-center">
            <div className="col-12">
              {getChainData &&
                getChainData?.map((item: any, index: any) => {
                  return (
                    <>
                      <div className="p-1 d-flex" style={{ color: "white" }}>
                        <div className="col-1 d-flex align-items-center">
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "2px",
                              backgroundColor: item.color,
                            }}
                          ></div>
                        </div>
                        <div
                          className="col-5 d-flex align-items-center"
                          style={{ fontSize: "10px", color: "var(--foreground)" }}
                        >
                          {item?.name}
                        </div>
                        <div
                          className="col-6 d-flex align-items-center"
                          style={
                            isMobile
                              ? {
                                  fontSize: "10px",
                                  color: "gray",
                                  overflow: "auto",
                                  scrollbarWidth: "none",
                                }
                              : {
                                  color: "var(--foreground)",
                                  overflow: "auto",
                                  scrollbarWidth: "none",
                                }
                          }
                        >
                          <span>SAR</span>
                          {Number(item.value).toFixed(2)}
                        </div>
                      </div>
                    </>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div className="col-12">
        <div className="cs-table p-2">
          <h6 className="mt-3">{t("collateralAllocation.documents")}</h6>
          <TableView
            data={documentsData}
            header={Header}
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
          />
        </div>
      </div>
      <hr />

      <div className="col-12">
        <div className="cs-table p-2">
          <h6 className="mt-3">{t("collateralAllocation.linkedApplications")}</h6>
          <TableView
            data={linkedApplications}
            header={linkedApplicationscolumns}
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
          />
        </div>
      </div>
    </>
  );
};

export default CollateralAllocation;
