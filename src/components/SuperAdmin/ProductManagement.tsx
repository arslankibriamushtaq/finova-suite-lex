import React, { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { Menu, Dropdown, Button, Switch } from "antd";
import {
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { Images } from "../Config/Images";
import { useNavigate } from "react-router-dom";
import { FaList } from "react-icons/fa";
import DynamicBreadcrumb from "./SuperAdminBreadCrumb";
import {
  changeProductStatusById,
  deleteProductById,
  getAllProduct,
} from "../../redux/apis/apisTenantCrud";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { Modal } from "react-bootstrap";
import { themeStyle } from "../Config/Theme";
function ProductManagement() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [allProducts, setAllProducts] = useState<any>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const country = useSelector((state: RootState) => state.block.countries);

  const handleChange = (key: string, row: any) => {
    if (key === "view") {
      navigate(`/view/productmanagement/${row.id}`);
    } else if (key === "edit") {
      navigate(`/edit/productmanagement/${row.id}`);
    } else if (key === "categories") {
      navigate(`productCategories/${row.id}`);
    } else if (key === "delete") {
      setShowPopup(true);
      setProductId(row.id);
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
      <Menu.Item key="categories" icon={<FaList />}>
        Categories
      </Menu.Item>
    </Menu>
  );
  const Access_History_Header = [
    {
      name: "Product Name",
      selector: (row: { productName: string }) => row.productName,
    },
    {
      name: "Logo",
      cell: (row: { logo: string }) => (
        <img
          src={Images.productLogoPlaceholder}
          alt="logo"
          style={{ width: 50 }}
        />
      ),
    },
    {
      name: "Email",
      selector: (row: { email: string }) => row.email,
    },
    {
      name: "Country",
      selector: (row: { country: string }) => row.country,
    },
    {
      name: "Category",
      selector: (row: { category: string }) => row.category,
    },
    {
      name: "Product Type",
      selector: (row: { productType: string }) => row.productType,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <Switch
          checked={row.status}
          onChange={(checked) => {
            changeProductStatus(row?.id, checked);
          }}
          style={{ backgroundColor: row.status ? "red" : "" }}
        />
      ),
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button>
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const getCountryById = (value: string) => {
    const foundCountry = country?.find((g) => g.id === value);
    return foundCountry ? foundCountry.name : "-";
  };

  const Categories = [
    { label: "Tawarruq", value: 0 },
    { label: "Ijarah", value: 1 },
  ];
  const ProductTypes = [
    { label: "Individual", value: 0 },
    { label: "SME", value: 1 },
    { label: "Corporate", value: 2 },
  ];

  const getCategory = (value: any) => {
    const category = Categories.find((g) => g.value === value);
    return category ? category.label : "";
  };
  const getProduct = (value: any) => {
    const product = ProductTypes.find((g) => g.value === value);
    return product ? product.label : "";
  };

  const mappedData = allProducts?.map((item: any, index: number) => {
    return {
      id: item.basicDetails.id || index + 1,
      index: index + 1,
      productName: item.basicDetails.productName_en,
      logo: item.basicDetails.url, // Assuming `url` is the product image/logo
      email: item.basicDetails.notificationEmail,
      country: getCountryById(item.basicDetails.country),
      category: getCategory(item.basicDetails.category),
      productType: getProduct(item.basicDetails.productType),
      status: item.basicDetails.status,
    };
  });

  const getAllProducts = async () => {
    setSkelitonLoading(true);
    try {
      await toast.promise(
        getAllProduct(page, pageSize), // API Call
        {
          loading: "Loading Products......",
          success: (res) => {
            if (res?.data?.success) {
              const data = res.data.data;
              setAllProducts(data);
              setTotalRows(res.data.pageInfo.totalItems);
              setSkelitonLoading(false);
              return "Loading  ALL Products...";
            } else {
              throw new Error(
                res?.data?.notificationMessage || "Failed to Load products."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while Loading products.",
        }
      );
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setSkelitonLoading(false);
    }
  };
  const deleteProduct = async (id) => {
    try {
      await toast.promise(
        deleteProductById(id), // API Call
        {
          loading: "Loading...",
          success: (res) => {
            if (res?.data?.success) {
              const data = res.data.data;
              getAllProducts();
              setProductId("");
              setShowPopup(false);
              return res?.data?.notificationMessage;
            } else {
              throw new Error(
                res?.data?.notificationMessage || "Failed to delete product."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while delete product.",
        }
      );
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setSkelitonLoading(false);
    }
  };
  const changeProductStatus = async (id: any, status: any) => {
    const body = {
      productId: id,
      isActive: status,
    };

    try {
      await toast.promise(
        changeProductStatusById(body), // API Call
        {
          loading: "Loading...",
          success: (res) => {
            if (res?.data?.success) {
              const data = res.data.data;
              getAllProducts();

              return res?.data?.notificationMessage;
            } else {
              throw new Error(
                res?.data?.notificationMessage ||
                  "Failed to product status change"
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while delete product.",
        }
      );
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getAllProducts();
  }, [page, pageSize]);
  const addNewProduct = () => {
    navigate(`/view/productmanagement`);
  };
  return (
    <>
      <div className="cs-table p-4">
        <div className="col-12">
          <DynamicBreadcrumb className="col-6 mb-4" />
          <div className="d-flex justify-content-between">
            <h2 className="fs-6 mb-3 mt-4">All Products</h2>
            <div className="col-6 d-flex justify-content-end align-items-end">
              <button
                onClick={addNewProduct}
                className="theme-btn-next mb-2"
                type="submit"
              >
                Add New Product
              </button>
            </div>
          </div>
        </div>

        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          header={Access_History_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
        <Modal
          show={showPopup}
          onHide={() => {
            setShowPopup(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Delet Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Additional content goes here */}
            {showPopup && (
              <div>
                <p>Are you sure you want to delete this product</p>
                {/* Add more details as needed */}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              style={{ background: themeStyle?.revertActionColor }}
              className="revert-btn"
              onClick={() => {
                setShowPopup(false);
              }}
            >
              Close
            </Button>
            <Button
              className="application-btn"
              onClick={() => {
                deleteProduct(productId);
              }}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default ProductManagement;
