import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Descriptions, Card, Button } from "antd";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getProductById, Product } from "../../../../redux/apis/apisInvestor";
import Loader from "../../../../components/Loader/Loader";

const ProductView = () => {
  const { t } = useTranslation("investor");
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
        toast.error(response?.notificationMessage || t("pv.fetchError"));
      }
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || t("pv.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const getProductStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: t('pv.status.active'),
      1: t('pv.status.inactive'),
      2: t('pv.status.closed'),
      3: t('pv.status.suspended'),
      4: t('pv.status.launching')
    };
    return statusMap[status] || t('pv.status.unknown');
  };

  const getProductStatusColor = (status: number) => {
    const colorMap: { [key: number]: string } = {
      0: '#AB1920', // Green for Active
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
            <p className="text-gray-500">{t("pv.notFound")}</p>
            <Button
              type="primary"
              onClick={() => navigate('/InvestorDashboard/Products')}
              className="mt-4"
            >
              {t("pv.backToList")}
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
          {t("pv.backToList")}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{t("pv.detailsTitle")}</h1>
      </div>

      <Card>
        <Descriptions
          title={t("pv.infoTitle")}
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label={t("pv.label.id")}>
            <span className="text-sm">{productData.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.name")}>
            <span className="font-semibold text-lg">{productData.name}</span>
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.type")}>
            {productData.type || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.code")}>
            <span>{productData.code || "-"}</span>
          </Descriptions.Item>
          <Descriptions.Item label={t("common:description")} span={2}>
            {productData.description || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.expectedReturn")}>
            {productData.expectedReturn}%
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.minInvestment")}>
            {productData.minimumInvestment?.toLocaleString() || "0"} SAR
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.category")}>
            {productData.productCategory || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.status")}>
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
          <Descriptions.Item label={t("pv.label.launchDate")}>
            {productData.launchDate ? new Date(productData.launchDate).toLocaleDateString() : "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.duration")}>
            {productData.investmentDuration ? t("pv.months", { value: productData.investmentDuration }) : "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pv.label.segmentId")}>
            <span className="text-sm">{productData.segmentId || "-"}</span>
          </Descriptions.Item>
          <Descriptions.Item label={t("common:createdAt")}>
            {productData.createdAt ? new Date(productData.createdAt).toLocaleString() : "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("common:updatedAt")}>
            {productData.updatedAt ? new Date(productData.updatedAt).toLocaleString() : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ProductView;
