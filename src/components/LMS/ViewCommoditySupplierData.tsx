import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Input, Row, Col, Button } from "antd";
import toast from "react-hot-toast";
import { getCommoditySupplierById } from "../../redux/apis/apisCrudLms";

const ViewCommoditySupplierData = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const getSupplierData = async () => {
    if (!id) {
      console.error("Invalid supplier ID:", id);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getCommoditySupplierById(id);
      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        toast.error("Supplier not found");
        setData(null);
      }
      setLoading(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.notificationMessage || error?.response?.data?.message || error?.message || "Failed to fetch supplier details";
      toast.error(errorMessage);
      setLoading(false);
      setData(null);
    }
  };

  useEffect(() => {
    if (id) {
      getSupplierData();
    }
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
        <Alert message="Supplier not found" type="error" />
      </div>
    );
  }

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Supplier Details</h2>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
      
      <Card
        bordered={false}
        style={{
          margin: "0 auto",
          background: "var(--background)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderRadius: 8,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Name
              </label>
              <Input value={data.name || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                API URL
              </label>
              <Input value={data.apiUrl || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Channel
              </label>
              <Input value={data.channel || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Record State
              </label>
              <Input
                value={data.recordState === 1 ? "Active" : "Inactive"}
                readOnly
                className="form-control"
              />
            </div>
          </Col>

          {data.id && (
            <Col xs={24} sm={12}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                  ID
                </label>
                <Input value={data.id || "-"} readOnly className="form-control" />
              </div>
            </Col>
          )}

          {data.created && (
            <Col xs={24} sm={12}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                  Created At
                </label>
                <Input
                  value={data.created ? new Date(data.created).toLocaleString() : "-"}
                  readOnly
                  className="form-control"
                />
              </div>
            </Col>
          )}

          {data.updatedAt && (
            <Col xs={24} sm={12}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                  Updated At
                </label>
                <Input
                  value={data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "-"}
                  readOnly
                  className="form-control"
                />
              </div>
            </Col>
          )}

          {data.isDeleted !== undefined && (
            <Col xs={24} sm={12}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                  Is Deleted
                </label>
                <Input
                  value={data.isDeleted ? "Yes" : "No"}
                  readOnly
                  className="form-control"
                />
              </div>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default ViewCommoditySupplierData;
