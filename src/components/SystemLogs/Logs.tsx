import { SetStateAction, useEffect, useState } from "react";

import {
 
  Select,
 
  Switch,

} from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  addDepartments,
  updateDepartments,
  deleteDepartment,
} from "../../redux/apis/apisCrud";


const { Option } = Select;
const Logs = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState();




 

  
  // Close popup when clicking outside
const Activity_Loans_Header = [
  {
    name: "Sr",
    selector: (row: { sr: number }) => row.sr,
    sortable: true,
    width: "10%",
  },
  {
    name: "Date",
    selector: (row: { date: string }) => row.date,
    sortable: true,
    width: "20%",
  },
  {
    name: "All",
    selector: (row: { all: number }) => row.all,
    sortable: true,
    width: "10%",
  },
  {
    name: "Emergency",
    selector: (row: { emergency: number }) => row.emergency,
    sortable: true,
    width: "10%",
  },
  {
    name: "Alert",
    selector: (row: { alert: number }) => row.alert,
    sortable: true,
    width: "10%",
  },
  {
    name: "Critical",
    selector: (row: { critical: number }) => row.critical,
    sortable: true,
    width: "10%",
  },
  {
    name: "Error",
    selector: (row: { error: number }) => row.error,
    sortable: true,
    width: "10%",
  },
  {
    name: "Warnings",
    selector: (row: { warnings: number }) => row.warnings,
    sortable: true,
    width: "10%",
  },
  {
    name: "Notice",
    selector: (row: { notice: number }) => row.notice,
    sortable: true,
    width: "10%",
  },
];

  useEffect(() => {
    getDepartments();
  }, [page, pageSize, searchTerm]);

  const getDepartments = async () => {
    // setSkelitonLoading(true);
    // try {
    //   const res = await getAlldepartments(
    //     page,
    //     pageSize,
    //     searchTerm,
    //     selectedFilters
    //   );
    //   if (res) {
    //     const data = res?.data?.data?.data;
    //     setData(data || []);
    //     setSkelitonLoading(false);
    //     setTotalRows(data.length || 0);
    //     setFrom(1);
    //     setTo(data.length || 0);
    //     setPage(1);
    //     setTotalPage(1);
    //   }
    // } catch (error: any) {
    //   console.error("Error fetching  Departments:", error);
    //   setSkelitonLoading(false);
    // }
  };
  useEffect(() => {
    // getDepartments();
  }, [page, pageSize]);
  const dummydata = [
  {
    date: "02-01-2025",
    all: 28,
    emergency: 0,
    alert: 0,
    critical: 0,
    error: 2,
    warnings: 0,
    notice: 0,
  },
  {
    date: "02-01-2025",
    all: 3,
    emergency: 0,
    alert: 0,
    critical: 0,
    error: 3,
    warnings: 0,
    notice: 0,
  },
  {
    date: "02-01-2025",
    all: 28,
    emergency: 0,
    alert: 0,
    critical: 0,
    error: 2,
    warnings: 0,
    notice: 0,
  },
  {
    date: "02-01-2025",
    all: 3,
    emergency: 0,
    alert: 0,
    critical: 0,
    error: 3,
    warnings: 0,
    notice: 0,
  },
  {
    date: "02-01-2025",
    all: 28,
    emergency: 0,
    alert: 0,
    critical: 0,
    error: 2,
    warnings: 0,
    notice: 0,
  },
];

  const mappedData =
    dummydata &&
    dummydata?.map((item: any, index: number) => {
      return {
        sr: index + 1,
        date: item.date,
        all: item.all,
        emergency: item.emergency,
        alert: item.alert,
        critical: item.critical,
        error: item.error,
        warnings: item.warnings,
        notice: item.notice,
      };
    });

  const options = [{ label: "Name", value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {
    setSelectedFilters(value[0]);
    // You can trigger filtering logic here
  };
  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
      >
        <div className="d-flex mb-3 col-12 filter-select">
          <Select
            mode="tags"
            style={{ width: "15%", borderTopRightRadius: "0px" }}
            onChange={handleChange}
            placeholder="Filter"
            tokenSeparators={[","]}
            suffixIcon={<FaFilter />}
            options={options}
          />

          <div className="d-flex gap-2 w-100">
            <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
              <img src={Images.searchIconGray} alt="" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
                className="p-2"
                placeholder="Search..."
              />
            </div>

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
    </>
  );
};

export default Logs;
