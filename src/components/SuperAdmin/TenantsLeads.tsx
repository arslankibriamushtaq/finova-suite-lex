import React, { useState, useEffect } from "react";
import { Button, Dropdown, Input, Menu, Select, Switch } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate } from "react-router-dom";
import {
  getAllBussinessCustomer,
  GetAllBusinessType,
  GetAllBusinessCategory,
  updateBusinessCustomerName,
  updateBusinessStopCorrespondance,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import {
  ClockCircleOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  CodeSandboxSquareFilled,
} from "@ant-design/icons";
import DynamicBreadcrumb from "./SuperAdminBreadCrumb";
const TenantsLeads = () => {
  const [editRowId, setEditRowId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState();
  const [editFormData, setEditFormData] = useState<any>({});
  const [buisnessCustomers, setBuinsessCustomers] = useState<any>();
  const [businessType, setbusinessType] = useState<any>();
  const [categoryId, setCategoryId] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const navigate = useNavigate();
  const [selectApplicable, setSelectApplicable] = useState<any>();
  const [searchValue, setSearchValue] = useState("");
  const [customerNameModal, setCustomerNameModal] = useState(false);
  const [updatedId, setUpdatedId] = useState("");
  const [updatedName, setUpdatedName] = useState("");
  const [initialRendor, setInitialRendor] = useState(false);
  const [skelitonLoading, setSkelitonLoading] = useState(false);

  const handleView = (row: any) => {
    setEditRowId(row.CustomerID);
    localStorage.setItem("selectedCustomerID", row.CustomerID);
    localStorage.setItem("selectedCustomerName", row.Name);
    setEditFormData({ ...row });
    navigate(`/view/leads/${row.CustomerID}`);
  };

  const handleChange = (key: string, row: any) => {
    if (key === "view") {
      handleView(row);
    } else if (key === "assignProducts") {
      navigate(`/view/assignedproducts/${row.CustomerID}`);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View
      </Menu.Item>
    </Menu>
  );

  // Handle form input changes dynamically
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setSkelitonLoading(true);
      const requestBody = {
        pageNo: page,
        pageSize: pageSize,
        searchTypes: selectApplicable,
        searchQuery: searchValue,
        from: "2024-06-15T10:30:39.150Z",
        to: new Date(),
      };
      const response = await getAllBussinessCustomer(requestBody);
      setIsLoading(true);
      if (response) {
        setSkelitonLoading(false);
        const data = response.data.data;
        setBuinsessCustomers(data || []);
        setTotalRows(response?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
      // setIndividualModal(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const getBusinessCategory = async () => {
    try {
      const res = await GetAllBusinessCategory(1, 1000);
      if (res) {
        const data = res.data.data;
        setCategoryId(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getBusinessType = async () => {
    try {
      const res = await GetAllBusinessType(1, 1000);
      if (res) {
        const data = res.data.data;
        setbusinessType(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const getBussinessCategoryById = (id: any) => {
    const entry: any = categoryId?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "-";
  };
  const getBussinessTypeById = (id: any) => {
    const entry: any = businessType?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "-";
  };
  useEffect(() => {
    if (initialRendor) {
      const timeoutId = setTimeout(() => {
        {
          handleSubmit();
        }
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);
  useEffect(() => {
    // getBusinessCategory();
    getBusinessType();
    handleSubmit();
    setInitialRendor(true);
  }, [page, pageSize]);
  const mappedData =
    buisnessCustomers &&
    buisnessCustomers.map((item: any) => {
      return {
        CustomerID: item.customerId,
        BuisnessID: item.buisnessId,
        RegistrationNo: item.registrationNumber,
        Name: item.name,
        LegalName: item.legalName,
        Category: getBussinessCategoryById(item.buisnessCategoryId),
        Type: getBussinessTypeById(item.buisnessTypeId),
        TaxID: item.taxId,
        Email: item.email,
        Correspondence: item.stopCorrespondence,
        nationalId: item?.nationalId,
      };
    });
  useEffect(() => {
    handleSubmit();
  }, [page, pageSize]);

  const Customer_ALL_List_Header = [
    {
      name: "Tenant ID",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="TenantID"
            value={editFormData.Name}
            onChange={handleInputChange}
          />
        ) : (
          row.Name
        ),
    },
    {
      name: "Company Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="CompanyName"
            value={editFormData.LegalName}
            onChange={handleInputChange}
          />
        ) : (
          row.LegalName
        ),
    },
    {
      name: "Company Email",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="CompanyEmail"
            value={editFormData.Category}
            onChange={handleInputChange}
          />
        ) : (
          row.Category
        ),
    },
    {
      name: "Company Phone No",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="CompanyPhoneNo"
            value={editFormData.Type}
            onChange={handleInputChange}
          />
        ) : (
          row.Type
        ),
      width: "200px",
    },
    {
      name: "Website",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="website"
            value={editFormData.TaxID}
            onChange={handleInputChange}
          />
        ) : (
          row.TaxID
        ),
    },
    {
      name: "Contact Person",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="ContactPerson"
            value={editFormData.Email}
            onChange={handleInputChange}
          />
        ) : (
          row.Email
        ),
      width: "200px",
    },
    {
      name: "Email",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="email"
            value={editFormData.Email}
            onChange={handleInputChange}
          />
        ) : (
          row.Email
        ),
      width: "200px",
    },
    {
      name: "Phone No.",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="phoneNo"
            value={editFormData.Email}
            onChange={handleInputChange}
          />
        ) : (
          row.Email
        ),
      width: "200px",
    },
    {
      name: "Status",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Status"
            value={editFormData.Status}
            onChange={handleInputChange}
          />
        ) : (
          row.Status
        ),
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "2px",
            backgroundColor: row.Status
              ? "rgba(200, 29, 37, 1)"
              : "rgba(55, 52, 53, 1)",
            color: "rgba(255, 255, 255, 1)",
            cursor: row.Status === "Active" ? "pointer" : "default",
          }}
        >
          {row.Status === "Active" ? "Active" : "Inactive"}
        </div>
      ),
    },
    // {
    //   name: "Stop Correspondence",

    //   cell: (row: any) => (
    //     <>
    //       <Switch
    //         value={row.Correspondence}
    //         onChange={(val) => {
    //           handleUpdateStopCorrespondance(val);
    //         }}
    //       />
    //     </>
    //   ),
    // },
    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "white",
              borderRadius: "2px",
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
      <DynamicBreadcrumb className="col-6 mt-3 ps-3" />
      <h2 className="d-flex align-items-center col-12 justify-content-between fs-6 ps-3 mb-3 mt-4">Leads</h2>
      <div className="cs-table p-2">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          header={Customer_ALL_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
        {buisnessCustomers?.length == 0 && (
          <div className="d-flex justify-content-center mt-5 bg-red">
            No data found
          </div>
        )}
      </div>
    </>
  );
};

export default TenantsLeads;
