import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import EditEarlySettlement from "./EditEarlySettlement";
import EditDue from "./EditDue";
import EditLatePayment from "./EditLatePayment";
import EditNonPerforming from "./EditNonPerforming";
import EditWriteOff from "./EditWrireOff";
import EditBrokenPromisses from "./EditBrokenPromisses";

const EditDeliquencyManagement = ({ tabs, productId }) => {
  localStorage.setItem("tabs", "EarlySettlement");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState(getTabs);
  const tapOptions = [
    {
      title: "Early Settlement",
      key: "EarlySettlement",
      folder: (
        <EditEarlySettlement
          productId={productId}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: "Due Loan",
      key: "DueLoan",
      folder: <EditDue productId={productId} setSelectedTab={setSelectedTab} />,
    },
    {
      title: "Late Payment",
      key: "LatePayment",
      folder: (
        <EditLatePayment
          productId={productId}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: "Non-Performing Loan",
      key: "Non-PerformingLoan",
      folder: (
        <EditNonPerforming
          productId={productId}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: "Write-offs",
      key: "Write-offs",
      folder: (
        <EditWriteOff productId={productId} setSelectedTab={setSelectedTab} />
      ),
    },
    {
      title: "Broken Promises",
      key: "BrokenPromises",
      folder: (
        <EditBrokenPromisses
          productId={productId}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
  ];
  return (
    <>
      <div className="">
        <h2 className="col-md-12 pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
          {/* {"Delinquency Management"} */}
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
export default EditDeliquencyManagement;
