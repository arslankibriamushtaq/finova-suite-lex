import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Reference } from "yup";
import AccessHistory from "./AccessHistory";
import CallActivity from "./CallActivity";
import CheckList from "./CheckList";
import Comments from "./Comments";
import Correspondance from "./Correspondance";
import DocumentTracking from "./DocumentTracking";
import FieldInvestigation from "./FieldInvestigation";
import Letters from "./Letters";
import Maintenance from "./Maintenance";
import Promises from "./Promises";
import References from "./Refrences";
import ScenarioAnalysis from "./ScenerioAnalysics";
import TrackingAttributes from "./TrackingAttributes";

const CustomerServices = () => {
  const [selectTab, setSelectedTab] = useState("CallActivity");
  const tapOptions = [
    {
      title: "Call Activity",
      key: "CallActivity",
      folder: <CallActivity />,
    },
    // {
    //   title: "Maintenance",
    //   key: "Maintenance",
    //   folder: <Maintenance />,
    // },
    {
      title: "Comments",
      key: "Comments",
      folder: <Comments />,
    },
    {
      title: "Promises",
      key: "Promises",
      folder: <Promises />,
    },
    // {
    //   title: "Checklists",
    //   key: "Checklists",
    //   folder: <CheckList />,
    // },
    // {
    //   title: "Tracking Attributes",
    //   key: "TrackingAttributes",
    //   folder: <TrackingAttributes />,
    // },
    {
      title: "Field Investigation",
      key: "FieldInvestigation",
      folder: <FieldInvestigation />,
    },
    {
      title: "References",
      key: "References",
      folder: <References />,
    },
    /* {
      title: "Correspondence",
      key: "Correspondence",
      folder: <Correspondance />,
    }, */
    // {
    //   title: "Letters",
    //   key: "Letters",
    //   folder: <Letters />,
    // },
    // {
    //   title: "Document Tracking",
    //   key: "DocumentTracking",
    //   folder: <DocumentTracking />,
    // },
    // {
    //   title: "Scenario Analysis",
    //   key: "ScenarioAnalysis",
    //   folder: <ScenarioAnalysis />,
    // },
    {
      title: "Access History",
      key: "AccessHistory",
      folder: <AccessHistory />,
    },
  ];
  return (
    <>
      <div className="">
        <h2 className="col-md-12 pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
          {"Customer Services"}
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
export default CustomerServices;
