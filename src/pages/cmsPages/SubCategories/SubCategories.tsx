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
const SubCategories = () => {
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
      name: "Sr No.",
      selector: (row: { srNo: string }) => row.srNo || "-",
    },
    {
      name: "Sub Category Name",

      selector: (row: { subCategoryName: string }) => row.subCategoryName || "-",
    },
    {
      name: "Category ID",
      selector: (row: { category: any }) => row.category?.title || "-",
    },
    {
      name: "Priority",
      selector: (row: { priority: any }) => row.priority?.priority || "-",
    },
    {
      name: "Department",
      selector: (row: { department: any }) => row.department?.name || "-",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown menu={{ items: menu(row) }} trigger={["click"]}>
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

  const menu = (row: any) => [
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
        await toast.promise(createSubCategory(body), {
          loading: "Adding sub category...",
          success: (response: any) => {
            if (response?.data?.success) {
              handleCloseModal();
              getData();
            }
            return response?.data?.message;
          },
          error: (err) => (err?.response?.data?.message) || "Failed to add new sub category",
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
          <h5 className="mb-0">Sub Categories</h5>
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
              setAddCategoryModal(true);
            }}
          >
            Add New Sub Category
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
            {isEditMode ? "Edit Sub Category" : "Add Sub Category"}
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
                color: "#333",
              }}
            >
              Sub Category Name
            </label>
            <Input
              placeholder="Enter sub category name"
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
                color: "#333",
              }}
            >
              Select Priority
            </label>
            <Select
              placeholder="Select Priority"
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
                color: "#333",
              }}
            >
              Department
            </label>
            <Select
              placeholder="Select Department"
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
                color: "#333",
              }}
            >
              Select Category
            </label>
            <Select
              placeholder="Select Category"
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
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#20c997",
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
              style={{
                padding: "8px 24px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#212529",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={isDeleteModal}
        onCancel={handleCloseDeleteModal}
        centered
        maskClosable={false}
        title="Delete Sub Category"
        footer={null}
      >
        <div style={{ padding: "20px 0" }}>
          <p>Are you sure you want to delete this Sub Category?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
            <Button onClick={handleCloseDeleteModal} style={{ padding: "8px 24px", borderRadius: "4px", border: "none", backgroundColor: "#20c997", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>Cancel</Button>
            <Button onClick={handleDelete} style={{ padding: "8px 24px", borderRadius: "4px", border: "none", backgroundColor: "#212529", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SubCategories;
