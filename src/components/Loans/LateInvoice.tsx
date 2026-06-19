import { Input, Button } from "antd";
import { useEffect, useState } from "react";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { getInvoicesByApplicationID } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Images } from "../Config/Images";
import axios from "../../utils/axios";
import { themeStyle } from "../Config/Theme";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

function LateInvoice() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [invoiceData, setInvoiceData] = useState<any>([]);
  const [tableData, setTableData] = useState<
    {
      amount: string;
      item: string;
      price: string;
    }[]
  >([]);
  const id = useParams();

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

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const getInvoicesById = async (id: any) => {
    try {
      const res = await getInvoicesByApplicationID(id);
      if (res) {
        const data = res?.data.data;

        setInvoiceData(data);
        setTableData(data.invoiceDescriptions || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    getInvoicesById(id.id);
  }, [id]);

  const downloadPDF = () => {
    const invoiceElement = document.getElementById(
      "invoice-content"
    ) as HTMLElement | null;

    if (!invoiceElement) {
      console.error("Element not found!");
      return;
    }

    html2canvas(invoiceElement)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Add padding/margin to the PDF
        const margin = 10; // Adjust this value for padding
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          pdfWidth - 2 * margin,
          pdfHeight - 2 * margin
        );

        // Sanitize the invoice number for the filename
        const sanitizedInvoiceNumber =
          invoiceData?.invoiceNumber.replace(/[<>:"\/\\|?*]+/g, "_") ||
          "invoice";
        pdf.save(`invoice_${sanitizedInvoiceNumber}.pdf`);
      })
      .catch((error) => {
        console.error("Error generating PDF: ", error);
      });
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return (
    <>
      <div>
        <div className="col-12 d-flex">
          <div className="col-6">
            {" "}
            <h5>Invoice View </h5>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <Button
              type="primary"
              className="p-2"
              style={{ background: "var(--primary)" }}
              onClick={downloadPDF}
            >
              Download
            </Button>
          </div>
        </div>
        <div id="invoice-content" className="invoice-content mt-3 p-3">
          <div className="col-12 d-flex mt-5 ">
            <div className="col-8">
              <label className="mb-2" style={{ fontSize: "1rem" }}>
                Invoice No.
              </label>

              <div className="col-4">
                {" "}
                <div style={{ fontWeight: 500, fontSize: "2.25rem" }}>
                  {invoiceData?.invoiceNumber || "1234678"}
                </div>
              </div>
            </div>
            <div className="col-4 d-flex justify-content-end align-items-start">
              <img
                src={Images.AwnLogo}
                height={80}
                alt=""
                style={{
                  padding: 10,
                  backgroundColor: themeStyle.secondary,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>

          <div className="col-12 mt-5 d-flex justify-content-between border-top">
            {/* <div className="col-8">
              <Upload
                action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                listType="picture-card"
                fileList={fileList}
                disabled
                onPreview={handlePreview}
                onChange={handleChange}
              >
                {fileList.length >= 8 ? null : uploadButton}
              </Upload>
              {previewImage && (
                <Image
                  wrapperStyle={{ display: "none" }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) =>
                      !visible && setPreviewImage(""),
                  }}
                  src={previewImage}
                />
              )}
            </div> */}
          </div>

          <div className="col-12 mt-5 d-flex justify-content-between gap-2">
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3"
                style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  From
                </label>
                <span className="">{invoiceData?.from}</span>
              </div>
            </div>
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3"
                style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Billing To
                </label>
                <span className="">{invoiceData?.billingTo}</span>
              </div>
            </div>
          </div>

          <div className="col-12 mt-3 d-flex  gap-2">
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Payment Term
                </label>
                <span className="">{invoiceData?.paymentTerms}</span>
              </div>
            </div>
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2 "
                style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Ship To
                </label>
                <span className="">{invoiceData?.shipTo}</span>
              </div>
            </div>
          </div>
          <div className="col-12 mt-3 d-flex gap-2">
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  PO Number
                </label>
                <span className="">{invoiceData?.poNumber}</span>
              </div>
            </div>
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Due Date
                </label>
                <span className="">{formatDate(invoiceData?.dueDate)}</span>
                {/* <DatePickerComponent givenDate={invoiceData?.dueDate} /> */}
                {/* <span className="">{invoiceData?.dueDate}</span> */}
              </div>
            </div>
          </div>
          <div className="col-12 mt-3 d-flex gap-2 border-bottom">
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Penalty Amount
                </label>
                <input
                  type="number"
                  style={{
                    backgroundColor: "var(--muted)",
                    border: "1px solid var(--muted)",
                  }}
                >
                  {invoiceData?.poNumber}
                </input>
              </div>
            </div>
            <div className="col-6 mb-3">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
              >
                <label style={{ fontWeight: "bold" }}>Date</label>
                <span>
                {new Date().toISOString().slice(0, 10)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            {/* Header Section */}
            <div className="col-12  d-flex ">
              <div
                className=" mb-2 p-3 col-6"
                style={{
                  background: "var(--color-error-bg)",
                  borderTopLeftRadius: "6px",
                  fontWeight: "700",
                }}
              >
                Item
              </div>
              <div
                className="mb-2 p-3 col-6"
                style={{
                  background: "var(--color-error-bg)",
                  borderTopRightRadius: "6px",
                  fontWeight: "700",
                }}
              >
                Amount
              </div>
            </div>
            {/* Data Fields Section */}
            {tableData.map((field, index) => (
              <div key={index} className="mb-2 d-flex">
                <div className="col-6">
                  <Input
                    name="item"
                    placeholder="Item"
                    size="large"
                    value={field.item}
                    style={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderBottomRightRadius: "0px",
                      borderRightColor: "transparent",
                      borderTopLeftRadius: "0px",
                      borderTopRightRadius: "0px",
                    }}
                  />
                </div>
                <div className="col-6">
                  <Input
                    name="price"
                    placeholder="Price"
                    size="large"
                    value={field.amount}
                    style={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderBottomRightRadius: "6px",
                      borderLeftColor: "transparent",
                      borderTopLeftRadius: "0px",
                      borderTopRightRadius: "0px",
                    }}
                  />
                </div>
              </div>
            ))}
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
              className="col-6 d-flex justify-content-end font-bold"
              style={{ fontWeight: 600, color: "var(--foreground)" }}
            >
              SAR:{invoiceData?.subTotalAmount || "0.00"}
            </div>
          </div>
          <div className="border-top mt-2">
            <div className="col-12 d-flex justify-content-end mt-3 ">
              <div className="col-4">
                <div
                  className="d-flex justify-content-between align-items-center p-3 mb-2"
                  style={{
                    backgroundColor: "var(--muted)",

                    borderRight: "1px solid var(--border)",
                  }}
                >
                  <label style={{ fontWeight: "bold" }}>Tax(%)</label>
                  <span>{invoiceData?.tax}</span>
                </div>
              </div>
              <div className="col-4">
                <div
                  className="d-flex justify-content-between align-items-center p-3 mb-2"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderRight: "1px solid var(--border)",
                  }}
                >
                  <label className="m-0" style={{ fontWeight: "bold" }}>
                    Shipping
                  </label>
                  <span className="">{invoiceData?.shipping}</span>
                </div>
              </div>
              <div className="col-4">
                <div
                  className="d-flex justify-content-between align-items-center p-3"
                  style={{ backgroundColor: "var(--muted)", borderRadius: "6px" }}
                >
                  <label className="m-0" style={{ fontWeight: "bold" }}>
                    Discount(%)
                  </label>
                  <span className="">{invoiceData?.discount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 d-flex p-2 mt-4 mb-3">
            <div
              className="col-8 p-5"
              style={{
                background: "var(--color-info-bg)",
              }}
            >
              <label style={{ fontWeight: 600 }}>Note</label>
              <div className="mt-2">
                <div style={{ lineHeight: "1.5rem" }}>
                  {invoiceData?.notes ||
                    "Please ensure your payment is submitted by the due date listed on this invoice. Contact our customer support if you have questions, need assistance, or wish to review your account details"}
                </div>
              </div>
            </div>
            <div
              className="col-4 p-5"
              style={{
                background:
                  themeStyle.gradientBackgroundColor,
              }}
            >
              <label style={{ fontWeight: 500 }}>Total</label>
              <div
                className=" font-bold"
                style={{
                  fontWeight: 500,
                  color: "var(--foreground)",
                  fontSize: "2.5rem",
                  lineHeight: "3.5rem",
                }}
              >
                <span className="fs-20">SAR:</span>{invoiceData?.totalAmount || "0.00"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const DatePickerComponent = (givenDate: any) => {
  // Initial date as ISO string to avoid invalid date errors
  const initialDateString = "2024-11-15T00:00:00";

  // Format the date to "YYYY-MM-DD" for use in the date input
  const formatDate = (dateString : any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure 2 digits
    const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
    return `${year}-${month}-${day}`;
  };

  // Initialize state with the formatted date
  const [selectedDate, setSelectedDate] = useState(
    formatDate(initialDateString)
  );

  // Handle date change
  const handleDateChange = async (event: any) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);

    // Call the API with Axios whenever the date changes
    try {
      const response = await axios.post("/your-api-endpoint", {
        date: newDate,
      });
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  return (
    <div>
      <input
        id="datePicker"
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        style={{
          border: "none",
          padding: "4px 0px",
          background: "transparent",
          cursor: "pointer",
        }}
      />
    </div>
  );
};

export default LateInvoice;
