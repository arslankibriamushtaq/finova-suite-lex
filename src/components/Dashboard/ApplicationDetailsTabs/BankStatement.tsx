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
  const [disbursementAccount, setDisbursementAccount] = useState<any>(null);
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
    const accountsList = data.accounts || data.bankAccounts || data.bank_accounts || [];
    const accountsArray = Array.isArray(accountsList) ? accountsList : [];
    const account = accountsArray.find((acc: any) => acc.is_primary) || accountsArray[0];

    setDisbursementAccount(data.disbursementAccount || data.disbursement_account || null);

    if (account) {
      setAccountData({
        account_holder_name: account.account_holder_name || account.holder_name || account.name || "",
        bank_name: account.bank?.name || account.bank?.name_ar || account.bank || account.provider_id || "",
        iban: account.iban || account.IBAN || "",
        account_id: account.account_id || "",
      });

      const transactionsData = account.transactions || account.transaction_list || account.transaction_details || [];
      const mappedTransactions = (Array.isArray(transactionsData) ? transactionsData : []).map((txn: any) => ({
        transaction_id: txn.transaction_id || txn.id || "",
        account_id: account.account_id || "",
        provider_id: account.bank?.name || account.bank?.name_ar || account.bank || account.provider_id || "",
        credit_debit_indicator: txn.transaction_type || txn.credit_debit_indicator || txn.indicator || (parseFloat(txn.amount || 0) >= 0 ? "Credit" : "Debit") || "Debit",
        amount: txn.amount || "0.00",
        currency: txn.currency || "SAR",
        booking_date_time: txn.transaction_date || txn.booking_date_time || txn.date || "",
      }));
      setTransactions(mappedTransactions);
    } else {
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
  const isAccountDataEmpty = (!accountData || Object.keys(accountData).length === 0) && !disbursementAccount;
  const isTransactionsEmpty = !transactions || transactions.length === 0;

  return (
    <div style={{ padding: "20px", background: "var(--surface-page)", minHeight: "100vh", fontFamily: "inherit", fontSize: "14px" }}>
      {/* Top Section - Account Information */}
      <div style={{ background: "var(--surface-card)", padding: "20px", borderRadius: "6px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        {isAccountDataEmpty ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--foreground)" }}>
            No response found
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Account Holder Name */}
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "var(--foreground)", marginBottom: "8px", fontWeight: 500 }}>
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
                  color: "var(--foreground)",
                  background: "var(--surface-card-alt)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            {/* Bank Name */}
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "var(--foreground)", marginBottom: "8px", fontWeight: 500 }}>
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
                  color: "var(--foreground)",
                  background: "var(--surface-card-alt)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            {/* IBAN */}
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "var(--foreground)", marginBottom: "8px", fontWeight: 500 }}>
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
                  color: "var(--foreground)",
                  background: "var(--surface-card-alt)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {disbursementAccount && (
        <div style={{ background: "var(--surface-card)", padding: "20px", borderRadius: "6px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--foreground)", marginBottom: "12px" }}>
            Disbursement Account
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "6px" }}>Account Holder</div>
              <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                {disbursementAccount.account_holder_name || disbursementAccount.holder_name || disbursementAccount.name || "-"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "6px" }}>Bank Name</div>
              <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                {disbursementAccount.bank?.name || disbursementAccount.bank || disbursementAccount.provider_id || "-"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "6px" }}>IBAN</div>
              <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                {disbursementAccount.iban || disbursementAccount.IBAN || "-"}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Bottom Section - Transaction Details */}
      {isTransactionsEmpty ? (
        <div style={{ background: "var(--surface-card)", padding: "40px", borderRadius: "6px", textAlign: "center", color: "var(--foreground)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          No response found
        </div>
      ) : (
        <div style={{ maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {transactions.map((transaction, index) => (
              <div
                key={transaction.transaction_id || index}
                style={{
                  background: "var(--surface-card)",
                  padding: "20px",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {/* Transaction ID Header */}
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--foreground)", marginBottom: "16px" }}>
                  {transaction.transaction_id || "-"}
                </div>

                {/* Transaction Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {/* Account ID */}
                  <div style={{ padding: "12px 0", borderBottom: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>Account ID:</div>
                    <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>
                      {transaction.account_id || "-"}
                    </div>
                  </div>

                  {/* Provider ID */}
                  <div style={{ padding: "12px 0", borderBottom: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>Provider ID:</div>
                    <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>
                      {transaction.provider_id || "-"}
                    </div>
                  </div>

                  {/* Credit/Debit Indicator */}
                  <div style={{ padding: "12px 0", borderBottom: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>Credit/Debit Indicator:</div>
                    <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>
                      {transaction.credit_debit_indicator || transaction.indicator || "-"}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ padding: "12px 0", borderBottom: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>Amount:</div>
                    <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </div>

                  {/* Booking Date Time */}
                  <div style={{ padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>Booking Date Time:</div>
                    <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>
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
