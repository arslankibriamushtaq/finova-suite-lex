import { useState, useEffect } from "react";
import Axios from "axios";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getEnvironmentConfig } from "../../redux/apis/apisThirdParty";
import { Button, Form, Input, Select, Modal, Dropdown, Menu } from "antd";
import { EditFilled, PlusOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";
import { store } from "../../redux/store";

const EnvConfig = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headersList, setHeadersList] = useState<Array<{ key: string; value: string }>>([]);
  const [credentialsList, setCredentialsList] = useState<Array<{ key: string; value: string }>>([]);

  const updateEnvironmentConfig = (id: number, data: FormData) => {
    const token = (store.getState() as any)?.block?.token;
    const baseURL = import.meta.env.VITE_REACT_APP_API_BASE_THIRD_PARTY_URL;
    return Axios.post(`${baseURL}/api/environment/${id}`, data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        // Let Axios set Content-Type automatically for FormData (multipart/form-data with boundary)
      },
    });
  };

  const EnvConfig_Headers = [
    {
      name: "ID",
      selector: (row: { id: any }) => row.id,
      sortable: true,
      width: "100px",
    },
    {
      name: "API Name",
      selector: (row: { apiName: any }) => row.apiName,
      sortable: true,
    },
    {
      name: "URL",
      selector: (row: { url: any }) => row.url,
      sortable: true,
      width: "350px",
    },
    {
      name: "Endpoint",
      selector: (row: { endpoint: any }) => row.endpoint || "-",
      sortable: true,
      width: "350px",
    },
    {
      name: "Method",
      selector: (row: { method: any }) => row.method,
      sortable: true,
      width: "120px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            backgroundColor: row.status === "Active" || row.status === 1 ? "#52c41a" : "#ff4d4f",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status === "Active" || row.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#0B8085 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
      width: "100px",
    },
  ];

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditFilled />}
        onClick={() => handleEdit(row)}
      >
        Edit
      </Menu.Item>
    </Menu>
  );

