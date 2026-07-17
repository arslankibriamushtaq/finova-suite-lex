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
import { useTranslation } from "react-i18next";

const AccountInvoices = () => {
  const { t } = useTranslation("accountingLoans");
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
          {t("accInvoices.updateDueDate")}
        </Menu.Item>

        {row.paymentStatus !== 1 && (
          <Menu.Item
            onClick={() => {
              navigate(`/lms/loanmanagement/generateInvoice/${row?.invoiceId}`);
            }}
            icon={<EyeOutlined />}
          >
            {t("accInvoices.viewInvoice")}
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
            {t("accInvoices.payManually")}
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
            {t("accInvoices.waiveLateCharges")}
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
      name: t("accInvoices.col.invoiceNo"),
      selector: (row: any) => row.invoiceNumber,
      frozen: frozenColumns.includes("Invoice No"),
    },
    {
      name: t("accInvoices.col.customerName"),
      selector: (row: any) => row.billingTo, // Assuming billingTo is the customer name
    },

    {
      name: t("accInvoices.col.invoiceDate"),
      selector: (row: any) => new Date(row.invoiceDate).toLocaleDateString(),
      frozen: frozenColumns.includes("Invoice Date"),
    },
    {
      name: t("accInvoices.col.dueDate"),
      selector: (row: any) => new Date(row.dueDate).toLocaleDateString(),
      frozen: frozenColumns.includes("Due Date"),
    },
    {
      name: t("accInvoices.col.total"),
      selector: (row: any) => row.totalAmountWithPenalty, // Assuming totalAmount is the total
      cell: (row: any) => (
        <div>
          <NumberFormatter value={row?.totalAmountWithPenalty} />
        </div>
      ),
    },
    {
      name: t("accInvoices.col.payableStatus"),
      selector: (row: any) => row.payableStatus, // Assuming payableStatus holds "Early Settlement" or "Due Loans"
      cell: (row: any) => (
        <div
          onClick={() => {
          }}
        >
          {row.payableStatus === 0
            ? t("accInvoices.payable.earlySettlement")
            : row.payableStatus === 1
              ? t("accInvoices.payable.dueLoan")
              : row.payableStatus === 2
                ? t("accInvoices.payable.overdue")
                : row.payableStatus === 3
                  ? t("accInvoices.payable.nonPerforming")
                  : row.payableStatus === 4
                    ? t("accInvoices.payable.writeOff")
                    : t("accInvoices.payable.brokenPromise")}
        </div>
      ),
    },
    {
      name: t("accInvoices.col.paymentStatus"),
      selector: (row: any) => row.paymentStatus, // Assuming 'status' for active/inactive
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "2px",
            backgroundColor: row.paymentStatus === 1 ? "var(--color-success)" : "var(--destructive)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.paymentStatus === 1 ? t("accInvoices.paymentStatus.paid") : t("accInvoices.paymentStatus.unpaid")}
        </div>
      ),
    },
    {
      name: t("common:actions"),

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "var(--background)",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("account.select")} <DownOutlined />
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
      toast.error(t("pay.toast.submitFailed"));
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
      { value: 0, label: t("pay.optInvoice") },
      { value: 1, label: t("pay.optPromise") },
    ],
    RepaymentStatus: [
      { value: 0, label: t("pay.optPending") },
      { value: 1, label: t("pay.optApproved") },
      { value: 2, label: t("pay.optRejected") },
    ],

    RepaymentChannel: [
      { value: 0, label: t("pay.cheque") },
      { value: 1, label: t("pay.online") },
      { value: 2, label: t("pay.cash") },
      { value: 3, label: t("txnHistory.mode.gateway") },
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
          <h3>{t("accInvoices.title")}</h3>
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
              {t("accInvoices.noData")}
            </div>
          )}
        </div>
      </div>
      <Modal backdrop="static" keyboard={false} show={showModal} size="lg" centered>
        <Modal.Header
          closeButton
          onClick={() => {
            setShowModal(false);
            setSelectedInvoice(null);
          }}
        >
          <Modal.Title>{t("pay.title")}</Modal.Title>
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
                      {t("pay.invoiceNo")}
                    </label>
                    <Field name="invoiceNumber" className="form-control" />
                  </Col>
                  <Col>
                    <label
                      htmlFor="totalAmount"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      {t("pay.amount")}
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
                      {t("pay.paymentMethod")}
                    </label>
                    <Field
                      as="select"
                      name="paymentMethod"
                      className="form-control"
                    >
                      <option label={t("pay.selectPaymentMethod")} value="" />
                      <option value="Cheque">{t("pay.cheque")}</option>
                      <option value="Credit Card">{t("pay.creditCard")}</option>
                      <option value="Cash">{t("pay.cash")}</option>
                    </Field>
                  </Col>
                  {values.paymentMethod === "Cheque" && (
                    <Col>
                      <label
                        htmlFor="chequeNo"
                        className="mb-2"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        {t("pay.chequeNo")}
                      </label>
                      <Field
                        as="input"
                        name="chequeNo"
                        className="form-control"
                        placeholder={t("pay.chequeNumPlaceholder")}
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
                        {t("pay.payerName")}
                      </label>
                      <Field
                        as="input"
                        name="payerName"
                        className="form-control"
                        placeholder={t("pay.payerName")}
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
                      {t("pay.dueDate")}
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
                        {t("pay.bankName")}
                      </label>
                      <Field
                        as="input"
                        name="bankName"
                        className="form-control"
                        placeholder={t("pay.bankName")}
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
                        {t("pay.repaymentTypes")}
                      </label>
                      <Field
                        as="select"
                        name="repaymentTypes"
                        className="form-control"
                      >
                        <option label={t("pay.selectType")} value="" />
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
                          {t("pay.branchCode")}
                        </label>
                        <Field
                          as="input"
                          name="branchCode"
                          className="form-control"
                          placeholder={t("pay.branchCode")}
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
                          <option label={t("pay.selectType")} value="" />
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
                      {t("pay.status")}
                    </label>
                    <Field as="select" name="Status" className="form-control">
                      <option label={t("pay.setStatus")} value="" />
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
                        {t("pay.document")}
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
                            borderRadius: "2px",
                            cursor: "pointer",
                            width: "220px",
                            textAlign: "center",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {t("pay.clickToUpload")}
                        </div>
                      ) : (
                        // Display this when a file is selected
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            backgroundColor: "var(--color-disabled)",
                            borderRadius: "2px",
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
                      borderRadius: "2px",
                    }}
                  >
                    {t("common:submit")}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      <Modal backdrop="static" keyboard={false}
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
          {t("accInvoices.updateDueDate")}
        </ModalHeader>

        <ModalBody className="modal-body-scroll">
          <div className="col-12 row">
            <div className="col-6">
              <label
                className="d-flex mb-2"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                {t("accInvoices.col.invoiceNo")}
              </label>
              <Input name="id" value={invoiceNo} disabled />
            </div>
            <div className="col-6">
              <label
                className="d-flex mb-2"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                {t("pay.dueDate")}
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
                {t("common:update")}
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
      <Modal backdrop="static" keyboard={false}
        show={waveLateDialog}
        size="lg"
        centered
        onHide={() => {
          setWaveLateDialog(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("accInvoices.waiveLateTitle")}</Modal.Title>
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
                      {t("pay.invoiceNo")}
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
                      {t("accInvoices.penaltyAmount")}
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
                      borderRadius: "2px",
                    }}
                  >
                    {t("common:submit")}
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
