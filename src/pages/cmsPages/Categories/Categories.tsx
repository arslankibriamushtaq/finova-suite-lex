import { useEffect, useRef, useState } from "react";
import { Button, Dropdown, Input, Modal } from "antd";
import TableView from "../../../components/TableView/TableView";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../../redux/apis/apisCrudCms";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
const Categories = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [tableData, setTableData] = useState<any>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
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
  const getAllReportsReport = [
    {
      name: "Sr No.",
      width: "40%",

      selector: (row: { srNo: string }) => row.srNo || "-",
    },
    {
      name: "Category Name",
      width: "40%",

      selector: (row: { categoryName: string }) => row.categoryName || "-",
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
        setSelectedCategory(row);
        setCategoryName(row.categoryName || "");
        setAddCategoryModal(true);
        break;
      case "delete":
        setSelectedCategory(row);
        setIsDeleteModal(true);
        break;
    }
  };
  const handleCloseModal = () => {
    setAddCategoryModal(false);
    setIsEditMode(false);
    setCategoryName("");
    setSelectedCategory(null);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModal(false);
    setSelectedCategory(null);
  };
  const handleSave = async () => {
    const body: any = {
      title: categoryName,
      user_type: 0
    };
    try {
      if (isEditMode) {
        await toast.promise(updateCategory(selectedCategory?.id, body), {
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
        await toast.promise(createCategory(body), {
          loading: "Adding category...",
          success: (response) => {
            if (response?.data?.success) {
              handleCloseModal();
              getData();
            }
            return response?.data?.message;
          },
          error: (err) => (err?.response?.data?.message) || "Failed to add new category",
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      // handleCloseModal();
    }
  };
  const handleDelete = async () => {
    try {
      await toast.promise(deleteCategory(selectedCategory?.id), {
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
      console.error("Failed to delete category:", error);
    }
  };
  const mappedData =
    tableData &&
    tableData.map((item: any, index: number) => {
      return {
        id: item?.id,
        srNo: index + 1 + (page - 1) * pageSize,
        categoryName: item?.title,
      };
    });
  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const resposne = await getCategories(page, pageSize, searchValue);
      if (resposne) {
        const data = resposne.data.data?.categories;
        setTotalRows(resposne?.data?.data?.pagination?.total || 0);
        setFrom(resposne?.data?.data?.pagination?.from || 0);
        setTo(resposne?.data?.data?.pagination?.to || 0);
        setTotalPage(resposne?.data?.data?.pagination?.last_page || 0);
        setTableData(data);

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
          <h5 className="mb-0">Categories</h5>
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
            Add New Category
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
          header={getAllReportsReport}
          data={mappedData}
          isLoading={skelitonLoading}
          from={from}
          to={to}
          totalPage={totalPage}
        />
      </div>

      <Modal
        open={addCategoryModal}
        onCancel={handleCloseModal}
        centered
        maskClosable={false}
        title={
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            {isEditMode ? "Edit Category" : "Add Category"}
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
              Category Name
            </label>
            <Input
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
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
        title="Delete Category"
        footer={null}
      >
        <div style={{ padding: "20px 0" }}>
          <p>Are you sure you want to delete this Category?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
            <Button onClick={handleCloseDeleteModal} style={{ padding: "8px 24px", borderRadius: "4px", border: "none", backgroundColor: "#20c997", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>Cancel</Button>
            <Button onClick={handleDelete} style={{ padding: "8px 24px", borderRadius: "4px", border: "none", backgroundColor: "#212529", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Categories;
