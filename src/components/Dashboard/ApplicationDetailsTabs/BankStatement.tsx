import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Transaction {
  transaction_id?: string;
  account_id?: string;
  provider_id?: string;
  credit_debit_indicator?: string;
  indicator?: string;
  amount?: number | string;
  currency?: string;
  booking_date_time?: string;
  booking_date?: string;
  date?: string;
}

function BankStatement({ financialData }: any) {
  const [accountData, setAccountData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { id } = useParams();

  // Helper function to format currency
  const formatCurrency = (value: any, currency: string = "SAR"): string => {
    if (!value && value !== 0) return "-";
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    if (isNaN(numValue)) return "-";
    return `${numValue.toFixed(2)} ${currency}`;
  };

  // Helper function to format date
  const formatDateTime = (dateString: any): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toISOString();
    } catch {
      return dateString;
    }
  };

  // Fetch bank statement data when component mounts
  useEffect(() => {
    if (financialData) {
      // Use provided financialData prop
      extractData(financialData);
    } else if (id) {
      // Fetch from API if no prop provided
    //   fetchData();
    }
  }, [id, financialData]);

  const extractData = (data: any) => {
    // Handle new API response structure with accounts array
    if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
      // Get the first account (or primary account if available)
      const account = data.accounts.find((acc: any) => acc.is_primary) || data.accounts[0];
      
      // Set account data
      setAccountData({
        account_holder_name: account.account_holder_name || "",
        bank_name: account.bank?.name || account.bank?.name_ar || "",
        iban: account.iban || "",
        account_id: account.account_id || "",
      });

      // Extract and map transactions
      const transactionsData = account.transactions || [];
      const mappedTransactions = transactionsData.map((txn: any) => ({
        transaction_id: txn.transaction_id || "",
        account_id: account.account_id || "",
        provider_id: account.bank?.name || account.bank?.name_ar || "",
        credit_debit_indicator: txn.transaction_type || (parseFloat(txn.amount || 0) >= 0 ? "Credit" : "Debit") || "Debit",
        amount: txn.amount || "0.00",
        currency: txn.currency || "SAR",
        booking_date_time: txn.transaction_date || txn.booking_date_time || "",
      }));
      
      setTransactions(mappedTransactions);
    } else {
      // Fallback to old structure
      const accountInfo = data.account_info || data.account || data;
      setAccountData(accountInfo);
      const transactionsData = data.transactions || data.transaction_list || data.transaction_details || [];
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    }
  };

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const response = await getApplicationDetailsByType(id, 'manager');
      
//       // Extract bank statement data from response
//       const data = response.data?.data || response.data || {};
//       extractData(data);
      
//       if (response.data?.message) {
//         toast.success(response.data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error("Failed to fetch bank statement");
//       setAccountData(null);
//       setTransactions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

  // Check if data is empty
  const isAccountDataEmpty = !accountData || Object.keys(accountData).length === 0;
  const isTransactionsEmpty = !transactions || transactions.length === 0;

  return (
    <div style={{ padding: "20px", background: "#F4F4F4", minHeight: "100vh" }}>
      {/* Top Section - Account Information */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        {isAccountDataEmpty ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#000" }}>
            No response found
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Account Holder Name */}
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#000", marginBottom: "8px", fontWeight: 500 }}>
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountData?.account_holder_name || accountData?.holder_name || accountData?.name || ""}
                readOnly
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#000",
                  background: "#F5F5F5",
                  border: "1px solid #E0E0E0",
                  borderRadius: "4px",
                  outline: "none",
                }}
              />
            </div>

            {/* Bank Name */}
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#000", marginBottom: "8px", fontWeight: 500 }}>
                Bank Name
              </label>
              <input
                type="text"
                value={accountData?.bank_name || accountData?.bank || accountData?.provider_id || ""}
                readOnly
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#000",
                  background: "#F5F5F5",
                  border: "1px solid #E0E0E0",
                  borderRadius: "4px",
                  outline: "none",
                }}
              />
            </div>

            {/* IBAN */}
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#000", marginBottom: "8px", fontWeight: 500 }}>
                IBAN
              </label>
              <input
                type="text"
                value={accountData?.iban || accountData?.IBAN || ""}
                readOnly
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#000",
                  background: "#F5F5F5",
                  border: "1px solid #E0E0E0",
                  borderRadius: "4px",
                  outline: "none",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section - Transaction Details */}
      {isTransactionsEmpty ? (
        <div style={{ background: "#fff", padding: "40px", borderRadius: "8px", textAlign: "center", color: "#000", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          No response found
        </div>
      ) : (
        <div style={{ maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {transactions.map((transaction, index) => (
              <div
                key={transaction.transaction_id || index}
                style={{
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {/* Transaction ID Header */}
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#000", marginBottom: "16px" }}>
                  {transaction.transaction_id || "-"}
                </div>

                {/* Transaction Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {/* Account ID */}
                  <div style={{ padding: "12px 0", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "#000" }}>Account ID:</div>
                    <div style={{ fontSize: "14px", color: "#000", fontWeight: 400 }}>
                      {transaction.account_id || "-"}
                    </div>
                  </div>

                  {/* Provider ID */}
                  <div style={{ padding: "12px 0", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "#000" }}>Provider ID:</div>
                    <div style={{ fontSize: "14px", color: "#000", fontWeight: 400 }}>
                      {transaction.provider_id || "-"}
                    </div>
                  </div>

                  {/* Credit/Debit Indicator */}
                  <div style={{ padding: "12px 0", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "#000" }}>Credit/Debit Indicator:</div>
                    <div style={{ fontSize: "14px", color: "#000", fontWeight: 400 }}>
                      {transaction.credit_debit_indicator || transaction.indicator || "-"}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ padding: "12px 0", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "#000" }}>Amount:</div>
                    <div style={{ fontSize: "14px", color: "#000", fontWeight: 400 }}>
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </div>

                  {/* Booking Date Time */}
                  <div style={{ padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "#000" }}>Booking Date Time:</div>
                    <div style={{ fontSize: "14px", color: "#000", fontWeight: 400 }}>
                      {formatDateTime(transaction.booking_date_time || transaction.booking_date || transaction.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BankStatement;
