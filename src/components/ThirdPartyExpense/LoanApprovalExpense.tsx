import React, { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { Dropdown, Button, Menu } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import {
    deleteThirdPartyServicesExpense,
  GetAllThirdPartyExpense,
 
} from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";
const LoanApprovalExpense = ({handleOpen,refreshData}: any) => {
  const [modalUpdate, setModalUpdate] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [expenseData, setExpenseData] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);

  

  const handleEditClick = (row: any) => {
    handleOpen(row);
    setEditRowId(row.thirdPartyServicesExpenseID);
    setModalUpdate(true);
  };
  const handleDelete = async (row: any) => {
    try {
      const res = await deleteThirdPartyServicesExpense(row.thirdPartyServicesExpenseID);
      if (res) {
        toast.success(res.data.notificationMessage);
        handleGetData(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGetData = async () => {
    try {
      setSkelitonLoading(true);
     
      const res = await GetAllThirdPartyExpense(page,pageSize,'LoanApproval');
      if (res?.data?.success) {
        const data = res.data.data;
        const newdata= data.filter((item: any)=>item.expenseCategory==='LoanApproval' || item.expenseCategory==='Both')
        setExpenseData(newdata || []);
        
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


  const mappedData =
    expenseData &&
    expenseData.map((item: any) => {
      return {
        thirdPartyServicesExpenseID:item?.id,
        serviceName: item?.serviceName,
        successServiceFee: item?.successServiceFee,
        failureServiceFee: item?.failureServiceFee,
        expenseCategory: item?.expenseCategory,
        channel:item?.channel,
        // Id:item?.id,
      };
    });

  useEffect(() => {
    handleGetData();
  }, [page, pageSize,refreshData]);
  const handleChange = (key: string, row: any) => {
    if (key === "Edit") {
      handleEditClick(row);
    } else if (key === "Delete") {
      handleDelete(row);
    } 
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="Edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="Delete" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  const Call_Activity_Header = [
    {
      name: "Name",
      cell: (row: any) => row.serviceName,
      width: "30%",
    },
    {
      name: "Success Service Fee",
      selector: (row: { successServiceFee: any }) => row.successServiceFee,
      width: "30%",
    },
    {
      name: "Failure Service Fee",
      selector: (row: { failureServiceFee: any }) => row.failureServiceFee,
      width: "30%",
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

export default LoanApprovalExpense;
