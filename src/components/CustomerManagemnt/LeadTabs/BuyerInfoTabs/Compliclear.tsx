import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

function Compliclear() {
  const [selectTab, setSelectedTab] = useState<string>("GetClientRiskScore");

  const tabOptions = [
    {
      title: "Get Client Risk Score",
      key: "GetClientRiskScore",
    },
    {
      title: "Approve Buyer Compliclear",
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
              <div style={{ padding: "20px", color: "#666", fontSize: "14px" }}>
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