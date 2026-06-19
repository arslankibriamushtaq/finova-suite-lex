import { DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import {
  getAccountTimeLineDetail,
  getLoanTimeLineDetail,
} from "../../redux/apis/apisCrud";
import { useParams } from "react-router-dom";
import Loader from "../Loader/Loader";

const AccountTimeline = () => {
  const id = useParams();
  const [data, setData] = useState<any>();
  const [loader, setLoader] = useState<any>();
  useEffect(() => {
    const handleResize = () => {
      //   setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let events: any = [];
  const individualCustomer = async () => {
    try {
      setLoader(true);
      const res = await getAccountTimeLineDetail(id?.id);
      if (res) {
        const value = res?.data.data;
        setLoader(false);
        const eventsResponse = value?.flatMap((yearData) =>
          yearData.months.flatMap((monthData: any) =>
            monthData.items.map((item: any, index: any) => {
              const date = new Date(item.created);
              const monthName = monthNames[date.getMonth()];
              const year = date.getFullYear();
              const formattedDate = date.toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return {
                date: monthName,
                year: String(year),
                title: item.description,
                content: formattedDate,
                background: index % 2 === 0 ? "#EAFBE7" : "#FEF4E6",
                iconColor: index % 2 === 0 ? "#6ED66E" : "#FF9900",
                eventType: item?.eventType,
                propertyName: item?.propertyName,
                oldValue: item?.oldValue,
                newValue: item?.newValue,
                additionalInfo: item?.additionalInfo,
                amount: item?.amount,
              };
            })
          )
        );
        setData(eventsResponse);
      }
    } catch (error: any) {
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    individualCustomer();
  }, []);
  const onChange = (date: any, dateString: string) => {
  };
  return (
    <>
      {loader && <Loader />}
      <div className="p-1">
        <div className="d-flex align-items-center col-12 justify-content-between mb-2">
          <div
            className="d-flex align-items-center col-5"
            style={{ fontWeight: "bold" }}
          >
            Account Timeline
          </div>
          <div className="d-flex align-items-center col-7 justify-content-end gap-2 ">
            <div className="month-picker-container w-100">
              <label className="" htmlFor="">
                Select Month
              </label>
              <DatePicker size="large" picker="month" onChange={onChange} />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">Select Year</label>
              <DatePicker
                picker="year"
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">From </label>
              <DatePicker
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">To</label>
              <DatePicker
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <hr /> */}
      <VerticalTimeline lineColor="var(--color-border-muted)" className="pt-4">
        {data?.map((event, index) => {
          // Check if we need to display a month marker
          const showMonthMarker =
            index === 0 || event?.date !== data[index - 1]?.date;

          return (
            <React.Fragment key={index}>
              {/* Month marker */}
              {showMonthMarker && (
                <div style={{ textAlign: "center", margin: "10px 0" }}>
                  <hr
                    style={{
                      position: "relative",
                      top: "31px",
                      minWidth: "3000px",
                      left: "-800px",
                    }}
                  />
                  <div
                    style={{
                      display: "inline-block",
                      padding: "5px 10px",
                      backgroundColor: "var(--theme-active-color)",
                      borderRadius: "6px",
                      color: "var(--color-near-white)",
                      fontWeight: "bold",
                      zIndex: "1",
                      position: "relative",
                      border: "1px solid var(--color-status-dark)",
                    }}
                  >
                    {event?.date} {event?.year}
                  </div>
                </div>
              )}

              {/* Timeline element */}
              <VerticalTimelineElement
                className="vertical-timeline-element--work"
                contentStyle={{ background: event.background, color: "var(--foreground)" }}
                contentArrowStyle={{
                  borderRight: `7px solid ${event.background}`,
                }}
                date={event?.content}
                dateClassName={
                  event.iconColor === "#6ED66E"
                    ? "custom-date-green"
                    : "custom-date-orange"
                }
                iconStyle={{
                  background: event.iconColor,
                  color: "var(--primary-foreground)",
                  width: "15px",
                  height: "15px",
                }}
              >
                {event?.eventType == 3 ? (
                  <>
                    <h4 className="fs-12">
                      <span className="account-fs-fw pe-2">
                        Modification In:
                      </span>
                      {event?.propertyName}
                    </h4>
                    <h4 className="fs-12">
                      <span className="account-fs-fw pe-2">Current Value:</span>{" "}
                      {event?.oldValue}
                    </h4>
                    <h4 className="fs-12">
                      <span className="account-fs-fw pe-2">
                        Requested Value:
                      </span>{" "}
                      {event?.newValue}
                    </h4>
                    {/* <p className="fs-12">{event?.content}</p> */}
                  </>
                ) : event?.eventType == 4 ? (
                  <>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {event?.title}
                    </h4>
                    <h4 className="fs-12">
                      <span className="account-fs-fw pe-2">Amount:</span> SAR{" "}
                      {event?.amount}
                    </h4>
                    <h4 className="fs-12">
                      <span className="account-fs-fw pe-2">Duration:</span>{" "}
                      {event?.additionalInfo}
                    </h4>
                    {/* <p className="fs-12">{event?.content}</p> */}
                  </>
                ) : event?.eventType == 5 ? (
                  <>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {event?.title}
                    </h4>
                    <h4 className="fs-12">
                      <span className="account-fs-fw pe-2">Amount:</span> SAR{" "}
                      {event?.amount}
                    </h4>
                    <h4 className="fs-12">
                      <span className="account-fs-fw pe-2">Duration:</span>{" "}
                      {event?.additionalInfo}
                    </h4>
                    {/* <p className="fs-12">{event?.content}</p> */}
                  </>
                ) : (
                  <>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {event?.title}
                    </h4>
                    {/* <p className="fs-12">{event?.content}</p> */}
                  </>
                )}
              </VerticalTimelineElement>
            </React.Fragment>
          );
        })}
      </VerticalTimeline>
    </>
  );
};

export default AccountTimeline;
