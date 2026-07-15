import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getCustomerInvoiceByApplicationID } from '../../redux/apis/apisCrud'
import TableView from '../TableView/TableView'
import toast from 'react-hot-toast'
import { Button, Modal, Form, Input, DatePicker, Upload, Row, Col, Dropdown } from 'antd'
import { EditOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import axios from 'axios'
import { store } from '../../redux/store'
import arrowDown from "../../assets/images/arrow-down.png";
import { useTranslation } from 'react-i18next';

 async function storeCustomerInvoice(formData: FormData) {
    const token = (store.getState() as any).block.token;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    return axios.post(
      `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/store-invoice`,
      formData,
      { headers: headers }
    );
  }
 async function updatCustomerInvoice(id: any, formData: FormData) {
    const token = (store.getState() as any).block.token;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    return axios.post(
      `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/update-invoice/${id}`,
      formData,
      { headers: headers }
    );
  }
const InvoiceByApplicationID = () => {
    const { t } = useTranslation("customersB");
    const location = useLocation();
    const application = location.state?.application; 
    const [invoices, setInvoices] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [form] = Form.useForm()
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [from, setFrom] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [to, setTo] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    useEffect(() => {
        const fetchInvoices = async () => {
            setIsLoading(true)
            try {
                const res = await getCustomerInvoiceByApplicationID(application?.id, page, pageSize)
                const payload = res?.data?.data?.invoices?.data;
                const list = Array.isArray(payload) ? payload : (payload ? [payload] : [])
                setTotalRows(res?.data?.data?.invoices?.total || 0);
                setFrom(res?.data?.data?.invoices?.from || 0);
                setTo(res?.data?.data?.invoices?.to || 0);
                setPage(res?.data?.data?.invoices?.current_page);
                setTotalPage(res?.data?.data?.invoices?.last_page);
                setInvoices(list)
            } catch (error: any) {
                toast.error(error?.message || t("customersB:invoice.loadFail"))
                setInvoices([])
            } finally {
                setIsLoading(false)
            }
        }
        if (application?.id) fetchInvoices()
    }, [application?.id, page, pageSize])

    const mappedInvoices = useMemo(() => (
        invoices?.map((item: any, idx: number) => ({
            Sr: idx + 1,
            id: item.id,
            application_no: item.application_no,
            debtors: item.debtors,
            invoice_no: item.invoice_no,
            invoice_date: item.invoice_date,
            due_date: item.due_date,
            amount:  item.amount,
            formatted_amount: item.formatted_amount,
            invoice_discount: item.invoice_discount,
            status: item.status,
            invoice_document: item.invoice_document,
            processed_by: item.processed_by ?? '-',
        })) || []
    ), [invoices])

    const headers = [
        { name: t("customersB:invoice.sr"), selector: (row: any) => row.Sr || '-' },
        { name: t("customersB:invoice.applicationNo"), selector: (row: any) => row.application_no || '-' },
        { name: t("customersB:invoice.debtors"), selector: (row: any) => row.debtors || '-' },
        { name: t("customersB:invoice.invoiceNo"), selector: (row: any) => row.invoice_no || '-' },
        { name: t("customersB:invoice.invoiceDate"), selector: (row: any) => row.invoice_date || '-' },
        { name: t("customersB:invoice.dueDate"), selector: (row: any) => row.due_date || '-' },
        { name: t("common:amount"), selector: (row: any) => row.formatted_amount ?? '-' },
        { name: t("customersB:invoice.invoiceDiscount"), selector: (row: any) => row.invoice_discount ?? '-' },
        { name: t("common:status"), selector: (row: any) => row.status || '-' },
        { name: t("customersB:invoice.processedBy"), selector: (row: any) => row.processed_by || '-' },
        {
            name: t("customersB:invoice.document"),
            cell: (row: any) => row.invoice_document ? (
                <a href={row.invoice_document} target="_blank" rel="noreferrer">{t("common:view")}</a>
            ) : '-',
        },
        {
            name: t("common:actions"),
            cell: (row: any) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', label: t("common:edit"), icon: <EditOutlined /> },
                            // { key: 'invoice', label: 'Invoice', icon: <FileOutlined /> },
                        ],
                        onClick: ({ key }) => handleMenuClick(String(key), row),
                    }}
                    trigger={["click"]}
                >
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
                        {t("common:select")} <img src={arrowDown} alt="" />
                    </Button>
                </Dropdown>
            ),
        },
    ]
    const handleMenuClick = (action: string, data: any) => {
        if (action === 'edit') {
            setSelectedInvoice(data)
            form.setFieldsValue({
                application_no: data.application_no,
                invoice_no: data.invoice_no,
                invoice_date: dayjs(data.invoice_date),
                due_date: dayjs(data.due_date),
                amount: data.amount,
                invoice_document: data.invoice_document ? [{
                    uid: '-1',
                    name: t("customersB:invoice.currentDocument"),
                    status: 'done',
                    url: data.invoice_document,
                }] : [],
            })
            setShowModal(true);
            return;
        }
       
    };
    const handleOk = async () => {
        if (selectedInvoice?.id) {
            // Update existing invoice
            try {
                const values = await form.validateFields()
                const fd = new FormData()
                fd.append('application_no', String(values.application_no))
                fd.append('invoice_no', String(selectedInvoice.invoice_no))
                fd.append('invoice_date', dayjs(values.invoice_date as Dayjs).format('YYYY-MM-DD'))
                fd.append('due_date', dayjs(values.due_date as Dayjs).format('YYYY-MM-DD'))
                fd.append('amount', String(values.amount))
                const firstFile = values.invoice_document?.[0]?.originFileObj as File | undefined
                if (firstFile) {
                    fd.append('invoice_document', firstFile)
                }
                
                await toast.promise(updatCustomerInvoice(selectedInvoice?.id, fd), {
                    loading: t("customersB:invoice.updating"),
                    success: t("customersB:invoice.updateSuccess"),
                    // error: 'Failed to update invoice'
                })
                setShowModal(false)
                setSelectedInvoice(null)
                // refresh list
                setIsLoading(true)
                try {
                    const res = await getCustomerInvoiceByApplicationID(application?.id, page, pageSize)
                    const payload = res?.data?.data?.invoices?.data
                    const list = Array.isArray(payload) ? payload : (payload ? [payload] : [])
                    const meta = res?.data?.data?.invoices
                    setTotalRows(meta?.total || list.length || 0)
                    setFrom(meta?.from || (list.length ? 1 : 0))
                    setTo(meta?.to || list.length)
                    setPage(meta?.current_page || 1)
                    setTotalPage(meta?.last_page || 1)
                    setInvoices(list)
                } catch (_) {}
                setIsLoading(false)
            } catch (err: any) {
                if (err?.errorFields) return; // form errors already shown
                toast.error(err?.response?.data?.errors?.invoice_document?.[0] || err?.message || t("customersB:invoice.updateFail"))
            }
        } else {
            // Create new invoice
            try {
                const values = await form.validateFields()
                const uniqueNum = Date.now(); // current timestamp in ms
                const fd = new FormData()
                fd.append('application_no', String(values.application_no))
                fd.append('invoice_no', `INV-${uniqueNum}`)
                fd.append('invoice_date', dayjs(values.invoice_date as Dayjs).format('YYYY-MM-DD'))
                fd.append('due_date', dayjs(values.due_date as Dayjs).format('YYYY-MM-DD'))
                fd.append('amount', String(values.amount))
                const firstFile = values.invoice_document?.[0]?.originFileObj as File | undefined
                if (firstFile) {
                    fd.append('invoice_document', firstFile)
                }
                await toast.promise(storeCustomerInvoice(fd), {
                    loading: t("customersB:invoice.creating"),
                    success: t("customersB:invoice.createSuccess"),
                    error: t("customersB:invoice.createFail")
                })
                setShowModal(false)
                // refresh list
                setIsLoading(true)
                try {
                    const res = await getCustomerInvoiceByApplicationID(application?.id, page, pageSize)
                    const payload = res?.data?.data?.invoices?.data
                    const list = Array.isArray(payload) ? payload : (payload ? [payload] : [])
                    const meta = res?.data?.data?.invoices
                    setTotalRows(meta?.total || list.length || 0)
                    setFrom(meta?.from || (list.length ? 1 : 0))
                    setTo(meta?.to || list.length)
                    setPage(meta?.current_page || 1)
                    setTotalPage(meta?.last_page || 1)
                    setInvoices(list)
                } catch (_) {}
                setIsLoading(false)
            } catch (err: any) {
                if (err?.errorFields) return; // form errors already shown
                toast.error(err?.response?.data?.errors?.invoice_document?.[0] || err?.message || t("customersB:invoice.createFail"))
            }
        }
    }
    return (
        <div>
            <div className="container-fluid px-4 p-2 mt-2">
                <div className="d-flex align-items-center justify-content-between mb-3 mt-1">
                    <label className="mb-0">{t("customersB:invoice.invoices")}</label>
                    <button className="theme-btn-next" onClick={() => {
                        setSelectedInvoice(null)
                        form.resetFields()
                        form.setFieldsValue({ application_no: application?.applicationNumber })
                        setShowModal(true)
                    }}>{t("customersB:invoice.addInvoice")}</button>
                </div>
                <TableView
                    header={headers}
                    data={mappedInvoices}
                    isLoading={isLoading}
                    totalRows={totalRows}
                    from={from}
                    page={page}
                    totalPage={totalPage}
                    setPage={setPage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    to={to}
                />
            </div>
            <Modal
                className="custom-mod"
                style={{ maxWidth: "640px" }}
                title={selectedInvoice?.id ? t("customersB:invoice.editInvoice") : t("customersB:invoice.addInvoice")}
                open={showModal}
                onCancel={() => setShowModal(false)}
                onOk={handleOk}
                okText={selectedInvoice?.id ? t("common:update") : t("common:add")}
            >
                <div className={"Ente-details"}>
                <Form layout="vertical" form={form}>
                    <Row>
                        <Col  className="px-2" md={12}>
                        <Form.Item label={t("customersB:invoice.applicationNo")} name="application_no">
                        <Input disabled />
                    </Form.Item>
                        </Col>
                        <Col  className="px-2" md={12}>
                        <Form.Item label={t("customersB:invoice.invoiceDate")} name="invoice_date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col  className="px-2" md={12}>
                        <Form.Item label={t("customersB:invoice.dueDate")} name="due_date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                        </Col>
                        <Col  className="px-2" md={12}>
                        <Form.Item label={t("common:amount")} name="amount" rules={[{ required: true }]}>
                        <Input type="number" min={0} />
                    </Form.Item>
                        </Col>
                    </Row>
                   
                 
                   
                    <Form.Item label={t("customersB:invoice.invoiceDocument")} name="invoice_document" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
                        <Upload beforeUpload={() => false} maxCount={1}>
                            <Button icon={<UploadOutlined />}>{t("customersB:invoice.selectFile")}</Button>
                        </Upload>
                    </Form.Item>
                </Form>
                </div>
            </Modal>
        </div>
    )
}

export default InvoiceByApplicationID