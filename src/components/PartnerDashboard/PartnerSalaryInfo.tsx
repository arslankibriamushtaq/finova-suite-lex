import React, { useState } from "react";
import { Button, Col, Input, Row } from "antd";
import { Form } from "react-bootstrap";

const PartnerSalaryInfo = ({ setSelectedTab }: any) => {
  // Define the business information fields
  const businessInformationFields = [
    { label: "Month", type: "input" },
    { label: "Amount", type: "input" },
    { label: "Month", type: "input" },
    { label: "Amount", type: "input" },
    { label: "Month", type: "input" },
    { label: "Amount", type: "input" },
    { label: "Month", type: "input" },
    { label: "Amount", type: "input" },
    { label: "Month", type: "input" },
    { label: "Amount", type: "input" },
    { label: "Month", type: "input" },
    { label: "Amount", type: "input" },
    { label: "Amount", type: "input" },
  ];

  // Define the state to store the input values
  const [formData, setFormData] = useState({});

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    label: string
  ) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [label]: value,
    }));
  };

  return (
    <div className="p-3" style={{ background: "white" }}>
      <h3>Add Last 6 Month Salary Information</h3>
      <Row className="mb-3">
        {businessInformationFields.map((field, index) => (
          <Col md={12} key={index} className="pt-3">
            <Form.Group>
              <Form.Label
                className="mt-2"
                style={{ fontSize: "12px", fontWeight: "700" }}
              >
                {field.label}
              </Form.Label>
              <Input
                type="text"
                onChange={(e) => handleInputChange(e, field.label)}
                placeholder={`Enter ${field.label}`}
              />
            </Form.Group>
          </Col>
        ))}
      </Row>
      <div
        className="d-flex justify-content-end gap-2"
        style={{ marginTop: "20px" }}
      >
        <Button
          style={{ background: "#000000" }}
          type="primary"
        >
          Reject
        </Button>
        <Button
          style={{ background: "#198754" }}
          type="primary"
        >
          Approve
        </Button>
      </div>
    </div>
  );
};

export default PartnerSalaryInfo;
