import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Input, Row, Col, Button } from "antd";
import toast from "react-hot-toast";
import { getRequestDetail } from "../../redux/apis/apisThirdParty";

const { TextArea } = Input;

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requestId = id ? parseInt(id) : 0;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [requestResponse, setRequestResponse] = useState<string>("");
  const [responseFormat, setResponseFormat] = useState<string>("");

  // Helper function to format JSON strings
  const formatJSON = (jsonString: string | any) => {
    if (!jsonString) return "";
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return typeof jsonString === 'string' ? jsonString : JSON.stringify(jsonString);
    }
  };

  const getRequestData = async () => {
    if (!requestId || requestId <= 0) {
      console.error("Invalid request ID:", requestId, "from id:", id);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getRequestDetail(requestId);
      if (response?.data?.success) {
        const responseData = response.data.data;
        // Extract requestHistoryDetail from the response
        const requestDetail = responseData?.requestHistoryDetail || responseData?.request || responseData;
        setData(requestDetail);
        
        // Set formatted request and response
        if (responseData?.requestResponse) {
          setRequestResponse(formatJSON(responseData.requestResponse));
        } else if (requestDetail?.request) {
          setRequestResponse(formatJSON(requestDetail.request));
        }
        
        if (responseData?.responseFormate) {
          setResponseFormat(formatJSON(responseData.responseFormate));
        } else if (requestDetail?.responses) {
          setResponseFormat(formatJSON(requestDetail.responses));
        }
      } else {
        toast.error("Request not found");
        setData(null);
      }
      setLoading(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch request details";
      toast.error(errorMessage);
      setLoading(false);
      setData(null);
    }
  };

  useEffect(() => {
    if (id) {
      const parsedId = parseInt(id);
      if (parsedId > 0) {
        getRequestData();
      }
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
        <Alert message="Request not found" type="error" />
      </div>
    );
  }

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Request Detail</h2>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
      
      <Card
        bordered={false}
        style={{
          margin: "0 auto",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderRadius: 8,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                ID
              </label>
              <Input value={data.id || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Status
              </label>
              <Input
                value={data.status || "Pending"}
                readOnly
                className="form-control"
              />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Client
              </label>
              <Input value={data.client?.name || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Service
              </label>
              <Input value={data.api?.service?.name || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                API
              </label>
              <Input value={data.api?.name || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Created At
              </label>
              <Input
                value={data.created_at ? new Date(data.created_at).toLocaleString() : "-"}
                readOnly
                className="form-control"
              />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Request ID
              </label>
              <Input value={data.request_id || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                NID
              </label>
              <Input value={data.nid || "-"} readOnly className="form-control" />
            </div>
          </Col>

          {data.callback && (
            <Col xs={24} sm={12}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                  Callback
                </label>
                <Input value={data.callback} readOnly className="form-control" />
              </div>
            </Col>
          )}

          {data.contract_number && (
            <Col xs={24} sm={12}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                  Contract Number
                </label>
                <Input value={data.contract_number} readOnly className="form-control" />
              </div>
            </Col>
          )}

          <Col xs={24}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Request Body
              </label>
              <TextArea
                value={requestResponse}
                readOnly
                rows={10}
                className="form-control"
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  backgroundColor: "#f5f5f5",
                }}
              />
            </div>
          </Col>

          <Col xs={24}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                Response Body
              </label>
              <TextArea
                value={responseFormat}
                readOnly
                rows={10}
                className="form-control"
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  backgroundColor: "#f5f5f5",
                }}
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RequestDetail;

