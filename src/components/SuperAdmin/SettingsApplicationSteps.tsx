import { useState, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  addApplicationSteps,
  updateApplicationSteps,
} from "../../redux/apis/apisTenantCrud";

const SettingsApplicationSteps = ({
  setActiveTab,
  productId,
  productData,
  isEditable,
}) => {
  const [steps, setSteps] = useState([]);
  const [addData, setAddData] = useState(true);

  useEffect(() => {
    if (productData?.productApplicationSteps?.length) {
      setSteps(productData.productApplicationSteps);
      setAddData(false);
    } else {
      setSteps([{ stepNumber: 1, stepName_en: "", stepName_ar: "" }]); // Start with 1 step
      setAddData(true);
    }
  }, [productData]);

  const handleInputChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    };
    setSteps(updatedSteps);
  };

  const addNewStep = () => {
    setSteps([
      ...steps,
      { stepNumber: steps.length + 1, stepName_en: "", stepName_ar: "" },
    ]);
  };

  const removeStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    // Update step numbers dynamically
    const reIndexedSteps = updatedSteps.map((step, i) => ({
      ...step,
      stepNumber: i + 1,
    }));
    setSteps(reIndexedSteps);
  };

  const saveApplicationSteps = async () => {
    if (!productId) {
      toast.error("Product ID is missing!");
      return;
    }

    const body = {
      productId,
      applicationSteps: steps.map((step) => ({
        stepNumber: step.stepNumber,
        stepName_en: step.stepName_en,
        stepName_ar: step.stepName_ar,
      })),
    };

    const apiCall = addData ? addApplicationSteps : updateApplicationSteps;
    const action = addData ? "Adding" : "Updating";

    toast.promise(apiCall(body), {
      loading: `${action} Application Steps...`,
      success: (response) => {
        if (response?.data?.notificationMessage === "Operation successful.") {
          setActiveTab("Terms & Conditions");
          setAddData(false);
          return response.data.notificationMessage;
        } else {
          throw new Error(response?.data?.notificationMessage);
        }
      },
      error: (error) => error?.message || error?.data?.notificationMessage,
    });
  };

  return (
    <Form>
      <Row className="row col-gap-2">
        {steps.map((step, index) => (
          <Col md={12} className="mb-3" key={index}>
            <Row>
              <Col>
                <Form.Group controlId={`step${index + 1}`}>
                  <Form.Label>Step {index + 1} - English</Form.Label>
                  <Form.Control
                    type="text"
                    disabled={!isEditable}
                    placeholder="Enter step (English)"
                    value={step.stepName_en || ""}
                    onChange={(e) =>
                      handleInputChange(index, "stepName_en", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId={`step${index + 1}Arabic`}>
                  <Form.Label className="text-end d-block">
                    الخطوة {index + 1} - بالعربية
                  </Form.Label>
                  <Form.Control
                    type="text"
                    dir="rtl"
                    disabled={!isEditable}
                    placeholder="أدخل الخطوة (بالعربية)"
                    value={step.stepName_ar || ""}
                    onChange={(e) =>
                      handleInputChange(index, "stepName_ar", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              {steps.length > 1 && (
                <Col md="auto" className="d-flex align-items-end">
                  <Button
                    variant="danger"
                    onClick={() => removeStep(index)}
                    // disabled={steps.length === 1}
                  >
                    ✖
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
        ))}
      </Row>

      {isEditable && (
        <div className="d-flex justify-content-between">
          <Button
            className="theme-btn-next"
            onClick={addNewStep}
            disabled={!isEditable}
          >
            Add Step
          </Button>
          <Button className="theme-btn-update" onClick={saveApplicationSteps}>
            {addData ? "Add Application" : "Update Application"}
          </Button>
        </div>
      )}
    </Form>
  );
};

export default SettingsApplicationSteps;
