import { Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { useNavigate } from "react-router-dom";
import {
  addInvoice,
  getAccountNumber,
  getNextInvoiceNumber,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { Images } from "../Config/Images";
import { themeStyle } from "../Config/Theme";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
const CreateInvoice = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fields, setFields] = useState([{ item: "", price: "" }]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoice, setInvoice] = useState();
  const [invoiceType, setInvoiceType] = useState();
  const [applications, setApplications] = useState<any>();
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const [formValues, setFormValues] = useState({
    accountNumber: "",
    applicationID: "",
    invoiceNumber: "",
    from: "",
    billingTo: "",
    shipTo: "",
    dueDate: "",
    poNumber: "",
    tax: "",
    shipping: "",
    discount: "",
    notes: "",
    terms: "",
    paymentTerms: "",
  });
  const handleSubmitInvoice = async () => {
    try {
      const res = await getNextInvoiceNumber();
      if (res) {
        const data = res.data.data;
        setInvoice(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const navigate = useNavigate();
  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const formatDatePayload = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `${month}/${day}/${year}`;
  };

  /* const handleInvoiceDateChange = (e) => {
    const selectedInvoiceDate = e.target.value;
    setInvoiceDate(selectedInvoiceDate);
    setError(""); // Clear error if invoice date changes

    // Validate dueDate if it's already selected
    if (dueDate && new Date(selectedInvoiceDate) >= new Date(dueDate)) {
      setDueDate(""); // Clear due date if it’s invalid
      setError("Due Date must be after Invoice Date");
    }
  }; */

  const calculateDueDate = (paymentType: number) => {
    const baseDate = new Date(invoiceDate);
    let newDueDate = new Date(baseDate);

    switch (paymentType) {
      case 1: // Net7
        newDueDate.setDate(baseDate.getDate() + 7);
        break;
      case 2: // Net15
        newDueDate.setDate(baseDate.getDate() + 15);
        break;
      case 3: // Net30
        newDueDate.setMonth(baseDate.getMonth() + 1);
        break;
      case 4: // Net60
        newDueDate.setMonth(baseDate.getMonth() + 2);
        break;
      case 5: // DueOnReceipt
        newDueDate = baseDate;
        break;
      case 6: // Two10Net30
        newDueDate.setMonth(baseDate.getMonth() + 1);
        //toast.info("2% discount if paid within the first 10 days.");
        break;
      case 7: // One15Net30
        newDueDate.setMonth(baseDate.getMonth() + 1);
        //toast.info("1% discount if paid within the first 15 days.");
        break;
      default:
        break;
    }

    setDueDate(newDueDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
  };

  const handleDueDateChange = (e: any) => {
    const selectedDueDate = e.target.value;

    if (new Date(selectedDueDate) <= new Date(invoiceDate)) {
      setError("Due Date must be after Invoice Date");
      toast.error("Due Date must be after Invoice Date");
      setDueDate(""); // Reset due date if invalid
    } else {
      setError(""); // Clear error if valid
      setDueDate(selectedDueDate);
    }
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const handleFieldChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const values = [...fields];
    values[index][event.target.name as keyof (typeof values)[number]] = event.target.value;
    setFields(values);
    calculateSubtotal(values);
  };

  // Add a new row of item and price inputs
  const handleAddField = () => {
    setFields([...fields, { item: "", price: "" }]);
  };

  // Remove a row of inputs
  // Remove a row of inputs
  const handleRemoveField = (index: any) => {
    const values = [...fields];
    values.splice(index, 1);
    setFields(values);
    calculateSubtotal(values);
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleSelectChange = (value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      applicationID: value,
    }));
  };

  const handleSelectPayment = (value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      paymentTerms: value,
    }));
    if (value) {
      calculateDueDate(Number(value));
    } else {
      setDueDate("");
    }
  };

  // Calculate subtotal of all prices
  const calculateSubtotal = (values: any) => {
    const total = values.reduce(
      (acc: any, field: any) => acc + (parseFloat(field.price) || 0),
      0
    );
    setSubtotal(total);
  };
  const enums = {
    PaymentTypes: [
      { value: 1, label: "Net7" },
      { value: 2, label: "Net15" },
      { value: 3, label: "Net30" },
      { value: 4, label: "Net60" },
      { value: 5, label: "DueOnReceipt" },
      { value: 6, label: "Two10Net30" },
      { value: 7, label: "One15Net30" },
    ],

    InvoiceTypes: [
      { value: 0, label: "Loan Invoice" },
      { value: 1, label: "Operations Invoice" },
    ],
  };
  const handleGenerateInvoice = async () => {
    const data = {
      accountNumber: formValues.accountNumber,
      payableStatus: 1,
      applicationID: formValues.applicationID,
      invoiceLogo: fileList.length ? fileList[0].url : "",
      invoiceNumber: invoice,
      invoiceType: invoiceType,
      from: formValues.from,
      billingTo: formValues.billingTo,
      shipTo: formValues.shipTo,
      invoiceDate: new Date(),
      dueDate: dueDate,
      poNumber: formValues.poNumber,
      subTotalAmount: subtotal,
      tax: formValues.tax || "0",
      shipping: formValues.shipping || "0",
      discount: formValues.discount || "0",
      notes: formValues.notes,
      terms: formValues.terms,
      paymentTerms: formValues.paymentTerms,
      totalAmount:
        subtotal +
        Number(formValues.tax || 0) +
        Number(formValues.shipping || 0) -
        Number(formValues.discount || 0),
      addInvoiceDescription: fields.map((field) => ({
        item: field.item,
        amount: field.price || 0,
      })),
    };

    try {
      const response = await addInvoice(data);
      setInvoiceData(response.data);
      if (response.data.success) {
        toast.success("Invoice generated successfully!");
        navigate(
          `/lms/loanmanagement/generateInvoice/${response.data.data.invoiceID}`
        );
      }
    } catch (error) {
      toast.error("Error generating invoice");
    }
  };
  const getAccountNumberByApplication = async (number: any) => {
    try {
      const res = await getAccountNumber(number);
      if (res) {
        const data = res.data.data;
        setApplications(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  useEffect(() => {
    handleSubmitInvoice();
    if (formValues.accountNumber) {
      getAccountNumberByApplication(formValues.accountNumber);
    }

    const discountPercentage = Number(formValues.discount) || 0; // discount as a percentage
    const taxPercentage = Number(formValues.tax) || 0; // tax as a percentage
    const shippingAmount = Number(formValues.shipping) || 0;
    const discountedAmount = subtotal - subtotal * (discountPercentage / 100); // apply percentage discount
    const taxAmount = discountedAmount * (taxPercentage / 100); // apply tax on discounted amount
    const totalAmount = discountedAmount + taxAmount + shippingAmount;
    setTotalAmount(totalAmount);
  }, [
    subtotal,
    formValues.tax,
    formValues.shipping,
    formValues.discount,
    formValues.accountNumber,
  ]);

  return (
    <>
      <div>
        <h5>Create Invoice</h5>
        <div className="col-12 d-flex mt-5 ">
          <div className="col-8 d-flex justify-content-between align-items-end">
            <div className="me-2 w-100">
              <label>Account Number <span className="bg-red"> *</span></label>
              <Input
                name="accountNumber" // Updated to match API key
                value={formValues.accountNumber}
                onChange={handleInputChange}
                size="large"
                className="mt-2"
                placeholder="Account Number"
              />
            </div>
            <div className="w-100">
              <label>Application ID <span className="bg-red"> *</span></label>
              {formValues.accountNumber.length > 0 ? (
                <Select
                  size="large"
                  className="mt-2"
                  placeholder="Application ID"
                  value={formValues.applicationID}
                  onChange={handleSelectChange}
                >
                  {applications &&
                    applications.map((item: any) => (
                      <Select.Option
                        key={item.applicationId}
                        value={item.applicationId}
                      >
                        {item.applicationKey}
                      </Select.Option>
                    ))}
                </Select>
              ) : (
                <Select disabled />
              )}
            </div>
          </div>
          <div className="col-4 d-flex justify-content-end align-items-start">
            <img
              src={Images.FactoringLogo}
              height={80}
              alt=""
              style={{
                padding: 10,
                backgroundColor: "transparent",
                borderRadius: 2,
              }}
            />
          </div>
        </div>
        <div
          className="col-12 mt-5 d-flex justify-content-between "
          style={{
            borderTopStyle: "dashed",
            borderTopColor: "grey",
            borderWidth: 2,
          }}
        >
          <div className="d-flex justify-content-between mt-4">
            <div className="me-2">
              <label style={{ fontWeight: "700", fontSize: "28px" }}>
                Invoice No. <span className="bg-red"> *</span>
              </label>
              <Input
                name="invoiceNumber" // Updated to match API key
                value={invoice}
                readOnly
                size="large"
                className="mt-2"
                placeholder="Invoice No."
              />
            </div>
            <div className="ms-2">
              <label style={{ fontWeight: "700", fontSize: "28px" }}>
                Invoice Type
              </label>
              <Select
                value={invoiceType}
                size="large"
                className="mt-2"
                placeholder="Select Invoice Type"
                onChange={(value: any) => setInvoiceType(value)}
              >
                {enums.InvoiceTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            {/* <Upload
              action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
              listType="picture-card"
              fileList={fileList}
              name="invoiceLogo"
              onPreview={handlePreview}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              {fileList.length >= 8 ? null : uploadButton}
            </Upload>
            {previewImage && (
              <Image
                wrapperStyle={{ display: "none" }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(""),
                }}
                src={previewImage}
              />
            )} */}
          </div>
        </div>

        <div className="col-12 mt-5 d-flex justify-content-between gap-2">
          <div
            className="col-6 p-3"
            style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
          >
            <label>Name <span className="bg-red"> *</span></label>
            <Input
              name="from" // Updated to match API key
              value={formValues.from}
              onChange={handleInputChange}
              size="large"
              className="mt-2 mb-3"
              placeholder="Name"
            />
            <div className="col-12 d-flex justify-content-between mt-2 gap-2">
              <div className="col-6">
                <label>Payment Terms</label>
                <Select
                  size="large"
                  className="mt-2"
                  placeholder="Payment Terms"
                  onChange={handleSelectPayment}
                >
                  <option value="">select the payment</option>
                  {enums.PaymentTypes.map((item: any) => {
                    return (
                      <>
                        <Select.Option value={item.value} label={item.label}>
                          {item.label}
                        </Select.Option>
                      </>
                    );
                  })}
                </Select>
              </div>
              <div className="col-6">
                <label>PO Number</label>
                <Input
                  name="poNumber" // Updated to match API key
                  size="large"
                  className="mt-2"
                  placeholder="optional"
                  value={formValues.poNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div
            className="col-6 p-3"
            style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
          >
            {" "}
            <div className="">
              <label>Billing To <span className="bg-red"> *</span></label>
              <Input
                name="billingTo" // Updated to match API key
                size="large"
                className="mt-2 w-100 mb-3"
                placeholder="Billing To"
                value={formValues.billingTo}
                onChange={handleInputChange}
              />
            </div>
            <div className="mt-2">
              <label>Ship To </label>
              <Input
                name="shipTo" // Updated to match API key
                type="select"
                size="large"
                className="mt-2 w-100"
                placeholder="optional"
                value={formValues.shipTo}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div
          className="col-12 mt-3 d-flex p-3 gap-3"
          style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
        >
          <div className="col-6">
            <div className="">
              <label>Invoice Date <span className="bg-red"> *</span></label>
              <Input
                type="text"
                name="invoiceDate"
                size="large"
                className="mt-2"
                value={formatDatePayload(String(invoiceDate))}
                //onChange={handleInvoiceDateChange}
                readOnly
              />
            </div>
          </div>
          <div className="col-6">
            <div className="me-1">
              <label>Due Date <span className="bg-red"> *</span></label>
              <Input
                id="dueDate"
                type="date"
                name="dueDate"
                size="large"
                className="mt-2"
                value={dueDate}
                onChange={handleDueDateChange}
                readOnly={Boolean(formValues.paymentTerms)}
              />
            </div>
            {/* <label>PO Number </label>
              <Input
                name="poNumber" // Updated to match API key
                value={formValues.poNumber}
                onChange={handleInputChange}
                size="large"
                className="mt-2"
                placeholder="optional"
              /> */}
          </div>
        </div>
      </div>
      <div
        className="p-2 mt-5"
        style={{
          borderTopStyle: "dashed",
          borderTopColor: "grey",
          borderWidth: 2,
        }}
      >
        {/* Header Section */}
        <div className="col-12 d-flex gap-3 mt-5">
          <div
            className=" mb-2 p-3 col-6"
            style={{
              background: themeStyle.secondary,
              borderTopLeftRadius: "2px",
              fontWeight: "600",
              color: "var(--primary-foreground)",
            }}
          >
            Item
          </div>
          <div
            className="row mb-2 p-3 col-6"
            style={{
              background: themeStyle.secondary,
              borderTopRightRadius: "2px",
              fontWeight: "600",
              color: "var(--primary-foreground)",
            }}
          >
            Amount
          </div>
        </div>
        {/* Data Fields Section */}
        {fields.map((field, index) => (
          <div key={index} className="mb-2 d-flex gap-1">
            <div className="col-6">
              <Input
                name="item"
                placeholder="Item"
                size="large"
                value={field.item}
                onChange={(event) => handleFieldChange(index, event)}
                style={{
                  backgroundColor: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "2px",
                }}
              />
            </div>
            <div style={{ flex: 5.85 }}>
              <Input
                name="price"
                placeholder="Price"
                size="large"
                value={field.price}
                onChange={(event) => handleFieldChange(index, event)}
                style={{
                  backgroundColor: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "2px",
                }}
              />
            </div>
            <div style={{ flex: 0.25 }} className="align-items-center d-flex">
              <img
                src={Images.crossIcon}
                onClick={() => handleRemoveField(index)}
              />
            </div>
          </div>
        ))}

        {/* Add New Line Button */}
        <button
          type="button"
          className="theme-btn-next"
          onClick={handleAddField}
          style={{ fontSize: "16px" }}
        >
          + Add New Line
        </button>
      </div>
      <div
        className="col-12 p-3 border-top border-bottom d-flex justify-content-between"
        style={{
          background: themeStyle.gradientBackgroundColor,
        }}
      >
        <div className="col-6" style={{ fontWeight: 600 }}>
          Sub Total
        </div>
        <div
          className="col-6 d-flex justify-content-end font-bold "
          style={{ fontWeight: 600 }}
        >
          SAR: {subtotal.toFixed(2)}
        </div>
      </div>

      <div className="col-12 d-flex justify-content-end">
        <div className="col-7 d-flex mt-3">
          <div className="me-2">
            <label>Tax(%) </label>
            <Input
              name="tax" // Updated to match API key
              value={formValues.tax}
              onChange={handleInputChange}
              size="large"
              className="mt-2"
              placeholder="optional"
            />
          </div>
          <div className="me-2">
            <label>Shipping </label>
            <Input
              name="shipping" // Updated to match API key
              value={formValues.shipping}
              onChange={handleInputChange}
              size="large"
              className="mt-2"
              placeholder="optional"
            />
          </div>
          <div className="me-2">
            <label>Discount(%) </label>
            <Input
              name="discount" // Updated to match API key
              value={formValues.discount}
              onChange={handleInputChange}
              size="large"
              className="mt-2"
              placeholder="optional"
            />
          </div>
        </div>
      </div>

      <div
        className="col-12 p-3 mt-3 border-top border-bottom d-flex justify-content-between"
        style={{
          background: themeStyle.gradientBackgroundColor,
        }}
      >
        <div className="col-6" style={{ fontWeight: 600 }}>
          Total
        </div>
        <div
          className="col-6 d-flex justify-content-end font-bold "
          style={{ fontWeight: 600 }}
        >
          SAR: {totalAmount.toFixed(2)}
        </div>
      </div>
      <div className="col-12 d-flex gap-2 mt-4">
        <div className="col-6 mb-3">
          <label>Notes </label>
          <Input
            name="notes" // Updated to match API key
            value={formValues.notes}
            onChange={handleInputChange}
            size="large"
            className="mt-2"
            placeholder="optional"
          />
        </div>

        <div className="col-6">
          <label>Terms </label>
          <Input
            name="terms" // Updated to match API key
            value={formValues.terms}
            onChange={handleInputChange}
            size="large"
            className="mt-2"
            placeholder="optional"
          />
        </div>
      </div>

      <div className="col-12 d-flex justify-content-end mt-2">
        <div className="col-4 d-flex justify-content-end">
          <button
            className="invoice-btn me-2 text-white p-2"
            style={{
              //backgroundColor: "#373435",
              borderRadius: "2px",
              fontSize: "14px",
            }}
          >
            Send to customer
          </button>
          <button
            className="theme-btn-next"
            style={{
              fontSize: "14px",
            }}
            onClick={handleGenerateInvoice}
          >
            Generate Invoice
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateInvoice;
