import { useEffect, useRef, useState } from "react";
import { Button, Dropdown, Input, Modal, Select } from "antd";
import TableView from "../../../components/TableView/TableView";
import { createSubCategory, deleteSubCategory, getCategories, getDepartments, getPriorities, getSubCategories, updateSubCategory } from "../../../redux/apis/apisCrudCms";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const SubCategories = () => {
  const { t } = useTranslation("cms");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [tableData, setTableData] = useState<any>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [Categories, setCategories] = useState<any>([]);
  const [departments, setDepartments] = useState<any>([]);
  const [priorities, setPriorities] = useState<any>([]);
  const isFirstRender = useRef(true);
  useEffect(() => {
    getCategoriesList();
    getDepartmentsList();
    getPrioritiesList();
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
  const getPrioritiesList = async () => {
    try {
      const response = await getPriorities(1, 100);
      if (response) {
        setPriorities(response?.data?.data?.priorities || []);
      }
    } catch (error) {
      setPriorities([]);
    }
  };
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
  const Table_Headers = [
    {
      name: t("fields.srNo"),
      selector: (row: { srNo: string }) => row.srNo || "-",
    },
    {
      name: t("subCategories.subCategoryName"),

      selector: (row: { subCategoryName: string }) => row.subCategoryName || "-",
    },
    {
      name: t("subCategories.categoryId"),
      selector: (row: { category: any }) => row.category?.title || "-",
    },
    {
      name: t("fields.priority"),
      selector: (row: { priority: any }) => row.priority?.priority || "-",
    },
    {
      name: t("fields.department"),
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

  const menu = (row: any) => [
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
    }
  ];

  const handleMenuClick = (key: string, row: any) => {
    switch (key) {
      case "edit":
        setIsEditMode(true);
        setSelectedRow(row);
        setSubCategoryName(row.subCategoryName || "");
        setSelectedPriority(row.priority?.id || "");
        setSelectedDepartment(row.department?.id || "");
        setSelectedCategory(row.category?.id || "");
        setAddCategoryModal(true);
        break;
      case "delete":
        setSelectedRow(row);
        setIsDeleteModal(true);
        break;
    }
  };

  const handleCloseModal = () => {
    setAddCategoryModal(false);
    setIsEditMode(false);
    setSubCategoryName("");
    setSelectedPriority("");
    setSelectedDepartment("");
    setSelectedCategory("");
    setSelectedRow(null);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModal(false);
    setSelectedRow(null);
  };
  const handleSave = async () => {

    const body: any = {
      "title": subCategoryName,
      "category_id": selectedCategory,
      "priority_id": selectedPriority,
      "department_id": selectedDepartment
    };
    try {
      if (isEditMode) {
        await toast.promise(updateSubCategory(selectedRow?.id, body), {
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
        await toast.promise(createSubCategory(body), {
          loading: t("subCategories.toast.adding"),
          success: (response: any) => {
            if (response?.data?.success) {
              handleCloseModal();
              getData();
            }
            return response?.data?.message;
          },
          error: (err) => (err?.response?.data?.message) || t("subCategories.toast.failedAdd"),
        });
      }
    } catch (error) {
      console.error("Failed to save sub category:", error);
      // handleCloseModal();
    }
  };
  const handleDelete = async () => {
    try {
      await toast.promise(deleteSubCategory(selectedRow?.id), {
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
      console.error("Failed to delete sub category:", error);
    }
  };
  const mappedData =
    tableData &&
    tableData.map((item: any, index: number) => {
      return {
        id: item?.id,
        srNo: index + 1 + (page - 1) * pageSize,
        subCategoryName: item?.title,
        category: item?.category,
        priority: item?.priority,
        department: item?.department,
      };
    });

  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const resposne = await getSubCategories(page, pageSize, searchValue);
      if (resposne) {
        const data = resposne.data.data?.sub_categories;
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
          <h5 className="mb-0">{t("subCategories.title")}</h5>
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
              setAddCategoryModal(true);
            }}
          >
            {t("subCategories.addNew")}
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
        open={addCategoryModal}
        onCancel={handleCloseModal}
        centered
        maskClosable={false}
        title={
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            {isEditMode ? t("subCategories.editModalTitle") : t("subCategories.addModalTitle")}
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
              {t("subCategories.subCategoryName")}
            </label>
            <Input
              placeholder={t("subCategories.enterSubCategoryName")}
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
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
              {t("fields.selectPriority")}
            </label>
            <Select
              placeholder={t("fields.selectPriority")}
              value={selectedPriority || undefined}
              onChange={(value) => setSelectedPriority(value)}
              style={{ width: "100%", height: "40px" }}
            >
              {priorities.map((priority: any) => (
                <Select.Option key={priority.id} value={priority.id}>{priority.priority}</Select.Option>
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
              {t("fields.department")}
            </label>
            <Select
              placeholder={t("fields.selectDepartment")}
              value={selectedDepartment || undefined}
              onChange={(value) => setSelectedDepartment(value)}
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
              {t("fields.selectCategory")}
            </label>
            <Select
              placeholder={t("fields.selectCategory")}
              value={selectedCategory || undefined}
              onChange={(value) => setSelectedCategory(value)}
              style={{ width: "100%", height: "40px" }}
            >
              {Categories.map((category: any) => (
                <Select.Option key={category.id} value={category.id}>{category.title}</Select.Option>
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
      <Modal
        open={isDeleteModal}
        onCancel={handleCloseDeleteModal}
        centered
        maskClosable={false}
        title={t("subCategories.deleteModalTitle")}
        footer={null}
      >
        <div style={{ padding: "20px 0" }}>
          <p>{t("subCategories.deleteConfirm")}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
            <Button onClick={handleCloseDeleteModal} style={{ padding: "8px 24px", borderRadius: "2px", border: "none", backgroundColor: "var(--color-cms-teal)", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>{t("common:cancel")}</Button>
            <Button onClick={handleDelete} style={{ padding: "8px 24px", borderRadius: "2px", border: "none", backgroundColor: "var(--foreground)", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>{t("common:delete")}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SubCategories;
