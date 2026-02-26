import { useEffect, useState } from "react";
import { Button, Select, Modal, Input, Form, Menu, Dropdown, Switch } from "antd";
import TableView from "../TableView/TableView";

import { adminFeeProducts, createFeeSlab, getProductById, updateFeeSlab, deleteProcessingFeeSlab, UpdateProductStatus, updateFeeSlabStatus } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
 
import { useLocation } from "react-router-dom";
import arrowDown from "../../assets/images/arrow-down.png";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setProductData } from "../../redux/apis/apisSlice";


const AdminFeeSlabs = ({ readOnly = false,setSelectedTab }: any) => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>("add");
  const [newSlab, setNewSlab] = useState<any>({
    from_amount: "",
    to_amount: "",
    profit_percent: 0,
    admin_fee: 0,
    processing_fee: 0,
  });
  
  const location = useLocation();
  const dispatch = useDispatch();
  const product = useSelector((s: any) => s.block.productData);
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;
  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        try {
          const response = await getProductById(productId, 'admin_fee_slabs');
          if (response?.data?.success) {
            // Don't overwrite the full product data, just load admin fee slabs data
            if (response.data.data?.admin_fee_slabs) {
              setData(response.data.data.admin_fee_slabs);
            }
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Failed to load admin fee slabs data");
        }
      }
    };
    loadProductData();
  }, [productId, dispatch]);
