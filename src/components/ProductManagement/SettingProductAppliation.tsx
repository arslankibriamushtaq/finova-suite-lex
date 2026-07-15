import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "antd";
import { Col, Row } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { saveSteps, getProductById } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
function SettingProductAppliation({ readOnly = false,setSelectedTab }: any) {
  const { t } = useTranslation("productManagement2");
  const product = useSelector((s: any) => s.block.productData);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;

  
  const stepsEn = [
    "Select Partner",
    "Terms & Conditions",
    "Business Info",
    "Authorized Info",
    "OTP Verification",
    "Factoring Info",
    "Disclaimer",
 
    "Attach Documents",
    "Summary",
    "Nafath Verification",
    "Submit"
  ];

  const stepsAr = [
    "اختيار الشريك",
    "الشروط و الأحكام",
    "معلومات العميل",
    "معلومات المفوض",
    "التحقق عبر OTP",
    "المعلومات المالية",
    "الإفصاح",
    "ارفاق المستندات",
    "ملخص الطلب",
    "التحقق من نفاذ",
    "تسليم الطلب",
  
  ];

  // Local state to allow editing inputs
  const [formStepsEn, setFormStepsEn] = useState<string[]>([]);
  const [formStepsAr, setFormStepsAr] = useState<string[]>([]);

  // Load product data for application steps
  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        try {
          const response = await getProductById(productId, 'settings_application_steps');
          if (response?.data?.message === "success") {
            // Don't overwrite the full product data, just update the application steps
            setFormStepsEn(response.data.data?.en || stepsEn);
            setFormStepsAr(response.data.data?.ar || stepsAr);
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || t("appSettings.loadFailed"));
        }
      } else {
        setFormStepsEn(product?.application_steps?.en || stepsEn);
        setFormStepsAr(product?.application_steps?.ar || stepsAr);
      }
    };
    loadProductData();
  }, [productId, dispatch]);


  const handleChangeEn = (index: number, value: string) => {
    if (readOnly) return;
    setFormStepsEn((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleChangeAr = (index: number, value: string) => {
    if (readOnly) return;
    setFormStepsAr((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleSubmit = async ()=>{
    if (readOnly) return;

    const body: any= {
      steps:{
        en:formStepsEn,
        ar:formStepsAr
      }
    }
    try{
      const res = await saveSteps(body, productId)
      if(res?.data?.success){
        localStorage.setItem("tabs", "TermsAndConditions");
        setSelectedTab("TermsAndConditions")
        // navigate("/ProductManagement/termsandconditions")
        toast.success(res?.data?.message);
      }
    }catch(err: any){
      toast.error(err?.response?.data?.message || t("appSettings.saveFailed"))
    }
  }
  return (
    <div>
      {" "}
      <>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "01" })}
            </label>
            <Input
              // placeholder="Select Partner"
              className="fs-6"
              value={formStepsEn[0]}
              onChange={(e) => handleChangeEn(0, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "01" })}
            </label>
            <Input
        
              placeholder={t("appSettings.selectPartner")}
              className="fs-6 "
              value={formStepsAr[0]}
              onChange={(e) => handleChangeAr(0, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "02" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[1]}
              onChange={(e) => handleChangeEn(1, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "02" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[1]}
              onChange={(e) => handleChangeAr(1, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "03" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[2]}
              onChange={(e) => handleChangeEn(2, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "03" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[2]}
              onChange={(e) => handleChangeAr(2, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "04" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[3]}
              onChange={(e) => handleChangeEn(3, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "04" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[3]}
              onChange={(e) => handleChangeAr(3, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "05" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[4]}
              onChange={(e) => handleChangeEn(4, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "05" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[4]}
              onChange={(e) => handleChangeAr(4, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "06" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[5]}
              onChange={(e) => handleChangeEn(5, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "06" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[5]}
              onChange={(e) => handleChangeAr(5, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "07" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[6]}
              onChange={(e) => handleChangeEn(6, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "07" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[6]}
              onChange={(e) => handleChangeAr(6, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "08" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[7]}
              onChange={(e) => handleChangeEn(7, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "08" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[7]}
              onChange={(e) => handleChangeAr(7, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "09" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[8]}
              onChange={(e) => handleChangeEn(8, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "09" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[8]}
              onChange={(e) => handleChangeAr(8, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "10" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[9]}
              onChange={(e) => handleChangeEn(9, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "10" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[9]}
              onChange={(e) => handleChangeAr(9, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              {t("appSettings.step", { num: "11" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsEn[10]}
              onChange={(e) => handleChangeEn(10, e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-end mb-1"
              style={{ fontWeight: 400 }}
            >
              {t("appSettings.stepAr", { num: "11" })}
            </label>
            <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={formStepsAr[10]}
              onChange={(e) => handleChangeAr(10, e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <div className="d-flex justify-content-end">
        <button className="step-buttons me-2" onClick={() => navigate("/ProductManagement/commodity")}>{t("common:previous")}</button>
        <button className="step-buttons" onClick={handleSubmit}>
          {t("common:next")}
        </button>
      </div>
        {/* <Row className="mb-4">
      <Col md={6}>
      <label className="mb-1" style={{fontWeight: 400}}>Step 01</label>
          <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={product?.application_steps?.en[11]}
              
              //onChange={(e) => handleChange("name", e.target.value)}
          />
      </Col>
      <Col md={6}>
      <label className="d-flex justify-content-end mb-1" style={{fontWeight: 400}}>الخطوة 01</label>
          <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value=""
              //onChange={(e) => handleChange("name", e.target.value)}
          />
      </Col>
  </Row>
  <Row className="mb-4">
      <Col md={6}>
      <label className="mb-1" style={{fontWeight: 400}}>Step 01</label>
          <Input
              placeholder={t("appSettings.selectPartner")}
              className="fs-6"
              value={product?.application_steps?.en[12]}
              
              //onChange={(e) => handleChange("name", e.target.value)}
          />
      </Col>
      <Col md={6}>
      <label className="d-flex justify-content-end mb-1" style={{fontWeight: 400}}>الخطوة 01</label>
          <Input
              className="fs-6"
              placeholder={t("appSettings.selectPartner")}
              value=""
              //onChange={(e) => handleChange("name", e.target.value)}
          />
      </Col>
  </Row> */}
      </>
    </div>
  );
}

export default SettingProductAppliation;
