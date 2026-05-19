import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../../Loader/Loader";
import { Row, Col } from "antd";
import { BankOutlined, UserOutlined, DollarOutlined, ClockCircleOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";

function SalaryDetails({ fullDetail }: any) {
  const [salaryData, setSalaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedEmploymentCards, setExpandedEmploymentCards] = useState<{ [key: number]: boolean }>({});
  const { id } = useParams();

  // Use fullDetail data if available
  useEffect(() => {
    if (fullDetail?.employmentSalary) {
      const emp = fullDetail.employmentSalary.verifiedEmployment || {};
      const expenses = fullDetail.employmentSalary.monthlyExpenses || {};
      const history = fullDetail.employmentSalary.employmentHistory || [];
      const employmentRecord = {
        employerName: emp.employerName,
        employer_name: emp.employerName,
        employmentStatus: emp.employmentStatus,
        employment_status: emp.employmentStatus,
        employmentSector: emp.employmentSector,
        basicWage: emp.basicSalary,
        basic_wage: emp.basicSalary,
        totalSalary: emp.totalSalary,
        verifiedSalary: emp.verifiedSalary,
        joiningDate: emp.employmentStartDate,
        joining_date: emp.employmentStartDate,
        source: emp.source,
        monthlyIncome: expenses.monthlyIncome,
        totalExpenses: expenses.totalExpenses,
        existingLiabilities: expenses.existingLiabilities,
        // Monthly expense details
        foodGroceries: expenses.foodGroceries,
        utilities: expenses.utilities,
        healthcare: expenses.healthcare,
        communication: expenses.communication,
        housingRent: expenses.housingRent,
        clothingEssentials: expenses.clothingEssentials,
        education: expenses.education,
        transportation: expenses.transportation,
        dependents: expenses.dependents,
      };
      const allRecords = history.length > 0 ? history : [employmentRecord];
      setSalaryData({ 
        employmentStatusInfo: allRecords,
        monthlyExpenses: expenses,
        verifiedEmployment: emp 
      });
      return;
    }
  }, [fullDetail]);

  // Fetch salary details when component mounts (fallback only when fullDetail prop not provided)
  useEffect(() => {
    if (id && fullDetail === undefined) {
      fetchData();
    }
  }, [id, fullDetail]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, 'salary_info');
      
      // Extract salary data from response structure
      const data = response.data?.data || response.data || {};
      const salaryInfo = data.salary_info || {};
      const salaryDataObj = salaryInfo.data || {};
      let employmentStatusInfo = salaryDataObj.employmentStatusInfo || [];
      
      // Handle case where we get a single object instead of array
      if (!Array.isArray(employmentStatusInfo)) {
        // If it's a single object, convert it to an array
        if (employmentStatusInfo && typeof employmentStatusInfo === 'object') {
          employmentStatusInfo = [employmentStatusInfo];
        } else {
          employmentStatusInfo = [];
        }
      }
      
      // Also check if salaryInfo itself is an object that should be converted to array
      if (employmentStatusInfo.length === 0 && salaryInfo && typeof salaryInfo === 'object' && !Array.isArray(salaryInfo)) {
        // Check if salaryInfo has employment-related fields directly
        if (salaryInfo.employerName || salaryInfo.employer_name || salaryInfo.employmentStatus || salaryInfo.employment_status) {
          employmentStatusInfo = [salaryInfo];
        }
      }
      
      setSalaryData({
        employmentStatusInfo: employmentStatusInfo,
        ...salaryDataObj,
      });
      
      if (response.data?.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch salary details");
      setSalaryData(null);
    } finally {
      setLoading(false);
    }
  };

  // Toggle employment card expansion
  const toggleEmploymentCard = (index: number) => {
    setExpandedEmploymentCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Get employment status color
  const getEmploymentStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("active")) {
      return "rgba(63, 195, 128, 0.9)";
    }
    if (statusLower.includes("pension") || statusLower.includes("pensioned")) {
      return "#FFC107";
    }
    if (statusLower.includes("inactive")) {
      return "#F84D4D";
    }
    return "#6c757d";
  };

  // Format amount
  const formatAmount = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined || amount === "") return "--";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  // Check if data is empty
  const employmentStatusInfo = salaryData?.employmentStatusInfo || [];
  const isDataEmpty = !salaryData || !Array.isArray(employmentStatusInfo) || employmentStatusInfo.length === 0;

  // Check if application is approved (you may need to adjust this based on your API response)
  const isApproved = salaryData?.application_status === "approved" || 
                     salaryData?.status === "approved" ||
                     salaryData?.is_approved === true ||
                     false;

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ padding: "20px", background: "var(--surface-card)", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "24px", margin: 0, marginBottom: "5px" ,textAlign:'left'}}>
            Employment History
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "14px", margin: 0 }}>
            View all employment records and details
          </p>
        </div>
        {!isDataEmpty && (
          <div style={{ 
            padding: "8px 16px", 
            background: "var(--surface-card-alt)", 
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--foreground)"
          }}>
            {employmentStatusInfo.length} {employmentStatusInfo.length === 1 ? "Record" : "Records"}
          </div>
        )}
      </div>

      {isDataEmpty ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No employment details available
        </div>
      ) : (
        <>
          {/* Employment Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
            {employmentStatusInfo.map((employment: any, index: number) => {
              const isExpanded = expandedEmploymentCards[index] || false;
              const status = employment.employmentStatus || employment.employment_status || employment.status || "--";
              const statusColor = getEmploymentStatusColor(status);
              const title = employment.occupationTitle || employment.occupation_title || employment.employerName || employment.employer_name || "Employment Record";
              const employerName = employment.employerName || employment.employer_name || "--";
              const joiningDate = employment.joiningDate || employment.joining_date || "--";
              const amount = employment.pensionAmount || employment.pension_amount || employment.basicWage || employment.basic_wage || 0;
              
              return (
                <div
                  key={index}
                  style={{
                    border: "1px solid var(--surface-border)",
                    borderRadius: "8px",
                    background: "var(--surface-card)",
                    overflow: "hidden",
                  }}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleEmploymentCard(index)}
                    style={{
                      padding: "16px 20px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isExpanded ? "#F9F9F9" : "#fff",
                      borderBottom: isExpanded ? "1px solid var(--surface-border)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                            {title}
                          </h3>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: 500,
                              backgroundColor: statusColor,
                              color: "white",
                              textTransform: "capitalize"
                            }}
                          >
                            {status}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", color: "var(--muted-foreground)" }}>
                          <span>{employerName}</span>
                          <span>•</span>
                          <span>Joined: {joiningDate}</span>
                          {amount > 0 && (
                            <>
                              <span>•</span>
                              <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(amount)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: "16px", color: "var(--muted-foreground)" }}>
                      {isExpanded ? <UpOutlined /> : <DownOutlined />}
                    </div>
                  </div>

                  {/* Card Content (Expanded) */}
                  {isExpanded && (
                    <div style={{ padding: "20px" }}>
                      <Row gutter={[24, 24]}>
                        {/* Personal Information Section */}
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                              <UserOutlined style={{ fontSize: "18px", color: "var(--muted-foreground)" }} />
                              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                                Personal Information
                              </h4>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>FULL NAME</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                {employment.fullName || employment.full_name || "--"}
                              </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>EMPLOYMENT TYPE</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                {employment.employmentType || employment.employment_type || "--"}
                              </span>
                            </div>
                          </div>
                        </Col>

                        {/* Employment Details Section */}
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                              <BankOutlined style={{ fontSize: "18px", color: "var(--muted-foreground)" }} />
                              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                                Employment Details
                              </h4>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>EMPLOYER NAME</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>{employerName}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>EMPLOYMENT STATUS</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "16px",
                                    fontSize: "12px",
                                    backgroundColor: statusColor,
                                    color: "white",
                                    textTransform: "capitalize"
                                  }}
                                >
                                  {status}
                                </span>
                              </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>JOINING DATE</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>{joiningDate}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>WORKING MONTHS</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                {employment.workingMonths || employment.working_months || 0} months
                              </span>
                            </div>
                          </div>
                        </Col>

                        {/* Occupation Details Section */}
                        {(employment.occupationCode || employment.occupationCode_meaning || employment.occupationTitle) && (
                          <Col xs={24} md={12}>
                            <div style={{ marginBottom: "24px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                <ClockCircleOutlined style={{ fontSize: "18px", color: "var(--muted-foreground)" }} />
                                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                                  Occupation Details
                                </h4>
                              </div>
                              {employment.occupationCode && (
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>OCCUPATION CODE</span>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                    {employment.occupationCode || employment.occupation_code || "--"}
                                  </span>
                                </div>
                              )}
                              {employment.occupationTitle && (
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>OCCUPATION TITLE</span>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                    {employment.occupationTitle || employment.occupation_title || "--"}
                                  </span>
                                </div>
                              )}
                              {employment.occupationCode_meaning && (
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>DESCRIPTION</span>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                    {employment.occupationCode_meaning || "--"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Col>
                        )}

                        {/* Compensation Details Section */}
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                              <DollarOutlined style={{ fontSize: "18px", color: "var(--muted-foreground)" }} />
                              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                                Compensation Details
                              </h4>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>BASIC WAGE</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                {formatAmount(employment.basicWage || employment.basic_wage)}
                              </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>HOUSING ALLOWANCE</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                {formatAmount(employment.housingAllowance || employment.housing_allowance)}
                              </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>OTHER ALLOWANCE</span>
                              <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                {formatAmount(employment.otherAllowance || employment.other_allowance)}
                              </span>
                            </div>
                            {employment.isEmployeePensioned && (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>PENSION AMOUNT</span>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                    {formatAmount(employment.pensionAmount || employment.pension_amount)}
                                  </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>PENSION TYPE</span>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                    {employment.pensionType || employment.pension_type || "--"}
                                  </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>PENSION START DATE</span>
                                  <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                                    {employment.pensionStartDate || employment.pension_start_date || "--"}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Approval Status Banner */}
          {isApproved && (
            <div
              style={{
                background: "#D1FAE5",
                padding: "12px 20px",
                borderRadius: "4px",
                marginTop: "20px",
              }}
            >
              <div style={{ color: "#065F46", fontWeight: 700, fontSize: "14px" }}>
                This Application has been approved
              </div>
            </div>
          )}

          {/* Monthly Expenses Summary Section */}
          {salaryData?.monthlyExpenses && (
            <div style={{ marginTop: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "20px", margin: 0, marginBottom: "5px" }}>
                    Monthly Expenses Summary
                  </h2>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "14px", margin: 0 }}>
                    Breakdown of monthly income and expenses
                  </p>
                </div>
              </div>

              <div style={{ border: "1px solid var(--surface-border)", borderRadius: "8px", background: "var(--surface-card)", padding: "20px" }}>
                <Row gutter={[24, 24]}>
                  {/* Income Section */}
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <DollarOutlined style={{ fontSize: "18px", color: "var(--muted-foreground)" }} />
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                          Monthly Income
                        </h4>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                        <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>MONTHLY INCOME</span>
                        <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                          {formatAmount(salaryData.monthlyExpenses.monthlyIncome)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "12px 0" }}>
                        <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 400 }}>EXISTING LIABILITIES</span>
                        <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                          {formatAmount(salaryData.monthlyExpenses.existingLiabilities)}
                        </span>
                      </div>
                    </div>
                  </Col>

                  {/* Expense Summary Section */}
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <ClockCircleOutlined style={{ fontSize: "18px", color: "var(--muted-foreground)" }} />
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>
                          Total Monthly Expenses
                        </h4>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", background: "var(--surface-card-alt)", borderRadius: "4px", paddingLeft: "12px", paddingRight: "12px" }}>
                        <span style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>TOTAL EXPENSES</span>
                        <span style={{ fontSize: "16px", color: "var(--foreground)", fontWeight: 700 }}>
                          {formatAmount(salaryData.monthlyExpenses.totalExpenses)}
                        </span>
                      </div>
                    </div>
                  </Col>

                  {/* Expense Details Section */}
                  {(salaryData.monthlyExpenses.foodGroceries || 
                    salaryData.monthlyExpenses.utilities || 
                    salaryData.monthlyExpenses.healthcare ||
                    salaryData.monthlyExpenses.communication ||
                    salaryData.monthlyExpenses.housingRent ||
                    salaryData.monthlyExpenses.clothingEssentials ||
                    salaryData.monthlyExpenses.education ||
                    salaryData.monthlyExpenses.transportation) && (
                    <Col xs={24}>
                      <div style={{ marginBottom: "24px" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)", marginBottom: "16px" }}>
                          Expense Breakdown
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                          {salaryData.monthlyExpenses.foodGroceries && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Food & Groceries</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(salaryData.monthlyExpenses.foodGroceries)}
                              </div>
                            </div>
                          )}
                          {salaryData.monthlyExpenses.utilities && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Utilities</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(salaryData.monthlyExpenses.utilities)}
                              </div>
                            </div>
                          )}
                          {salaryData.monthlyExpenses.healthcare && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Healthcare</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(salaryData.monthlyExpenses.healthcare)}
                              </div>
                            </div>
                          )}
                          {salaryData.monthlyExpenses.communication && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Communication</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(salaryData.monthlyExpenses.communication)}
                              </div>
                            </div>
                          )}
                          {salaryData.monthlyExpenses.housingRent && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Housing Rent</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(salaryData.monthlyExpenses.housingRent)}
                              </div>
                            </div>
                          )}
                          {salaryData.monthlyExpenses.clothingEssentials && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Clothing & Essentials</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(salaryData.monthlyExpenses.clothingEssentials)}
                              </div>
                            </div>
                          )}
                          {salaryData.monthlyExpenses.education && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Education</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(salaryData.monthlyExpenses.education)}
                              </div>
                            </div>
                          )}
                          {salaryData.monthlyExpenses.transportation && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Transportation</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {formatAmount(salaryData.monthlyExpenses.transportation)}
                              </div>
                            </div>
                          )}
                          {salaryData.monthlyExpenses.dependents && (
                            <div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                              <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Dependents</span>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                                {salaryData.monthlyExpenses.dependents}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SalaryDetails;

