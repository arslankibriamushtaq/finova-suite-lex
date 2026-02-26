import { Customer_List_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { Button, DatePicker, Input, Select, Menu, Dropdown } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { useEffect, useState } from "react";
import {
  addFieldInvestigation,
  deleteFieldInvestigationById,
  getAllResult,
  getAllVerificationAgenecy,
  getFieldId,
  getFieldInvastigation,
  updateFieldData,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { Formik, Field, ErrorMessage, Form } from "formik";
import { Col, Modal, ModalBody, ModalHeader, Row } from "react-bootstrap";
import * as Yup from "yup";
import { Images } from "../Config/Images";
const verificationTypes = [
  { value: 1, label: "Address" },
  { value: 2, label: "Employment" },
  { value: 3, label: "Asset" },
  { value: 4, label: "Credit History" },
  { value: 5, label: "Business Verification" },
  { value: 6, label: "Reference Checks" },
  { value: 7, label: "Document Verification" },
];

const customerTypes = [
  { value: 1, label: "Individual" },
  { value: 2, label: "Business" },
];

const statusOptions = [
  { value: 1, label: "Initiated" },
  { value: 2, label: "Pending" },
  { value: 3, label: "InProgress" },
  { value: 4, label: "Completed" },
  { value: 5, label: "Verified" },
  { value: 6, label: "Failed" },
  { value: 7, label: "Cancelled" },
  { value: 8, label: "OnHold" },
  { value: 9, label: "Reassigned" },
  { value: 10, label: "Escalated" },
  { value: 11, label: "AwaitingCustomerResponse" },
  { value: 12, label: "Review" },
  { value: 13, label: "Closed" },
  { value: 14, label: "DiscrepancyFound" },
  { value: 15, label: "NotApplicable" },
];

const resultOptions = [
  { value: 1, label: "Successful" },
  { value: 2, label: "Unsuccessful" },
  { value: 3, label: "Pending" },
  { value: 4, label: "Other" },
];

const buttonSub = [{ title: "Add" }];

const FieldInvestigation = () => {
  const [fieldData, setFieldData] = useState<any[]>([]);
  const [allResult, setAllResult] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editRowData, setEditRowData] = useState<any>(null);
  const [allFieldResult, setAllFieldResult] = useState<any>();
  const [updateData, setUpdateData] = useState<any>();
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const Field_List_Header = [
    {
      name: "Customer Business",
      selector: (row: { customer: any }) => row.customer,
    },
    {
      name: "Verification Type",
      selector: (row: { verificationType: any }) => row.verificationType,
    },
    {
      name: "Verification Agency",
      selector: (row: { verificationAgency: any }) => row.verificationAgency,
    },
    {
      name: "Status",
      selector: (row: { status: any }) => row.status,
    },
    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            style={{
              background: "linear-gradient(100deg, #DEF5FF, #90CAFF)",
              color: "#000000",
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    getAllField();
    getAllAgency();
    handleAllResult();
  }, [page, pageSize]);

  const handleEditClick = (row: any) => {
    setEditRowData(row.id);
    fieldInvestigationId(row.id);
    setEditMode(true);
    handleShow();
  };

  const handleDelete = async (row: any) => {
    try {
      const res = await deleteFieldInvestigationById(row.id);
      if (res) {
        toast.success(res.data.notificationMessage);
        getAllField(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getAllField = async () => {
    try {
      const res = await getFieldInvastigation(page, pageSize);
      if (res) {
        const data = res.data.data;
        setFieldData(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
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
        setAllFieldResult(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getAllAgency = async () => {
    try {
      const res = await getAllVerificationAgenecy();
      if (res) {
        const data = res.data.data;
        setAllResult(data || []);
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

  const handleSubmit = async (formField: any, { resetForm }: any) => {
    try {
      const body: any = {
        accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        verificationAgencyId: formField.verificationAgencyId,
        customerType: formField.customerType,
        verificationType: formField.verificationType,
        status: formField.status,
        spokeTo: formField.spokeTo,
        callDate: formatDatePayload(formField.callDate),
        numberOfAttempts: formField.numberOfAttempts,
        result: 0,
        verificationMatch: true,
        comment: "",
      };
      let res;
      if (editMode && editRowData) {
        // body["id"] = editRowData;
        body.id = editRowData;
        res = await updateFieldData(body);
      } else {
        res = await addFieldInvestigation(body);
      }

      if (res) {
        toast.success(res.data.notificationMessage);
        resetForm();
        setUpdateData("");
        setShow(false);
        setEditMode(false);
        getAllField();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getcustomerType = (value: any) => {
    if (!customerTypes || customerTypes.length === 0) return "";
    const action = customerTypes.find((g: any) => g.value === value);
    return action ? action.label : "";
  };

  const getVerificationType = (value: any) => {
    if (!verificationTypes || verificationTypes.length === 0) return "";
    const action = verificationTypes.find((g: any) => g.value === value);
    return action ? action.label : "";
  };

  const getverificationAgency = (id: any) => {
    if (!allResult || allResult.length === 0) return "";
    const action = allResult.find((g: any) => g.id === id);
    return action ? action.agenecyName : "";
  };

  const getStatus = (value: any) => {
    if (!statusOptions || statusOptions.length === 0) return "";
    const action = statusOptions.find((g: any) => g.value === value);
    return action ? action.label : "";
  };
  const getResult = (id: any) => {
    if (!allFieldResult || allFieldResult.length === 0) return "";
    const action = allFieldResult.find((g: any) => g.id === id);
    return action ? action.description : "";
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
  const mappedData =
    fieldData &&
    fieldData.map((item: any) => ({
      id: item.id,
      customer: getcustomerType(item.customerType),
      verificationType: getVerificationType(item.verificationType),
      verificationAgency: getverificationAgency(item.verificationAgencyId)
        ? "true"
        : "false",
      status: getStatus(item.status),
      result: getResult(item.result),
    }));

  const fieldInvestigationId = async (id: any) => {
    try {
      const res = await getFieldId(id);
      if (res) {
        const value = res.data.data;
        setUpdateData(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const button = [{ title: "Add Field", onClick: handleShow }];
  const validationSchema = Yup.object().shape({
    customerType: Yup.string().required("Customer Type is required"),
    verificationType: Yup.string().required("Verification Type is required"),
    verificationAgencyId: Yup.string().required(
      "Verification Agency is required"
    ),
    status: Yup.string().required("Status is required"),
    spokeTo: Yup.string().required("Spoke To is required"),
    callDate: Yup.date().required("Call Date is required"),
    numberOfAttempts: Yup.number()
      .required("Number of Attempts is required")
      .positive()
      .integer(),
    result: Yup.string().required("Result is required"),
  });
  return (
    <>
      <div className="cs-table p-2">
        <div className="d-flex align-items-center">
          <div className="col-6 ">
            <div
              className="d-flex align-items-center justify-content-between mt-1 mb-3"
              style={{ fontSize: "16px", fontWeight: "Bold" }}
            >
              Field Investigation
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <div
              onClick={() => {
                handleShow();
                setEditRowData("");
                setEditMode(false);
                setUpdateData("");
              }}
              className="gradient-button mt-1 button-margin d-flex justify-content-center"
            >
              <div className="">
                <img
                  src={Images.customerManagement}
                  alt=""
                  width={16}
                  height={16}
                />
              </div>
              <div className="ps-1 d-flex align-items-center"> Add</div>
            </div>
          </div>
        </div>

        <TableHeaderFilter button={button} />
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Field_List_Header}
          data={mappedData}
        />
        <Modal
          centered
          show={show}
          size="lg"
          onHide={() => {
            setShow(false);
          }}
          dialogClassName="custom-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Field Investigation</Modal.Title>
          </Modal.Header>

          <Formik
            enableReinitialize
            initialValues={{
              customerType: updateData?.customerType || "",
              verificationType: updateData?.verificationType || "",
              verificationAgencyId: updateData?.verificationAgencyId || "",
              status: updateData?.status || "",
              spokeTo: updateData?.spokeTo || "",
              callDate: formatDate(updateData?.callDate || ""),
              numberOfAttempts: updateData?.numberOfAttempts || "",
              result: updateData?.result || "",
            }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {({ handleChange, setFieldValue }) => (
              <Form className="pt-3">
                <Modal.Body>
                  <Row>
                    <Col md={6}>
                      <label className="mb-1 customer-fs-fw">
                        Customer/Business
                      </label>
                      <Field
                        as="select"
                        name="customerType"
                        className="form-control"
                        id="customerType"
                      >
                        <option value="" label="Select type" />
                        {customerTypes.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="customerType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6}>
                      <label className="mb-1 customer-fs-fw">
                        Verification Type
                      </label>
                      <Field
                        as="select"
                        name="verificationType"
                        id="verificationType"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {verificationTypes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="verificationType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <label className="mt-2 mb-1 customer-fs-fw">
                        Verification Agency
                      </label>
                      <Field
                        as="select"
                        name="verificationAgencyId"
                        className="form-control"
                        id="verificationAgencyId"
                      >
                        <option value="" label="Select type" />
                        {allResult.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.agenecyName}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="verificationAgencyId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6}>
                      <label className="mt-2 mb-1 customer-fs-fw">Status</label>
                      <Field
                        as="select"
                        name="status"
                        className="form-control"
                        id="status"
                      >
                        <option value="" label="Select type" />
                        {statusOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="status"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <label className="mt-2 mb-1 customer-fs-fw">
                        Spoke To
                      </label>
                      <Field
                        type="text"
                        name="spokeTo"
                        className="form-control"
                        id="spokeTo"
                      />
                      <ErrorMessage
                        name="spokeTo"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6}>
                      <label className="mt-2 mb-1 customer-fs-fw">
                        Call Date
                      </label>
                      <Field
                        type="date"
                        name="callDate"
                        className="form-control"
                        id="callDate"
                      />
                      <ErrorMessage
                        name="callDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <label
                        htmlFor="name"
                        className="mt-2 mb-1 customer-fs-fw"
                      >
                        No. of Attempts
                      </label>
                      <Field
                        name="numberOfAttempts"
                        className="form-control"
                        id="numberOfAttempts"
                      />
                      <ErrorMessage
                        name="numberOfAttempts"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6}>
                      <label
                        htmlFor="name"
                        className="mt-2 mb-1 customer-fs-fw"
                      >
                        Result
                      </label>
                      <Field
                        as="select"
                        name="result"
                        className="form-control"
                        id="result"
                      >
                        <option value="" label="Select result" />
                        {allFieldResult &&
                          allFieldResult.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.description}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="result"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      {editMode
                        ? "Update Field Investigation"
                        : "Add Field Investigation"}
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            )}
          </Formik>
        </Modal>
      </div>
    </>
  );
};

export default FieldInvestigation;
