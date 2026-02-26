import { useState } from "react";
import { Row, Col, Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  createDeliquency
} from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";
import { useNavigate } from "react-router-dom";

const WriteOff = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [radioInputValue, setradioInputValue] = useState("Percentage");
  const [loader, setLoader] = useState(false);
  const [fields, setFields] = useState([{ item: "", price: "" }]);
  const [formValues, setFormValues] = useState<any>({
    penalty: "",
    days: "",
    fromDay: "",
    tillDay: "",
    promisesPerYear: 0,
    promisesPerLoan: 0,
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

  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));

    if (type === "radio") {
      setradioInputValue(value);
    }

    // Clear error for the field being changed
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateFields = () => {
    const newErrors: any = {};
    if (!formValues.penalty) newErrors.penalty = "Penalty is required";
    if (!formValues.fromDay) newErrors.fromDay = "From Day is required";
    if (!formValues.tillDay) newErrors.tillDay = "Till Day is required";
    /* if (!formValues.promisesPerYear)
      newErrors.promisesPerYear = "Promises Per Year is required";
    if (!formValues.promisesPerLoan)
      newErrors.promisesPerLoan = "Promises Per Loan is required"; */

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateSubmitForm = async () => {
    if (!validateFields()) return;

    setLoader(true);
    const body = {
      delinquencyType: 4,
      isPercentage: true,
      penaltyPercentage: formValues.penalty,
      fromDay: formValues.fromDay,
      tillDay: formValues.tillDay,
      penaltyType: 1,
      promisesPerYear: formValues.promisesPerYear,
      promisesPerLoan: formValues.promisesPerLoan,
      productId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    };
    const bodyFixed = {
      delinquencyType: 4,
      isPercentage: false,
      penaltyAmount: formValues.penalty,
      fromDay: formValues.fromDay,
      tillDay: formValues.tillDay,
      penaltyType: 1,
      promisesPerYear: formValues.promisesPerYear,
      promisesPerLoan: formValues.promisesPerLoan,
      productId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    };

    try {
      const res = await createDeliquency(
        radioInputValue == "Percentage" ? body : bodyFixed
      );
      toast.success(res.data.notificationMessage);
      setLoader(false);
    } catch (error: any) {
      setLoader(false);
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div>
      {loader && <Loader />}

      <div
        className="p-4 mt-4"
        style={{ border: "1px solid #DADADA", borderRadius: "10px" }}
      >
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
          {PercentageDetail.map((field, index) => (
            <Col md={4} className="mb-3" key={index}>
              <Form.Group>
                <Form.Label
                  className="mt-2"
                  style={{ fontSize: "13px", fontWeight: "600" }}
                >
                  {field.label}
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
        </Row>
      </div>
      <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
        <button
          className="btn btn-danger mb-4 me-3"
          style={{
            backgroundColor: "#A0A0A0",
            border: "1px solid #A0A0A0",
            borderRadius: "8px",
            height: "fit-content",
            width: "fit-content",
          }}
        >
          Back
        </button>
        <button
          className="btn btn-danger mb-4"
          style={{
            backgroundColor: "#EB0D0D",
            borderRadius: "8px",
            height: "fit-content",
            width: "fit-content",
          }}
          onClick={updateSubmitForm}
        >
          Save & Next
        </button>
      </div>
    </div>
  );
};

export default WriteOff;
