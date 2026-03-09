import { useEffect, useState } from "react";
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
      toast.error("Failed to fetch countries");
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
        toast.success("Admin updated successfully");
      } else {
        await createAdmin(productId, adminData);
        toast.success("Admin created successfully");
      }
      
      onSuccess && onSuccess();
      onClose && onClose();
      
    } catch (error: any) {
      toast.error(error?.message || "Failed to save admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{isEdit ? "Edit Admin" : isView ? "View Admin" : "Add Admin"}</h4>
        <Button onClick={() => navigate(`/ProductManagement/AdminList?mode=view&id=${productId}`)}>
          Back to Admin List
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
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter admin name" }]}
            >
              <Input placeholder="Enter admin name" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" }
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label="Date of Birth"
              name="dob"
              rules={[{ required: true, message: "Please select date of birth" }]}
            >
              <Input type="date" />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input.TextArea placeholder="Enter address" rows={3} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: "Please select country" }]}
            >
              <Select placeholder="Select country">
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
              label="Status"
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
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? "Update Admin" : "Create Admin"}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default AddAdmin;