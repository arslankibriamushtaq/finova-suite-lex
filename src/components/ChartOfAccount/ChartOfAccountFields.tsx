import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { Modal, Form, Input, Select, Switch, InputNumber, Button, Space, Popconfirm, Menu, Dropdown } from "antd";
import toast from "react-hot-toast";
import {
  getCoaFields,
  createCoaField,
  updateCoaField,
  activateCoaField,
  deactivateCoaField
} from "../../redux/apis/apisCrudLms";
import { EditOutlined, PoweroffOutlined, CheckCircleOutlined, DownOutlined } from "@ant-design/icons";

const ChartOfAccountFields = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [form] = Form.useForm();

  // Pagination states
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search so we don't refilter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const getIsActive = (row: any) => {
    return row.active === true || row.active === 1 || String(row.active).toLowerCase() === 'true' ||
           row.isActive === true || row.isActive === 1 || String(row.isActive).toLowerCase() === 'true' ||
           row.status?.toUpperCase() === "ACTIVE" || row.status?.toLowerCase() === "active";
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Adding a timestamp to avoid browser caching
      const res = await getCoaFields();
      if (res && res.data) {
        const fields = res.data.data || [];
        setData(fields);
        setTotalRows(fields.length);
      }
    } catch (error: any) {
      console.error("Error fetching COA fields:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch COA fields");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEdit = async (values: any) => {
    try {
      setLoading(true);
      if (editingField) {
        await updateCoaField(editingField.id, values);
        toast.success("Field updated successfully");
      } else {
        await createCoaField(values);
        toast.success("Field created successfully");
      }
      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving COA field:", error);
      toast.error(error?.response?.data?.message || "Failed to save COA field");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (field: any) => {
    try {
      setLoading(true);
      const isActive = field.active === true || field.isActive === true || field.status === "ACTIVE" || field.status === "active";
      
      if (isActive) {
        await deactivateCoaField(field.id);
        toast.success("Field deactivated");
      } else {
        await activateCoaField(field.id);
        toast.success("Field activated");
      }
      
      // Optimistic update to reflect change immediately in UI
      setData((prev: any) => prev.map((item: any) => 
        item.id === field.id ? { ...item, active: !isActive, isActive: !isActive, status: !isActive ? "ACTIVE" : "INACTIVE" } : item
      ));

      // Re-fetch to ensure sync with server
      setTimeout(async () => {
        await fetchData();
      }, 800);
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (field: any = null) => {
    setEditingField(field);
    if (field) {
      form.setFieldsValue(field);
    } else {
      form.resetFields();
      form.setFieldsValue({ mandatoryDefault: false, displayOrder: 1 });
    }
    setModalVisible(true);
  };

  const actionMenu = (row: any) => {
    const isActive = getIsActive(row);
    return (
      <Menu>
        <Menu.Item
          key="edit"
          icon={<EditOutlined />}
          onClick={() => openModal(row)}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          key="toggle"
          icon={isActive ? <PoweroffOutlined /> : <CheckCircleOutlined />}
          onClick={() => {
            Modal.confirm({
              title: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this field?`,
              onOk: () => toggleStatus({ ...row, active: isActive }),
            });
          }}
          danger={isActive}
        >
          {isActive ? "Deactivate" : "Activate"}
        </Menu.Item>
      </Menu>
    );
  };

  const columns = [
    {
      name: "Field Key",
      selector: (row: any) => row.fieldKey,
      sortable: true,
    },
    {
      name: "Label (EN)",
      selector: (row: any) => row.fieldLabelEn,
      sortable: true,
    },
    {
      name: "Label (AR)",
      selector: (row: any) => row.fieldLabelAr,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row: any) => row.category,
      sortable: true,
    },
    {
      name: "Mandatory",
      selector: (row: any) => (row.mandatoryDefault ? "Yes" : "No"),
      sortable: true,
    },
    {
      name: "Order",
      selector: (row: any) => row.displayOrder,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => {
        const isActive = getIsActive(row);
        return (
          <div
            style={{
              padding: "5px 12px",
              borderRadius: "32px",
              fontSize: "11px",
              fontWeight: "600",
              backgroundColor: isActive ? "#28a745" : "#dc3545",
              color: "white",
              textAlign: "center",
              width: "80px",
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </div>
        );
      },
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={actionMenu(row)} trigger={["click"]}>
          <Button
            type="primary"
            className="gradient-btn d-flex align-items-center gap-2"
            style={{
              borderColor: "white",
              borderRadius: "8px",
              padding: "6px 15px",
              height: "auto",
              fontSize: "12px"
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

// Apply free-text search across the visible columns
const filteredData = useMemo(() => {
  if (!debouncedSearch) return data;
  const term = debouncedSearch.toLowerCase();
  return (data || []).filter((row: any) => {
    const isActive = getIsActive(row);
    return (
      String(row.fieldKey || "").toLowerCase().includes(term) ||
      String(row.fieldLabelEn || "").toLowerCase().includes(term) ||
      String(row.fieldLabelAr || "").toLowerCase().includes(term) ||
      String(row.category || "").toLowerCase().includes(term) ||
      (isActive ? "active" : "inactive").includes(term)
    );
  });
}, [data, debouncedSearch]);

// Keep the table's totalRows in sync with the filtered set so pagination is correct
useEffect(() => {
  setTotalRows(filteredData.length);
}, [filteredData]);

// Client-side pagination for TableView
const paginatedData = useMemo(() => {
  const start = (page - 1) * pageSize;
  return filteredData.slice(start, start + pageSize);
}, [filteredData, page, pageSize]);

return (
  <div className="p-3">
    <h4 className="mb-3">Chart of Accounts Fields</h4>
    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <Input
        placeholder="Search by key, label, category, status"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
        style={{ width: 320 }}
      />
      <button className="theme-btn-next" onClick={() => openModal()}>
        Add New Field
      </button>
    </div>

    <div className="cs-table p-2 bg-white rounded shadow-sm">
      <TableView
        data={paginatedData}
        header={columns}
        isLoading={loading}
        totalRows={totalRows}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        from={totalRows > 0 ? (page - 1) * pageSize + 1 : 0}
        to={Math.min(page * pageSize, totalRows)}
      />
    </div>

    <Modal
      title={editingField ? "Edit Field" : "Add New Field"}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddEdit}
        initialValues={{ mandatoryDefault: false, displayOrder: 1 }}
      >
        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="fieldKey"
              label="Field Key"
              rules={[{ required: true, message: "Please input field key!" }]}
            >
              <Input placeholder="e.g. COLLECTION_ACCOUNT" disabled={!!editingField} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select category!" }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="COLLECTIONS">COLLECTIONS</Select.Option>
                <Select.Option value="LENDING">LENDING</Select.Option>
                <Select.Option value="FEES">FEES</Select.Option>
                <Select.Option value="TAXES">TAXES</Select.Option>
                <Select.Option value="GENERAL">GENERAL</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="fieldLabelEn"
              label="Label (English)"
              rules={[{ required: true, message: "Please input English label!" }]}
            >
              <Input placeholder="Collection Account" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="fieldLabelAr"
              label="Label (Arabic)"
              rules={[{ required: true, message: "Please input Arabic label!" }]}
            >
              <Input placeholder="حساب التحصيل" style={{ direction: "rtl" }} />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="displayOrder"
              label="Display Order"
              rules={[{ required: true, message: "Please input display order!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="mandatoryDefault"
              label="Is Mandatory?"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  </div>
);
};

export default ChartOfAccountFields;
