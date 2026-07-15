import React, { useState } from "react";
import { Form, Input, Upload, Button, Select } from "antd";
import { Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { createAuthorizedInfo } from "../../redux/apis/apisCrudFactoring";
import toast from "react-hot-toast";
import { setDob, setNationID } from "../../redux/apis/apisSlice";
import DatePicker from "react-multi-date-picker";
import arabic from "react-date-object/calendars/arabic";
// import arabic_ar from "react-date-object/locales/arabic_ar";
import { useTranslation } from "react-i18next";

const AuthorizedInfo = () => {
  const { t } = useTranslation("landingUser");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const legalFormFromRedux = useSelector(
    (state: RootState) =>
      state.block.crResponse?.businessInfo_english?.businessType
  );
  const applicationNoFromRedux = useSelector(
    (state: RootState) => state.block.applicationNo
  );

  // Get saved form data from location state (from Previous/Next navigation)
  const savedAuthorizedFormData = (location.state as any)?.authorizedFormData;
  const businessFormData = (location.state as any)?.businessFormData;

  const [formData, setFormData] = useState({
    legal_from: savedAuthorizedFormData?.legal_from || legalFormFromRedux || "",
    nid: savedAuthorizedFormData?.nid || "",
    dob: savedAuthorizedFormData?.dob || "",
    application_step: "",
    application_no: savedAuthorizedFormData?.application_no || applicationNoFromRedux || "",
  });
  const [loading, setLoading] = useState(false);
  const [otpNumber, setOtpNumber] = useState<any>();
  const handleChange = (key: any, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  let data: any = "";
  const handleSubmit = async () => {
    navigate("/applyloan/otpVerification")
    // const body: any = {
    //   legal_from: formData?.legal_from,
    //   nid: formData?.nid,
    //   dob: formData?.dob,
    //   application_step: "4",
    //   application_no: formData?.application_no,
    // };

    // try {
    //   setLoading(true);
    //   await toast.promise(createAuthorizedInfo(body), {
    //     loading: "Authorizing Info",
    //     success: (res: any) => {


    //       if (res?.data?.success) {
    //         data = res?.data?.message;
    //         navigate("/applyloan/otpVerification", {
    //           state: { 
    //             data,
    //             authorizedFormData: formData,
    //             businessFormData: businessFormData
    //           },
    //         });
    //         return res?.data?.message;
    //       }
      
    //       // throw new Error(res?.data?.message || "Failed to Authorize");
    //     },
    //     error: (err) => err?.data?.message || "",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <>
      <Form>
        {/* Authorized Person */}
        <label
          className="mt-2 mb-3"
          style={{ fontWeight: 600, fontSize: "20px" }}
        >
          {t("authorized.title")}
        </label>

        <Row className="mt-2 mb-2">
          <Col md={6}>
            <label
              className="mb-1 required-asterisk"
              style={{ fontWeight: 500 }}
            >
              {t("authorized.nationalId")}
            </label>
            <Input
              placeholder={t("authorized.nationalId.placeholder")}
              className="form-control"
              minLength={10}
              maxLength={10}
              value={formData.nid}
              onChange={(e: any) => {
                dispatch(setNationID({ nid: e.target.value }));
                handleChange("nid", e.target.value);
              }}
            />
          </Col>
          <Col md={6}>
            <label
              className="mb-1 required-asterisk"
              style={{ fontWeight: 500 }}
            >
              {t("authorized.legalForm")}
            </label>
            <Input
              className="form-control"
              value={formData.legal_from}
              readOnly
            />
          </Col>
        </Row>
        <Row className="mt-4 mb-3">
          <Col md={6}>
            <label
              className="mb-1 required-asterisk"
              style={{ fontWeight: 500 }}
            >
              {t("authorized.dob")}
            </label>
            <DatePicker
              calendar={arabic}
              //locale={arabic_ar}
              format="YYYY/MM/DD"
              containerStyle={{ width: "100%" }}
              inputClass="form-control w-100"
              style={{ height: 40 }}
              placeholder="YYYY-MM-DD"
              onChange={(date) => {
                const value = date ? date.format("YYYY-MM-DD") : null;
                setFormData((prev: any) => ({
                  ...prev,
                  dob: value,
                }));
                dispatch(setDob(value));
              }}
            />
          </Col>
        </Row>
      </Form>
      <div
        className="py-4"
        style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}
      >
        <button
          className="step-buttons"
          style={{ background: "#ccc" }}
          onClick={() => {
            navigate("/applyloan/businessdetails", {
              state: { 
                businessFormData: businessFormData,
                authorizedFormData: formData
              }
            });
          }}
        >
          {t("common:previous")}
        </button>
        <button
          type="button"
          className="step-buttons"
          onClick={() => {
            handleSubmit();
          }}
        >
          {t("action.nextStep")}
        </button>
      </div>
    </>
  );
};

export default AuthorizedInfo;
