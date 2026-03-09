import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Menu,
  Modal,
  Form,
  Switch,
  Dropdown,
  Tooltip,
} from "antd";
import TableView from "../TableView/TableView";
import { getRoles, saveRole, updateRole, deleteRole } from "../../redux/apis/apisCrudFactoring";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";

const emptyForm = { roleCode: "", roleName: "", roleNameAr: "", description: "", status: false };

const RoleList = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [roleData, setRoleData] = useState<any>([]);
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      setSelectedItem("edit");
      setCurrentRoleId(row.id);
      setFormData({
        roleCode: row.RoleCode || "",
        roleName: row.Name || "",
        roleNameAr: row.NameAr || "",
        description: row.Description || "",
        status: !!row.status,
      });
      setShowModal(true);
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
      setSelectedItem("delete");
    }
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        disabled={row.IsSystem}
        onClick={() => !row.IsSystem && handleMenuClick("edit", row)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        disabled={row.IsSystem}
        onClick={() => !row.IsSystem && handleMenuClick("delete", row)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const Activity_Loans_Header = [
    { name: "#", selector: (row: { Sr: any }) => row.Sr, width: "60px" },
    { name: "Role Code", selector: (row: { RoleCode: any }) => row.RoleCode },
    { name: "Name", selector: (row: { Name: any }) => row.Name },
    { name: "Name (Arabic)", selector: (row: { NameAr: any }) => row.NameAr },
    {
      name: "Description",
      grow: 2,
      cell: (row: any) => (
        <Tooltip title={row.Description} placement="topLeft">
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "220px",
              fontSize: "13px",
              cursor: "default",
            }}
          >
            {row.Description || "—"}
          </div>
        </Tooltip>
      ),
    },
    {
      name: "System",
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor: row.IsSystem ? "var(--color-primary, #1890ff)" : "#8c8c8c",
            color: "white",
          }}
        >
          {row.IsSystem ? "Yes" : "No"}
        </div>
      ),
    },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor: row.status ? "var(--color-success)" : "var(--color-error)",
            color: "white",
          }}
        >
          {row.status ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Action",
      width: "10%",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button className="gradient-btn" type="primary" style={{ fontSize: "12px", borderRadius: "4px", padding: "8px" }}>
            Select
            <img src={arrowDown} alt="" style={{ marginLeft: "5px" }} />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await deleteRole(deleteTargetId);
      if (res?.data?.success || res?.status === 200 || res?.status === 204) {
        toast.success(res?.data?.message || "Role deleted.");
        getRoleData();
        setShowConfirmModal(false);
        setDeleteTargetId(null);
        setSelectedItem(null);
      } else {
        toast.error(res?.data?.message || "Failed to delete role.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete role.");
      setShowConfirmModal(false);
    }
  };

  const getRoleData = async () => {
    setSkelitonLoading(true);
    try {
      const res = await getRoles();
      if (res) {
        const apiData = res?.data?.data;
        setRoleData(apiData);
        setTotalRows(apiData.length);
        setFrom(apiData.length ? 1 : 0);
        setTo(apiData.length);
        setTotalPage(apiData.length ? 1 : 0);
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedItem === "edit" && currentRoleId !== null) {
        const body = {
          roleName: formData.roleName,
          roleNameAr: formData.roleNameAr,
          description: formData.description,
          active: formData.status,
        };
        const res = await updateRole(currentRoleId, body);
        if (res?.data?.success || res?.status === 200) {
          toast.success(res?.data?.message || "Role updated.");
          setShowModal(false);
          setShowConfirmModal(false);
          setSelectedItem(null);
          setCurrentRoleId(null);
          setFormData(emptyForm);
          getRoleData();
        } else {
          toast.error(res?.data?.message || "Failed to update role.");
        }
      } else if (selectedItem === "add") {
        const body = {
          roleCode: formData.roleCode,
          roleName: formData.roleName,
          roleNameAr: formData.roleNameAr,
          description: formData.description,
        };
        const res = await saveRole(body);
        if (res?.data?.success || res?.status === 200 || res?.status === 201) {
          toast.success(res?.data?.message || "Role added.");
          setShowModal(false);
          setShowConfirmModal(false);
          setSelectedItem(null);
          setFormData(emptyForm);
          getRoleData();
        } else {
          toast.error(res?.data?.message || "Failed to add role.");
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong.";
      toast.error(msg);
      setShowConfirmModal(false);
    }
  };

  useEffect(() => {
    getRoleData();
  }, []);

  const mappedData =
    roleData &&
    roleData?.map((item: any, index: number) => ({
      id: item?.id,
      Sr: index + 1,
      RoleCode: item?.roleCode,
      Name: item?.roleName,
      NameAr: item?.roleNameAr,
      Description: item?.description,
      IsSystem: item?.system,
      status: item?.active,
      actions: item?.actions || [],
    }));

  return (
    <>
      <div className="service" style={{ background: "white", padding: "1rem", borderRadius: "10px" }}>
        <div className="d-flex mb-3 col-12 filter-select">
          <div className="d-flex gap-2 w-100 justify-content-between align-items-center">
            <h5 style={{ fontWeight: 600, margin: 0 }}>Role</h5>
            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setSelectedItem("add");
                setFormData(emptyForm);
              }}
            >
              Add New Role
            </button>
          </div>
        </div>
        <TableView
          header={Activity_Loans_Header}
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
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={selectedItem === "edit" ? "Edit Role" : "Add New Role"}
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => {
                setShowConfirmModal(true);
                setShowModal(false);
              }}
            >
              {selectedItem === "edit" ? "Save" : "Submit"}
            </Button>,
          ]}
        >
          <div className="Ente-details">
            <Form layout="vertical">
              <Form.Item label="Role Code">
                <Input
                  placeholder="e.g. custom_role"
                  value={formData.roleCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, roleCode: e.target.value }))
                  }
                />
              </Form.Item>
              <Form.Item label="Role Name">
                <Input
                  placeholder="Enter role name"
                  value={formData.roleName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, roleName: e.target.value }))
                  }
                />
              </Form.Item>
              <Form.Item label="Role Name (Arabic)">
                <Input
                  placeholder="أدخل اسم الدور"
                  value={formData.roleNameAr}
                  dir="rtl"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, roleNameAr: e.target.value }))
                  }
                />
              </Form.Item>
              <Form.Item label="Description">
                <Input.TextArea
                  placeholder="Enter description"
                  rows={3}
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </Form.Item>
              {selectedItem === "edit" && (
                <Form.Item label="Status">
                  <div className="d-flex align-items-center gap-2">
                    <Switch
                      checked={formData.status}
                      onChange={(checked: boolean) =>
                        setFormData((prev) => ({ ...prev, status: checked }))
                      }
                    />
                    <span>{formData.status ? "Active" : "Inactive"}</span>
                  </div>
                </Form.Item>
              )}
            </Form>
          </div>
        </Modal>

        <Modal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={
            selectedItem === "edit"
              ? "Edit Role"
              : selectedItem === "add"
              ? "Add New Role"
              : "Delete Role"
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>
              No
            </Button>,
            <Button
              key="yes"
              type="primary"
              onClick={selectedItem === "delete" ? handleDeleteConfirmed : handleSave}
            >
              Yes
            </Button>,
          ]}
        >
          <Form>
            {selectedItem === "edit"
              ? "Are you sure you want to update this record?"
              : selectedItem === "add"
              ? "Are you sure you want to add new record?"
              : "Are you sure you want to delete this record?"}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default RoleList;
