import { DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

import { getLoanTimeLineDetail } from "../../redux/apis/apisCrudLms";
import { useParams } from "react-router-dom";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";

// const events = [
//   {
//     date: "December",
//     year: "2023",
//     title: "Customer Onboarded Successfully",
//     content: "31 Dec, 2023 11:24 am",
//     background: "#EAFBE7",
//     iconColor: "#6ED66E",
//   },
//   {
//     date: "January",
//     year: "2024",
//     title: "Customer marked as a skipped debtor",
//     content: "02 Jan, 2024 11:24 am",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },
//   {
//     date: "January",
//     year: "2024",
//     title: "Privacy Opt-Out indicator marked",
//     content: "02 Jan, 2024 02:10 pm",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },
//   {
//     date: "January",
//     year: "2024",
//     title: "Stop correspondence",
//     content: "02 Jan, 2024 02:10 pm",
//     background: "#EAFBE7",
//     iconColor: "#6ED66E",
//   },

//   {
//     date: "February",
//     year: "2024",
//     title: "Start an ACH",
//     content: "02 Feb, 2024 10:20 am",
//     background: "#EAFBE7",
//     iconColor: "#6ED66E",
//   },
//   {
//     date: "February",
//     year: "2024",
//     title: "Add servicing of account with post dated checks as a repayment method",
//     content: " 12 Feb, 2024 11:24 AM",
//     background: "#EAFBE7",
//     iconColor: "#6ED66E",
//   },
//   {
//     date: "February",
//     year: "2024",
//     title: "Stop an ACH",
//     content: " 12 Feb, 2024 11:24 AM",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },
//   {
//     date: "March",
//     year: "2024",
//     title: "Cancel an ESC",
//     content: " 01 March, 2024 11:24 AM",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },
//   {
//     date: "March",
//     year: "2024",
//     title: "Apply refund payment to an ESC",
//     content: " 01 March, 2024 11:24 AM",
//     background: "#EAFBE7",
//     iconColor: "#6ED66E",
//   },
//   {
//     date: "March",
//     year: "2024",
//     title: "Reversed the Insurance Cancellation",
//     content: " 01 March, 2024 11:24 AM",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },
//   {
//     date: "April",
//     year: "2024",
//     title: "Edit new escrow insurance detail",
//     content: " 01 April, 2024 11:24 AM",
//     background: "#EAFBE7",
//     iconColor: "#6ED66E",
//   },
//   {
//     date: "April",
//     year: "2024",
//     title: "Change insurance annual disbursement",
//     content: " 01 April, 2024 11:24 AM",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },
//   {
//     date: "April",
//     year: "2024",
//     title: "Change escrow indicators of insurance",
//     content: " 01 April, 2024 11:24 AM",
//     background: "#EAFBE7",
//     iconColor: "#6ED66E",
//   },
//   {
//     date: "April",
//     year: "2024",
//     title: "Chnage insurance expiration date",
//     content: " 01 April, 2024 11:24 AM",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },
//   {
//     date: "April",
//     year: "2024",
//     title: "Change insurance maturity",
//     content: " 01 April, 2024 11:24 AM",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },
//   {
//     date: "May",
//     year: "2024",
//     title: "Chnage tax annual desbursement",
//     content: " 01 May, 2024 11:24 AM",
//     background: "#EAFBE7",
//     iconColor: "#6ED66E",
//   },
//   {
//     date: "May",
//     year: "2024",
//     title: "Chnage tax desbursement plan",
//     content: " 01 May, 2024 11:24 AM",
//     background: "#FEF4E6",
//     iconColor: "#FF9900",
//   },

// ];

const LoanTimeline = () => {
  const { t } = useTranslation("customersB");
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
      const res = await getLoanTimeLineDetail(id?.id);
      if (res) {
        const value = res?.data.data;
        setLoader(false);
        const eventsResponse = value?.flatMap((yearData: any) =>
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
                amount: item.amount,
                duration: item.duration,
                numOfInstallments: item.numOfInstallments,
                itemNumber: item.itemNumber,
                tid: item.tid,
                newValue: item.newValue,
                oldValue: item.oldValue,
                propertyName: item.propertyName,
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
            {t("customersB:timeline.title")}
          </div>
          <div className="d-flex align-items-center col-7 justify-content-end gap-2 ">
            <div className="month-picker-container w-100">
              <label className="" htmlFor="">
                {t("customersB:timeline.selectMonth")}
              </label>
              <DatePicker size="large" picker="month" onChange={onChange} />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">{t("customersB:timeline.selectYear")}</label>
              <DatePicker
                picker="year"
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">{t("common:from")} </label>
              <DatePicker
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">{t("common:to")}</label>
              <DatePicker
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <hr />
      <VerticalTimeline lineColor="var(--color-border-muted)" className="pt-4">
        {data?.map((event, index) => {
          // Show year marker only if this event's year is different from the previous event's year
          const showYearMarker =
            index > 0 && event?.year !== data[index - 1]?.year;
          const showMonthMarker =
            index > 0 &&
            (event?.date !== data[index - 1]?.date ||
              event?.year !== data[index - 1]?.year);

          return (
            <React.Fragment key={index}>
              {showYearMarker && (
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
                      borderRadius: "2px",
                      color: "var(--color-near-white)",
                      fontWeight: "bold",
                      zIndex: "1",
                      position: "relative",
                      border: "1px solid var(--color-status-dark)",
                    }}
                  >
                    {event?.year}
                  </div>
                </div>
              )}
              {showMonthMarker && (
                <div style={{ textAlign: "center", margin: "10px 0" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "5px 10px",
                      backgroundColor: "var(--color-border-muted)",
                      borderRadius: "2px",
                      color: "var(--color-text-dark)",
                      fontWeight: "bold",
                      zIndex: "1",
                      position: "relative",
                      border: "1px solid #aaa",
                    }}
                  >
                    {event?.date} {event?.year}
                  </div>
                </div>
              )}
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
                <div className="d-flex">
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      width: "70%",
                      lineHeight: "20px",
                    }}
                  >
                    {event?.title}
                  </h4>
                  {event?.eventType == 4 && (
                    <div className="mt-1" style={{ fontSize: "12px" }}>
                      <span className="customer-fs-fw">{t("customersB:timeline.tid")}</span>
                      C12657
                    </div>
                  )}
                  {event?.eventType == 5 && (
                    <div
                      className="mt-1"
                      style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                    >
                      <span className="customer-fs-fw">{t("customersB:timeline.invoiceId")}</span>
                      {event.itemNumber}
                    </div>
                  )}
                  {event?.eventType == 10 && (
                    <div
                      className="mt-1"
                      style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                    >
                      <span className="customer-fs-fw">{t("customersB:timeline.invoiceId")}</span>
                      {event.itemNumber}
                    </div>
                  )}
                  {event?.eventType == 11 && (
                    <div
                      className="mt-1"
                      style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                    >
                      <span className="customer-fs-fw">{t("customersB:timeline.invoiceId")}</span>
                      {event.itemNumber}
                    </div>
                  )}
                  {event?.eventType == 12 && (
                    <div
                      className="mt-1"
                      style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                    >
                      <span className="customer-fs-fw">{t("customersB:timeline.invoiceId")}</span>
                      {event.itemNumber}
                    </div>
                  )}
                  {event?.eventType == 6 && (
                    <>
                      <div>
                        <div
                          className="mt-1"
                          style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                        >
                          <span className="customer-fs-fw">{t("customersB:timeline.invoiceId")}</span>

                          {event.itemNumber}
                        </div>
                        <div
                          className="mt-1"
                          style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                        >
                          <span className="customer-fs-fw">
                            {event.propertyName === "Cheque"
                              ? t("customersB:timeline.chequeNo")
                              : t("customersB:timeline.tid")}
                          </span>
                          {event.tid}
                        </div>
                      </div>
                    </>
                  )}
                  {event?.eventType == 7 && (
                    <div
                      className="mt-1"
                      style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                    >
                      <span className="customer-fs-fw"> {t("customersB:timeline.pid")}</span>
                      P12657
                    </div>
                  )}
                  {event?.eventType == 8 && (
                    <div
                      className="mt-1"
                      style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                    >
                      <span className="customer-fs-fw"> {t("customersB:timeline.pid")}</span>
                      P12657
                    </div>
                  )}
                  {event?.eventType == 9 && (
                    <div
                      className="mt-1"
                      style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                    >
                      <span className="customer-fs-fw"> {t("customersB:timeline.pid")}</span>
                      P12657
                    </div>
                  )}
                </div>

                {event?.eventType == 0 && (
                  <>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2 mt-2"
                    >
                      {t("customersB:timeline.duration")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        {`${event?.duration}`}
                      </span>
                    </div>{" "}
                  </>
                )}
                {event?.eventType == 1 && (
                  <>
                    <span style={{ fontSize: "12px" }}>
                      {t("customersB:timeline.valuation")} {event?.amount}
                    </span>
                    <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div>
                  </>
                )}
                {event?.eventType == 2 && (
                  <>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2 mt-2"
                    >
                      {t("customersB:timeline.duration")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        {`${event?.duration}`}
                      </span>
                    </div>{" "}
                  </>
                )}
                {event?.eventType == 3 && (
                  <>
                    <span style={{ fontSize: "12px" }}>
                      {t("customersB:timeline.installments", { count: event?.numOfInstallments })}
                    </span>
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div> */}
                  </>
                )}
                {event?.eventType == 4 && (
                  <>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div> */}
                  </>
                )}
                {event?.eventType == 5 && (
                  <>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2 mt-2"
                    >
                      {t("customersB:timeline.duration")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        {`${event?.duration}`}
                      </span>
                    </div>{" "}
                  </>
                )}
                {event?.eventType == 6 && (
                  <>
                    <h4 style={{ fontSize: "12px" }}>
                      <span
                        style={{ fontSize: "14px", fontWeight: "bold" }}
                        className="pe-2"
                      >
                        {t("customersB:timeline.via")}
                      </span>{" "}
                      {event?.propertyName}
                    </h4>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {` ${event?.content}`}
                    </div> */}
                  </>
                )}
                {event?.eventType == 7 && (
                  <>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div> */}
                  </>
                )}
                {event?.eventType == 8 && (
                  <>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div> */}
                  </>
                )}
                {event?.eventType == 9 && (
                  <>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div> */}
                  </>
                )}
                {event?.eventType == 10 && (
                  <>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div> */}
                  </>
                )}
                {event?.eventType == 11 && (
                  <>
                    <h4 style={{ fontSize: "12px" }}>
                      <span
                        style={{ fontSize: "14px", fontWeight: "bold" }}
                        className="pe-2"
                      >
                        {t("customersB:timeline.dueDate")}
                      </span>{" "}
                      {event?.oldValue}
                    </h4>
                    <h4 style={{ fontSize: "12px" }}>
                      <span
                        style={{ fontSize: "14px", fontWeight: "bold" }}
                        className="pe-2"
                      >
                        {t("customersB:timeline.requestedDueDate")}
                      </span>{" "}
                      {event?.newValue}
                    </h4>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div> */}
                  </>
                )}
                {event?.eventType == 12 && (
                  <>
                    <h4 style={{ fontSize: "12px" }}>
                      <span
                        style={{ fontSize: "14px", fontWeight: "bold" }}
                        className="pe-2"
                      >
                        {t("customersB:timeline.currentFeeCharges")}
                      </span>{" "}
                      {event?.oldValue}
                    </h4>
                    <h4 style={{ fontSize: "12px" }}>
                      <span
                        style={{ fontSize: "14px", fontWeight: "bold" }}
                        className="pe-2"
                      >
                        {t("customersB:timeline.requestedFeeCharges")}
                      </span>{" "}
                      {event?.newValue}
                    </h4>
                    <div
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                      className="pe-2"
                    >
                      {t("customersB:timeline.amount")}{" "}
                      <span
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "400" }}
                      >
                        SAR {event?.amount}
                      </span>
                    </div>{" "}
                    {/* <div className="mt-2" style={{ fontSize: "12px" }}>
                      {`${event?.content}`}
                    </div> */}
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

export default LoanTimeline;
