import { useEffect, useState } from "react";
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
import { EditOutlined, PoweroffOutlined, CheckCircleOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import { ListChecks } from "lucide-react";
import { useTranslation } from "react-i18next";

const ChartOfAccountFields = () => {
  const { t } = useTranslation("accountingLoans");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [form] = Form.useForm();

  // Pagination states
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search so we don't refetch on every keystroke
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
      // Backend uses 0-based page indexing. Pass search so the API can filter
      // server-side (with client-side fallback below if it ignores the param).
      const res = await getCoaFields(page - 1, pageSize, debouncedSearch || undefined);
      if (res && res.data) {
        const fields = res.data.data || [];
        setData(fields);

        // Read pagination from the new shape; fall back to row count if missing.
        const pagination = res?.data?.pagination;
        if (pagination?.totalElements != null) {
          setTotalRows(pagination.totalElements);
          setTotalPage(pagination.totalPages || Math.max(1, Math.ceil(pagination.totalElements / pageSize)));
        } else {
          setTotalRows(fields.length);
          setTotalPage(Math.max(1, Math.ceil(fields.length / pageSize)));
        }
      }
    } catch (error: any) {
      console.error("Error fetching COA fields:", error);
      toast.error(error?.response?.data?.message || t("coaFields.toast.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch]);

  const handleAddEdit = async (values: any) => {
    try {
      setLoading(true);
      if (editingField) {
        await updateCoaField(editingField.id, values);
        toast.success(t("coaFields.toast.updated"));
      } else {
        await createCoaField(values);
        toast.success(t("coaFields.toast.created"));
      }
      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving COA field:", error);
      toast.error(error?.response?.data?.message || t("coaFields.toast.saveFailed"));
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
        toast.success(t("coaFields.toast.deactivated"));
      } else {
        await activateCoaField(field.id);
        toast.success(t("coaFields.toast.activated"));
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
      toast.error(error?.response?.data?.message || t("coaFields.toast.operationFailed"));
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
          {t("common:edit")}
        </Menu.Item>
        <Menu.Item
          key="toggle"
          icon={isActive ? <PoweroffOutlined /> : <CheckCircleOutlined />}
          onClick={() => {
            Modal.confirm({
              title: t("coaFields.confirmToggle", {
                action: isActive
                  ? t("coaFields.actionDeactivate")
                  : t("coaFields.actionActivate"),
              }),
              onOk: () => toggleStatus({ ...row, active: isActive }),
            });
          }}
          danger={isActive}
        >
          {isActive ? t("common:deactivate") : t("common:activate")}
        </Menu.Item>
      </Menu>
    );
  };

  const columns = [
    {
      name: t("coaFields.col.fieldKey"),
      selector: (row: any) => row.fieldKey,
      sortable: true,
    },
    {
      name: t("coaFields.col.labelEn"),
      selector: (row: any) => row.fieldLabelEn,
      sortable: true,
    },
    {
      name: t("coaFields.col.labelAr"),
      selector: (row: any) => row.fieldLabelAr,
      sortable: true,
    },
    {
      name: t("coaFields.col.category"),
      selector: (row: any) => row.category,
      sortable: true,
    },
    {
      name: t("coaFields.col.mandatory"),
      selector: (row: any) => (row.mandatoryDefault ? t("common:yes") : t("common:no")),
      sortable: true,
    },
    {
      name: t("coaFields.col.order"),
      selector: (row: any) => row.displayOrder,
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const isActive = getIsActive(row);
        return (
          <div
            style={{
              padding: "5px 12px",
              borderRadius: "32px",
              fontSize: "11px",
              fontWeight: "600",
              backgroundColor: isActive ? "var(--color-success)" : "var(--color-error)",
              color: "white",
              textAlign: "center",
              width: "80px",
            }}
          >
            {isActive ? t("common:active") : t("common:inactive")}
          </div>
        );
      },
    },
    {
      name: t("common:actions"),
      cell: (row: any) => (
        <Dropdown overlay={actionMenu(row)} trigger={["click"]}>
          <Button
            type="primary"
            className="gradient-btn d-flex align-items-center gap-2"
            style={{
              borderColor: "white",
              borderRadius: "2px",
              padding: "6px 15px",
              height: "auto",
              fontSize: "12px"
            }}
          >
            {t("account.select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

return (
  <div className="service coa-fields-page">
    <div className="mb-3 pb-2 border-bottom">
      <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
        <span className="pro-head-badge">
          <ListChecks className="h-4 w-4" />
        </span>
        {t("coaFields.title")}
      </h3>
    </div>

    {/* Filters card */}
    <div className="pro-card p-3 mb-3">
      <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <Input
          allowClear
          placeholder={t("coaFields.searchPlaceholder")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        <button
          type="button"
          className="theme-btn-next"
          onClick={() => openModal()}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {t("coaFields.addNew")}
        </button>
      </div>
    </div>

    {/* Table card */}
    <div className="pro-card">
      <TableView
        data={data}
        header={columns}
        isLoading={loading}
        totalRows={totalRows}
        totalPage={totalPage}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        from={totalRows > 0 ? (page - 1) * pageSize + 1 : 0}
        to={Math.min(page * pageSize, totalRows)}
        paginationShow={true}
      />
    </div>

    <Modal
      title={editingField ? t("coaFields.editTitle") : t("coaFields.addTitle")}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      onOk={() => form.submit()}
      confirmLoading={loading}
      className="custom-mod"
      style={{ maxWidth: "640px" }}
      centered
      destroyOnClose
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
              label={t("coaFields.fieldKey")}
              rules={[{ required: true, message: t("coaFields.val.fieldKeyRequired") }]}
            >
              <Input placeholder={t("coaFields.fieldKeyPlaceholder")} disabled={!!editingField} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="category"
              label={t("coaFields.category")}
              rules={[{ required: true, message: t("coaFields.val.categoryRequired") }]}
            >
              <Select placeholder={t("coaFields.selectCategory")}>
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
              label={t("coaFields.labelEnglish")}
              rules={[{ required: true, message: t("coaFields.val.labelEnRequired") }]}
            >
              <Input placeholder={t("coaFields.labelEnPlaceholder")} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="fieldLabelAr"
              label={t("coaFields.labelArabic")}
              rules={[{ required: true, message: t("coaFields.val.labelArRequired") }]}
            >
              <Input placeholder="حساب التحصيل" style={{ direction: "rtl" }} />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="displayOrder"
              label={t("coaFields.displayOrder")}
              rules={[{ required: true, message: t("coaFields.val.displayOrderRequired") }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="mandatoryDefault"
              label={t("coaFields.isMandatory")}
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
