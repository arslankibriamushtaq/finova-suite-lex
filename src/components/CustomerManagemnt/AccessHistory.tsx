import { Customer_List_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { DatePicker } from "antd";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Images } from "../Config/Images";
import { getAccessHistory } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

const AccessHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any>();
  const [editRowId, setEditRowId] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const fetchAccessHistory = async () => {
    try {
      const res = await getAccessHistory(page, pageSize);
      if (res.data.data) {
        const data = res.data.data;
        setHistory(data);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      } else {
        throw new Error("No record found!");
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    fetchAccessHistory();
    return () => {};
  }, [page]);

  const mappedData = history
    ? history.map((item: any) => {
        return {
          AccessedBy: item.accessedBy,
          AccessDate: item.accessedDate,
        };
      })
    : [];
  const Access_History_Header = [
    {
      name: "Accessed By",
      cell: (row: any) => <div>{row.AccessedBy}</div>,
    },
    {
      name: "Access Date",
      cell: (row: any) => <div>{row.AccessDate}</div>,
    },
  ];
  return (
    <>
      <div className="cs-table p-4">
        <DynamicHeaderStructure title={"Account Access History"} />
        <TableHeaderFilter />
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Access_History_Header}
          data={mappedData}
        />
      </div>
    </>
  );
};
export default AccessHistory;
