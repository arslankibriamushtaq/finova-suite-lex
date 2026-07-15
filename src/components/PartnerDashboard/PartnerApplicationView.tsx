import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import PartnerBusinessinfo from "./PartnerBusinessinfo";
import PartnerManagerList from "./PartnerManagerList";
import PartnerManagerInformation from "./PartnerManagerInformation";
import PartnerFactoringTab from "./PartnerFactoringTab";
import PartnerDisclaimer from "./PartnerDisclaimer";
import PartnerEpromissoryNote from "./PartnerEpromissoryNote";
import { useTranslation } from "react-i18next";

const PartnerApplicationView = () => {
  const { t } = useTranslation("partner");
  localStorage.setItem("partnertabs", "BusinessInformation");
  const getTabs = localStorage.getItem("partnertabs");
  const [selectTab, setSelectedTab] = useState<any>(getTabs);
  const tapOptions = [
    {
      title: t("appView.businessInformation"),
      key: "BusinessInformation",
      folder: <PartnerBusinessinfo setSelectedTab={setSelectedTab} />,
    },
    {
      title: t("appView.managerList"),
      key: "ManagerList",
      folder: <PartnerManagerList setSelectedTab={setSelectedTab} />,
    },
    {
      title: t("appView.managerInformation"),
      key: "ManagerInformation",
      folder: <PartnerManagerInformation setSelectedTab={setSelectedTab} />,
    },
    {
      title: t("appView.factoringInformation"),
      key: "FactoringTab",
      folder: <PartnerFactoringTab setSelectedTab={setSelectedTab} />,
    },
    // {
    //   title: "Revenue Details",
    //   key: "RevenueDetails",
    //   folder: <RevenueDetails setSelectedTab={setSelectedTab} />,
    // },
    {
      title: t("appView.disclaimer"),
      key: "Disclaimer",
      folder: <PartnerDisclaimer setSelectedTab={setSelectedTab} />,
    },
    {
      title: t("appView.epromissoryNote"),
      key: "EpromissoryNote",
      folder: <PartnerEpromissoryNote setSelectedTab={setSelectedTab} />,
    },
    // {
    //   title: "Simah Check",
    //   key: "SimahCheckTab",
    //   folder: <SimahCheckTab setSelectedTab={setSelectedTab} />,
    // },
    // {
    //   title: "Bayaan Check",
    //   key: "BayaanCheck",
    //   folder: <BayaanCheck setSelectedTab={setSelectedTab} />,
    // },
    // {
    //   title: "Compilance Check",
    //   key: "compilanceCheck",
    //   folder: <CompilanceCheck setSelectedTab={setSelectedTab} />,
    // },
    // {
    //   title: "Credit Check",
    //   key: "creditCheck",
    //   folder: <CreditCheck setSelectedTab={setSelectedTab} />,
    // },
  ];
  return (
    <>
      <div className="container-fluid mt-3">
        <Tabs
          id="controlled-tab-example"
          className="mt-5 position-relative tabs-overflow"
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
      </div>
    </>
  );
};

export default PartnerApplicationView;
