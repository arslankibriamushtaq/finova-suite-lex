import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tab, Tabs } from "react-bootstrap";
import EditEarlySettlement from "./EditEarlySettlement";
import EditDue from "./EditDue";
import EditLatePayment from "./EditLatePayment";
import EditNonPerforming from "./EditNonPerforming";
import EditWriteOff from "./EditWrireOff";
import EditBrokenPromisses from "./EditBrokenPromisses";

const EditDeliquencyManagement = ({ tabs, productId }) => {
  const { t } = useTranslation("productManagement2");
  localStorage.setItem("tabs", "EarlySettlement");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState(getTabs);
  const tapOptions = [
    {
      title: t("delinquency.tab.earlySettlement"),
      key: "EarlySettlement",
      folder: (
        <EditEarlySettlement
          productId={productId}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: t("delinquency.tab.dueLoan"),
      key: "DueLoan",
      folder: <EditDue productId={productId} setSelectedTab={setSelectedTab} />,
    },
    {
      title: t("delinquency.tab.latePayment"),
      key: "LatePayment",
      folder: (
        <EditLatePayment
          productId={productId}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: t("delinquency.tab.nonPerforming"),
      key: "Non-PerformingLoan",
      folder: (
        <EditNonPerforming
          productId={productId}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: t("delinquency.tab.writeOffs"),
      key: "Write-offs",
      folder: (
        <EditWriteOff productId={productId} setSelectedTab={setSelectedTab} />
      ),
    },
    {
      title: t("delinquency.tab.brokenPromises"),
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
