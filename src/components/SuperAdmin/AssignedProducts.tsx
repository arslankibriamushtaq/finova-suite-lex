import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Images } from "../Config/Images";
import DynamicBreadcrumb from "./SuperAdminBreadCrumb";
import {
  AssignProductToTenant,
  getAllProduct,
  GetTenantProducts,
  UnAssignProductToTenant,
} from "../../redux/apis/apisTenantCrud";

const AsssignedProducts = () => {
  const [customerData, setCustomerData] = useState<any>({});
  const [allProducts, setAllProducts] = useState<any>([]);
  // const [assignedProducts, setAssignedProducts] = useState<any>([]);
  const { customerId } = useParams();
  const [loading, setLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantData, type } = location.state || {}; // Get passed data and flag


  const handleSelection = async (id: string) => {
    setSelectedValues((prevSelected) => {
      const isSelected = prevSelected.includes(id);
      const updatedSelection = isSelected
        ? prevSelected.filter((value) => value !== id) // Unselect
        : [...prevSelected, id]; // Select
  
      // Call appropriate function based on selection change
      if (isSelected) {
        handleUnassigned([id]); // Unassign single product
      } else {
        handleSave([id]); // Assign single product
      }
  
      return updatedSelection;
    });
  };
  
  useEffect(() => {
    if (customerId && tenantData) {
      setCustomerData(tenantData);
    }
  }, [customerId]);
  const getAllProducts = async () => {
    try {
      await toast.promise(
        getAllProduct(1, 1000), // API Call
        {
          loading: "Fetching products...",
          success: (res) => {
            if (res?.data?.success) {
              const data = res.data.data;
              setAllProducts(data);
              getTenatProductsById();
              return "Products fetched successfully!";
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
  const getTenatProductsById = async () => {
    try {
      const res = await GetTenantProducts(tenantData?.CustomerID); // API Call without toast
      if (res?.data?.success) {
        const data = res.data.data;
        const uniqueProducts = Array.from(
          new Map(
            data.map((product: any) => [product.basicDetails.id, product])
          ).values()
        );
  
        const selectedProducts = uniqueProducts.map(
          (product: { basicDetails: { id: any } }) => product.basicDetails.id
        );
  
        setSelectedValues(selectedProducts);
      } else {
        console.error("Failed to fetch tenant products:", res?.data?.notificationMessage);
      }
    } catch (error: any) {
      console.error("Error fetching tenant products:", error);
    }
  };

  useEffect(() => {
    if (type === "assignProducts") {
      getAllProducts();
    }
  }, []);

  const handleSave = async (productIds: string[]) => {
    try {
      const data = {
        tenantId: customerData?.CustomerID || "",
        productIds,
      };
      setLoading(true);
      await toast.promise(
        AssignProductToTenant(data), // API call
        {
          loading: "Assigning products to tenant...",
          success: (response) => {
            if (
              response?.data?.notificationMessage === "Operation successful."
            ) {
              return response?.data?.notificationMessage;
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.notificationMessage ||
                  "Failed to assign products."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while assigning products.",
        }
      );
    } catch (error: any) {
      setLoading(false);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleUnassigned = async (productIds: string[]) => {
    try {
      // const unassignProducts = assignedProducts.filter(
      //   (item: string) => !selectedValues.includes(item)
      // );
      const data = {
        tenantId: customerData?.CustomerID || "",
        productIds
      };
      setLoading(true);
      await toast.promise(
        UnAssignProductToTenant(data), // API call
        {
          loading: "Unassigning products to tenant...",
          success: (response) => {
            if (
              response?.data?.notificationMessage === "Operation successful."
            ) {
              // const products = allProducts.filter((item) =>
              //   selectedValues.includes(item.basicDetails.id)
              // );
              // setAllProducts(products);
              return response?.data?.notificationMessage;
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.notificationMessage ||
                  "Failed to unassign products."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while assigning products.",
        }
      );
    } catch (error: any) {
      setLoading(false);
      console.error("Error:", error);
    } finally {
      setLoading(false);
      // getTenatProductsById();
    }
  };
  const tenantViewFields = [
    {
      label: "Tenant Name",
      type: "text",
      name: "companyName",
      value: customerData?.companyName || "",
    },
    {
      label: "Email Address",
      type: "text",
      name: "companyEmail",
      value: customerData?.companyEmail || "",
    },
    {
      label: "Mobile Number",
      type: "text",
      name: "companyPhoneNumber",
      value: customerData?.companyPhoneNumber || "",
    },
    {
      label: "Contact Person Name",
      type: "text",
      name: "contactPersonName",
      value: customerData?.contactPersonName || "",
    },
    {
      label: "Website",
      type: "text",
      name: "companyWebsite",
      value: customerData?.companyWebsite || "",
    },
  ];

  // const button = [{ title: "Save and Exit", onClick: handleSaveCustomer }];

  return (
    <>
      <div>
        <DynamicBreadcrumb className="col-6 mb-4" />
        <div className="d-flex align-items-center gap-2 mb-3">
          <button
            className="d-flex justify-content-center align-items-center "
            style={{
              color: " #1963b9",
              border: "transparent",
              background: "#F0F0F0",
              height: "30px",
              fontSize: "12px",
            }}
            onClick={() => {
              navigate(-1);
            }}
          >
            <img className="pe-2" src={Images.arrowBackIcon} alt="" />
            Back
          </button>
          <h3 className="fs-6 fw-600 mb-0">Assigned Products</h3>
        </div>
        {/*       <TableHeaderFilter button={button} />
         */}{" "}
        <div
          style={{
            borderLeft: "1px solid #D1D1D1",
            borderRight: "1px solid #D1D1D1",
            borderBottom: "1px solid #D1D1D1",
            borderTop: "1px solid #D1D1D1",
            borderRadius: "6px",
          }}
        >
          <div className="p-4">
            <h5 className="fs-6 fw-600 mb-0"> Selected Products</h5>

            <div className="row mt-5 d-flex flex-wrap">
              <h4 className="mb-3 fs-6 fw-600">Tenant Details</h4>
              {tenantViewFields.map((field, index) => (
                <div className="col-md-4 mt-1 mb-1" key={index}>
                  <div
                    className="d-flex justify-content-between align-items-center w-100 p-3"
                    style={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: "6px",
                    }}
                  >
                    <label className="fs-14 fw-600">{field.label}</label>
                    <span className="fs-14 fw-normal">{field.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-wrap row ">
              {allProducts?.map((option, index) => (
                <>
                  {option?.basicDetails?.status == true && (
                    <div
                      key={index}
                      className="col-2 mt-4"
                    >
                      <div
                        className={`selectable-card ${
                          selectedValues.includes(option.basicDetails?.id)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleSelection(option.basicDetails?.id)}
                      >
                        <div className="d-inline-block mt-5">
                          <img
                            src={
                              selectedValues.includes(option.basicDetails?.id)
                                ? Images.tickIcon
                                : Images.circle
                            }
                            alt="tick"
                            className="mb-3"
                          />
                          <div>{option.basicDetails?.productName_en}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ))}
            </div>
            {/* {selectedValues.length > 0 && type === "assignProducts" && (
              <div className="d-flex justify-content-end pt-4">
                <button
                  type="button"
                  className="theme-btn-cancel me-2"
                  style={{ width: "157px" }}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="theme-btn-next"
                  style={{ width: "157px" }}
                  disabled={loading} // Disable while saving
                  onClick={handleSave}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            )} */}
            {/* {allProducts.length > 0 && type === "unassignProducts" && (
              <div className="d-flex justify-content-end pt-4">
                <button
                  type="button"
                  className="theme-btn-cancel me-2"
                  style={{ width: "157px" }}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="theme-btn-next"
                  style={{ width: "157px" }}
                  disabled={loading} // Disable while saving
                  onClick={handleUnassigned}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AsssignedProducts;
