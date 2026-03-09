import { Input } from "antd";
import { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FeesSettings, getProductById } from "../../redux/apis/apisCrud";
import { setProductData } from "../../redux/apis/apisSlice";
import { useNavigate, useLocation } from "react-router-dom";
const FeeSettings = ({ readOnly = false ,setSelectedTab}: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const product = useSelector((s: any) => s.block.productData);
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;

  
  const [formValues, setFormValues] = useState({
    min_financing_amount: 0,
    max_financing_amount: 0,
    vat: 0,
    bi_annual_financing_percentage: 0,
    annual_financing_percentage: 0,
    delta_financing_percentage:0
  });

  // Load product data for fee settings
  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        try {
          const response = await getProductById(productId, 'factoring_settings');
          if (response?.data?.message === "success") {
            // Don't overwrite the full product data, just update the form values
            setFormValues({
              min_financing_amount: response.data.data?.factoring_amount.min_amount || 0,
              max_financing_amount: response.data.data?.factoring_amount.max_amount || 0,
              vat: response.data.data?.factoring_fee.vat_percentage || 0,
              bi_annual_financing_percentage: response.data.data?.revenue_eligibility.bi_annual_factoring_percentage || 0,
              annual_financing_percentage: response.data.data?.revenue_eligibility.annual_factoring_percentage || 0,
              delta_financing_percentage: response.data.data?.revenue_eligibility.bi_annual_to_annual_difference || 0,
            });
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Failed to load fee settings data");
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
      min_financing_amount: Number(formValues.min_financing_amount),
      max_financing_amount: Number(formValues.max_financing_amount),
      vat: Number(formValues.vat),
      bi_annual_financing_percentage: Number(formValues.bi_annual_financing_percentage),
      annual_financing_percentage: Number(formValues.annual_financing_percentage),
      delta_financing_percentage: Number(formValues.delta_financing_percentage) 
    };
    try {
     
      const res = await FeesSettings(body, productId)
      if(res?.data?.success){
        localStorage.setItem("tabs", "AdminFeeSlabs");
        setSelectedTab("AdminFeeSlabs")
        toast.success(res?.data?.message);
      }
    }catch(err: any){
      toast.error(err?.response?.data?.message)
    }
  }
  return (
    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Factoring Amount
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Min Factoring
          </label>
          <Input
            placeholder="Enter amount"
            className="fs-6"
            value={formValues.min_financing_amount}
            onChange={(e) => handleChange("min_financing_amount", Number(e.target.value))}
            disabled={readOnly}
            
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Max Factoring
          </label>
          <Input
            placeholder="Enter amount"
            className="fs-6"
            value={formValues.max_financing_amount}
            onChange={(e) => handleChange("max_financing_amount", Number(e.target.value))}
            disabled={readOnly}
            
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            VAT %
          </label>
          <Input
            placeholder="Enter VAT %"
            className="fs-6"
            value={formValues.vat}
            onChange={(e) => handleChange("vat", Number(e.target.value))}
            disabled={readOnly}
            
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Revenue Eligibility for Factoring
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Bi-Annual Factoring %
          </label>
          <Input
            placeholder="Enter %"
            className="fs-6"
            value={formValues.bi_annual_financing_percentage}
            onChange={(e) => handleChange("bi_annual_financing_percentage", Number(e.target.value))}
            disabled={readOnly}
            
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Annual Factoring %
          </label>
          <Input
            placeholder="Enter %"
            className="fs-6"
            value={formValues.annual_financing_percentage}
            onChange={(e) => handleChange("annual_financing_percentage", Number(e.target.value))}
            disabled={readOnly}
            
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Bi-Annual to Annual Difference %
          </label>
          <Input

            className="fs-6"
            value={
              formValues.delta_financing_percentage
            }
            onChange={(e) => handleChange("delta_financing_percentage", Number(e.target.value))}
            disabled={readOnly}
            
          />
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-end">
          {!readOnly && (
            <button className="theme-btn-next" onClick={handleSubmit}>Save Fee Settings</button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default FeeSettings;
