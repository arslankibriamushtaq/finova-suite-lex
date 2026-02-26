import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

const Business = () => {
  const [selectTab, setSelectedTab] = useState<string>("BusinessVerification");

  const tabOptions = [
    {
      title: "Business Verification",
      key: "BusinessVerification",
    },
    {
      title: "Upload Business Documents",
      key: "UploadBusinessDocuments",
    },
    {
      title: "Company Address",
      key: "CompanyAddress",
    },
    {
      title: "Approve Buyer Business",
      key: "ApproveBuyerBusiness",
    },
  ];

  return (
    <div>
      <Tabs
        id="business-tabs"
        className="mb-3"
        activeKey={selectTab}
        onSelect={(tab: any) => {
          setSelectedTab(tab);
        }}
      >
        {tabOptions.map((item: any) => (
          <Tab key={item.key} eventKey={item.key} title={item.title}>
            {selectTab === item.key && (
              <div style={{ padding: "20px" }}>
                <h5>{item.title}</h5>
                <p>Content for {item.title} coming soon...</p>
              </div>
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default Business;