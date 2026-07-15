import React from "react";
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
const SalaryDetails = () => {
  const { t } = useTranslation("allApplication");
  const salaryDetails = {
    fullName: "عبدالله صالح بن عبدالله ال رسام",
    basicWage: "10200",
    housingAllowance: "3570",
    otherAllowance: "1020",
    employerName: "انك",
    workingMonths: "66",
    employmentStatus: "نشط",
    isRejected: true,
    reason: "--"
  };


  return (
    <div className="my-4 p-0">
      <div className="bordered-section p-3">
        <h5 className="fs-6 fw-600">{t("salary.title")}</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">{t("salary.fullName")}</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.fullName} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">{t("salary.housingAllowance")}</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.housingAllowance} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">{t("salary.employerName")}</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.employerName} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">{t("salary.employmentStatus")}</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.employmentStatus} readOnly />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">{t("salary.basicWage")}</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.basicWage} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">{t("salary.otherAllowance")}</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.otherAllowance} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">{t("salary.workingMonths")}</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.workingMonths} readOnly />
            </Form.Group>
          </Col>
        </Row>

        {salaryDetails.isRejected && (
          <Alert variant="danger" className="mt-3">
            <div className="fw-600 fs-14 mb-3" style={{color:'var(--destructive)'}}>{t("salary.rejectedMessage")}</div>
            <div className="fs-12">{t("salary.reason", { value: salaryDetails.reason })}</div>
          </Alert>
        )}
      </div>
    </div>
  );
};
export default SalaryDetails;
