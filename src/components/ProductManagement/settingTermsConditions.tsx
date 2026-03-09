import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {  Col, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "antd";
import { TermsAndConditions, getProductById } from "../../redux/apis/apisCrud";
import { useLocation } from "react-router-dom";

const SettingsTermsConditions = ({ readOnly = false,setSelectedTab}:any) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const product = useSelector((s: any) => s.block.productData);
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;
  
  const [formValues, setFormValues] = useState({email:"",phone_number:"",en:"",ar:"",min_financing_amount:0})

  // Load product data for terms and conditions
  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        try {
          const response = await getProductById(productId, 'settings_tos');
          if (response?.data?.message === "success") {
            // Don't overwrite the full product data, just update the form values
            setFormValues((prev) => ({
              ...prev,
              en: response.data.data?.terms_and_conditions?.en || "",
              ar: response.data.data?.terms_and_conditions?.ar || "",
              email: response.data.data?.email || "",
              phone_number: response.data.data?.phone_number || "",
              min_financing_amount: response.data.data?.min_financing_amount || 0,
            }));
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Failed to load terms and conditions data");
        }
      } else {
        // Fallback to Redux data if no productId
        setFormValues((prev) => ({
          ...prev,
          en: product?.terms_and_conditions?.en || "",
          ar: product?.terms_and_conditions?.ar || "",
        }));
      }
    };
    loadProductData();
  }, [productId, dispatch]);
  const handleChange = (field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
   
  };
  function toBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
  }
   
  const handleSubmit = async () => {
    const body: any = {
      disclaimer: {
        en: toBase64(formValues.en), // encode CKEditor value
        ar: toBase64(formValues.ar),
      },
      terms_and_conditions: {
        en: toBase64(formValues.en), // encode CKEditor value
        ar: toBase64(formValues.ar),
      },
      phone_number: formValues.phone_number,
      email: formValues.email,
      // min_financing_amount: formValues.min_financing_amount,
    };
   
    try {
      const res = await TermsAndConditions(body, productId);
      if (res?.data?.success) {
        // navigate("/ProductManagement/TermsAndConditions");
        toast.success(res?.data?.message);
        localStorage.setItem("tabs", "FeeSettings");
        setSelectedTab("FeeSettings")
      }
    } catch (err: any) {
      Object.keys(err?.res?.data?.data?.data || {}).forEach((field) => {
        err?.res?.data?.data?.data[field].forEach((msg: any) => {
          toast.error(`${field}: ${msg}`);
        });
      });
    }
  };
  // const handleSubmit = async ()=>{

  //   const body: any= {
  //     disclaimer:{
  //       en:formValues.en,
  //       ar:formValues.ar
  //     },terms_and_conditions:{
  //       en:formValues.en,
  //       ar:formValues.ar
  //     },
    
  //       phone_number:formValues.phone_number,
  //       email:formValues.email,
  //       // min_financing_amount:formValues.min_financing_amount,
      
  //   }
  //   try{
  //     const res = await TermsAndConditions(body, productId)
  //     if(res?.data?.success){
  //       navigate("/ProductManagement/termsandconditions")
  //       toast.success(res?.data?.message);
  //     }
  //   }catch(err: any){
  //     Object.keys(err?.res?.data?.data?.data).forEach((field) => {
  //       err?.res?.data?.data?.data[field].forEach((msg: any) => {
  //         toast.error(`${field}: ${msg}`);
  //       });
  //     });
  //   }
  // }
  return (
    <div className="container-fluid">
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Step 01
            </label>
            <Input
              placeholder="Select Partner"
              className="fs-6"
              value={formValues.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label
              className="d-flex justify-content-start mb-1"
              style={{ fontWeight: 400 }}
            >
              Contact
            </label>
            <Input
              placeholder="Enter Contact Number"
              className="fs-6"
              value={formValues.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="editor-fixed">
            <CKEditor
              // @ts-ignore
              editor={ClassicEditor}
              config={{
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "underline",
                  "strikethrough",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "blockQuote",
                  "insertTable",
                  "undo",
                  "redo",
                  "imageUpload",
                  "mediaEmbed",
                  "codeBlock",
                  "highlight",
                  "alignment",
                  "fontColor",
                  "fontBackgroundColor",
                  "fontSize",
                  "fontFamily",
                  "horizontalLine",
                  "specialCharacters",
                ],
              }}
              
              style = {{innerHeight: ""}}
            data={formValues.en}
            onChange={(_, editor) => {
              if (readOnly) return;
              const data = editor.getData();
              handleChange("en", data);
            }}
            />
          </div>
        </Col>

        <Col>
          <div className="editor-fixed">
            <CKEditor
              // @ts-ignore
              editor={ClassicEditor}
              config={{
                toolbar: [
                  "bold",
                  "italic",
                  "underline",
                  "bulletedList",
                  "numberedList",
                  "undo",
                  "redo",
                  "-",
                ],
              }}
            data={formValues.ar}
            onChange={(_, editor) => {
              if (readOnly) return;
              const data = editor.getData();
              handleChange("ar", data);
            }}
            />
          </div>
        </Col>
        {/* {
          <Col md="auto" className="d-flex align-items-end">
            <button className="btn btn-danger mt-2">✖</button>
          </Col>
        } */}
      </Row>
      <>
        {/* <div className="d-flex justify-content-start">
          <Button className="theme-btn-next">Add</Button>
        </div> */}
        {!readOnly && (
          <div className="d-flex justify-content-end">
            <button className="theme-btn-next" onClick={handleSubmit}>Submit Terms</button>
          </div>
        )}
      </>
    </div>
  );
};

export default SettingsTermsConditions;
