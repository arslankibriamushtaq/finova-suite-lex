import { Select } from "antd";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import * as Yup from "yup";
const terms = [
  { label: "12 Months", value: 0 },
  { label: "36 Months", value: 1 },
];

const LoanCalculatorPreviewandTest = ({
  setFormulaExpression,
  formulaExpression,
}: any) => {
  const [result, setResult] = useState(0);
  const extractNames = formulaExpression.match(/\b[A-Za-z_]\w*\b/g) || [];
  const formulaParts = extractNames;
  const handleCalculate = (values, formulaExpression) => {

    let resultExpression = formulaExpression;

    // ✅ Extract valid parameter names only (no numbers, no symbols)
    const formulaParts = formulaExpression.match(/\b[A-Za-z_]\w*\b/g) || [];


    // Replace only valid parameter names from 'values'
    formulaParts.forEach((part) => {
      if (values.hasOwnProperty(part)) {
        const regex = new RegExp(`\\b${part}\\b`, "g");
        resultExpression = resultExpression.replace(
          regex,
          values[part].toString()
        );
      }
    });

    try {
      // ✅ Safely evaluate the final expression
      const result = Function(`"use strict"; return (${resultExpression})`)();
      setResult(result);
      return result;
    } catch (error) {
      console.error("❌ Error evaluating formula:", error);
      return null;
    }
  };


  return (
    <div className="tab-conent-container">
      <h5 className="fs-6 fw-600 mb-0">
        Monthly Payment Calculation (With {formulaParts})
      </h5>
      <div className="mt-4 flex-grow-1">
        <Formik
          initialValues={{}}
          // validationSchema={Yup.object({
          //   loanAmount: Yup.number().required("This feild is required"),
          //   financeChargeRate: Yup.number().required("This feild is required"),
          //   selectTerms: Yup.number().required("This feild is required"),
          // })}
          onSubmit={(values) => {
            handleCalculate(values, formulaExpression);
          }}
        >
          {({ handleSubmit }) => (
            <Form>
              <div className="row">
                {formulaParts.map((name, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <label className="fs-14 fw-normal mb-2">Enter {name}</label>
                    <Field
                      type="number"
                      name={name}
                      className="form-control"
                      placeholder={`Enter ${name}`}
                    />
                    <ErrorMessage
                      name={name}
                      component="div"
                      className="text-danger mt-1 fs-12"
                    />
                  </div>
                ))}
              </div>

              <button type="submit" className="theme-btn-next">
                Calculate
              </button>

              {/* <p>{resultExpression}</p> */}
            </Form>
          )}
        </Formik>
        <p className="mt-3">{result}</p>
      </div>
      <div className="d-flex justify-content-end pt-4">
        <button type="button" className="theme-btn-next">
          Next
        </button>
      </div>
    </div>
  );
};

export default LoanCalculatorPreviewandTest;
