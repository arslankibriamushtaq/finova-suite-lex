import { useState, useEffect } from "react";
import { Button, Dropdown, Input, Menu } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import { DownOutlined, EyeOutlined } from "@ant-design/icons";
import DynamicBreadcrumb from "./SuperAdminBreadCrumb";
import { Images } from "../Config/Images";
import { getAllTenants } from "../../redux/apis/apisTenantCrud";
const TenantsAdmin = () => {
  const [editRowId, setEditRowId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState();
  const [editFormData, setEditFormData] = useState<any>({});
  const [tenantData, setTenantData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const navigate = useNavigate();
  const [selectApplicable, setSelectApplicable] = useState<any>();
  const [searchValue, setSearchValue] = useState("");
  const [initialRendor, setInitialRendor] = useState(false);
  const [skelitonLoading, setSkelitonLoading] = useState(false);

  const handleView = (row: any) => {
    setEditRowId(row.CustomerID);
    localStorage.setItem("selectedCustomerID", row.CustomerID);
    localStorage.setItem("selectedCustomerName", row.Name);
    setEditFormData({ ...row });
    navigate(`/view/tenant/${row.CustomerID}`);
  };

  const handleChange = (key: string, row: any) => {
    if (key === "view") {
      handleView(row);
    } else if (key === "assignProducts") {
      const type = "assignProducts";
      navigate(`/view/assignedproducts/${row.CustomerID}`, {
        state: { tenantData: row, type },
      });
    } else if (key === "unassignProducts") {
      const type = "unassignProducts";
      navigate(`/view/assignedproducts/${row.CustomerID}`, {
        state: { tenantData: row, type },
      });
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View
      </Menu.Item>
      <Menu.Item
        key="assignProducts"
        icon={<img src={Images.assignProductIcon} alt="Assign Products" />}
      >
        Assign Products
      </Menu.Item>
      {/* <Menu.Item
        key="unassignProducts"
        icon={<img src={Images.assignProductIcon} alt="Unassign Products" />}
      >
        Unassign Products
      </Menu.Item> */}
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
      const response = await getAllTenants(requestBody);
      setIsLoading(true);
      if (response) {
        setSkelitonLoading(false);
        const data = response.data.data;
        setTenantData(data || []);
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
    handleSubmit();
    setInitialRendor(true);
  }, [page, pageSize]);
  const mappedData =
    tenantData &&
    tenantData.map((item: any) => {
      return {
        companyName: item.companyName,
        companyEmail: item.companyEmail,
        companyPhoneNumber: item.companyPhoneNumber,
        companyAddress: item.companyAddress,
        companyWebsite: item.companyWebsite,
        contactPersonName: item.contactPersonName,
        contactPersonDesignation: item.contactPersonDesignation,
        contactPersonEmail: item.contactPersonEmail,
        contactPersonPhoneNumber: item.contactPersonPhoneNumber,
        CustomerID: item.id,
      };
    });

  const Customer_ALL_List_Header = [
    /* {
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
    }, */
    {
      name: "Company Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="companyName"
            value={editFormData.companyName}
            onChange={handleInputChange}
          />
        ) : (
          row.companyName
        ),
    },
    {
      name: "Email",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="companyEmail"
            value={editFormData.companyEmail}
            onChange={handleInputChange}
          />
        ) : (
          row.companyEmail
        ),
    },
    {
      name: "Phone No",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="companyPhoneNumber"
            value={editFormData.companyPhoneNumber}
            onChange={handleInputChange}
          />
        ) : (
          row.companyPhoneNumber
        ),
      width: "200px",
    },
    {
      name: "Address",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="companyAddress"
            value={editFormData.companyAddress}
            onChange={handleInputChange}
          />
        ) : (
          row.companyAddress
        ),
      width: "200px",
    },
    {
      name: "Website",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="companyWebsite"
            value={editFormData.companyWebsite}
            onChange={handleInputChange}
          />
        ) : (
          row.companyWebsite
        ),
    },
    {
      name: "Contact Person",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="contactPersonName"
            value={editFormData.contactPersonName}
            onChange={handleInputChange}
          />
        ) : (
          row.contactPersonName
        ),
      width: "200px",
    },
    {
      name: "Contact Person Designation",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="contactPersonDesignation"
            value={editFormData.contactPersonDesignation}
            onChange={handleInputChange}
          />
        ) : (
          row.contactPersonDesignation
        ),
      width: "200px",
    },
    {
      name: "Email",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="contactPersonEmail"
            value={editFormData.contactPersonEmail}
            onChange={handleInputChange}
          />
        ) : (
          row.contactPersonEmail
        ),
      width: "200px",
    },
    {
      name: "Contact Person Phone No.",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="contactPersonPhoneNumber"
            value={editFormData.contactPersonPhoneNumber}
            onChange={handleInputChange}
          />
        ) : (
          row.contactPersonPhoneNumber
        ),
      width: "200px",
    },
    /* {
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
    }, */

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
      <h2 className="d-flex align-items-center col-12 justify-content-between fs-6 ps-4 mb-3 mt-4">
        Tenants
      </h2>
      <div className="cs-table px-4">
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
        {tenantData?.length == 0 && (
          <div className="d-flex justify-content-center mt-5 bg-red">
            No data found
          </div>
        )}
      </div>
    </>
  );
};

export default TenantsAdmin;
