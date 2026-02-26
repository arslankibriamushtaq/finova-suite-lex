import React, { useState } from "react";

import { Tab, Tabs } from "react-bootstrap";
import PartnerFactoringInformation from "./PartnerFactoringInformation";
import PartnerFactoringApproval from "./PartnerFactoringApproval";

function PartnerFactoringTab({ setActiveTab }: any) {
  const [active, setActive] = useState("FactoringInformation");
  const tabOptions = [
    {
      title: "Factoring Information",
      key: "FactoringInformation",
      component: <PartnerFactoringInformation setActiveTab={setActiveTab} />,
    },
    {
      title: "Factoring Approval",
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
