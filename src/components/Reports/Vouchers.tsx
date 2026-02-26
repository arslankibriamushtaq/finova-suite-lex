import React, { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import * as Yup from "yup";
import { DatePicker, Dropdown, Button, Menu, Select, Input } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createVoucher,
  deleteVoucherById,
  getLedgerAccount,
  getVauchers,
  getVoucherById,
  updateVoucher,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import Loader from "../Loader/Loader";
const Vouchers = () => {
  const [modal, setModal] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [callAction, setCallAction] = useState<any>();
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const [customerData, setCustomerData] = useState<any>([]);
  const [allAccounts, setAllAccounts] = useState<any>([]);
  const [editForm, setEditForm] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [applications, setApplications] = useState<any>();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [formValues, setFormValues] = useState<any>({
    applicationID: "",
  });
  const [applicationNoError, setApplicationNoError] = useState<string>("");
  const id = useParams();

  const handleEditClick = (row: any) => {
    setEditRowId(row.Id);
    // navigate(`${row.id}`);
    setModalUpdate(true);
    acitivityCallId(row.Id);
  };
  const handleDelete = async (row: any) => {
    try {
      const res = await deleteVoucherById(row.Id);
      if (res) {
        toast.success(res.data.notificationMessage);
        handleSubmit(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAccounts = async () => {
    try {
      const res = await getLedgerAccount(1, 1000, "");
      if (res) {
        setAllAccounts(res.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setSkelitonLoading(true);
      const data = {
        pageNo: page,
        pageSize: pageSize,
        from: null,
        to: null,
      };
      const res = await getVauchers(data);
      if (res?.data?.success) {
        const responseData = res.data.data;
        setAllCallActivity(responseData || []);
        
        // Extract pagination data from API response
        const pageInfo = res?.data?.pageInfo;
        const totalItems = pageInfo?.totalItems || 0;
        setTotalRows(totalItems);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      } else {
        toast.error(res?.data?.notificationMessage);
        // Reset pagination values on error
        setTotalRows(0);
        setFrom(0);
        setTo(0);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const exportToCSV = (data: any[], fileName: string) => {
      const updatedData = data?.map((item) => {
      return {
        "Voucher No": item?.voucherNo,
        "Application No": item?.applicationNo,
        "Date": item?.date,
        "Voucher Type": item?.voucherType,
        "Amount": item?.amount,
        "Currency": "SAR",
        "Status": "Approved",
      };
    });
    const csvRows = [];
    const headers = Object.keys(updatedData[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
  
    updatedData.forEach((row: any) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    // Create CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };
  const handleSubmitForm = async (formFields: any) => {
    try {
      // Validate Application No separately since it's in formValues
      if (!formValues.applicationID || formValues.applicationID.trim() === "") {
        setApplicationNoError("Application No is required");
        toast.error("Please fill all required fields");
        return;
      }

      const payload = {
        applicationNo: formValues.applicationID,
        date: formFields.date,
        vouchterType: formFields.voucherType == "1" ? 1 : 2,
        debitAccount: formFields.debitAccount,
        creditAccount: formFields.creditAccount,
        description: formFields.description,
        channel: "LMS",
        amount: Number(formFields.amount),
        approvalStatus: Number(formFields.approvalStatus),
      };
      const res = await createVoucher(payload);
      if (res.data.notificationMessage) {
        toast.success(res.data.notificationMessage);
        handleSubmit();
        setModal(false);
        // Reset form values
        setFormValues({ applicationID: "" });
        setApplicationNoError("");
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const updateSubmitForm = async (formFields: any) => {
    try {
      let payload = {
        voucherNo: editForm.voucherNo,
        applicationKey: editForm.applicationKey,
        voucherId: editForm.voucherId,
        voucherType: formFields.voucherType == "1" ? 1 : 2,
        approvalStatus: Number(formFields.approvalStatus),
        currency: 1,
        description: editForm.description,
        debitAccount: editForm.debitAccount,
        creditAccount: editForm.creditAccount,
        amount: formFields.amount,
      };
      await updateVoucher(payload).then((res) => {
        if (res.data.notificationMessage) {
          toast.success(res.data.notificationMessage);
          handleSubmit();
          setModalUpdate(false);

        }
      });
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const reversePayment = async (row: any) => {
    setModalUpdate(true);
    try {
      let payload = {
        voucherNo: "row.VoucherNo",
        applicationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        voucherId: row.Id,
        voucherType: row.VoucherType == "Payment_Voucher" ? 1 : 0,
        approvalStatus: Number(row.Status),
        currency: row.Currency == "SAR" ? 0 : 1,
        description: row.Description,
        debitAccount: row.CreditAccount,
        creditAccount: row.DebitAccount,
        amount: row.Amount,
        date: new Date(),
      };

      await updateVoucher(payload).then((res) => {
        if (res?.data?.notificationMessage) {
          toast.success(res?.data?.notificationMessage);
          handleSubmit();
          setModalUpdate(false);
        }
      });
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const acitivityCallId = async (id: any) => {
    try {
      const res = await getVoucherById(id);
      if (res) {
        setEditForm(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const LedgerDetails = async () => {
    try {
      //setLoading(true);
      const res = await getLedgerAccount(1, 1000, "");
      if (res) {
        const value = res.data.data || [];
        setCustomerData(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };
  const enums = {
    ApprovalStatus: [
      { value: 0, label: "Draft" },
      { value: 1, label: "Pending" },
      { value: 2, label: "Approved" },
      { value: 3, label: "Rejected" },
      { value: 4, label: "Under_Review" },
      { value: 5, label: "Cancelled" },
      { value: 6, label: "Completed" },
    ],
  };
  const getApprovalStatus = (value: any) => {
    const status = enums.ApprovalStatus.find((g) => g.value === Number(value));
    return status ? status.label : "Unknown";
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const validationSchema = Yup.object({
    approvalStatus: Yup.string().required("Approval Status is required"),
    voucherType: Yup.string()
      .required("Voucher Type is required")
      .test("not-zero", "Please select a valid Voucher Type", (value) => {
        return value !== "0";
      }),
    date: Yup.string().required("Date is required"),
    description: Yup.string().required("Description is required"),
    debitAccount: Yup.string().required("Debit Account is required"),
    creditAccount: Yup.string().required("Credit Account is required"),
    amount: Yup.string()
      .required("Amount is required")
      .test("not-zero", "Amount must be greater than 0", (value) => {
        if (!value) return false;
        return Number(value) > 0;
      }),
  });
  const mappedData =
    allCallActivity &&
    allCallActivity.map((item: any) => {
      return {
        VoucherNo: item.voucherNo,
        applicationId: item.applicationId,
        applicationKey: item.applicationKey,
        applicationNo: item.applicationNo,
        Id: item.voucherId,
        Date: formatDate(item.date),
        Description: item.description,
        DebitAccount: item.debitAccount,
        CreditAccount: item.creditAccount,
        Amount: item.amount,
        Currency: item.currency,
        // Status: getApprovalStatus(item.approvalStatus),
        Status: item?.approvalStatus,
        VoucherType: item.voucherType,
      };
    });

  useEffect(() => {
    handleSubmit();
    handleAccounts();
    LedgerDetails();
    return () => {};
  }, [id, page, pageSize]);
  const handleChange = (key: string, row: any) => {
    if (key === "Edit") {
      handleEditClick(row);
    } else if (key === "Delete") {
      handleDelete(row);
    } else if (key === "Reversal") {
      reversePayment(row);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="Reversal" icon={<EyeOutlined />}>
        Reverse Payment
      </Menu.Item>
      <Menu.Item key="Edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="Delete" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  const Call_Activity_Header = [
    {
      name: "Voucher No",
      cell: (row: any) => row.VoucherNo,
    },
    {
      name: "Application No",
      selector: (row: { applicationNo: any }) => row.applicationNo || "-",
      width: "200px",
    },
    {
      name: "Date",
      selector: (row: { Date: any }) => row.Date,
    },
    // {
    //   name: "Description",
    //   selector: (row: { Description: any }) => row.Description,
    // },
    {
      name: "Voucher Type",
      selector: (row: { VoucherType: any }) => row.VoucherType,
    },
    // {
    //   name: "Debit Account",
    //   selector: (row: { DebitAccount: any }) => row.DebitAccount,
    // },
    // {
    //   name: "CreditAccount",
    //   selector: (row: { CreditAccount: any }) => row.CreditAccount,
    // },
    {
      name: "Amount",
      selector: (row: { Amount: any }) => row.Amount,
    },
    {
      name: "Currency",
      selector: (row: { Currency: any }) => row.Currency,
    },
    {
      name: "Status",
      width: "150px",
      cell: (row: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "0.4rem 1rem",
            borderRadius: "12px",
            backgroundColor:
              row.Status === "Approved"
                ? "#92BC83"
                : row.Status === "Pending"
                ? "#FAB65E"
                : row.Status === "Rejected"
                ? "#F85F54"
                : row.Status === "Under_Review"
                ? "#959595"
                : row.Status === "Cancelled"
                ? "#629FFB"
                : "rgba(55, 52, 53, 1)",
            color: "rgba(255, 255, 255, 1)",
            cursor: row.Status === "Active" ? "pointer" : "default",
          }}
        >
          {row.Status}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              border: "none",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;

    setFormValues((prevValues: any) => ({
      ...prevValues,
      [name]: value,
    }));
    
    // Clear application no error when user types
    if (name === "applicationID") {
      setApplicationNoError("");
    }
  };
  const handleSelectChange = (value: string) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      applicationID: value, // Set the selected value directly
    }));
  };

  return (
    <>
      {loading && <Loader />}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">Journal Voucher</h5>
          </div>
          <div className="col-2 text-end">
            <button
              className="theme-btn-next"
              onClick={() => {
                setModal(true);
              }}
            >
              Create Voucher
            </button>
          </div>
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-end">
          <div className="row align-items-center">
            {/* From Date */}
            <div className="col-md-4">
              <label htmlFor="fromDate" className="form-label">
                From
              </label>
              <DatePicker />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                To
              </label>
              <DatePicker />
            </div>

            {/* Voucher Type Select */}
            <div className="col-md-3">
              {/* <label htmlFor="voucherType" className="form-label">
                Voucher Type
              </label>
              <Select id="voucherType" /> */}
            </div>

            {/* Account Select */}
            <div className="col-md-3">
              {/* <label htmlFor="account" className="form-label">
                Account
              </label>
              <Select id="account" /> */}
            </div>
          </div>
          <div className="col-md-3 mt-3">
            {/* <Button
              className="mt-2"
            >
              Clear
            </Button> */}
          </div>
          <div className="col-2 d-flex justify-content-end">
            <button
              className="invoice-btn bg-dark text-end"
              onClick={() => {
                exportToCSV(allCallActivity, "Voucher");
              }}
              /*  style={{
             height: "3px",
             border: "none",
             borderRadius: "8px",
             display: "flex",
             alignItems: "center"
           }} */
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            from={from}
            to={to}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
        </div>
      </div>
      <Modal
        size="lg"
        show={modal}
        onHide={() => {
          setModal(false);
          setApplicationNoError("");
          setFormValues({ applicationID: "" });
        }}
      >
        <ModalHeader closeButton>
          <h3>Add Voucher</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            approvalStatus: "",
            voucherType: "0",
            date: "",
            description: "",
            debitAccount: "",
            creditAccount: "",
            amount: "",
          }}
          enableReinitialize={true}
          onSubmit={handleSubmitForm}
          validationSchema={validationSchema}
        >
          {({ handleChange }) => {
            return (
              <Form className="p-2">
                <Modal.Body>
                  <Row className="mb-2">
                    <Col md={6}>
                      <label
                        htmlFor="approvalStatus"
                        className="mb-1 form-label"
                      >
                        Approval Status
                      </label>

                      <Field
                        as="select"
                        placeholder="Approval Status"
                        id="approvalStatus"
                        name="approvalStatus"
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
                        <option value="" label="Select Approval status" />
                        {enums.ApprovalStatus.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="approvalStatus"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label
                        htmlFor="applicationNo"
                        className="mb-1 form-label"
                      >
                        Application No
                      </label>
                      <Input
                        name="applicationID"
                        value={formValues.applicationID}
                        onChange={handleInputChange}
                        size="large"
                        placeholder="Application Number"
                        status={applicationNoError ? "error" : ""}
                      />
                      {applicationNoError && (
                        <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                          {applicationNoError}
                        </div>
                      )}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="voucherType" className="mb-1 form-label">
                        Voucher Type
                      </label>
                      <Field
                        as="select"
                        id="voucherType"
                        name="voucherType"
                        className="form-control"
                      >
                        <option value={0}>Select Voucher Type</option>
                        <option value={1}>Receipt Voucher</option>
                        <option value={2}>Payment Voucher</option>
                      </Field>
                      <ErrorMessage
                        name="voucherType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="date" className="mb-1 form-label">
                        Date
                      </label>
                      <Field
                        type="date"
                        id="date"
                        name="date"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="date"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="description" className="mb-1 form-label">
                        Description
                      </label>
                      <Field
                        type="text"
                        placeholder="Enter Description"
                        id="description"
                        name="description"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="debitAccount" className="mb-1 form-label">
                        Debit Account
                      </label>
                      <Select
                        //name="debitAccount"
                        id="debitAccount"
                        //className="form-control"
                        placeholder="Select Debit Account"
                        onChange={(value) =>
                          handleChange({
                            target: { name: "debitAccount", value },
                          })
                        }
                      >
                        {customerData.map((account: any) => (
                          <Select.Option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountTitle}
                          </Select.Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="debitAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label
                        htmlFor="creditAccount"
                        className="mb-1 form-label"
                      >
                        Credit Account
                      </label>
                      <Select
                        //name="creditAccount"
                        id="creditAccount"
                        //className="form-control"
                        placeholder="Select Credit Account"
                        onChange={(value) =>
                          handleChange({
                            target: { name: "creditAccount", value },
                          })
                        }
                      >
                        {allAccounts.map((account: any) => (
                          <Select.Option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountTitle}
                          </Select.Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="creditAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="amount" className="mb-1 form-label">
                        Amount
                      </label>
                      <Field
                        type="text"
                        placeholder="Amount"
                        id="amount"
                        name="amount"
                        className="form-control"
                        onInput={(e: any) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          ); // Replaces any non-numeric characters with an empty string
                        }}
                      />
                      <ErrorMessage
                        name="amount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="currency" className="mb-1 form-label">
                        Currency
                      </label>
                      <Field
                        type="text"
                        //placeholder="Currency"
                        id="currency"
                        name="currency"
                        className="form-control"
                        value="SAR"
                        disabled
                      />
                      <ErrorMessage
                        name="currency"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end">
                    <button className="theme-btn-next" type="submit">
                      Create
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
        show={modalUpdate}
        onHide={() => {
          setModalUpdate(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Edit Voucher</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            voucherNo: editForm.voucherNo,
            applicationKey: editForm.applicationKey,
            voucherType: editForm.voucherType == "Receipt_Voucher" ? "1" : "2",
            date: editForm.date,
            description: editForm.description,
            debitAccount: editForm.debitAccount,
            creditAccount: editForm.creditAccount,
            amount: editForm.amount,
            currency: editForm.currency,
            approvalStatus: editForm.approvalStatus == "Pending" ? "1" : "0",
          }}
          enableReinitialize={true}
          onSubmit={updateSubmitForm}
          // validationSchema={validationSchema}
        >
          {({ setFieldValue }) => {
            return (
              <Form className="p-2">
                <Modal.Body>
                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="voucherNo" className="mb-1 form-label">
                        Voucher No.
                      </label>
                      <Field
                        type="text"
                        placeholder="1234567"
                        id="voucherNo"
                        name="voucherNo"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="voucherNo"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label
                        htmlFor="applicationKey"
                        className="mb-1 form-label"
                      >
                        Application Key
                      </label>
                      <Select
                        size="large"
                        value={editForm.applicationKey}
                        onChange={handleSelectChange}
                      >
                        {applications &&
                          applications.map((item: any) => (
                            <Select.Option
                              key={item.applicationId}
                              value={item.applicationId}
                            >
                              <div>{item.applicationKey}</div>
                            </Select.Option>
                          ))}
                      </Select>
                      <ErrorMessage
                        name="applicationKey"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="voucherType" className="mb-1 form-label">
                        Voucher Type
                      </label>
                      <Field
                        as="select"
                        id="voucherType"
                        name="voucherType"
                        className="form-control"
                      >
                        <option value={""}>Select</option>
                        <option value={"1"}>Receipt Voucher</option>
                        <option value={"2"}>Payment Voucher</option>
                      </Field>
                      <ErrorMessage
                        name="voucherType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="date" className="mb-1 form-label">
                        Date
                      </label>
                      <Field
                        type="date"
                        id="date"
                        name="date"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="date"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="description" className="mb-1 form-label">
                        Description
                      </label>
                      <Field
                        type="text"
                        placeholder="Placeholder"
                        id="description"
                        name="description"
                        className="form-control"
                        value={editForm.description}
                        onChange={(value: any) =>
                          setEditForm({
                            description: value,
                          })
                        }
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="debitAccount" className="mb-1 form-label">
                        Debit Account
                      </label>
                      <Select
                        //name="debitAccount"
                        id="debitAccount"
                        value={editForm.debitAccount}
                        placeholder="Select Debit Account"
                        onChange={(value) =>
                          setEditForm({
                            debitAccount: value,
                          })
                        }
                      >
                        {customerData.map((account: any) => (
                          <Select.Option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountTitle}
                          </Select.Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="debitAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label
                        htmlFor="creditAccount"
                        className="mb-1 form-label"
                      >
                        Credit Account
                      </label>
                      <Select
                        //name="creditAccount"
                        id="creditAccount"
                        value={editForm.creditAccount}
                        placeholder="Select Credit Account"
                        onChange={(value) =>
                          setEditForm({
                            creditAccount: value,
                          })
                        }
                      >
                        {allAccounts.map((account: any) => (
                          <Select.Option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountTitle}
                          </Select.Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="creditAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6}>
                      <label htmlFor="amount" className="mb-1 form-label">
                        Amount
                      </label>
                      <Field
                        type="text"
                        placeholder="Placeholder"
                        id="amount"
                        name="amount"
                        className="form-control"
                        onInput={(e: any) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                        }}
                        // onChange={(value: any) => setFieldValue("amount", value)}
                      />
                      <ErrorMessage
                        name="amount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="currency" className="mb-1 form-label">
                        Currency
                      </label>
                      <Field
                        type="text"
                        placeholder="Placeholder"
                        id="currency"
                        name="currency"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="currency"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label
                        htmlFor="approvalStatus"
                        className="mb-1 form-label"
                      >
                        Approval Status
                      </label>
                      <Field
                        as="select"
                        id="approvalStatus"
                        name="approvalStatus"
                        className="form-control"
                        defaultValue="1"
                      >
                        <option value="">Select</option>
                        <option value="1">Approved</option>
                        <option value="0">Pending</option>
                      </Field>
                      <ErrorMessage
                        name="approvalStatus"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end">
                    <button className="theme-btn-next" type="submit">
                      Update
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      {/* <TableView /> */}
    </>
  );
};

export default Vouchers;
