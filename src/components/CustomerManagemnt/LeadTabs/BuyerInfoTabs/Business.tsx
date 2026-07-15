import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const Business = () => {
  const { t } = useTranslation("customerManagement");
  const [selectTab, setSelectedTab] = useState<string>("BusinessVerification");

  const tabOptions = [
    {
      title: t("leadTabs.buyerBusiness.tab.businessVerification"),
      key: "BusinessVerification",
    },
    {
      title: t("leadTabs.buyerBusiness.tab.uploadBusinessDocuments"),
      key: "UploadBusinessDocuments",
    },
    {
      title: t("leadTabs.buyerBusiness.tab.companyAddress"),
      key: "CompanyAddress",
    },
    {
      title: t("leadTabs.buyerBusiness.tab.approveBuyerBusiness"),
      key: "ApproveBuyerBusiness",
    },
  ];

  return (
    <div>
      <Tabs
        id="business-tabs"
        className="mb-3"
        activeKey={selectTab}
        onSelect={(tab: any) => {
          setSelectedTab(tab);
        }}
      >
        {tabOptions.map((item: any) => (
          <Tab key={item.key} eventKey={item.key} title={item.title}>
            {selectTab === item.key && (
              <div style={{ padding: "20px" }}>
                <h5>{item.title}</h5>
                <p>{t("leadTabs.buyerBusiness.comingSoon", { title: item.title })}</p>
              </div>
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default Business;