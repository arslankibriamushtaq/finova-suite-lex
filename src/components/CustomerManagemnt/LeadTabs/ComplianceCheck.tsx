import React from "react";
import { Row, Col, Divider } from "antd";
import { useTranslation } from "react-i18next";

const ComplianceCheck: React.FC = () => {
  const { t } = useTranslation("customerManagement");
  return (
    <div
      style={{
        borderRadius: 2,
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
          <span style={{ color: "#555" }}>{t("compliance.isBeneficiaryBusinessOwner")}</span>
          <strong>{t("common:yes")}</strong>
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
          <span style={{ color: "#555" }}>{t("compliance.legalIssue")}</span>
          <strong>{t("common:no")}</strong>
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
          <span style={{ color: "#555" }}>{t("compliance.isSimahDefault")}</span>
          <strong>{t("common:no")}</strong>
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
            {t("compliance.isBusinessOwnerOrAuthorized")}
          </span>
          <strong>{t("common:yes")}</strong>
        </Col>
      </Row>
    </div>
  );
};

export default ComplianceCheck;
