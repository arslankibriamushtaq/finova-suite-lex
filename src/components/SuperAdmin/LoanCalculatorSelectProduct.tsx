import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Images } from "../Config/Images";
import {
  AssignProductToTenant,
  getAllProduct,
} from "../../redux/apis/apisTenantCrud";

const LoanCalculatorSelectProduct = ({ setActiveTab, setProductId ,ProductId}) => {
  const [customerData, setCustomerData] = useState<any>({});
  const [allProducts, setAllProducts] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const handleSelection = async (id: string) => {
    setSelectedValues([id]);
    setProductId(id);
  };

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

  useEffect(() => {
    getAllProducts();
    if(ProductId){
      setSelectedValues([ProductId]);
    }
  }, []);

  function handleNext () {
    setActiveTab("Predefined Parameters & Formulas");
  };

  return (
    <>
      <div className="tab-conent-container">
        <h5 className="fs-6 fw-600 mb-0"> Selected Product</h5>
        <div className="d-flex flex-wrap row flex-grow-1">
          {allProducts?.map(
            (option, index) =>
              option?.basicDetails?.status === true && (
                <div key={index} className="col-2 mt-4">
                  <div
                    className={`selectable-card ${
                      selectedValues.includes(option?.basicDetails?.id)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleSelection(option?.basicDetails?.id)}
                  >
                    <div className="d-inline-block mt-5">
                      <img
                        src={
                          selectedValues.includes(option?.basicDetails?.id)
                            ? Images.tickIcon
                            : Images.circle
                        }
                        alt="tick"
                        className="mb-3"
                      />
                      <div>{option?.basicDetails?.productName_en}</div>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
        <div className="d-flex justify-content-end pt-4">
          <button
            type="button"
            className="theme-btn-next"
            //  style={{ width: "157px" }}
            disabled={selectedValues.length===0} // Disable while saving
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default LoanCalculatorSelectProduct;
