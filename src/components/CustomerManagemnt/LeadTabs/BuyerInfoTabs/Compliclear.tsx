import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function Compliclear() {
  const { t } = useTranslation("customerManagement");
  const [selectTab, setSelectedTab] = useState<string>("GetClientRiskScore");

  const tabOptions = [
    {
      title: t("leadTabs.buyerCompliclear.tab.getClientRiskScore"),
      key: "GetClientRiskScore",
    },
    {
      title: t("leadTabs.buyerCompliclear.tab.approveBuyerCompliclear"),
      key: "ApproveBuyerCompliclear",
    },
  ];

  return (
    <div>
      <Tabs
        id="compliclear-tabs"
        className="mb-3"
        activeKey={selectTab}
        onSelect={(tab: any) => {
          setSelectedTab(tab);
        }}
      >
        {tabOptions.map((item: any) => (
          <Tab key={item.key} eventKey={item.key} title={item.title}>
            {selectTab === item.key && (
              <div style={{ padding: "20px", color: "var(--color-text-muted)", fontSize: "14px" }}>
                {t("leadTabs.buyerCompliclear.noRecordFound")}
              </div>
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default Compliclear;