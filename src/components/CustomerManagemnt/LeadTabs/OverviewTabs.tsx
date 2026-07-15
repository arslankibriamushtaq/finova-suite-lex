import { useEffect, useMemo, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProductById } from "../../../redux/apis/apisCrud";
import { setProductData } from "../../../redux/apis/apisSlice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import SettingProductAppliation from "../../ProductManagement/SettingProductAppliation";
import SettingsTermsConditions from "../../ProductManagement/settingTermsConditions";
import FeeSettings from "../../ProductManagement/feeSettings";
import BayaanFinancialReport from "./BayaanFinancialReport";
import BusinessInfoTab from "./BusinessInfoTab";
import CustomerInformation from "./CustomerInformation";
import FinancingInformation from "./FinancingInformation";

const OverviewTabs = ({setActiveTab}:any) => {
  const { t } = useTranslation("customerManagement");
  localStorage.setItem("tabs", "BusinessInformation");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState<any>(getTabs);
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const mode = searchParams.get("mode");
  const productId = searchParams.get("id");
  const readOnly = mode === "view";
  const dispatch = useDispatch();

  // Load product data when component mounts or tab changes
  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        try {
          // Map tab keys to API types
          const typeMap: { [key: string]: string } = {
            'ApplicationSteps': 'settings_application_steps',
            'TermsAndConditions': 'settings_tos',
            'FeeSettings': 'factoring_settings',
            'AdminFeeSlabs': 'admin_fee_slabs',
            'EnvConfig': 'verification_methods',
            'DurationSettings': 'request_duration'
          };
          
          const apiType = typeMap[selectTab] || 'BasicInfo';
          const response = await getProductById(productId, apiType);
          if (response?.data?.success) {
            dispatch(setProductData(response.data.data));
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || t("leadTabs.overview.failedToLoadProductData"));
        }
      }
    };
    loadProductData();
  }, [productId, selectTab, dispatch]);

  const tapOptions = [
    {
      title: t("leadTabs.overview.tab.businessInformation"),
      key: "BusinessInformation",
      folder: <BusinessInfoTab setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    },
    {
      title: t("leadTabs.overview.tab.customerInformation"),
      key: "CustomerInformation",
      folder: <CustomerInformation setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    },
    {
      title: t("leadTabs.overview.tab.factoringInformation"),
      key: "FinancingInformation",
      folder: <FinancingInformation setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    }
  ];

  return (
    <div>
      <Tabs
        id="controlled-tab-example"
        className="mt-30 mb-4 position-relative tabs-overflow"
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
  );
};

export default OverviewTabs;
