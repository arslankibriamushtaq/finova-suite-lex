import React from "react";
import { Steps } from "antd";
import {
  CheckCircleFilled,
  FileTextOutlined,
  UserOutlined,
  DollarOutlined,
  SafetyOutlined,
  LockOutlined,
  BankOutlined,
  FileProtectOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Images } from "../Config/Images";
const steps:any = [
  { titleKey: "stepper.selectPartner", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.termsConditions", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.businessInfo", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.financingInfo", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.authorizedInfo", icon: Images.ApiManagementIcon},
  { titleKey: "stepper.otpVerification", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.complianceInfo", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.disclaimer", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.bankDetails", icon:Images.ApiManagementIcon },
  { titleKey: "stepper.summary", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.nafathVerification", icon: Images.ApiManagementIcon },
  { titleKey: "stepper.finish", icon: Images.ApiManagementIcon},
];

interface LandingStepperProps {
  currentStep: number;
}

const LandingStepper: React.FC<LandingStepperProps> = ({ currentStep }) => {
  const { t } = useTranslation("landingUser");
  return (
    <div className="pt-4" style={{  backgroundColor: "#fff" }}>
      <Steps
        size="small"
        // direction="horizontal"
        current={currentStep}
        items={steps.map((step:any, index:any) => ({
          title:t(step.titleKey),
          icon: (
            <img
            className="d-flex justify-content-center"
              src={step.icon}
              alt={t(step.titleKey)}
              style={{
                width: 20,   // adjust size here
                height: 20,
                objectFit: "contain"
              }}
            />
          )
        }))}
      />
      <div className="p-4">
      <Outlet />
      </div>
        
    </div>
  );
};

export default LandingStepper;
