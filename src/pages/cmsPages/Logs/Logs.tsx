import { useEffect, useState } from "react";
import { Button, Input} from "antd";
import TableView from "../../../components/TableView/TableView";
import { getLogs } from "../../../redux/apis/apisCrudCms";
import {
    EyeOutlined,  
  SearchOutlined,
} from "@ant-design/icons";
const Logs = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [tableData, setTableData] = useState<any>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  useEffect(() => {
    getData();
  }, [page, pageSize]);

  const Table_Headers = [
    {
      name: "Date",
      width: "30%",

      selector: (row: { date: string }) => row.date || "-",
    },
    {
      name: "Log Errors",
      width: "30%",
      selector: (row: { logErrors: string }) => row.logErrors || "-",
    },
    {
      name: "Log Infos",
      width: "30%",
      selector: (row: { logInfos: string }) => row.logInfos || "-",
    },
    {
        name: "Actions",
        width: "10%",
        selector: (row: { actions: string }) => row.actions || "-",
        cell: (row: any) => (
                <Button className="gradient-btn" type="primary"><EyeOutlined /></Button>
        ),
    }
  ];

  const mappedData =
    tableData &&
    tableData.map((item: any, index: number) => {
      return {
        id: item?.id,
        srNo: index + 1 + (page - 1) * pageSize,
        date: item?.created_at,
        logErrors: item?.log_errors,
        logInfos: item?.log_infos,
      };
    });
  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const resposne = await getLogs(page, pageSize);
      if (resposne) {
        const data = resposne?.data?.data;
        // setTotalRows(resposne?.data?.data?.pagination?.total || 0);
        // setFrom(resposne?.data?.data?.pagination?.from || 0);
        // setTo(resposne?.data?.data?.pagination?.to || 0);
        // setTotalPage(resposne?.data?.data?.pagination?.last_page || 0);
        setTableData(data || []);
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
      <div className="d-flex col-12 justify-content-between align-items-center mb-3">
        <div className="col-8">
          <h5 className="mb-2">Factoring Valley CMS LOGS - Summary</h5>
        </div>
      
      </div>

      <div className="cs-table">
        <TableView
          setPage={setPage}
          header={Table_Headers}
          setPageSize={setPageSize}
          data={mappedData}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          to={to}
          totalPage={totalPage}
        />
      </div>

    </>
  );
};

export default Logs;
