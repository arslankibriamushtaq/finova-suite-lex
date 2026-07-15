import { useState, useEffect, useRef } from "react";
import { Input, Select, Switch } from "antd";
import { getPartnerById, updatePartner } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../Loader/Loader";

const { Option } = Select;

const UpdatePartner = () => {
  const { t } = useTranslation("partner");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("id");
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

  // Fetch partner data
  useEffect(() => {
    if (partnerId) {
      fetchPartnerData();
    }
  }, [partnerId]);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      const response = await getPartnerById(partnerId);
      
      
      if (response?.data?.success) {
        // Try both possible data structures
        const partner = response?.data?.data || response?.data;
        
        
        setFormData({
          name_en: partner?.name_en || "",
          name_ar: partner?.name_ar || "",
          email: partner?.email || "",
          contact_no: partner?.contact_no || "",
          country_id: partner?.country_id?.toString() || "1",
          affiliation_url: partner?.affiliation_url || "",
          affiliation_code: partner?.affiliation_code || "",
          brand_color: partner?.color_code || "#000000",
          secret_key: partner?.secret_key || "",
          enable_api: partner?.enable_api === 1 || partner?.enable_api === "1" || partner?.enable_api === true,
          status: partner?.status === "active" || partner?.status === "Active" || partner?.status === 1 || partner?.status === "1",
          revenue_verification_method: partner?.revenue_verification_method || "Manual",
          get_revenue_url: partner?.get_revenue_url || "",
          get_revenue_secret_key: partner?.get_revenue_secret_key || "",
        });

        // Set logo preview if exists
        if (partner?.logo) {
          setLogoPreview(partner.logo);
        }

        // Set favicon preview if exists
        if (partner?.favicon) {
          setFaviconPreview(partner.favicon);
        }

        toast.success(t("toast.partnerLoaded"));
      } else {
        toast.error(response?.data?.message || t("toast.partnerFetchFailed"));
        navigate("/LOS/PartnerManagement/PartnersList");
      }
    } catch (error: any) {
      console.error("Error fetching partner data:", error);
      toast.error(error?.response?.data?.message || t("toast.partnerFetchFailed"));
      navigate("/LOS/PartnerManagement/PartnersList");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      // Validation - Check all required fields
      if (!formData.name_en || !formData.name_ar || !formData.email || 
          !formData.contact_no || !formData.country_id || !formData.secret_key) {
        toast.error(t("toast.fillRequired"));
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error(t("toast.invalidEmail"));
        return;
      }

      if (!partnerId) {
        toast.error(t("toast.partnerIdMissing"));
        return;
      }

      setLoading(true);

      // Create FormData - Match AddPartner structure exactly
      const submitData = new FormData();
      
      // Required fields
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
      submitData.append("affiliation_url", formData.affiliation_url || "");
      submitData.append("affiliation_code", formData.affiliation_code || "");
      submitData.append("color_code", formData.brand_color || "");
      submitData.append("secret_key", formData.secret_key);
      submitData.append("enable_api", formData.enable_api ? "1" : "0");
      submitData.append("status", formData.status ? "Active" : "Inactive");
      submitData.append("revenue_verification_method", formData.revenue_verification_method || "");
      submitData.append("get_revenue_url", formData.get_revenue_url || "");
      submitData.append("get_revenue_secret_key", formData.get_revenue_secret_key || "");

      // Only append logo if a new file is selected
      if (logo) {
        submitData.append("logo", logo);
      }
      // Only append favicon if a new file is selected
      if (favicon) {
        submitData.append("favicon", favicon);
      }

      // Use the updatePartner API function
      const response = await updatePartner(partnerId, submitData);

      if (response?.data?.success) {
        toast.success(response?.data?.message || t("toast.partnerUpdated"));
        navigate("/LOS/PartnerManagement/PartnersList");
      } else {
        toast.error(response?.data?.message || t("toast.partnerUpdateFailed"));
      }
    } catch (error: any) {
      console.error("Error updating partner:", error);
      
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
        toast.error(error?.response?.data?.message || t("toast.partnerUpdateFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loader/>
    );
  }

  return (
    <div className="service" style={{ background: "white", padding: "2rem", borderRadius: "2px" }}>
      <div className="row">
        {/* Name */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("common:name")}</label>
          <Input
            placeholder={t("form.namePlaceholder")}
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
          <label className="form-label">{t("form.partnerEmail")}</label>
          <Input
            type="email"
            placeholder={t("form.partnerEmail")}
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Contact No */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("form.contactNo")}</label>
          <Input
            addonBefore="+966"
            placeholder={t("form.contactNoPlaceholder")}
            value={formData.contact_no}
            onChange={(e) => handleInputChange("contact_no", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Country */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("form.country")}</label>
          <Select
            value={formData.country_id}
            onChange={(value) => handleInputChange("country_id", value)}
            style={{ width: "100%" }}
          >
            <Option value="1">{t("form.saudiArabia")}</Option>
            {/* <Option value="2">UAE</Option>
            <Option value="3">Kuwait</Option> */}
          </Select>
        </div>

        {/* Choose Brand Color */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("form.chooseBrandColor")}</label>
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
          <label className="form-label">{t("form.affiliationUrl")}</label>
          <Input
            placeholder={t("form.affiliationUrl")}
            value={formData.affiliation_url}
            onChange={(e) => handleInputChange("affiliation_url", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Affiliation Code */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("form.affiliationCode")}</label>
          <Input
            placeholder={t("form.affiliationCode")}
            value={formData.affiliation_code}
            onChange={(e) => handleInputChange("affiliation_code", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Logo */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("form.logo")}</label>
          <div style={{ position: "relative" }}>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="form-control fs-6"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                if (logoPreview && logoPreview.startsWith('blob:')) {
                  URL.revokeObjectURL(logoPreview);
                }
                setLogo(file);
                setLogoPreview(URL.createObjectURL(file));
              }}
            />
            {(logo || logoPreview) && (
              <button
                type="button"
                onClick={() => {
                  if (logoPreview && logoPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(logoPreview);
                  }
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
                title={t("form.removeLogo")}
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
                alt={t("form.logoPreview")}
              />
            </div>
          ) : null}
        </div>

        {/* Favicon */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("form.favicon")}</label>
          <div style={{ position: "relative" }}>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="form-control fs-6"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                if (faviconPreview && faviconPreview.startsWith('blob:')) {
                  URL.revokeObjectURL(faviconPreview);
                }
                setFavicon(file);
                setFaviconPreview(URL.createObjectURL(file));
              }}
            />
            {(favicon || faviconPreview) && (
              <button
                type="button"
                onClick={() => {
                  if (faviconPreview && faviconPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(faviconPreview);
                  }
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
                title={t("form.removeFavicon")}
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
                alt={t("form.faviconPreview")}
              />
            </div>
          ) : null}
        </div>

        {/* API Secret Key */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("form.apiSecretKey")}</label>
          <Input
            placeholder={t("form.autoGeneratedKey")}
            value={formData.secret_key}
            onChange={(e) => handleInputChange("secret_key", e.target.value)}
            style={{ height: "40px", backgroundColor: "var(--color-surface-subtle)" }}
            readOnly
          />
        </div>

        {/* Revenue Verification Method */}
        <div className="col-md-6 mb-3">
          <label className="form-label">{t("form.revenueVerificationMethod")}</label>
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
            <Option value="Manual">{t("form.manual")}</Option>
            <Option value="Verify_Through_Api">{t("form.verifyThroughApi")}</Option>
            <Option value="Email_Triggering">{t("form.emailTriggering")}</Option>
            <Option value="Both_Api_Email">{t("form.bothApiEmail")}</Option>
          </Select>
        </div>

        {/* Get Revenue URL - Show if Verify_Through_Api or Both */}
        {(formData.revenue_verification_method === "Verify_Through_Api" || 
          formData.revenue_verification_method === "Both_Api_Email") && (
          <>
            <div className="col-md-6 mb-3">
              <label className="form-label">{t("form.getRevenueUrl")}</label>
              <Input
                placeholder={t("form.getRevenueUrl")}
                value={formData.get_revenue_url}
                onChange={(e) => handleInputChange("get_revenue_url", e.target.value)}
                style={{ height: "40px" }}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">{t("form.getRevenueSecretKey")}</label>
              <Input
                placeholder={t("form.getRevenueSecretKey")}
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
              checked={formData.enable_api}
              onChange={(checked) => handleInputChange("enable_api", checked)}
              className="red-switch"
            />
            <label className="form-label mb-0">{t("form.enableApi")}</label>
          </div>
        </div>

        {/* Status */}
        <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center gap-2">
            <Switch
              checked={formData.status}
              onChange={(checked) => handleInputChange("status", checked)}
              className="red-switch"
            />
            <label className="form-label mb-0">{t("common:status")}</label>
          </div>
        </div>

        {/* Send Details Via Mail */}
        <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center gap-2">
            <Switch
            className="red-switch"
            //checked={formData.send_details_via_mail}
            onChange={(checked) => handleInputChange("send_details_via_mail", checked)}
            />
            <label className="form-label mb-0">{t("form.sendDetailsViaMail")}</label>
          </div>
        </div>
      </div>

      {/* Update Button */}
      <div className="d-flex justify-content-end mt-4">
        <button
          className="theme-btn-next"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? t("form.updating") : t("common:update")}
        </button>
      </div>
    </div>
  );
};

export default UpdatePartner;

