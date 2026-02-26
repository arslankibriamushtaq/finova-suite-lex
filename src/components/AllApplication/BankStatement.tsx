import React from "react";
import { Container, Row, Col, Form } from "react-bootstrap";

const BankStatement = () => {
  const accountInfo = {
    accountHolder: "John Doe",
    bankName: "BLUE",
    accountNumber: "6549b0dd-27a1-3f5b-ab2a-9a83d8245d16",
  };

  const transactions = [
    {
      transactionId: "f7a8a54c-1b5d-4a85-8951-118a412856e7",
      accountId: accountInfo.accountNumber,
      providerId: "BLUE",
      indicator: "Debit",
      amount: "SAR 14.7",
      reference: "John Doe",
      bookingDate: "2024-09-28T08:31:02.935+00:00",
    },
    {
      transactionId: "f7a8a54c-1b5d-4a85-8951-118a412856e7",
      accountId: accountInfo.accountNumber,
      providerId: "BLUE",
      indicator: "Debit",
      amount: "SAR 14.7",
      reference: "John Doe",
      bookingDate: "2024-09-28T08:31:02.935+00:00",
    },
  ];

  return (
    <div className="mb-4 p-0">
      <div className="mb-4">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Account Holder Name</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={accountInfo.accountHolder} readOnly />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Bank Name</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={accountInfo.bankName} readOnly />
            </Form.Group>
          </Col>
        </Row>
        <Row>
        <Col md={6}>
        <Form.Group>
          <Form.Label className="fs-12">Account Number</Form.Label>
          <Form.Control className="fs-14 rounded-2" value={accountInfo.accountNumber} readOnly />
        </Form.Group>
        </Col>
        </Row>
      </div>

      <Row className="g-4 mb-4">
        {transactions.map((txn, i) => (
          <Col md={6} key={i}>
            <div className="bordered-section p-3 h-100" style={{borderTopLeftRadius:'0px'}}>
              <div className="fw-600 fs-14 mb-3 text-center">
                Transaction ID: {txn.transactionId}
              </div>
              <Form.Group className="mb-2">
                <Form.Label className="fs-12">Account ID</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.accountId} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="fs-12">Provider ID</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.providerId} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="fs-12">Credit/Debit Indicator</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.indicator} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="fs-12">{txn.amount}</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.reference} readOnly />
              </Form.Group>
              <Form.Group>
                <Form.Label className="fs-12">Booking Date Time</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.bookingDate} readOnly />
              </Form.Group>
            </div>
          </Col>
        ))}
      </Row>
      <Row className="g-4">
        {transactions.map((txn, i) => (
          <Col md={6} key={i}>
            <div className="bordered-section p-3 h-100" style={{borderTopLeftRadius:'0px'}}>
              <div className="fw-600 fs-14 mb-3 text-center">
                Transaction ID: {txn.transactionId}
              </div>
              <Form.Group className="mb-2">
                <Form.Label className="fs-12">Account ID</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.accountId} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="fs-12">Provider ID</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.providerId} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="fs-12">Credit/Debit Indicator</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.indicator} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="fs-12">{txn.amount}</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.reference} readOnly />
              </Form.Group>
              <Form.Group>
                <Form.Label className="fs-12">Booking Date Time</Form.Label>
                <Form.Control className="fs-14 rounded-2" value={txn.bookingDate} readOnly />
              </Form.Group>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BankStatement;