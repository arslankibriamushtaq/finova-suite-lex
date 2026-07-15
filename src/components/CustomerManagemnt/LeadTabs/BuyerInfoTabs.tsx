import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tab, Tabs } from "react-bootstrap";
import Business from "./BuyerInfoTabs/Business";
import KYC from "./BuyerInfoTabs/KYC";
import Compliclear from "./BuyerInfoTabs/Compliclear";

const BuyerInfoTabs = () => {
  const { t } = useTranslation("customerManagement");
  const [selectTab, setSelectedTab] = useState<string>("Business");

  const tabOptions = [
    {
      title: t("buyerInfo.tab.business"),
      key: "Business",
      component: <Business />,
    },
    {
      title: t("buyerInfo.tab.kyc"),
      key: "KYC",
      component: <KYC />,
    },
    {
      title: t("buyerInfo.tab.compliclear"),
      key: "Compliclear",
      component: <Compliclear />,
    },
  ];

  return (
    <div>
      <Tabs
        id="buyer-info-tabs"
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

export default BuyerInfoTabs;

