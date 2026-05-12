import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getClientRequestTestDetail } from "../../redux/apis/apisThirdParty";
import Loader from "../../components/Loader/Loader";

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
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
  <div
    className="bg-white p-3 mb-3"
    style={{
      borderRadius: 12,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      border: "1px solid var(--border)",
    }}
  >
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
        borderRadius: 6,
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
        background: "var(--muted)",
        border: "1px solid var(--border)",
        borderRadius: 8,
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

const ClientRequestTestDetail = () => {
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
      const response = await getClientRequestTestDetail(requestId);
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
      <div className="service client-request-test-detail-page">
        <div
          className="mb-3 pb-2 border-bottom"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            minHeight: 44,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--foreground)",
              fontSize: 14,
              fontWeight: 500,
              padding: 0,
              margin: 0,
              lineHeight: 1,
              height: 24,
            }}
          >
            <ArrowLeft size={18} />
            <span style={{ lineHeight: 1 }}>Back</span>
          </button>
          <div
            style={{
              height: 24,
              width: 1,
              backgroundColor: "var(--border)",
            }}
          />
          <h3
            className="fw-bold text-dark"
            style={{
              margin: 0,
              padding: 0,
              lineHeight: 1,
              display: "inline-flex",
              alignItems: "center",
              height: 24,
            }}
          >
            Request Details
          </h3>
        </div>

        {!loading && !detail && (
          <div
            className="bg-white p-4"
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              textAlign: "center",
              color: "var(--muted-foreground)",
            }}
          >
            No details available for this request.
          </div>
        )}

        {detail && (
          <>
            <Section title="Overview">
              <div className="row g-3">
                <div className="col-md-6">
                  <InfoRow label="Request ID" value={detail.requestId || "-"} />
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

export default ClientRequestTestDetail;
