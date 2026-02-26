import { useState, useEffect } from "react";
import { Button, Form, Input, Switch, Select, Row, Col, Card } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createClient, updateClient, getClientEdit, getServicesList, getServiceApis } from "../../redux/apis/apisThirdParty";

const { Option } = Select;

interface ServiceApi {
  id: number;
  name: string;
  service_id: number;
}

interface Service {
  id: number;
  name: string;
  status: number;
}

interface SelectedServices {
  [serviceId: string]: number[];
}

const AddEditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceApis, setServiceApis] = useState<{ [serviceId: number]: ServiceApi[] }>({});
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({});

  const isEditMode = !!id;

  useEffect(() => {
    fetchServices();
    if (isEditMode && id) {
      fetchClientData(parseInt(id));
    }
  }, [id]);

  const fetchServices = async () => {
    try {
      const response = await getServicesList(100, 1);
      if (response?.data?.success) {
        const servicesData = response.data.data;
        let servicesArray: Service[] = [];
        
        if (Array.isArray(servicesData)) {
          servicesArray = servicesData;
        } else if (servicesData?.services && Array.isArray(servicesData.services)) {
          servicesArray = servicesData.services;
        } else if (servicesData?.data?.services && Array.isArray(servicesData.data.services)) {
          servicesArray = servicesData.data.services;
        } else if (servicesData?.data && Array.isArray(servicesData.data)) {
          servicesArray = servicesData.data;
        }

        setServices(servicesArray);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch services");
    }
  };

  const fetchServiceApis = async (serviceId: number) => {
    if (serviceApis[serviceId]) {
      return; // Already fetched
    }

    try {
      const response = await getServiceApis(serviceId);
      if (response?.data?.success) {
        const apisData = response.data.data;
        let apisArray: ServiceApi[] = [];
        
        if (Array.isArray(apisData)) {
          apisArray = apisData;
        } else if (apisData?.apis && Array.isArray(apisData.apis)) {
          apisArray = apisData.apis;
        } else if (apisData?.data?.apis && Array.isArray(apisData.data.apis)) {
          apisArray = apisData.data.apis;
        } else if (apisData?.data && Array.isArray(apisData.data)) {
          apisArray = apisData.data;
        }

        setServiceApis((prev) => ({
          ...prev,
          [serviceId]: apisArray,
        }));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch service APIs");
    }
  };

  const handleServiceChange = (serviceId: number, checked: boolean) => {
    if (checked) {
      // Fetch APIs for this service when selected
      fetchServiceApis(serviceId);
      setSelectedServices((prev) => ({
        ...prev,
        [serviceId]: [],
      }));
    } else {
      // Remove service when unchecked
      setSelectedServices((prev) => {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      });
    }
  };

  const handleApiSelection = (serviceId: number, apiIds: number[]) => {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: apiIds,
    }));
  };

  const fetchClientData = async (clientId: number) => {
    try {
      setLoading(true);
      const response = await getClientEdit(clientId);
      if (response?.data?.success && response.data.data?.client) {
        const clientData = response.data.data.client;
        form.setFieldsValue({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          callback_url: clientData.callback_url,
          env: clientData.env || "DEV",
          status: clientData.status === 1 || clientData.status === true,
        });

        const servicesObj: SelectedServices = {};
        if (response.data.data.selectedApiMap) {
          Object.keys(response.data.data.selectedApiMap).forEach((serviceId) => {
            const apiIds = response.data.data.selectedApiMap[serviceId];
            if (Array.isArray(apiIds) && apiIds.length > 0) {
              servicesObj[serviceId] = apiIds;
              fetchServiceApis(parseInt(serviceId));
            }
          });
        }
        setSelectedServices(servicesObj);
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch client data");
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const servicesPayload: { [key: string]: number[] } = {};
      Object.keys(selectedServices).forEach((serviceId) => {
        if (selectedServices[serviceId].length > 0) {
          servicesPayload[serviceId] = selectedServices[serviceId];
        }
      });

      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        callback_url: values.callback_url,
        env: values.env,
        status: values.status === 1 || values.status === true ? 1 : 0,
        services: servicesPayload,
      };

      if (isEditMode && id) {
        await updateClient(parseInt(id), payload);
        toast.success("Client updated successfully");
      } else {
        await createClient(payload);
        toast.success("Client created successfully");
      }
      navigate("/ThirdPartyManagement/Clients");
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} client`);
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{isEditMode ? "Edit Client" : "Add New Client"}</h2>
        <Button onClick={() => navigate("/ThirdPartyManagement/Clients")}>
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
            env: "DEV",
            status: true,
          }}
          style={{ width: "100%" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Client Name"
                name="name"
                rules={[{ required: true, message: "Please enter client name" }]}
                style={{ marginBottom: 8 }}
              >
                <Input className="form-control" placeholder="Enter client name" />
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
                label="Callback URL"
                name="callback_url"
                rules={[{ required: true, message: "Please enter callback URL" }]}
                style={{ marginBottom: 8 }}
              >
                <Input className="form-control" placeholder="Enter callback URL" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Environment"
                name="env"
                rules={[{ required: true, message: "Please select environment" }]}
                style={{ marginBottom: 8 }}
              >
                <Select /* className="form-control" */ placeholder="Select environment" allowClear>
                  <Option value="DEV">DEV</Option>
                  <Option value="PROD">PROD</Option>
                  <Option value="UAT">UAT</Option>
                  <Option value="STAGING">STAGING</Option>
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

          <Row>
            <Col xs={24}>
              <Form.Item label="Services & APIs" style={{ marginBottom: 16, marginTop: 16 }}>
                <div style={{ border: "1px solid #d9d9d9", borderRadius: "4px", padding: "16px", backgroundColor: "#fafafa" }}>
                  {services.map((service) => {
                    const isServiceSelected = selectedServices.hasOwnProperty(service.id);
                    const availableApis = serviceApis[service.id] || [];
                    return (
                      <div key={service.id} className="mb-3" style={{ paddingBottom: "16px", borderBottom: isServiceSelected ? "1px solid #e0e0e0" : "none" }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Form.Item name={`service_${service.id}_enabled`} valuePropName="checked" style={{ marginBottom: 0 }} noStyle>
                            <Switch
                              className="red-switch"
                              checked={isServiceSelected}
                              onChange={(checked) => handleServiceChange(service.id, checked)}
                              checkedChildren="Active"
                              unCheckedChildren="Inactive"
                            />
                          </Form.Item>
                          <label className="fw-400 mb-0">{service.name}</label>
                        </div>
                        {isServiceSelected && (
                          <Form.Item label={`Select APIs for ${service.name}`} name={`service_${service.id}_apis`} style={{ marginBottom: 0, marginLeft: "32px" }}>
                            <Select
                              className="form-control"
                              mode="multiple"
                              placeholder={`Select APIs for ${service.name}`}
                              value={selectedServices[service.id] || []}
                              onChange={(values) => handleApiSelection(service.id, values)}
                              loading={availableApis.length === 0}
                              disabled={availableApis.length === 0}
                              allowClear
                            >
                              {availableApis.map((api) => (
                                <Option key={api.id} value={api.id}>{api.name}</Option>
                              ))}
                            </Select>
                            {availableApis.length === 0 && <div className="text-muted fs-12 mt-2">Loading APIs...</div>}
                          </Form.Item>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                {isEditMode ? "Update Client" : "Create Client"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditClient;

