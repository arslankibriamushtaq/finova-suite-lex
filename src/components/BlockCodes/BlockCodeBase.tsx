import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Switch, Dropdown, Menu, Select } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FaFilter } from "react-icons/fa";
import TableView from "../TableView/TableView";
import { Images } from "../Config/Images";
import arrowDown from "../../assets/images/arrow-down.png";
import {
  getBlockCodes,
  getBlockCodesByType,
  createBlockCode,
  updateBlockCode,
  deleteBlockCode,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

const { TextArea } = Input;

interface BlockCodeBaseProps {
  type?: string;
  title: string;
}

const BlockCodeBase = ({ type: defaultType = "", title }: BlockCodeBaseProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState(defaultType);
  const [status, setStatus] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = (action: string, row: any) => {
    switch (action) {
      case "edit":
        handleEdit(row);
        break;
      case "delete":
        handleDelete(row.id);
        break;
      default:
        break;
    }
  };

  const columns = [
    {
      name: "Sr:",
      selector: (row: any) => row.sr,
      sortable: true,
    },
    {
      name: "Code",
      selector: (row: any) => row.code,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      sortable: true,
      cell: (row: any) => (
        <div style={{ whiteSpace: "pre-wrap", maxWidth: "400px" }}>
          {row.description || "-"}
        </div>
      ),
    },
    {
      name: "Type",
      selector: (row: any) => row.type,
      sortable: true,
      cell: (row: any) => {
        const typeLabels: any = {
          compliance: "Compliance",
          aml: "AML",
          anti_fraud: "Anti-Fraud",
          sanction: "Sanction",
        };
        return (
          <span style={{ textTransform: "capitalize" }}>
            {typeLabels[row.type] || row.type}
          </span>
        );
      },
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "5px 10px",
            borderRadius: "20px",
            backgroundColor: row.status ? "#52c41a" : "#ff4d4f",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status ? "Active" : "Inactive"}
        </span>
      ),
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
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use type-specific endpoint if filtering by type
      let response;
      if (defaultType) {
        // For type-specific views, use the type endpoint
        response = await getBlockCodesByType(defaultType);
      } else {
        response = await getBlockCodes(page, pageSize, search, type, status);
      }
      
      if (response?.data?.success) {
        const responseData = response.data.data;
        
        // Handle direct array or paginated response
        let dataArray = [];
        let total = 0;
        let fromPage = 0;
        let toPage = 0;
        let lastPage = 1;
        
        if (Array.isArray(responseData)) {
          // Direct array response (from type endpoint)
          dataArray = responseData;
          
          // Apply search filter if needed
          if (search) {
            dataArray = dataArray.filter((item: any) => 
              item.code?.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase())
            );
          }
          
          // Apply status filter if needed
          if (status !== '') {
            const statusBool = status === '1';
            dataArray = dataArray.filter((item: any) => item.status === statusBool);
          }
          
          // Calculate pagination manually
          total = dataArray.length;
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          dataArray = dataArray.slice(start, end);
          fromPage = dataArray.length > 0 ? start + 1 : 0;
          toPage = start + dataArray.length;
          lastPage = Math.ceil(total / pageSize);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // Paginated response
          dataArray = responseData.data;
          total = responseData.total || dataArray.length;
          fromPage = responseData.from || (dataArray.length > 0 ? 1 : 0);
          toPage = responseData.to || dataArray.length;
          lastPage = responseData.last_page || 1;
        }
        
        const mappedData = dataArray.map((item: any, index: number) => ({
          sr: (page - 1) * pageSize + index + 1,
          id: item.id,
          code: item.code || "-",
          description: item.description || "-",
          type: item.type || "-",
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          raw: item,
        }));
        
        setData(mappedData);
        setTotalRows(total);
        setFrom(fromPage);
        setTo(toPage);
        setTotalPage(lastPage);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search, type, status]);

  // Get placeholder based on type
  const getCodePlaceholder = () => {
    if (defaultType === 'compliance') return 'e.g., COMP001';
    if (defaultType === 'aml') return 'e.g., AML001';
    if (defaultType === 'anti_fraud') return 'e.g., FRAUD001';
    if (defaultType === 'sanction') return 'e.g., SANCT001';
    return 'e.g., COMP001, AML001, FRAUD001, SANCT001';
  };

  const handleAdd = () => {
    setEditMode(false);
    setCurrentRecord(null);
    form.resetFields();
    // Set default type if filtering by type
    if (defaultType) {
      form.setFieldsValue({ type: defaultType });
    }
    setIsModalVisible(true);
  };

  const handleEdit = (row: any) => {
    setEditMode(true);
    setCurrentRecord(row);
    form.setFieldsValue({
      code: row.code,
      description: row.description,
      type: row.type,
      status: row.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this block code?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await deleteBlockCode(id);
          if (response?.data?.success) {
            toast.success("Deleted successfully");
            fetchData();
          }
        } catch (error: any) {
          toast.error(error?.message || "Failed to delete");
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        code: values.code,
        description: values.description || null,
        type: values.type,
        status: values.status ? true : false,
      };

      let response;
      if (editMode && currentRecord) {
        response = await updateBlockCode(currentRecord.id, payload);
      } else {
        response = await createBlockCode(payload);
      }

      if (response?.data?.success) {
        toast.success(
          editMode ? "Updated successfully" : "Created successfully"
        );
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">{title}</h4>
      </div>

      <div className="d-flex justify-content-end col-12 filter-select">
        {defaultType === "" && (
          <Select
            style={{ width: "150px", marginRight: "8px" }}
            placeholder="Type"
            allowClear
            value={type || undefined}
            onChange={(value) => setType(value || '')}
          >
            <Select.Option value="compliance">Compliance</Select.Option>
            <Select.Option value="aml">AML</Select.Option>
            <Select.Option value="anti_fraud">Anti-Fraud</Select.Option>
            <Select.Option value="sanction">Sanction</Select.Option>
          </Select>
        )}

        <Select
          style={{ width: "120px", borderTopRightRadius: "0px" }}
          placeholder="Status"
          allowClear
          value={status || undefined}
          onChange={(value) => setStatus(value || '')}
          suffixIcon={<FaFilter />}
        >
          <Select.Option value="1">Active</Select.Option>
          <Select.Option value="0">Inactive</Select.Option>
        </Select>

        <div className="d-flex gap-2 w-100" style={{ height: 40 }}>
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            className="theme-btn"
            style={{ minWidth: "120px" }}
          >
            + Add New
          </button>
        </div>
      </div>

      <TableView
        header={columns}
        data={data}
        totalRows={totalRows}
        isLoading={loading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />

      <Modal
        title={editMode ? "Edit Block Code" : "Add New Block Code"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: true, type: defaultType || undefined }}
        >
          <Form.Item
            label="Code"
            name="code"
            rules={[
              { required: true, message: "Please enter block code" },
              { 
                pattern: /^[A-Z0-9_]+$/, 
                message: "Code must contain only uppercase letters, numbers, and underscores" 
              }
            ]}
          >
            <Input placeholder={getCodePlaceholder()} />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Enter description (optional)"
            />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select placeholder="Select type" disabled={!!defaultType}>
              <Select.Option value="compliance">Compliance</Select.Option>
              <Select.Option value="aml">AML</Select.Option>
              <Select.Option value="anti_fraud">Anti-Fraud</Select.Option>
              <Select.Option value="sanction">Sanction</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch 
              style={{ backgroundColor: "#000" }} 
              checkedChildren="Active" 
              unCheckedChildren="Inactive" 
            />
          </Form.Item>

          <Form.Item>
            <div className="d-flex justify-content-end gap-2">
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="gradient-btn"
              >
                {editMode ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlockCodeBase;

