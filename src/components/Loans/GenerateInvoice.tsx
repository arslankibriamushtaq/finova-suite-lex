import { Input, Button } from "antd";
import { useEffect, useState } from "react";
import { getInvoicesByApplicationID } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Images } from "../Config/Images";
import { themeStyle } from "../Config/Theme";

function GenerateInvoice() {
  const [invoiceData, setInvoiceData] = useState<any>([]);
  const [tableData, setTableData] = useState<
    {
      amount: string;
      item: string;
      price: string;
    }[]
  >([]);
  const id = useParams();

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

    html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc, clonedElement) => {
        // NUCLEAR OPTION: Remove ALL stylesheets and style tags
        const allStylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
        allStylesheets.forEach((sheet: any) => sheet.remove());
        
        // Remove all classes from all elements to prevent any CSS interference
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach((el: any) => {
          // Completely remove className attribute
          el.removeAttribute('class');
          
          // Keep only inline styles that are safe
          const inlineStyle = el.getAttribute('style');
          if (inlineStyle && inlineStyle.includes('oklch')) {
            // Remove oklch from inline styles
            el.setAttribute('style', inlineStyle.replace(/oklch\([^)]*\)/g, '#000'));
          }
        });
      }
    })
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
          invoiceData?.invoiceNumber?.replace(/[<>:"\/\\|?*]+/g, "_") ||
          "invoice";
        pdf.save(`invoice_${sanitizedInvoiceNumber}.pdf`);
      })
      .catch((error) => {
        console.error("Error generating PDF: ", error);
      });
  };
  const formatDate: any = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return (
    <>
      <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "20px 0" }}>
        {/* Header with Download Button */}
        <div 
          className="d-flex justify-content-between align-items-center mb-3" 
          style={{ maxWidth: "900px", marginInline: 'auto', padding: "0 20px" }}
        >
          <h5 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Invoice View</h5>
            <Button
              type="primary"
              onClick={downloadPDF}
            style={{ 
              background: "#000", 
              borderColor: "#000",
              padding: "8px 24px",
              height: "auto",
              fontWeight: 500
            }}
            >
              Download
            </Button>
          </div>

        {/* Invoice Content */}
        <div
          id="invoice-content"
          style={{ 
            maxWidth: "850px", 
            marginInline: 'auto',
            backgroundColor: "#ffffff",
            padding: "50px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            border: "2px solid #e0e0e0",
            color: "#000",
            fontFamily: "Arial, sans-serif"
          }}
        >
          {/* Header with Logos */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
            <div>
              <img src={Images.FactoringLogo} height={35} alt="Company Logo" style={{ objectFit: "contain", maxWidth: "150px" }} />
            </div>
            <div>
              <img src={Images.FactoringLogo} height={35} alt="Company Logo" style={{ objectFit: "contain", maxWidth: "150px" }} />
            </div>
          </div>

          {/* Company & Invoice Info */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
            {/* Left side - Company Info */}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "6px", color: "#000" }}>Company Name</p>
              <p style={{ margin: "3px 0", fontSize: "13px", color: "#333" }}>{invoiceData?.from || "Factoring Valley"}</p>
              <p style={{ margin: "3px 0", fontSize: "13px", color: "#333" }}>Address:{invoiceData?.address || "Saudi Arabia"}</p>
              <p style={{ margin: "3px 0", fontSize: "13px", color: "#333" }}>VAT: {invoiceData?.vatNumber || "222"}</p>
            </div>
            
            {/* Right side - Invoice Details */}
            <div style={{ minWidth: "270px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "13px", fontWeight: 400, color: "#666" }}>Invoice No.:</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#000" }}>{invoiceData?.invoiceNumber || "FINV184058"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "13px", fontWeight: 400, color: "#666" }}>Date</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#000" }}>{new Date().toISOString().slice(0, 10)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "13px", fontWeight: 400, color: "#666" }}>Due Date</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#000" }}>{formatDate(invoiceData?.dueDate)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "13px", fontWeight: 400, color: "#666" }}>Type</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#000" }}>{invoiceData?.invoiceType || "B2C"}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: "25px" }}>
            <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "#000" }}>To:</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#000" }}>
                {invoiceData?.billingTo || "JAWAD JAWAD JAWAD JAWAD"}
              </p>
              <div style={{ display: "flex", justifyContent: "start" }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 400, color: "#666" }}>Email</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: "25px" }}>
            {/* Table Header */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "3fr 1fr 1fr 1fr",
              backgroundColor: "#2c2c2c",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "3px 3px 0 0",
              fontWeight: 600,
              fontSize: "13px"
            }}>
              <div>Description</div>
              <div style={{ textAlign: "center" }}>Quantity</div>
              <div style={{ textAlign: "center" }}>Unit Price</div>
              <div style={{ textAlign: "center" }}>VAT %</div>
            </div>

            {/* Table Row */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "3fr 1fr 1fr 1fr",
              border: "1px solid #ddd",
              borderTop: "none",
              padding: "10px 16px",
              borderRadius: "0 0 3px 3px",
              fontSize: "13px",
              color: "#333"
            }}>
              <div>{invoiceData?.discription || "Microban Revenue"}</div>
              <div style={{ textAlign: "center" }}>1</div>
              <div style={{ textAlign: "center" }}>{invoiceData?.processingFee || "86.09"}</div>
              <div style={{ textAlign: "center" }}>{invoiceData?.tax || ""}</div>
            </div>
          </div>

          {/* Totals Section */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
            <div style={{ minWidth: "320px" }}>
              {/* Total Before VAT */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "6px 0",
                fontSize: "13px"
              }}>
                <span style={{ fontWeight: 600, color: "#000" }}>Total Before VAT</span>
                <span style={{ fontWeight: 500, color: "#333" }}>{invoiceData?.processingFee || "86.09"}</span>
              </div>

              {/* VAT Amount */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "6px 0",
                fontSize: "13px"
              }}>
                <span style={{ fontWeight: 600, color: "#000" }}>VAT (15%)</span>
                <span style={{ fontWeight: 500, color: "#333" }}>{invoiceData?.tax || "12.91"}</span>
              </div>

              {/* Total After VAT with borders */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "10px 0",
                borderTop: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
                marginTop: "6px",
                marginBottom: "10px",
                fontSize: "13px"
              }}>
                <span style={{ fontWeight: 600, color: "#000" }}>Total After VAT</span>
                <span style={{ fontWeight: 600, color: "#000" }}>
                  {(
                    (Number(invoiceData?.totalAmount) || 0)
                  ).toFixed(2)}
                </span>
              </div>

              {/* Final Total */}
              <div style={{ textAlign: "right" }}>
                <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#000" }}>
                  {(
                    (Number(invoiceData?.totalAmount) || 0) 
                ).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// const DatePickerComponent = (givenDate: any) => {
//   // Initial date as ISO string to avoid invalid date errors
//   const initialDateString = "2024-11-15T00:00:00";

//   // Format the date to "YYYY-MM-DD" for use in the date input
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure 2 digits
//     const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
//     return `${year}-${month}-${day}`;
//   };

//   // Initialize state with the formatted date
//   const [selectedDate, setSelectedDate] = useState(
//     formatDate(initialDateString)
//   );

//   // Handle date change
//   const handleDateChange = async (event) => {
//     const newDate = event.target.value;
//     setSelectedDate(newDate);

//     // Call the API with Axios whenever the date changes
//     try {
//       const response = await axios.post("/your-api-endpoint", {
//         date: newDate,
//       });
//     } catch (error) {
//       console.error("Error calling API:", error);
//     }
//   };

//   return (
//     <div>
//       <input
//         id="datePicker"
//         type="date"
//         value={selectedDate}
//         onChange={handleDateChange}
//         style={{
//           border: "none",
//           padding: "4px 0px",
//           background: "transparent",
//           cursor: "pointer",
//         }}
//       />
//     </div>
//   );
// };

export default GenerateInvoice;
