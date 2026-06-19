import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Descriptions, Card, Button } from "antd";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getProductById, Product } from "../../../../redux/apis/apisInvestor";
import Loader from "../../../../components/Loader/Loader";

const ProductView = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<Product | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const response = await getProductById(productId);

      if (response?.success) {
        setProductData(response.data || null);
      } else {
        toast.error(response?.notificationMessage || "Failed to fetch product details");
      }
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const getProductStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: 'Active',
      1: 'Inactive',
      2: 'Closed',
      3: 'Suspended',
      4: 'Launching'
    };
    return statusMap[status] || 'Unknown';
  };

  const getProductStatusColor = (status: number) => {
    const colorMap: { [key: number]: string } = {
      0: '#52c41a', // Green for Active
      1: '#8c8c8c', // Gray for Inactive
      2: '#ff4d4f', // Red for Closed
      3: '#faad14', // Yellow for Suspended
      4: '#1890ff'  // Blue for Launching
    };
    return colorMap[status] || '#8c8c8c';
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

  if (!productData) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Product not found</p>
            <Button
              type="primary"
              onClick={() => navigate('/InvestorDashboard/Products')}
              className="mt-4"
            >
              Back to Products
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusColor = getProductStatusColor(productData.productStatus);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/InvestorDashboard/Products")}
          className="mb-4"
        >
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Product Details</h1>
      </div>

      <Card>
        <Descriptions
          title="Product Information"
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Product ID">
            <span className="text-sm">{productData.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Product Name">
            <span className="font-semibold text-lg">{productData.name}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Product Type">
            {productData.type || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Product Code">
            <span>{productData.code || "-"}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {productData.description || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Expected Return">
            {productData.expectedReturn}%
          </Descriptions.Item>
          <Descriptions.Item label="Minimum Investment">
            {productData.minimumInvestment?.toLocaleString() || "0"} SAR
          </Descriptions.Item>
          <Descriptions.Item label="Product Category">
            {productData.productCategory || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Product Status">
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "2px",
                backgroundColor: statusColor,
                color: "white",
                fontSize: "12px",
              }}
            >
              {getProductStatusText(productData.productStatus)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Launch Date">
            {productData.launchDate ? new Date(productData.launchDate).toLocaleDateString() : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Investment Duration">
            {productData.investmentDuration ? `${productData.investmentDuration} months` : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Segment ID">
            <span className="text-sm">{productData.segmentId || "-"}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {productData.createdAt ? new Date(productData.createdAt).toLocaleString() : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {productData.updatedAt ? new Date(productData.updatedAt).toLocaleString() : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ProductView;
