import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import TableView from "../TableView/TableView";
import { getActivityLogs } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { formatDate } from "../../App";
import { useTranslation } from "react-i18next";

const ActivityLogFinancing = () => {
  const { t } = useTranslation("financing");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const Activity_Loans_Header = [
    {
      name: t("col.id"),
      selector: (row: { id: any }) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: t("col.applicationNo"),
      selector: (row: { application_no: any }) => row.application_no,
      sortable: true,
      width: "200px",
    },
    {
      name: t("col.time"),
      selector: (row: { time: any }) => row.time,
      sortable: true,
      width: "120px",
    },
    {
      name: t("common:date"),
      selector: (row: { date: any }) => row.date,
      sortable: true,
      width: "150px",
    },
    {
      name: t("col.updatedBy"),
      selector: (row: { updated_by: any }) => row.updated_by,
      sortable: true,
      width: "150px",
    },
    {
      name: t("col.event"),
      cell: (row: { event: any }) => (
        <div style={{ whiteSpace: "normal", padding: "8px 0", lineHeight: "1.5" }}>
          {row.event}
        </div>
      ),
      width: "300px",
    },
    {
      name: t("col.changes"),
      cell: (row: { changes: any }) => (
        <div style={{ whiteSpace: "normal", padding: "8px 0", lineHeight: "1.5" }}>
          {row.changes}
        </div>
      ),
      width: "300px",
    },
  ];

  const getActivityLogsList = async () => {
    try {
      setSkelitonLoading(true);
      
      // Format dates for API if they exist, otherwise pass empty strings
      const fromDateParam = fromDate ? formatDate(fromDate) : "";
      const toDateParam = toDate ? formatDate(toDate) : "";

      const response = await getActivityLogs(fromDateParam, toDateParam);
      if (response) {
        const data = response?.data?.data?.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page || 1);
        setTotalPage(response?.data?.data?.last_page || 0);
      }
    } catch (error: any) {
      toast.error(error?.message || t("toast.fetchActivityLogsFailed"));
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getActivityLogsList();
  }, [page, pageSize, fromDate, toDate]);

  // Parse changes object and format it as a readable string
  const formatChanges = (changes: any) => {
    if (!changes) return '-';
    
    // If changes is an array
    if (Array.isArray(changes)) {
      if (changes.length === 0) return '-';
      return changes.map((change: any) => {
        if (typeof change === 'object') {
          const changesList = Object.entries(change).map(([key, value]) => {
            return `${key}: ${value}`;
          });
          return changesList.join(', ');
        }
        return change;
      }).join(' | ');
    }
    
    // If changes is an object
    if (typeof changes === 'object') {
      const changesList = Object.entries(changes).map(([key, value]) => {
        return `${key}: ${value}`;
      });
      return changesList.join(', ');
    }
    
    return changes.toString();
  };

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item.id,
        application_no: item?.application_no || "-",
        time: item?.time || "-",
        date: item?.date || "-",
        updated_by: item?.updated_by || "-",
        event: item?.event || "-",
        changes: formatChanges(item?.changes),
      };
    });

  return (
    <div className="service">
      <div className="d-flex justify-content-end col-12 mb-1">
        <div className="d-flex gap-2 align-items-center">
          <DatePicker
            className="date-picker"
            placeholder={t("common:from")}
            value={fromDate}
            onChange={(date) => {
              setFromDate(date);
            }}
            allowClear
          />
          <DatePicker
            className="date-picker"
            placeholder={t("common:to")}
            value={toDate}
            onChange={(date) => {
              setToDate(date);
            }}
            allowClear
          />
        </div>
      </div>

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
  );
};

export default ActivityLogFinancing;
