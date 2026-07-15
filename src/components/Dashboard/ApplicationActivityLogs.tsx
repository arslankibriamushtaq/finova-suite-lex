import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableView from "../TableView/TableView";
import { getApplicationActivityLogs } from "../../redux/apis/apisCrud";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ApplicationActivityLogs = () => {
  const { t } = useTranslation("financing");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const { id } = useParams();
  const [loanApplicationNumber, setLoanApplicationNumber] = useState<string>("");

  const Activity_Logs_Header = [
    {
      name: t("col.id"),
      selector: (row: { id: any }) => row.id,
      sortable: true,

    },
    {
      name: t("col.time"),
      selector: (row: { time: any }) => row.time,
      sortable: true,
    
    },
    {
      name: t("common:date"),
      selector: (row: { date: any }) => row.date,
      sortable: true,

    },
    {
      name: t("col.updatedBy"),
      selector: (row: { updated_by: any }) => row.updated_by,
      sortable: true,
     
    },
    {
      name: t("col.event"),
      selector: (row: { event: any }) => row.event,
      sortable: true,
      width:"500px"
  
    },
    {
      name: t("col.changes"),
      selector: (row: { changes: any }) => row.changes,
      sortable: true,

    },
  ];

  // Fetch activity logs
  const getActivityLogs = async () => {
    if (!id) return;
    
    try {
      setSkelitonLoading(true);
      // Pass the encrypted ID directly to the API
      const response = await getApplicationActivityLogs(id, null, null);
      
      if (response?.data?.success) {
        const logsData = response?.data?.data?.data || [];
        setData(logsData);
        
        // Extract loan_application_number from the first log entry or response data
        if (response?.data?.data?.application_no) {
          setLoanApplicationNumber(response.data.data.application_no);
        } else if (logsData.length > 0 && logsData[0]?.application_no) {
          setLoanApplicationNumber(logsData[0].application_no);
        }
        
        toast.success(response?.data?.message || t("toast.activityLogsFetched"));
      } else {
        toast.error(response?.data?.message || t("toast.fetchActivityLogsFailed"));
      }
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
      toast.error(error?.response?.data?.message || t("toast.fetchActivityLogsFailed"));
    } finally {
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getActivityLogs();
  }, [id]);

  // Map data to table format
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id || index + 1,
        time: item?.time || item?.created_at?.split(" ")[1] || "-",
        date: item?.date || item?.created_at?.split(" ")[0] || "-",
        updated_by: item?.updated_by || item?.user_name || "Super Admin",
        event: item?.event || item?.event_type || item?.action || "-",
        changes: item?.changes || item?.description || item?.details || "-",
      };
    });


  return (
    <div className="service" style={{ padding: "20px" }}>
      <div className="mb-4">
        <h4>{t("activityLogs.applicationHeader", { number: loanApplicationNumber })} </h4>
      </div>

      <TableView
        header={Activity_Logs_Header}
        data={mappedData}
        isLoading={skelitonLoading}
      />
    </div>
  );
};

export default ApplicationActivityLogs;