const handleNext=()=>{
  localStorage.setItem("tabs", "EnvConfig");
  setSelectedTab("EnvConfig")
}
  const handleSubmit = async () => {
    try {
      const isEdit = selectedItem === "edit" && (newSlab as any).id;
      let response;
      if (isEdit) {
        const updateBody: any = {
          processing_fee_slab_id: (newSlab as any).id,
          from_amount: Number(newSlab.from_amount || 0),
          to_amount: Number(newSlab.to_amount || 0),
          processing_fee: Number(newSlab.processing_fee || 0),
          product_id: productId,
          admin_fee: Number(newSlab.admin_fee || 0),
        };
        response = await updateFeeSlab(updateBody);
      } else {
        const createBody: any = {
          product_id: productId,
          from_amount: Number(newSlab.from_amount || 0),
          to_amount: Number(newSlab.to_amount || 0),
          profit_percent: Number(newSlab.profit_percent || 0),
          admin_fee: Number(newSlab.admin_fee || 0),
          processing_fee: Number(newSlab.processing_fee || 0),
        };
        response = await createFeeSlab(createBody);
      }
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Fee slab created");
        setIsModalVisible(false);
        setNewSlab({ from_amount: "", to_amount: "", profit_percent: 0, admin_fee: 0, processing_fee: 0 });
        getList();
        return;
      }
      toast.error(response?.data?.message || "Failed to create fee slab");
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        Object.keys(err?.response?.data?.errors).forEach((field) => {
          err?.response?.data.errors[field].forEach((msg: any) => {
            toast.error(`${field}: ${msg}`);
          });
        });
        return;
      }
      toast.error(err?.response?.data?.message || "Failed to create fee slab");
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Status change handling can be added when API is available

  // No row actions currently
  const Activity_Loans_Header = [
    { name: "From Amount", selector: (row: any) => `SR ${row.from_amount}`, sortable: true },
    { name: "To Amount", selector: (row: any) => `SR ${row.to_amount}`, sortable: true },
    { name: "Profit (%)", selector: (row: any) => `${row.profit_percent || 0}%`, sortable: true },
    { name: "Admin Fee", selector: (row: any) => `SR ${row.admin_fee || 0}`, sortable: true },
    { name: "Processing Fee", selector: (row: any) => `SR ${row.processing_fee || 0}`, sortable: true },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "12px",
            backgroundColor:
              row.status === "active" || row.status === 1
                ? "rgba(63, 195, 128, 0.9)"
                : "#F84D4D",
            color: "white",
          }}
        >
          {row.status === "active" || row.status === 1 ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Change Status",
      cell: (row: { status: any; id?: number }) => (
        <Switch
          checked={row.status === 1}  // Check if status is 1 (active)
          onChange={async (checked) => {
            const newStatus = checked ? 1 : 0;  // 1 for active, 0 for inactive
    
            try {
              
              const res = await updateFeeSlabStatus(row?.id, newStatus);  // Pass id and status as parameters
    
              if (res?.data?.success) {
                toast.success(res?.data?.message || "Status updated successfully");
                getList();  // Reload the data to reflect the change
    
                // Update the table data directly
                setData((prevData: any) =>
                  prevData.map((item: any) =>
                    item.id === row.id ? { ...item, status: newStatus } : item
                  )
                );
              }
            } catch (error) {
              toast.error("Failed to update status");
              console.error("Error updating status:", error);
            }
          }}
          className="red-switch"
          disabled={readOnly}  // Disable if in read-only mode
        />
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
              backgroundColor: "#0B8085 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
            disabled={readOnly}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];
 
  const menu = (row: any) => (
    <Menu>

      <Menu.Item
        key="edit"
        icon={<EditFilled />}
        onClick={() => openEdit(row)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteFilled />}
        onClick={() => handleDelete(row)}
      >
        Delete
      </Menu.Item>
     
    </Menu>
  );
  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await adminFeeProducts(productId, "");
      if (response) {
        const data = response?.data?.data?.data;
        setData(data || []);
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

  const openEdit = (row: any) => {
    setNewSlab({
      id: row.id,
      from_amount: row.from_amount,
      to_amount: row.to_amount,
      profit_percent: row.profit_percent,
      admin_fee: row.admin_fee,
      processing_fee: row.processing_fee,
    });
    setSelectedItem("edit");
    setIsModalVisible(true);
  };

  const handleDelete = async (row: any) => {
    try {
     const res= await deleteProcessingFeeSlab(row.id);
      toast.success(res?.data?.message || "Deleted successfully");
      getList();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    }
  };
  useEffect(() => {
    getList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any) => ({
      id: item?.id,
      from_amount: item?.from_amount ?? item?.from ?? 0,
      to_amount: item?.to_amount ?? item?.to ?? 0,
      profit_percent: item?.profit_percent ?? item?.profit ?? 0,
      admin_fee: item?.admin_fee ?? 0,
      processing_fee: item?.processing_fee ?? 0,
      status: item?.status ?? 0, // Keep the original status value (0 or 1)
    }));

  return (
    <div className="service">
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Fee Slabs
      </h1>
      <div className="d-flex justify-content-end mb-3 gap-2">
        {/* <Select defaultValue="All Partners" style={{ width: 160 }} disabled>
          <option>All Partners</option>
        </Select> */}
        <Button type="primary" className="theme-btn-next" onClick={() => { setSelectedItem("add"); setIsModalVisible(true); }}>
          Add New Record
        </Button>
      </div>

      <Modal
        // className="custom-mod"
        title={readOnly ? "View Admin Fee Slab" : "Add Admin Fee Slab"}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={readOnly ? [
          <Button key="close" onClick={handleCancel}>Close</Button>
        ] : [
          <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
          <Button key="save" className="theme-btn-next" type="primary" onClick={handleSubmit}>Save</Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Amount From">
            <Input placeholder="Amount From" value={newSlab.from_amount} onChange={(e) => setNewSlab({ ...newSlab, from_amount: e.target.value })} />
          </Form.Item>
          <Form.Item label="Amount To">
            <Input placeholder="Amount To" value={newSlab.to_amount} onChange={(e) => setNewSlab({ ...newSlab, to_amount: e.target.value })} />
          </Form.Item>
          <Form.Item label="Profit %">
            <Input placeholder="Profit %" value={newSlab.profit_percent} onChange={(e) => setNewSlab({ ...newSlab, profit_percent: e.target.value })} />
          </Form.Item>
          <Form.Item label="Admin Fee">
            <Input placeholder="Admin Fee" value={newSlab.admin_fee} onChange={(e) => setNewSlab({ ...newSlab, admin_fee: e.target.value })} />
          </Form.Item>
          <Form.Item label="Processing Fee">
            <Input placeholder="Processing Fee" value={newSlab.processing_fee} onChange={(e) => setNewSlab({ ...newSlab, processing_fee: e.target.value })} />
          </Form.Item>
        </Form>
      </Modal>
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
      <div className="d-flex justify-content-end mt-3"><button className="theme-btn-next" onClick={handleNext}>Next</button></div>
    </div>
  );
};

export default AdminFeeSlabs;
