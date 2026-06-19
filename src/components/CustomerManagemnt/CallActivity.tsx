import TableView from "../../components/TableView/TableView";
import { Button, Dropdown, Input, Menu } from "antd";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  addCallActivity,
  deleteCallActivityById,
  getCallAction,
  getAllReasons,
  getAllResult,
  getCallActivity,
  getCallActivityById,
  updateCallActivityById,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import {
  DeleteFilled,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { color } from "echarts";
import { themeStyle } from "../Config/Theme";
import { Images } from "../Config/Images";

const CallActivity = () => {
  const [editRowId, setEditRowId] = useState(null);
  const [callAction, setCallAction] = useState<any>();
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [modal, setModal] = useState(false);
  const [formModal, setFormModal] = useState<any>(false);
  const [allReason, setAllReason] = useState<any>([]);
  const [allResult, setAllResult] = useState<any>([]);
  const [editForm, setEditForm] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const id = useParams();

  const handleEditClick = (row: any) => {
    setEditRowId(row.id);
    // navigate(`${row.id}`);
    setModal(true);
    acitivityCallId(row.id);
  };
  const handleDelete = async (row: any) => {
    try {
      const res = await deleteCallActivityById(row.id);
      if (res) {
        toast.success(res.data.notificationMessage);
        handleSubmit(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleSubmit = async () => {
    try {
      const res = await getCallActivity(page, pageSize);
      if (res) {
        const data = res.data.data;
        setAllCallActivity(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const acitivityCallId = async (id: any) => {
    try {
      const res = await getCallActivityById(id);
      if (res) {
        const value = res.data.data;
        setEditForm(value || []);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCallAction = async () => {
    try {
      const res = await getCallAction(page, pageSize);
      if (res) {
        const data = res.data.data;
        setCallAction(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleAllReason = async () => {
    try {
      const res = await getAllReasons(1, 1000);
      if (res) {
        const data = res.data.data;
        setAllReason(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleAllResult = async () => {
    try {
      const res = await getAllResult(1, 1000);
      if (res) {
        const data = res.data.data;
        setAllResult(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "view") {
      handleDelete(row);
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="view" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  const enums = {
    Condition: [
      { value: 1, label: "ApplicationReceived" },
      { value: 2, label: "ApplicationUnderReview" },
      { value: 3, label: "Approved" },
      { value: 4, label: "Funded" },
      { value: 5, label: "Active" },
      { value: 6, label: "Delinquent" },
      { value: 7, label: "InCollections" },
      { value: 8, label: "ChargeOff" },
      { value: 9, label: "Bankruptcy" },
      { value: 10, label: "Repossession" },
      { value: 11, label: "Foreclosure" },
      { value: 12, label: "Closed" },
      { value: 13, label: "PaidOff" },
      { value: 14, label: "Refinanced" },
    ],
    TimeZone: [
      { value: "UTC", label: "UTC" },
      { value: "UTC-12:00", label: "UTC-12:00" },
      { value: "UTC-11:00", label: "UTC-11:00" },
      { value: "UTC-10:00", label: "UTC-10:00" },
      { value: "UTC-09:00", label: "UTC-09:00" },
      { value: "UTC-08:00", label: "UTC-08:00" },
      { value: "UTC-07:00", label: "UTC-07:00" },
      { value: "UTC-06:00", label: "UTC-06:00" },
      { value: "UTC-05:00", label: "UTC-05:00" },
      { value: "UTC-04:00", label: "UTC-04:00" },
      { value: "UTC-03:00", label: "UTC-03:00" },
      { value: "UTC-02:00", label: "UTC-02:00" },
      { value: "UTC-01:00", label: "UTC-01:00" },
      { value: "UTC+00:00", label: "UTC+00:00" },
      { value: "UTC+01:00", label: "UTC+01:00" },
      { value: "UTC+02:00", label: "UTC+02:00" },
      { value: "UTC+03:00", label: "UTC+03:00" },
      { value: "UTC+04:00", label: "UTC+04:00" },
      { value: "UTC+05:00", label: "UTC+05:00" },
      { value: "UTC+06:00", label: "UTC+06:00" },
      { value: "UTC+07:00", label: "UTC+07:00" },
      { value: "UTC+08:00", label: "UTC+08:00" },
      { value: "UTC+09:00", label: "UTC+09:00" },
      { value: "UTC+10:00", label: "UTC+10:00" },
      { value: "UTC+11:00", label: "UTC+11:00" },
      { value: "UTC+12:00", label: "UTC+12:00" },
    ],
  };
  const getCallActivityName = (id: any) => {
    if (!callAction || callAction.length === 0) return "";
    const action = callAction.find((g: any) => g.id === id);
    return action ? action.description : "";
  };
  const getReasonName = (id: any) => {
    if (!allReason || allReason.length === 0) return "";
    const action = allReason.find((g: any) => g.id === id);
    return action ? action.description : "";
  };
  const getResultName = (id: any) => {
    if (!allResult || allResult.length === 0) return "";
    const action = allResult.find((g: any) => g.id === id);
    return action ? action.description : "";
  };
  const getCondition = (value: any) => {
    const condition = enums.Condition.find((g) => g.value === value);
    return condition ? condition.label : "";
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const mappedData =
    allCallActivity &&
    allCallActivity.map((item: any) => {
      return {
        id: item.id,
        contact: item.contact,
        promiseDate: formatDate(item.promiseDate),
        promiseAmount: item.promiseAmount,
        currentAmountDue: item.currentAmountDue,
        appointment: item.appointment,
        followUpDate: formatDate(item.followUpDate),
        timeZone: item.timeZone,
        date: formatDate(item.timeStamp),
        groupFollowUpDate: formatDate(item.groupFollowUpDate),
        comments: item.comments,
        condition: getCondition(item.condition),
        action: getCallActivityName(item.outboundCallActionId),
        reason: getReasonName(item.outboundCallReasonId),
        result: getResultName(item.outboundCallResultId),
      };
    });

  useEffect(() => {
    handleSubmit();
    handleCallAction();
    handleAllReason();
    handleAllResult();
    return () => {};
  }, [id, page, pageSize]);

  const Call_Activity_Header = [
    {
      name: "Date",
      selector: "Date",
      cell: (row: any) => row.date,
    },
    {
      name: "Action",
      selector: (row: { action: any }) => row.action,
      cell: (row: any) => row.action,
    },
    {
      name: "Result",
      selector: (row: { result: any }) => row.result,
      cell: (row: any) => row.result,
    },
    {
      name: "Contact",
      selector: (row: { contact: any }) => row.contact,
      cell: (row: any) => row.contact,
    },
    {
      name: "Reason",
      selector: (row: { reason: any }) => row.reason,
      cell: (row: any) => row.reason,
    },
    {
      name: "Promise Date",
      selector: (row: { promiseDate: any }) => row.promiseDate,
    },
    {
      name: "Promise Amt",
      selector: (row: { promiseAmount: any }) => row.promiseAmount,
    },
    {
      name: "Current Amount Due",
      selector: (row: { currentAmountDue: any }) => row.currentAmountDue,
    },
    {
      name: "Condition",
      selector: (row: { condition: any }) => row.condition,
    },
    {
      name: "Appointment",
      selector: (row: { appointment: any }) => row.appointment,
    },
    {
      name: "Flow-Up Date",
      selector: (row: { followUpDate: any }) => row.followUpDate,
    },
    {
      name: "Time Zone",
      selector: (row: { timeZone: any }) => row.timeZone,
    },
    {
      name: "Group Follow-Up",
      selector: (row: { groupFollowUpDate: any }) => row.groupFollowUpDate,
    },
    {
      name: "Comments",
      selector: (row: { comments: any }) => row.comments,
    },
    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            style={{
              background: "linear-gradient(100deg, #DEF5FF, #90CAFF)",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const handleClick = () => {
    setFormModal(true);
  };
  const formatDatePayload = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  };
  const button = [{ title: "Add", onClick: handleClick }];
  const addAccountDetail = async (formFields: any) => {
    try {
      const body = {
        accountId: formFields.accountId,
        contact: formFields.contact,
        outboundCallActionId: formFields.outboundCallActionId,
        outboundCallResultId: formFields.outboundCallResultId,
        outboundCallReasonId: formFields.outboundCallReasonId,
        promiseDate: formatDatePayload(formFields.promiseDate),
        promiseAmount: formFields.promiseAmount,
        currentAmountDue: formFields.currentAmountDue,
        condition: formFields.condition,
        appointment: formFields.appointment,
        followUpDate: formatDatePayload(formFields.followUpDate),
        timeZone: formFields.timeZone,
        timeStamp: formatDatePayload(formFields.timeStamp),
        groupFollowUpDate: formatDatePayload(formFields.groupFollowUpDate),
        comments: formFields.comments,
      };
      const response = await addCallActivity(body);
      if (response) {
        toast.success(response?.data.notificationMessage);
        setFormModal(false);
        handleSubmit();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const updateAccountDetail = async (formFields: any) => {
    try {
      const body = {
        id: editRowId,
        accountId: formFields.accountId,
        contact: formFields.contact,
        outboundCallActionId: formFields.outboundCallActionId,
        outboundCallResultId: formFields.outboundCallResultId,
        outboundCallReasonId: formFields.outboundCallReasonId,
        promiseDate: formFields.promiseDate,
        promiseAmount: formFields.promiseAmount,
        currentAmountDue: formFields.currentAmountDue,
        condition: formFields.condition,
        appointment: formFields.appointment,
        followUpDate: formFields.followUpDate,
        timeZone: formFields.timeZone,
        timeStamp: formFields.timeStamp,
        groupFollowUpDate: formFields.groupFollowUpDate,
        comments: formFields.comments,
      };
      const response = await updateCallActivityById(editRowId, body);
      if (response) {
        toast.success(response?.data.notificationMessage);
        setModal(false);
        handleSubmit(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  return (
    <>
      <div className="cs-table p-2">
        {/* <DynamicHeaderStructure
          className="mt-2"
          title={"Call Activity"}
          button={button}
        /> */}
        <div className="d-flex justify-content-end">
          <div
            className="gradient-button mt-1 mb-2 button-margin  d-flex justify-content-center"
            style={{
              backgroundColor: themeStyle?.table?.backgroundColor,
            }}
            onClick={() => {
              setFormModal(true);
            }}
          >
            <div className="">
              <img
                src={Images.customerManagement}
                alt=""
                width={16}
                height={16}
              />
            </div>
            <div className="ps-1 d-flex align-items-center cursor-pointer">
              Add
            </div>
          </div>
        </div>
        {/* <TableHeaderFilter /> */}
        {/* <TableHeaderFilter /> */}
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Call_Activity_Header}
          data={mappedData}
        />
      </div>
      <Modal
        size="lg"
        show={modal}
        onHide={() => {
          setModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Update Call Activity</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            contact: editForm.contact,
            outboundCallActionId: editForm.outboundCallActionId,
            outboundCallResultId: editForm.outboundCallResultId,
            outboundCallReasonId: editForm.outboundCallReasonId,
            promiseDate: formatDate(editForm.promiseDate),
            promiseAmount: editForm.promiseAmount,
            currentAmountDue: editForm.currentAmountDue,
            condition: editForm.condition,
            appointment: editForm.appointment,
            followUpDate: formatDate(editForm.followUpDate),
            timeZone: editForm.timeZone,
            timeStamp: formatDate(editForm.timeStamp),
            groupFollowUpDate: formatDate(editForm.groupFollowUpDate),
            comments: editForm.comments,
          }}
          // validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={updateAccountDetail}
        >
          {({ handleChange }) => {
            return (
              <Form className="p-4">
                <Modal.Body>
                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallResultId"
                        className="mb-1 fs-14"
                      >
                        Date
                      </label>
                      <Field
                        type="date"
                        placeholder="action"
                        id="timeStamp"
                        name="timeStamp"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="timeStamp"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallActionId"
                        className="mb-1 fs-14"
                      >
                        Action
                      </label>
                      <Field
                        as="select"
                        placeholder="action"
                        id="outboundCallActionId"
                        name="outboundCallActionId"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {callAction &&
                          callAction.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.description}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="outboundCallActionId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallResultId"
                        className="mb-1 fs-14"
                      >
                        Reasult
                      </label>
                      <Field
                        as="select"
                        placeholder="action"
                        id="outboundCallResultId"
                        name="outboundCallResultId"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {allResult &&
                          allResult.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.description}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="outboundCallResultId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallReasonId"
                        className="mb-1 fs-14"
                      >
                        Contact
                      </label>
                      <Field
                        placeholder="contact"
                        id="contact"
                        name="contact"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="contact"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallReasonId"
                        className="mb-1 fs-14"
                      >
                        Reason
                      </label>
                      <Field
                        as="select"
                        placeholder="action"
                        id="outboundCallReasonId"
                        name="outboundCallReasonId"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {allReason &&
                          allReason.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.description}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="outboundCallReasonId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="mb-2">
                      <label htmlFor="promiseDate" className="mb-1 fs-14">
                        Promsie Date
                      </label>
                      <Field
                        placeholder="Promise Date"
                        id="promiseDate"
                        type="date"
                        name="promiseDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="promiseDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="promiseAmount" className="mb-1 fs-14">
                        Promise Amount
                      </label>
                      <Field
                        placeholder="Promise Amount"
                        id="promiseAmount"
                        type="text"
                        name="promiseAmount"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="promiseAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="currentAmountDue" className="mb-1 fs-14">
                        Current Amount Due
                      </label>
                      <Field
                        placeholder="Current Amount Due"
                        id="currentAmountDue"
                        type="text"
                        name="currentAmountDue"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="currentAmountDue"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="condition" className="mb-1 fs-14">
                        Condition
                      </label>
                      <Field
                        placeholder="Condition"
                        id="condition"
                        as="select"
                        name="condition"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: Number(e.target.value),
                            },
                          })
                        }
                      >
                        <option value="" label="Select type" />
                        {enums.Condition.map((item: any) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="condition"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="appointment" className="mb-1 fs-14">
                        Appointment
                      </label>
                      <Field
                        placeholder="Appointment"
                        id="appointment"
                        name="appointment"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="appointment"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="followUpDate" className="mb-1 fs-14">
                        Follow-Up Date
                      </label>
                      <Field
                        placeholder="Follow-Up Date"
                        id="followUpDate"
                        type="date"
                        name="followUpDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="followUpDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="timeZone" className="mb-1 fs-14">
                        Time Zone
                      </label>
                      <Field
                        as="select"
                        placeholder="action"
                        id="timeZone"
                        name="timeZone"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {enums.TimeZone.map((item: any) => (
                          <option key={item.label} value={item.label}>
                            {item.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="timeZone"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="groupFollowUpDate" className="mb-1 fs-14">
                        Group Follow-Up Date
                      </label>
                      <Field
                        placeholder="Group Follow-Up Date"
                        id="groupFollowUpDate"
                        type="date"
                        name="groupFollowUpDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="groupFollowUpDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="comments" className="mb-1 fs-14">
                        Comments
                      </label>
                      <Field
                        placeholder="Comments"
                        id="comments"
                        name="comments"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="comments"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      Update Call Activity
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      <Modal
        size="lg"
        show={formModal}
        onHide={() => {
          setFormModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Call Activity</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            outboundCallActionId: "",
            outboundCallReasonId: "",
            contact: "",
            promiseDate: "",
            promiseAmount: "",
            currentAmountDue: "",
            condition: "",
            appointment: "",
            followUpDate: "",
            timeZone: "",
            timeStamp: "",
            groupFollowUpDate: "",
            comments: "",
            outboundCallResultId: "",
          }}
          // validationSchema={validationSchema}
          onSubmit={addAccountDetail}
        >
          {({ handleChange }) => {
            return (
              <Form className="">
                <Modal.Body>
                  <Row className="">
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallResultId"
                        className="mb-1 fs-14"
                      >
                        Date
                      </label>
                      <Field
                        type="date"
                        placeholder="action"
                        id="timeStamp"
                        name="timeStamp"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="timeStamp"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallActionId"
                        className="mb-1 fs-14"
                      >
                        Action
                      </label>
                      <Field
                        as="select"
                        placeholder="action"
                        id="outboundCallActionId"
                        name="outboundCallActionId"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {callAction &&
                          callAction.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.description}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="outboundCallActionId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallResultId"
                        className="mb-1 fs-14"
                      >
                        Reasult
                      </label>
                      <Field
                        as="select"
                        placeholder="action"
                        id="outboundCallResultId"
                        name="outboundCallResultId"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {allResult &&
                          allResult.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.description}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="outboundCallResultId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallReasonId"
                        className="mb-1 fs-14"
                      >
                        Contact
                      </label>
                      <Field
                        placeholder="contact"
                        id="contact"
                        name="contact"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="contact"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="outboundCallReasonId"
                        className="mb-1 fs-14"
                      >
                        Reason
                      </label>
                      <Field
                        as="select"
                        placeholder="action"
                        id="outboundCallReasonId"
                        name="outboundCallReasonId"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {allReason &&
                          allReason.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.description}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="outboundCallReasonId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="mb-2">
                      <label htmlFor="promiseDate" className="mb-1 fs-14">
                        Promsie Date
                      </label>
                      <Field
                        placeholder="Promise Date"
                        id="promiseDate"
                        type="date"
                        name="promiseDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="promiseDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="promiseAmount" className="mb-1 fs-14">
                        Promise Amount
                      </label>
                      <Field
                        placeholder="Promise Amount"
                        id="promiseAmount"
                        type="text"
                        name="promiseAmount"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="promiseAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="currentAmountDue" className="mb-1 fs-14">
                        Current Amount Due
                      </label>
                      <Field
                        placeholder="Current Amount Due"
                        id="currentAmountDue"
                        type="text"
                        name="currentAmountDue"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="currentAmountDue"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="condition" className="mb-1 fs-14">
                        Condition
                      </label>
                      <Field
                        placeholder="Condition"
                        id="condition"
                        as="select"
                        name="condition"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: Number(e.target.value),
                            },
                          })
                        }
                      >
                        <option value="" label="Select type" />
                        {enums.Condition.map((item: any) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="condition"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="appointment" className="mb-1 fs-14">
                        Appointment
                      </label>
                      <Field
                        placeholder="Appointment"
                        id="appointment"
                        name="appointment"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="appointment"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="followUpDate" className="mb-1 fs-14">
                        Follow-Up Date
                      </label>
                      <Field
                        placeholder="Follow-Up Date"
                        id="followUpDate"
                        type="date"
                        name="followUpDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="followUpDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="timeZone" className="mb-1 fs-14">
                        Time Zone
                      </label>
                      <Field
                        as="select"
                        placeholder="action"
                        id="timeZone"
                        name="timeZone"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {enums.TimeZone.map((item: any) => (
                          <option key={item.label} value={item.label}>
                            {item.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="timeZone"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="groupFollowUpDate" className="mb-1 fs-14">
                        Group Follow-Up Date
                      </label>
                      <Field
                        placeholder="Group Follow-Up Date"
                        id="groupFollowUpDate"
                        type="date"
                        name="groupFollowUpDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="groupFollowUpDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="comments" className="mb-1 fs-14">
                        Comments
                      </label>
                      <Field
                        placeholder="Comments"
                        id="comments"
                        name="comments"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="comments"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      Add Call Activity
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </>
  );
};

export default CallActivity;
