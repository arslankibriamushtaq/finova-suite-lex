import { Input } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "react-bootstrap";

function GetManager({ setSelectedTab }: any) {
  const { t } = useTranslation("productManagement2");
  return (
    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        {t("verification.getManager")}
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.baseUrl")}
          </label>
          <Input
            placeholder={t("verification.enterPayment")}
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.endPoint")}
          </label>
          <Input
            placeholder={t("verification.enterPayment")}
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.environment")}
          </label>
          <Input
            placeholder={t("verification.enterPayment")}
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.method")}
          </label>
          <Input
            placeholder={t("verification.enterPayment")}
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        {t("verification.credentials")}
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.apiKey")}
          </label>
          <Input
            placeholder={t("verification.enterPayment")}
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        {t("verification.parameters")}
      </h1>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
            placeholder={t("verification.enterPayment")}
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
      </Row>
    </div>
  );
}

export default GetManager;
