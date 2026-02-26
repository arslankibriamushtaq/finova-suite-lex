import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

import AddProduct from "../ProductManagement/addProduct";
import CommodityInfo from "../ProductManagement/commodityInformation";
import Settings from "../ProductManagement/settings";
import PartnerAffiliation from "../ProductManagement/partnerAffiliation";
import RequiredDoc from "../ProductManagement/requiredDoc";

const PartnerManagementTabs = () => {
  localStorage.setItem("tabs", "BasicInformation");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState<any>(getTabs);

  const tapOptions = [
    {
      title: "Basic Information ",
      key: "BasicInformation",
      folder: <AddProduct setSelectedTab={setSelectedTab} />,
    },
    // {
    //   title: "Commodity Info ",
    //   key: "CommodityInfo",
    //   folder: <CommodityInfo setSelectedTab={setSelectedTab} />,
    // },
    {
      title: "Settings",
      key: "Settings",
      folder: <Settings setActiveTab={setSelectedTab} />,
    },
    // {
    //   title: "Partner Affiliation",
    //   key: "PartnerAffiliation",
    //   folder: <PartnerAffiliation setSelectedTab={setSelectedTab} />,
    // },
    {
      title: "Required Doc",
      key: "RequiredDoc",
      folder: <RequiredDoc setSelectedTab={setSelectedTab} />,
    },
  ];
  return (
    <>
      <Tabs
        id="controlled-tab-example"
        className="mt-30 mb-4 position-relative tabs-overflow"
        activeKey={selectTab}
        style={{ display: "flex", flexWrap: "nowrap" }}
        onSelect={(tab: any) => {
          setSelectedTab(tab);
        }}
      >
        {tapOptions.map((item: any) => (
          <Tab eventKey={item.key} title={item.title}>
            {selectTab === item.key && item.folder}
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default PartnerManagementTabs;
