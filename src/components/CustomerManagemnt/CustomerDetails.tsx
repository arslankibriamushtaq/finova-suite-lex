import React, { useState, useEffect } from "react";
import { Tab, Tabs, Row as BootstrapRow, Col as BootstrapCol } from "react-bootstrap";
import { Row, Col, Card } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomer360 } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import TableView from "../TableView/TableView";
import { Eye, ShieldOff } from "lucide-react";
import ManageCustomerBlocksModal from "./ManageCustomerBlocksModal";
import { Button } from "../ui/button";

interface Field {
  label: string;
  value: string | number;
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    margin: "0 auto",
    background: "var(--background)",
    borderRadius: 8,
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--border)",
    padding: "12px 0",
    fontSize: 14,
  },
  label: {
    color: "var(--foreground)",
    fontWeight: 400,
  },
  value: {
    fontWeight: 600,
    color: "var(--foreground)",
  },
};

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectTab, setSelectedTab] = useState<string>("Overview");
  const [overviewChildTab, setOverviewChildTab] = useState<string>("Customer Information");
  const [loading, setLoading] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchCustomer360();
    }
  }, [id]);

  const fetchCustomer360 = async () => {
    try {
      setLoading(true);
      const response = await getCustomer360(id!);
      if (response?.data?.data) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to fetch customer details"
      );
    } finally {
      setLoading(false);
    }
  };

  const customer = data?.customer;
  const personalInfo = data?.personalInfo;
  const addressInfo = data?.addressInfo;
  const kycInfo = data?.kycInfo;
  const kycSteps = data?.kycSteps || [];
  const kycWeightageData = data?.kycWeightageData || [];
  const riskInfo = data?.riskInfo;
  const riskHistory = data?.riskHistory || [];
  const complianceQuestionHistory = data?.complianceQuestionHistory || [];
  const loanApplications = data?.loanApplications || [];
  const bankAccounts = data?.bankAccounts || [];

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case "HIGH":
      case "HIGHRISK":
        return "var(--color-error)";
      case "MEDIUM":
        return "var(--color-warning)";
      case "LOW":
        return "var(--color-success)";
      default:
        return "var(--color-warning)";
    }
  };

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

  const formatDateTime = (dateString: string) => {
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

  // Format amount
  const formatAmount = (amount: number | string | null) => {
    if (!amount) return "--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  // Customer summary columns
  const leftColumn: Field[] = [
    { label: "Customer Name", value: customer?.fullName || "--" },
    { label: "Phone", value: customer?.mobileNumber || "--" },
    { label: "ID", value: customer?.nationalId || "--" },
    { label: "Customer Type", value: customer?.customerType || "--" },
  ];

  const rightColumn: Field[] = [
    { label: "Customer Name", value: customer?.fullName || "--" },
    { label: "Email", value: customer?.email || "--" },
    { label: "Nationality", value: customer?.nationality || "--" },
  ];

  // ──────────── Onboarding Stepper ────────────
  const renderStepper = () => {
    if (!kycSteps || kycSteps.length === 0) return null;

    const currentStep = kycSteps.findIndex((s: any) => s.status !== "completed");
    const activeIndex = currentStep === -1 ? kycSteps.length - 1 : currentStep;

    return (
      <Card bordered={false} style={{ ...styles.card, padding: "24px" }}>
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          {kycSteps.map((step: any, index: number) => {
            const isCompleted = step.status === "completed";
            const isActive = index === activeIndex;
            return (
              <React.Fragment key={index}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isCompleted || isActive
                        ? "var(--stepper-accent-bg, linear-gradient(135deg, #1f2940 0%, #0f172a 100%))"
                        : "var(--surface-card-alt, #e2e8f0)",
                      border: isCompleted || isActive
                        ? "2px solid var(--stepper-accent-border, #0f172a)"
                        : "2px solid var(--surface-border-strong, #94a3b8)",
                      boxShadow: isActive
                        ? "0 0 0 4px var(--stepper-accent-ring, rgba(15, 23, 42, 0.18)), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                        : isCompleted
                          ? "inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                          : "none",
                      color: isCompleted || isActive ? "#ffffff" : "var(--muted-foreground, #64748b)",
                      fontWeight: 600,
                      fontSize: 13,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {index + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      marginTop: 8,
                      color: isCompleted || isActive
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                      fontWeight: isActive ? 600 : 500,
                      textAlign: "center",
                      maxWidth: 100,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {index < kycSteps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      backgroundColor: isCompleted
                        ? "var(--stepper-accent, #2563eb)"
                        : "var(--surface-border-strong, #94a3b8)",
                      marginTop: -20,
                      borderRadius: 2,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Step Details */}
        <Card bordered style={{ borderRadius: 8, borderColor: "var(--border)" }}>
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: "var(--foreground)" }}>
            {kycSteps[activeIndex]?.label}
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--foreground)" }}>{kycSteps[activeIndex]?.label}</span>
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: kycSteps[activeIndex]?.status === "completed" ? "#00B96B" : "#E5E7EB",
                display: "inline-block",
              }}
            />
          </div>
        </Card>

        {/* Next Step Button */}
        {activeIndex < kycSteps.length - 1 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button
              style={{
                background: "var(--stepper-accent, #2563eb)",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "8px 24px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Next Step
            </button>
          </div>
        )}
      </Card>
    );
  };

  // ──────────── KYC Information ────────────
  const renderKycInformation = () => {
    if (!kycInfo) return null;

    return (
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "18px", color: "var(--foreground)" }}>
          KYC Information
        </h5>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>KYC ID</span>
              <span style={styles.value}>{kycInfo.kycId || "--"}</span>
            </div>
            <div style={styles.fieldRow}>
              <span style={styles.label}>KYC Status</span>
              <span style={styles.value}>{kycInfo.kycStatus || "--"}</span>
            </div>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Risk Level</span>
              <span style={styles.value}>
                {kycInfo.riskLevel ? (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: getRiskColor(kycInfo.riskLevel),
                      color: "white",
                    }}
                  >
                    {kycInfo.riskLevel}
                  </span>
                ) : "--"}
              </span>
            </div>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Compliance Status</span>
              <span style={styles.value}>{kycInfo.complianceStatus || "--"}</span>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Risk Score</span>
              <span style={styles.value}>{kycInfo.riskScore || "--"}</span>
            </div>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Is PEP</span>
              <span style={styles.value}>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: kycInfo.isPep ? "var(--color-error)" : "var(--color-success)",
                    color: "white",
                  }}
                >
                  {kycInfo.isPep ? "Yes" : "No"}
                </span>
              </span>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // ──────────── KYC Steps ────────────
  const renderKycSteps = () => {
    if (!kycSteps || kycSteps.length === 0) return null;

    return (
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "18px", color: "var(--foreground)" }}>
          KYC Steps
        </h5>
        <Row gutter={[24, 16]}>
          {kycSteps.map((step: any, index: number) => {
            const isCompleted = step.status === "completed";
            return (
              <Col xs={24} md={12} key={index}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <span style={{ fontSize: "14px", color: "var(--foreground)" }}>{step.label}</span>
                  <span
                    style={{
                      padding: "4px 16px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: isCompleted ? "var(--color-success)" : "var(--color-error)",
                      color: "white",
                    }}
                  >
                    {isCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
    );
  };

  // ──────────── KYC Data with Weightage ────────────
  const renderKycWeightage = () => {
    if (!kycWeightageData || kycWeightageData.length === 0) return null;

    const weightageHeader = [
      { name: "Category", selector: (row: any) => row.category || "--" },
      { name: "LOV Type", selector: (row: any) => row.lovType || row.lov_type || "--" },
      { name: "Question ID", selector: (row: any) => row.questionId || row.question_id || "--" },
      { name: "Factor Weight", selector: (row: any) => row.factorWeight || row.factor_weight || "--" },
      { name: "Category Weight", selector: (row: any) => row.categoryWeight || row.category_weight || "--" },
      { name: "Calculated Score", selector: (row: any) => row.calculatedScore || row.calculated_score || "--" },
      { name: "Calculated At", selector: (row: any) => formatDateTime(row.calculatedAt || row.calculated_at) },
    ];

    return (
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "18px", color: "var(--foreground)" }}>
          KYC Data with Weightage
        </h5>
        <TableView header={weightageHeader} data={kycWeightageData} paginationShow={false} isLoading={false} />
      </Card>
    );
  };

  // ──────────── Customer Information Tab ────────────
  const renderCustomerInformation = () => {
    if (!personalInfo) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No data available
        </div>
      );
    }

    const renderFieldRows = (
      fields: Array<{ enLabel: string; arLabel: string; value: string; arValue?: string }>
    ) => {
      return fields.map((field, index, array) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: index < array.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <div style={{ flex: "0 0 20%", fontSize: "14px", color: "var(--foreground)" }}>{field.enLabel}</div>
          <div style={{ flex: "0 0 30%", fontSize: "14px", color: "var(--foreground)", textAlign: "left" }}>{field.value || "-"}</div>
          <div style={{ flex: "0 0 30%", fontSize: "14px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>{field.arValue || field.value || "-"}</div>
          <div style={{ flex: "0 0 20%", fontSize: "14px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>{field.arLabel}</div>
        </div>
      ));
    };

    const personalFields = [
      { enLabel: "NID", arLabel: "الهوية الوطنية", value: personalInfo.nationalId, arValue: personalInfo.nationalId },
      { enLabel: "First Name", arLabel: "الاسم الأول", value: personalInfo.firstName, arValue: personalInfo.firstNameAr },
      { enLabel: "Second Name", arLabel: "الاسم الثاني", value: personalInfo.secondName, arValue: personalInfo.secondNameAr },
      { enLabel: "Third Name", arLabel: "الاسم الثالث", value: personalInfo.thirdName, arValue: personalInfo.thirdNameAr },
      { enLabel: "Last Name", arLabel: "اسم العائلة", value: personalInfo.lastName, arValue: personalInfo.lastNameAr },
      { enLabel: "Full Name (English)", arLabel: "الاسم الكامل (إنجليزي)", value: personalInfo.fullNameEn, arValue: personalInfo.fullNameAr },
      { enLabel: "Full Name (Arabic)", arLabel: "الاسم الكامل (عربي)", value: personalInfo.fullNameAr, arValue: personalInfo.fullNameEn },
      { enLabel: "Date of Birth (Gregorian)", arLabel: "تاريخ الميلاد (ميلادي)", value: personalInfo.dateOfBirthGregorian },
      { enLabel: "Date of Birth (Hijri)", arLabel: "تاريخ الميلاد (هجري)", value: personalInfo.dateOfBirthHijri },
      { enLabel: "Gender", arLabel: "جنس", value: personalInfo.gender },
      { enLabel: "Nationality", arLabel: "جنسية", value: personalInfo.nationality },
      { enLabel: "Nationality Code", arLabel: "رمز الجنسية", value: personalInfo.nationalityCode },
      { enLabel: "Iqama Number", arLabel: "رقم الإقامة", value: personalInfo.iqamaNumber },
      { enLabel: "Iqama Issue Date", arLabel: "تاريخ إصدار الإقامة", value: personalInfo.iqamaIssueDate },
      { enLabel: "Iqama Expiry Date", arLabel: "تاريخ انتهاء الإقامة", value: personalInfo.iqamaExpiryDate },
      { enLabel: "Iqama Issue Place", arLabel: "مكان إصدار الإقامة", value: personalInfo.iqamaIssuePlace },
      { enLabel: "Status", arLabel: "الحالة", value: personalInfo.status },
      { enLabel: "Verification Date", arLabel: "تاريخ التحقق", value: personalInfo.verificationDate },
      { enLabel: "Transaction ID", arLabel: "معرف المعاملة", value: personalInfo.transactionId },
      { enLabel: "Request ID", arLabel: "معرف الطلب", value: personalInfo.requestId },
    ];

    const addressFields = [
      { enLabel: "City", arLabel: "مدينة", value: addressInfo?.city },
      { enLabel: "City ID", arLabel: "معرف المدينة", value: addressInfo?.cityId },
      { enLabel: "Region Name", arLabel: "اسم المنطقة", value: addressInfo?.regionName },
      { enLabel: "Region ID", arLabel: "معرف المنطقة", value: addressInfo?.regionId },
      { enLabel: "District", arLabel: "الحي", value: addressInfo?.district },
      { enLabel: "Street Name", arLabel: "اسم الشارع", value: addressInfo?.streetName },
      { enLabel: "Building Number", arLabel: "رقم المبنى", value: addressInfo?.buildingNumber },
      { enLabel: "Additional Number", arLabel: "رقم إضافي", value: addressInfo?.additionalNumber },
      { enLabel: "Post Code", arLabel: "الرمز البريدي", value: addressInfo?.postCode },
      { enLabel: "Short Address", arLabel: "عنوان قصير", value: addressInfo?.shortAddress },
      { enLabel: "Location Coordinates", arLabel: "إحداثيات الموقع", value: addressInfo?.locationCoordinates },
      { enLabel: "Is Primary Address", arLabel: "عنوان رئيسي", value: addressInfo?.isPrimaryAddress?.toString() },
    ];

    return (
      <div style={{ padding: "20px", background: "var(--background)" }}>
        {/* Language Headers */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px" }}>English</span>
          <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px" }}>العربية</span>
        </div>

        {/* Personal Information */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>Personal Information</h2>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>معلومات شخصية</h2>
          </div>
          {renderFieldRows(personalFields)}
        </div>

        {/* Address Information */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>Address Information</h2>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>معلومات العنوان</h2>
          </div>
          {renderFieldRows(addressFields)}
        </div>
      </div>
    );
  };

  // ──────────── Compliance Question History Tab ────────────
  const renderComplianceQuestionHistory = () => {
    if (complianceQuestionHistory.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No compliance question history available
        </div>
      );
    }

    return (
      <div style={{ padding: "20px", background: "var(--background)" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--foreground)" }}>
          Compliance Question History
        </h5>
        {complianceQuestionHistory.map((entry: any, entryIndex: number) => {
          const entryDate = entry.date ? new Date(entry.date).toLocaleDateString() : "Unknown";
          const answers = entry.answers || [];

          return (
            <div
              key={entryIndex}
              style={{ marginBottom: "30px", padding: "20px", background: "var(--muted)", borderRadius: "8px" }}
            >
              <h6 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "15px", color: "var(--foreground)" }}>
                {entryDate}
              </h6>
              <BootstrapRow>
                <BootstrapCol md={6}>
                  {answers.map((item: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "15px",
                        paddingBottom: "15px",
                        borderBottom: index < answers.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <p style={{ color: "var(--foreground)", fontSize: "14px", margin: 0, marginBottom: "3px", fontWeight: 700 }}>
                        {item.questionEn || "--"}
                      </p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "13px", margin: 0 }}>
                        Answer: {item.answer || "--"}
                      </p>
                      {item.category && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "3px 0 0 0" }}>
                          Category: {item.category}
                        </p>
                      )}
                      {item.factorWeightPct && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "3px 0 0 0" }}>
                          Factor Weight: {item.factorWeightPct}%
                        </p>
                      )}
                      {item.categoryWeight && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "3px 0 0 0" }}>
                          Category Weight: {item.categoryWeight}
                        </p>
                      )}
                      {item.scoreContribution && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "3px 0 0 0" }}>
                          Score Contribution: {item.scoreContribution}
                        </p>
                      )}
                      {item.calculationDetail && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", margin: "3px 0 0 0", fontStyle: "italic" }}>
                          {item.calculationDetail}
                        </p>
                      )}
                    </div>
                  ))}
                </BootstrapCol>
                <BootstrapCol md={6} style={{ direction: "rtl" }}>
                  {answers.map((item: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "15px",
                        paddingBottom: "15px",
                        borderBottom: index < answers.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <p style={{ color: "var(--foreground)", fontSize: "14px", margin: 0, marginBottom: "3px", fontWeight: 700 }}>
                        {item.questionAr || item.questionEn || "--"}
                      </p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "13px", margin: 0 }}>
                        الإجابة: {item.answer || "--"}
                      </p>
                      {item.category && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "3px 0 0 0" }}>
                          الفئة: {item.category}
                        </p>
                      )}
                      {item.factorWeightPct && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "3px 0 0 0" }}>
                          وزن العامل: %{item.factorWeightPct}
                        </p>
                      )}
                      {item.categoryWeight && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "3px 0 0 0" }}>
                          وزن الفئة: {item.categoryWeight}
                        </p>
                      )}
                      {item.scoreContribution && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "3px 0 0 0" }}>
                          مساهمة النقاط: {item.scoreContribution}
                        </p>
                      )}
                      {item.calculationDetail && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", margin: "3px 0 0 0", fontStyle: "italic" }}>
                          {item.calculationDetail}
                        </p>
                      )}
                    </div>
                  ))}
                </BootstrapCol>
              </BootstrapRow>
            </div>
          );
        })}
      </div>
    );
  };

  // ──────────── Risk History Tab ────────────
  const renderRiskHistory = () => {
    const riskCalculation = data?.riskCalculation;
    const hasRiskInfo = riskInfo;
    const hasRiskHistory = riskHistory.length > 0;
    const hasRiskCalculation = riskCalculation;

    if (!hasRiskInfo && !hasRiskHistory && !hasRiskCalculation) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No risk history available
        </div>
      );
    }

    return (
      <div style={{ padding: "20px", background: "var(--background)" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--foreground)" }}>
          Risk History
        </h5>

        {/* Current Risk Info */}
        {hasRiskInfo && (
          <div style={{ marginBottom: "20px", padding: "20px", background: "var(--muted)", borderRadius: "8px" }}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>KYC ID</span>
                  <span style={styles.value}>{riskInfo.kycId || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Risk Level</span>
                  <span style={styles.value}>
                    {riskInfo.riskLevel ? (
                      <span style={{ padding: "6px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: getRiskColor(riskInfo.riskLevel), color: "white", display: "inline-block" }}>
                        {riskInfo.riskLevel}
                      </span>
                    ) : "--"}
                  </span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Risk Score</span>
                  <span style={styles.value}>{riskInfo.riskScore || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Is PEP</span>
                  <span style={styles.value}>
                    <span style={{ padding: "6px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: riskInfo.isPep ? "var(--color-error)" : "var(--color-success)", color: "white", display: "inline-block" }}>
                      {riskInfo.isPep ? "Yes" : "No"}
                    </span>
                  </span>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Status</span>
                  <span style={styles.value}>
                    <span style={{ padding: "6px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: riskInfo.status?.toLowerCase() === "active" ? "var(--color-success)" : "var(--color-warning)", color: "white", display: "inline-block", textTransform: "capitalize" }}>
                      {riskInfo.status || "--"}
                    </span>
                  </span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Phone</span>
                  <span style={styles.value}>{riskInfo.phone || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>NID</span>
                  <span style={styles.value}>{riskInfo.nationalId || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Created At</span>
                  <span style={styles.value}>{formatDateTime(riskInfo.createdAt)}</span>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Risk Calculation Details */}
        {hasRiskCalculation && (
          <div style={{ marginBottom: "20px", padding: "20px", background: "var(--muted)", borderRadius: "8px" }}>
            <h6 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "15px", color: "var(--foreground)" }}>
              Risk Calculation
            </h6>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Total Score</span>
                  <span style={styles.value}>{riskCalculation.totalScore || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Risk Level</span>
                  <span style={styles.value}>
                    {riskCalculation.riskLevel ? (
                      <span style={{ padding: "6px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: getRiskColor(riskCalculation.riskLevel), color: "white", display: "inline-block" }}>
                        {riskCalculation.riskLevel}
                      </span>
                    ) : "--"}
                  </span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>PEP Flag</span>
                  <span style={styles.value}>
                    <span style={{ padding: "6px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: riskCalculation.pepFlag ? "var(--color-error)" : "var(--color-success)", color: "white", display: "inline-block" }}>
                      {riskCalculation.pepFlag ? "Yes" : "No"}
                    </span>
                  </span>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>EDD Flag</span>
                  <span style={styles.value}>
                    <span style={{ padding: "6px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: riskCalculation.eddFlag ? "var(--color-warning)" : "var(--color-success)", color: "white", display: "inline-block" }}>
                      {riskCalculation.eddFlag ? "Yes" : "No"}
                    </span>
                  </span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Dominant Override</span>
                  <span style={styles.value}>{riskCalculation.dominantOverride ? "Yes" : "No"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Session ID</span>
                  <span style={styles.value} title={riskCalculation.sessionId}>{riskCalculation.sessionId ? riskCalculation.sessionId.substring(0, 16) + "..." : "--"}</span>
                </div>
              </Col>
            </Row>
            {riskCalculation.formula && (
              <div style={{ marginTop: "12px", padding: "12px", background: "var(--background)", borderRadius: "6px", fontSize: "13px", color: "var(--muted-foreground)", wordBreak: "break-all" }}>
                <span style={{ fontWeight: 600 }}>Formula:</span> {riskCalculation.formula}
              </div>
            )}
          </div>
        )}

        {/* Risk Assessment History */}
        {hasRiskHistory && riskHistory.map((assessment: any, index: number) => (
          <div
            key={assessment.assessmentId || index}
            style={{ marginBottom: "20px", padding: "20px", background: "var(--muted)", borderRadius: "8px" }}
          >
            <h6 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "15px", color: "var(--foreground)" }}>
              Assessment #{index + 1}
            </h6>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Assessment ID</span>
                  <span style={styles.value} title={assessment.assessmentId}>{assessment.assessmentId ? assessment.assessmentId.substring(0, 16) + "..." : "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Risk Grade</span>
                  <span style={styles.value}>
                    {assessment.riskGrade ? (
                      <span style={{ padding: "6px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: getRiskColor(assessment.riskGrade), color: "white", display: "inline-block" }}>
                        {assessment.riskGrade}
                      </span>
                    ) : "--"}
                  </span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Overall Risk Score</span>
                  <span style={styles.value}>{assessment.overallRiskScore || "--"}</span>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Assessment Type</span>
                  <span style={styles.value}>{assessment.assessmentType || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Recommended Action</span>
                  <span style={styles.value}>{assessment.recommendedAction || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Completed At</span>
                  <span style={styles.value}>{assessment.completedAt ? formatDateTime(assessment.completedAt) : "--"}</span>
                </div>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    );
  };

  // ──────────── Block History Tab ────────────
  const renderBlockHistory = () => {
    const blockHistory = data?.blockHistory || [];

    if (blockHistory.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No block history available
        </div>
      );
    }

    return (
      <div style={{ padding: "20px", background: "var(--background)" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--foreground)" }}>
          Block History
        </h5>
        {blockHistory.map((block: any, index: number) => (
          <div
            key={block.id || index}
            style={{ marginBottom: "20px", padding: "20px", background: "var(--muted)", borderRadius: "8px" }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Block Code</span>
                  <span style={styles.value}>{block.blockCode?.code || block.block_code?.code || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Description</span>
                  <span style={styles.value}>{block.blockCode?.description || block.block_code?.description || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Action</span>
                  <span style={styles.value}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "32px",
                        fontSize: "12px",
                        backgroundColor: block.action === "block" ? "var(--color-error)" : "var(--color-success)",
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
                  <span style={styles.value}>{block.actionBy?.name || block.action_by?.name || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Email</span>
                  <span style={styles.value}>{block.actionBy?.email || block.action_by?.email || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Reason</span>
                  <span style={styles.value}>{block.reason || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Created At</span>
                  <span style={styles.value}>{formatDateTime(block.createdAt || block.created_at)}</span>
                </div>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    );
  };

  // ──────────── Loan Application Tab ────────────
  const renderLoanApplicationContent = () => {
    const loanApplicationHeader = [
      { name: "Loan Application Number", selector: (row: any) => row.applicationNumber || "--", width: "200px" },
      { name: "Amount", selector: (row: any) => formatAmount(row.amount) },
      { name: "Duration", selector: (row: any) => row.duration || "--" },
      { name: "Type", selector: (row: any) => row.type || "--" },
      {
        name: "Status",
        cell: (row: any) => {
          const status = row.status || "--";
          const statusColor =
            status === "APPROVED" ? "var(--color-success)" :
            status === "REJECTED" ? "var(--color-error)" :
            status === "DRAFT" ? "#8C8C8C" :
            "var(--color-warning)";
          return (
            <span style={{ padding: "4px 10px", borderRadius: "16px", fontSize: "12px", backgroundColor: statusColor, color: "white" }}>
              {status}
            </span>
          );
        },
      },
      { name: "Product", selector: (row: any) => row.product || "--" },
      { name: "Created At", selector: (row: any) => formatDate(row.createdAt) },
      { name: "Updated At", selector: (row: any) => formatDate(row.updatedAt) },
      {
        name: "Action",
        cell: (row: any) => (
          <button
            style={{
              backgroundColor: "var(--color-action)",
              color: "var(--foreground)",
              border: "1px solid white",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
            onClick={() => {
              if (row.applicationNumber) {
                navigate(`/FinancingApplications/AllApplications/View/${row.applicationNumber}`, {
                  state: { rowData: row }
                });
              }
            }}
          >
            <Eye size={16} />
            View Details
          </button>
        ),
      },
    ];

    return (
      <div style={{ background: "var(--background)" }}>
        <TableView header={loanApplicationHeader} data={loanApplications} paginationShow={false} isLoading={false} />
      </div>
    );
  };

  // ──────────── Bank Accounts Section ────────────
  const renderBankAccounts = () => {
    if (!bankAccounts || bankAccounts.length === 0) return null;

    const bankHeader = [
      { name: "Bank Name", selector: (row: any) => row.bankName || "--" },
      { name: "Bank Code", selector: (row: any) => row.bankCode || "--" },
      { name: "IBAN", selector: (row: any) => row.iban || "--", width: "250px" },
      { name: "Account Type", selector: (row: any) => row.accountType || "--" },
      { name: "Primary", selector: (row: any) => row.isPrimary ? "Yes" : "No" },
      {
        name: "Status",
        cell: (row: any) => (
          <span style={{
            padding: "4px 10px",
            borderRadius: "16px",
            fontSize: "12px",
            backgroundColor: row.status === "VERIFIED" ? "var(--color-success)" : "var(--color-warning)",
            color: "white",
          }}>
            {row.status || "--"}
          </span>
        ),
      },
      { name: "Created At", selector: (row: any) => formatDate(row.createdAt) },
    ];

    return (
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "18px", color: "var(--foreground)" }}>
          Bank Accounts
        </h5>
        {data?.walletIban && (
          <div style={{ ...styles.fieldRow, marginBottom: "16px" }}>
            <span style={styles.label}>Wallet IBAN</span>
            <span style={styles.value}>{data.walletIban}</span>
          </div>
        )}
        <TableView header={bankHeader} data={bankAccounts} paginationShow={false} isLoading={false} />
      </Card>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
          Customer Detail
        </h2>
      </div>

      {/* Onboarding Stepper */}
      {renderStepper()}

      {/* Customer Summary Card */}
      <Card bordered={false} style={styles.card}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            {leftColumn.map((item, index) => (
              <div key={index} style={styles.fieldRow}>
                <span style={styles.label}>{item.label}</span>
                <span style={styles.value}>{item.value}</span>
              </div>
            ))}
          </Col>
          <Col xs={24} md={12}>
            {rightColumn.map((item, index) => (
              <div key={index} style={styles.fieldRow}>
                <span style={styles.label}>{item.label}</span>
                <span style={styles.value}>{item.value}</span>
              </div>
            ))}
          </Col>
        </Row>
      </Card>

      {/* Block Status */}
      <Card bordered={false} style={{ ...styles.card, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h5 style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", margin: 0 }}>Block Status</h5>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowBlockModal(true)}>
            <ShieldOff size={14} />
            Manage Blocks
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          {customer?.isBlocked ? (
            <span style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: "var(--color-error)", color: "white" }}>
              BLOCKED
            </span>
          ) : (
            <span style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: "var(--color-success)", color: "white" }}>
              CLEAR
            </span>
          )}
          {Array.isArray(customer?.blockCodes) && customer.blockCodes.map((code: string, i: number) => (
            <span key={i} style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 500, background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
              {code}
            </span>
          ))}
        </div>
      </Card>

      {/* KYC Information */}
      {renderKycInformation()}

      {/* KYC Steps */}
      {renderKycSteps()}

      {/* KYC Data with Weightage */}
      {renderKycWeightage()}

      {/* Bank Accounts */}
      {renderBankAccounts()}

      {/* Main Tabs: Overview | Loan Application */}
      <Card bordered={false} style={styles.card}>
        <Tabs
          id="main-tabs"
          activeKey={selectTab}
          onSelect={(tab: any) => setSelectedTab(tab)}
          className="mb-3"
        >
          <Tab eventKey="Overview" title="Overview">
            {selectTab === "Overview" && (
              <Tabs
                id="overview-child-tabs"
                activeKey={overviewChildTab}
                onSelect={(tab: any) => setOverviewChildTab(tab)}
                className="mb-3"
              >
                <Tab eventKey="Customer Information" title="Customer Information">
                  {overviewChildTab === "Customer Information" && renderCustomerInformation()}
                </Tab>
                <Tab eventKey="Compliance Question History" title="Compliance Question History">
                  {overviewChildTab === "Compliance Question History" && renderComplianceQuestionHistory()}
                </Tab>
                <Tab eventKey="Risk History" title="Risk History">
                  {overviewChildTab === "Risk History" && renderRiskHistory()}
                </Tab>
                <Tab eventKey="Block History" title="Block History">
                  {overviewChildTab === "Block History" && renderBlockHistory()}
                </Tab>
              </Tabs>
            )}
          </Tab>
          <Tab eventKey="Loan Application" title="Loan Application">
            {selectTab === "Loan Application" && renderLoanApplicationContent()}
          </Tab>
        </Tabs>
      </Card>
      {id && (
        <ManageCustomerBlocksModal
          open={showBlockModal}
          customerId={id}
          onClose={() => setShowBlockModal(false)}
        />
      )}
    </>
  );
};

export default CustomerDetail;
