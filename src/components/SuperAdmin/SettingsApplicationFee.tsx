import { Formik, Field, Form as FormikForm } from "formik";
import { useEffect, useState } from "react";
import { Form, Row, Col, Button, ModalBody, Modal } from "react-bootstrap";
import { Select } from "antd";
import toast from "react-hot-toast";
import {
  UpdateProductApplicationFees,
  addAplicationFees,
} from "../../redux/apis/apisTenantCrud";
import edit from "../../assets/images/tabler_edit (1).svg";
import { Images } from "../Config/Images";
const feesList = [
  "Application Fee",
  "Processing Fee",
  "Origination Fee",
  "Underwriting Fee",
  "Credit Report Fee",
  "Administrative Fee",
  "Tax Service Fee",
  "Document Preparation Fee",
  "Funding Fee",
  "Legal Fee",
  "Annual Fee",
  "Notary Fee",
  "Broker Fee",
  "Inspection Fee",
];

const feeTypes = [
  { value: 0, label: "Fixed" },
  { value: 1, label: "Percentage" },
  { value: 2, label: "FixedSlab" },
  { value: 3, label: "PercentageSlab" },
];

const getInitialValues = (productData) => {
  let values = {};

  // Default structure setup for each fee
  feesList.forEach((fee) => {
    values[fee] = { enabled: false, feeType: 0, amount: "", slabs: [] };
  });

  // Extract fee response
  const feeResponse = productData?.productApplicationFeeResponse || [];

  feeResponse.forEach((item) => {
    const feeIndex = item.productApplicationFee?.applicationFeetype - 1;

    // Ensure the feeIndex is valid and maps correctly
    if (feeIndex >= 0 && feeIndex < feesList.length) {
      const feeName = feesList[feeIndex];

      values[feeName] = {
        enabled: item.productApplicationFee?.status ?? true,
        feeType: item.productApplicationFee?.feeType ?? 0,
        amount: item.productApplicationFee?.amount ?? "",
        slabs:
          item.feeSlabs?.map((slab) => ({
            slabName: slab.slabName,
            min: slab.min,
            max: slab.max,
            value: slab.value,
          })) || [],
      };
    } 
  });

  return values;
};

