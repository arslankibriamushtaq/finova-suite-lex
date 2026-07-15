import { Input } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "react-bootstrap";

import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";


function KycCitizenInfo({ envData }: any) {
  const { t } = useTranslation("productManagement2");
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
        {t("verification.kycCitizenInfo")}
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.baseUrl")}
          </label>
          <Input
            placeholder=""
            className="fs-6"
            value={formValues.url} />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.endPoint")}
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
            {t("verification.environment")}
          </label>
          <Input

            className="fs-6"
            value={formValues.env} />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.method")}
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
        {t("verification.credentials")}
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.username")}
          </label>
          <Input

            className="fs-6"
            value={formValues.user_name} />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.password")}
          </label>
          <Input

            className="fs-6"
            value={formValues.password} />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("verification.requestUrl")}
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
          {t("verification.parameters")}
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
          {t("verification.kycCitizenAddress")}
        </h1>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("verification.baseUrl")}
            </label>
            <Input
              placeholder={t("verification.enterPayment")}
              className="fs-6"
              value="" />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("verification.endPoint")}
            </label>
            <Input
              placeholder={t("verification.enterPayment")}
              className="fs-6"
              value="" />
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
              value="" />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("verification.method")}
            </label>
            <Input
              placeholder={t("verification.enterPayment")}
              className="fs-6"
              value="" />
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
              {t("verification.username")}
            </label>
            <Input
              placeholder={t("verification.enterPayment")}
              className="fs-6"
              value="" />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("verification.password")}
            </label>
            <Input
              placeholder={t("verification.enterPayment")}
              className="fs-6"
              value="" />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("verification.requestUrl")}
            </label>
            <Input
              placeholder={t("verification.enterPayment")}
              className="fs-6"
              value="" />
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
              value="" />
          </Col>
          <Col md={6}>
            {/* <label className="mb-1" style={{ fontWeight: 400 }}>
      Request URL
    </label> */}
            <Input
              placeholder={t("verification.enterPayment")}
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
              placeholder={t("verification.enterPayment")}
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
        {t("verification.mobileVerification")}
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
            {t("verification.appId")}
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
            {t("verification.appKey")}
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
            {t("verification.serviceKey")}
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
            {t("verification.organizationNumber")}
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
    </div>    <div>
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
                {t("verification.id")}
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
                {t("verification.domain")}
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
                {t("verification.password")}
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
                {t("verification.id")}
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
                {t("verification.domain")}
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
                {t("verification.password")}
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
                {t("verification.id")}
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
                {t("verification.domain")}
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
                {t("verification.password")}
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
        {t("verification.parameters")}
      </h1>
      <Row className="mb-4">
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
      <Row className="mb-4">
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
      <Row className="mb-4">
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
      <Row className="mb-4">
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
                {t("verification.clientId")}
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
                {t("verification.clientAuthorization")}
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
        {t("verification.parameters")}
      </h1>
      <Row className="mb-4">
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

    </div></>
  );
}

export default KycCitizenInfo;
