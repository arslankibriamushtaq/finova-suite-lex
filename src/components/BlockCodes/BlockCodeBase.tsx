import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Switch, Dropdown, Menu, Select } from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Plus } from "lucide-react";
import TableView from "../TableView/TableView";
import { Button as UIButton } from "../ui/button";
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
            backgroundColor: row.status ? "var(--color-success)" : "var(--color-error)",
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
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">{title}</h3>
      </div>

      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--surface-border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder="Search by code or description"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
          />

          {defaultType === "" && (
            <Select
              placeholder="Type"
              allowClear
              value={type || undefined}
              onChange={(value) => setType(value || "")}
              style={{ width: 160, height: 40 }}
            >
              <Select.Option value="COMPLIANCE">Compliance</Select.Option>
              <Select.Option value="AML">AML</Select.Option>
              <Select.Option value="ANTI_FRAUD">Anti-Fraud</Select.Option>
              <Select.Option value="SANCTION">Sanction</Select.Option>
            </Select>
          )}

          <Select
            placeholder="Status"
            allowClear
            value={status || undefined}
            onChange={(value) => setStatus(value || "")}
            style={{ width: 140, height: 40 }}
          >
            <Select.Option value="1">Active</Select.Option>
            <Select.Option value="0">Inactive</Select.Option>
          </Select>

          <UIButton
            onClick={handleAdd}
            className="gap-2"
            style={{ flexShrink: 0, height: 40 }}
          >
            <Plus className="h-4 w-4" />
            Add New
          </UIButton>
        </div>
      </div>

      <div
        className="bg-white"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--surface-border)",
          overflow: "hidden",
        }}
      >
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
      </div>

      <Modal
        title={editMode ? "Edit Block Code" : "Add New Block Code"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        className="custom-mod"
        style={{ maxWidth: "600px" }}
        centered
        destroyOnClose
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            {editMode ? "Update" : "Create"}
          </Button>,
        ]}
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
                message:
                  "Code must contain only uppercase letters, numbers, and underscores",
              },
            ]}
          >
            <Input placeholder={getCodePlaceholder()} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Enter description (optional)" />
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
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlockCodeBase;

