import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, Input, Menu, Button, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllRealations,
  getDynamicInvoiceCreation,
  repayManually,
  updateLoanInvoiceDueDate,
  waiveAmount,
  executeWriteOff,
} from "../../redux/apis/apisCrudLms";
import {
  getApplicationInstallments,
  getWaiverRequestsByApplication,
  approveWaiverByInvoice,
  rejectWaiverByInvoice,
} from "../../redux/apis/apisLendingService";
import toast from "react-hot-toast";
import { Modal, Row, Col, ModalHeader, ModalBody, Tab, Tabs } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { DownOutlined, EditOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Loader from "../Loader/Loader";
import * as Yup from "yup";
import { NumberFormatter } from "../../App";
import { useDispatch } from "react-redux";
import { setPayInvoices } from "../../redux/apis/apisSlice";

// Payment status strings from lending-service
const PAYMENT_STATUS = {
  SCHEDULED: "SCHEDULED",
  DUE: "DUE",
  GRACE_PERIOD: "GRACE_PERIOD",
  OVERDUE: "OVERDUE",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  WAIVED: "WAIVED",
  DEFERRED: "DEFERRED",
  WRITTEN_OFF: "WRITTEN_OFF",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
} as const;

const Invoices = () => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
  const [waiverData, setWaiverData] = useState<any[]>([]);
  const [waiverLoading, setWaiverLoading] = useState(false);
  const [waiverPage, setWaiverPage] = useState(1);
  const [waiverPageSize, setWaiverPageSize] = useState(15);
  const [waiverModalType, setWaiverModalType] = useState<"approve" | "reject" | null>(null);
  const [selectedWaiver, setSelectedWaiver] = useState<any>(null);
  const [waiverReason, setWaiverReason] = useState("");
  const [waiverAmount, setWaiverAmount] = useState("");
  const [waiverActionLoading, setWaiverActionLoading] = useState(false);
  const [waiverErrors, setWaiverErrors] = useState<Record<string, string>>({});
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
        {row.paymentStatus !== PAYMENT_STATUS.PAID && (
          <Menu.Item
            key="editName"
            icon={<EditOutlined />}
            onClick={() => {
              setdueDateModal(true);
              setUpdatedDate(row.dueDate);
              setUpdatedAccId(row.accountId);
              setUpdatedId(row.invoiceId);
              setInvoiceNo(row.invoiceId);
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

        {row.isEligibleForWriteOff && (
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
        .filter((invoice: any) => invoice.paymentStatus !== PAYMENT_STATUS.PAID);

      setSelectedInvoices(unpaidInvoices);
    } else {
      // Clear the selection
      setSelectedInvoices([]);
    }
  };

  const paymentStatusCell = (row: any) => {
    const map: Record<string, { label: string; color: string }> = {
      PAID: { label: "Paid", color: "var(--color-success)" },
      PARTIALLY_PAID: { label: "Partially Paid", color: "var(--color-success)" },
      SCHEDULED: { label: "Scheduled", color: "var(--color-disabled)" },
      DUE: { label: "Due", color: "var(--color-warning)" },
      GRACE_PERIOD: { label: "Grace Period", color: "var(--color-warning)" },
      OVERDUE: { label: "Overdue", color: "var(--destructive)" },
      WAIVED: { label: "Waived", color: "var(--color-disabled)" },
      DEFERRED: { label: "Deferred", color: "var(--color-warning)" },
      WRITTEN_OFF: { label: "Written Off", color: "var(--destructive)" },
      PENDING: { label: "Pending", color: "var(--color-warning)" },
      CANCELLED: { label: "Cancelled", color: "var(--color-disabled)" },
    };
    const cfg = map[row.paymentStatus] ?? { label: row.paymentStatus || "Unknown", color: "var(--color-disabled)" };
    return (
      <div style={{ padding: "0.22rem 1rem", borderRadius: "12px", backgroundColor: cfg.color, color: "var(--primary-foreground)", display: "inline-block" }}>
        {cfg.label}
      </div>
    );
  };

  const Customer_ALL_List_Header = [
    { name: "Invoice ID", selector: (row: any) => row.invoiceId, width: "200px" },
    { name: "Installment #", selector: (row: any) => row.installmentNumber, width: "120px" },
    { name: "Due Date", selector: (row: any) => row.dueDate || "-", width: "130px" },
    {
      name: "Installment Amount",
      selector: (row: any) => row.installmentAmount,
      cell: (row: any) => <NumberFormatter value={row?.installmentAmount} />,
      width: "160px",
    },
    {
      name: "Fee Amount",
      selector: (row: any) => row.feeAmount,
      cell: (row: any) =>
        row.feeAmount != null ? (
          <NumberFormatter value={row.feeAmount} />
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>-</span>
        ),
      width: "130px",
    },
      {
      name: "Profit Amount",
      selector: (row: any) => row.profit,
      cell: (row: any) =>
        row.profit != null ? (
          <NumberFormatter value={row.profit} />
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>-</span>
        ),
      width: "130px",
    },
    // {
    //   name: "Principal",
    //   selector: (row: any) => row.principalComponent,
    //   cell: (row: any) => <NumberFormatter value={row?.principalComponent} />,
    //   width: "130px",
    // },
    // {
    //   name: "Profit",
    //   selector: (row: any) => row.profitComponent,
    //   cell: (row: any) => <NumberFormatter value={row?.profitComponent} />,
    //   width: "110px",
    // },
    // {
    //   name: "Outstanding Balance",
    //   selector: (row: any) => row.outstandingBalance,
    //   cell: (row: any) => <NumberFormatter value={row?.outstandingBalance} />,
    //   width: "170px",
    // },
    {
      name: "Payment Status",
      selector: (row: any) => row.paymentStatus,
      cell: paymentStatusCell,
      width: "150px",
    },
    // {
    //   name: "Delinquency Status",
    //   selector: (row: any) => row.delinquencyStatus || "-",
    //   width: "160px",
    // },
    {
      name: "DPD",
      selector: (row: any) => row.dpd ?? "-",
      width: "80px",
    },
    {
      name: "Late Penalty",
      selector: (row: any) => row.latePenaltyAmount,
      cell: (row: any) => <NumberFormatter value={row?.latePenaltyAmount ?? 0} />,
      width: "130px",
    },
    {
      name: "Waived Penalty",
      selector: (row: any) => row.waivedPenaltyAmount,
      cell: (row: any) =>
        row.waivedPenaltyAmount != null ? (
          <NumberFormatter value={row.waivedPenaltyAmount} />
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>-</span>
        ),
      omit: !allinvoiceList?.some((item: any) => item?.delinquency?.waivedPenaltyAmount != null || item?.waivedPenaltyAmount != null),
      width: "140px",
    },
    {
      name: "Total Penalty",
      selector: (row: any) => row.remainingPenaltyAmount,
      cell: (row: any) =>
        row.remainingPenaltyAmount != null ? (
          <NumberFormatter value={row.remainingPenaltyAmount} />
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>-</span>
        ),
      omit: !allinvoiceList?.some((item: any) => item?.delinquency?.remainingPenaltyAmount != null || item?.remainingPenaltyAmount != null),
      width: "160px",
    },
    {
      name: "Total Amount",
      selector: (row: any) => row.outstandingBalance,
      cell: (row: any) => <NumberFormatter value={row?.outstandingBalance ?? 0} />,
      width: "170px",
    },
    { name: "Paid Date", selector: (row: any) => row.paidDate ? new Date(row.paidDate).toLocaleDateString() : "-", width: "120px" },
    {
      name: "Paid Amount",
      selector: (row: any) => row.paidAmount,
      cell: (row: any) => row.paidAmount != null ? <NumberFormatter value={row?.paidAmount} /> : <span>-</span>,
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button className="gradient-btn" type="primary" style={{ borderColor: "var(--background)", borderRadius: "8px", padding: "10px 20px" }}>
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const EarlySettlement_List_Header = [
    { name: "Invoice ID", selector: (row: any) => row.invoiceId, width: "200px" },
    { name: "Installment #", selector: (row: any) => row.installmentNumber, width: "120px" },
    { name: "Due Date", selector: (row: any) => row.dueDate || "-", width: "130px" },
    {
      name: "Installment Amount",
      selector: (row: any) => row.installmentAmount,
      cell: (row: any) => <NumberFormatter value={row?.installmentAmount} />,
      width: "160px",
    },
    // {
    //   name: "Outstanding Balance",
    //   selector: (row: any) => row.outstandingBalance,
    //   cell: (row: any) => <NumberFormatter value={row?.outstandingBalance} />,
    //   width: "170px",
    // },
    {
      name: "Payment Status",
      selector: (row: any) => row.paymentStatus,
      cell: paymentStatusCell,
      width: "150px",
    },
    // {
    //   name: "Delinquency Status",
    //   selector: (row: any) => row.delinquencyStatus || "-",
    //   width: "160px",
    // },
    {
      name: "ES Discount Amount",
      selector: (row: any) => row.esDiscountAmount,
      cell: (row: any) => row.esDiscountAmount != null ? <NumberFormatter value={row.esDiscountAmount} /> : <span>-</span>,
      width: "170px",
    },
    {
      name: "ES Discount %",
      selector: (row: any) => row.esDiscountPercentage,
      cell: (row: any) => row.esDiscountPercentage != null ? <span>{row.esDiscountPercentage}%</span> : <span>-</span>,
      width: "130px",
    },
    {
      name: "Valid Until Day",
      selector: (row: any) => row.esValidUntilDay ?? "-",
      width: "130px",
    },
    {
      name: "Total After Discount",
      selector: (row: any) => row.esTotalAfterDiscount,
      cell: (row: any) =>
        row.esTotalAfterDiscount != null
          ? <NumberFormatter value={row.esTotalAfterDiscount} />
          : <span>-</span>,
      width: "170px",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button className="gradient-btn" type="primary" style={{ borderColor: "var(--background)", borderRadius: "8px", padding: "10px 20px" }}>
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
        loanId: id?.id || "",
        invoiceId: lateFeeData?.invoiceId || lateFeeData?.id,
        reason: "Penalty Write-off Request",
        triggerType: "MANUAL",
        override: true
      };

      const response = await executeWriteOff(body);
      if (
        response?.status === 200 ||
        response?.data?.notificationMessage === "Request initiated for the operation" ||
        response?.data?.message === "success"
      ) {
        toast.success(response?.data?.notificationMessage || "Operation successful");
        setLoader(false);
        setWaveLateDialog(false);
        individualCustomer(); // refresh list
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response?.data?.errors?.[0] ||
          "Failed"
        );
        setWaveLateDialog(false);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      setWaveLateDialog(false);
      // Handle error case
      toast.error(error?.response?.data?.message || "Failed to submit write-off. Please try again.");
    }
  };
  const [loader, setLoader] = useState<boolean>(false);
  const individualCustomer = async () => {
    try {
      setSkelitonLoading(true);
      const applicationId = id?.id;
      if (!applicationId) return;
      const res = await getApplicationInstallments(applicationId);
      const list = res?.data?.data || res?.data || [];
      const dataArray = Array.isArray(list) ? list : [];
      setAllinvoiceList(dataArray);
      setTotalRows(dataArray.length);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch installments");
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


  const mapInvoice = (item: any) => ({
    invoiceId: item?.invoiceId || "-",
    installmentNumber: item?.installmentNumber ?? "-",
    dueDate: item?.dueDate || "-",
    installmentAmount: item?.installmentAmount ?? 0,
    principalComponent: item?.principalComponent ?? 0,
    profitComponent: item?.profitComponent ?? 0,
    outstandingBalance: item?.payableAmount ,
    paymentStatus: item?.paymentStatus || "PENDING",
    paidDate: item?.paidDate,
    paidAmount: item?.paidAmount,
    receiptAvailable: item?.receiptAvailable ?? false,
    accountId: item?.accountId,
    id: item?.invoiceId,
    feeAmount: item?.feeComponent ?? 0,
profit:item?.profitComponent ?? 0,
    // delinquency fields
    delinquencyStatus: item?.delinquency?.status ?? "-",
    dpd: item?.delinquency?.dpd ?? 0,
    latePenaltyAmount: item?.delinquency?.latePenaltyAmount ?? 0,
    delinquencyOutstanding: item?.delinquency?.outstandingAmount ?? 0,
    // early settlement fields
    esDiscountAmount: item?.delinquency?.earlySettlementDiscountAmount ?? null,
    esDiscountPercentage: item?.delinquency?.earlySettlementDiscountPercentage ?? null,
    esValidUntilDay: item?.delinquency?.earlySettlementValidUntilDay ?? null,
    esTotalAfterDiscount: (() => {
      const total = item?.delinquency?.totalAmount ?? item?.installmentAmount ?? 0;
      const discAmt = item?.delinquency?.earlySettlementDiscountAmount;
      const discPct = item?.delinquency?.earlySettlementDiscountPercentage;
      if (discAmt != null) return total - discAmt;
      if (discPct != null) return total - (total * discPct) / 100;
      return null;
    })(),
    isEligibleForWriteOff: item?.delinquency?.isEligibleForWriteOff ?? false,
    waivedPenaltyAmount: item?.delinquency?.waivedPenaltyAmount ,
    remainingPenaltyAmount: item?.delinquency?.remainingPenaltyAmount,
  });

  const fetchWaiverData = async () => {
    const applicationId = id?.id;
    if (!applicationId) return;
    try {
      setWaiverLoading(true);
      const res = await getWaiverRequestsByApplication(applicationId);
      const list = res?.data?.data || res?.data || [];
      setWaiverData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch waiver requests");
    } finally {
      setWaiverLoading(false);
    }
  };

  const openWaiverModal = (type: "approve" | "reject", row: any) => {
    setSelectedWaiver(row);
    setWaiverModalType(type);
    setWaiverReason("");
    setWaiverAmount("");
    setWaiverErrors({});
  };

  const closeWaiverModal = () => {
    setWaiverModalType(null);
    setSelectedWaiver(null);
    setWaiverReason("");
    setWaiverAmount("");
    setWaiverErrors({});
  };

  const validateWaiver = (): boolean => {
    const e: Record<string, string> = {};
    if (!waiverReason.trim()) e.reason = "Reason is required";
    if (waiverModalType === "approve") {
      if (!waiverAmount) {
        e.amount = "Amount is required";
      } else {
        const amt = parseFloat(waiverAmount);
        if (isNaN(amt) || amt <= 0) {
          e.amount = "Enter a valid amount";
        } else if (amt > parseFloat(selectedWaiver?.requestedAmount)) {
          e.amount = `Cannot exceed requested amount`;
        }
      }
    }
    setWaiverErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleWaiverSubmit = async () => {
    if (!validateWaiver() || !selectedWaiver) return;
    try {
      setWaiverActionLoading(true);
      if (waiverModalType === "approve") {
        await approveWaiverByInvoice(selectedWaiver.invoiceId, {
          reason: waiverReason.trim(),
          amount: parseFloat(waiverAmount),
        });
        toast.success("Waiver request approved successfully");
      } else {
        await rejectWaiverByInvoice(selectedWaiver.invoiceId, {
          reason: waiverReason.trim(),
        });
        toast.success("Waiver request rejected");
      }
      closeWaiverModal();
      fetchWaiverData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || `Failed to ${waiverModalType} waiver request`);
    } finally {
      setWaiverActionLoading(false);
    }
  };

  const waiverActionMenu = (row: any) => (
    <Menu
      onClick={({ key }) => {
        if (key === "approve") openWaiverModal("approve", row);
        if (key === "reject") openWaiverModal("reject", row);
      }}
    >
      <Menu.Item key="approve" icon={<CheckCircleOutlined />}>Approve</Menu.Item>
      <Menu.Item key="reject" icon={<CloseCircleOutlined />} danger>Reject</Menu.Item>
    </Menu>
  );

  const filteredWaiverData = useMemo(() => {
    if (!debouncedSearch) return waiverData;
    return waiverData.filter((row: any) => {
      return (
        String(row.invoiceId || "").toLowerCase().includes(debouncedSearch) ||
        String(row.status || "").toLowerCase().includes(debouncedSearch) ||
        String(row.reason || "").toLowerCase().includes(debouncedSearch) ||
        String(row.rejectionReason || "").toLowerCase().includes(debouncedSearch) ||
        String(row.requestedAmount ?? "").toLowerCase().includes(debouncedSearch)
      );
    });
  }, [waiverData, debouncedSearch]);

  const waiverTotal = filteredWaiverData.length;
  const waiverStart = (waiverPage - 1) * waiverPageSize;
  const paginatedWaiverData = filteredWaiverData.slice(waiverStart, waiverStart + waiverPageSize);
  const waiverTotalPage = Math.max(1, Math.ceil(waiverTotal / waiverPageSize));

  const WaiverStatusPill = ({ status }: { status?: string }) => {
    if (!status) return <span>-</span>;
    const bg =
      status === "APPROVED" ? "var(--color-status-green)" :
      status === "REJECTED" ? "var(--color-status-coral)" :
      status === "PENDING" ? "var(--color-status-amber)" : "var(--muted)";
    return (
      <span style={{ padding: "4px 12px", borderRadius: 32, fontSize: 12, fontWeight: 600, backgroundColor: bg, color: "var(--primary-foreground)", whiteSpace: "nowrap" }}>
        {status}
      </span>
    );
  };

  const formatWaiverCurrency = (value?: number | null) =>
    value != null ? `SAR ${parseFloat(String(value)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-";

  const formatWaiverDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : "-";

  const WaiverColumns = [
    { name: "#", cell: (_row: any, index: number) => waiverStart + index + 1, width: "60px" },
    { name: "Invoice ID", selector: (row: any) => row.invoiceId || "-", width: "180px" },
    { name: "Requested Amount", selector: (row: any) => formatWaiverCurrency(row.requestedAmount), width: "170px" },
    {
      name: "Reason",
      cell: (row: any) => (
        <span title={row.reason || ""} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden", fontSize: 12 }}>
          {row.reason || "-"}
        </span>
      ),
      width: "200px",
    },
    { name: "Status", cell: (row: any) => <WaiverStatusPill status={row.status} />, width: "120px" },
    {
      name: "Rejection Reason",
      cell: (row: any) => (
        <span title={row.rejectionReason || ""} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden", fontSize: 12, color: row.rejectionReason ? "var(--color-status-coral)" : "var(--muted-foreground)" }}>
          {row.rejectionReason || "-"}
        </span>
      ),
      width: "180px",
    },
    { name: "Requested At", selector: (row: any) => formatWaiverDateTime(row.requestedAt), width: "170px" },
    { name: "Processed At", selector: (row: any) => formatWaiverDateTime(row.processedAt), width: "170px" },
    {
      name: "Action",
      cell: (row: any) => {
        if (row.status !== "PENDING") {
          return <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>;
        }
        return (
          <Dropdown overlay={waiverActionMenu(row)} trigger={["click"]}>
            <Button className="gradient-btn" type="primary" style={{ borderColor: "white", borderRadius: 8, padding: "10px 20px" }}>
              Select <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
      width: "140px",
    },
  ];

  const allMappedInvoices: any[] = allinvoiceList?.map(mapInvoice) || [];

  const allEarlySettlementInvoices: any[] = allinvoiceList
    ?.filter(
      (item: any) =>
        item?.delinquency?.earlySettlementEligible === true &&
        item?.paymentStatus !== PAYMENT_STATUS.DUE &&
        item?.paymentStatus !== PAYMENT_STATUS.OVERDUE
    )
    .map(mapInvoice) || [];

  // Debounce the search input
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchValue.trim().toLowerCase());
      setPage(1);
      setEarlySettlementPage(1);
      setWaiverPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchValue]);

  const matchesInvoice = (row: any) => {
    if (!debouncedSearch) return true;
    return (
      String(row.invoiceId || "").toLowerCase().includes(debouncedSearch) ||
      String(row.installmentNumber ?? "").toLowerCase().includes(debouncedSearch) ||
      String(row.dueDate || "").toLowerCase().includes(debouncedSearch) ||
      String(row.paymentStatus || "").toLowerCase().includes(debouncedSearch) ||
      String(row.delinquencyStatus || "").toLowerCase().includes(debouncedSearch)
    );
  };

  const filteredRegularInvoices = useMemo(
    () => allMappedInvoices.filter(matchesInvoice),
    [allMappedInvoices, debouncedSearch]
  );
  const filteredEarlySettlementInvoices = useMemo(
    () => allEarlySettlementInvoices.filter(matchesInvoice),
    [allEarlySettlementInvoices, debouncedSearch]
  );

  const regularInvoicesTotal = filteredRegularInvoices.length;
  const regularInvoicesTotalPage = Math.max(
    1,
    Math.ceil(regularInvoicesTotal / pageSize)
  );
  const regularInvoices = filteredRegularInvoices.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const earlySettlementTotal = filteredEarlySettlementInvoices.length;
  const earlySettlementTotalPage = Math.max(
    1,
    Math.ceil(earlySettlementTotal / earlySettlementPageSize)
  );
  const earlySettlementInvoices = filteredEarlySettlementInvoices.slice(
    (earlySettlementPage - 1) * earlySettlementPageSize,
    earlySettlementPage * earlySettlementPageSize
  );

  useEffect(() => {
    // handleAllReason();
    individualCustomer();
    return () => { };
  }, [page, pageSize]);

  useEffect(() => {
    if (activeTab === "waiverRequests") fetchWaiverData();
  }, [activeTab]);

  const handleUpdateDueDate = async () => {
    try {
      // setIsLoading(true);
      setLoader(true);
      const response = await updateLoanInvoiceDueDate(
        updatedId,
        updatedAccId,
        updatedDate
      );
      if (response) {
        toast.success(
          response?.data?.message
        );
        setLoader(false);
        setdueDateModal(false);
        individualCustomer()
        setUpdatedId("");
        setUpdatedDate("");
        setUpdatedAccId("");
      }
    } catch (error: any) {
      // toast.error(error?.message);
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
      <div className="service invoices-page">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Loan Invoices</h3>
        </div>

        {/* Filters card */}
        <div
          className="bg-white p-3 mb-3"
          style={{
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="d-flex flex-wrap align-items-center gap-2 w-100">
            <Input
              allowClear
              placeholder="Search by invoice ID, installment, status, due date"
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={searchValue}
              onChange={(e: any) => setSearchValue(e.target.value)}
              style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
            />
            {selectedInvoices.length > 0 && (
              <Button
                className="application-btn"
                style={{
                  color: "var(--primary-foreground)",
                  padding: "9px",
                  borderRadius: 8,
                  border: "transparent",
                  height: 40,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
                onClick={handleChangeInvoice}
              >
                Pay Invoices
              </Button>
            )}
          </div>
        </div>

        {/* Tabs + Table card */}
        <div
          className="bg-white"
          style={{
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <Tabs
            id="invoices-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "loanInvoices")}
            className="px-3 pt-3"
          >
          <Tab eventKey="loanInvoices" title="Loan Invoices">
            <div className="cs-table p-2">
              <TableView
                setPage={setPage}
                setPageSize={setPageSize}
                page={page}
                pageSize={pageSize}
                totalRows={regularInvoicesTotal}
                totalPage={regularInvoicesTotalPage}
                from={regularInvoicesTotal > 0 ? (page - 1) * pageSize + 1 : 0}
                to={Math.min(page * pageSize, regularInvoicesTotal)}
                header={Customer_ALL_List_Header}
                data={regularInvoices}
                isLoading={skelitonLoading}
                paginationShow={true}
              />
              {!skelitonLoading && regularInvoicesTotal === 0 && (
                <div
                  className="d-flex justify-content-center mt-5"
                  style={{ color: "var(--destructive)" }}
                >
                  No data found
                </div>
              )}
            </div>
          </Tab>
          <Tab eventKey="earlySettlement" title="Early Settlement Invoices">
            <div className="cs-table p-2">
              <TableView
                setPage={setEarlySettlementPage}
                setPageSize={setEarlySettlementPageSize}
                page={earlySettlementPage}
                pageSize={earlySettlementPageSize}
                totalRows={earlySettlementTotal}
                totalPage={earlySettlementTotalPage}
                from={
                  earlySettlementTotal > 0
                    ? (earlySettlementPage - 1) * earlySettlementPageSize + 1
                    : 0
                }
                to={Math.min(
                  earlySettlementPage * earlySettlementPageSize,
                  earlySettlementTotal
                )}
                header={EarlySettlement_List_Header}
                data={earlySettlementInvoices}
                isLoading={skelitonLoading}
                paginationShow={true}
              />
              {!skelitonLoading && earlySettlementTotal === 0 && (
                <div
                  className="d-flex justify-content-center mt-5"
                  style={{ color: "var(--destructive)" }}
                >
                  No data found
                </div>
              )}
            </div>
          </Tab>
          <Tab eventKey="waiverRequests" title="Waive Off Requests">
            <div className="cs-table p-2">
              <TableView
                setPage={setWaiverPage}
                setPageSize={setWaiverPageSize}
                page={waiverPage}
                pageSize={waiverPageSize}
                totalRows={waiverTotal}
                totalPage={waiverTotalPage}
                from={waiverTotal > 0 ? waiverStart + 1 : 0}
                to={Math.min(waiverStart + waiverPageSize, waiverTotal)}
                header={WaiverColumns}
                data={paginatedWaiverData}
                isLoading={waiverLoading}
                paginationShow={true}
              />
              {!waiverLoading && waiverTotal === 0 && (
                <div className="d-flex justify-content-center mt-5" style={{ color: "var(--destructive)" }}>
                  No waiver requests found
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
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
                            border: "1px solid var(--border)",
                            borderRadius: "5px",
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
                            borderRadius: "5px",
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

      {/* Waive Off Approve / Reject Modal */}
      <Modal show={!!waiverModalType} onHide={closeWaiverModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16 }}>
            {waiverModalType === "approve" ? "Approve Waiver Request" : "Reject Waiver Request"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {waiverModalType === "approve" && (
              <Col md={12} className="mb-3">
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                  Waiver Amount (SAR) *
                </label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  className={`form-control${waiverErrors.amount ? " is-invalid" : ""}`}
                  placeholder={`Max: ${parseFloat(selectedWaiver?.requestedAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  value={waiverAmount}
                  onChange={(e) => {
                    const max = parseFloat(selectedWaiver?.requestedAmount || 0);
                    const val = e.target.value;
                    if (val !== "" && parseFloat(val) > max) return;
                    setWaiverAmount(val);
                    if (waiverErrors.amount) setWaiverErrors((p) => ({ ...p, amount: "" }));
                  }}
                />
                {waiverErrors.amount && <div className="invalid-feedback" style={{ display: "block" }}>{waiverErrors.amount}</div>}
                <small className="text-muted" style={{ fontSize: 11 }}>
                  Requested: {formatWaiverCurrency(selectedWaiver?.requestedAmount)} — cannot exceed this amount
                </small>
              </Col>
            )}
            <Col md={12} className="mb-1">
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                {waiverModalType === "approve" ? "Approval Reason *" : "Rejection Reason *"}
              </label>
              <textarea
                rows={3}
                className={`form-control${waiverErrors.reason ? " is-invalid" : ""}`}
                placeholder={waiverModalType === "approve" ? "Enter reason for approval..." : "Enter reason for rejection..."}
                value={waiverReason}
                onChange={(e) => {
                  setWaiverReason(e.target.value);
                  if (waiverErrors.reason) setWaiverErrors((p) => ({ ...p, reason: "" }));
                }}
              />
              {waiverErrors.reason && <div className="invalid-feedback" style={{ display: "block" }}>{waiverErrors.reason}</div>}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeWaiverModal} disabled={waiverActionLoading}>Cancel</Button>
          <Button
            className="gradient-btn"
            type="primary"
            loading={waiverActionLoading}
            onClick={handleWaiverSubmit}
            danger={waiverModalType === "reject"}
            style={{ borderColor: "white", borderRadius: 8, padding: "10px 20px" }}
          >
            {waiverModalType === "approve" ? "Approve" : "Reject"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Invoices;
