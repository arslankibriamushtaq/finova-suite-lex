import { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Select, Input, Button, Tag, Card } from "antd";
import toast from "react-hot-toast";
import {
  getProducts,
  getLoanFees,
  getProductFeeByProductId,
  DeleteProductFee,
  AddProductFee,
} from "../../redux/apis/apisCrudLms"; // 👈 add `getLoanFees`
import { CloseOutlined } from "@ant-design/icons";
const ProductFee = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [feeData, setFeeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    loanFeeId: "",
    productId: "",
    amount: 0,
    isAppliedToLoan: true,
    invoiceSr: 0,
  });
  // ✅ API Call
  const fetchProductFees = async (id: string) => {
    setLoading(true);
    try {
      const res = await getProductFeeByProductId(id);
      const data = res?.data?.data || [];
      // Flatten all feeDetails and attach feeName to each
      const flatDetails = data.flatMap((feeGroup: any) =>
        feeGroup.feeDetails.map((detail: any) => ({
          ...detail,
          feeName: feeGroup.feeName,
        }))
      );
      setFeeData(flatDetails);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load product fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formValues.productId) fetchProductFees(formValues.productId);
  }, [formValues.productId]);
  // ✅ Fetch data
  const getAllData = async () => {
    try {
      const [prodRes, feeRes] = await Promise.all([
        getProducts(),
        getLoanFees(),
      ]);
      const prodData = prodRes?.data?.data || [];
      const feeData = feeRes?.data?.data || [];
      setProducts(prodData);
      setFees(feeData);

      if (prodData.length > 0 && feeData.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          productId: prodData[0].id,
          loanFeeId: feeData[0].id,
        }));
      }
    } catch (error: any) {
      toast.error(error?.message || "Error fetching data");
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  // ✅ Handle select changes
  const handleSelectChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Handle input changes
  const handleInputChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };
 const handleSubmit = async () => {
  try {
    // ✅ Basic validation
    if (!formValues?.loanFeeId) {
      toast.error("Please select a fee type.");
      return;
    }
    if (!formValues?.productId) {
      toast.error("Please select a product.");
      return;
    }
    if (
      !formValues?.isAppliedToLoan &&
      (formValues?.invoiceSr === undefined)
    ) {
      toast.error("Please enter Invoice Sr when fee is applied to invoice.");
      return;
    }
    if (formValues?.amount === undefined || formValues?.amount === 0) {
      toast.error("Please enter an amount.");
      return;
    }

    // ✅ Build request body
    const body = {
      loanFeeId: formValues?.loanFeeId,
      productId: formValues?.productId,
      amount: Number(formValues?.amount),
      isAppliedToLoan: formValues?.isAppliedToLoan,
      isPercentage: false,
      isVatInclusive: true,
      invoiceSr: formValues?.isAppliedToLoan ? 0 : Number(formValues?.invoiceSr),
    };


    // ✅ API Call
    const res = await AddProductFee(body); // <-- replace with your actual API function

    if (res?.data?.success) {
      toast.success("Product fee added successfully!");
      // Optionally reset or refresh data
    //   setFormValues({
    //     loanFeeId: "",
    //     productId: "",
    //     amount: 0,
    //     isAppliedToLoan: true,
    //     invoiceSr: 0,
    //   });
    //   // Optionally re-fetch fees
      fetchProductFees(formValues?.productId);
    } else {
      toast.error(res?.data?.message || "Failed to add product fee.");
    }
  } catch (error: any) {
    console.error("Error submitting fee:", error);
    toast.error(error?.message || "An error occurred while submitting.");
  }
};

    const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await DeleteProductFee(id); // <-- replace with your actual API function
      if (res?.data?.success) {
        toast.success("Fee deleted successfully!");
        setFeeData((prev) => prev.filter((fee) => fee.id !== id));
      } else {
        toast.error("Failed to delete fee");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error deleting fee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="col-md-12 pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
        Product Fee Management
      </h2>

      <Row>
        {/* Product Select */}
        <Col md={4} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              Select Product
            </Form.Label>
            <Select
              value={formValues.productId}
              style={{ width: "100%" }}
              placeholder="Select Product"
              onChange={(value) => handleSelectChange("productId", value)}
            >
              {products.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Group>
        </Col>

        {/* Loan Fee Select */}
        <Col md={4} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              Select Fee
            </Form.Label>
            <Select
              value={formValues.loanFeeId}
              style={{ width: "100%" }}
              placeholder="Select Fee"
              onChange={(value) => handleSelectChange("loanFeeId", value)}
            >
              {fees.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Group>
        </Col>

        {/* Amount Input */}
        <Col md={4} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              Amount
            </Form.Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={formValues.amount}
              onChange={(e) =>
                handleInputChange("amount", Number(e.target.value))
              }
            />
          </Form.Group>
        </Col>

        {/* Applied To Select */}
        <Col md={4} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              Apply Fee On
            </Form.Label>
            <Select
              value={formValues.isAppliedToLoan ? "loan" : "invoice"}
              style={{ width: "100%" }}
              onChange={(value) =>
                handleSelectChange("isAppliedToLoan", value === "loan")
              }
            >
              <Select.Option value="loan">Fee applied on Loan</Select.Option>
              <Select.Option value="invoice">
                Fee applied on Invoice
              </Select.Option>
            </Select>
          </Form.Group>
        </Col>

        {/* Invoice Sr (Only if appliedToLoan = false) */}
        {!formValues.isAppliedToLoan && (
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                Invoice Serial
              </Form.Label>
              <Input
                type="number"
                placeholder="Enter Invoice Sr"
                value={formValues.invoiceSr}
                onChange={(e) =>
                  handleInputChange("invoiceSr", Number(e.target.value))
                }
              />
            </Form.Group>
          </Col>
        )}
      </Row>
      <div className="d-flex justify-content-end">
        <Button className="application-btn mb-2" onClick={handleSubmit}>
          Create Product Fee
        </Button>
      </div>
      <h2 className="fw-bold text-start my-3 fs-6">Product Fee Details</h2>

      <Row style={{ rowGap: 20 }}>
        {[feeData].length > 0 ? (
          feeData.map((detail: any) => (
            <Col key={detail.id} lg={3}>
              <Card 
                bordered 
                className="rounded-xl shadow-sm">
                    <div className="d-flex justify-content-end items-center">
                    {/* <span className="fw-semibold">{detail.feeName}</span> */}
                    <CloseOutlined
                      onClick={() => handleDelete(detail.id)}
                      style={{
                        color: "black",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                <p className="mb-1">
                  <strong>Fee Name:</strong> {detail.feeName}{" "}
                </p>
                <p className="mb-1">
                  <strong>Amount:</strong> {detail.amount}{" "}
                  {detail.isPercentage ? "%" : "SAR"}
                </p>

                <p className="mb-1">
                  <strong>Applied On:</strong>{" "}
                  {detail.isAppliedToLoan ? (
                    <Tag color="blue">Loan</Tag>
                  ) : (
                    <Tag color="green">Invoice #{detail.invoiceNumber}</Tag>
                  )}
                </p>

                <p className="mb-1">
                  <strong>VAT Inclusive:</strong>{" "}
                  {detail.isVatInclusive ? "Yes" : "No"}
                </p>

                <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                  Created: {new Date(detail.created).toLocaleString()}
                </p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24} className="text-center py-5 text-muted">
            No fee details found.
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ProductFee;
