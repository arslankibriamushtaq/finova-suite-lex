import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Menu,
  // Select,
  Modal,
  Form,
  Switch,
  Dropdown,
  // Checkbox,
} from "antd";
import TableView from "../TableView/TableView";
// import { FaFilter } from "react-icons/fa";
// import { Images } from "../Config/Images";
// import { deleteDepartment, addRole, getRoles, updateEmployee, editRole, deleteRole } from "../../redux/apis/apisCrud";
import { getRoles, saveRole, updateRole, deleteRole } from "../../redux/apis/apisCrudFactoring";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { usePermissions, ROLE_PERMISSIONS } from "../../hooks/useProductPermissions";
// import { useWorkflowActions, WORKFLOW_MODULE_NAMES } from "../../hooks/useProductPermissions";
// import { CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined, StopOutlined } from "@ant-design/icons";
const RoleList = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  // const [data, setData] = useState<any>([]);
  // const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  // const [selectedFilters, setSelectedFilters] = useState();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [roleData, setRoleData] = useState<any>([]);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", status: false });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Permissions
  //const { canCreate, canUpdate, canRemove } = usePermissions();
  // const { verifyItem, rejectAsChecker, approveItem, rejectAsApprover } = useWorkflowActions();
  //const canCreateRole = canCreate(ROLE_PERMISSIONS);
  //const canEditRole = canUpdate(ROLE_PERMISSIONS);
  //const canDeleteRole = canRemove(ROLE_PERMISSIONS);
  // const canVerifyRole = canVerifyModule(ROLE_PERMISSIONS);
  // const canCheckerRejectRole = canRejectAsChecker(ROLE_PERMISSIONS);
  // const canApproveRole = canApproveModule(ROLE_PERMISSIONS);
  // const canApproverRejectRole = canRejectAsApprover(ROLE_PERMISSIONS);
  //const hasAnyAction = canEditRole || canDeleteRole;

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      setSelectedItem("edit");
      setCurrentRoleId(row.id);
      setFormData({ name: row.Name, status: !!row.status });
      setShowModal(true);
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
      setSelectedItem("delete");
    }
  };

  // Workflow action handlers (commented – not used with factoring APIs)
  // const handleVerify = async (row: any) => {
  //   const result = await verifyItem(WORKFLOW_MODULE_NAMES.ROLE, row, { role_id: row.id });
  //   if (result.success) getRoleData();
  // };
  // const handleCheckerReject = async (row: any) => {
  //   const result = await rejectAsChecker(WORKFLOW_MODULE_NAMES.ROLE, row, { role_id: row.id });
  //   if (result.success) getRoleData();
  // };
  // const handleApprove = async (row: any) => {
  //   const result = await approveItem(WORKFLOW_MODULE_NAMES.ROLE, row, { role_id: row.id });
  //   if (result.success) getRoleData();
  // };
  // const handleApproverReject = async (row: any) => {
  //   const result = await rejectAsApprover(WORKFLOW_MODULE_NAMES.ROLE, row, { role_id: row.id });
  //   if (result.success) getRoleData();
  // };

  const menu = (row: any) => (
    <Menu>
      {/* {canEditRole && ( */}
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleMenuClick("edit", row)}>
          Edit
        </Menu.Item>
      {/* )} */}
      {/* {canDeleteRole && ( */}
        <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleMenuClick("delete", row)}>
          Delete
        </Menu.Item>
      {/* )} */}
      {/* {canVerifyRole && (
        <Menu.Item key="verify" icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />} onClick={() => handleVerify(row)}>Verify</Menu.Item>
      )}
      {canCheckerRejectRole && (
        <Menu.Item key="checkerReject" icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />} onClick={() => handleCheckerReject(row)}>Reject (Checker)</Menu.Item>
      )}
      {canApproveRole && (
        <Menu.Item key="approve" icon={<SafetyCertificateOutlined style={{ color: "#1890ff" }} />} onClick={() => handleApprove(row)}>Approve</Menu.Item>
      )}
      {canApproverRejectRole && (
        <Menu.Item key="approverReject" icon={<StopOutlined style={{ color: "#ff4d4f" }} />} onClick={() => handleApproverReject(row)}>Reject (Approver)</Menu.Item>
      )} */}
    </Menu>
  );

  const Activity_Loans_Header = [
    { name: "Name", selector: (row: { Name: any }) => row.Name },
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
    // Change Status column (commented – not used)
    // {
    //   name: "Change Status",
    //   cell: (row: any) => (
    //     <Switch className="red-switch" checked={row.default_status === "active"} onChange={...} />
    //   ),
    // },
    /* ...(hasAnyAction
      ? [ */
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
        /* ]
      : []), */
  ];

  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await deleteRole(deleteTargetId);
      if (res?.data?.success) {
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
      const res = await getRoles(page, pageSize);
      if (res?.data?.success) {
        const apiData = res.data.data;
        const list = Array.isArray(apiData?.data) ? apiData.data : Array.isArray(apiData) ? apiData : [];
        setRoleData(list);
        setTotalRows(list.length);
        setFrom(list.length ? 1 : 0);
        setTo(list.length);
        setTotalPage(list.length ? 1 : 0);
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
        const statusNum = formData.status ? 1 : 0;
        const res = await updateRole(currentRoleId, formData.name, statusNum);
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Role updated.");
          setShowModal(false);
          setShowConfirmModal(false);
          setSelectedItem(null);
          setCurrentRoleId(null);
          setFormData({ name: "", status: false });
          getRoleData();
        } else {
          toast.error(res?.data?.message || "Failed to update role.");
        }
      } else if (selectedItem === "add") {
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("status", formData.status ? "1" : "0");
        const res = await saveRole(fd);
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Role added.");
          setShowModal(false);
          setShowConfirmModal(false);
          setSelectedItem(null);
          setFormData({ name: "", status: false });
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
      Name: item?.name,
      status: item?.status,
      actions: item?.actions || [],
    }));

  // const options = [{ label: "Name", value: "name" }];
  // const handleChange = (value: SetStateAction<undefined>[]) => { setSelectedFilters(value[0]); };

  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
      >
        <div className="d-flex mb-3 col-12 filter-select">
          {/* <Select mode="tags" style={{ width: "15%" }} onChange={handleChange} placeholder="Filter" tokenSeparators={[","]} suffixIcon={<FaFilter />} options={options} /> */}
          <div className="d-flex gap-2 w-100 justify-content-between align-items-center">
          <h5 style={{ fontWeight: 600, margin: 0 }}>Role</h5>
            {/* <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
              <img src={Images.searchIconGray} alt="" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." />
            </div> */}
            {/* {canCreateRole && ( */}
              <button
                className="theme-btn-next"
                onClick={() => {
                  setShowModal(true);
                  setSelectedItem("add");
                  setFormData({ name: "", status: true });
                }}
              >
                Add New Role
              </button>
            {/* )} */}
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
          title={selectedItem === "edit" ? "Edit Record" : "Add New Record"}
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
          <div className={"Ente-details"}>
            <Form>
              {/* <div className="custom-input-container"> */}
              <label className="fw-400">Role name</label>
              <Input
                type="text"
                className="fs-6"
                placeholder="Enter role name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
              <div className="d-flex align-items-center gap-2 mt-4">
                <Switch
                  checked={formData.status}
                  onChange={(checked) => setFormData((prev) => ({ ...prev, status: checked }))}
                />
                <label className="fw-400 mb-0">Status</label>
              </div>
              {/* </div> */}
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
              ? "Edit Record"
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
              onClick={
                selectedItem == "delete" ? handleDeleteConfirmed : handleSave
              }
            >
              Yes
            </Button>,
          ]}
        >
          <Form>
            {`${
              selectedItem == "edit"
                ? "Are you sure you want to update this record?"
                : selectedItem == "add"
                ? "Are you sure you want to add new record?"
                : "Are you sure you want to delete this record?"
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default RoleList;
