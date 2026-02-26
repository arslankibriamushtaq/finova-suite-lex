import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GetLoanApprovalExpensesByNationalId, GetOnboardingExpensesByNationalId } from "../../redux/apis/apisCrudLms";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

const OnboardingExpensesDetail = () => {
  const { nationalId } = useParams();
  const [data, setData] = useState<any[]>([]);
  const [master, setMaster] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const payload = { nationalId: nationalId || "" };
      const res = await GetOnboardingExpensesByNationalId(payload);

      if (res?.data?.success) {
        const masterData = res.data.data?.master || null;
        const detailData = res.data.data?.details || [];
        setMaster(masterData);
        setData(detailData);
      } else {
        toast.error(res?.data?.notificationMessage || "Failed to fetch data");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (nationalId) {
      fetchData();
    }
  }, [nationalId]);

  const headers = [
    { name: "Expense Category", selector: (row: any) => row.expenseCategory || "-" },
    { name: "Service Name", selector: (row: any) => row.serviceName || "-" },
    { name: "Amount", selector: (row: any) => row.amount ?? "-" },
    { name: "Process Result", selector: (row: any) => row.processResult || "-" },
    { name: "Channel", selector: (row: any) => row.channel || "-" },
    { name: "Created Date", selector: (row: any) => row.created || "-" },
  ];

  return (
    <>
      {loading && <Loader />}

      {/* Master Info */}
      {master && (
        <div className="p-3 border rounded bg-light mb-3">
          <p><strong>Total Amount:</strong> {master.totalAmount ?? "-"}</p>
          <p><strong>Narration:</strong> {master.expenseMasterNarration || "-"}</p>
        </div>
      )}

      {/* Details Table */}
      <div className="cs-table p-2 mt-3">
        <TableView
          header={headers}
          data={data}
          page={1}
          pageSize={data.length}
          setPage={() => {}}
          setPageSize={() => {}}
          totalRows={data.length}
        />
      </div>
    </>
  );
};

export default OnboardingExpensesDetail;
