import { Input } from "antd";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";


function KycCitizenInfo({ envData }: any) {

  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("id");
  const [formValues, setFormValues] = useState<any>({
    KYC_CITIZEN_INFO: {},
    KYC_CITIZEN_ADDRESS: {},
    MOBILE_VERIFICATION: {},
    KYB: {},
    GET_MANAGER: {},
    BAYAN_ME_FINANCIAL: {},
    BAYAN_CREDIT: {},
    BAYAN_NAE: {},
    SIMAH_CONSUMER: {},
    ABSHER: {},
  });


  useEffect(() => {
    if (!envData) return;

    const findTab = (name: string) => envData.find((item:any) => item.name === name) || {};

    setFormValues({
      KYC_CITIZEN_INFO: findTab("KYC_CITIZEN_INFO"),
      KYC_CITIZEN_ADDRESS: findTab("KYC_CITIZEN_ADDRESS"),
      MOBILE_VERIFICATION: findTab("MOBILE_VERIFICATION"),
      KYB: findTab("KYB"),
      GET_MANAGER: findTab("GET_MANAGER"),
      BAYAN_ME_FINANCIAL: findTab("BAYAN_ME_FINANCIAL"),
      BAYAN_CREDIT: findTab("BAYAN_CREDIT"),
      BAYAN_NAE: findTab("BAYAN_NAE"),
      SIMAH_CONSUMER: findTab("SIMAH_CONSUMER"),
      ABSHER: findTab("ABSHER"),
    });
  }, [envData]);
  
  

  // const handleChange = (field: string, value: any) => {
  //   setFormValues((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };

  // const handleSubmit = async () => {
  //   const body = {
  //     product_id: Number(productId),
  //     KYC_CITIZEN_INFO: { // dynamic key based on the current tab
  //       url: formValues.url,
  //       endpoint: formValues.endpoint,
  //       env: formValues.env,
  //       credentials: formValues.credentials,
  //       parameters: formValues.parameters
  //     }
  //   };
  
  //   try {
  //     const res = await yourPostFunction(body);
  //     if (res?.data?.success) {
  //       toast.success(res.data.message);
  //     }
  //   } catch (err: any) {
  //     toast.error(err?.response?.data?.message || "Failed to save");
  //   }
  // };
  
  return (
    <><div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Kyc Citizen Info
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
            placeholder=""
            className="fs-6"
            value={formValues.url} />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
            placeholder=""
            className="fs-6"
            value={formValues.endpoint} />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input

            className="fs-6"
            value={formValues.env} />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input

            className="fs-6"
            value={formValues.method} />
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

            className="fs-6"
            value={formValues.user_name} />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Password
          </label>
          <Input

            className="fs-6"
            value={formValues.password} />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label>
          <Input

            className="fs-6"
            value={formValues.request_url} />
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

            className="fs-6"
            value={formValues.parameters} />
        </Col>
        <Col md={6}>

          <Input

            className="fs-6"
            value={formValues.parameters} />
        </Col>
      </Row>
    </div><div>
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
              value="" />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              End Point
            </label>
            <Input
              placeholder="Enter Payment"
              className="fs-6"
              value="" />
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
              value="" />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Method
            </label>
            <Input
              placeholder="Enter Payment"
              className="fs-6"
              value="" />
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
              value="" />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Password
            </label>
            <Input
              placeholder="Enter Payment"
              className="fs-6"
              value="" />
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
              value="" />
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
              value="" />
          </Col>
          <Col md={6}>
            {/* <label className="mb-1" style={{ fontWeight: 400 }}>
      Request URL
    </label> */}
            <Input
              placeholder="Enter Payment"
              className="fs-6"
              value="" />
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
              value="" />
          </Col>
        </Row>
      </div>
      <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Mobile Verification
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
            App Id
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
            App Key
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
            Service Key
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
            Organization Number
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
    </div>    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        KYB
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
            API Key
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
      </Row>
    </div>    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Get Manager
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
            API Key
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
      </Row>
    </div>    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        BAYAN ME Financial
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
                ID
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
                Domain
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
    </div>  <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        BAYAN Credit
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
                ID
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
                Domain
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
      </Row>
    </div>  <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        BAYAN NAE
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
                ID
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
                Domain
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
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
        >
        Parameters
      </h1>
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
    </div> <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        ABSHER
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
                Client ID
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
                Client Authorization
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
        Parameters
      </h1>
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

    </div></>
  );
}

export default KycCitizenInfo;
