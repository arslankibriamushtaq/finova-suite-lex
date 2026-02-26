import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import ManagerList from "../Dashboard/ManagerList";
import ManagerInformation from "../Dashboard/ManagerInformation";
import OtpSms from "./SmsNotification/OtpSms";
import TransactionSms from "./SmsNotification/TransactionSms";
import OtherSms from "./SmsNotification/OtherSms";

const SmsTemplate = () => {
  localStorage.setItem("tabs", "BusinessInformation");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState<any>("OtpSms");
  const tapOptions = [
    {
      title: "OTP SMS",
      key: "OtpSms",
      folder: <OtpSms setSelectedTab={setSelectedTab} />,
    },
    {
      title: "Transaction SMS ",
      key: "TransactionSms",
      folder: <TransactionSms setSelectedTab={setSelectedTab} />,
    },
    {
      title: "Other SMS",
      key: "OtherSms",
      folder: <OtherSms setSelectedTab={setSelectedTab} />,
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

export default SmsTemplate;
