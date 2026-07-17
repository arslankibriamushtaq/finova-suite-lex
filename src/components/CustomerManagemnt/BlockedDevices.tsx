import { useEffect, useState } from "react";
import { Button, Input, Select, Modal, Form, Dropdown, Menu } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  getBlockEntities,
  createBlockEntity,
  getBlockCodeTypes,
  getBlockEntityById,
  updateBlockEntity,
  deleteBlockEntity,
} from "../../redux/apis/apisCrud";

const BlockedDevices = () => {
  const { t } = useTranslation("customerManagement");
  const [tableData, setTableData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [currentEntityId, setCurrentEntityId] = useState<number | null>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [blockTypes, setBlockTypes] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [form] = Form.useForm();

  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getBlockEntities(page, pageSize);
      if (response?.data?.success) {
        const responseData = response.data.data;
        // Extract the actual data array
        const data = responseData?.data || [];
        setTableData(data);
        
        // Extract pagination information
        setTotalRows(responseData?.total || 0);
        setTotalPage(responseData?.last_page || 0);
        setFrom(responseData?.from || 0);
        setTo(responseData?.to || 0);
        
        // Update page if it changed from API response
        if (responseData?.current_page) {
          setPage(responseData.current_page);
        }
        
        // Update pageSize if it changed from API response
        if (responseData?.per_page && responseData.per_page !== pageSize) {
          setPageSize(responseData.per_page);
        }
      }
    } catch (error: any) {
      console.error("Error fetching blocked devices:", error);
      toast.error(error?.response?.data?.notificationMessage || t("blockedDevices.toast.fetchDevicesError"));
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const fetchBlockTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await getBlockCodeTypes();
      if (response?.data?.success) {
        setBlockTypes(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching block types:", error);
      toast.error(error?.response?.data?.notificationMessage || t("blockedDevices.toast.fetchTypesError"));
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleMenuClick = async (key: string, row: any) => {
    switch (key) {
      case "view":
        try {
          const response = await getBlockEntityById(row.id);
          if (response?.data?.success) {
            setViewData(response.data.data);
            setShowViewModal(true);
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.notificationMessage || t("blockedDevices.toast.fetchDetailsError"));
        }
        break;
      case "edit":
        setSelectedItem("edit");
        setCurrentEntityId(row.id);
        form.setFieldsValue({
          type: row.type || "",
          values: row.values || "",
        });
        setShowModal(true);
        break;
      case "delete":
        setDeleteTargetId(row.id);
        setShowConfirmModal(true);
        setSelectedItem("delete");
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteBlockEntity(deleteTargetId), {
        loading: t("blockedDevices.toast.deleting"),
        success: (response) => {
          getData();
          setShowConfirmModal(false);
          setDeleteTargetId(null);
          return response?.data?.notificationMessage || t("blockedDevices.toast.deleted");
        },
        error: (err) => err?.response?.data?.notificationMessage || err?.message || t("blockedDevices.toast.deleteError"),
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
      setDeleteTargetId(null);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const body = {
        type: values.type,
        values: values.values,
        block_code_id: 6
      };

      if (selectedItem === "edit" && currentEntityId !== null) {
        await toast.promise(updateBlockEntity(currentEntityId, body), {
          loading: t("blockedDevices.toast.updating"),
          success: (response) => {
            setShowModal(false);
            form.resetFields();
            setCurrentEntityId(null);
            setSelectedItem(null);
            getData();
            return response?.data?.notificationMessage || t("blockedDevices.toast.updated");
          },
          error: (err) => {
            const errors = err?.response?.data?.errors;
            if (errors) {
              const allMessages = Object.values(errors).flat();
              allMessages.forEach((msg: any) => toast.error(msg));
            }
            return err?.response?.data?.notificationMessage || err?.message || t("blockedDevices.toast.updateError");
          },
        });
      } else if (selectedItem === "add") {
        await toast.promise(createBlockEntity(body), {
          loading: t("blockedDevices.toast.creating"),
          success: (response) => {
            setShowModal(false);
            form.resetFields();
            setSelectedItem(null);
            getData();
            return response?.data?.notificationMessage || t("blockedDevices.toast.created");
          },
          error: (err) => {
            const errors = err?.response?.data?.errors;
            if (errors) {
              const allMessages = Object.values(errors).flat();
              allMessages.forEach((msg: any) => toast.error(msg));
            }
            return err?.response?.data?.notificationMessage || err?.message || t("blockedDevices.toast.createError");
          },
        });
      }
    } catch (error: any) {
      console.error("Validation error:", error);
    }
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        {t("common:view")}
      </Menu.Item>
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

  useEffect(() => {
    getData();
    fetchBlockTypes();
  }, [page, pageSize]);

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const tableHeaders = [
    {
      name: t("blockedDevices.col.id"),
      selector: (row: any) => row.id || "-",
    },
    {
      name: t("common:type"),
      selector: (row: any) => row.type || "-",
    },
    {
      name: t("blockedDevices.col.values"),
      selector: (row: any) => row.values || "-",
    },
    {
      name: t("common:actions"),
 
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "var(--color-action) !important",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("common:select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-end mb-3">
          <Button
            type="primary"
            className="theme-btn-next"
            onClick={() => {
              setSelectedItem("add");
              form.resetFields();
              setCurrentEntityId(null);
              setShowModal(true);
            }}
          >
            {t("blockedDevices.addButton")}
          </Button>
        </div>
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            header={tableHeaders}
            data={tableData}
            totalRows={totalRows}
            totalPage={totalPage}
            page={page}
            pageSize={pageSize}
            from={from}
            to={to}
            isLoading={skelitonLoading}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal maskClosable={false} keyboard={false}
        title={selectedItem === "edit" ? t("blockedDevices.editTitle") : t("blockedDevices.addButton")}
        visible={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
          setSelectedItem(null);
          setCurrentEntityId(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setShowModal(false);
            form.resetFields();
            setSelectedItem(null);
            setCurrentEntityId(null);
          }}>
            {t("common:cancel")}
          </Button>,
          <Button
            key="save"
            type="primary"
            className="theme-btn-next"
            onClick={handleSave}
          >
            {selectedItem === "edit" ? t("common:update") : t("common:save")}
          </Button>,
        ]}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("blockedDevices.form.typeLabel")}
            name="type"
            rules={[{ required: true, message: t("blockedDevices.form.typeRequired") }]}
          >
            <Select
              placeholder={t("blockedDevices.form.typePlaceholder")}
              loading={loadingTypes}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  ?.includes(input.toLowerCase())
              }
            >
              {blockTypes.map((type: any) => (
                <Select.Option key={type.id || type.value} value={type.value || type.name || type}>
                  {type.name || type.label || type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={t("blockedDevices.form.valueLabel")}
            name="values"
            rules={[{ required: true, message: t("blockedDevices.form.valueRequired") }]}
          >
            <Input placeholder={t("blockedDevices.form.valuePlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal maskClosable={false} keyboard={false}
        title={t("blockedDevices.viewTitle")}
        visible={showViewModal}
        onCancel={() => {
          setShowViewModal(false);
          setViewData(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowViewModal(false);
            setViewData(null);
          }}>
            {t("common:close")}
          </Button>,
        ]}
        width={600}
      >
        {viewData && (
          <div>
            <div className="mb-3">
              <strong>{t("blockedDevices.col.id")}:</strong> {viewData.id || "-"}
            </div>
            <div className="mb-3">
              <strong>{t("common:type")}:</strong> {viewData.type || "-"}
            </div>
            <div className="mb-3">
              <strong>{t("blockedDevices.col.values")}:</strong> {viewData.values || "-"}
            </div>
            {viewData.created_at && (
              <div className="mb-3">
                <strong>{t("common:createdAt")}:</strong> {formatDate(viewData.created_at)}
              </div>
            )}
            {viewData.updated_at && (
              <div className="mb-3">
                <strong>{t("common:updatedAt")}:</strong> {formatDate(viewData.updated_at)}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal maskClosable={false} keyboard={false}
        title={t("common:confirmDelete")}
        visible={showConfirmModal}
        onOk={handleDeleteConfirmed}
        onCancel={() => {
          setShowConfirmModal(false);
          setDeleteTargetId(null);
        }}
        okText={t("common:delete")}
        okButtonProps={{ danger: true }}
        cancelText={t("common:cancel")}
      >
        <p>{t("blockedDevices.deleteConfirmMessage")}</p>
      </Modal>
    </>
  );
};

export default BlockedDevices;

