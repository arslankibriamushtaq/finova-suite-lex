import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

import SimahCheckTab from "./SimahCheckTab";
import BayaanCheck from "./BayaanCheck";
import CompilanceCheck from "./CompilanceCheck";
import CreditCheck from "./CreditCheck";
import ApplicationApproval from "./ApplicationApproval";
import ApplicationStepper from "./ApplicationStepper";
import { useLocation, useParams } from "react-router-dom";
import PersonalInformation from "./ApplicationDetailsTabs/PersonalInfo";
import LoanInformation from "./ApplicationDetailsTabs/LoanInfo";
import SalaryDetails from "./ApplicationDetailsTabs/SalaryDetails";
import Document from "./ApplicationDetailsTabs/Document";
import ReschedulingDocuments from "./ApplicationDetailsTabs/ReschedulingDocuments";
import { getApplicationFullDetail, getApplicationByNumber } from "../../redux/apis/apisLendingService";
import Loader from "../Loader/Loader";

const AllApplicationView = () => {
  localStorage.setItem("tabs", "PersonalInformation");
  const getTabs = localStorage.getItem("tabs");
  const location = useLocation();
  const { id } = useParams();
  const rowData = location.state?.rowData;
  const [selectTab, setSelectedTab] = useState<any>(getTabs);
  const [fullDetail, setFullDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Get applicationId (UUID) - prioritize from rowData, convert from application number if needed
  const applicationId = rowData?.id || rowData?.applicationId;

  useEffect(() => {
    // If we have UUID from rowData, use it directly
    if (applicationId) {
      fetchFullDetail(applicationId);
    } 
    // If we only have application number in URL (id), convert it to UUID first
    else if (id && id.startsWith('APP-')) {
      resolveApplicationIdAndFetch(id);
    }
  }, [applicationId, id]);

  // Resolve application number to UUID, then fetch full details
  const resolveApplicationIdAndFetch = async (applicationNumber: string) => {
    try {
      setLoading(true);
      const response = await getApplicationByNumber(applicationNumber);
      const applications = response?.data?.data || [];
      
      if (applications.length > 0) {
        const appId = applications[0].id;
        await fetchFullDetail(appId);
      } else {
        console.error("Application not found for number:", applicationNumber);
      }
    } catch (error) {
      console.error("Error resolving application ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFullDetail = async (appId: string) => {
    try {
      setLoading(true);
      const response = await getApplicationFullDetail(appId);
      const data = response?.data?.data || response?.data || {};
      setFullDetail(data);
    } catch (error) {
      console.error("Error fetching full detail:", error);
    } finally {
      setLoading(false);
    }
  };

  // Build stepper steps from full-detail response
  const stepperSteps = fullDetail?.stepper?.steps
    ? (() => {
        const stepsObj: any = {};
        const stageMap: any = {
          INITIATED: "finance",
          BASIC_INFO: "verification",
          SIMAH_CONSENT: "simah_consent",
          COUNTER_OFFER: "counter",
          CONTRACT_SIGNING: "contract",
          OTP_VERIFICATION: "otp_verification",
          IVR_VERIFICATION: "ivr",
          DISBURSED: "disbursed",
          PAID: "paid",
        };
        fullDetail.stepper.steps.forEach((s: any) => {
          const key = stageMap[s.stage];
          if (key) {
            stepsObj[key] = s.status === "ACTIVE" || s.status === "COMPLETED";
          }
        });
        return stepsObj;
      })()
    : rowData?.steps;

  if (loading) {
    return <Loader />;
  }

  const tapOptions = [
    {
      title: "Personal Information",
      key: "PersonalInformation",
      folder: <PersonalInformation fullDetail={fullDetail} />,
    },
    {
      title: "Loan Information",
      key: "LoanInformation",
      folder: <LoanInformation applicationData={rowData} fullDetail={fullDetail} />,
    },
    {
      title: "Employment & Salary Details",
      key: "SalaryInformation",
      folder: <SalaryDetails fullDetail={fullDetail} />,
    },
    {
      title: "Document",
      key: "Document",
      folder: <Document fullDetail={fullDetail} />,
    },
    {
      title: "Simah Check",
      key: "SimahCheckTab",
      folder: <SimahCheckTab fullDetail={fullDetail} />,
    },
    {
      title: "Open Banking Check",
      key: "BayaanCheck",
      folder: <BayaanCheck fullDetail={fullDetail} />,
    },
    {
      title: "Compilance Check",
      key: "compilanceCheck",
      folder: <CompilanceCheck setSelectedTab={setSelectedTab} fullDetail={fullDetail} />,
    },
    {
      title: "Credit Check",
      key: "creditCheck",
      folder: <CreditCheck setSelectedTab={setSelectedTab} fullDetail={fullDetail} />,
    },
    {
      title: "Approval",
      key: "approval",
      folder: <ApplicationApproval fullDetail={fullDetail} />,
    },
    {
      title: "Rescheduling Request",
      key: "reschedulingDocuments",
      folder: <ReschedulingDocuments fullDetail={fullDetail} />,
    },
  ];
  return (
    <>
    <ApplicationStepper steps={stepperSteps} />
      <Tabs
        id="controlled-tab-example"
        className="mt-30 position-relative tabs-overflow"
        activeKey={selectTab}
        style={{ display: "flex", flexWrap: "nowrap" }}
        onSelect={(tab: any) => {
          setSelectedTab(tab);
        }}
      >
        {tapOptions.map((item: any) => (
          <Tab eventKey={item.key} title={item.title} key={item.key}>
            {selectTab === item.key && item.folder}
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default AllApplicationView;
