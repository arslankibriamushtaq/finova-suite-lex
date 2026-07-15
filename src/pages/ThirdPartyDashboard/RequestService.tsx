import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "antd";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getRequestService, getServicesList } from "../../redux/apis/apisThirdParty";

const { Option } = Select;

const RequestService = () => {
  const { t } = useTranslation("connector");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      getRequestsList();
    } else {
      setData([]);
    }
  }, [selectedService]);

  const fetchServices = async () => {
    try {
      const response = await getServicesList(100, 1);
      if (response?.data?.success) {
        const servicesData = response.data.data;
        let servicesArray: any[] = [];
        
        if (servicesData?.services?.data && Array.isArray(servicesData.services.data)) {
          servicesArray = servicesData.services.data;
        } else if (Array.isArray(servicesData)) {
          servicesArray = servicesData;
        } else if (servicesData?.services && Array.isArray(servicesData.services)) {
          servicesArray = servicesData.services;
        } else if (servicesData?.data?.services && Array.isArray(servicesData.data.services)) {
          servicesArray = servicesData.data.services;
        }
        
        setServices(servicesArray);
        if (servicesArray.length > 0) {
          setSelectedService(servicesArray[0].id.toString());
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch services:", error);
    }
  };

  const getRequestsList = async () => {
    if (!selectedService) return;
    
    try {
      setSkelitonLoading(true);
      const response = await getRequestService(parseInt(selectedService));
      if (response?.data?.success) {
        const requestsData = response.data.data;
        let requestsArray: any[] = [];
        
        if (Array.isArray(requestsData)) {
          requestsArray = requestsData;
        } else if (requestsData?.data && Array.isArray(requestsData.data)) {
          requestsArray = requestsData.data;
        } else if (requestsData?.requests && Array.isArray(requestsData.requests)) {
          requestsArray = requestsData.requests;
        }
        setData(requestsArray);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("requestService.toast.fetchFailed"));
      setSkelitonLoading(false);
    }
  };

  const Headers = [
    {
      name: t("requestService.col.id"),
      selector: (row: any) => row.id || "-",
      sortable: true,
      width: "80px",
    },
    {
      name: t("requestService.col.apiName"),
      selector: (row: any) => row.api_name || row.name || row.api?.name || "-",
      sortable: true,
    },
    /* {
      name: "Service",
      selector: (row: any) => row.service_name || row.service?.name || "-",
      sortable: true,
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
    /* {
      name: "Date",
      selector: (row: any) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
      sortable: true,
      width: "120px",
    }, */
  ];

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("requestService.title")}</h2>
        <Select
          /* className="form-control" */
          style={{ width: 250 }}
          placeholder={t("requestService.placeholder.selectService")}
          value={selectedService || undefined}
          onChange={(value) => setSelectedService(value)}
        >
          {services.map((service: any) => (
            <Option key={service.id} value={service.id.toString()}>
              {service.name}
            </Option>
          ))}
        </Select>
      </div>
      
      {selectedService ? (
        <TableView
          header={Headers}
          data={data}
          totalRows={data.length || 0}
          isLoading={skelitonLoading}
          from={data.length > 0 ? 1 : 0}
          page={1}
          totalPage={1}
          setPage={() => {}}
          pageSize={data.length || 10}
          setPageSize={() => {}}
          to={data.length || 0}
        />
      ) : (
        <div className="text-center p-4">{t("requestService.empty")}</div>
      )}
    </div>
  );
};

export default RequestService;

