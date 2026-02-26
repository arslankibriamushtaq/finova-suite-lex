import { useState } from "react";

interface ConsumerInquiryProps {
  simahData?: any;
}

const ConsumerInquiry = ({ simahData }: ConsumerInquiryProps) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    Score: true, // Score section expanded by default
    Contacts: false,
    ReasonCodes: false,
    Addresses: false,
    Employers: false,
    Judgements: false,
    ReportDate: false,
    DisclerText: false,
    SummaryInfo: false,
    PrevEnquiries: false,
    PublicNotices: false,
    ReportDetails: false,
    BouncedCheques: false,
    PrimaryDefaults: false,
    MemberNarratives: false,
    GuarantorDefaults: false,
    PersonalNarratives: false,
    CreditInstrumentDetails: false,
    ProvidedDemographicsInfo: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!simahData) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#000" }}>
        No SIMAH data available
      </div>
    );
  }

  // Extract data from SIMAH response
  const scoreData = simahData.score?.[0] || null;
  const contacts = simahData.contacts || [];
  const reasonCodes = simahData.reasonCodes || [];
  const addresses = simahData.addresses || [];
  const employers = simahData.employers || [];
  const judgements = simahData.judgements || [];
  const reportDate = simahData.reportDate || "-";
  const disclerText = simahData.disclerText || {};
  const summaryInfo = simahData.summaryInfo || {};
  const prevEnquiries = simahData.prevEnquiries || [];
  const publicNotices = simahData.publicNotices || [];
  const reportDetails = simahData.reportDetails || {};
  const bouncedCheques = simahData.bouncedCheques || [];
  const primaryDefaults = simahData.primaryDefaults || [];
  const memberNarratives = simahData.memberNarratives;
  const guarantorDefaults = simahData.guarantorDefaults;
  const personalNarratives = simahData.personalNarratives;
  const creditInstrumentDetails = simahData.creditInstrumentDetails || [];
  const providedDemographicsInfo = simahData.providedDemographicsInfo || {};

  return (
    <div style={{ padding: "20px", background: "#fff", minHeight: "100vh" }}>
      {/* Score Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Score")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: expandedSections.Score ? "1px solid #E5E7EB" : "none",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>Score</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.Score ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Score && (
          <div>
            {scoreData ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Error</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Score</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>ScoreCardCode</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>ScoreCardDescAr</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>ScoreCardDesc</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Score Index</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {scoreData.error === null ? "--" : scoreData.error}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {scoreData.score || "--"}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {scoreData.scoreCard?.scoreCardCode || "--"}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {scoreData.scoreCard?.scoreCardDescAr || "--"}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {scoreData.scoreCard?.scoreCardDescEn || "--"}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {scoreData?.scoreIndex || "--"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No score data available</div>
            )}
          </div>
        )}
      </div>
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("ReasonCodes")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>Reason Codes</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.ReasonCodes ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.ReasonCodes && (
          <div>
            {scoreData?.reasonCodes?.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Name</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Description AR</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Description EN</th>

                      </tr>
                    </thead>
                    <tbody>
                      {scoreData?.reasonCodes?.map((reasonCode: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {reasonCode?.scoreReasonCodeName || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {reasonCode?.scoreReasonCodeDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {reasonCode?.scoreReasonCodeDescEn || "--"}
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No contacts data available</div>
            )}
          </div>
        )}
      </div>
      {/* Contacts Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Contacts")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>Contacts</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.Contacts ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Contacts && (
          <div>
            {contacts.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Country</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Area Code</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Phone Number</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Extension</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Type Description EN</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Type Description AR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {contact.conCode || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {contact.conAreaCode || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {contact.conPhoneNumber || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {contact.conExtension || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {contact.conNumberTypes?.contactNumberTypeDescriptionEn || contact.conNumberTypes?.contactNumberTypeDescriptionAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {contact.conNumberTypes?.contactNumberTypeDescriptionAr || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No contacts data available</div>
            )}
          </div>
        )}
      </div>

      {/* Addresses Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Addresses")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>Addresses</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.Addresses ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Addresses && (
          <div>
            {addresses.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Type</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>City</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Postal Code</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>PO Box</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Address Line 1</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Date Loaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addresses.map((address: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {address.adrsAddressTypes?.addressNameEN || address.adrsAddressTypes?.addressNameAR || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {address.adrsCityDescEn || address.adrsCityDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {address.adrsPostalCode || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {address.adrsPOBox || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {address.adrsAddressLineFirstDescEn || address.adrsAddressLineFirstDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {address.adrsDateLoaded || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No addresses data available</div>
            )}
          </div>
        )}
      </div>

      {/* Employers Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Employers")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>Employers</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.Employers ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Employers && (
          <div>
            {employers.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Employer Name</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Occupation</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Status</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Income</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Total Income</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Date Loaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employers.map((employer: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {employer.empEmployerNameDescEn || employer.empEmployerNameDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {employer.empOccupationDescEn || employer.empOccupationDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {employer.empStatusType?.employerStatusTypeDescEn || employer.empStatusType?.employerStatusTypeDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {employer.empIncome || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {employer.empTotalIncome || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {employer.empDateLoaded || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No employers data available</div>
            )}
          </div>
        )}
      </div>

      {/* Judgements Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Judgements")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>Judgements</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.Judgements ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Judgements && (
          <div>
            {judgements.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Judgement Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {judgements.map((judgement: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {JSON.stringify(judgement)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No judgements data available</div>
            )}
          </div>
        )}
      </div>

      {/* ReportDate Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("ReportDate")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>ReportDate</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.ReportDate ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.ReportDate && (
          <div>
            <div style={{ padding: "16px", background: "#F9FAFB" }}>
              <div style={{ fontSize: "12px", color: "#000" }}>{reportDate}</div>
            </div>
          </div>
        )}
      </div>

      {/* DisclerText Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("DisclerText")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>DisclerText</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.DisclerText ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.DisclerText && (
          <div>
            <div style={{ padding: "16px", background: "#F9FAFB" }}>
              <div style={{ fontSize: "12px", color: "#000", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                <div style={{ marginBottom: "12px" }}>
                  <strong>English:</strong>
                  <div style={{ marginTop: "4px" }}>{disclerText.discTextDescEn || "--"}</div>
                </div>
                <div>
                  <strong>Arabic:</strong>
                  <div style={{ marginTop: "4px" }}>{disclerText.discTextDescAr || "--"}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SummaryInfo Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("SummaryInfo")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>SummaryInfo</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.SummaryInfo ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.SummaryInfo && (
          <div>
            <div style={{ padding: "16px", background: "#F9FAFB" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(summaryInfo).map(([key, value]: [string, any]) => (
                      <tr key={key} style={{ borderBottom: "1px solid #E5E7EB" }}>
                        <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "#000", width: "40%" }}>
                          {key}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {value !== null && value !== undefined ? String(value) : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PrevEnquiries Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("PrevEnquiries")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>PrevEnquiries</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.PrevEnquiries ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.PrevEnquiries && (
          <div>
            {prevEnquiries.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Date</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Enquirer</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Member Ref</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Amount</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Product Type</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Enquiry Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prevEnquiries.map((enquiry: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {enquiry.prevEnqDate || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {enquiry.prevEnqEnquirer?.memberNameEN || enquiry.prevEnqEnquirer?.memberNameAR || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {enquiry.prevEnqMemberRef || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {enquiry.prevEnqAmount || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {enquiry.prevEnqProductTypeDesc?.textEn || enquiry.prevEnqProductTypeDesc?.textAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {enquiry.preEnqType?.enqTypeDescriptionEn || enquiry.preEnqType?.enqTypeDescriptionAr || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No previous enquiries data available</div>
            )}
          </div>
        )}
      </div>

      {/* PublicNotices Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("PublicNotices")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>PublicNotices</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.PublicNotices ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.PublicNotices && (
          <div>
            {publicNotices.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Public Notice Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publicNotices.map((notice: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {JSON.stringify(notice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No public notices data available</div>
            )}
          </div>
        )}
      </div>

      {/* ReportDetails Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("ReportDetails")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>ReportDetails</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.ReportDetails ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.ReportDetails && (
          <div>
            <div style={{ padding: "16px", background: "#F9FAFB" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(reportDetails).map(([key, value]: [string, any]) => (
                      <tr key={key} style={{ borderBottom: "1px solid #E5E7EB" }}>
                        <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "#000", width: "40%" }}>
                          {key}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {value !== null && value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BouncedCheques Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("BouncedCheques")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>BouncedCheques</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.BouncedCheques ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.BouncedCheques && (
          <div>
            {bouncedCheques.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Bounced Cheque Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bouncedCheques.map((cheque: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {JSON.stringify(cheque)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No bounced cheques data available</div>
            )}
          </div>
        )}
      </div>

      {/* PrimaryDefaults Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("PrimaryDefaults")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>PrimaryDefaults</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.PrimaryDefaults ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.PrimaryDefaults && (
          <div>
            {primaryDefaults.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Creditor</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Account No</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Date Loaded</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Settled Date</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Status</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Original Amount</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Outstanding Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {primaryDefaults.map((defaultItem: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {defaultItem.pDefCreditor?.memberNameEN || defaultItem.pDefCreditor?.memberNameAR || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {defaultItem.pDefAccountNo || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {defaultItem.pDefDateLoaded || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {defaultItem.pDefSetteledDate || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {defaultItem.pDefaultStatuses?.defaultStatusDescEn || defaultItem.pDefaultStatuses?.defaultStatusDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {defaultItem.pDefOriginalAmount || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {defaultItem.pDefOutstandingBalance || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No primary defaults data available</div>
            )}
          </div>
        )}
      </div>

      {/* MemberNarratives Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("MemberNarratives")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>MemberNarratives</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.MemberNarratives ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.MemberNarratives && (
          <div>
            <div style={{ padding: "16px", background: "#F9FAFB" }}>
              <div style={{ fontSize: "12px", color: "#000" }}>
                {memberNarratives !== null && memberNarratives !== undefined ? JSON.stringify(memberNarratives) : "No member narratives data available"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GuarantorDefaults Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("GuarantorDefaults")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>GuarantorDefaults</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.GuarantorDefaults ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.GuarantorDefaults && (
          <div>
            <div style={{ padding: "16px", background: "#F9FAFB" }}>
              <div style={{ fontSize: "12px", color: "#000" }}>
                {guarantorDefaults !== null && guarantorDefaults !== undefined ? JSON.stringify(guarantorDefaults) : "No guarantor defaults data available"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PersonalNarratives Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("PersonalNarratives")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>PersonalNarratives</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.PersonalNarratives ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.PersonalNarratives && (
          <div>
            <div style={{ padding: "16px", background: "#F9FAFB" }}>
              <div style={{ fontSize: "12px", color: "#000" }}>
                {personalNarratives !== null && personalNarratives !== undefined ? JSON.stringify(personalNarratives) : "No personal narratives data available"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CreditInstrumentDetails Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("CreditInstrumentDetails")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>CreditInstrumentDetails</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.CreditInstrumentDetails ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.CreditInstrumentDetails && (
          <div>
            {creditInstrumentDetails.length > 0 ? (
              <div style={{ padding: "16px", background: "#F9FAFB" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Creditor</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Account Number</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Product Type</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Status</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Limit</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Outstanding Balance</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#000" }}>Issued Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditInstrumentDetails.map((ci: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {ci.ciCreditor?.memberNameEN || ci.ciCreditor?.memberNameAR || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {ci.ciAccountNumber || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {ci.ciProductTypeDesc?.textEn || ci.ciProductTypeDesc?.textAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {ci.ciStatus?.creditInstrumentStatusDescEn || ci.ciStatus?.creditInstrumentStatusDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {ci.ciLimit || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {ci.ciOutstandingBalance || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                            {ci.ciIssuedDate || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "#666" }}>No credit instrument details data available</div>
            )}
          </div>
        )}
      </div>

      {/* ProvidedDemographicsInfo Section */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("ProvidedDemographicsInfo")}
          style={{
            padding: "12px 16px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#000", fontSize: "14px" }}>ProvidedDemographicsInfo</span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {expandedSections.ProvidedDemographicsInfo ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.ProvidedDemographicsInfo && (
          <div>
            <div style={{ padding: "16px", background: "#F9FAFB" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(providedDemographicsInfo).map(([key, value]: [string, any]) => (
                      <tr key={key} style={{ borderBottom: "1px solid #E5E7EB" }}>
                        <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "#000", width: "40%" }}>
                          {key}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "#000" }}>
                          {value !== null && value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerInquiry;
