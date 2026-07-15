import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllApis } from "../../redux/apis/apisThirdParty";

const AllEnvironment = () => {
  const { t } = useTranslation("connector");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const AllEnvironment_Headers = [
    {
      name: t("allEnvironment.col.id"),
      selector: (row: { id: any }) => row.id,
      sortable: true,
      width: "100px",
    },
    {
      name: t("allEnvironment.col.apiName"),
      selector: (row: { apiName: any }) => row.apiName,
      sortable: true,
    },
    {
      name: t("allEnvironment.col.serviceName"),
      selector: (row: { serviceName: any }) => row.serviceName,
      sortable: true,
    },
    /* {
      name: "Environment",
      selector: (row: { environment: any }) => row.environment || "-",
      sortable: true,
    },
    {
      name: "URL",
      selector: (row: { url: any }) => row.url,
      sortable: true,
      width: "300px",
    },
    {
      name: "Method",
      selector: (row: { method: any }) => row.method,
      sortable: true,
      width: "120px",
    }, */
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "2px",
            backgroundColor: row.status === "Active" || row.status === 1 ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status === "Active" || row.status === 1 ? t("common:active") : t("common:inactive")}
        </span>
      ),
      sortable: true,
    },
  ];

  useEffect(() => {
    fetchAllApis();
  }, [page, pageSize]);

  const fetchAllApis = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllApis();
      
      if (response?.data?.success) {
        const responseData = response.data.data;
        
        // Handle different response structures
        let apisArray: any[] = [];
        if (Array.isArray(responseData)) {
          apisArray = responseData;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          apisArray = responseData.data;
        } else if (responseData?.apis && Array.isArray(responseData.apis)) {
          apisArray = responseData.apis;
        } else {
          apisArray = [];
        }

        setData(apisArray);
        setTotalRows(apisArray.length || 0);
        setFrom(apisArray.length > 0 ? 1 : 0);
        setTo(apisArray.length || 0);
        setPage(1);
        setTotalPage(1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("allEnvironment.toast.fetchFailed"));
      setSkelitonLoading(false);
    }
  };

  const mappedData = data?.map((item: any) => ({
    id: item?.id || "-",
    apiName: item?.name || item?.api_name || "-",
    serviceName: item?.service?.name || item?.service_name || "-",
    environment: item?.env || item?.environment || "-",
    url: item?.url || "-",
    method: item?.method || "-",
    status: item?.status || "Inactive",
  }));

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("allEnvironment.title")}</h2>
      </div>
      <TableView
        header={AllEnvironment_Headers}
        data={mappedData}
        totalRows={totalRows}
        isLoading={skelitonLoading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />
    </div>
  );
};

export default AllEnvironment;
