import { useEffect, useState } from "react";
import { Input} from "antd";
import TableView from "../../../components/TableView/TableView";
import { getDayBookReport } from "../../../redux/apis/apisCrudLms";
import {
  SearchOutlined,
} from "@ant-design/icons";
const Customers = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [dayData, setDayData] = useState<any>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    getCustomersData();
  }, [page, pageSize]);

  const getAllReportsReport = [
    {
      name: "Sr No.",
      width: "25%",

      selector: (row: { srNo: string }) => row.srNo || "-",
    },
    {
      name: "Name",
      width: "25%",

      selector: (row: { name: string }) => row.name || "-",
    },
    {
      name: "Contact No",
      width: "25%",
      selector: (row: { contactNo: string }) => row.contactNo || "-",
    },
    {
      name: "Status",
      width: "25%",
      selector: (row: { status: string }) => row.status || "-",
    },
  ];



  const mappedData =
    dayData &&
    dayData.map((item: any) => {
      return {
        id: item?.id,
        srNo: item?.srNo,
        name: item?.name,
        contactNo: item?.contactNo,
        status: item?.status,
      };
    });
  const getCustomersData = async () => {
    try {
      setSkelitonLoading(true);
      const resposne = await getDayBookReport(page, pageSize);
      if (resposne) {
        const data = resposne.data.data;
        setTotalRows(resposne?.data?.pageInfo?.totalItems || 0);

        setDayData(data);
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
      <div className="d-flex col-12 justify-content-between align-items-center">
        <div className="col-8">
          <h5 className="mb-0">Customers</h5>
        </div>
        <div className="col-4 text-end">
        <Input
            placeholder="Search by name"
            value={searchValue}
            prefix={<SearchOutlined />} style={{ width: "300px", height: "33px", marginRight: "10px" }}
            onChange={(e: any) => {
              setSearchValue(e.target.value);
            }}
          />
        
         
        </div>
      </div>

      <div className="cs-table">
        <TableView
          setPage={setPage}
          header={getAllReportsReport}
          setPageSize={setPageSize}
          data={mappedData}
          totalRows={totalRows}
          isLoading={skelitonLoading}
        />
      </div>

    </>
  );
};

export default Customers;
