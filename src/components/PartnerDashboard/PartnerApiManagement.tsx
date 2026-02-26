import React, { useState, useEffect } from "react";
import { Tab, Tabs } from "react-bootstrap";
import EnabledApis from "./EnabledApis";
import CompanyApiSetting from "./CompanyApiSetting";
import ErrorCodeSetting from "./ErrorCodeSetting";
import { getPartnerAllApis } from "../../redux/apis/apisCrud";


function PartnerApiManagement({ setActiveTab }: any) {
  const [active, setActive] = useState("EnabledApis");
  const [partnerData, setPartnerData] = useState<any>(null);
  const [apisData, setApisData] = useState<any>([]);
  const [errorCodesData, setErrorCodesData] = useState<any>([]);
  useEffect(() => {
    const fetchAllApis = async () => {
      try {
        const response = await getPartnerAllApis();
        if(response?.data?.success){
          setPartnerData(response?.data?.data?.partner);
          setApisData(response?.data?.data?.apis?.data || []);
          setErrorCodesData(response?.data?.data?.error_codes || []);
        }
      } catch (error) {
        console.error("Error fetching all APIs:", error);
      }
    };

    fetchAllApis();
  }, []);
  const tabOptions = [
    {
      title: "Enabled Apis",
      key: "EnabledApis",
      component: <EnabledApis apisData={apisData} partnerData={partnerData} setActiveTab={setActiveTab} />,
    },
    {
      title: "Company APIs Setting",
      key: "CompanyAPIsSetting",
      component: <CompanyApiSetting apisData={apisData} partnerData={partnerData} setActiveTab={setActiveTab} />,
    },
    {
      title: "Error Codes Setting",
      key: "ErrorCodesSetting",
      component: <ErrorCodeSetting errorCodesData={errorCodesData} setActiveTab={setActiveTab} />,
    },
  ];
  return (
    <>
      <div className="product-tabs-container p-3 product-settings-tabs mt-5">
        <Tabs
          activeKey={active}
          className="d-flex gap-1"
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

export default PartnerApiManagement;
