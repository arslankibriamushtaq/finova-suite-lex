import { Form, Input, Button, Modal, DatePicker, Badge, Spin } from "antd";
import { Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { validateFactoringAmount, storeFactoringInfo } from "../../redux/apis/apisCrudFactoring";
import { uploadStepDocuments } from "../../utils/uploadStepDocuments";
import RequiredDocFields from "./RequiredDocFields";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import "./Landing.css";

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceStartDate: string;
  dueDate: string;
  invoiceAmount: number;
  invoiceFactoringAmount: number;
  deductionDetails: {
    adminFee: number;
    processingFee: number;
    profitAmount: number;
    vatAmount: number;
  };
  documentFile: File | null;
  documentName: string;
}

const FactoringInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const businessFormData = (location.state as any)?.businessFormData;

  const applicationNoFromRedux = useSelector(
    (state: RootState) => state.block.applicationNo
  );
  const requiredDocuments = useSelector(
    (state: RootState) => state.block.requiredDocuments
  );

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form] = Form.useForm();

  const [deductionSummary, setDeductionSummary] = useState({
    adminFee: 0,
    processingFee: 0,
    profitAmount: 0,
    vatAmount: 0,
    invoiceFactoringAmount: 0,
  });
  const [validating, setValidating] = useState(false);
  const [currentDocFile, setCurrentDocFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [docFiles, setDocFiles] = useState<Record<number, File | null>>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocFileChange = (docId: number, file: File | null) => {
    setDocFiles((prev) => ({ ...prev, [docId]: file }));
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const callValidateFactoringAmount = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return;
    setValidating(true);
    try {
      const res = await validateFactoringAmount({
        total_amount: amount,
        application_no: applicationNoFromRedux || "",
      });
      if (res?.data?.success) {
        const data = res.data.data;
        const details = data?.deductions_details || {};
        setDeductionSummary({
          adminFee: parseFloat(details?.admin_fee_amount ?? 0),
          processingFee: parseFloat(details?.processing_fee_amount ?? 0),
          profitAmount: parseFloat(details?.profit_amount ?? 0),
          vatAmount: parseFloat(details?.vat_amount ?? 0),
          invoiceFactoringAmount: parseFloat(data?.actual_amount ?? 0),
        });
      }
    } catch (error: any) {
      console.error("Error validating factoring amount:", error);
    } finally {
      setValidating(false);
    }
  };

  const debouncedValidate = (amount: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (!amount) {
      setDeductionSummary({ adminFee: 0, processingFee: 0, profitAmount: 0, vatAmount: 0, invoiceFactoringAmount: 0 });
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      callValidateFactoringAmount(amount);
    }, 3000);
  };

  const resetDeductionSummary = () => {
    setDeductionSummary({ adminFee: 0, processingFee: 0, profitAmount: 0, vatAmount: 0, invoiceFactoringAmount: 0 });
  };

  const showModal = () => {
    setIsModalVisible(true);
    setEditingInvoice(null);
    form.resetFields();
    resetDeductionSummary();
    setCurrentDocFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsModalVisible(true);
    form.setFieldsValue({
      invoiceNumber: invoice.invoiceNumber,
      invoiceStartDate: dayjs(invoice.invoiceStartDate),
      dueDate: dayjs(invoice.dueDate),
      invoiceAmount: invoice.invoiceAmount,
    });
    setDeductionSummary({
      adminFee: invoice.deductionDetails.adminFee,
      processingFee: invoice.deductionDetails.processingFee,
      profitAmount: invoice.deductionDetails.profitAmount,
      vatAmount: invoice.deductionDetails.vatAmount,
      invoiceFactoringAmount: invoice.invoiceFactoringAmount,
    });
  };

  const handleDelete = (id: string) => {
    setInvoices(invoices.filter((inv) => inv.id !== id));
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        const docFile = currentDocFile || editingInvoice?.documentFile || null;
        if (!docFile) {
          toast.error("Please upload an invoice document.");
          return;
        }

        const newInvoice: Invoice = {
          id: editingInvoice?.id || Date.now().toString(),
          invoiceNumber: values.invoiceNumber,
          invoiceStartDate: values.invoiceStartDate.format("YYYY-MM-DD"),
          dueDate: values.dueDate.format("YYYY-MM-DD"),
          invoiceAmount: parseFloat(values.invoiceAmount),
          invoiceFactoringAmount: deductionSummary.invoiceFactoringAmount,
          deductionDetails: {
            adminFee: deductionSummary.adminFee,
            processingFee: deductionSummary.processingFee,
            profitAmount: deductionSummary.profitAmount,
            vatAmount: deductionSummary.vatAmount,
          },
          documentFile: docFile,
          documentName: docFile.name,
        };

        if (editingInvoice) {
          setInvoices(
            invoices.map((inv) => (inv.id === editingInvoice.id ? newInvoice : inv))
          );
        } else {
          setInvoices([...invoices, newInvoice]);
        }

        setIsModalVisible(false);
        form.resetFields();
        setCurrentDocFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingInvoice(null);
    form.resetFields();
    resetDeductionSummary();
    setCurrentDocFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.invoiceAmount, 0);
  const totalFactoringAmount = invoices.reduce(
    (sum, inv) => sum + inv.invoiceFactoringAmount,
    0
  );

  const handleSubmit = async () => {
    if (invoices.length === 0) {
      toast.error("Please add at least one invoice.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("application_no", applicationNoFromRedux || "");
      fd.append("total_amount", String(totalAmount));
      fd.append("actual_amount", String(totalFactoringAmount));
      fd.append("application_step", "7");

      const invoicesPayload = invoices.map((inv, idx) => ({
        invoice_no: inv.invoiceNumber,
        invoice_date: inv.invoiceStartDate,
        due_date: inv.dueDate,
        amount: inv.invoiceAmount,
        factoring_amount: inv.invoiceFactoringAmount,
        document: 0,
        document_name: inv.documentName,
        deductions: {
          admin_fee_amount: inv.deductionDetails.adminFee,
          processing_fee_amount: inv.deductionDetails.processingFee,
          profit_amount: inv.deductionDetails.profitAmount,
          vat_amount: inv.deductionDetails.vatAmount,
          total_deductions:
            inv.deductionDetails.adminFee +
            inv.deductionDetails.processingFee +
            inv.deductionDetails.profitAmount +
            inv.deductionDetails.vatAmount,
        },
        id: idx + 1,
      }));

      fd.append("invoices", JSON.stringify(invoicesPayload));

      invoices.forEach((inv, idx) => {
        if (inv.documentFile) {
          fd.append(`invoice_document_${idx}`, inv.documentFile);
        }
      });

      const res = await storeFactoringInfo(fd);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Failed to store factoring information.");
        return;
      }

      toast.success(res?.data?.message || "Factoring information stored successfully.");

      // Upload dynamic required documents for this step
      const docsOk = await uploadStepDocuments(7, requiredDocuments, docFiles);
      if (!docsOk) return;

      navigate("/applyloan/ComplianceInfo", {
        state: {
          factoringFormData: { invoices },
          businessFormData: businessFormData,
        },
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ fontWeight: 600, fontSize: "24px", margin: 0 }}>
          Financial Details
        </h4>
        <Button
          type="primary"
          onClick={showModal}
          style={{ background: "#1963b9", borderColor:"#1963b9", height:"38px", lineHeight:"38px", padding:"0 16px"}}
        >
          + Add Invoice
        </Button>
      </div>

      <div className="mb-4">
        <h5 style={{ fontWeight: 600, fontSize: "18px", marginBottom: "16px" }}>
          Invoices <Badge count={invoices.length} style={{ backgroundColor: "#1890ff" }} />
        </h5>

        <div style={{ overflowX: "auto" }}>
          <table className="table table-bordered" style={{ minWidth: "100%" }}>
            <thead style={{ backgroundColor: "#f0f2f5" }}>
              <tr>
                <th style={{ padding: "12px" }}>Invoice Number</th>
                <th style={{ padding: "12px" }}>Invoice Start Date</th>
                <th style={{ padding: "12px" }}>Due Date</th>
                <th style={{ padding: "12px" }}>Invoice Amount</th>
                <th style={{ padding: "12px" }}>Invoice Factoring Amount</th>
                <th style={{ padding: "12px" }}>Deduction Details</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    No invoices created yet.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={{ padding: "12px" }}>{invoice.invoiceNumber}</td>
                    <td style={{ padding: "12px" }}>{invoice.invoiceStartDate}</td>
                    <td style={{ padding: "12px" }}>{invoice.dueDate}</td>
                    <td style={{ padding: "12px", color: "#52c41a", fontWeight: 500 }}>
                      {invoice.invoiceAmount.toFixed(2)} SAR
                    </td>
                    <td style={{ padding: "12px", color: "#1890ff", fontWeight: 500 }}>
                      {invoice.invoiceFactoringAmount.toFixed(2)} SAR
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px" }}>
                      <div>Admin Fee: {invoice.deductionDetails.adminFee.toFixed(2)} SAR</div>
                      <div>Processing Fee: {invoice.deductionDetails.processingFee.toFixed(2)} SAR</div>
                      <div>Profit Amount: {invoice.deductionDetails.profitAmount.toFixed(2)} SAR</div>
                      <div>VAT Amount: {invoice.deductionDetails.vatAmount.toFixed(2)} SAR</div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div className="d-flex gap-2">
                        <Button
                          type="primary"
                          size="small"
                          icon={<FaEdit />}
                          onClick={() => handleEdit(invoice)}
                          style={{ background: "#ffc107", borderColor: "#ffc107" }}
                        />
                        <Button
                          type="primary"
                          size="small"
                          danger
                          icon={<FaTrash />}
                          onClick={() => handleDelete(invoice.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <p style={{ fontWeight: 600, fontSize: "16px", marginBottom: "8px" }}>
            Total Amount:{" "}
            <span style={{ color: "#52c41a" }}>{totalAmount.toFixed(2)} SAR</span>
          </p>
          {invoices.length > 0 && (
            <p style={{ fontWeight: 600, fontSize: "16px", marginBottom: "8px" }}>
              Factoring Amount:{" "}
              <span style={{ color: "#1890ff" }}>{totalFactoringAmount.toFixed(2)} SAR</span>
            </p>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Invoice */}
      <Modal
        title="Create Invoice"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={editingInvoice ? "Update" : "Save"}
        okButtonProps={{
          style: { 
            background: "#1963b9", 
            borderColor: "#1963b9", 
            height: "38px", 
            lineHeight: "38px", 
            padding: "0 16px" 
          }
        }}
        cancelButtonProps={{
          style: {
            height: "38px",
            lineHeight: "38px",
            padding: "0 16px"
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Row>
            <Col md={6} className="pe-2">
              <Form.Item
                label="Invoice Document Number"
                name="invoiceNumber"
                rules={[{ required: true, message: "Please enter invoice document number" }]}
              >
                <Input placeholder="Enter Invoice Document Number" />
              </Form.Item>
            </Col>
            <Col md={6} className="ps-2">
              <Form.Item
                label="Invoice Date"
                name="invoiceStartDate"
                rules={[{ required: true, message: "Please select invoice date" }]}
              >
                <DatePicker className="w-100" format="MM/DD/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="pe-2">
              <Form.Item
                label="Due Date"
                name="dueDate"
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker className="w-100" format="MM/DD/YYYY" />
              </Form.Item>
            </Col>
            <Col md={6} className="ps-2">
              <Form.Item
                label="Invoice Amount"
                name="invoiceAmount"
                rules={[{ required: true, message: "Please enter invoice amount" }]}
              >
                <Input
                  type="number"
                  placeholder="Enter Amount"
                  onChange={(e) => debouncedValidate(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Item label="Upload Invoice Document" required>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="form-control"
                  onChange={(e) => setCurrentDocFile(e.target.files?.[0] || null)}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ 
            backgroundColor: "#f5f5f5", 
            padding: "20px", 
            borderRadius: "6px",
            marginTop: "20px",
            position: "relative",
          }}>
            {validating && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(245,245,245,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                zIndex: 1,
              }}>
                <Spin />
              </div>
            )}
            <h6 style={{ fontWeight: 600, marginBottom: "15px", color: "#666" }}>Deduction Summary</h6>
            
            <Row className="mb-3">
              <Col md={6}>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: "#999" }}>Admin Fee:</span>
                  <span style={{ fontWeight: 500 }}>{deductionSummary.adminFee.toFixed(2)} SAR</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#999" }}>Profit Amount:</span>
                  <span style={{ fontWeight: 500 }}>{deductionSummary.profitAmount.toFixed(2)} SAR</span>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: "#999" }}>Processing Fee:</span>
                  <span style={{ fontWeight: 500 }}>{deductionSummary.processingFee.toFixed(2)} SAR</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#999" }}>VAT Amount:</span>
                  <span style={{ fontWeight: 500 }}>{deductionSummary.vatAmount.toFixed(2)} SAR</span>
                </div>
              </Col>
            </Row>

            <div style={{ 
              borderTop: "2px solid #ddd", 
              paddingTop: "15px", 
              marginTop: "15px" 
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ fontWeight: 600, fontSize: "16px" }}>Invoice Factoring Amount:</span>
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: "18px", 
                  color: "#1890ff" 
                }}>
                  {deductionSummary.invoiceFactoringAmount.toFixed(2)} SAR
                </span>
              </div>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Dynamic Required Documents for Step 7 */}
      <RequiredDocFields
        stepNo={7}
        docFiles={docFiles}
        onFileChange={handleDocFileChange}
      />

      {/* Action Buttons */}
      <div className="py-4" style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}>
        <button
          className="step-buttons"
          style={{ background: "#616161", padding: "10px 5px", borderRadius: "0", minWidth: "100px",lineHeight:"24px" }}
          onClick={() => {
            navigate("/applyloan/orbitSms", {
              state: {
                businessFormData: businessFormData,
              },
            });
          }}
        >
          Previous
        </button>
        <button 
          className="step-buttons" 
          style={{ background: "#1963b9", padding: "10px 5px", borderRadius: "0", minWidth: "100px",lineHeight:"24px" }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Next Step"}
        </button>
      </div>
    </>
  );
};

export default FactoringInfo;
