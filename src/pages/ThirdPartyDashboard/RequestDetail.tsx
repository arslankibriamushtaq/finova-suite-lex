import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Input, Row, Col, Button } from "antd";
import toast from "react-hot-toast";
import { getRequestDetail } from "../../redux/apis/apisThirdParty";

const { TextArea } = Input;

const RequestDetail = () => {
  const { t } = useTranslation("connector");
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
        toast.error(t("requestDetail.notFound"));
        setData(null);
      }
      setLoading(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t("requestDetail.toast.fetchFailed");
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
        <Alert message={t("requestDetail.notFound")} type="error" />
      </div>
    );
  }

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("requestDetail.title")}</h2>
        <Button onClick={() => navigate(-1)}>{t("common:back")}</Button>
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
          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.id")}
              </label>
              <Input value={data.id || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.status")}
              </label>
              <Input
                value={data.status || t("common:pending")}
                readOnly
                className="form-control"
              />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.client")}
              </label>
              <Input value={data.client?.name || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.service")}
              </label>
              <Input value={data.api?.service?.name || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.api")}
              </label>
              <Input value={data.api?.name || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.createdAt")}
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
                {t("requestDetail.label.requestId")}
              </label>
              <Input value={data.request_id || "-"} readOnly className="form-control" />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.nid")}
              </label>
              <Input value={data.nid || "-"} readOnly className="form-control" />
            </div>
          </Col>

          {data.callback && (
            <Col xs={24} sm={12}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                  {t("requestDetail.label.callback")}
                </label>
                <Input value={data.callback} readOnly className="form-control" />
              </div>
            </Col>
          )}

          {data.contract_number && (
            <Col xs={24} sm={12}>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                  {t("requestDetail.label.contractNumber")}
                </label>
                <Input value={data.contract_number} readOnly className="form-control" />
              </div>
            </Col>
          )}

          <Col xs={24}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.requestBody")}
              </label>
              <TextArea
                value={requestResponse}
                readOnly
                rows={10}
                className="form-control"
                style={{
                  fontSize: "12px",
                  backgroundColor: "var(--color-surface-subtle)",
                }}
              />
            </div>
          </Col>

          <Col xs={24}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}>
                {t("requestDetail.label.responseBody")}
              </label>
              <TextArea
                value={responseFormat}
                readOnly
                rows={10}
                className="form-control"
                style={{
                  fontSize: "12px",
                  backgroundColor: "var(--color-surface-subtle)",
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

