import { useEffect, useRef, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { Menu, Select, Dropdown, Button, Form, Modal, Input } from "antd";
import TableView from "../../TableView/TableView";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Images } from "../../Config/Images";
import {
  createVendorCommission,
  deleteVendorCommission,
  editVendorCommission,
  getAllVendorServices,
  getVendorCommissionList,
  vendorList,
} from "../../../redux/apis/apisCrud";
import arrowDown from "../../../assets/images/arrow-down.png";
import toast from "react-hot-toast";
import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons"; ////

const VendorCommission = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [vendor, setVendor] = useState([]);
  const [CommissionList, setCommissionList] = useState<any>();
  const [showModal, setShowModal] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [formData, setFormData] = useState({
    vendorId: "",
    name: "",
    vendorServiceId: "",
    type: "",
    takeValue: "",
    giveValue: "",
  });

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="view" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      selector: (row: { id: any }) => row.id,
      sortable: true,
      width: "100px",
    },
    {
      name: "Vendor Commission Name",
      selector: (row: { vendorName: any }) => row.vendorName,
      sortable: true,
      width: "200px",
    },
    {
      name: "name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "Vendor Service Name",
      selector: (row: { vendorService: any }) => row.vendorService,
      sortable: true,
      width: "200px",
    },
    {
      name: "Type",
      selector: (row: { type: any }) => row.type,
      sortable: true,
      width: "120px",
    },
    {
      name: "Taken Value",
      selector: (row: { takeValue: any }) => row.takeValue,
      sortable: true,
      width: "120px",
    },
    {
      name: "Give Value",
      selector: (row: { giveValue: any }) => row.giveValue,
      sortable: true,
      width: "120px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#0B8085 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const handleInputChange = (key: string, e: any) => {
    setFormData((prev) => ({ ...prev, [key]: e }));

    if (key === "vendorId") {
      const filtered = services.filter(
        (sub) => sub.vendor_id === parseInt(e)
      );
      setFilteredServices(filtered);
      setFormData((prev) => ({ ...prev, vendorServiceId: "" })); // Reset subtype
    }
  };

  const handleSave = async () => {
    const body: any = {
      name: formData.name,
      vendor_id: Number(formData.vendorId),
      vendor_service_id: Number(formData.vendorServiceId),
      type: formData.type,
      take_value: formData.takeValue,
      given_value: formData.giveValue,
    };

    try {
      let response;

      if (selectedItem === "edit" && editRowId) {
        // EDIT API
        response = await editVendorCommission(editRowId, body);
        if (response.status === 200) {
          toast.success(response.data.message);
          getList();
        } else {
          toast.error(response?.data?.errors || "Failed to update");
        }
      } else {
        response = await createVendorCommission(body);
        if (response.status === 200) {
          toast.success(response.data.message);
        } else {
          toast.error(response?.data?.errors || "Failed to add");
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }

    // Reset form & modal
    setShowModal(false);
    setEditRowId(null);
    setSelectedItem(null);
    setFormData({
      vendorId: "",
      name: "",
      vendorServiceId: "",
      type: "",
      takeValue: "",
      giveValue: "",
    });
  };

  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getVendorCommissionList(page, pageSize);
      if (response) {
        const data = response?.data?.data?.data;
        setCommissionList(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page);
        setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, [page, pageSize]);

  const getVendor = async () => {
    try {
      const response = await vendorList(page, pageSize);
      setVendor(response?.data?.data?.data || []);
    } catch (error) {
      toast.error("Failed to load complaint types");
    }
  };

  const getVendorNameById = (id: any) => {
    return (vendor && vendor?.find((v) => v.id === id)?.name) || "-";
  };

  const getVendorServices = async () => {
    try {
      const res = await getAllVendorServices(page, pageSize);
      const data = res?.data?.data?.data || [];
      setServices(data);
    } catch (error) {
      toast.error("Failed to fetch services");
    }
  };

  const getVendorServiceNameById = (id: any) => {
    return (services && services?.find((v) => v.id === id)?.name) || "-";
  };

  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "view") {
      handleDelete(row);
    }
  };

  const handleOnHide = () => {
    setShowModal(false);
    setEditRowId(null);
    setSelectedItem(null);
    setFormData({
      vendorId: "",
      name: "",
      vendorServiceId: "",
      type: "",
      takeValue: "",
      giveValue: "",
    });
  };
  const handleEditClick = (row: any) => {
    setEditRowId(row.id);
    setSelectedItem("edit");

    const filtered = services.filter((sub) => sub.vendor_id === row.vendorId);
    setFilteredServices(filtered);

    setFormData({
      vendorId: row.vendorId || "",
      name: row.name || "",
      vendorServiceId: row.vendorServiceId || "",
      type: row.type || "",
      takeValue: row.takeValue || "",
      giveValue: row.giveValue || "",
    });

    setShowModal(true);
  };

  const handleDelete = async (row: any) => {
    try {
      const res = await deleteVendorCommission(row.id);
      if (res) {
        toast.success(res.data.notificationMessage);
        getList(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    getVendor();
    getVendorServices();
  }, []);
  const mappedData =
    CommissionList &&
    CommissionList?.map((item: any) => {
      return {
        id: item?.id,
        vendorId: item?.vendor_id || "-",
        vendorName: getVendorNameById(item?.vendor_id) || "-",
        vendorServiceId: item?.vendor_service_id || "-",
        vendorService: getVendorServiceNameById(item?.vendor_service_id) || "-",
        name: item?.name || "-",
        type: item?.type || "-",
        takeValue: item?.take_value || "-",
        giveValue: item?.given_value || "-",
      };
    });

  return (
    <div className="service">
      <div className="d-flex justify-content-end  col-12">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          // onChange={handleChange}
          placeholder="Filter"
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}
        />

        <div className="d-flex gap-2 w-100">
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder="Search..."
            />
          </div>
          <button className="invoice-btn">Excel</button>
          <button className="invoice-btn">PDF</button>
          <button className="invoice-btn">Print</button>
          <button className="theme-btn" onClick={() => setShowModal(true)}>
            Add New Vendor Commission
          </button>
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
      <Modal
        className="custom-mod"
        style={{ maxWidth: "732px" }}
        title={
          selectedItem === "edit"
            ? "Update Complaint"
            : "Add New Complaint"
        }
        visible={showModal}
        onCancel={handleOnHide}
        footer={[
          <Button key="close" onClick={handleOnHide}>
            Close
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            {selectedItem === "edit" ? "Save" : "Submit"}
          </Button>,
        ]}
      >
        <div className={"Ente-details"}>
          <Form>
           <Row>
              <Col md={12}>
                <div className="custom-input-container">
                  <label className="input-label">Name</label>
                  <Input
                    type="text"
                    className="fs-6"
                    placeholder="Placeholder"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>handleInputChange("name", e.target.value)}
                  />
                </div>
              </Col>      
            </Row>
            <Row>
            <Col md={6}>
                <div className="custom-input-container">
                  <label className="input-label">
                    Select Vendor
                  </label>
                  <Select     
                    className="fs-6"
                    value={formData.vendorId}
                    onChange={(e)=>handleInputChange("vendorId", e)}
                  >
                    <option value="">Select Type</option>
                    {vendor && vendor.map((type: any) => {
                      return (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      );
                    })}
                  </Select>
                </div>
              </Col>
              <Col md={6}>
                <div className="custom-input-container">
                  <label className="input-label">Select Vendor Service</label>
                  <Select     
                    className="fs-6"
                    value={formData.vendorServiceId}
                    onChange={(e)=>handleInputChange("vendorServiceId", e)}
                    >
                    <option value="">Select Type</option>
                    {filteredServices.map((type: any) => {
                      return (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      );
                    })}
                  </Select>
                </div>
              </Col>
              </Row> 
            <Row>
              <Col md={12}>
                <div className="custom-input-container">
                  <label className="input-label">
                    Select Type
                  </label>
                  <Select           
                    className="fs-6"
                    value={formData.type}
                    onChange={(e) =>handleInputChange("type", e)}
                  >
                    <option value="">Select type</option>
                    <option value="fix">Fixed</option>
                    <option value="slab">Slab</option>
                  
                  </Select>
                </div>
              </Col>
            </Row>
            
            <Row>
            <Col md={6}>
              <div className="custom-input-container">
              <label className="input-label">Take Value</label>
              <Input
                className="fs-6"
                placeholder="Placeholder"
                name="takeValue"
                value={formData.takeValue}
                onChange={(e) =>handleInputChange("takeValue", e.target.value)}
              />
              </div>
              </Col>
              <Col md={6}>
                <div className="custom-input-container">
                  <label className="input-label">Give Value</label>
                  <Input
                className="fs-6"
                placeholder="Placeholder"
                name="giveValue"
                value={formData.giveValue}
                onChange={(e) =>handleInputChange("giveValue", e.target.value)}
              />
                </div>
              </Col>
              </Row>
          </Form>
          </div>
      </Modal>
    </div>
  );
};

export default VendorCommission;
