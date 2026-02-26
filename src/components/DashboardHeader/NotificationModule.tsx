import { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { Images } from "../Config/Images";
import {
  getAllNotifications,
  getAllNotificationsCount,
  notificationApproveReject,
  updateNotification,
  detailDataCustomer,
  detailDataCustomerDisbursement,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import TableView from "../TableView/TableView";
import { Account_Documents_List_Header } from "../Config/TableHeaders";

const Notifications = () => {
  const [notificationsDialog, setNotificationsDialog] = useState(false);
  const [notificationsDataIndividual, setNotificationsDataIndividual] =
    useState<any>();
  const [notificationsData, setNotificationsData] = useState<any>();
  const [notificationsCustomerData, setNotificationsCustomerData] =
    useState<any>();
  const [notificationsDisburseData, setNotificationsDisburseData] =
    useState<any>();
  const [notificationsCapsuleCheck, setNotificationsCapsuleCheck] =
    useState<any>("All");
  const [notificationsCount, setNotificationsCount] = useState<any>();
  const [loading, setLoader] = useState(false);
  const [show, setShow] = useState(false);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [balloonMessage, setBalloonMessage] = useState("");
  const [isBalloonVisible, setIsBalloonVisible] = useState(true);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const prevCount = useRef(0);

  const getAllInfoNotification = async (id: any) => {
    setLoader(true);
    try {
      const res = await getAllNotifications(id);
      if (res) {
        const value = res?.data.data;
        setNotificationsData(value);
        const latestUnreadMessage = value
          ?.filter((notif: any) => notif.notificationStatus === 1)
          ?.sort(
            (a: any, b: any) =>
              new Date(b.created).getTime() - new Date(a.created).getTime()
          )[0];
        if (latestUnreadMessage) {
          setBalloonMessage(latestUnreadMessage.title);
        }
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoader(false);
    }
  };

  const notificationStatusApproveReject = async (url: any, status: any) => {
    setLoader(true);
    try {
      const res = await notificationApproveReject(url, status, {});
      if (res?.data.notificationMessage == "Operation successful.") {
        toast.success(res.data.notificationMessage);
        setShow(false);
      } else if (res?.data?.errors) {
        toast.error(res?.data?.errors[0]);
      }
    } catch (error: any) {
      console.error("Error occurred:", error);
    } finally {
      setLoader(false);
    }
  };

  const changeNotificationStatus = async (id: any) => {
    const body = {
      notificationId: id,
      status: 0,
    };
    try {
      const res = await updateNotification(body);
      setSkelitonLoading(true);
      if (res) {
        setSkelitonLoading(false);
        getAllInfoNotification("3fa85f64-5717-4562-b3fc-2c963f66afa6");
        getNotificationCount();
      }
    } catch (error: any) {
      console.error("Error changing notification status:", error);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const customerData = async (id: any) => {
    setSkelitonLoading(true);
    try {
      const res = await detailDataCustomer(id);

      // await new Promise((resolve) => setTimeout(resolve, 2000));
      // setSkelitonLoading(false);
      if (res) {
        setSkelitonLoading(false);
        setNotificationsCustomerData(res?.data?.data);
      }
    } catch (error: any) {
    } finally {
      setLoader(false);
    }
  };

  const DisburseDetail = async (id: any) => {
    try {
      const res = await detailDataCustomerDisbursement(id);
      if (res) {
        setNotificationsDisburseData(res?.data?.data);
      }
    } catch (error: any) {
      console.error("Error fetching disburse detail:", error);
    }
  };

  const getNotificationCount = async () => {
    try {
      const res = await getAllNotificationsCount(
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      );
      if (res) {
        const newCount = res?.data.data.totalCount || 0;
        setNotificationsCount(newCount);
        if (newCount > prevCount.current) {
          getAllInfoNotification("3fa85f64-5717-4562-b3fc-2c963f66afa6");
          setIsMessageVisible(true);
          setIsBalloonVisible(true);
        }
        prevCount.current = newCount;
      }
    } catch (error: any) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    getAllInfoNotification("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    getNotificationCount();
    const interval = setInterval(() => {
      getNotificationCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [notificationsCount]); // Added notificationsCount to the dependency array

  const handleBalloonClick = () => {
    setIsMessageVisible(true);
  };

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} - ${hours}:${minutes} ${ampm}`;
  }

  const parseMessage = (message: string) => {
    const lines = message?.trim().split("\n");

    return lines?.map((line, index) => ({
      id: index,
      content: line?.trim(),
    }));
  };

  const parseMessageToRows = (message) => {
    if (!message || typeof message !== "string") return []; // Ensure message is a string

    const rows = [];
    const lines = message.trim().split("\n");

    lines.forEach((line) => {
      const match = line.match(
        /Property:\s*([^,]+),\s*Old Value:\s*([^,]+),\s*New Value:\s*(.+)/
      );

      if (match) {
        rows.push({
          field: match[1],
          oldValue: match[2],
          newValue: match[3],
        });
      }
    });

    return rows;
  };

  const renderSingleTable = (rows) => {
    const rowsArray = Array.isArray(rows) ? rows : [rows];

    if (!Array.isArray(rowsArray)) {
      console.error("Rows is not an array:", rows);
      return <div>Error: Rows is not an array.</div>;
    }
    return (
      <>
        <table style={{ width: "100%" }}>
          {skelitonLoading ? (
            <TableView
              isLoading={skelitonLoading}
              setPage={1}
              setPageSize={10}
              totalRows={5}
              header={Account_Documents_List_Header}
              data={""}
              skelitonLength={3}
            />
          ) : (
            <thead
              style={{
                background: "#EB0D0D",
                color: "#FFFFFF",
              }}
            >
              <tr>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    borderTopLeftRadius: "8px",
                  }}
                >
                  Field
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  Old Value
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  New Value
                </th>
              </tr>
            </thead>
          )}
          {skelitonLoading ? (
            <Skeleton
            // skelitonLoading={skelitonLoading}
            // setPage={setPage}
            // setPageSize={setPageSize}
            />
          ) : (
            <tbody>
              <>
                {notificationsCustomerData?.businessChanges?.length > 0 && (
                  <div
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "700",
                      // background: "#0070C0",
                      color: "#000000",
                    }}
                  >
                    Business Detail:
                  </div>
                )}
                {notificationsCustomerData?.businessChanges?.map(
                  (detail, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.propertyName}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.oldValue || "N/A"}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.newValue || "N/A"}
                      </td>
                    </tr>
                  )
                )}
                {notificationsCustomerData?.employementChanges?.length > 0 && (
                  <div
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "700",
                      // background: "#0070C0",
                      color: "#000000",
                    }}
                  >
                    Employement Changes Detail:
                  </div>
                )}
                {notificationsCustomerData?.employementChanges?.map(
                  (detail, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.propertyName}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.oldValue || "N/A"}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.newValue || "N/A"}
                      </td>
                    </tr>
                  )
                )}
                {notificationsCustomerData?.individualChanges?.length > 0 && (
                  <div
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "700",
                      // background: "#0070C0",
                      color: "#000000",
                    }}
                  >
                    Individual Changes Detail:
                  </div>
                )}
                {notificationsCustomerData?.individualChanges?.map(
                  (detail, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.propertyName}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.oldValue || "N/A"}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.newValue || "N/A"}
                      </td>
                    </tr>
                  )
                )}
                {notificationsCustomerData?.addressChanges?.length > 0 && (
                  <div
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "700",
                      // background: "#0070C0",
                      color: "#000000",
                    }}
                  >
                    Address Changes Detail:
                  </div>
                )}
                {notificationsCustomerData?.addressChanges?.map(
                  (detail, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.propertyName}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.oldValue || "N/A"}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.newValue || "N/A"}
                      </td>
                    </tr>
                  )
                )}

                {notificationsCustomerData?.partnerChanges?.length > 0 && (
                  <div
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "700",
                      // background: "#0070C0",
                      color: "#000000",
                    }}
                  >
                    Partner Detail:
                  </div>
                )}

                {notificationsCustomerData?.partnerChanges?.map(
                  (detail, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.propertyName}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.oldValue || "N/A"}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {detail?.newValue || "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </>
            </tbody>
          )}
        </table>
        <div>
          {skelitonLoading ? (
            <Skeleton />
          ) : (
            <div
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                display: "flex",
              }}
            >
              Message:{" "}
              <div
                dangerouslySetInnerHTML={{
                  __html: notificationsDataIndividual?.workflowStatus,
                }}
              ></div>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderCombinedTable = (sections) => {
    const allRows = Object.keys(sections || {}).reduce((acc, key) => {
      const sectionRows = Array.isArray(sections[key])
        ? sections[key]
        : [sections[key]];
      return acc.concat(sectionRows);
    }, []);
    return renderSingleTable(allRows);
  };

  const renderMessage = (message: string) => {
    if (!message) {
      return <p>No data available</p>;
    }
    const sections = parseMessageToRows(message);
    return <div>{renderCombinedTable(sections)}</div>;
  };

  const trimUrl = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    const idParam = urlParams.get("Id");
    return idParam ? idParam.toString() : "";
  };

  return (
    <>
      <div
        style={{ position: "relative" }}
        className="cursor-pointer"
        onClick={() => setNotificationsDialog(true)}
      >
        {notificationsCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              right: "-11px",
              top: "-5px",
              fontSize: "11px",
              background: "red",
              height: "15px",
              width: "20px",
              color: "white",
              fontWeight: "700",
              borderRadius: "50px",
            }}
          >
            {`${notificationsCount <= 9 ? notificationsCount : "9+"}`}
          </div>
        )}
        <img
          src={Images.ringNotificationRight || "/placeholder.svg"}
          alt="Notifications"
        />
      </div>

      {notificationsDialog && (
        <>
          <div
            className="notification-overlay"
            onClick={() => setNotificationsDialog(false)}
          ></div>
          <div
            className={`container notification ${
              notificationsDialog ? "active" : ""
            }`}
          >
            <div
              className="card"
              style={{
                background: "#FFFFFF",
                border: "1px solid transparent",
                position: "relative",
                zIndex: 10,
                padding: "0px",
              }}
            >
              <div className="d-flex justify-content-between mt-2 px-2 align-items-center">
                <h5
                  style={{
                    color: "#000000",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                  className="mt-2"
                >
                  Notifications
                </h5>
                <img
                  onClick={() => setNotificationsDialog(false)}
                  style={{ cursor: "pointer" }}
                  src={Images.closeBtn}
                  alt="Close"
                />
              </div>

              <div
                className="mt-2"
                style={{ borderBottom: "2px solid #D1D1D1" }}
              ></div>
              <div className="mt-3 mb-2 d-flex gap-3 justify-content-start">
                <button
                  className="px-4 pb-2 pt-2 cursor-pointer"
                  style={{
                    border: "1px solid transparent",
                    borderRadius: "20px",
                    fontSize: "16px",
                    fontWeight: "400",
                    backgroundColor:
                      notificationsCapsuleCheck == "All"
                        ? "#EB0D0D"
                        : "#D7D7D7",
                    color:
                      notificationsCapsuleCheck == "All"
                        ? "#FCFCFC"
                        : "#000000",
                  }}
                  onClick={() => {
                    setNotificationsCapsuleCheck("All");
                  }}
                >
                  All
                </button>
                <div
                  className="px-4 pb-2 pt-2 cursor-pointer"
                  style={{
                    borderRadius: "20px",
                    fontSize: "16px",
                    fontWeight: "400",
                    backgroundColor:
                      notificationsCapsuleCheck == "Unread"
                        ? "#EB0D0D"
                        : "#D7D7D7",
                    color:
                      notificationsCapsuleCheck == "Unread"
                        ? "#FCFCFC"
                        : "#000000",
                  }}
                  onClick={() => {
                    setNotificationsCapsuleCheck("Unread");
                  }}
                >
                  Unread
                </div>
              </div>
              <div
                className="card-body pt-2"
                style={{
                  minHeight: "600px",
                  overflowY: "auto",
                  padding: "0px",
                }}
              >
                {loading && notificationsCapsuleCheck == "All"
                  ? // Skeleton Loading

                    Array(9)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="alert d-flex justify-content-between align-items-start skeleton-loader"
                          style={{
                            padding: "10px",
                            borderRadius: "5px",
                            marginBottom: "10px",
                            background: "#f0f0f0",
                            animation: "pulse 1.5s infinite ease-in-out",
                          }}
                        >
                          <div className="d-flex align-items-start">
                            <div
                              style={{
                                width: "30px",
                                height: "30px",
                                background: "#e0e0e0",
                                borderRadius: "50%",
                                marginRight: "10px",
                              }}
                            ></div>
                            <div>
                              <div
                                style={{
                                  width: "150px",
                                  height: "10px",
                                  background: "#e0e0e0",
                                  marginBottom: "5px",
                                }}
                              ></div>
                              <div
                                style={{
                                  width: "200px",
                                  height: "10px",
                                  background: "#e0e0e0",
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                  : notificationsData?.map((notification) => (
                      <>
                        {notificationsCapsuleCheck == "All" && (
                          <div
                            key={notification.id}
                            className={`alert alert-${
                              notification.notificationStatus === 1
                                ? "primary"
                                : "secondary"
                            } d-flex w-100 cursor-pointer align-items-start`}
                          >
                            <div
                              onClick={() => {
                                setShow(true);
                                setNotificationsDataIndividual(notification);
                                changeNotificationStatus(notification.id);
                                customerData(trimUrl(notification?.url));
                                DisburseDetail(trimUrl(notification?.url));
                              }}
                              className="d-flex align-items-start justify-content-center"
                            >
                              <div
                                className="col-1 d-flex  align-items-center justify-content-center"
                                style={{
                                  background: "#A7DFFF",
                                  padding: "5px",
                                  borderRadius: "50px",
                                  color: "#000000",
                                  fontWeight: "600",
                                  height: "30px",
                                  width: "30px",
                                  fontSize: "10px",
                                }}
                              >
                                CS
                              </div>
                              <div className="ps-2">
                                <div className="d-flex ">
                                  <h6 className="mb-1 col-10">
                                    {notification.title
                                      ? notification.title
                                      : "......"}
                                  </h6>
                                  <span
                                    className="col-2"
                                    style={
                                      notification.notificationStatus == 1
                                        ? {
                                            fontSize: "10px",
                                            fontWeight: "600",
                                            color: "#EB0D0D",
                                            paddingTop: "2px",
                                          }
                                        : {
                                            fontSize: "10px",
                                            fontWeight: "600",
                                            color: "#A0A0A0",
                                            paddingTop: "2px",
                                          }
                                    }
                                  >
                                    {notification.notificationStatus == 1
                                      ? "New"
                                      : ""}
                                  </span>
                                  <img
                                    src={Images.closeBtn}
                                    alt=""
                                    height={15}
                                  />
                                </div>

                                <p
                                  className="mb-1"
                                  style={{
                                    minWidth: "280px",
                                    width: "280px",
                                    display: "inline-block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {notification.workflowStatus
                                    ? notification.workflowStatus
                                    : "......"}
                                </p>
                                <small className="d-block">{`${formatTimestamp(
                                  notification.created
                                )}`}</small>
                              </div>
                            </div>
                          </div>
                        )}
                        {notificationsCapsuleCheck == "Unread" &&
                          notification.notificationStatus == 1 && (
                            <div
                              key={notification.id}
                              className={`alert alert-${
                                notification.notificationStatus === 1
                                  ? "primary"
                                  : "secondary"
                              } d-flex w-100 cursor-pointer align-items-start`}
                            >
                              <div
                                onClick={() => {
                                  setShow(true);
                                  setNotificationsDataIndividual(notification);
                                  changeNotificationStatus(notification.id);
                                }}
                                className="d-flex align-items-start justify-content-center"
                              >
                                <div
                                  className="col-1 d-flex  align-items-center justify-content-center"
                                  style={{
                                    background: "#A7DFFF",
                                    padding: "5px",
                                    borderRadius: "50px",
                                    color: "#000000",
                                    fontWeight: "600",
                                    height: "30px",
                                    width: "30px",
                                    fontSize: "10px",
                                  }}
                                >
                                  CS
                                </div>
                                <div className="ps-2">
                                  <div className="d-flex ">
                                    <h6 className="mb-1 col-10">
                                      {notification.title
                                        ? notification.title
                                        : "......"}
                                    </h6>
                                    <span
                                      className="col-2"
                                      style={
                                        notification.notificationStatus == 1
                                          ? {
                                              fontSize: "10px",
                                              fontWeight: "600",
                                              color: "#EB0D0D",
                                              paddingTop: "2px",
                                            }
                                          : {
                                              fontSize: "10px",
                                              fontWeight: "600",
                                              color: "#A0A0A0",
                                              paddingTop: "2px",
                                            }
                                      }
                                    >
                                      {notification.notificationStatus == 1
                                        ? "New"
                                        : "Old"}
                                    </span>
                                    <img
                                      src={Images.closeBtn}
                                      alt=""
                                      height={15}
                                    />
                                  </div>

                                  <p
                                    className="mb-1"
                                    style={{
                                      minWidth: "280px",
                                      width: "280px",
                                      display: "inline-block",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {notification.workflowStatus
                                      ? notification.workflowStatus
                                      : "......"}
                                  </p>
                                  <small className="d-block">{`${formatTimestamp(
                                    notification.created
                                  )}`}</small>
                                </div>
                              </div>
                            </div>
                          )}
                      </>
                    ))}
              </div>
            </div>
          </div>
        </>
      )}

      <Modal
        show={show}
        size="xl"
        centered
        onHide={() => {
          setShow(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">Notifications</Modal.Title>
        </Modal.Header>

        <Modal.Body className="">
          <div className="d-flex">
            <div className="col-12">
              <div className="d-flex align-items-center">
                <span
                  className="col-1 d-flex align-items-center justify-content-center"
                  style={{
                    background: "#A7DFFF",
                    padding: "12px",
                    borderRadius: "50px",
                    color: "#000000",
                    fontWeight: "800",
                    height: "50px",
                    width: "50px",
                  }}
                >
                  CS
                </span>
                <span className="col-11 ps-3">
                  <div className="d-flex">
                    <span
                      style={{
                        color: "#000000",
                        fontWeight: "600",
                      }}
                    >
                      {notificationsDataIndividual?.transactionCategory == 1
                        ? "Monetary Transaction"
                        : "Non-Monetary Transaction"}
                      : {notificationsDataIndividual?.title}
                    </span>
                  </div>
                  <div className="pt-2">
                    {formatTimestamp(notificationsDataIndividual?.created)}
                  </div>
                </span>
              </div>
            </div>
          </div>
          <div
            className="mt-3"
            style={{ borderBottom: "2px solid #D1D1D1" }}
          ></div>
          <div className="mt-3">
            <div>Message</div>
            <div
              style={{
                border: "1px solid #D1D1D1",
                background: "#F0F0F0",
                borderRadius: "8px",
                minHeight: "150px",
              }}
              className="mt-1 "
            >
              {/* <span
                              className=""
                              style={{
                                color: "#081228",
                                fontSize: "12px",
                                fontWeight: "400",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: notificationsDataIndividual?.message,
                              }}
                            >
                          
                            </span> */}
              {notificationsDataIndividual?.transactionCategory == 1 ? (
                <>
                  <div
                  // style={{
                  //   border: "1px solid #D1D1D1",
                  //   background: "#F0F0F0",
                  //   borderRadius: "8px",
                  //   minHeight: "150px",
                  // }}
                  >
                    {/* <span
                              className=""
                              style={{
                                color: "#081228",
                                fontSize: "12px",
                                fontWeight: "400",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: notificationsDataIndividual?.message,
                              }}
                            >
                          
                            </span> */}

                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        margin: "20px 0",
                      }}
                    >
                      <thead>
                        {notificationsDataIndividual?.title !=
                          "Disbursement Approval Request" && (
                          <tr>
                            <th
                              style={{
                                // border: "1px solid #ddd",
                                padding: "8px",
                                textAlign: "left",
                              }}
                            >
                              Notification Data
                            </th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {notificationsDataIndividual?.title ==
                          "Disbursement Approval Request" && (
                          <>
                            <div className="mt-2">
                              <div className="d-flex">
                                <span
                                  className="col-4"
                                  style={{
                                    // border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "left",
                                    fontWeight: "600",
                                  }}
                                >
                                  Application Id :{" "}
                                </span>
                                <span className="col-8 mt-1">
                                  {notificationsDisburseData?.applicationId || (
                                    <Skeleton />
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="d-flex">
                                <span
                                  className="col-4"
                                  style={{
                                    // border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "left",
                                    fontWeight: "600",
                                  }}
                                >
                                  Product Name:{" "}
                                </span>
                                <span className="col-8 mt-1">
                                  {notificationsDisburseData?.productName || (
                                    <Skeleton />
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="d-flex">
                                <span
                                  className="col-4"
                                  style={{
                                    // border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "left",
                                    fontWeight: "600",
                                  }}
                                >
                                  Requested Loan Amount :{" "}
                                </span>
                                <span className="col-8 mt-1">
                                  {notificationsDisburseData?.req_LaonAmount || (
                                    <Skeleton />
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="d-flex">
                                <span
                                  className="col-4"
                                  style={{
                                    // border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "left",
                                    fontWeight: "600",
                                  }}
                                >
                                  Disburse Loan Amount :{" "}
                                </span>
                                <span className="col-8 mt-1">
                                  {notificationsDisburseData?.disburse_Amount || (
                                    <Skeleton />
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="d-flex">
                                <span
                                  className="col-4"
                                  style={{
                                    // border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "left",
                                    fontWeight: "600",
                                  }}
                                >
                                  No Of Installment :{" "}
                                </span>
                                <span className="col-8 mt-1">
                                  {notificationsDisburseData?.noOfInstallment || (
                                    <Skeleton />
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="d-flex">
                                <span
                                  className="col-4"
                                  style={{
                                    // border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "left",
                                    fontWeight: "600",
                                  }}
                                >
                                  Loan Duration :{" "}
                                </span>
                                <span className="col-8 mt-1">
                                  {notificationsDisburseData?.laonDuration || (
                                    <Skeleton />
                                  )}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                        {notificationsDataIndividual?.title !=
                          "Disbursement Approval Request" && (
                          <>
                            {parseMessage(
                              notificationsDataIndividual?.message
                            )?.map((item) => (
                              <tr key={item.id}>
                                <td
                                  style={{
                                    border: "1px solid #ddd",
                                    padding: "4px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span
                                      style={{
                                        flex: "1",
                                        textAlign: "start",
                                      }}
                                    >
                                      {item.content.split(":")[0]}:
                                    </span>
                                    <span
                                      style={{
                                        flex: "1",
                                        textAlign: "start",
                                      }}
                                    >
                                      {item.content.split(":")[1]}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>
                      {/* <thead>
                                <tr>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Message:
                                  </th>
                                </tr>
                              </thead> */}
                      {notificationsDataIndividual?.title ==
                      "Disbursement Approval Request" ? (
                        <tbody>
                          <tr>
                            <td
                              style={{
                                // border: "1px solid #ddd",
                                padding: "8px",
                                display: "flex",
                              }}
                            >
                              <span
                                className="mt-1"
                                style={{ fontWeight: "700" }}
                              >
                                Message:{" "}
                              </span>
                              <div
                                className="ps-2 "
                                style={{ lineHeight: "24px" }}
                              >
                                {notificationsDisburseData ? (
                                  `A request for loan disbursement has been raised against Application ID:${notificationsDisburseData.applicationId} on Mon Jan 01 0001 00:00:00 GMTZ. Product:${notificationsDisburseData.productName}, Loan Tenure :${notificationsDisburseData.laonDuration}. Requested Loan Amount :${notificationsDisburseData.req_LaonAmount} Disbursement Amount :${notificationsDisburseData.disburse_Amount}. Please review and approve or reject the request`
                                ) : (
                                  <Skeleton />
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <div>
                          <div
                            style={{
                              border: "1px solid #ddd",
                              padding: "8px",
                              display: "flex",
                            }}
                          >
                            Message:{" "}
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  notificationsDataIndividual?.workflowStatus,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </table>
                  </div>
                </>
              ) : (
                <>
                  {notificationsDataIndividual?.message ? (
                    renderMessage(notificationsDataIndividual?.message)
                  ) : (
                    <p>No message available</p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="mt-3 d-flex justify-content-center">
            <div className="mt-1 p-3">
              <span
                className=""
                style={{
                  color: "#000000",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Are You sure you want to perform this action. This action can't
                be undone.
              </span>
            </div>
          </div>
          <div className="mt-3 d-flex gap-3 justify-content-center">
            <button
              className="application-btn cursor-pointer"
              style={{ border: "1px solid transparent", borderRadius: "5px" }}
              onClick={() => {
                notificationStatusApproveReject(
                  notificationsDataIndividual?.url,
                  true
                );
              }}
            >
              Approve
            </button>
            <div
              className="invoice-btn cursor-pointer"
              style={{ borderRadius: "5px" }}
              onClick={() => {
                notificationStatusApproveReject(
                  notificationsDataIndividual?.url,
                  false
                );
              }}
            >
              Reject
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {notificationsCount > 0 && isBalloonVisible && (
        <div className="notification-balloon" onClick={handleBalloonClick}>
          <span className="notification-badge">{`${
            notificationsCount <= 9 ? notificationsCount : "9+"
          }`}</span>
          {balloonMessage}
        </div>
      )}
    </>
  );
};

export default Notifications;
