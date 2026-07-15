import { useState } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../../../../components/TableView/TableView";
import Loader from "../../../../components/Loader/Loader";

const Logs = () => {
  const { t } = useTranslation("investor");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const Headers = [
    {
      name: t("logs.col.id"),
      selector: (row: any) => row.id || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: t("logs.col.action"),
      selector: (row: any) => row.action || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: t("common:description"),
      selector: (row: any) => row.description || "-",
      sortable: true,
      width: "300px",
    },
    {
      name: t("logs.col.user"),
      selector: (row: any) => row.userName || row.user || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: t("logs.col.ipAddress"),
      selector: (row: any) => row.ipAddress || row.ip || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: t("common:createdAt"),
      selector: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      sortable: true,
      width: "180px",
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="service">
      <h2 className="mb-3 mt-2 d-flex justify-content-start">{t("logs.title")}</h2>
      <TableView
        header={Headers}
        data={data}
        totalRows={totalRows}
        isLoading={loading}
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

export default Logs;
