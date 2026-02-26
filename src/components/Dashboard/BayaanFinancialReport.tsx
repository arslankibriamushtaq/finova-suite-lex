import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
import toast from "react-hot-toast";
import TableView from "../TableView/TableView";

function BayaanFinancialReport() {
  const { id } = useParams();
  const [selectedYear, setSelectedYear] = useState("2015");
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchFinancialData();
    }
  }, [id]);

  const fetchFinancialData = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const response = await getApplicationDetailsByType(id, "bayan_financial");

      if (response?.data?.success && response?.data?.data) {
        setFinancialData(response.data.data);
      } else {
        toast.error("Failed to load financial data");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to load financial data");
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
        value: value?.toString() || "--"
      })),
      rightColumn: entries.slice(midPoint).map(([key, value]) => ({
        label: formatFieldName(key),
        value: value?.toString() || "--"
      }))
    };
  };

  // Dynamic section data
  const companyInfoSection = {
    heading: "Company Information",
    ...convertToTwoColumns(financialData?.company_information)
  };

  const generalInfoSection = {
    heading: "General Information",
    ...convertToTwoColumns(financialData?.general_information)
  };

  const capitalInfoSection = {
    heading: "Capital Information",
    ...convertToTwoColumns(financialData?.capital_information)
  };

  // Financial Indicators Data - dynamically generated
  const financialIndicatorsData = financialData?.financial_indicators 
    ? Object.entries(financialData.financial_indicators).map(([key, value]) => ({
        category: formatFieldName(key),
        label: formatFieldName(key),
        value: value?.toString() || "--"
      }))
    : [];

  // Table data - all dynamically rendered
  const membersData = financialData?.board_members && Array.isArray(financialData.board_members) ? financialData.board_members : [];
  const financialPositionData = financialData?.financial_position && Array.isArray(financialData.financial_position) ? financialData.financial_position : [];
  const incomeStatementData = financialData?.income_statement && Array.isArray(financialData.income_statement) ? financialData.income_statement : [];
  const comprehensiveIncomeData = financialData?.comprehensive_income && Array.isArray(financialData.comprehensive_income) ? financialData.comprehensive_income : [];
  const changesInEquityData = financialData?.changes_in_equity && Array.isArray(financialData.changes_in_equity) ? financialData.changes_in_equity : [];
  const cashFlowStatementData = financialData?.cash_flow_statement && Array.isArray(financialData.cash_flow_statement) ? financialData.cash_flow_statement : [];

  // Helper function to render tables dynamically
  const renderTable = (data: any[], sectionTitle: string) => {
    const hasData = data && Array.isArray(data) && data.length > 0;

    const headers = hasData ? Object.keys(data[0]).map((key) => ({
      name: formatFieldName(key),
      selector: (row: any) => row[key] || "--",
      sortable: true,
      grow: key.includes('name') || key.includes('description') ? 2 : undefined,
    })) : [];

    return (
      <div className="mb-4">
        {sectionTitle && (
          <h6 className="mb-2 px-3 py-3" style={{ color: "#6C6C6C", fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px" }}>
            {sectionTitle}
          </h6>
        )}
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

  // Helper function to render two-column sections with empty state
  const renderTwoColumnSection = (data: any, sectionTitle: string) => {
    const hasData = data && (data.leftColumn?.length > 0 || data.rightColumn?.length > 0);

    return (
      <div className="mb-4">
        <h6 className="mb-2 px-3 py-3" style={{ color: "#6C6C6C", fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px" }}>
          {sectionTitle}
        </h6>
        {hasData ? (
          <div className="row">
            <div className="col-6">
              {data.leftColumn?.map((item: any, index: number) => (
                <div key={index} className="d-flex justify-content-between align-items-center p-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: "600" }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="col-6">
              {data.rightColumn?.map((item: any, index: number) => (
                <div key={index} className="d-flex justify-content-between align-items-center p-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: "600" }}>{item.value}</span>
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

  if (loading) return <Loader />;

  return (
    <>
    <div className="d-flex flex-column gap-2" style={{backgroundColor: "#FFF8", padding: "20px"}}>
      {/* Year Selector and Fetch Button */}
      <div className="d-flex justify-content-end align-items-center mt-3 mb-3 gap-3">
        <select
          className="form-select"
          style={{ width: "auto" }}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          <option value="2015">2015</option>
          <option value="2016">2016</option>
          <option value="2017">2017</option>
          <option value="2018">2018</option>
          <option value="2019">2019</option>
          <option value="2020">2020</option>
        </select>
        <button className="theme-btn-next">Fetch New Record</button>
      </div>

      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
          <div className="px-4">
            <h6 className="px-3 py-3" style={{ fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px", color: "#000000" }}>
                Company Information
              </h6>
            </div>
            {/* Company Information Section */}
            <div className="px-4 py-4" style={{ backgroundColor: "#F8F8F8" }}>
              {renderTwoColumnSection(companyInfoSection, companyInfoSection.heading)}
            </div>

            {/* General Information Section */}
            <div className="p-4 mt-4" style={{ backgroundColor: "#F8F8F8" }}>
              {renderTwoColumnSection(generalInfoSection, generalInfoSection.heading)}
            </div>

            {/* Capital Information Section */}
            <div className="p-4 mt-4" style={{ backgroundColor: "#F8F8F8" }}>
              {renderTwoColumnSection(capitalInfoSection, capitalInfoSection.heading)}
            </div>

            {/* Financial Indicators Section */}
            <div className="px-4 mt-5">
              <h6 className="mb-3 px-3 py-3" style={{ color: "#000000", fontWeight: "700", backgroundColor: "rgb(240, 240, 240)", padding: "10px" }}>
                Financial Indicators
              </h6>
              
              <div className="p-3" style={{ backgroundColor: "#F8F8F8" }}>
                <h6 className="mb-3" style={{ fontWeight: "700" }}>{selectedYear}</h6>
                
                {financialIndicatorsData.map((indicator, idx) => (
                  <div key={idx} className="mb-3">
                    <div
                      className="p-2"
                      style={{
                        backgroundColor: "#000000",
                        color: "white",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      {indicator.category}
                    </div>
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{ backgroundColor: "white" }}
                    >
                      <span>{indicator.label}</span>
                      <span style={{ fontWeight: "500", fontSize: "13px" }}>{indicator.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Members of the Board of directors */}
            <div className="px-4 mt-4">
              {membersData.length > 0 && renderTable(membersData, "Memebers of the Board of directors")}
            </div>

            {/* Financial Statements Section */}
            <div className="px-4 mt-5">
              <h6 className="mb-4 py-3 px-3" style={{ color: "#000000", fontWeight: "700",  backgroundColor: "rgb(240, 240, 240)", padding: "10px" }}>
                Financial Statements
              </h6>

              {/* All financial statement tables rendered dynamically */}
              {renderTable(financialPositionData, "Financial Position")}
              {renderTable(incomeStatementData, "Income Statement")}
              {renderTable(comprehensiveIncomeData, "Comprehensive Income")}
              {renderTable(changesInEquityData, "Changes in Equity")}
              {renderTable(cashFlowStatementData, "Cash Flow Statement")}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default BayaanFinancialReport;
