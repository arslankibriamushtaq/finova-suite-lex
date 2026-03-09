import { useEffect, useState } from "react";
import { Input, Select, Switch } from "antd";
import toast from "react-hot-toast";
import { setProductData } from "../../redux/apis/apisSlice";
import { Col, Row } from "react-bootstrap";
import { getCountries, getProductCategories, getProductById, UpdateProduct } from "../../redux/apis/apisCrud";
import axios from "axios";
import { store } from "../../redux/store";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
const AddProduct = ({setSelectedTab}:any) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [categories, setCategories] = useState([]);
  const [country, setCountry] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [formValues, setFormValues] = useState({
    name_en: "",
    name_ar: "",
    email: "",
    country_id: "",
    category_id: "",
    customer_type: "",
    product_type_id: null,
    status: false,
    logo: null as File | null,
  });

  const dispatch = useDispatch<any>();
const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const mode = searchParams.get("mode");
const editId = searchParams.get("id");
const readOnly = mode === "view";

  const handleChange = (field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "category_id") setSelectedCategoryId(value);
  };

  const getCategories = async () => {
    try {
      const res = await getProductCategories();
      if (res.status == 200) {
        const data = res?.data?.data?.active_categories;
        setCategories(data);
      } else {
        toast.error(res?.data?.message || "Failed to Fetch Categories.");
      }
    } catch (err) {
      toast.error("Failed to Fetch Categories.");
    }
  };
  const countryApi = async () => {
    try {
      const res = await getCountries();
      if (res.data?.success) {
        const data = res?.data?.data;
        setCountry(data);
      } else {
        toast.error(res?.data?.message || "Failed to Fetch Categories.");
      }
    } catch (err) {
      toast.error("Failed to Fetch Categories.");
    }
  };

  const handleSubmit = async () => {
    let response;
    try {
      const formData = new FormData();
      formData.append("name_en", formValues.name_en);
      formData.append("name_ar", formValues.name_ar);
      formData.append("email", formValues.email);
      formData.append("country_id", formValues.country_id);
      formData.append("category_id", formValues.category_id);
      formData.append("status", formValues.status ? "1" : "0");
      formData.append("product_type_id", "1");

      if (logoFile) {
        formData.append("logo", logoFile, logoFile.name);
      }
      if (mode === "edit" && editId) {
        response = await UpdateProduct(formData, editId);
      } else {
        const token = (store.getState() as any).block.token;
        response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/product`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

     
      if (response?.data?.message === "success") {

        const data = response?.data?.data;
        dispatch(setProductData(data));
        // navigate("/ProductManagement/applicationSteps")
        localStorage.setItem("tabs", "Settings");
        setSelectedTab("Settings")
        toast.success(response?.data?.message);
      } else {
        
        toast.error(response?.data?.message || "Failed to add product.");
      }
    } catch (err:any) {

            Object.keys(err?.response?.data?.errors).forEach((field) => {
              err?.response?.data.errors[field].forEach((msg: any) => {
                toast.error(`${field}: ${msg}`);
              });
            });
      // toast.error(response?.data?.message || "");

    }
  };

  useEffect(() => {
    getCategories();
    countryApi();
    const prefill = async () => {
      try {
        if ((mode === "edit" || mode === "view") && editId) {
          const res = await getProductById(editId, 'BasicInfo');
          const p = res?.data?.data;


          
          if (p) {
            setFormValues((prev) => ({
              ...prev,
              name_en: p?.name_en || "",
              name_ar: p?.name_ar || "",
              email: p?.email || "",
              country_id: p?.country_id || "",
              category_id: p?.category_id || "",
              product_type_id: p?.product_type_id ?? null,
              status: p?.status === 1 || p?.status === "Active",
            }));
            setSelectedCategoryId(p?.category_id ?? null);
            if (p?.logo) {
              setLogoPreview(p.logo);
            }
          }
        }
      } catch (e) {
        // ignore prefill errors, surface as toast if needed
      }
    };
    prefill();
  }, []);

  return (
    <>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Product Name
          </label>
          <Input
            placeholder="Enter Name"
            className="fs-6 form-control"
            value={formValues.name_en}
            onChange={(e) => handleChange("name_en", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
          اسم
          </label>
          <Input
            placeholder=" اسم"
            className="fs-6 form-control "
          dir="rtl"
            value={formValues.name_ar}
            onChange={(e) => handleChange("name_ar", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Notification Email
          </label>
          <Input
            placeholder="Enter Email"
            className="fs-6 form-control"
            value={formValues.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Country
          </label>
          <Select
            placeholder="Enter Name"
            className="fs-6"
            value={formValues.country_id}
            onChange={(value) => handleChange("country_id", value)}
            disabled={readOnly}
          >
            {country &&
              country?.map((cat: any) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.country_name}
                </Select.Option>
              ))}
          </Select>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Category
          </label>
          <Select
            placeholder="Enter Name"
            className="fs-6"
            value={selectedCategoryId}
            onChange={(value) => handleChange("category_id", value)}
            disabled={readOnly}
          >
            {categories.map((cat: any) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        {/* <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Customer Type
          </label>
          <Select
            placeholder="Enter Name"
            className="fs-6"
            value={formValues.customer_type}
            onChange={(value) => handleChange("customer_type", value)}
          >
            {customerType.map((cat: any) => (
              <Select.Option
                placeholder="Select Customer"
                key={cat.id}
                value={cat.id}
              >
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Col> */}
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Upload Logo
          </label>
          <Input
            type="file"
            accept="image/*"
            placeholder="Enter Name"
            className="fs-6"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (!file) return;
              if (logoPreview) URL.revokeObjectURL(logoPreview);
              setLogoFile(file);
              setLogoPreview(URL.createObjectURL(file));
            }}
            disabled={readOnly}
          />

            {logoPreview ? (
              <div className="d-flex justify-content-center">
                  <img
               
                    src={logoPreview}
                    width={150}
                    height={150}
                    style={{ objectFit: "contain", marginTop: 10,display:"flex",justifyContent:"center" }}
                    alt="Logo preview"
                  />
                  </div>
                ) : null}
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Product Type
          </label>
          <Select
            placeholder="Select Product Type"
            className="fs-6"
            value={formValues.product_type_id}
            onChange={(value) => handleChange("product_type_id", value)}
            disabled={readOnly}
          >
            <option value={1}>SME</option>
            <option value={2}>Individual</option>
            <option value={3}>Corporate</option>
          </Select>
        </Col>
      </Row>
      <Row className="pt-4 mb-4">
        <Col md={2}>
          <Switch
            className="me-2"
            // value=""
            //onChange={(e) => handleChange("name", e.target.value)}
            disabled={readOnly}
          />
          <label className="me-1" style={{ fontWeight: 400 }}>
            Has Installments?
          </label>
        </Col>
        <Col md={2}>
          <Switch
            className="me-2"
            // value=""
            //onChange={(e) => handleChange("name", e.target.value)}
            disabled={readOnly}
          />
          <label className="me-1" style={{ fontWeight: 400 }}>
            With Collateral?
          </label>
        </Col>
        <Col md={2}>
          <Switch
            className="me-2"
            checked={formValues.status}
            onChange={(checked) =>
              setFormValues({
                ...formValues,
                status: checked ? true : false,
              })
            }
            disabled={readOnly}
          />
          <label className="me-1" style={{ fontWeight: 400 }}>
            Active{" "}
          </label>
        </Col>
        <Col md={2}>
          <Switch
            className="me-2"
            // value=""
            //onChange={(e) => handleChange("name", e.target.value)}
            disabled={readOnly}
          />
          <label className="" style={{ fontWeight: 400 }}>
            Send details via mail{" "}
          </label>
        </Col>
      </Row>

      <div className="d-flex justify-content-end">
        <button className="step-buttons me-2" disabled={readOnly}>Previous</button>
        {readOnly ? null : (
          <button className="step-buttons" onClick={handleSubmit}>
            Next
          </button>
        )}
      </div>
    </>
  );
};

export default AddProduct;
