import React, { useState } from "react";

import { Tab, Tabs } from "react-bootstrap";
import PartnerFactoringInformation from "./PartnerFactoringInformation";
import PartnerFactoringApproval from "./PartnerFactoringApproval";
import { useTranslation } from "react-i18next";

function PartnerFactoringTab({ setActiveTab }: any) {
  const { t } = useTranslation("partner");
  const [active, setActive] = useState("FactoringInformation");
  const tabOptions = [
    {
      title: t("factoringTab.factoringInformation"),
      key: "FactoringInformation",
      component: <PartnerFactoringInformation setActiveTab={setActiveTab} />,
    },
    {
      title: t("factoringTab.factoringApproval"),
      key: "Factoring Approval",
      component: <PartnerFactoringApproval setActiveTab={setActiveTab} />,
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

export default PartnerFactoringTab;
