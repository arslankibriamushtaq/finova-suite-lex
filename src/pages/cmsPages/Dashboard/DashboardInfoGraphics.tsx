import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { Col, Card } from "antd";
import BarChart from "../../../components/cmsComponents/BarChart";
import TableView from "../../../components/TableView/TableView";
import FinanceBarChart from "../../../components/cmsComponents/FinanceChart";
import toast from "react-hot-toast";
import { Images } from "../../../components/Config/Images";
import { themeStyle } from "../../../components/Config/Theme";
import PulseLoading from "../../../components/Loader/PulseLoader";
import { createGlobalStyle } from "styled-components";
import { DatePicker, Radio } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getRecentTickets, getStatusSummary } from "../../../redux/apis/apisCrudCms";
import { useTranslation } from "react-i18next";
dayjs.extend(utc);
dayjs.extend(timezone);

const Dashboard = () => {
  const { t } = useTranslation("cms");
  const [allRecentApplications, setRecentApplications] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loader, setLoader] = useState(true);
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const [radioValue, setRadioValue] = useState("");
  const [fromPicker, setFromPicker] = useState(null);
  const [toPicker, setToPicker] = useState(null);
  const [cardsData, setCardsData] = useState<any>([]);
  
  // Default card structure to show before API response
  const defaultCards = [
    { title: t("common:total"), icon: null, value: null },
    { title: "", icon: null, value: null },
    { title: "", icon: null, value: null },
    { title: "", icon: null, value: null },
    { title: "", icon: null, value: null },
    { title: "", icon: null, value: null },
  ];

  // Use cardsData if available, otherwise use defaultCards
  const displayCards = cardsData.length > 0 ? cardsData : defaultCards;

  useEffect(() => {
    getCardsData();
  }, [fromDate, toDate, radioValue]);

  const handleRangeChange = (value: string) => {
    setRadioValue(value);
    setFromPicker(null);
    setToPicker(null);

    if (value === "today") {
      // Ensure we're working with the local time and set 'from' to today at 00:00:00
      setFromDate(dayjs()?.local()?.startOf("day"));
      // Set 'to' to today at 23:59:59
      setToDate(dayjs()?.local()?.endOf("day"));
    } else if (value === "last-week") {
      // Set 'from' to 7 days ago at 00:00:00 (local time)
      setFromDate(dayjs()?.subtract(7, "days")?.local()?.startOf("day"));
      // Set 'to' to today at 23:59:59 (local time)
      setToDate(dayjs()?.local()?.endOf("day"));
    } else if (value === "last-month") {
      // Set 'from' to 1 month ago at 00:00:00 (local time)
      setFromDate(dayjs().subtract(1, "month").local().startOf("day"));
      // Set 'to' to today at 23:59:59 (local time)
      setToDate(dayjs()?.local()?.endOf("day"));
    }
  };

  const getCardsData = async () => {
    try {
      setLoader(true);
      const response = await getStatusSummary(radioValue);
      if (response) {
        const data = response?.data?.data;
        const updatedData=data.map((item: any) => {
          return {
            title: item.label,
            value: item.count,
            icon: <img src={Images[`${item.label.toLowerCase()}Count` as keyof typeof Images]} height={30}  alt={item.label} />,
            cardType: "default",
          };
          
        });

        // Calculate total count
        const totalCount = data.reduce((sum: number, item: any) => sum + item.count, 0);

        // Add Total object at the beginning
        const finalData = [
          {
            title: t("common:total"),
            value: totalCount,
            icon: <img src={Images.totalCount} height={30}  alt="total" />,
            cardType: "default",
          },
          ...updatedData
        ];

        setCardsData(finalData);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoader(false);
    }
  };

  const Customer_ALL_List_Header = [
    {
      name: t("dashboard.ticketId"),
      selector: (row: { TicketID: any }) => row.TicketID || "-",
    },

  {
      name: t("common:category"),
      selector: (row: { Category: any }) => row.Category || "-",
    },
    {
      name: t("fields.priority"),
      selector: (row: { Priority: any }) => row.Priority || "-",
    },
    {
      name: t("common:status"),
      selector: (row: { Status: any }) => row.Status || "-",
    },
  ];
  const getRecentApplications = async () => {
    try {
      const res = await getRecentTickets();
      if (res?.data?.success) {
        const values = res?.data?.data;
        setRecentApplications(values);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
      // setIndividualModal(false);
    }
  };
  const mappedData =
    allRecentApplications &&
    allRecentApplications.map((item: any) => {
      return {
       TicketID: item.ticket_number,
       Category: item.category?.title,
       Priority: item.category?.priority,
       Status: item.status?.title,
      };
    });
  useEffect(() => {
    getRecentApplications();
  }, [page, pageSize]);

  const GlobalStyle = createGlobalStyle`
  .header_layout {
    background: ${themeStyle?.headerColor.dashboardHeaderBgColor} !important;
  }
  .subheader_layout {
    background: ${themeStyle?.headerColor.dashboardSubheaderBgColor} !important;
  }
`;
  return (
    <>
      <div className="dashboard">
        <div style={{backgroundColor:'var(--color-border-disabled)'}}>
          <div className="d-flex align-items-center justify-content-between">
            <div
              className="d-flex align-items-center ms-2"
              style={{ fontWeight: "600", fontSize: "20px", color: "var(--foreground)" }}
            >
              {t("dashboard.overview")}
            </div>
            <div className="d-flex align-items-center">
              <Radio.Group
                value={radioValue}
                onChange={(e) => handleRangeChange(e.target.value)}
                buttonStyle="solid"
                style={{ marginRight: "16px" }}
              >
                <Radio value="today">{t("dashboard.today")}</Radio>
                <Radio value="last-week">{t("dashboard.lastWeek")}</Radio>
                <Radio value="last-month">{t("dashboard.lastMonth")}</Radio>
              </Radio.Group>

              <div className="d-flex gap-1 p-2">
                <DatePicker
                  className="date-picker"
                  style={{backgroundColor:'white' ,borderRadius:'32px'}}
                  placeholder={t("common:from")}
                  value={fromPicker}
                  onChange={(date) => {
                    setRadioValue("");
                    setFromPicker(date);
                    setFromDate(date);
                  }}
                />

                <DatePicker
                  className="date-picker"
                  style={{backgroundColor:'white' ,borderRadius:'32px'}}
                  placeholder={t("common:to")}
                  value={toPicker}
                  onChange={(date) => {
                    setToPicker(date);
                    setToDate(date);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="d-flex mt-3 col-12 gap-3">
         
            {displayCards.slice(0, 3).map((card: any, index: any) => (
              <Col style={{ flex: 4.5 }} key={index}>
                <div className="card-product p-4 text-dark">
                  <div className="pb-3">
                    {card.icon || null}
                  </div>
                  <div
                    className="mt-4"
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: themeStyle.textColor,
                    }}
                  >
                    {card.title || ""}
                  </div>
                  <div
                    className="mt-2"
                    style={{
                      fontSize: "20px",
                      color: themeStyle.textColor,
                      fontWeight: "600",
                    }}
                  >
                    {loader || card.value === undefined || card.value === null || cardsData.length === 0 ? <PulseLoading /> : card.value}
                  </div>
                </div>
              </Col>
            ))}
          
          </div>
          <div className="d-flex mt-3 col-12 gap-3">
         
            {displayCards.slice(3, 6).map((card: any, index: any) => (
              <Col style={{ flex: 4.5 }} key={index}>
                <div className="card-product p-4 text-dark">
                  <div className="pb-3">
                    {card.icon || null}
                  </div>
                  <div
                    className="mt-4"
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: themeStyle.textColor,
                    }}
                  >
                    {card.title || ""}
                  </div>
                  <div
                    className="mt-2"
                    style={{
                      fontSize: "20px",
                      color: themeStyle.textColor,
                      fontWeight: "600",
                    }}
                  >
                    {loader || card.value === undefined || card.value === null || cardsData.length === 0 ? <PulseLoading /> : card.value}
                  </div>
                </div>
              </Col>
            ))}
          
          </div>
          <div className="col-12 mt-3">
            <Col>
              <Card title={t("dashboard.complaintsMonthly")}>
                <FinanceBarChart/>
              </Card>
            </Col>
          </div>
          <div className="d-flex mt-3 col-12 gap-3">
            <div className="" style={{ flex: 8.8 }}>
              <Col>
                <Card title={t("dashboard.departmentWiseComplaintsMonthly")}>
                  <BarChart />
                </Card>
              </Col>
            </div>
          
          </div>
       
          <div className="col-12">
            <div className="cs-table p-2">
              <h6 className="mt-3 fw-600">{t("dashboard.recentApplication")}</h6>
              <TableView
                setPage={setPage}
                setPageSize={setPageSize}
                totalRows={totalRows}
                header={Customer_ALL_List_Header}
                data={mappedData}
                paginationShow={false}
              />
            </div>
          </div>
        </div>
      </div>
      <GlobalStyle />
    </>
  );
};

export default Dashboard;
