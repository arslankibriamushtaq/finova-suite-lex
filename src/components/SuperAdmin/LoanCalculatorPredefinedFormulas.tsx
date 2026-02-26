import React from "react";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

function LoanCalculatorPredefinedFormulas() {
  const [showModal, setShowModal] = useState(false);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [formula, setFormula] = useState<string>("");
  const [formulaExpression, setFormulaExpression] = useState<string>("");


  const availableParameters = [
    "Balloon Amount",
    "Monthly Payment",
    "Tenure",
    "Admin Fee",
    "Finance Charge rate",
    "Terms",
  ];

  const toggleParameter = (param: string) => {
    setSelectedParameters((prev) => {
      if (prev.includes(param)) {
        // Remove the parameter
        setFormulaExpression((exp) => exp.replace(new RegExp(`\\s*${param}\\s*`, "g"), " ").trim());
        return prev.filter((p) => p !== param);
      } else {
        // Add the parameter
        setFormulaExpression((exp) => (exp ? exp + "  " + param : param));
        return [...prev, param];
      }
    });
  };

  // Handle Calculator Button Clicks (Append Operations & Numbers)
  const handleCalculatorClick = (value: string) => {
    setFormulaExpression((prev) => prev + " " + value + " ");
  };


  // Handle Clearing Formula
  const clearFormula = () => {
    setFormulaExpression("");
    setSelectedParameters([]);
  };

  return (
    <div className="flex p-4 border shadow-sm" style={{ minHeight: 600 }}>
      <h4 className="section-title">Parameters</h4>
      <div className="col-md-12 d-flex" style={{ minHeight: 500 }}>
        <div className="col-md-6 predefined-parameters">
          <h5 className="py-2">Predefined Formulas</h5>
          <input
            className="form-control mb-2"
            placeholder="Loan Amount Calculation"
            disabled>
          </input>
          <input
            className="form-control mb-2"
            placeholder="Monthly Payment Calculation (Without Balloon Payment)"
            disabled>
          </input>
          <input
            className="form-control mb-2"
            placeholder="Monthly Payment Calculation (With Balloon Payment)"
            disabled>
          </input>
        </div>
        <div className="col-md-6 custom-parameters">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="py-2">Define Custom Formula</h5>
            <button className="new-parameter-btn" onClick={() => setShowModal(true)}>Make Formula</button>
          </div>
          <div className="custom-parameter-box mt-4">
            {formulaExpression.length > 0 ? (
              <p>{formulaExpression}</p>
            ) : (
              <p className="text-muted">No Formula Added</p>
            )}
          </div>

        </div>
      </div>
      <div className="d-flex justify-content-end mt-4">
        <button className="next-button">Next</button>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18 }}>Make Custom Formula</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Available Parameters */}
          <div className="selected-parameters">
            {availableParameters.map((param, index) => (
              <span
                key={index}
                className={`parameter-badge ${selectedParameters.includes(param) ? "selected" : ""}`}
                onClick={() => toggleParameter(param)}
              >
                {param} {selectedParameters.includes(param) && (
                  <FaTimes className="close-icon" />
                )}
              </span>
            ))}
          </div>
          <div className="divider"></div>
          <div className="col-md-12 d-flex">
            {/* Formula Input Section */}
            <div className="col-md-7 formula-section border p-4" style={{ borderRadius: "7px" }}>
              <div className="col-12 d-flex">
                <h5 className="col-6" style={{ fontWeight: "bold", fontSize: 16 }}>Your Formula</h5>
                <div className="col-6 d-flex justify-content-end">
                  <button className="clear-btn " style={{ fontSize: 12 }} onClick={clearFormula}>Clear</button>
                </div>

              </div>

              <div className="mt-4">
                <label className="mb-1" style={{ fontSize: "14px", fontWeight: "normal" }}>Formula Name</label>
                <input type="text" className="form-control" placeholder="Monthly Payment Calculation (Without Balloon Payment)" readOnly />
                <div className="formula-expression-box">
                  <p>{formulaExpression || ""}</p>
                </div>
              </div>
            </div>

            {/* Calculator Section */}
            <div className=" col-md-5 calculator-section border p-4" style={{ borderRadius: "7px" }}>
              <div className="calculator-grid ">
                {["7", "8", "9", "/", "(", "4", "5", "6", "*", ")", "1", "2", "3", "-", "=", "0", "00", ".", "+"].map((btn, index) => (
                  <button key={index} className="calc-btn py-3 px-4" onClick={() => handleCalculatorClick(btn)}>
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <Button variant="danger" className="save-formula-btn mt-4" onClick={() => setShowModal(false)}>
              Save Formula
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LoanCalculatorPredefinedFormulas;
