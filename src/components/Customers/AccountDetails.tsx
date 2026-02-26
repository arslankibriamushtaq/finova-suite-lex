import { useEffect, useState } from "react";

import { Tab, Tabs } from "react-bootstrap";
import { Images } from "../Config/Images";
import AccountDetailPage from "./AccountDetailPage";
import Contract from "./Contract";
const AccountDetails = () => {
  const [selectTab, setSelectedTab] = useState("AccountDetail");
  const [generate, setGenerate] = useState(false);
  const [modal, setModal] = useState(false);
  const tapOptions = [
    {
      title: "Account Detail",
      key: "AccountDetail",
      folder: <AccountDetailPage />,
    },
    {
      title: "Contract",
      key: "Contract",
      folder: <Contract />,
    },
  ];
  useEffect(() => {
    if (selectTab === "Contract") {
      setGenerate(true);
    } else {
      setGenerate(false);
    }
  }, [selectTab]);

  return (
    <>
      <h2 className="col-md-12 pb-2 d-flex align-items-center fs-6 fw-bold">
        {"Account Details"}
      </h2>
      <div className="d-flex align-items-center">
        <div className="flex-grow-1">
          {generate && (
            <div>
              <div className="d-flex justify-content-end ">
                <button
                  className="theme-btn-next"
                  type="submit"
                  onClick={() => setModal(true)}
                >
                  Generate Contract
                </button>
              </div>
            </div>
          )}
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
        </div>
      </div>
      {generate && (
        <div className="col-12 d-flex mt-5 justify-content-center">
          <img src={Images.ContractLogo} alt="" />
        </div>
      )}
      <Contract setModal={setModal} modal={modal} />
    </>
  );
};

export default AccountDetails;
