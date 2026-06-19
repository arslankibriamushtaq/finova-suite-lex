import { useEffect, useState } from "react";
import { getTicketDetails } from "../../../redux/apis/apisCrudCms";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { formatDate } from "../../../App";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTicketDetailsData();
  }, []);

  const getTicketDetailsData = async () => {
    try {
      setLoading(true);
      const response = await getTicketDetails(id);
      if (response) {
        setTicketDetails(response?.data?.data?.ticket);
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!ticketDetails) {
    return null;
  }

  const InfoRowGrid = ({ label, value, style }: { label: string; value: any; style?: any }) => (
    <div style={{ ...style }}>
      <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "14px" }}>{value || "---"}</div>
    </div>
  );

  return (
    <div style={{ padding: "0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "2px",
            border: "1px solid var(--color-border-light)",
          }}
        />
        <h1 style={{ fontSize: "28px", fontWeight: 600, margin: 0 }}>Details</h1>
      </div>

      {/* Customer Detail Section */}
      <div
        style={{
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "2px",
          padding: "24px",
          marginBottom: "24px",
          backgroundColor: "var(--background)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px",textAlign:"left" }}>Customer Detail</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <InfoRowGrid label="Complainer Name" value={ticketDetails?.customer?.name} />
          <InfoRowGrid label="Email" value={ticketDetails?.customer?.email} />
          <InfoRowGrid label="Contact No" value={ticketDetails?.customer?.contact_no} />
          <InfoRowGrid label="Country" value={ticketDetails?.customer?.country || "---"} />
          <InfoRowGrid label="Iqama No" value={ticketDetails?.customer?.iqama_no || "---"} />
          <InfoRowGrid label="Registration Date" value={ticketDetails?.customer?.created_at ? formatDate(ticketDetails.customer.created_at) : "---"} />
          <InfoRowGrid label="Company Name" value={ticketDetails?.customer?.company_name || "---"} />
          <InfoRowGrid label="Complain type" value={ticketDetails?.category?.title || "---"} />
          <InfoRowGrid label="DOB" value={ticketDetails?.customer?.dob || "---"} />
        </div>
      </div>

      {/* Customer Loan Info Section */}
      <div
        style={{
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "2px",
          padding: "24px",
          marginBottom: "24px",
          backgroundColor: "var(--background)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px",textAlign:"left" }}>Customer Loan Info</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <InfoRowGrid label="Loan Application Number" value={ticketDetails?.customer?.loan_application_number || "---"} />
          <InfoRowGrid label="Loan Amount" value={ticketDetails?.customer?.loan_amount || "---"} />
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>Check Invoices</div>
            <Button type="primary" style={{ backgroundColor: "#4A90E2", borderColor: "#4A90E2" }}>
              View Invoices
            </Button>
          </div>
        </div>
      </div>

      {/* Ticket Created By Section */}
      <div
        style={{
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "2px",
          padding: "24px",
          marginBottom: "24px",
          backgroundColor: "var(--background)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px",textAlign:"left" }}>Ticket Created By</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <InfoRowGrid label="Name" value={ticketDetails?.created_by?.name} />
          <InfoRowGrid label="Email" value={ticketDetails?.created_by?.email || "---"} />
          <InfoRowGrid label="Contact No" value={ticketDetails?.created_by?.contact_no || "---"} />
          <InfoRowGrid label="Country" value={ticketDetails?.created_by?.country || "---"} />
          <InfoRowGrid label="Iqama No" value={ticketDetails?.created_by?.iqama_no || "---"} />
          <InfoRowGrid label="Registration Date" value={ticketDetails?.created_by?.created_at ? formatDate(ticketDetails.created_by.created_at) : "---"} />
          <InfoRowGrid label="Company Name" value={ticketDetails?.company?.name || "---"} />
          <InfoRowGrid label="Complain type" value={ticketDetails?.category?.title || "---"} />
          <InfoRowGrid label="Ticket created at" value={formatDate(ticketDetails?.created_at)} />
        </div>
      </div>

      {/* Ticket Details Section */}
      <div
        style={{
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "2px",
          padding: "24px",
          marginBottom: "24px",
          backgroundColor: "var(--background)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px",textAlign:"left" }}>Ticket Details</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>Images</div>
            {ticketDetails?.images && ticketDetails.images.length > 0 ? (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {ticketDetails.images.map((image: any, index: number) => (
                  <Image
                    key={index}
                    src={image.url || image}
                    alt={`Ticket image ${index + 1}`}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover", borderRadius: "2px" }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "14px", color: "var(--color-text-subtle)" }}>No images available</div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>Description</div>
            <div style={{ fontSize: "14px" }}>{ticketDetails?.description || "No description available"}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>User Feedback</div>
            <div style={{ fontSize: "14px" }}>{ticketDetails?.user_feedback || "Ticket is not rated yet."}</div>
          </div>
        </div>
      </div>

      {/* Escalation History Section */}
      <div
        style={{
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "2px",
          padding: "24px",
          backgroundColor: "var(--background)",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "20px",
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "#fff",
            borderRadius: "2px",
            display: "inline-block",
          }}
        >
          Escalation History
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderRight: "1px solid var(--color-border-subtle)",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Comments
          </div>
          <div style={{ padding: "16px", fontWeight: 600, fontSize: "14px" }}>Ticket Escalated At</div>
          {ticketDetails?.escalation_histories && ticketDetails.escalation_histories.length > 0 ? (
            ticketDetails.escalation_histories.map((history: any, index: number) => (
              <>
                <div
                  key={`comment-${index}`}
                  style={{
                    padding: "16px",
                    borderRight: "1px solid var(--color-border-subtle)",
                    borderTop: "1px solid var(--color-border-subtle)",
                    fontSize: "14px",
                  }}
                >
                  {history.comment || "No Comment Available"}
                </div>
                <div
                  key={`date-${index}`}
                  style={{
                    padding: "16px",
                    borderTop: "1px solid var(--color-border-subtle)",
                    fontSize: "14px",
                  }}
                >
                  {history.created_at ? formatDate(history.created_at) : "----------"}
                </div>
              </>
            ))
          ) : (
            <>
              <div
                style={{
                  padding: "16px",
                  borderRight: "1px solid var(--color-border-subtle)",
                  borderTop: "1px solid var(--color-border-subtle)",
                  fontSize: "14px",
                }}
              >
                No Comment Available
              </div>
              <div
                style={{
                  padding: "16px",
                  borderTop: "1px solid var(--color-border-subtle)",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ----------
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;