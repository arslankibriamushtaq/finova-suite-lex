import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import Business from "./SupplierInfoTabs/Business";
import KYC from "./SupplierInfoTabs/KYC";
import Compliclear from "./SupplierInfoTabs/Compliclear";

const SupplierInfoTabs = () => {
  const [selectTab, setSelectedTab] = useState<string>("Business");

  const tabOptions = [
    {
      title: "Business",
      key: "Business",
      component: <Business />,
    },
    {
      title: "KYC",
      key: "KYC",
      component: <KYC />,
    },
    {
      title: "Compliclear",
      key: "Compliclear",
      component: <Compliclear />,
    },
  ];

  return (
    <div>
      <Tabs
        id="supplier-info-tabs"
        className="mb-3"
        activeKey={selectTab}
        onSelect={(tab: any) => {
          setSelectedTab(tab);
        }}
      >
        {tabOptions.map((item: any) => (
          <Tab key={item.key} eventKey={item.key} title={item.title}>
            {selectTab === item.key && item.component}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default SupplierInfoTabs;

