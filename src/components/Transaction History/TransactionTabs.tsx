import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Reference } from "yup";
import { useTranslation } from "react-i18next";
import TransactionHistory from "./TransactionHistory";
import ExcessPayment from "./ExcessPayment";

const CustomerServices = () => {
  const { t } = useTranslation("accountingLoans");
  const [selectTab, setSelectedTab] = useState("transactionHistory");
  const tapOptions = [
    {
      title: t("txn.tabHistory"),
      key: "transactionHistory",
      folder: <TransactionHistory />,
    },
    // {
    //   title: "Excess Payment",
    //   key: "excessPayment",
    //   folder: <ExcessPayment />,
    // },
  ];
  return (
    <>
      <div className="">
        <Tabs
          id="controlled-tab-example"
          className="position-relative tabs-overflow"
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
    </>
  );
};
export default CustomerServices;
