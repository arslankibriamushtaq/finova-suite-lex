import React, { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import BankStatement from "./BankStatement";

const OpenBankingCheck = () => {
  const [selectTab, setSelectedTab] = useState("BankStatement");
  const tapOptions = [
    {
      title: "Bank Statement",
      key: "BankStatement",
      folder: <BankStatement />,
    },
    {
      title: "Request Financial Document",
      key: "RequestFinancialDocument",
      folder: "",
    },
    {
      title: "Approve Banking Statement",
      key: "ApproveBankingStatement",
      folder: "",
    },
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
export default OpenBankingCheck;
