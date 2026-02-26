import React, { useState } from "react";

import { Tab, Tabs } from "react-bootstrap";

import PartnerFactoringApproval from "./PartnerFactoringApproval";
import ManagerPartnerTabs from "./ManagerPartnerTabs";
import PartnerFinancingInfo from "./PartnerFinancingInfo";
import PartnerSalaryInfo from "./PartnerSalaryInfo";
import PartnerDisclaimerInfo from "./PartnerDislcaimerInfo";
import PromissoryNoteInfo from "./PromissoryNoteInfo";

function PendingTabs({ setActiveTab }: any) {
  const [active, setActive] = useState("ManagerPartnerTabs");
  const tabOptions = [
    {
      title: "Manager Information",
      key: "ManagerPartnerTabs",
      component: <ManagerPartnerTabs setActiveTab={setActiveTab} />,
    },
    {
      title: "Financing Information",
      key: "FinancingInformation",
      component: <PartnerFinancingInfo setActiveTab={setActiveTab} />,
    },
    {
      title: "Salary Information",
      key: "SalaryInformation",
      component: <PartnerSalaryInfo setActiveTab={setActiveTab} />,
    },
    {
      title: "Disclaimer",
      key: "Disclaimer",
      component: <PartnerDisclaimerInfo setActiveTab={setActiveTab} />,
    },
    {
      title: "E-Promissory Note",
      key: "E-PromissoryNote",
      component: <PromissoryNoteInfo setActiveTab={setActiveTab} />,
    },
  ];
  return (
    <div className="product-tabs-container p-3 product-settings-tabs mt-5">
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

export default PendingTabs;
