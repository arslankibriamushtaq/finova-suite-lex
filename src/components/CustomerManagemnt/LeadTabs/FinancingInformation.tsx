import React from "react";
import { Row, Col, Card } from "antd";

interface Field {
  label: string;
  value: string | number;
}

const leftColumn: Field[] = [
  { label: "Date of Birth", value: "09-12-1987" },
  { label: "National / Iqama Id", value: "1049966607" },
  { label: "Email", value: "tuba.khan@customer.com" },
  { label: "Duration", value: "06 Months" },
  { label: "CR Number", value: "1743798589" },
  { label: "Have you resided (31) days  during the current year in USA?", value: "No" },
  { label: "Are you a tax resident of any country outside of Saudi Arabia?", value: "No" },
  { label: "Balloon Payment", value: "20" },
  { label: "IBAN Certificate", value: "Preview Document" },
  { label: "Source Income", value: "Source 1" },
  { label: "Zakat Certificate", value: "Preview Document" },
  { label: "Purpose of Factoring", value: "Purpose 1" },
];

const rightColumn: Field[] = [
  { label: "LEI", value: "1234" },
  { label: "IBAN", value: "SA6567854357728193769000" },
  { label: "Mobile Number", value: "966123456789" },
  { label: "Are you born in the USA?", value: "No" },
  { label: "Legal Form", value: "Company" },
  { label: "Have you resided (183) days during the three-year period preceding in USA?", value: "No" },
  { label: "Account Title", value: "Tuba Khan" },
  { label: "Upfront Payment", value: "10" },
  { label: "Insurance Vendor", value: "1" },
  { label: "Are you a resident, a citizen or have a green card in the USA?", value: "No" },
  { label: "Insurance Percentage", value: "10" },
];

const FinancingInformation: React.FC = () => {
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
    borderRadius: 6,
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
