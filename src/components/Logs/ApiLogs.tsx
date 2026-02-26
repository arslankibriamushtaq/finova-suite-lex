import { useEffect, useState } from "react";

import { Dropdown, Menu, Button } from "antd";
import TableView from "../TableView/TableView";

import { useNavigate } from "react-router-dom";
import {
  GetAvailableApiLogDates,
} from "../../redux/apis/apisCrudLms";
import {
  DownOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

const ApiLogs = () => {
  const [buisnessCustomers, setBuinsessCustomers] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  // Handle form input changes dynamically
  const [loading, setLoading] = useState(false);

  const getAllCustomers = async () => {
    try {
      setSkelitonLoading(true);
      const response = await GetAvailableApiLogDates(page, pageSize);
      if (response) {
        const values = response?.data?.data;
        setBuinsessCustomers(values || []);
        
        // Extract pagination data from API response
        const pageInfo = response?.data?.pageInfo;
        const totalItems = pageInfo?.totalItems || 0;
        setTotalRows(totalItems);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      toast.error(error?.message);
      // Reset pagination values on error
      setTotalRows(0);
      setFrom(0);
      setTo(0);
      // setIndividualModal(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const mappedData =
    buisnessCustomers &&
    buisnessCustomers.map((item: any) => {
      return {
        date: item,
        // accountNumber: item.accountNumber,
        // CustomerID: item.customerId || "-",
        // NationalId: item.nationalId || "-",
        // Name: item.name || "-",
        // Type: item.type || "-",
        // PhoneNo: item.phoneNo || "-",
        // // Email: item.email.toLowerCase() !== 'string' && item.email || "-",
        // // PartnerName: item.channel || "-",
        // // status: item.status || "-",
        // date: item.date || "-"
      };
    });
  useEffect(() => {}, []);
  useEffect(() => {
    getAllCustomers();
  }, [pageSize, page]);

  const handleChange = (key: string, row: any) => {
    if (key === "view") {
        navigate(`/lms/Logs/ApiLogsByDate/${row.date}/apiLogs`);
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View
      </Menu.Item>
    </Menu>
  );
  function formatDate(dateString: any) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const Customer_ALL_List_Header = [
    {
      name: "Date",
      selector: (row: any) => formatDate(row.date),
      width: "80%",
    },

    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      {loading && <Loader />}
      <div>
        <div className="d-flex col-12">
          <div className="col-10">
            <div className=" mt-4">
              <h1 style={{ fontSize: "22px" }}>Api Logs</h1>
            </div>
          </div>
        </div>

        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          header={Customer_ALL_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
      </div>
    </>
  );
};

export default ApiLogs;
