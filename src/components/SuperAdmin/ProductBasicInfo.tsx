import { Row, Col, Button, Form as BootstrapForm } from "react-bootstrap";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  addProductBasicInfo,
  updateProductBasicInfo,
} from "../../redux/apis/apisTenantCrud";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { useLocation } from "react-router-dom";
import { Select } from "antd";

const ProductTypes = [
  { label: "Individual", value: 0 },
  { label: "SME", value: 1 },
  { label: "Corporate", value: 2 },
];

const Categories = [
  { label: "Tawarruq", value: 0 },
  { label: "Ijarah", value: 1 },
];
const FinancingTypes = [
  { label: "Monthly", value: 0 },
  { label: "Yearly", value: 1 },
];
const SubCategories = [
  { label: "Personal Financing", value: 0 },
  { label: "Trade Financing", value: 1 },
  { label: "Property Leasing", value: 2 },
  { label: "Vehicle Leasing", value: 3 },
  { label: "Equipment Leasing", value: 4 },
  { label: "Operating Lease", value: 5 },
  { label: "Lease With Purchase Option", value: 6 },
  { label: "Lease Ending With Ownership", value: 7 },
  { label: "Business Financing", value: 8 },
  { label: "Cash Management", value: 9 },
  { label: "Investment Financing", value: 10 },
];

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  productName_en: Yup.string().required("Product name is required"),
  productName_ar: Yup.string().required("Arabic product name is required"),
  notificationEmail: Yup.string()
    .email("Invalid email format")
    .required("Notification email is required"),
  minFinancingAmount: Yup.number()
    .required("Min financing amount is required")
    .positive("Must be a positive number"),
  maxFinancingAmount: Yup.number()
    .required("Max financing amount is required")
    .positive("Must be a positive number")
    .test(
      "is-greater-than-min",
      "Max amount must be greater than min amount",
      function (value) {
        const { minFinancingAmount } = this.parent;
        return value > minFinancingAmount;
      }
    ),
  minTenure: Yup.number()
    .required("Min tenure is required")
    .positive("Must be a positive number"),
  maxTenure: Yup.number()
    .required("Max tenure is required")
    .positive("Must be a positive number")
    .test(
      "is-greater-than-min",
      "Max tenure must be greater than min tenure",
      function (value) {
        const { minTenure } = this.parent;
        return value > minTenure;
      }
    ),
});

