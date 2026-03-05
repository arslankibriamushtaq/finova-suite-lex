import React, { useState, useEffect } from "react";
import { Tab, Tabs, Row as BootstrapRow, Col as BootstrapCol, Form } from "react-bootstrap";
import { Row, Col, Card, Spin } from "antd";
import { useParams } from "react-router-dom";
import { getOpportunityDetails } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

interface Field {
  label: string;
  value: string | number;
}

const styles = {
  card: {
    marginBottom: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "var(--foreground)",
  },
  fieldLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--color-text-muted)",
    marginBottom: "8px",
  },
  fieldValue: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--foreground)",
  },
  tabContainer: {
    marginTop: "20px",
  },
  subTabContainer: {
    padding: "20px 0",
  },
  languageHeader: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "var(--foreground)",
  },
  infoSection: {
    marginBottom: "32px",
  },
  infoSectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "var(--foreground)",
  },
  noDataMessage: {
    color: "var(--theme-secondary)",
    fontSize: "14px",
    fontWeight: 400,
    marginTop: "3px",
  },
};

const OpportunityDetail = () => {
  const { id } = useParams();
  const [selectTab, setSelectedTab] = useState<string>("Overview");
  const [subTab, setSubTab] = useState<string>("CustomerInformation");
  const [loading, setLoading] = useState(false);
  const [opportunityDetails, setOpportunityDetails] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchOpportunityDetails();
    }
  }, [id]);

  const fetchOpportunityDetails = async () => {
    try {
      setLoading(true);
      const response = await getOpportunityDetails(id!);
      if (response?.data?.success) {
        setOpportunityDetails(response.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch opportunity details");
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
    if (!opportunityDetails?.compliance_answers) return [];
    return opportunityDetails.compliance_answers.map((answer: any) => ({
      ...answer,
      question: parseQuestion(answer.question),
    }));
  };

  const complianceAnswers = getAllComplianceAnswers();

  // Parse nafath_callback_data for Personal and Address Information
  const nafathData = opportunityDetails?.nafath_callback_data
    ? JSON.parse(opportunityDetails.nafath_callback_data)
    : null;

  const renderCustomerInformation = () => {
    if (!nafathData) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-subtle)" }}>
          <p>No customer information available</p>
        </div>
      );
    }

    return (
      <div style={styles.subTabContainer}>
        <BootstrapRow>
          <BootstrapCol md={6}>
            <h4 style={styles.languageHeader}>English</h4>
          </BootstrapCol>
          <BootstrapCol md={6} style={{ textAlign: "right" }}>
            <h4 style={styles.languageHeader}>العربية</h4>
          </BootstrapCol>
        </BootstrapRow>

        {/* Personal Information */}
        <div style={styles.infoSection}>
          <BootstrapRow>
            <BootstrapCol md={6}>
              <h5 style={styles.infoSectionTitle}>Personal Information</h5>
            </BootstrapCol>
            <BootstrapCol md={6} style={{ textAlign: "right" }}>
              <h5 style={styles.infoSectionTitle}>معلومات شخصية</h5>
            </BootstrapCol>
          </BootstrapRow>

          {[
            { label: "Full name", labelAr: "الإسم الكامل", valueEn: nafathData.englishFullName, valueAr: nafathData.arabicFullName },
            { label: "Family Name", labelAr: "إسم العائلة", valueEn: nafathData.englishLastName, valueAr: nafathData.arabicLastName },
            { label: "National ID (NIN)", labelAr: "الهوية الوطنية (NIN)", valueEn: nafathData.ninNumber, valueAr: nafathData.ninNumber },
            { label: "Gender", labelAr: "جنس", valueEn: nafathData.gender, valueAr: nafathData.gender === "Male" ? "ذكر" : "أنثى" },
            { label: "Nationality", labelAr: "جنسية", valueEn: nafathData.nationalityEn, valueAr: nafathData.nationalityAr },
            { label: "Nationality Code", labelAr: "قانون الجنسية", valueEn: nafathData.nationalityCode, valueAr: nafathData.nationalityCode },
            { label: "Date of Birth (Gregorian)", labelAr: "تاريخ الميلاد (ميلادي)", valueEn: nafathData.dateOfBirthG, valueAr: nafathData.dateOfBirthH },
            { label: "ID Version", labelAr: "نسخة الهوية", valueEn: nafathData.idVersionNumber, valueAr: nafathData.idVersionNumber },
            { label: "ID Issue Date (Gregorian)", labelAr: "تاريخ إصدار الهوية (ميلادي)", valueEn: nafathData.idIssueDateG, valueAr: nafathData.idIssueDateH },
            { label: "ID Expiry Date (Gregorian)", labelAr: "تاريخ إنتهاء صلاحية الهوية (ميلادي)", valueEn: nafathData.idExpiryDateG, valueAr: nafathData.idExpiryDateH },
          ].map((field, index) => (
            <BootstrapRow key={index} style={{ marginBottom: "12px" }}>
              <BootstrapCol md={3}>
                <Form.Label style={styles.fieldLabel}>{field.label}</Form.Label>
              </BootstrapCol>
              <BootstrapCol md={3}>
                <Form.Control
                  type="text"
                  value={String(field.valueEn || "")}
                  readOnly
                  style={{ backgroundColor: "var(--color-surface-subtle)", border: "none" }}
                />
              </BootstrapCol>
              <BootstrapCol md={3}>
                <Form.Control
                  type="text"
                  value={String(field.valueAr || "")}
                  readOnly
                  style={{ backgroundColor: "var(--color-surface-subtle)", border: "none", textAlign: "right" }}
                />
              </BootstrapCol>
              <BootstrapCol md={3} style={{ textAlign: "right" }}>
                <Form.Label style={styles.fieldLabel}>{field.labelAr}</Form.Label>
              </BootstrapCol>
            </BootstrapRow>
          ))}
        </div>

        {/* Address Information */}
        <div style={styles.infoSection}>
          <BootstrapRow>
            <BootstrapCol md={6}>
              <h5 style={styles.infoSectionTitle}>Address Information</h5>
            </BootstrapCol>
            <BootstrapCol md={6} style={{ textAlign: "right" }}>
              <h5 style={styles.infoSectionTitle}>معلومات العنوان</h5>
            </BootstrapCol>
          </BootstrapRow>

          {[
            { label: "Region", labelAr: "منطقة", valueEn: nafathData.regionEn, valueAr: nafathData.regionAr },
            { label: "Region ID", labelAr: "معرّف المنطقة", valueEn: nafathData.regionId, valueAr: nafathData.regionId },
            { label: "City", labelAr: "مدينة", valueEn: nafathData.cityEn, valueAr: nafathData.cityAr },
            { label: "City ID", labelAr: "معرّف المدينة", valueEn: nafathData.cityId, valueAr: nafathData.cityId },
            { label: "District", labelAr: "يصرف", valueEn: nafathData.districtEn, valueAr: nafathData.districtAr },
            { label: "Street Name", labelAr: "إسم الشارع", valueEn: nafathData.streetNameEn, valueAr: nafathData.streetNameAr },
            { label: "Building Number", labelAr: "رقم المبنى", valueEn: nafathData.buildingNumber, valueAr: nafathData.buildingNumber },
            { label: "Additional Number", labelAr: "رقم إضافي", valueEn: nafathData.additionalNumber, valueAr: nafathData.additionalNumber },
            { label: "Post Code", labelAr: "شفرة البريد", valueEn: nafathData.postCode, valueAr: nafathData.postCode },
            { label: "Short Address", labelAr: "عنوان قصير", valueEn: nafathData.shortAddressEn, valueAr: nafathData.shortAddressAr },
            { label: "Location Coordinates", labelAr: "إحداثيات الموقع", valueEn: nafathData.locationCoordinates, valueAr: nafathData.locationCoordinates },
          ].map((field, index) => (
            <BootstrapRow key={index} style={{ marginBottom: "12px" }}>
              <BootstrapCol md={3}>
                <Form.Label style={styles.fieldLabel}>{field.label}</Form.Label>
              </BootstrapCol>
              <BootstrapCol md={3}>
                <Form.Control
                  type="text"
                  value={String(field.valueEn || "")}
                  readOnly
                  style={{ backgroundColor: "var(--color-surface-subtle)", border: "none" }}
                />
              </BootstrapCol>
              <BootstrapCol md={3}>
                <Form.Control
                  type="text"
                  value={String(field.valueAr || "")}
                  readOnly
                  style={{ backgroundColor: "var(--color-surface-subtle)", border: "none", textAlign: "right" }}
                />
              </BootstrapCol>
              <BootstrapCol md={3} style={{ textAlign: "right" }}>
                <Form.Label style={styles.fieldLabel}>{field.labelAr}</Form.Label>
              </BootstrapCol>
            </BootstrapRow>
          ))}

          {/* Full Address */}
          <BootstrapRow style={{ marginTop: "20px" }}>
            <BootstrapCol md={3}>
              <Form.Label style={styles.fieldLabel}>Full Address</Form.Label>
            </BootstrapCol>
            <BootstrapCol md={3}>
              <Form.Control
                as="textarea"
                rows={2}
                value={String(nafathData.fullAddressEn || "")}
                readOnly
                style={{ backgroundColor: "var(--color-surface-subtle)", border: "none" }}
              />
            </BootstrapCol>
            <BootstrapCol md={3}>
              <Form.Control
                as="textarea"
                rows={2}
                value={String(nafathData.fullAddressAr || "")}
                readOnly
                style={{ backgroundColor: "var(--color-surface-subtle)", border: "none", textAlign: "right" }}
              />
            </BootstrapCol>
            <BootstrapCol md={3} style={{ textAlign: "right" }}>
              <Form.Label style={styles.fieldLabel}>العنوان الكامل</Form.Label>
            </BootstrapCol>
          </BootstrapRow>
        </div>
      </div>
    );
  };

  const renderLoanInformation = () => {
    return (
      <div style={styles.subTabContainer}>
        <p style={{ textAlign: "center", color: "var(--color-text-subtle)" }}>Loan information content</p>
      </div>
    );
  };

  const renderBankInformation = () => {
    return (
      <div style={styles.subTabContainer}>
        <p style={{ textAlign: "center", color: "var(--color-text-subtle)" }}>Bank information content</p>
      </div>
    );
  };

  const renderComplianceQuestionsTab = () => {
    if (complianceAnswers.length === 0) {
      return (
        <div style={styles.subTabContainer}>
          <p style={{ textAlign: "center", color: "var(--color-text-subtle)" }}>No compliance questions available</p>
        </div>
      );
    }

    return (
      <div style={styles.subTabContainer}>
        <p style={{ textAlign: "center", color: "var(--color-text-subtle)" }}>Compliance questions content</p>
      </div>
    );
  };

  const renderBlockHistory = () => {
    return (
      <div style={styles.subTabContainer}>
        <div style={{ 
          backgroundColor: "#d1ecf1", 
          border: "1px solid #bee5eb", 
          borderRadius: "4px", 
          padding: "15px",
          color: "#0c5460"
        }}>
          <h6 style={{ margin: 0, marginBottom: "5px", fontWeight: 600 }}>No Block History Found</h6>
          <p style={{ margin: 0 }}>This user has no block/unblock history records.</p>
        </div>
      </div>
    );
  };

  const renderOverviewContent = () => {
    return (
      <Card bordered={false} style={{ ...styles.card, marginTop: "20px" }}>
        <Tabs
          id="overview-sub-tabs"
          activeKey={subTab}
          onSelect={(tab: any) => {
            setSubTab(tab);
          }}
          className="mb-3"
        >
          <Tab eventKey="CustomerInformation" title="Customer Information">
            {subTab === "CustomerInformation" && renderCustomerInformation()}
          </Tab>
          <Tab eventKey="LoanInformation" title="Loan Information">
            {subTab === "LoanInformation" && renderLoanInformation()}
          </Tab>
          <Tab eventKey="BankInformation" title="Bank Information">
            {subTab === "BankInformation" && renderBankInformation()}
          </Tab>
          <Tab eventKey="ComplianceQuestions" title="Compliance Questions">
            {subTab === "ComplianceQuestions" && renderComplianceQuestionsTab()}
          </Tab>
          <Tab eventKey="BlockHistory" title="Block History">
            {subTab === "BlockHistory" && renderBlockHistory()}
          </Tab>
        </Tabs>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
          Customer Detail
        </h2>
      </div>

      {/* Customer Information Section */}
      <Card bordered={false} style={styles.card}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Customer Name</div>
            <div style={styles.fieldValue}>{opportunityDetails?.name || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Customer Name</div>
            <div style={styles.fieldValue}>{opportunityDetails?.name || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Phone</div>
            <div style={styles.fieldValue}>{opportunityDetails?.mobile || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Email</div>
            <div style={styles.fieldValue}>{opportunityDetails?.email || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Loan Type</div>
            <div style={styles.fieldValue}>{opportunityDetails?.loan_type || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>ID</div>
            <div style={styles.fieldValue}>{opportunityDetails?.id || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Type</div>
            <div style={styles.fieldValue}>{opportunityDetails?.type || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Address</div>
            <div style={styles.fieldValue}>{opportunityDetails?.address || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Location</div>
            <div style={styles.fieldValue}>{opportunityDetails?.location || "--"}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.fieldLabel}>Employment Sector Name</div>
            <div style={styles.fieldValue}>{opportunityDetails?.employment_sector_name || "--"}</div>
          </Col>
        </Row>
      </Card>

      {/* Compliance Questions Section */}
      {complianceAnswers.length > 0 ? (
        <Card bordered={false} style={styles.card}>
          <h3 style={styles.sectionTitle}>Compliance Questions</h3>
          <BootstrapRow>
            <BootstrapCol md={6}>
              <h5 style={styles.languageHeader}>Compliance Questions (English)</h5>
              {complianceAnswers.map((answer: any, index: number) => (
                <div key={`en-${index}`} style={{ marginBottom: "16px" }}>
                  <Form.Label style={styles.fieldLabel}>
                    {index + 1}. {answer.question.en}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={String(answer.answer || "")}
                    readOnly
                    style={{ backgroundColor: "var(--color-surface-subtle)", border: "none" }}
                  />
                </div>
              ))}
            </BootstrapCol>
            <BootstrapCol md={6} style={{ textAlign: "right" }}>
              <h5 style={styles.languageHeader}>أسئلة الإلتزام</h5>
              {complianceAnswers.map((answer: any, index: number) => (
                <div key={`ar-${index}`} style={{ marginBottom: "16px" }}>
                  <Form.Label style={{ ...styles.fieldLabel, display: "block" }}>
                    {index + 1}. {answer.question.ar}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={String(answer.answer || "")}
                    readOnly
                    style={{ backgroundColor: "var(--color-surface-subtle)", border: "none", textAlign: "right" }}
                  />
                </div>
              ))}
            </BootstrapCol>
          </BootstrapRow>
        </Card>
      ) : (
        <Card bordered={false} style={styles.card}>
          <h3 style={styles.sectionTitle}>Compliance Questions</h3>
          <BootstrapRow>
            <BootstrapCol md={6}>
              <h5 style={styles.languageHeader}>Compliance Questions (English)</h5>
              <p style={styles.noDataMessage}>No Data Found</p>
            </BootstrapCol>
            <BootstrapCol md={6} style={{ textAlign: "right" }}>
              <h5 style={styles.languageHeader}>أسئلة الإلتزام</h5>
              <p style={{ ...styles.noDataMessage, textAlign: "right" }}>No Data Found</p>
            </BootstrapCol>
          </BootstrapRow>
        </Card>
      )}

      {/* Main Tabs Section */}
      <Card bordered={false} style={styles.card}>
        <Tabs
          id="main-tabs"
          activeKey={selectTab}
          onSelect={(tab: any) => {
            setSelectedTab(tab);
            // Reset sub-tab when switching main tabs
            if (tab === "Overview") {
              setSubTab("CustomerInformation");
            }
          }}
          className="mb-3"
        >
          <Tab eventKey="Overview" title="Overview">
            {selectTab === "Overview" && renderOverviewContent()}
          </Tab>
          <Tab eventKey="LoanApplication" title="Loan Application">
            {selectTab === "LoanApplication" && (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-subtle)" }}>
                <p>Loan Application content</p>
              </div>
            )}
          </Tab>
          <Tab eventKey="OpenBankingCheck" title="Open Banking Check">
            {selectTab === "OpenBankingCheck" && (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-subtle)" }}>
                <p>Open Banking Check content</p>
              </div>
            )}
          </Tab>
          <Tab eventKey="CreditCheck" title="Credit Check">
            {selectTab === "CreditCheck" && (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-subtle)" }}>
                <p>Credit Check content</p>
              </div>
            )}
          </Tab>
        </Tabs>
      </Card>
    </>
  );
};

export default OpportunityDetail;

