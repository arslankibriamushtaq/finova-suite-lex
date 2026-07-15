import { useEffect, useRef, useState } from "react";
import { Button, Dropdown, Input, Menu, Modal, Select } from "antd";
import TableView from "../../../components/TableView/TableView";
import { createEscalation, getDepartments, getEscalations, getSubCategories, updateEscalation } from "../../../redux/apis/apisCrudCms";
import {
  SearchOutlined,
  EditOutlined,
  DownOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const Escalation = () => {
  const { t } = useTranslation("cms");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [tableData, setTableData] = useState<any>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [addPriorityModal, setAddPriorityModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subCategory, setSubCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [subCategories, setSubCategories] = useState<any>([]);
  const [departments, setDepartments] = useState<any>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const isFirstRender = useRef(true);
  useEffect(() => {
    getData();
  }, [page, pageSize]);
  useEffect(() => {
    getSubCategoriesList();
    getDepartmentsList();
  }, []);
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

  const Table_Headers = [
    {
      name: t("fields.srNo"),
      width: "30%",

      selector: (row: { srNo: string }) => row.srNo || "-",
    },
    {
      name: t("fields.subCategory"),
      width: "30%",

      selector: (row: { subCategory: any }) => row.subCategory?.title || "-",
    },
    {
      name: t("fields.department"),
      width: "30%",
      selector: (row: { department: any }) => row.department?.name || "-",
    },
    {
      name: t("common:actions"),
      cell: (row: any) => (
        <Dropdown menu={{ items: menu(row) }} trigger={["click"]}>
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

  const menu = (row: any) => [{
    key: "edit",
    icon: <EditOutlined />,
    label: t("common:edit"),
    onClick: () => handleMenuClick("edit", row),
  },
 ];

  const handleMenuClick = (key: string, row: any) => {
    switch (key) {
      case "edit":
        setIsEditMode(true);
        setSelectedRow(row);
        setSubCategory(row.subCategory?.id || "");
        setDepartment(row.department?.id || "");
        setAddPriorityModal(true);
        break;
    }
  };

  const handleCloseModal = () => {
    setAddPriorityModal(false);
    setIsEditMode(false);
    setSubCategory("");
    setDepartment("");
    setSelectedRow(null);
  };

  const handleSave = async () => {
 
    const body: any = {
      department_id: department,
      sub_category_id: subCategory,
    };
    try {
      if (isEditMode) {
        await toast.promise(updateEscalation(selectedRow?.id, body), {
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
        await toast.promise(createEscalation(body), {
          loading: t("escalation.toast.adding"),
          success: (response) => {
            if (response?.data?.success) {
              handleCloseModal();
              getData();
            }
            return response?.data?.message;
          },
          error: (err) => (err?.response?.data?.message) || t("escalation.toast.failedAdd"),
        });
      }
    } catch (error) {
      console.error("Failed to save escalation:", error);
      // handleCloseModal();
    }
  };

  const mappedData =
    tableData &&
    tableData.map((item: any, index: number) => {
      return {
        id: item?.id,
        srNo: index + 1 + (page - 1) * pageSize,
        subCategory: item?.sub_category,
        department: item?.department,
      };
    });
  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const resposne = await getEscalations(page, pageSize, searchValue);
      if (resposne) {
        const data = resposne.data.data?.escalations;
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
          <h5 className="mb-0">{t("escalation.title")}</h5>
        </div>
        <div className="text-end">
          <Input
            placeholder={t("escalation.searchPlaceholder")}
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
            {t("escalation.addNew")}
          </button>

        </div>
      </div>

      <div className="cs-table">
        <TableView
          setPage={setPage}
          page={page}
          pageSize={pageSize}
          header={Table_Headers}
          setPageSize={setPageSize}
          isLoading={skelitonLoading}
          from={from}
          to={to}
          totalPage={totalPage}
          data={mappedData}
          totalRows={totalRows}
        />
      </div>

      <Modal
        open={addPriorityModal}
        onCancel={handleCloseModal}
        centered
        maskClosable={false}
        title={
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            {isEditMode ? t("escalation.editModalTitle") : t("escalation.addModalTitle")}
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
              {t("fields.selectSubCategory")}
            </label>
            <Select
              placeholder={t("fields.selectSubCategory")}
              value={subCategory || undefined}
              onChange={(value) => setSubCategory(value)}
              style={{ width: "100%", height: "40px" }}
            >
              {subCategories.map((subCategory: any) => (
                <Select.Option key={subCategory.id} value={subCategory.id}>{subCategory.title}</Select.Option>
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
              {t("fields.selectDepartment")}
            </label>
            <Select
              placeholder={t("fields.selectDepartment")}
              value={department || undefined}
              onChange={(value) => setDepartment(value)}
              style={{ width: "100%", height: "40px" }}
            >
              {departments.map((department: any) => (
                <Select.Option key={department.id} value={department.id}>{department.name}</Select.Option>
              ))}
            </Select>
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
              onClick={handleSave}
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
              {t("common:save")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Escalation;
