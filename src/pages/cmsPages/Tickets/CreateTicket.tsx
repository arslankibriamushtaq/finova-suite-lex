import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Select, Button, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {
  getCategories,
  getSubCategories,
  createTicket
} from "../../../redux/apis/apisCrudCms";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const CreateTicket = () => {
  const { t } = useTranslation("cms");
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contactNo = searchParams.get("contactNo") || "";
  const userInfo = location.state?.userInfo || null;
  
  const [categories, setCategories] = useState<any>([]);
  const [subCategories, setSubCategories] = useState<any>([]);
  const [departments, setDepartments] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    phone: userInfo?.phone || contactNo || "",
    nid: userInfo?.nid || "",
    user_id: userInfo?.user_id || "",
    device_token: userInfo?.device_token || "",
    channels: userInfo?.channels || null,
    country_id: userInfo?.country_id || null,
    city_id: userInfo?.city_id || null,
    priority_id: userInfo?.priority_id || null,
    assigned_to: userInfo?.assigned_to || null,
    category: "",
    subCategory: "",
    department: "",
    comment: "",
  });

  useEffect(() => {
    getCategoriesList();
  }, []);

  useEffect(() => {
    if (formData.category) {
      getSubCategoriesList(formData.category);
    } else {
      setSubCategories([]);
      setFormData((prev) => ({ ...prev, subCategory: "", department: "" }));
      setDepartments([]);
    }
  }, [formData.category]);

  useEffect(() => {
    if (formData.subCategory) {
      // Find the selected subcategory and extract its department
      const selectedSubCategory = subCategories.find(
        (subCat: any) => subCat.id === formData.subCategory
      );
      if (selectedSubCategory?.department) {
        // If subcategory has a department object, set it
        setDepartments([selectedSubCategory.department]);
        setFormData((prev) => ({
          ...prev,
          department: selectedSubCategory.department.id || selectedSubCategory.department_id || "",
        }));
      } else if (selectedSubCategory?.department_id) {
        // If subcategory has department_id, we still need to show it
        // But we don't have the department name, so we'll need to handle this
        setFormData((prev) => ({
          ...prev,
          department: selectedSubCategory.department_id,
        }));
      } else {
        setDepartments([]);
        setFormData((prev) => ({ ...prev, department: "" }));
      }
    } else {
      setDepartments([]);
      setFormData((prev) => ({ ...prev, department: "" }));
    }
  }, [formData.subCategory, subCategories]);

  const getCategoriesList = async () => {
    try {
      const response = await getCategories(1, 100);
      if (response) {
        setCategories(response?.data?.data?.categories || []);
      }
    } catch (error) {
      setCategories([]);
    }
  };

  const getSubCategoriesList = async (categoryId: string | number) => {
    try {
      const response = await getSubCategories(1, 100, "", categoryId);
      if (response) {
        setSubCategories(response?.data?.data?.sub_categories || []);
      }
    } catch (error) {
      setSubCategories([]);
    }
  };

  const getStatusName = (statusId: number) => {
    const statusMap: any = {
      1: t("createTicket.status.assigned"),
      2: t("createTicket.status.pending"),
      3: t("createTicket.status.completed"),
      4: t("createTicket.status.resolved")
    };
    return statusMap[statusId] || "---";
  };

  const handleSubmit = async () => {
    try {
      if (!formData.category || !formData.subCategory || !formData.department || !formData.comment) {
        toast.error(t("createTicket.toast.fillRequired"));
        return;
      }

      if (!userInfo && !formData.name.trim()) {
        toast.error(t("createTicket.toast.enterName"));
        return;
      }

      if (!formData.phone) {
        toast.error(t("createTicket.toast.contactRequired"));
        return;
      }

      setLoading(true);
      
      // Prepare the body for API call
      const body: any = {
        category_id: formData.category,
        sub_category_id: formData.subCategory,
        department_id: formData.department,
        description: formData.comment,
      };

      // Add user info fields if they exist
       body.name = formData.name;
       body.email = formData.email;
       body.contact_no = formData.phone;
       body.channels = formData.channels;
       body.nid = formData.nid;
       body.country_id = formData.country_id;
       body.city_id = formData.city_id;
    //    body.user_id = formData.user_id;
    //    body.device_token = formData.device_token;
       body.priority_id = formData.priority_id;
       body.assigned_to = formData.assigned_to;
      // Add your create ticket API call here
      const response = await createTicket(body);
      if (response) {
        toast.success(t("createTicket.toast.createdSuccess"));
        navigate(-1);
      } else {
        toast.error(t("createTicket.toast.createFailed"));
      }

    } catch (error: any) {
      toast.error(error?.message || t("createTicket.toast.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "0" }}>
      {/* Header with Back Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "2px",
            border: "1px solid var(--color-border-light)",
          }}
        />
        <h1 style={{ fontSize: "28px", fontWeight: 600, margin: 0 }}>{t("createTicket.title")}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Left Side - Customer Information & Previous Tickets */}
        <div>
          {/* Customer Information Section */}
          <div
            style={{
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "2px",
              backgroundColor: "var(--background)",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--color-border-subtle)",
                backgroundColor: "var(--color-surface-ice)",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{t("createTicket.customerInformation")}</h2>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>{t("common:name")}</div>
                  <div style={{ fontSize: "14px" }}>{userInfo?.name || "---"}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>{t("createTicket.contact")}</div>
                  <div style={{ fontSize: "14px" }}>{userInfo?.phone || contactNo || "---"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Tickets Section */}
          <div
            style={{
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "2px",
              backgroundColor: "var(--background)",
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--color-border-subtle)",
                backgroundColor: "var(--color-surface-ice)",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{t("createTicket.previousTickets")}</h2>
            </div>
            <div style={{ padding: "0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--color-surface-ice)" }}>
                    <th
                      style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "14px",
                        borderBottom: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      {t("common:description")}
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "14px",
                        borderBottom: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      {t("common:status")}
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "14px",
                        borderBottom: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      {t("fields.department")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userInfo?.tickets && userInfo.tickets.length > 0 ? (
                    userInfo.tickets.map((ticket: any, index: number) => (
                      <tr key={index} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                        <td style={{ padding: "16px 24px", fontSize: "14px" }}>
                          {ticket?.description || "---"}
                        </td>
                        <td style={{ padding: "16px 24px", fontSize: "14px" }}>
                          {getStatusName(ticket?.status_id)}
                        </td>
                        <td style={{ padding: "16px 24px", fontSize: "14px" }}>
                          {ticket?.department?.name || "---"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          fontSize: "14px",
                          color: "var(--color-text-subtle)",
                        }}
                      >
                        {t("createTicket.noPreviousTickets")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side - Add Complaint Form */}
        <div>
          <div
            style={{
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "2px",
              backgroundColor: "var(--background)",
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--color-border-subtle)",
                backgroundColor: "var(--color-surface-ice)",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{t("createTicket.addComplaint")}</h2>
            </div>
            <div style={{ padding: "24px" }}>
              {/* Name field - only show if no userInfo */}
              {!userInfo && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {t("common:name")}
                  </label>
                  <Input
                    placeholder={t("createTicket.enterCustomerName")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ height: "40px" }}
                  />
                </div>
              )}

              {/* Categories */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {t("createTicket.categories")}
                </label>
                <Select
                  placeholder={t("fields.selectCategory")}
                  value={formData.category || undefined}
                  onChange={(value) => setFormData({ ...formData, category: value, subCategory: "" })}
                  style={{ width: "100%", height: "40px" }}
                >
                  {categories.map((category: any) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.title}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Sub Categories */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {t("createTicket.subCategories")}
                </label>
                <Select
                  placeholder={t("fields.selectSubCategory")}
                  value={formData.subCategory || undefined}
                  onChange={(value) => setFormData({ ...formData, subCategory: value, department: "" })}
                  disabled={!formData.category}
                  style={{ width: "100%", height: "40px" }}
                >
                  {subCategories.map((subCategory: any) => (
                    <Select.Option key={subCategory.id} value={subCategory.id}>
                      {subCategory.title}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Department */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {t("fields.department")}
                </label>
                <Select
                  placeholder={t("fields.selectDepartment")}
                  value={formData.department || undefined}
                  onChange={(value) => setFormData({ ...formData, department: value })}
                  disabled={!formData.subCategory}
                  style={{ width: "100%", height: "40px" }}
                >
                  {departments.map((department: any) => (
                    <Select.Option key={department.id} value={department.id}>
                      {department.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Comment */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {t("fields.comment")}
                </label>
                <TextArea
                  placeholder={t("createTicket.commentPlaceholder")}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  style={{ resize: "none" }}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                style={{
                  width: "auto",
                  height: "40px",
                  backgroundColor: "var(--foreground)",
                  borderColor: "var(--foreground)",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {t("common:submit")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;