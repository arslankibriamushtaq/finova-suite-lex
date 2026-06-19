import { useEffect, useRef, useState } from "react";
import { Button, Dropdown, Input, Modal } from "antd";
import TableView from "../../../components/TableView/TableView";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { createPriority, deletePriority, getPriorities, updatePriority } from "../../../redux/apis/apisCrudCms";
import toast from "react-hot-toast";
const Priorities = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [tableData, setTableData] = useState<any>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [addPriorityModal, setAddPriorityModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [priorityName, setPriorityName] = useState("");
  const [priorityHours, setPriorityHours] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<any>(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    getData();
  }, [page, pageSize]);
  useEffect(() => {
    // Skip on initial mount only
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
  const handleMenuClick = (key: string, row: any) => {
    switch (key) {
      case "edit":
        setIsEditMode(true);
        setSelectedPriority(row);
        setPriorityName(row.priorityName || "");
        setPriorityHours(row.priorityhours || "");
        setAddPriorityModal(true);
        break;
      case "delete":
        setSelectedPriority(row);
        setIsDeleteModal(true);
        break;
    }
  };

  const getMenuItems = (row: any) => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => handleMenuClick("edit", row),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      onClick: () => handleMenuClick("delete", row),
    },
  ];

  const Table_Headers = [
    {
      name: "Sr No.",
      width: "30%",

      selector: (row: { srNo: string }) => row.srNo || "-",
    },
    {
        name: "Priority Name",
        width: "30%",

        selector: (row: { priorityName: string }) => row.priorityName || "-",
    },
    {
        name: "Priority Hours",
        width: "30%",
        selector: (row: { priorityhours: string }) => row.priorityhours || "-",
    },
    {
        name: "Actions",
        cell: (row: any) => (
          <Dropdown menu={{ items: getMenuItems(row) }} trigger={["click"]}>
            <Button
              className="gradient-btn"
              type="primary"
            >
              Select <DownOutlined />
            </Button>
          </Dropdown>
        ),
    },
  ];

  const handleCloseModal = () => {
    setAddPriorityModal(false);
    setIsEditMode(false);
    setPriorityName("");
    setPriorityHours("");
    setSelectedPriority(null);
  };

  const handleSavePriority = async () => {
    const body: any = {
      priority: priorityName,
      time: priorityHours
    };
    try {
      if (isEditMode) {
        await toast.promise(updatePriority(selectedPriority?.id, body), {
          loading: "Updating...",
          success: (response: any) => {
            if (response?.data?.success) {
              handleCloseModal();
              getData();
            }
            return response?.data?.message;
          },
          error: (err) => (err?.response?.data?.message) || "Failed to update",
        });
      } else {
        await toast.promise(createPriority(body), {
          loading: "Adding priority...",
          success: (response) => {
            if (response?.data?.success) {
              handleCloseModal();
              getData();
            }
            return response?.data?.message;
          },
          error: (err) => (err?.response?.data?.message) || "Failed to add new priority",
        });
      }
    } catch (error) {
      console.error("Failed to save priority:", error);
      // handleCloseModal();
    }
  };
  const handleDelete = async () => {
    try {
      await toast.promise(deletePriority(selectedPriority?.id), {
        loading: "Deleting...",
        success: (response: any) => {
          if (response?.data?.success) {
            setIsDeleteModal(false);
            getData();
          }
          return response?.data?.message;
        },
        error: (err) => (err?.response?.data?.message) || "Failed to delete",
      });
    } catch (error) {
      console.error("Failed to delete priority:", error);
    }
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModal(false);
    setSelectedPriority(null);
  };
  const mappedData =
    tableData &&
    tableData.map((item: any, index: number) => {
      return {
        id: item?.id,
        srNo: index + 1 + (page - 1) * pageSize,
        priorityName: item?.priority,
        priorityhours: item?.time,
      };
    });

  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const resposne = await getPriorities(page, pageSize, searchValue);
      if (resposne) {
        const data = resposne.data.data?.priorities;
        setTotalRows(resposne?.data?.data?.pagination?.total || 0);
        setFrom(resposne?.data?.data?.pagination?.from || 0);
        setTo(resposne?.data?.data?.pagination?.to || 0);
        setTotalPage(resposne?.data?.data?.pagination?.last_page || 0);
        setTableData(data);
      }
        } catch (error: any) {
      setSkelitonLoading(false);
    }
    finally {
      setSkelitonLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-0">Priorities</h5>
        </div>
        <div className="text-end">
        <Input
            placeholder="Search by name"
            value={searchValue}
            prefix={<SearchOutlined />} style={{ width: "300px", height: "33px", marginRight: "10px" }}
            onChange={(e: any) => {
              setSearchValue(e.target.value);
            }}
          />
          <button
            className="theme-btn-next"
            onClick={() => {
              setAddPriorityModal(true);
            }}
          >
            Add New Priority
          </button>
         
        </div>
      </div>

      <div className="cs-table">
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
        open={addPriorityModal}
        onCancel={handleCloseModal}
        centered
        maskClosable={false}
        title={
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            {isEditMode ? "Edit Priority" : "Add Priority"}
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
              Priority Name
            </label>
            <Input
              placeholder="Enter priority name"
              value={priorityName}
              onChange={(e) => setPriorityName(e.target.value)}
              style={{ height: "40px" }}
            />
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
              Priority Hours
            </label>
            <Input
              placeholder="Enter priority hours"
              value={priorityHours}
              onChange={(e) => setPriorityHours(e.target.value)}
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
              onClick={handleCloseModal}
              style={{
                padding: "8px 24px",
                borderRadius: "2px",
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
              onClick={handleSavePriority}
              style={{
                padding: "8px 24px",
                borderRadius: "2px",
                border: "none",
                backgroundColor: "var(--foreground)",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Save Priority
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={isDeleteModal}
        onCancel={handleCloseDeleteModal}
        centered
        maskClosable={false}
        title="Delete Priority"
        footer={null}
      >
        <div style={{ padding: "20px 0" }}>
          <p>Are you sure you want to delete this priority?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
            <Button onClick={handleCloseDeleteModal} style={{ padding: "8px 24px", borderRadius: "2px", border: "none", backgroundColor: "var(--color-cms-teal)", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>Cancel</Button>
            <Button onClick={handleDelete} style={{ padding: "8px 24px", borderRadius: "2px", border: "none", backgroundColor: "var(--foreground)", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Priorities;
