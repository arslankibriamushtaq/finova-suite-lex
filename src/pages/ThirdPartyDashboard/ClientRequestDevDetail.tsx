import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("connector");
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
        error?.response?.data?.message || error?.message || t("detail.toast.fetchFailed")
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
            {t("detail.title")}
          </h3>
          <Button
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={16} />}
            style={{ height: 36, borderRadius: 2, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {t("common:back")}
          </Button>
        </div>

        {!loading && !detail && (
          <div className="pro-card p-4 text-center" style={{ color: "var(--muted-foreground)" }}>
            {t("detail.noDetails")}
          </div>
        )}

        {detail && (
          <>
            <Section title={t("detail.section.overview")}>
              <div className="row g-3">
                <div className="col-md-6">
                  <InfoRow label={t("detail.label.requestId")} value={detail.requestId || detail.id || "-"} />
                  <InfoRow label={t("detail.label.apiCode")} value={detail.apiCode || "-"} />
                  <InfoRow label={t("detail.label.client")} value={detail.clientName || detail.client?.name || "-"} />
                  <InfoRow label={t("detail.label.service")} value={detail.serviceName || detail.service?.name || detail.serviceId || "-"} />
                  <InfoRow label={t("detail.label.api")} value={detail.apiName || detail.api?.name || detail.endpoint || "-"} />
                </div>
                <div className="col-md-6">
                  <InfoRow label={t("detail.label.method")} value={detail.httpMethod || detail.method || "-"} />
                  <InfoRow label={t("detail.label.status")} value={<StatusPill status={detail.responseStatus ?? detail.statusCode ?? detail.status} />} />
                  <InfoRow label={t("detail.label.mobilePhone")} value={detail.mobilePhone || detail.mobile || detail.phone || detail.phoneNumber || "-"} />
                  <InfoRow label={t("detail.label.nid")} value={detail.nid || detail.nationalId || "-"} />
                  <InfoRow label={t("detail.label.createdAt")} value={formatDateTime(detail.createdAt || detail.requestedAt || detail.timestamp)} />
                </div>
              </div>
            </Section>

            {(detail.endpoint || detail.url || detail.path) && (
              <Section title={t("detail.section.endpoint")}>
                <InfoRow label={t("detail.label.url")} value={detail.endpoint || detail.url || detail.path} />
                {detail.host && <InfoRow label={t("detail.label.host")} value={detail.host} />}
                {detail.environment && <InfoRow label={t("detail.label.environment")} value={detail.environment} />}
                {detail.duration != null && <InfoRow label={t("detail.label.duration")} value={detail.duration} />}
              </Section>
            )}

            {(detail.requestHeaders || detail.requestBody || detail.request) && (
              <Section title={t("detail.section.request")}>
                {detail.requestHeaders && (
                  <div className="mb-3">
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>{t("detail.headers")}</div>
                    <JsonBlock value={detail.requestHeaders} />
                  </div>
                )}
                {(detail.requestBody || detail.request) && (
                  <div>
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>{t("detail.body")}</div>
                    <JsonBlock value={detail.requestBody ?? detail.request} />
                  </div>
                )}
              </Section>
            )}

            {(detail.responseHeaders || detail.responseBody || detail.response) && (
              <Section title={t("detail.section.response")}>
                {detail.responseHeaders && (
                  <div className="mb-3">
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>{t("detail.headers")}</div>
                    <JsonBlock value={detail.responseHeaders} />
                  </div>
                )}
                {(detail.responseBody || detail.response) && (
                  <div>
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>{t("detail.body")}</div>
                    <JsonBlock value={detail.responseBody ?? detail.response} />
                  </div>
                )}
              </Section>
            )}

            {detail.errorMessage && (
              <Section title={t("detail.section.error")}>
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
