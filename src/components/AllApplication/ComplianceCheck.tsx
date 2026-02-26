import React from "react";
import { Container, Row, Col, Form } from "react-bootstrap";

const ComplianceCheck = () => {
  const questions = [
    {
      en: "Are you simah default",
      ar: "هل أنت سما الافتراضي",
      value: "No",
    },
    {
      en: "What's your salary?",
      ar: "تكلفة الشروط",
      value: "Yes",
    },
    {
      en: "Are you default",
      ar: "هل أنت الافتراضي",
      value: "Yes",
    },
    {
      en: "Are you Political Exposed Person",
      ar: "هل أنت شخص سياسي مكشوف",
      value: "Yes",
    },
    {
      en: "Are you simah default",
      ar: "هل أنت سما الافتراضي",
      value: "No",
    },
    {
      en: "What's your salary?",
      ar: "ما هو راتبك؟",
      value: "Yes",
    },
    {
      en: "Are you default",
      ar: "هل أنت الافتراضي",
      value: "Yes",
    },
    {
      en: "Are you Political Exposed Person",
      ar: "هل أنت شخص سياسي مكشوف",
      value: "Yes",
    },
  ];

  return (
    <div className="my-4 p-0">
      <div className="bordered-section p-3">
        <h5 className="fs-6 fw-600 mb-3">Compliance Questions</h5>
        <Row>
          <Col md={6}>
            <h6 className="fs-6 fw-600 mb-3">English</h6>
            {questions.map((q, i) => (
              <Form.Group className="mb-3" key={`en-${i}`}>
                <Form.Label className="fs-12">{q.en}</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={q.value} readOnly />
              </Form.Group>
            ))}
          </Col>
          <Col md={6} className="text-end">
            <h6 className="fs-6 fw-600 mb-3">العربية</h6>
            {questions.map((q, i) => (
              <Form.Group className="mb-3" key={`ar-${i}`}> 
                <Form.Label className="fs-12">{q.ar}</Form.Label>
                <Form.Control className="fs-14 rounded-2 text-end" value={q.value} readOnly />
              </Form.Group>
            ))}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ComplianceCheck;
