import { getAllInvoiceList } from '../../../redux/apis/apisCrudLms';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../Loader/Loader';
import TableView from '../../TableView/TableView';

interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paymentStatus: string;
}

function PaymentStatus() {
  const { id } = useParams();
  const [invoiceData, setInvoiceData] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoiceData();
    }
  }, [id]);

  const fetchInvoiceData = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      // Fetch Loan Invoice (type 0)
      const response = await getAllInvoiceList(id, 0);
      if (response?.data?.success && response?.data?.data) {
        const invoices = Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        
        const formatDate = (date: string | Date) => {
          if (!date) return '-';
          const d = new Date(date);
          const day = d.getDate().toString().padStart(2, '0');
          const month = d.toLocaleDateString('en-GB', { month: 'long' });
          const year = d.getFullYear();
          return `${day} ${month}, ${year}`;
        };

        // Map paymentStatus number to text: 1 = Paid, others = Unpaid
        const getPaymentStatusText = (status: number): string => {
          return status === 1 ? 'Paid' : 'Unpaid';
        };

        const formattedData: InvoiceData[] = invoices
          .filter((item: any) => item?.result) // Filter out items without result
          .map((item: any) => {
            const invoice = item.result;
            return {
              invoiceNo: invoice.invoiceNumber || '-',
              invoiceDate: formatDate(invoice.invoiceDate),
              dueDate: formatDate(invoice.dueDate),
              totalAmount: invoice.totalAmount || 0,
              paymentStatus: getPaymentStatusText(invoice.paymentStatus),
            };
          });
        
        setInvoiceData(formattedData);
      }
    } catch (error: any) {
      console.error('Error fetching invoice data:', error);
      toast.error(error?.response?.data?.message || 'Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const invoiceTableHeader = [
    {
      name: 'Invoice No.',
      selector: (row: InvoiceData) => row.invoiceNo,
      sortable: true,
      width: '200px',
    },
    {
      name: 'Invoice Date',
      selector: (row: InvoiceData) => row.invoiceDate,
      sortable: true,
      width: '280px',
    },
    {
      name: 'Due Date',
      selector: (row: InvoiceData) => row.dueDate,
      sortable: true,
      width: '280px',
    },
    {
      name: 'Total Amount',
      selector: (row: InvoiceData) => row.totalAmount ? `SR ${row.totalAmount.toLocaleString()}` : '-',
      sortable: true,
      width: '250px',
    },
    {
      name: 'Payment Status',
      cell: (row: InvoiceData) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "12px",
            backgroundColor: row.paymentStatus === 'Paid' ? "var(--color-status-green)" : "var(--color-status-red-soft)",
            color: "white",
          }}
        >
          {row.paymentStatus}
        </div>
      ),
      sortable: true,
      width: '150px',
    },
  ];

  return (
    <div style={{ padding: "20px", background: "var(--background)", minHeight: "100vh" }}>
      {loading && <Loader />}
      
      {/* Payment Status Info Table */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", marginBottom: "20px", textAlign:"left" }}>
          Payment Status Info:
        </h2>
        <div style={{ 
          background: "var(--background)",
          borderRadius: "8px",
          overflow: "hidden",
          //border: "1px solid #E5E7EB"
        }}>
          <TableView
            header={invoiceTableHeader}
            data={invoiceData}
            isLoading={loading}
            paginationShow={false}
          />
        </div>
      </div>
    </div>
  );
}

export default PaymentStatus;