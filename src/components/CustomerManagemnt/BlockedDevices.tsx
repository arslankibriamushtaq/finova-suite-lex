import { useEffect, useState } from "react";
import { Button, Input, Select, Modal, Form, Dropdown, Menu } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import {
  getBlockEntities,
  createBlockEntity,
  getBlockCodeTypes,
  getBlockEntityById,
  updateBlockEntity,
  deleteBlockEntity,
} from "../../redux/apis/apisCrud";

const BlockedDevices = () => {
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
      toast.error(error?.response?.data?.notificationMessage || "Failed to fetch blocked devices");
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
      toast.error(error?.response?.data?.notificationMessage || "Failed to fetch block types");
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
          toast.error(error?.response?.data?.notificationMessage || "Failed to fetch entity details");
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
        loading: "Deleting block entity...",
        success: (response) => {
          getData();
          setShowConfirmModal(false);
          setDeleteTargetId(null);
          return response?.data?.notificationMessage || "Block entity deleted successfully";
        },
        error: (err) => err?.response?.data?.notificationMessage || err?.message || "Failed to delete block entity",
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
          loading: "Updating block entity...",
          success: (response) => {
            setShowModal(false);
            form.resetFields();
            setCurrentEntityId(null);
            setSelectedItem(null);
            getData();
            return response?.data?.notificationMessage || "Block entity updated successfully";
          },
          error: (err) => {
            const errors = err?.response?.data?.errors;
            if (errors) {
              const allMessages = Object.values(errors).flat();
              allMessages.forEach((msg: any) => toast.error(msg));
            }
            return err?.response?.data?.notificationMessage || err?.message || "Failed to update block entity";
          },
        });
      } else if (selectedItem === "add") {
        await toast.promise(createBlockEntity(body), {
          loading: "Creating block entity...",
          success: (response) => {
            setShowModal(false);
            form.resetFields();
            setSelectedItem(null);
            getData();
            return response?.data?.notificationMessage || "Block entity created successfully";
          },
          error: (err) => {
            const errors = err?.response?.data?.errors;
            if (errors) {
              const allMessages = Object.values(errors).flat();
              allMessages.forEach((msg: any) => toast.error(msg));
            }
            return err?.response?.data?.notificationMessage || err?.message || "Failed to create block entity";
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
        View
      </Menu.Item>
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
      name: "ID",
      selector: (row: any) => row.id || "-",
    },
    {
      name: "Type",
      selector: (row: any) => row.type || "-",
    },
    {
      name: "Values",
      selector: (row: any) => row.values || "-",
    },
    {
      name: "Actions",
 
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "var(--color-action) !important",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
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
            Add Block Entity
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
      <Modal
        title={selectedItem === "edit" ? "Edit Block Entity" : "Add Block Entity"}
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
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            className="theme-btn-next"
            onClick={handleSave}
          >
            {selectedItem === "edit" ? "Update" : "Save"}
          </Button>,
        ]}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Block Entity Type"
            name="type"
            rules={[{ required: true, message: "Please select block entity type" }]}
          >
            <Select
              placeholder="Select Block Entity Type"
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
            label="Value"
            name="values"
            rules={[{ required: true, message: "Please enter value" }]}
          >
            <Input placeholder="Enter value" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="View Block Entity"
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
            Close
          </Button>,
        ]}
        width={600}
      >
        {viewData && (
          <div>
            <div className="mb-3">
              <strong>ID:</strong> {viewData.id || "-"}
            </div>
            <div className="mb-3">
              <strong>Type:</strong> {viewData.type || "-"}
            </div>
            <div className="mb-3">
              <strong>Values:</strong> {viewData.values || "-"}
            </div>
            {viewData.created_at && (
              <div className="mb-3">
                <strong>Created At:</strong> {formatDate(viewData.created_at)}
              </div>
            )}
            {viewData.updated_at && (
              <div className="mb-3">
                <strong>Updated At:</strong> {formatDate(viewData.updated_at)}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        visible={showConfirmModal}
        onOk={handleDeleteConfirmed}
        onCancel={() => {
          setShowConfirmModal(false);
          setDeleteTargetId(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this block entity? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default BlockedDevices;

