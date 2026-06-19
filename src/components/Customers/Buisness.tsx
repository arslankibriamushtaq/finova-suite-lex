import { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
const Buisness = () => {
  const [editRowId, setEditRowId] = useState(null);
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
  const handleEditClick: any = (row: any) => {
    setEditRowId(row.id);
    localStorage.setItem("selectedCustomerID", row.CustomerID);
    localStorage.setItem("selectedCustomerName", row.Name);
    setEditFormData({ ...row });
    navigate(`/view/edit/buisness/${row.CustomerID}`);
  };
  const handleView: any = (row: any) => {
    setEditRowId(row.CustomerID);
    localStorage.setItem("selectedCustomerID", row.CustomerID);
    localStorage.setItem("selectedCustomerName", row.Name);
    setEditFormData({ ...row });
    navigate(`/view/viewdetails/buisness/${row.CustomerID}`);
  };
  const handleSaveClick: any = (rowId: any) => {
    const newData = buisnessCustomers.map((row: any) =>
      row.id === rowId ? { ...row, ...editFormData } : row
    );
    setValue(newData);
    setEditRowId(null);
  };
  const handleChange: any = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "view") {
      handleView(row);
    } else if (key === "accountTimeline") {
      navigate(`/view/accountTimeline/${row.nationalId}/${row.CustomerID}`);
    }
  };
  const menu: any = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      {/* <Menu.Item
        key="editName"
        icon={<EditOutlined />}
        onClick={() => {
          setCustomerNameModal(true);
          setUpdatedName(row.Name);
          setUpdatedId(row.CustomerID);
        }}
      >
        Update Customer Name
      </Menu.Item> */}
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View
      </Menu.Item>
      <Menu.Item key="accountTimeline" icon={<ClockCircleOutlined />}>
        Account Timeline
      </Menu.Item>
    </Menu>
  );

  // Handle form input changes dynamically
  const handleInputChange: any = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit: any = async () => {
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

  const getBusinessCategory: any = async () => {
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

  const getBusinessType: any = async () => {
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
  const getBussinessCategoryById: any = (id: any) => {
    const entry: any = categoryId?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "-";
  };
  const getBussinessTypeById: any = (id: any) => {
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
    getBusinessCategory();
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
        status:true
      };
    });
  useEffect(() => {
    handleSubmit();
  }, [page, pageSize]);

  const Customer_ALL_List_Header = [
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
      name: "Legal Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="LegalName"
            value={editFormData.LegalName}
            onChange={handleInputChange}
          />
        ) : (
          row.LegalName
        ),
    },
    {
      name: "Category",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Category"
            value={editFormData.Category}
            onChange={handleInputChange}
          />
        ) : (
          row.Category
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
      width: "200px",
    },
    {
      name: "Tax ID",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="TaxID"
            value={editFormData.TaxID}
            onChange={handleInputChange}
          />
        ) : (
          row.TaxID
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
      width: "200px",
    },
    {
      name: "Status",
  
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "6px",
            backgroundColor: row.status
              ? "var(--color-status-green)"
              : "var(--color-status-dark)",
            color: "var(--primary-foreground)",
            cursor: row.status  ? "pointer" : "default",
          }}
        >
          {row.status ? "Active" : "Inactive"}
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
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const handleUpdateName: any = async () => {
    try {
      setIsLoading(true);
      const response = await updateBusinessCustomerName(updatedId, updatedName);
      if (
        response.data.notificationMessage ==
        "Request initiated for the operation"
      ) {
        toast.success(response.data.notificationMessage);
        // setLoader(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        // setLoader(false);
      }
      handleSubmit();
      setCustomerNameModal(false);
      setIsLoading(false);
      setUpdatedId("");
      setUpdatedName("");
    } catch (error: any) {
      // toast.error(error?.message);
      toast.error("Something went wrong!");
      // setLoader(false);
    }
  };

  const handleUpdateStopCorrespondance: any = async (val: any) => {
    try {
      setIsLoading(true);
      const response = await updateBusinessStopCorrespondance(val);
      if (
        response.data.notificationMessage ==
        "Request initiated for the operation"
      ) {
        toast.success(response.data.notificationMessage);
        // setLoader(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        // setLoader(false);
      }
      handleSubmit();
    } catch (error: any) {
      // toast.error(error?.message);
      toast.error("Something went wrong!");
      // setLoader(false);
    }
  };
  const applicableOption = [
    { label: "Name", value: 0 },
    { label: "Email", value: 1 },
    { label: "Invoice No", value: 12 },
    // { label: "NID", value: 3 },
    { label: "LoanId", value: 4 },
    { label: "InvoiceId", value: 5 },
    { label: "ApplicationId", value: 6 },
    { label: "ApplicationNo", value: 7 },
    // { label: "ProductName", value: 8 },
    { label: "LegalName", value: 9 },
    { label: "TaxId", value: 10 },
    { label: "None", value: 11 },
  ];
  return (
    <>
      {loading && <Loader />}
      <div>
        <div className="col-12 d-flex  align-items-center mt-3">
          <div
            className="d-flex align-items-center col-6 justify-content-between mt-1"
            style={{ fontSize: "18px", fontWeight: "Bold" }}
          >
            Business
          </div>
          <div className="col-6 d-flex justify-content-end">
            <span className="pe-3">
              <Select
                value={selectApplicable}
                onChange={(e: any) => {
                  setSelectApplicable(e);
                }}
                style={{ width: "100%", minWidth: "100px", height: "33px" }}
                placeholder="Search Type"
              >
                {applicableOption?.map((option) => (
                  <Select.Option value={option.value}>
                    {option?.label}
                  </Select.Option>
                ))}
              </Select>
            </span>
            <span className="pe-2">
              <Input
                placeholder="Search"
                value={searchValue}
                prefix={<SearchOutlined />}
                onChange={(e: any) => {
                  setSearchValue(e.target.value);
                }}
              />
            </span>
          </div>
        </div>

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
      </div>

      <Modal
        centered
        show={customerNameModal}
        onHide={() => {
          setCustomerNameModal(false);
          setUpdatedId("");
          setUpdatedName("");
        }}
      >
        <ModalHeader style={{ fontSize: "16px", fontWeight: 600 }} closeButton>
          Update Customer Name
        </ModalHeader>

        <ModalBody className="modal-body-scroll">
          <div className="col-12 row">
            <div className="col-6">
              <label
                className="d-flex mb-2"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Customer ID
              </label>
              <Input name="id" value={updatedId.split("-")[0]} disabled />
            </div>
            <div className="col-6">
              <label
                className="d-flex mb-2"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Enter Name
              </label>
              <Input
                name="name"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
              />
            </div>

            <div className="mt-5 d-flex justify-content-end">
              <button
                className="theme-btn-next"
                onClick={() => handleUpdateName()}
              >
                Update
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default Buisness;
