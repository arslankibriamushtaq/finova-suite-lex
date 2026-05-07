import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Descriptions, Card, Button } from "antd";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getIncomeRangeById, IncomeRange } from "../../../../redux/apis/apisInvestor";
import Loader from "../../../../components/Loader/Loader";

const IncomeRangeView = () => {
  const { incomeRangeId } = useParams<{ incomeRangeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [incomeRangeData, setIncomeRangeData] = useState<IncomeRange | null>(null);

  useEffect(() => {
    if (incomeRangeId) {
      fetchIncomeRangeData();
    }
  }, [incomeRangeId]);

  const fetchIncomeRangeData = async () => {
    if (!incomeRangeId) return;

    try {
      setLoading(true);
      const response = await getIncomeRangeById(incomeRangeId);

      if (response?.success) {
        setIncomeRangeData(response.data || null);
      } else {
        toast.error(response?.notificationMessage || "Failed to fetch income range details");
      }
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || "Failed to fetch income range details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  if (!incomeRangeData) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Income Range not found</p>
            <Button
              type="primary"
              onClick={() => navigate('/InvestorDashboard/SystemSettings/IncomeRanges')}
              className="mt-4"
            >
              Back to Income Ranges
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/InvestorDashboard/SystemSettings/IncomeRanges")}
          className="mb-4"
        >
          Back to Income Ranges
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Income Range Details</h1>
      </div>

      <Card>
        <Descriptions
          title="Income Range Information"
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Income Range ID">
            <span className="text-sm">{incomeRangeData.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Minimum Amount">
            {incomeRangeData.minimumAmount?.toLocaleString() || "0"} SAR
          </Descriptions.Item>
          <Descriptions.Item label="Maximum Amount">
            {incomeRangeData.maximumAmount?.toLocaleString() || "0"} SAR
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {incomeRangeData.createdAt ? new Date(incomeRangeData.createdAt).toLocaleString() : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {incomeRangeData.updatedAt ? new Date(incomeRangeData.updatedAt).toLocaleString() : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default IncomeRangeView;

