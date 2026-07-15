import React from "react";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const LoanInformation = () => {
  const { t } = useTranslation("allApplication");
  const loanAmountInfo = {
    requestedLoan1: "SR 500.00",
    costOfTerm: "SR 230.00",
    requestedLoan2: "SR 730.00",
    monthlyPayment: "SR 243.33",
  };

  const loanApplicationInfo = {
    applicationNumber: "ALAN-5890916204",
    productName: "SR 230.00",
    loanTenure: "3",
    loanType: "Individual",
    purpose: "Medical",
    applicationDate: "12 November, 2024 02:30 PM",
  };

  return (
    <div className="my-4 p-0">
    <div className="bordered-section mb-4 p-3">
      <h5 className="fs-6 fw-600">{t("loanInfo.amountTitle")}</h5>
      <Row>
        <Col md={6}>
          <h6 className="my-3 fs-6 fw-600">English</h6>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Requested Loan Amount</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanAmountInfo.requestedLoan1} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Cost Of Term</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanAmountInfo.costOfTerm} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Requested Loan Amount</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanAmountInfo.requestedLoan2} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Requested Loan Amount</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanAmountInfo.monthlyPayment} readOnly />
          </Form.Group>
        </Col>
        <Col md={6} className="text-end">
          <h6 className="my-3 fs-6 fw-600">العربية</h6>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">التمويل المطلوب</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanAmountInfo.requestedLoan1} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">تكلفة الشروط</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanAmountInfo.costOfTerm} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">إجمالي المبلغ المطلوب للتمويل</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanAmountInfo.requestedLoan2} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">المبلغ الشهري للدفع</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanAmountInfo.monthlyPayment} readOnly />
          </Form.Group>
        </Col>
      </Row>
    </div>

    <div className="bordered-section p-3">
      <h5 className="fs-6 fw-600">{t("loanInfo.applicationTitle")}</h5>
      <Row>
        <Col md={6}>
          <h6 className="my-3 fs-6 fw-600">English</h6>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Application Number</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanApplicationInfo.applicationNumber} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Product Name</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanApplicationInfo.productName} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Loan Tenure</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanApplicationInfo.loanTenure} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Loan Type</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanApplicationInfo.loanType} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Purpose OF Finance</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanApplicationInfo.purpose} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">Application Date</Form.Label>
            <Form.Control className="fs-14 rounded-2" value={loanApplicationInfo.applicationDate} readOnly />
          </Form.Group>
        </Col>
        <Col md={6} className="text-end">
          <h6 className="my-3 fs-6 fw-600">العربية</h6>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">رقم الطلب</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanApplicationInfo.applicationNumber} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">نوع المنتج</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value="التمويل الاصغر" readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">المدة</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanApplicationInfo.loanTenure} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">المستفيد</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanApplicationInfo.loanType} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">الغرض من التمويل</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanApplicationInfo.purpose} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label  className="fs-12">تاريخ التقديم</Form.Label>
            <Form.Control className="fs-14 rounded-2 text-end" value={loanApplicationInfo.applicationDate} readOnly />
          </Form.Group>
        </Col>
      </Row>
    </div>
  </div>
  );
};

export default LoanInformation;
