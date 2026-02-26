import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

import TransactionPush from "./OptNotification/TransactionPush";
import OtpPush from "./OptNotification/OtpPush";
import OtherPush from "./OptNotification/OtherPush";
import EmailTransaction from "./EmailNotification/EmailTransaction";
import EmailOther from "./EmailNotification/EmailOther";
import EmailOtp from "./EmailNotification/EmailOtp";

const EmailTemplate = () => {
  localStorage.setItem("tabs", "BusinessInformation");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState<any>("EmailOtp");
  const tapOptions = [
    {
      title: "OTP SMS",
      key: "EmailOtp",
      folder: <EmailOtp setSelectedTab={setSelectedTab} />,
    },
    {
      title: "Transaction SMS ",
      key: "EmailOther",
      folder: <EmailOther setSelectedTab={setSelectedTab} />,
    },
    {
      title: "Other SMS",
      key: "EmailTransaction",
      folder: <EmailTransaction setSelectedTab={setSelectedTab} />,
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

export default EmailTemplate;
