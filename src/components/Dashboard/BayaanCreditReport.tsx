import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
import toast from "react-hot-toast";
import TableView from "../TableView/TableView";

const BayaanCreditReport = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [creditData, setCreditData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchCreditData();
    }
  }, [id]);

  const fetchCreditData = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const response = await getApplicationDetailsByType(id, "bayan_credit");

      if (response?.data?.success && response?.data?.data) {
        setCreditData(response.data.data);
      } else {
        toast.error("Failed to load credit data");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to load credit data");
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

  // Helper function to check if value is a simple value (not object or array)
  const isSimpleValue = (value: any): boolean => {
    return value === null || value === undefined || 
           typeof value === 'string' || 
           typeof value === 'number' || 
           typeof value === 'boolean';
  };

  // Helper function to render two-column section dynamically
  const renderTwoColumnSection = (data: any, sectionTitle: string) => {
    const hasData = data && typeof data === 'object' && (data.leftColumn?.length > 0 || data.rightColumn?.length > 0);

    return (
      <div className="px-4 mt-4" style={{ backgroundColor: "#F8F8F8" }}>
        <div className="p-3 mb-3" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
          {sectionTitle}
        </div>
        {hasData ? (
          <div className="row">
            <div className="col-6">
              {data.leftColumn?.map((detail: any, i: number) => (
                <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                  <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                    {detail.label || formatFieldName(detail.key || '')}
                  </p>
                  <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                    {detail.value || "--"}
                  </span>
                </div>
              ))}
            </div>
            <div className="col-6">
              {data.rightColumn?.map((detail: any, i: number) => (
                <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                  <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                    {detail.label || formatFieldName(detail.key || '')}
                  </p>
                  <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                    {detail.value || "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
            No data available
          </div>
        )}
      </div>
    );
  };

  // Helper function to render tables dynamically
  const renderTable = (data: any[], sectionTitle: string) => {
    const hasData = data && Array.isArray(data) && data.length > 0;

    const headers = hasData ? Object.keys(data[0]).map((key) => ({
      name: formatFieldName(key),
      selector: (row: any) => row[key] || "--",
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
            No data available
          </div>
        )}
      </div>
    );
  };

  // Helper function to render branches dynamically
  const renderBranches = (branches: any[]) => {
    if (!branches || !Array.isArray(branches) || branches.length === 0) return null;

    return branches.map((branch: any, idx: number) => {
      const branchName = branch.branchName || branch.branch_name || branch.name || `Branch ${idx + 1}`;
      
      // Get all simple key-value pairs
      const entries = Object.entries(branch).filter(([key, value]) => 
        key !== 'branchName' && key !== 'branch_name' && key !== 'name' && 
        key !== 'leftColumn' && key !== 'rightColumn' && 
        isSimpleValue(value)
      );

      // Check if branch has leftColumn/rightColumn structure
      if (branch.leftColumn && branch.rightColumn) {
        return (
          <div key={idx} className="mb-4">
            <h6 className="mb-3 py-3 px-3" style={{ color: "#000000", fontWeight: "600", backgroundColor: "rgb(240, 240, 240)" }}>
              {branchName}
            </h6>
            <div className="row">
              <div className="col-6">
                {branch.leftColumn.map((detail: any, i: number) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                      {detail.label || formatFieldName(detail.key || '')}
                    </p>
                    <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                      {detail.value || "--"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="col-6">
                {branch.rightColumn.map((detail: any, i: number) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                      {detail.label || formatFieldName(detail.key || '')}
                    </p>
                    <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                      {detail.value || "--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // Otherwise split dynamically
      const midPoint = Math.ceil(entries.length / 2);
      const leftEntries = entries.slice(0, midPoint);
      const rightEntries = entries.slice(midPoint);

      return (
        <div key={idx} className="mb-4">
          <h6 className="mb-3 py-3 px-3" style={{ color: "#000000", fontWeight: "600", backgroundColor: "rgb(240, 240, 240)" }}>
            {branchName}
          </h6>
          <div className="row">
            <div className="col-6">
              {leftEntries.map(([key, value], i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                  <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                    {formatFieldName(key)}
                  </p>
                  <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                    {value?.toString() || "--"}
                  </span>
                </div>
              ))}
            </div>
            <div className="col-6">
              {rightEntries.map(([key, value], i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                  <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                    {formatFieldName(key)}
                  </p>
                  <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                    {value?.toString() || "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    });
  };

  // Helper function to convert object to two-column format dynamically
  const convertToTwoColumns = (data: any) => {
    if (!data || typeof data !== 'object') return { leftColumn: [], rightColumn: [] };
    
    // If already has leftColumn/rightColumn structure, return as is
    if (data.leftColumn && data.rightColumn) return data;
    
    // Get all key-value pairs
    const entries = Object.entries(data).filter(([_, value]) => isSimpleValue(value));
    const midPoint = Math.ceil(entries.length / 2);
    
    return {
      leftColumn: entries.slice(0, midPoint).map(([key, value]) => ({
        label: formatFieldName(key),
        value: value?.toString() || "--"
      })),
      rightColumn: entries.slice(midPoint).map(([key, value]) => ({
        label: formatFieldName(key),
        value: value?.toString() || "--"
      }))
    };
  };

  // Dynamic section data
  const identificationData = convertToTwoColumns(creditData?.identification);

  const highlightsData = convertToTwoColumns(creditData?.highlights);

  const mainHQRData = convertToTwoColumns(creditData?.main_hqr);

  const relevantEventsData = convertToTwoColumns(creditData?.relevant_events);

  // Branches Information Data - Process API data dynamically
  const apiBranches = creditData?.branches && Array.isArray(creditData.branches) ? creditData.branches : [];
  
  const branchesData = apiBranches.map((branch: any) => {
    const branchName = branch?.branchName || branch?.branch_name || branch?.name || "--";
    const { leftColumn, rightColumn } = convertToTwoColumns(branch);
    return { branchName, leftColumn, rightColumn };
  });

  const subjectDataFromContributors = convertToTwoColumns(creditData?.subject_data);

  const currentTraditionalAddress = convertToTwoColumns(creditData?.current_address);

  const historicalTraditionalAddress = convertToTwoColumns(creditData?.historical_address);

  // Contact Data - Process API data dynamically
  const apiContacts = creditData?.contact_data && Array.isArray(creditData.contact_data) ? creditData.contact_data : [];
  
  const contactData = apiContacts.map((contact: any) => {
    const date = contact?.date || contact?.last_update_date || "--";
    const entries = Object.entries(contact).filter(([key]) => key !== 'date' && key !== 'last_update_date');
    return { date, fields: entries };
  });

  const keyValuesData = convertToTwoColumns(creditData?.key_values);

  // Table data - all tables are handled dynamically
  const summaryCategoryData = creditData?.summary_category && Array.isArray(creditData.summary_category) ? creditData.summary_category : [];

  const servicesFinancialData = creditData?.services_financial && Array.isArray(creditData.services_financial) ? creditData.services_financial : [];
  const servicesBorrowerData = creditData?.services_borrower && Array.isArray(creditData.services_borrower) ? creditData.services_borrower : [];
  const cardsFinancialData = creditData?.cards_financial && Array.isArray(creditData.cards_financial) ? creditData.cards_financial : [];
  const cardsBorrowerData = creditData?.cards_borrower && Array.isArray(creditData.cards_borrower) ? creditData.cards_borrower : [];
  const installmentsFinancialData = creditData?.installments_financial && Array.isArray(creditData.installments_financial) ? creditData.installments_financial : [];
  const installmentsBorrowerData = creditData?.installments_borrower && Array.isArray(creditData.installments_borrower) ? creditData.installments_borrower : [];
  const nonInstallmentsFinancialData = creditData?.non_installments_financial && Array.isArray(creditData.non_installments_financial) ? creditData.non_installments_financial : [];
  const nonInstallmentsBorrowerData = creditData?.non_installments_borrower && Array.isArray(creditData.non_installments_borrower) ? creditData.non_installments_borrower : [];
  const installmentsNotGrantedData = creditData?.installments_not_granted && Array.isArray(creditData.installments_not_granted) ? creditData.installments_not_granted : [];
  const installmentsGrantedData = creditData?.installments_granted && Array.isArray(creditData.installments_granted) ? creditData.installments_granted : [];
  const nonInstallmentsNotGrantedData = creditData?.non_installments_not_granted && Array.isArray(creditData.non_installments_not_granted) ? creditData.non_installments_not_granted : [];

  // Dynamically render all sections from API data
  const renderDynamicContent = () => {
    if (!creditData || typeof creditData !== 'object') {
      return <p className="text-center">No data available</p>;
    }

    return Object.entries(creditData).map(([key, value]: [string, any], index: number) => {
      // Skip null or undefined values
      if (value === null || value === undefined) return null;

      const sectionTitle = formatFieldName(key);

      // Handle arrays (tables, branches, contacts, related companies)
      if (Array.isArray(value)) {
        // Check if it's branches
        if (key.toLowerCase().includes('branch')) {
          return (
            <div key={index}>
              <div className="px-4 mt-3" style={{ backgroundColor: "#F8F8F8" }}>
                <h6 className="px-3 py-3" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                  Operations
                </h6>
              </div>
              <div className="px-4 mt-4" style={{ backgroundColor: "#F8F8F8" }}>
                <div className="p-3 mb-2" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
                  {sectionTitle}
                </div>
                {renderBranches(value)}
              </div>
            </div>
          );
        }
        
        // Check if it's contact data
        if (key.toLowerCase().includes('contact')) {
          return (
            <div key={index}>
              <div className="px-4">
                <h6 className="mb-2 px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                  Contact Data
                </h6>
              </div>
              {value.map((contact: any, idx: number) => {
                const contactDate = contact.date || contact.last_update_date || "Date N/A";
                const contactEntries = Object.entries(contact).filter(([k]) => k !== 'date' && k !== 'last_update_date');
                
                return (
                  <div key={idx} className="px-4 mt-3" style={{ backgroundColor: "#F8F8F8" }}>
                    <div className="p-3 mb-3" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
                      {contactDate}
                    </div>
                    <div className="row">
                      {contactEntries.map(([k, v], i) => (
                        <div key={i} className="col-6">
                          <div className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                            <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                              {formatFieldName(k)}
                            </p>
                            <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                              {v?.toString() || "--"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Check if it's related companies
        if (key.toLowerCase().includes('related')) {
          return (
            <div key={index}>
              <div className="px-4">
                <h6 className="px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                  Business Relations
                </h6>
              </div>
              <div className="px-4 mt-3" style={{ backgroundColor: "#F8F8F8" }}>
                <div className="p-3 mb-4" style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}>
                  {sectionTitle}
                </div>
                {value.map((relatedGroup: any, idx: number) => {
                  const personName = relatedGroup.personName || relatedGroup.person_name || `Group ${idx + 1}`;
                  const data = relatedGroup.data || [];
                  
                  if (data.length === 0) return null;

                  const headers = Object.keys(data[0]).map((k) => ({
                    name: formatFieldName(k),
                    selector: (row: any) => row[k] || "--",
                    sortable: true,
                    grow: k.includes('name') || k.includes('address') ? 2 : undefined,
                  }));

                  return (
                    <div key={idx}>
                      <h6 className="mt-4 mb-2 px-3 py-3" style={{ color: "#000000", fontWeight: "600", backgroundColor: "rgb(240, 240, 240)" }}>
                        {personName}
                      </h6>
                      <TableView className="mt-3 mb-5" header={headers} data={data} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // Regular table data
        return renderTable(value, sectionTitle);
      }

      // Handle objects (two-column sections)
      if (typeof value === 'object' && !Array.isArray(value)) {
        return (
          <React.Fragment key={index}>
            {renderTwoColumnSection(value, sectionTitle)}
          </React.Fragment>
        );
      }

      return null;
    });
  };

  if (loading) return <Loader />;

  return (
    <>
    <div className="d-flex flex-column gap-2" style={{backgroundColor: "#FFF8", padding: "20px"}}>
      {/* Fetch New Record Button */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="theme-btn-next">Fetch New Record</button>
      </div>

      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            {/* Business Highlights Heading */}
            {/* <div className="px-4">
              <h6 className="px-3 py-3" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              Business Highlights
            </h6>
            </div> */}

            {/* Dynamically render all content */}
            {renderDynamicContent()}
            {/* Business Highlights Heading */}
            <div className="px-4">
            <h6 className="px-3 py-3" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              Business Highlights
            </h6>
            </div>

            {/* Identification Section */}
            {renderTwoColumnSection(identificationData, "Identification")}

            {/* Highlights Section */}
            {renderTwoColumnSection(highlightsData, "Highlights")}

            {/* MAIN HQR Section */}
            {renderTwoColumnSection(mainHQRData, "MAIN HQR")}

            {/* Relevant Events Section */}
            <div className="p-4" style={{ backgroundColor: "#F8F8F8" }}>
            <h6 className="mb-3 px-3 py-3 mt-2" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              Relevant Events
            </h6>
            {relevantEventsData && (relevantEventsData.leftColumn?.length > 0 || relevantEventsData.rightColumn?.length > 0) ? (
              <div className="row">
                <div className="col-6">
                  {relevantEventsData.leftColumn.map((detail: any, i: any) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                      style={{ borderBottom: "1px solid #CFCFCF" }}
                    >
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
                  {relevantEventsData.rightColumn.map((detail: any, i: any) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                      style={{ borderBottom: "1px solid #CFCFCF" }}
                    >
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
                No data available
              </div>
            )}
            </div>

            {/* Operations Heading */}
            <div className="px-4 mt-3" style={{ backgroundColor: "#F8F8F8" }}>
            <h6 className="px-3 py-3" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              Operations
            </h6>
            </div>
            {/* Branches Information Section */}
            <div className="px-4 mt-4" style={{ backgroundColor: "#F8F8F8" }}>
              <div
                className="p-3 mb-2"
                style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}
              >
                Branches Information
              </div>

              {branchesData.length > 0 ? (
                branchesData.map((branch: any, idx: any) => (
                  <div key={idx} className="mb-4">
                    <h6 className="mb-3 py-3 px-3" style={{ color: "#000000", fontWeight: "600", backgroundColor: "rgb(240, 240, 240)" }}>
                      {branch.branchName}
                    </h6>
                    <div className="row">
                      <div className="col-6">
                        {branch.leftColumn.map((detail: any, i: any) => (
                          <div
                            key={i}
                            className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                            style={{ borderBottom: "1px solid #CFCFCF" }}
                          >
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
                          <div
                            key={i}
                            className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                            style={{ borderBottom: "1px solid #CFCFCF" }}
                          >
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
                  No branches information available
                </div>
              )}
            </div>

            {/* Subject Heading */}
            <div className="px-4 mt-2" style={{ backgroundColor: "#F8F8F8" }}>
            <h6 className="mb-2 px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              Subject
            </h6>
            </div>
            {/* Subject Data from Contributors Section */}
            {renderTwoColumnSection(subjectDataFromContributors, "Subject Data from Contributors")}

            {/* Addresses Data Heading */}
            <div className="px-4 mt-2" style={{ backgroundColor: "#F8F8F8" }}>
            <h6 className="mb-2 px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              Addresses Data
            </h6>
            </div>
            {/* Current-Traditional Address Section */}
            {renderTwoColumnSection(currentTraditionalAddress, "Current-Traditional Address")}

            {/* Historical-Traditional Address Section */}
            {renderTwoColumnSection(historicalTraditionalAddress, "Historical-Traditional Address")}

            {/* Contact Data Heading */}
            <div className="px-4">
            <h6 className="mb-2 px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              Contact Data
            </h6>
            </div>
            {contactData.length > 0 ? contactData.map((contact: any, idx: any) => {
              const midPoint = Math.ceil(contact.fields.length / 2);
              const leftFields = contact.fields.slice(0, midPoint);
              const rightFields = contact.fields.slice(midPoint);
              
              return (
              <div key={idx} className="px-4 mt-3" style={{ backgroundColor: "#F8F8F8" }}>
                <div
                  className="p-3 mb-3"
                  style={{ backgroundColor: "#000000", color: "white", fontWeight: "600" }}
                >
                  {contact.date}
                </div>
                <div className="row">
                  <div className="col-6">
                    {leftFields.map(([key, value]: [string, any], i: number) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                      style={{ borderBottom: "1px solid #CFCFCF" }}
                    >
                      <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>{formatFieldName(key)}</p>
                      <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                        {value?.toString() || "--"}
                      </span>
                    </div>
                    ))}
                  </div>
                  <div className="col-6">
                    {rightFields.map(([key, value]: [string, any], i: number) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                      style={{ borderBottom: "1px solid #CFCFCF" }}
                    >
                      <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                        {formatFieldName(key)}
                      </p>
                      <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                        {value?.toString() || "--"}
                      </span>
                    </div>
                    ))}
                  </div>
                </div>
                </div>
              );
            }) : (
              <div className="px-4 mt-3 p-3 text-center" style={{ backgroundColor: "#F8F8F8", color: "#6C6C6C" }}>
                No data available
              </div>
            )}

            {/* Contracts Summary Heading */}
            <div className="px-4">
            <h6 className="mb-2 px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              Contracts Summary
            </h6>
            </div>
            {/* Key Values Section */}
            {renderTwoColumnSection(keyValuesData, "Key Values")}

            {/* Summary by Category and Phase Section */}
            {renderTable(summaryCategoryData, "Summary by Category and Phase")}

            {/* Financial Summary Heading */}
            <div className="px-4 mt-2">
            <h6 className="mb-2 px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "#000000", padding: "10px", color: "white" }}>
              Financial Summary
            </h6>

            {/* Services Section */}
            {servicesFinancialData.length > 0 && (
              <>
              <h6 className="mb-2 px-3 py-3 mt-4" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                Services
              </h6>
              <div className="row mb-3">
                {servicesFinancialData.map((item: any, idx: any) => {
                  const entries = Object.entries(item);
                  const midPoint = Math.ceil(entries.length / 2);
                  const leftEntries = entries.slice(0, midPoint);
                  const rightEntries = entries.slice(midPoint);
                  
                  return (
                  <React.Fragment key={idx}>
                    {leftEntries.map(([key, value]: [string, any], i: number) => (
                    <div key={`left-${i}`} className="col-6">
                      <div
                        className="d-flex justify-content-between align-items-center p-2"
                        style={{ borderBottom: "1px solid #CFCFCF" }}
                        >
                        <span>{formatFieldName(key)}</span>
                        <span style={{ fontWeight: "600" }}>{value?.toString() || "--"}</span>
                      </div>
                    </div>
                    ))}
                    {rightEntries.map(([key, value]: [string, any], i: number) => (
                    <div key={`right-${i}`} className="col-6">
                      <div
                        className="d-flex justify-content-between align-items-center p-2"
                        style={{ borderBottom: "1px solid #CFCFCF" }}
                        >
                        <span>{formatFieldName(key)}</span>
                        <span style={{ fontWeight: "600" }}>{value?.toString() || "--"}</span>
                      </div>
                    </div>
                    ))}
                  </React.Fragment>
                  );
                })}
              </div>
              {renderTable(servicesBorrowerData, "")}
              </>
            )}
            {/* Cards Section */}
            {cardsFinancialData.length > 0 && (
              <>
              <h6 className="mb-2 px-3 py-3 mt-4" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                Cards
              </h6>
              <div className="row mb-3">
                {cardsFinancialData.map((item: any) => {
                  const entries = Object.entries(item);
                  return entries.map(([key, value]: [string, any], i: number) => (
                    <div key={i} className="col-6">
                      <div
                        className="d-flex justify-content-between align-items-center p-2"
                        style={{ borderBottom: "1px solid #CFCFCF" }}
                      >
                        <span>{formatFieldName(key)}</span>
                        <span style={{ fontWeight: "600" }}>{value?.toString() || "--"}</span>
                      </div>
                    </div>
                  ));
                })}
              </div>
              {renderTable(cardsBorrowerData, "")}
              </>
            )}

            {/* Installments Section */}
            {installmentsFinancialData.length > 0 && (
              <>
              <h6 className="mb-2 px-3 py-3 mt-4" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                Installments
              </h6>
              <div className="row mb-3">
                {installmentsFinancialData.map((item: any) => {
                  const entries = Object.entries(item);
                  return entries.map(([key, value]: [string, any], i: number) => (
                    <div key={i} className="col-6">
                      <div
                        className="d-flex justify-content-between align-items-center p-2"
                        style={{ borderBottom: "1px solid #CFCFCF" }}
                      >
                        <span>{formatFieldName(key)}</span>
                        <span style={{ fontWeight: "600" }}>{value?.toString() || "--"}</span>
                      </div>
                    </div>
                  ));
                })}
              </div>
              {renderTable(installmentsBorrowerData, "")}
              </>
            )}

            {/* Non Installments Section */}
            {nonInstallmentsFinancialData.length > 0 && (
              <>
              <h6 className="mb-2 px-3 py-3 mt-4" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                Non Installments
              </h6>
              <div className="row mb-3">
                {nonInstallmentsFinancialData.map((item: any) => {
                  const entries = Object.entries(item);
                  return entries.map(([key, value]: [string, any], i: number) => (
                    <div key={i} className="col-6">
                      <div
                        className="d-flex justify-content-between align-items-center p-2"
                        style={{ borderBottom: "1px solid #CFCFCF" }}
                      >
                        <span>{formatFieldName(key)}</span>
                        <span style={{ fontWeight: "600" }}>{value?.toString() || "--"}</span>
                      </div>
                    </div>
                  ));
                })}
              </div>
              {renderTable(nonInstallmentsBorrowerData, "")}
              </>
            )}
            </div>
            {/* CONTRACTS DETAILS Heading */}
            <div className="px-4 mt-3 mb-1">
            <h6 className="mb-2 px-3 py-3 mt-5" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
              CONTRACTS DETAILS
            </h6>
            </div>
            
            {/* All contract sections rendered dynamically */}
            {renderTable(installmentsNotGrantedData, "Installments-Not Granted Contract")}
            {renderTable(installmentsGrantedData, "Installments-Granted Contract")}
            {renderTable(nonInstallmentsNotGrantedData, "Non Installments-Not Granted Contract")}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default BayaanCreditReport;
