import { useEffect, useRef, useState } from "react";
import { Input } from "antd";
import TableView from "../../../components/TableView/TableView";
import { getReports } from "../../../redux/apis/apisCrudCms";
import {
  SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
const Reports = () => {
  const { t } = useTranslation("cms");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [dayData, setDayData] = useState<any>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    getData();
  }, [page, pageSize]);
  useEffect(() => {
    // Skip on initial mount only
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (page === 1) {
        getData();
      } else {
        setPage(1); // Reset to first page, which will trigger getData via the other useEffect
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchValue]);
  const Table_Headers = [
    {
      name: t("fields.srNo"),
      selector: (row: { srNo: string }) => row.srNo || "-",
    },
    {
      name: t("fields.complainerName"),
      selector: (row: { complainerName: string }) => row.complainerName || "-",
    },
    {
      name: t("fields.contactNo"),
      selector: (row: { contactNo: string }) => row.contactNo || "-",
    },
    {
      name: t("common:description"),
      selector: (row: { description: string }) => row.description || "-",
    },
    {
      name: t("fields.department"),
      selector: (row: { department: string }) => row.department || "-",
    },
    {
      name: t("common:status"),
      selector: (row: { status: string }) => row.status || "-",
    },
    {
      name: t("common:category"),
      selector: (row: { category: string }) => row.category || "-",
    },
    {
      name: t("common:createdAt"),
      selector: (row: { createdAt: string }) => row.createdAt || "-",
    },
    {
      name: t("fields.escalations"),
      selector: (row: { escalations: string }) => row.escalations || "-",
    },
  ];

  // Map status_id to readable status
  const getStatusName = (statusId: number): string => {
    const statusMap: { [key: number]: string } = {
      1: t("reports.status.open"),
      2: t("reports.status.inProgress"),
      3: t("reports.status.resolved"),
      4: t("reports.status.closed"),
      5: t("reports.status.cancelled"),
    };
    return statusMap[statusId] || t("reports.status.unknown");
  };

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const mappedData =
    dayData &&
    dayData.map((item: any, index: number) => {
      return {
        id: item.id,
        srNo: item.ticket_number || `#${index + 1}`,
        complainerName: item.customer?.name || "-",
        contactNo: item.customer?.contact_no || "-",
        description: item.description || "-",
        department: item.department?.name || "-",
        status: getStatusName(item.status_id),
        category: item.category?.title || "-",
        createdAt: formatDate(item.created_at),
        escalations: item.escalation_count !== null && item.escalation_count !== undefined 
          ? String(item.escalation_count) 
          : "-",
      };
    });

  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getReports(page, pageSize, 1, searchValue);
      if (response) {
        const values = response?.data?.data?.tickets;
        setDayData(values || []);
        setTotalRows(response?.data?.data?.pagination?.total || 0);
        setFrom(response?.data?.data?.pagination?.from || 0);
        setTo(response?.data?.data?.pagination?.to || 0);
        setTotalPage(response?.data?.data?.pagination?.last_page || 0);

      }
        } catch (error: any) {
      setSkelitonLoading(false);
    }
    finally {
      setSkelitonLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-0">{t("reports.title")}</h5>
        </div>
        <div className="text-end">

          <button
            className="theme-btn-next"
            // onClick={() => {
            //   setModal(true);
            // }}
          >
            {t("reports.exportCsv")}
          </button>
          <Input
            placeholder={t("reports.searchReports")}
            value={searchValue}
            prefix={<SearchOutlined />} style={{ width: "300px", height: "33px", marginLeft: "10px" }}
            onChange={(e: any) => {
              setSearchValue(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="cs-table">
        <TableView
         setPage={setPage}
         setPageSize={setPageSize}
         page={page}
         pageSize={pageSize}
         totalRows={totalRows}
         header={Table_Headers}
         data={mappedData}
         isLoading={skelitonLoading}
         from={from}
         to={to}
         totalPage={totalPage}
        />
      </div>
    </>
  );
};

export default Reports;
