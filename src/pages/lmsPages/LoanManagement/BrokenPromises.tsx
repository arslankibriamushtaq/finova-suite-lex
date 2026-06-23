import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/rootReducer";
import { Button, Dropdown, Form, Input, Menu, Modal, Switch, DatePicker, Select } from "antd";
import { CalendarX } from "lucide-react";
import toast from "react-hot-toast";
import TableView from "../../../components/TableView/TableView";
import dayjs from "dayjs";
import { addPromise, getAllPromisesCustomer, updatePromise } from "../../../redux/apis/apisCrudLms";
import { Col, Row } from "react-bootstrap";
import arrowDown from "../../../assets/images/arrow-down.png";
import { formatDate } from "../../../App";

// Enum matching backend PromiseStatus
enum PromiseStatus {
  Promised = 1,
  Completed = 2,
  Cancelled = 3,
  Broken = 4
}

// Enum matching backend Relationships
enum Relationships {
  Self = 1,
  Son = 2,
  Daughter = 3,
  Spouse = 4,
  Brother = 5,
  Sister = 6,
  Mother = 7,
  Father = 8
}

export default function BrokenPromises() {
  // Selected Application row is saved into Redux when user clicks "Broken Promise" in Application Management
  const selectedApplication = useSelector(
    (state: RootState) => (state as any)?.block?.selectedPromiseApplication
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
const[editPromise, setEditPromise] = useState<any>(null);
  // Table state (GET API will be wired once you provide the endpoint)
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const getList = async () => {
    setIsLoading(true);
    try {
      const res = await getAllPromisesCustomer(page, pageSize);
      if(res){
        const data = res?.data?.data;
        setData(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
        setTotalPage(res?.data?.pageInfo?.totalPages || 1);
        setFrom(res?.data?.pageInfo?.pageNo || 0);
        setTo(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load broken promises");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, [page, pageSize]);

  const headers = [


    {
      name: "Promised Amount",
      cell: (row: any) => row.promisedAmount ?? "-",
      sortable: true,
      width: "160px",
    },
,
    {
      name: "Taken By",
      cell: (row: any) => row.takenBy ?? "-",
      sortable: true,
      width: "160px",
    },
    {
      name: "Taken Date",
      sortable: true,
      cell: (row: any) => (
        <div>{row.takenDate ? new Date(row.takenDate).toLocaleString() : "-"}</div>
      ),
      width: "200px",
    },
    {
      name: "Due On Taken Date",
      sortable: true,
      cell: (row: any) => (
        <div>{row.dueOnTakenDate ? formatDate(row.dueOnTakenDate) : "-"}</div>
      ),
      width: "200px",
    },
    {
      name: "Collected Amount",
      cell: (row: any) => row.collectedAmount ?? "-",
      sortable: true,
      width: "170px",
    },

    {
      name: "Cancelled",
      width: "170px",
      cell: (row: any) => (
        <Switch checked={!!row.isCancelledPromise} checkedChildren="Yes" unCheckedChildren="No" disabled />
      ),
    },
    {
      name: "Contact",
      cell: (row: any) => row.contact ?? "-",
      sortable: true,
      width: "170px",
    },
   
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "var(--color-action) !important",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
      width: "140px",
    },
  ];


const handleEditPromise = (row: any) => {
    setEditPromise(row?.promiseId || row?.id)
    
setIsCreateOpen(true)

form.setFieldsValue({
  // New API structure fields
  amount: row?.amount || 0,
  promiseDate: row?.promiseDate ? dayjs(row.promiseDate) : dayjs(),
  customerName: row?.promisedBy?.customerName || selectedApplication?.customerName || selectedApplication?.name || "",
  customerCIF: row?.promisedBy?.customerCIF || selectedApplication?.cif || "",
  customerPhoneNo: row?.promisedBy?.customerPhoneNo || "",
  customerRelationship: row?.promisedBy?.customerRelationship || Relationships.Self,
  agentId: row?.promiseWith?.agentId || "",
  agentName: row?.promiseWith?.agentName || "",
  agentEmail: row?.promiseWith?.agentEmail || "",
  status: row?.status !== undefined ? row.status : PromiseStatus.Promised,
  comment: row?.comment || "",
  invoiceNumbers: Array.isArray(row?.invoiceNumbers) 
    ? row.invoiceNumbers.join(', ') 
    : (row?.invoiceNumbers || '')
});
};
  const menu = (_row: any) => (
    <Menu>
     
      <Menu.Item key="edit" onClick={() => handleEditPromise(_row)}>
      Edit
      </Menu.Item>
    </Menu>
  );

  const openCreate = () => {
    if (!selectedApplication) {
      toast.error("Please open Broken Promise from Application Management first.");
      return;
    }

    form.setFieldsValue({
      // New API structure fields
      amount: 0,
      promiseDate: dayjs(),
      customerName: selectedApplication?.customerName || selectedApplication?.name || "",
      customerCIF: selectedApplication?.cif || "",
      customerPhoneNo: "",
      customerRelationship: Relationships.Self, // Default to Self
      agentId: "",
      agentName: "",
      agentEmail: "",
      status: PromiseStatus.Promised, // Default to Promised
      comment: "",
      invoiceNumbers: Array.isArray(selectedApplication?.invoiceNumbers) 
        ? selectedApplication.invoiceNumbers.join(', ') 
        : ''
    });

    setIsCreateOpen(true);
  };

  const handleCreate = async (values: any) => {
    try {
      setIsSubmitting(true);

      const currentDate = new Date().toISOString();

      const payload: any = {
        amount: Number(values.amount || 0),
        promiseDate: values.promiseDate?.toISOString?.() ?? values.promiseDate,
        createDate: currentDate,
        promisedBy: {
          customerName: values.customerName || selectedApplication?.customerName || selectedApplication?.name || "",
          customerCIF: values.customerCIF || selectedApplication?.cif || "",
          customerPhoneNo: values.customerPhoneNo || "",
          customerRelationship: Number(values.customerRelationship) || Relationships.Self
        },
        promiseWith: {
          agentId: values.agentId || "",
          agentName: values.agentName || "",
          agentEmail: values.agentEmail || ""
        },
        loanId: selectedApplication?.loanId || "",
        status: Number(values.status) || PromiseStatus.Promised, // Use PromiseStatus enum
        comment: values.comment || "",
        invoiceNumbers: Array.isArray(values.invoiceNumbers) 
          ? values.invoiceNumbers 
          : (typeof values.invoiceNumbers === 'string' && values.invoiceNumbers.trim() 
              ? values.invoiceNumbers.split(',').map((inv: string) => inv.trim()).filter((inv: string) => inv)
              : (selectedApplication?.invoiceNumbers || []))
      };

      // If editing, add id and call update API
      if (editPromise) {
        payload.id = editPromise;
        const res = await updatePromise(payload);
        toast.success((res as any)?.data?.notificationMessage || "Broken promise updated successfully");
        setEditPromise(null);
      } else {
        // Creating new promise
        const res = await addPromise(payload);
        toast.success((res as any)?.data?.notificationMessage || "Broken promise created successfully");
      }

      setIsCreateOpen(false);
      form.resetFields();
      getList();
    } catch (e: any) {
      toast.error(e?.response?.data?.notificationMessage || e?.message || (editPromise ? "Failed to update broken promise" : "Failed to create broken promise"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="service broken-promises-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <CalendarX className="h-4 w-4" />
          </span>
          Broken Promises
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 w-100">
          <Button
            type="primary"
            className="theme-btn-next"
            onClick={openCreate}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Create Broken Promise
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="pro-card"
      >
        <TableView
          header={headers}
          data={data}
          totalRows={totalRows}
          isLoading={isLoading}
          from={from}
          to={to}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      <Modal
        title={editPromise ? "Edit Broken Promise" : "Create Broken Promise"}
        open={isCreateOpen}
        width={800}
       
        onCancel={() => {
          setIsCreateOpen(false);
          setEditPromise(null);
          form.resetFields();
        }}
        footer={null}
    
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row className="g-3">
            <Col md={6} className="col-6">
              <Form.Item
                label="Amount"
                name="amount"
                rules={[{  message: "Amount is required" }]}
              >
                <Input type="number" style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label="Promise Date"
                name="promiseDate"
                rules={[{  message: "Promise Date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col md={12} className="col-12">
              <h6 style={{ marginBottom: "10px", fontWeight: 600 }}>Promised By (Customer)</h6>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label="Customer Name"
                name="customerName"
                rules={[{  message: "Customer Name is required" }]}
              >
                <Input placeholder="Customer Name" />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label="Customer CIF"
                name="customerCIF"
                rules={[{  message: "Customer CIF is required" }]}
              >
                <Input placeholder="Customer CIF" />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label="Customer Phone No"
                name="customerPhoneNo"
                rules={[{  message: "Customer Phone No is required" }]}
              >
                <Input placeholder="Customer Phone No" />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label="Customer Relationship"
                name="customerRelationship"
                rules={[{  message: "Customer Relationship is required" }]}
              >
                <Select placeholder="Select Relationship" style={{ width: "100%" }}>
                  <Select.Option value={Relationships.Self}>Self</Select.Option>
                  <Select.Option value={Relationships.Son}>Son</Select.Option>
                  <Select.Option value={Relationships.Daughter}>Daughter </Select.Option>
                  <Select.Option value={Relationships.Spouse}>Spouse </Select.Option>
                  <Select.Option value={Relationships.Brother}>Brother</Select.Option>
                  <Select.Option value={Relationships.Sister}>Sister</Select.Option>
                  <Select.Option value={Relationships.Mother}>Mother </Select.Option>
                  <Select.Option value={Relationships.Father}>Father </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col md={12} className="col-12">
              <h6 style={{ marginBottom: "10px", marginTop: "10px", fontWeight: 600 }}>Promise With (Agent)</h6>
            </Col>

            <Col md={6} className="col-4">
              <Form.Item
                label="Agent ID"
                name="agentId"
                rules={[{  message: "Agent ID is required" }]}
              >
                <Input placeholder="Agent ID" />
              </Form.Item>
            </Col>

            <Col md={6} className="col-4">
              <Form.Item
                label="Agent Name"
                name="agentName"
                rules={[{  message: "Agent Name is required" }]}
              >
                <Input placeholder="Agent Name" />
              </Form.Item>
            </Col>

            <Col md={6} className="col-4">
              <Form.Item
                label="Agent Email"
                name="agentEmail"
                rules={[{  message: "Agent Email is required" }]}
              >
                <Input type="email" placeholder="Agent Email" />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item 
                label="Status" 
                name="status" 
                rules={[{  message: "Status is required" }]}
              >
                <Select placeholder="Select Status" style={{ width: "100%" }}>
                  <Select.Option value={PromiseStatus.Promised}>Promised</Select.Option>
                  <Select.Option value={PromiseStatus.Completed}>Completed</Select.Option>
                  <Select.Option value={PromiseStatus.Cancelled}>Cancelled</Select.Option>
                  <Select.Option value={PromiseStatus.Broken}>Broken</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label="Invoice Numbers (comma separated)"
                name="invoiceNumbers"
              >
                <Input placeholder="e.g., FIN0697835, FIN0697836" />
                <small className="text-muted">Enter invoice numbers separated by commas</small>
              </Form.Item>
            </Col>

            <Col md={12} className="col-12">
              <Form.Item label="Comment" name="comment" rules={[{  message: "Comment is required" }]}>
                <Input.TextArea rows={3} placeholder="Comment" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => {
              setIsCreateOpen(false);
              setEditPromise(null);
              form.resetFields();
            }}>Cancel</Button>
            <button 
              type="submit"
              className="theme-btn-next"
              disabled={isSubmitting}
            >
              <span className="gradient-btn">
                {editPromise ? "Update" : "Create"}
              </span>
            </button>
          </div>
        </Form>
      </Modal>

      {/* Promise Details modal removed (not requested for current flow) */}
    </div>
  );
}


