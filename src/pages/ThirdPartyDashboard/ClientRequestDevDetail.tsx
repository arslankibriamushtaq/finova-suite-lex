import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";
import { Button } from "antd";
import toast from "react-hot-toast";
import { getClientRequestDevDetail } from "../../redux/apis/apisThirdParty";
import Loader from "../../components/Loader/Loader";

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div
    className="d-flex justify-content-between gap-3"
    style={{
      padding: "10px 0",
      borderBottom: "1px solid var(--border)",
    }}
  >
    <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{label}</span>
    <span
      style={{
        fontSize: 13,
        fontWeight: 500,
        textAlign: "right",
        wordBreak: "break-word",
        maxWidth: "70%",
      }}
    >
      {value ?? "-"}
    </span>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="pro-card p-3 mb-3">
    <h5 className="mb-3 fw-bold" style={{ fontSize: 15 }}>
      {title}
    </h5>
    {children}
  </div>
);

const StatusPill = ({ status }: { status: any }) => {
  const code = Number(status);
  const isSuccess = code >= 200 && code < 300;
  const isClientError = code >= 400 && code < 500;
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 2,
        backgroundColor: isSuccess
          ? "var(--color-status-green)"
          : isClientError
          ? "var(--color-status-amber)"
          : "var(--color-status-coral)",
        color: "var(--primary-foreground)",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status ?? "-"}
    </span>
  );
};

const JsonBlock = ({ value }: { value: any }) => {
  if (value == null) return <span className="text-muted">-</span>;
  let pretty = "";
  if (typeof value === "string") {
    try {
      pretty = JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      pretty = value;
    }
  } else {
    pretty = JSON.stringify(value, null, 2);
  }
  return (
    <pre
      style={{
        background: "var(--color-surface-subtle)",
        border: "1px solid var(--border)",
        borderRadius: 2,
        padding: 12,
        fontSize: 12,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxHeight: 360,
        overflow: "auto",
        margin: 0,
      }}
    >
      {pretty}
    </pre>
  );
};

const formatDateTime = (value: any) =>
  value ? new Date(value).toLocaleString() : "-";

const ClientRequestDevDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchDetail(id);
  }, [id]);

  const fetchDetail = async (requestId: string) => {
    try {
      setLoading(true);
      const response = await getClientRequestDevDetail(requestId);
      const root = response?.data?.data ?? response?.data ?? null;
      setDetail(root);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to fetch request details"
      );
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="service client-request-dev-detail-page">
        <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
            <span className="pro-head-badge">
              <History className="h-4 w-4" />
            </span>
            Request Details
          </h3>
          <Button
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={16} />}
            style={{ height: 36, borderRadius: 2, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Back
          </Button>
        </div>

        {!loading && !detail && (
          <div className="pro-card p-4 text-center" style={{ color: "var(--muted-foreground)" }}>
            No details available for this request.
          </div>
        )}

        {detail && (
          <>
            <Section title="Overview">
              <div className="row g-3">
                <div className="col-md-6">
                  <InfoRow label="Request ID" value={detail.requestId || detail.id || "-"} />
                  <InfoRow label="API Code" value={detail.apiCode || "-"} />
                  <InfoRow label="Client" value={detail.clientName || detail.client?.name || "-"} />
                  <InfoRow label="Service" value={detail.serviceName || detail.service?.name || detail.serviceId || "-"} />
                  <InfoRow label="API" value={detail.apiName || detail.api?.name || detail.endpoint || "-"} />
                </div>
                <div className="col-md-6">
                  <InfoRow label="Method" value={detail.httpMethod || detail.method || "-"} />
                  <InfoRow label="Status" value={<StatusPill status={detail.responseStatus ?? detail.statusCode ?? detail.status} />} />
                  <InfoRow label="Mobile Phone" value={detail.mobilePhone || detail.mobile || detail.phone || detail.phoneNumber || "-"} />
                  <InfoRow label="NID" value={detail.nid || detail.nationalId || "-"} />
                  <InfoRow label="Created At" value={formatDateTime(detail.createdAt || detail.requestedAt || detail.timestamp)} />
                </div>
              </div>
            </Section>

            {(detail.endpoint || detail.url || detail.path) && (
              <Section title="Endpoint">
                <InfoRow label="URL" value={detail.endpoint || detail.url || detail.path} />
                {detail.host && <InfoRow label="Host" value={detail.host} />}
                {detail.environment && <InfoRow label="Environment" value={detail.environment} />}
                {detail.duration != null && <InfoRow label="Duration (ms)" value={detail.duration} />}
              </Section>
            )}

            {(detail.requestHeaders || detail.requestBody || detail.request) && (
              <Section title="Request">
                {detail.requestHeaders && (
                  <div className="mb-3">
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>Headers</div>
                    <JsonBlock value={detail.requestHeaders} />
                  </div>
                )}
                {(detail.requestBody || detail.request) && (
                  <div>
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>Body</div>
                    <JsonBlock value={detail.requestBody ?? detail.request} />
                  </div>
                )}
              </Section>
            )}

            {(detail.responseHeaders || detail.responseBody || detail.response) && (
              <Section title="Response">
                {detail.responseHeaders && (
                  <div className="mb-3">
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>Headers</div>
                    <JsonBlock value={detail.responseHeaders} />
                  </div>
                )}
                {(detail.responseBody || detail.response) && (
                  <div>
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>Body</div>
                    <JsonBlock value={detail.responseBody ?? detail.response} />
                  </div>
                )}
              </Section>
            )}

            {detail.errorMessage && (
              <Section title="Error">
                <JsonBlock value={detail.errorMessage} />
              </Section>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ClientRequestDevDetail;
