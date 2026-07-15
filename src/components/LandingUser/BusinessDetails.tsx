import { Form, Input, DatePicker, Select } from "antd";
import { Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { FaTruck, FaShoppingCart } from "react-icons/fa";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import { useState } from "react";
import { verifyBusiness, verifyEmail } from "../../redux/apis/apisCrudFactoring";
import { uploadStepDocuments } from "../../utils/uploadStepDocuments";
import { setUserId, setBusinessDetails } from "../../redux/apis/apisSlice";
import RequiredDocFields from "./RequiredDocFields";
import { useTranslation } from "react-i18next";

const BusinessDetails = () => {
  const { t } = useTranslation("landingUser");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const savedProduct = useSelector(
    (state: RootState) => state.block.userProductData
  );
  
  const productDetails = useSelector(
    (state: RootState) => state.block.productDetails
  );
  const prodId = useSelector((state: RootState) => state.block.prodId);
  const applicationNo = useSelector(
    (state: RootState) => state.block.applicationNo
  );
  const requiredDocuments = useSelector(
    (state: RootState) => state.block.requiredDocuments
  );

  // Get saved form data from location state (passed during navigation)
  const savedFormData = (location.state as any)?.businessFormData;
  
  // Initialize form with saved data if available (from navigation), otherwise empty
  const [formData, setFormData] = useState({
    partner_id: savedFormData?.partner_id || (savedProduct as any)?.id || "",
    loan_type_id: savedFormData?.loan_type_id || "",
    
    // Supplier Information
    supplier_company_unn: savedFormData?.supplier_company_unn || "",
    supplier_email: savedFormData?.supplier_email || "",
    supplier_national_id: savedFormData?.supplier_national_id || "",
    supplier_dob: savedFormData?.supplier_dob || "",
    supplier_mobile_no: savedFormData?.supplier_mobile_no || "",
    
    // Buyer Information
    buyer_company_unn: savedFormData?.buyer_company_unn || "",
    buyer_email: savedFormData?.buyer_email || "",
    buyer_national_id: savedFormData?.buyer_national_id || "",
    buyer_dob: savedFormData?.buyer_dob || "",
    buyer_mobile_no: savedFormData?.buyer_mobile_no || "",
  });

  // Dynamic required document files keyed by doc id
  const [docFiles, setDocFiles] = useState<Record<number, File | null>>({});
  const [loading, setLoading] = useState(false);

  const handleDocFileChange = (docId: number, file: File | null) => {
    setDocFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const getProductId = (): string => {
    if ((productDetails as any)?.product?.id != null) {
      return String((productDetails as any).product.id);
    }
    if (Array.isArray(prodId) && prodId.length > 0 && (prodId as any)[0]?.id != null) {
      return String((prodId as any)[0].id);
    }
    if (typeof prodId === "number") {
      return String(prodId);
    }
    return formData.partner_id ? String(formData.partner_id) : "";
  };

  const handleSubmit = async () => {
    const productId = getProductId();
    if (!productId) {
      toast.error(t("business.toast.selectProduct"));
      return;
    }

    setLoading(true);
    try {
      // 1) Upload required documents for this step first (validates required ones)
      const docsOk = await uploadStepDocuments(3, requiredDocuments, docFiles);
      if (!docsOk) {
        setLoading(false);
        return;
      }

      // 2) Verify business (without document files - those go via store docs API)
      const fd = new FormData();
      fd.append("application_no", applicationNo || "");
      fd.append("product_id", productId);
      fd.append("application_step", "3");

      fd.append("supplier_details[company_unn]", formData.supplier_company_unn || "");
      fd.append("supplier_details[email]", formData.supplier_email || "");
      fd.append("supplier_details[mobile_no]", formData.supplier_mobile_no || "");
      fd.append("supplier_details[iqama_id]", formData.supplier_national_id || "");
      fd.append("supplier_details[dob]", formData.supplier_dob || "");

      fd.append("buyer_details[company_unn]", formData.buyer_company_unn || "");
      fd.append("buyer_details[email]", formData.buyer_email || "");
      fd.append("buyer_details[mobile_no]", formData.buyer_mobile_no || "");
      fd.append("buyer_details[iqama_id]", formData.buyer_national_id || "");
      fd.append("buyer_details[dob]", formData.buyer_dob || "");

      const res = await verifyBusiness(fd);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || t("business.toast.verifyFailed"));
        return;
      }

      const data = res?.data?.data;

      // Store user_id from verifyBusiness response
      if (data?.user_id != null) {
        dispatch(setUserId({ userId: data.user_id }));
      }

      // Store all business details in redux
      dispatch(setBusinessDetails(formData));

      // 3) Verify email (supplier)
      const emailBody = {
        email: formData.supplier_email,
        nid: formData.supplier_national_id,
      };
      const emailRes = await verifyEmail(emailBody);
      if (!emailRes?.data?.success) {
        toast.error(emailRes?.data?.message || t("business.toast.emailFailed"));
        return;
      }

      toast.success(emailRes?.data?.message || t("business.toast.emailSuccess"));

      // 4) Move to OTP screen
      navigate("/applyloan/otpVerification", {
        state: { businessFormData: formData },
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error?.message || t("common.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form>
        {/* Product Selection */}
        <Row className="mt-2 mb-4">
          <Col md={12}>
            <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
              {t("business.product.label")}
            </label>
            <Select
              placeholder={t("business.product.placeholder")}
              className="w-100"
              value={"13"}
              onChange={(value) => setFormData({ ...formData, partner_id: value })}
              style={{ height: "38px" }}
            >
              <Select.Option value="13">{t("business.product.invoiceFactoring")}</Select.Option>
            </Select>
          </Col>
        </Row>

        {/* Supplier Information Section */}
        <div className="mb-4">
          <h5 className="mb-3 d-flex align-items-center" style={{ color: "#1963b9", fontWeight: 600 }}>
            <FaTruck className="me-2" size={20} />
            {t("business.supplier.title")}
          </h5>
          
          <Row className="mb-3">
            <Col md={6}>
              <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
                {t("business.field.companyUnn")}
              </label>
              <Input
                placeholder={t("business.field.companyUnn.placeholder")}
                className="form-control"
                value={formData.supplier_company_unn}
                onChange={(e) => setFormData((p) => ({ ...p, supplier_company_unn: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
                {t("common:email")}
              </label>
              <Input
                placeholder={t("business.field.email.placeholder")}
                className="form-control"
                type="email"
                value={formData.supplier_email}
                onChange={(e) => setFormData((p) => ({ ...p, supplier_email: e.target.value }))}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
                {t("business.field.nationalId")}
              </label>
              <Input
                placeholder={t("business.field.nationalId.placeholder")}
                className="form-control"
                value={formData.supplier_national_id}
                onChange={(e) => setFormData((p) => ({ ...p, supplier_national_id: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
                {t("business.field.dob")}
              </label>
              <DatePicker
                placeholder={t("business.field.dob.placeholder")}
                className="form-control w-100"
                format="YYYY-MM-DD"
                value={formData.supplier_dob ? dayjs(formData.supplier_dob) : null}
                onChange={(_date, dateString) => setFormData((p) => ({ ...p, supplier_dob: dateString as string }))}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
                {t("business.field.mobile")}
              </label>
              <div className="d-flex">
                <Input
                  placeholder="+966"
                  className="form-control"
                  style={{ width: "80px", marginRight: "8px" }}
                  value="+966"
                  readOnly
                />
                <Input
                  placeholder={t("business.field.mobile.placeholder")}
                  className="form-control"
                  value={formData.supplier_mobile_no}
                  onChange={(e) => setFormData((p) => ({ ...p, supplier_mobile_no: e.target.value }))}
                />
              </div>
            </Col>
          </Row>
        </div>

        {/* Buyer Information Section */}
        <div className="mb-4">
          <h5 className="mb-3 d-flex align-items-center" style={{ color: "#1963b9", fontWeight: 600 }}>
            <FaShoppingCart className="me-2" size={20} />
            {t("business.buyer.title")}
          </h5>
          
          <Row className="mb-3">
            <Col md={6}>
              <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
                {t("business.field.companyUnn")}
              </label>
              <Input
                placeholder={t("business.field.companyUnn.placeholder")}
                className="form-control"
                value={formData.buyer_company_unn}
                onChange={(e) => setFormData((p) => ({ ...p, buyer_company_unn: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
                {t("common:email")}
              </label>
              <Input
                placeholder={t("business.field.email.placeholder")}
                className="form-control"
                type="email"
                value={formData.buyer_email}
                onChange={(e) => setFormData((p) => ({ ...p, buyer_email: e.target.value }))}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <label className="mb-1" style={{ fontWeight: 500 }}>
                {t("business.field.nationalId")}
              </label>
              <Input
                placeholder={t("business.field.nationalId.placeholder")}
                className="form-control"
                value={formData.buyer_national_id}
                onChange={(e) => setFormData((p) => ({ ...p, buyer_national_id: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <label className="mb-1" style={{ fontWeight: 500 }}>
                {t("business.field.dob")}
              </label>
              <DatePicker
                placeholder={t("business.field.dob.placeholder")}
                className="form-control w-100"
                format="YYYY-MM-DD"
                value={formData.buyer_dob ? dayjs(formData.buyer_dob) : null}
                onChange={(_date, dateString) => setFormData((p) => ({ ...p, buyer_dob: dateString as string }))}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <label className="mb-1 required-asterisk" style={{ fontWeight: 500 }}>
                {t("business.field.mobile")}
              </label>
              <div className="d-flex">
                <Input
                  placeholder="+966"
                  className="form-control"
                  style={{ width: "80px", marginRight: "8px" }}
                  value="+966"
                  readOnly
                />
                <Input
                  placeholder={t("business.field.mobile.placeholder")}
                  className="form-control"
                  value={formData.buyer_mobile_no}
                  onChange={(e) => setFormData((p) => ({ ...p, buyer_mobile_no: e.target.value }))}
                />
              </div>
            </Col>
          </Row>
        </div>

        {/* Dynamic Required Documents for Step 3 */}
        <RequiredDocFields
          stepNo={3}
          docFiles={docFiles}
          onFileChange={handleDocFileChange}
        />
      </Form>
      {/* Actions */}
      <div className="py-4 d-flex" style={{ gap: 8 }}>
        <button
          type="button"
          className="step-buttons"
          style={{ background: "#616161", padding: "10px 5px", borderRadius: "0", minWidth: "100px",lineHeight:"24px" }}
          onClick={() => navigate("/applyloan/Terms", {
            state: { businessFormData: formData }
          })}
        >
          {t("common:previous")}
        </button>

        <button
          type="button"
          className="step-buttons"
          disabled={loading}
          style={{
            background: "#1963b9",
            padding: "10px 5px",
            borderRadius: "0",
            minWidth: "100px",
            lineHeight: "24px",
            opacity: loading ? 0.7 : 1,
          }}
          onClick={() => {
            handleSubmit();
          }}
        >
          {loading ? t("action.submitting") : t("action.nextStep")}
        </button>
      </div>
    </>
  );
};

export default BusinessDetails;
