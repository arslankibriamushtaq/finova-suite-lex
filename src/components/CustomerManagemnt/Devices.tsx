import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { getDevices } from "../../redux/apis/apisCrud";
import { useTranslation } from "react-i18next";

const Devices = () => {
  const { t } = useTranslation("customerManagement");
  const [tableData, setTableData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);

  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getDevices(page, pageSize);
      if (response?.data?.success) {
        const responseData = response.data.data;
        // Extract the actual data array
        const data = responseData?.data || [];
        setTableData(data);
        
        // Extract pagination information
        setTotalRows(responseData?.total || 0);
        setTotalPage(responseData?.last_page || 0);
        setFrom(responseData?.from || 0);
        setTo(responseData?.to || 0);
        
        // Update page if it changed from API response
        if (responseData?.current_page) {
          setPage(responseData.current_page);
        }
        
        // Update pageSize if it changed from API response
        if (responseData?.per_page && responseData.per_page !== pageSize) {
          setPageSize(responseData.per_page);
        }
      }
    } catch (error: any) {
      console.error("Error fetching devices:", error);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [page, pageSize]);

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const tableHeaders = [
    // {
    //   name: "ID",
    //   selector: (row: any) => row.id || "-",
      
    // },
    {
      name: t("devices.col.deviceId"),
      selector: (row: any) => row.device_id || "-",
      width: "200px",
    },
    {
      name: t("devices.col.device"),
      selector: (row: any) => row.device || "-",
    },
    {
      name: t("devices.col.deviceModel"),
      selector: (row: any) => row.device_model || "-",
      width: "350px",
    },
    {
      name: t("devices.col.os"),
      selector: (row: any) => row.os || "-",
    },
    {
      name: t("devices.col.browser"),
      selector: (row: any) => row.browser || "-",
      width: "350px",
    },
    {
      name: t("devices.col.ipAddress"),
      selector: (row: any) => row.ip || "-",
      width: "250px",
    },
    {
      name: t("devices.col.location"),
      selector: (row: any) => row.location_info || "-",
      width: "450px",
    },
    {
      name: t("devices.col.user"),
      selector: (row: any) => row.user?.name || "-",
      width: "300px",
    },
    {
      name: t("devices.col.userPhone"),
      selector: (row: any) => row.user?.phone || "-",
      width: "200px",
    },
    {
      name: t("devices.col.isBlocked"),
      selector: (row: any) => row.is_blocked ? t("common:yes") : t("common:no"),
    },
    {
      name: t("common:createdAt"),
      selector: (row: any) => formatDate(row.created_at),
      width: "200px",
    },
    {
      name: t("common:updatedAt"),
      selector: (row: any) => formatDate(row.updated_at),
      width: "200px",
    },
  ];

  return (
    <>
      <div className="col-12">
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            header={tableHeaders}
            data={tableData}
            totalRows={totalRows}
            totalPage={totalPage}
            page={page}
            pageSize={pageSize}
            from={from}
            to={to}
            isLoading={skelitonLoading}
          />
        </div>
      </div>
    </>
  );
};

export default Devices;

