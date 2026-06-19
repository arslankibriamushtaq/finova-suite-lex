import { useEffect, useRef, useState } from "react";
import { Input, Dropdown, Menu, Button, Select, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";

import TableView from "../../../components/TableView/TableView";
import {
  getCategories,
  getDepartments,
  getMyTickets,
  getSubCategories,
  escalateTicket,
  updateTicket,
  getUserInfo
} from "../../../redux/apis/apisCrudCms";
import {
  ArrowRightOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { formatDate } from "../../../App";
import { useNavigate } from "react-router-dom";

const MyTickets = () => {
  const [ticketsData, setTicketsData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const isFirstRender = useRef(true);
  const [Categories, setCategories] = useState<any>([]);
  const [subCategories, setSubCategories] = useState<any>([]);
  const [departments, setDepartments] = useState<any>([]);
  const [editComplaintModal, setEditComplaintModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [complaintFormData, setComplaintFormData] = useState<any>({
    category: "",
    subCategory: "",
    department: "",
    status: "",
    description: "",
  });
  const [escalateModal, setEscalateModal] = useState(false);
  const [escalateFormData, setEscalateFormData] = useState<any>({
    department_id: "",
    comment: "",
  });
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingEscalate, setLoadingEscalate] = useState(false);
  const navigate = useNavigate();
  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getMyTickets(
        page,
        pageSize,
        searchValue
      );
      if (response) {
        const values = response?.data?.data?.tickets;
        setTicketsData(values || []);
        setTotalRows(response?.data?.data?.pagination?.total || 0);
        setFrom(response?.data?.data?.pagination?.from || 0);
        setTo(response?.data?.data?.pagination?.to || 0);
        setTotalPage(response?.data?.data?.pagination?.last_page || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const mappedData =
    ticketsData &&
    ticketsData.map((item: any) => {
      return {
        id: item?.id,
        srNo: item?.ticket_number || "-",
        complainerName: item?.customer?.name || "-",
        contactNo: item?.customer?.contact_no || "-",
        description: item?.description || "-",
        department: item?.department,
        status: item?.status_id,
        category: item?.category,
        subCategory: item?.sub_category,
        createdAt: item?.created_at || item?.date || "-",
        escalations: item?.escalation_count || 0,
        customer: item?.customer,
        city_id: item?.city_id,
        country_id: item?.country_id,
        channels: item?.channels,
      };
    });
    useEffect(() => {
      getCategoriesList();
      getSubCategoriesList();
      getDepartmentsList();
    }, []);
    const getCategoriesList = async () => {
      try {
        const response = await getCategories(1, 100);
        if (response) {
          setCategories(response?.data?.data?.categories || []);
        }
      } catch (error) {
        setCategories([]);
      }
    };
    const getSubCategoriesList = async () => {
      try {
        const response = await getSubCategories(1, 100);
        if (response) {
          setSubCategories(response?.data?.data?.sub_categories || []);
        }
      } catch (error) {
        setSubCategories([]);
      }
    };
    const getDepartmentsList = async () => {
      try {
        const response = await getDepartments(1, 100);
        if (response) {
          setDepartments(response?.data?.data?.departments || []);
        }
      } catch (error) {
        setDepartments([]);
      }
    };
    const statuses = [
      { id: 1, title: "PENDING" },
      { id: 2, title: "ASSIGNED" },
      { id: 3, title: "REJECTED" },
      { id: 4, title: "RESOLVED" },
      { id: 5, title: "INVALID" },
      { id: 6, title: "REVERT" },
    ];
  useEffect(() => {
    getData();
  }, [pageSize, page]);
  // Debounce search
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (page === 1) {
        getData();
      } else {
        setPage(1); // Reset to first page, which will trigger getData via the other useEffect
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchValue]);
  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      setEditComplaintModal(true);
      setSelectedRow(row);
      setComplaintFormData({
        category: row?.category?.id || "",
        subCategory: row?.subCategory?.id || "",
        department: row?.department?.id || "",
        status: row?.status || "",
        description: row?.description || "",
      });
    } else if (key === "escalate") {
      setEscalateModal(true);
      setSelectedRow(row);
      setEscalateFormData({
        department_id: "",
        comment: "",
      });
    }
     else if (key === "view") {
     navigate(`/cms/Tickets/TicketDetails/${row.id}`);
    }
  };

    const menu = (row: any) => [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit",
        onClick: () => handleChange("edit", row),
      },
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "View Details",
      onClick: () => handleChange("view", row),
    },
    {
      key: "escalate",
      icon: <ArrowRightOutlined />,
      label: "Escalate Ticket",
      onClick: () => handleChange("escalate", row),
    },
  ];


  const Table_Headers = [
    {
      name: "Sr No.",
      selector: (row: any) => row.srNo,
    },
    {
      name: "Complainer Name",
      selector: (row: any) => row.complainerName,
    },
    {
      name: "Contact No",
      selector: (row: any) => row.contactNo,
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
    },
    {
      name: "Department",
      selector: (row: any) => row.department?.name || "-",
    },
    {
      name: "Status",
      selector: (row: any) => statuses.find((status: any) => status.id === row.status)?.title || "-",
    },
    {
      name: "Category",
      selector: (row: any) => row.category?.title || "-",
    },
    {
      name: "Sub Category",
      selector: (row: any) => row.subCategory?.title || "-",
    },
    {
      name: "Created At",
      selector: (row: any) => formatDate(row.createdAt),
    },
    {
      name: "Escalations",
      selector: (row: any) => row.escalations,
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 0.8rem",
            borderRadius: "6px",
            backgroundColor: "var(--color-cms-purple)",
            color: "var(--primary-foreground)",
            display: "inline-block",
            fontWeight: "bold",
          }}
        >
          {row.escalations}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown menu={{ items: menu(row) }} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "white",
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const handleSave = async () => {
    setLoadingSave(true);
    try {
      // Try to get user info to retrieve NID
      let userNid = null;
      try {
        const userInfoResponse = await getUserInfo(selectedRow?.contactNo);
        userNid = userInfoResponse?.data?.data?.nid;
      } catch (error) {
        // If getUserInfo fails, continue without NID
      }

      const body: any = {
        category_id: complaintFormData.category,
        sub_category_id: complaintFormData.subCategory,
        department_id: complaintFormData.department,
        status_id: complaintFormData.status,
        description: complaintFormData.description,
        contact_no: selectedRow?.contactNo,
        name: selectedRow?.complainerName,
        email: selectedRow?.customer?.email,
        country_id: selectedRow?.country_id,
        city_id: selectedRow?.city_id,
        channels: selectedRow?.channels,
      };

      // Only add NID if it exists
      if (userNid) {
        body.nid = userNid;
      }

      await toast.promise(updateTicket(selectedRow?.id, body), {
        loading: "Updating...",
        success: (response: any) => {
          if (response?.data?.success) {
            setEditComplaintModal(false);
            setComplaintFormData({
              category: "",
              subCategory: "",
              department: "",
              status: "",
              description: "",
            });
            getData();
          }
          return response?.data?.message;
        },
        error: (err) => (err?.response?.data?.message) || "Failed to update",
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to update ticket");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleEscalate = async () => {
    setLoadingEscalate(true);
    try {
      const body = {
        department_id: escalateFormData.department_id,
        comment: escalateFormData.comment,
      };
      await toast.promise(escalateTicket(selectedRow?.id, body), {
        loading: "Escalating...",
        success: (response: any) => {
          if (response?.data?.success) {
            setEscalateModal(false);
            setEscalateFormData({
              department_id: "",
              comment: "",
            });
            getData();
          }
          return response?.data?.message;
        },
        error: (err) => (err?.response?.data?.message) || "Failed to escalate",
      });
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoadingEscalate(false);
    }
  };
  return (
    <>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1 style={{ fontSize: "22px" }} className="mb-0">My Tickets</h1>
          </div>
          <div className="d-flex justify-content-end align-items-center">
            <Input
              placeholder="Search tickets"
              value={searchValue}
              prefix={<SearchOutlined />}
              onChange={(e: any) => {
                setSearchValue(e.target.value);
              }}
              style={{ width: "300px", height: "33px" }}
            />
          </div>
        </div>

        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          header={Table_Headers}
          data={mappedData}
          isLoading={skelitonLoading}
          from={from}
          to={to}
          totalPage={totalPage}
        />
      </div>
      <Modal
          open={editComplaintModal}
          onCancel={() => setEditComplaintModal(false)}
          centered
          maskClosable={false}
          title={
            <span style={{ fontSize: "16px", fontWeight: 600 }}>
              Edit Complaint
            </span>
          }
          footer={null}
          width={600}
        >
          <div style={{ padding: "20px 0" }}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--color-text-dark)",
                }}
              >
                Select Category
              </label>
              <Select
                placeholder="Select Category"
                value={complaintFormData.category || undefined}
                onChange={(value) => setComplaintFormData({ ...complaintFormData, category: value })}
                style={{ width: "100%", height: "40px" }}
              >
                {Categories.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>{item.title}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--color-text-dark)",
                }}
              >
                Select Sub Category
              </label>
              <Select
                placeholder="Select SubCategory"
                value={complaintFormData.subCategory || undefined}
                onChange={(value) => setComplaintFormData({ ...complaintFormData, subCategory: value })}
                style={{ width: "100%", height: "40px" }}
              >
                {subCategories.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>{item.title}</Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--color-text-dark)",
                }}
              >
                Department
              </label>
              <Select
                placeholder="Select Department"
                value={complaintFormData.department || undefined}
                onChange={(value) => setComplaintFormData({ ...complaintFormData, department: value })}
                style={{ width: "100%", height: "40px" }}
              >
                {departments.map((department: any) => (
                  <Select.Option key={department.id} value={department.id}>{department.name}</Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--color-text-dark)",
                }}
              >
                Select Status
              </label>
              <Select
                placeholder="Select Status"
                value={complaintFormData.status || undefined}
                onChange={(value) => setComplaintFormData({ ...complaintFormData, status: value })}
                style={{ width: "100%", height: "40px" }}
              >
                {statuses.map((status: any) => (
                  <Select.Option key={status.id} value={status.id}>{status.title}</Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--color-text-dark)",
                }}
              >
                Comment
              </label>
              <Input
                placeholder="Enter comment"
                value={complaintFormData.description || undefined}
                onChange={(e) => setComplaintFormData({ ...complaintFormData, description: e.target.value })}
                style={{ height: "40px" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "30px",
              }}
            >
              <button
                onClick={() => setEditComplaintModal(false)}
                style={{
                  padding: "8px 24px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--color-cms-teal)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={loadingSave}
                style={{
                  padding: "8px 24px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: loadingSave ? "var(--color-text-slate)" : "var(--foreground)",
                  color: "white",
                  cursor: loadingSave ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  opacity: loadingSave ? 0.6 : 1,
                }}
              >
                {loadingSave ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
         {/* Escalate Ticket Modal */}
         <Modal
          open={escalateModal}
          onCancel={() => {
            setEscalateModal(false);
            setEscalateFormData({
              department_id: "",
              comment: "",
            });
          }}
          centered
          maskClosable={false}
          title={
            <span style={{ fontSize: "16px", fontWeight: 600 }}>
              Escalate Ticket
            </span>
          }
          footer={null}
          width={600}
        >
          <div style={{ padding: "20px 0" }}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--color-text-dark)",
                }}
              >
                Select Department
              </label>
              <Select
                placeholder="Select Department"
                value={escalateFormData.department_id || undefined}
                onChange={(value) => setEscalateFormData({ ...escalateFormData, department_id: value })}
                style={{ width: "100%", height: "40px" }}
              >
                {departments.map((department: any) => (
                  <Select.Option key={department.id} value={department.id}>
                    {department.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--color-text-dark)",
                }}
              >
                Comment
              </label>
              <TextArea
                placeholder="Enter comment"
                value={escalateFormData.comment}
                onChange={(e) => setEscalateFormData({ ...escalateFormData, comment: e.target.value })}
                rows={4}
                style={{ resize: "none" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "30px",
              }}
            >
              <button
                onClick={() => {
                  setEscalateModal(false);
                  setEscalateFormData({
                    department_id: "",
                    comment: "",
                  });
                }}
                style={{
                  padding: "8px 24px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--color-cms-teal)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Close
              </button>
              <button
                onClick={handleEscalate}
                disabled={loadingEscalate}
                style={{
                  padding: "8px 24px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: loadingEscalate ? "var(--color-text-slate)" : "var(--foreground)",
                  color: "white",
                  cursor: loadingEscalate ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  opacity: loadingEscalate ? 0.6 : 1,
                }}
              >
                {loadingEscalate ? "Escalating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
    </>
  );
};

export default MyTickets;

