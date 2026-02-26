import React, { useEffect, useState } from "react";
import { FaSearchengin } from "react-icons/fa";
import { Dropdown, Input, Menu, Button, Checkbox } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllInvoiceList,
  getAllRealations,
  getDynamicInvoiceCreation,
  repayManually,
  updateLoanInvoiceDueDate,
  waiveAmount,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { Modal, Row, Col, ModalHeader, ModalBody, Tab, Tabs } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { DownOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import Loader from "../Loader/Loader";
import * as Yup from "yup";
import { NumberFormatter } from "../../App";
import { useDispatch } from "react-redux";
import { setPayInvoices } from "../../redux/apis/apisSlice";

// Enum matching backend PaymentStatus
enum PaymentStatus {
  Paid = 1,
  UnPaid = 2,
  Discard = 3,
  Cancelled = 4
}

const Invoices = () => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [allinvoiceList, setAllinvoiceList] = useState<any>();
  const [selectedInvoice, setSelectedInvoice] = useState<any>();
  const [lateFeeData, setLateFeeData] = useState<any>();
  const [allReason, setAllReason] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [activeTab, setActiveTab] = useState("loanInvoices");
  const [earlySettlementPage, setEarlySettlementPage] = useState(1);
  const [earlySettlementPageSize, setEarlySettlementPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [waveLateDialog, setWaveLateDialog] = useState(false);
  const [fileName, setFileName] = useState<string | null>("No file chosen");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [dueDateModal, setdueDateModal] = useState(false);
  const [updatedId, setUpdatedId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [updatedAccId, setUpdatedAccId] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const type = useParams();
  const id = useParams();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
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
        {row.paymentStatus != 1 && (
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
        )}
        <Menu.Item
          onClick={() => {
            navigate(`/lms/loanmanagement/generateInvoice/${row?.invoiceId}`);
          }}
          icon={<EyeOutlined />}
        >
          View
        </Menu.Item>

        {/* {row.paymentStatus != 1 && (
          <Menu.Item
            onClick={() => {
              setSelectedInvoice(row);
              setShowModal(true);
            }}
            icon={<EditOutlined />}
          >
            Pay Manually
          </Menu.Item>
        )} */}
        {row.paymentStatus != 1 && (
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
  const handleCheckboxChange = (invoice: any, isChecked: boolean) => {
    setSelectedInvoices((prevSelected) => {
      if (isChecked) {
        return [...prevSelected, invoice];
      } else {
        return prevSelected.filter((item) => item.id !== invoice.id);
      }
    });
  };
  const handleSelectAllUnpaid = (isChecked: boolean) => {
    if (isChecked) {
      // Filter all unpaid invoices
      const unpaidInvoices = allinvoiceList
        .filter((invoice: any) => invoice.result.paymentStatus !== 1)
        .map((invoice: any) => invoice.result); // Extracting only the `result` field

      setSelectedInvoices(unpaidInvoices);
    } else {
      // Clear the selection
      setSelectedInvoices([]);
    }
  };

  const Customer_ALL_List_Header = [
    // {
    //   name: (
    //     <Checkbox
    //       className="ms-2"
    //       onChange={(e) => handleSelectAllUnpaid(e.target.checked)}
    //       indeterminate={
    //         selectedInvoices.length > 0 &&
    //         selectedInvoices.length <
    //         invoices.filter((invoice) => invoice.paymentStatus !== 1).length
    //       }
    //     />
    //   ),
    //   cell: (row: any) => (
    //     <div>
    //       <Checkbox
    //         checked={
    //           selectedInvoices.some((item) => item.id === row.id) ||
    //           selectedInvoices.some(
    //             (item) => item.invoiceNumber === row.invoiceNumber
    //           )
    //         }
    //         onChange={(e) => handleCheckboxChange(row, e.target.checked)}
    //         disabled={row.paymentStatus === 1}
    //       />
    //     </div>
    //   ),
    //   width: "50px",
    // },

    {
      name: "Loan Application Number",
      selector: (row: any) => row.applicationNo,
      width: "200px",
    },

    {
      name: "Customer Id",
      selector: (row: any) => row.customerId,
      width: "250px",
    },

    {
      name:"Invoice Number",
      selector: (row: any) => row.invoiceNumber,
      width: "150px",
    },
    {
      name: "Due Date",
      selector: (row: any) => new Date(row.dueDate).toLocaleDateString(),
      width: "200px",
    },
    {
      name: "Sub Total",
      selector: (row: any) => row.subTotalAmount, // Assuming totalAmount is the total
      cell: (row: any) => (
        <div className="d-flex">
          <span>
            <NumberFormatter value={row?.subTotalAmount} />
          </span>
        </div>
      ),
    },
    {
      name: "Profit",
      selector: (row: any) => row?.vat+row?.profit, // Assuming totalAmount is the total
      cell: (row: any) => (
        <div className="d-flex">
          <span>
            <NumberFormatter value={row?.vat+row?.profit} />
          </span>
        </div>
      ),
    },
    {
      name: "Total",
      selector: (row: any) => row.totalAmount, // Assuming totalAmount is the total
      cell: (row: any) => (
        <div className="d-flex">
          <span>
            <NumberFormatter value={row?.totalAmount} />
          </span>
        </div>
      ),
    },
  
   
    {
      name: "Payment Status",
      selector: (row: any) => row.paymentStatus,
      cell: (row: any) => {
        const getStatusConfig = (status: number) => {
          switch (status) {
            case PaymentStatus.Paid:
              return { label: "Paid", color: "#92bc82" }; // Green
            case PaymentStatus.UnPaid:
              return { label: "UnPaid", color: "#d86969" }; // Red
            case PaymentStatus.Discard:
              return { label: "Discard", color: "#ffa500" }; // Orange
            case PaymentStatus.Cancelled:
              return { label: "Cancelled", color: "#808080" }; // Gray
            default:
              return { label: "Unknown", color: "#808080" };
          }
        };

        const statusConfig = getStatusConfig(row.paymentStatus);

        return (
          <div
            style={{
              padding: "0.22rem 1rem",
              borderRadius: "12px",
              backgroundColor: statusConfig.color,
              color: "white",
              display: "inline-block",
            }}
          >
            {statusConfig.label}
          </div>
        );
      },
      width: "150px",
    },
    {
      name:"Transaction Date",
      selector: (row: any) => row.transactionDate  ? new Date(row.transactionDate).toLocaleDateString() : "-", 
      width: "150px",
    },
    {
      name: "Payable Status",
      selector: (row: any) => row.payableStatus, // Assuming payableStatus holds "Early Settlement" or "Due Loans"
      cell: (row: any) => (
        <div
          onClick={() => {
          }}
        >
          {row.payableStatus === 1
            ? "Early settlement"
            : row.payableStatus === 2
              ? "Due Loan"
              : row.payableStatus === 3
                ? "Over due"
                : row.payableStatus === 5
                  ? "Non performing"
                  : row.payableStatus === 4
                    ? " Write off"
                    : row.payableStatus === 6
                      ? "Broken promise"
                      : row.payableStatus === 7
                        ? "Pending"
                      : "Default"}
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

  const handleSubmit = async (values: any) => {
    try {
      const body = {
        fileToUpload: "test",
        payerName: values.payerName,
        accountNumber: values.accountNumber,
        applicationId: values.applicationID,
        invoiceNumber: [values.invoiceNumber],
        amount: values.totalAmount,
        receiptNumber: values.receiptNumber,
        dueDate: values.dueDate,
        repaymentTypes: values.repaymentTypes === "Promise" ? 1 : 0,
        repaymentStatus:
          values.RepaymentStatus === "Pending"
            ? 0
            : values.RepaymentStatus === "Approved"
              ? 1
              : 2,
        repaymentChannel:
          values.paymentMethod === "Cheque"
            ? 0
            : values.paymentMethod === "Credit Card"
              ? 1
              : values.paymentMethod === "Cash"
                ? 2
                : 0,

        chequeDto: {
          branchCode: values.branchCode,
          chequeNumber: values.chequeNo,
          bankAccNumber: values.bankAccNumber,
          bankName: values.bankName,
        },
        onlineTransactionDto: {
          bankName: values.bankName,
          bankAccNumber: values.bankAccNumber,
          transactionId: "string",
        },
        cashDto: {
          amount: values.totalAmount,
          receiptNumber: values.receiptNumber,
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
  const [loader, setLoader] = useState<boolean>(false);
  const individualCustomer = async () => {
    try {
      setSkelitonLoading(true);
      const res = await getAllInvoiceList(id?.id, type.type);
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

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData =
    allinvoiceList &&
    allinvoiceList.map((item: any) => {
      return {
        accountNumber: item.result?.accountNumber,
        applicationID: item.result?.applicationID,
        invoiceLogo: item?.invoiceLogo,
        invoiceNumber: item?.result?.invoiceNumber,
        applicationNo: item?.result?.applicationNo,
        IqamaId: item?.result?.iqamaId || "-",
        customerId: item?.result?.customerId || "-",
        from: item?.from,
        billingTo: item?.result?.billingTo || "-",
        shipTo: item?.shipTo,
        vat: item?.result?.vat,
        profit: item?.result?.profit,
        dueDate: formatDate(item?.result?.dueDate),
        invoiceDate: formatDate(item?.result?.invoiceDate),
        poNumber: item?.poNumber,
        subTotalAmount: item?.result?.subTotalAmount.toFixed(2),
        totalAmount: item?.result?.totalAmount.toFixed(2),
        tax: item?.result?.tax,
        shipping: item?.shipping,
        discount: item?.discount,
        notes: item?.notes,
        terms: item?.terms,
        payableStatus: item?.result?.payableStatus,
        paymentTerms: item?.result?.paymentTerms,
        paymentStatus: item?.result?.paymentStatus,
        transactionDate: item?.result?.transactionDetails?.created,
        id: item?.result?.id,
        created: item?.result?.created,
        accountId: item?.result?.accountId,
        penaltyAmount: item?.result?.penaltyAmount,
        totalAmountWithPenalty: item?.result?.totalAmountWithPenalty,
        invoiceId:
          item?.result?.invoiceDiscriptions?.invoiceID || item?.result?.id,
        isEarlySettlement: item?.result?.isEarlySettlement || false,
      };
    });

  // Split data into regular invoices and early settlement invoices
  const regularInvoices = mappedData?.filter((invoice: any) => !invoice.isEarlySettlement) || [];
  const earlySettlementInvoices = mappedData?.filter((invoice: any) => invoice.isEarlySettlement) || [];

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

  const validationSchema = Yup.object({
    paymentMethod: Yup.string().required("Payment Method is required."),
    payerName: Yup.string().required("Payer Name is required."),
    chequeNo: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque") {
          return schema
            .required("Cheque Number is required.")
            .matches(/^[0-9]+$/, "Cheque Number must be numeric.");
        }
        return schema.notRequired();
      }
    ),

    branchCode: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque") {
          return schema.required("Branch Code is required.");
        }
        return schema.notRequired();
      }
    ),

    receiptNumber: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cash") {
          return schema.required("Receipt Number is required.");
        }
        return schema.notRequired();
      }
    ),

    bankName: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque" || paymentMethod === "Credit Card") {
          return schema.required("Bank Name is required.");
        }
        return schema.notRequired();
      }
    ),

    bankAccNumber: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque" || paymentMethod === "Credit Card") {
          return schema.required("Bank Account Number is required.");
        }
        return schema.notRequired();
      }
    ),
  });

  const handleChangeInvoice = () => {
    getInvoiceDynamic();
  };
  const getInvoiceDynamic = async () => {
    setLoader(true);
    try {
      const body = {
        applicationId: id.id || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        invoiceInfo: selectedInvoices.map((invoice) => ({
          invoiceNumber: invoice.invoiceNumber || "",
          promiseNumber: invoice.promiseNumber || "",
          amount: invoice.amount || 0,
          accountNumber: invoice.accountNumber || "",
          payerName: invoice.payerName || "",
          fileToUpload: invoice.fileToUpload || "",
          repaymentTypes: invoice.repaymentTypes || 0,
          repaymentStatus: 0,
          repaymentChannel: invoice.repaymentChannel || 0,
        })),
      };
      const response = await getDynamicInvoiceCreation(body);

      if (response?.data?.notificationMessage == "Operation successful.") {
        const data = response?.data?.data || [];
        dispatch(setPayInvoices(data || []));
        navigate("/lms/LoanManagement/payinvoice");
        setLoader(false);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  return (
    <>
      {loader && <Loader />}
      <div>
        <div className="col-11 mb-4 ">
          <h3>Loan Invoices</h3>
        </div>

        <div className="col-12 d-flex justify-content-end">
          {selectedInvoices.length > 0 ? (
            <Button
              className="application-btn"
              style={{
                color: "#ffffff",

                padding: "9px",
                borderRadius: "8px",
                border: "transparent",
              }}
              onClick={handleChangeInvoice}
            >
              Pay Invoices
            </Button>
          ) : (
            ""
          )}
        </div>

        <Tabs
          id="invoices-tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "loanInvoices")}
          className="mt-3"
        >
          <Tab eventKey="loanInvoices" title="Loan Invoices">
            <div className="cs-table p-2">
              <TableView
                setPage={setPage}
                setPageSize={setPageSize}
                page={page}
                pageSize={pageSize}
                totalRows={regularInvoices?.length || 0}
                header={Customer_ALL_List_Header}
                data={regularInvoices}
                isLoading={skelitonLoading}
              />
              {regularInvoices?.length == 0 && allinvoiceList?.length > 0 && (
                <div
                  className="d-flex justify-content-center mt-5"
                  style={{ color: "red" }}
                >
                  No data found
                </div>
              )}
              {allinvoiceList?.length == 0 && (
                <div
                  className="d-flex justify-content-center mt-5"
                  style={{ color: "red" }}
                >
                  No data found
                </div>
              )}
            </div>
          </Tab>
          <Tab eventKey="earlySettlement" title="Early Settlement Invoices">
            {/* <div className="col-11 mb-4 mt-3">
              <h3>Early Settlement Invoices</h3>
            </div> */}
            <div className="cs-table p-2">
              <TableView
                setPage={setEarlySettlementPage}
                setPageSize={setEarlySettlementPageSize}
                page={earlySettlementPage}
                pageSize={earlySettlementPageSize}
                totalRows={earlySettlementInvoices?.length || 0}
                header={Customer_ALL_List_Header}
                data={earlySettlementInvoices}
                isLoading={skelitonLoading}
              />
              {earlySettlementInvoices?.length == 0 && (
                <div
                  className="d-flex justify-content-center mt-5"
                  style={{ color: "red" }}
                >
                  No data found
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
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
              paymentMethod: "Cash",
              bankAccNumber: "",
              chequeNo: "",
              branchCode: "",
              bankName: "",
              receiptNumber: "",
              payerName: "",
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
              id: selectedInvoice?.id,
              created: selectedInvoice?.created,
            }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {({ setFieldValue, values }) => (
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
                <Row>
                  {" "}
                  <Col className="mb-3">
                    <label
                      htmlFor="paymentMethod"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Payment Method <span className="text-danger">*</span>
                    </label>
                    <Field
                      as="select"
                      name="paymentMethod"
                      className="form-control"
                    >
                      <option label="Select Payment Method" value="" />
                      <option value="Cheque">Cheque</option>
                      <option value="Credit Card">Online</option>
                      <option selected value="Cash">Cash</option>
                    </Field>
                    <ErrorMessage
                      name="paymentMethod"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </Col>
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
                </Row>
                {values.paymentMethod === "Cheque" && (
                  <>
                    <Row className="mb-3">
                      <Col>
                        <label
                          htmlFor="chequeNo"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Cheque Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="chequeNo"
                          className="form-control"
                          placeholder="Cheque Num..."
                        />
                        <ErrorMessage
                          name="chequeNo"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                      <Col>
                        <label
                          htmlFor="branchCode"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Branch Code <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="branchCode"
                          className="form-control"
                          placeholder="Branch Code"
                        />
                        <ErrorMessage
                          name="branchCode"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col>
                        <label
                          htmlFor="bankName"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Bank Name <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankName"
                          className="form-control"
                          placeholder="Bank Name"
                        />
                        <ErrorMessage
                          name="bankName"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                      <Col>
                        <label
                          htmlFor="bankName"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Bank Acc Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankAccNumber"
                          className="form-control"
                          placeholder="Bank Account Number"
                        />
                        <ErrorMessage
                          name="bankAccNumber"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                    </Row>
                  </>
                )}

                <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="payerName"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Payer Name <span className=" text-danger">*</span>
                    </label>
                    <Field
                      as="input"
                      name="payerName"
                      className="form-control"
                      placeholder="Payer Name"
                    />
                    <ErrorMessage
                      name="payerName"
                      component="div"
                      className="invalid-feedback text-danger"
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
                  {/* {values.paymentMethod !== "Cash" && (
                    <>
                  
                    </>
                  )} */}
                </Row>
                {values.paymentMethod === "Credit Card" && (
                  <>
                    <Row className="mb-3">
                      <Col>
                        <label
                          htmlFor="bankName"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Bank Name <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankName"
                          className="form-control"
                          placeholder="Bank Name"
                        />
                        <ErrorMessage
                          name="bankName"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                      <Col>
                        <label
                          htmlFor="bankName"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Bank Acc Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankAccNumber"
                          className="form-control"
                          placeholder="Bank Account Number"
                        />
                        <ErrorMessage
                          name="bankAccNumber"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                    </Row>
                  </>
                )}

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

                {values.paymentMethod === "Cash" && (
                  <>
                    <Row className="mb-3">
                      {" "}
                      <Col md={6}>
                        <label
                          htmlFor="receiptNumber"
                          className="mb-2 "
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Receipt Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="receiptNumber"
                          className="form-control"
                          placeholder="Receipt Number"
                        />
                        <ErrorMessage
                          name="receiptNumber"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                    </Row>{" "}
                  </>
                )}
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
                            border: "1px solid #d3d3d3",
                            borderRadius: "5px",
                            cursor: "pointer",
                            width: "220px",
                            textAlign: "center",
                            color: "#555",
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
                            backgroundColor: "#a3a3a3",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            color: "#fff",
                          }}
                        >
                          <span>{fileName}</span>
                          <span
                            onClick={handleRemoveFile}
                            style={{
                              marginLeft: "10px",
                              cursor: "pointer",
                              color: "#fff",
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
                      borderRadius: "5px",
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
                style={{ fontSize: "14px", fontWeight: 500 }}
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
                      borderRadius: "5px",
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

export default Invoices;
