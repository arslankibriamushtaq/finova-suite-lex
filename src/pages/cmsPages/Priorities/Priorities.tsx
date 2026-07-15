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
import { useTranslation } from "react-i18next";
const Priorities = () => {
  const { t } = useTranslation("cms");
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
      label: t("common:edit"),
      onClick: () => handleMenuClick("edit", row),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: t("common:delete"),
      onClick: () => handleMenuClick("delete", row),
    },
  ];

  const Table_Headers = [
    {
      name: t("fields.srNo"),
      width: "30%",

      selector: (row: { srNo: string }) => row.srNo || "-",
    },
    {
        name: t("priorities.priorityName"),
        width: "30%",

        selector: (row: { priorityName: string }) => row.priorityName || "-",
    },
    {
        name: t("priorities.priorityHours"),
        width: "30%",
        selector: (row: { priorityhours: string }) => row.priorityhours || "-",
    },
    {
        name: t("common:actions"),
        cell: (row: any) => (
          <Dropdown menu={{ items: getMenuItems(row) }} trigger={["click"]}>
            <Button
              className="gradient-btn"
              type="primary"
            >
              {t("fields.select")} <DownOutlined />
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
          loading: t("toast.updating"),
          success: (response: any) => {
            if (response?.data?.success) {
              handleCloseModal();
              getData();
            }
            return response?.data?.message;
          },
          error: (err) => (err?.response?.data?.message) || t("toast.failedUpdate"),
        });
      } else {
        await toast.promise(createPriority(body), {
          loading: t("priorities.toast.adding"),
          success: (response) => {
            if (response?.data?.success) {
              handleCloseModal();
              getData();
            }
            return response?.data?.message;
          },
          error: (err) => (err?.response?.data?.message) || t("priorities.toast.failedAdd"),
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
        loading: t("toast.deleting"),
        success: (response: any) => {
          if (response?.data?.success) {
            setIsDeleteModal(false);
            getData();
          }
          return response?.data?.message;
        },
        error: (err) => (err?.response?.data?.message) || t("toast.failedDelete"),
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
          <h5 className="mb-0">{t("priorities.title")}</h5>
        </div>
        <div className="text-end">
        <Input
            placeholder={t("fields.searchByName")}
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
            {t("priorities.addNew")}
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
            {isEditMode ? t("priorities.editModalTitle") : t("priorities.addModalTitle")}
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
              {t("priorities.priorityName")}
            </label>
            <Input
              placeholder={t("priorities.enterPriorityName")}
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
              {t("priorities.priorityHours")}
            </label>
            <Input
              placeholder={t("priorities.enterPriorityHours")}
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
              {t("common:close")}
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
              {t("priorities.savePriority")}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={isDeleteModal}
        onCancel={handleCloseDeleteModal}
        centered
        maskClosable={false}
        title={t("priorities.deleteModalTitle")}
        footer={null}
      >
        <div style={{ padding: "20px 0" }}>
          <p>{t("priorities.deleteConfirm")}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
            <Button onClick={handleCloseDeleteModal} style={{ padding: "8px 24px", borderRadius: "2px", border: "none", backgroundColor: "var(--color-cms-teal)", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>{t("common:cancel")}</Button>
            <Button onClick={handleDelete} style={{ padding: "8px 24px", borderRadius: "2px", border: "none", backgroundColor: "var(--foreground)", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>{t("common:delete")}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Priorities;
