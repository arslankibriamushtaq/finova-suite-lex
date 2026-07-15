import React from "react";
import { Row, Col, Card } from "antd";
import { useTranslation } from "react-i18next";

interface Field {
  label: string;
  value: string | number;
}

const FinancingInformation: React.FC = () => {
  const { t } = useTranslation("customerManagement");

  const leftColumn: Field[] = [
    { label: t("leadTabs.financingInformation.dateOfBirth"), value: "09-12-1987" },
    { label: t("leadTabs.financingInformation.nationalIqamaId"), value: "1049966607" },
    { label: t("common:email"), value: "tuba.khan@customer.com" },
    { label: t("leadTabs.financingInformation.duration"), value: "06 Months" },
    { label: t("leadTabs.financingInformation.crNumber"), value: "1743798589" },
    { label: t("leadTabs.financingInformation.residedCurrentYearUsa"), value: "No" },
    { label: t("leadTabs.financingInformation.taxResidentOutsideSaudi"), value: "No" },
    { label: t("leadTabs.financingInformation.balloonPayment"), value: "20" },
    { label: t("leadTabs.financingInformation.ibanCertificate"), value: "Preview Document" },
    { label: t("leadTabs.financingInformation.sourceIncome"), value: "Source 1" },
    { label: t("leadTabs.financingInformation.zakatCertificate"), value: "Preview Document" },
    { label: t("leadTabs.financingInformation.purposeOfFactoring"), value: "Purpose 1" },
  ];

  const rightColumn: Field[] = [
    { label: t("leadTabs.financingInformation.lei"), value: "1234" },
    { label: t("leadTabs.financingInformation.iban"), value: "SA6567854357728193769000" },
    { label: t("leadTabs.financingInformation.mobileNumber"), value: "966123456789" },
    { label: t("leadTabs.financingInformation.bornInUsa"), value: "No" },
    { label: t("leadTabs.financingInformation.legalForm"), value: "Company" },
    { label: t("leadTabs.financingInformation.residedThreeYearUsa"), value: "No" },
    { label: t("leadTabs.financingInformation.accountTitle"), value: "Tuba Khan" },
    { label: t("leadTabs.financingInformation.upfrontPayment"), value: "10" },
    { label: t("leadTabs.financingInformation.insuranceVendor"), value: "1" },
    { label: t("leadTabs.financingInformation.residentCitizenGreenCardUsa"), value: "No" },
    { label: t("leadTabs.financingInformation.insurancePercentage"), value: "10" },
  ];

  return (
    <Card bordered={false} style={styles.card}>
      <Row gutter={24}>
        {/* LEFT COLUMN */}
        <Col xs={24} md={12}>
          {leftColumn.map((item, index) => (
            <div key={index} style={styles.fieldRow}>
              <span style={styles.label}>{item.label}</span>
              <span
                style={
                  item.value === "Preview Document"
                    ? styles.linkValue
                    : styles.value
                }
              >
                {item.value}
              </span>
            </div>
          ))}
        </Col>

        {/* RIGHT COLUMN */}
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
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    margin: "0 auto",
    background: "var(--background)",
    borderRadius: 2,
    padding: "16px 0px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--color-border-faint)",
    padding: "6px 0",
    fontSize: 13,
  },
  label: {
    color: "#555",
    fontWeight: 500,
  },
  value: {
    fontWeight: 600,
    color: "var(--foreground)",
  },
  linkValue: {
    fontWeight: 600,
    color: "var(--color-action)",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default FinancingInformation;
