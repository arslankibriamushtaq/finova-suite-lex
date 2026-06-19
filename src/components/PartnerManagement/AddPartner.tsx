import { useState, useEffect, useRef } from "react";
import { Input, Select, Switch } from "antd";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { store } from "../../redux/store";

const { Option } = Select;

// Function to generate random secret key
const generateSecretKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secretKey = '';
  for (let i = 0; i < 50; i++) {
    secretKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return secretKey;
};

const AddPartner = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    email: "",
    contact_no: "",
    country_id: "1",
    affiliation_url: "",
    affiliation_code: "",
    brand_color: "#000000",
    secret_key: "",
    enable_api: false,
    status: false,
    revenue_verification_method: "Manual",
    get_revenue_url: "",
    get_revenue_secret_key: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");

  // Auto-generate secret key on component mount
  useEffect(() => {
    setFormData(prev => ({ ...prev, secret_key: generateSecretKey() }));
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.name_en || !formData.name_ar || !formData.email || !formData.contact_no) {
        toast.error("Please fill all required fields");
        return;
      }

      setLoading(true);

      // Create FormData
      const submitData:any = new FormData();
      submitData.append("name_en", formData.name_en);
      submitData.append("name_ar", formData.name_ar);
      submitData.append("email", formData.email);
      
      // Remove 966 country code prefix if present
      let cleanContactNo = formData.contact_no;
      if (cleanContactNo && cleanContactNo.startsWith("966")) {
        cleanContactNo = cleanContactNo.substring(3);
      }
      submitData.append("contact_no", cleanContactNo);
      
      submitData.append("country_id", formData.country_id);
      submitData.append("affiliation_url", formData.affiliation_url);
      submitData.append("affiliation_code", formData.affiliation_code);
      submitData.append("color_code", formData.brand_color);
      submitData.append("secret_key", formData.secret_key);
      submitData.append("enable_api", formData.enable_api ? "1" : "0");
      submitData.append("status", formData.status ? "Active" : "Inactive");
      submitData.append("revenue_verification_method", formData.revenue_verification_method);
      submitData.append("get_revenue_url", formData.get_revenue_url);
      submitData.append("get_revenue_secret_key", formData.get_revenue_secret_key);

      if (logo) {
        submitData.append("logo", logo);
      }
      if (favicon) {
        submitData.append("favicon", favicon);
      }

      const token = (store.getState() as any).block.token;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/partner`,
        submitData,
        { headers: headers }
      );

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Partner added successfully");
        navigate("/LOS/PartnerManagement/PartnersList");
      } else {
        toast.error(response?.data?.errors?.errors[0] || "Failed to add partner");
      }
    } catch (error: any) {
      console.error("Error adding partner:", error);
      
      // Check if there are validation errors
      const errors = error?.response?.data?.errors;
      if (errors && typeof errors === 'object') {
        // Display each validation error
        Object.keys(errors).forEach((field) => {
          const fieldErrors = errors[field];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((errorMessage: string) => {
              toast.error(errorMessage);
            });
          }
        });
      } else {
        // Display general error message
        toast.error(error?.response?.data?.message || "Failed to add partner");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service" style={{ background: "white", padding: "2rem", borderRadius: "2px" }}>
      {/* <h4 style={{ marginBottom: "2rem" }}>Add New Partner</h4> */}

      <div className="row">
        {/* Name */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Name</label>
          <Input
            placeholder="Name"
            value={formData.name_en}
            onChange={(e) => handleInputChange("name_en", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* اسم */}
        <div className="col-md-6 mb-3">
          <label className="form-label" style={{ textAlign: "right", display: "block" }}>
            اسم
          </label>
          <Input
            placeholder="اسم"
            value={formData.name_ar}
            onChange={(e) => handleInputChange("name_ar", e.target.value)}
            style={{ height: "40px", direction: "rtl" }}
          />
        </div>

        {/* Partner Email */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Partner Email</label>
          <Input
            type="email"
            placeholder="Partner Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Contact No */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Contact No.</label>
          <Input
            addonBefore="+966"
            placeholder="Contact No"
            value={formData.contact_no}
            onChange={(e) => handleInputChange("contact_no", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Country */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Country</label>
          <Select
            value={formData.country_id}
            onChange={(value) => handleInputChange("country_id", value)}
            style={{ width: "100%" }}
          >
            <Option value="1">Saudi Arabia</Option>
            {/* <Option value="2">UAE</Option>
            <Option value="3">Kuwait</Option> */}
          </Select>
        </div>

        {/* Choose Brand Color */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Choose Brand Color</label>
          <div className="d-flex gap-2">
            <Input
              type="color"
              value={formData.brand_color}
              onChange={(e) => handleInputChange("brand_color", e.target.value)}
              style={{ width: "50%", height: "40px" }}
            />
            <Input
              value={formData.brand_color}
              onChange={(e) => handleInputChange("brand_color", e.target.value)}
              style={{ width: "50%", height: "40px" }}
            />
          </div>
        </div>

        {/* Affiliation URL */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Affiliation URL</label>
          <Input
            placeholder="Affiliation URL"
            value={formData.affiliation_url}
            onChange={(e) => handleInputChange("affiliation_url", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Affiliation Code */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Affiliation Code</label>
          <Input
            placeholder="Affiliation Code"
            value={formData.affiliation_code}
            onChange={(e) => handleInputChange("affiliation_code", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Logo */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Logo</label>
          <div style={{ position: "relative" }}>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="form-control fs-6"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                if (logoPreview) URL.revokeObjectURL(logoPreview);
                setLogo(file);
                setLogoPreview(URL.createObjectURL(file));
              }}
            />
            {logo && (
              <button
                type="button"
                onClick={() => {
                  if (logoPreview) URL.revokeObjectURL(logoPreview);
                  setLogo(null);
                  setLogoPreview("");
                  if (logoInputRef.current) logoInputRef.current.value = "";
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  color: "var(--foreground)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  padding: 0,
                  zIndex: 10,
                }}
                title="Remove logo"
              >
                ×
              </button>
            )}
          </div>
          {logoPreview ? (
            <div className="d-flex justify-content-center" style={{ marginTop: 10 }}>
              <img
                src={logoPreview}
                width={150}
                height={150}
                style={{ objectFit: "contain" }}
                alt="Logo preview"
              />
            </div>
          ) : null}
        </div>

        {/* Favicon */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Favicon</label>
          <div style={{ position: "relative" }}>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="form-control fs-6"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                setFavicon(file);
                setFaviconPreview(URL.createObjectURL(file));
              }}
            />
            {favicon && (
              <button
                type="button"
                onClick={() => {
                  if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                  setFavicon(null);
                  setFaviconPreview("");
                  if (faviconInputRef.current) faviconInputRef.current.value = "";
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  color: "var(--foreground)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  padding: 0,
                  zIndex: 10,
                }}
                title="Remove favicon"
              >
                ×
              </button>
            )}
          </div>
          {faviconPreview ? (
            <div className="d-flex justify-content-center" style={{ marginTop: 10 }}>
              <img
                src={faviconPreview}
                width={150}
                height={150}
                style={{ objectFit: "contain" }}
                alt="Favicon preview"
              />
            </div>
          ) : null}
        </div>

        {/* API Secret Key */}
        <div className="col-md-6 mb-3">
          <label className="form-label">API Secret Key</label>
          <Input
            placeholder="Auto-generated key"
            value={formData.secret_key}
            onChange={(e) => handleInputChange("secret_key", e.target.value)}
            style={{ height: "40px", backgroundColor: "var(--color-surface-subtle)" }}
            readOnly
          />
        </div>

        {/* Revenue Verification Method */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Revenue Verification Method</label>
          <Select
            value={formData.revenue_verification_method}
            onChange={(value) => {
              handleInputChange("revenue_verification_method", value);
              // Auto enable API for Email_Triggering or Both
              if (value === "Email_Triggering" || value === "Both_Api_Email") {
                handleInputChange("enable_api", true);
                handleInputChange("revenue_verification_method", value);
              }
            }}
            style={{ width: "100%" }}
          >
            <Option value="Manual">Manual</Option>
            <Option value="Verify_Through_Api">Verify Through Api</Option>
            <Option value="Email_Triggering">Email Triggering</Option>
            <Option value="Both_Api_Email">Both(Verify Through Api & Email Triggering)</Option>
          </Select>
        </div>

        {/* Get Revenue URL - Show if Verify_Through_Api or Both */}
        {(formData.revenue_verification_method === "Verify_Through_Api" || 
          formData.revenue_verification_method === "Both(Verify_Through_Api_And_Email_Triggering)") && (
          <>
            <div className="col-md-6 mb-3">
              <label className="form-label">Get Revenue URL</label>
              <Input
                placeholder="Get Revenue URL"
                value={formData.get_revenue_url}
                onChange={(e) => handleInputChange("get_revenue_url", e.target.value)}
                style={{ height: "40px" }}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Get Revenue Secret Key</label>
              <Input
                placeholder="Get Revenue Secret Key"
                value={formData.get_revenue_secret_key}
                onChange={(e) => handleInputChange("get_revenue_secret_key", e.target.value)}
                style={{ height: "40px" }}
              />
            </div>
          </>
        )}

        {/* Enable API */}
        <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center gap-2">
            <Switch
              className="red-switch"
              checked={formData.enable_api}
              onChange={(checked) => handleInputChange("enable_api", checked)}
            />
            <label className="form-label mb-0">Enable API</label>
          </div>
        </div>

        {/* Status */}
        <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center gap-2">
            <Switch
              className="red-switch"
              checked={formData.status}
              onChange={(checked) => handleInputChange("status", checked)}
            />
            <label className="form-label mb-0">Status</label>
          </div>
        </div>

        {/* Send Details Via Mail */}
        <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center gap-2">
            <Switch className="red-switch" />
            <label className="form-label mb-0">Send Details Via Mail</label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="d-flex justify-content-end mt-4">
        <button
          className="theme-btn-next"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddPartner;

