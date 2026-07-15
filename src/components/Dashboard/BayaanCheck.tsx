import React, { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import { useParams } from "react-router-dom";
import BankStatement from "./ApplicationDetailsTabs/BankStatement";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";

function BayaanCheck({ fullDetail }: any) {
  const { t } = useTranslation("dashboard");
  const [active, setActive] = useState("BankStatement");
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState<any>(null);
  const tabOptions = [
    {
      title: t("bayaanTab.tab.bankStatement"),
      key: "BankStatement",
      component: <BankStatement financialData={financialData} />,
    },
    {
      title: t("bayaanTab.tab.requestDocument"),
      key: "RequestFinancialDocument",
      component: <></>,
    },
    {
      title: t("bayaanTab.tab.approveStatement"),
      key: "ApproveBankingStatement",
      component: <></>,
    },
    // {
    //   title: "Bayaan Credit Report",
    //   key: "BayaanCreditReport",
    //   component: <BayaanCreditReport /* setActiveTab={setActiveTab} */ />,
    // },
    // {
    //   title: "New Applicant Enquiry",
    //   key: "NewApplicantEnquiry",
    //   component: <NewApplicantEnquiry /* setActiveTab={setActiveTab} */ />,
    // },
    // {
    //   title: "Request Financial Document",
    //   key: "RequestFinancialDocument",
    //   component: <RequestFinancialDocument /* setActiveTab={setActiveTab}  *//>,
    // },
    // {
    //   title: "Approve Bayaan Info",
    //   key: "ApproveBayaanInfo",
    //   component: <ApproveBayaanInfo /* setActiveTab={setActiveTab}  *//>,
    // },
  ];
  // Use fullDetail if available
  useEffect(() => {
    if (fullDetail?.openBankingCheck) {
      setFinancialData(fullDetail.openBankingCheck);
      return;
    }
  }, [fullDetail]);

  useEffect(() => {
    if (id && fullDetail === undefined) {
      fetchFinancialData();
    }
  }, [id, fullDetail]);

  const fetchFinancialData = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const response = await getApplicationDetailsByType(id, "open_banking_check");

      if (response?.data?.success && response?.data?.data) {
        setFinancialData(response.data.data);
      } else {
        // toast.error("Failed to load financial data");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      // toast.error(error?.response?.data?.message || error?.message || "Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {loading && <Loader />}
    <div className="product-tabs-container product-settings-tabs simah-tabs" style={{ fontFamily: 'inherit', fontSize: '14px' }}>
      <Tabs
        activeKey={active}
        className="d-flex gap-1 mt-4"
        style={{ width: "max-content" }}
        onSelect={(tab: any) => {
          setActive(tab);
        }}
      >
        {tabOptions.map((tab) => (
          <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
            {active === tab.key && tab.component}
          </Tab>
        ))}
      </Tabs>
    </div>
    </>
  );
}

export default BayaanCheck;
