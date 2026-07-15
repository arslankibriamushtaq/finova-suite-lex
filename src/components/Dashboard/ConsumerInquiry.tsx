import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ConsumerInquiryProps {
  simahData?: any;
}

const ConsumerInquiry = ({ simahData }: ConsumerInquiryProps) => {
  const { t } = useTranslation("dashboard");
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
      <div style={{ padding: "20px", textAlign: "center", color: "var(--foreground)" }}>
        {t("ci.noSimah")}
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
    <div style={{ padding: "20px", background: "var(--surface-card)", minHeight: "100vh" }}>
      {/* Score Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Score")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: expandedSections.Score ? "1px solid var(--surface-border)" : "none",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.score")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.Score ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Score && (
          <div>
            {scoreData ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Error</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Score</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>ScoreCardCode</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>ScoreCardDescAr</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>ScoreCardDesc</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Score Index</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                          {scoreData.error === null ? "--" : scoreData.error}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                          {scoreData.score || "--"}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                          {scoreData.scoreCard?.scoreCardCode || "--"}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                          {scoreData.scoreCard?.scoreCardDescAr || "--"}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                          {scoreData.scoreCard?.scoreCardDescEn || "--"}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                          {scoreData?.scoreIndex || "--"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.score") })}</div>
            )}
          </div>
        )}
      </div>
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("ReasonCodes")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.reasonCodes")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.ReasonCodes ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.ReasonCodes && (
          <div>
            {scoreData?.reasonCodes?.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Name</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Description AR</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Description EN</th>

                      </tr>
                    </thead>
                    <tbody>
                      {scoreData?.reasonCodes?.map((reasonCode: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {reasonCode?.scoreReasonCodeName || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {reasonCode?.scoreReasonCodeDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {reasonCode?.scoreReasonCodeDescEn || "--"}
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.contacts") })}</div>
            )}
          </div>
        )}
      </div>
      {/* Contacts Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Contacts")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.contacts")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.Contacts ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Contacts && (
          <div>
            {contacts.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Country</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Area Code</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Phone Number</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Extension</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Type Description EN</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Type Description AR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {contact.conCode || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {contact.conAreaCode || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {contact.conPhoneNumber || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {contact.conExtension || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {contact.conNumberTypes?.contactNumberTypeDescriptionEn || contact.conNumberTypes?.contactNumberTypeDescriptionAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {contact.conNumberTypes?.contactNumberTypeDescriptionAr || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.contacts") })}</div>
            )}
          </div>
        )}
      </div>

      {/* Addresses Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Addresses")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.addresses")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.Addresses ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Addresses && (
          <div>
            {addresses.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Type</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>City</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Postal Code</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>PO Box</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Address Line 1</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Date Loaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addresses.map((address: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {address.adrsAddressTypes?.addressNameEN || address.adrsAddressTypes?.addressNameAR || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {address.adrsCityDescEn || address.adrsCityDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {address.adrsPostalCode || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {address.adrsPOBox || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {address.adrsAddressLineFirstDescEn || address.adrsAddressLineFirstDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {address.adrsDateLoaded || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.addresses") })}</div>
            )}
          </div>
        )}
      </div>

      {/* Employers Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Employers")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.employers")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.Employers ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Employers && (
          <div>
            {employers.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Employer Name</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Occupation</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Status</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Income</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Total Income</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Date Loaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employers.map((employer: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {employer.empEmployerNameDescEn || employer.empEmployerNameDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {employer.empOccupationDescEn || employer.empOccupationDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {employer.empStatusType?.employerStatusTypeDescEn || employer.empStatusType?.employerStatusTypeDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {employer.empIncome || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {employer.empTotalIncome || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {employer.empDateLoaded || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.employers") })}</div>
            )}
          </div>
        )}
      </div>

      {/* Judgements Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("Judgements")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.judgements")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.Judgements ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.Judgements && (
          <div>
            {judgements.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Judgement Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {judgements.map((judgement: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {JSON.stringify(judgement)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.judgements") })}</div>
            )}
          </div>
        )}
      </div>

      {/* ReportDate Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("ReportDate")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.reportDate")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.ReportDate ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.ReportDate && (
          <div>
            <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
              <div style={{ fontSize: "12px", color: "var(--foreground)" }}>{reportDate}</div>
            </div>
          </div>
        )}
      </div>

      {/* DisclerText Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("DisclerText")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.disclerText")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.DisclerText ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.DisclerText && (
          <div>
            <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
              <div style={{ fontSize: "12px", color: "var(--foreground)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
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
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("SummaryInfo")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.summaryInfo")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.SummaryInfo ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.SummaryInfo && (
          <div>
            <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(summaryInfo).map(([key, value]: [string, any]) => (
                      <tr key={key} style={{ borderBottom: "1px solid var(--surface-border)" }}>
                        <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "var(--foreground)", width: "40%" }}>
                          {key}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
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
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("PrevEnquiries")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.prevEnquiries")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.PrevEnquiries ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.PrevEnquiries && (
          <div>
            {prevEnquiries.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Date</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Enquirer</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Member Ref</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Amount</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Product Type</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Enquiry Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prevEnquiries.map((enquiry: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {enquiry.prevEnqDate || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {enquiry.prevEnqEnquirer?.memberNameEN || enquiry.prevEnqEnquirer?.memberNameAR || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {enquiry.prevEnqMemberRef || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {enquiry.prevEnqAmount || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {enquiry.prevEnqProductTypeDesc?.textEn || enquiry.prevEnqProductTypeDesc?.textAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {enquiry.preEnqType?.enqTypeDescriptionEn || enquiry.preEnqType?.enqTypeDescriptionAr || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.prevEnquiries") })}</div>
            )}
          </div>
        )}
      </div>

      {/* PublicNotices Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("PublicNotices")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.publicNotices")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.PublicNotices ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.PublicNotices && (
          <div>
            {publicNotices.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Public Notice Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publicNotices.map((notice: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {JSON.stringify(notice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.publicNotices") })}</div>
            )}
          </div>
        )}
      </div>

      {/* ReportDetails Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("ReportDetails")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.reportDetails")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.ReportDetails ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.ReportDetails && (
          <div>
            <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(reportDetails).map(([key, value]: [string, any]) => (
                      <tr key={key} style={{ borderBottom: "1px solid var(--surface-border)" }}>
                        <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "var(--foreground)", width: "40%" }}>
                          {key}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
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
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("BouncedCheques")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.bouncedCheques")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.BouncedCheques ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.BouncedCheques && (
          <div>
            {bouncedCheques.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Bounced Cheque Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bouncedCheques.map((cheque: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {JSON.stringify(cheque)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.bouncedCheques") })}</div>
            )}
          </div>
        )}
      </div>

      {/* PrimaryDefaults Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("PrimaryDefaults")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.primaryDefaults")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.PrimaryDefaults ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.PrimaryDefaults && (
          <div>
            {primaryDefaults.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Creditor</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Account No</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Date Loaded</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Settled Date</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Status</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Original Amount</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Outstanding Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {primaryDefaults.map((defaultItem: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {defaultItem.pDefCreditor?.memberNameEN || defaultItem.pDefCreditor?.memberNameAR || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {defaultItem.pDefAccountNo || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {defaultItem.pDefDateLoaded || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {defaultItem.pDefSetteledDate || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {defaultItem.pDefaultStatuses?.defaultStatusDescEn || defaultItem.pDefaultStatuses?.defaultStatusDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {defaultItem.pDefOriginalAmount || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {defaultItem.pDefOutstandingBalance || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.primaryDefaults") })}</div>
            )}
          </div>
        )}
      </div>

      {/* MemberNarratives Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("MemberNarratives")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.memberNarratives")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.MemberNarratives ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.MemberNarratives && (
          <div>
            <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
              <div style={{ fontSize: "12px", color: "var(--foreground)" }}>
                {memberNarratives !== null && memberNarratives !== undefined ? JSON.stringify(memberNarratives) : t("ci.noData", { item: t("ci.memberNarratives") })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GuarantorDefaults Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("GuarantorDefaults")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.guarantorDefaults")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.GuarantorDefaults ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.GuarantorDefaults && (
          <div>
            <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
              <div style={{ fontSize: "12px", color: "var(--foreground)" }}>
                {guarantorDefaults !== null && guarantorDefaults !== undefined ? JSON.stringify(guarantorDefaults) : t("ci.noData", { item: t("ci.guarantorDefaults") })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PersonalNarratives Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("PersonalNarratives")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.personalNarratives")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.PersonalNarratives ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.PersonalNarratives && (
          <div>
            <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
              <div style={{ fontSize: "12px", color: "var(--foreground)" }}>
                {personalNarratives !== null && personalNarratives !== undefined ? JSON.stringify(personalNarratives) : t("ci.noData", { item: t("ci.personalNarratives") })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CreditInstrumentDetails Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("CreditInstrumentDetails")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.creditInstrumentDetails")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.CreditInstrumentDetails ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.CreditInstrumentDetails && (
          <div>
            {creditInstrumentDetails.length > 0 ? (
              <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--surface-border)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Creditor</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Account Number</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Product Type</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Status</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Limit</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Outstanding Balance</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Issued Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditInstrumentDetails.map((ci: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {ci.ciCreditor?.memberNameEN || ci.ciCreditor?.memberNameAR || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {ci.ciAccountNumber || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {ci.ciProductTypeDesc?.textEn || ci.ciProductTypeDesc?.textAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {ci.ciStatus?.creditInstrumentStatusDescEn || ci.ciStatus?.creditInstrumentStatusDescAr || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {ci.ciLimit || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {ci.ciOutstandingBalance || "--"}
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
                            {ci.ciIssuedDate || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px", color: "var(--muted-foreground)" }}>{t("ci.noData", { item: t("ci.creditInstrumentDetails") })}</div>
            )}
          </div>
        )}
      </div>

      {/* ProvidedDemographicsInfo Section */}
      <div style={{ border: "1px solid var(--surface-border)", borderRadius: "2px", marginBottom: "10px" }}>
        <div
          onClick={() => toggleSection("ProvidedDemographicsInfo")}
          style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{t("ci.providedDemographicsInfo")}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {expandedSections.ProvidedDemographicsInfo ? "▲" : "▼"}
          </span>
        </div>
        {expandedSections.ProvidedDemographicsInfo && (
          <div>
            <div style={{ padding: "16px", background: "var(--surface-card-alt)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(providedDemographicsInfo).map(([key, value]: [string, any]) => (
                      <tr key={key} style={{ borderBottom: "1px solid var(--surface-border)" }}>
                        <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "var(--foreground)", width: "40%" }}>
                          {key}
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--foreground)" }}>
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
