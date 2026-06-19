import { useEffect, useState } from "react";
import { Row, Col, Form, Tab, Tabs } from "react-bootstrap";
import {
  getAllBusinessAndIndividualCustomer,
  getIndividualByCustomerId,
  updateIndividualCustomer,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import TableView from "../TableView/TableView";
import Switch from "react-switch";
import { Button, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Images } from "../Config/Images";
import DynamicBreadcrumb from "./SuperAdminBreadCrumb";

const LeadView = () => {
  const [customerData, setCustomerData] = useState<any>({
    individualDto: {},
    employmentDto: {},
    addressDto: {},
    customerId: "",
  });
  const { customerId } = useParams();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [allTypeCustomer, setAllTypeCustomer] = useState<any>();
  const [activeTab, setActiveTab] = useState("LeadDetails");
  const [heading, setHeading] = useState("Lead Details");
  const navigate = useNavigate();
  const handleChange = (key: string, row: any) => { };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}></Menu>
  );
  useEffect(() => {
    if (customerId) {
      individualCustomer(customerId);
    }
  }, [customerId]);

  const individualCustomer = async (customerId: any) => {
    try {
      const res = await getIndividualByCustomerId(customerId);
      if (res) {
        const value = res.data.data;
        setCustomerData(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateCustomerIndividual = async (customerId: any) => {
    setCustomerData({
      customerId: customerId,
    });
    try {
      const res = await updateIndividualCustomer(customerId, customerData);
      if (res) {
        toast.success(res?.data.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveCustomer = () => {
    updateCustomerIndividual(customerId);
  };

  const handleSelect = (key: any) => {
    setActiveTab(key);
    switch (key) {
      case "Lead Details":
        setHeading("Lead Details");
        break;
      case "IdentificationDetails":
        setHeading("Identification Details");
        break;
      case "CurrentEmploymentDetails":
        setHeading("Current Employment Details");
        break;
      case "PersonalAddressDetails":
        setHeading("Personal Address Details");
        break;
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const tenantViewFields = [
    {
      label: "Passport Number",
      type: "text",
      name: "individualDto.passportNumber",
      value: customerData?.individualDto?.passportNumber || "",
    },
    {
      label: "Passport Issue Date",
      type: "date",
      name: "individualDto.passportIssueDate",
      value: formatDate(customerData?.individualDto?.passportIssueDate || ""),
    },
    {
      label: "Passport Expiry Date",
      type: "date",
      name: "individualDto.passportExpiryDate",
      value: formatDate(customerData?.individualDto?.passportExpiryDate || ""),
    },
    {
      label: "Visa Number",
      type: "text",
      name: "individualDto.visaNumber",
      value: customerData?.individualDto?.visaNumber || "",
    },
    {
      label: "Nationality",
      type: "text",
      name: "individualDto.nationality",
      value: customerData?.individualDto?.nationality || "",
    },
  ];

  const button = [{ title: "Save and Exit", onClick: handleSaveCustomer }];
  const Customer_ALL_List_Header = [
    {
      name: "Product Name",
      selector: (row: { CustomerID: any }) => row.CustomerID.split("-")[0],
    },

    {
      name: "Logo",
      selector: (row: { name: any }) => row.name,
    },

    {
      name: "Email",
      selector: (row: { type: any }) => row.type,
    },

    {
      name: "Country",
      selector: (row: { phoneNo: any }) => row.phoneNo,
    },

    {
      name: "Category",
      selector: (row: { email: any }) => row.email,
    },

    {
      name: "Product Type",
      selector: (row: { email: any }) => row.email,
    },

    {
      name: "Status",
      // width: "150px",
      cell: (row: any) => (
        <div>
          <Switch
            onChange={(e: any) => { }}
            checked={row.Status}
            checkedIcon={false}
            uncheckedIcon={false}
            onColor="#EB0D0D" // Adjust the color when the switch is on
            offColor="#ccc" // Adjust the color when the switch is off
            height={20} // Adjust the height of the switch
            boxShadow="#fff"
          />
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
  const getAllTypeCustomers = async () => {
    try {
      const res = await getAllBusinessAndIndividualCustomer(page, 5);
      if (res && res.data && res.data.data) {
        const values = res.data.data;
        setAllTypeCustomer(values);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
      // setIndividualModal(false);
    }
  };
  const mappedData =
    allTypeCustomer &&
    allTypeCustomer.map((item: any) => {
      return {
        CustomerID: item.customerId,
        name: item.name,
        type: item.type,
        phoneNo: item.phoneNo,
        email: item.email,
        status: item.status,
      };
    });
  useEffect(() => {
    getAllTypeCustomers();
  }, [page, pageSize]);

  return (
    <>
      <div className="tenant-detail-container">
        <DynamicBreadcrumb className="col-6 mb-4" />
        <div className="d-flex align-items-center gap-2 mb-3">
          <button
            className="d-flex justify-content-center align-items-center "
            style={{
              color: " #1963b9",
              border: "transparent",
              background: "#F0F0F0",
              height: "30px",
              fontSize: "12px",
            }}
            onClick={() => {
              navigate(-1);
            }}
          >
            <img className="pe-2" src={Images.arrowBackIcon} alt="" />
            Back
          </button>

          <h3 className="fs-6 fw-600 mb-0">Leads Details</h3>
        </div>
        <div
          style={{
            borderLeft: "1px solid #D1D1D1",
            borderRight: "1px solid #D1D1D1",
            borderBottom: "1px solid #D1D1D1",
            borderRadius: "2px",
          }}
        >
          <Tabs
            defaultActiveKey={activeTab}
            style={{ height: "40px" }}
            onSelect={handleSelect}
          >
            <Tab eventKey="LeadDetails" title="Lead Details">
              <div className="p-4">
                <h5 className="fs-6 fw-600 mb-3"> Leads Details</h5>
                <h3 className="fw-600 fs-20">Auto Jingle</h3>
                <div className="row mt-5 d-flex flex-wrap">
                  <h4 className="fs-6 fw-600 mb-2">1. Business Details</h4>
                  {tenantViewFields.map((field, index) => (
                    <div className="col-md-4 mt-1 mb-1" key={index}>
                      <div
                        className="d-flex justify-content-between align-items-center w-100 p-3"
                        style={{
                          backgroundColor: "#f5f5f5",
                          borderRadius: "2px",
                        }}
                      >
                        <label className="fs-14 fw-600">{field.label}</label>
                        <span className="fs-14 fw-normal">{field.value}</span>
                      </div>
                    </div>
                  ))}
                  <h4 className="fs-6 fw-600 mt-32 mb-2">
                    2. Commercial Contact Person Details
                  </h4>
                  {tenantViewFields.map((field, index) => (
                    <div className="col-md-4 mt-1 mb-1" key={index}>
                      <div
                        className="d-flex justify-content-between align-items-center w-100 p-3"
                        style={{
                          backgroundColor: "#f5f5f5",
                          borderRadius: "2px",
                        }}
                      >
                        <label className="fs-14 fw-600">{field.label}</label>
                        <span className="fs-14 fw-normal">{field.value}</span>
                      </div>
                    </div>
                  ))}
                  <h4 className="fs-6 fw-600 mt-32 mb-2">
                    3. Technical Contact Person Details
                  </h4>
                  {tenantViewFields.map((field, index) => (
                    <div className="col-md-4 mt-1 mb-1" key={index}>
                      <div
                        className="d-flex justify-content-between align-items-center w-100 p-3"
                        style={{
                          backgroundColor: "#f5f5f5",
                          borderRadius: "2px",
                        }}
                      >
                        <label className="fs-14 fw-600">{field.label}</label>
                        <span className="fs-14 fw-normal">{field.value}</span>
                      </div>
                    </div>
                  ))}
                  <h4 className="fs-6 fw-600 mt-32 mb-2">4. PaymentDetails</h4>
                  {tenantViewFields.map((field, index) => (
                    <div className="col-md-4 mt-1 mb-1" key={index}>
                      <div
                        className="d-flex justify-content-between align-items-center w-100 p-3"
                        style={{
                          backgroundColor: "#f5f5f5",
                          borderRadius: "2px",
                        }}
                      >
                        <label className="fs-14 fw-600">{field.label}</label>
                        <span className="fs-14 fw-normal">{field.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Tab>

            {/* <Tab eventKey="Lead Products" title="Lead Products">
              <div className="cs-table p-2">
                <h4 className="mt-3">Selected Products</h4>
                <TableView
                  setPage={setPage}
                  setPageSize={setPageSize}
                  totalRows={totalRows}
                  header={Customer_ALL_List_Header}
                  data={mappedData}
                  paginationShow={false}
                />
              </div>
            </Tab>

            <Tab eventKey="Lead Modules" title="Lead Modules">
              <Row className="mb-3 p-3"> selected documents</Row>
            </Tab> */}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default LeadView;
