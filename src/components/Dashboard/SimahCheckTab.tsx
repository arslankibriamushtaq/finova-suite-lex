import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import ConsumerInquiry from "./ConsumerInquiry";
// import UploadSimahConsumerDocument from "./UploadSimahConsumerDocument";
// import ApproveSimahInfo from "./ApproveSimahInfo";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";

function SimahCheckTab({ fullDetail }: any) {
  const { t } = useTranslation("dashboard");
  const [active, setActive] = useState("ConsumerInquiry");
  const [simahData, setSimahData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const tabOptions = [
    {
      title: t("simahTab.tab.consumerInquiry"),
      key: "ConsumerInquiry",
      component: <ConsumerInquiry simahData={simahData} />,
    },
    {
      title: t("simahTab.tab.uploadDocument"),
      key: "UploadSimahConsumerDocument",
      // component: <UploadSimahConsumerDocument />,
      component: <></>,
    },
    {
      title: t("simahTab.tab.approveInfo"),
      key: "ApproveSimahInfo",
      // component: <ApproveSimahInfo />,
      component: <></>,
    },
  ];
    // Use fullDetail if available
    useEffect(() => {
      if (fullDetail?.simahCheck) {
        setSimahData(fullDetail.simahCheck);
        return;
      }
    }, [fullDetail]);

    // Fetch SIMAH data (fallback)
    useEffect(() => {
      if (id && fullDetail === undefined) {
        fetchData();
      }
    }, [id, fullDetail]);
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getApplicationDetailsByType(id, 'simah');
        
        // Extract SIMAH data from response
        const data = response.data?.data || response.data || {};
        const simahResponse = data.simah?.response?.data?.[0] || null;
        setSimahData(simahResponse);
        
        if (response.data?.message) {
          // toast.success(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // toast.error("Failed to fetch SIMAH information");
        setSimahData(null);
      } finally {
        setLoading(false);
      }
    };
  return (
    <>
      {loading && <Loader />}
    <div className="product-tabs-container product-settings-tabs simah-tabs">
      <Tabs
        activeKey={active}
        className="d-flex gap-1"
        style={{ width: "max-content",marginTop:"20px" }}
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

export default SimahCheckTab;
