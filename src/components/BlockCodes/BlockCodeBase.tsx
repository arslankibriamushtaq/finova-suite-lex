import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Switch, Dropdown, Menu, Select } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FaFilter } from "react-icons/fa";
import TableView from "../TableView/TableView";
import { Images } from "../Config/Images";
import arrowDown from "../../assets/images/arrow-down.png";
import {
  getRiskBlockCodes,
  createRiskBlockCode,
  updateRiskBlockCode,
} from "../../redux/apis/apisRiskManagement";
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
          COMPLIANCE: "Compliance",
          AML: "AML",
          ANTI_FRAUD: "Anti-Fraud",
          SANCTION: "Sanction",
        };
        return <span>{typeLabels[row.type] || row.type}</span>;
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
      const response = await getRiskBlockCodes();
      let dataArray: any[] = Array.isArray(response?.data) ? response.data : (response?.data?.data ?? []);

      if (defaultType) {
        dataArray = dataArray.filter((item: any) => item.type === defaultType.toUpperCase());
      } else if (type) {
        dataArray = dataArray.filter((item: any) => item.type === type);
      }

      if (search) {
        dataArray = dataArray.filter((item: any) =>
          item.code?.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (status !== '') {
        const activeVal = status === '1';
        dataArray = dataArray.filter((item: any) => (item.active ?? item.status) === activeVal);
      }

      const total = dataArray.length;
      const start = (page - 1) * pageSize;
      const paged = dataArray.slice(start, start + pageSize);

      setData(paged.map((item: any, index: number) => ({
        sr: start + index + 1,
        id: item.id,
        code: item.code || "-",
        description: item.description || "-",
        type: item.type || "-",
        status: item.active ?? item.status,
        raw: item,
      })));
      setTotalRows(total);
      setFrom(paged.length > 0 ? start + 1 : 0);
      setTo(start + paged.length);
      setTotalPage(Math.ceil(total / pageSize));
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
    if (defaultType === 'COMPLIANCE') return 'e.g., COMP001';
    if (defaultType === 'AML') return 'e.g., AML001';
    if (defaultType === 'ANTI_FRAUD') return 'e.g., FRAUD001';
    if (defaultType === 'SANCTION') return 'e.g., SANCT001';
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

  const handleDelete = async (_id: number) => {
    toast.error("Delete is not supported for block codes.");
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (editMode && currentRecord) {
        await updateRiskBlockCode(currentRecord.id, {
          description: values.description || "",
          type: values.type,
          active: values.status ? true : false,
        });
      } else {
        await createRiskBlockCode({
          code: values.code,
          description: values.description || "",
          type: values.type,
        });
      }
      toast.success(editMode ? "Updated successfully" : "Created successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
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
            <Select.Option value="COMPLIANCE">Compliance</Select.Option>
            <Select.Option value="AML">AML</Select.Option>
            <Select.Option value="ANTI_FRAUD">Anti-Fraud</Select.Option>
            <Select.Option value="SANCTION">Sanction</Select.Option>
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
              <Select.Option value="COMPLIANCE">Compliance</Select.Option>
              <Select.Option value="AML">AML</Select.Option>
              <Select.Option value="ANTI_FRAUD">Anti-Fraud</Select.Option>
              <Select.Option value="SANCTION">Sanction</Select.Option>
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

