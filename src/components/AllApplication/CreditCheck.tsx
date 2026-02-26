import React, { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import CreditInfo from "./CreditInfo";

const CreditCheck = () => {
  const [selectTab, setSelectedTab] = useState("CreditWeightagesInfoas");
  const tapOptions = [
    {
      title: "Credit Weightages Info as",
      key: "CreditWeightagesInfoas",
      folder: <CreditInfo />,
    },
    {
      title: "Approve Credit Info",
      key: "ApproveCreditInfo",
      folder: "",
    },
    {
      title:'Current Application Weightages is: 75',
      key: "CurrentApplicationWeightages",
      folder: "",
    }
  ];
  return (
    <>
      <div className="p-0">
        <div
          className="bordered-section p-3"
          style={{ borderTopLeftRadius: "0px" }}
        >
          <div className="row p-3 nested-tab">
            <Tabs
              id="controlled-tab-example"
              className="mt-30 position-relative tabs-overflow border-0"
              activeKey={selectTab}
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
          </div>
        </div>
      </div>
    </>
  );
};
export default CreditCheck;
