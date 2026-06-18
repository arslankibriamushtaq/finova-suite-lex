import { useState, useMemo, useEffect } from "react";
import { Select } from "antd";
import { calculateApplicationWeight } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

interface Props {
  definitions: any[];
  applicationId?: string;
  loading?: boolean;
  onSave?: () => void;
}

const CreditWeightagesInfo = ({ definitions, applicationId, loading, onSave }: Props) => {
  const [selected, setSelected] = useState<Record<number, { label: string; value: string; weight: number }>>({});
  const [saving, setSaving] = useState(false);
  const [breakdownExpanded, setBreakdownExpanded] = useState(true);

  const formatLabel = (s: string) =>
    (s || "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Pre-seed selected values from API response
  useEffect(() => {
    const preSel: Record<number, { label: string; value: string; weight: number }> = {};
    definitions.forEach((d, index) => {
      // Handle new API structure: { key, weight, parameter }
      if (d?.key !== undefined && d?.weight !== undefined && d?.parameter) {
        // New structure: directly use key and weight from API
        const key = String(d.key || "");
        const weight = Number(d.weight || 0);
        preSel[index] = {
          label: key,
          value: key,
          weight: weight
        };
        return;
      }
      
      // Handle old structure: weightages array/object
      const weightagesArray = Array.isArray(d?.weightages) 
        ? d.weightages 
        : Object.entries(d?.weightages ?? {}).map(([value, weight]) => ({ value, weight }));
      
      if (weightagesArray.length === 0) return;
      
      // Check if there's a selected value from API response
      if (d?.selected && d.selected !== null) {
        // Find matching weightage by value
        const matchedWeightage = weightagesArray.find(
          (w: any) => String(w.value || w[0]) === String(d.selected)
        );
        
        if (matchedWeightage) {
          const label = String(matchedWeightage.value || matchedWeightage[0] || d.selected);
          const weight = Number(matchedWeightage.weight || matchedWeightage[1] || 0);
          preSel[d.id || index] = {
            label: label,
            value: label,
            weight: weight
          };
        } else {
          // If selected value doesn't match, use first weightage
          const firstWeightage = weightagesArray[0];
          const label = String(firstWeightage.value || firstWeightage[0] || "");
          const weight = Number(firstWeightage.weight || firstWeightage[1] || 0);
          preSel[d.id || index] = {
            label: label,
            value: label,
            weight: weight
          };
        }
      } else {
        // Use first weightage if no selected value
        const firstWeightage = weightagesArray[0];
        const label = String(firstWeightage.value || firstWeightage[0] || "");
        const weight = Number(firstWeightage.weight || firstWeightage[1] || 0);
        preSel[d.id || index] = {
          label: label,
          value: label,
          weight: weight
        };
      }
    });
    setSelected(preSel);
  }, [definitions]);

  const grid = useMemo(() => {
    return definitions.map((def, index) => {
      // Handle new API structure: { key, weight, parameter }
      if (def?.key !== undefined && def?.weight !== undefined && def?.parameter) {
        // New structure: create a single option from key and weight
        const opts: { label: string; value: string; weight: number }[] = [{
          label: String(def.key || ""),
          value: String(def.key || ""),
          weight: Number(def.weight || 0)
        }];
        
        return { 
          def: { 
            ...def, 
            id: def.id || index,
            parameter: def.parameter 
          }, 
          opts 
        };
      }
      
      // Handle old structure: weightages array/object
      const weightagesArray = Array.isArray(def?.weightages) 
        ? def.weightages 
        : Object.entries(def?.weightages ?? {}).map(([value, weight]) => ({ value, weight }));
      
      const opts: { label: string; value: string; weight: number }[] = weightagesArray.map((w: any) => {
        const label = String(w.value || w[0] || "");
        const weight = Number(w.weight || w[1] || 0);
        return {
          label: label,
          value: label,
          weight: weight
        };
      });
      
      return { 
        def: { 
          ...def, 
          id: def.id || index 
        }, 
        opts 
      };
    });
  }, [definitions]);

  // Calculate total score from all selected values
  const totalScore = useMemo(() => {
    return Object.values(selected).reduce((sum, item) => {
      return sum + (item?.weight || 0);
    }, 0);
  }, [selected]);

  // Build payload exactly as API expects
  const buildPayload = (): Record<string, any> => {
    const body: Record<string, any> = { app_id: String(applicationId) };
    if (applicationId) body.loan_application_number = String(applicationId);
    definitions.forEach((def) => {
      const chosen = selected[def.id];
      const weightagesArray = Array.isArray(def?.weightages) 
        ? def.weightages 
        : Object.entries(def?.weightages ?? {}).map(([value, weight]) => ({ value, weight }));
      
      const key = chosen?.label || (weightagesArray[0] ? String(weightagesArray[0].value || weightagesArray[0][0]) : "");
      const weight = chosen?.weight || (weightagesArray[0] ? Number(weightagesArray[0].weight || weightagesArray[0][1]) : 0);
      
      body[def.parameter] = {
        key,
        weight: Number(weight),
        percentage: (def as any)?.percentage ?? 0,
      };
    });
    return body;
  };

  // const handleSubmit = async () => {
  //   setSaving(true);
  //   try {
  //     const body = buildPayload();
  //     await calculateApplicationWeight(body);
  //     toast.success("Weights saved successfully");
  //     if (onSave) onSave();
  //   } catch (err) {
  //     toast.error("Failed to save weights");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  return (
    <div style={{ padding: "20px", background: "var(--surface-page)", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ 
        background: "var(--surface-card)", 
        padding: "24px", 
        borderRadius: "8px", 
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        {/* Left: Circular Score Badge */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(32, 178, 170, 0.3)"
        }}>
          <div style={{ fontSize: "28px", fontWeight: "700", lineHeight: "1" }}>
            {totalScore}
          </div>
          <div style={{ fontSize: "10px", fontWeight: "500", marginTop: "4px", opacity: 0.9 }}>
            SCORE
          </div>
        </div>

        {/* Center: Title */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "600", 
            color: "var(--foreground)", 
            margin: 0,
            marginBottom: "4px"
          }}>
            Credit Score Analysis
          </h2>
          <p style={{ 
            fontSize: "14px", 
            color: "var(--muted-foreground)", 
            margin: 0 
          }}>
            Current Application Weightage Assessment
          </p>
        </div>

        {/* Right: Total Score Badge */}
        <div style={{
          padding: "12px 24px",
          borderRadius: "6px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(32, 178, 170, 0.3)"
        }}>
          <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px", opacity: 0.9 }}>
            Total Score
          </div>
          <div style={{ fontSize: "24px", fontWeight: "700", lineHeight: "1" }}>
            {totalScore}
          </div>
        </div>
      </div>

      {/* Credit Factor Grid */}
      <div style={{ background: "var(--surface-card)", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "600", 
          color: "var(--foreground)", 
          marginBottom: "20px" 
        }}>
          Credit Factor Breakdown
        </h3>
        
        {grid.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--foreground)" }}>
            No credit factors available
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "20px" 
          }}>
            {grid.map(({ def, opts }, index) => {
              const defId = def.id ?? index;
              const selectedItem = selected[defId];
              const currentScore = selectedItem?.weight ?? (opts[0]?.weight ?? 0);
              const currentValue = selectedItem?.label || opts[0]?.label || "-";
              
              return (
                <div
                  key={defId}
                  style={{
                    padding: "16px",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "8px",
                    background: "var(--surface-card)",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "12px"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: "14px", 
                        fontWeight: "600", 
                        color: "var(--foreground)",
                        marginBottom: "8px",
                        lineHeight: "1.4"
                      }}>
                        {formatLabel(def.parameter)}
                      </div>
                    </div>
                    <div style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      marginLeft: "12px"
                    }}>
                      {currentScore}
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: "13px", 
                    color: "var(--muted-foreground)",
                    marginTop: "8px"
                  }}>
                    {currentValue}
                  </div>

                  {/* Dropdown for editing (if not readonly) */}
                  {/* {!def.readonly && (
                    <div style={{ marginTop: "12px" }}>
                      <Select
                        value={selectedItem?.value ?? (opts[0]?.value as string | undefined)}
                        onChange={(val) => {
                          const selectedOption = opts.find(opt => opt.value === String(val));
                          if (selectedOption) {
                            setSelected((s) => ({
                              ...s,
                              [def.id]: { 
                                value: selectedOption.value,
                                label: selectedOption.label,
                                weight: selectedOption.weight
                              },
                            }));
                          }
                        }}
                        options={opts.map(opt => ({ label: opt.label, value: opt.value }))}
                        style={{ width: "100%" }}
                        disabled={loading}
                        size="small"
                      />
                    </div>
                  )} */}
                </div>
              );
            })}
          </div>
        )}

        {/* Save Button */}
        {/* {!definitions.every(d => d.readonly) && (
          <div className="d-flex justify-content-end mt-4">
            <button
              className="theme-btn-next"
              onClick={handleSubmit}
              disabled={saving || loading}
              style={{ backgroundColor: "#dc0000" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )} */}
      </div>

      {/* Score Calculation Breakdown */}
      <div style={{ 
        background: "var(--surface-card)", 
        padding: "0",
        borderRadius: "8px", 
        marginTop: "24px",
        border: "1px solid #D1FAE5",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        {/* Header with dropdown */}
        <div 
          onClick={() => setBreakdownExpanded(!breakdownExpanded)}
          style={{ 
            padding: "16px 20px",
            cursor: "pointer",
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: breakdownExpanded ? "1px solid var(--surface-border)" : "none"
          }}
        >
          <div>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "var(--foreground)", 
              margin: 0,
              marginBottom: "4px"
            }}>
              Score Calculation Breakdown
            </h3>
            <p style={{ 
              fontSize: "13px", 
              color: "var(--muted-foreground)", 
              margin: 0 
            }}>
              View detailed formula and parameter contributions
            </p>
          </div>
          <div style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            {breakdownExpanded ? <UpOutlined /> : <DownOutlined />}
          </div>
        </div>

        {breakdownExpanded && (
          <div style={{ 
            padding: "20px",
            display: "flex", 
            flexDirection: "column", 
            gap: "12px" 
          }}>
            {/* Income Calculation */}
            <div
              style={{
                padding: "16px",
                border: "1px solid var(--surface-border)",
                borderRadius: "6px",
                background: "var(--surface-card)"
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "10px" 
              }}>
                <span style={{ 
                  fontSize: "16px", 
                  marginRight: "8px",
                  color: "var(--foreground)"
                }}>★</span>
                <h4 style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  color: "var(--foreground)", 
                  margin: 0 
                }}>
                  Scoring Formula
                </h4>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--muted-foreground)", 
                marginBottom: "6px",
                lineHeight: "1.5"
              }}>
                Formula: <span style={{ color: "var(--foreground)", fontWeight: "400" }}>Income = Basic Wage + Other Allowance + Housing Allowance</span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "400",
                lineHeight: "1.5"
              }}>
                Calculation: <span style={{ color: "var(--foreground)", fontWeight: "500" }}>
                  21450 + 3300 + 8250 = 33000
                </span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "500",
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid var(--surface-border)"
              }}>
                Total: <span style={{ color: "var(--foreground)", fontWeight: "600" }}>33000</span>
              </div>
            </div>

            {/* DBR System Percentage */}
            <div
              style={{
                padding: "16px",
                border: "1px solid var(--surface-border)",
                borderRadius: "6px",
                background: "var(--surface-card)"
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "10px" 
              }}>
                <span style={{ 
                  fontSize: "16px", 
                  marginRight: "8px",
                  color: "var(--foreground)"
                }}>★</span>
                <h4 style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  color: "var(--foreground)", 
                  margin: 0 
                }}>
                  DBR System Percentage
                </h4>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--muted-foreground)", 
                marginBottom: "6px",
                lineHeight: "1.5"
              }}>
                Formula: <span style={{ color: "var(--foreground)", fontWeight: "400" }}>( DBR Percentage / income ) * 100</span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "400",
                lineHeight: "1.5"
              }}>
                Calculation: <span style={{ color: "var(--foreground)", fontWeight: "500" }}>
                  (10.00 / 33000) * 100 = 0.03030303030303
                </span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "500",
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid var(--surface-border)"
              }}>
                Total: <span style={{ color: "var(--foreground)", fontWeight: "600" }}>0.03030303030303</span>
              </div>
            </div>

            {/* Simmah Amount */}
            <div
              style={{
                padding: "16px",
                border: "1px solid var(--surface-border)",
                borderRadius: "6px",
                background: "var(--surface-card)"
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "10px" 
              }}>
                <span style={{ 
                  fontSize: "16px", 
                  marginRight: "8px",
                  color: "var(--foreground)"
                }}>★</span>
                <h4 style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  color: "var(--foreground)", 
                  margin: 0 
                }}>
                  Simmah Amount
                </h4>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--muted-foreground)", 
                marginBottom: "6px",
                lineHeight: "1.5"
              }}>
                Formula: <span style={{ color: "var(--foreground)", fontWeight: "400" }}>Simmah Amount = 16.666666666667</span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "400",
                lineHeight: "1.5"
              }}>
                Calculation: <span style={{ color: "var(--foreground)", fontWeight: "500" }}>
                  16.666666666667
                </span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "500",
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid var(--surface-border)"
              }}>
                Total: <span style={{ color: "var(--foreground)", fontWeight: "600" }}>16.666666666667</span>
              </div>
            </div>

            {/* Credit Lite Percentage */}
            <div
              style={{
                padding: "16px",
                border: "1px solid var(--surface-border)",
                borderRadius: "6px",
                background: "var(--surface-card)"
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "10px" 
              }}>
                <span style={{ 
                  fontSize: "16px", 
                  marginRight: "8px",
                  color: "var(--foreground)"
                }}>★</span>
                <h4 style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  color: "var(--foreground)", 
                  margin: 0 
                }}>
                  Credit Lite Percentage
                </h4>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--muted-foreground)", 
                marginBottom: "6px",
                lineHeight: "1.5"
              }}>
                Formula: <span style={{ color: "var(--foreground)", fontWeight: "400" }}>( Credit Lite Percentage / income ) * 100</span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "400",
                lineHeight: "1.5"
              }}>
                Calculation: <span style={{ color: "var(--foreground)", fontWeight: "500" }}>
                  (10.00 / 33000) * 100 = 0.03030303030303
                </span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "500",
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid var(--surface-border)"
              }}>
                Total: <span style={{ color: "var(--foreground)", fontWeight: "600" }}>0.03030303030303</span>
              </div>
            </div>

            {/* Final Score Calculation */}
            <div
              style={{
                padding: "16px",
                border: "1px solid var(--surface-border)",
                borderRadius: "6px",
                background: "var(--surface-card)",
                marginTop: "4px"
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "10px" 
              }}>
                <span style={{ 
                  fontSize: "16px", 
                  marginRight: "8px",
                  color: "var(--foreground)"
                }}>★</span>
                <h4 style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  color: "var(--foreground)", 
                  margin: 0 
                }}>
                  Final Score
                </h4>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--muted-foreground)", 
                marginBottom: "6px",
                lineHeight: "1.5"
              }}>
                Formula: <span style={{ color: "var(--foreground)", fontWeight: "400" }}>
                  income * System Define Percentage - Simmah Amount + Credit Lite Percentage
                </span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "400",
                lineHeight: "1.5"
              }}>
                Calculation: <span style={{ color: "var(--foreground)", fontWeight: "500" }}>
                  33000 * 0.03030303030303 - 16.666666666667 + 0.03030303030303 = 983.36363636364
                </span>
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--foreground)", 
                fontWeight: "600",
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid var(--surface-border)"
              }}>
                Total: <span style={{ color: "var(--foreground)", fontSize: "15px" }}>983.36363636364</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditWeightagesInfo;
