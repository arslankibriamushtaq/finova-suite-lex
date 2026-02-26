import { Input } from "antd";
import React from "react";
import { Col, Row } from "react-bootstrap";

function KycCitizenAddress({ setSelectedTab }: any) {
  return (
    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Kyc Citizen Address
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
            placeholder="Enter Payment"
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
        Credentials
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Username
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Password
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label>
          <Input
            placeholder="Enter Payment"
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
        Parameters
      </h1>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value=""

            //onChange={(e) => handleChange("name", e.target.value)}
          />
        </Col>
      </Row>
    </div>
  );
}

export default KycCitizenAddress;
