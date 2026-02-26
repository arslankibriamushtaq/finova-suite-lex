import { Button, Dropdown, Form, Input, Menu, Modal, Select, Switch } from "antd";
import toast from "react-hot-toast";
import { getProductById, getReqDocument, storeReqDocument, updateReqDocument } from "../../redux/apis/apisCrud";
import { useLocation } from "react-router-dom";
import TableView from "../TableView/TableView";
import { useState,useEffect } from "react";
import { DeleteFilled, EditFilled, EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";  
import arrowDown from "../../assets/images/arrow-down.png";
import { useSelector } from "react-redux";
import { usePermissions, DOCUMENT_PERMISSIONS } from "../../hooks/useProductPermissions";
const RequiredDoc = ({setSelectedTab}:any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState({ name: "", type: "", status: false });
  const [data, setData] = useState<any>();
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const product = useSelector((s: any) => s.block.productData);
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Permissions hook
  const { 
    canCreate, 
    canUpdate, 
    canRemove, 
    canVerifyModule, 
    canRejectAsChecker, 
    canApproveModule, 
    canRejectAsApprover 
  } = usePermissions();
  const headers = [
    { name: "Name", selector: (row: any) => row.name, },
    { name: "Type", selector: (row: any) => row.type, },
    { name: "Created By", selector: (row: any) => row.created_by || "-" },
    { name: "Creation Date", selector: (row: any) => row.created_at || "-" },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "12px",
            backgroundColor: row.status ? "var(--chart-2)" : "var(--destructive)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.status ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: any) => {
        if (!hasAnyActionPermission()) {
          return "-";
        }
        return (
          <Dropdown overlay={menu(row)} trigger={["click"]}>
            <Button
              className="gradient-btn bg-teal-600 text-foreground border border-primary-foreground rounded-lg py-2.5 px-5"
              type="primary"
            style={{
                borderRadius: "8px",
                padding: "10px 20px",
              }}
            >
              Select <img src={arrowDown} alt="" />
            </Button>
          </Dropdown>
        );
      },
    },
  ];
  const menu = (row: any) => {
    const menuItems: React.ReactNode[] = [];
    
    // Edit - requires edit permission or maker permissions
    if (canUpdate(DOCUMENT_PERMISSIONS)) {
      menuItems.push(
        <Menu.Item key="edit" icon={<EditFilled />} onClick={() => openEdit(row)}>
          Edit
        </Menu.Item>
      );
    }
    
    // Delete - requires delete permission or maker permissions
    if (canRemove(DOCUMENT_PERMISSIONS)) {
      menuItems.push(
        <Menu.Item key="delete" icon={<DeleteFilled />} onClick={() => removeDoc(row.id)}>
          Delete
        </Menu.Item>
      );
    }
    
    // Verify - requires checker.verify permission
    if (canVerifyModule(DOCUMENT_PERMISSIONS)) {
      menuItems.push(
        <Menu.Item key="verify" icon={<CheckOutlined />} onClick={() => console.log("Verify", row.id)}>
          Verify
        </Menu.Item>
      );
    }
    
    // Reject (Checker) - requires checker.reject permission
    if (canRejectAsChecker(DOCUMENT_PERMISSIONS)) {
      menuItems.push(
        <Menu.Item key="checker-reject" icon={<CloseOutlined />} danger onClick={() => console.log("Checker Reject", row.id)}>
          Reject (Checker)
        </Menu.Item>
      );
    }
    
    // Approve - requires approver.approve permission
    if (canApproveModule(DOCUMENT_PERMISSIONS)) {
      menuItems.push(
        <Menu.Item key="approve" icon={<CheckOutlined />} onClick={() => console.log("Approve", row.id)}>
          Approve
        </Menu.Item>
      );
    }
    
    // Reject (Approver) - requires approver.reject permission
    if (canRejectAsApprover(DOCUMENT_PERMISSIONS)) {
      menuItems.push(
        <Menu.Item key="approver-reject" icon={<CloseOutlined />} danger onClick={() => console.log("Approver Reject", row.id)}>
          Reject (Approver)
        </Menu.Item>
      );
    }
    
    return <Menu>{menuItems}</Menu>;
  };
  
  // Check if user has any action permissions
  const hasAnyActionPermission = () => {
    return canUpdate(DOCUMENT_PERMISSIONS) || 
           canRemove(DOCUMENT_PERMISSIONS) || 
           canVerifyModule(DOCUMENT_PERMISSIONS) || 
           canRejectAsChecker(DOCUMENT_PERMISSIONS) || 
           canApproveModule(DOCUMENT_PERMISSIONS) || 
           canRejectAsApprover(DOCUMENT_PERMISSIONS);
  };
  const openEdit = (row: any) => {
    setEditingId(row.id);
    
    setSelectedItem("edit")
    

    setFormValues({ name: row.name, type: row.type, status: !!row.status });
    setIsModalVisible(true);
  };

  const removeDoc = (id: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.success("Removed");
  };

  const loadDocuments = async () => {
    try {
      if (!productId) return;
      setIsLoading(true);
      const res = await getProductById(productId, "documents");
      const list = res?.data?.data?.documents || [];
      const mapped = list.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        created_by: d.created_by,
        created_at: d.created_at,
        status: d.status === 1 || d.status === "Active",
      }));
      setDocuments(mapped);
    } catch (e: any) {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();

  }, [productId]);
  useEffect(() => {
    getInfo(productId)

  }, [productId]);
  const getInfo = async (id: any, searchName?: string) => {
    try {
      const response = await getReqDocument(id);
      if (response) {
        const data = response?.data?.data?.data;
        setData(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (productId) {
      getInfo(productId, value);
    }
  };
  const handleSave = async () => {
    const body: any = {

      product_id:productId,
name:formValues.name,
type:formValues.type,
status:formValues.status,

    };
    try {
      if (selectedItem == "edit" && editingId !== null) {
        await toast.promise(updateReqDocument(editingId, body), {
          loading: "Updating Document...",
          success: (response: any) => {
            setIsModalVisible(false);
            setFormValues({
              name: "",
              type: "",
              status: false,
            });
            getInfo(productId);
            return response?.data?.message;
          },
          error: (err) => err?.message || "Failed to update Document",
        });
      } else if (selectedItem == "add") {
        await toast.promise(storeReqDocument(body), {
          loading: "Adding Document...",
          success: (response) => {
            setIsModalVisible(false);
            setFormValues({
              name: "",
              type: "",
              status: false,
            });
            getInfo(productId);

            return response?.data?.message;
          },
          error: (err) => {
            const errors = err?.data?.errors;

            if (errors) {
              const allMessages = Object.values(errors).flat();
              allMessages.forEach((msg: any) => toast.error(msg));
            } else {
              toast.error("Something went wrong!");
            }
            return "Validation error";
          },
        });
      }
    } catch (error) {
      console.error("Failed to save department:", error);
    }
  };
  
  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item.id,
        // Sr: index + from,
        name: item?.name,
        type: item?.type,
        created_by: item?.created_by,
        created_at: item?.created_at,
        status: item?.status,

    
      };
    });

  return (
    <div className="service">
      <h1 className="pt-2 pb-3" style={{ fontSize: "16px", fontWeight: "bold" }}>
      Factoring Vallery Documents
      </h1>
      <div className="d-flex justify-content-end mb-3 gap-2">
        <Input 
          placeholder="Search By Name" 
          style={{ width: 220 }} 
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {canCreate(DOCUMENT_PERMISSIONS) && (
          <Button type="primary" className="theme-btn-next" onClick={() => { setSelectedItem("add");setIsModalVisible(true); }}>
            Add New Document
          </Button>
        )}
      </div>

      <Modal
        title={editingId ? "Edit Document" : "Add Document"}
        visible={isModalVisible}
          width={600}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>Cancel</Button>,
          <Button key="save" type="primary" className="theme-btn-next" onClick={handleSave} >Save</Button>,
        ]}
      >
        <Form layout="vertical">
          <div className="row">
            <div className="col-md-6">
              <Form.Item label="Document Name">
                <Input className="form-control" placeholder="Document Name" value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label="Document Type">
                <Select value={formValues.type} onChange={(val) => setFormValues({ ...formValues, type: val as any })}>
                  <Select.Option value="PDF">PDF</Select.Option>
                  <Select.Option value="Image">Image</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Switch checked={formValues.status} onChange={(checked) => setFormValues({ ...formValues, status: checked })} />
            <span>Status</span>
          </div>
        </Form>
      </Modal>

      <TableView
        header={headers}
        data={mappedData}
        totalRows={documents.length}
        isLoading={isLoading}
        from={1}
        page={1}
        totalPage={1}
        setPage={() => {}}
        pageSize={documents.length || 15}
        setPageSize={() => {}}
        to={documents.length}
      />

      <div className="d-flex justify-content-end mt-3">
        <Button type="primary" className="theme-btn-next" >Save</Button>
      </div>
    </div>
  );
};

export default RequiredDoc;
