import { Formik, Field, ErrorMessage, Form as FormikForm } from "formik";
import { useEffect, useState } from "react";
import { Row, Col, Button, Modal, Form } from "react-bootstrap";
import { addLoanFees, updateLoanFees } from "../../redux/apis/apisTenantCrud";
import toast from "react-hot-toast";
import { Select } from "antd";
import edit from "../../assets/images/tabler_edit (1).svg";
import { Images } from "../Config/Images";
const feeTypes = [
  { value: 0, label: "Fixed" },
  { value: 1, label: "Percentage" },
  { value: 2, label: "FixedSlab" },
  { value: 3, label: "PercentageSlab" },
];

const SettingsLoanFees = ({
  productId,
  setActiveTab,
  productData,
  isEditable,
}) => {
  const [loanFeesData, setLoanFeesData] = useState({});
  const [isNewData, setIsNewData] = useState(false);
  const [selectTaxType, setSelectTaxType] = useState<any>({});
  const [percentageModal, setPercentageModal] = useState(false);
  const [errorPercentage, setErrorPercentage] = useState("");
  const [error, setError] = useState<any>("");
  const [editIndex, setEditIndex] = useState(null);
  const [selectedSlabType, setSelectedSlabType] = useState("");

  const [slabsData, setSlabsData] = useState({
    costOfFinancing: [],
    costOfTerm: [],
    gdbr: [],
    creditLine: [],
  });

  const [percentageData, setPercentageData] = useState({
    costOfFinancing: [],
    costOfTerm: [],
    gdbr: [],
    creditLine: [],
  });

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
    if (productData?.productLoanFeesResponse?.length > 0) {
      // Use the first entry if multiple exist
      const obj = {
        productId: productId,
        costOfFinancingType:
          productData.productLoanFeesResponse[0]?.productLoanFees?.feeType,
        costOfFinancing:
          productData.productLoanFeesResponse[0]?.productLoanFees?.value,
        costOfTermType:
          productData.productLoanFeesResponse[1]?.productLoanFees?.feeType,
        costOfTerm:
          productData.productLoanFeesResponse[1]?.productLoanFees?.value,
        gdbrType:
          productData.productLoanFeesResponse[2]?.productLoanFees?.feeType,
        gdbrValue:
          productData.productLoanFeesResponse[2]?.productLoanFees?.value,
        creditLineType:
          productData.productLoanFeesResponse[3]?.productLoanFees?.feeType,
        creditLineValue:
          productData.productLoanFeesResponse[3]?.productLoanFees?.value,
      };
      setLoanFeesData(obj);
      setSlabsData({
        costOfFinancing: productData.productLoanFeesResponse[0]?.feeSlabs || [],
        costOfTerm: productData.productLoanFeesResponse[1]?.feeSlabs || [],
        gdbr: productData.productLoanFeesResponse[2]?.feeSlabs || [],
        creditLine: productData.productLoanFeesResponse[3]?.feeSlabs || [],
      });
      setPercentageData({
        costOfFinancing: productData.productLoanFeesResponse[0]?.feeSlabs || [],
        costOfTerm: productData.productLoanFeesResponse[1]?.feeSlabs || [],
        gdbr: productData.productLoanFeesResponse[2]?.feeSlabs || [],
        creditLine: productData.productLoanFeesResponse[3]?.feeSlabs || [],
      });
      setSelectTaxType({
        costOfFinancingType:
          productData.productLoanFeesResponse[0]?.productLoanFees?.feeType,
        costOfTermType:
          productData.productLoanFeesResponse[1]?.productLoanFees?.feeType,
        gdbrType:
          productData.productLoanFeesResponse[2]?.productLoanFees?.feeType,
        creditLineType:
          productData.productLoanFeesResponse[3]?.productLoanFees?.feeType,
      });
      setIsNewData(false);
    } else {
      setLoanFeesData({
        productId,
        costOfFinancingType: 0,
        costOfFinancing: 0,
        costOfTermType: 0,
        costOfTerm: 0,
        gdbrType: 0,
        gdbrValue: 0,
        creditLineType: 0,
        creditLineValue: 0,
      });
      setIsNewData(true);
    }
  }, [productData, productId]);

  const handleSave = async (values) => {
    const payload = {
      productId: productId,
      loanFees: [
        {
          ProductLoanFeeType: 0,
          feeType: values.costOfFinancingType,
          value: values.costOfFinancing,
          feeSlab:
            values.costOfFinancingType === 2
              ? slabsData.costOfFinancing
              : values.costOfFinancingType === 3
              ? percentageData.costOfFinancing
              : [],
        },
        {
          ProductLoanFeeType: 1,
          feeType: values.costOfTermType,
          value: values.costOfTerm,
          feeSlab:
            values.costOfTermType === 2
              ? slabsData.costOfTerm
              : values.costOfTermType === 3
              ? percentageData.costOfTerm
              : [],
        },
        {
          ProductLoanFeeType: 2,
          feeType: values.gdbrType,
          value: values.gdbrValue,
          feeSlab:
            values.gdbrType === 2
              ? slabsData.gdbr
              : values.gdbrType === 3
              ? percentageData.gdbr
              : [],
        },
        {
          ProductLoanFeeType: 3,
          feeType: values.creditLineType,
          value: values.creditLineValue,
          feeSlab:
            values.creditLineType === 2
              ? slabsData.creditLine
              : values.creditLineType === 3
              ? percentageData.creditLine
              : [],
        },
      ],
    };
    try {
      const apiCall = isNewData ? addLoanFees : updateLoanFees;
      const actionText = isNewData ? "Adding" : "Updating";

      const response = await toast.promise(apiCall(payload), {
        loading: `${actionText} Loan Fees...`,
        success: (res) => {
          if (res?.data?.notificationMessage === "Operation successful.") {
            setActiveTab("Taxes");
            return "Loan Fees updated successfully!";
          } else {
            throw new Error(res?.data?.notificationMessage || "Unknown error");
          }
        },
        error: (err) => err?.message || "Something went wrong",
      });

      // After successful add, set the new data as existing data
      if (isNewData && response?.data) {
        setLoanFeesData(response.data);
        setIsNewData(false);
      }
    } catch (error) {
      console.error("Error saving loan fees:", error);
    }
  };

  const handleSavePercentage = (type) => {
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
      setErrorPercentage("Minimum, Maximum, and Percentage must be numbers.");
      return;
    }
    if (
      percentageData[type].length > 0 &&
      editIndex === null &&
      min <= percentageData[type][percentageData[type].length - 1]?.max
    ) {
      setErrorPercentage(
        `Minimum value must be greater than ${
          percentageData[type][percentageData[type].length - 1]?.max
        }`
      );
      return;
    }
    if (max !== "Above" && max <= min) {
      setErrorPercentage("Maximum value must be greater than Minimum value.");
      return;
    }

    setPercentageData((prev) => {
      const updatedSlabs = [...prev[type]];

      if (editIndex !== null) {
        updatedSlabs[editIndex] = { ...newPercentage, min, max, value }; // Update existing slab
      } else {
        updatedSlabs.push({ ...newPercentage, min, max, value }); // Add new slab
      }

      return { ...prev, [type]: updatedSlabs };
    });

    setPercentageModal(false);
    setEditIndex(null); // Reset edit index
  };

  const handleInputChangePercentage = (e) => {
    const { name, value } = e.target;
    setNewPercentage((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChangeSlab = (e) => {
    const { name, value } = e.target;
    setNewSlab((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSlab = (type, index) => {
    setSelectedSlabType(type);
    setNewSlab({ ...slabsData[type][index] });
    setEditIndex(index);
    setShowModal(true);
  };
  const handleDeleteSlab = (type, index) => {
    const updatedSlabs = slabsData[type].filter((_, i) => i !== index);
    setSlabsData((prev) => ({ ...prev, [type]: updatedSlabs }));
  };
  const handleDeletePercentageSlab = (type, index) => {
    const updatedSlabs = percentageData[type].filter((_, i) => i !== index);
    setPercentageData((prev) => ({ ...prev, [type]: updatedSlabs }));
  };
  const handleSaveSlab = (type) => {
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
    if (
      slabsData[type].length > 0 &&
      editIndex === null &&
      min <= slabsData[type][slabsData[type].length - 1]?.max
    ) {
      setError(
        `Minimum value must be greater than ${
          slabsData[type][slabsData[type].length - 1]?.max
        }`
      );
      return;
    }
    if (max !== "Above" && max <= min) {
      setError("Maximum value must be greater than Minimum value.");
      return;
    }

    setSlabsData((prev) => {
      const updatedSlabs = [...prev[type]];

      if (editIndex !== null) {
        updatedSlabs[editIndex] = { ...newSlab, min, max, value }; // Update existing slab
      } else {
        updatedSlabs.push({ ...newSlab, min, max, value }); // Add new slab
      }

      return { ...prev, [type]: updatedSlabs };
    });

    setShowModal(false);
    setEditIndex(null); // Reset edit index
  };

  const handleAddNewPercentage = (type) => {
    setSelectedSlabType(type);
    setPercentageModal(true);
    setNewPercentage({ slabName: "", min: "", max: "", value: "" });
    setErrorPercentage("");
    setEditIndex(null);
  };

  const handleAddNewSlab = (type) => {
    setSelectedSlabType(type);
    setShowModal(true);
    setNewSlab({ slabName: "", min: "", max: "", value: "" });
    setError("");
    setEditIndex(null);
  };

  const handleEditPercentage = (type, index) => {
    setSelectedSlabType(type);
    setNewPercentage({ ...percentageData[type][index] });
    setEditIndex(index);
    setPercentageModal(true);
  };

  const SlabTable = ({ type, data, onEdit, onAdd, onDelete }) => (
    <>
      <table className="w-100">
        <thead style={{ background: "#A0A0A0" }}>
          <tr style={{ color: "#FCFCFC", fontSize: "14px", fontWeight: "600" }}>
            <th style={{ padding: "15px" }}>Slab Name</th>
            <th>Minimum</th>
            <th>Maximum</th>
            <th>{type === "fixed" ? "Fixed Value" : "Percentage"}</th>
            {isEditable && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} style={{ border: "1px solid #E8E8E8" }}>
              <td style={{ padding: "18px" }}>{row.slabName}</td>
              <td>{row.min} SAR</td>
              <td>{row.max} SAR</td>
              <td>{type === "fixed" ? row.value : `${row.value} %`}</td>
              {isEditable && (
                <td>
                  <span className="d-flex gap-2 align-items-center">
                    <span role="button" onClick={() => onEdit(index)}>
                      <img src={edit} alt="Edit" />
                    </span>
                    <span role="button" onClick={() => onDelete(index)}>
                      <img src={Images.deleteIcon} height={20} width={20} />
                    </span>
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 mb-4 d-flex justify-content-end">
        <span
          onClick={onAdd}
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
  );
  return (
    <>
      <Formik
        initialValues={loanFeesData}
        onSubmit={handleSave}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue }) => (
          <FormikForm>
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Cost of Financing</label>
                <Field name="costOfFinancingType">
                  {({ field, form }: any) => (
                    <Select
                      {...field}
                      className="w-100"
                      disabled={!isEditable}
                      onChange={(value) => {
                        form.setFieldValue("costOfFinancingType", value);
                        setSelectTaxType({
                          ...selectTaxType,
                          costOfFinancingType: value,
                        });
                      }}
                      options={feeTypes.map((type) => ({
                        label: type.label,
                        value: type.value,
                      }))}
                    />
                  )}
                </Field>
              </Col>
              <Col md={6}>
                <label className="form-label">
                  Cost of Financing Amount{" "}
                  <span className="text-danger">*</span>
                </label>
                <Field
                  type="number"
                  name="costOfFinancing"
                  className="form-control"
                  disabled={!isEditable}
                  placeholder="Enter Amount"
                />
                <ErrorMessage
                  name="costOfFinancing"
                  component="div"
                  className="text-danger"
                />
              </Col>
            </Row>
            <Row className="mt-3">
              {(selectTaxType["costOfFinancingType"] === 2 ||
                selectTaxType["costOfFinancingType"] === 3) && (
                <Col md={7}>
                  {selectTaxType["costOfFinancingType"] === 2 && (
                    <SlabTable
                      type="fixed"
                      data={slabsData.costOfFinancing}
                      onEdit={(index) =>
                        handleEditSlab("costOfFinancing", index)
                      }
                      onDelete={(index) =>
                        handleDeleteSlab("costOfFinancing", index)
                      }
                      onAdd={() => handleAddNewSlab("costOfFinancing")}
                    />
                  )}

                  {selectTaxType["costOfFinancingType"] === 3 && (
                    <SlabTable
                      type="percentage"
                      data={percentageData.costOfFinancing}
                      onEdit={(index) =>
                        handleEditPercentage("costOfFinancing", index)
                      }
                      onDelete={(index) =>
                        handleDeletePercentageSlab("costOfFinancing", index)
                      }
                      onAdd={() => handleAddNewPercentage("costOfFinancing")}
                    />
                  )}
                </Col>
              )}
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Cost of Term</label>
                <Field name="costOfTermType">
                  {({ field, form }: any) => (
                    <Select
                      {...field}
                      className="w-100"
                      disabled={!isEditable}
                      onChange={(value) => {
                        form.setFieldValue("costOfTermType", value);
                        setSelectTaxType({
                          ...selectTaxType,
                          costOfTermType: value,
                        });
                      }}
                      options={feeTypes.map((type) => ({
                        label: type.label,
                        value: type.value,
                      }))}
                    />
                  )}
                </Field>
              </Col>
              <Col md={6}>
                <label className="form-label">
                  Cost of Term Amount <span className="text-danger">*</span>
                </label>
                <Field
                  type="number"
                  name="costOfTerm"
                  className="form-control"
                  disabled={!isEditable}
                  placeholder="Enter Amount"
                />
                <ErrorMessage
                  name="costOfTerm"
                  component="div"
                  className="text-danger"
                />
              </Col>
            </Row>
            <Row className="mt-3">
              {(selectTaxType["costOfTermType"] === 2 ||
                selectTaxType["costOfTermType"] === 3) && (
                <Col md={7}>
                  {selectTaxType["costOfTermType"] === 2 && (
                    <SlabTable
                      type="fixed"
                      data={slabsData.costOfTerm}
                      onEdit={(index) => handleEditSlab("costOfTerm", index)}
                      onDelete={(index) =>
                        handleDeleteSlab("costOfTerm", index)
                      }
                      onAdd={() => handleAddNewSlab("costOfTerm")}
                    />
                  )}

                  {selectTaxType["costOfTermType"] === 3 && (
                    <SlabTable
                      type="percentage"
                      data={percentageData.costOfTerm}
                      onEdit={(index) =>
                        handleEditPercentage("costOfTerm", index)
                      }
                      onDelete={(index) =>
                        handleDeletePercentageSlab("costOfTerm", index)
                      }
                      onAdd={() => handleAddNewPercentage("costOfTerm")}
                    />
                  )}
                </Col>
              )}
            </Row>
            <h3 className="mb-4">GDBR Configuration</h3>
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">GDBR Type</label>
                <Field name="gdbrType">
                  {({ field, form }: any) => (
                    <Select
                      {...field}
                      className="w-100"
                      disabled={!isEditable}
                      onChange={(value) => {
                        form.setFieldValue("gdbrType", value);
                        setSelectTaxType({
                          ...selectTaxType,
                          gdbrType: value,
                        });
                      }}
                      options={feeTypes.map((type) => ({
                        label: type.label,
                        value: type.value,
                      }))}
                    />
                  )}
                </Field>
              </Col>
              <Col md={6}>
                <label className="form-label">GDBR Value</label>
                <Field
                  type="number"
                  name="gdbrValue"
                  className="form-control"
                  disabled={!isEditable}
                  placeholder="Enter Value"
                />
                <ErrorMessage
                  name="gdbrValue"
                  component="div"
                  className="text-danger"
                />
              </Col>
            </Row>
            <Row className="mt-3">
              {(selectTaxType["gdbrType"] === 2 ||
                selectTaxType["gdbrType"] === 3) && (
                <Col md={7}>
                  {selectTaxType["gdbrType"] === 2 && (
                    <SlabTable
                      type="fixed"
                      data={slabsData.gdbr}
                      onEdit={(index) => handleEditSlab("gdbr", index)}
                      onDelete={(index) => handleDeleteSlab("gdbr", index)}
                      onAdd={() => handleAddNewSlab("gdbr")}
                    />
                  )}

                  {selectTaxType["gdbrType"] === 3 && (
                    <SlabTable
                      type="percentage"
                      data={percentageData.gdbr}
                      onEdit={(index) => handleEditPercentage("gdbr", index)}
                      onDelete={(index) =>
                        handleDeletePercentageSlab("gdbr", index)
                      }
                      onAdd={() => handleAddNewPercentage("gdbr")}
                    />
                  )}
                </Col>
              )}
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Credit Line Type</label>
                <Field name="creditLineType">
                  {({ field, form }: any) => (
                    <Select
                      {...field}
                      className="w-100"
                      disabled={!isEditable}
                      onChange={(value) => {
                        form.setFieldValue("creditLineType", value);
                        setSelectTaxType({
                          ...selectTaxType,
                          creditLineType: value,
                        });
                      }}
                      options={feeTypes.map((type) => ({
                        label: type.label,
                        value: type.value,
                      }))}
                    />
                  )}
                </Field>
              </Col>
              <Col md={6}>
                <label className="form-label">Credit Line Value</label>
                <Field
                  type="number"
                  name="creditLineValue"
                  className="form-control"
                  disabled={!isEditable}
                  placeholder="Enter Value"
                />
                <ErrorMessage
                  name="creditLineValue"
                  component="div"
                  className="text-danger"
                />
              </Col>
            </Row>
            <Row className="mt-3">
              {(selectTaxType["creditLineType"] === 2 ||
                selectTaxType["creditLineType"] === 3) && (
                <Col md={7}>
                  {selectTaxType["creditLineType"] === 2 && (
                    <SlabTable
                      type="fixed"
                      data={slabsData.creditLine}
                      onEdit={(index) => handleEditSlab("creditLine", index)}
                      onDelete={(index) =>
                        handleDeleteSlab("creditLine", index)
                      }
                      onAdd={() => handleAddNewSlab("creditLine")}
                    />
                  )}

                  {selectTaxType["creditLineType"] === 3 && (
                    <SlabTable
                      type="percentage"
                      data={percentageData.creditLine}
                      onEdit={(index) =>
                        handleEditPercentage("creditLine", index)
                      }
                      onDelete={(index) =>
                        handleDeletePercentageSlab("creditLine", index)
                      }
                      onAdd={() => handleAddNewPercentage("creditLine")}
                    />
                  )}
                </Col>
              )}
            </Row>

            {isEditable && (
              <div className="d-flex justify-content-end mt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="theme-btn-update"
                >
                  {isNewData ? "Add" : "Update"}
                </Button>
              </div>
            )}
          </FormikForm>
        )}
      </Formik>
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
        <Modal.Body>
          <div className="px-4 mt-2 mb-4">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Slab Name:
                  </Form.Label>
                  <Form.Control
                    name="slabName"
                    type="text"
                    value={newSlab?.slabName}
                    onChange={handleInputChangeSlab}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Minimum:
                  </Form.Label>
                  <Form.Control
                    name="min"
                    type="number"
                    value={newSlab?.min}
                    onChange={handleInputChangeSlab}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Maximum:
                  </Form.Label>
                  <Form.Control
                    name="max"
                    type="number"
                    value={newSlab?.max}
                    onChange={handleInputChangeSlab}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Fixed value:
                  </Form.Label>
                  <Form.Control
                    name="value"
                    type="number"
                    value={newSlab?.value}
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
                  handleSaveSlab(selectedSlabType);
                }}
                style={{
                  backgroundColor: "#EB0D0D",
                  borderRadius: "2px",
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
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
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
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
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
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
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
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
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
                  handleSavePercentage(selectedSlabType);
                }}
                style={{
                  //backgroundColor: "#EB0D0D",
                  borderRadius: "2px",
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
    </>
  );
};

export default SettingsLoanFees;
