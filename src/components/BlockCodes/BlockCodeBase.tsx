import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Switch, Dropdown, Menu, Select } from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Plus, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  icon?: LucideIcon;
}

const BlockCodeBase = ({ type: defaultType = "", title, icon: Icon }: BlockCodeBaseProps) => {
  const { t } = useTranslation("walletBlocks");
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
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        {t("common:delete")}
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
      name: t("blockCodes.col.sr"),
      selector: (row: any) => row.sr,
      sortable: true,
    },
    {
      name: t("blockCodes.col.code"),
      selector: (row: any) => row.code,
      sortable: true,
    },
    {
      name: t("blockCodes.col.description"),
      selector: (row: any) => row.description,
      sortable: true,
      cell: (row: any) => (
        <div style={{ whiteSpace: "pre-wrap", maxWidth: "400px" }}>
          {row.description || "-"}
        </div>
      ),
    },
    {
      name: t("blockCodes.col.type"),
      selector: (row: any) => row.type,
      sortable: true,
      cell: (row: any) => {
        const typeLabels: any = {
          COMPLIANCE: t("blockCodes.type.compliance"),
          AML: t("blockCodes.type.aml"),
          ANTI_FRAUD: t("blockCodes.type.antiFraud"),
          SANCTION: t("blockCodes.type.sanction"),
        };
        return <span>{typeLabels[row.type] || row.type}</span>;
      },
    },
    {
      name: t("blockCodes.col.status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "5px 10px",
            borderRadius: "2px",
            backgroundColor: row.status ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status ? t("common:active") : t("common:inactive")}
        </span>
      ),
    },
    {
      name: t("blockCodes.col.actions"),
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#0B8085 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("blockCodes.select")} <img src={arrowDown} alt="" />
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
      toast.error(error?.message || t("blockCodes.toast.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search, type, status]);

  // Get placeholder based on type
  const getCodePlaceholder = () => {
    if (defaultType === 'COMPLIANCE') return t("blockCodes.ph.compliance");
    if (defaultType === 'AML') return t("blockCodes.ph.aml");
    if (defaultType === 'ANTI_FRAUD') return t("blockCodes.ph.antiFraud");
    if (defaultType === 'SANCTION') return t("blockCodes.ph.sanction");
    return t("blockCodes.ph.default");
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
    toast.error(t("blockCodes.toast.deleteUnsupported"));
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
      toast.success(editMode ? t("blockCodes.toast.updated") : t("blockCodes.toast.created"));
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || t("blockCodes.toast.opFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          {Icon && (
            <span className="pro-head-badge">
              <Icon className="h-4 w-4" />
            </span>
          )}
          {title}
        </h3>
      </div>

      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--surface-border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("blockCodes.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />

          {defaultType === "" && (
            <Select
              placeholder={t("blockCodes.typePlaceholder")}
              allowClear
              value={type || undefined}
              onChange={(value) => setType(value || "")}
              style={{ width: 160, height: 40 }}
            >
              <Select.Option value="COMPLIANCE">{t("blockCodes.type.compliance")}</Select.Option>
              <Select.Option value="AML">{t("blockCodes.type.aml")}</Select.Option>
              <Select.Option value="ANTI_FRAUD">{t("blockCodes.type.antiFraud")}</Select.Option>
              <Select.Option value="SANCTION">{t("blockCodes.type.sanction")}</Select.Option>
            </Select>
          )}

          <Select
            placeholder={t("blockCodes.statusPlaceholder")}
            allowClear
            value={status || undefined}
            onChange={(value) => setStatus(value || "")}
            style={{ width: 140, height: 40 }}
          >
            <Select.Option value="1">{t("common:active")}</Select.Option>
            <Select.Option value="0">{t("common:inactive")}</Select.Option>
          </Select>

          <UIButton
            onClick={handleAdd}
            className="gap-2"
            style={{ flexShrink: 0, height: 40 }}
          >
            <Plus className="h-4 w-4" />
            {t("blockCodes.addNew")}
          </UIButton>
        </div>
      </div>

      <div
        className="bg-white"
        style={{
          borderRadius: 2,
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
        title={editMode ? t("blockCodes.modal.editTitle") : t("blockCodes.modal.addTitle")}
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
            {t("common:cancel")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            {editMode ? t("common:update") : t("common:create")}
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
            label={t("blockCodes.form.code")}
            name="code"
            rules={[
              { required: true, message: t("blockCodes.valid.codeRequired") },
              {
                pattern: /^[A-Z0-9_]+$/,
                message: t("blockCodes.valid.codePattern"),
              },
            ]}
          >
            <Input placeholder={getCodePlaceholder()} />
          </Form.Item>

          <Form.Item label={t("blockCodes.form.description")} name="description">
            <TextArea rows={4} placeholder={t("blockCodes.descPlaceholder")} />
          </Form.Item>

          <Form.Item
            label={t("blockCodes.form.type")}
            name="type"
            rules={[{ required: true, message: t("blockCodes.valid.typeRequired") }]}
          >
            <Select placeholder={t("blockCodes.typeSelectPlaceholder")} disabled={!!defaultType}>
              <Select.Option value="COMPLIANCE">{t("blockCodes.type.compliance")}</Select.Option>
              <Select.Option value="AML">{t("blockCodes.type.aml")}</Select.Option>
              <Select.Option value="ANTI_FRAUD">{t("blockCodes.type.antiFraud")}</Select.Option>
              <Select.Option value="SANCTION">{t("blockCodes.type.sanction")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t("blockCodes.form.status")} name="status" valuePropName="checked">
            <Switch checkedChildren={t("blockCodes.switch.active")} unCheckedChildren={t("blockCodes.switch.inactive")} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlockCodeBase;

