import React, { useEffect, useState } from "react";
import { Button, Select } from "antd";
import { Row, Col, Form, Modal, InputGroup } from "react-bootstrap";
import Loader from "./Loader/Loader";
import { Images } from "./Config/Images";
import { createDeliquency, updateEarlySettlement } from "../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

const EarlySettlementFixedFrequency = (props: any) => {
  const [loader, setLoader] = useState(false);
  const [fields, setFields] = useState([
    { Time: "", Days: "", notification: "" },
  ]);
  const [formValues, setFormValues] = useState<any>({
    penalty: props?.formValues.penalty,

    days:
      props.radioInputValue == "FixedFrequency" ? props?.formValues.days : "",
    fromDay:
      props.radioInputValue == "FixedFrequency"
        ? props?.formValues.fromDay
        : "",
    tillDay:
      props.radioInputValue == "FixedFrequency"
        ? props?.formValues.tillDay
        : "",
    discount: props?.formValues.isPercentage,
  });
  const [errors, setErrors] = useState({}); // Track validation errors
  const PercentageDetail = [
    // {
    //   label:
    //     radioInputValue == "Percentage"
    //       ? "Penalty Amount in %"
    //       : "Penalty Amount",
    //   type: "number",
    //   name: "penalty",
    //   placeholder: "Penalty",
    // },

    {
      label: "From Day",
      type: "number",
      name: "fromDay",
      placeholder: "From Day",
      value: props?.formValues.fromDay || 0,
    },
    {
      label: "Till Day",
      type: "number",
      name: "tillDay",
      placeholder: "Till Day",
      value: props?.formValues.tillDay,
    },
    {
      label: `${formValues?.discount ? "Amount in Percentage" : "Amount"}`,
      type: "number",
      name: "penalty",
      placeholder: `${formValues?.discount ? "Penalty (%)" : "Penalty"}`,
      value: props?.formValues.penalty,
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

  useEffect(() => {
    setFormValues({
      ...formValues,
      penalty: props?.formValues.penalty,

      days:
        props.radioInputValue == "FixedFrequency" ? props?.formValues.days : "",
      fromDay:
        props.radioInputValue == "FixedFrequency"
          ? props?.formValues.fromDay
          : "",
      tillDay:
        props.radioInputValue == "FixedFrequency"
          ? props?.formValues.tillDay
          : "",
      discount: props?.formValues.isPercentage,
    });
  }, [props]);
  const validateFields = () => {
    const newErrors: any = {};
    if (!formValues.fromDay) newErrors.fromDay = "From Day is required";
    if (!formValues.tillDay) newErrors.tillDay = "Till Day is required";
    if (!formValues.penalty) newErrors.penalty = "Amount is required";
    if (formValues?.discount && formValues.penalty > 100) {
      newErrors.penalty = "Percentage cannot exceed 100";
      // isValid = false;
    }
    /* if (!formValues.promisesPerYear)
      newErrors.promisesPerYear = "Promises Per Year is required";
    if (!formValues.promisesPerLoan)
      newErrors.promisesPerLoan = "Promises Per Loan is required";
 */
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));
    // Clear error for the field being changed
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const handleFieldChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const values = [...fields];
    values[index][event.target.name as keyof (typeof values)[number]] = event.target.value;
    setFields(values);
    // calculateSubtotal(values);
  };
  const handleRemoveField = (index: any) => {
    const values = [...fields];
    values.splice(index, 1);
    setFields(values);
    // calculateSubtotal(values);
  };
  const handleAddField = () => {
    setFields([...fields, { Time: "", Days: "", notification: "" } as any]);
  };
  const discountEnum = [
    { label: "Fixed", value: false },
    { label: "Percentage", value: true },
  ];
  const updateSubmitForm = async () => {
    if (!validateFields()) return;

    setLoader(true);
    const body = {
      delinquencyType: 1,
      settlementStrategy: props?.settlementStrategy ?? 1,
      isCustom: false,
      isPercentage: formValues?.discount,
      penaltyPercentage: Number(formValues?.discount ? formValues?.penalty : 0),
      penaltyAmount: Number(!formValues?.discount ? formValues?.penalty : 0),
      fromDay: Number(formValues?.fromDay),
      tillDay: Number(formValues?.tillDay),
      penaltyType: 1,
      productId: props?.productId,
      isFixedEarlySettlement: true,
      invoiceRange: false,
    };
    try {
      const res = await createDeliquency(body);
      if (res?.data) {
        toast.success("Saved successfully");
        // localStorage.setItem("tabs", "DueLoan");
        props?.setSelectedTab("DueLoan");
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

  return (
    <>
      <div>
        {loader && <Loader />}
        <Row>
          <Col md={4} className="mb-3">
            <>
              <Form.Label className="mt-2 fs-fw">Discount</Form.Label>
              <Select
                value={formValues.discount}
                onChange={(value, option) => {
                  setFormValues((prevValues: any) => ({
                    ...prevValues,
                    discount: value,
                  }));
                }}
                defaultValue={formValues?.discount}
                style={{ width: "100%" }}
                placeholder="Select Product"
              >
                {discountEnum?.map((option: any) => (
                  <Select.Option value={option.value}>
                    <div>{option?.label}</div>
                  </Select.Option>
                ))}
              </Select>
            </>
          </Col>
        </Row>
        <Row>
          {PercentageDetail.map((field: any, index) => (
            <Col md={4} className="mb-3" key={index}>
              <Form.Group>
                <Form.Label className="mt-2 fs-fw">
                  {field.label}
                  <span className="required-indicator ps-1">*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    name={field.name}
                    type="number"
                    value={formValues[field.name]}
                    placeholder={field.placeholder}
                    onChange={handleInputChange}
                  />
                  {field.label === "Amount in Percentage" && (
                    <InputGroup.Text>%</InputGroup.Text>
                  )}
                </InputGroup>

                {errors[field.name as keyof typeof errors] && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {errors[field.name as keyof typeof errors]}
                  </span>
                )}
              </Form.Group>
            </Col>
          ))}
        </Row>
        <div
          className="mt-4"
          style={{ borderBottom: "1px solid #D1D1D1" }}
        ></div>
   
        <div
          className="mt-4"
          style={{ borderBottom: "1px solid #D1D1D1" }}
        ></div>
        <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
          <Button
            className="theme-btn-next"
            style={{ fontSize: "16px" }}
            onClick={() => {
              updateSubmitForm();
            }}
          >
            Save & Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default EarlySettlementFixedFrequency;
