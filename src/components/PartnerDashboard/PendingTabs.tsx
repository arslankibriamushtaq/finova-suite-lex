import React, { useState } from "react";

import { Tab, Tabs } from "react-bootstrap";

import PartnerFactoringApproval from "./PartnerFactoringApproval";
import ManagerPartnerTabs from "./ManagerPartnerTabs";
import PartnerFinancingInfo from "./PartnerFinancingInfo";
import PartnerSalaryInfo from "./PartnerSalaryInfo";
import PartnerDisclaimerInfo from "./PartnerDislcaimerInfo";
import PromissoryNoteInfo from "./PromissoryNoteInfo";
import { useTranslation } from "react-i18next";

function PendingTabs({ setActiveTab }: any) {
  const { t } = useTranslation("partner");
  const [active, setActive] = useState("ManagerPartnerTabs");
  const tabOptions = [
    {
      title: t("pendingTabs.managerInformation"),
      key: "ManagerPartnerTabs",
      component: <ManagerPartnerTabs setActiveTab={setActiveTab} />,
    },
    {
      title: t("pendingTabs.financingInformation"),
      key: "FinancingInformation",
      component: <PartnerFinancingInfo setActiveTab={setActiveTab} />,
    },
    {
      title: t("pendingTabs.salaryInformation"),
      key: "SalaryInformation",
      component: <PartnerSalaryInfo setActiveTab={setActiveTab} />,
    },
    {
      title: t("pendingTabs.disclaimer"),
      key: "Disclaimer",
      component: <PartnerDisclaimerInfo setActiveTab={setActiveTab} />,
    },
    {
      title: t("pendingTabs.epromissoryNote"),
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
