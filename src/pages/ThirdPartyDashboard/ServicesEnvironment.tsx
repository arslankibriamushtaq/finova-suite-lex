import { useState, useEffect } from "react";
import { Select } from "antd";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getServicesApisWithEnvironments, getServicesList, getServiceApis } from "../../redux/apis/apisThirdParty";
import Loader from "../../components/Loader/Loader";

const { Option } = Select;

interface ApiOption {
  id: number;
  name: string;
  serviceName?: string;
}

const ServicesEnvironment = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [loadingApis, setLoadingApis] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [data, setData] = useState<any>([]);
  const [services, setServices] = useState<any>([]);
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedApiId, setSelectedApiId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const ServiceEnvironment_Headers = [
    {
      name: "ID",
      selector: (row: { id: any }) => row.id,
      sortable: true,
      width: "100px",
    },
    {
      name: "Environment",
      selector: (row: { environment: any }) => row.environment || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "URL",
      selector: (row: { url: any }) => row.url,
      sortable: true,
      width: "350px",
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
            borderRadius: "2px",
            backgroundColor: row.status === "Active" || row.status === 1 ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status || "Inactive"}
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
      fetchApisForService(selectedServiceId);
    } else {
      setApiOptions([]);
      setSelectedApiId(null);
    }
  }, [selectedServiceId]);

  useEffect(() => {
    if (selectedApiId) {
      fetchApiEnvironments(selectedApiId);
    } else {
      setData([]);
      setTotalRows(0);
    }
  }, [selectedApiId]);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await getServicesList(100, 1);
      
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
          setLoadingServices(false);
          return;
        } else {
          servicesData = response.data.data;
        }
        
        const finalServices = servicesData?.data || servicesData || [];
        setServices(finalServices);
        
        // Auto-select first service
        if (finalServices.length > 0 && !selectedServiceId) {
          setSelectedServiceId(finalServices[0].id);
        }
      }
      
      setLoadingServices(false);
    } catch (error: any) {
      console.error("Failed to fetch services:", error);
      setLoadingServices(false);
    }
  };

  const fetchApisForService = async (serviceId: number) => {
    try {
      setLoadingApis(true);
      setSelectedApiId(null); // Reset selected API when service changes
      
      const response = await getServiceApis(serviceId);
      
      if (response?.data?.success) {
        const apisData = response.data.data;
        let apisArray: any[] = [];
        
        if (Array.isArray(apisData)) {
          apisArray = apisData;
        } else if (apisData?.data && Array.isArray(apisData.data)) {
          apisArray = apisData.data;
        } else if (apisData?.apis && Array.isArray(apisData.apis)) {
          apisArray = apisData.apis;
        }

        const serviceName = services.find((s: any) => s.id === serviceId)?.name || `Service ${serviceId}`;
        
        const formattedApis: ApiOption[] = apisArray.map((api: any) => ({
          id: api.id,
          name: api.name || api.api_name || `API ${api.id}`,
          serviceName: serviceName,
        }));

        setApiOptions(formattedApis);
        
        // Auto-select first API
        if (formattedApis.length > 0) {
          setSelectedApiId(formattedApis[0].id);
        }
      }
      
      setLoadingApis(false);
    } catch (error: any) {
      console.error(`Failed to fetch APIs for service ${serviceId}:`, error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch APIs");
      setLoadingApis(false);
    }
  };

  const fetchApiEnvironments = async (apiId: number) => {
    try {
      setSkelitonLoading(true);
      const response = await getServicesApisWithEnvironments(apiId);
      
      if (response?.data?.success) {
        const responseData = response.data.data;
        
        // The environments is an object with keys (environment names) and values (arrays of env objects)
        // Example: { "": [{id: 3, env: null, url: "...", ...}], "DEV": [...], "PROD": [...] }
        const environmentsObj = responseData?.environments || {};
        
        // Flatten all environments from all environment keys into a single array
        let environmentsArray: any[] = [];
        Object.keys(environmentsObj).forEach((envKey) => {
          const envArray = environmentsObj[envKey];
          if (Array.isArray(envArray)) {
            environmentsArray = environmentsArray.concat(envArray);
          }
        });

        setData(environmentsArray);
        setTotalRows(environmentsArray.length || 0);
        setFrom(environmentsArray.length > 0 ? 1 : 0);
        setTo(environmentsArray.length || 0);
        setPage(1);
        setTotalPage(1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch API environments");
      setSkelitonLoading(false);
    }
  };

  const mappedData = data?.map((item: any) => ({
    id: item?.id || "-",
    environment: item?.env || item?.environment || "-",
    url: item?.url || "-",
    method: item?.method || "-",
    status: item?.status || "Inactive",
  }));

  return (
    <>
      {(loadingServices || skelitonLoading ||loadingApis) && <Loader />}
      <div className="service">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Services Environment</h2>
        </div>
        <div className="d-flex gap-2 align-items-center mb-3">
        <div className="mb-3">
          <label style={{ marginBottom: "8px", display: "block" }}>Select Service:</label>
          <Select
            style={{ width: "400px" }}
            placeholder={loadingServices ? "Loading Services..." : "Select a service"}
            value={selectedServiceId}
            onChange={(value) => setSelectedServiceId(value)}
            loading={loadingServices}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase()) || false
            }
          >
            {services.map((service: any) => (
              <Option key={service.id} value={service.id}>
                {service.name}
              </Option>
            ))}
          </Select>
        </div>

        {selectedServiceId && (
          <div className="mb-3">
            <label style={{ marginBottom: "8px", display: "block" }}>Select API:</label>
            <Select
              style={{ width: "400px" }}
              placeholder={loadingApis ? "Loading APIs..." : "Select an API"}
              value={selectedApiId}
              onChange={(value) => setSelectedApiId(value)}
              loading={loadingApis}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase()) || false
              }
            >
              {apiOptions.map((api) => (
                <Option key={api.id} value={api.id}>
                  {api.name}
                </Option>
              ))}
            </Select>
          </div>
        )}
      </div>
        {selectedApiId && (
          <TableView
            header={ServiceEnvironment_Headers}
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
            Please select a service to view APIs
          </div>
        )}

        {selectedServiceId && !selectedApiId && apiOptions.length === 0 && !loadingApis && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-subtle)" }}>
            No APIs found for this service
          </div>
        )}
      </div>
    </>
  );
};

export default ServicesEnvironment;
