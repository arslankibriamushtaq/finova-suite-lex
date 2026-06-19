import { useEffect, useState } from "react";
import { Button } from "antd";
import Skeleton from "react-loading-skeleton";
import { Row, Col, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { createDelinquencyNotifications, createDeliquency, getDeliquency } from "../../../redux/apis/apisCrudLms";
import Loader from "../../Loader/Loader";

const LatePayment = ({ productId, setSelectedTab }: any) => {

  const [radioInputValue, setradioInputValue] = useState("Percentage");
  const [loader, setLoader] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<any>({
    penalty: "",
    days: "",
    fromDay: "",
    tillDay: "",
    promisesPerYear: "",
    promisesPerLoan: "",
  });
  const [fieldsInvoice, setFieldsInvoice] = useState({
    templateName: "",
    Days: "",
    notification: ""
  });
  const [errors, setErrors] = useState({}); // Track validation errors

  const CollateralType = [
    {
      label: "Percentage",
      type: "radio",
      name: "Percentage",
      value: "Percentage",
    },
    { label: "Fixed", type: "radio", name: "Fixed", value: "Fixed" },
  ];

  const PercentageDetail = [
    {
      label:
        radioInputValue == "Percentage"
          ? "Penalty Amount in %"
          : "Penalty Amount",
      type: "number",
      name: "penalty",
      placeholder: "Penalty",
    },

    {
      label: "From Day",
      type: "number",
      name: "fromDay",
      placeholder: "From Day",
    },
    {
      label: "Till Day",
      type: "number",
      name: "tillDay",
      placeholder: "Till Day",
    },
    /* {
      label: "Promises Per Year",
      type: "number",
      name: "promisesPerYear",
      placeholder: "Promises Per Year",
    },
    {
      label: "Promises Per Loan",
      type: "number",
      name: "promisesPerLoan",
      placeholder: "Promises Per Loan",
    }, */
  ];
  const createDelinquency = async () => {
    try {
      const body = {
        templateName: fieldsInvoice.templateName,
        noOfDay: fieldsInvoice.Days,
        notification: fieldsInvoice.notification,
        delinquencyType: 3,
        isPercentage: true,
        penaltyPercentage: formValues.penalty,
        fromDay: formValues.fromDay,
        tillDay: formValues.tillDay,
        penaltyType: 1,
        productId,
      };

      const res = await createDelinquencyNotifications(body);

      if (res.data.notificationMessage == "Operation successful.") {
        toast.success("Notification created successfully");
      } else {
        toast.error(res.data.errors?.[0] || "An error occurred");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };
  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));

    if (type === "radio") {
      setradioInputValue(value);
    }

    // Clear error for the field being changed
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const handleFieldChange = (name: string, value: any) => {
    setFieldsInvoice((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateFields = () => {
    const newErrors: any = {};
    if (!formValues.penalty) newErrors.penalty = "Penalty is required";

    if (!formValues.fromDay) newErrors.fromDay = "From Day is required";
    if (!formValues.tillDay) newErrors.tillDay = "Till Day is required";
    /*  if (!formValues.promisesPerYear)
       newErrors.promisesPerYear = "Promises Per Year is required";
     if (!formValues.promisesPerLoan)
       newErrors.promisesPerLoan = "Promises Per Loan is required";
  */
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const getDeliquencyData = async () => {
    //setLoading(true);
    try {
      const res = await getDeliquency(productId);
      if (res) {
        const data = res?.data?.data?.find((item: { delinquencyTypeName: string; }) => item?.delinquencyTypeName === "LATE_PAYMENT");
        setradioInputValue(
          data?.isPercentage ? "Percentage" : "Fixed"
        );
        setFormValues({
          ...formValues,
          penalty: data?.isPercentage
            ? data?.penaltyPercentage
            : data?.penaltyAmount,
          fromDay: data?.fromDay,
          tillDay: data?.tillDay,
        });
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      setLoading(false);
      toast.error(error.message || "An error occurred");
    }
  };
  const updateSubmitForm = async () => {
    if (!validateFields()) return;

    setLoader(true);
    const body = {
      delinquencyType: 3,
      isPercentage: true,
      penaltyPercentage: formValues.penalty,
      fromDay: formValues.fromDay,
      tillDay: formValues.tillDay,
      penaltyType: 1,
      productId,
    };
    const bodyFixed = {
      delinquencyType: 3,
      isPercentage: false,
      penaltyAmount: formValues.penalty,
      fromDay: formValues.fromDay,
      tillDay: formValues.tillDay,
      penaltyType: 1,
      productId,
    };

    try {
      const res = await createDeliquency(
        radioInputValue == "Percentage" ? body : bodyFixed
      );
      if (res?.data) {
        toast.success(res?.data?.message);
        // localStorage.setItem("tabs", "DueLoan");
        setSelectedTab("Write-offs");
        setLoader(false);
      } else {
        toast.error(res.data.errors[0]);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error.message || "An error occurred");
    }
  };
  useEffect(() => {
    getDeliquencyData();
  }, [productId]);
  return (
    <div>
      {loader && <Loader />}

      <div className="border-deliquencies p-4 mt-4">
        <div
          className="d-flex align-items-center justify-content-between mt-1 mb-3"
          style={{ fontSize: "15px", fontWeight: "Bold" }}
        >
          Penalty Amount Settings
        </div>

        <Row>
          {CollateralType.map((field, index) => (
            <Col md={3} className="mb-3" key={index}>
              <Form.Group>
                {field.type === "radio" && (
                  <Form.Check
                    className={`mt-4 d-flex align-items-center gap-1 ${radioInputValue == field.value ? "accent-red" : ""
                      }`}
                    type={field.type}
                    label={field.label}
                    name={field.name}
                    value={field.value}
                    checked={radioInputValue === field.value}
                    onChange={handleInputChange}
                    style={{ fontSize: "14px", fontWeight: "700" }}
                  />
                )}
              </Form.Group>
            </Col>
          ))}
        </Row>

        <Row>
          {loading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <Col md={4} key={index} className="pt-3">
                  <Skeleton />
                  <Skeleton className="pt-3 mt-3" />
                </Col>
              ))}
            </>
          )}
          {!loading && (
            <>
              {PercentageDetail.map((field, index) => (
                <Col md={4} className="mb-3" key={index}>
                  <Form.Group>
                    <Form.Label
                      className="mt-2"
                      style={{ fontSize: "13px", fontWeight: "600" }}
                    >
                      {field.label}
                      <span className="required-indicator ps-1">*</span>
                    </Form.Label>
                    <Form.Control
                      name={field.name}
                      type={field.type}
                      value={formValues[field.name]}
                      placeholder={field.placeholder}
                      onChange={handleInputChange}
                    />
                    {errors[field.name as keyof typeof errors] && (
                      <span style={{ color: "red", fontSize: "12px" }}>
                        {errors[field.name as keyof typeof errors]}
                      </span>
                    )}
                  </Form.Group>
                </Col>
              ))}
            </>
          )}
        </Row>
      </div>
      <div
        className="mt-4"
        style={{ borderBottom: "1px solid var(--color-border-light)" }}
      ></div>

      {/* <div className="mt-4 mb-3">
        <div
          className="d-flex align-items-center justify-content-between mb-3"
          style={{ fontSize: "15px", fontWeight: "Bold" }}
        >
          <span>Notification Settings</span>
        </div>

        <div
          className="mb-3 p-4"
          style={{
            border: "1px solid var(--color-border-light)",
            borderRadius: "6px",
            backgroundColor: "var(--color-surface-ice)",
            position: "relative",
          }}
        >
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label className="mt-2 fs-fw">
                  Notification
                </Form.Label>
                <Form.Control
                  name="notification"
                  type="text"
                  value={fieldsInvoice.notification}
                  placeholder="Notification"
                  onChange={(event: any) =>
                    handleFieldChange("notification", event.target.value)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label className="mt-2 fs-fw">Template Name</Form.Label>
                <Form.Control
                  name="templateName"
                  type="text"
                  value={fieldsInvoice.templateName}
                  placeholder="Template Name"
                  onChange={(event: any) =>
                    handleFieldChange("templateName", event.target.value)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label className="mt-2 fs-fw">No. Of Days</Form.Label>
                <Form.Control
                  name="Days"
                  type="text"
                  value={fieldsInvoice.Days}
                  placeholder="Days"
                  onChange={(event: any) =>
                    handleFieldChange("Days", event.target.value)
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </div> */}
      <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
        <Button
          className="revert-btn mb-2 me-2"
          style={{
            padding: "8px 8px",
            border: "none",
            borderRadius: "6px",
          }}
          onClick={() => {
            setSelectedTab("EarlySettlement");
          }}
        >
          Back
        </Button>
        <Button
          className="application-btn mb-2"
          /* style={{
            backgroundColor: "#EB0D0D",
            borderRadius: "6px",
            height: "fit-content",
            width: "fit-content",
          }} */
          onClick={updateSubmitForm}
        >
          Save & Next
        </Button>
      </div>
    </div>
  );
};

export default LatePayment;
