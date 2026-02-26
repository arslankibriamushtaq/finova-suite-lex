import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductEligibilitySettings from "./ProductEligibilitySettings";
import ProductCommodityInfo from "./ProductCommodityInfo";
import ProductSettings from "./ProductSettings";
import ProductRequiredDocs from "./ProductRequiredDocs";
import DynamicBreadcrumb from "./SuperAdminBreadCrumb";
import { GetProductsById } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
function ProductManagementView() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Basic Information");
  const [ProductId, setProductId] = useState("");
  const [productData, setProductData] = useState({});
  const [isEditable, setIsEditable] = useState(true);
  const location = useLocation();
  const pathtype = location.pathname.split("/").filter(Boolean)[0];
  useEffect(() => {
    if (pathtype === "view" && productId) {
      setIsEditable(false);
    }
    if (productId) {
      getProductById(productId);
      setProductId(productId);
    }
  }, [productId]);
  const getProductById = async (id: string) => {
    try {
      await toast.promise(
        GetProductsById(id), // API Call
        {
          loading: "Fetching products...",
          success: (res) => {
            if (res?.data?.success) {
              const data = res.data.data;
              setProductData(data);
              return "Product fetched successfully!";
            } else {
              throw new Error(
                res?.data?.notificationMessage || "Failed to fetch products."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while fetching products.",
        }
      );
    } catch (error: any) {
      console.error("Error fetching products:", error);
    }
  };
  const updateProduct = async (id: string) => {
    try {
      const res = await GetProductsById(id); // API Call
      if (res?.data?.success) {
        setProductData(res.data.data);
      } else {
        console.error(
          res?.data?.notificationMessage || "Failed to fetch products."
        );
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
    }
  };
  const handleSelect = (key: string | null) => {
    setActiveTab(key);
  };
  const handleNext = (newProductId?: string) => {
    if (newProductId) {
      setProductId(newProductId); // Set the ID for future requests
    }
    updateProduct(newProductId || productId);
    const currentIndex = tabOptions.findIndex((tab) => tab.key === activeTab);
    if (currentIndex !== -1 && currentIndex < tabOptions.length - 1) {
      setActiveTab(tabOptions[currentIndex + 1].key); // Move to the next tab
    }
  };
  const tabOptions = [
    {
      title: "Basic Information",
      key: "Basic Information",
      component: (
        <ProductBasicInfo
          productId={ProductId}
          handleNext={handleNext}
          productData={productData}
          isEditable={isEditable}
        />
      ),
    },
    {
      title: "Eligibility Settings",
      key: "Eligibility Settings",
      component: (
        <ProductEligibilitySettings
          productId={ProductId}
          onSuccess={handleNext}
          productData={productData}
          isEditable={isEditable}
        />
      ),
    },
    {
      title: "Commodity Information",
      key: "Commodity Information",
      component: (
        <ProductCommodityInfo
          productId={ProductId}
          onSuccess={handleNext}
          productData={productData}
          isEditable={isEditable}
        />
      ),
    },
    {
      title: "Application Settings",
      key: "Settings",
      component: (
        <ProductSettings
          productId={ProductId}
          onSuccess={updateProduct}
          productData={productData}
          isEditable={isEditable}
          handleNext={handleNext}
        />
      ),
    },
    {
      title: "Required Documents",
      key: "Required Documents",
      component: (
        <ProductRequiredDocs
          productId={ProductId}
          onSuccess={handleNext}
          productData={productData}
          isEditable={isEditable}
        />
      ),
    },
  ];
  return (
    <div className={`product-tabs-container product-management-container p-2`}>
      <DynamicBreadcrumb className="col-6 mb-4" />
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 d-flex justify-content-center align-items-center border-0"
          style={{
            background: "#F0F0F0",
            color: "#EB0D0D",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          <i className="fas fa-arrow-left me-1"></i>
          Back
        </button>
        <h3 className="mb-0">Product Management</h3>
      </div>

      <Tabs activeKey={activeTab} className="d-flex" onSelect={handleSelect}>
        {tabOptions.map((tab) => (
          <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
            {activeTab === tab.key && tab.component}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default ProductManagementView;
