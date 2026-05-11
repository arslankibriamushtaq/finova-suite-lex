import { useEffect, useState } from "react";
import { Button, Input, Dropdown, Menu } from "antd";
import TableView from "../../../components/TableView/TableView";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { getCollectrolData } from "../../../redux/apis/apisCrudLms";
import Loader from "../../../components/Loader/Loader";
import { formatDate, NumberFormatter } from "../../../App";

const CollateralManagement = () => {
  const [searchValue, setSearchValue] = useState("");
  const [totalDataCollectrol, setTotalDataCollectrol] = useState<any>("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [buisnessForm, setBusinessForm] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editRowId, setEditRowId] = useState(null);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const getAllCollateralData = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getCollectrolData(page, pageSize);
      if (response) {
        setTotalDataCollectrol(response?.data?.data || []);
        setTotalRows(response?.data.pageInfo.totalItems || 0);
      }
    } catch (error) {
      console.error("Error:", error);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  // data
  // header data
  const Account_Documents_List_Header = [
    // {
    //   name: "Collateral ID",
    //   selector: (row: any) =>
    //     editRowId === row.id ? <Input name="Collateral ID" /> : row.id,
    // },
    {
      name: "Application Key",
      selector: (row: any) =>
        editRowId === row.applicationKey ? (
          <Input name="Application ID" />
        ) : (
          row.applicationKey
        ),
    },
    {
      name: "Account Key",
      selector: (row: any) =>
        editRowId === row.accountKey ? (
          <Input name="Account ID" />
        ) : (
          row.accountKey
        ),
    },
    {
      name: "Collateral Type",
      selector: (row: any) =>
        editRowId === row.collateralType ? (
          <Input name="Collateral Type" />
        ) : row.collateralType == 1 ? (
          "Vehicle"
        ) : row.collateralType == 2 ? (
          "Cash&Cash"
        ) : (
          "Property"
        ),
    },
    {
      name: "Market Value",
      selector: (row: any) =>
        editRowId === row.marketValue ? (
          <Input name="Market Value" />
        ) : (
          <NumberFormatter value={row.marketValue} />
        ),
    },
    {
      name: "Valuation Amount",
      selector: (row: any) =>
        editRowId === row.valuationAmount ? (
          <Input
            name="Valuation Amount"
            value={editFormData.DocketNo}
            onChange={handleInputChange}
          />
        ) : (
          <NumberFormatter value={row.valuationAmount} />
        ),
    },

    {
      name: "Valuation Date",
      selector: (row: any) =>
        editRowId === row.valuationDate ? (
          <Input
            name="Valuation Date"
            value={editFormData.TrackingNo}
            onChange={handleInputChange}
          />
        ) : (
          formatDate(row.valuationDate)
        ),
    },

    {
      name: "Availability",
      width: "150px",
      cell: (row: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "0.2rem 1rem",
            borderRadius: "12px",
            backgroundColor:
              row.availabilityStatus == "1"
                ? "var(--color-status-red-soft)"
                : row.availabilityStatus === "2"
                  ? "var(--color-status-green)"
                  : "var(--color-status-sky)",
            color: "var(--primary-foreground)",
            cursor: row.Status === "Active" ? "pointer" : "default",
          }}
          onClick={() => {
          }}
        >
          {row.availabilityStatus == "1"
            ? "Locked"
            : row.availabilityStatus == "2"
              ? "Release"
              : "Available"}
        </div>
      ),
    },
    {
      name: "Status",
      width: "150px",
      cell: (row: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "0.2rem 1rem",
            borderRadius: "12px",
            backgroundColor: row.Status ? "var(--color-status-green)" : "var(--color-status-red-soft)",
            color: "var(--primary-foreground)",
            cursor: row.Status ? "pointer" : "default",
          }}
        >
          {row.Status ? "Active" : "Inactive"}
        </div>
      ),
    },

    {
      name: "Action",
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
  const deleteRecord = async (id: any) => {
    try {
      const requestId = "0432a396-773d-4e6c-8d2f-5ad5017b40e4";
      const headers = {
        "Request-Id": requestId,
      };
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/api/Collateral/Delete?collateralId=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Request-Id": "94a2aca6-ab1e-4ba9-8bd8-ba3b82b5f9c1",
          },
        }
      );
      if (response.data.notificationMessage) {
        toast.success(response.data.notificationMessage);
        const timeoutId = setTimeout(() => {
          getAllCollateralData();
          return () => clearTimeout(timeoutId);
        }, 7000); // 7 seconds
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleChange = (key: string, row: any) => {
    if (key == "Edit") {
      navigate(`/lms/viewdetails/CollateralManagement/Edit/${row.id}`);
    }
    if (key === "ApplicationView") {
      navigate(`/lms/viewdetails/CollateralManagement/allocation/${row.id}`);
      //   handleEditClick(row);
    } else if (key === "Delete") {
      deleteRecord(row.id);
    }
  };
  const handleView = (row: any) => {
    // setEditRowId(row.CustomerID);
    // setEditFormData({ ...row });
    navigate(`/lms/viewdetails/collateralmanagement/${row.CustomerID}`);
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="ApplicationView" icon={<EditOutlined />}>
        View
      </Menu.Item>
      <Menu.Item key="Edit" icon={<EyeOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="Delete" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  // header data

  const data = [
    {
      FileName: "65498712",
      DocumentType: "65498712",
      DocumentSubType: "65498712",
      AccountNo: "Property",
      Attach: "SAR 150,000",
      DocketNo: "SAR 120,000",
      Status: "Approved",
      TrackingNo: "9/9/2024",
    },
    {
      FileName: "65498712",
      DocumentType: "65498712",
      DocumentSubType: "65498712",
      AccountNo: "Vehicle",
      Attach: "SAR 150,000",
      DocketNo: "SAR 120,000",
      Status: "Pending",
      TrackingNo: "9/9/2024",
    },
    {
      FileName: "65498712",
      DocumentType: "65498712",
      DocumentSubType: "65498712",
      AccountNo: "Vehicle",
      Attach: "SAR 150,000",
      DocketNo: "SAR 120,000",
      Status: "Rejected",
      TrackingNo: "9/9/2024",
    },
  ];
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };
  // data
  const customSearchInput = (
    <Input
      placeholder="Search"
      value={searchValue}
      prefix={<FaSearch />}
      onChange={(e) => setSearchValue(e.target.value)}
    />
  );
  const mappedData =
    totalDataCollectrol &&
    totalDataCollectrol?.map((item: any) => {
      return {
        id: item.collateralId ? item.collateralId : "-",
        applicationKey: item.applicationKey ? item.applicationKey : "-",
        accountKey: item.accountKey ? item.accountKey : "-",
        collateralType: item.collateralType ? item.collateralType : "-",
        marketValue: item.marketValue ? item.marketValue : "-",
        valuationAmount: item.valuationAmount ? item.valuationAmount : "-",
        valuationDate: item.valuationDate ? item.valuationDate : "-",
        availabilityStatus: item.availabilityStatus
          ? item.availabilityStatus
          : "-",
        Status: item.status,
      };
    });
  useEffect(() => {
    getAllCollateralData();
  }, [page, pageSize]);
  // const button = [{ title: "view" }];
  return (
    <div className="service collateral-management-page">
      {loading && <Loader />}
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Collaterals</h3>
      </div>

      {/* Filters card */}
      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 w-100">
          <Button
            style={{ borderRadius: 8, border: "transparent", height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            className="application-btn"
            onClick={() => navigate("/lms/addcollateral/collateralmanagement")}
          >
            Add Collateral
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="bg-white"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          header={Account_Documents_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
        {totalDataCollectrol?.length == 0 && !skelitonLoading && (
          <div
            className="d-flex justify-content-center py-5"
            style={{ color: "var(--destructive)" }}
          >
            No data found
          </div>
        )}
      </div>
    </div>
  );
};

export default CollateralManagement;
