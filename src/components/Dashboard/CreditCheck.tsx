import { useState, useEffect, useMemo } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

import CreditWeightagesInfo from "./CreditWeightagesInfo";
import ApproveCreditInfo from "./ApproveCreditInfo";
import { useTranslation } from "react-i18next";

function CreditCheck({ setActiveTab, fullDetail }: any) {
  const { t } = useTranslation("dashboard");
  const [active, setActive] = useState("CreditWeightagesInfo");
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [creditData, setCreditData] = useState<any>(null);
  const [creditHistory, setCreditHistory] = useState<any>(null);
  const [definitions, setDefinitions] = useState<any[]>([]);

  useEffect(() => {
    if (fullDetail?.creditCheck) {
      const cc = fullDetail.creditCheck;
      setCreditData(cc);
      setCreditHistory(cc.riskHistory || []);
      setDefinitions(cc.kycWeightageData || []);
      return;
    }
  }, [fullDetail]);

  useEffect(() => {
    if (id && fullDetail === undefined) {
      fetchCreditData();
    }
  }, [id, fullDetail]);

  const fetchCreditData = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const response = await getApplicationDetailsByType(id, "credit_check");

      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        
        // Extract credit history from new API response structure
        const creditHistoryData = data?.credit_history || [];
        const creditHistoryArray: any[] = Array.isArray(creditHistoryData) ? creditHistoryData : [];
        
        // Extract definitions - try multiple possible locations for backward compatibility
        const defsRaw =
          creditHistoryArray.length > 0 ? creditHistoryArray :
          (data?.loan_weight_definitions as any[] | undefined) ??
          (data?.loan_weightage_definitions?.loan_wieght_definition as any[] | undefined) ??
          [];
        const defs: any[] = Array.isArray(defsRaw) ? defsRaw : [];
        
        setDefinitions(defs);
        setCreditData(data);
        setCreditHistory(creditHistoryArray);
        
      } else {
        toast.error(t("creditTab.toast.loadFailed"));
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || error?.message || t("creditTab.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Calculate total score from definitions
  const totalScore = useMemo(() => {
    if (!definitions || definitions.length === 0) return 0;
    return definitions.reduce((sum, def) => {
      // Handle new API structure: { key, weight, parameter }
      if (def?.weight !== undefined) {
        return sum + (Number(def.weight) || 0);
      }
      // Handle old structure: weightages array/object
      const weightagesArray = Array.isArray(def?.weightages) 
        ? def.weightages 
        : Object.entries(def?.weightages ?? {}).map(([value, weight]) => ({ value, weight }));
      
      if (weightagesArray.length === 0) return sum;
      
      // Use selected value if available, otherwise use first weightage
      if (def?.selected && def.selected !== null) {
        const matchedWeightage = weightagesArray.find(
          (w: any) => String(w.value || w[0]) === String(def.selected)
        );
        if (matchedWeightage) {
          return sum + (Number(matchedWeightage.weight || matchedWeightage[1]) || 0);
        }
      }
      
      // Use first weightage as default
      const firstWeightage = weightagesArray[0];
      return sum + (Number(firstWeightage.weight || firstWeightage[1]) || 0);
    }, 0);
  }, [definitions]);

  const tabOptions = useMemo(() => [
    {
      title: t("creditTab.tab.weightagesInfo"),
      key: "CreditWeightagesInfo",
      component: (
        <CreditWeightagesInfo
          definitions={definitions}
          applicationId={id}
          loading={loading}
          onSave={fetchCreditData}
        />
      ),
    },
    {
      title: t("creditTab.tab.currentWeightage", { score: totalScore }),
      key: "CurrentApplicationWeightage",
      component: (
        <CreditWeightagesInfo
          definitions={definitions}
          applicationId={id}
          loading={loading}
          onSave={fetchCreditData}
        />
      ),
    },
    {
      title: t("creditTab.tab.approveInfo"),
      key: "ApproveCreditInfo",
      component: (
        // <ApproveCreditInfo
        //   applicationNo={id}
        //   creditHistory={creditHistory}
        //   onUpdate={fetchCreditData}
        // />
        <></>
      ),
    },
  ], [definitions, id, loading, totalScore]);

  if (loading && !creditData) return <Loader />;

  return (
    <div className="product-tabs-container product-settings-tabs simah-tabs">
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
  );
}

export default CreditCheck;
