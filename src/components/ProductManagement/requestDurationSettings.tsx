import { Button, Checkbox, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getProductById, storeRequestDuration } from "../../redux/apis/apisCrud";
import { setProductData } from "../../redux/apis/apisSlice";
import toast from "react-hot-toast";

const DurationSettings = ( { readOnly = false,setActiveTab }:any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const product = useSelector((s: any) => s.block.productData);
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;
  const [formValues, setFormValues] = useState({
    application_request_duration: 0,
    application_idle_days_allowed: 0,
    department_idle_days_allowed: 0,
    BAYAN_ME_FINANCIAL: 0,
    BAYAN_NAE: 0,
    BAYAN_CREDIT: 0,
    SIMAH_CONSUMER: 0,

  });

  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        try {
          const response = await getProductById(productId, 'request_duration');
          if (response?.data?.success) {
            // Don't overwrite the full product data, just update the form values
            setFormValues({
              application_request_duration: response.data.data?.application_submission?.approved_factoring_application_gap || 0,
              application_idle_days_allowed: response.data.data?.application_auto_rejection?.application_idle_days_allowed || 0,
              department_idle_days_allowed: response.data.data?.application_auto_rejection?.department_idle_days_allowed || 0,
              BAYAN_ME_FINANCIAL: response.data.data?.api_request_durations?.BAYAN_ME_FINANCIAL || 0,
              BAYAN_CREDIT: response.data.data?.api_request_durations?.BAYAN_CREDIT || 0,
              BAYAN_NAE: response.data.data?.api_request_durations?.BAYAN_NAE || 0,
              SIMAH_CONSUMER: response.data.data?.api_request_durations?.SIMAH_CONSUMER || 0,
            });
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Failed to load Request Duration data");
        }
      }
    };
    loadProductData();
  }, [productId, dispatch]);

  const handleChange = (field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const body: any = {
      product_id:Number(productId),
      application_request_duration:Number(formValues.application_request_duration),
      settings:{    
        application_idle_days_allowed: Number(formValues.application_idle_days_allowed),
        department_idle_days_allowed: Number(formValues.department_idle_days_allowed)
      },
 
      BAYAN_ME_FINANCIAL: Number(formValues.BAYAN_ME_FINANCIAL),
      BAYAN_NAE:Number(formValues.BAYAN_NAE),
      BAYAN_CREDIT: Number(formValues.BAYAN_CREDIT),
      SIMAH_CONSUMER: Number(formValues.SIMAH_CONSUMER)
    };
    try {
      const res = await storeRequestDuration(body);
      if (res?.data?.success) {
         localStorage.setItem("tabs","RequiredDoc")
           setActiveTab("RequiredDoc")
        toast.success(res?.data?.message ) 
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }
  };

  return (
    <div>
      <h1 className="pt-2 pb-3" style={{ fontSize: "16px", fontWeight: "bold" }}>
        Approve Submission Duration:
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Approved Factoring Application Gap (DAYS)
          </label>
          <Input
            placeholder=""
            className="fs-6"
            value={formValues.application_request_duration}
            onChange={(e) => handleChange("application_request_duration", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1 className="pt-4 pb-3" style={{ fontSize: "16px", fontWeight: "bold" }}>
        Application Auto Rejection Duration Settings:
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Applied Application Idle Duration (DAYS)
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value={formValues.application_idle_days_allowed}
            onChange={(e) => handleChange("application_idle_days_allowed", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Applied Application Department Idle Duration (DAYS)
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value={formValues.department_idle_days_allowed}
            onChange={(e) => handleChange("department_idle_days_allowed", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1 className="pt-4 pb-3" style={{ fontSize: "16px", fontWeight: "bold" }}>
        API Request Durations:
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            BAYAN ME Financial Duration (DAYS)
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value={formValues.BAYAN_ME_FINANCIAL}
            onChange={(e) => handleChange("BAYAN_ME_FINANCIAL", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            BAYAN Credit Duration (DAYS)
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value={formValues.BAYAN_CREDIT}
            onChange={(e) => handleChange("BAYAN_CREDIT", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            BAYAN NAE Duration (DAYS)
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value={formValues.BAYAN_NAE}
            onChange={(e) => handleChange("BAYAN_NAE", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            SIMAH Consumer Duration (DAYS)
          </label>
          <Input
            placeholder="Enter Payment"
            className="fs-6"
            value={formValues.SIMAH_CONSUMER}
            onChange={(e) => handleChange("SIMAH_CONSUMER", e.target.value)}
            disabled={readOnly}
          />

        </Col>
      </Row>
      <Col className="d-flex justify-content-end">
          {!readOnly && (
            <button className="theme-btn-next" onClick={handleSubmit}>Save</button>
          )}
        </Col>
    </div>
  );
};

export default DurationSettings;
