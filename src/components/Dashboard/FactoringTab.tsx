import React, { useState } from "react";
import FactoringInformation from "./FactoringInformation";
import { Tab, Tabs } from "react-bootstrap";
import FactoringApproval from "./FactoringApproval";
import { useTranslation } from "react-i18next";

function FactoringTab({ setActiveTab }: any) {
  const { t } = useTranslation("dashboard");
  const [active, setActive] = useState("FinancingInformation");
  const tabOptions = [
    {
      title: t("factoringTab.tab.financingInfo"),
      key: "FinancingInformation",
      component: <FactoringInformation setActiveTab={setActiveTab} />,
    },
    {
      title: t("factoringTab.tab.financingApproval"),
      key: "FinancingApproval",
      component: <FactoringApproval setActiveTab={setActiveTab} />,
    },
  ];
  return (
    <div className="product-tabs-container product-settings-tabs">
      <Tabs
        activeKey={active}
        className="d-flex gap-1"
        style={{ width: "max-content" }}
        onSelect={(tab: any) => {
          setActive(tab);
        }}
      >
        {tabOptions.map((tab) => (
          <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
            {active === tab.key && tab.component}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default FactoringTab;
