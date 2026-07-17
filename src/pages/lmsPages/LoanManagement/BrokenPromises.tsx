import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("loanManagement");
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
      toast.error(error?.message || t("brokenPromises.toastLoadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, [page, pageSize]);

  const headers = [


    {
      name: t("brokenPromises.colPromisedAmount"),
      cell: (row: any) => row.promisedAmount ?? "-",
      sortable: true,
      width: "160px",
    },
,
    {
      name: t("brokenPromises.colTakenBy"),
      cell: (row: any) => row.takenBy ?? "-",
      sortable: true,
      width: "160px",
    },
    {
      name: t("brokenPromises.colTakenDate"),
      sortable: true,
      cell: (row: any) => (
        <div>{row.takenDate ? new Date(row.takenDate).toLocaleString() : "-"}</div>
      ),
      width: "200px",
    },
    {
      name: t("brokenPromises.colDueOnTakenDate"),
      sortable: true,
      cell: (row: any) => (
        <div>{row.dueOnTakenDate ? formatDate(row.dueOnTakenDate) : "-"}</div>
      ),
      width: "200px",
    },
    {
      name: t("brokenPromises.colCollectedAmount"),
      cell: (row: any) => row.collectedAmount ?? "-",
      sortable: true,
      width: "170px",
    },

    {
      name: t("brokenPromises.colCancelled"),
      width: "170px",
      cell: (row: any) => (
        <Switch checked={!!row.isCancelledPromise} checkedChildren={t("common:yes")} unCheckedChildren={t("common:no")} disabled />
      ),
    },
    {
      name: t("brokenPromises.colContact"),
      cell: (row: any) => row.contact ?? "-",
      sortable: true,
      width: "170px",
    },
   
    {
      name: t("common:actions"),
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
            {t("applications.select")} <img src={arrowDown} alt="" />
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
      {t("common:edit")}
      </Menu.Item>
    </Menu>
  );

  const openCreate = () => {
    if (!selectedApplication) {
      toast.error(t("brokenPromises.toastOpenFromApp"));
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
        toast.success((res as any)?.data?.notificationMessage || t("brokenPromises.toastUpdated"));
        setEditPromise(null);
      } else {
        // Creating new promise
        const res = await addPromise(payload);
        toast.success((res as any)?.data?.notificationMessage || t("brokenPromises.toastCreated"));
      }

      setIsCreateOpen(false);
      form.resetFields();
      getList();
    } catch (e: any) {
      toast.error(e?.response?.data?.notificationMessage || e?.message || (editPromise ? t("brokenPromises.toastUpdateFailed") : t("brokenPromises.toastCreateFailed")));
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
          {t("brokenPromises.title")}
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
            {t("brokenPromises.create")}
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

      <Modal maskClosable={false} keyboard={false}
        title={editPromise ? t("brokenPromises.editTitle") : t("brokenPromises.create")}
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
                label={t("common:amount")}
                name="amount"
                rules={[{  message: "Amount is required" }]}
              >
                <Input type="number" style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label={t("brokenPromises.promiseDate")}
                name="promiseDate"
                rules={[{  message: "Promise Date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col md={12} className="col-12">
              <h6 style={{ marginBottom: "10px", fontWeight: 600 }}>{t("brokenPromises.promisedByCustomer")}</h6>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label={t("field.customerName")}
                name="customerName"
                rules={[{  message: "Customer Name is required" }]}
              >
                <Input placeholder={t("field.customerName")} />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label={t("brokenPromises.customerCif")}
                name="customerCIF"
                rules={[{  message: "Customer CIF is required" }]}
              >
                <Input placeholder={t("brokenPromises.customerCif")} />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label={t("brokenPromises.customerPhoneNo")}
                name="customerPhoneNo"
                rules={[{  message: "Customer Phone No is required" }]}
              >
                <Input placeholder={t("brokenPromises.customerPhoneNo")} />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label={t("brokenPromises.customerRelationship")}
                name="customerRelationship"
                rules={[{  message: "Customer Relationship is required" }]}
              >
                <Select placeholder={t("brokenPromises.selectRelationship")} style={{ width: "100%" }}>
                  <Select.Option value={Relationships.Self}>{t("brokenPromises.relSelf")}</Select.Option>
                  <Select.Option value={Relationships.Son}>{t("brokenPromises.relSon")}</Select.Option>
                  <Select.Option value={Relationships.Daughter}>{t("brokenPromises.relDaughter")}</Select.Option>
                  <Select.Option value={Relationships.Spouse}>{t("brokenPromises.relSpouse")}</Select.Option>
                  <Select.Option value={Relationships.Brother}>{t("brokenPromises.relBrother")}</Select.Option>
                  <Select.Option value={Relationships.Sister}>{t("brokenPromises.relSister")}</Select.Option>
                  <Select.Option value={Relationships.Mother}>{t("brokenPromises.relMother")}</Select.Option>
                  <Select.Option value={Relationships.Father}>{t("brokenPromises.relFather")}</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col md={12} className="col-12">
              <h6 style={{ marginBottom: "10px", marginTop: "10px", fontWeight: 600 }}>{t("brokenPromises.promiseWithAgent")}</h6>
            </Col>

            <Col md={6} className="col-4">
              <Form.Item
                label={t("brokenPromises.agentId")}
                name="agentId"
                rules={[{  message: "Agent ID is required" }]}
              >
                <Input placeholder={t("brokenPromises.agentId")} />
              </Form.Item>
            </Col>

            <Col md={6} className="col-4">
              <Form.Item
                label={t("brokenPromises.agentName")}
                name="agentName"
                rules={[{  message: "Agent Name is required" }]}
              >
                <Input placeholder={t("brokenPromises.agentName")} />
              </Form.Item>
            </Col>

            <Col md={6} className="col-4">
              <Form.Item
                label={t("brokenPromises.agentEmail")}
                name="agentEmail"
                rules={[{  message: "Agent Email is required" }]}
              >
                <Input type="email" placeholder={t("brokenPromises.agentEmail")} />
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item 
                label={t("common:status")}
                name="status"
                rules={[{  message: "Status is required" }]}
              >
                <Select placeholder={t("brokenPromises.selectStatus")} style={{ width: "100%" }}>
                  <Select.Option value={PromiseStatus.Promised}>{t("brokenPromises.statusPromised")}</Select.Option>
                  <Select.Option value={PromiseStatus.Completed}>{t("brokenPromises.statusCompleted")}</Select.Option>
                  <Select.Option value={PromiseStatus.Cancelled}>{t("brokenPromises.statusCancelled")}</Select.Option>
                  <Select.Option value={PromiseStatus.Broken}>{t("brokenPromises.statusBroken")}</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col md={6} className="col-6">
              <Form.Item
                label={t("brokenPromises.invoiceNumbersLabel")}
                name="invoiceNumbers"
              >
                <Input placeholder={t("brokenPromises.invoiceNumbersPlaceholder")} />
                <small className="text-muted">{t("brokenPromises.invoiceNumbersHint")}</small>
              </Form.Item>
            </Col>

            <Col md={12} className="col-12">
              <Form.Item label={t("brokenPromises.commentLabel")} name="comment" rules={[{  message: "Comment is required" }]}>
                <Input.TextArea rows={3} placeholder={t("brokenPromises.commentPlaceholder")} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => {
              setIsCreateOpen(false);
              setEditPromise(null);
              form.resetFields();
            }}>{t("common:cancel")}</Button>
            <button 
              type="submit"
              className="theme-btn-next"
              disabled={isSubmitting}
            >
              <span className="gradient-btn">
                {editPromise ? t("common:update") : t("common:create")}
              </span>
            </button>
          </div>
        </Form>
      </Modal>

      {/* Promise Details modal removed (not requested for current flow) */}
    </div>
  );
}


