import { useState, useEffect } from "react";
import { Input, Button, Dropdown, Menu, Select, Steps, StepProps } from "antd";

import { FaSortAmountUp } from "react-icons/fa";
import TableView from "../../../components/TableView/TableView";
import BuisnessModal from "../../../components/Customers/Modals/BuisnessModal";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedPromiseApplication } from "../../../redux/apis/apisSlice";

import {
  ClockCircleOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  ApproveDisburseAmount,
  generateInvoices,
  modifyLoanStatus,
} from "../../../redux/apis/apisCrudLms";
import { getLoanApplications, approveManualApproval, rejectManualApproval } from "../../../redux/apis/apisLendingService";
import toast from "react-hot-toast";

import { Col, Form, Modal, Row, Tabs, Tab } from "react-bootstrap";

import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { Spin } from "antd";
import axios from "axios";
import { RiContractLeftFill, RiSecurePaymentLine } from "react-icons/ri";
import { MdSchedule } from "react-icons/md";
import { SaudiRiyal } from "lucide-react";

const getApproveStepIcon = (stepIndex: any, status: any) => {
  const iconMap: any = {
    0: <FileSearchOutlined />,
    1: <FileDoneOutlined />,
  };

  if (status === "process") return <Spin indicator={<LoadingOutlined />} />;
  if (status === "finish") return <CheckCircleOutlined style={{ color: "green" }} />;
  if (status === "error") return <CloseCircleOutlined style={{ color: "red" }} />;
  return iconMap[stepIndex]; // wait
};
const ApplicationManagement = () => {
  const [customerValue, setCustomerValue] = useState("individuals");
  const [buisnessForm, setBusinessForm] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [loader, setLoader] = useState(false);
  const [disberseDialog, setDisberseDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [disburseData, setDisburseData] = useState<any>();
  const [disburseAmount, setDisburseAmount] = useState<any>();
  const [applicationData, setApplicationData] = useState<any>();
  const [businessId, setBusinessId] = useState<any>();
  const [individualId, setIndividualId] = useState<any>();
  const [customer, setCustomer] = useState<any>();
  const [prodId, setProdId] = useState<any>();
  const [searchValue, setSearchValue] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectApplicable, setSelectApplicable] = useState<any>();
  const [initialRendor, setInitialRendor] = useState(false);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveStepStatus, setApproveStepStatus] = useState<StepProps[]>([
    { title: "Modify Loan Status", status: "wait" },
    { title: "Generate Invoices", status: "wait" },
  ]);
  const [activeTab, setActiveTab] = useState("AllApplication");
  const [manualModal, setManualModal] = useState(false);
  const [manualActionType, setManualActionType] = useState<"approve" | "reject" | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [manualNotes, setManualNotes] = useState("");
  const [manualRejectionReason, setManualRejectionReason] = useState("DBR_HIGH");
  const param = useParams();
  const [formValues, setFormValues] = useState<any>({
    accountNo: 0,
    company: "",
    branch: "",
    subUnit: "",
    productID: "",
    productName: "",
    kycId: "",
    kybId: "",
    isVariableRateLoan: false,
    loanAmount: 0,
    payableStatus: 0,
    interestRate: 0,
    duration: 0,
    tenureType: "1",
    tenureDuration: 0,
    bankName: "",
    receiptNumber: "",
    amountCash: 0,
    transactionId: "",
    bankAccNumber: "",
    branchCode: "",
    chequeNumber: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_REACT_APP_API_BASE_LMS_URL;
  async function GetApplicationByAccountNumber(accountNumber: string | number) {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Application/GetApplicationByAccountNumber/${accountNumber}`,
        {
          headers: {
            'accept': 'text/plain',
            'Request-Id': 'f1052f4d-b2a3-4038-8340-cdc06e89ffaf',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching application by account number:', error);
      // Optional: throw error to be handled by the caller
      throw error;
    }
  }
  const handleInputChange = (event: any, groupName?: string) => {
    const { name, value } = event.target;

    setEditFormData((prevData: any) => ({
      ...prevData,
      ...(groupName
        ? {
          [groupName]: {
            ...prevData[groupName],
            [name]: value,
          },
        }
        : { [name]: value }),
    }));
  };

  const handleApprove = async (id: any, status: boolean) => {
    setIsModalVisible(true);
    setApproveStepStatus([
      { title: "Modify Loan Status", status: "process" },
      { title: "Generate Invoices", status: "wait" },
    ]);
    setLoader(true);

    try {
      const res = await modifyLoanStatus(id, "test", status);
      if (res.data.notificationMessage === "Operation successful.") {
        const updated = [...approveStepStatus];
        updated[0].status = "finish";
        updated[1].status = "process";
        setApproveStepStatus(updated);

        if (res?.data?.data?.loanStatus === "LoanApproved") {
          const invoiceRes = await generateInvoices(id, "test", status);
          if (invoiceRes.data.notificationMessage === "Operation successful.") {
            setApproveStepStatus((prev) => {
              const updated = [...prev];
              updated[1].status = "finish";
              return updated;
            });

            // Show success after delay
            setTimeout(() => {
              toast.success("Loan has been Approved and Invoices are Generated");
              setIsModalVisible(false);
              localStorage.setItem("tabs", "DueLoan");
              getAll();
            }, 1000);
          } else {
            throw new Error("Invoice generation failed");
          }
        }
      } else {
        throw new Error(res.data.errors?.[0] || "Modify loan status failed");
      }
    } catch (error: any) {
      console.error(error);
      setApproveStepStatus((prev) => {
        const errored = [...prev];
        const index = errored.findIndex((s) => s.status === "process" || s.status === "wait");
        if (index !== -1) errored[index].status = "error";
        return errored;
      });
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoader(false);
    }
  };

  const handleChange = (key: string, row: any) => {
    if (key === "approve") {
      handleApprove(row.loanId, true);
    } else if (key === "reject") {
      handleApprove(row.loanId, false);
    } else if (key === "viewSchedule") {
      navigate(`/lms/LoanManagement/InvoiceManagement/${row.applicationId}/0`);
    }
    else if (key === "view") {
      navigate(`/lms/AllApplications/ViewApplication`, {
        state: row,
      });
    } else if (key === "viewDetail") {
      navigate(`/FinancingApplications/AllApplications/View/${row.applicationId}`, {
        state: { rowData: row },
      });
    } else if (key == "disburse") {
      setDisburseData(row);
      setDisberseDialog(true);
      setFormValues({
        loanAmount: row?.loanAmount,
      });
    } else if (key == "edit") {
      setUpdateDialog(true);
    } else if (key == "timeLine") {
      navigate(`/Lms/LoanManagement/LoanTimeline/${row?.applicationNo}/${row.loanId}`);
    }
    else if (key === "disburseHistory") {
      navigate(`/lms/LoanManagement/RetryTransaction/${row.applicationId}/1`);
    }
    else if (key === "repayHistory") {
      navigate(`/lms/LoanManagement/RetryTransaction/${row.applicationId}/2`);
    }
    else if (key === "brokenPromise") {
      // Save selected application data in Redux so Broken Promises page can use it
      // without calling Application APIs on mount.
      dispatch(setSelectedPromiseApplication(row));
      navigate(`/lms/LoanManagement/BrokenPromises/${row.applicationId}`);
    }
    else if (key === "rescheduleHistory") {
      navigate(`/Lms/LoanManagement/RescheduleHistory/${row.applicationId}`);
    }
    else if (key === "waiveOffDetails") {
      navigate(`/Lms/LoanManagement/WaiveOffDetails/${row.applicationId}`);
    }
    else if (key === "costByApplication") {
      const appCode = row.applicationNumber || row.applicationId;
      navigate(`/Lms/LoanManagement/CostByApplication/${encodeURIComponent(appCode)}`);
    }
  };

  const handleManualAction = (key: string, row: any) => {
    setSelectedTaskId(row.id);
    if (key === "manualApprove") {
      setManualActionType("approve");
      setManualModal(true);
    } else if (key === "manualReject") {
      setManualActionType("reject");
      setManualModal(true);
    }
  };

  const submitManualAction = async () => {
    if (!selectedTaskId || !manualActionType) return;
    setLoader(true);
    try {
      if (manualActionType === "approve") {
        await approveManualApproval(selectedTaskId, { notes: manualNotes });
        toast.success("Application Approved Successfully");
      } else {
        await rejectManualApproval(selectedTaskId, {
          rejectionReason: manualRejectionReason,
          notes: manualNotes
        });
        toast.success("Application Rejected Successfully");
      }
      setManualModal(false);
      setManualNotes("");
      getAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Action failed");
    } finally {
      setLoader(false);
    }
  };
  const getAll = async () => {
    try {
      setSkelitonLoading(true);
      // Fetch a large number of records to handle filtering and pagination on client
      // since backend status filtering for loan-applications seems unreliable.
      const response = await getLoanApplications(0, 1000, searchValue);
      
      const list = response?.data?.data || response?.data || [];
      const dataArray = Array.isArray(list) ? list : [];
      setApplicationData(dataArray);
      
      // We will calculate pagination state after mapping/filtering in the render block
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch loan applications");
    } finally {
      setSkelitonLoading(false);
    }
  };

  const getApplicationByCustomer = async () => {
    try {
      setSkelitonLoading(true);

      const response = await GetApplicationByAccountNumber(param?.accountNumber as string);
      if (response.success) {
        const data = response.data;
        setApplicationData(data || []);
        const currentPage = response?.pageInfo?.page || page;
        const currentPageSize = response?.pageInfo?.pageSize || pageSize;
        const totalItems = response?.pageInfo?.totalItems || 0;

        setTotalRows(totalItems);

        // Calculate from and to based on page, pageSize, and totalItems
        const calculatedFrom = (currentPage - 1) * currentPageSize + 1;
        const calculatedTo = Math.min(currentPage * currentPageSize, totalItems);

        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
      else {
        setApplicationData([]);
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
  const ApproveAmount = async () => {
    setLoader(true);

    const body: any = {
      accountId: disburseData?.accountId,
      loanId: disburseData?.loanId,
      amount: formValues?.loanAmount,
      fileToUpload: "string",
      disbursementChannel:
        paymentMethod === "cheque" ? 0 : paymentMethod === "online" ? 1 : 2,
      chequeDto: {
        chequeNumber: formValues?.chequeNumber,
        bankName: formValues?.bankName,
        bankAccNumber: formValues?.bankAccNumber,
        branchCode: formValues?.branchCode,
      },

      onlineTransactionDto: {
        bankName: formValues?.bankName,
        bankAccNumber: formValues?.bankAccNumber,
        transactionId: formValues?.transactionId,
      },
      cashDto: {
        amount: formValues?.loanAmount,
        receiptNumber: formValues?.receiptNumber,
      },
    };

    try {
      const response = await ApproveDisburseAmount(body);
      if (
        response.data.notificationMessage ==
        "Request initiated for the operation"
      ) {
        toast.success(response.data.notificationMessage);
        setLoader(false);
        setDisberseDialog(false);
      } else if (
        response.data.notificationMessage ==
        "Request already initiated for this operation"
      ) {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        setDisberseDialog(false);
        setLoader(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        // setDisberseDialog(false);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    if (initialRendor) {
      const timeoutId = setTimeout(() => {
        if (param?.accountNumber) {
          getApplicationByCustomer();
        } else {
          getAll();
        }
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);
  useEffect(() => {
    setInitialRendor(true);
    if (param?.accountNumber) {
      getApplicationByCustomer();
    } else {
      getAll();
    }
  }, [page, pageSize, activeTab]);
  const menu = (row: any) => {
    if (activeTab === "PendingApplication") {
      return (
        <Menu onClick={({ key }: any) => handleManualAction(key, row)}>
          <Menu.Item key="manualApprove" icon={<CheckCircleOutlined />}>
            Approve
          </Menu.Item>
          <Menu.Item key="manualReject" icon={<CloseCircleOutlined />}>
            Reject
          </Menu.Item>
        </Menu>
      );
    }
    return (
      <Menu onClick={({ key }: any) => handleChange(key, row)}>
        {row.laonStatus == "Pending" && (
          <>
            <Menu.Item key="approve" icon={<EditOutlined />}>
              Approve
            </Menu.Item>
            <Menu.Item key="reject" icon={<EditOutlined />}>
              Reject
            </Menu.Item>
          </>
        )}
        {row.laonStatus == "DISBURSED" && (
          <>
            {/* <Menu.Item key="view" icon={<EyeOutlined />}>
              View
            </Menu.Item> */}
            {/* <Menu.Item key="disburse" icon={<FaSortAmountUp />}>
              Disburse Approve Amount
            </Menu.Item> */}
            <Menu.Item key="viewSchedule" icon={<EyeOutlined />}>
              View Schedule
            </Menu.Item>
          </>
        )}
        <Menu.Item key="viewDetail" icon={<EyeOutlined />}>
          View Detail
        </Menu.Item>
        <Menu.Item key="costByApplication" icon={<SaudiRiyal size={14} />}>
          Cost By Application
        </Menu.Item>
        {/* <Menu.Item key="edit" icon={<EditOutlined />}>
          Edit
        </Menu.Item> */}
        {/* <Menu.Item key="timeLine" icon={<ClockCircleOutlined />}>
          Loan TimeLine
        </Menu.Item> */}
        {row.disbursementStatus == "Disbursed" && (
          <>
            {/* <Menu.Item key="disburseHistory" icon={<FaSortAmountUp />}>
              Disburse History
            </Menu.Item> */}
            {/* <Menu.Item key="repayHistory" icon={<RiSecurePaymentLine/>}>
              Repay History
            </Menu.Item>
            <Menu.Item key="brokenPromise" icon={<RiContractLeftFill/>}>
                Broken Promise
            </Menu.Item> */}
          </>
        )}
        {row.rescheduleStatus && (
          <Menu.Item key="rescheduleHistory" icon={<MdSchedule />}>
            Reschedule History
          </Menu.Item>
        )}
        <Menu.Item key="waiveOffDetails" icon={<EyeOutlined />}>
          Waive Off Details
        </Menu.Item>
      </Menu>
    );
  };
  const formatSar = (value?: number | string | null) =>
    value != null && value !== ""
      ? `SAR ${parseFloat(String(value)).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "-";

  /**
   * Map any status / step label to a context-appropriate pill colour.
   * Positive (done / cleared) → green, negative (rejected / failed) → coral,
   * in-flight (pending / waiting) → amber, terminal-but-neutral (disbursed
   * pre-payment / blocked-non-error) → blue. Anything unknown falls back
   * to slate so the cell never matches "another" status by accident.
   */
  const getStatusPill = (raw?: string | null) => {
    if (raw == null || raw === "" || raw === "-") {
      return { bg: "var(--color-status-amber)", text: "-" };
    }
    const t = String(raw).trim();
    const lc = t.toLowerCase();

    // Positive / completed states
    if (/(complete|approved|clear|funds transferred|success|active|disbursed|paid|verified)/i.test(lc)) {
      return { bg: "var(--color-status-green)", text: t };
    }
    // Negative / failure states
    if (/(reject|fail|block|error|denied|cancel)/i.test(lc)) {
      return { bg: "var(--color-status-coral)", text: t };
    }
    // In-flight / waiting states
    if (/(pending|progress|process|wait|review|submitted|initiated)/i.test(lc)) {
      return { bg: "var(--color-status-amber)", text: t };
    }
    // Early onboarding / informational steps
    if (/(basic information|add bank|otp|nafath|simah|kyc|sign|terms|consent|application)/i.test(lc)) {
      return { bg: "var(--color-status-blue)", text: t };
    }
    return { bg: "var(--color-status-slate, #64748b)", text: t };
  };

  const Pill: React.FC<{ value?: string | null; width?: number }> = ({ value, width }) => {
    const { bg, text } = getStatusPill(value);
    return (
      <span
        style={{
          display: "inline-block",
          maxWidth: width || "100%",
          padding: "6px 12px",
          borderRadius: "32px",
          fontSize: "12px",
          fontWeight: 500,
          backgroundColor: bg,
          color: "var(--primary-foreground)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textTransform: text === text.toUpperCase() ? "none" : "capitalize",
        }}
      >
        {text}
      </span>
    );
  };

  const Account_Documents_List_Header = [
    {
      name: "Application No",
      selector: (row: any) => row.applicationNumber,
      sortable: true,
      width: "170px",
    },
    {
      name: "National ID",
      selector: (row: any) => row.nationalId,
      sortable: true,
      width: "140px",
    },
    {
      name: "Product Name",
      selector: (row: any) => row.productName,
      sortable: true,
      width: "160px",
    },
    {
      name: "Sharia Structure",
      selector: (row: any) => row.shariaStructure,
      sortable: true,
      width: "150px",
    },
    {
      name: "Requested Amount",
      selector: (row: any) => formatSar(row.requestedAmount),
      sortable: true,
      width: "160px",
    },
    {
      name: "Tenure",
      selector: (row: any) => row.requestedTenureMonths ? `${row.requestedTenureMonths} months` : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Profit Rate",
      selector: (row: any) =>
        row.profitRate != null ? `${parseFloat(row.profitRate).toFixed(2)}%` : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Offered Amount",
      selector: (row: any) => formatSar(row.offeredAmount),
      sortable: true,
      width: "150px",
    },
    {
      name: "Total Amount",
      selector: (row: any) =>
        formatSar(row.totalPayable ?? row.offeredTotalPayable ?? row.totalAmount),
      sortable: true,
      width: "150px",
    },
    {
      name: "Offered Installment",
      selector: (row: any) => formatSar(row.offeredMonthlyInstallment),
      sortable: true,
      width: "170px",
    },
    {
      name: "Purpose",
      selector: (row: any) => row.purposeOfFinance,
      sortable: true,
      width: "130px",
    },
    {
      name: "Employer",
      selector: (row: any) => row.employerName || "-",
      sortable: true,
      width: "160px",
    },
    {
      name: "Monthly Income",
      selector: (row: any) => formatSar(row.monthlyIncome),
      sortable: true,
      width: "150px",
    },
    {
      name: "Credit Score",
      cell: (row: any) => {
        const score = row.creditScore;
        if (score == null) return <span>-</span>;
        const bg =
          score >= 700
            ? "var(--color-status-green)"
            : score >= 600
              ? "var(--color-status-amber)"
              : "var(--color-status-coral)";
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "32px",
              fontSize: "12px",
              fontWeight: 500,
              backgroundColor: bg,
              color: "var(--primary-foreground)",
            }}
          >
            {score}
          </span>
        );
      },
      sortable: true,
      width: "130px",
    },
    {
      name: "Current Step",
      cell: (row: any) => <Pill value={row.stepperLabel} />,
      width: "180px",
    },
    {
      name: "SafeWatch",
      cell: (row: any) => {
        const sw = row.safeWatchStatus;
        if (!sw) return <span>-</span>;
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "32px",
              fontSize: "12px",
              fontWeight: 500,
              backgroundColor:
                sw === "CLEAR"
                  ? "var(--color-status-green)"
                  : "var(--color-status-coral)",
              color: "var(--primary-foreground)",
            }}
          >
            {sw}
          </span>
        );
      },
      width: "130px",
    },
    {
      name: "PaymentGuard",
      cell: (row: any) => {
        const pg = row.paymentGuardStatus;
        if (!pg) return <span>-</span>;
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "32px",
              fontSize: "12px",
              fontWeight: 500,
              backgroundColor:
                pg === "APPROVED"
                  ? "var(--color-status-green)"
                  : pg === "REJECTED"
                    ? "var(--color-status-coral)"
                    : "var(--color-status-amber)",
              color: "var(--primary-foreground)",
            }}
          >
            {pg}
          </span>
        );
      },
      width: "150px",
    },
    // {
    //   name: "Current Step",
    //   cell: (row: any) => (
    //     <div
    //       style={{
    //         whiteSpace: "nowrap",
    //         padding: "0.4rem 1rem",
    //         borderRadius: "12px",
    //         backgroundColor: "var(--color-info)",
    //         color: "var(--primary-foreground)",
    //         fontSize: "12px",
    //         textTransform: "capitalize",
    //       }}
    //     >
    //       {(row.stepperLabel || "-")}
    //     </div>
    //   ),
    //   width: "180px",
    // },
    {
      name: "Status",
      width: "180px",
      cell: (row: any) => (
        <Pill value={(row.status || "-").replace(/_/g, " ")} />
      ),
    },
    // {
    //   name: "SafeWatch",
    //   cell: (row: any) => (
    //     <span
    //       style={{
    //         padding: "6px 12px",
    //         borderRadius: "32px",
    //         fontSize: "12px",
    //         fontWeight: "500",
    //         backgroundColor:
    //           row.safeWatchStatus === "CLEAR"
    //             ? "var(--color-status-green)"
    //             : "var(--color-status-coral)",
    //         color: "var(--primary-foreground)",
    //       }}
    //     >
    //       {row.safeWatchStatus || "-"}
    //     </span>
    //   ),
    //   width: "120px",
    // },
    {
      name: "Disbursement",
      cell: (row: any) => <Pill value={row.disbursementStatus} />,
      width: "140px",
    },
    {
      name: "Reschedule Status",
      cell: (row: any) => {
        const status = row.rescheduleStatus;
        if (!status) return <span>-</span>;
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "32px",
              fontSize: "12px",
              fontWeight: "500",
              backgroundColor:
                status === "APPLIED"
                  ? "var(--color-status-green)"
                  : status === "SUBMITTED"
                    ? "var(--color-status-amber)"
                    : status === "REJECTED"
                      ? "var(--color-status-coral)"
                      : "var(--color-status-blue)",
              color: "var(--primary-foreground)",
            }}
          >
            {status}
          </span>
        );
      },
      width: "170px",
    },
    {
      name: "Date",
      selector: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Action",
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
      width: "140px",
    },
  ];
  const getDisbursementStatus = (id: any) => {
    // Pending = 0,
    //  Approved = 1,
    //  Rejected = 2,
    //  Processed = 3,
    //  Not_Initiated=4
    switch (id) {
      case 0:
        return "Pending";
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      case 3:
        return "Intiated";
      case 4:
        return "Not Initiated";
      case 5:
        return "Disbursed";
      default:
        return "Unknown Status";
    }
  }
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const allMappedData =
    applicationData &&
    applicationData.map((item: any) => {
      return {
        // Identifiers
        id: item?.id,
        applicationId: item?.applicationId || item?.id,
        loanId: item?.applicationId || item?.id,
        applicationNumber: item?.applicationNumber || "-",
        applicationNo: item?.applicationNumber,
        customerId: item?.customerId,
        nationalId: item?.nationalId || "-",
        workflowId: item?.workflowId,

        // Status / workflow
        status: item?.displayStatus || item?.status || "-",
        displayStatus: item?.displayStatus,
        laonStatus: item?.displayStatus,
        stepperIndex: item?.stepperIndex,
        stepperLabel: item?.stepperLabel || "-",
        rescheduleStatus: item?.rescheduleStatus,
        disbursementStatus: item?.loanStatus === "ACTIVE" ? "Disbursed" : "Pending",

        // Product
        productId: item?.productId,
        productCode: item?.productCode,
        productName: item?.productName || "-",
        shariaStructure: item?.shariaStructure || "-",

        // Request
        requestedAmount: item?.requestedAmount ?? item?.totalAmount ?? "-",
        totalAmount: item?.totalAmount,
        requestedTenureMonths: item?.requestedTenureMonths ?? item?.tenureMonths,
        purposeOfFinance: item?.purposeOfFinance || "-",
        profitRate: item?.profitRate,
        loanAmount: item?.requestedAmount || item?.totalAmount,

        // Income & expenses
        monthlyIncome: item?.monthlyIncome,
        totalExpenses: item?.totalExpenses,
        existingLiabilities: item?.existingLiabilities,
        foodGroceries: item?.foodGroceries,
        utilities: item?.utilities,
        healthcare: item?.healthcare,
        communication: item?.communication,
        housingRent: item?.housingRent,
        clothingEssentials: item?.clothingEssentials,
        education: item?.education,
        transportation: item?.transportation,

        // Employment
        employerName: item?.employerName,
        employmentSector: item?.employmentSector,
        employmentStatus: item?.employmentStatus,
        basicSalary: item?.basicSalary,
        totalSalary: item?.totalSalary,
        employmentStartDate: item?.employmentStartDate,
        verifiedSalary: item?.verifiedSalary,

        // Risk / verification
        safeWatchSessionId: item?.safeWatchSessionId,
        safeWatchStatus: item?.safeWatchStatus || "-",
        amlDeclarationCompleted: item?.amlDeclarationCompleted,
        amlDeclarationAt: item?.amlDeclarationAt,
        simahConsent: item?.simahConsent,
        simahConsentAt: item?.simahConsentAt,
        simahReferenceId: item?.simahReferenceId,
        creditScore: item?.creditScore,
        otpVerified: item?.otpVerified,
        otpAttempts: item?.otpAttempts,
        ivrVerified: item?.ivrVerified,
        ivrAttempts: item?.ivrAttempts,

        // Disbursement bank
        disbursementBankCode: item?.disbursementBankCode,
        disbursementBankName: item?.disbursementBankName,
        disbursementIban: item?.disbursementIban,
        ibanVerified: item?.ibanVerified,

        // Offer
        maxEligibleAmount: item?.maxEligibleAmount,
        offeredAmount: item?.offeredAmount,
        offeredMonthlyInstallment: item?.offeredMonthlyInstallment,
        offeredTotalProfit: item?.offeredTotalProfit,
        offeredTotalPayable: item?.offeredTotalPayable,
        processingFee: item?.processingFee,
        adminFee: item?.adminFee,
        acceptedAmount: item?.acceptedAmount,
        contractExpiresAt: item?.contractExpiresAt,

        // Notifications / payment guard
        nabaNotificationSent: item?.nabaNotificationSent,
        paymentGuardStatus: item?.paymentGuardStatus || "-",

        // Timestamps
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
      };
    });

  // Client-side filtering to ensure tab integrity (all tabs use the same getLoanApplications API)
  const filteredData = (allMappedData || []).filter((item: any) => {
    const status = (item.status || "").toUpperCase();
    if (activeTab === "ApprovedApplication") {
      return status.includes("APPROVED") || status.includes("COMPLETED");
    }
    if (activeTab === "CancelledApplication") {
      return (
        status.includes("CANCELLED") ||
        status.includes("REJECTED") ||
        status.includes("EXPIRED")
      );
    }
    if (activeTab === "PendingApplication") {
      return status === "MANUAL_REVIEW";
    }
    return true;
  });

  // Client-side search across common fields
  const searchTerm = (searchValue || "").trim().toLowerCase();
  const searchedData = searchTerm
    ? filteredData.filter((item: any) => {
        const haystack = [
          item.applicationNumber,
          item.nationalId,
          item.productName,
          item.productCode,
          item.shariaStructure,
          item.purposeOfFinance,
          item.employerName,
          item.status,
          item.stepperLabel,
        ]
          .map((v) => (v != null ? String(v).toLowerCase() : ""))
          .join(" ");
        return haystack.includes(searchTerm);
      })
    : filteredData;

  // Calculate local pagination based on filtered results
  const paginationTotal = searchedData.length;
  const paginationTotalPage = Math.ceil(paginationTotal / pageSize) || 1;
  const paginationStartIndex = (page - 1) * pageSize;
  const paginationEndIndex = paginationStartIndex + pageSize;
  const mappedData = searchedData.slice(paginationStartIndex, paginationEndIndex);

  const paginationFrom = paginationTotal > 0 ? paginationStartIndex + 1 : 0;
  const paginationTo = Math.min(paginationEndIndex, paginationTotal);
  const validateFields = () => {
    const newErrors: any = {};
    Object.keys(formValues).forEach((key) => {

      if (!formValues[key] && typeof formValues[key] !== "boolean") {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const businessOption = [
    { label: "business", value: "business" },
    { label: "Individual", value: "individual" },
  ];
  const isVariableRateLoanOptions = [
    { label: "True", value: true },
    { label: "False", value: false },
  ];
  const tenureTypeOptions = [
    { label: "Monthly", value: 2 },
    { label: "Yearly", value: 1 },
  ];
  const applicableOption = [
    { label: "Customer Name", value: 0 },
    // { label: "Email", value: 1 },
    // { label: "Passport", value: 2 },
    // { label: "NID", value: 3 },
    // { label: "LoanId", value: 4 },
    // { label: "InvoiceId", value: 5 },
    // { label: "ApplicationId", value: 6 },
    { label: "Application No", value: 7 },
    // { label: "ProductName", value: 8 },
    // { label: "LegalName", value: 9 },
    // { label: "TaxId", value: 10 },
    // { label: "None", value: 11 },
    // { label: "Invoice No", value: 12 },
    { label: "Channel", value: 13 },
    { label: "Status", value: 15 },
    { label: "Disbursement Status", value: 16 },

  ];

  return (
    <div className="service application-management-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Application Management</h3>
      </div>
      {/* {loader && <Loader />} */}
      <Modal
        show={isModalVisible}
        centered
        backdrop="static"
        keyboard={false}
        onHide={() => { }}
      >
        <Modal.Body>
          <div style={{ height: "200px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Steps
              direction="horizontal"
              current={approveStepStatus.findIndex((s) => s.status === "process")}
              items={approveStepStatus.map((step, index) => ({
                title: step.title,
                status: step.status,
                icon: getApproveStepIcon(index, step.status),
              }))}
            />
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={manualModal}
        onHide={() => setManualModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px", fontWeight: 700 }}>
            {manualActionType === "approve" ? "Approve Application" : "Reject Application"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {manualActionType === "reject" && (
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "14px", fontWeight: 500 }}>Rejection Reason</Form.Label>
                <Select
                  style={{ width: "100%" }}
                  value={manualRejectionReason}
                  onChange={(value) => setManualRejectionReason(value)}
                >
                  <Select.Option value="DBR_HIGH">DBR High</Select.Option>
                  <Select.Option value="LOW_CREDIT_SCORE">Low Credit Score</Select.Option>
                  <Select.Option value="INCOMPLETE_DOCS">Incomplete Documentation</Select.Option>
                  <Select.Option value="OTHERS">Others</Select.Option>
                </Select>
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "14px", fontWeight: 500 }}>Notes</Form.Label>
              <Input.TextArea
                rows={4}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Enter notes here..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setManualModal(false)}
            style={{ borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            className="gradient-btn"
            type="primary"
            onClick={submitManualAction}
            style={{ borderRadius: "8px" }}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      {/* <div className="col-12 d-flex  align-items-center mt-3">
        <div
          className="d-flex align-items-center col-6 justify-content-between mt-1"
          style={{ fontSize: "15px", fontWeight: "Bold" }}
        >
          Applications
        </div>
        <div className="col-6 d-flex justify-content-end">
          <span className="pe-3">
            <Select
              value={selectApplicable}
              onChange={(e: any) => {
                setSelectApplicable(e);
              }}
              style={{ width: "100%", minWidth: "100px", height: "33px" }}
              placeholder="Search Type"
            >
              {applicableOption?.map((option) => (
                <Select.Option value={option.value}>
                  {option?.label}
                </Select.Option>
              ))}
            </Select>
          </span>
          <span className="pe-2">
            <Input
              placeholder="Search"
              value={searchValue}
              prefix={<SearchOutlined />}
              onChange={(e: any) => {
                setSearchValue(e.target.value);
              }}
            />
          </span>
          <Button
            style={{
              borderRadius: "8px",
              border: "transparent",
            }}
            className="application-btn"
            onClick={() => {
              navigate("/Lms/LoanManagement/Application");
            }}
          >
            Create Application
          </Button>
        </div>
      </div> */}
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
            placeholder="Search by application no, national ID, product, employer..."
            value={searchValue}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            onChange={(e: any) => {
              setSearchValue(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
          />
        </div>
      </div>
      <style>{`
        .app-tabs.nav-tabs {
          background: transparent !important;
          border-bottom: 1px solid var(--border) !important;
          padding: 0 !important;
        }
        .app-tabs.nav-tabs .nav-link {
          background: transparent !important;
          border: none !important;
          color: var(--muted-foreground) !important;
          min-width: auto !important;
          padding: 10px 16px !important;
        }
        .app-tabs.nav-tabs .nav-item.show .nav-link,
        .app-tabs.nav-tabs .nav-link.active {
          background: transparent !important;
          color: var(--primary) !important;
          border: none !important;
          border-bottom: 2px solid var(--primary) !important;
        }
      `}</style>
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
        <div className="px-3 pt-3">
          <Tabs
            activeKey={activeTab}
            onSelect={(k: any) => { setActiveTab(k); setPage(1); }}
            className="app-tabs"
          >
            <Tab eventKey="AllApplication" title="All Application" />
            <Tab eventKey="ApprovedApplication" title="Approved Application" />
            <Tab eventKey="CancelledApplication" title="Cancelled Application" />
            <Tab eventKey="PendingApplication" title="Pending Application" />
          </Tabs>
        </div>
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={paginationTotal}
          totalPage={paginationTotalPage}
          from={paginationFrom}
          to={paginationTo}
          header={Account_Documents_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
        {applicationData?.length == 0 && (
          <div
            className="d-flex justify-content-center py-5"
            style={{ color: "var(--destructive)" }}
          >
            No data found
          </div>
        )}
      </div>
      <BuisnessModal
        setBusinessForm={setBusinessForm}
        buisnessForm={buisnessForm}
        setCustomerValue={setCustomerValue}
      />
      <Modal
        show={disberseDialog}
        centered
        size="lg"
        onHide={() => {
          setDisberseDialog(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">
            {" "}
            Disburse Approved Amount
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <div className="px-4 mt-2 mb-4">
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Application No
                  </Form.Label>
                  <Form.Control
                    name="accountNo"
                    type="number"
                    value={disburseData?.applicationNo}
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Product Name
                  </Form.Label>
                  <Form.Control
                    name="accountNo"
                    type="text"
                    value={disburseData?.productName}
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Status
                  </Form.Label>
                  <Form.Control
                    name="company"
                    type="text"
                    readOnly
                    value={disburseData?.Status}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Application Key
                  </Form.Label>
                  <Form.Control
                    name="branch"
                    type="text"
                    readOnly
                    value={disburseData?.applicationKey}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Loan Id
                  </Form.Label>
                  <Form.Control
                    name="id"
                    type="text"
                    readOnly
                    value={disburseData?.loanId}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Tenure
                  </Form.Label>
                  <Form.Control
                    name="tenure"
                    type="number"
                    readOnly
                    value={disburseData?.tenure}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Disbursement Amount
                  </Form.Label>
                  <Form.Control
                    name="loanAmount"
                    type="number"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        loanAmount: e.target.value,
                      });
                    }}
                    readOnly
                    value={formValues?.loanAmount}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Payment Method
                </Form.Label>
                <Select
                  placeholder="Select Payment Method"
                  className="w-100"
                  value={paymentMethod}
                  onChange={(value) => setPaymentMethod(value)}
                >
                  <option value="cheque">Cheque</option>
                  <option value="online">Online Transaction</option>
                  <option value="cash">Cash</option>
                </Select>
              </Col>
            </Row>
            {paymentMethod === "cheque" && (
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Cheque Number
                  </Form.Label>
                  <Form.Control
                    name="chequeNumber"
                    type="number"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        chequeNumber: e.target.value,
                      });
                    }}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Bank Name
                  </Form.Label>
                  <Form.Control
                    name="bankName"
                    type="text"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        bankName: e.target.value,
                      });
                    }}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Bank Account Number
                  </Form.Label>
                  <Form.Control
                    name="bankAccNumber"
                    type="number"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        bankAccNumber: e.target.value,
                      });
                    }}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Branch Code
                  </Form.Label>
                  <Form.Control
                    name="branchCode"
                    type="number"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        branchCode: e.target.value,
                      });
                    }}
                  />
                </Col>
              </Row>
            )}

            {paymentMethod === "online" && (
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Bank Name
                  </Form.Label>
                  <Form.Control
                    name="bankName"
                    type="text"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        bankName: e.target.value,
                      });
                    }}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Account Number
                  </Form.Label>
                  <Form.Control
                    name="bankAccNumber"
                    type="number"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        bankAccNumber: e.target.value,
                      });
                    }}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Transaction ID
                  </Form.Label>
                  <Form.Control
                    name="transactionId"
                    type="number"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        transactionId: e.target.value,
                      });
                    }}
                  />
                </Col>
              </Row>
            )}

            {paymentMethod === "cash" && (
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Amount
                  </Form.Label>
                  <Form.Control
                    name="amountCash"
                    type="number"
                    value={formValues?.loanAmount}
                    // onChange={(e: any) => {
                    //   setFormValues({
                    //     ...formValues,
                    //     amountCash: e.target.value,
                    //   });
                    // }}
                    readOnly
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Receipt Number
                  </Form.Label>
                  <Form.Control
                    name="receiptNumber"
                    type="text"
                    onChange={(e: any) => {
                      setFormValues({
                        ...formValues,
                        receiptNumber: e.target.value,
                      });
                    }}
                  />
                </Col>
              </Row>
            )}
            <div className="d-flex justify-content-end">
              {" "}
              <button
                className="btn btn-danger mb-4"
                onClick={() => {
                  ApproveAmount();
                }}
                style={{
                  backgroundColor: "var(--color-danger-action)",
                  borderRadius: "8px",
                  height: "fit-content",
                  width: "fit-content",
                  border: "none",
                  color: "var(--color-near-white)",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={updateDialog}
        centered
        size="lg"
        onHide={() => {
          setUpdateDialog(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title"> Update Application</Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <div className="px-4 mt-2 mb-4">
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Account No
                  </Form.Label>
                  <Form.Control
                    name="accountNo"
                    type="number"
                    // value={nextAccNum?.accountNumber}
                    onChange={handleInputChange}
                    isInvalid={!!errors.accountNo}
                    readOnly
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.accountNo}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Customers
                  </Form.Label>
                  <Select
                    value={customer}
                    onChange={(e: any) => {
                      setCustomer(e);
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {businessOption?.map((option) => (
                      <Select.Option value={option.value}>
                        {option?.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.customer}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {customer == "business" && (
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Kyb Id
                    </Form.Label>
                    <Select
                      value={formValues.kybId}
                      onChange={(value: any) => {
                        setFormValues((prevValues: any) => ({
                          ...prevValues,
                          kybId: value,
                        }));
                      }}
                      style={{ width: "100%" }}
                      placeholder="Select Rate Loan Type"
                    >
                      {businessId?.map((option: any) => (
                        <Select.Option
                          key={option.customerId}
                          value={option.customerId}
                        >
                          {option?.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.kybId}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              {customer == "individual" && (
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Kyc Id
                    </Form.Label>
                    <Select
                      value={formValues.kycId}
                      onChange={(value) => {
                        setFormValues((prevValues: any) => ({
                          ...prevValues,
                          kycId: value,
                        }));
                      }}
                      style={{ width: "100%" }}
                      placeholder="Select Rate Loan Type"
                    >
                      {individualId?.map((option: any) => (
                        <Select.Option value={option.customerId}>
                          {option?.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.kycId}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Product Name
                  </Form.Label>
                  <Select
                    value={formValues.productName}
                    onChange={(value: any, option: any) => {
                      setFormValues((prevValues: any) => ({
                        ...prevValues,
                        productId: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {prodId?.map((option: any) => (
                      <Select.Option value={option.productId}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues: any) => ({
                              ...prevValues,
                              productName: option.nameInEnglish,
                            }));
                          }}
                        >
                          {option?.nameInEnglish}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.nameInEnglish}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {customer != "individual" && (
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Company
                    </Form.Label>
                    <Form.Control
                      name="company"
                      type="text"
                      value={formValues.company}
                      onChange={handleInputChange}
                      isInvalid={!!errors.company}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.company}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              {customer != "individual" && (
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Branch
                    </Form.Label>
                    <Form.Control
                      name="branch"
                      type="text"
                      value={formValues.branch}
                      onChange={handleInputChange}
                      isInvalid={!!errors.branch}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.branch}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              {customer != "individual" && (
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Sub Unit
                    </Form.Label>
                    <Form.Control
                      name="subUnit"
                      type="text"
                      value={formValues.subUnit}
                      onChange={handleInputChange}
                      isInvalid={!!errors.subUnit}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.subUnit}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Is Variable Rate Loan
                  </Form.Label>
                  <Select
                    value={formValues.isVariableRateLoan}
                    onChange={(value: any) =>
                      setFormValues((prevValues: any) => ({
                        ...prevValues,
                        isVariableRateLoan: value,
                      }))
                    }
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {isVariableRateLoanOptions?.map((option) => (
                      <Select.Option value={option.value}>
                        {option?.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.isVariableRateLoan}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Loan Amount
                  </Form.Label>
                  <Form.Control
                    name="loanAmount"
                    type="number"
                    value={formValues.loanAmount}
                    onChange={handleInputChange}
                    isInvalid={!!errors.loanAmount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.loanAmount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Payable Status
                </Form.Label>
                <Select
                  value={formValues?.payableStatus}
                  onChange={(value) =>
                    setFormValues((prevValues: any) => ({
                      ...prevValues,
                      payableStatus: value,
                    }))
                  }
                  style={{ width: "100%" }}
                  placeholder="Select Payable Status"
                >
                  {payableStatusOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option?.label}
                    </Select.Option>
                  ))}
                </Select>
                <Form.Control.Feedback type="invalid">
                  {errors.payableStatus}
                </Form.Control.Feedback>
              </Form.Group>
            </Col> */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Tenure Type
                  </Form.Label>
                  <Select
                    value={formValues.tenureType}
                    onChange={(value) =>
                      setFormValues((prevValues: any) => ({
                        ...prevValues,
                        tenureType: value,
                      }))
                    }
                    style={{ width: "100%" }}
                    placeholder="Select Tenure Type"
                  >
                    {tenureTypeOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option?.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.tenureType}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Interest Rate
                  </Form.Label>
                  <Form.Control
                    name="interestRate"
                    type="number"
                    value={formValues.interestRate}
                    onChange={handleInputChange}
                    isInvalid={!!errors.interestRate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.interestRate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Tenure Duration
                  </Form.Label>
                  <Form.Control
                    name="tenureDuration"
                    type="number"
                    value={formValues.tenureDuration}
                    onChange={handleInputChange}
                    isInvalid={!!errors.tenureDuration}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.tenureDuration}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              {" "}
              <button
                className="btn btn-danger mb-4"
                onClick={() => {
                  ApproveAmount();
                }}
                style={{
                  backgroundColor: "var(--color-danger-action)",
                  borderRadius: "8px",
                  height: "fit-content",
                  width: "fit-content",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default ApplicationManagement;
