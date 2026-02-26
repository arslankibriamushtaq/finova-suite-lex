import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import SettingsApplicationSteps from "./SettingsApplicationSteps";
import SettingsTermsConditions from "./SettingsTermsConditions";
import SettingsApplicationFee from "./SettingsApplicationFee";
import SettingsLoanFees from "./SettingsLoanFees";
import SettingTaxes from "./SettingTaxes";

function ProductSettings({
  productId,
  productData,
  handleNext,
  isEditable,
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState("Application Steps");


  const tabOptions = [
    {
      title: "Application Steps",
      key: "Application Steps",
      component: (
        <SettingsApplicationSteps
          setActiveTab={setActiveTab}
          productId={productId}
          productData={productData}
          isEditable={isEditable}
        />
      ),
    },
    {
      title: "Terms & Conditions",
      key: "Terms & Conditions",
      component: (
        <SettingsTermsConditions
          setActiveTab={setActiveTab}
          productId={productId}
          productData={productData}
          isEditable={isEditable}
          onSuccess={onSuccess}
        />
      ),
    },
    {
      title: "Application Fees",
      key: "Application Fees",
      component: (
        <SettingsApplicationFee
          setActiveTab={setActiveTab}
          productId={productId}
          productData={productData}
          isEditable={isEditable}
        />
      ),
    },
    {
      title: "Loan Fees",
      key: "Loan Fees",
      component: (
        <SettingsLoanFees
          setActiveTab={setActiveTab}
          productId={productId}
          productData={productData}
          isEditable={isEditable}
        />
      ),
    },
    {
      title: "Taxes",
      key: "Taxes",
      component: (
        <SettingTaxes
          productId={productId}
          productData={productData}
          onSuccess={handleNext}
          isEditable={isEditable}
        />
      ),
    },
  ];
  return (
    <>
      <h5 className="pb-3 pt-2 border-top mb-0"></h5>
      <div className="product-tabs-container product-settings-tabs">
        <Tabs
          activeKey={activeTab}
          className="d-flex gap-1"
          style={{ width: "max-content" }}
          onSelect={(tab) => {
            setActiveTab(tab);
          }}
        >
          {tabOptions.map((tab) => (
            <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
              {activeTab === tab.key && tab.component}
            </Tab>
          ))}
        </Tabs>
      </div>
    </>
  );
}

export default ProductSettings;
