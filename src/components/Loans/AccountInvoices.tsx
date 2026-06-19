import React, { useEffect, useState } from "react";
import { FaSearchengin } from "react-icons/fa";
import { Dropdown, Input, Menu, Button } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAccountInvoiceList,
  getAllRealations,
  repayManually,
  updateLoanInvoiceDueDate,
  waiveAmount,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { Modal, Row, Col, ModalHeader, ModalBody } from "react-bootstrap";
import { Formik, Form, Field } from "formik";
import { DownOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import Loader from "../Loader/Loader";
import { NumberFormatter } from "../../App";

const AccountInvoices = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [frozenColumns, setFrozenColumns] = useState<string[]>([]);
  const [allinvoiceList, setAllinvoiceList] = useState<any>();
  const [selectedInvoice, setSelectedInvoice] = useState<any>();
  const [lateFeeData, setLateFeeData] = useState<any>();
  const [allReason, setAllReason] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [waveLateDialog, setWaveLateDialog] = useState(false);
  const [fileName, setFileName] = useState<string | null>("No file chosen");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [loader, setLoader] = useState<boolean>(false);
  const navigate = useNavigate();
  const id = useParams();
  const handleView = (row: any) => {
    alert("View");
    // navigate(`/view/viewdetails/Individuals/${row.CustomerID}`);
  };
  const type = useParams();
  const [dueDateModal, setdueDateModal] = useState(false);
  const [updatedId, setUpdatedId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [updatedAccId, setUpdatedAccId] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null); // Remove the file by setting fileName to null
  };

  const handleEditClick = (row: any) => {
    alert("Edit");
    // setEditRowId(row.CustomerID);
    // setEditFormData({ ...row });
    // navigate(`/view/edit/individuals/${row.CustomerID}`);
  };

  // Handle form input changes dynamically
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
    navigate("/");
  };
  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "view") {
      handleView(row);
    }
  };
  const formatDatePayload = (isoString: any): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `${month}/${day}/${year}`;
  };
  const menu = (row: any) => {
    const currentDate = formatDatePayload(new Date());
    const dueDate = formatDatePayload(row.dueDate);
    return (
      <Menu>
        <Menu.Item
          key="editName"
          icon={<EditOutlined />}
          onClick={() => {
            setdueDateModal(true);
            setUpdatedDate(row.dueDate);
            setUpdatedAccId(row.accountId);
            setUpdatedId(row.invoiceId);
            setInvoiceNo(row.invoiceNumber);
          }}
        >
          Update Due Date
        </Menu.Item>

        {row.paymentStatus !== 1 && (
          <Menu.Item
            onClick={() => {
              navigate(`/lms/loanmanagement/generateInvoice/${row?.invoiceId}`);
            }}
            icon={<EyeOutlined />}
          >
            View
          </Menu.Item>
        )}
        {row.paymentStatus != 1 && (
          <Menu.Item
            onClick={() => {
              setSelectedInvoice(row);
              setShowModal(true);
            }}
            icon={<EditOutlined />}
          >
            Pay Manually
          </Menu.Item>
        )}
        {row.payableStatus != 0 && (
          <Menu.Item
            onClick={() => {
              setWaveLateDialog(true);
              setLateFeeData(row);
            }}
            icon={<EditOutlined />}
          >
            Waive late charges
          </Menu.Item>
        )}
        {/* <Menu.Item
          key="view"
          onClick={({ key }: any) => handleChange(key, row)}
          icon={<EyeOutlined />}
        >
          view
        </Menu.Item> */}
      </Menu>
    );
  };

  const customSearchInput = (
    <Input
      placeholder="Search Invoices"
      value={searchValue}
      prefix={<FaSearchengin />}
      onChange={(e: any) => setSearchValue(e.target.value)}
    />
  );
  const button = [
    // { title: "edit", onClick: handleClick },
    // { title: "view", onClick: handleView },
    { title: "Close" },
  ];

  const Customer_ALL_List_Header = [
    {
      name: "Invoice No",
      selector: (row: any) => row.invoiceNumber,
      frozen: frozenColumns.includes("Invoice No"),
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.billingTo, // Assuming billingTo is the customer name
    },

    {
      name: "Invoice Date",
      selector: (row: any) => new Date(row.invoiceDate).toLocaleDateString(),
      frozen: frozenColumns.includes("Invoice Date"),
    },
    {
      name: "Due Date",
      selector: (row: any) => new Date(row.dueDate).toLocaleDateString(),
      frozen: frozenColumns.includes("Due Date"),
    },
    {
      name: "Total",
      selector: (row: any) => row.totalAmountWithPenalty, // Assuming totalAmount is the total
      cell: (row: any) => (
        <div>
          <NumberFormatter value={row?.totalAmountWithPenalty} />
        </div>
      ),
    },
    {
      name: "Payable Status",
      selector: (row: any) => row.payableStatus, // Assuming payableStatus holds "Early Settlement" or "Due Loans"
      cell: (row: any) => (
        <div
          onClick={() => {
          }}
        >
          {row.payableStatus === 0
            ? "Early settlement"
            : row.payableStatus === 1
              ? "Due Loan"
              : row.payableStatus === 2
                ? "Over due"
                : row.payableStatus === 3
                  ? "Non performing"
                  : row.payableStatus === 4
                    ? " Write off"
                    : "Broken promise"}
        </div>
      ),
    },
    {
      name: "Payment Status",
      selector: (row: any) => row.paymentStatus, // Assuming 'status' for active/inactive
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "6px",
            backgroundColor: row.paymentStatus === 1 ? "var(--color-success)" : "var(--destructive)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.paymentStatus === 1 ? "Paid" : "Unpaid"}
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
              borderColor: "var(--background)",
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
    try {
      const body = {
        fileToUpload: "test",
        promiseNumber: "",
        accountNumber: values.accountNumber,
        applicationId: values.applicationID,
        invoiceNumber: [values.invoiceNumber],
        amount: values.totalAmount,
        // paymentMethod: values.paymentMethod,
        dueDate: values.dueDate,
        payerName: values.payerName,
        repaymentTypes: Number(values.repaymentTypes),
        repaymentStatus: values.RepaymentStatus,
        repaymentChannel: values.paymentMethod === "Cheque"
          ? 0
          : values.paymentMethod === "Credit Card"
            ? 1
            : values.paymentMethod === "Cash"
              ? 2
              : 0,
        chequeDto: {
          branchCode: values.branchCode,
          chequeNumber: values.chequeNo,
          bankAccNumber: values.bankAccountNo,
          bankName: values.bankName,
        },
        onlineTransactionDto: {
          bankName: values.bankName,
          bankAccNumber: values.bankAccountNo,
          transactionId: "string",
        },
      };

      const response = await repayManually(body);
      if (response?.data?.notificationMessage == "Operation successful.") {
        toast.success(response?.data.notificationMessage);
        setShowModal(false);
        individualCustomer();
        setSelectedInvoice(null);
      } else {
        toast.error(
          response.data.notificationMessage || response.data.errors[0]
        );
      }
    } catch (error) {
      // Handle error case
      toast.error("Failed to submit payment. Please try again.");
    }
  };
  const handleSubmitWaiveAmount = async (values: any) => {
    setWaveLateDialog(false);
    setLoader(true);
    try {
      const body = {
        accountId: lateFeeData?.accountId,
        invoiceId: lateFeeData?.id,
        charges: values?.totalAmount,
      };

      const response = await waiveAmount(body);
      if (
        response.data.notificationMessage ==
        "Request initiated for the operation"
      ) {
        toast.success(response.data.notificationMessage);
        setLoader(false);
        setWaveLateDialog(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        setWaveLateDialog(false);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      setWaveLateDialog(false);
      // Handle error case
      toast.error("Failed to submit payment. Please try again.");
    }
  };

  const individualCustomer = async () => {
    try {
      setSkelitonLoading(true);
      const res = await getAccountInvoiceList(id?.id);
      if (res) {
        const value = res.data.data;
        setAllinvoiceList(value || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const enums = {
    Gender: [
      { value: 1, label: "Male" },
      { value: 2, label: "Female" },
      { value: 3, label: "Non_Binary" },
      { value: 4, label: "Prefer_not_to_say" },
    ],
    RepaymentType: [
      { value: 0, label: "invoice" },
      { value: 1, label: "Promise" },
    ],
    RepaymentStatus: [
      { value: 0, label: "Pending" },
      { value: 1, label: "Approved" },
      { value: 2, label: "Rejected" },
    ],

    RepaymentChannel: [
      { value: 0, label: "Cheque" },
      { value: 1, label: "Online" },
      { value: 2, label: "Cash" },
      { value: 3, label: "Gateway" },
    ],
  };
  const handleAllReason = async () => {
    try {
      const res = await getAllRealations(page, pageSize);
      if (res) {
        const data = res.data.data;
        setAllReason(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const getReasonDescriptionById = (id: any) => {
    const entry: any = allReason?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  console.warn(allinvoiceList);
  const mappedData =
    allinvoiceList &&
    allinvoiceList.map((item: any) => {
      return {
        accountNumber: item?.accountNumber,
        applicationID: item?.applicationID,
        invoiceLogo: item?.invoiceLogo,
        invoiceNumber: item?.invoiceNumber,
        from: item?.from,
        billingTo: item?.billingTo || "-",
        shipTo: item?.shipTo,
        dueDate: formatDate(item?.dueDate),
        invoiceDate: formatDate(item?.invoiceDate),
        poNumber: item?.poNumber,
        subTotalAmount: item?.subTotalAmount,
        totalAmount: item?.totalAmountWithPenalty,
        tax: item?.tax,
        shipping: item?.shipping,
        discount: item?.discount,
        notes: item?.notes,
        terms: item?.terms,
        payableStatus: item?.payableStatus,
        paymentTerms: item?.paymentTerms,
        paymentStatus: item?.paymentStatus,
        id: item?.id,
        created: item?.created,
        accountId: item?.accountId,
        penaltyAmount: item?.penaltyAmount,
        totalAmountWithPenalty: item?.totalAmountWithPenalty,
        invoiceId: item?.invoiceDiscriptions?.invoiceID || item?.result?.id,
        // CustomerID: item.customerId,
        // IndividualId: item.individualId,
        // Name: item.name,
        // Relation: getReasonDescriptionById(item.relationId),
        // SSN: item.ssn,
        // NationalId: item.nationalId,
        // NIDIssueDate: formatDate(item.nationalIdIssuanceDate),
        // NIDExpiry: formatDate(item.nidExpiryDate),
        // DOB: formatDate(item.dob),
        // Gender: getGenderLabel(item.gender),
        // Email: item.email,
        // status: item.paymentStatus,
      };
    });

  useEffect(() => {
    handleAllReason();
    individualCustomer();
    return () => { };
  }, [page, pageSize]);

  const handleUpdateDueDate = async () => {
    try {
      // setIsLoading(true);
      setLoader(true);
      const response = await updateLoanInvoiceDueDate(
        updatedId,
        updatedAccId,
        updatedDate
      );
      if (
        response?.data?.notificationMessage ==
        "Request initiated for the operation" ||
        response?.data?.data?.notificationMessage ==
        "Request initiated for the operation"
      ) {
        toast.success(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage
        );
        setLoader(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response?.data?.errors[0]
        );
        setLoader(false);
      }
      individualCustomer();
      setdueDateModal(false);
      setUpdatedId("");
      setUpdatedDate("");
      setUpdatedAccId("");
    } catch (error: any) {
      toast.error(error?.message);
      setLoader(false);
    }
  };
  return (
    <>
      {loader && <Loader />}
      <div>
        <div className="col-11 mb-4 ">
          <h3>Account Other Invoices</h3>
        </div>
        {/* <div className="col-12">
          <TableHeaderFilter
            button={button}
            searchInput={customSearchInput}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
        </div> */}

        <div className="cs-table p-2">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            header={Customer_ALL_List_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
          {allinvoiceList?.length == 0 && (
            <div
              className="d-flex justify-content-center mt-5"
              style={{ color: "var(--destructive)" }}
            >
              No data found
            </div>
          )}
        </div>
      </div>
      <Modal show={showModal} size="lg" centered>
        <Modal.Header
          closeButton
          onClick={() => {
            setShowModal(false);
            setSelectedInvoice(null);
          }}
        >
          <Modal.Title>Pay Invoice Manually</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "70lvh",
            overflowY: "auto",
            marginBottom: "14px",
          }}
        >
          <Formik
            initialValues={{
              accountNumber: selectedInvoice?.accountNumber,
              applicationID: selectedInvoice?.applicationID || "000",
              invoiceLogo: selectedInvoice?.invoiceLogo,
              invoiceNumber: selectedInvoice?.invoiceNumber,
              from: selectedInvoice?.from,
              billingTo: selectedInvoice?.billingTo,
              dueDate: selectedInvoice?.dueDate,
              invoiceDate: selectedInvoice?.invoiceDate,
              poNumber: selectedInvoice?.poNumber,
              subTotalAmount: selectedInvoice?.subTotalAmount,
              totalAmount: selectedInvoice?.totalAmount,
              shipping: selectedInvoice?.shipping,
              discount: selectedInvoice?.discount,
              notes: selectedInvoice?.notes,
              terms: selectedInvoice?.terms,
              paymentTerms: selectedInvoice?.paymentTerms,
              paymentStatus: selectedInvoice?.paymentStatus,
              paymentMethod: "",
              id: selectedInvoice?.id,
              created: selectedInvoice?.created,
            }}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, values }) => (
              <Form>
                {/* <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="accountNumber"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Account ID
                    </label>
                    <Field name="accountNumber" className="form-control" />
                  </Col>
                  <Col>
                    <label
                      htmlFor="applicationID"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Application ID
                    </label>
                    <Field name="applicationID" className="form-control" />
                  </Col>
                </Row> */}
                <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="invoiceNumber"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Invoice No.
                    </label>
                    <Field name="invoiceNumber" className="form-control" />
                  </Col>
                  <Col>
                    <label
                      htmlFor="totalAmount"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Amount
                    </label>
                    <Field name="totalAmount" className="form-control" />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="paymentMethod"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Payment Method
                    </label>
                    <Field
                      as="select"
                      name="paymentMethod"
                      className="form-control"
                    >
                      <option label="Select Payment Method" value="" />
                      <option value="Cheque">Cheque</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                    </Field>
                  </Col>
                  {values.paymentMethod === "Cheque" && (
                    <Col>
                      <label
                        htmlFor="chequeNo"
                        className="mb-2"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Cheque No.
                      </label>
                      <Field
                        as="input"
                        name="chequeNo"
                        className="form-control"
                        placeholder="Cheque Num..."
                      />
                    </Col>
                  )}
                  {values.paymentMethod !== "Cheque" && (
                    <Col>
                      <label
                        htmlFor="payerName"
                        className="mb-2"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Payer Name
                      </label>
                      <Field
                        as="input"
                        name="payerName"
                        className="form-control"
                        placeholder="Payer Name"
                      />
                    </Col>
                  )}
                </Row>
                <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="dueDate"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Due Date
                    </label>
                    <Field
                      name="dueDate"
                      type="date"
                      className="form-control"
                    />
                  </Col>
                  {values.paymentMethod !== "Cash" && (
                    <Col>
                      <label
                        htmlFor="bankName"
                        className="mb-2"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Bank Name
                      </label>
                      <Field
                        as="input"
                        name="bankName"
                        className="form-control"
                        placeholder="Bank Name"
                      />
                    </Col>
                  )}
                  {values.paymentMethod === "Cash" && (
                    <Col>
                      <label
                        htmlFor="repaymentTypes"
                        className="mb-2"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Repayment Types
                      </label>
                      <Field
                        as="select"
                        name="repaymentTypes"
                        className="form-control"
                      >
                        <option label="Select Type" value="" />
                        {enums.RepaymentType.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                    </Col>
                  )}
                </Row>
                <Row className="mb-3">
                  {values.paymentMethod !== "Cash" && (
                    <>
                      <Col>
                        <label
                          htmlFor="branchCode"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Branch Code
                        </label>
                        <Field
                          as="input"
                          name="branchCode"
                          className="form-control"
                          placeholder="Branch Code"
                        />
                      </Col>
                      <Col>
                        <label
                          htmlFor="repaymentTypes"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Repayment Types
                        </label>
                        <Field
                          as="select"
                          name="repaymentTypes"
                          className="form-control"
                        >
                          <option label="Select Type" value="" />
                          {enums.RepaymentType.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Field>
                      </Col>
                    </>
                  )}
                </Row>
                <Row className="mb-3">
                  <Col className="col-6">
                    <label
                      htmlFor="RepaymentStatus"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Status
                    </label>
                    <Field as="select" name="Status" className="form-control">
                      <option label="Set Status" value="" />
                      {enums.RepaymentStatus.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                  </Col>
                  {/* <Col>
                    <label
                      htmlFor="repaymentChannel"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Channel
                    </label>
                    <Field
                      as="select"
                      name="repaymentChannel"
                      className="form-control"
                    >
                      <option label="Select Channel" value="" />
                      {enums.RepaymentChannel.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                  </Col> */}
                </Row>
                <Row className="mb-3">
                  <Col className="col-6">
                    <div>
                      <label
                        className="mb-2"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Document
                      </label>
                      <br />
                      {!fileName ? (
                        // Display this when no file is selected
                        <div
                          onClick={() =>
                            document.getElementById("fileToUpload")?.click()
                          }
                          style={{
                            padding: "7px",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            width: "220px",
                            textAlign: "center",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          Click here to upload a file
                        </div>
                      ) : (
                        // Display this when a file is selected
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            backgroundColor: "var(--color-disabled)",
                            borderRadius: "6px",
                            padding: "5px 10px",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          <span>{fileName}</span>
                          <span
                            onClick={handleRemoveFile}
                            style={{
                              marginLeft: "10px",
                              cursor: "pointer",
                              color: "var(--primary-foreground)",
                              padding: "4px",
                            }}
                          >
                            &times;
                          </span>
                        </div>
                      )}

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        id="fileToUpload"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </div>
                  </Col>
                </Row>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    marginTop: "25px",
                  }}
                >
                  <button
                    type="submit"
                    className="application-btn p-2 border-rounded-lg"
                    style={{
                      border: "1px solid transparent",
                      borderRadius: "6px",
                    }}
                  >
                    Submit
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      <Modal
        centered
        show={dueDateModal}
        onHide={() => {
          setdueDateModal(false);
          setUpdatedId("");
          setUpdatedDate("");
          setUpdatedAccId("");
        }}
      >
        <ModalHeader style={{ fontSize: "16px", fontWeight: 600 }} closeButton>
          Update Due Date
        </ModalHeader>

        <ModalBody className="modal-body-scroll">
          <div className="col-12 row">
            <div className="col-6">
              <label
                className="d-flex mb-2"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Invoice No
              </label>
              <Input name="id" value={invoiceNo} disabled />
            </div>
            <div className="col-6">
              <label
                className="d-flex mb-2"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Due Date
              </label>
              <Input
                name="name"
                type="date"
                style={{ height: "32px", padding: "2px 4px" }}
                value={updatedDate}
                onChange={(e) => setUpdatedDate(e.target.value)}
              />
            </div>

            <div className="mt-5 d-flex justify-content-end">
              <button
                className="theme-btn-next"
                onClick={() => handleUpdateDueDate()}
              >
                Update
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
      <Modal
        show={waveLateDialog}
        size="lg"
        centered
        onHide={() => {
          setWaveLateDialog(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Waive Late Charges</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "70lvh",
            overflowY: "auto",
            marginBottom: "14px",
          }}
        >
          <Formik
            initialValues={{
              totalAmount: lateFeeData?.penaltyAmount,
              invoiceNumber: lateFeeData?.invoiceNumber,
            }}
            onSubmit={handleSubmitWaiveAmount}
          >
            {({ setFieldValue }) => (
              <Form>
                <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="invoiceNumber"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Invoice No.
                    </label>
                    <Field
                      name="invoiceNumber"
                      id="invoiceNumber"
                      className="form-control"
                      readOnly
                    />
                  </Col>
                  <Col>
                    <label
                      htmlFor="penaltyAmount"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Penalty Amount
                    </label>
                    <Field
                      name="totalAmount"
                      id="totalAmount"
                      type="number"
                      className="form-control"
                    />
                  </Col>
                </Row>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    marginTop: "25px",
                  }}
                >
                  <button
                    type="submit"
                    className="application-btn px-2 p-2"
                    style={{
                      border: "1px solid transparent",
                      borderRadius: "6px",
                    }}
                  >
                    Submit
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AccountInvoices;
