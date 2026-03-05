import { useState, useEffect } from "react";
import { Select } from "antd";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getServiceApis, getServicesList } from "../../redux/apis/apisThirdParty";
import Loader from "../../components/Loader/Loader";

const { Option } = Select;

const ServicesApis = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(true);
  const [data, setData] = useState<any>([]);
  const [services, setServices] = useState<any>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const ServiceApis_Headers = [
    {
      name: "ID",
      selector: (row: { id: any }) => row.id,
      sortable: true,
      width: "100px",
    },
    {
      name: "API Name",
      selector: (row: { apiName: any }) => row.apiName,
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
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            backgroundColor: row.status === 1 ? "var(--color-success)" : "var(--color-error)",
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

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchServiceApis(selectedServiceId);
    } else {
      setData([]);
      setTotalRows(0);
    }
  }, [selectedServiceId]);

  const fetchServices = async () => {
    try {
      const response = await getServicesList(100, 1); // Fetch all services
      if (response?.data?.success) {
        let servicesData;
        if (response.data.data?.services) {
          servicesData = response.data.data.services;
        } else if (response.data.data?.data) {
          servicesData = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          const servicesList = response.data.data || [];
          setServices(servicesList);
          // Auto-select first service
          if (servicesList.length > 0 && !selectedServiceId) {
            setSelectedServiceId(servicesList[0].id);
          }
          return;
        } else {
          servicesData = response.data.data;
        }
        const finalServices = servicesData?.data || servicesData || [];
        setServices(finalServices);
        // Auto-select first service
        if (finalServices.length > 0 && !selectedServiceId) {
          setSelectedServiceId(finalServices[0].id);
        } else if (finalServices.length === 0) {
          // No services found, stop loading
          setSkelitonLoading(false);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch services:", error);
      setSkelitonLoading(false);
    }
  };

  const fetchServiceApis = async (serviceId: number) => {
    try {
      setSkelitonLoading(true);
      const response = await getServiceApis(serviceId);
      
      if (response?.data?.success) {
        const apisData = response.data.data;
        
        // Handle different response structures
        let apisArray;
        if (Array.isArray(apisData)) {
          apisArray = apisData;
        } else if (apisData?.data && Array.isArray(apisData.data)) {
          apisArray = apisData.data;
        } else if (apisData?.apis && Array.isArray(apisData.apis)) {
          apisArray = apisData.apis;
        } else {
          apisArray = [];
        }

        setData(apisArray);
        setTotalRows(apisArray.length || 0);
        setFrom(1);
        setTo(apisArray.length || 0);
        setPage(1);
        setTotalPage(1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch service APIs");
      setSkelitonLoading(false);
    }
  };

  const mappedData = data?.map((item: any) => ({
    id: item?.id || "-",
    apiName: item?.name || item?.api_name || "-",
    url: item?.url || item?.endpoint || "-",
    method: item?.method || item?.http_method || "GET",
    status: item?.status || 0,
  }));

  return (
    <>
    {skelitonLoading && <Loader />}
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Services API</h2>
      </div>
      
      <div className="mb-3">
        <label style={{ marginBottom: "8px", display: "block" }}>Select Service:</label>
        <Select
          style={{ width: "300px" }}
          placeholder="Select a service"
          value={selectedServiceId}
          onChange={(value) => setSelectedServiceId(value)}
        >
          {services.map((service: any) => (
            <Option key={service.id} value={service.id}>
              {service.name}
            </Option>
          ))}
        </Select>
      </div>

      {selectedServiceId && (
        <TableView
          header={ServiceApis_Headers}
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
      )}

      {!selectedServiceId && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-subtle)" }}>
          Please select a service to view its APIs
        </div>
      )}
    </div>
    </>
  );
};

export default ServicesApis;
