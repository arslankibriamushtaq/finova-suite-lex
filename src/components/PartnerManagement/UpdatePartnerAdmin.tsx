import { useState, useEffect } from "react";
import { Input, Select, Switch, DatePicker } from "antd";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPartnerAdminById, updatePartnerAdmin } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
import moment from "moment";

const { Option } = Select;

const UpdatePartnerAdmin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("partnerId");
  const adminId = searchParams.get("adminId");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    /* password: "", */
    phone: "",
    address: "",
    dob: "",
    country_id: "1",
    /* status: false,
    send_details_via_mail: false, */
  });

  // Fetch admin data
  useEffect(() => {
    if (partnerId && adminId) {
      fetchAdminData();
    } else {
      toast.error("Partner ID or Admin ID is missing");
      navigate("/PartnerManagement/PartnersList");
    }
  }, [partnerId, adminId]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await getPartnerAdminById(partnerId, adminId);
      
      if (response?.data?.success) {
        const admin = response?.data?.data;
        
        setFormData({
          name: admin?.name || "",
          email: admin?.email || "",
          /* password: admin?.password || "", */
          phone: admin?.phone || "",
          address: admin?.address || "",
          dob: admin?.dob || "",
          country_id: admin?.country_id?.toString() || "1",
          /* status: admin?.status === 1 || admin?.status === "1" || admin?.status === "Active",
          send_details_via_mail: admin?.send_details_via_mail || false, */
        });

        toast.success("Admin data loaded successfully");
      } else {
        toast.error(response?.data?.message || "Failed to fetch admin data");
        navigate(`/PartnerManagement/PartnerAdminList?id=${partnerId}`);
      }
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch admin data");
      navigate(`/PartnerManagement/PartnerAdminList?id=${partnerId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      // Validation
      /* if (!formData.name || !formData.email || !formData.phone) {
        toast.error("Please fill all required fields");
        return;
      } */
      if (!partnerId || !adminId) {
        toast.error("Partner ID or Admin ID is missing");
        return;
      }

      setLoading(true);

      const submitData = {
        name: formData.name,
        email: formData.email,
        /* password: formData.password, */
        phone: formData.phone,
        address: formData.address,
        dob: formData.dob,
        country_id: formData.country_id,
        /* status: formData.status ? "1" : "0",
        send_details_via_mail: formData.send_details_via_mail, */
      };

      const response = await updatePartnerAdmin(partnerId, adminId, submitData);

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Partner admin updated successfully");
        navigate(`/PartnerManagement/PartnerAdminList?id=${partnerId}`);
      } else {
        toast.error(response?.data?.message || "Failed to update partner admin");
      }
    } catch (error: any) {
      console.error("Error updating partner admin:", error);
      toast.error(error?.response?.data?.message || "Failed to update partner admin");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="service" style={{ background: "white", padding: "2rem", borderRadius: "2px" }}>
      <h4 style={{ marginBottom: "2rem" }}>Update Partner Admin</h4>

      <div className="row">
        {/* Name */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Name</label>
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Email */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Email</label>
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Password */}
        {/* <div className="col-md-6 mb-3">
          <label className="form-label">Password</label>
          <Input
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            style={{ height: "40px", backgroundColor: "#f0f0f0" }}
            readOnly
          />
        </div> */}

        {/* Phone */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Phone</label>
          <Input
            addonBefore="+966"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* Address */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Address</label>
          <Input
            placeholder="Address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            style={{ height: "40px" }}
          />
        </div>

        {/* DOB */}
        <div className="col-md-6 mb-3">
          <label className="form-label">DOB</label>
          <DatePicker
            placeholder="yyyy-mm-dd"
            value={formData.dob ? moment(formData.dob) : null}
            onChange={(date) => handleInputChange("dob", date ? date.format("YYYY-MM-DD") : "")}
            style={{ width: "100%", height: "40px" }}
            format="YYYY-MM-DD"
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

        {/* Status */}
        {/* <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center gap-2" style={{ marginTop: "28px" }}>
            <Switch
              className="red-switch"
              checked={formData.status}
              onChange={(checked) => handleInputChange("status", checked)}
            />
            <label className="form-label mb-0">Status</label>
          </div>
        </div> */}

        {/* Send Details Via Mail */}
        {/* <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center gap-2">
            <Switch
              checked={formData.send_details_via_mail}
              onChange={(checked) => handleInputChange("send_details_via_mail", checked)}
            />
            <label className="form-label mb-0">Send Details Via Mail</label>
          </div>
        </div> */}
      </div>

      {/* Update Button */}
      <div className="d-flex justify-content-end mt-4">
        <button
          className="theme-btn-next"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
};

export default UpdatePartnerAdmin;

