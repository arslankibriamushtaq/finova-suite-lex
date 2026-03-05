import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

function Compliclear() {
  const [selectTab, setSelectedTab] = useState<string>("SearchIndividual");

  const tabOptions = [
    {
      title: "Search Individual",
      key: "SearchIndividual",
    },
    {
      title: "Search Entity",
      key: "SearchEntity",
    },
    {
      title: "Get Client Risk Score",
      key: "GetClientRiskScore",
    },
    {
      title: "Approve Supplier Compliclear",
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
                No record found
              </div>
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default Compliclear;

