import { useEffect, useState } from "react";
import { Button } from "antd";
import { Row, Col, Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import { createDeliquency, getDeliquency, createDelinquencyNotifications } from "../../../redux/apis/apisCrudLms";
import Loader from "../../Loader/Loader";
import { useNavigate } from "react-router-dom";

const NonPerforming = ({ productId, setSelectedTab }: any) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [radioInputValue, setradioInputValue] = useState("Percentage");
  const [loader, setLoader] = useState(true);
  const [fields, setFields] = useState([{ item: "", price: "" }]);
  const [formValues, setFormValues] = useState<any>({
    penalty: "",
    days: "",
    fromDay: "",
    tillDay: "",
    promisesPerYear: "",
    promisesPerLoan: "",
  });
  const [errors, setErrors] = useState({}); // Track validation errors
  const [fieldsInvoice, setFieldsInvoice] = useState([
    { templateName: "", Days: "", notification: "" } as any,
  ]);

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

  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));

    if (type === "radio") {
      setradioInputValue(value);
    }

    // Clear error for the field being changed
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const handleFieldChange = (index: number, name: string, value: any) => {
    const values = [...fieldsInvoice];
    values[index][name] = value;
    setFieldsInvoice(values);
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

  const createDelinquency = async () => {
    try {
      const body = {
        templateName: fieldsInvoice[0].templateName,
        noOfDay: fieldsInvoice[0].Days,
        notification: fieldsInvoice[0].notification,
        delinquencyType: 5,
        isPercentage: true,
        penaltyPercentage: formValues.penalty,
        fromDay: formValues.fromDay,
        tillDay: formValues.tillDay,
        penaltyType: 1,
        productId,
      };
      const res = await createDelinquencyNotifications(body);
      if(res.data.notificationMessage == "Operation successful.") {
        toast.success(res.data.notificationMessage);
      } else {
        toast.error(res.data.errors[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };
  const updateSubmitForm = async () => {
    if (!validateFields()) return;

    setLoader(true);
    const body = {
      delinquencyType: 5,
      isPercentage: true,
      penaltyPercentage: formValues.penalty,
      fromDay: formValues.fromDay,
      tillDay: formValues.tillDay,
      penaltyType: 1,
      productId,
    };
    const bodyFixed = {
      delinquencyType: 5,
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
        // await createDelinquency();
        toast.success(res?.data?.message);
        // localStorage.setItem("tabs", "DueLoan");
        setSelectedTab("BrokenPromises");
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
  const getDeliquencyData = async () => {
    //setLoading(true);
    try {
      const res = await getDeliquency(productId);
      if (res?.data) {
     
        const data = res?.data?.data.find((item: { delinquencyTypeName: string; })=>item.delinquencyTypeName === "NON_PERFORMING_LOAN");
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
                    className={`mt-4 d-flex align-items-center gap-1 ${
                      radioInputValue == field.value ? "accent-red" : ""
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
                        {errors[field.name as keyof typeof errors ]}
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
      {/* {fieldsInvoice.map((field, index) => (
          <div key={index} className="mb-2 mt-2 d-flex gap-1">
            <div className="row" style={{ flex: 11.5 }}>
              <Col md={4} className="mb-3" key={index}>
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    Notification {`${index + 1}`}
                  </Form.Label>
                  <Form.Control
                    name="notification"
                    type="text"
                    value={field.notification}
                    placeholder="Notification"
                    onChange={(event: any) => handleFieldChange(index, "notification", event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3" key={index}>
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">Template Name</Form.Label>
                  <Form.Control
                    name="Time"
                    type="text"
                    value={field.templateName}
                    placeholder="Time"
                    onChange={(event: any) => handleFieldChange(index, "templateName", event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3" key={index}>
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">No. Of Days</Form.Label>
                  <Form.Control
                    name="Days"
                    type="text"
                    value={field.Days}
                    placeholder="Days"
                    onChange={(event: any) => handleFieldChange(index, "Days", event.target.value)}
                  />
                </Form.Group>
              </Col>
            </div>
          </div>
        ))} */}
      <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
        <Button
          className="revert-btn mb-2 me-2"
          style={{
            border: "none",
            borderRadius: "7px",
            padding: "8px 8px",
          }}
          onClick={() => {
            setSelectedTab("Write-offs");
          }}
        >
          Back
        </Button>
        <Button
          className="application-btn mb-2"
          /* style={{
            backgroundColor: "#EB0D0D",
            borderRadius: "8px",
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

export default NonPerforming;
