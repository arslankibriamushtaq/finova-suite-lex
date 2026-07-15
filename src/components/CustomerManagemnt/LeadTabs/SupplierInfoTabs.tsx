import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Business from "./SupplierInfoTabs/Business";
import KYC from "./SupplierInfoTabs/KYC";
import Compliclear from "./SupplierInfoTabs/Compliclear";

const SupplierInfoTabs = () => {
  const { t } = useTranslation("customerManagement");
  const [selectTab, setSelectedTab] = useState<string>("Business");

  const tabOptions = [
    {
      title: t("leadTabs.supplierInfo.tab.business"),
      key: "Business",
      component: <Business />,
    },
    {
      title: t("leadTabs.supplierInfo.tab.kyc"),
      key: "KYC",
      component: <KYC />,
    },
    {
      title: t("leadTabs.supplierInfo.tab.compliclear"),
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

