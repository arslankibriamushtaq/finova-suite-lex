import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DynamicBreadcrumb from "./SuperAdminBreadCrumb";
import LoanCalculatorSelectProduct from "./LoanCalculatorSelectProduct";
import LoanCalculatorPredefinedParameters from "./LoanCalculatorPredefinedParameters";
// import LoanCalculatorPredefinedFormulas from "./LoanCalculatorPredefinedFormulas";
import LoanCalculatorPreviewandTest from "./LoanCalculatorPreviewandTest";
function LoanCalculator() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Select Product");
  const [ProductId, setProductId] = useState("");
  const [formulaExpression, setFormulaExpression] = useState("");
  const handleSelect = (key: string | null) => {
    setActiveTab(key);
  };

  const tabOptions = [
    {
      title: "Select Product",
      key: "Select Product",
      component: <LoanCalculatorSelectProduct 
      setProductId={setProductId}
      setActiveTab={setActiveTab}
      ProductId={ProductId}
      />,
    },
    {
      title: "Predefined Parameters & Formulas",
      key: "Predefined Parameters & Formulas",
      component: (
        <LoanCalculatorPredefinedParameters
          setFormulaExpression={setFormulaExpression}
          formulaExpression={formulaExpression}
          setActiveTab={setActiveTab}
          ProductId={ProductId}
        />
      ),
    },
    {
      title: "Preview & Test",
      key: "Preview & Test",
      component: (
        <LoanCalculatorPreviewandTest
          setFormulaExpression={setFormulaExpression}
          formulaExpression={formulaExpression}
        />
      ),
    },
  ];
  return (
    <div className={`product-tabs-container product-management-container p-2`}>
      <DynamicBreadcrumb className="col-6 mb-4" />
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          onClick={() => navigate("/superadmin")}
          className="p-2 d-flex justify-content-center align-items-center border-0"
          style={{
            background: "#F0F0F0",
            color: "#EB0D0D",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          <i className="fas fa-arrow-left me-1"></i>
          Back
        </button>
        <h3 className="mb-0">Loan Calculator</h3>
      </div>

      <Tabs activeKey={activeTab} className="border-0" onSelect={handleSelect}>
        {tabOptions.map((tab) => (
          <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
            {activeTab === tab.key && tab.component}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default LoanCalculator;
