import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tab, Tabs } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProductById } from "../../../redux/apis/apisCrud";
import { setProductData } from "../../../redux/apis/apisSlice";
import toast from "react-hot-toast";
import SettingProductAppliation from "../../ProductManagement/SettingProductAppliation";
import SettingsTermsConditions from "../../ProductManagement/settingTermsConditions";
import FeeSettings from "../../ProductManagement/feeSettings";
import AdminFeeSlabs from "../../ProductManagement/adminFeeSlabs";
import EnvConfig from "../../ProductManagement/envConfiguration";
import DurationSettings from "../../ProductManagement/requestDurationSettings";

const CustomerInfo = ({setActiveTab}:any) => {
  const { t } = useTranslation("customerManagement");
  localStorage.setItem("tabs", "ApplicationSteps");
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
          toast.error(error?.response?.data?.message || t("customerInfo.toast.loadFailed"));
        }
      }
    };
    loadProductData();
  }, [productId, selectTab, dispatch]);

  const tapOptions = [
    {
      title: t("customerInfo.tab.applicationSteps"),
      key: "ApplicationSteps",
      folder: <SettingProductAppliation setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    },
    {
      title: t("customerInfo.tab.termsAndConditions"),
      key: "TermsAndConditions",
      folder: <SettingsTermsConditions setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    },
    {
      title: t("customerInfo.tab.feeSettings"),
      key: "FeeSettings",
      folder: <FeeSettings setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    },
    {
      title: t("customerInfo.tab.feeSlabs"),
      key: "AdminFeeSlabs",
      folder: <AdminFeeSlabs setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    },
    {
      title: t("customerInfo.tab.envConfig"),
      key: "EnvConfig",
      folder: <EnvConfig setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    },
    {
      title: t("customerInfo.tab.durationSettings"),
      key: "DurationSettings",
      folder: <DurationSettings setActiveTab={setActiveTab} setSelectedTab={setSelectedTab} readOnly={readOnly} />,
    },
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

export default CustomerInfo;
