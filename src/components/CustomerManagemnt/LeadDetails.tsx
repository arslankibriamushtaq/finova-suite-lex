import React, { useState, useEffect } from "react";
import { Tab, Tabs, Row as BootstrapRow, Col as BootstrapCol } from "react-bootstrap";
import { Row, Col, Card, Button, Modal, Form, Input, DatePicker } from "antd";
import {
  EyeOutlined,
  BankOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UpOutlined,
  DownOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
// import StepForms from "./LeadTabs/StepFroms";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetails } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import TableView from "../TableView/TableView";

// Import existing tab components from LeadTabs folder
// import BusinessInfoTab from "./LeadTabs/BusinessInfoTab";
import BuyerInfoTabs from "./LeadTabs/BuyerInfoTabs";
import SupplierInfoTabs from "./LeadTabs/SupplierInfoTabs";
import OverviewTabs from "./LeadTabs/OverviewTabs";
import CompanyManagerList from "./LeadTabs/CompanyManagerList";
import BayanTabs from "./LeadTabs/BayanTabs";
import CreditCheck from "./LeadTabs/CreditCheck";
import ComplianceCheck from "./LeadTabs/ComplianceCheck";
import FinancingInformation from "./LeadTabs/FinancingInformation";

interface Field {
  label: string;
  value: string | number;
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    margin: "0 auto",
    background: "#fff",
    borderRadius: 8,
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #eee",
    padding: "12px 0",
    fontSize: 14,
  },
  label: {
    color: "#000",
    fontWeight: 400,
  },
  value: {
    fontWeight: 600,
    color: "#000",
  },
  complianceSection: {
    background: "#F9F9F9",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  questionLabel: {
    fontSize: "13px",
    color: "#000",
    fontWeight: 400,
    marginBottom: "5px",
  },
  answerLabel: {
    fontSize: "13px",
    color: "#555",
    fontWeight: 400,
    marginTop: "3px",
  },
};

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectTab, setSelectedTab] = useState<string>("Overview");
  const [overviewChildTab, setOverviewChildTab] = useState<string>("Customer Information");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [expandedEmploymentCards, setExpandedEmploymentCards] = useState<{
    [key: number]: boolean;
  }>({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<"supplier" | "buyer">("supplier");
  const [form] = Form.useForm();

  // Dummy employment data for testing
  const dummyEmploymentData = [
    {
      fullName: "محمد خالد",
      basicWage: 0,
      housingAllowance: 0,
      otherAllowance: 0,
      employerName: "Government Pension",
      workingMonths: 0,
      employmentStatus: "Pensioned",
      occupationCode: null,
      occupationTitle: null,
      occupationCode_meaning: "Retired employee receiving pension benefits.",
      employmentType: "private",
      joiningDate: "01/09/2021",
      isEmployeePensioned: true,
      pensionAmount: 8010,
      pensionType: "private",
      pensionStartDate: "01/09/2021",
    },
    {
      fullName: "محمد خالد",
      basicWage: 7500,
      housingAllowance: 2000,
      otherAllowance: 1000,
      employerName: "Al-Rajhi Bank",
      workingMonths: 48,
      employmentStatus: "Active",
      occupationCode: "12345",
      occupationTitle: "Senior Financial Analyst",
      occupationCode_meaning: "Analyzes financial data and prepares reports.",
      employmentType: "private",
      joiningDate: "15/03/2021",
      isEmployeePensioned: false,
      pensionAmount: 0,
      pensionType: null,
      pensionStartDate: null,
    },
  ];

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(id!);
      if (response?.data?.success) {
        setUserDetails(response.data.data);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to fetch user details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Parse compliance answers questions
  const parseQuestion = (questionString: string) => {
    try {
      return JSON.parse(questionString);
    } catch {
      return { en: questionString, ar: "" };
    }
  };

  // Get all compliance answers
  const getAllComplianceAnswers = () => {
    if (!userDetails?.compliance_answers || !Array.isArray(userDetails.compliance_answers)) {
      return [];
    }

    // Return all answers with parsed questions
    return userDetails.compliance_answers.map((answer: any) => {
      const question = parseQuestion(answer.question);
      return { ...answer, parsedQuestion: question };
    });
  };

  const complianceAnswers = getAllComplianceAnswers();

  // Group answers by category
  const groupAnswersByCategory = () => {
    const grouped: { [key: string]: any[] } = {};
    complianceAnswers.forEach((answer: any) => {
      const category = answer.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(answer);
    });
    return grouped;
  };

  const groupedComplianceAnswers = groupAnswersByCategory();

  // Helper function to format category name (capitalize first letter)
  const formatCategoryName = (category: string) => {
    if (!category) return "Other";
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  // Helper function to determine if answer is "Yes"
  const isYesAnswer = (answer: string | boolean) => {
    if (typeof answer === "boolean") {
      return answer === true;
    }
    const answerLower = String(answer).toLowerCase();
    return answerLower === "yes" || answerLower === "نعم" || answerLower === "true";
  };

  // Helper function to format answer display
  // const formatAnswer = (answer: string | boolean, isYes: boolean) => {
  //   if (isYes) {
  //     return "Yes";
  //   }
  //   const answerLower = String(answer).toLowerCase();
  //   if (answerLower === "no" || answerLower === "لا" || answerLower === "false") {
  //     return "No";
  //   }
  //   return String(answer) || "-";
  // };

  // const formatAnswerArabic = (answer: string | boolean, isYes: boolean) => {
  //   if (isYes) {
  //     return "نعم";
  //   }
  //   const answerLower = String(answer).toLowerCase();
  //   if (answerLower === "no" || answerLower === "لا" || answerLower === "false") {
  //     return "لا";
  //   }
  //   return String(answer) || "-";
  // };

  // Parse nafath callback data if available
  const nafathData = userDetails?.nafath_callback_data
    ? typeof userDetails.nafath_callback_data === "string"
      ? JSON.parse(userDetails.nafath_callback_data)
      : userDetails.nafath_callback_data
    : null;

  // Parse KYC step data if available
  const kycStepData = userDetails?.kyc?.step
    ? typeof userDetails.kyc.step === "string"
      ? JSON.parse(userDetails.kyc.step)
      : userDetails.kyc.step
    : null;

  // Get KYC status color
  const getKycStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "rgba(63, 195, 128, 0.9)";
      case "rejected":
        return "#F84D4D";
      case "pending":
        return "#FFC107";
      default:
        return "transparent";
    }
  };

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "highrisk":
      case "high":
        return "#F84D4D";
      case "medium":
        return "#FFC107";
      case "pep":
        return "#9C27B0";
      case "low":
      default:
        return "rgba(63, 195, 128, 0.9)";
    }
  };

  // Dynamic mapping for left column
  const leftColumn: Field[] = [
    { label: "Customer Name", value: userDetails?.user?.name || "--" },
    { label: "Phone", value: userDetails?.user?.phone || "--" },
    { label: "ID", value: userDetails?.user?.nid || "--" },
    { label: "Employment Sector Name", value: userDetails?.user?.employment_sector_name || "--" },
  ];

  // Dynamic mapping for right column
  const rightColumn: Field[] = [
    { label: "Customer Name", value: userDetails?.user?.name || "--" },
    { label: "Email", value: userDetails?.user?.email || "--" },
    { label: "Address", value: nafathData?.full_address_en || nafathData?.full_address || "--" },
  ];
  // Toggle employment card expansion
  const toggleEmploymentCard = (index: number) => {
    setExpandedEmploymentCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Get employment status color
  const getEmploymentStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("active")) {
      return "rgba(63, 195, 128, 0.9)";
    }
    if (statusLower.includes("pension") || statusLower.includes("pensioned")) {
      return "#FFC107";
    }
    if (statusLower.includes("inactive")) {
      return "#F84D4D";
    }
    return "#6c757d";
  };

  // Handle Edit Modal
  const handleEditClick = (type: "supplier" | "buyer") => {
    setEditingType(type);
    const data =
      type === "supplier"
        ? { nid: userDetails?.supplier?.nid, dob: userDetails?.supplier?.dob }
        : { nid: userDetails?.buyer?.nid, dob: userDetails?.buyer?.dob };

    form.setFieldsValue({
      nid: data.nid || "",
      dob: data.dob ? dayjs(data.dob) : null,
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const handleEditModalUpdate = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Updating:", editingType, values);
        // Add your API call here to update the data
        toast.success(
          `${editingType === "supplier" ? "Supplier" : "Buyer"} information updated successfully`
        );
        setIsEditModalVisible(false);
        form.resetFields();
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  // Format amount
  const formatAmount = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined || amount === "") return "--";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  // Render Employment Details content
  const renderEmploymentDetails = () => {
    // Use dummy data for testing, fallback to API data if available
    const employmentStatusInfo =
      userDetails?.employmentStatusInfo ||
      userDetails?.employment?.employmentStatusInfo ||
      userDetails?.user?.employmentStatusInfo ||
      dummyEmploymentData; // Use dummy data for now

    if (
      !employmentStatusInfo ||
      !Array.isArray(employmentStatusInfo) ||
      employmentStatusInfo.length === 0
    ) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No employment details available
        </div>
      );
    }

    return (
      <div style={{ padding: "20px", background: "#fff" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h2
              style={{
                color: "#000",
                fontWeight: 700,
                fontSize: "24px",
                margin: 0,
                marginBottom: "5px",
              }}
            >
              Employment History
            </h2>
            <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
              View all employment records and details
            </p>
          </div>
          <div
            style={{
              padding: "8px 16px",
              background: "#F5F5F5",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#000",
            }}
          >
            {employmentStatusInfo.length} {employmentStatusInfo.length === 1 ? "Record" : "Records"}
          </div>
        </div>

        {/* Employment Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {employmentStatusInfo.map((employment: any, index: number) => {
            const isExpanded = expandedEmploymentCards[index] || false;
            const status = employment.employmentStatus || employment.status || "--";
            const statusColor = getEmploymentStatusColor(status);
            const title =
              employment.occupationTitle ||
              employment.occupation_title ||
              employment.employerName ||
              employment.employer_name ||
              "Employment Record";
            const employerName = employment.employerName || employment.employer_name || "--";
            const joiningDate = employment.joiningDate || employment.joining_date || "--";
            const amount =
              employment.pensionAmount ||
              employment.pension_amount ||
              employment.basicWage ||
              employment.basic_wage ||
              0;

            return (
              <div
                key={index}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                {/* Card Header */}
                <div
                  onClick={() => toggleEmploymentCard(index)}
                  style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: isExpanded ? "#F9F9F9" : "#fff",
                    borderBottom: isExpanded ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                    {/* <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "8px", 
                      background: "#F5F5F5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px"
                    }}>
                      <BankOutlined style={{ fontSize: "20px", color: "#666" }} />
                    </div> */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#000" }}>
                          {title}
                        </h3>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 500,
                            backgroundColor: statusColor,
                            color: "white",
                            textTransform: "capitalize",
                          }}
                        >
                          {status}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        <span>{employerName}</span>
                        <span>•</span>
                        <span>Joined: {joiningDate}</span>
                        {amount > 0 && (
                          <>
                            <span>•</span>
                            <span style={{ fontWeight: 600, color: "#000" }}>
                              {formatAmount(amount)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "16px", color: "#666" }}>
                    {isExpanded ? <UpOutlined /> : <DownOutlined />}
                  </div>
                </div>

                {/* Card Content (Expanded) */}
                {isExpanded && (
                  <div style={{ padding: "20px" }}>
                    <Row gutter={[24, 24]}>
                      {/* Personal Information Section */}
                      <Col xs={24} md={12}>
                        <div style={{ marginBottom: "24px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <UserOutlined style={{ fontSize: "18px", color: "#666" }} />
                            <h4
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#000",
                              }}
                            >
                              Personal Information
                            </h4>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>FULL NAME</span>
                            <span style={styles.value}>
                              {employment.fullName || employment.full_name || "--"}
                            </span>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>EMPLOYMENT TYPE</span>
                            <span style={styles.value}>
                              {employment.employmentType || employment.employment_type || "--"}
                            </span>
                          </div>
                        </div>
                      </Col>

                      {/* Employment Details Section */}
                      <Col xs={24} md={12}>
                        <div style={{ marginBottom: "24px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <BankOutlined style={{ fontSize: "18px", color: "#666" }} />
                            <h4
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#000",
                              }}
                            >
                              Employment Details
                            </h4>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>EMPLOYER NAME</span>
                            <span style={styles.value}>{employerName}</span>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>EMPLOYMENT STATUS</span>
                            <span style={styles.value}>
                              <span
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "16px",
                                  fontSize: "12px",
                                  backgroundColor: statusColor,
                                  color: "white",
                                  textTransform: "capitalize",
                                }}
                              >
                                {status}
                              </span>
                            </span>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>JOINING DATE</span>
                            <span style={styles.value}>{joiningDate}</span>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>WORKING MONTHS</span>
                            <span style={styles.value}>
                              {employment.workingMonths || employment.working_months || 0} months
                            </span>
                          </div>
                        </div>
                      </Col>

                      {/* Occupation Details Section */}
                      {(employment.occupationCode ||
                        employment.occupationCode_meaning ||
                        employment.occupationTitle) && (
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: "24px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "16px",
                              }}
                            >
                              <ClockCircleOutlined style={{ fontSize: "18px", color: "#666" }} />
                              <h4
                                style={{
                                  margin: 0,
                                  fontSize: "16px",
                                  fontWeight: 600,
                                  color: "#000",
                                }}
                              >
                                Occupation Details
                              </h4>
                            </div>
                            {employment.occupationCode && (
                              <div style={styles.fieldRow}>
                                <span style={styles.label}>OCCUPATION CODE</span>
                                <span style={styles.value}>
                                  {employment.occupationCode || employment.occupation_code || "--"}
                                </span>
                              </div>
                            )}
                            {employment.occupationTitle && (
                              <div style={styles.fieldRow}>
                                <span style={styles.label}>OCCUPATION TITLE</span>
                                <span style={styles.value}>
                                  {employment.occupationTitle ||
                                    employment.occupation_title ||
                                    "--"}
                                </span>
                              </div>
                            )}
                            {employment.occupationCode_meaning && (
                              <div style={styles.fieldRow}>
                                <span style={styles.label}>DESCRIPTION</span>
                                <span style={styles.value}>
                                  {employment.occupationCode_meaning || "--"}
                                </span>
                              </div>
                            )}
                          </div>
                        </Col>
                      )}

                      {/* Compensation Details Section */}
                      <Col xs={24} md={12}>
                        <div style={{ marginBottom: "24px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            <DollarOutlined style={{ fontSize: "18px", color: "#666" }} />
                            <h4
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#000",
                              }}
                            >
                              Compensation Details
                            </h4>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>BASIC WAGE</span>
                            <span style={styles.value}>
                              {formatAmount(employment.basicWage || employment.basic_wage)}
                            </span>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>HOUSING ALLOWANCE</span>
                            <span style={styles.value}>
                              {formatAmount(
                                employment.housingAllowance || employment.housing_allowance
                              )}
                            </span>
                          </div>
                          <div style={styles.fieldRow}>
                            <span style={styles.label}>OTHER ALLOWANCE</span>
                            <span style={styles.value}>
                              {formatAmount(
                                employment.otherAllowance || employment.other_allowance
                              )}
                            </span>
                          </div>
                          {employment.isEmployeePensioned && (
                            <>
                              <div style={styles.fieldRow}>
                                <span style={styles.label}>PENSION AMOUNT</span>
                                <span style={styles.value}>
                                  {formatAmount(
                                    employment.pensionAmount || employment.pension_amount
                                  )}
                                </span>
                              </div>
                              <div style={styles.fieldRow}>
                                <span style={styles.label}>PENSION TYPE</span>
                                <span style={styles.value}>
                                  {employment.pensionType || employment.pension_type || "--"}
                                </span>
                              </div>
                              <div style={styles.fieldRow}>
                                <span style={styles.label}>PENSION START DATE</span>
                                <span style={styles.value}>
                                  {employment.pensionStartDate ||
                                    employment.pension_start_date ||
                                    "--"}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Loan Application content
  const renderLoanApplicationContent = () => {
    const loanApplications = userDetails?.loan_applications || [];

    // Format date
    const formatDate = (dateString: string) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return dateString;
      }
    };

    // Format amount
    const formatAmount = (amount: number | string) => {
      if (!amount) return "--";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 0,
      }).format(Number(amount));
    };

    // TableView header configuration
    const loanApplicationHeader = [
      {
        name: "Loan Application Number",
        selector: (row: any) => row.loan_application_number || "--",
        width: "200px",
      },
      {
        name: "Amount",
        selector: (row: any) => formatAmount(row.amount),
      },
      {
        name: "Duration",
        selector: (row: any) => (row.duration ? `${row.duration} months` : "--"),
      },
      {
        name: "Type",
        selector: (row: any) => row.type || "--",
      },
      {
        name: "Status",
        selector: (row: any) => row.status?.name || "--",
      },
      {
        name: "Product",
        selector: (row: any) => row.product?.name || "--",
      },
      {
        name: "Created At",
        selector: (row: any) => formatDate(row.created_at),
      },
      {
        name: "Updated At",
        selector: (row: any) => formatDate(row.updated_at),
      },
      {
        name: "Action",
        cell: (row: any) => (
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#0B8085 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "8px",
              width: "200px",
              padding: "10px 20px",
            }}
            icon={<EyeOutlined />}
            onClick={() => {
              if (row.loan_application_number) {
                navigate(
                  `/FinancingApplications/AllApplications/View/${row.loan_application_number}`
                );
              }
            }}
          >
            View Details
          </Button>
        ),
        // width: "250px",
      },
    ];

    // Map loan applications data
    const tableData = loanApplications.map((loan: any, index: number) => ({
      id: loan.id || index,
      loan_application_number: loan.loan_application_number,
      amount: loan.amount,
      duration: loan.duration,
      type: loan.type,
      status: loan.status,
      product: loan.product,
      created_at: loan.created_at,
      updated_at: loan.updated_at,
    }));

    return (
      <div style={{ background: "#fff" }}>
        <TableView
          header={loanApplicationHeader}
          data={tableData}
          paginationShow={false}
          isLoading={false}
        />
      </div>
    );
  };

  // Render Customer Information content (child tab of Overview)
  const renderCustomerInformation = () => {
    if (!nafathData) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>No data available</div>
      );
    }

    return (
      <div style={{ padding: "20px", background: "#fff" }}>
        {/* Language Headers */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <span style={{ color: "#000", fontWeight: 700, fontSize: "18px" }}>English</span>
          <span style={{ color: "#000", fontWeight: 700, fontSize: "18px" }}>العربية</span>
        </div>

        {/* Personal Information */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "#000", fontWeight: 700, fontSize: "18px", margin: 0 }}>
              Personal Information
            </h2>
            <h2 style={{ color: "#000", fontWeight: 700, fontSize: "18px", margin: 0 }}>
              معلومات شخصية
            </h2>
          </div>
          <div>
            {(
              [
                { enLabel: "NID", arLabel: "الهوية الوطنية", key: "nid" },
                { enLabel: "First Name", arLabel: "الاسم الأول", key: "first_name" },
                { enLabel: "Second Name", arLabel: "الاسم الثاني", key: "second_name" },
                { enLabel: "Third Name", arLabel: "الاسم الثالث", key: "third_name" },
                { enLabel: "Last Name", arLabel: "اسم العائلة", key: "last_name" },
                {
                  enLabel: "Full Name (English)",
                  arLabel: "الاسم الكامل (إنجليزي)",
                  enKey: "full_name_english",
                  arKey: "full_name_arabic",
                },
                {
                  enLabel: "Full Name (Arabic)",
                  arLabel: "الاسم الكامل (عربي)",
                  enKey: "full_name_arabic",
                  arKey: "full_name_english",
                },
                {
                  enLabel: "Date of Birth (Gregorian)",
                  arLabel: "تاريخ الميلاد (ميلادي)",
                  key: "date_of_birth_gregorian",
                },
                {
                  enLabel: "Date of Birth (Hijri)",
                  arLabel: "تاريخ الميلاد (هجري)",
                  key: "date_of_birth_hijri",
                },
                { enLabel: "Gender", arLabel: "جنس", key: "gender" },
                { enLabel: "Nationality", arLabel: "جنسية", key: "nationality" },
                { enLabel: "Nationality Code", arLabel: "رمز الجنسية", key: "nationality_code" },
                { enLabel: "Iqama Number", arLabel: "رقم الإقامة", key: "iqama_number" },
                {
                  enLabel: "Iqama Issue Date",
                  arLabel: "تاريخ إصدار الإقامة",
                  key: "iqama_issue_date",
                },
                {
                  enLabel: "Iqama Expiry Date",
                  arLabel: "تاريخ انتهاء الإقامة",
                  key: "iqama_expiry_date",
                },
                {
                  enLabel: "Iqama Issue Place",
                  arLabel: "مكان إصدار الإقامة",
                  key: "iqama_issue_place",
                },
                { enLabel: "Status", arLabel: "الحالة", key: "status" },
                { enLabel: "Verification Date", arLabel: "تاريخ التحقق", key: "verification_date" },
                { enLabel: "Transaction ID", arLabel: "معرف المعاملة", key: "trans_id" },
                { enLabel: "Request ID", arLabel: "معرف الطلب", key: "request_id" },
              ] as Array<{
                enLabel: string;
                arLabel: string;
                enKey?: string;
                arKey?: string;
                key?: string;
              }>
            ).map((field, index, array) => {
              const getValue = (key?: string, altKey?: string) => {
                if (key && nafathData[key]) {
                  const value = nafathData[key];
                  if (typeof value === "object" && value !== null) {
                    return JSON.stringify(value);
                  }
                  return String(value);
                }
                if (altKey && nafathData[altKey]) {
                  const value = nafathData[altKey];
                  if (typeof value === "object" && value !== null) {
                    return JSON.stringify(value);
                  }
                  return String(value);
                }
                return "-";
              };
              // For fields with both enKey and arKey, show different values
              // Otherwise show the same value in both columns
              const enValue = field.enKey ? getValue(field.enKey) : getValue(field.key);
              const arValue = field.arKey ? getValue(field.arKey) : getValue(field.key);

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < array.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000" }}>
                    {field.enLabel}
                  </div>
                  <div
                    style={{ flex: "0 0 30%", fontSize: "14px", color: "#000", textAlign: "left" }}
                  >
                    {enValue}
                  </div>
                  <div
                    style={{
                      flex: "0 0 30%",
                      fontSize: "14px",
                      color: "#000",
                      textAlign: "right",
                      direction: "rtl",
                    }}
                  >
                    {arValue}
                  </div>
                  <div
                    style={{
                      flex: "0 0 20%",
                      fontSize: "14px",
                      color: "#000",
                      textAlign: "right",
                      direction: "rtl",
                    }}
                  >
                    {field.arLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address Information */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "#000", fontWeight: 700, fontSize: "18px", margin: 0 }}>
              Address Information
            </h2>
            <h2 style={{ color: "#000", fontWeight: 700, fontSize: "18px", margin: 0 }}>
              معلومات العنوان
            </h2>
          </div>
          <div>
            {(
              [
                { enLabel: "City", arLabel: "مدينة", enKey: "city", arKey: "cityL2", key: "city" },
                { enLabel: "City ID", arLabel: "معرف المدينة", key: "cityId" },
                {
                  enLabel: "Region Name",
                  arLabel: "اسم المنطقة",
                  enKey: "regionName",
                  arKey: "regionNameL2",
                },
                { enLabel: "Region ID", arLabel: "معرف المنطقة", key: "regionId" },
                { enLabel: "District", arLabel: "الحي", enKey: "district", arKey: "districtL2" },
                {
                  enLabel: "Street Name",
                  arLabel: "اسم الشارع",
                  enKey: "streetName",
                  arKey: "streetL2",
                },
                { enLabel: "Building Number", arLabel: "رقم المبنى", key: "buildingNumber" },
                { enLabel: "Additional Number", arLabel: "رقم إضافي", key: "additionalNumber" },
                { enLabel: "Post Code", arLabel: "الرمز البريدي", key: "postCode" },
                { enLabel: "Short Address", arLabel: "عنوان قصير", key: "shortAddress" },
                {
                  enLabel: "Location Coordinates",
                  arLabel: "إحداثيات الموقع",
                  key: "locationCoordinates",
                },
                { enLabel: "Is Primary Address", arLabel: "عنوان رئيسي", key: "isPrimaryAddress" },
              ] as Array<{
                enLabel: string;
                arLabel: string;
                enKey?: string;
                arKey?: string;
                key?: string;
              }>
            ).map((field, index, array) => {
              const getValue = (key?: string, altKey?: string) => {
                // Check if the key exists in national_address object
                const nationalAddress = nafathData?.national_address;
                if (nationalAddress && typeof nationalAddress === "object") {
                  if (key && nationalAddress[key]) {
                    const value = nationalAddress[key];
                    if (typeof value === "object" && value !== null) {
                      return JSON.stringify(value);
                    }
                    return String(value);
                  }
                  if (altKey && nationalAddress[altKey]) {
                    const value = nationalAddress[altKey];
                    if (typeof value === "object" && value !== null) {
                      return JSON.stringify(value);
                    }
                    return String(value);
                  }
                }
                // Fallback to direct nafathData access
                if (key && nafathData[key]) {
                  const value = nafathData[key];
                  if (typeof value === "object" && value !== null) {
                    return JSON.stringify(value);
                  }
                  return String(value);
                }
                if (altKey && nafathData[altKey]) {
                  const value = nafathData[altKey];
                  if (typeof value === "object" && value !== null) {
                    return JSON.stringify(value);
                  }
                  return String(value);
                }
                return "-";
              };
              const enValue = getValue(field.enKey, field.key);
              const arValue = getValue(field.arKey, field.key);
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < array.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000" }}>
                    {field.enLabel}
                  </div>
                  <div
                    style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "left" }}
                  >
                    {enValue}
                  </div>
                  <div
                    style={{
                      flex: "0 0 25%",
                      fontSize: "14px",
                      color: "#000",
                      textAlign: "right",
                      direction: "rtl",
                    }}
                  >
                    {arValue}
                  </div>
                  <div
                    style={{
                      flex: "0 0 20%",
                      fontSize: "14px",
                      color: "#000",
                      textAlign: "right",
                      direction: "rtl",
                    }}
                  >
                    {field.arLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to check if item is affordability
  const isAffordabilityQuestion = (item: any) => {
    const category = item.category || item.data?.category || "";
    const originalCategory = item.data?.original_category || "";
    return (
      category?.toLowerCase() === "affordability" ||
      originalCategory?.toLowerCase() === "affordability"
    );
  };

  // Render Affordability Questions content (child tab of Overview)
  const renderAffordabilityQuestions = () => {
    const complianceAnswerHistory = userDetails?.compliance_answer_history || [];
    const complianceAnswers = userDetails?.compliance_answers || [];

    // Combine both compliance_answers and compliance_answer_history
    const allComplianceData = [
      ...complianceAnswers.map((item: any) => ({
        ...item,
        source: "compliance_answers",
      })),
      ...complianceAnswerHistory.map((item: any) => ({
        ...item,
        source: "compliance_answer_history",
      })),
    ];

    // Filter for affordability questions only
    const affordabilityData = allComplianceData.filter(isAffordabilityQuestion);

    if (affordabilityData.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No affordability questions available
        </div>
      );
    }

    // Parse question
    const parseQuestion = (questionString: string) => {
      try {
        return JSON.parse(questionString);
      } catch {
        return { en: questionString, ar: "" };
      }
    };

    // Group by created_at to show history entries
    const groupedByDate = affordabilityData.reduce((acc: any, item: any) => {
      const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown";
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return (
      <div style={{ padding: "20px", background: "#fff" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "#000" }}>
          Affordability Questions
        </h5>
        {sortedDates.map((date, dateIndex) => (
          <div
            key={dateIndex}
            style={{
              marginBottom: "30px",
              padding: "20px",
              background: "#F9F9F9",
              borderRadius: "8px",
            }}
          >
            <h6 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "15px", color: "#000" }}>
              {date}
            </h6>
            <BootstrapRow>
              <BootstrapCol md={6}>
                {groupedByDate[date].map((item: any, index: number) => {
                  const question = parseQuestion(item.question);
                  return (
                    <div
                      key={item.id || index}
                      style={{
                        marginBottom: "15px",
                        paddingBottom: "15px",
                        borderBottom:
                          index < groupedByDate[date].length - 1 ? "1px solid #CFCFCF" : "none",
                      }}
                    >
                      <p
                        style={{
                          color: "#0B0B0B",
                          fontSize: "14px",
                          margin: 0,
                          marginBottom: "5px",
                          fontWeight: 500,
                        }}
                      >
                        {question.en || item.question}
                      </p>
                      <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
                        <span style={{ fontWeight: 500 }}>Answer:</span> {item.answer || "--"}
                      </p>
                      {item.category && (
                        <p style={{ color: "#888", fontSize: "12px", margin: "5px 0 0 0" }}>
                          <span style={{ fontWeight: 500 }}>Category:</span> {item.category}
                        </p>
                      )}
                    </div>
                  );
                })}
              </BootstrapCol>
              <BootstrapCol md={6} style={{ direction: "rtl" }}>
                {groupedByDate[date].map((item: any, index: number) => {
                  const question = parseQuestion(item.question);
                  return (
                    <div
                      key={item.id || index}
                      style={{
                        marginBottom: "15px",
                        paddingBottom: "15px",
                        borderBottom:
                          index < groupedByDate[date].length - 1 ? "1px solid #CFCFCF" : "none",
                      }}
                    >
                      <p
                        style={{
                          color: "#0B0B0B",
                          fontSize: "14px",
                          margin: 0,
                          marginBottom: "5px",
                          fontWeight: 500,
                        }}
                      >
                        {question.ar || question.en || item.question}
                      </p>
                      <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
                        <span style={{ fontWeight: 500 }}>الإجابة:</span> {item.answer || "--"}
                      </p>
                      {item.category && (
                        <p style={{ color: "#888", fontSize: "12px", margin: "5px 0 0 0" }}>
                          <span style={{ fontWeight: 500 }}>الفئة:</span> {item.category}
                        </p>
                      )}
                    </div>
                  );
                })}
              </BootstrapCol>
            </BootstrapRow>
          </div>
        ))}
      </div>
    );
  };

  // Render Compliance Question History content (child tab of Overview)
  const renderComplianceQuestionHistory = () => {
    const complianceAnswerHistory = userDetails?.compliance_answer_history || [];
    const complianceAnswers = userDetails?.compliance_answers || [];

    // Combine both compliance_answers and compliance_answer_history
    const allComplianceData = [
      ...complianceAnswers.map((item: any) => ({
        ...item,
        source: "compliance_answers",
      })),
      ...complianceAnswerHistory.map((item: any) => ({
        ...item,
        source: "compliance_answer_history",
      })),
    ];

    // Filter out affordability questions (they will be shown in separate tab)
    const nonAffordabilityData = allComplianceData.filter(
      (item: any) => !isAffordabilityQuestion(item)
    );

    if (nonAffordabilityData.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No compliance question history available
        </div>
      );
    }

    // Parse question
    const parseQuestion = (questionString: string) => {
      try {
        return JSON.parse(questionString);
      } catch {
        return { en: questionString, ar: "" };
      }
    };

    // Group by created_at to show history entries
    const groupedByDate = nonAffordabilityData.reduce((acc: any, item: any) => {
      const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown";
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return (
      <div style={{ padding: "20px", background: "#fff" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "#000" }}>
          Compliance Question History
        </h5>
        {sortedDates.map((date, dateIndex) => (
          <div
            key={dateIndex}
            style={{
              marginBottom: "30px",
              padding: "20px",
              background: "#F9F9F9",
              borderRadius: "8px",
            }}
          >
            <h6 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "15px", color: "#000" }}>
              {date}
            </h6>
            <BootstrapRow>
              <BootstrapCol md={6}>
                {groupedByDate[date].map((item: any, index: number) => {
                  const question = parseQuestion(item.question);
                  return (
                    <div
                      key={item.id || index}
                      style={{
                        marginBottom: "15px",
                        paddingBottom: "15px",
                        borderBottom:
                          index < groupedByDate[date].length - 1 ? "1px solid #CFCFCF" : "none",
                      }}
                    >
                      <p
                        style={{
                          color: "#0B0B0B",
                          fontSize: "14px",
                          margin: 0,
                          marginBottom: "5px",
                          fontWeight: 500,
                        }}
                      >
                        {question.en || item.question}
                      </p>
                      <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
                        <span style={{ fontWeight: 500 }}>Answer:</span> {item.answer || "--"}
                      </p>
                      {item.category && (
                        <p style={{ color: "#888", fontSize: "12px", margin: "5px 0 0 0" }}>
                          <span style={{ fontWeight: 500 }}>Category:</span> {item.category}
                        </p>
                      )}
                    </div>
                  );
                })}
              </BootstrapCol>
              <BootstrapCol md={6} style={{ direction: "rtl" }}>
                {groupedByDate[date].map((item: any, index: number) => {
                  const question = parseQuestion(item.question);
                  return (
                    <div
                      key={item.id || index}
                      style={{
                        marginBottom: "15px",
                        paddingBottom: "15px",
                        borderBottom:
                          index < groupedByDate[date].length - 1 ? "1px solid #CFCFCF" : "none",
                      }}
                    >
                      <p
                        style={{
                          color: "#0B0B0B",
                          fontSize: "14px",
                          margin: 0,
                          marginBottom: "5px",
                          fontWeight: 500,
                        }}
                      >
                        {question.ar || question.en || item.question}
                      </p>
                      <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
                        <span style={{ fontWeight: 500 }}>الإجابة:</span> {item.answer || "--"}
                      </p>
                      {item.category && (
                        <p style={{ color: "#888", fontSize: "12px", margin: "5px 0 0 0" }}>
                          <span style={{ fontWeight: 500 }}>الفئة:</span> {item.category}
                        </p>
                      )}
                    </div>
                  );
                })}
              </BootstrapCol>
            </BootstrapRow>
          </div>
        ))}
      </div>
    );
  };

  // Render Risk History content (child tab of Overview)
  const renderRiskHistory = () => {
    const kycHistory = userDetails?.kyc_history || [];

    if (kycHistory.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No risk history available
        </div>
      );
    }

    // Format date
    const formatDate = (dateString: string) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return dateString;
      }
    };

    // Parse step data
    const parseStepData = (stepString: string) => {
      try {
        return typeof stepString === "string" ? JSON.parse(stepString) : stepString;
      } catch {
        return {};
      }
    };

    return (
      <div style={{ padding: "20px", background: "#fff" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "#000" }}>
          Risk History
        </h5>
        {kycHistory.map((kyc: any, index: number) => {
          const stepData = parseStepData(kyc.step);
          return (
            <div
              key={kyc.id || index}
              style={{
                marginBottom: "20px",
                padding: "20px",
                background: "#F9F9F9",
                borderRadius: "8px",
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>KYC ID</span>
                    <span style={styles.value}>{kyc.kyc_id || "--"}</span>
                  </div>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>Risk Level</span>
                    <span style={styles.value}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "32px",
                          fontSize: "12px",
                          backgroundColor: getRiskColor(kyc.risk),
                          color: "white",
                          display: "inline-block",
                          textTransform: "capitalize",
                        }}
                      >
                        {kyc.risk || "--"}
                      </span>
                    </span>
                  </div>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>Risk Score</span>
                    <span style={styles.value}>{kyc.risk_score || "--"}</span>
                  </div>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>Is PEP</span>
                    <span style={styles.value}>
                      {kyc.is_pep ? (
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "32px",
                            fontSize: "12px",
                            backgroundColor: "#9C27B0",
                            color: "white",
                            display: "inline-block",
                          }}
                        >
                          Yes
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "32px",
                            fontSize: "12px",
                            backgroundColor: "rgba(63, 195, 128, 0.9)",
                            color: "white",
                            display: "inline-block",
                          }}
                        >
                          No
                        </span>
                      )}
                    </span>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>Status</span>
                    <span style={styles.value}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "32px",
                          fontSize: "12px",
                          backgroundColor:
                            kyc.status === "active" ? "rgba(63, 195, 128, 0.9)" : "#FFC107",
                          color: "white",
                          display: "inline-block",
                          textTransform: "capitalize",
                        }}
                      >
                        {kyc.status || "--"}
                      </span>
                    </span>
                  </div>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>Phone</span>
                    <span style={styles.value}>{kyc.phone || "--"}</span>
                  </div>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>NID</span>
                    <span style={styles.value}>{kyc.nid || "--"}</span>
                  </div>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>Created At</span>
                    <span style={styles.value}>{formatDate(kyc.created_at)}</span>
                  </div>
                </Col>
              </Row>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Block History content (child tab of Overview)
  const renderBlockHistory = () => {
    const blockHistory = userDetails?.block_history || [];

    if (blockHistory.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No block history available
        </div>
      );
    }

    // Format date
    const formatDate = (dateString: string) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return dateString;
      }
    };

    return (
      <div style={{ padding: "20px", background: "#fff" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "#000" }}>
          Block History
        </h5>
        {blockHistory.map((block: any, index: number) => (
          <div
            key={block.id || index}
            style={{
              marginBottom: "20px",
              padding: "20px",
              background: "#F9F9F9",
              borderRadius: "8px",
            }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Block Code</span>
                  <span style={styles.value}>{block.block_code?.code || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Description</span>
                  <span style={styles.value}>{block.block_code?.description || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Action</span>
                  <span style={styles.value}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "32px",
                        fontSize: "12px",
                        backgroundColor:
                          block.action === "block" ? "#F84D4D" : "rgba(63, 195, 128, 0.9)",
                        color: "white",
                        display: "inline-block",
                        textTransform: "capitalize",
                      }}
                    >
                      {block.action || "--"}
                    </span>
                  </span>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Action By</span>
                  <span style={styles.value}>{block.action_by?.name || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Email</span>
                  <span style={styles.value}>{block.action_by?.email || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Reason</span>
                  <span style={styles.value}>{block.reason || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Created At</span>
                  <span style={styles.value}>{formatDate(block.created_at)}</span>
                </div>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* <StepForms userDetails={userDetails} /> */}

      {/* Supplier Details Section */}
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 600, marginBottom: "20px", fontSize: "16px" }}>
          Supplier Details
        </h5>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Phone</span>
              <span style={styles.value}>{userDetails?.user?.phone || "966219088888"}</span>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>UNN Number</span>
              <span style={styles.value}>{userDetails?.supplier?.unn || "7829178917"}</span>
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>NID Number</span>
              <span style={styles.value}>
                {userDetails?.user?.nid || "1972197298"}
                <EditOutlined
                  style={{ marginLeft: "8px", cursor: "pointer", color: "#000" }}
                  onClick={() => handleEditClick("supplier")}
                />
              </span>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Type</span>
              <span style={styles.value}>{userDetails?.supplier?.type || "Business"}</span>
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>DOB</span>
              <span style={styles.value}>
                {userDetails?.user?.dob || "1402-04-15"}
                <EditOutlined
                  style={{ marginLeft: "8px", cursor: "pointer", color: "#000" }}
                  onClick={() => handleEditClick("supplier")}
                />
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Buyer Details Section */}
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 600, marginBottom: "20px", fontSize: "16px" }}>Buyer Details</h5>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Phone</span>
              <span style={styles.value}>{userDetails?.buyer?.phone || "966219800000"}</span>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>UNN Number</span>
              <span style={styles.value}>{userDetails?.buyer?.unn || "7918721987"}</span>
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>NID Number</span>
              <span style={styles.value}>
                {userDetails?.buyer?.nid || "1989327983"}
                <EditOutlined
                  style={{ marginLeft: "8px", cursor: "pointer", color: "#000" }}
                  onClick={() => handleEditClick("buyer")}
                />
              </span>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Type</span>
              <span style={styles.value}>{userDetails?.buyer?.type || "Business"}</span>
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>DOB</span>
              <span style={styles.value}>
                {userDetails?.buyer?.dob || "1402-04-08"}
                <EditOutlined
                  style={{ marginLeft: "8px", cursor: "pointer", color: "#000" }}
                  onClick={() => handleEditClick("buyer")}
                />
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Overview Section with Tabs */}
      <Card bordered={false} style={styles.card}>
        <Tabs
          id="overview-tabs"
          activeKey={selectTab}
          onSelect={(tab: any) => {
            setSelectedTab(tab);
          }}
          className="mb-3"
        >
          <Tab eventKey="Buyer Information" title="Buyer Information">
            {selectTab === "Buyer Information" && <BuyerInfoTabs />}
          </Tab>
          <Tab eventKey="Supplier Information" title="Supplier Information">
            {selectTab === "Supplier Information" && <SupplierInfoTabs />}
          </Tab>
          <Tab eventKey="Overview" title="Overview">
            {selectTab === "Overview" && <OverviewTabs />}
          </Tab>
          <Tab eventKey="Company's Manager List" title="Company's Manager List">
            {selectTab === "Company's Manager List" && <CompanyManagerList />}
          </Tab>
          <Tab eventKey="Bayaan Check" title="Bayaan Check">
            {selectTab === "Bayaan Check" && <BayanTabs />}
          </Tab>
          <Tab eventKey="Credit Check" title="Credit Check">
            {selectTab === "Credit Check" && <CreditCheck />}
          </Tab>
          <Tab eventKey="Invoices" title="Invoices">
            {selectTab === "Invoices" && (
              <div style={{ padding: "20px" }}>
                <FinancingInformation />
              </div>
            )}
          </Tab>
          <Tab eventKey="Documents" title="Documents">
            {selectTab === "Documents" && (
              <div style={{ padding: "20px" }}>
                <h5>Documents</h5>
                <p>Documents content coming soon...</p>
              </div>
            )}
          </Tab>
          <Tab eventKey="Factoring Information" title="Factoring Information">
            {selectTab === "Factoring Information" && <FinancingInformation />}
          </Tab>
          <Tab eventKey="Compliance Check" title="Compliance Check">
            {selectTab === "Compliance Check" && <ComplianceCheck />}
          </Tab>
        </Tabs>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Update Info"
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        onOk={handleEditModalUpdate}
        okText="Update"
        cancelText="Close"
        width={500}
        okButtonProps={{
          style: {
            background: "#1890ff",
            borderColor: "#1890ff",
            height: "38px",
            lineHeight: "38px",
            padding: "0 16px",
          },
        }}
        cancelButtonProps={{
          style: {
            height: "38px",
            lineHeight: "38px",
            padding: "0 16px",
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Row>
            <Col span={24}>
              <Form.Item
                label="NID Number"
                name="nid"
                rules={[{ required: true, message: "Please enter NID number" }]}
              >
                <Input placeholder="Enter NID Number" style={{ height: "38px" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                label="DOB"
                name="dob"
                rules={[{ required: true, message: "Please select DOB" }]}
              >
                <DatePicker
                  className="w-100"
                  format="YYYY-MM-DD"
                  placeholder="Select Date of Birth"
                  style={{ height: "38px" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default LeadDetail;
