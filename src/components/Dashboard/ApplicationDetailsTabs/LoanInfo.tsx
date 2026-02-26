import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../../Loader/Loader";

interface FieldConfig {
  key: string;
  enLabel: string;
  arLabel: string;
  enValueKey?: string;
  arValueKey?: string;
  transform?: (data: any) => { en: string; ar: string };
}

function LoanInformation({ applicationData }: any) {
  const [loanAmountData, setLoanAmountData] = useState<any>(null);
  const [loanApplicationData, setLoanApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  // Helper function to format currency
  const formatCurrency = (value: any): string => {
    if (!value && value !== 0) return "-";
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    if (isNaN(numValue)) return "-";
    return `SR ${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to format date
  const formatDate = (dateString: any): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  // Loan Amount Info field configuration
  const loanAmountFields: FieldConfig[] = [
    {
      key: "requested_loan_amount",
      enLabel: "Requested Loan Amount",
      arLabel: "المبلغ المطلوب للقرض",
      transform: (data: any) => ({
        en: formatCurrency(data.requested_amount || data.requested_loan_amount),
        ar: formatCurrency(data.requested_amount || data.requested_loan_amount),
      }),
    },
    {
      key: "cost_of_term",
      enLabel: "Cost Of Term",
      arLabel: "تكلفة الشروط",
      transform: (data: any) => ({
        en: formatCurrency(data.admin_fee_amount || data.cost_of_term),
        ar: formatCurrency(data.admin_fee_amount || data.cost_of_term),
      }),
    },
    {
      key: "total_payable_amount",
      enLabel: "Total Payable Amount by Customer",
      arLabel: "إجمالي المبلغ المستحق الدفع للعميل",
      transform: (data: any) => ({
        en: formatCurrency(data.total_amount_with_admin_fee || data.total_payable_amount),
        ar: formatCurrency(data.total_amount_with_admin_fee || data.total_payable_amount),
      }),
    },
    {
      key: "average_monthly_amount",
      enLabel: "Average Monthly Amount to Pay",
      arLabel: "متوسط المبلغ الشهري للدفع",
      transform: (data: any) => ({
        en: formatCurrency(data.monthly_amount_with_admin_fee || data.average_monthly_amount),
        ar: formatCurrency(data.monthly_amount_with_admin_fee || data.average_monthly_amount),
      }),
    },
  ];

  // Loan Application Info field configuration
  const loanApplicationFields: FieldConfig[] = [
    {
      key: "application_number",
      enLabel: "Application Number",
      arLabel: "رقم الطلب",
      transform: (data: any) => ({
        en: data.loan_application_number || data.application_number ||id|| "-",
        ar: data.loan_application_number || data.application_number  || id || "-",
      }),
    },
    {
      key: "product_name",
      enLabel: "Product Name",
      arLabel: "المنتج",
      transform: (data: any) => ({
        en: data.product?.name_en || data.product_name_en || data.product_name || "-",
        ar: data.product?.name_ar || data.product_name_ar || data.product_name || "-",
      }),
    },
    {
      key: "loan_tenure",
      enLabel: "Loan Tenure",
      arLabel: "مدة القرض",
      transform: (data: any) => ({
        en: data.duration || data.loan_tenure || "-",
        ar: data.duration || data.loan_tenure || "-",
      }),
    },
    {
      key: "loan_type",
      enLabel: "Loan Type",
      arLabel: "نوع القرض",
      transform: (data: any) => ({
        en: data.type || data.loan_type || "-",
        ar: data.type === "Individual" ? "فردي" : data.type || data.loan_type || "-",
      }),
    },
    {
      key: "purpose_of_finance",
      enLabel: "Purpose OF Finance",
      arLabel: "غرض التمويل",
      transform: (data: any) => ({
        en: data.purpose_of_finance_title || data.purpose_of_finance || data.finance_purpose || data.purpose || "-",
        ar: data.purpose_of_finance_title || data.purpose_of_finance || data.finance_purpose || data.purpose || "-",
      }),
    },
    {
      key: "application_date",
      enLabel: "Application Date",
      arLabel: "تاريخ التقديم",
      transform: (data: any) => {
        const dateValue = data.created_at || data.application_date || "-";
        const formattedDate = formatDate(dateValue);
        return {
          en: formattedDate,
          ar: formattedDate,
        };
      },
    },
  ];

  // Helper function to get field value
  const getFieldValue = (field: FieldConfig, data: any): { en: string; ar: string } => {
    if (!data) return { en: "-", ar: "-" };

    if (field.transform) {
      return field.transform(data);
    }

    const enValue = field.enValueKey
      ? data[field.enValueKey] || data[field.key] || "-"
      : data[field.key] || "-";
    const arValue = field.arValueKey
      ? data[field.arValueKey] || data[field.key] || "-"
      : data[field.key] || "-";

    return {
      en: enValue === null || enValue === undefined ? "-" : String(enValue),
      ar: arValue === null || arValue === undefined ? "-" : String(arValue),
    };
  };

  // Fetch loan information when component mounts
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch loan_info data
      const loanInfoResponse = await getApplicationDetailsByType(id, 'loan_info');
      const loanInfoData = loanInfoResponse.data?.data || loanInfoResponse.data || {};
      
      // Extract loan_application_amount directly from loan_info response
      const loanApplicationAmount = loanInfoData.loan_application_amount || {};
      
      // calculated_amount is now an object, not a JSON string
      const calculatedAmount = loanApplicationAmount.calculated_amount || {};
      
      // Extract loan amount data from loan_application_amount and calculated_amount
      const loanAmountInfo = {
        requested_loan_amount: loanApplicationAmount.requested_amount,
        requested_amount: loanApplicationAmount.requested_amount,
        cost_of_term: calculatedAmount?.admin_fee_amount,
        admin_fee_amount: calculatedAmount?.admin_fee_amount,
        total_payable_amount: calculatedAmount?.total_amount_with_admin_fee,
        total_amount_with_admin_fee: calculatedAmount?.total_amount_with_admin_fee,
        average_monthly_amount: calculatedAmount?.monthly_amount_with_admin_fee,
        monthly_amount_with_admin_fee: calculatedAmount?.monthly_amount_with_admin_fee,
        ...calculatedAmount,
        ...loanApplicationAmount,
      };
      
      // Extract purpose_of_finance from loan_info response (array of objects)
      const purposeOfFinanceArray = loanInfoData.purpose_of_finance || [];
      // Find selected purpose - check if applicationData has purpose_of_finance_id
      const purposeId = applicationData?.purpose_of_finance_id || applicationData?.application?.purpose_of_finance_id;
      const selectedPurpose = purposeId 
        ? purposeOfFinanceArray.find((p: any) => p.id === purposeId)
        : purposeOfFinanceArray[0];
      
      // Extract loan application data - use applicationData prop if available, otherwise use loan_info data only
      const application = applicationData?.application || applicationData || {};
      const loanApplicationInfo = {
        application_number: application.loan_application_number || id || "-",
        loan_application_number: application.loan_application_number || id || "-",
        product_name_en: application.product?.name_en || "-",
        product_name_ar: application.product?.name_ar || "-",
        product_name: application.product?.name_en || "-",
        product: application.product,
        loan_tenure: calculatedAmount?.total_duration || application.duration || "-",
        duration: calculatedAmount?.total_duration || application.duration || "-",
        loan_type: application.type || "-",
        type: application.type || "-",
        purpose_of_finance: selectedPurpose?.title || application.purpose_of_finance || application.finance_purpose || "-",
        purpose_of_finance_title: selectedPurpose?.title || "-",
        application_date: application.created_at || loanApplicationAmount.created_at || "-",
        created_at: application.created_at || loanApplicationAmount.created_at || "-",
      };
      
      setLoanAmountData(loanAmountInfo);
      setLoanApplicationData(loanApplicationInfo);
      
      if (loanInfoResponse.data?.message) {
        toast.success(loanInfoResponse.data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch loan information");
      setLoanAmountData(null);
      setLoanApplicationData(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if data is empty
  const isLoanAmountDataEmpty = !loanAmountData || Object.keys(loanAmountData).length === 0;
  const isLoanApplicationDataEmpty = !loanApplicationData || Object.keys(loanApplicationData).length === 0;

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ padding: "20px", background: "#fff", minHeight: "100vh" }}>
      {/* Language Headers */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <span style={{ color: "#000", fontWeight: 600, fontSize: "16px" }}>English</span>
        <span style={{ color: "#000", fontWeight: 600, fontSize: "16px" }}>العربية</span>
      </div>

      {/* Loan Amount Info Section */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            Loan Amount Info:
          </h2>
          <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            معلومات مبلغ القرض
          </h2>
        </div>

        {isLoanAmountDataEmpty ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#000" }}>
            No response found
          </div>
        ) : (
          <div>
            {loanAmountFields.map((field, index) => {
              const values = getFieldValue(field, loanAmountData);
              return (
                <div
                  key={field.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < loanAmountFields.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000" }}>
                    {field.enLabel}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "left" }}>
                    {values.en}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "right", direction: "rtl" }}>
                    {values.ar}
                  </div>
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000", textAlign: "right", direction: "rtl" }}>
                    {field.arLabel}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loan Application Info Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            Loan Application Info:
          </h2>
          <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            معلومات طلب القرض
          </h2>
        </div>

        {isLoanApplicationDataEmpty ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#000" }}>
            No response found
          </div>
        ) : (
          <div>
            {loanApplicationFields.map((field, index) => {
              const values = getFieldValue(field, loanApplicationData);
              return (
                <div
                  key={field.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < loanApplicationFields.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000" }}>
                    {field.enLabel}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "left" }}>
                    {values.en}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "right", direction: "rtl" }}>
                    {values.ar}
                  </div>
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000", textAlign: "right", direction: "rtl" }}>
                    {field.arLabel}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanInformation;

