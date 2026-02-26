import React from "react";
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
const SalaryDetails = () => {
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
        <h5 className="fs-6 fw-600">Salary Details</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Full Name</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.fullName} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Housing Allowance</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.housingAllowance} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Employer Name</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.employerName} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Employment Status</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.employmentStatus} readOnly />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Basic Wage</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.basicWage} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Other Allowance</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.otherAllowance} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12">Working Months</Form.Label>
              <Form.Control className="fs-14 rounded-2" value={salaryDetails.workingMonths} readOnly />
            </Form.Group>
          </Col>
        </Row>

        {salaryDetails.isRejected && (
          <Alert variant="danger" className="mt-3">
            <div className="fw-600 fs-14 mb-3" style={{color:'#FF0000'}}>This Application has been rejected</div>
            <div className="fs-12">Reason: {salaryDetails.reason}</div>
          </Alert>
        )}
      </div>
    </div>
  );
};
export default SalaryDetails;
