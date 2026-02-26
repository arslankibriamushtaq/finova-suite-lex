import { SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  Checkbox,
} from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  getWealthRanges,
  updateWealthRange,
  createWealthRange,
  deleteListOfValues,
  getListOfValues,
  createListOfValue,
  updateListOfValue,
  changeStatusListOfValue,
} from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";

const ListOfValues = () => {
  const navigate = useNavigate();
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
  const [formData, setFormData] = useState({ 
    title: "", 
    type: "", 
    factor_weight: "", 
    status: false 
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleMenuClick = (key: string, row: any) => {
    if (key === "view") {
      navigate(`/Los/LOV/ListOfValues/${row.id}`);
    } else if (key === "edit") {
      setSelectedItem("edit");
      setCurrentSourceId(row.id);
      setFormData({ 
        title: row.title || "",
        type: row.type || "",
        factor_weight: row.factor_weight || "",
        status: row.status || false
      });
      setShowModal(true);
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
      setSelectedItem("delete");
    }
  };

  const menu = (row: any) => (
    <Menu>
        <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        View
      </Menu.Item>
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
      name: "Title",
      selector: (row: { title: any }) => row.title,
      // sortable: true,
    },
     {
      name: "Type",
      selector: (row: { type: any }) => row.type,
      // sortable: true,
    },
     {
      name: "Factors",
      selector: (row: { factors: any }) => row.factors,
      // sortable: true,
    },
    {
      name: "Factor Weight",
      selector: (row: { factor_weight: any }) => row.factor_weight,
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
                row.status === 1 || row.status === true
                  ? "rgba(63, 195, 128, 0.9)"
                  : row.status === 0 || row.status === false
                  ? "#BC3D3F"
                  : "#FF9811",
              color: "white",
              cursor: row.status === 1 ? "pointer" : "default",
            }}
          >
            {row.status == 1 || row.status === true ? "Active" : "Inactive"}
          </div>
        ),
      },
      {
        name: "Change Status",
        cell: (row: any) => (
          <Switch
            className="red-switch"
            checked={row.status}
            onChange={async (checked) => {
              const newStatus = checked;
              const body = {
                status: newStatus,
              };
  
              try {
                const res = await changeStatusListOfValue(row.id, body);
                if (res) {
                  toast.success(res?.data?.message);
                  getList();
                  // Update UI locally
                  setData((prevData: any) =>
                    prevData.map((item: any) =>
                      item.id === row.id ? { ...item, status: body } : item
                    )
                  );
                }
              } catch (error) {
                console.error("Status update failed:", error);
              }
            }}
          />
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
                borderRadius: "4px",
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
      await toast.promise(deleteListOfValues(deleteTargetId), {
        loading: "Deleting...",
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          setDeleteTargetId(null);
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
      title: formData.title,
      type: formData.type,
      factor_weight: formData.factor_weight ? Number(formData.factor_weight) : 0,
      status: formData.status
    };
    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        await toast.promise(updateListOfValue(currentSourceId, body), {
          loading: "Updating...",
          success: (response: any) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              title: "", 
              type: "", 
              factor_weight: "", 
              status: false 
             });
            getList();
            return "Updated successfully";
          },
          error: (err) => err?.message || "Failed to update",
        });
      } else if (selectedItem == "add") {
        await toast.promise(createListOfValue(body), {
          loading: "Adding new profession...",
          success: (response) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              title: "", 
              type: "", 
              factor_weight: "", 
              status: false 
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
       const res = await getListOfValues();
       if (res) {
         const data = res?.data?.data.data;
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
        title: item?.title || "-",
        type: item?.type || "-",
        factors: item?.factors || "-",
        factor_weight: item?.factor_weight || "-",
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
        style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
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
                  title: "", 
                  type: "", 
                  factor_weight: "", 
                  status: false 
                });
              }}
            >
              Add New Record
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
            selectedItem === "edit" ? "Edit Profession Value" : "Add Profession Value"
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
          <div className={"Ente-details"}>
            <Form>
              <Row className="">
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Title</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Title"
                  value={formData.title}
                  onChange={(e: any) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Type</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Type"
                  value={formData.type}
                  onChange={(e: any) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Factor Weight</label>
                <Input
                  type="number"
                  className="fs-6"
                  placeholder="Enter Factor Weight"
                  value={formData.factor_weight}
                  onChange={(e: any) =>
                    setFormData({ ...formData, factor_weight: e.target.value })
                  }
                />
                </Col>
                <Col md={12} >            
                <Checkbox 
                  checked={formData.status}
                  onChange={(e: any) =>
                    setFormData({ ...formData, status: e.target.checked })
                  }
                >
                  Status
                </Checkbox>
                </Col>
              </Row>
            </Form>
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

export default ListOfValues;
