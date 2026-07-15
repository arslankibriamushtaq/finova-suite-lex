import { useState, useEffect } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import AccountInvoices from "./AccountInvoices";
import LoanInvoices from "./LoanInvoices";

const OtherInvoices = () => {
  const { t } = useTranslation("accountingLoans");
  const localStorageKey = "selectedTab"; // Key for localStorage
  const defaultTab = "AccountInvoices"; // Default tab key

  // Retrieve the tab state from local storage or fallback to default
  const [selectTab, setSelectedTab] = useState<string>(
    localStorage.getItem(localStorageKey) || defaultTab
  );

  // Save selected tab to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(localStorageKey, selectTab);
  }, [selectTab]);

  const tapOptions = [
    {
      title: t("otherInvoices.tabAccount"),
      key: "AccountInvoices",
      folder: <AccountInvoices />,
    },
    {
      title: t("otherInvoices.tabLoan"),
      key: "LoanInvoices",
      folder: <LoanInvoices />,
    },
  ];

  return (
    <div>
      <Tabs
        id="controlled-tab-example"
        className="mt-30 position-relative tabs-overflow"
        activeKey={selectTab}
        onSelect={(tab: any) => setSelectedTab(tab)}
      >
        {tapOptions.map((item: any) => (
          <Tab eventKey={item.key} title={item.title} key={item.key}>
            {selectTab === item.key && item.folder}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default OtherInvoices;
