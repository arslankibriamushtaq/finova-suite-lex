import { useState, useEffect } from "react";
import { Button, Form, Input, Switch, Select, Row, Col, Card } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createClientAdmin, updateClientAdmin, getClientAdminEdit } from "../../redux/apis/apisThirdParty";
import { getCountries } from "../../redux/apis/apisCrud";

const { Option } = Select;

const AddEditClientAdmin = () => {
  const navigate = useNavigate();
  const { clientId, id } = useParams<{ clientId: string; id?: string }>();
  const formClientId = clientId ? parseInt(clientId) : 0;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const isEditMode = !!id;

  useEffect(() => {
    fetchCountries();
    if (isEditMode && id) {
      fetchAdminData(parseInt(id));
    }
  }, [id]);

  const fetchCountries = async () => {
    try {
      const response = await getCountries();
      if (response?.data?.success) {
        const countriesData = response.data.data || [];
        setCountries(Array.isArray(countriesData) ? countriesData : []);
      } else if (response?.data) {
        const countriesData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCountries(Array.isArray(countriesData) ? countriesData : []);
      }
    } catch (error: any) {
      console.error("Failed to fetch countries:", error);
      setCountries([]);
    }
  };

  const fetchAdminData = async (adminId: number) => {
    try {
      setLoading(true);
      const response = await getClientAdminEdit(adminId);
      if (response?.data?.success && response.data.data?.admin) {
        const adminData = response.data.data.admin;
        form.setFieldsValue({
          name: adminData.name,
          email: adminData.email,
          phone: adminData.phone,
          dob: adminData.dob || "",
          address: adminData.address,
          country_id: adminData.country_id,
          status: adminData.status === 1 || adminData.status === true,
        });
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch admin data");
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload: any = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        dob: values.dob || "",
        address: values.address,
        country_id: values.country_id,
        status: values.status || false,
        /* password: "Pass1234",
        password_confirmation: "Pass1234", */
      };

      if (isEditMode && id) {
        payload.client_admin_id = parseInt(id);
        await updateClientAdmin(payload);
        toast.success("Client admin updated successfully");
      } else {
        await createClientAdmin(formClientId, payload);
        toast.success("Client admin created successfully");
      }
      navigate(`/ThirdPartyManagement/Clients/${formClientId}/Admins`);
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} client admin`);
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{isEditMode ? "Edit Client Admin" : "Add Client Admin"}</h2>
        <Button onClick={() => navigate(`/ThirdPartyManagement/Clients/${formClientId}/Admins`)}>
          Cancel
        </Button>
      </div>

      <Card
        bordered={false}
        style={{
          margin: "0 auto",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderRadius: 8,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: true,
          }}
          style={{ width: "100%" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter name" }]}
                style={{ marginBottom: 8 }}
              >
                <Input className="form-control" placeholder="Enter name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
                style={{ marginBottom: 8 }}
              >
                <Input className="form-control" placeholder="Enter email address" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: "Please enter phone number" }]}
                style={{ marginBottom: 8 }}
              >
                <Input className="form-control" placeholder="Enter phone number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Date of Birth"
                name="dob"
                rules={[{ required: true, message: "Please enter date of birth" }]}
                style={{ marginBottom: 8 }}
              >
                <Input type="date" className="form-control" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Please enter address" }]}
                style={{ marginBottom: 8 }}
              >
                <Input className="form-control" placeholder="Enter address" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Country"
                name="country_id"
                rules={[{ required: true, message: "Please select country" }]}
                style={{ marginBottom: 8 }}
              >
                <Select  placeholder="Select country" allowClear showSearch>
                  {/* {countries && Array.isArray(countries) && countries.map((country: any) => (
                    <Option key={country.id} value={country.id}>
                      {country.country_name || country.name}
                    </Option>
                  ))} */}
                  <Option value="1">Saudi Arabia</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Switch className="red-switch" /* checkedChildren="Active" unCheckedChildren="Inactive" */ />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" style={{ marginTop: 24 }}>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ backgroundColor: "#000000", borderColor: "#000000" }}
              >
                {isEditMode ? "Update Admin" : "Create Admin"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditClientAdmin;

