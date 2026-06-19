import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Alert, Input, Row, Col, Button, Card } from "antd";
import toast from "react-hot-toast";
import { getWealthRangesById } from "../../redux/apis/apisCrud";

const ViewWealthRanges = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const getWealthRangeData = async () => {
    if (!id) {
      console.error("Invalid wealth range ID:", id);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getWealthRangesById(id);
      if (response?.data?.data) {
        setData(response.data.data);
      } else {
        toast.error("Wealth range not found");
        setData(null);
      }
      setLoading(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.notificationMessage || error?.response?.data?.message || error?.message || "Failed to fetch wealth range details";
      toast.error(errorMessage);
      setLoading(false);
      setData(null);
    }
  };

  useEffect(() => {
    if (id) {
      getWealthRangeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="service d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="service">
        <Alert message="Wealth range not found" type="error" />
      </div>
    );
  }

  return (
    <div className="service" style={{ background: "white", padding: "1rem", borderRadius: "2px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Wealth Range Details</h2>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
      
      <Card
        bordered={false}
        style={{
          margin: "0 auto",
          background: "var(--background)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderRadius: 2,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Minimum Amount
              </label>
              <Input value={data.minimum_amount || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Maximum Amount
              </label>
              <Input value={data.maximum_amount || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Type
              </label>
              <Input value={data.type || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Range
              </label>
              <Input value={data.range || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Factors
              </label>
              <Input value={data.factors || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Factor Weight
              </label>
              <Input value={data.factor_weight || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12} md={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Status
              </label>
              <div
                style={{
                  padding: "8px 10px",
                  fontSize: "12px",
                  borderRadius: "32px",
                  backgroundColor:
                    data.status === 1 || data.status === true
                      ? "var(--color-success)"
                      : data.status === 0 || data.status === false
                      ? "var(--color-error)"
                      : "var(--color-orange-alt)",
                  color: "var(--primary-foreground)",
                  display: "inline-block",
                  minWidth: "80px",
                  textAlign: "center",
                }}
              >
                {data.status == 1 || data.status === true ? "Active" : "Inactive"}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ViewWealthRanges;

