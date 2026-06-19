import { useEffect, useState } from "react";
import { Switch } from "antd";
import TableView from "../TableView/TableView";
import { getPartnerApis, updateApiStatus } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { usePermissions, API_PERMISSIONS } from "../../hooks/useProductPermissions";

const PartnerApis = () => {
  // Permissions
  const { hasPermission } = usePermissions();
  const canEnableApi = hasPermission(API_PERMISSIONS.ENABLE_PARTNER_API);
  const canUpdateStatus = hasPermission(API_PERMISSIONS.UPDATE_STATUS);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);

  const handleStatusToggle = async (apiId: number, currentStatus: string | number) => {
    try {
      // Determine new status: 0 for inactive, 1 for active
      const newStatusValue = (currentStatus === "active" || currentStatus === 1) ? 0 : 1;
      
      // Prepare form data
      const formData = new FormData();
      formData.append('api_id', apiId.toString());
      formData.append('api_status', newStatusValue.toString());
      
      // Call API to update status
      const response = await updateApiStatus(formData);
      
      if (response?.data?.success) {
        // Update status locally on success
        const newStatus = newStatusValue === 1 ? "active" : "inactive";
        setData((prevData: any) =>
          prevData.map((item: any) =>
            item.id === apiId ? { ...item, status: newStatus } : item
          )
        );
        toast.success(response?.data?.message || "API status updated successfully");
      } else {
        toast.error(response?.data?.message || "Failed to update API status");
      }
    } catch (error: any) {
      console.error("Error updating API status:", error);
      toast.error(error?.response?.data?.message || "Failed to update API status");
    }
  };
  const Activity_Loans_Header = [
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
      width: "25%",
    },
    {
      name: "URL",
      selector: (row: { url: any }) => row.url,
      sortable: true,
      width: "50%",
    },
    {
      name: "Method",
      selector: (row: { method: any }) => row.method,
      sortable: true,
      width: "15%",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <Switch
          checked={row.status === "active" || row.status === 1}
          disabled={!canEnableApi && !canUpdateStatus}
          onChange={() => handleStatusToggle(row.id, row.status)}
          className="red-switch"
        />
      ),
      width: "10%",
    },
  ];
  useEffect(() => {
    getPartnerApisData();
  }, [page, pageSize]);

  const getPartnerApisData = async () => {
    setSkelitonLoading(true);
    try {
      const response = await getPartnerApis();
      if (response?.data?.success) {
        const apisData = response?.data?.data || [];
        setData(apisData);
        setTotalRows(apisData.length || 0);
        setFrom(1);
        setTo(apisData.length || 0);
        setPage(1);
        setTotalPage(Math.ceil(apisData.length / pageSize) || 1);
        toast.success(response?.data?.message || "Partner APIs fetched successfully");
      } else {
        toast.error(response?.data?.message || "Failed to fetch Partner APIs");
      }
    } catch (error: any) {
      console.error("Error fetching Partner APIs:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch Partner APIs");
    } finally {
      setSkelitonLoading(false);
    }
  };

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        name: item?.name || "-",
        url: item?.url || "-",
        status: item?.status || "inactive",
        method: item?.method || "-",
      };
    });
  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "6px" }}
      >
        <TableView
          header={Activity_Loans_Header}
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
    </>
  );
};

export default PartnerApis;
