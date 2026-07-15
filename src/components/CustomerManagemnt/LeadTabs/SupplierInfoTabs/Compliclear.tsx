import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function Compliclear() {
  const { t } = useTranslation("customerManagement");
  const [selectTab, setSelectedTab] = useState<string>("SearchIndividual");

  const tabOptions = [
    {
      title: t("leadTabs.supplierCompliclear.tab.searchIndividual"),
      key: "SearchIndividual",
    },
    {
      title: t("leadTabs.supplierCompliclear.tab.searchEntity"),
      key: "SearchEntity",
    },
    {
      title: t("leadTabs.supplierCompliclear.tab.getClientRiskScore"),
      key: "GetClientRiskScore",
    },
    {
      title: t("leadTabs.supplierCompliclear.tab.approveSupplierCompliclear"),
      key: "ApproveSupplierCompliclear",
    },
  ];

  return (
    <div>
      <Tabs
        id="supplier-compliclear-tabs"
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
                {t("leadTabs.supplierCompliclear.noRecordFound")}
              </div>
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default Compliclear;

