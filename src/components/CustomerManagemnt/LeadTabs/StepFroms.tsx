import React, { useState, useMemo } from "react";
import { Card, Steps, Button, Row, Col } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

const { Step } = Steps;

interface Task {
  label: string;
  checked: boolean;
}

interface StepContent {
  title: string;
  tasks: Task[];
}

interface StepFormsProps {
  userDetails?: any;
}

const StepForms: React.FC<StepFormsProps> = ({ userDetails }) => {
  const [current, setCurrent] = useState(0);

  // Parse KYC steps if available
  const parseKycSteps = (stepString: string) => {
    try {
      return JSON.parse(stepString);
    } catch {
      return {};
    }
  };

  const kycSteps = userDetails?.kyc?.step ? parseKycSteps(userDetails.kyc.step) : {};

  // Initialize steps data based on KYC steps
  const stepsData = useMemo<StepContent[]>(() => {
    const steps: (StepContent | false)[] = [
    {
      title: "Mobile Verification",
      tasks: [
        { label: "Mobile Verification", checked: kycSteps.mobile_verification === true },
      ],
    },
    {
      title: "Verify OTP",
      tasks: [
        { label: "OTP Verified", checked: kycSteps.otp === true },
      ],
    },
    {
      title: "Set PIN",
      tasks: [{ label: "PIN is set", checked: kycSteps.set_pin === true }],
    },
    {
      title: "Nafath Verification",
      tasks: [
        { label: "Nafath initialized", checked: kycSteps.nafath === true },
      ],
    },
    {
      title: "Scan Session",
      tasks: [
        { label: "Scan", checked:kycSteps.scan === true},
      ],
    },
    {
      title: "Onboarding",
      tasks: [
        { label: "Success", checked: true },
        //{ label: "OTP Verified", checked: kycSteps.otp === true },
      ],
    },
    {
      title: "KYC",
      tasks: [ 
        //{ label: "KYC Question", checked: kycSteps.kyc_question === true },
        { label: "KYC Answers", checked: kycSteps.kyc_answers === true },
      ],
    },
    kycSteps.edd_answers && {
      title: "EDD",
      tasks: [
        { label: "EDD Answers", checked: kycSteps.edd_answers === true },
      ],
    },
    /* {
      title: "AML Verification",
      tasks: [
        { label: "Compliance Question", checked: kycSteps.compliance_question === true },
        { label: "KYC Question", checked: kycSteps.kyc_question === true },
        { label: "Compliance Answers", checked: kycSteps.compliance_answers === true },
      ],
    },
    {
      title: "Wallet Setup",
      tasks: [
        { label: "Wallet API pending", checked: false },
        { label: "Virtual IBAN API pending", checked: false },
      ],
    },
    {
      title: "PG Integration",
      tasks: [
        { label: "PG Customer Add pending", checked: false },
        { label: "PG Account Registration pending", checked: false },
      ],
    }, */
  ];
    // Filter out falsy values (false, null, undefined) from the steps array
    return steps.filter((step): step is StepContent => Boolean(step));
  }, [kycSteps]);

  // Calculate current step based on completed steps
  const currentStep = useMemo(() => {
    // Determine the highest completed step
    if (kycSteps.set_pin && kycSteps.nafath && kycSteps.compliance_answers) {
      return 3; // AML Verification (step 4, index 3)
    } else if (kycSteps.set_pin && kycSteps.nafath) {
      return 2; // Onboarding (step 3, index 2)
    } else if (kycSteps.set_pin) {
      return 1; // Nafath Verification (step 2, index 1)
    }
    return 0; // Set PIN (step 1, index 0)
  }, [kycSteps]);

  React.useEffect(() => {
    setCurrent(currentStep);
  }, [currentStep]);

  const next = () => {
    if (current < stepsData.length - 1) setCurrent(current + 1);
  };

  return (
    <div style={styles.container}>
      <Card style={styles.wrapperCard}>
        {/* STEPPER */}
        <Steps
          current={current}
          labelPlacement="horizontal"
          style={styles.steps}
          progressDot={false}
        >
          {stepsData.map((s, i) => {
            const isCompleted = i < current;
            const isActive = i === current;
            const isLastStep = i === stepsData.length - 1;
            const isSecondLastStep = i === stepsData.length - 2;
            
            // Build className string
            let className = "";
            if (isCompleted) className += "previoustab ";
            if (isLastStep) className += "laststep ";
            if (isSecondLastStep) className += "secondlaststep ";

            return (
              <Step
                key={i}
                className={className.trim()}
                title={
                  <span
                    onClick={() => setCurrent(i)}
                    style={{
                      color: isCompleted || isActive ? "var(--foreground)" : "#8C8C8C",
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {s?.title}
                  </span>
                }
                icon={
                  <div
                    onClick={() => setCurrent(i)}
                    style={{
                      ...styles.stepCircle,
                      background:
                        isCompleted || isActive
                          ? "var(--theme-secondary)"
                          : "#8C8C8C",
                      color: isCompleted || isActive ? "var(--foreground)" : "var(--primary-foreground)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {i + 1}
                  </div>
                }
              />
            );
          })}
        </Steps>

        {/* FORM CONTENT */}
        <Card style={styles.formCard}>
          <h3 style={styles.formTitle}>{stepsData[current].title}</h3>
          <Row gutter={[24, 12]}>
            {stepsData[current]?.tasks?.map((task, idx) => (
              <Col xs={24} sm={12} key={idx}>
                <div style={styles.taskRow}>
                  <span style={styles.label}>{task.label}</span>
                  <CheckCircleFilled
                    style={{
                      ...styles.icon,
                      color: task.checked ? "#00B96B" : "var(--color-border-light)", // green/gray
                      cursor: "default",
                    }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* FOOTER */}
        <div style={styles.footer}>
          {current < stepsData.length - 1 && (
            <Button type="primary" onClick={next} style={styles.nextButton}>
              Next Step
            </Button>
          )}
          {/* {current === stepsData.length - 1 && (
            <span style={{ color: "#00B96B", fontWeight: 600 }}>
              ✅ All Steps Completed
            </span>
          )} */}
        </div>
      </Card>

      {/* Connector color override */}
      <style>
        {`
          .ant-steps-item-tail::after {
            height: 2px !important;
          }
          .ant-steps-item-finish .ant-steps-item-tail::after,
          .ant-steps-item-process .ant-steps-item-tail::after {
            background-color: var(--theme-secondary) !important;
          }
          .ant-steps-item-finish .ant-steps-item-icon {
            border-color: var(--theme-secondary) !important;
          }
          .ant-steps-item-process .ant-steps-item-icon {
            border-color: var(--theme-secondary) !important;
          }
          .ant-steps-item-wait .ant-steps-item-icon {
            border-color: #8C8C8C !important;
          }
          .ant-steps .ant-steps-item-active .ant-steps-item-title::after {
            background-color: var(--theme-secondary) !important;
          }
          .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
            color: var(--foreground) !important;
          }
          .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
            color: var(--foreground) !important;
          }
          .previoustab .ant-steps-item-tail::after {
            background-color: var(--theme-secondary) !important;
          }
          .previoustab .ant-steps-item-icon {
            border-color: var(--theme-secondary) !important;
          }
          .laststep .ant-steps-item-icon {
            border-color: var(--theme-secondary) !important;
          }
          .laststep .ant-steps-item-tail::after {
            background-color: transparent !important;
          }
          .secondlaststep .ant-steps-item-icon {
            border-color: var(--theme-secondary) !important;
          }
          .secondlaststep .ant-steps-item-tail::after {
            background-color: var(--theme-secondary) !important;
          }
            .ant-steps-item.ant-steps-item-finish.previoustab.ant-steps-item-custom .ant-steps-item-title:after{
                        background-color: var(--theme-secondary) !important;
 
            }
                        .ant-steps .ant-steps-item-title::after {  left: 27px;}
                        .ant-steps .ant-steps-item-title::after { width: 262px;}
                        .ant-steps-item.ant-steps-item-process.secondlaststep.ant-steps-item-custom.ant-steps-item-active .ant-steps-item-title:after {
    left: 30px !important;
    width: 222px;
}
    .ant-steps-item.ant-steps-item-finish.previoustab.secondlaststep.ant-steps-item-custom .ant-steps-item-title:after {
    left: 0px !important;
        width: 250px;

}
        `}
      </style>
    </div>
  );
};

// Inline Styling
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    margin: "0 auto",
    padding: "24px 0",
    background: "var(--color-surface-snow)",
  },
  wrapperCard: {
    borderRadius: 10,
    background: "var(--background)",
    padding: "20px 0px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  steps: {
    marginBottom: 24,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "var(--foreground)",
    fontWeight: 600,
    fontSize: 13,
  },
  formCard: {
    background: "var(--background)",
    border: "1px solid var(--color-border-faint)",
    borderRadius: 6,
    padding: "16px 20px",
  },
  formTitle: {
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 12,
    color: "var(--foreground)",
  },
  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--color-border-faint)",
    paddingBottom: 4,
  },
  label: {
    color: "var(--foreground)",
    fontSize: 13,
  },
  icon: {
    fontSize: 18,
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  footer: {
    marginTop: 24,
    display: "flex",
    justifyContent: "flex-end",
  },
  nextButton: {
    background: "var(--theme-secondary)",
    borderColor: "var(--theme-secondary)",
    color: "var(--foreground)",
    fontWeight: 600,
  },
};

export default StepForms;