const SettingsApplicationFee = ({
  setActiveTab,
  productData,
  productId,
  isEditable,
}) => {
  const [initialValues, setInitialValues] = useState(() =>
    getInitialValues(productData)
  );

  const [selectedFeeType, setSelectedFeeType] = useState("");
  const [percentageModal, setPercentageModal] = useState(false);
  const [errorPercentage, setErrorPercentage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<any>({});
  const [editIndex, setEditIndex] = useState(null);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [percentageData, setPercentageData] = useState<any>([]);
  const [slabs, setSlabs] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [newSlab, setNewSlab] = useState({
    slabName: "",
    min: "",
    max: "",
    value: "",
  });
  const [newPercentage, setNewPercentage] = useState({
    slabName: "",
    min: "",
    max: "",
    value: "",
  });
  useEffect(() => {
    setInitialValues(getInitialValues(productData));
  }, [productData]);
  const isUpdate = productData?.productApplicationFeeResponse?.length > 0;
  const handleSubmit = async (values) => {
    const selectedFees = {
      productId: productId,
      feeList: Object.keys(values)
        .filter((fee) => values[fee]?.enabled)
        .map((fee) => {
          const feeType = values[fee]?.feeType ?? 0;
          const feeSlabsForType = slabs.find(
            (item) =>
              item.feeType.toString().toLowerCase() ===
              fee.toString().toLowerCase()
          );

          const percentageSlabsForType = percentageData.find(
            (item) =>
              item.feeType.toString().toLowerCase() ===
              fee.toString().toLowerCase()
          );
          let feeSlab = [];

          const feeSlabs = feeSlabsForType?.slabs || [];
          const percentageSlabs = percentageSlabsForType?.percentageData || [];

          feeSlab = [...feeSlabs, ...percentageSlabs].map((slab) => ({
            slabName: slab.slabName,
            min: parseInt(slab.min),
            max: slab.max === "Above" ? "Above" : parseInt(slab.max),
            value: parseInt(slab.value),
          }));

          return {
            applicationFeetype: feesList.indexOf(fee) + 1,
            feeType,
            amount: values[fee]?.amount || 0,
            status: true,
            feeSlab,
          };
        }),
    };

    const apiCall = isUpdate ? UpdateProductApplicationFees : addAplicationFees;
    toast.promise(apiCall(selectedFees), {
      loading: isUpdate
        ? "Updating Application Fees..."
        : "Adding Application Fees...",
      success: (response) => {
        if (response?.data?.notificationMessage === "Operation successful.") {
          setActiveTab("Loan Fees");
          return response.data.notificationMessage;
        } else {
          throw new Error(response?.data?.notificationMessage);
        }
      },
      error: (error) =>
        error?.message ||
        error?.data?.notificationMessage ||
        "Something Went Wrong",
    });
  };

  const handleSavePercentage = () => {
    const feeGroup = percentageData.find(
      (item) => item.feeType === selectedFeeType
    );
    const feeSlabs = feeGroup?.percentageData || [];
    const lastSlab = feeSlabs[feeSlabs.length - 1];

    const min = parseInt(newPercentage.min);
    const max =
      newPercentage.max === "Above" ? "Above" : parseInt(newPercentage.max);
    const value = parseInt(newPercentage.value);

    // Validation
    if (
      !newPercentage.slabName ||
      !newPercentage.min ||
      !newPercentage.value ||
      (newPercentage.max !== "Above" && !newPercentage.max)
    ) {
      setErrorPercentage("Please fill all fields.");
      return;
    }
    if (isNaN(min) || isNaN(value) || (max !== "Above" && isNaN(max))) {
      setErrorPercentage("Minimum, Maximum, and value must be numbers.");
      return;
    }
    if (feeSlabs.length > 0 && !isEditing && min <= lastSlab.max) {
      setErrorPercentage(`Minimum value must be greater than ${lastSlab.max}`);
      return;
    }
    if (max !== "Above" && max <= min) {
      setErrorPercentage("Maximum value must be greater than Minimum value.");
      return;
    }

    // Save or update
    setPercentageData((prev) => {
      const updatedData = [...prev];
      const feeIndex = updatedData.findIndex(
        (item) => item.feeType === selectedFeeType
      );

      if (feeIndex > -1) {
        const slabs = updatedData[feeIndex].percentageData || [];
        if (isEditing && editIndex !== null) {
          slabs[editIndex] = newPercentage;
        } else {
          slabs.push(newPercentage);
        }
        updatedData[feeIndex].percentageData = slabs;
      } else {
        updatedData.push({
          feeType: selectedFeeType,
          percentageData: [newPercentage],
        });
      }

      return updatedData;
    });

    setUpdateDialog(true);
    setPercentageModal(false);
  };

  const handleInputChangePercentage = (e) => {
    const { name, value } = e.target;
    setNewPercentage((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChangeSlab = (e) => {
    const { name, value } = e.target;
    setNewSlab((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSlab = (fee, index) => {
    setIsEditing(true);
    setShowModal(true);
    setSelectedFeeType(fee); // Safe to set here for future logic

    const feeData = slabs?.find((item) => item.feeType === fee);

    if (feeData && feeData?.slabs[index]) {
      setNewSlab(feeData.slabs[index]);
      setEditIndex(index);
    }
  };

  const handleSaveSlab = () => {
    const feeGroup = slabs.find((item) => item.feeType === selectedFeeType);
    const feeSlabs = feeGroup?.slabs || [];
    const lastSlab = feeSlabs[feeSlabs.length - 1];

    const min = parseInt(newSlab.min);
    const max = newSlab.max === "Above" ? "Above" : parseInt(newSlab.max);
    const value = parseInt(newSlab.value);

    // Validation
    if (
      !newSlab.slabName ||
      !newSlab.min ||
      !newSlab.value ||
      (newSlab.max !== "Above" && !newSlab.max)
    ) {
      setError("Please fill all fields.");
      return;
    }
    if (isNaN(min) || isNaN(value) || (max !== "Above" && isNaN(max))) {
      setError("Minimum, Maximum, and value must be numbers.");
      return;
    }
    if (feeSlabs.length > 0 && !isEditing && min <= lastSlab.max) {
      setError(`Minimum value must be greater than ${lastSlab.max}`);
      return;
    }
    if (max !== "Above" && max <= min) {
      setError("Maximum value must be greater than Minimum value.");
      return;
    }

    setSlabs((prev) => {
      const updatedData = [...prev];
      const feeIndex = updatedData.findIndex(
        (item) => item.feeType === selectedFeeType
      );

      if (feeIndex > -1) {
        const slabs = updatedData[feeIndex].slabs || [];
        if (isEditing && editIndex !== null) {
          slabs[editIndex] = newSlab;
        } else {
          slabs.push(newSlab);
        }
        updatedData[feeIndex].slabs = slabs;
      } else {
        updatedData.push({ feeType: selectedFeeType, slabs: [newSlab] });
      }

      return updatedData;
    });

    setUpdateDialog(true);
    setShowModal(false);
  };

  const getFeeName = (feeTypeValue: number) => {
    return feesList[feeTypeValue - 1] || "Unknown Fee";
  };

  const extractSlabsData = (productData: any) => {
    if (
      !productData ||
      !Array.isArray(productData.productApplicationFeeResponse)
    ) {
      return { slabs: [], percentageData: [] };
    }

    const slabs: any[] = [];
    const percentageData: any[] = [];

    productData.productApplicationFeeResponse.forEach((fee: any) => {
      const feeType = getFeeName(
        fee?.productApplicationFee?.applicationFeetype || "Unknown Fee"
      );
      const feeSlabs = Array.isArray(fee?.feeSlabs) ? fee.feeSlabs : [];

      if (fee.productApplicationFee?.feeType === 2) {
        // Fixed Slab
        slabs.push({
          feeType,
          slabs: feeSlabs.map((slab: any) => ({
            min: slab.min,
            max: slab.max,
            value: slab.value,
            slabName: slab.slabName,
          })),
        });
      }

      if (fee.productApplicationFee?.feeType === 3) {
        // Percentage Slab
        percentageData.push({
          feeType,
          percentageData: feeSlabs.map((slab: any) => ({
            min: slab.min,
            max: slab.max,
            value: slab.value,
            slabName: slab.slabName,
          })),
        });
      }
    });

    return { slabs, percentageData };
  };

  useEffect(() => {
    if (productData) {
      const { slabs: initialSlabs, percentageData: initialPercentageData } =
        extractSlabsData(productData);
      setSlabs(initialSlabs);
      setPercentageData(initialPercentageData);
    }
  }, [productData]);

  const handleAddNewPercentage = () => {
    setUpdateDialog(false);
    setPercentageModal(true);
    setNewPercentage({ slabName: "", min: "", max: "", value: "" });
    setErrorPercentage("");
    setIsEditing(false);
  };

  const handleAddNewSlab = () => {
    setUpdateDialog(false);
    setShowModal(true);
    setNewSlab({ slabName: "", min: "", max: "", value: "" });
    setError("");
    setIsEditing(false);
  };

  const handleEditPercentage = (fee, index) => {
    setSelectedFeeType(fee);

    const feeData = percentageData?.find(
      (item) => item.feeType === selectedFeeType
    );

    if (feeData && feeData.slabs[index]) {
      setNewSlab(feeData.slabs[index]);
      setEditIndex(index);
      setIsEditing(true);
      setShowModal(true);
    }
  };

  const handleDeleteSlab = (feeType, index) => {
    setSlabs((prev) => {
      return prev.map((item) => {
        if (item.feeType === feeType) {
          const updatedSlabs = item.slabs.filter((_, i) => i !== index);
          return { ...item, slabs: updatedSlabs };
        }
        return item;
      });
    });
  };
  const handleDeletePercentageSlab = (feeType, index) => {
    setPercentageData((prev) => {
      return prev.map((item) => {
        if (item.feeType === feeType) {
          const updatedSlabs = item.percentageData.filter(
            (_, i) => i !== index
          );
          return { ...item, percentageData: updatedSlabs };
        }
        return item;
      });
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <FormikForm>
          {feesList.map((fee, index) => (
            <div key={index} className="mb-4">
              <h5 className="mb-3">{fee}</h5>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Fee Type</Form.Label>
                    <Field name={`${fee}.feeType`}>
                      {({ field, form }: any) => (
                        <Select
                          {...field}
                          className="w-100"
                          disabled={!form.values[fee]?.enabled || !isEditable}
                          onChange={(value) => {
                            form.setFieldValue(`${fee}.feeType`, value);
                          }}
                          value={form.values[fee]?.feeType}
                          options={feeTypes.map((type) => ({
                            label: type.label,
                            value: type.value,
                          }))}
                        />
                      )}
                    </Field>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Amount</Form.Label>
                    <Field
                      type="number"
                      name={`${fee}.amount`}
                      className="form-control"
                      placeholder="Enter amount"
                      disabled={!values[fee].enabled || !isEditable}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-center">
                  <Form.Check
                    disabled={!isEditable}
                    type="switch"
                    label="Enable"
                    className="theme-toggle-btn"
                    checked={values[fee].enabled}
                    onChange={(e) =>
                      setFieldValue(`${fee}.enabled`, e.target.checked)
                    }
                  />
                </Col>
                <Row className="mt-3">
                  <Col md={7}>
                    {values[fee]?.feeType === 2 && (
                      <>
                        <table className="w-100 table-auto">
                          <thead style={{ background: "#A0A0A0" }}>
                            <tr
                              style={{
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: "600",
                              }}
                            >
                              <th style={{ padding: "15px" }}>Slab Name</th>
                              <th>Minimum</th>
                              <th>Maximum</th>
                              <th>Fixed Value</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {slabs
                              .filter((item) => item.feeType === fee)
                              .flatMap((item) =>
                                item.slabs.map((data, index) => (
                                  <tr
                                    key={index}
                                    style={{
                                      border: "1px solid #E8E8E8",
                                    }}
                                  >
                                    <td style={{ padding: "18px" }}>
                                      {data.slabName}
                                    </td>
                                    <td>{data.min} SAR</td>
                                    <td>{data.max} SAR</td>
                                    <td>{data.value}</td>
                                    {isEditable && (
                                      <td>
                                        <div className="d-flex justify-start gap-2">
                                          <div
                                            onClick={() =>
                                              handleEditSlab(fee, index)
                                            }
                                          >
                                            <img src={edit} alt="edit" />
                                          </div>
                                          <div
                                            onClick={() =>
                                              handleDeleteSlab(fee, index)
                                            }
                                          >
                                            <img
                                              src={Images.deleteIcon}
                                              height={20}
                                              width={20}
                                            />
                                          </div>
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))
                              )}
                          </tbody>
                        </table>

                        {(values[fee]?.feeType === 2 ||
                          values[fee]?.feeType === 3) && (
                          <div className="mt-4 mb-4 d-flex justify-content-end">
                            <span
                              onClick={() => {
                                setSelectedFeeType(fee);
                                handleAddNewSlab();
                              }}
                              style={{
                                color: "#EB0D0D",
                                fontSize: "16px",
                                fontWeight: "600",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                            >
                              {isEditable ? "ADD NEW SLAB" : ""}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {values[fee]?.feeType === 3 && (
                      <>
                        <table className="w-100">
                          <thead style={{ background: "#A0A0A0" }}>
                            <tr
                              style={{
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: "600",
                              }}
                            >
                              <th style={{ padding: "15px" }}>Slab Name</th>
                              <th>Minimum</th>
                              <th>Maximum</th>
                              <th>Percentage</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {percentageData
                              .filter((item) => item.feeType === fee)
                              .flatMap((item) =>
                                item.percentageData.map((data, index) => (
                                  <tr
                                    key={index}
                                    style={{
                                      border: "1px solid #E8E8E8",
                                    }}
                                  >
                                    <td style={{ padding: "18px" }}>
                                      {data.slabName}
                                    </td>
                                    <td>{data.min} SAR</td>
                                    <td>{data.max} SAR</td>
                                    <td>{data.value} %</td>
                                    {isEditable && (
                                      <td>
                                        <div className="d-flex justify-start gap-2">
                                          <div
                                            onClick={() =>
                                              handleEditPercentage(fee, index)
                                            }
                                          >
                                            <img src={edit} alt="edit" />
                                          </div>
                                          <div
                                            onClick={() =>
                                              handleDeletePercentageSlab(
                                                fee,
                                                index
                                              )
                                            }
                                          >
                                            <img
                                              src={Images.deleteIcon}
                                              height={20}
                                              width={20}
                                            />
                                          </div>
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))
                              )}
                          </tbody>
                        </table>
                        <div className="mt-4 mb-4 d-flex justify-content-end">
                          <span
                            onClick={() => {
                              setSelectedFeeType(fee);
                              handleAddNewPercentage();
                            }}
                            style={{
                              color: "#EB0D0D",
                              fontSize: "16px",
                              fontWeight: "600",
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                          >
                            {isEditable ? "ADD NEW SLAB" : ""}
                          </span>
                        </div>
                      </>
                    )}
                  </Col>
                </Row>
              </Row>
            </div>
          ))}

          <Modal
            show={showModal}
            centered
            size="lg"
            onHide={() => {
              setShowModal(false);
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title className="modal-title">Add New Slab</Modal.Title>
            </Modal.Header>
            <Modal.Body className="">
              <div className="px-4 mt-2 mb-4">
                {error && <p style={{ color: "red" }}>{error}</p>}
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        Slab Name:
                      </Form.Label>
                      <Form.Control
                        name="slabName"
                        type="text"
                        value={newSlab.slabName}
                        onChange={handleInputChangeSlab}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        Minimum:
                      </Form.Label>
                      <Form.Control
                        name="min"
                        type="number"
                        value={newSlab.min}
                        onChange={handleInputChangeSlab}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        Maximum:
                      </Form.Label>
                      <Form.Control
                        name="max"
                        type="number"
                        value={newSlab.max}
                        onChange={handleInputChangeSlab}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        Fixed value:
                      </Form.Label>
                      <Form.Control
                        name="value"
                        type="number"
                        value={newSlab.value}
                        onChange={handleInputChangeSlab}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  {" "}
                  <button
                    className="btn btn-danger mb-4"
                    onClick={() => {
                      handleSaveSlab();
                    }}
                    style={{
                      backgroundColor: "#EB0D0D",
                      borderRadius: "6px",
                      height: "fit-content",
                      width: "fit-content",
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            show={percentageModal}
            centered
            size="lg"
            onHide={() => {
              setPercentageModal(false);
            }}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title className="modal-title">
                Add New Percentage Slab
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="">
              <div className="px-4 mt-2 mb-4">
                {errorPercentage && (
                  <p style={{ color: "red" }}>{errorPercentage}</p>
                )}
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        Slab Name:
                      </Form.Label>
                      <Form.Control
                        name="slabName"
                        type="text"
                        value={newPercentage.slabName}
                        onChange={handleInputChangePercentage}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        Minimum:
                      </Form.Label>
                      <Form.Control
                        name="min"
                        type="number"
                        value={newPercentage.min}
                        onChange={handleInputChangePercentage}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        Maximum:
                      </Form.Label>
                      <Form.Control
                        name="max"
                        type="number"
                        value={newPercentage.max}
                        onChange={handleInputChangePercentage}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        Percentage:
                      </Form.Label>
                      <Form.Control
                        name="value"
                        type="number"
                        value={newPercentage.value}
                        onChange={handleInputChangePercentage}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  {" "}
                  <button
                    className="application-btn mt-2"
                    onClick={() => {
                      handleSavePercentage();
                    }}
                    style={{
                      //backgroundColor: "#EB0D0D",
                      borderRadius: "6px",
                      height: "fit-content",
                      width: "fit-content",
                      padding: "8px",
                      border: "none",
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          {isEditable && (
            <div className="d-flex justify-content-end">
              <Button className="theme-btn-update" type="submit">
                {isUpdate ? "Update Application Fees" : "Add Application Fees"}
              </Button>
            </div>
          )}
        </FormikForm>
      )}
    </Formik>
  );
};

export default SettingsApplicationFee;
