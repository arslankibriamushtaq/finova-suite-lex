import React from "react";
import { Row, Col, Divider } from "antd";

const ComplianceCheck: React.FC = () => {
  return (
    <div
      style={{
        borderRadius: 6,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* First Row */}
      <Row style={{  }}>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: "1px solid var(--color-border-light)",

          }}
        >
          <span style={{ color: "#555" }}>Is Beneficiary Business Owner?</span>
          <strong>Yes</strong>
        </Col>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: "1px solid var(--color-border-light)"
          }}
        >
          <span style={{ color: "#555" }}>Legal Issue</span>
          <strong>No</strong>
        </Col>
      </Row>

      {/* Second Row */}
      <Row>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 16px",
             borderBottom: "1px solid var(--color-border-light)",
          }}
        >
          <span style={{ color: "#555" }}>Is SIMAH Default?</span>
          <strong>No</strong>
        </Col>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 16px",
             borderBottom: "1px solid var(--color-border-light)",
          }}
        >
          <span style={{ color: "#555" }}>
            Are you Business Owner or Authorized Person?
          </span>
          <strong>Yes</strong>
        </Col>
      </Row>
    </div>
  );
};

export default ComplianceCheck;
