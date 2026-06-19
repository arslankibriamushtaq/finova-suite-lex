import { useEffect, useState } from "react";
import { Button } from "antd";
import TableView from "../../../components/TableView/TableView";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDynamicInvoiceCreation,
  GetRetryByApplicationId,
  GetRetryTransaction,
} from "../../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

import { DownOutlined } from "@ant-design/icons";
import Loader from "../../../components/Loader/Loader";

import { NumberFormatter } from "../../../App";
import { useDispatch } from "react-redux";
import { setPayInvoices } from "../../../redux/apis/apisSlice";

const RetryTransaction = () => {
  const dispatch = useDispatch();

  const [allTableList, setTableList] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);

  const [loader, setLoader] = useState<boolean>(false);

  const params = useParams();

  const Customer_ALL_List_Header = [
    {
      name: "Debit Account",
      selector: (row: any) => row.DebitAccountNumber,
    },

    {
      name: "Credit Account",
      selector: (row: any) => row.CreditAccountNumber,
    },
    {
      name: "Beneficiary Name",
      selector: (row: any) => row.BeneficiaryName,
    },
    {
      name: "BIC",
      selector: (row: any) => row.DestinationBank_BIC,
    },
    {
      name: "Amount",
      selector: (row: any) => row.LoanAmount,
    },

    {
      name: "Transaction Status",
      selector: (row: any) => row.TransactionStatus,
    },

    {
      name: "Actions",

      cell: (row: any) => (
        <Button
          className="retry-btn"
          type="primary"
          disabled={
            row.TransactionStatus !== "Failed" ||
            row.TransactionStatus !== "Returned"
          }
          onClick={() => retryTransaction(row?.PaymentId)}
          style={{
            borderColor: "white",
            borderRadius: "6px",
            padding: "10px 20px",
            color: "white",
          }}
        >
          Retry
        </Button>
      ),
    },
  ];

  const GetDataByApplicationId = async () => {
    try {
      setSkelitonLoading(true);
      const res = await GetRetryByApplicationId(params?.id, params.type);
      if (res) {
        const value = res.data.data;
        setTableList(value || []);
        // setTableList([
        //   {
        //     RepaymentId: "d3b07384-d9a0-4e7f-8a2d-1234567890ab",
        //     DisbursementId: "a1f0a3f2-9d35-4b68-bd02-abcdef123456",
        //     LedgerId: "b5e97c2a-42f7-4c93-8a7a-9876543210ef",
        //     ApplicationId: "c2f1d3e4-5678-4a9b-90ab-cdef12345678",
        //     LoanId: "e4f2d5a6-1122-4c77-8899-abcdefabcdef",
        //     InvoiceId: "f6a7d8e9-3344-5566-7788-abcdef123456",
        //     DebitAccountNumber: "SA1230000000000000012345",
        //     CreditAccountNumber: "SA9870000000000000098765",
        //     BeneficiaryName: "John Doe",
        //     Address_1: "KSA",
        //     Address_2: "Riyadh",
        //     DestinationBank_BIC: "ANBKSAJE",
        //     TransactionStatus: "Success",
        //     PaymentId: "PAY123456789",
        //     LoanAmount: 25000.5,
        //     RetryCount: 0,
        //   },
        //   {
        //     RepaymentId: "11111111-2222-3333-4444-555555555555",
        //     DisbursementId: "66666666-7777-8888-9999-000000000000",
        //     LedgerId: "aaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        //     ApplicationId: "ffffffff-1111-2222-3333-444444444444",
        //     LoanId: "55555555-6666-7777-8888-999999999999",
        //     InvoiceId: "abcdabcd-abcd-abcd-abcd-abcdabcdabcd",
        //     DebitAccountNumber: "SA1110000000000000022222",
        //     CreditAccountNumber: "SA9990000000000000088888",
        //     BeneficiaryName: "Alice Smith",
        //     Address_1: "KSA",
        //     Address_2: "Jeddah",
        //     DestinationBank_BIC: "SABBKSAJ",
        //     TransactionStatus: "Pending",
        //     PaymentId: "PAY987654321",
        //     LoanAmount: 10000.0,
        //     RetryCount: 2,
        //   },
        // ]);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const retryTransaction = async (PaymentId: any) => {
    try {
      setSkelitonLoading(true);
      const res = await GetRetryTransaction(PaymentId);
      if (res?.data?.success) {
        toast.success(res.data?.notificationMessage);
        GetDataByApplicationId();
      }else{
         toast.error(res.data?.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const mappedData =
    allTableList &&
    allTableList.map((item: any) => {
      return {
        CreditAccountNumber: item?.CreditAccountNumber,
        DebitAccountNumber: item?.DebitAccountNumber,
        BeneficiaryName: item?.BeneficiaryName,
        LoanAmount: item?.LoanAmount,
        TransactionStatus: item?.TransactionStatus,
        DestinationBank_BIC: item?.DestinationBank_BIC,
        PaymentId: item?.PaymentId,
      };
    });

  useEffect(() => {
    GetDataByApplicationId();
    return () => {};
  }, [page, pageSize]);

  return (
    <>
      {loader && <Loader />}
      <div className="service retry-transaction-page">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">
            {params.type === "1" ? "Disburse History" : "Repay History"}
          </h3>
        </div>

        {/* Table card */}
        <div
          className="bg-white"
          style={{
            borderRadius: 6,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            header={Customer_ALL_List_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
          {allTableList?.length == 0 && (
            <div
              className="d-flex justify-content-center py-5"
              style={{ color: "var(--destructive)" }}
            >
              No data found
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RetryTransaction;
