import { SetStateAction, useEffect, useState } from "react";

import {
  Button,
  Input,
  Menu,
  Select,
  Modal,
  Form,
  Switch,
  Dropdown,
  Row,
  Col,
} from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  getCommodityTypes,
  updateCommodityTypeStatus,
  createProductType,
  updateProductType,
  deleteProductType,
  createCommodityType,
  updateCommodityType,
  deleteCommodityType,
} from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";

const MerchantList = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [prodData, setProdData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentSourceId, setCurrentSourceId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      setSelectedItem("edit");
      setCurrentSourceId(row.id);
      setFormData({ 
        name: row.name,
        status: row.status 
      });
      setShowModal(true);
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
      setSelectedItem("delete");
    }
  };
const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    email: "",
    contact_no: "",
    country_id: "1",
    affiliation_url: "",
    affiliation_code: "",
    brand_color: "#000000",
    secret_key: "",
    enable_api: false,
    status: false,
    revenue_verification_method: "Manual",
    get_revenue_url: "",
    get_revenue_secret_key: "",
  });
  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const Activity_Loans_Header = [
    // {
    //   name: "Sr:",
    //   selector: (row: { Sr: any }) => row.Sr,
    //   sortable: true,
    //   // width: "15%",
    // },
    {
      name: "Name (En)",
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
     {
      name: "Name (Ar)",
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
     {
      name: "Email",
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
     {
      name: "Logo",
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
    {
      name: "Favicon",
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
     {
      name: "Secret Key",
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.status === 1
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === 0
                ? "#BC3D3F"
                : "#FF9811",
            color: "white",
            cursor: row.status === 1 ? "pointer" : "default",
          }}
        >
          {row.status == 1 ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Action",
      width: "10%",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              fontSize: "12px",
              borderRadius: "2px",
              padding: "8px",
            }}
          >
            Select 
            <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];

   const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteCommodityType(deleteTargetId), {
        loading: "Deleting...",
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          return "Deleted successfully";
        },
        error: (err) => err?.message || "Failed to delete source",
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  }; 

   const handleSave = async () => {
    const body: any = {
      name: formData.name,
      status: formData.status,
      parent_id: 1
    };
    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        await toast.promise(updateCommodityType(currentSourceId, body), {
          loading: "Updating...",
          success: (response: any) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              name: "",
              status: 0 
             });
            getList();
            return "Updated successfully";
          },
          error: (err) => err?.message || "Failed to update",
        });
      } else if (selectedItem == "add") {
        await toast.promise(createCommodityType(body), {
          loading: "Adding finance purpose...",
          success: (response) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
                name: "",
                status: 0 
              });
            getList();
            return "Financing Purpose added successfully";
          },
          error: (err) => err?.message || "Failed to add new source",
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      setShowConfirmModal(false);
    }
  }; 

  const getList = async () => {
     setSkelitonLoading(true);
     try {
       const res = await getCommodityTypes();
       if (res) {
         const data = res?.data?.data?.data;
         setData(data || []);
         setSkelitonLoading(false);
         setTotalRows(data.length || 0);
         setFrom(1);
         setTo(data.length || 0);
         setPage(1);
         setTotalPage(1);
       }
     } catch (error: any) {
       console.error("Error fetching Financing purpose:", error);
       setSkelitonLoading(false);
     }
  };

  useEffect(() => {
     getList();
  }, [page, pageSize]);
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id,
        Sr: index + 1,
        name: item?.name || "-",
        slug: item?.slug || "-",
        unit_of_measure: item?.unit_of_measure || "-",
        parent_id: item?.parent_id || "-",
        status: item?.status,
      };
    });

  const options = [{ label: "Name", value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {
    setSelectedFilters(value[0]);
    // You can trigger filtering logic here
  };
  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "2px" }}
      >
        <div className="d-flex mb-3 col-12 filter-select">
          <Select
            mode="tags"
            style={{ width: "15%", borderTopRightRadius: "0px" }}
            onChange={handleChange}
            placeholder="Filter"
            tokenSeparators={[","]}
            suffixIcon={<FaFilter />}
            options={options}
          />

          <div className="d-flex gap-2 w-100">
            <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
              <img src={Images.searchIconGray} alt="" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
                className="p-2"
                placeholder="Search..."
              />
            </div>

            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setSelectedItem("add");
                setFormData({ 
                  name: "",
                  status: 0 
                });
              }}
            >
              Add Merchant
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
          style={{ maxWidth: "640px" }}
          title={
            selectedItem === "edit" ? "Edit Merchant" : "Add New Merchant"
          }
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => {
                setShowConfirmModal(true);
                setShowModal(false);
              }}
            >
              {selectedItem === "edit" ? "Save" : "Submit"}
            </Button>,
          ]}
        >
           <div className="service" style={{ background: "white", padding: "0rem", borderRadius: "2px" }}>
      {/* <h4 style={{ marginBottom: "2rem" }}>Add New Partner</h4> */}

      <div className="row">
        {/* Name */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Name (En)</label>
          <Input
            placeholder="Name"
          />
        </div>

        {/* اسم */}
        <div className="col-md-6 mb-3">
          <label className="form-label" style={{ textAlign: "right", display: "block" }}>
            Name (Ar)
          </label>
          <Input
            placeholder="اسم"
            style={{ height: "40px", direction: "rtl" }}
          />
        </div>

        {/* Partner Email */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Partner Email</label>
          <Input
            type="email"
            placeholder="Partner Email"
            style={{ height: "40px" }}
          />
        </div>

        {/* Contact No */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Contact No.</label>
          <Input
            addonBefore="+966"
            placeholder="Contact No"
            style={{ height: "40px" }}
          />
        </div>

        {/* Country */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Country</label>
          <Select
            style={{ width: "100%" }}
          >
            {/* <Option value="2">UAE</Option>
            <Option value="3">Kuwait</Option> */}
          </Select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Page Title</label>
          <Input
            addonBefore="+966"
            placeholder="Contact No"
            style={{ height: "40px" }}
          />
        </div>
        {/* Choose Brand Color */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Choose Brand Color</label>
          <div className="d-flex gap-2">
            <Input
              type="color"
              style={{ width: "50%", height: "40px" }}
            />
            <Input
              style={{ width: "50%", height: "40px" }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Choose Primary Color</label>
          <div className="d-flex gap-2">
            <Input
              type="color"
              style={{ width: "50%", height: "40px" }}
            />
            <Input
              style={{ width: "50%", height: "40px" }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Choose Secondary Color</label>
          <div className="d-flex gap-2">
            <Input
              type="color"
              style={{ width: "50%", height: "40px" }}
            />
            <Input
              style={{ width: "50%", height: "40px" }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Choose Background Color</label>
          <div className="d-flex gap-2">
            <Input
              type="color"
              style={{ width: "50%", height: "40px" }}
            />
            <Input
              style={{ width: "50%", height: "40px" }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Choose Text Color</label>
          <div className="d-flex gap-2">
            <Input
              type="color"
              style={{ width: "50%", height: "40px" }}
            />
            <Input
              style={{ width: "50%", height: "40px" }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Choose Button Color</label>
          <div className="d-flex gap-2">
            <Input
              type="color"
              style={{ width: "50%", height: "40px" }}
            />
            <Input
              style={{ width: "50%", height: "40px" }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Choose Button text Color</label>
          <div className="d-flex gap-2">
            <Input
              type="color"
              style={{ width: "50%", height: "40px" }}
            />
            <Input
              style={{ width: "50%", height: "40px" }}
            />
          </div>
        </div>
         <div className="col-md-6 mb-3">
          <label className="form-label">Font Family</label>
          <Select
            style={{ width: "100%" }}
          >
            {/* <Option value="2">UAE</Option>
            <Option value="3">Kuwait</Option> */}
          </Select>
        </div>
        {/* Affiliation URL */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Minimum Tenure</label>
          <Input
            placeholder="Minimum Tenur"
            style={{ height: "40px" }}
          />
        </div>

        {/* Affiliation Code */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Maximum Tenure</label>
          <Input
            placeholder="Maximum Tenure"
            style={{ height: "40px" }}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Minimum Financing Amount</label>
          <Input
            placeholder="Minimum Financing Amount"
            style={{ height: "40px" }}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Maximum Financing Amount</label>
          <Input
            placeholder="Maximum Financing Amount"
            style={{ height: "40px" }}
          />
        </div>
        {/* Logo */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Upload Logo</label>
          <div style={{ position: "relative" }}>
            <input
              type="file"
              accept="image/*"
              className="form-control fs-6"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                if (logoPreview) URL.revokeObjectURL(logoPreview);
                setLogo(file);
                setLogoPreview(URL.createObjectURL(file));
              }}
            />
            {logo && (
              <button
                type="button"
                onClick={() => {
                  if (logoPreview) URL.revokeObjectURL(logoPreview);
                  setLogo(null);
                  setLogoPreview("");
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  color: "#000",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  padding: 0,
                  zIndex: 10,
                }}
                title="Remove logo"
              >
                ×
              </button>
            )}
          </div>
          {logoPreview ? (
            <div className="d-flex justify-content-center" style={{ marginTop: 10 }}>
              <img
                src={logoPreview}
                width={150}
                height={150}
                style={{ objectFit: "contain" }}
                alt="Logo preview"
              />
            </div>
          ) : null}
        </div>

        {/* Favicon */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Upload Favicon</label>
          <div style={{ position: "relative" }}>
            <input
              type="file"
              accept="image/*"
              className="form-control fs-6"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                setFavicon(file);
                setFaviconPreview(URL.createObjectURL(file));
              }}
            />
            {favicon && (
              <button
                type="button"
                onClick={() => {
                  if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                  setFavicon(null);
                  setFaviconPreview("");
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  color: "#000",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  padding: 0,
                  zIndex: 10,
                }}
                title="Remove favicon"
              >
                ×
              </button>
            )}
          </div>
          {faviconPreview ? (
            <div className="d-flex justify-content-center" style={{ marginTop: 10 }}>
              <img
                src={faviconPreview}
                width={150}
                height={150}
                style={{ objectFit: "contain" }}
                alt="Favicon preview"
              />
            </div>
          ) : null}
        </div>

        {/* API Secret Key */}
        <div className="col-md-6 mb-3">
          <label className="form-label">API Secret Key</label>
          <Input
            placeholder="Auto-generated key"
            style={{ height: "40px", backgroundColor: "#f5f5f5" }}
            readOnly
          />
        </div>

        {/* Enable API */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Mdr Settings</label>
          <Select
            style={{ width: "100%" }}
          >
            {/* <Option value="2">UAE</Option>
            <Option value="3">Kuwait</Option> */}
          </Select>
        </div>

        {/* Status */}
        <div className="col-md-6 mb-3">
          <div className="d-flex align-items-center gap-2">
            <Switch
              className="red-switch"
            />
            <label className="form-label mb-0">Status</label>
          </div>
        </div>

        {/* Send Details Via Mail */}
       
      </div>

     
    </div>
        </Modal>
        <Modal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={
            selectedItem === "edit"
              ? "Edit Record"
              : selectedItem === "edit"
              ? "Add New Record"
              : "Delete Record"
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>
              No
            </Button>,
            <Button
              key="yes"
              type="primary"
              onClick={
                selectedItem == "delete" ? handleDeleteConfirmed : handleSave
              }
            >
              Yes
            </Button>,
          ]}
        >
          <Form>
            {`${
              selectedItem == "edit"
                ? "Are you sure you want to update this record?"
                : selectedItem == "add"
                ? "Are you sure you want to add new record?"
                : "Are you sure you want to delete this record?"
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default MerchantList;