// Helper function to flatten nested headers object WITHOUT altering key names
const flattenHeaders = (headers: any): Array<{ key: string; value: string }> => {
  if (!headers || typeof headers !== "object") return [];

  const flattened: Array<{ key: string; value: string }> = [];

  const processObject = (obj: any, prefix: string = "") => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      // Keep key EXACTLY as user typed it
      const fullKey = prefix ? `${prefix}-${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        processObject(value, fullKey);
      } else {
        flattened.push({
          key: fullKey,
          value: String(value),
        });
      }
    });
  };

  processObject(headers);
  return flattened;
};

  
  // Helper function to flatten nested credentials object
  const flattenCredentials = (credentials: any): Array<{ key: string; value: string }> => {
    if (!credentials || typeof credentials !== "object") return [];
    
    const flattened: Array<{ key: string; value: string }> = [];
    
    const processObject = (obj: any, prefix: string = "") => {
      Object.keys(obj).forEach((key) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (value !== null && value !== undefined) {
          if (typeof value === "object" && !Array.isArray(value)) {
            // Recursively process nested objects
            processObject(value, fullKey);
          } else {
            // Convert value to string
            flattened.push({
              key: fullKey,
              value: String(value),
            });
          }
        }
      });
    };
    
    processObject(credentials);
    return flattened;
  };

  const handleEdit = (row: any) => {
    // Use originalItem from row if available, otherwise find from data array
    const originalItem = row.originalItem || data.find((item: any) => item.id === row.id);
    if (originalItem) {
      setSelectedItem(originalItem);
      
      // Flatten headers into key-value pairs
      const flattenedHeaders = flattenHeaders(originalItem.headers);
      setHeadersList(flattenedHeaders.length > 0 ? flattenedHeaders : [{ key: "", value: "" }]);
      
      // Flatten credentials into key-value pairs
      const flattenedCredentials = flattenCredentials(originalItem.credentials);
      setCredentialsList(flattenedCredentials.length > 0 ? flattenedCredentials : [{ key: "", value: "" }]);
      
      // Set form values
      form.setFieldsValue({
        url: originalItem.url || "",
        endpoint: originalItem.endpoint || "",
        method: originalItem.method || "",
        status: originalItem.status === "Active" || originalItem.status === 1 ? "Active" : "Inactive",
      });
      setShowEditModal(true);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      formData.append("url", values.url);
      formData.append("endpoint", values.endpoint);
      formData.append("method", values.method);
      formData.append("status", values.status);
      formData.append("_method", "PUT");

      // Add all headers from the headersList using bracket notation
      // This matches the Postman form-data format: header[app-id], header[app-key], etc.
      headersList.forEach((header) => {
        if (header.key && header.key.trim() !== "") {
          // Send as header[key] format - backend should parse this as flat structure
          formData.append(`header[${header.key.trim()}]`, header.value || "");
        }
      });

      // Add all credentials from the credentialsList using bracket notation
      credentialsList.forEach((credential) => {
        if (credential.key && credential.key.trim() !== "") {
          // Send as credentials[key] format
          formData.append(`credentials[${credential.key.trim()}]`, credential.value || "");
        }
      });

      const response = await updateEnvironmentConfig(selectedItem.id, formData);
      
      if (response?.data?.success) {
        toast.success("Environment config updated successfully");
        setShowEditModal(false);
        form.resetFields();
        setHeadersList([{ key: "", value: "" }]);
        setCredentialsList([{ key: "", value: "" }]);
        fetchEnvironmentConfig();
      } else {
        toast.error(response?.data?.message || "Failed to update environment config");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update environment config");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addHeader = () => {
    setHeadersList([...headersList, { key: "", value: "" }]);
  };

  // Headers cannot be removed - only updated or new ones can be added per requirements

  const updateHeader = (index: number, field: "key" | "value", newValue: string) => {
    const newHeaders = [...headersList];
    newHeaders[index] = {
      ...newHeaders[index],
      [field]: newValue,
    };
    setHeadersList(newHeaders);
  };

  const addCredential = () => {
    setCredentialsList([...credentialsList, { key: "", value: "" }]);
  };

  // Credentials cannot be removed - only updated or new ones can be added per requirements

  const updateCredential = (index: number, field: "key" | "value", newValue: string) => {
    const newCredentials = [...credentialsList];
    newCredentials[index] = {
      ...newCredentials[index],
      [field]: newValue,
    };
    setCredentialsList(newCredentials);
  };

  useEffect(() => {
    fetchEnvironmentConfig();
  }, [page, pageSize]);

  const fetchEnvironmentConfig = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getEnvironmentConfig();
      
      if (response?.data?.success) {
        const responseData = response.data.data;
        
        // The response has product_verification_methods as an object with keys (environment names) and values (arrays)
        // Example: { "": [{id: 1, api_id: 1, url: "...", ...}], "DEV": [...], "PROD": [...] }
        const verificationMethodsObj = responseData?.product_verification_methods || {};
        
        // Flatten all verification methods from all environment keys into a single array
        let configArray: any[] = [];
        Object.keys(verificationMethodsObj).forEach((envKey) => {
          const methodsArray = verificationMethodsObj[envKey];
          if (Array.isArray(methodsArray)) {
            // Add environment info to each method
            methodsArray.forEach((method) => {
              configArray.push({
                ...method,
                environmentKey: envKey || "-",
              });
            });
          }
        });

        setData(configArray);
        setTotalRows(configArray.length || 0);
        setFrom(configArray.length > 0 ? 1 : 0);
        setTo(configArray.length || 0);
        setPage(1);
        setTotalPage(1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch environment config");
      setSkelitonLoading(false);
    }
  };

  const mappedData = data?.map((item: any) => ({
    id: item?.id || "-",
    apiName: item?.name || item?.api?.name || "-",
    url: item?.url || "-",
    endpoint: item?.endpoint || "-",
    method: item?.method || "-",
    status: item?.status || "Inactive",
    originalItem: item, // Keep reference to original item for editing
  }));

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Env Config</h2>
      </div>
      <TableView
        header={EnvConfig_Headers}
        data={mappedData}
        totalRows={totalRows}
        isLoading={skelitonLoading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />
      
      <Modal
        title="Edit Environment Config"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          form.resetFields();
          setSelectedItem(null);
          setHeadersList([{ key: "", value: "" }]);
          setCredentialsList([{ key: "", value: "" }]);
        }}
        footer={null}
        className="custom-mod"
        style={{ maxWidth: "700px" }}
      >
        <Form
          form={form}
          layout="vertical"
          className="Ente-details"
          onFinish={handleUpdate}
          initialValues={{
            method: "GET",
            status: "Active",
          }}
        >
         <div className="d-flex w-100 gap-4 align-items-center">
         <Form.Item
            label="URL"
            name="url"
            rules={[{ required: true, message: "Please enter URL" }]}
            className="w-48"
          >
            <Input placeholder="Enter URL" />
          </Form.Item>

          <Form.Item
            label="Endpoint"
            name="endpoint"
            rules={[{ required: true, message: "Please enter endpoint" }]}
             className="w-48"
          >
            <Input placeholder="Enter endpoint" />
          </Form.Item>
         </div>
         <div className="d-flex w-100 gap-4 align-items-center">
          <Form.Item
            label="Method"
            name="method"
            rules={[{ required: true, message: "Please select method" }]}
            className="w-48"
          >
            <Select placeholder="Select method">
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="PATCH">PATCH</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              </Select>
            </Form.Item>
        

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
            className="w-48"
          >
            <Select placeholder="Select status">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
          </div>

          <div style={{ marginTop: "20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "bold" }}>Headers</span>
            <Button
              type="dashed"
              onClick={addHeader}
              icon={<PlusOutlined />}
              style={{ marginBottom: "10px" }}
            >
              Add Header
            </Button>
          </div>
          
          <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "20px" }}>
            {headersList.map((header, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Header Key (e.g., app-id, PLATFORM-KEY)"
                    value={header.key}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                    style={{ marginBottom: "5px" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Header Value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, "value", e.target.value)}
                    style={{ marginBottom: "5px" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "bold" }}>Credentials</span>
            <Button
              type="dashed"
              onClick={addCredential}
              icon={<PlusOutlined />}
              style={{ marginBottom: "10px" }}
            >
              Add Credential
            </Button>
          </div>
          
          <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "20px" }}>
            {credentialsList.map((credential, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Credential Key (e.g., username, password)"
                    value={credential.key}
                    onChange={(e) => updateCredential(index, "key", e.target.value)}
                    style={{ marginBottom: "5px" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Credential Value"
                    value={credential.value}
                    onChange={(e) => updateCredential(index, "value", e.target.value)}
                    style={{ marginBottom: "5px" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Form.Item style={{ marginTop: "20px", marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button onClick={() => {
                setShowEditModal(false);
                form.resetFields();
                setSelectedItem(null);
                setHeadersList([{ key: "", value: "" }]);
                setCredentialsList([{ key: "", value: "" }]);
                fetchEnvironmentConfig();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: "#000000", color: "#ffffff", }}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </div>
          </Form.Item>
       
        </Form>
      </Modal>
    </div>
  );
};

export default EnvConfig;
