import { SetStateAction, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Menu,
  Select,
  Modal,
  Form,
  Row,
  Col,
  Checkbox,
  Dropdown,
} from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  getLOVsByType,
  createListOfValue,
  updateListOfValue,
  deleteListOfValues,
} from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";


const SourceOfIncome = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilters] = useState();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentSourceId, setCurrentSourceId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    title: "", 
    type: "SourceOfIncome", 
    factor_weight: "", 
    status: false 
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const navigate = useNavigate();

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
    {
      name: "Title",
      selector: (row: { title: any }) => row.title || "-",
    },
    {
      name: "Type",
      selector: (row: { type: any }) => row.type || "-",
    },
    {
      name: "Factor Weight",
      selector: (row: { factor_weight: any }) => row.factor_weight ?? "-",
    },
    {
      name: "Factors",
      selector: (row: { factors: any }) => row.factors ?? "-",
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
              row.status === true
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === false
                ? "#BC3D3F"
                : "#FF9811",
            color: "white",
            cursor: row.status === true ? "pointer" : "default",
          }}
        >
          {row.status === true ? "Active" : "Inactive"}
        </div>
      ),
    },
    // {
    //   name: "Change Status",
    //   cell: (row: any) => (
    //     <Switch
    //       checked={row.status === true}
    //       onChange={async (checked) => {
    //         const newStatus = checked;
    //         const body = {
    //           status: newStatus,
    //         };

    //         try {
    //           const res = await updateCommodityTypeStatus(row.id, body);
    //           if (res) {
    //             toast.success(res?.data?.message);
    //             getList();
    //             // Update UI locally
    //             setData((prevData: any) =>
    //               prevData.map((item: any) =>
    //                 item.id === row.id ? { ...item, status: newStatus } : item
    //               )
    //             );
    //           }
    //         } catch (error) {
    //           console.error("Status update failed:", error);
    //         }
    //       }}
    //       className="red-switch"
    //     />
    //   ),
    // },
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
        success: () => {
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
          success: () => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              title: "", 
              type: "SourceOfIncome", 
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
          loading: "Adding new record...",
          success: () => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              title: "", 
              type: "SourceOfIncome", 
              factor_weight: "", 
              status: false 
              });
            getList();
            return "Record added successfully";
          },
          error: (err) => err?.message || "Failed to add new record",
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      setShowConfirmModal(false);
    }
  }; 

  const getList = async (searchQuery?: string) => {
     setSkelitonLoading(true);
     try {
       const res = await getLOVsByType("SourceOfIncome", page, pageSize, searchQuery || searchTerm);
       if (res) {
         const responseData = res?.data?.data;
         const data = responseData?.data || [];
         setData(data || []);
         setSkelitonLoading(false);
         setTotalRows(responseData?.total || 0);
         setFrom(responseData?.from || 0);
         setTo(responseData?.to || 0);
         setTotalPage(responseData?.last_page || 0);
       }
     } catch (error: any) {
       console.error("Error fetching Financing purpose:", error);
       setSkelitonLoading(false);
     }
  };

  // Debounce search function
  const debouncedSearch = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    
    // Set new timeout for debounced search
    debouncedSearch.current = setTimeout(() => {
      // Reset to page 1 when searching
      setPage(1);
      getList(value);
    }, 500); // 500ms debounce delay
  };

  useEffect(() => {
     getList();
  }, [page, pageSize]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearch.current) {
        clearTimeout(debouncedSearch.current);
      }
    };
  }, []);
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id,
        Sr: index + 1,
        title: item?.title || "-",
        type: item?.type || "-",
        factor_weight: item?.factor_weight ?? "-",
        factors: item?.factors ?? "-",
        status: item?.status,
      };
    });

  const options = [{ label: "Name", value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {
    //setSelectedFilters(value[0]);
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
                  type: "SourceOfIncome", 
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
            selectedItem === "edit" ? "Edit Record" : "Add New Record"
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
                  placeholder="SourceOfIncome"
                  value={formData.type}
                  disabled
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

export default SourceOfIncome;
