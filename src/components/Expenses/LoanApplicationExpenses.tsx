import React, { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { Dropdown, Button, Menu } from "antd";
import {
  DownOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import {
    GetAllIndividualCustomer, 
} from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";
import { useNavigate } from "react-router-dom";
const LoanApplicationExpenses = () => {
  const navigate = useNavigate(); // Create navigate function
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);

  

  const handleGetData = async () => {
    try {
      setSkelitonLoading(true);
     
      const res = await GetAllIndividualCustomer(page,pageSize);
      if (res?.data?.success) {
        const data = res.data.data;
        // const newdata= data.filter((item)=>item.expenseType===2)
        setAllCallActivity(data || []);
        
        // Extract pagination data from API response
        const pageInfo = res?.data?.pageInfo;
        const totalItems = pageInfo?.totalItems || 0;
        setTotalRows(totalItems);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      } else {
        toast.error(res?.data?.notificationMessage);
        // Reset pagination values on error
        setTotalRows(0);
        setFrom(0);
        setTo(0);
      }
    } catch (error: any) {
      toast.error(error?.message);
      // Reset pagination values on error
      setTotalRows(0);
      setFrom(0);
      setTo(0);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
function formatDate(dateString: any) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const mappedData =
    allCallActivity &&
    allCallActivity.map((item: any) => {
      return {
        name: item?.name,
        nationalId: item?.nationalId,
        phone : item?.phone,
        date :item?.created && formatDate(item?.created),
        // expenseType: item.expenseType,
      };
    });

  useEffect(() => {
    handleGetData();
  }, [page, pageSize]);
  const handleChange = (key: string, row: any) => {
    if (key === "View") {
        navigate(`/lms/Expenses/LoanApplicationExpenseDetail/${row.nationalId}`);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="View" icon={<EyeOutlined/>}>
        View
      </Menu.Item>
    </Menu>
  );
  const Call_Activity_Header = [
    {
      name: "Name",
      cell: (row: any) => row.name,
    //   width: "40%",
    },
    {
      name: "Iqama ID",
      selector: (row: { nationalId: any }) => row.nationalId || "-",
    //   width: "40%",
    },
    {
      name: "Phone No",
      selector: (row: { phone: any }) => row.phone || "-",
    //   width: "40%",
    },
    {
      name: "Date",
      selector: (row: { date: any }) => row.date || "-",
    //   width: "40%",
    },
    
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              border: "none",
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
    
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            from={from}
            to={to}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
        </div>
   
    </>
  );
};

export default LoanApplicationExpenses;
