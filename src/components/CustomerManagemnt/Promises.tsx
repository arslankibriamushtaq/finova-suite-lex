import { Customer_List_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { Button, DatePicker, Dropdown, Menu } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { Get_All_Promises_Header } from "../../components/Config/TableHeaders";
import { useState, useEffect } from "react";
import {
  addPromise,
  getAllPromises,
  getAllReasons,
  getCallActivityById,
  getPromiseById,
  getPromiseDeleteId,
  updatePromise,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import * as Yup from "yup";
import { themeStyle } from "../Config/Theme";
import { Images } from "../Config/Images";
const Promises = () => {
  const [AllPromises, setAllPromises] = useState<any>([]);
  const [modal, setModal] = useState(false);
  const [allReason, setAllReason] = useState<any>([]);
  const [editForm, setEditForm] = useState<any>([]);
  const [updateCondition, setUpdateCondition] = useState<any>(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const getAllData = async () => {
    try {
      const res = await getAllPromises(page, pageSize);
      const data = res.data.data;
      setAllPromises(data || []);
      setTotalRows(res?.data?.pageInfo?.totalItems || 0);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleAllReason = async () => {
    try {
      const res = await getAllReasons(1, 1000);
      if (res) {
        const data = res.data.data;
        setAllReason(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    getAllData();
    handleAllReason();
    return () => {};
  }, [page, pageSize]);
  const handleEditClick = (row: any) => {
    // setEditRowId(row.id);
    // navigate(`${row.id}`);
    setModal(true);
    setUpdateCondition(true);
    acitivityCallId(row.promiseId);
  };
  const acitivityCallId = async (promiseId: any) => {
    try {
      const res = await getPromiseById(promiseId);
      if (res) {
        const value = res.data.data;
        setEditForm(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    console.warn("edit data", editForm);
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const handleDelete = async (row: any) => {
    try {
      const res = await getPromiseDeleteId(row.id);
      if (res) {
        toast.success(res.data.notificationMessage);
        getAllData();
      }
    } catch (error: any) {
      toast.error(error.message);
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
  const Get_All_Promises_Header = [
    {
      name: "Promise key",
      selector: (row: { promiseKey: any }) => row.promiseKey,
    },
    {
      name: "Loan Key",
      selector: (row: { laonKey: any }) => row.laonKey,
    },
    {
      name: "Promise Amount",
      selector: (row: { promisedAmount: any }) => row.promisedAmount,
    },
    {
      name: "Promise Date",
      selector: (row: { promisedDate: any }) => row.promisedDate,
    },
    {
      name: "Taken By",
      selector: (row: { takenBy: any }) => row.takenBy,
    },
    {
      name: "Taken Date",
      selector: (row: { takenDate: any }) => row.takenDate,
    },
    {
      name: "Due on Taken Date",
      selector: (row: { dueOnTakenDate: any }) => row.dueOnTakenDate,
    },
    {
      name: "Amount Collected",
      selector: (row: { collectedAmount: any }) => row.collectedAmount,
    },
    {
      name: "Broken Ind",
      selector: (row: { isBrokenPromise: any }) => row.isBrokenPromise,
    },
    {
      name: "Cancelled",
      selector: (row: { isCancelledPromise: any }) => row.isCancelledPromise,
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

  const handleSubmit = async (values: any) => {
    const body = {
      id: acitivityCallId,
      accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      laonId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      promisedAmount: Number(values.promisedAmount),
      promisedDate: values.promisedDate,
      takenBy: values.takenBy,
      takenDate: values.takenDate,
      dueOnTakenDate: values.dueOnTakenDate,
      collectedAmount: Number(values.collectedAmount),
      isBrokenPromise:
        values.isBrokenPromise == false ? values.isBrokenPromise : true,
      isCancelledPromise:
        values.isCancelledPromise == false ? values.isCancelledPromise : true,
      contact: values.contact,
      followupDate: values.followupDate,
      comment: values.comment,
      outboundCallReasonId: values.outboundCallReasonId,
    };
    if (updateCondition) {
      body.accountId = editForm.accountId;
      body.id = editForm.id;
      try {
        const res = await updatePromise(body);
        const data = res.data.data;
        if (data) {
          setModal(false);
          toast.success(res.data.notificationMessage);
          getAllData();
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    } else {
      try {
        const res = await addPromise(body);
        const data = res.data;
        if (data) {
          setModal(false);
          toast.success(data.notificationMessage);
          getAllData();
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  };
  const handleAddPromise = async () => {
    setModal(true);
    setUpdateCondition(false);
    // try {
    //   const body = {
    //     accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //     outboundCallReasonId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //     promisedAmount: 0,
    //     promisedDate: "2024-08-06T10:33:07.552Z",
    //     takenBy: "string",
    //     takenDate: "2024-08-06T10:33:07.552Z",
    //     dueOnTakenDate: "2024-08-06T10:33:07.552Z",
    //     collectedAmount: 0,
    //     isBrokenPromise: true,
    //     isCancelledPromise: true,
    //     contact: "string",
    //     followupDate: "2024-08-06T10:33:07.552Z",
    //     comment: "string",
    //   };
    //   const res = await addPromise(body);
    //   if (res) {
    //   }
    // } catch (error: any) {
    //   toast.error(error?.message);
    // }
  };
  const button = [{ title: "Add", onClick: handleAddPromise }];
  const mappedData =
    AllPromises &&
    AllPromises.map((item: any) => {

      return {
        id: item.promiseId,
        promiseId: item.promiseId,
        laonKey: item?.laonKey || "-",
        promiseKey: item.promiseKey,
        promisedAmount: item.promisedAmount,
        promisedDate: formatDate(item.followupDate),
        takenBy: item.takenBy,
        takenDate: formatDate(item.takenDate),
        dueOnTakenDate: formatDate(item.dueOnTakenDate),
        collectedAmount: item.collectedAmount,
        isBrokenPromise: item.isBrokenPromise ? "True" : "False",
        isCancelledPromise: item.isCancelledPromise ? "True" : "False",
      };
    });
  const validationSchema = Yup.object().shape({
    promisedAmount: Yup.number()
      .required("Promised Amount is required")
      .positive("Amount must be positive")
      .integer("Amount must be an integer"),
    promisedDate: Yup.date().required("Promised Date is required").nullable(),
    takenBy: Yup.string().required("Taken By is required"),
    takenDate: Yup.date().required("Taken Date is required").nullable(),
    dueOnTakenDate: Yup.date()
      .required("Due On Taken Date is required")
      .nullable(),
    collectedAmount: Yup.number()
      .required("Collected Amount is required")
      .positive("Amount must be positive")
      .integer("Amount must be an integer"),
    isBrokenPromise: Yup.boolean().required(
      "Broken Promise status is required"
    ),
    isCancelledPromise: Yup.boolean().required(
      "Cancelled Promise status is required"
    ),
    contact: Yup.string().required("Contact is required"),
    followupDate: Yup.date().required("Follow-up Date is required").nullable(),
    comment: Yup.string().required("Comment is required"),
    outboundCallReasonId: Yup.string().required("Reason is required"),
  });
  return (
    <>
      <div className="cs-table p-2">
        {/* <DynamicHeaderStructure title={"Promises"} button={button} />
        <TableHeaderFilter /> */}
        <div className="d-flex justify-content-end">
          <div
            className="gradient-button mt-1 mb-2 button-margin  d-flex justify-content-center"
            style={{
              backgroundColor: themeStyle?.table?.backgroundColor,
            }}
            onClick={() => {
              setModal(true);
              setUpdateCondition(false);
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
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Get_All_Promises_Header}
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
          <h3>{updateCondition ? "Update" : "Add"} Promise</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            promisedAmount: updateCondition ? editForm.promisedAmount : "",
            promisedDate: updateCondition
              ? formatDate(editForm.promisedDate)
              : "",
            laonKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            takenBy: updateCondition ? editForm.takenBy : "",
            takenDate: updateCondition ? formatDate(editForm.takenDate) : "",
            dueOnTakenDate: updateCondition
              ? formatDate(editForm.dueOnTakenDate)
              : "",
            collectedAmount: updateCondition ? editForm.collectedAmount : "",
            isBrokenPromise: updateCondition ? editForm.isBrokenPromise : "",
            isCancelledPromise: updateCondition
              ? editForm.isCancelledPromise
              : "",
            contact: updateCondition ? editForm.contact : "",
            followupDate: updateCondition
              ? formatDate(editForm.followupDate)
              : "",
            comment: updateCondition ? editForm.comment : "",
            outboundCallReasonId: updateCondition
              ? editForm.outboundCallReasonId
              : "",
          }}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ handleChange, setFieldValue, values }) => {
            return (
              <Form className="">
                <Modal.Body>
                  <Row className="">
                    <Col md={6} className="mb-2">
                      <label htmlFor="promisedAmount" className="mb-1 fs-14">
                        Promised Amount
                      </label>
                      <Field
                        type="number"
                        placeholder="promisedAmount"
                        id="promisedAmount"
                        name="promisedAmount"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="promisedAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="mb-2">
                      <label htmlFor="promisedDate" className="mb-1 fs-14">
                        Promised Date
                      </label>
                      <Field
                        placeholder="Promise Date"
                        id="promisedDate"
                        type="date"
                        name="promisedDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="promisedDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="isBrokenPromise" className="mb-1 fs-14">
                        Broken Promise
                      </label>
                      <Field
                        placeholder="isBrokenPromise"
                        as="select"
                        id="isBrokenPromise"
                        name="isBrokenPromise"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: e.target.value == "true" ? true : false,
                            },
                          })
                        }
                      >
                        <option value={"true"} label="true" />
                        <option value={"false"} label="false" />
                      </Field>
                      <ErrorMessage
                        name="isBrokenPromise"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="takenBy" className="mb-1 fs-14">
                        TakenBy
                      </label>
                      <Field
                        placeholder="takenBy"
                        id="takenBy"
                        name="takenBy"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="takenBy"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="takenDate" className="mb-1 fs-14">
                        Taken Date
                      </label>
                      <Field
                        type="date"
                        placeholder="takenDate"
                        id="takenDate"
                        name="takenDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="takenDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="dueOnTakenDate" className="mb-1 fs-14">
                        Due On Taken Date
                      </label>
                      <Field
                        type="date"
                        placeholder="dueOnTakenDate"
                        id="dueOnTakenDate"
                        name="dueOnTakenDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="dueOnTakenDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="collectedAmount" className="mb-1 fs-14">
                        Collected Amount
                      </label>
                      <Field
                        placeholder="collectedAmount"
                        id="collectedAmount"
                        type="number"
                        name="collectedAmount"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="collectedAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="isCancelledPromise"
                        className="mb-1 fs-14"
                      >
                        Collected Promise
                      </label>
                      <Field
                        placeholder="isCancelledPromise"
                        id="isCancelledPromise"
                        as="select"
                        name="isCancelledPromise"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: e.target.value == "true" ? true : false,
                            },
                          })
                        }
                      >
                        <option value={"true"} label="true" />
                        <option value={"false"} label="false" />
                      </Field>
                      <ErrorMessage
                        name="condition"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="contact" className="mb-1 fs-14">
                        Contact
                      </label>
                      <Field
                        placeholder="contact"
                        id="contact"
                        type="text"
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
                        htmlFor="isCancelledPromise"
                        className="mb-1 fs-14"
                      >
                        Follow up Date
                      </label>
                      <Field
                        placeholder="followupDate"
                        id="followupDate"
                        type="date"
                        name="followupDate"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="followupDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="comment" className="mb-1 fs-14">
                        Comment
                      </label>
                      <Field
                        placeholder="comment"
                        id="comment"
                        type="text"
                        name="comment"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="comment"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-4">
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
                  </Row>
                  <Row>
                    <Col md={6} className="mb-2">
                      <label htmlFor="laonKey" className="mb-1 fs-14">
                        Loan Key
                      </label>
                      <Field
                        as="select"
                        placeholder="Select Loan ID"
                        id="laonKey"
                        name="laonKey"
                        className="form-control"
                        /* value={values.laonKey}
                      onChange={(e: any) => setFieldValue("laonKey", e.target.value)} */
                      >
                        {/* <option label="Select Loan Id" />

                        {AllPromises && AllPromises?.map((item: any) => (

                          <option key={item.laonKey} value={item.laonKey}>
                            {item?.laonKey || "-"}
                          </option>
                        ))} */}
                      </Field>
                      <ErrorMessage
                        name="laonKey"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      {updateCondition ? "Update" : "Create"}
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
export default Promises;
