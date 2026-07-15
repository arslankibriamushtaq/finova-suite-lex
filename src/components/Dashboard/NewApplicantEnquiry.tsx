import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TableView from "../TableView/TableView";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const NewApplicantEnquiry = () => {
  const { t } = useTranslation("dashboard");
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [naeData, setNaeData] = useState<any>(null);

  useEffect(() => {
    fetchNaeData();
  }, [id]);

  const fetchNaeData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, "bayan_nae");
      setNaeData(response.data?.data || {});
    } catch (error: any) {
      console.error("Error fetching NAE data:", error);
      toast.error(error?.response?.data?.message || t("nae.toast.fetchFailed"));
      setNaeData({});
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    return key
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to check if value is a simple value
  const isSimpleValue = (value: any): boolean => {
    return value === null || value === undefined || 
           typeof value === 'string' || 
           typeof value === 'number' || 
           typeof value === 'boolean';
  };

  // Helper function to convert object to two-column format dynamically
  const convertToTwoColumns = (data: any) => {
    if (!data || typeof data !== 'object') return { leftColumn: [], rightColumn: [] };
    
    const entries = Object.entries(data).filter(([_, value]) => isSimpleValue(value));
    const midPoint = Math.ceil(entries.length / 2);
    
    return {
      leftColumn: entries.slice(0, midPoint).map(([key, value]) => ({
        label: formatFieldName(key),
        value: value?.toString() || "N/A"
      })),
      rightColumn: entries.slice(midPoint).map(([key, value]) => ({
        label: formatFieldName(key),
        value: value?.toString() || "N/A"
      }))
    };
  };

  // Helper function to render tables dynamically
  const renderTable = (data: any[], sectionTitle: string) => {
    const hasData = data && Array.isArray(data) && data.length > 0;

    const headers = hasData ? Object.keys(data[0]).map((key) => ({
      name: formatFieldName(key),
      selector: (row: any) => row[key] || "N/A",
      sortable: true,
      grow: key.includes('name') || key.includes('description') || key.includes('address') ? 2 : undefined,
    })) : [];

    return (
      <div className="p-4 mt-4" style={{ backgroundColor: "#F8F8F8" }}>
        <div className="p-3 mb-3" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
          {sectionTitle}
        </div>
        {hasData ? (
          <TableView className="mt-3" header={headers} data={data} />
        ) : (
          <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
            {t("common:noData")}
          </div>
        )}
      </div>
    );
  };

  // Helper function to render two-column sections with empty state
  const renderTwoColumnSection = (data: any, sectionTitle: string, bgColor: string = "#000000") => {
    const hasData = data && (data.leftColumn?.length > 0 || data.rightColumn?.length > 0);

    return (
      <div className="px-4 mt-4" style={{ backgroundColor: "#F8F8F8" }}>
        <div className="p-3 mb-3" style={{ backgroundColor: bgColor, color: "white", fontWeight: "600" }}>
          {sectionTitle}
        </div>
        {hasData ? (
          <div className="row">
            <div className="col-6">
              {data.leftColumn?.map((detail: any, i: any) => (
                <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                  <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                    {detail.label}
                  </p>
                  <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="col-6">
              {data.rightColumn?.map((detail: any, i: any) => (
                <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                  <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                    {detail.label}
                  </p>
                  <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
            {t("common:noData")}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <Loader />;
  }
  // Dynamic section data
  const identificationData = convertToTwoColumns(naeData?.identification);

  const highlightsData = convertToTwoColumns(naeData?.highlights);
  const mainHQRData = convertToTwoColumns(naeData?.main_hqr);
  const sicCodeDescriptionData = convertToTwoColumns(naeData?.sic_code_description);
  const relevantEventsData = convertToTwoColumns(naeData?.relevant_events);

  // Table data - all dynamically rendered
  const registrationStatusData = naeData?.history_registration_status && Array.isArray(naeData.history_registration_status) ? naeData.history_registration_status : [];
  const companyNamesData = naeData?.history_company_names && Array.isArray(naeData.history_company_names) ? naeData.history_company_names : [];
  const registeredAddressData = naeData?.history_registered_address && Array.isArray(naeData.history_registered_address) ? naeData.history_registered_address : [];
  const legalFormData = naeData?.history_legal_form && Array.isArray(naeData.history_legal_form) ? naeData.history_legal_form : [];
  const capitalAmountData = naeData?.history_capital_amount && Array.isArray(naeData.history_capital_amount) ? naeData.history_capital_amount : [];
  const managementShareholdersData = naeData?.history_management_shareholders && Array.isArray(naeData.history_management_shareholders) ? naeData.history_management_shareholders : [];
  const summaryCategoryData = naeData?.summary_category && Array.isArray(naeData.summary_category) ? naeData.summary_category : [];

  // Process related companies groups from API
  const apiRelatedCompanies = naeData?.related_companies && Array.isArray(naeData.related_companies) ? naeData.related_companies : [];
  
  const relatedCompanies1 = apiRelatedCompanies[0] || { 
    personName: "عبداللطيف عبدالعزيز الراجحي--", 
    data: [] 
  };
  const relatedCompanies2 = apiRelatedCompanies[1] || { 
    personName: "سليمان عبدالعزيز صلاح التويجري--", 
    data: [] 
  };
  const relatedCompanies3 = apiRelatedCompanies[2] || { 
    personName: "عبدالعزيز صالح عبدالله الرقيب--", 
    data: [] 
  };
  const relatedCompanies4 = apiRelatedCompanies[3] || { 
    personName: "عبدالعزيز بن محمد بن حمد الرقيب--", 
    data: [] 
  };

  // Branches Information Data - Fully dynamic
  const apiBranches = naeData?.branches && Array.isArray(naeData.branches) ? naeData.branches : [];
  
  // Convert each branch to two-column format dynamically
  const branchesData = apiBranches.map((branch: any) => {
    // Extract branch name if available
    const branchName = branch?.branch_name || branch?.name || branch?.branchName || "Branch Information";
    
    // Convert the branch object to two columns dynamically
    const branchFields = convertToTwoColumns(branch);
    
    return {
      branchName,
      leftColumn: branchFields.leftColumn,
      rightColumn: branchFields.rightColumn
    };
  });

  const subjectDataFromContributors = convertToTwoColumns(naeData?.subject_data);

  // Contact Data - Process API data dynamically
  const apiContacts = naeData?.contact_data && Array.isArray(naeData.contact_data) ? naeData.contact_data : [];
  
  const contactData = apiContacts.map((contact: any) => {
    const date = contact?.date || contact?.last_update_date || "N/A";
    const entries = Object.entries(contact).filter(([key]) => key !== 'date' && key !== 'last_update_date');
    return { date, fields: entries };
  });

  const keyValuesData = convertToTwoColumns(naeData?.key_values);

  return (
    <>
      <div className="d-flex flex-column gap-2" style={{ backgroundColor: "#FFF8", padding: "20px" }}>
        {/* Fetch New Record Button */}
        <div className="d-flex justify-content-end align-items-center mb-3">
          <button className="theme-btn-next">{t("bayaanReport.fetchNewRecord")}</button>
        </div>

        <div className="profile-sec mt-3 mb-3">
          <div className="row g-3 align-items-center account-card">
            <div className="col-12">
              {/* Business Highlights Heading */}
              <div className="px-4">
              <h6 className="mb-2 px-3 py-3" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                {t("nae.businessHighlights")}
              </h6>
              </div>
              {/* Identification Section */}
              {renderTwoColumnSection(identificationData, t("nae.identification"))}

              {/* Highlights Section */}
              {renderTwoColumnSection(highlightsData, t("nae.highlights"))}

              {/* MAIN HQR Section */}
              <div className="p-4 mt-4" style={{ backgroundColor: "#F8F8F8" }}>
                <div className="p-3 mb-3" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
                  {t("nae.mainHqr")}
                </div>
                {mainHQRData && (mainHQRData.leftColumn?.length > 0 || mainHQRData.rightColumn?.length > 0) ? (
                  <>
                    <div className="row">
                      <div className="col-6">
                        {mainHQRData.leftColumn.map((detail, i) => (
                          <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                            <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                              {detail.label}
                            </p>
                            <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                              {detail.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="col-6">
                        {mainHQRData.rightColumn.map((detail, i) => (
                          <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                            <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                              {detail.label}
                            </p>
                            <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                              {detail.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SIC Code Description */}
                    {sicCodeDescriptionData && (sicCodeDescriptionData.leftColumn?.length > 0 || sicCodeDescriptionData.rightColumn?.length > 0) && (
                      <div className="row mt-3">
                        <div className="col-6">
                          {sicCodeDescriptionData.leftColumn.map((detail, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                                {detail.label}
                              </p>
                              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                                {detail.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="col-6">
                          {sicCodeDescriptionData.rightColumn.map((detail, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                                {detail.label}
                              </p>
                              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                                {detail.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
                    {t("common:noData")}
                  </div>
                )}
              </div>

              {/* Relevant Events Section */}
              <div className="px-4">
              <h6 className="mb-4 px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                {t("nae.relevantEvents")}
              </h6>
              
              {relevantEventsData && (relevantEventsData.leftColumn?.length > 0 || relevantEventsData.rightColumn?.length > 0) ? (
                <div className="row">
                  <div className="col-6">
                    {relevantEventsData.leftColumn.map((detail, i) => (
                      <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                        <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                          {detail.label}
                        </p>
                        <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="col-6">
                    {relevantEventsData.rightColumn.map((detail, i) => (
                      <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                        <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                          {detail.label}
                        </p>
                        <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
                  {t("common:noData")}
                </div>
              )}
              </div>
              {/* All history tables rendered dynamically */}
              {renderTable(registrationStatusData, t("nae.historyRegistrationStatus"))}
              {renderTable(companyNamesData, t("nae.historyCompanyNames"))}
              {renderTable(registeredAddressData, t("nae.historyRegisteredAddress"))}
              {renderTable(legalFormData, t("nae.historyLegalForm"))}
              {renderTable(capitalAmountData, t("nae.historyCapitalAmount"))}
              {renderTable(managementShareholdersData, t("nae.historyManagementShareholders"))}

              {/* Business Relations Heading */}
              <div className="px-4">
              <h6 className="px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                {t("nae.businessRelations")}
              </h6>
              </div>
              {/* Related Companies Section */}
              <div className="px-4 mt-3" style={{ backgroundColor: "#F8F8F8" }}>
                <div className="p-3 mb-4" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
                  {t("nae.relatedCompanies")}
                </div>

                {/* Related companies rendered dynamically */}
                {[relatedCompanies1, relatedCompanies2, relatedCompanies3, relatedCompanies4].map((relComp, idx) => (
                  <div key={idx}>
                    <h6 className="mt-4 mb-2 px-3 py-3" style={{ color: "#000000", fontWeight: "600", backgroundColor: "rgb(240, 240, 240)" }}>
                      {relComp.personName}
                    </h6>
                    {relComp.data && relComp.data.length > 0 ? (
                      renderTable(relComp.data, "")
                    ) : (
                      <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
                        {t("common:noData")}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Operations Heading */}
              <div className="px-4">
              <h6 className="px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                {t("nae.operations")}
              </h6>
              </div>
              {/* Branches Information Section */}
              <div className="px-4 mt-3" style={{ backgroundColor: "#F8F8F8" }}>
                <div className="p-3 mb-4" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
                  {t("nae.branchesInformation")}
                </div>

                {branchesData.length > 0 ? (
                  branchesData.map((branch: any, idx: any) => (
                    <div key={idx} className="mb-5">
                      <h6 className="mb-3 px-3 py-3" style={{ color: "#000000", fontWeight: "600", backgroundColor: "rgb(240, 240, 240)" }}>
                        {branch.branchName}
                      </h6>
                      <div className="row">
                        <div className="col-6">
                          {branch.leftColumn.map((detail: any, i: any) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                                {detail.label}
                              </p>
                              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                                {detail.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="col-6">
                          {branch.rightColumn.map((detail: any, i: any) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                                {detail.label}
                              </p>
                              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                                {detail.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
                    {t("nae.noBranches")}
                  </div>
                )}
              </div>

              {/* Subject Heading */}
              <div className="px-4">
              <h6 className="px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                {t("nae.subject")}
              </h6>
              </div>

              {/* Subject Data from Contributors Section */}
              {renderTwoColumnSection(subjectDataFromContributors, t("nae.subjectData"))}

              {/* Contact Data Heading */}
              <div className="px-4">
              <h6 className="px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                {t("nae.contactData")}
              </h6>
              </div>
               {contactData.length > 0 ? contactData.map((contact: any, idx: any) => {
                 const midPoint = Math.ceil(contact.fields.length / 2);
                 const leftFields = contact.fields.slice(0, midPoint);
                 const rightFields = contact.fields.slice(midPoint);

  return (
                 <div key={idx} className="px-4 mt-3" style={{ backgroundColor: "#F8F8F8" }}>
                   <div className="p-3 mb-3" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
                     {contact.date}
                   </div>
                   <div className="row">
                     <div className="col-6">
                       {leftFields.map(([key, value]: [string, any], i: number) => (
                       <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                         <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>{formatFieldName(key)}</p>
                         <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                           {value?.toString() || "N/A"}
                         </span>
                       </div>
                       ))}
                     </div>
                     <div className="col-6">
                       {rightFields.map(([key, value]: [string, any], i: number) => (
                       <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                         <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                           {formatFieldName(key)}
                         </p>
                         <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                           {value?.toString() || "N/A"}
                         </span>
          </div>
        ))}
      </div>
    </div>
                 </div>
                 );
               }) : (
                <div className="px-4 mt-3 p-3 text-center" style={{ backgroundColor: "#F8F8F8", color: "#6C6C6C" }}>
                  {t("common:noData")}
                </div>
               )}

              {/* Contracts Summary Heading */}
              <div className="px-4">
              <h6 className="px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                {t("nae.contractsSummary")}
              </h6>
              </div>
              {/* Key Values Section */}
              {renderTwoColumnSection(keyValuesData, t("nae.keyValues"))}

              {/* Summary by Category and Phase Section */}
              {renderTable(summaryCategoryData, t("nae.summaryByCategory"))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewApplicantEnquiry;