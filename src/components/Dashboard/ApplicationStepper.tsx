import React, { useState, useMemo } from "react";
import { Steps } from "antd";
import { useTranslation } from "react-i18next";

const { Step } = Steps;

interface StepContent {
  title: string;
  tasks: any[];
}

interface ApplicationStepperProps {
  steps?: {
    finance?: boolean;
    verification?: boolean;
    simah_consent?: boolean;
    counter?: boolean;
    contract?: boolean;
    otp_verification?: boolean;
    ivr?: boolean;
    disbursed?: boolean;
    paid?: boolean;
  };
}

const ApplicationStepper: React.FC<ApplicationStepperProps> = ({ steps }) => {
  const { t } = useTranslation("dashboard");
  const stepsData = useMemo<StepContent[]>(() => [
    {
      title: t("stepper.finance"),
      tasks: [],
    },
    {
      title: t("stepper.verification"),
      tasks: [],
    },
    {
      title: t("stepper.simahConsent"),
      tasks: [],
    },
    {
      title: t("stepper.counter"),
      tasks: [],
    },
    {
      title: t("stepper.contract"),
      tasks: [],
    },
    {
      title: t("stepper.otp"),
      tasks: [],
    },
    {
      title: t("stepper.ivr"),
      tasks: [],
    },
    {
      title: t("stepper.disbursed"),
      tasks: [],
    },
    {
      title: t("stepper.paid"),
      tasks: [],
    },
  ], [t]);

  // Calculate current step based on steps prop
  const currentStep = useMemo(() => {
    if (!steps) return 0;
    
    // Find the last step that is true (completed)
    // Steps that are false should be inactive (wait state, after current)
    const stepOrder = [
      "finance",
      "verification", 
      "simah_consent",
      "counter",
      "contract",
      "otp_verification",
      "ivr",
      "disbursed",
      "paid"
    ];
    
    let lastCompletedIndex = -1;
    
    // Find the last step that is true
    for (let i = 0; i < stepOrder.length; i++) {
      const stepKey = stepOrder[i];
      if (steps[stepKey as keyof typeof steps] === true) {
        lastCompletedIndex = i;
      }
    }
    
    // If no steps are completed, return 0 (first step will be active)
    if (lastCompletedIndex === -1) {
      return 0;
    }
    
    // Set current to the last completed step
    // This ensures:
    // - Steps before current (that are true) show as completed (green)
    // - Current step (if true) shows as active (green)
    // - Steps after current (that are false) show as inactive (gray)
    return lastCompletedIndex;
  }, [steps]);

  return (
    <div style={styles.container}>
      <Steps
        current={currentStep}
        labelPlacement="horizontal"
        style={styles.steps}
        progressDot={false}
      >
        {stepsData.map((s, i) => {
          const stepOrder = [
            "finance",
            "verification", 
            "simah_consent",
            "counter",
            "contract",
            "otp_verification",
            "ivr",
            "disbursed",
            "paid"
          ];
          
          const stepKey = stepOrder[i];
          const stepStatus = steps?.[stepKey as keyof typeof steps];
          
          // Step is completed if it's true
          const isCompleted = stepStatus === true;
          // Step is inactive if it's false or undefined
          const isInactive = stepStatus === false || stepStatus === undefined;
          // Step is active if it's the current step and not inactive
          const isActive = i === currentStep && !isInactive;
          
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
                  className="app-stepper-title"
                  style={{
                    color: isCompleted || isActive
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                    fontWeight: isActive ? 600 : 500,
                    cursor: "default",
                    transition: "all 0.2s ease",
                  }}
                >
                  {s.title}
                </span>
              }
              icon={
                <div
                  style={{
                    ...styles.stepCircle,
                    background:
                      isCompleted || isActive
                        ? "#e60000"
                        : "var(--surface-border-strong)",
                    color: "#ffffff",
                    cursor: "default",
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

      {/* Connector color override */}
      <style>
        {`
          .ant-steps-item-tail::after {
            height: 2px !important;
          }
          .ant-steps-item-finish .ant-steps-item-tail::after,
          .ant-steps-item-process .ant-steps-item-tail::after {
            background-color: #e60000 !important;
          }
          .ant-steps-item-finish .ant-steps-item-icon {
            border-color: #e60000 !important;
          }
          .ant-steps-item-process .ant-steps-item-icon {
            border-color: #e60000 !important;
          }
          .ant-steps-item-wait .ant-steps-item-icon {
            border-color: var(--surface-border-strong) !important;
          }
          .ant-steps .ant-steps-item-active .ant-steps-item-title::after {
            background-color: #e60000 !important;
          }
          .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon,
          .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
            color: #ffffff !important;
          }
          .previoustab .ant-steps-item-tail::after,
          .previoustab .ant-steps-item-icon,
          .laststep .ant-steps-item-icon,
          .secondlaststep .ant-steps-item-icon,
          .secondlaststep .ant-steps-item-tail::after,
          .ant-steps-item.ant-steps-item-finish.previoustab.ant-steps-item-custom .ant-steps-item-title:after {
            background-color: #e60000 !important;
          }
          .previoustab .ant-steps-item-icon,
          .laststep .ant-steps-item-icon,
          .secondlaststep .ant-steps-item-icon {
            background-color: transparent !important;
            border-color: #e60000 !important;
          }
          .laststep .ant-steps-item-tail::after {
            background-color: transparent !important;
          }
          .ant-steps .ant-steps-item-title::after {
            left: 27px;
            width: 262px;
          }
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
    padding: "20px 16px",
    background: "var(--surface-card)",
    border: "1px solid var(--surface-border)",
    borderRadius: 2,
    boxShadow: "var(--surface-elevation-1)",
  },
  steps: {
    marginBottom: 0,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 13,
  },
};

export default ApplicationStepper;
