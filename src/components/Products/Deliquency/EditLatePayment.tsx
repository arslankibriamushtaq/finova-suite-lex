import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { Row, Col, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { updateDeliquency } from "../../../redux/apis/apisCrudLms";
import Loader from "../../Loader/Loader";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../utils/axios";

const EditLatePayment = ({ productId, setSelectedTab }: any ) => {
  const { t } = useTranslation("productManagement2");
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
    promisesPerYear: "",
    promisesPerLoan: "",
  });
  const id = useParams();
  const [errors, setErrors] = useState<any>({}); // Track validation errors
  async function getInfo(): Promise<any> {
    try {
      await axios
        .get(`/api/Product/GetProductDetailsById?Id=${id?.id}`)
        .then((res) => {
          if (res.status == 200) {
            if (res.data.notificationMessage == "Operation successful.") {
              setFormValues({
                fromDay: res?.data?.data?.delinquency[2].fromDay,
                tillDay: res?.data?.data?.delinquency[2].tillDay,
                penalty: res?.data?.data?.delinquency[2].penaltyAmount
                  ? res?.data?.data?.delinquency[2].penaltyAmount
                  : res?.data?.data?.delinquency[2].penaltyPercentage,
              });
              setradioInputValue(
                res?.data?.data?.delinquency[1].isPercentage
                  ? "Percentage"
                  : "Fixed"
              );
            } else {
              toast.error(res.data.errors[0]);
            }
          }
        });
    } catch (e) {
      console.error(e);
    } finally {
    }
  }
  useEffect(() => {
    getInfo();
  }, []);
  const CollateralType = [
    {
      label: t("delinquency.percentage"),
      type: "radio",
      name: "Percentage",
      value: "Percentage",
    },
    { label: t("delinquency.fixed"), type: "radio", name: "Fixed", value: "Fixed" },
  ];

  const PercentageDetail = [
    {
      label:
        radioInputValue == "Percentage"
          ? t("delinquency.penaltyAmountPct")
          : t("delinquency.penaltyAmount"),
      type: "number",
      name: "penalty",
      placeholder: t("delinquency.penalty"),
    },

    {
      label: t("delinquency.fromDay"),
      type: "number",
      name: "fromDay",
      placeholder: t("delinquency.fromDay"),
    },
    {
      label: t("delinquency.tillDay"),
      type: "number",
      name: "tillDay",
      placeholder: t("delinquency.tillDay"),
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

  const handleInputChange: any = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));

    if (type === "radio") {
      setradioInputValue(value);
    }

    // Clear error for the field being changed
    setErrors((prevErrors: any) => ({ ...prevErrors, [name]: "" }));
  };

  const validateFields: any = () => {
    const newErrors: any = {};
    if (!formValues.penalty) newErrors.penalty = t("delinquency.penaltyRequired");

    if (!formValues.fromDay) newErrors.fromDay = t("delinquency.fromDayRequired");
    if (!formValues.tillDay) newErrors.tillDay = t("delinquency.tillDayRequired");
    /* if (!formValues.promisesPerYear)
      newErrors.promisesPerYear = "Promises Per Year is required";
    if (!formValues.promisesPerLoan)
      newErrors.promisesPerLoan = "Promises Per Loan is required";
 */
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateSubmitForm: any = async () => {
    if (!validateFields()) return;

    setLoader(true);
    const body = {
      delinquencyType: 2,
      isPercentage: true,
      penaltyPercentage: formValues.penalty,
      fromDay: formValues.fromDay,
      tillDay: formValues.tillDay,
      penaltyType: 1,

      productId,
    };
    const bodyFixed = {
      delinquencyType: 2,
      isPercentage: false,
      penaltyAmount: formValues.penalty,
      fromDay: formValues.fromDay,
      tillDay: formValues.tillDay,
      penaltyType: 1,
      productId,
    };

    try {
      const res = await updateDeliquency(
        radioInputValue == "Percentage" ? body : bodyFixed
      );
      if (res.data.notificationMessage == "Operation successful.") {
        toast.success(res.data.notificationMessage);
        // localStorage.setItem("tabs", "DueLoan");
        setSelectedTab("Non-PerformingLoan");
        setLoader(false);
      } else {
        toast.error(res.data.errors[0]);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error.message || t("delinquency.errorOccurred"));
    }
  };

  return (
    <div>
      {loader && <Loader />}

      <div className="border-deliquencies p-4 mt-4">
        <div
          className="d-flex align-items-center justify-content-between mt-1 mb-3"
          style={{ fontSize: "15px", fontWeight: "Bold" }}
        >
          {t("delinquency.penaltyAmountSettings")}
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
                {errors[field.name] && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {errors[field.name]}
                  </span>
                )}
              </Form.Group>
            </Col>
          ))}
        </Row>
      </div>
      <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
        <Button
          className="revert-btn mb-2 me-3"
          /* style={{
            backgroundColor: "#A0A0A0",
            border: "1px solid #A0A0A0",
            borderRadius: "2px",
            height: "fit-content",
            width: "fit-content",
          }} */
          onClick={() => {
            setSelectedTab("DueLoan");
          }}
        >
          {t("common:back")}
        </Button>
        <Button
          className="application-btn mb-2"
          /* style={{
            backgroundColor: "#EB0D0D",
            borderRadius: "2px",
            height: "fit-content",
            width: "fit-content",
          }} */
          onClick={updateSubmitForm}
        >
          {t("delinquency.saveNext")}
        </Button>
      </div>
    </div>
  );
};

export default EditLatePayment;
