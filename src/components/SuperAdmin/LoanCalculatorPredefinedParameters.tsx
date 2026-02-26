import React, { useEffect, useState } from "react";
import { Badge, Col, Row } from "react-bootstrap";
import LoanCalculatorCustomFormula from "./LoanCalculatorCustomFormula";
import { use } from "echarts";
import toast from "react-hot-toast";
import { GetFormulasByProductId } from "../../redux/apis/apisTenantCrud";

// Predefined Parameters
const predefinedParameters = [
  "Balloon Amount",
  "Loan",
  "Tenure",
  "Profit",
  "Admin Fee",
  "Terms",
];

// Predefined Formulas
const predefinedFormulas = [
  "Total Payable",
  "EMI Calculation",
  "Total Fees",
  "Total Cost of Credit",
  "Combined Risk Score",
  "Profit Calculation (Total Profit)",
  "Early Settlement Amount",
];

const CustomFormula = [
  "Total Payable (Version 1.0)",
  "Total Payable (Version 1.1)",
];
function LoanCalculatorPredefinedParameters({
  setFormulaExpression,
  formulaExpression,
  setActiveTab,
  ProductId
}) {
  const [showCustomFormula, setShowCustomFormula] = useState(false);
  const [predefinedFormulas, setPredefinedFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
  getAllFormulas()
  }, [])
  const getAllFormulas = async () => {
    setLoading(true);
    try {
      await toast.promise(
        GetFormulasByProductId(ProductId), // API Call
        {
          loading: "Fetching formulas...",
          success: (res) => {
            if (res?.data?.success) {
              const data = res.data.data;
              setPredefinedFormulas(data);
              return "Formulas fetched successfully!";
            } else {
              throw new Error(
                res?.data?.notificationMessage || "Failed to fetch formulas."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while fetching formulas.",
        }
      );
    } catch (error: any) {
      console.error("Error fetching formulas:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {!showCustomFormula ? (
        <div className="flex p-4 border shadow-sm">
          <div className="d-flex justify-content-between align-items-center  mb-4">
            <h4 className="fs-20 fw-600">Microfinance</h4>
            <button
              onClick={() => setShowCustomFormula(true)}
              type="button"
              className="theme-btn-next"
            >
              Make New Formula
            </button>
          </div>

          <div className="predefined-parameters">
            {/* Predefined Parameters */}
            <Row className="mb-5">
              <Col>
                <h4 className="fs-20 fw-600 mb-3">Predefined Parameters</h4>
                <div className="d-flex flex-wrap gap-2">
                  {predefinedParameters.map((param, index) => (
                    <Badge
                      key={index}
                      className="custom-badge fs-12 fw-normal rounded-pill"
                    >
                      {param}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>

            {/* Predefined Formulas */}
            <Row>
              <Col>
                <h4 className="fs-20 fw-600 mb-3">Predefined Formulas</h4>
                <div className="d-flex flex-wrap gap-2">
                  {
                  loading ? 'Loading...' :
                  predefinedFormulas.length > 0 ?
                  predefinedFormulas.map((param, index) => (
                    <Badge
                      key={index}
                      className="custom-badge fs-12 fw-normal rounded-pill"
                    >
                      {param?.formulaName}
                    </Badge>
                  ))
                :
                'No Formula Found'
                }
                </div>
              </Col>
            </Row>
          </div>
          {/* <div className="predefined-parameters mt-4">
            <Row className="mb-3">
              <Col>
                <h4 className="fs-20 fw-600 mb-3">Custom Formula</h4>
                <div className="d-flex flex-wrap gap-2">
                  {CustomFormula.map((param, index) => (
                    <Badge
                      key={index}
                      className="custom-badge fs-12 fw-normal rounded-pill"
                    >
                      {param}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>
          </div> */}
          {/* Next Button */}
          <div className="d-flex justify-content-end mt-4">
            <button className="theme-btn-next">Next</button>
          </div>
        </div>
      ) : (
        <LoanCalculatorCustomFormula
          setFormulaExpression={setFormulaExpression}
          formulaExpression={formulaExpression}
        />
      )}
    </>
  );
}

export default LoanCalculatorPredefinedParameters;
