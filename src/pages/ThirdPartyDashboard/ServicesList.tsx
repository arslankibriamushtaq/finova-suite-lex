import { useState, useEffect } from "react";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getServicesList } from "../../redux/apis/apisThirdParty";

const ServicesList = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const Service_Headers = [
    {
      name: "ID",
      selector: (row: { id: any }) => row.id,
      sortable: true,
      width: "100px",
    },
    {
      name: "Service Name",
      selector: (row: { serviceName: any }) => row.serviceName,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            backgroundColor: row.status === 1 ? "#52c41a" : "#ff4d4f",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
    },
  ];

  const getServices = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getServicesList(pageSize, page);
      
      if (response?.data?.success) {
        // Handle different possible response structures
        let servicesData;
        if (response.data.data?.services) {
          // Structure: { success: true, data: { services: { data: [], total: ... } } }
          servicesData = response.data.data.services;
        } else if (response.data.data?.data) {
          // Structure: { success: true, data: { data: [], total: ... } }
          servicesData = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Structure: { success: true, data: [...] }
          setData(response.data.data || []);
          setTotalRows(response.data.data?.length || 0);
          setSkelitonLoading(false);
          return;
        } else {
          servicesData = response.data.data;
        }

        setData(servicesData?.data || servicesData || []);
        setTotalRows(servicesData?.total || servicesData?.data?.length || 0);
        setFrom(servicesData?.from || 0);
        setTo(servicesData?.to || 0);
        setPage(servicesData?.current_page || page);
        setTotalPage(servicesData?.last_page || 1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch services");
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getServices();
  }, [page, pageSize]);

  const mappedData = data?.map((item: any) => ({
    id: item?.id,
    serviceName: item?.name || "-",
    status: item?.status || 0,
  }));

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Services List</h2>
      </div>
      <TableView
        header={Service_Headers}
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

export default ServicesList;

