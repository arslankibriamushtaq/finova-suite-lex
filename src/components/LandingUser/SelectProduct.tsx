import React, { useEffect, useState } from "react";
import { Images } from "../Config/Images";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { getUserProductsListing, getUserProductDetails, getRequiredDocuments } from "../../redux/apis/apisCrudFactoring";
import { useDispatch, useSelector } from "react-redux";
import { setProductDetails, setUserProduct, setApplicationNumber, setRequiredDocuments } from "../../redux/apis/apisSlice";
import { RootState } from "../../redux/rootReducer";
import toast from "react-hot-toast";
const SelectProduct: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const savedProduct = useSelector((state: RootState) => state.block.userProductData);
  const [selected, setSelected] = useState<any>(savedProduct || {}); // default selection
  const prodId = useSelector((state: RootState) => state.block.prodId);
  const navigate =useNavigate();
   const dispatch = useDispatch();
  
  const handleRecaptcha = (value: any) => {
    if (value) {
      setVerified(true);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selected?.id) {
      toast.error("Please select a product!");
      return;
    }
    if (!verified) {
      toast.error("Please verify that you are a human!");
      return;
    }

    try {
      // Fetch full product details and store in redux
      const res = await getUserProductDetails(selected.id);
      if (res?.data?.success) {
        // Store the full data object so we have product, steps, T&C, etc.
        dispatch(setProductDetails(res.data.data));

        // Store loan_application_number from product-details response
        const loanAppNo = res.data.data?.loan_application_number;
        if (loanAppNo) {
          dispatch(setApplicationNumber({ applicationNo: loanAppNo }));
        }

        // Fetch required documents for this product and store in Redux
        try {
          const docsRes = await getRequiredDocuments(selected.id);
          if (docsRes?.data?.success) {
            const docsData = docsRes.data.data;
            const docsList = Array.isArray(docsData?.data) ? docsData.data : Array.isArray(docsData) ? docsData : [];
            dispatch(setRequiredDocuments(docsList));
          }
        } catch (docErr: any) {
          console.error("Error fetching required documents:", docErr);
        }
      } else {
        toast.error(res?.data?.message || "Failed to load product details");
        return;
      }
    } catch (error: any) {
      console.error("Error fetching product details:", error);
      toast.error(error?.message || "Failed to load product details");
      return;
    }

    navigate("/applyloan/Terms");
  };
  const getProducts = async () => {
    // Determine selected product id from redux.
    // prodId may be a single id (number) or an array of product objects.
    const selectedProductId =
      Array.isArray(prodId) && prodId.length > 0
        ? prodId[0].id
        : typeof prodId === "number"
        ? prodId
        : null;

    if (!selectedProductId) {
      console.warn("No product id found in redux 'prodId' to fetch partners.");
      setProducts([]);
      return;
    }

    try {
      const res = await getUserProductsListing(selectedProductId);
      if (res?.data?.success) {
        const data = res?.data?.data;
        setProducts(data || []);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error("Error fetching product partners:", error);
      setProducts([]);
    }
  };
  useEffect(() => {
    getProducts();
  }, [])

  useEffect(() => {
    if (!selected?.id && products.length > 0) {
      setSelected(products[0]);
    }
  }, [products, selected?.id]);
  useEffect(() => {
     if (selected && selected.id) {
    dispatch(setUserProduct(selected));
  }
  }, [selected])
  
  return (
    <div className="m-4">
      <div className="d-none flex-wrap gap-3 mb-4">
    
        {products.map((product:any) => (
          <div
            key={product.id}
            className={`partner-card ${selected?.id === product.id ? "selected" : ""}`}
            onClick={() => setSelected(product)}
          >
            {selected?.id === product.id && <div className="checkmark">✓</div>}
            <img
              src={Images.FactoringLogo}
              alt={Images.userLogo}
              className="partner-logo"
            />
            <p className="partner-title mt-3">{product.name_en}</p>
          </div>
        ))}

      </div>
      {/* <form onSubmit={handleSubmit}> */}
        {/* Your form fields here */}
        <ReCAPTCHA
          sitekey="6LfodLkqAAAAAJ2VZaZKHaWrTVC3VkuyZ9ZEXgPj" // replace with your actual site key
          onChange={handleRecaptcha}
        />
      {/* </form> */}
      <div className="mt-3">
      <div className="d-flex justify-content-start">
      <button 
        className="step-buttons" 
        style={{ background: "#1963b9", padding: "10px 5px", borderRadius: "0", minWidth: "100px",lineHeight:"24px" }}
        onClick={handleSubmit}>
        Next Step
      </button>
      </div>

   </div>

   
    </div>
  );
};

export default SelectProduct;
