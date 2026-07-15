import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tab, Tabs } from "react-bootstrap";

import TransactionPush from "./OptNotification/TransactionPush";
import OtpPush from "./OptNotification/OtpPush";
import OtherPush from "./OptNotification/OtherPush";

const PushTemplate = () => {
  const { t } = useTranslation("notifications");
  localStorage.setItem("tabs", "BusinessInformation");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState<any>("OtpPush");
  const tapOptions = [
    {
      title: t("tabs.otpSms"),
      key: "OtpPush",
      folder: <OtpPush setSelectedTab={setSelectedTab} />,
    },
    {
      title: t("tabs.transactionSms"),
      key: "TransactionPush",
      folder: <TransactionPush setSelectedTab={setSelectedTab} />,
    },
    {
      title: t("tabs.otherSms"),
      key: "OtherPush",
      folder: <OtherPush setSelectedTab={setSelectedTab} />,
    }
  ];
  return (
    <>
    
      <Tabs
        id="controlled-tab-example"
        className="mt-30 position-relative tabs-overflow"
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

export default PushTemplate;
