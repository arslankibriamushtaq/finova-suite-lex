import { Form as BootstrapForm, Row, Col, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import {
  addProductEligibilitySetting,
  updateProductEligibilitySetting,
} from "../../redux/apis/apisTenantCrud";
import { useLocation } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { FaInfoCircle } from "react-icons/fa";
// Validation schema
const validationSchema = Yup.object().shape({
  minAge: Yup.number()
    .required("Min age is required")
    .min(0, "Min age must be at least 0")
    .integer("Must be a whole number"),
  maxAge: Yup.number()
    .required("Max age is required")
    .min(0, "Max age must be at least 0")
    .integer("Must be a whole number")
    .test(
      "is-greater-than-min",
      "Max age must be greater than min age",
      function (value) {
        const { minAge } = this.parent;
        return !minAge || !value || value > minAge;
      }
    ),
  income_Acc_Statement_Manual: Yup.number()
    .required("Account statement (manual) is required")
    .min(0, "Value must be at least 0"),
  income_Acc_Statement_Auto: Yup.number()
    .required("Account statement (auto) is required")
    .min(0, "Value must be at least 0"),
  income: Yup.number()
    .required("Income is required")
    .min(0, "Income must be at least 0"),
  isRevenueRequire: Yup.boolean(),
  revenue_Acc_Statement_Manual: Yup.number().when("isRevenueRequire", {
    is: true,
    then: () =>
      Yup.number()
        .required("Revenue account statement (manual) is required")
        .min(0, "Value must be at least 0"),
    otherwise: () => Yup.number().notRequired(),
  }),
  revenue_Acc_Statement_Auto: Yup.number().when("isRevenueRequire", {
    is: true,
    then: () =>
      Yup.number()
        .required("Revenue account statement (auto) is required")
        .min(0, "Value must be at least 0"),
    otherwise: () => Yup.number().notRequired(),
  }),
  revenue_Income: Yup.number().when("isRevenueRequire", {
    is: true,
    then: () =>
      Yup.number()
        .required("Revenue income is required")
        .min(0, "Revenue income must be at least 0"),
    otherwise: () => Yup.number().notRequired(),
  }),
});

function ProductEligibilitySettings({
  productId,
  onSuccess,
  productData,
  isEditable,
}) {
  const location = useLocation();
  const pathtype = location.pathname.split("/").filter(Boolean)[0];

  const initialValues = {
    minAge: productData?.productEligibilitySetting?.minAge || 0,
    maxAge: productData?.productEligibilitySetting?.maxAge || 0,
    income_Acc_Statement_Manual:
      productData?.productEligibilitySetting?.income_Acc_Statement_Manual || 0,
    income_Acc_Statement_Auto:
      productData?.productEligibilitySetting?.income_Acc_Statement_Auto || 0,
    income: productData?.productEligibilitySetting?.income || 0,
    isRevenueRequire:
      productData?.productEligibilitySetting?.isRevenueRequire || true,
    revenue_Acc_Statement_Manual:
      productData?.productEligibilitySetting?.revenue_Acc_Statement_Manual || 0,
    revenue_Acc_Statement_Auto:
      productData?.productEligibilitySetting?.revenue_Acc_Statement_Auto || 0,
    revenue_Income: productData?.productEligibilitySetting?.revenue_Income || 0,
    productId: productData?.productEligibilitySetting?.productId || productId,
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (pathtype === "edit") {
        await toast.promise(
          updateProductEligibilitySetting(values), // API call
          {
            loading: "updating eligibility settings...",
            success: (response) => {
              if (
                response?.data?.notificationMessage === "Operation successful."
              ) {
                onSuccess();
                return "Eligibility settings updated successfully!";
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.notificationMessage ||
                    "Failed to save eligibility settings."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while saving eligibility settings.",
          }
        );
      } else {
        await toast.promise(
          addProductEligibilitySetting(values), // API call
          {
            loading: "Submitting eligibility settings...",
            success: (response) => {
              if (
                response?.data?.notificationMessage === "Operation successful."
              ) {
                onSuccess();
                return "Eligibility settings saved successfully!";
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.notificationMessage ||
                    "Failed to save eligibility settings."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while saving eligibility settings.",
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
    <>
      <Tooltip id="my-tooltip" />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true} // To update form when productId changes
      >
        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
          <Form>
            <div className="tab-form-content">
              <h5 className="mb-2">Age</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <BootstrapForm.Group controlId="minAge">
                    <BootstrapForm.Label>
                      Min Age <span className="text-danger">*</span>
                    </BootstrapForm.Label>
                    <Field
                      as={BootstrapForm.Control}
                      type="number"
                      name="minAge"
                      disabled={!isEditable}
                      placeholder="Enter minimum age"
                    />
                    <ErrorMessage
                      name="minAge"
                      component="div"
                      className="text-danger mt-1 fs-12"
                    />
                  </BootstrapForm.Group>
                </Col>
                <Col md={6}>
                  <BootstrapForm.Group controlId="maxAge">
                    <BootstrapForm.Label>
                      Max Age <span className="text-danger">*</span>
                    </BootstrapForm.Label>
                    <Field
                      as={BootstrapForm.Control}
                      type="number"
                      name="maxAge"
                      disabled={!isEditable}
                      placeholder="Enter maximum age"
                    />
                    <ErrorMessage
                      name="maxAge"
                      component="div"
                      className="text-danger mt-1 fs-12"
                    />
                  </BootstrapForm.Group>
                </Col>
              </Row>

              <h5 className="mb-2 mt-4">Income Requirements</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <BootstrapForm.Group controlId="income_Acc_Statement_Manual">
                    <BootstrapForm.Label>
                      Account Statement (Manual Approval)
                      <span className="ms-2">
                        <a
                          data-tooltip-id="my-tooltip"
                          data-tooltip-html="Account statement obtained from a third party for the specified number of months, <br/> the application will undergo manual review by an agent."
                        >
                          <FaInfoCircle />
                        </a>
                      </span>
                    </BootstrapForm.Label>
                    <Field
                      as={BootstrapForm.Control}
                      type="number"
                      name="income_Acc_Statement_Manual"
                      disabled={!isEditable}
                      placeholder="Enter amount"
                    />
                    <ErrorMessage
                      name="income_Acc_Statement_Manual"
                      component="div"
                      className="text-danger mt-1 fs-12"
                    />
                  </BootstrapForm.Group>
                </Col>
                <Col md={6}>
                  <BootstrapForm.Group controlId="income_Acc_Statement_Auto">
                    <BootstrapForm.Label>
                      Account Statement (Auto Approval)
                      <span className="ms-2">
                        <a
                          data-tooltip-id="my-tooltip"
                          data-tooltip-html="Account statement obtained from a third party for the specified number of months <br/>the application will be automatically processed without manual intervention."
                        >
                          <FaInfoCircle />
                        </a>
                      </span>
                    </BootstrapForm.Label>
                    <Field
                      as={BootstrapForm.Control}
                      type="number"
                      name="income_Acc_Statement_Auto"
                      disabled={!isEditable}
                      placeholder="Enter amount"
                    />
                    <ErrorMessage
                      name="income_Acc_Statement_Auto"
                      component="div"
                      className="text-danger mt-1 fs-12"
                    />
                  </BootstrapForm.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <BootstrapForm.Group controlId="income">
                    <BootstrapForm.Label>
                      Income
                      <span className="ms-2">
                        <a
                          data-tooltip-id="my-tooltip"
                          data-tooltip-html="Represents the monthly salary of the individual applying for the loan."
                        >
                          <FaInfoCircle />
                        </a>
                      </span>
                    </BootstrapForm.Label>
                    <Field
                      as={BootstrapForm.Control}
                      type="number"
                      name="income"
                      disabled={!isEditable}
                      placeholder="Monthly"
                    />
                    <ErrorMessage
                      name="income"
                      component="div"
                      className="text-danger mt-1 fs-12"
                    />
                  </BootstrapForm.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <BootstrapForm.Group
                  controlId="isRevenueRequire"
                  className="d-flex align-items-center"
                >
                  <Field
                    as={BootstrapForm.Check}
                    type="checkbox"
                    name="isRevenueRequire"
                    checked={values.isRevenueRequire}
                    disabled={!isEditable}
                    onChange={() =>
                      setFieldValue(
                        "isRevenueRequire",
                        !values.isRevenueRequire
                      )
                    }
                    className="me-2"
                  />
                  <BootstrapForm.Label className="mb-0">
                    This product requires revenue?
                  </BootstrapForm.Label>
                </BootstrapForm.Group>
              </Row>
              {values.isRevenueRequire && (
                <>
                  <h5 className="mb-2 mt-4">
                    Revenue Eligibility
                    <span className="ms-2">
                      <a
                        data-tooltip-id="my-tooltip"
                        data-tooltip-html="Determines eligibility based on the business's revenue fetched from the 3rd-party <br/>applicable for business loan applications rather than personal income assessments."
                        // data-tooltip-content="Determines eligibility based on the business's revenue fetched from the 3rd-party,applicable for business loan applications rather than personal income assessments."
                      >
                        <FaInfoCircle />
                      </a>
                    </span>
                  </h5>
                  <Row className="mb-3">
                    <Col md={6}>
                      <BootstrapForm.Group controlId="revenue_Acc_Statement_Manual">
                        <BootstrapForm.Label>
                          Account Statement (Manual Approval)
                          <span className="ms-2">
                            <a
                              data-tooltip-id="my-tooltip"
                              data-tooltip-html="Account statement obtained from a third party for the specified number of months, <br/> the application will undergo manual review by an agent."
                            >
                              <FaInfoCircle />
                            </a>
                          </span>
                        </BootstrapForm.Label>
                        <Field
                          as={BootstrapForm.Control}
                          type="number"
                          name="revenue_Acc_Statement_Manual"
                          disabled={!isEditable}
                          placeholder="Enter amount"
                        />
                        <ErrorMessage
                          name="revenue_Acc_Statement_Manual"
                          component="div"
                          className="text-danger mt-1 fs-12"
                        />
                      </BootstrapForm.Group>
                    </Col>
                    <Col md={6}>
                      <BootstrapForm.Group controlId="revenue_Acc_Statement_Auto">
                        <BootstrapForm.Label>
                          Account Statement (Auto Approval)
                          <span className="ms-2">
                            <a
                              data-tooltip-id="my-tooltip"
                              data-tooltip-html="Account statement obtained from a third party for the specified number of months <br/>the application will be automatically processed without manual intervention."
                            >
                              <FaInfoCircle />
                            </a>
                          </span>
                        </BootstrapForm.Label>
                        <Field
                          as={BootstrapForm.Control}
                          type="number"
                          name="revenue_Acc_Statement_Auto"
                          disabled={!isEditable}
                          placeholder="Enter amount"
                        />
                        <ErrorMessage
                          name="revenue_Acc_Statement_Auto"
                          component="div"
                          className="text-danger mt-1 fs-12"
                        />
                      </BootstrapForm.Group>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <BootstrapForm.Group controlId="revenue_Income">
                        <BootstrapForm.Label>
                          Income{" "}
                          <span className="ms-2">
                            <a
                              data-tooltip-id="my-tooltip"
                              data-tooltip-html="Represents the monthly salary of the individual applying for the loan."
                            >
                              <FaInfoCircle />
                            </a>
                          </span>
                        </BootstrapForm.Label>
                        <Field
                          as={BootstrapForm.Control}
                          type="number"
                          name="revenue_Income"
                          disabled={!isEditable}
                          placeholder="Monthly"
                        />
                        <ErrorMessage
                          name="revenue_Income"
                          component="div"
                          className="text-danger mt-1 fs-12"
                        />
                      </BootstrapForm.Group>
                    </Col>
                  </Row>
                </>
              )}
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
    </>
  );
}

export default ProductEligibilitySettings;