const ProductBasicInfo = ({
  productId,
  handleNext,
  productData,
  isEditable,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const countries = useSelector((state: RootState) => state.block.countries);
  const location = useLocation();
  const pathtype = location.pathname.split("/").filter(Boolean)[0];

  const initialValues = {
    productName_en: productData?.basicDetails?.productName_en || "",
    productName_ar: productData?.basicDetails?.productName_ar || "",
    notificationEmail: productData?.basicDetails?.notificationEmail || "",
    country:
      productData?.basicDetails?.country ||
      (countries.length > 0 ? countries[0].id : ""),
    category: productData?.basicDetails?.category || 0,
    subCategory: productData?.basicDetails?.subCategory || 0,
    productType: productData?.basicDetails?.productType || 0,
    minFinancingAmount: productData?.basicDetails?.minFinancingAmount || "",
    maxFinancingAmount: productData?.basicDetails?.maxFinancingAmount || "",
    financingType: productData?.basicDetails?.financingType || 0,
    minTenure: productData?.basicDetails?.minTenure || "",
    maxTenure: productData?.basicDetails?.maxTenure || "",
    url: productData?.basicDetails?.url || "",
    // status: productData?.basicDetails?.status || false,
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      // Prepare request body

      if (pathtype === "edit") {
        // For update, include the ID in the body
        const updateBody = {
          ...values,
          id: productId,
        };

        await toast.promise(
          updateProductBasicInfo(updateBody), // Pass the body with ID included
          {
            loading: "Updating product details...",
            success: (response) => {
              if (
                response?.data?.notificationMessage === "Operation successful."
              ) {
                // setInitialValues(updateBody)
                handleNext(productId); // Use the existing productId
                return "Product updated successfully!";
              } else {
                throw new Error(
                  response?.data?.errors?.[0] || "Failed to update product."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while updating the product.",
          }
        );
      } else {
        // API call with toast.promise for better UX
        await toast.promise(
          addProductBasicInfo(values), // API call
          {
            loading: "Submitting product details...",
            success: (response) => {
              if (
                response?.data?.notificationMessage === "Operation successful."
              ) {
                handleNext(response.data?.data?.id);
                return "Product added successfully!";
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.notificationMessage ||
                    "Failed to add product."
                );
              }
            },
            error: (err) =>
              err?.message || "Something went wrong while adding the product.",
          }
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue, errors, touched }) => (
        <Form>
          <div className="tab-form-content">
            <Row className="mb-3">
              <Col md={6}>
                <BootstrapForm.Group controlId="productName_en">
                  <BootstrapForm.Label>
                    Product Name <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field
                    as={BootstrapForm.Control}
                    type="text"
                    name="productName_en"
                    disabled={!isEditable}
                    placeholder="Enter product name"
                  />
                  <ErrorMessage
                    name="productName_en"
                    component="div"
                    className="text-danger mt-1 fs-12"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group controlId="productName_ar">
                  <BootstrapForm.Label className="text-end d-block">
                    اسم
                    <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field
                    as={BootstrapForm.Control}
                    type="text"
                    name="productName_ar"
                    disabled={!isEditable}
                    placeholder="العنصر النائب"
                    dir="rtl"
                  />
                  <ErrorMessage
                    name="productName_ar"
                    component="div"
                    className="text-danger mt-1 fs-12"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <BootstrapForm.Group controlId="notificationEmail">
                  <BootstrapForm.Label>
                    Notification Email <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field
                    as={BootstrapForm.Control}
                    type="email"
                    name="notificationEmail"
                    disabled={!isEditable}
                    placeholder="Enter email"
                  />
                  <ErrorMessage
                    name="notificationEmail"
                    component="div"
                    className="text-danger mt-1 fs-12"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group controlId="country">
                  <BootstrapForm.Label>
                    Country <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field name="country">
                    {({ field, form }: any) => (
                      <Select
                        {...field}
                        className="w-100"
                        disabled={!isEditable}
                        onChange={(value) =>
                          form.setFieldValue("country", value)
                        }
                        options={countries.map((country) => ({
                          label: country.name,
                          value: country.id,
                        }))}
                      />
                    )}
                  </Field>
                </BootstrapForm.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <BootstrapForm.Group controlId="category">
                  <BootstrapForm.Label>
                    Category <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field name="category">
                    {({ field, form }: any) => (
                      <Select
                        className="w-100"
                        disabled={!isEditable}
                        value={field.value} // Ensures controlled state
                        onChange={(value) =>
                          form.setFieldValue(field.name, Number(value))
                        } // Convert to number
                        options={Categories.map((cat) => ({
                          label: cat.label,
                          value: cat.value,
                        }))}
                      />
                    )}
                  </Field>
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group controlId="subCategory">
                  <BootstrapForm.Label>
                    Sub Category <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field name="subCategory">
                    {({ field, form }: any) => (
                      <Select
                        className="w-100"
                        disabled={!isEditable}
                        value={field.value} // Ensures controlled state
                        onChange={(value) =>
                          form.setFieldValue(field.name, Number(value))
                        } // Convert to number
                        options={SubCategories.map((sub) => ({
                          label: sub.label,
                          value: sub.value,
                        }))}
                      />
                    )}
                  </Field>
                </BootstrapForm.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <BootstrapForm.Group controlId="productType">
                  <BootstrapForm.Label>
                    Product Type <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field name="productType">
                    {({ field, form }: any) => (
                      <Select
                        className="w-100"
                        disabled={!isEditable}
                        value={field.value} // Ensures controlled state
                        onChange={(value) =>
                          form.setFieldValue(field.name, Number(value))
                        } // Convert to number
                        options={ProductTypes.map((type) => ({
                          label: type.label,
                          value: type.value,
                        }))}
                      />
                    )}
                  </Field>
                </BootstrapForm.Group>
              </Col>
            </Row>

            <h5 className="mb-2 mt-4">Financing Amount</h5>
            <Row className="mb-3">
              <Col md={6}>
                <BootstrapForm.Group controlId="minFinancingAmount">
                  <BootstrapForm.Label>
                    Min Financing Amount <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field
                    as={BootstrapForm.Control}
                    type="number"
                    name="minFinancingAmount"
                    disabled={!isEditable}
                    placeholder="Enter amount"
                  />
                  <ErrorMessage
                    name="minFinancingAmount"
                    component="div"
                    className="text-danger mt-1 fs-12"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group controlId="maxFinancingAmount">
                  <BootstrapForm.Label>
                    Max Financing Amount <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field
                    as={BootstrapForm.Control}
                    type="number"
                    name="maxFinancingAmount"
                    disabled={!isEditable}
                    placeholder="Enter amount"
                  />
                  <ErrorMessage
                    name="maxFinancingAmount"
                    component="div"
                    className="text-danger mt-1 fs-12"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>

            <h5 className="mb-2 mt-4">Financing Tenure</h5>
            <Row className="mb-3">
              <Col md={6}>
                <BootstrapForm.Group controlId="financingType">
                  <BootstrapForm.Label>
                    Financing Type <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field name="financingType">
                    {({ field, form }: any) => (
                      <Select
                        className="w-100"
                        disabled={!isEditable}
                        value={field.value} // Ensures controlled state
                        onChange={(value) =>
                          form.setFieldValue(field.name, Number(value))
                        } // Convert to number
                        options={FinancingTypes.map((type) => ({
                          label: type.label,
                          value: type.value,
                        }))}
                      />
                    )}
                  </Field>
                </BootstrapForm.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <BootstrapForm.Group controlId="minTenure">
                  <BootstrapForm.Label>
                    Min Tenure <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field
                    as={BootstrapForm.Control}
                    type="number"
                    name="minTenure"
                    disabled={!isEditable}
                    placeholder="Enter min tenure"
                  />
                  <ErrorMessage
                    name="minTenure"
                    component="div"
                    className="text-danger mt-1 fs-12"
                  />
                </BootstrapForm.Group>
              </Col>
              <Col md={6}>
                <BootstrapForm.Group controlId="maxTenure">
                  <BootstrapForm.Label>
                    Max Tenure <span className="text-danger">*</span>
                  </BootstrapForm.Label>
                  <Field
                    as={BootstrapForm.Control}
                    type="number"
                    name="maxTenure"
                    disabled={!isEditable}
                    placeholder="Enter max tenure"
                  />
                  <ErrorMessage
                    name="maxTenure"
                    component="div"
                    className="text-danger mt-1 fs-12"
                  />
                </BootstrapForm.Group>
              </Col>
            </Row>

            {/* File Upload and Status Toggle */}
            <Row className="mb-3 align-items-center mt-4">
              <Col md={6}>
                <BootstrapForm.Label className="me-3">
                  Upload Logo
                </BootstrapForm.Label>
                <div className="d-flex align-items-center">
                  <label htmlFor="fileUpload" className="btn btn-secondary">
                    Browse...
                  </label>
                  <input
                    type="file"
                    id="fileUpload"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    disabled={!isEditable}
                  />
                  {selectedFile && (
                    <span className="ms-2 text-danger">1 Image Uploaded</span>
                  )}
                </div>
              </Col>

              {/* <Col md={6} className="d-flex align-items-center">
                <BootstrapForm.Check
                  className="theme-toggle-btn"
                  type="switch"
                  label="Status"
                  checked={values.status}
                  onChange={() => setFieldValue("status", !values.status)}
                  id="status-switch"
                  disabled={!isEditable}
                />
              </Col> */}
            </Row>
          </div>
          {isEditable && (
            <div className="d-flex justify-content-end pt-4">
              <Button
                type="submit"
                className="theme-btn-next"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Next"}
              </Button>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default ProductBasicInfo;
