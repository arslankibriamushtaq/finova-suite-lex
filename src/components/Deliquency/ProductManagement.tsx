import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import EarlySettlement from "./EarlySettlement";
import Due from "./Due";
import LatePayment from "./LatePayment";
import NonPerforming from "./NonPerforming";
import WriteOff from "./WriteOff";
import BrokenPromisses from "./BrokenPromisses";

const ProductManagement = () => {
  localStorage.setItem("tabs", "EarlySettlement");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState(getTabs);
  const tapOptions = [
    {
      title: "Early Settlement",
      key: "EarlySettlement",
      folder: <EarlySettlement />,
    },
    {
      title: "Due Loan",
      key: "DueLoan",
      folder: <Due />,
    },
    {
      title: "Late Payment",
      key: "LatePayment",
      folder: <LatePayment />,
    },
    {
      title: "Non-Performing Loan",
      key: "Non-PerformingLoan",
      folder: <NonPerforming />,
    },
    {
      title: "Write-offs",
      key: "Write-offs",
      folder: <WriteOff />,
    },
    {
      title: "Broken Promises",
      key: "BrokenPromises",
      folder: <BrokenPromisses />,
    },
  ];
  return (
    <>
      <div className="">
        <h2 className="col-md-12 pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
          {"Delinquency Management"}
        </h2>
        <Tabs
          id="controlled-tab-example"
          className="mt-30 position-relative tabs-overflow"
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

        <div></div>
      </div>
    </>
  );
};
export default ProductManagement;
