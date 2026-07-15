import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Input, Select, Switch, Modal } from "antd";
import toast from "react-hot-toast";
import { getCountries, createAdmin, updateAdmin } from "../../redux/apis/apisCrud";
import { useNavigate } from "react-router-dom";
import { getCountriesThirdParty } from "../../redux/apis/apisThirdParty";

const AddAdmin = ({
  visible, 
  onClose, 
  onSuccess, 
  productId, 
  mode = "add", 
  adminId = null, 
  initialData = null 
}: any) => {
  const { t } = useTranslation("productManagement2");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
const navigate = useNavigate();
  const isEdit = mode === "edit";
  const isView = mode === "view";

  useEffect(() => {
    fetchCountries();
    if (isEdit && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [isEdit, initialData, form]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (isEdit && initialData) {
        form.setFieldsValue(initialData);
      }
    }
  }, [visible, isEdit, initialData, form]);

  const fetchCountries = async () => {
    try {
      const response = await getCountriesThirdParty();
      if (response?.data?.message === "success") {
        
        setCountries(response?.data?.data || []);
      }
    } catch (error: any) {
      toast.error(t("admin.fetchCountriesFailed"));
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const adminData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        dob: values.dob,
        country: values.country,
        status: values.status ? 1 : 0
      };

      if (isEdit) {
        await updateAdmin(adminId, adminData);
        toast.success(t("admin.updated"));
      } else {
        await createAdmin(productId, adminData);
        toast.success(t("admin.created"));
      }

      onSuccess && onSuccess();
      onClose && onClose();

    } catch (error: any) {
      toast.error(error?.message || t("admin.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{isEdit ? t("admin.editAdmin") : isView ? t("admin.viewAdmin") : t("admin.addAdmin")}</h4>
        <Button onClick={() => navigate(`/ProductManagement/AdminList?mode=view&id=${productId}`)}>
          {t("admin.backToAdminList")}
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isView}
        style={{ maxWidth: "800px" }}
      >
        <div className="row">
          <div className="col-md-6">
            <Form.Item
              label={t("common:name")}
              name="name"
              rules={[{ required: true, message: t("admin.nameRequired") }]}
            >
              <Input placeholder={t("admin.enterAdminName")} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label={t("common:email")}
              name="email"
              rules={[
                { required: true, message: t("admin.emailRequired") },
                { type: "email", message: t("admin.emailInvalid") }
              ]}
            >
              <Input placeholder={t("admin.enterEmail")} />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              label={t("common:phone")}
              name="phone"
              rules={[{ required: true, message: t("admin.phoneRequired") }]}
            >
              <Input placeholder={t("admin.enterPhone")} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label={t("admin.dob")}
              name="dob"
              rules={[{ required: true, message: t("admin.dobRequired") }]}
            >
              <Input type="date" />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              label={t("admin.address")}
              name="address"
              rules={[{ required: true, message: t("admin.addressRequired") }]}
            >
              <Input.TextArea placeholder={t("admin.enterAddress")} rows={3} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label={t("field.country")}
              name="country"
              rules={[{ required: true, message: t("admin.countryRequired") }]}
            >
              <Select placeholder={t("admin.selectCountry")}>
                {countries&&countries.map((country: any) => (
                  <Select.Option key={country.id} value={country.id}>
                    {country.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              label={t("common:status")}
              name="status"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        </div>

        {!isView && (
          <div className="d-flex justify-content-end gap-2">
            <Button onClick={() => navigate(`/ProductManagement/AdminList?mode=view&id=${productId}`)}>
              {t("common:cancel")}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? t("admin.updateAdmin") : t("admin.createAdmin")}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default AddAdmin;