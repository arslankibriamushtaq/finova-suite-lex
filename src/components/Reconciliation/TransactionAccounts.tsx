import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import OperationalExpenses from "./OperationalExpenses";
import OperationalExpensesSummary from "./OperationalExpensesSummary";
import PoolAccount from "./PoolAccount";
import CollectionAccount from "./CollectionAccount";
import VatAccount from "./VatAccount";
import RevenueAccount from "./RevenueAccount";
import WalletAccount from "./WalletAccount";
const TransactionAccounts = () => {
  const [selectTab, setSelectedTab] = useState("PoolAccount");
  const tapOptions = [
    {
      title: "Pool Account",
      key: "PoolAccount",
      folder: <PoolAccount />,
    },
    {
      title: "Collection Account",
      key: "CollectionAccount",
      folder: <CollectionAccount/>,
    },
    {
      title: "VAT Account",
      key: "VATAccount",
      folder: <VatAccount />,
    },
    {
      title: "Revenue Account",
      key: "RevenueAccount",
      folder: <RevenueAccount/>,
    },
    {
      title: "Wallet Account",
      key: "WalletAccount",
      folder: <WalletAccount/>,
    },
  ];

  return (
    <>
      <div className="cs-table">
        <div className="col-lg-12 search-bar col-12 d-flex align-items-center">
          {/* <h2 className="col-lg-6 col-12">View Application</h2> */}
        </div>

        <div>
          <Tabs
            id="controlled-tab-example"
            className="mt-30 position-relative tabs-overflow mt-3"
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
    </>
  );
};
export default TransactionAccounts;
