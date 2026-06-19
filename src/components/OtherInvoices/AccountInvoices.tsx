import { useEffect, useState } from "react";
import { Input, Dropdown, Menu, Button } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate } from "react-router-dom";
import {
  GetAllOccupations,
  allState,
  getAllBusinessAndIndividualCustomer,
  getAllCountries,
  getAllRealations,
  getCities,
  getLanguage,
} from "../../redux/apis/apisCrudLms";
import { DownOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

const AccountInvoices = () => {
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [individualModal, setIndividualModal] = useState(false);
  const [customerValue, setCustomerValue] = useState("individuals");
  const [buisnessForm, setBusinessForm] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [state, setStates] = useState<any>([]);
  const [editFormData, setEditFormData] = useState<any>({});
  const [buisnessCustomers, setBuinsessCustomers] = useState<any>([]);
  const [language, setLanguage] = useState<any>();
  const [country, setCountry] = useState<any>();
  const [occupation, setOccupation] = useState<any>();
  const [allReason, setAllReason] = useState([]);
  const [cities, setCities] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form input changes dynamically
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const [loading, setLoading] = useState(false);

  const getAllCustomers = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllBusinessAndIndividualCustomer(
        page,
        pageSize
      );
      if (response) {
        const values = response?.data?.data;
        setBuinsessCustomers(values || []);
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

  const getAllStates = async () => {
    try {
      const response = await allState();
      if (response) {
        const values = response?.data?.data;

        setStates(values);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const mappedData =
    buisnessCustomers &&
    buisnessCustomers.map((item: any) => {
      return {
        CustomerID: item.customerId || "-",
        Name: item.name || "-",
        Type: item.type || "-",
        PhoneNo: item.phoneNo || "-",
        Email: item.email || "-",
        status: item.status || "-",
      };
    });
  useEffect(() => {
    languageApi();
    getAllStates();
    occupationApi();
    cityApi();
    handleAllReason();
    countryApi();
  }, []);
  useEffect(() => {
    getAllCustomers();
  }, [pageSize, page]);

  const customerOptions = [
    { label: "Individuals", value: "individuals" },
    { label: "Businesses", value: "businesses" },
  ];
  const handleValueChange = (value: any) => {
    setCustomerValue(value);
  };

  const handleEditClick = (row: any) => {
    setEditRowId(row.id);
    localStorage.setItem("selectedCustomerID", row.CustomerID);
    localStorage.setItem("selectedCustomerName", row.Name);
    setEditFormData({ ...row });
    if (row.Type == "Individual") {
      navigate(`/view/edit/Individuals/${row.CustomerID}`);
    } else {
      navigate(`/view/edit/buisness/${row.CustomerID}`);
    }
  };
  const handleAccountTimeline = (row: any) => {
    navigate(`/view/accountTimeline/${row.CustomerID}`);
  };
  const handleView = (row: any) => {
    if (row.Type == "Individual") {
      navigate(`/view/viewdetails/Individuals/${row.CustomerID}`);
    } else {
      navigate(`/view/viewdetails/buisness/${row.CustomerID}`);
    }
  };
  const handleControlModal = () => {
    setAddCustomerModal(false);
    if (customerValue === "businesses") {
      setBusinessForm(true);
    } else if (customerValue === "individuals") {
      setIndividualModal(true);
    }
  };

  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      navigate(`/lms/LoanManagement/AccountInvoices/${row.CustomerID}`);
    } else if (key === "view") {
      handleView(row);
    } else if (key === "accountTimeline") {
      handleAccountTimeline(row);
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EyeOutlined />}>
        View
      </Menu.Item>
      {/* <Menu.Item key="view" icon={<EyeOutlined />}>
        View
      </Menu.Item>
      <Menu.Item key="accountTimeline" icon={<ClockCircleOutlined />}>
        Account Timeline
      </Menu.Item> */}
    </Menu>
  );

  const formatDatePayload = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  };

  const Customer_ALL_List_Header = [
    // {
    //   name: "Customer ID",
    //   selector: (row: any) =>
    //     editRowId === row.id ? (
    //       <Input
    //         name="CustomerID"
    //         value={editFormData.CustomerID}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.CustomerID
    //     ),
    // },
    {
      name: "Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Name"
            value={editFormData.Name}
            onChange={handleInputChange}
          />
        ) : (
          row.Name
        ),
    },
    {
      name: "Type",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Type"
            value={editFormData.Type}
            onChange={handleInputChange}
          />
        ) : (
          row.Type
        ),
    },
    {
      name: "Phone No",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="PhoneNo"
            value={editFormData.PhoneNo}
            onChange={handleInputChange}
          />
        ) : (
          row.PhoneNo
        ),
    },
    {
      name: "Email",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Email"
            value={editFormData.Email}
            onChange={handleInputChange}
          />
        ) : (
          row.Email
        ),
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
            backgroundColor:
              row.Status === "Active"
                ? "rgba(146, 188, 131, 1)"
                : "rgba(55, 52, 53, 1)",
            color: "rgba(255, 255, 255, 1)",
            cursor: row.Status === "Active" ? "pointer" : "default",
          }}
        >
          {row.Status === "Active" ? "Active" : "Inactive"}
        </div>
      ),
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
  const languageApi = async () => {
    try {
      const res = await getLanguage();
      if (res) {
        const data = res.data.data;
        setLanguage(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const countryApi = async () => {
    try {
      const res = await getAllCountries();
      if (res) {
        const data = res.data.data;
        setCountry(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const occupationApi = async () => {
    try {
      const res = await GetAllOccupations(page, pageSize);
      if (res) {
        const data = res.data.data;
        setOccupation(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const cityApi = async () => {
    try {
      const res = await getCities();
      if (res) {
        const data = res.data.data;
        setCities(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleAllReason = async () => {
    try {
      const res = await getAllRealations(page, pageSize);
      if (res) {
        const data = res.data.data;
        setAllReason(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div>
        {/* <div className="d-flex col-12">
          <div className="col-10">
            <div className=" mt-4">
              <h1 style={{ fontSize: "22px" }}>All Customers</h1>
            </div>
          </div>
          <div className="col-2 d-flex justify-content-end align-items-center">
            <button
              className="theme-btn-next"
              onClick={() => {
                setAddCustomerModal(true);
              }}
            >
              Add Customer
            </button>
          </div>
        </div> */}
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
          {buisnessCustomers?.length == 0 && !skelitonLoading && (
            <div
              className="d-flex justify-content-center mt-5"
              style={{ color: "red" }}
            >
              No data found
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AccountInvoices;
