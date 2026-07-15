import React, { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import BankStatement from "./BankStatement";

const OpenBankingCheck = () => {
  const { t } = useTranslation("allApplication");
  const [selectTab, setSelectedTab] = useState("BankStatement");
  const tapOptions = [
    {
      title: t("openBanking.tab.bankStatement"),
      key: "BankStatement",
      folder: <BankStatement />,
    },
    {
      title: t("openBanking.tab.requestFinancialDocument"),
      key: "RequestFinancialDocument",
      folder: "",
    },
    {
      title: t("openBanking.tab.approveBankingStatement"),
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
